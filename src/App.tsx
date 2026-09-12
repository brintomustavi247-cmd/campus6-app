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
 * VERSION 11.0.0 — FIRST-VISIT LOGIN FLOW + DEMO ENTRY
 * ============================================================================
 *  NEW #1  FIRST VISIT → LOGIN PAGE:
 *          When a student opens the app for the first time (no saved page,
 *          no session), the login screen appears. Previously it jumped to
 *          demo dashboard, hiding the real Google login flow.
 *          → `loadInitialActivePage` now returns 'login' when nothing is saved.
 *          → 'login' is STILL never persisted (Fix #1 rule 1 preserved),
 *            so the auth-loop protection remains intact.
 *          → Deliberate logout → refresh now lands on login screen (matches
 *            real-world expectation — "log out" = "see login again").
 *
 *  NEW #2  DEMO ENTRY BUTTON:
 *          LoginView now exposes a "Explore Demo" button. Clicking it calls
 *          onLoginSuccess() without any auth — App promotes the page to
 *          dashboard and the student explores in demo mode. The default
 *          demo profile stays intact (no state reset on demo entry).
 *
 *  (All prior fixes #1–#5 from v10.0.0 are preserved verbatim.)
 *
 * @author CAMPUS 6.0 Team
 * @version 11.0.0
 * ============================================================================
 */

import React, { useState, useEffect, useCallback, lazy, Suspense, useMemo, useRef } from 'react';
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
import { PwaInstallModal } from './components/PwaInstall';
import { startScheduler, stopScheduler } from './utils/studyNotifications';
import { getUnreadCount, generateSmartNotifications, saveNotification, requestNotificationPermission, sendBrowserNotification } from './utils/smartNotifications';
import { useClassExamReminders } from './utils/useClassExamReminders';
import { initTimerCompletionFeedback } from './utils/timerCompletionFeedback';
import { NotificationOnboarding } from './components/NotificationOnboarding';
import { initAppUpdater } from './utils/appUpdater';
import { UpdateBanner } from './components/UpdateBanner';
import { unlockAudio } from './utils/alertFeedback';
import { initLiveStatsSync } from './utils/liveStatsSync';

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
const AdminView = lazy(() => import('./views/AdminView').then(m => ({ default: m.AdminView })));

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
 * 🎯 NEW #1 (v11): First-visit login flow.
 *
 * - If localStorage has a valid non-login page saved → restore it
 *   (returning user lands where they left off).
 * - If nothing is saved (first visit) OR legacy 'login' value was stored
 *   (defensive — rule 1 says we never write it, but clean up anyway) →
 *   show the LOGIN screen.
 *
 * NOTE: 'login' is NEVER persisted below, so the auth-loop protection
 * (Fix #1 rule 1 from v10) remains fully intact. A full-page OAuth redirect
 * cold-boots, finds no saved page, and shows login — then the auth listener
 * promotes to dashboard as soon as the session confirms.
 */
const loadInitialActivePage = (): PageId => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_PAGE) as PageId | null;
    if (saved && saved !== 'login') {
      return saved;
    }
    return 'login';
  } catch {
    return 'login';
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
    const [showUpdate, setShowUpdate] = useState<boolean>(false);
  const applyUpdateRef = useRef<() => void>(() => {});

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

        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && (isNewUser || neverOnboarded)) {
          console.log('[App] New or un-onboarded user detected, resetting state...');
          resetLocalUserState();
        }

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

        const currentProfile = getLocalUserProfile();

        // ⭐ Admin flag fetch
        let isAdminFlag = false;
        try {
          const { data: adminRow } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', user.id)
            .single();
          isAdminFlag = !!adminRow?.is_admin;
        } catch {}

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
          isAdmin: isAdminFlag,
        };

        saveLocalOnlyUserProfile(updatedProfile);
        setProfile(updatedProfile);

        const created = await createUserInSupabaseIfNotExists({
          id: user.id,
          full_name: googleName,
          avatar_url: avatarUrl || null,
          email: user.email || null,
        });

                // ⭐ Last active timestamp (admin panel-এ "Last Login" দেখাবে)
        supabase
          .from('users')
          .update({ last_active: new Date().toISOString() })
          .eq('id', user.id)
          .then(() => {}, () => {});

        if (!created) {
          console.warn('[App] Supabase identity sync failed (non-fatal)');
        } else {
          console.log('[App] Identity ensured in Supabase');
        }

        /**
         * FIX #1 (rule 2) — LOGIN-LOOP KILLER:
         * A live session is CONFIRMED. If the app booted onto 'login'
         * (first visit or stale post-OAuth), promote it NOW.
         */
        setActivePage((prev) => {
          if (prev !== 'login') return prev;
          console.log('[App] 🔓 Session confirmed — promoting stale login page to dashboard');
          return 'dashboard';
        });

      } catch (error) {
        console.error('[App] Critical error in syncSupabaseUser:', error);
      } finally {
        setIsAuthLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[App] Auth event: ${event}`, session?.user?.id || 'no user');

        if (event === 'SIGNED_OUT') {
          resetLocalUserState();
          setActivePage('login');
          setIsAuthLoading(false);
          return;
        }

        if (!SYNC_ELIGIBLE_EVENTS.has(event)) return;

        await syncSupabaseUser(session?.user, event);
      },
    );

    void supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          console.log('[App] Existing session found on mount — syncing…');
          void syncSupabaseUser(session.user, 'INITIAL_SESSION');
        } else {
          console.log('[App] No existing session found');
          setIsAuthLoading(false);
        }
      })
      .catch((err) => {
        console.error('[App] getSession failed:', err);
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
      // 🎯 NEW #1: After logout → login screen (NOT persisted).
      // On refresh the auth-less app will resolve to login again (loadInitialActivePage).
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

  // ⭐ Smart Notifications — unread count + auto-generate
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  // Drawer-এ read হলে badge live update হবে
  useEffect(() => {
    const sync = () => setUnreadNotifs(getUnreadCount());
    window.addEventListener('campus6:notifications-changed', sync);
    return () => window.removeEventListener('campus6:notifications-changed', sync);
  }, []);

  useEffect(() => {
    const checkNotifications = () => {
      const notifs = generateSmartNotifications(todayKey);
      notifs.forEach(n => {
        saveNotification(n);
        if (n.priority === 'urgent' || n.priority === 'high') {
          sendBrowserNotification(`${n.emoji} ${n.title}`, n.message);
          addToast(n.priority === 'urgent' ? 'warning' : 'info', n.message, n.title);
        }
      });
      setUnreadNotifs(getUnreadCount());
    };

    // Permission এখন drawer-এর button থেকে চাওয়া হয় (user gesture = mobile-এ কাজ করে)
    checkNotifications();

    const interval = setInterval(checkNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [todayKey, addToast]);

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

    setProfile(finalProfile);
    saveLocalUserProfile(finalProfile);

    if (finalProfile.preferredLanguage) {
      setPreferredLanguage(finalProfile.preferredLanguage);
    }

    if (finalProfile.uid && finalProfile.uid !== DEFAULT_DEMO_USER.uid) {
      try {
        const { error } = await supabase.from('users').update({
          full_name: finalProfile.displayName || finalProfile.nickname || null,
          avatar_url: finalProfile.avatar_url || finalProfile.photoURL || null,
          updated_at: new Date().toISOString(),
        }).eq('id', finalProfile.uid);

        if (error) {
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
  // TIMER SESSION COMPLETE HANDLER
  // ========================================================================

  const handleSessionComplete = useCallback(async (session: TimerSession) => {
    saveLocalTimerSession(session);
    setTimerSessions(getLocalTimerSessions());

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

    addToast('success', `🎉 মাশাল্লাহ! ${session.durationMinutes} মিনিটের সেশন সফলভাবে সম্পন্ন হয়েছে!`);

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
  // 🎯 NEW #2: DEMO ENTRY HANDLER (LoginView's "Explore Demo" button)
  // Does NOT reset local state — preserves default demo profile.
  // Promotes 'login' → 'dashboard' immediately.
  // ========================================================================

  const handleDemoEntry = useCallback(() => {
    console.log('[App] Demo entry — no auth required');
    setActivePage('dashboard');
    addToast('info', 'ডেমো মোডে স্বাগতম! আপনার সব progress লোকালি সেভ হবে।', 'Demo Mode');
  }, [addToast]);

  // ========================================================================
  // 🔔 CLASS/EXAM REMINDER ENGINE (all pages-এ active থাকবে)
  // ========================================================================
  useClassExamReminders({ onAddToast: addToast });

  // 🔔 TIMER COMPLETION FEEDBACK (vibrate + sound — GLOBAL)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('./utils/timerCompletionFeedback').then((mod) => {
        mod.initTimerCompletionFeedback();
        console.log('[App] ✅ Timer completion feedback initialized');
      }).catch((err) => {
        console.warn('[App] Timer feedback init failed:', err);
      });
    }
  }, []);

  // 📬 DAILY STUDY NOTIFICATIONS SCHEDULER
  useEffect(() => {
    startScheduler();
    return () => {
      stopScheduler();
    };
  }, []);

  // 🔊 AUDIO UNLOCK — mobile-এ first touch-এ AudioContext চালু হয়
  useEffect(() => {
    const un = () => unlockAudio();
    window.addEventListener('pointerdown', un, { once: true });
    return () => window.removeEventListener('pointerdown', un);
  }, []);
    // ⚡ LIVE STATS SYNC — timer complete → Supabase (leaderboard live হয়)
  useEffect(() => {
    initLiveStatsSync();
  }, []);


    // 🔄 APP UPDATE DETECTOR (নতুন deploy হলে prompt)
  useEffect(() => {
    initAppUpdater((apply) => {
      applyUpdateRef.current = apply;
      setShowUpdate(true);
    });
  }, []);

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
  // AUTH LOADING GATE
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
            setActivePage('dashboard');
            addToast('success', 'স্বাগতম! আপনার প্রোফাইল সিঙ্ক হয়েছে।', 'Login Success');
          }}
          onDemoEntry={handleDemoEntry}
          onAddToast={addToast}
        />
      </Suspense>
    );
  }

  // ========================================================================
  // MAIN APP SHELL
  // ========================================================================

  return (
    <>
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
        unreadNotifications={unreadNotifs} // ⭐ Pass unread count
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

        {activePage === 'admin' && (
          <AdminView profile={profile} />
        )}

        <OnboardingWizard
          isOpen={isOnboardingOpen}
          initialProfile={profile}
          onComplete={(updated) => {
            handleUpdateProfile({ ...updated, isOnboarded: true });
            setIsOnboardingOpen(false);
            addToast('success', 'স্বাগতম CAMPUS 6.0 তে! পড়াশোনা শুরু করুন।');
          }}
        />

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

    {/* 📲 PWA Install Popup — themed (login page-এর মতো dark+red+gold) */}
    <PwaInstallModal onAddToast={addToast} />
        {/* 🔔 Notification Onboarding — এক tap-এ permission */}
    <NotificationOnboarding />
            {/* 🔄 App Update Banner */}
        <UpdateBanner
          show={showUpdate}
          onUpdate={() => { setShowUpdate(false); applyUpdateRef.current(); }}
          onDismiss={() => setShowUpdate(false)}
        />
    </>
  );
}

export default App;
