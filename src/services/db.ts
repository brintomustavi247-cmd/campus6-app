/**
 * ============================================================================
 * CAMPUS 6.0 - DATABASE SERVICE (PRODUCTION-READY)
 * ============================================================================
 *
 * ARCHITECTURE:
 * - SINGLE SOURCE OF TRUTH: Supabase `users.total_study_time` (MINUTES)
 * - Truly idempotent session writes (content-derived deterministic IDs)
 * - Atomic increments via RPC `increment_study_time` (+ verified fallback)
 * - Buffered live-flush pipeline so leaderboards converge fast
 * - ONE ranking pipeline: subscribeToLeaderboard delegates to leaderboardSync
 *
 * ============================================================================
 * VERSION 10.1.0 - UUID SCHEMA COMPATIBILITY
 * ============================================================================
 *  FIX #9  UUID coercion        : `study_sessions.id` is UUID-TYPED in the
 *                                 production database. Our deterministic chunk
 *                                 ids ("chunk_…", "sess_…", "pending…") are
 *                                 strings ⇒ EVERY insert failed with
 *                                 "invalid input syntax for type uuid" ⇒
 *                                 totals never incremented (the 0m epidemic).
 *                                 Now: any non-UUID id is deterministically
 *                                 converted to a stable UUID via SHA-256
 *                                 (same input ⇒ same UUID ⇒ identical retry/
 *                                 dedupe semantics as before).
 *  FIX #10 Fallback digest      : crypto.subtle is unavailable on insecure
 *                                 origins (http LAN testing) — a synchronous
 *                                 djb2-expansion fallback keeps determinism.
 *  NOTE #11 created_at/email    : The `users` table MUST have `created_at`
 *                                 (timestamptz) and `email` (text) columns —
 *                                 identity upserts fail without them. Run:
 *                                   alter table public.users add column if not exists created_at timestamptz default now();
 *                                   alter table public.users add column if not exists email text;
 *                                   notify pgrst, 'reload schema';
 *                                 (Already applied — documented for posterity.)
 *  NOTE #12 duration_minutes    : `study_sessions.duration_minutes` MUST be
 *                                 numeric (accepted decimals 5.55 etc.).
 *                                 Integer version rejected every chunk write.
 *                                 (Already applied via view-rebuild migration.)
 *
 * @author CAMPUS 6.0 Team
 * @version 10.1.0
 * ============================================================================
 */

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDoc,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { supabase } from '../supabaseClient';
import { getPresenceChannel } from '../supabaseChannels';
import {
  initializeLeaderboardRealtime,
} from './leaderboardSync';
import { EsportsPlayer } from '../components/squad/EsportsData';

// ============================================================================
// CONFIGURATION FLAGS & CONSTANTS
// ============================================================================

export const FLAGS = {
  /** Mirror session completions + presence into Firestore (legacy views). */
  FIREBASE_STATS_MIRROR: false,
  FIREBASE_PRESENCE_MIRROR: false,
};

/** Hard-pinned app timezone for day bucketing (Fix #6). */
export const APP_TIMEZONE = 'Asia/Dhaka';

/** XP awarded per studied minute (MUST match the SQL RPC — see Fix #5). */
export const XP_PER_MINUTE = 10;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UserDocument {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  target: string;
  district: string;
  division: string;
  xp: number;
  studyTime: number;
  tier: string;
  title: string;
  level: number;
  winRate: string;
}

export interface PresenceDocument {
  uid: string;
  liveStatus: 'offline' | 'focus' | 'break';
  currentTask: string;
  sessionStartTime: number | null;
  lastHeartbeat: any;
}

export interface StudySessionRecord {
  /**
   * Optional. Caller-provided ids (chunk_/sess_/etc.) are accepted in ANY
   * string form — non-UUID values are deterministically coerced to a stable
   * UUID at write time (Fix #9).
   */
  id?: string;
  user_id: string;
  topic_name: string;
  subject?: string;
  /** MINUTES (decimals accepted — DB column is numeric). */
  duration_minutes: number;
  mode?: string;
  date_key?: string;
  /** ISO timestamp. Included in the deterministic ID (second bucket). */
  completed_at?: string;
  created_at?: string;
}

