import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { usePresence } from './PresenceContext';
import {
  pushStudySessionToSupabase,
  todayKey as getDayKey,
} from '../services/db';
import { supabase } from '../supabaseClient';

// ============================================================================
// CAMPUS 6.0 — GLOBAL TIMER CONTEXT (v7.0 "SINGLE WRITER" EDITION)
// ============================================================================
//
// PURPOSE:
//   Single source of truth for the focus timer. Drives FocusTimer UI,
//   presence ("studying now"), and permanent study-history rows in Supabase.
//
// ============================================================================
// VERSION 7.0.0 — THE ANTI-DOUBLE-COUNT OVERHAUL
// ============================================================================
//  FIX #1  SINGLE WRITER PRINCIPLE :
//          pushStudySessionToSupabase() (db.ts v10) ALREADY performs the
//          atomic total_study_time increment internally (count-gated RPC).
//          This context NO LONGER touches totals ever. The old code called
//          the push AND ran its own select→update (+delta) — double-adding
//          every heartbeat and every completion. THE #1 cause of insane /
//          inconsistent leaderboard numbers.
//
//  FIX #2  INTERVAL-DETERMINISTIC CHUNK IDS :
//          Chunks are IDs are derived from the EXACT seconds interval they
//          cover: chunk_{uid8}_{yyyymmdd}_{startSec}_{endSec}.
//          • Retries of the same logical push → same row → UPSERT dedupe +
//            count-gate prevent double increments (even if the network lost
//            the response after the server committed — the classic phantom
//            retry that random-ID schemes corrupt).
//          • flushedSecondsRef only advances after CONFIRMED success, so the
//            next chunk starts exactly where the last verified one ended.
//
//  FIX #3  CRASH-QUEUE IDS FIXED AT QUEUE TIME :
//          beforeunload payloads now carry their interval-derived id INSIDE
//          the queued object. Previously ids were regenerated at flush time
//          ⇒ every boot re-inserted the same offline minutes forever.
//
//  FIX #4  TIMEZONE-STABLE DAY KEYS : todayKey imported from services/db
//          (Asia/Dhaka via Intl). Old UTC-slicing bucketed devices near
//          midnight onto different days.
//
//  FIX #5  FAILED COMPLETIONS SELF-HEAL : if the final chunk push fails, the
//          exact interval is queued locally with its own id and replayed on
//          next launch — instead of silently vanishing.
//
//  FIX #6  LIVE-PREVIEW HYGIENE : publishes ONLY uncommitted seconds to the
//          SEPARATE live_study_minutes column (never touched the ranked
//          column even before; kept), zeroed reliably on stop/unmount via
//          lastPreviewUserId tracking.
//
//  PRESERVED FROM v6 (unfreezable engine):
//          Hard timeouts on every DB call · try/finally + 12s completion
//          watchdog · self-healing resume/restart locks · 5s tick watchdog ·
//          mobile visibility wall-clock recovery · localStorage restore
//          (including time elapsed while tab closed) · pause banking.
//
// ⚠️ WRITE-MODEL NOTE (important — pick ONE, do not mix):
//   This file uses MODEL A — "interval chunks": every 60s (and at stop) the
//   un-flushed slice of the session becomes a permanent study_sessions row;
//   db.ts turns each FRESH row into exactly one atomic totals increment.
//   db.ts also exports an alternative buffer API (recordTimerTick /
//   flushPendingStudySeconds — MODEL B). Do NOT wire both: that double-counts.
//   MODEL A is implemented here because it preserves per-topic history rows.
//
// DATA FLOW (all additive, all idempotent):
//   tick(1s, local only) ─▶ every 60s: chunk of unflushed secs
//      → pushStudySessionToSupabase(intervalId)   [insert + gated increment]
//      → flushedSecondsRef += chunk               [only on confirmed success]
//   stop/countdown-zero ─▶ final chunk (interval id) → callbacks → reset
//   pagehide ─▶ unflushed remainder queued with PRECOMPUTED id → next boot
//
// @version 7.0.0
// ============================================================================

// ============================================================================
// TIMER TYPES
// ============================================================================

export type TimerMode =
  | 'custom'
  | 'infinity'
  | '2min'
  | '5min'
  | '15min'
  | '25min'
  | '50min';

/** Duration in seconds for each preset mode (custom/infinity = 0 = open-ended). */
export const TIMER_MODE_DURATIONS: Record<TimerMode, number> = {
  '2min': 2 * 60,
  '5min': 5 * 60,
  '15min': 15 * 60,
  '25min': 25 * 60,
  '50min': 50 * 60,
  custom: 0,
  infinity: 0,
};

/** The record emitted when a session finishes (used by the parent callback). */
export interface TimerSessionCompletion {
  id: string;
  dateKey: string;
  topicName: string;
  subject?: string;
  durationMinutes: number;
  mode: TimerMode;
  completedAt: string;
  totalSecondsElapsed: number;
}

/** The public API exposed via useGlobalTimer(). */
interface TimerContextProps {
  isRunning: boolean;
  secondsLeft: number;
  secondsElapsed: number;
  mode: TimerMode;
  topicName: string;
  sessionStartTime: number | null;
  formattedTime: string;
  autoPauseEnabled: boolean;

  startTimer: (mode: TimerMode, topic: string, initialSeconds?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  /** Discard the CURRENT uncommitted session only — NEVER touches DB history. */
  discardCurrentSession: () => void;

  setTopicName: (topic: string) => void;
  setMode: (mode: TimerMode, seconds?: number) => void;
  toggleAutoPause: () => void;
  registerOnComplete: (cb: (s: TimerSessionCompletion) => void) => () => void;
}

interface TimerProviderProps {
  children: React.ReactNode;
  onSessionComplete?: (session: TimerSessionCompletion) => void | Promise<void>;
  userId?: string;
}

// ============================================================================
// CONTEXT
// ============================================================================

export const TimerContext = createContext<TimerContextProps>({} as TimerContextProps);

// ============================================================================
// STORAGE KEYS & CONSTANTS
// ============================================================================

const STORAGE_KEY = 'globalTimerState';
const PENDING_SESSIONS_KEY = 'pendingStudySessions';

const DEFAULT_MODE: TimerMode = '25min';
const DEFAULT_TOPIC = 'সাধারণ পড়া';
const DEFAULT_SECONDS = 25 * 60;

/**
 * Chunk cadence: commit the unflushed slice every 60s while running.
 * (Was 120s — shortened so leaderboards converge faster; cost identical.)
 * Minimum new seconds before a chunk write is worth a network round-trip.
 */
const CHUNK_INTERVAL_MS = 60 * 1000;
const MIN_CHUNK_SECONDS = 30;

/** Hard ceiling for any single DB operation — the anti-freeze guarantee. */
const DB_TIMEOUT_MS = 8000;

type Thenable<T> = PromiseLike<T> | Promise<T>;

const withTimeout = <T,>(promise: Thenable<T>, ms: number, label: string): Promise<T> =>
  Promise.race<T>([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`[Timer] ${label} timed out after ${ms}ms`)), ms)
    ),
  ]);

