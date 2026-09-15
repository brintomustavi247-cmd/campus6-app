import { 
  UserProfile, 
  DailyProgress, 
  CustomTask, 
  TimerSession, 
  SubjectStat, 
  FriendUser 
} from '../types';
import { getRoutineForDate, MASTER_ROUTINE_MAP } from '../data/routineData';
import { generateDefaultChecklist } from './checklistGenerator';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

/** Demo avatar pool - local imported avatars */
const DEMO_AVATARS = Array.from({ length: 18 }, (_, i) => `/avatars/avatar-${i + 1}.png`);

const STORAGE_KEYS = {
  USER_PROFILE: 'campus6_user_profile',
  DAILY_PROGRESS_PREFIX: 'campus6_progress_',
  TIMER_SESSIONS: 'campus6_timer_sessions',
  CUSTOM_TASKS_PREFIX: 'campus6_tasks_',
  SUBJECT_STATS: 'campus6_subject_stats',
  FRIENDS: 'campus6_friends',
  PENDING_SYNC: 'campus6_pending_sync'
};

export const DEFAULT_DEMO_USER: UserProfile = {
  uid: '',
  displayName: 'Student',
  nickname: 'Student',
  email: '',
  photoURL: DEMO_AVATARS[0],
  avatar_url: DEMO_AVATARS[0],
  academicGroup: 'Science',
  targetUniversity: '',
  dailyStudyTargetHours: 8,
  preferredLanguage: 'bn',
  theme: 'dark',
  reminderEnabled: true,
  startModeRequired: true,
  showReligiousReminders: true,
  showLeaderboard: true,
  soundEnabled: true,
  friendCode: 'CAMPUS-7R2K9',
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
  isDemo: true,
  isOnboarded: false
};

// Default Subject Stats Seeder
export const DEFAULT_SUBJECT_STATS: SubjectStat[] = [
  {
    subject: 'Physics',
    totalRoutineTopics: 18,
    completedTopicsCount: 12,
    mcqsSolved: 140,
    studyHours: 24,
    weakTopics: ['ভেক্টর নদী-নৌকা টাইপ ৩', 'নিউটনীয় বলবিদ্যা জড়তার ভ্রামক'],
    topics: []
  },
  {
    subject: 'Chemistry',
    totalRoutineTopics: 16,
    completedTopicsCount: 10,
    mcqsSolved: 120,
    studyHours: 20,
    weakTopics: ['পরিমাণগত রসায়ন ঘনমাত্রা হিসাব'],
    topics: []
  },
  {
    subject: 'Higher Mathematics',
    totalRoutineTopics: 15,
    completedTopicsCount: 9,
    mcqsSolved: 110,
    studyHours: 18,
    weakTopics: ['জটিল সংখ্যা সঞ্চারপথ', 'কনিক উপবৃত্ত'],
    topics: []
  },
  {
    subject: 'Biology',
    totalRoutineTopics: 12,
    completedTopicsCount: 7,
    mcqsSolved: 95,
    studyHours: 14,
    weakTopics: ['কোষ সৃষ্টি সাইকেল'],
    topics: []
  },
  {
    subject: 'English',
    totalRoutineTopics: 10,
    completedTopicsCount: 8,
    mcqsSolved: 80,
    studyHours: 10,
    weakTopics: ['Subject Verb Agreement'],
    topics: []
  }
];

// Default Friends Seeder
export const DEFAULT_FRIENDS: FriendUser[] = [
  {
    friendCode: 'CAMPUS-BUET-01',
    displayName: 'Tanvir Hossain',
    nickname: 'Tanvir',
    targetUniversity: 'BUET CSE',
    streakCount: 8,
    weeklyCompletionPercent: 92,
    totalStudyHours: 48,
    photoURL: DEMO_AVATARS[1],
    lastActive: new Date().toISOString()
  },
  {
    friendCode: 'CAMPUS-DMC-02',
    displayName: 'Anika Tabassum',
    nickname: 'Anika',
    targetUniversity: 'Dhaka Medical College',
    streakCount: 6,
    weeklyCompletionPercent: 85,
    totalStudyHours: 40,
    photoURL: DEMO_AVATARS[2],
    lastActive: new Date().toISOString()
  },
  {
    friendCode: 'CAMPUS-DU-03',
    displayName: 'Arafat Rahman',
    nickname: 'Arafat',
    targetUniversity: 'DU Physics',
    streakCount: 4,
    weeklyCompletionPercent: 78,
    totalStudyHours: 35,
    photoURL: DEMO_AVATARS[3],
    lastActive: new Date().toISOString()
  }
];

