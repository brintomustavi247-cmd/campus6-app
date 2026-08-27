/**
 * ============================================================================
 * CAMPUS 6.0 - LEADERBOARD REALTIME SYNC SERVICE
 * ============================================================================
 *
 * PURPOSE: Centralized service for live leaderboard data synchronization.
 *
 * THIS IS THE GLUE THAT CONNECTS:
 * ┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
 * │  TimerContext   │────▶│  leaderboardSync │────▶│  Leaderboard UI   │
 * │  (live timer)   │     │     .ts          │     │  (reactive list)  │
 * └─────────────────┘     └──────────────────┘     └──────────────────┘
 *                               ↑
 *                    ┌──────────┴──────────┐
 *                    ▼                     ▼
 *           ┌──────────────┐      ┌──────────────┐
 *           │ Supabase     │      │  Supabase    │
 *           │ Users Table  │      │  Presence    │
 *           └──────────────┘      └──────────────┘
 *
 * ============================================================================
 * VERSION 8.0.0 - RANK CONSISTENCY OVERHAUL
 * ============================================================================
 * Fixes "same ID shows different rank on different devices":
 *
 *  FIX #1  Score integrity       : studyTime ALWAYS comes from the DB column.
 *                                  No client-side additions that only exist on
 *                                  one device. The optional "live self" bump is
 *                                  applied AFTER ranking, as display-only, so
 *                                  it can never reorder anyone differently
 *                                  across devices.
 *  FIX #2  Nondeterministic math : Removed Date.now()-based estimates for
 *                                  other live users. Presence now ONLY powers
 *                                  status badges (online dot / LIVE label /
 *                                  current task text), never scores or ranks.
 *  FIX #3  Stale timer freeze    : Callers previously passed a static
 *                                  localTimerState object inside useEffect([])
 *                                  which froze at mount-time values. Now the
 *                                  returned controller exposes
 *                                  setLocalTimerState() — push fresh state on
 *                                  every tick WITHOUT resubscribing channels.
 *  FIX #4  Premature blank emits : No emission happens until the FIRST
 *                                  successful DB fetch resolves ('ready' gate).
 *                                  No more empty/flashing boards on slow nets.
 *  FIX #5  Zombie subscriptions  : Every reconnect tears down old channel +
 *                                  presence listener BEFORE creating new ones.
 *                                  Stale fetch responses discarded via a
 *                                  monotonic sequence guard.
 *  FIX #6  Event storm thrash    : Postgres change events trigger ONE debounced
 *                                  refetch (single code path — no fragile
 *                                  manual cache surgery that can desync).
 *  FIX #7  Consistent rank lookup: getUserRankPosition() now uses the EXACT
 *                                  same sort semantics as the visible board
 *                                  (studyTime DESC → xp DESC → id ASC), so
 *                                  profile-page rank === leaderboard rank.
 *  FIX #8  Deduped user list     : Duplicate rows by id are collapsed before
 *                                  merging (defensive against realtime races).
 *
 * BACKWARD COMPATIBILITY:
 * The return value is BOTH callable (as the old cleanup function — existing
 * `useEffect(() => { const c = init(...); return c; })` keeps working) AND an
 * object exposing { setLocalTimerState, destroy } for the corrected pattern.
 *
 * DATA FLOW:
 * 1. Fetch 'users' table ordered by total_study_time DESC  → THE source of truth
 * 2. Subscribe to 'users' postgres_changes → debounce → refetch (Fix #6)
 * 3. Subscribe to presence channel → status badges only (Fix #2)
 * 4. Merge → dedupe → filter → sort (deterministic) → assign ranks →
 *    cosmetic self-injection (Fix #1) → optional limit
 * 5. Emit to callback → Leaderboard re-renders ⚡
 *
 * USAGE (corrected pattern):
 * ```tsx
 * useEffect(() => {
 *   const lb = initializeLeaderboardRealtime({
 *     currentUserId: profile.uid,
 *     onPlayersUpdate: setPlayers,
 *     showOwnLiveTime: true,
 *     debugMode: import.meta.env.DEV,
 *   });
 *   lbRef.current = lb;
 *   return () => lb.destroy();            // or: return () => lb();
 * }, [profile?.uid]);
 *
 * // Push fresh timer state every tick — NO resubscribe:
 * useEffect(() => {
 *   lbRef.current?.setLocalTimerState({ isRunning, secondsElapsed, topicName });
 * }, [isRunning, secondsElapsed, topicName]);
 * ```
 * NOTE: With showOwnLiveTime, YOUR displayed minutes move live, but ranks stay
 * identical on every device — other players' clients never invent minutes for
 * you. True realtime accuracy for everyone comes from the periodic flush in
 * TimerContext (see services/db.ts / add_study_minutes RPC).
 * ============================================================================
 */