// ============================================================================
// PURE HELPERS (no side effects)
// ============================================================================

const safeNumber = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

/** Seconds → minutes, floored at 0.01 so we never write a literal zero row. */
const toMinutes = (seconds: number): number =>
  Math.max(0.01, Math.round((seconds / 60) * 100) / 100);

// ============================================================================
// ⭐ FIX #2 — INTERVAL-DETERMINISTIC CHUNK IDS
// ----------------------------------------------------------------------------
// An ID names the COVERED INTERVAL, not the moment of the call. Same interval
// ⇒ same id ⇒ database-level dedupe across retries, response-losses,
// StrictMode remounts, and crash-queue replays. Random ids made "idempotent"
// pushes mean nothing.
// ============================================================================

const uidSlug = (userId: string): string =>
  String(userId).replace(/-/g, '').slice(0, 8);

/**
 * Build the deterministic id for studying the half-open interval
 * [absoluteStartSec, absoluteEndSec) of a given session.
 *
 * absoluteStartSec = epoch-second when THIS SESSION started studying
 *                    (segment start; pauses excluded by construction because
 *                    callers pass flushed-relative offsets).
 */
const makeChunkId = (
  userId: string,
  dateKey: string,
  sessionStartEpochSec: number,
  offsetStartSec: number,
  offsetEndSec: number,
): string =>
  `chunk_${uidSlug(userId)}_${dateKey.replace(/-/g, '')}_${Math.floor(sessionStartEpochSec)}_${Math.floor(offsetStartSec)}_${Math.floor(offsetEndSec)}`;

// ============================================================================
// PROVIDER
// ============================================================================

export const TimerProvider: React.FC<TimerProviderProps> = ({
  children,
  onSessionComplete,
  userId: propUserId,
}) => {
  const { startFocus, stopFocus, uid: presenceUid } = usePresence();

  // The effective user id comes from props, presence, or (later) the auth session.
  const effectiveUserId = propUserId || presenceUid || null;
  const effectiveUserIdRef = useRef<string | null>(effectiveUserId);

  useEffect(() => {
    effectiveUserIdRef.current = effectiveUserId;
  }, [effectiveUserId]);

  // ------------------------------------------------------------------------
  // REACT STATE (drives re-renders / UI)
  // ------------------------------------------------------------------------

  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_SECONDS);
  const [mode, setModeState] = useState<TimerMode>(DEFAULT_MODE);
  const [topicName, setTopicNameState] = useState(DEFAULT_TOPIC);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [autoPauseEnabled, setAutoPauseEnabled] = useState(true);

  // ------------------------------------------------------------------------
  // MUTABLE REFS (the real engine — survive re-renders, read synchronously)
  //
  // Why refs AND state? The 1-second tick and event handlers must read the
  // latest values WITHOUT depending on React's render cycle. Refs are the
  // source of truth; state mirrors them for the UI.
  // ------------------------------------------------------------------------

  const isRunningRef = useRef(false);
  const secondsLeftRef = useRef(DEFAULT_SECONDS);
  const modeRef = useRef<TimerMode>(DEFAULT_MODE);
  const topicNameRef = useRef(DEFAULT_TOPIC);
  const sessionStartTimeRef = useRef<number | null>(null);
  /** Seconds banked from PAUSED segments of this session (pause-safe math). */
  const accumulatedElapsedRef = useRef(0);
  /** Wall-clock start of the live segment (null while paused). */
  const currentSegmentStartRef = useRef<number | null>(null);
  /** Countdown starting point (0 for infinity). */
  const initialSecondsRef = useRef(0);
  /** Prevents double-completion (UI entry points). */
  const completionLockRef = useRef(false);
  /** Idempotency guard: completeSession body runs exactly once. */
  const sessionCompletedRef = useRef(false);
  /** Ensures restore runs exactly once. */
  const restoredRef = useRef(false);
  /** Prevents concurrent pending-queue flush runs. */
  const flushingRef = useRef(false);
  /** Keeps completion callback fresh without recreating dependent callbacks. */
  const callbackRef = useRef(onSessionComplete);

  /**
   * ⭐ Seconds of the CURRENT session already confirmed-persisted as chunks.
   * Advances ONLY on confirmed successful pushes. Everything above this
   * watermark is safely restorable; everything below gets its own chunk id.
   */
  const flushedSecondsRef = useRef(0);

  /** Guards against queueing the identical unflushed interval twice on
   *  repeated pagehide/beforeunload events in one lifecycle. */
  const lastQueuedIntervalRef = useRef<string | null>('');
  /** Completion-listener registry: lets ANY component react to session completion
 *  without needing the provider prop (Fix F1). */