/** Result of a pending-buffer flush attempt. */
export interface FlushResult {
  /** Whole minutes successfully written to the server this call. */
  flushedMinutes: number;
  /** Seconds left buffered (sub-minute remainder, or unflushed on failure). */
  remainingSeconds: number;
}

// ============================================================================
// SECTION 0: TIME HELPERS (TIMEZONE-STABLE — Fix #6)
// ============================================================================

/**
 * YYYY-MM-DD in APP_TIMEZONE, independent of device settings.
 * 'en-CA' locale formats as YYYY-MM-DD natively — no manual padding drift.
 */
function dayKeyForDate(d: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIMEZONE }).format(d);
  } catch {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}

/** Legacy export preserved — timezone-stable. */
export function todayKey(): string {
  return dayKeyForDate();
}

/** Legacy export preserved — timezone-stable. */
export function fmt(d: Date): string {
  return dayKeyForDate(d);
}

// ============================================================================
// SECTION 0.5: DETERMINISTIC SESSION IDS (Fix #1) + UUID COERCION (Fix #9)
// ============================================================================

/**
 * djb2 string hash (stable, dependency-free).
 * Used directly for content ids AND as the insecure-context fallback digest.
 */
function hashDjb2(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

/**
 * ⭐ Content-derived session ID.
 *
 * Same logical session (same user/day/topic/duration/end-second) ALWAYS maps
 * to the same ID ⇒ retries, offline replays, and StrictMode double-invokes
 * collapse onto ONE row via UPSERT-onConflict.
 */
export function computeDeterministicSessionId(
  session: Pick<StudySessionRecord, 'user_id' | 'topic_name' | 'duration_minutes'> & {
    date_key?: string;
    completed_at?: string;
  }
): string {
  const dateKey = session.date_key || todayKey();
  const completedIso = session.completed_at || new Date().toISOString();
  const secondBucket = Math.floor(new Date(completedIso).getTime() / 1000);
  const slug = `${session.user_id}|${dateKey}|${session.topic_name}|${session.duration_minutes}|${secondBucket}`;
  const uidPart = String(session.user_id).replace(/-/g, '').slice(0, 8);
  return `sess_${uidPart}_${dateKey.replace(/-/g, '')}_${hashDjb2(slug)}`;
}

// ---------------------------------------------------------------------------
// UUID COMPATIBILITY LAYER (Fix #9)
// ---------------------------------------------------------------------------

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True when the string is already a valid UUID (pass-through, no coercion). */
export const isUuid = (s: string): boolean => UUID_RE.test(s);

/**
 * ⭐ Deterministic string → UUID.
 *
 * SHA-256 of the input, first 16 bytes formatted as a v5-style UUID.
 * SAME INPUT ALWAYS ⇒ SAME UUID: retrying a failed push targets the exact
 * same row, so count-gating and duplicate-skip semantics are preserved.
 *
 * Insecure contexts (http:// LAN testing) lack crypto.subtle — falls back to
 * a djb2-based expansion. Deterministic on every code path.
 */
export async function toDeterministicUuid(input: string): Promise<string> {
  // Format 16 bytes into canonical UUID string.
  const format = (b: Uint8Array): string => {
    const v = b.slice(0, 16);
    v[6] = (v[6] & 0x0f) | 0x50; // version 5 bits
    v[8] = (v[8] & 0x3f) | 0x80; // RFC-4122 variant bits
    const hex = Array.from(v)
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  };

  // Preferred: SHA-256 (secure contexts — production + localhost).
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
      return format(new Uint8Array(buf));
    } catch { /* fall through to sync fallback */ }
  }

  // Fallback: djb2 expanded to 16 deterministic bytes.
  const bytes = new Uint8Array(16);
  for (let round = 0; round < 4; round++) {
    let h = 5381 + round * 97;
    for (let i = 0; i < input.length; i++) {
      h = ((h << 5) + h + input.charCodeAt(i) + round) | 0;
    }
    const n = h >>> 0;
    bytes[round * 4] = n & 0xff;
    bytes[round * 4 + 1] = (n >>> 8) & 0xff;
    bytes[round * 4 + 2] = (n >>> 16) & 0xff;
    bytes[round * 4 + 3] = (n >>> 24) & 0xff;
  }
  return format(bytes);
}

// ============================================================================
// SECTION 1: FIREBASE LEGACY FUNCTIONS (PRESERVED — mirrors flag-gated)
// ============================================================================

