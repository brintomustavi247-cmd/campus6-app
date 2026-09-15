import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useGlobalTimer } from '../contexts/TimerContext';

const LIVE_FRESH_MS = 3 * 60 * 1000;

interface LiveStats {
  totalMinutes: number;
  liveMinutes: number;
  unsyncedMinutes: number;
  xp: number;
  level: number;
  rank: number | null;
  isLive: boolean;
  sessionsCount: number;
  todayMinutes: number;
}

export function useLivePersonalStats(userId: string | null, todayKey?: string) {
  const { isRunning, secondsElapsed } = useGlobalTimer();
  const [userRow, setUserRow] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [rank, setRank] = useState<number | null>(null);

  // live user row
  useEffect(() => {
    if (!userId) return;
    let chan: any;
    let alive = true;
    const fetch = async () => {
      const { data } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
      if (!alive || !data) return;
      setUserRow(data);
      // rank
      try {
        const myTime = Number(data.total_study_time || 0);
        const { count } = await supabase.from('users').select('*', { count: 'exact', head: true }).gt('total_study_time', myTime);
        const { data: tied } = await supabase.from('users').select('id').eq('total_study_time', myTime);
        const ahead = (tied || []).filter((r: any) => String(r.id) < String(userId)).length;
        setRank((count || 0) + ahead + 1);
      } catch {}
    };
    fetch();
    chan = supabase.channel(`live-stats-${userId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `id=eq.${userId}` }, (p: any) => {
      if (p.new) setUserRow((prev: any) => ({ ...(prev || {}), ...p.new }));
    }).subscribe();
    const t = setInterval(fetch, 20_000);
    return () => { alive = false; clearInterval(t); if (chan) supabase.removeChannel(chan).catch(()=>{}); };
  }, [userId]);

  // sessions (personal storage — each timer chunk → study_sessions row → leaderboard)
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    let chan: any;
    const load = async () => {
      const { data } = await supabase.from('study_sessions').select('*').eq('user_id', userId).order('completed_at', { ascending: false }).limit(50);
      if (!alive) return;
      setSessions(data || []);
    };
    load();
    chan = supabase.channel(`live-sess-${userId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'study_sessions', filter: `user_id=eq.${userId}` }, load).subscribe();
    const t = setInterval(load, 15_000);
    const onDone = () => setTimeout(load, 800);
    window.addEventListener('campus6:timer-completed', onDone);
    return () => { alive = false; clearInterval(t); window.removeEventListener('campus6:timer-completed', onDone); if (chan) supabase.removeChannel(chan).catch(()=>{}); };
  }, [userId]);

  const stats: LiveStats = useMemo(() => {
    const totalRaw = Number(userRow?.total_study_time || 0);
    const liveRaw = Number(userRow?.live_study_minutes || 0);
    const liveMin = Number.isFinite(liveRaw) ? Math.max(0, Math.floor(liveRaw)) : 0;
    const status = String(userRow?.current_status || '').toLowerCase();
    const updatedMs = userRow?.updated_at ? new Date(userRow.updated_at).getTime() : 0;
    const fresh = status === 'focus' && updatedMs > 0 && Date.now() - updatedMs < LIVE_FRESH_MS;
    const unsynced = isRunning ? Math.max(0, Math.floor(secondsElapsed / 60) - (fresh ? liveMin : 0)) : 0;
    const effectiveLive = fresh ? liveMin : 0;
    const totalMinutes = Math.floor(totalRaw) + effectiveLive + unsynced;
    const xp = Math.floor(Number(userRow?.xp || 0)) + effectiveLive * 10 + unsynced * 10;
    const level = Math.floor(xp / 1000) + 1;
    const isLive = fresh || isRunning;
    const todayMinutes = todayKey ? sessions.filter((s: any) => s.date_key === todayKey).reduce((a: number, s: any) => a + Number(s.duration_minutes || 0), 0) + effectiveLive + unsynced : totalMinutes;
    return { totalMinutes, liveMinutes: effectiveLive, unsyncedMinutes: unsynced, xp, level, rank, isLive, sessionsCount: sessions.length, todayMinutes };
  }, [userRow, isRunning, secondsElapsed, rank, sessions, todayKey]);

  return { userRow, sessions, stats, rank };
}