// -------------------------------------------------------------
// USER PROFILE METHODS
// -------------------------------------------------------------
export function getLocalUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local profile', e);
  }
  return DEFAULT_DEMO_USER;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  
  if (db && auth?.currentUser && !profile.isDemo) {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        ...profile,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore user profile update skipped/failed', e);
      addPendingSync('profile', profile);
    }
  }
}

export function saveLocalOnlyUserProfile(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
}

export const saveLocalUserProfile = saveUserProfile;

// -------------------------------------------------------------
// DAILY PROGRESS METHODS
// -------------------------------------------------------------

// Fast read-only version that DOES NOT write to localStorage or trigger cloud sync
export function getDailyProgressReadOnly(dateKey: string): DailyProgress {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.DAILY_PROGRESS_PREFIX}${dateKey}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading progress for ${dateKey}`, e);
  }

  // Generate initial progress in memory without writing to disk
  const routine = getRoutineForDate(dateKey);
  const checklist = generateDefaultChecklist(routine);
  
  return {
    dateKey,
    checklist,
    customTasks: [],
    completedCount: 0,
    totalCount: checklist.length,
    completionPercent: 0,
    studyHours: 0,
    focusRating: 8,
    notes: '',
    updatedAt: new Date().toISOString()
  };
}

export function getLocalDailyProgress(dateKey: string): DailyProgress {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.DAILY_PROGRESS_PREFIX}${dateKey}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading progress for ${dateKey}`, e);
  }

  // Generate initial progress and persist once for active view
  const initial = getDailyProgressReadOnly(dateKey);
  saveLocalDailyProgress(initial);
  return initial;
}

let streakCache: { todayDateKey: string; result: StreakResult } | null = null;

export function invalidateStreakCache(): void {
  streakCache = null;
}

export function saveLocalOnlyDailyProgress(progress: DailyProgress): void {
  invalidateStreakCache();
  localStorage.setItem(
    `${STORAGE_KEYS.DAILY_PROGRESS_PREFIX}${progress.dateKey}`,
    JSON.stringify(progress)
  );
}

export function saveLocalDailyProgress(progress: DailyProgress): void {
  invalidateStreakCache();
  // Re-calculate statistics
  const completedChecklist = progress.checklist.filter(i => i.completed).length;
  const completedCustom = (progress.customTasks || []).filter(t => t.completed).length;
  const totalChecklist = progress.checklist.length;
  const totalCustom = (progress.customTasks || []).length;

  const totalCount = totalChecklist + totalCustom;
  const completedCount = completedChecklist + completedCustom;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const updatedProgress: DailyProgress = {
    ...progress,
    completedCount,
    totalCount,
    completionPercent,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(
    `${STORAGE_KEYS.DAILY_PROGRESS_PREFIX}${progress.dateKey}`,
    JSON.stringify(updatedProgress)
  );

  syncProgressToCloud(updatedProgress);
}

export async function syncProgressToCloud(progress: DailyProgress): Promise<void> {
  const profile = getLocalUserProfile();
  if (db && auth?.currentUser && !profile.isDemo) {
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid, 'dailyProgress', progress.dateKey);
      setDoc(docRef, {
        dateKey: progress.dateKey,
        checklist: progress.checklist,
        customTasks: progress.customTasks || [],
        completedCount: progress.completedCount,
        totalCount: progress.totalCount,
        completionPercent: progress.completionPercent,
        studyHours: progress.studyHours,
        focusRating: progress.focusRating,
        notes: progress.notes || '',
        updatedAt: progress.updatedAt
      }, { merge: true }).catch(() => {
        addPendingSync(`progress_${progress.dateKey}`, progress);
      });
    } catch (e) {
      addPendingSync(`progress_${progress.dateKey}`, progress);
    }
  }
}

