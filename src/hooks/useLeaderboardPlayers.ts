import { useEffect, useMemo, useRef, useState } from 'react';
import {
  initializeLeaderboardRealtime,
  LocalTimerState,
} from '../services/leaderboardSync';
import { useGlobalTimer } from '../contexts/TimerContext';
import { EsportsPlayer } from '../components/squad/EsportsData';
import { applyDemoOverlay } from '../utils/demoActivitySimulator';
import { PeriodType, periodKeyFor } from '../utils/periodKeys';
import { supabase } from '../supabaseClient';

interface Params {
  currentUserId?: string | null;
  limit?: number;
  /** ⭐ NEW: 'daily' | 'weekly' | 'monthly' | 'all' (default 'all') */
  period?: PeriodType;
}

/**
 * THE one hook every leaderboard screen uses.
 * v2: period support (daily/weekly/monthly) + demo activity overlay।
 */
export function useLeaderboardPlayers({
  currentUserId,
  limit,
  period = 'all',
}: Params = {}) {
  const { isRunning, secondsElapsed, topicName } = useGlobalTimer();

  const timerRef = useRef<LocalTimerState>({ isRunning, secondsElapsed, topicName });

  const [basePlayers, setBasePlayers] = useState<EsportsPlayer[]>([]);
  const [periodStats, setPeriodStats] = useState<Record<string, { minutes: number; xp: number }>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    timerRef.current = { isRunning, secondsElapsed, topicName };
  }, [isRunning, secondsElapsed, topicName]);

  // ⭐ Period stats fetch + refresh
  useEffect(() => {
    let alive = true;
    const key = periodKeyFor(period);

    const fetchPeriod = async () => {
      if (period === 'all' || !key) {
        if (alive) setPeriodStats({});
        return;
      }
      try {
        const { data } = await supabase
          .from('user_period_stats')
          .select('user_id, minutes, xp')
          .eq('period_type', period)
          .eq('period_key', key);
        if (!alive) return;
        const map: Record<string, { minutes: number; xp: number }> = {};
        (data || []).forEach((r: any) => {
          map[r.user_id] = { minutes: Number(r.minutes || 0), xp: Number(r.xp || 0) };
        });
        setPeriodStats(map);
      } catch (err) {
        console.warn('[Leaderboard] period fetch failed:', err);
      }
    };

    fetchPeriod();
    const poll = setInterval(fetchPeriod, 30_000);
    return () => { alive = false; clearInterval(poll); };
  }, [period]);

  useEffect(() => {
    const handle = initializeLeaderboardRealtime({
      currentUserId: currentUserId ?? null,
      onPlayersUpdate: (p) => {
        setBasePlayers(p);
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

  // ⭐ Merge: period override → demo overlay
  const players = useMemo(() => {
    let list = basePlayers;

    if (period !== 'all') {
      list = list.map((p) => {
        const st = periodStats[p.id];
        const minutes = st ? Math.floor(st.minutes) : 0;
        const xp = st ? st.xp : 0;
        return {
          ...p,
          studyTime: minutes,
          xp,
          level: Math.floor(xp / 1000) + 1,
          nextLevelXp: (Math.floor(xp / 1000) + 2) * 1000,
          // period view-তে live overlay পরে বসবে
        } as EsportsPlayer;
      });
    }

    // Demo/public players simulation (current user বাদে)
    return applyDemoOverlay(list);
  }, [basePlayers, periodStats, period]);

  const value = useMemo(() => ({ players, ready }), [players, ready]);
  return value;
}