/**
 * ============================================================================
 * CAMPUS 6.0 - MAIN APPLICATION COMPONENT (PRODUCTION)
 * ============================================================================
 *
 * ARCHITECTURE:
 * - Single Writer Pattern: Only TimerContext/db-service writes STUDY STATS.
 *   App writes PROFILE IDENTITY fields only (never total_study_time / xp /
 *   rank_score / current_status — owning those caused mass corruption).
 * - Offline-first with localStorage base + pending sync queue.
 * - Real-time leaderboard via Supabase postgres_changes.
 * - Tab persistence (page restored after refresh — with auth-loop protection).
 *
 * ============================================================================
 * VERSION 10.0.0 — AUTH LOOP + STAT-WIPE OVERHAUL
 * ============================================================================
 *  FIX #1  GOOGLE-LOGIN LOOP (root cause):
 *          `activePage === 'login'` was PERSISTED to localStorage. Google OAuth
 *          performs a FULL-PAGE REDIRECT, so the app cold-booted with the stale
 *          'login' page restored, and NOTHING transitioned off it — the only
 *          escape was LoginView's popup-flow callback. Session existed; UI said
 *          login; round and round forever.
 *          → New rule #1: NEVER persist 'login' as the active page.
 *          → New rule #2: the moment onAuthStateChange confirms a real session
 *            (INITIAL_SESSION / SIGNED_IN / USER_UPDATED with a user),
 *            activePage is PROMOTED off 'login' unconditionally.
 *          (Deliberate logout → refresh now lands on the demo dashboard instead
 *           of the login screen — cosmetic tradeoff, loop eliminated.)
 *
 *  FIX #2  STAT WIPE ON EVERY AUTH EVENT (leaderboard destroyer):
 *          The old upsert wrote total_study_time:0, xp:0, rank_score:0,
 *          current_rank, current_status with ignoreDuplicates:false — and ran
 *          on TOKEN_REFRESHED too (≈hourly + every tab refocus). Merely OPENING
 *          the app zeroed the student's progress; different devices/refocuses
 *          produced permanently disagreeing leaderboards.
 *          → Identity sync now routes through createUserInSupabaseIfNotExists()
 *            (ignoreDuplicates:true) which CREATES the row if absent and NEVER
 *            touches existing stat columns. Stats are owned exclusively by
 *            TimerContext → services/db increment pipeline.
 *
 *  FIX #3  EVENT NOISE FILTER:
 *          Handler processes only INITIAL_SESSION / SIGNED_IN / USER_UPDATED /
 *          SIGNED_OUT. TOKEN_REFRESHED, PASSWORD_RECOVERY etc. are ignored —
 *          prevents redundant fetch/upsert storms on flaky mobile connections.
 *
 *  FIX #4  SPINNER DEADLOCKS:
 *          isAuthLoading is cleared on EVERY terminal path — including catch
 *          branches and the no-session case of getSession().
 *
 *  FIX #5  CLEANUPS: removed duplicated saveLocal/setProfile calls and the
 *          doubled upsert block; auth subscription now subscribes ONCE
 *          (deps []) and computes the current day internally instead of
 *          tearing down/re-subscribing on every midnight rollover.
 *
 * @author CAMPUS 6.0 Team
 * @version 10.0.0
 * ============================================================================
 */

import React, { useState, useEffect, useCallback, lazy, Suspense, useMemo } from 'react';
import {
  UserProfile,
  DailyProgress,
  ToastMessage,
  ClassSession,
  TimerSession,
  SubjectCategory,
  SubjectStat,
  FriendUser,
  PreferredLanguage
} from './types';
import {
  getLocalUserProfile,
  saveLocalUserProfile,
  saveLocalOnlyUserProfile,
  clearUserLocalData,
  DEFAULT_DEMO_USER,
  getLocalDailyProgress,
  saveLocalDailyProgress,
  getLocalTimerSessions,
  saveLocalTimerSession,
  getLocalSubjectStats,
  saveLocalSubjectStat,
  getLocalFriends,
  addLocalFriend,
  removeLocalFriend,
  flushPendingSyncs
} from './utils/storageEngine';
import { PageId } from './components/Sidebar';
import { supabase } from './supabaseClient';
import { createUserInSupabaseIfNotExists } from './services/db';
import { AppShell } from './components/AppShell';
import { DashboardView } from './views/DashboardView';