// -------------------------------------------------------------
// STREAK CALCULATOR ENGINE (10 MIN THRESHOLD)
// -------------------------------------------------------------
//
// ⭐ NEW RULES:
// 1. কোনো দিনে কমপক্ষে ১০ মিনিট পড়াশোনা করলে সেই দিন "active" গণ্য
// 2. Streak = continuous active days (আজ থেকে পিছনের দিকে যত দিন ১০+ মিনিট)
// 3. আজ যদি এখনো ১০ মিনিট না পড়েন → yesterday পর্যন্ত streak গণনা হবে
// 4. কোনো gap (দিন ১০ মিনিটের নিচে) → streak = 0 থেকে restart
//
// DATA SOURCES (union of both):
//   • dailyProgress store (studyHours × 60 = minutes)
//   • timerSessions (durationMinutes directly)
//
// ⚠️ TimerContext (v7 Single Writer) সব actual study time timerSessions-এ
//    save করে, তাই সেটা বেশি accurate। Daily progress শুধু supplementary।
//
// Returns: { currentStreak, bestStreak, daysAbove70Count }
//          StreakCard component-এর সাথে compatible রাখতে interface একই।
// -------------------------------------------------------------

const MIN_STUDY_THRESHOLD = 10; // ⭐ ১০ মিনিট

export interface StreakResult {
  currentStreak: number;
  bestStreak: number;
  daysAbove70Count: number; // now = total "active" days (10+ min)
}

export function calculateStreak(todayDateKey: string): StreakResult {
  if (streakCache && streakCache.todayDateKey === todayDateKey) {
    return streakCache.result;
  }

  // ─── STEP 1: Build minutesByDay map from BOTH sources ───
  const minutesByDay: Record<string, number> = {};

  // Source A: daily progress (studyHours × 60)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEYS.DAILY_PROGRESS_PREFIX)) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const p = JSON.parse(raw);
        const dKey = key.replace(STORAGE_KEYS.DAILY_PROGRESS_PREFIX, '');
        const hours = Number(p?.studyHours || 0);
        minutesByDay[dKey] = (minutesByDay[dKey] || 0) + hours * 60;
      } catch {
        /* skip corrupted */
      }
    }
  }

  // Source B: timer sessions (durationMinutes directly — more accurate)
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TIMER_SESSIONS);
    if (raw) {
      const sessions = JSON.parse(raw) as TimerSession[];
      sessions.forEach((s) => {
        if (s?.dateKey && typeof s.durationMinutes === 'number') {
          minutesByDay[s.dateKey] = (minutesByDay[s.dateKey] || 0) + s.durationMinutes;
        }
      });
    }
  } catch {
    /* skip corrupted */
  }

  // ─── STEP 2: Walk backwards from today, counting continuous active days ───
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  let activeDaysCount = 0;

  const d = new Date(`${todayDateKey}T00:00:00`);
  const maxSearchDays = 365;

  for (let i = 0; i < maxSearchDays; i++) {
    const dayKey = d.toISOString().split('T')[0];

    // Hard stop before baseline date
    if (dayKey < '2026-08-01') break;

    const mins = minutesByDay[dayKey] || 0;
    const isActive = mins >= MIN_STUDY_THRESHOLD;

    if (isActive) {
      activeDaysCount++;
      tempStreak++;
      currentStreak = tempStreak;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    } else {
      // Gap found — stop counting current streak
      // (but keep bestStreak as the historical max)
      if (i === 0) {
        // আজ এখনো ১০ মিনিট হয়নি — আজকে skip করে yesterday থেকে শুরু
        tempStreak = 0;
        currentStreak = 0;
        d.setDate(d.getDate() - 1);
        continue;
      }
      break;
    }

    d.setDate(d.getDate() - 1);
  }

  const result: StreakResult = {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    daysAbove70Count: activeDaysCount, // reused field = total active days
  };

  streakCache = { todayDateKey, result };
  return result;
}

// -------------------------------------------------------------
// TIMER SESSIONS
// -------------------------------------------------------------
export function getTimerSessions(): TimerSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TIMER_SESSIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading timer sessions', e);
  }
  return [];
}

export const getLocalTimerSessions = getTimerSessions;

export function saveTimerSession(session: TimerSession): void {
  const sessions = getTimerSessions();
  sessions.unshift(session);
  localStorage.setItem(STORAGE_KEYS.TIMER_SESSIONS, JSON.stringify(sessions));

  // Sync to firestore if logged in
  const profile = getLocalUserProfile();
  if (db && auth?.currentUser && !profile.isDemo) {
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid, 'timerSessions', session.id);
      setDoc(docRef, session, { merge: true });
    } catch (e) {
      console.warn('Failed syncing timer session', e);
    }
  }
}

export const saveLocalTimerSession = saveTimerSession;

// -------------------------------------------------------------
// SUBJECT STATS METHODS
// -------------------------------------------------------------
export function getLocalSubjectStats(): SubjectStat[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECT_STATS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading subject stats', e);
  }
  return DEFAULT_SUBJECT_STATS;
}

