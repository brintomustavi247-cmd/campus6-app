import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';

import {
  syncUserPresenceToSupabase,
} from '../services/db';

import { supabase } from '../supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

export interface PresenceState {
  liveStatus:
    | 'offline'
    | 'focus'
    | 'break';

  currentTask: string;

  /**
   * CURRENT ACTIVE FOCUS SEGMENT start time.
   * milliseconds.
   */
  sessionStartTime:
    | number
    | null;

  /**
   * 🐛 FIX: Time accumulated BEFORE the current segment.
   * This ensures the leaderboard doesn't reset to 0 on refresh.
   */
  accumulatedSeconds?: number;
}

interface PresenceContextType {
  presence: PresenceState;

  startFocus: (
    taskName: string,
    startTime?: number | null,
    extra?: { accumulatedSeconds?: number }
  ) => void;

  stopFocus: (
    status?: 'offline' | 'break'
  ) => void;

  uid: string | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY =
  'globalPresenceState';

const DEFAULT_PRESENCE: PresenceState =
  {
    liveStatus: 'offline',
    currentTask: '',
    sessionStartTime: null,
    accumulatedSeconds: 0,
  };

// ============================================================================
// CONTEXT
// ============================================================================

const PresenceContext =
  createContext<
    PresenceContextType | undefined
  >(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export const PresenceProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [uid, setUid] =
    useState<string | null>(null);

  const [presence, setPresence] =
    useState<PresenceState>(
      DEFAULT_PRESENCE
    );

  const uidRef =
    useRef<string | null>(null);

  const presenceRef =
    useRef<PresenceState>(
      DEFAULT_PRESENCE
    );

  const restoredRef =
    useRef(false);

  // --------------------------------------------------------------------------
  // STATE UPDATE
  // --------------------------------------------------------------------------

  const updatePresenceState =
    useCallback(
      (
        next: PresenceState
      ) => {
        presenceRef.current =
          next;

        setPresence(next);

        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(next)
          );
        } catch (error) {
          console.warn(
            '[Presence] localStorage save failed:',
            error
          );
        }
      },
      []
    );

  // --------------------------------------------------------------------------
  // RESTORE LOCAL PRESENCE
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (restoredRef.current) {
      return;
    }

    restoredRef.current = true;

    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) return;

      const parsed =
        JSON.parse(saved);

      if (
        !parsed ||
        typeof parsed !== 'object'
      ) {
        return;
      }

      const liveStatus =
        parsed.liveStatus === 'focus' ||
        parsed.liveStatus === 'break' ||
        parsed.liveStatus ===
          'offline'
          ? parsed.liveStatus
          : 'offline';

      const currentTask =
        typeof parsed.currentTask ===
        'string'
          ? parsed.currentTask
          : '';

      const start =
        parsed.sessionStartTime !=
        null
          ? Number(
              parsed.sessionStartTime
            )
          : null;

      const sessionStartTime =
        start &&
        Number.isFinite(start) &&
        start > 0
          ? start
          : null;

      // 🐛 FIX: Restore accumulated seconds
      const accumulatedSeconds =
        typeof parsed.accumulatedSeconds === 'number'
          ? parsed.accumulatedSeconds
          : 0;

      const restored: PresenceState =
        {
          liveStatus,
          currentTask,

          sessionStartTime:
            liveStatus ===
            'focus'
              ? sessionStartTime
              : null,

          accumulatedSeconds:
            liveStatus === 'focus'
              ? accumulatedSeconds
              : 0,
        };

      presenceRef.current =
        restored;

      setPresence(restored);

      console.log(
        '[Presence] Restored:',
        restored
      );
    } catch (error) {
      console.warn(
        '[Presence] Restore failed:',
        error
      );

      updatePresenceState(
        DEFAULT_PRESENCE
      );
    }
  }, [
    updatePresenceState,
  ]);

  // --------------------------------------------------------------------------
  // AUTH
  // --------------------------------------------------------------------------

  useEffect(() => {
    let active = true;

    const setUser = (
      user: {
        id: string;
      } | null
    ) => {
      if (!active) return;

      const nextUid =
        user?.id || null;

      uidRef.current =
        nextUid;

      setUid(nextUid);
    };

    void supabase.auth
      .getSession()
      .then(
        ({
          data: { session },
        }) => {
          setUser(
            session?.user || null
          );
        }
      )
      .catch((error) => {
        console.warn(
          '[Presence] getSession failed:',
          error
        );
      });

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(
            session?.user || null
          );
        }
      );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // --------------------------------------------------------------------------
  // SYNC PRESENCE
  // --------------------------------------------------------------------------

  const syncPresence =
    useCallback(
      async (
        status:
          | 'online'
          | 'focus'
          | 'break'
          | 'offline',
        taskName: string,
        startTime?: number | null,
        extra?: { accumulatedSeconds?: number } // 🐛 FIX: Accept extra
      ) => {
        const currentUid =
          uidRef.current;

        if (!currentUid) {
          return;
        }

        try {
          await syncUserPresenceToSupabase(
            currentUid,
            status,
            taskName,
            startTime,
            extra // 🐛 FIX: Pass to DB service
          );
        } catch (error) {
          console.warn(
            '[Presence] Sync failed:',
            error
          );
        }
      },
      []
    );

  // --------------------------------------------------------------------------
  // START FOCUS
  // --------------------------------------------------------------------------

  const startFocus =
    useCallback(
      (
        taskName: string,
        suppliedStartTime?: number | null,
        extra?: { accumulatedSeconds?: number } // 🐛 FIX: Accept extra
      ) => {
        const cleanTask =
          taskName?.trim() ||
          'সাধারণ পড়া';

        const existing =
          presenceRef.current;

        // Do not reset timestamp if this is
        // the same active segment.
        if (
          existing.liveStatus ===
            'focus' &&
          existing.currentTask ===
            cleanTask &&
          existing.sessionStartTime
        ) {
          void syncPresence(
            'focus',
            cleanTask,
            existing.sessionStartTime,
            { 
              accumulatedSeconds: 
                extra?.accumulatedSeconds ?? existing.accumulatedSeconds 
            } // 🐛 FIX: Pass extra
          );

          return;
        }

        const startTime =
          Number.isFinite(
            Number(
              suppliedStartTime
            )
          ) &&
          Number(
            suppliedStartTime
          ) > 0
            ? Number(
                suppliedStartTime
              )
            : Date.now();

        const nextPresence:
          PresenceState = {
            liveStatus: 'focus',
            currentTask:
              cleanTask,
            sessionStartTime:
              startTime,
            accumulatedSeconds: 
              extra?.accumulatedSeconds || 0, // 🐛 FIX: Store locally
          };

        updatePresenceState(
          nextPresence
        );

        void syncPresence(
          'focus',
          cleanTask,
          startTime,
          extra // 🐛 FIX: Pass to DB
        );
      },
      [
        syncPresence,
        updatePresenceState,
      ]
    );

  // --------------------------------------------------------------------------
  // STOP FOCUS
  // --------------------------------------------------------------------------

  const stopFocus =
    useCallback(
      (
        status:
          | 'offline'
          | 'break' = 'offline'
      ) => {
        const nextPresence:
          PresenceState = {
            liveStatus:
              status,
            currentTask: '',
            sessionStartTime:
              null,
            accumulatedSeconds: 0, // 🐛 FIX: Clear on stop
          };

        updatePresenceState(
          nextPresence
        );

        void syncPresence(
          status,
          '',
          null,
          { accumulatedSeconds: 0 } // 🐛 FIX: Clear on DB
        );
      },
      [
        syncPresence,
        updatePresenceState,
      ]
    );

  // --------------------------------------------------------------------------
  // KEEP REFS IN SYNC
  // --------------------------------------------------------------------------

  useEffect(() => {
    presenceRef.current =
      presence;
  }, [presence]);

  useEffect(() => {
    uidRef.current = uid;
  }, [uid]);

  // --------------------------------------------------------------------------
  // PROVIDER
  // --------------------------------------------------------------------------

  return (
    <PresenceContext.Provider
      value={{
        presence,
        startFocus,
        stopFocus,
        uid,
      }}
    >
      {children}
    </PresenceContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const usePresence =
  (): PresenceContextType => {
    const context =
      useContext(
        PresenceContext
      );

    if (!context) {
      throw new Error(
        'usePresence must be used within a PresenceProvider'
      );
    }

    return context;
  };