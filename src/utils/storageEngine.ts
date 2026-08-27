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
  photoURL: '',
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
    photoURL: '',
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
    photoURL: '',
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
    photoURL: '',
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
// STREAK CALCULATOR ENGINE (70% Rule)
// -------------------------------------------------------------
export interface StreakResult {
  currentStreak: number;
  bestStreak: number;
  daysAbove70Count: number;
}

export function calculateStreak(todayDateKey: string): StreakResult {
  if (streakCache && streakCache.todayDateKey === todayDateKey) {
    return streakCache.result;
  }

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  let daysAbove70Count = 0;

  // Inspect existing progress entries in localStorage for fast evaluation
  const localStorageDateKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEYS.DAILY_PROGRESS_PREFIX)) {
      const dKey = key.replace(STORAGE_KEYS.DAILY_PROGRESS_PREFIX, '');
      if (dKey <= todayDateKey) {
        localStorageDateKeys.push(dKey);
      }
    }
  }

  const sortedDates = Array.from(new Set(localStorageDateKeys)).sort();

  sortedDates.forEach(dateKey => {
    const p = getDailyProgressReadOnly(dateKey);
    const pass = p.completionPercent >= 70;

    if (pass) {
      daysAbove70Count++;
      tempStreak++;
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  });

  // Calculate current streak working backwards from today or yesterday
  let checkDate = new Date(`${todayDateKey}T00:00:00`);
  let maxSearchDays = 60; // Guard against infinite loop
  
  while (maxSearchDays > 0) {
    maxSearchDays--;
    const isoStr = checkDate.toISOString().split('T')[0];
    if (isoStr < '2026-08-01') break; // Early exit before baseline

    const p = getDailyProgressReadOnly(isoStr);
    
    if (p.completionPercent >= 70) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      if (isoStr === todayDateKey) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }
  }

  const result = {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    daysAbove70Count
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
  saveUserProfile(DEFAULT_DEMO_USER);
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

export function clearAllLocalData(): void {
  localStorage.clear();
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