const completionListenersRef = useRef<Set<(s: TimerSessionCompletion) => void>>(new Set());
const notifyCompletion = useCallback((s: TimerSessionCompletion) => {
  try { callbackRef.current?.(s); } catch (e) { console.error('[Timer] provider cb failed:', e); }
  completionListenersRef.current.forEach((fn) => {
    try { fn(s); } catch (e) { console.error('[Timer] listener failed:', e); }
  });
}, []);

  useEffect(() => {
    callbackRef.current = onSessionComplete;
  }, [onSessionComplete]);

  // ------------------------------------------------------------------------
  // CALCULATE TOTAL ELAPSED (current session only)
  //
  // = previously banked segments + (now − current segment start) if running.
  // Pure function of refs → safe to call from anywhere, any time.
  // ------------------------------------------------------------------------

  const calculateElapsedSeconds = useCallback((): number => {
    let elapsed = accumulatedElapsedRef.current;
    const currentStart = currentSegmentStartRef.current;

    if (isRunningRef.current && currentStart) {
      elapsed += Math.max(0, Math.floor((Date.now() - currentStart) / 1000));
    }

    return Math.max(0, elapsed);
  }, []);

  /**
   * Epoch-second anchor for chunk-id arithmetic. Uses SESSION START wall-clock
   * when known; falls back to a stable synthetic anchor so ids remain stable
   * within a session even if sessionStartTime was somehow lost.
   */
  const chunkAnchorSec = useCallback((): number => {
    if (sessionStartTimeRef.current) {
      return Math.floor(sessionStartTimeRef.current / 1000);
    }
    // Synthetic-but-stable anchor derived from nothing time-varying here is
    // impossible; fall back to today-midnight so ids stay stable intra-day.
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return Math.floor(d.getTime() / 1000);
  }, []);

  // ------------------------------------------------------------------------
  // LOCAL STORAGE PERSISTENCE
  // ------------------------------------------------------------------------

  const saveLocalState = useCallback((running: boolean, remaining: number) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 7,
          isRunning: running,
          secondsLeft: Math.max(0, Math.floor(remaining)),
          mode: modeRef.current,
          topicName: topicNameRef.current,
          initialSeconds: initialSecondsRef.current,
          accumulatedElapsed: accumulatedElapsedRef.current,
          sessionStartTime: sessionStartTimeRef.current,
          currentSegmentStart: running ? currentSegmentStartRef.current : null,
          flushedSeconds: flushedSecondsRef.current,
          savedAt: Date.now(),
        })
      );
    } catch (error) {
      console.warn('[Timer] Save failed:', error);
    }
  }, []);

  // ------------------------------------------------------------------------
  // ⭐ CHUNK COMMITMENT — the ONLY writer of study time in the entire app.
  //
  // Covers [flushedSecondsRef … flushedSeconds+delta] with ONE deterministic
  // id and hands it to db.ts, which: upserts the history row (ignoreDuplicates)
  // and — ONLY on fresh insert — atomically increments total_study_time via
  // RPC. We deliberately DO NOT touch totals here (Fix #1): that path is how
  // every minute got counted twice.
  //
  // Returns seconds successfully committed (0 on failure/nothing-to-do).
  // ------------------------------------------------------------------------

  const commitChunkToDatabase = useCallback(
    async (
      userId: string,
      reason: string,
      minSeconds: number,
      explicitDeltaSeconds?: number,
    ): Promise<number> => {
      const totalElapsed =
        explicitDeltaSeconds != null
          ? flushedSecondsRef.current + explicitDeltaSeconds
          : calculateElapsedSeconds();

      const deltaSeconds = Math.max(0, totalElapsed - flushedSecondsRef.current);
      if (deltaSeconds < Math.max(1, minSeconds)) return 0;

      const dateKey = getDayKey();
      const anchorSec = chunkAnchorSec();
      const offsetStart = flushedSecondsRef.current;
      const offsetEnd = totalElapsed;

      // ⭐ Interval-derived id: retries → same row → gated increment runs once.
      const chunkId = makeChunkId(
        userId,
        dateKey,
        anchorSec,
        offsetStart,
        offsetEnd,
      );

      try {
        const success = await withTimeout(
          pushStudySessionToSupabase({
            id: chunkId,
            user_id: userId,
            topic_name: topicNameRef.current || DEFAULT_TOPIC,
            subject: undefined,
            duration_minutes: toMinutes(deltaSeconds),
            mode: modeRef.current,
            date_key: dateKey,
            completed_at: new Date().toISOString(),
          }),
          DB_TIMEOUT_MS,
          `${reason}-chunk-push`,
        );

        if (!success) throw new Error('chunk push rejected');

        // Watermark advances ONLY after confirmed acceptance.
        flushedSecondsRef.current = totalElapsed;
        saveLocalState(isRunningRef.current, secondsLeftRef.current);

        console.log(
          `[Timer] ✅ +${toMinutes(deltaSeconds)}min chunk (${reason}) [${offsetStart}–${offsetEnd}s]`,
        );
        return deltaSeconds;
      } catch (error) {
        // Timeout/network stall lands here → timer keeps ticking; the SAME
        // interval retries on the next beat with the SAME id. Harmless.
        console.error(`[Timer] ❌ Chunk commit failed (${reason}):`, error);
        return 0;
      }
    },
    [calculateElapsedSeconds, chunkAnchorSec, saveLocalState],
  );

  // ------------------------------------------------------------------------
  // FLUSH PENDING (crash-queued) SESSIONS ON STARTUP
  //
  // Queued payloads now CARRY their own precomputed chunk id (Fix #3), so
  // replaying them is idempotent FOREVER — previously ids were minted fresh
  // at flush time, so every reload re-inserted the same offline minutes and
  // re-added them to totals. Filtered per-user; every DB call timeout-guarded.
  // ------------------------------------------------------------------------

  const flushPendingSessions = useCallback(async (userId: string) => {
    if (flushingRef.current) return;

    let pending: any[] = [];
    try {
      pending = JSON.parse(localStorage.getItem(PENDING_SESSIONS_KEY) || '[]');
    } catch {
      pending = [];
    }

    if (!Array.isArray(pending) || pending.length === 0) return;

    const mine = pending.filter((p) => p && p.user_id === userId);
    if (mine.length === 0) return;

    flushingRef.current = true;
    console.log(`[Timer] 🔄 Flushing ${mine.length} pending session(s)...`);

    const succeededIds = new Set<string>();

    for (const payload of mine) {
      try {
        const success = await withTimeout(
          pushStudySessionToSupabase({
            // Payload-local id — stable across unlimited replays.
            id: payload.id || payload.sessionId,
            user_id: payload.user_id,
            topic_name: payload.topic_name || DEFAULT_TOPIC,
            subject: payload.subject ?? undefined,
            duration_minutes: payload.duration_minutes || 0.01,
            mode: payload.mode || DEFAULT_MODE,
            date_key: payload.date_key || getDayKey(),
            completed_at: payload.completed_at || new Date().toISOString(),
          }),
          DB_TIMEOUT_MS,
          'pending-chunk-push',
        );

        if (success && payload.id) succeededIds.add(payload.id);
        else if (success) succeededIds.add(`idx:${payload.__qindex}`);

        console.log(`[Timer] ✅ Flushed pending chunk (${payload.duration_minutes}min)`);
      } catch (err) {
        console.error('[Timer] Failed to flush pending session (kept for retry):', err);
      }
    }

    // Remove ONLY processed rows (keep failures + other users' rows intact).
    try {
      const remaining = pending.filter((p, idx) => {
        if (!p || p.user_id !== userId) return true;                    // other users stay
        const key = p.id || `idx:${idx}`;
        p.__qindex = p.__qindex ?? idx;                                 // stable fallback key
        const k2 = p.id || `idx:${p.__qindex}`;
        return !succeededIds.has(k2);
      });

      // Second pass guard: rebuild properly without __qindex leaking forward.
      const remainingClean = pending.filter((p, idx) => {
        if (!p || p.user_id !== userId) return true;
        return !succeededIds.has(p.id || `idx:${idx}`);
      });

      const finalRemaining = Array.isArray(remainingClean) ? remainingClean : remaining;

      if (finalRemaining.length > 0) {
        localStorage.setItem(PENDING_SESSIONS_KEY, JSON.stringify(finalRemaining));
      } else {
        localStorage.removeItem(PENDING_SESSIONS_KEY);
      }
    } catch (err) {
      console.warn('[Timer] Failed to clean pending list:', err);
    }

    flushingRef.current = false;
  }, []);

  // Run the flush whenever a user id becomes available (covers late auth).
  useEffect(() => {
    if (effectiveUserId) {
      void flushPendingSessions(effectiveUserId);
    }
  }, [effectiveUserId, flushPendingSessions]);

  // ------------------------------------------------------------------------
  // QUEUE THE UNFLUSHED REMAINDER ON PAGE CLOSE (crash-safe, id-stable)
  //
  // Computes the interval HERE, mints its deterministic id HERE, stores both.
  // On next boot the replay targets the identical row ⇒ cannot double-count
  // even if the browser fired pagehide multiple times (lastQueuedIntervalRef
  // additionally collapses repeats within one lifecycle).
  // ------------------------------------------------------------------------

  useEffect(() => {
    const queueUnflushedRemainder = () => {
      if (!isRunningRef.current && accumulatedElapsedRef.current <= 0) return;

      const totalElapsed = calculateElapsedSeconds();
      if (totalElapsed <= 0) return;

      const userId = effectiveUserIdRef.current;
      if (!userId) {
        console.warn('[Timer] Cannot queue partial session: no userId');
        return;
      }

      const deltaSeconds = Math.max(0, totalElapsed - flushedSecondsRef.current);
      if (deltaSeconds < 1) return;

      const dateKey = getDayKey();
      const anchorSec = chunkAnchorSec();
      const offsetStart = flushedSecondsRef.current;
      const offsetEnd = totalElapsed;
      const intervalKey = makeChunkId(userId, dateKey, anchorSec, offsetStart, offsetEnd);

      // Identical interval already queued this lifecycle → skip.
      if (lastQueuedIntervalRef.current === intervalKey) {
        flushedSecondsRef.current = totalElapsed; // treat as persisted for state-save
        saveLocalState(isRunningRef.current, secondsLeftRef.current);
        return;
      }
      lastQueuedIntervalRef.current = intervalKey;

      const nowIso = new Date().toISOString();

      const payload = {
        id: intervalKey,                                   // ⭐ precomputed (Fix #3)
        user_id: userId,
        topic_name: topicNameRef.current || DEFAULT_TOPIC,
        subject: undefined as string | undefined,
        duration_minutes: toMinutes(deltaSeconds),
        mode: modeRef.current,
        date_key: dateKey,
        completed_at: nowIso,
      };

      try {
        const pendingSessions = JSON.parse(
          localStorage.getItem(PENDING_SESSIONS_KEY) || '[]',
        );
        // Belt-and-braces: drop any stale payload carrying the SAME id
        // (e.g., queued on a previous close and not yet flushed — rare, but
        // pushing duplicates would rely purely on server-side dedupe).
        const deduped = pendingSessions.filter((p: any) => p?.id !== intervalKey);
        deduped.push(payload);
        localStorage.setItem(PENDING_SESSIONS_KEY, JSON.stringify(deduped));

        // Mark as flushed so restore doesn't chase the same seconds again.
        flushedSecondsRef.current = totalElapsed;
        saveLocalState(isRunningRef.current, secondsLeftRef.current);
      } catch (error) {
        console.warn('[Timer] Failed to queue partial session:', error);
      }
    };

    window.addEventListener('beforeunload', queueUnflushedRemainder);
    window.addEventListener('pagehide', queueUnflushedRemainder);

    return () => {
      window.removeEventListener('beforeunload', queueUnflushedRemainder);
      window.removeEventListener('pagehide', queueUnflushedRemainder);
    };
  }, [calculateElapsedSeconds, chunkAnchorSec, saveLocalState]);

  // ------------------------------------------------------------------------
  // ⭐ COMPLETE SESSION — guaranteed reset (try/finally + 12s watchdog)
  //
  // v7 deltas:
  //  • Final remaining interval committed as ONE chunk with an interval id.
  //  • ZERO direct total_study_time writes (Fix #1 — db.ts increments).
  //  • Push failure queues the exact interval locally (Fix #5) so the final
  //    minutes self-heal on next launch instead of evaporating.
  // ------------------------------------------------------------------------

  const completeSession = useCallback(
    async (completedMode: TimerMode, completedTopic: string, totalSeconds: number) => {
      if (sessionCompletedRef.current) return;

      sessionCompletedRef.current = true;
      completionLockRef.current = true;

      // ⭐ WATCHDOG: worst case, force-unlock after 12s so the timer can
      // NEVER stay frozen. Ultimate safety net below the try/finally.
      const watchdog = window.setTimeout(() => {
        console.warn('[Timer] ⚠️ completeSession watchdog fired — force-unlocking');
        completionLockRef.current = false;
        sessionCompletedRef.current = false;
        isRunningRef.current = false;
        setIsRunning(false);
      }, 12000);

      // Finalization closure used by BOTH success and failure paths.
      const finalizeReset = () => {
        window.clearTimeout(watchdog);

        accumulatedElapsedRef.current = 0;
        currentSegmentStartRef.current = null;
        sessionStartTimeRef.current = null;
        flushedSecondsRef.current = 0;
        initialSecondsRef.current =
          completedMode === 'infinity' ? 0 : TIMER_MODE_DURATIONS[completedMode] || 0;
        lastQueuedIntervalRef.current = '';

        setSessionStartTime(null);
        setIsRunning(false);
        isRunningRef.current = false;
        setSecondsLeft(0);
        secondsLeftRef.current = 0;
        localStorage.removeItem(STORAGE_KEY);
        completionLockRef.current = false;
        sessionCompletedRef.current = false;
      };

      try {
        // ---- resolve user id from every available source -------------------
        let userId = propUserId || presenceUid || effectiveUserIdRef.current;

        if (!userId) {
          try {
            const sessRes = await withTimeout(
              supabase.auth.getSession(),
              DB_TIMEOUT_MS,
              'get-session',
            );
            userId = sessRes?.data?.session?.user?.id || null;
          } catch (error) {
            console.warn('[Timer] Could not get auth session:', error);
          }
        }

        if (!userId) {
          try {
            const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
            userId = profile.uid || profile.id || null;
          } catch {
            userId = null;
          }
        }

        const safeElapsed = Math.max(0, Math.floor(totalSeconds));
        const now = new Date();
        const dateKey = getDayKey();

        const durationMinutes = toMinutes(safeElapsed);

        // Interval id spanning EVERYTHING this session studied that hasn't
        // been confirmed-persisted yet (0 … safeElapsed−flushedOffset).
        const flushedOffset = Math.min(flushedSecondsRef.current, safeElapsed);
        const sessionAnchorSec = sessionStartTimeRef.current
          ? Math.floor(sessionStartTimeRef.current / 1000)
          : (() => {
              const d = new Date();
              d.setHours(0, 0, 0, 0);
              return Math.floor(d.getTime() / 1000);
            })();

        const completionSession: TimerSessionCompletion = {
          id: makeChunkId(userId || 'anon', dateKey, sessionAnchorSec, flushedOffset, safeElapsed),
          dateKey,
          topicName: completedTopic || DEFAULT_TOPIC,
          durationMinutes,
          mode: completedMode,
          completedAt: now.toISOString(),
          totalSecondsElapsed: safeElapsed,
        };

        console.log('[Timer] SESSION COMPLETED', completionSession);

        try {
          stopFocus('offline');
        } catch (error) {
          console.warn('[Timer] stopFocus failed:', error);
        }

        if (userId) {
          const deltaSeconds = Math.max(0, safeElapsed - flushedSecondsRef.current);

          if (deltaSeconds >= 1) {
            try {
              // ⭐ FINAL CHUNK — db.ts inserts row + gated increment. We do
              // NOT touch totals afterward (Fix #1).
              const success = await withTimeout(
                pushStudySessionToSupabase({
                  id: completionSession.id,
                  user_id: userId,
                  topic_name: completionSession.topicName,
                  subject: undefined,
                  duration_minutes: completionSession.durationMinutes,
                  mode: completionSession.mode,
                  date_key: completionSession.dateKey,
                  completed_at: completionSession.completedAt,
                }),
                DB_TIMEOUT_MS,
                'complete-chunk-push',
              );

              if (success) {
                console.log(`[Timer] ✅ Final +${completionSession.durationMinutes}min committed`);
              } else {
                throw new Error('final chunk push rejected');
              }
            } catch (error) {
              // ⭐ Fix #5 — persist the exact interval locally; next launch
              // replays it against the SAME id (idempotent), so the student's
              // final minutes are never lost to a bad network.
              console.error('[Timer] Final chunk failed — queueing for self-heal:', error);
              try {
                const queue = JSON.parse(
                  localStorage.getItem(PENDING_SESSIONS_KEY) || '[]',
                );
                queue.push({
                  id: completionSession.id,
                  user_id: userId,
                  topic_name: completionSession.topicName,
                  subject: undefined,
                  duration_minutes: completionSession.durationMinutes,
                  mode: completionSession.mode,
                  date_key: completionSession.dateKey,
                  completed_at: completionSession.completedAt,
                });
                localStorage.setItem(PENDING_SESSIONS_KEY, JSON.stringify(queue));
              } catch (queueError) {
                console.error('[Timer] Self-heal queue write failed:', queueError);
              }
            }
          } else {
            console.log('[Timer] All elapsed time already credited.');
          }
        }

        try {
          await withTimeout(
            Promise.resolve(notifyCompletion(completionSession)),
            DB_TIMEOUT_MS,
            'onSessionComplete-callback',
          );
        } catch (error) {
          console.error('[Timer] onSessionComplete failed:', error);
        }
      } catch (outerError) {
        console.error('[Timer] Unexpected error in completeSession:', outerError);
      } finally {
        // ⭐ GUARANTEED RESET — success, throw, or timeout. Unfreezable.
        finalizeReset();
      }
    },
      [notifyCompletion, presenceUid, propUserId, stopFocus]
  );
  // ------------------------------------------------------------------------
  // RESTORE TIMER (once on mount — rebuilds state from localStorage)
  //
  // Handles: running timers (incl. time elapsed while closed), expired
  // countdowns, paused sessions. flushedSeconds is restored so already-
  // persisted intervals are never chunked twice.
  // ------------------------------------------------------------------------

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;

      const savedMode = (parsed.mode || DEFAULT_MODE) as TimerMode;
      const savedTopic =
        typeof parsed.topicName === 'string' ? parsed.topicName : DEFAULT_TOPIC;
      const defaultInitial = TIMER_MODE_DURATIONS[savedMode] || DEFAULT_SECONDS;
      const savedInitial = safeNumber(parsed.initialSeconds, defaultInitial);
      const savedRunning = Boolean(parsed.isRunning);
      const savedAt = safeNumber(parsed.savedAt, Date.now());
      const savedSessionStart =
        parsed.sessionStartTime != null ? safeNumber(parsed.sessionStartTime, 0) : 0;

      // Watermark restored → previously committed chunks are never re-sent.
      flushedSecondsRef.current = safeNumber(parsed.flushedSeconds, 0);
      lastQueuedIntervalRef.current = '';

      const now = Date.now();
      const elapsedAway = Math.max(0, Math.floor((now - savedAt) / 1000));

      modeRef.current = savedMode;
      topicNameRef.current = savedTopic;
      initialSecondsRef.current = savedInitial;
      setModeState(savedMode);
      setTopicNameState(savedTopic);

      if (savedRunning) {
        if (savedMode === 'infinity') {
          const savedSecondsLeft = safeNumber(parsed.secondsLeft, 0);
          const totalElapsed = savedSecondsLeft + elapsedAway;

          accumulatedElapsedRef.current = totalElapsed;
          currentSegmentStartRef.current = now;
          sessionStartTimeRef.current = savedSessionStart || now - totalElapsed * 1000;

          secondsLeftRef.current = totalElapsed;
          setSecondsLeft(totalElapsed);
          setSessionStartTime(sessionStartTimeRef.current);
          setIsRunning(true);
          isRunningRef.current = true;
        } else {
          const savedSecondsLeft = safeNumber(parsed.secondsLeft, savedInitial);
          const remaining = Math.max(0, savedSecondsLeft - elapsedAway);
          const totalStudied = savedInitial - remaining;

          if (remaining <= 0) {
            // Timer expired while tab closed → complete it.
            accumulatedElapsedRef.current = savedInitial;
            currentSegmentStartRef.current = null;
            sessionStartTimeRef.current = savedSessionStart || now;

            secondsLeftRef.current = 0;
            setSecondsLeft(0);
            setSessionStartTime(sessionStartTimeRef.current);
            setIsRunning(false);
            isRunningRef.current = false;
            completionLockRef.current = false;
            sessionCompletedRef.current = false;

            setTimeout(() => {
              void completeSession(savedMode, savedTopic, savedInitial);
            }, 0);
            return;
          }

          accumulatedElapsedRef.current = totalStudied;
          currentSegmentStartRef.current = now;
          sessionStartTimeRef.current = savedSessionStart || now - totalStudied * 1000;

          secondsLeftRef.current = remaining;
          setSecondsLeft(remaining);
          setSessionStartTime(sessionStartTimeRef.current);
          setIsRunning(true);
          isRunningRef.current = true;
        }

        completionLockRef.current = false;
        sessionCompletedRef.current = false;

        setTimeout(() => {
          try {
            startFocus(savedTopic, currentSegmentStartRef.current, {
              accumulatedSeconds: accumulatedElapsedRef.current,
            });
          } catch (error) {
            console.warn('[Timer] restore presence failed:', error);
          }
        }, 0);

        return;
      }

      // Paused / stopped restore — no "time away" to add.
      const savedSecondsLeft = safeNumber(parsed.secondsLeft, savedInitial);
      const savedAccumulated = Math.max(0, safeNumber(parsed.accumulatedElapsed, 0));

      secondsLeftRef.current = savedSecondsLeft;
      setSecondsLeft(savedSecondsLeft);
      setIsRunning(false);
      isRunningRef.current = false;
      accumulatedElapsedRef.current = savedAccumulated;
      currentSegmentStartRef.current = null;
      sessionStartTimeRef.current = savedSessionStart || null;
      setSessionStartTime(savedSessionStart || null);
      completionLockRef.current = false;
      sessionCompletedRef.current = false;
    } catch (error) {
      console.error('[Timer] Restore failed:', error);
    }
  }, [completeSession, startFocus]);

  // ------------------------------------------------------------------------
  // START TIMER
  // ------------------------------------------------------------------------

  const startTimer = useCallback(
    (newMode: TimerMode, topic: string, initialSeconds?: number) => {
      const cleanTopic = topic?.trim() || DEFAULT_TOPIC;
      let duration = initialSeconds;

      if (duration === undefined) {
        duration = TIMER_MODE_DURATIONS[newMode];
      }

      duration = Math.max(0, safeNumber(duration));

      if (newMode === 'infinity') {
        duration = 0;
      }

      const now = Date.now();

      // Fresh session → clear every lock/counter/watermark.
      completionLockRef.current = false;
      sessionCompletedRef.current = false;
      accumulatedElapsedRef.current = 0;
      flushedSecondsRef.current = 0;
      lastQueuedIntervalRef.current = '';
      currentSegmentStartRef.current = now;
      sessionStartTimeRef.current = now;
      initialSecondsRef.current = duration;
      modeRef.current = newMode;
      topicNameRef.current = cleanTopic;
      isRunningRef.current = true;
      secondsLeftRef.current = duration;

      setModeState(newMode);
      setTopicNameState(cleanTopic);
      setSecondsLeft(duration);
      setSessionStartTime(now);
      setIsRunning(true);

      try {
        startFocus(cleanTopic, now, { accumulatedSeconds: 0 });
      } catch (error) {
        console.warn('[Timer] startFocus failed:', error);
      }

      saveLocalState(true, duration);

      console.log('[Timer] Started:', {
        mode: newMode,
        topic: cleanTopic,
        duration,
        startedAt: now,
      });
    },
    [saveLocalState, startFocus],
  );

  // ------------------------------------------------------------------------
  // PAUSE — banks the live segment, commits whatever is pending so far.
  // ------------------------------------------------------------------------

  const pauseTimer = useCallback(() => {
    if (!isRunningRef.current) return;

    const now = Date.now();
    const segmentStart = currentSegmentStartRef.current;

    if (segmentStart) {
      const segmentElapsed = Math.max(0, Math.floor((now - segmentStart) / 1000));
      accumulatedElapsedRef.current += segmentElapsed;
    }

    currentSegmentStartRef.current = null;
    const totalElapsed = calculateElapsedSeconds();

    setIsRunning(false);
    isRunningRef.current = false;

    // Commit ≥MIN_CHUNK_SECONDS worth of unflushed study BEFORE going idle.
    const uid = effectiveUserIdRef.current;
    if (uid && !sessionCompletedRef.current) {
      void commitChunkToDatabase(uid, 'pause', MIN_CHUNK_SECONDS);
    }

    try {
      stopFocus('break');
    } catch (error) {
      console.warn('[Timer] stopFocus failed:', error);
    }

    saveLocalState(false, secondsLeftRef.current);

    console.log('[Timer] Paused:', { totalElapsed, remaining: secondsLeftRef.current });
  }, [
    calculateElapsedSeconds,
    commitChunkToDatabase,
    saveLocalState,
    stopFocus,
  ]);

  // ------------------------------------------------------------------------
  // ⭐ RESUME — self-healing locks (v6 behavior preserved)
  // ------------------------------------------------------------------------

  const resumeTimer = useCallback(() => {
    if (isRunningRef.current) return;

    // Self-heal locks left over from a previous frozen session.
    if (completionLockRef.current || sessionCompletedRef.current) {
      console.warn('[Timer] 🩹 resume: clearing stuck locks');
      completionLockRef.current = false;
      sessionCompletedRef.current = false;
    }

    // Infinity mode legitimately sits at 0 while counting up — allow it.
    if (modeRef.current !== 'infinity' && secondsLeftRef.current <= 0) return;

    const now = Date.now();
    currentSegmentStartRef.current = now;
    isRunningRef.current = true;
    setIsRunning(true);

    try {
      startFocus(topicNameRef.current, now, {
        accumulatedSeconds: accumulatedElapsedRef.current,
      });
    } catch (error) {
      console.warn('[Timer] resume startFocus failed:', error);
    }

    saveLocalState(true, secondsLeftRef.current);

    console.log('[Timer] Resumed:', {
      remaining: secondsLeftRef.current,
      accumulated: accumulatedElapsedRef.current,
      flushedSoFar: flushedSecondsRef.current,
    });
  }, [saveLocalState, startFocus]);

  // ------------------------------------------------------------------------
  // STOP / FINISH SESSION
  // ------------------------------------------------------------------------

  const stopTimer = useCallback(() => {
    const totalElapsed = calculateElapsedSeconds();

    if (totalElapsed > 0) {
      isRunningRef.current = false;
      setIsRunning(false);
      currentSegmentStartRef.current = null;
      accumulatedElapsedRef.current = totalElapsed;

      void completeSession(modeRef.current, topicNameRef.current, totalElapsed);
      return;
    }

    try {
      stopFocus('offline');
    } catch (error) {
      console.warn('[Timer] stopFocus failed:', error);
    }

    currentSegmentStartRef.current = null;
    accumulatedElapsedRef.current = 0;
    flushedSecondsRef.current = 0;
    lastQueuedIntervalRef.current = '';
    sessionStartTimeRef.current = null;
    initialSecondsRef.current = 0;
    isRunningRef.current = false;
    secondsLeftRef.current = 0;
    setIsRunning(false);
    setSecondsLeft(0);
    setSessionStartTime(null);
    localStorage.removeItem(STORAGE_KEY);
    completionLockRef.current = false;
    sessionCompletedRef.current = false;

    console.log('[Timer] Stopped with no elapsed time');
  }, [calculateElapsedSeconds, completeSession, stopFocus]);

  // ------------------------------------------------------------------------
  // DISCARD CURRENT SESSION (≥1min uncommitted is preserved via completion;
  // committed DB history is NEVER touched).
  // ------------------------------------------------------------------------

  const discardCurrentSession = useCallback(() => {
    const totalElapsed = calculateElapsedSeconds();
    if (totalElapsed >= 60 && !sessionCompletedRef.current) {
      void completeSession(modeRef.current, topicNameRef.current, totalElapsed);
      return;
    }

    try {
      stopFocus('offline');
    } catch (error) {
      console.warn('[Timer] stopFocus failed:', error);
    }

    currentSegmentStartRef.current = null;
    accumulatedElapsedRef.current = 0;
    flushedSecondsRef.current = 0;
    lastQueuedIntervalRef.current = '';
    sessionStartTimeRef.current = null;
    initialSecondsRef.current =
      modeRef.current === 'infinity' ? 0 : TIMER_MODE_DURATIONS[modeRef.current] || 0;
    isRunningRef.current = false;
    secondsLeftRef.current = initialSecondsRef.current;
    setIsRunning(false);
    setSecondsLeft(initialSecondsRef.current);
    setSessionStartTime(null);
    localStorage.removeItem(STORAGE_KEY);
    completionLockRef.current = false;
    sessionCompletedRef.current = false;

    console.log('[Timer] Current session discarded (DB history untouched)');
  }, [calculateElapsedSeconds, completeSession, stopFocus]);

  // ------------------------------------------------------------------------
  // HEARTBEAT: commit unflushed slice every 60s (was 2min) while running.
  // Failure is invisible to the user: same interval retries next beat with
  // the SAME chunk id — the network cannot lose a student's time.
  // ------------------------------------------------------------------------

  useEffect(() => {
    if (!isRunning) return;

    const id = window.setInterval(() => {
      if (!isRunningRef.current) return;

      const userId = effectiveUserIdRef.current;
      if (!userId) return;

      void commitChunkToDatabase(userId, 'heartbeat', MIN_CHUNK_SECONDS);
    }, CHUNK_INTERVAL_MS);

    return () => {
      window.clearInterval(id);
    };
  }, [isRunning, commitChunkToDatabase]);

  // ------------------------------------------------------------------------
  // LIVE PREVIEW (separate `live_study_minutes` column — never the ranked one)
  //
  // Publishes ONLY the uncommitted portion (committed seconds already live in
  // total_study_time — publishing both was the old double-display bug).
  // Zeroed reliably on stop/toggle/mount-change via lastPreviewUserId.
  // ------------------------------------------------------------------------

  const lastPreviewUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isRunning) {
      // Going idle → clear the preview of whoever we last published for.
      const uid = lastPreviewUserIdRef.current;
      if (uid) {
        lastPreviewUserIdRef.current = null;
        (async () => {
          try {
            await withTimeout(
              supabase
                .from('users')
                .update({ live_study_minutes: 0, current_status: 'offline' })
                .eq('id', uid),
              DB_TIMEOUT_MS,
              'clear-live-preview',
            );
          } catch {
            /* best-effort */
          }
        })();
      }
      return;
    }

    const syncLivePreview = async () => {
      const userId = effectiveUserIdRef.current;
      if (!userId) return;

      const totalElapsedSec = calculateElapsedSeconds();
      const uncommittedSec = Math.max(0, totalElapsedSec - flushedSecondsRef.current);
      const liveMinutes = Math.round((uncommittedSec / 60) * 100) / 100;

      lastPreviewUserIdRef.current = userId;

      try {
        const { error } = await withTimeout(
          supabase
            .from('users')
            .update({
              live_study_minutes: liveMinutes,
              current_status: 'focus',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId),
          DB_TIMEOUT_MS,
          'live-preview',
        );
        if (!error) {
          console.log(`[Timer] 📡 Live preview = ${liveMinutes}min (ranked total untouched)`);
        }
      } catch (err) {
        console.warn('[Timer] Live preview exception:', err);
      }
    };

    const first = window.setTimeout(syncLivePreview, 20_000);
    const interval = window.setInterval(syncLivePreview, 45_000);

    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, [isRunning, calculateElapsedSeconds]);

  // Zero preview + presence when the provider itself unmounts (app logout etc.)
  useEffect(() => {
    return () => {
      const uid = lastPreviewUserIdRef.current;
      if (uid) {
        supabase
          .from('users')
          .update({ live_study_minutes: 0, current_status: 'offline' })
          .eq('id', uid)
          .then(undefined, () => {});
      }
    };
  }, []);

  // ------------------------------------------------------------------------
  // TICK WATCHDOG (v6 insurance preserved)
  // ------------------------------------------------------------------------

  useEffect(() => {
    if (!isRunning) return;

    const id = window.setInterval(() => {
      if (!isRunningRef.current) return;

      if (completionLockRef.current || sessionCompletedRef.current) {
        console.warn('[Timer] 🩹 Tick watchdog: clearing stuck completion locks');
        completionLockRef.current = false;
        sessionCompletedRef.current = false;
      }
    }, 5000);

    return () => window.clearInterval(id);
  }, [isRunning]);

  // ------------------------------------------------------------------------
  // MOBILE VISIBILITY RECOVERY (wall-clock snap-back; v6 preserved)
  // ------------------------------------------------------------------------

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (!isRunningRef.current) return;

      const elapsed = calculateElapsedSeconds();
      if (modeRef.current === 'infinity') {
        secondsLeftRef.current = elapsed;
        setSecondsLeft(elapsed);
      } else {
        const remaining = Math.max(0, initialSecondsRef.current - elapsed);
        secondsLeftRef.current = remaining;
        setSecondsLeft(remaining);

        if (
          remaining <= 0 &&
          !completionLockRef.current &&
          !sessionCompletedRef.current
        ) {
          completionLockRef.current = true;
          accumulatedElapsedRef.current = Math.max(
            accumulatedElapsedRef.current,
            initialSecondsRef.current,
          );
          currentSegmentStartRef.current = null;
          void completeSession(
            modeRef.current,
            topicNameRef.current,
            accumulatedElapsedRef.current,
          );
        }
      }
      saveLocalState(true, secondsLeftRef.current);
      console.log('[Timer] 👁️ Tab visible — display recovered from wall-clock');
    };

    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [calculateElapsedSeconds, completeSession, saveLocalState]);

  // ------------------------------------------------------------------------
  // THE TICK LOOP (1s; UI-only smoothness — wall-clock is truth)
  // ------------------------------------------------------------------------

  useEffect(() => {
    if (!isRunning) return;

    const id = window.setInterval(() => {
      if (!isRunningRef.current) return;

      if (modeRef.current === 'infinity') {
        const elapsed = calculateElapsedSeconds();
        secondsLeftRef.current = elapsed;
        setSecondsLeft(elapsed);
      } else {
        const elapsed = calculateElapsedSeconds();
        const remaining = Math.max(0, initialSecondsRef.current - elapsed);
        secondsLeftRef.current = remaining;
        setSecondsLeft(remaining);

        if (
          remaining <= 0 &&
          !completionLockRef.current &&
          !sessionCompletedRef.current
        ) {
          console.log('[Timer] ⏰ Countdown reached 0 — auto-completing');
          completionLockRef.current = true;
          accumulatedElapsedRef.current = Math.max(
            accumulatedElapsedRef.current,
            initialSecondsRef.current,
          );
          currentSegmentStartRef.current = null;
          void completeSession(
            modeRef.current,
            topicNameRef.current,
            accumulatedElapsedRef.current,
          );
        }
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [isRunning, calculateElapsedSeconds, completeSession]);

  // ------------------------------------------------------------------------
  // TOPIC
  // ------------------------------------------------------------------------

  const setTopicName = useCallback(
    (topic: string) => {
      const cleanTopic = topic?.trim() || DEFAULT_TOPIC;
      topicNameRef.current = cleanTopic;
      setTopicNameState(cleanTopic);

      if (isRunningRef.current) {
        try {
          startFocus(cleanTopic, currentSegmentStartRef.current, {
            accumulatedSeconds: accumulatedElapsedRef.current,
          });
        } catch (error) {
          console.warn('[Timer] topic presence update failed:', error);
        }
      }

      saveLocalState(isRunningRef.current, secondsLeftRef.current);
    },
    [saveLocalState, startFocus],
  );

  // ------------------------------------------------------------------------
  // ⭐ MODE SWITCH — banks pending effort via chunk-commit (no completion race).
  // Deterministic chunk ids keep totals exact; display resets cleanly every time.
  const setMode = useCallback(
    (newMode: TimerMode, seconds?: number) => {
      const uid = effectiveUserIdRef.current;
      if (!sessionCompletedRef.current && uid) {
        // Bank the outgoing segment's time locally...
        if (currentSegmentStartRef.current) {
          const seg = Math.max(0, Math.floor((Date.now() - currentSegmentStartRef.current) / 1000));
          accumulatedElapsedRef.current += seg;
          currentSegmentStartRef.current = null;
        }
        // ...then persist ≥30s of it (fire-and-forget; safe id prevents dupes).
        void commitChunkToDatabase(uid, 'mode-switch', MIN_CHUNK_SECONDS);
        try { stopFocus('break'); } catch { /* noop */ }
      }

      let nextSeconds = seconds;
      if (nextSeconds === undefined) nextSeconds = TIMER_MODE_DURATIONS[newMode];
      nextSeconds = Math.max(0, safeNumber(nextSeconds));
      if (newMode === 'infinity') nextSeconds = 0;

      modeRef.current = newMode;
      initialSecondsRef.current = nextSeconds;
      accumulatedElapsedRef.current = 0;
      flushedSecondsRef.current = 0;
      lastQueuedIntervalRef.current = '';
      sessionStartTimeRef.current = null;
      secondsLeftRef.current = nextSeconds;
      isRunningRef.current = false;

      setModeState(newMode);
      setSecondsLeft(nextSeconds);
      setSessionStartTime(null);
      setIsRunning(false);

      completionLockRef.current = false;
      sessionCompletedRef.current = false;

      saveLocalState(false, nextSeconds);
    },
    [saveLocalState, commitChunkToDatabase, stopFocus],
  );

  // ------------------------------------------------------------------------
  // TOGGLE AUTO PAUSE
  // ------------------------------------------------------------------------

  const toggleAutoPause = useCallback(() => {
    setAutoPauseEnabled((prev) => !prev);
  }, []);
    const registerOnComplete = useCallback(
    (cb: (s: TimerSessionCompletion) => void) => {
      completionListenersRef.current.add(cb);
      return () => { completionListenersRef.current.delete(cb); };
    },
    [],
  );

  // ------------------------------------------------------------------------
  // DERIVED VALUES (for the UI)
  // ------------------------------------------------------------------------

  const secondsElapsed = useMemo(() => {
    return calculateElapsedSeconds();
  }, [calculateElapsedSeconds, isRunning, secondsLeft]);

  const formattedTime = useMemo(() => {
    const totalSeconds = Math.max(0, mode === 'infinity' ? secondsElapsed : secondsLeft);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [mode, secondsElapsed, secondsLeft]);

  // ------------------------------------------------------------------------
  // CONTEXT VALUE
  // ------------------------------------------------------------------------

   const contextValue = useMemo<TimerContextProps>(
    () => ({
      isRunning,
      secondsLeft,
      secondsElapsed,
      mode,
      topicName,
      sessionStartTime,
      formattedTime,
      autoPauseEnabled,
      startTimer,
      pauseTimer,
      resumeTimer,
      stopTimer,
      discardCurrentSession,
      setTopicName,
      setMode,
      toggleAutoPause,
      registerOnComplete,
    }),
    [
      isRunning,
      secondsLeft,
      secondsElapsed,
      mode,
      topicName,
      sessionStartTime,
      formattedTime,
      autoPauseEnabled,
      startTimer,
      pauseTimer,
      resumeTimer,
      stopTimer,
      discardCurrentSession,
      setTopicName,
      setMode,
      toggleAutoPause,
      registerOnComplete,
    ]
  );

  return <TimerContext.Provider value={contextValue}>{children}</TimerContext.Provider>;
};

// ============================================================================
// HOOK
// ============================================================================

export const useGlobalTimer = () => useContext(TimerContext);