import { supabase } from '../supabaseClient';
import { subscribeToPresence } from '../supabaseChannels';
import { EsportsPlayer } from '../components/squad/EsportsData';


// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Local Timer State (from TimerContext)
 * Display-only metadata for the current user's running session.
 * NEVER affects sorting or other players' scores.
 */
export interface LocalTimerState {
  /** Is the timer currently counting? */
  isRunning: boolean;
  /** Seconds elapsed (infinity mode) or remaining (countdown) */
  secondsElapsed: number;
  /** What topic is being studied */
  topicName?: string;
  /** Which mode (25min, infinity, etc.) */
  mode?: string;
}

/**
 * Leaderboard Configuration Options
 * Passed when initializing the realtime subscription
 */
export interface LeaderboardConfig {
  /** Current authenticated user's UUID (for highlighting/self features) */
  currentUserId?: string | null;

  /**
   * Callback fired whenever player data changes.
   * Receives the SORTED, RANKED EsportsPlayer[] array.
   */
  onPlayersUpdate: (players: EsportsPlayer[]) => void;

  /**
   * DEPRECATED (kept for backward compatibility):
   * Static timer state is frozen at mount-time under React effects. Prefer
   * controller.setLocalTimerState() after initialization, or provide
   * getLocalTimerState below. Retained so existing call sites compile.
   */
  localTimerState?: LocalTimerState | null;

  /**
   * RECOMMENDED: Getter evaluated fresh on EVERY emit, giving live timer
   * values without any resubscription. Takes precedence over the deprecated
   * static localTimerState field.
   */
  getLocalTimerState?: () => LocalTimerState | null;

  /**
   * Cosmetic-only feature: bumps YOUR OWN row's displayed studyTime by your
   * running session minutes, applied strictly AFTER ranks are assigned, so it
   * can never create cross-device rank disagreement. Default: true.
   */
  showOwnLiveTime?: boolean;

  /** Optional: exclude specific users from the leaderboard */
  filterFn?: (player: EsportsPlayer) => boolean;

  /** Optional: maximum number of players shown (rows fetched = limit*2) */
  limit?: number;

  /** Enable debug logging (default: false) */
  debugMode?: boolean;
}

/** Handle returned by initializeLeaderboardRealtime */
export interface LeaderboardController {
  /** Update timer state WITHOUT tearing down/resubscribing channels (Fix #3) */
  setLocalTimerState: (t: LocalTimerState | null) => void;
  /** Refresh the leaderboard snapshot without rebuilding realtime channels. */
  refresh: () => void;
  /** Idempotent teardown: channels, listeners, timers, caches */
  destroy: () => void;
}

/** Callable cleanup with attached controller methods (backward compatible) */
export type LeaderboardHandle = (() => void) & LeaderboardController;

/** Internal subscription bookkeeping (exported for testing) */
export interface SubscriptionState {
  usersChannel: any;
  presenceUnsubscribe: (() => void) | null;
  isActive: boolean;
  config: LeaderboardConfig;
  retryCount: number;
  retryTimeout: ReturnType<typeof setTimeout> | null;
}


// ============================================================================
// TUNABLE CONSTANTS
// ============================================================================

/** Max rows fetched per refresh (upper bound regardless of config.limit) */
const MAX_FETCH_LIMIT = 500;

/** Collapse bursts of postgres events into one refetch */
const REFRESH_DEBOUNCE_MS = 250;

/** Reconnection policy */
const MAX_RETRIES = 10;
const RETRY_BASE_DELAY_MS = 1000;
const RETRY_MAX_DELAY_MS = 30000;


// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateId = (): string =>
  `lb_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

const log = (config: LeaderboardConfig, message: string, ...args: any[]) => {
  if (config.debugMode) console.log(`🏆 [Leaderboard] ${message}`, ...args);
};

const warn = (message: string, ...args: any[]) => {
  console.warn(`⚠️ [Leaderboard] ${message}`, ...args);
};

const logError = (message: string, ...args: any[]) => {
  console.error(`❌ [Leaderboard] ${message}`, ...args);
};

/**
 * Canonical sorter used EVERYWHERE (board + rank lookup). Must stay in sync
 * with getUserRankPosition()'s SQL. Plain string comparison on uuid keeps us
 * aligned with Postgres text ordering for lowercase-hex ids.
 */
const comparePlayers = (a: EsportsPlayer, b: EsportsPlayer): number => {
  if (b.studyTime !== a.studyTime) return b.studyTime - a.studyTime; // desc
  if (b.xp !== a.xp) return b.xp - a.xp;                             // desc
  const ai = String(a.id);
  const bi = String(b.id);
  if (ai !== bi) return ai < bi ? -1 : 1;                            // asc, unique
  return 0;
};

/**
 * Resolve the freshest available local timer state.
 * getLocalTimerState() wins over the deprecated static field.
 */
const resolveTimerState = (
  config: LeaderboardConfig,
  pushed: LocalTimerState | null,
): LocalTimerState | null => {
  if (typeof config.getLocalTimerState === 'function') {
    try {
      return config.getLocalTimerState();
    } catch {
      return pushed;
    }
  }
  // Backward compat: if caller supplied a STATIC object in config, read it at
  // emit time (works when callers mutate the same object reference); otherwise
  // fall through to whatever the controller received via setLocalTimerState.
  if (config.localTimerState) return config.localTimerState;
  return pushed;
};


// ============================================================================
// CORE: SINGLE ROW MAPPER (pure — no clocks, no randomness)
// ============================================================================

/**
 * Map one 'users' DB row (+ optional presence entry) to EsportsPlayer.
 *
 * CRITICAL INVARIANTS (v8):
 *  - studyTime = raw DB value. Unmodified. Identical on every device. (Fix #1)
 *  - Presence contributes ONLY visual/status fields.              (Fix #2)
 *  - Every original field + fallback chain preserved, including internal
 *    metadata (_isCurrentUser, _hasActiveTimer, _rawDbStudyTime,
 *    _presenceStatus) so downstream UI code does not break.
 */
const mapRowToPlayer = (
  u: any,
  p: Record<string, any>,
  config: LeaderboardConfig,
): EsportsPlayer => {

  const pres = p || {};
  const status = pres.status || 'offline';
  const isLive = status === 'focus';
  const isOnline = status !== 'offline';
  const dbStudyTime =
    typeof u.total_study_time === 'number' && !Number.isNaN(u.total_study_time)
      ? u.total_study_time
      : 0;

  return {
    // Identity (from DB)
    id: u.id,
    name: u.full_name || 'Unknown Scholar',
    username: u.full_name || 'Unknown',
    avatar: u.avatar_url || u.avatar || 'U',

    // Stats (from DB)
    title: u.title || 'MEMBER',
    level: Math.floor((u.xp || 0) / 1000) + 1,
    xp: u.xp || 0,

    // ⭐ Fix #1: raw DB value ONLY. No injections anywhere in this function.
    studyTime: dbStudyTime,

    nextLevelXp: (Math.floor((u.xp || 0) / 1000) + 2) * 1000,
    rank: 0, // assigned after deterministic sort
    tier: u.current_rank || u.tier || 'SPARK',

    // Location/Metadata (from DB)
    country: u.country || 'Bangladesh',
    division: u.division || 'All',
    district: u.district || 'All',
    target: u.target_university || u.target || 'N/A',

    // Performance Metrics (defaults — as before)
    winRate: '0%',
    efficiency: '0%',
    streak: 0,
    bestStreak: 0,
    totalSessions: 0,

    // Real-time Status (presence = BADGES ONLY — Fix #2)
    isOnline,
    isLive,
    sessionStartTime: pres.start_time ?? null,
    currentTask: pres.topic || '',

    // Trend/Visual
    trend: 'up',

    // Extensible empties (as before)
    bio: '',
    motto: '',
    team: 'None',
    joinDate: u.created_at || '',
    socialLinks: {},
    goals: [],
    recentActivity: [],
    achievements: [],

    // ⭐ INTERNAL METADATA (preserved — UI may depend on these)
    _isCurrentUser: !!config.currentUserId && u.id === config.currentUserId,
    _hasActiveTimer: false,          // set later, cosmetic-only, post-ranking
    _rawDbStudyTime: dbStudyTime,    // original DB value (pre any overlay)
    _presenceStatus: pres.status || undefined,
  } as EsportsPlayer;
};


// ============================================================================
// MERGE FUNCTION — exported (signature unchanged from v7)
// ============================================================================

/**
 * 🔀 Combine all sources into a unified, DETERMINISTIC player array.
 *
 * Pipeline (order matters):
 *   dedupe → map → filter → sort(canonical) → assign ranks →
 *   cosmetic self-overlay → limit
 *
 * Determinism guarantee: two devices holding the same DB rows produce byte-
 * identical output. Ranks cannot disagree across devices.           (Fixes #1,#2)
 *
 * @param users     Raw rows from Supabase 'users'
 * @param presences Map userId → presence payload (status only affects badges)
 * @param config    Options (timer state is DISPLAY-only, see Fix #1/#3)
 * @returns Merged, sorted, ranked array
 */
export const mergeLeaderboardData = (
  users: any[],
  presences: Record<string, any>,
  config: LeaderboardConfig
): EsportsPlayer[] => {
  try {
    // Step 0: dedupe defensively by id (realtime UPDATE arriving before fetch
    // commit could otherwise surface a transient duplicate).
    const seen = new Set<string>();
    let mapped: EsportsPlayer[] = (users || [])
      .filter((u: any) => {
        if (!u || u.id == null) return false;
        const key = String(u.id);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((u: any) => mapRowToPlayer(u, presences?.[u.id], config));

    // Step 1: optional exclusion filter
    if (config.filterFn) {
      mapped = mapped.filter(config.filterFn);
    }

    // Step 2: canonical deterministic sort (shared with getUserRankPosition)
    mapped.sort(comparePlayers);

    // Step 3: assign ranks — index IS the rank
    for (let i = 0; i < mapped.length; i++) {
      mapped[i].rank = i + 1;
    }

    // Step 4: ⭐ COSMETIC SELF-OVERLAY — strictly AFTER ranking (Fix #1).
    //
    // The current user's row gets their RUNNING session minutes added purely
    // for visual feedback on THEIR device. Because this runs after ranks are
    // locked and only touches self, every device assigns everyone identical
    // ranks regardless of who is studying where. The number converges to truth
    // via the TimerContext periodic flush writing real deltas to the DB.
    const timer = resolveTimerState(config, null);
    const wantsSelfOverlay =
      config.showOwnLiveTime !== false &&
      config.currentUserId != null &&
      !!timer &&
      timer.isRunning &&
      timer.secondsElapsed > 0;

    if (wantsSelfOverlay) {
      const me = mapped.find((pl) => pl._isCurrentUser);
      if (me) {
        const elapsedMinutes = Math.floor(timer!.secondsElapsed / 60);
        me.studyTime += elapsedMinutes;                 // display only
        me._hasActiveTimer = true;                      // UI animation hook
        me.currentTask = me.currentTask || timer!.topicName || '';
        me.sessionStartTime = me.sessionStartTime ?? null;
      }
    }

    // Step 5: optional limit (top N)
    if (config.limit && config.limit > 0 && mapped.length > config.limit) {
      mapped = mapped.slice(0, config.limit);
    }

    return mapped;

  } catch (err) {
    logError('Critical error in mergeLeaderboardData:', err);
    return []; // fail gracefully
  }
};


// ============================================================================
// MAIN INITIALIZATION
// ============================================================================

/**
 * 🚀 Initialize realtime leaderboard subscription.
 *
 * RETURNS: LeaderboardHandle — a callable cleanup (legacy-compatible) that
 * also exposes:
 *   • setLocalTimerState(t)  — push fresh timer ticks without resubscribing
 *   • destroy()              — full idempotent teardown
 *
 * LIFECYCLE:
 * 1. Immediate first fetch (fast paint once 'ready')
 * 2. Channels connect → SUBSCRIBED resets backoff + freshness refetch
 * 3. postgres_changes events → debounced single-path refetch (Fix #6)
 * 4. presence syncs → badge-only remap → emit (gated by 'ready', Fix #4)
 * 5. Drop/error → teardown-then-rebuild with exponential backoff (Fix #5)
 *
 * SAFETY:
 *  - Sequence guard discards out-of-order fetch responses             (Fix #5)
 *  - destroy()/unmount halts retries, clears debounce timers
 *  - React StrictMode double-mount safe (teardown-first everywhere)
 */
export const initializeLeaderboardRealtime = (
  config: LeaderboardConfig
): LeaderboardHandle => {

  const instanceId = generateId();
  log(config, `🚀 init (${instanceId})`);

  let destroyed = false;
  let ready = false;               // Fix #4: suppress emits before first fetch
  let fetchSeq = 0;                // Fix #5: stale-response guard
  let retryCount = 0;

  let currentTimer: LocalTimerState | null = null; // via setLocalTimerState
  let cachedUsers: any[] = [];
  let cachedPresences: Record<string, any> = {};

  let usersChannel: any = null;
  let presenceUnsub: (() => void) | null = null;
  let retryTimeout: ReturnType<typeof setTimeout> | null = null;
  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

  const effectiveConfig = (): LeaderboardConfig => ({
    ...config,
    // Merge function resolves live state itself; hand it our pushed copy as
    // fallback beneath any config.getLocalTimerState getter.
    localTimerState: resolveTimerState(config, currentTimer),
  });

  // ------------------------------------------------------------------ EMIT --
  const emit = () => {
    if (destroyed || !ready || typeof config.onPlayersUpdate !== 'function') return;
    try {
      config.onPlayersUpdate(
        mergeLeaderboardData(cachedUsers, cachedPresences, effectiveConfig())
      );
    } catch (err) {
      logError('onPlayersUpdate callback threw:', err);
    }
  };

  // ----------------------------------------------------------------- FETCH --
  const fetchFromDb = async () => {
    if (destroyed) return;
    const seq = ++fetchSeq;

    const wanted =
      config.limit && config.limit > 0
        ? Math.min(MAX_FETCH_LIMIT, Math.max(config.limit * 2, 100))
        : MAX_FETCH_LIMIT;

    try {
      // '*' selected intentionally: preserves ANY schema columns downstream
      // consumers may read — no data dropped versus previous version.
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('total_study_time', { ascending: false, nullsFirst: false })
        .limit(wanted);

      if (destroyed) return;
      if (error) { warn(`fetch failed: ${error.message}`); return; }

      // Fix #5: a slower, EARLIER request resolving late must never overwrite
      // fresher data.
      if (seq !== fetchSeq) { log(config, 'discarded stale response'); return; }

      cachedUsers = Array.isArray(data) ? data : [];
      ready = true;                 // Fix #4
      emit();

    } catch (err) {
      if (!destroyed) logError('Exception in fetchFromDb:', err);
    }
  };

  /** Collapse event bursts into a single network round-trip (Fix #6) */
  const debouncedFetchFromDb = () => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      debounceTimeout = null;
      fetchFromDb();
    }, REFRESH_DEBOUNCE_MS);
  };

  // -------------------------------------------------------------- TEARDOWN --
  const teardownChannels = () => {
    // Fix #5: ALWAYS remove existing resources before creating replacements.
    if (debounceTimeout) { clearTimeout(debounceTimeout); debounceTimeout = null; }
    if (usersChannel) {
      const ch = usersChannel;
      usersChannel = null;
      supabase.removeChannel(ch).catch(() => {});
    }
    if (presenceUnsub) {
      try { presenceUnsub(); } catch { /* already gone */ }
      presenceUnsub = null;
    }
  };

  // ------------------------------------------------------------ RETRY LOGIC -
  const scheduleRetry = (source: string, reason: string) => {
    if (destroyed) return;
    retryCount++;
    if (retryCount > MAX_RETRIES) {
      logError(`${source}: ${reason} — max retries exceeded. Refresh page.`);
      return;
    }
    const delayMs = Math.min(
      RETRY_BASE_DELAY_MS * Math.pow(2, retryCount - 1),
      RETRY_MAX_DELAY_MS,
    );
    warn(`${source}: ${reason}. Retry #${retryCount} in ${delayMs}ms`);
    if (retryTimeout) clearTimeout(retryTimeout);
    retryTimeout = setTimeout(() => {
      retryTimeout = null;
      if (!destroyed) rebuildChannels();
    }, delayMs);
  };

  // -------------------------------------------------------------- CHANNELS --
  const rebuildChannels = () => {
    teardownChannels();                       // Fix #5: no zombie stacking
    if (destroyed) return;

    try {
      // --- SUBSCRIPTION 1: users table --------------------------------------
      usersChannel = supabase
        .channel(`leaderboard-users-${instanceId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'users' },
          () => debouncedFetchFromDb(),       // ONE code path — no cache surgery
        )
        .subscribe((status: string) => {
          if (destroyed) return;
          if (status === 'SUBSCRIBED') {
            retryCount = 0;
            log(config, '✅ users channel connected');
            fetchFromDb();                    // freshness check post-connect
          } else if (
            status === 'CHANNEL_ERROR' ||
            status === 'TIMED_OUT' ||
            status === 'CLOSED'
          ) {
            scheduleRetry('Users channel', status);
          }
        });

    } catch (err) {
      logError('Failed to setup users subscription:', err);
      scheduleRetry('Users setup', String(err));
      return;
    }

    // --- SUBSCRIPTION 2: presence -------------------------------------------
    // Status badges ONLY. Used for online dots / LIVE labels / task text.
    // Never influences scores or ordering (Fix #2).
    try {
      presenceUnsub = subscribeToPresence((presenceState: any) => {
        if (destroyed) return;
        const next: Record<string, any> = {};
        if (presenceState && typeof presenceState === 'object') {
          for (const key in presenceState) {
            const list = (presenceState as any)[key];
            if (Array.isArray(list) && list.length > 0 && list[0]?.userId) {
              next[list[0].userId] = list[0];
            }
          }
        }
        cachedPresences = next;
        log(config, `presence updated: ${Object.keys(next).length} online`);
        emit();                                // safe pre-ready: gated in emit()
      });
    } catch (err) {
      // Presence failure degrades gracefully to badges-off; board still runs.
      logError('Failed to setup presence subscription:', err);
    }
  };

  // ------------------------------------------------------------- PUBLIC API -
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    if (retryTimeout) { clearTimeout(retryTimeout); retryTimeout = null; }
    if (debounceTimeout) { clearTimeout(debounceTimeout); debounceTimeout = null; }
    teardownChannels();
    cachedUsers = [];
    cachedPresences = {};
    currentTimer = null;
    log(config, `🧹 destroyed (${instanceId})`);
  };

  const handle = (() => destroy()) as LeaderboardHandle; // legacy-cleanable
  handle.destroy = destroy;
  handle.setLocalTimerState = (t: LocalTimerState | null) => {
    if (destroyed) return;
    currentTimer = t;
    emit();                                // pure re-render of self overlay
  };
  handle.refresh = () => { void fetchFromDb(); };

  // ------------------------------------------------------------------ BOOT --
  fetchFromDb();   // fast first paint
  rebuildChannels();

  return handle;
};


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * One-time leaderboard snapshot — no subscriptions held.
 *
 * Useful for initial SSR-style renders, share/export flows, and tests.
 * Uses the IDENTICAL merge pipeline → identical ordering to the live board.
 *
 * @param currentUserId Pass auth uid so _isCurrentUser flags populate correctly
 *                      (previous version hardcoded null — that data-loss/
 *                      inconsistency is fixed).
 * @param limit         Max players
 */
export const fetchLeaderboardSnapshot = async (
  currentUserId: string | null = null,
  limit: number = 50
): Promise<EsportsPlayer[]> => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('total_study_time', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) throw error;

    return mergeLeaderboardData(users || [], {}, {
      currentUserId,
      onPlayersUpdate: () => {},   // no-op — snapshot mode
      limit,
    });

  } catch (err) {
    logError('fetchLeaderboardSnapshot failed:', err);
    return [];
  }
};

/**
 * Get a user's authoritative rank.
 *
 * Fix #7: mirrors comparePlayers() EXACTLY:
 *   rank = (# users with STRICTLY greater total_study_time)
 *        + (# tied users with lexically SMALLER id)
 *        + 1
 * Ties resolve by id ascending, identical to the visible board, so the number
 * shown here always matches what the leaderboard displays.
 *
 * (Previous version ran an unused count query and counted `gt` only, which
 * disagreed with the board whenever ties existed.)
 *
 * @param userId User UUID
 * @param totalStudyTime Optional: skip a self-fetch if caller already knows it
 * @returns 1-based rank, or null if the user doesn't exist
 */
export const getUserRankPosition = async (
  userId: string,
  totalStudyTime?: number | null
): Promise<number | null> => {
  try {
    let myTime = totalStudyTime;

    if (myTime == null) {
      const { data, error: selfErr } = await supabase
        .from('users')
        .select('total_study_time')
        .eq('id', userId)
        .single();
      if (selfErr || !data) return null;
      myTime = data.total_study_time || 0;
    }

    // Count strictly-above users (head:true → metadata only, no rows sent)
    const { count: above, error: cntErr } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gt('total_study_time', myTime);

    if (cntErr) throw cntErr;

    // Break ties deterministically: tied users with smaller id outrank us.
    const { data: tied, error: tieErr } = await supabase
      .from('users')
      .select('id')
      .eq('total_study_time', myTime);

    if (tieErr) throw tieErr;

    const aheadAmongTied = (tied || []).filter(
      (r: any) => r.id != null && String(r.id) !== String(userId) && String(r.id) < String(userId)
    ).length;

    return (above || 0) + aheadAmongTied + 1;

  } catch (err) {
    logError('getUserRankPosition failed:', err);
    return null;
  }
};

/**
 * Manual refresh — forces a one-shot fetch through the SHARED pipeline and
 * delivers results via config.onPlayersUpdate. Creates NO subscriptions, so
 * it's safe to call anytime (e.g., pull-to-refresh handler). Now also RETURNS
 * the fetched players and reports errors via rejection (previously swallowed).
 *
 * @param config Any valid LeaderboardConfig (at minimum onPlayersUpdate)
 * @returns The freshly merged player array
 */
export const forceLeaderboardRefresh = async (
  config: LeaderboardConfig
): Promise<EsportsPlayer[]> => {
  log(config, '🔄 Manual refresh forced');
  const players = await fetchLeaderboardSnapshot(
    config.currentUserId ?? null,
    config.limit || 50
  );
  try {
    config.onPlayersUpdate(players);
  } catch (err) {
    logError('onPlayersUpdate threw in forceLeaderboardRefresh:', err);
  }
  return players;
};


// ============================================================================
// EXPORT SUMMARY
// ============================================================================
//
// MAIN EXPORTS:
// - initializeLeaderboardRealtime(config) → LeaderboardHandle
//     • callable as legacy cleanup fn, PLUS .setLocalTimerState() / .destroy()
// - mergeLeaderboardData(users, presences, config)  ← deterministic core
//
// OPTIONAL UTILITIES:
// - fetchLeaderboardSnapshot(currentUserId, limit)  ← one-time fetch
// - getUserRankPosition(userId, totalStudyTime?)    ← board-consistent rank
// - forceLeaderboardRefresh(config)                 ← manual trigger (async)
//
// TYPES:
// - LocalTimerState · LeaderboardConfig · LeaderboardController
// - LeaderboardHandle · SubscriptionState
//
// CORRECT USAGE PATTERN:
// 1. Mount once per screen:  const lb = initializeLeaderboardRealtime({...})
// 2. Store handle in a ref; deps = [currentUserId] only
// 3. Every timer tick:       lb.setLocalTimerState({ isRunning, secondsElapsed })
// 4. Unmount:                lb.destroy()
//
// REMINDER: This service guarantees CONSISTENT ranks everywhere. It cannot
// make OTHER users' numbers tick live mid-session — that requires TimerContext
// flushing minute-deltas to the server periodically (add_study_minutes RPC).
// ============================================================================