export const syncUserProfile = async (user: UserDocument) => {
  if (!db) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        ...user,
        createdAt: serverTimestamp()
      });
      console.log('✅ [Firebase] Created new user profile');
    } else {
      await updateDoc(userRef, {
        name: user.name,
        avatar: user.avatar,
        target: user.target,
        district: user.district,
        division: user.division,
        updatedAt: serverTimestamp()
      });
      console.log('✅ [Firebase] Updated existing user profile');
    }
  } catch (error) {
    console.warn('⚠️ [Firebase] Profile sync failed:', error);
  }
};

export const updatePresence = async (
  uid: string,
  liveStatus: 'offline' | 'focus' | 'break',
  currentTask: string,
  sessionStartTime: number | null
) => {
  if (!db || !uid) return;

  // ⭐ Supabase presence first — it drives the live UI badges (primary).
  await syncUserPresenceToSupabase(uid, liveStatus, currentTask, sessionStartTime);

  if (!FLAGS.FIREBASE_PRESENCE_MIRROR) return;

  try {
    const presenceRef = doc(db, 'presence', uid);
    await setDoc(presenceRef, {
      uid,
      liveStatus,
      currentTask,
      sessionStartTime,
      lastHeartbeat: serverTimestamp()
    }, { merge: true });

    console.log('✅ [Firebase] Presence mirrored');
  } catch (error) {
    console.warn('⚠️ [Firebase] Presence mirror failed:', error);
  }
};

export const completeStudySession = async (
  uid: string,
  durationMinutes: number,
  taskName: string
) => {
  if (!uid) return;
  if (!durationMinutes || durationMinutes <= 0) {
    console.warn('⚠️ [Session] Ignoring zero/negative duration');
    return;
  }

  // ⭐ PRIMARY: Supabase (idempotent + atomic). Source of truth.
  await pushStudySessionToSupabase({
    user_id: uid,
    topic_name: taskName,
    duration_minutes: durationMinutes,
    completed_at: new Date().toISOString(),
  });

  if (!FLAGS.FIREBASE_STATS_MIRROR || !db) return;

  try {
    const sessionRef = doc(collection(db, 'sessions'));
    await setDoc(sessionRef, {
      uid,
      durationMinutes,
      taskName,
      completedAt: serverTimestamp()
    });

    const xpEarned = durationMinutes * XP_PER_MINUTE;

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      studyTime: increment(durationMinutes),
      xp: increment(xpEarned)
    });

    console.log(`✅ [Firebase] Stats mirrored: ${durationMinutes}min, +${xpEarned}XP`);
  } catch (error) {
    console.error('❌ [Firebase] Stats mirror failed (non-fatal):', error);
  }
};

export const fetchOrInitializeUser = async (user: any) => {
  if (!db) return null;

  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      const newUser = {
        uid: user.uid,
        name: user.displayName || 'Unknown',
        email: user.email || '',
        avatar: user.photoURL || 'U',
        target: 'Top University',
        district: 'Dhaka',
        division: 'Dhaka',
        xp: 0,
        studyTime: 0,
        tier: 'SPARK III',
        title: 'MEMBER',
        level: 1,
        winRate: '0%',
        createdAt: serverTimestamp()
      };
      await setDoc(userRef, newUser);

      // Required regardless of mirrors: the leaderboard reads Supabase.users.
      await createUserInSupabaseIfNotExists({
        id: user.uid,
        full_name: newUser.name,
        avatar_url: user.photoURL || null,
        email: user.email || null,
      });

      return newUser;
    } else {
      const existingData = snap.data() as any;
      const updatedData = {
        ...existingData,
        name: user.displayName || existingData.name,
        avatar: user.photoURL || existingData.avatar,
        updatedAt: serverTimestamp()
      };
      await updateDoc(userRef, {
        name: updatedData.name,
        avatar: updatedData.avatar,
        updatedAt: serverTimestamp()
      });

      await updateUserProfileInSupabase(user.uid, {
        full_name: updatedData.name,
        avatar_url: updatedData.avatar,
      });

      return updatedData;
    }
  } catch (error) {
    console.error('❌ [Firebase] fetchOrInitializeUser failed:', error);
    return null;
  }
};

// ============================================================================
// SECTION 2: SUPABASE — STATS CORE (atomic + count-gated + self-healing)
// ============================================================================

