import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { UserProfile, DailyProgress } from '../types';
import {
  saveLocalOnlyUserProfile,
  saveLocalOnlyDailyProgress
} from '../utils/storageEngine';

export const useFirebaseSync = (
  isOnline: boolean,
  setProfile: (profile: UserProfile) => void,
  selectedDateKey: string,
  setDailyProgress: (progress: DailyProgress) => void
) => {
  const [currentUid, setCurrentUid] = useState<string | null>(
    auth?.currentUser?.uid || null
  );

  // ============================================================
  // AUTH STATE
  // ============================================================
  useEffect(() => {
    if (!auth) return;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUid(user ? user.uid : null);
    });

    return () => unsubAuth();
  }, []);

  // ============================================================
  // FIREBASE PROFILE + DAILY PROGRESS SYNC
  // ============================================================
  useEffect(() => {
    if (!isOnline || !currentUid || !db) return;

    // ----------------------------------------------------------
    // PROFILE
    // ----------------------------------------------------------
    const profileRef = doc(db, 'users', currentUid);

    const unsubscribeProfile = onSnapshot(
      profileRef,
      (docSnap) => {
        if (!docSnap.exists()) return;

        const data = docSnap.data() as any;

        /*
         * IMPORTANT:
         * Firebase currently contains "avatar"
         * while the React app expects "photoURL".
         *
         * Normalize both old and new structures here.
         */
        const remoteProfile: UserProfile = {
          ...data,

          uid: data.uid || currentUid,

          displayName:
            data.displayName ||
            data.name ||
            'Student',

          nickname:
            data.nickname ||
            (data.displayName || data.name || 'Student')
              .split(' ')[0],

          email:
            data.email || auth.currentUser?.email || '',

          photoURL:
            data.photoURL ||
            data.avatar ||
            auth.currentUser?.photoURL ||
            '',

          targetUniversity:
            data.targetUniversity ||
            data.target ||
            'Top University',

          academicGroup:
            data.academicGroup || 'Science',

          dailyStudyTargetHours:
            data.dailyStudyTargetHours || 8,

          preferredLanguage:
            data.preferredLanguage || 'bn',

          theme:
            data.theme || 'dark',

          reminderEnabled:
            data.reminderEnabled ?? true,

          startModeRequired:
            data.startModeRequired ?? true,

          showReligiousReminders:
            data.showReligiousReminders ?? true,

          showLeaderboard:
            data.showLeaderboard ?? true,

          soundEnabled:
            data.soundEnabled ?? true,

          friendCode:
            data.friendCode || `CAMPUS-${currentUid.slice(0, 6).toUpperCase()}`,

          createdAt:
            data.createdAt || new Date().toISOString(),

          updatedAt:
            data.updatedAt || new Date().toISOString(),

          isDemo: false,

          isOnboarded:
            data.isOnboarded ?? true
        };

        console.log('✅ Firebase profile normalized:', {
          name: remoteProfile.displayName,
          photoURL: remoteProfile.photoURL
        });

        setProfile(remoteProfile);
        saveLocalOnlyUserProfile(remoteProfile);
      },
      (err) => {
        console.warn('⚠️ Profile sync error:', err);
      }
    );

    // ----------------------------------------------------------
    // DAILY PROGRESS
    // ----------------------------------------------------------
    const progressRef = doc(
      db,
      'users',
      currentUid,
      'dailyProgress',
      selectedDateKey
    );

    const unsubscribeProgress = onSnapshot(
      progressRef,
      (docSnap) => {
        if (!docSnap.exists()) return;

        const remoteProgress = docSnap.data() as DailyProgress;

        setDailyProgress(remoteProgress);
        saveLocalOnlyDailyProgress(remoteProgress);
      },
      (err) => {
        console.warn('⚠️ Progress sync error:', err);
      }
    );

    return () => {
      unsubscribeProfile();
      unsubscribeProgress();
    };
  }, [
    isOnline,
    currentUid,
    selectedDateKey,
    setProfile,
    setDailyProgress
  ]);
};