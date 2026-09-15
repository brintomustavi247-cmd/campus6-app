import { useEffect, useMemo, useRef, useState } from 'react';
import {
  initializeLeaderboardRealtime,
  LocalTimerState,
} from '../services/leaderboardSync';
import { useGlobalTimer } from '../contexts/TimerContext';
import { EsportsPlayer } from '../components/squad/EsportsData';
import { PeriodType, periodKeyFor } from '../utils/periodKeys';
import { supabase } from '../supabaseClient';

interface Params {
  currentUserId?: string | null;
  limit?: number;
  /** ⭐ 'daily' | 'weekly' | 'monthly' | 'all' (default 'all') */
  period?: PeriodType;
}

/**
 * THE one hook every leaderboard screen uses.
 * v3 LIVE: period stats + live minutes overlay (DB live_study_minutes).
 * - For 'all' period, basePlayers already contains DB+live effective time (via leaderboardSync v9).
 * - For daily/weekly/monthly, we override with period minutes BUT preserve live minutes
 *   when the player is currently in focus (fresh). That makes daily board also move live.
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

  // ⭐ Period stats fetch + refresh (10s for live-ish daily board)
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
    // Live: refresh period stats every 15s so daily board catches chunk commits quickly
    const poll = setInterval(fetchPeriod, 15_000);
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

  // ⭐ Merge period stats + live overlay + re-sort (period ranks live too)
  const players = useMemo(() => {
    let list = basePlayers;

    if (period !== 'all') {
      list = list.map((p) => {
        const st = periodStats[p.id];
        // keep decimals for period stats to avoid halving via floor
        const baseMinutes = st ? Math.round(Number(st.minutes) * 100) / 100 : 0;
        const baseXp = st ? Math.round(Number(st.xp)) : 0;
        const rawLive = Number((p as any)._liveMinutes ?? (p as any)._dbLiveRaw ?? 0);
        const liveAdd = p.isLive ? Math.max(0, Math.round(rawLive * 100) / 100) : 0;
        // self fractional gap since last publish (avoids double-count; at most ~0.2m)
        let selfGap = 0;
        if (p._isCurrentUser && p.isLive && timerRef.current?.isRunning) {
          const rem = (timerRef.current.secondsElapsed % 60) / 60;
          selfGap = Math.max(0, Math.round((rem - (liveAdd % 1)) * 100) / 100);
          if (selfGap < 0.01) selfGap = 0;
          if (selfGap > 0.99) selfGap = 0.99;
        }
        const minutes = Math.round((baseMinutes + liveAdd + selfGap) * 100) / 100;
        const xp = Math.round((baseXp + (liveAdd + selfGap) * 10));
        return {
          ...p,
          studyTime: minutes,
          xp,
          level: Math.floor(xp / 1000) + 1,
          nextLevelXp: (Math.floor(xp / 1000) + 2) * 1000,
        } as EsportsPlayer;
      });
      // Re-sort for period view so ranks reflect period minutes + live
      list = [...list].sort((a, b) => {
        if ((b.studyTime || 0) !== (a.studyTime || 0)) return (b.studyTime || 0) - (a.studyTime || 0);
        if ((b.xp || 0) !== (a.xp || 0)) return (b.xp || 0) - (a.xp || 0);
        return String(a.id).localeCompare(String(b.id));
      });
      list.forEach((p, i) => { p.rank = i + 1; });
    }

    return list;
  }, [basePlayers, periodStats, period]);

  const value = useMemo(() => ({ players, ready }), [players, ready]);
  return value;
}