/* ============================================================================
 * REQUIRED SQL — the RPC used by commitMinutesAtomically (UPSERT form so it
 * can never silently no-op on a missing row):
 *
 *   create or replace function public.increment_study_time(
 *     user_id_input uuid,
 *     minutes_input numeric
 *   )
 *   returns void
 *   language sql
 *   security definer
 *   set search_path = public
 *   as $$  *     insert into public.users (id, total_study_time, xp, updated_at)
 *     values (user_id_input, minutes_input, round(minutes_input * 10), now())
 *     on conflict (id) do update
 *       set total_study_time = greatest(0, public.users.total_study_time + excluded.total_study_time),
 *           xp = public.users.xp + excluded.xp,
 *           updated_at = now();
 *   $$;
 *
 *   grant execute on function public.increment_study_time(uuid, numeric)
 *     to authenticated, anon;
 * ========================================================================== */

/**
 * Core atomic stat writer shared by session pushes AND live flushes.
 *
 * Path A: RPC `increment_study_time` (atomic, creates row if missing).
 * Path B (RPC unavailable): fetch-current → update. Failures SELF-HEAL via
 * the pending buffer (Fix #4).
 */
const commitMinutesAtomically = async (
  userId: string,
  minutes: number
): Promise<boolean> => {
  if (!userId || minutes <= 0) return false;

  // --- Path A: atomic RPC ---------------------------------------------------
  const { error: rpcError } = await supabase.rpc('increment_study_time', {
    user_id_input: userId,
    minutes_input: minutes,
  });

  if (!rpcError) return true;

  console.warn('⚠️ [Supabase] RPC unavailable, using fallback:', rpcError.message);

  // --- Path B: fetch-then-update fallback -----------------------------------
  try {
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('total_study_time, xp')
      .eq('id', userId)
      .single();

    if (fetchError || !currentUser) {
      console.error('❌ [Fallback] Could not read current stats:', fetchError?.message);
      return false; // caller re-buffers → auto-retry
    }

    const newXp = (currentUser.xp || 0) + minutes * XP_PER_MINUTE; // Fix #5 parity
    const nowIso = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('users')
      .update({
        total_study_time: Math.max(0, (currentUser.total_study_time || 0) + minutes),
        xp: newXp,
        last_session_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ [Fallback] Stats update failed:', updateError.message);
      return false; // caller re-buffers → auto-retry
    }

    return true;
  } catch (err) {
    console.error('❌ [Fallback] Exception:', err);
    return false;
  }
};

/* ---------------------------------------------------------------------------
 * PENDING BUFFER (localStorage-backed, crash-safe)
 * ------------------------------------------------------------------------- */

const pendingKey = (userId: string) => `campus6_pending_secs_${userId}`;

const readPendingSeconds = (userId: string): number => {
  try {
    return Math.max(0, Number(localStorage.getItem(pendingKey(userId)) || 0)) || 0;
  } catch {
    return 0;
  }
};

const writePendingSeconds = (userId: string, secs: number): void => {
  try {
    localStorage.setItem(pendingKey(userId), String(Math.max(0, secs)));
  } catch { /* storage unavailable — degrade to memory-only */ }
};

/** Append failed minutes back so the next flush repairs totals (Fix #4). */
const requeueFailedMinutes = (userId: string, minutes: number): void => {
  if (minutes > 0) {
    writePendingSeconds(userId, readPendingSeconds(userId) + minutes * 60);
  }
};

/** Call from TimerContext EVERY tick. Cheap — localStorage only. */
export const recordTimerTick = (userId: string, seconds: number): void => {
  if (!userId || seconds <= 0) return;
  writePendingSeconds(userId, readPendingSeconds(userId) + seconds);
};

/**
 * Drain the buffer. Call every ~15s while running + on pause/stop/complete +
 * pagehide. Only WHOLE minutes leave; remainder persists. Failures re-buffer.
 */
export const flushPendingStudySeconds = async (
  userId: string
): Promise<FlushResult> => {
  let remaining = readPendingSeconds(userId);

  const wholeMinutes = Math.floor(remaining / 60);
  if (!userId || wholeMinutes < 1) {
    return { flushedMinutes: 0, remainingSeconds: remaining };
  }

  remaining -= wholeMinutes * 60; // reserve remainder BEFORE network

  const ok = await commitMinutesAtomically(userId, wholeMinutes);

  if (ok) {
    writePendingSeconds(userId, remaining);
    return { flushedMinutes: wholeMinutes, remainingSeconds: remaining };
  }

  writePendingSeconds(userId, remaining + wholeMinutes * 60);
  return { flushedMinutes: 0, remainingSeconds: remaining + wholeMinutes * 60 };
};

/** Fire-and-forget flush for pagehide/beforeunload. */
export const flushPendingStudySecondsNow = (userId: string): void => {
  flushPendingStudySeconds(userId).catch(() => {});
};

// ============================================================================
// SECTION 2.1: SUPABASE — SESSION WRITES (TRULY IDEMPOTENT — Fixes #1/#2/#9)
// ============================================================================

/**
 * ⭐ CORE: Push Study Session to Supabase (idempotent + count-gated + UUID-safe)
 *
 * Pipeline:
 *  1. Resolve session id: caller-provided ⊕ content-derived deterministic.
 *  2. ⭐ UUID COERCION (Fix #9): if the id is not already a UUID (e.g.
 *     "chunk_…"), convert deterministically — study_sessions.id is a UUID
 *     column; this was the root cause of every write failing with 400.
 *  3. UPSERT onConflict(id), ignoreDuplicates, count:'exact'.
 *  4. GATE: totals increment ONLY when count > 0 (fresh insert).
 *  5. Increment failure ≠ data loss: minutes re-buffer → healed next flush.
 */
export const pushStudySessionToSupabase = async (
  session: StudySessionRecord
): Promise<boolean> => {

  if (!session.user_id || !session.topic_name) {
    console.warn('⚠️ [Supabase] Missing required fields for study session');
    return false;
  }
  if (!(session.duration_minutes > 0)) {
    console.warn('⚠️ [Supabase] Non-positive duration — skipping');
    return false;
  }

  // STEP 0: resolve + coerce the id to the DB's UUID column type.
  let resolvedId = session.id || computeDeterministicSessionId(session);
  if (!isUuid(resolvedId)) {
    resolvedId = await toDeterministicUuid(resolvedId);
  }

  const dateKey = session.date_key || todayKey();

  try {
    console.log(`🚀 [Supabase] Pushing session: ${session.duration_minutes}min (id: ${resolvedId.slice(0, 34)}…)`);

    // STEP 1: Idempotent INSERT — count tells us if THIS call did the work.
    const { error: insertError, count } = await supabase
      .from('study_sessions')
      .upsert(
        {
          id: resolvedId,
          user_id: session.user_id,
          topic_name: session.topic_name,
          subject: session.subject || null,
          duration_minutes: session.duration_minutes,
          mode: session.mode || null,
          date_key: dateKey,
          completed_at: session.completed_at || new Date().toISOString(),
        },
        {
          onConflict: 'id',
          ignoreDuplicates: true,
          count: 'exact',          // ⭐ Fix #2: enables the gate below
        }
      );

    if (insertError) {
      console.error('❌ [Supabase] Session insert failed:', insertError.message);
      return false;
    }

    const wasFreshInsert = (count ?? 0) > 0;

    if (!wasFreshInsert) {
      // Duplicate (retry / StrictMode replay): row already counted. STOP HERE.
      console.log('✅ [Supabase] Duplicate session detected — increments correctly skipped');
      return true;
    }

    // STEP 2: increment ONLY for fresh inserts (Fix #2 gate).
    const incremented = await commitMinutesAtomically(
      session.user_id,
      session.duration_minutes
    );

    if (!incremented) {
      // Session row persisted; keep totals truthful via the healing buffer.
      requeueFailedMinutes(session.user_id, session.duration_minutes);
      console.warn(`⚠️ [Supabase] Stats increment deferred (${session.duration_minutes}min re-buffered)`);
      return true;
    }

    console.log(`✅ [Supabase] Session recorded atomically: +${session.duration_minutes}min`);
    return true;

  } catch (error) {
    console.error('❌ [Supabase] Exception in pushStudySessionToSupabase:', error);
    return false;
  }
};

/** Manual adjustment (admin tools, etc.). Increments only. */
export const updateUserStudyTimeInSupabase = async (
  userId: string,
  additionalMinutes: number
): Promise<boolean> => {
  if (!userId || additionalMinutes <= 0) return false;
  return commitMinutesAtomically(userId, additionalMinutes);
};

/**
 * Ensure a user row exists in public.users.
 * NOTE: never zeroes existing stats — ignoreDuplicates skips when present.
 * REQUIRES `users.created_at` + `users.email` columns to exist (Fix #10 note).
 */
export const createUserInSupabaseIfNotExists = async (
  userData: {
    id: string;
    full_name?: string;
    avatar_url?: string | null;
    email?: string | null;
  }
): Promise<boolean> => {

  try {
    const { error } = await supabase.from('users').upsert({
      id: userData.id,
      email: userData.email || null,
      full_name: userData.full_name || null,
      avatar_url: userData.avatar_url || null,
      total_study_time: 0,
      xp: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id',
      ignoreDuplicates: true,
    });

    if (error) {
      console.warn('⚠️ Failed to create user:', error.message);
      return false;
    }

    console.log('✅ [Supabase] User ensured in database:', userData.id);
    return true;

  } catch (error) {
    console.error('❌ createUserInSupabaseIfNotExists failed:', error);
    return false;
  }
};

export const updateUserProfileInSupabase = async (
  userId: string,
  updates: {
    full_name?: string;
    avatar_url?: string | null;
    target_university?: string;
    academic_group?: string;
  }
): Promise<boolean> => {

  try {
    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.warn('⚠️ Failed to update profile:', error.message);
      return false;
    }

    console.log('✅ [Supabase] Profile updated:', userId);
    return true;

  } catch (error) {
    console.error('❌ updateUserProfileInSupabase failed:', error);
    return false;
  }
};