export function saveLocalSubjectStat(updatedStat: SubjectStat): void {
  const stats = getLocalSubjectStats();
  const index = stats.findIndex(s => s.subject === updatedStat.subject);
  if (index >= 0) {
    stats[index] = updatedStat;
  } else {
    stats.push(updatedStat);
  }
  localStorage.setItem(STORAGE_KEYS.SUBJECT_STATS, JSON.stringify(stats));
}

// -------------------------------------------------------------
// FRIENDS METHODS
// -------------------------------------------------------------
export function getLocalFriends(): FriendUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FRIENDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading friends', e);
  }
  return DEFAULT_FRIENDS;
}

export function addLocalFriend(code: string): { success: boolean; message?: string } {
  const friends = getLocalFriends();
  if (friends.some(f => f.friendCode === code)) {
    return { success: false, message: 'এই বন্ধু ইতোমধ্যেই যুক্ত আছে।' };
  }

  const newFriend: FriendUser = {
    friendCode: code,
    displayName: `Friend (${code.slice(-4)})`,
    nickname: `Friend ${code.slice(-4)}`,
    targetUniversity: 'Admission Candidate',
    streakCount: Math.floor(Math.random() * 10) + 1,
    weeklyCompletionPercent: Math.floor(Math.random() * 30) + 65,
    totalStudyHours: Math.floor(Math.random() * 20) + 25,
    lastActive: new Date().toISOString()
  };

  friends.push(newFriend);
  localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends));
  return { success: true };
}

export function removeLocalFriend(code: string): void {
  const friends = getLocalFriends().filter(f => f.friendCode !== code);
  localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends));
}

// -------------------------------------------------------------
// OFFLINE QUEUE / SYNC HELPERS
// -------------------------------------------------------------
function addPendingSync(key: string, data: any): void {
  try {
    const queue = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_SYNC) || '{}');
    queue[key] = { data, timestamp: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to add pending sync', e);
  }
}

export async function flushPendingSyncs(): Promise<number> {
  if (!db || !auth?.currentUser) return 0;
  
  let syncedCount = 0;
  try {
    const queue = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_SYNC) || '{}');
    const keys = Object.keys(queue);
    
    for (const key of keys) {
      const item = queue[key];
      if (key.startsWith('progress_')) {
        const dKey = key.replace('progress_', '');
        const docRef = doc(db, 'users', auth.currentUser.uid, 'dailyProgress', dKey);
        await setDoc(docRef, item.data, { merge: true });
        syncedCount++;
      } else if (key === 'profile') {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, item.data, { merge: true });
        syncedCount++;
      }
      delete queue[key];
    }
    
    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(queue));
  } catch (e) {
    console.error('Error syncing pending offline changes', e);
  }

  return syncedCount;
}

// -------------------------------------------------------------
// DEMO DATA SEEDER
// -------------------------------------------------------------
export function seedDemoData(): void {
  const demoProfile: UserProfile = {
    ...DEFAULT_DEMO_USER,
    photoURL: DEMO_AVATARS[0],
    avatar_url: DEMO_AVATARS[0],
    defaultAvatarId: 'av1',
    useGooglePhoto: false,
  };
  saveUserProfile(demoProfile);
  localStorage.setItem(STORAGE_KEYS.SUBJECT_STATS, JSON.stringify(DEFAULT_SUBJECT_STATS));
  localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(DEFAULT_FRIENDS));

  const sampleDates = ['2026-08-21', '2026-08-22', '2026-08-23', '2026-08-24'];
  
  sampleDates.forEach((dKey, idx) => {
    const p = getLocalDailyProgress(dKey);
    p.checklist = p.checklist.map((item, i) => ({
      ...item,
      completed: i < p.checklist.length - 2,
      completedAt: new Date().toISOString()
    }));
    p.studyHours = 6 + idx;
    p.focusRating = 9;
    p.notes = `Great productivity today! Covered key formulas for ${p.dateKey}.`;
    saveLocalDailyProgress(p);
  });

  const sampleTimer: TimerSession = {
    id: 'demo_timer_1',
    dateKey: '2026-08-24',
    topicName: 'পরিমাণগত রসায়ন-২',
    subject: 'Chemistry',
    durationMinutes: 25,
    mode: '25min',
    completedAt: new Date().toISOString()
  };
  saveTimerSession(sampleTimer);
}