// ============================================================================
// LAZY-LOADED VIEWS (Code Splitting for Performance)
// ============================================================================

const DailyPlanView = lazy(() => import('./views/DailyPlanView').then(m => ({ default: m.DailyPlanView })));
const WeeklyProgressView = lazy(() => import('./views/WeeklyProgressView').then(m => ({ default: m.WeeklyProgressView })));
const SubjectsView = lazy(() => import('./views/SubjectsView').then(m => ({ default: m.SubjectsView })));
const FocusTimerView = lazy(() => import('./views/FocusTimerView').then(m => ({ default: m.FocusTimerView })));
const FriendsView = lazy(() => import('./views/FriendsView').then(m => ({ default: m.FriendsView })));
const SettingsView = lazy(() => import('./views/SettingsView').then(m => ({ default: m.SettingsView })));
const LoginView = lazy(() => import('./views/LoginView').then(m => ({ default: m.LoginView })));
const RedGoldThemeView = lazy(() => import('./views/RedGoldThemeView').then(m => ({ default: m.RedGoldThemeView })));
const ProfilePremiumView = lazy(() => import('./views/ProfilePremiumView').then(m => ({ default: m.ProfilePremiumView })));
const RankGuideView = lazy(() => import('./views/RankGuideView').then(m => ({ default: m.default })));
const DevTestPanel = lazy(() => import('./components/DevTestPanel').then(m => ({ default: m.DevTestPanel })));
const OnboardingWizard = lazy(() => import('./components/OnboardingWizard').then(m => ({ default: m.OnboardingWizard })));
const ShareProgressModal = lazy(() => import('./components/ShareProgressModal').then(m => ({ default: m.ShareProgressModal })));
const AuthCallback = lazy(() => import('./AuthCallback').then(m => ({ default: m.AuthCallback })));

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEYS = {
  ACTIVE_PAGE: 'campus6_active_page',
  LANGUAGE: 'campus6_language',
} as const;

/**
 * FIX #3 — only these auth events trigger identity sync. Everything else
 * (notably TOKEN_REFRESHED, which fired ≈hourly/on-refocus and used to wipe
 * stats via Fix #2's old upsert) is intentionally ignored.
 */
const SYNC_ELIGIBLE_EVENTS = new Set<string>([
  'INITIAL_SESSION',
  'SIGNED_IN',
  'USER_UPDATED',
]);

const CONFIG = {
  TOAST_LIMIT: 4,
  TOAST_DURATION_MS: 4000,
  MIDNIGHT_CHECK_INTERVAL_MS: 60000,
  SYNC_RETRY_DELAY_MS: 500,
} as const;

// ============================================================================
// LOADING FALLBACK COMPONENT
// ============================================================================

const ViewLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center p-12 text-gold">
    <div className="w-8 h-8 border-4 border-slate-500/20 border-t-yellow-400 rounded-full animate-spin" />
  </div>
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getLocalIsoDate = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getStoredLanguage = (): PreferredLanguage => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (stored === 'bn' || stored === 'en' || stored === 'both') {
      return stored;
    }
  } catch {
    // Ignore errors
  }
  return 'bn'; // Default to Bengali
};

/**
 * FIX #1 (rule 1): 'login' must NEVER come out of storage as the initial page.
 * (Writes are also blocked below; this sanitizes legacy values.)
 */