/**
 * Sync presence to Supabase Realtime channel.
 * PRESENCE NEVER TOUCHES SCORES — badges/status only (consistency contract).
 */
export const syncUserPresenceToSupabase = async (
  userId: string,
  status: 'online' | 'focus' | 'break' | 'offline',
  currentTask: string = '',
  sessionStartTime: number | null = null,
  extra?: { accumulatedSeconds?: number }
): Promise<void> => {

  if (!userId) return;

  try {
    const channel = getPresenceChannel();

    await channel.track({
      userId: userId,
      status: status,
      topic: currentTask || undefined,
      start_time: status === 'focus' ? sessionStartTime ?? Date.now() : null,
      accumulated_seconds: extra?.accumulatedSeconds ?? 0,
      timestamp: Date.now(),
    });

    console.log(`📍 [Supabase] Presence synced: ${userId} → ${status}`);

  } catch (error) {
    console.warn('⚠️ Failed to sync presence:', error);
  }
};

// ============================================================================
// SECTION 3: LEADERBOARD SUBSCRIPTION — DELEGATES TO THE SINGLE PIPELINE
// ============================================================================

/**
 * Subscribe to live leaderboard updates.
 * Thin wrapper around initializeLeaderboardRealtime() — one fetch, one merge,
 * one canonical sort (studyTime DESC → xp DESC → id ASC), one rank assignment,
 * everywhere (Fix #3).
 */