// ── CLOUD-AWARE CLEAR ───────────────────────────────────────────────────
// • Preserves Supabase auth (`sb-*`) so the user stays logged in after a
//   local clear and cloud data can be restored immediately.
// • After wiping local cache, fires `campus6:storage-cleared` so the app can
//   trigger a Supabase re-hydration (sessions + daily progress stay listed).
export function clearAllLocalData(): void {
  const preserveExact = new Set<string>([
    STORAGE_KEYS.USER_PROFILE,
    'campus6_language',
    'campus6_active_page',
  ]);
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    // Keep Supabase auth so user stays logged in; keep identity so rehydrate has uid
    if (k.startsWith('sb-') || k.startsWith('supabase')) continue;
    if (preserveExact.has(k)) continue;
    toRemove.push(k);
  }
  toRemove.forEach(k => localStorage.removeItem(k));
  try { window.dispatchEvent(new CustomEvent('campus6:storage-cleared')); } catch {}
}

// ── CLOUD RE-HYDRATION ──────────────────────────────────────────────────
// Rebuilds local timer sessions + daily progress studyHours from the cloud
// `study_sessions` personal storage so that after a local clear the account
// still shows todays + historical sessions (per-day list) without going to 0.
// Leaderboard already reads `users.total_study_time` (live) — this makes the
// personal dashboards/weekly view consistent with it.
export async function rehydrateFromSupabase(userId: string): Promise<number> {
  if (!userId) return 0;
  try {
    const { supabase } = await import('../supabaseClient');
    const { data, error } = await supabase
      .from('study_sessions')
      .select('id, user_id, topic_name, subject, duration_minutes, mode, date_key, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(300);
    if (error || !data || data.length === 0) return 0;

    // Map cloud rows → TimerSession shape
    const sessions = (data as any[]).map(row => ({
      id: row.id as string,
      dateKey: (row.date_key as string) || (row.completed_at ? String(row.completed_at).slice(0, 10) : new Date().toISOString().slice(0, 10)),
      topicName: (row.topic_name as string) || 'Study',
      subject: (row.subject as any) || 'Physics',
      durationMinutes: Number(row.duration_minutes) || 0,
      mode: (row.mode as any) || '25min',
      completedAt: (row.completed_at as string) || new Date().toISOString(),
    })) as TimerSession[];

    // Persist back to local so all existing views (Dashboard, Weekly, Focus log)
    // read the same source without needing rewrites.
    localStorage.setItem(STORAGE_KEYS.TIMER_SESSIONS, JSON.stringify(sessions));

    // Rebuild per-day studyHours (cloud sum per date_key) and patch dailyProgress
    const byDate: Record<string, number> = {};
    sessions.forEach(s => { byDate[s.dateKey] = (byDate[s.dateKey] || 0) + (s.durationMinutes || 0); });
    Object.entries(byDate).forEach(([dateKey, mins]) => {
      // Use read-only to not auto-zero, then patch hours if cloud has more
      const existing = getDailyProgressReadOnly(dateKey);
      const cloudHours = parseFloat((mins / 60).toFixed(2));
      // Take the max so we never shrink a locally-added but not-yet-synced entry
      const targetHours = Math.max(Number(existing.studyHours) || 0, cloudHours);
      if (targetHours !== existing.studyHours) {
        saveLocalOnlyDailyProgress({ ...existing, studyHours: targetHours, updatedAt: new Date().toISOString() });
      }
    });

    invalidateStreakCache();
    try { window.dispatchEvent(new CustomEvent('campus6:rehydrated', { detail: { count: sessions.length } })); } catch {}
    return sessions.length;
  } catch (e) {
    console.warn('[storage] rehydrateFromSupabase failed', e);
    return 0;
  }
}

export function clearUserLocalData(): void {
  const userKeys = [
    STORAGE_KEYS.USER_PROFILE,
    STORAGE_KEYS.TIMER_SESSIONS,
    STORAGE_KEYS.SUBJECT_STATS,
    STORAGE_KEYS.FRIENDS,
    STORAGE_KEYS.PENDING_SYNC,
    'campus_user',
    'activeTimerSessionTarget',
    'globalTimerState',
  ];

  userKeys.forEach(key => localStorage.removeItem(key));

  Object.keys(localStorage)
    .filter(key => (
      key.startsWith(STORAGE_KEYS.DAILY_PROGRESS_PREFIX) ||
      key.startsWith(STORAGE_KEYS.CUSTOM_TASKS_PREFIX) ||
      key.startsWith('pcs_') ||
      key.startsWith('profile_')
    ))
    .forEach(key => localStorage.removeItem(key));
}
