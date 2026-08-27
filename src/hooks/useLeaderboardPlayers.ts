import { useEffect, useMemo, useRef, useState } from 'react';
import {
  initializeLeaderboardRealtime,
  LocalTimerState,
} from '../services/leaderboardSync';
import { useGlobalTimer } from '../contexts/TimerContext';
import { EsportsPlayer } from '../components/squad/EsportsData';

interface Params {
  currentUserId?: string | null;
  limit?: number;
}

/**
 * THE one hook every leaderboard screen uses.
 *
 * • Ranks come from the single deterministic pipeline (leaderboardSync v8)
 *   → identical on every device, guaranteed.
 * • Own-tile live count-up works via the controller's setLocalTimerState —
 *   pushed fresh every tick WITHOUT resubscribing anything.
 * • A 30-second polling heartbeat keeps the board fresh when Realtime is unavailable.
 */
export function useLeaderboardPlayers({
  currentUserId,
  limit,
}: Params = {}) {
  const { isRunning, secondsElapsed, topicName } = useGlobalTimer();

  // Latest timer state in a ref → feed through getLocalTimerState.
  const timerRef = useRef<LocalTimerState>({ isRunning, secondsElapsed, topicName });

  const [players, setPlayers] = useState<EsportsPlayer[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    timerRef.current = { isRunning, secondsElapsed, topicName };
    // cheap push; service no-ops until ready & emits deterministically
  }, [isRunning, secondsElapsed, topicName]);

  useEffect(() => {
    const handle = initializeLeaderboardRealtime({
      currentUserId: currentUserId ?? null,
      onPlayersUpdate: (p) => {
        setPlayers(p);
        setReady(true);
      },
      showOwnLiveTime: true,
      getLocalTimerState: () => timerRef.current,
      limit,
    });

    const poll = setInterval(() => { handle.refresh(); }, 30_000);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') handle.refresh();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(poll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      handle.destroy();
    };
  }, [currentUserId, limit]);

  // memoize so lists don't re-render chains unnecessarily
  const value = useMemo(() => ({ players, ready }), [players, ready]);
  return value;
}