export const subscribeToLeaderboard = (
  callback: (players: EsportsPlayer[]) => void,
  currentUserId?: string,
  currentTimerState?: {
    isRunning: boolean;
    secondsElapsed: number;
    topicName: string;
  }
): (() => void) => {

  const handle = initializeLeaderboardRealtime({
    currentUserId: currentUserId ?? null,
    onPlayersUpdate: callback,
    localTimerState: currentTimerState ?? null,
    showOwnLiveTime: !!currentTimerState?.isRunning,
  });

  return () => {
    handle.destroy();
    console.log('🧹 [Leaderboard] Unsubscribed');
  };
};

// ============================================================================
// SECTION 4: UTILITY FUNCTIONS
// ============================================================================

export const fetchUserLeaderboardData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('⚠️ Failed to fetch user data:', error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ fetchUserLeaderboardData failed:', error);
    return null;
  }
};

export const fetchTopUsersByStudyTime = async (limit: number = 10) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, avatar_url, total_study_time, xp, current_rank')
      .order('total_study_time', { ascending: false })
      .order('xp', { ascending: false })
      .order('id', { ascending: true })
      .limit(limit);

    if (error) {
      console.warn('⚠️ Failed to fetch top users:', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ fetchTopUsersByStudyTime failed:', error);
    return [];
  }
};