const loadInitialActivePage = (): PageId => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_PAGE) as PageId | null;
    return saved && saved !== 'login' ? saved : 'dashboard';
  } catch {
    return 'dashboard';
  }
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export function App() {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  const [todayKey, setTodayKey] = useState<string>(getLocalIsoDate);
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  // Tab persistence ('login' never persisted/restored — Fix #1)
  const [activePage, setActivePage] = useState<PageId>(loadInitialActivePage);

  // Network & Sync State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isPendingSync, setIsPendingSync] = useState<boolean>(false);

  // Profile & Data State
  const [profile, setProfile] = useState<UserProfile>(() => getLocalUserProfile());
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>(() => getLocalDailyProgress(getLocalIsoDate()));
  const [timerSessions, setTimerSessions] = useState<TimerSession[]>(() => getLocalTimerSessions());
  const [subjectsStats, setSubjectsStats] = useState<SubjectStat[]>(() => getLocalSubjectStats());
  const [friends, setFriends] = useState<FriendUser[]>(() => getLocalFriends());
  const [activeTimerSessionTarget, setActiveTimerSessionTarget] = useState<{
    topic?: string;
    subject?: SubjectCategory;
  }>({});

  // Language preference (drives syllabus picker, UI text, etc.)
  const [preferredLanguage, setPreferredLanguage] = useState<PreferredLanguage>(() => {
    return getStoredLanguage();
  });

  // Modals & UI States
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    const localProfile = getLocalUserProfile();
    return !localProfile.isOnboarded;
  });
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Auth loading state (prevents race condition)
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // ========================================================================
  // MEMOIZED VALUES
  // ========================================================================

  const isDemoMode = useMemo(() => {
    return !profile.uid || profile.uid === DEFAULT_DEMO_USER.uid || profile.isDemo;
  }, [profile]);

  // ========================================================================
  // TAB PERSISTENCE EFFECT
  // ========================================================================

  useEffect(() => {
    // FIX #1 (rule 1): never persist the login screen.
    if (activePage === 'login') return;

    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PAGE, activePage);
    } catch (error) {
      console.warn('[App] Failed to persist active page:', error);
    }
  }, [activePage]);

  // ========================================================================
  // LANGUAGE PERSISTENCE EFFECT
  // ========================================================================

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, preferredLanguage);
    } catch (error) {
      console.warn('[App] Failed to persist language:', error);
    }
  }, [preferredLanguage]);

  // ========================================================================
  // SHARED: RESET LOCAL USER STATE TO DEMO MODE
  // Computes the day internally so callers need no time dependencies.
  // ========================================================================

  const resetLocalUserState = useCallback(() => {
    clearUserLocalData();
    const day = getLocalIsoDate();
    setProfile({ ...DEFAULT_DEMO_USER, updatedAt: new Date().toISOString() });
    setDailyProgress(getLocalDailyProgress(day));
    setTimerSessions([]);
    setSubjectsStats([]);
    setFriends([]);
    setActiveTimerSessionTarget({});
    setIsOnboardingOpen(!DEFAULT_DEMO_USER.isOnboarded);
    console.log('[App] Local state reset to demo mode');
  }, []);

  // ========================================================================
  // SUPABASE AUTH LISTENER — subscribes ONCE ([]); Fixes #1–#4 applied
  // ========================================================================

  useEffect(() => {
    /**
     * CORE: Sync Supabase user → local state + DB IDENTITY ROW.
     *
     * METADATA EXTRACTION PRIORITY CHAIN:
     * 1. user_metadata.full_name (Google OAuth)
     * 2. user_metadata.name
     * 3. user_metadata.user_name
     * 4. email prefix
     * 5. 'Student'
     */
    const syncSupabaseUser = async (user: any, event?: string) => {
      try {
        if (!user) {
          console.log('[App] No user session (logged out or no session)');
          return;
        }

        const cachedUid = getLocalUserProfile().uid;
        const existingProfile = getLocalUserProfile();
        const isNewUser = cachedUid !== user.id;
        const neverOnboarded = !existingProfile.isOnboarded;

        // Reset state for genuinely-new or un-onboarded accounts.
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && (isNewUser || neverOnboarded)) {
          console.log('[App] New or un-onboarded user detected, resetting state...');
          resetLocalUserState();
        }

        // Extract user metadata
        const metadata = user.user_metadata || {};
        const googleName =
          metadata.full_name ||
          metadata.name ||
          metadata.user_name ||
          metadata.display_name ||
          user.email?.split('@')[0] ||
          'Student';

        const avatarUrl =
          metadata.avatar_url ||
          metadata.picture ||
          metadata.image ||
          '';

        console.log('[App] Extracted user metadata:', {
          name: googleName,
          hasAvatar: !!avatarUrl,
          email: user.email,
          userId: user.id,
        });

        // Update local React state (single pass — duplicates removed, Fix #5)
        const currentProfile = getLocalUserProfile();
        const updatedProfile: UserProfile = {
          ...currentProfile,
          uid: user.id,
          email: user.email || currentProfile.email || '',
          displayName: googleName,
          nickname: googleName,
          photoURL: avatarUrl,
          avatar_url: avatarUrl,
          updatedAt: new Date().toISOString(),
          isDemo: false,
        };

        saveLocalOnlyUserProfile(updatedProfile);
        setProfile(updatedProfile);

        /**
         * ⭐ FIX #2 — THE STAT-WIPE FIX:
         * Identity creation ONLY. This helper upserts with ignoreDuplicates:true,
         * so for EXISTING students this is a guaranteed no-op at the database —
         * their total_study_time / xp / rank_score / current_status are never
         * written from here again. Only TimerContext's increment pipeline may
         * touch stats.
         */
        const created = await createUserInSupabaseIfNotExists({
          id: user.id,
          full_name: googleName,
          avatar_url: avatarUrl || null,
          email: user.email || null,
        });

        if (!created) {
          console.warn('[App] Supabase identity sync failed (non-fatal)');
        } else {
          console.log('[App] Identity ensured in Supabase');
        }

        /**
         * ⭐ FIX #1 (rule 2) — LOGIN-LOOP KILLER:
         * A live session is CONFIRMED (we hold the user object). If the app
         * booted onto the stale persisted 'login' page (or sat there after an
         * OAuth full-page redirect), promote it NOW. Non-login pages are left
         * exactly where the student left them (tab persistence preserved).
         */
        setActivePage((prev) => {
          if (prev !== 'login') return prev;
          console.log('[App] 🔓 Session confirmed — promoting stale login page to dashboard');
          return 'dashboard';
        });

      } catch (error) {
        console.error('[App] Critical error in syncSupabaseUser:', error);
      } finally {
        // ⭐ FIX #4 — loading gate MUST clear on every terminal path,
        // success or failure, or the spinner deadlocks (fake "login loop").
        setIsAuthLoading(false);
      }
    };

    // Subscribe to auth state changes (once — no per-midnight teardown, Fix #5)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[App] Auth event: ${event}`, session?.user?.id || 'no user');

        // Deliberate logout from ANY surface → clean slate + login screen.
        if (event === 'SIGNED_OUT') {
          resetLocalUserState();
          setActivePage('login');
          setIsAuthLoading(false);
          return;
        }

        // FIX #3 — ignore noise events (TOKEN_REFRESHED etc.). Sync runs only
        // when identity meaningfully appeared/changed.
        if (!SYNC_ELIGIBLE_EVENTS.has(event)) return;

        await syncSupabaseUser(session?.user, event);
      },
    );

    // Check for existing session on mount
    void supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          console.log('[App] Existing session found on mount — syncing…');
          void syncSupabaseUser(session.user, 'INITIAL_SESSION');
        } else {
          console.log('[App] No existing session found');
          // ⭐ FIX #4 — the no-session branch previously forgot to clear this.
          setIsAuthLoading(false);
        }
      })
      .catch((err) => {
        console.error('[App] getSession failed:', err);
        // ⭐ FIX #4 — a rejected getSession must never deadlock the spinner.
        setIsAuthLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [resetLocalUserState]);

  // ========================================================================
  // LOGOUT HANDLER
  // ========================================================================

  const handleLogout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[App] Supabase sign-out error:', error.message);
      }

      resetLocalUserState();
      // Show the login screen immediately (NOT persisted — Fix #1: after a
      // refresh the auth-less app resolves to the demo dashboard, and if a
      // session somehow survived, the auth handler promotes straight back in).
      setActivePage('login');
      console.log('[App] User logged out successfully');
    } catch (error) {
      console.error('[App] Unexpected error during logout:', error);
      setIsAuthLoading(false);
    }
  }, [resetLocalUserState]);

  // ========================================================================
  // TOAST NOTIFICATION SYSTEM
  // ========================================================================

  const addToast = useCallback((type: ToastMessage['type'], message: string, title?: string) => {
    const newToast: ToastMessage = {
      id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      type,
      message,
      title
    };
    setToasts(prev => [...prev.slice(-CONFIG.TOAST_LIMIT + 1), newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, CONFIG.TOAST_DURATION_MS);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ========================================================================
  // PERIODIC MIDNIGHT CHECK (Date Rollover)
  // ========================================================================

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newToday = getLocalIsoDate();
      setTodayKey(prev => {
        if (prev === newToday) return prev;
        console.log('[App] Date rollover detected:', newToday);
        setSelectedDateKey(newToday);
        setDailyProgress(getLocalDailyProgress(newToday));
        addToast('info', 'নতুন দিন শুরু হয়েছে! আজকের রুটিন প্রস্তুত।', 'New Day');
        return newToday;
      });
    }, CONFIG.MIDNIGHT_CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [addToast]);

  // ========================================================================
  // ONLINE / OFFLINE LISTENERS
  // ========================================================================

  useEffect(() => {
    const handleOnline = async () => {
      console.log('[App] Network connection restored');
      setIsOnline(true);
      addToast('success', 'ইন্টারনেট কানেকশন পুনরায় চালু হয়েছে!');

      try {
        const count = await flushPendingSyncs();
        if (count > 0) {
          setIsPendingSync(false);
          addToast('info', `${count} টি আইটেম ক্লাউডে সিঙ্ক করা হয়েছে!`);
        }
      } catch (err) {
        console.warn('[App] Pending sync flush failed:', err);
      }
    };

    const handleOffline = () => {
      console.log('[App] Network connection lost');
      setIsOnline(false);
      addToast('warning', 'অফলাইন মোড চালু — সকল ডাটা আপনার ডিভাইসে সেভ থাকবে।');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addToast]);

  // ========================================================================
  // SYNC STATE WHEN DATE SELECTION CHANGES
  // ========================================================================

  useEffect(() => {
    const prog = getLocalDailyProgress(selectedDateKey);
    setDailyProgress(prog);
  }, [selectedDateKey]);

  // ========================================================================
  // PROFILE UPDATE HANDLER (identity fields only — never stats, Fix #2)
  // ========================================================================

  const handleUpdateProfile = useCallback(async (updated: UserProfile) => {
    let finalProfile = updated;
    if (!updated.isOnboarded) {
      finalProfile = { ...updated, isOnboarded: true };
    }

    // Update local state immediately
    setProfile(finalProfile);
    saveLocalUserProfile(finalProfile);

    // Update language preference
    if (finalProfile.preferredLanguage) {
      setPreferredLanguage(finalProfile.preferredLanguage);
    }

    // Sync IDENTITY fields to Supabase users table.
    // ⭐ FIX #2 contract: no total_study_time / xp / rank / status here — EVER.
    if (finalProfile.uid && finalProfile.uid !== DEFAULT_DEMO_USER.uid) {
      try {
        const { error } = await supabase.from('users').update({
          full_name: finalProfile.displayName || finalProfile.nickname || null,
          avatar_url: finalProfile.avatar_url || finalProfile.photoURL || null,
          updated_at: new Date().toISOString(),
        }).eq('id', finalProfile.uid);

        if (error) {
          // Row may not exist yet (fresh onboarding edge) → create identity.
          const ok = await createUserInSupabaseIfNotExists({
            id: finalProfile.uid,
            full_name: finalProfile.displayName || finalProfile.nickname || undefined,
            avatar_url: finalProfile.avatar_url || finalProfile.photoURL || null,
            email: finalProfile.email || null,
          });
          if (!ok) {
            console.warn('[App] Failed to sync profile update to Supabase:', error.message);
            return;
          }
        }
        console.log('[App] Profile synced to Supabase:', finalProfile.displayName);
      } catch (err) {
        console.warn('[App] Exception during Supabase profile sync:', err);
      }
    }
  }, []);

  // ========================================================================
  // DAILY PROGRESS UPDATE HANDLER
  // ========================================================================

  const handleUpdateDailyProgress = useCallback((updated: DailyProgress) => {
    setDailyProgress(updated);
    saveLocalDailyProgress(updated);
  }, []);

  // ========================================================================
  // TIMER SESSION COMPLETE HANDLER (SINGLE WRITER PATTERN)
  //
  // Saves locally + updates the day card ONLY. Cloud stats are owned
  // exclusively by TimerContext → services/db increment pipeline.
  // ========================================================================

  const handleSessionComplete = useCallback(async (session: TimerSession) => {
    // 1. Save locally (backup + offline support)
    saveLocalTimerSession(session);
    setTimerSessions(getLocalTimerSessions());

    // 2. Update study hours in today's progress
    const currentProgress = getLocalDailyProgress(session.dateKey);
    const addedHours = parseFloat((session.durationMinutes / 60).toFixed(2));
    const updatedProgress: DailyProgress = {
      ...currentProgress,
      studyHours: parseFloat((currentProgress.studyHours + addedHours).toFixed(1)),
      updatedAt: new Date().toISOString()
    };
    saveLocalDailyProgress(updatedProgress);

    if (session.dateKey === selectedDateKey) {
      setDailyProgress(updatedProgress);
    }

    // 3. Success toast
    addToast('success', `🎉 মাশাল্লাহ! ${session.durationMinutes} মিনিটের সেশন সফলভাবে সম্পন্ন হয়েছে!`);

    // 4. Cloud write happened in TimerContext (chunk pipeline).
    console.log('[App] Session saved locally. DB write handled by TimerContext.');
  }, [selectedDateKey, addToast]);

  // ========================================================================
  // FRIENDS ACTIONS
  // ========================================================================

  const handleAddFriend = useCallback((code: string) => {
    const result = addLocalFriend(code);
    if (result.success) {
      setFriends(getLocalFriends());
      addToast('success', `${code} বন্ধু তালিকায় যুক্ত করা হয়েছে!`);
    } else {
      addToast('error', result.message || 'বন্ধু যোগ করা ব্যর্থ হয়েছে');
    }
  }, [addToast]);

  const handleRemoveFriend = useCallback((code: string) => {
    removeLocalFriend(code);
    setFriends(getLocalFriends());
    addToast('info', 'বন্ধু তালিকা থেকে সরানো হয়েছে');
  }, [addToast]);

  // ========================================================================
  // REFRESH APP STATE (Dev Panel Helper)
  // ========================================================================

  const handleRefreshAppState = useCallback(() => {
    setProfile(getLocalUserProfile());
    setDailyProgress(getLocalDailyProgress(selectedDateKey));
    setTimerSessions(getLocalTimerSessions());
    setSubjectsStats(getLocalSubjectStats());
    setFriends(getLocalFriends());
    console.log('[App] App state refreshed from localStorage');
  }, [selectedDateKey]);

  // ========================================================================
  // AUTH CALLBACK ROUTE (must precede all gates)
  // ========================================================================

  if (typeof window !== 'undefined' && window.location.pathname === '/auth/callback') {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <AuthCallback />
      </Suspense>
    );
  }

  // ========================================================================
  // AUTH LOADING GATE (race-condition shield)
  // ========================================================================

  if (isAuthLoading) {
    return <ViewLoadingFallback />;
  }

  // ========================================================================
  // LOGIN VIEW
  // ========================================================================

  if (activePage === 'login') {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <LoginView
          onLoginSuccess={async () => {
            console.log('[App] Login success callback triggered');
            await new Promise(resolve => setTimeout(resolve, CONFIG.SYNC_RETRY_DELAY_MS));
            setActivePage('dashboard'); // promotion also enforced by auth listener (Fix #1)
            addToast('success', 'স্বগতম! আপনার প্রোফাইল সিঙ্ক হয়েছে।', 'Login Success');
          }}
          onAddToast={addToast}
        />
      </Suspense>
    );
  }

  // ========================================================================
  // MAIN APP SHELL
  // ========================================================================

  return (
    <AppShell
      profile={profile}
      activePage={activePage}
      onNavigate={setActivePage}
      isOnline={isOnline}
      isPendingSync={isPendingSync}
      toasts={toasts}
      onDismissToast={dismissToast}
      onOpenProfile={() => setActivePage('settings')}
      onSyncNow={async () => {
        const synced = await flushPendingSyncs();
        addToast('info', `${synced} টি বিষয় সিঙ্ক হয়েছে!`);
      }}
    >
      <Suspense fallback={<ViewLoadingFallback />}>
        {activePage === 'dashboard' && (
          <DashboardView
            profile={profile}
            todayKey={todayKey}
            todayProgress={dailyProgress}
            onNavigate={setActivePage}
            onStartTimerWithSession={(session: ClassSession) => {
              setActiveTimerSessionTarget({ topic: session.topic, subject: session.subject });
              setActivePage('focus_timer');
            }}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />
        )}

        {activePage === 'red_gold' && (
          <RedGoldThemeView
            profile={profile}
            todayKey={todayKey}
            onNavigate={setActivePage}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            onAddToast={addToast}
          />
        )}

        {activePage === 'daily_plan' && (
          <DailyPlanView
            profile={profile}
            selectedDateKey={selectedDateKey}
            onDateChange={setSelectedDateKey}
            todayKey={todayKey}
            dailyProgress={dailyProgress}
            onUpdateProgress={handleUpdateDailyProgress}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            onAddToast={addToast}
          />
        )}

        {activePage === 'weekly_progress' && (
          <WeeklyProgressView
            profile={profile}
            todayKey={todayKey}
            selectedDateKey={selectedDateKey}
            onSelectDateKey={setSelectedDateKey}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />
        )}

        {activePage === 'subjects' && (
          <SubjectsView
            subjectsStats={subjectsStats}
            onUpdateSubjectStat={(updated) => {
              saveLocalSubjectStat(updated);
              setSubjectsStats(getLocalSubjectStats());
            }}
            onAddToast={addToast}
          />
        )}

        {activePage === 'focus_timer' && (
          <FocusTimerView
            onSessionComplete={handleSessionComplete}
            recentSessions={timerSessions}
            initialTopic={activeTimerSessionTarget.topic}
            initialSubject={activeTimerSessionTarget.subject}
          />
        )}

        {activePage === 'friends' && (
          <FriendsView
            profile={profile}
            friends={friends}
            onAddFriend={handleAddFriend}
            onRemoveFriend={handleRemoveFriend}
            onAddToast={addToast}
          />
        )}

        {activePage === 'settings' && (
          <SettingsView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onRefreshAppState={handleRefreshAppState}
            onNavigate={setActivePage}
            onAddToast={addToast}
            onLogout={handleLogout}
          />
        )}

        {activePage === 'profile_premium' && (
          <ProfilePremiumView
            profile={profile}
            todayKey={todayKey}
            onNavigate={setActivePage}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />
        )}

        {activePage === 'rank_guide' && (
          <RankGuideView onNavigate={setActivePage} />
        )}

        {activePage === 'dev_panel' && (
          <DevTestPanel
            onJumpToDate={(d) => {
              setSelectedDateKey(d);
              setActivePage('daily_plan');
            }}
            onRefreshAppState={handleRefreshAppState}
            onAddToast={addToast}
          />
        )}

        {/* Onboarding Wizard */}
        <OnboardingWizard
          isOpen={isOnboardingOpen}
          initialProfile={profile}
          onComplete={(updated) => {
            handleUpdateProfile({ ...updated, isOnboarded: true });
            setIsOnboardingOpen(false);
            addToast('success', 'স্বাগতম CAMPUS 6.0 তে! পড়াশোনা শুরু করুন।');
          }}
        />

        {/* Social Share Progress Modal */}
        <ShareProgressModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          profile={profile}
          todayKey={selectedDateKey}
          progress={dailyProgress}
          onAddToast={addToast}
        />
      </Suspense>
    </AppShell>
  );
}

export default App;