/** Canonical-pipeline rank (matches the visible board exactly). */
export const getUserRank = async (userId: string): Promise<number | null> => {
  try {
    const { getUserRankPosition } = await import('./leaderboardSync');
    return await getUserRankPosition(userId);
  } catch (error) {
    console.error('❌ getUserRank failed:', error);
    return null;
  }
};

export const batchSyncSessionsToSupabase = async (
  sessions: StudySessionRecord[]
): Promise<number> => {

  let successCount = 0;

  for (const session of sessions) {
    const success = await pushStudySessionToSupabase(session);
    if (success) successCount++;

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (successCount > 0) {
    console.log(`✅ [Batch Sync] Synced ${successCount}/${sessions.length} sessions`);
  }

  return successCount;
};

// ============================================================================
// SECTION 5: STUDY HISTORY AGGREGATION
// ============================================================================

export interface DailyTotal {
  dateKey: string;
  totalMinutes: number;
  sessionCount: number;
}

export const getStudyTotalsByDateRange = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyTotal[]> => {
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('date_key, duration_minutes')
      .eq('user_id', userId)
      .gte('date_key', startDate)
      .lte('date_key', endDate);

    if (error) throw error;

    const map = new Map<string, { minutes: number; count: number }>();
    (data || []).forEach((row: any) => {
      const key = row.date_key;
      if (!key) return;
      const existing = map.get(key) || { minutes: 0, count: 0 };
      existing.minutes += Number(row.duration_minutes || 0);
      existing.count += 1;
      map.set(key, existing);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, v]) => ({
        dateKey,
        totalMinutes: Math.round(v.minutes * 100) / 100,
        sessionCount: v.count,
      }));
  } catch (error) {
    console.error('❌ getStudyTotalsByDateRange failed:', error);
    return [];
  }
};

export const getLast7DaysTotals = async (userId: string): Promise<DailyTotal[]> => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  return getStudyTotalsByDateRange(userId, fmt(start), fmt(end));
};

export const getLast30DaysTotals = async (userId: string): Promise<DailyTotal[]> => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return getStudyTotalsByDateRange(userId, fmt(start), fmt(end));
};

export const getLifetimeTotalFromSessions = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('duration_minutes')
      .eq('user_id', userId);
    if (error) throw error;
    const sum = (data || []).reduce((acc, r: any) => acc + Number(r.duration_minutes || 0), 0);
    return Math.round(sum * 100) / 100;
  } catch (error) {
    console.error('❌ getLifetimeTotalFromSessions failed:', error);
    return 0;
  }
};

export const getSessionsForDate = async (
  userId: string,
  dateKey: string
): Promise<{ id: string; topic: string; minutes: number; completedAt: string }[]> => {
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('id, topic_name, duration_minutes, completed_at')
      .eq('user_id', userId)
      .eq('date_key', dateKey)
      .order('completed_at', { ascending: true });
    if (error) throw error;
    return (data || []).map((r: any) => ({
      id: r.id,
      topic: r.topic_name || 'Study',
      minutes: Number(r.duration_minutes || 0),
      completedAt: r.completed_at,
    }));
  } catch (error) {
    console.error('❌ getSessionsForDate failed:', error);
    return [];
  }
};

// ============================================================================
// EXPORT SUMMARY (v10.1)
// ============================================================================
//
// ALL legacy exports preserved, signatures unchanged.
//
// NEW in v10.1:
//   isUuid(s)                          — UUID shape check
//   toDeterministicUuid(s)             — stable string→UUID (SHA-256 + fallback)
//
// WRITE-MODEL REMINDER: TimerContext (v7) uses the CHUNK pipeline
// (pushStudySessionToSupabase). Do NOT additionally wire recordTimerTick /
// flushPendingStudySeconds into it — both paths increment totals; using both
// double-counts. The buffer API stays exported for standalone tools only.
//
// DB CONTRACT (already applied in production, kept here as the record):
//   study_sessions.id               uuid         (coerced client-side)
//   study_sessions.duration_minutes numeric      (decimal minutes OK)
//   users.created_at / users.email  must exist   (identity upsert)
//   RPC increment_study_time        upsert-form  (can't silently no-op)
// ============================================================================