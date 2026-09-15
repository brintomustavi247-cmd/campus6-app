import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile } from '../types';
import { PageId } from '../components/Sidebar';
import { RankBadge } from '../components/RankBadge';
import {
  Trophy,
  Zap,
  Flame,
  CheckCircle2,
  ArrowRight,
  Share2,
  Copy,
  Gamepad2,
  Medal,
  Swords,
  Clock,
  Timer,
  History,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useGlobalTimer } from '../contexts/TimerContext';

interface ProfilePremiumViewProps {
  profile: UserProfile;
  todayKey: string;
  onNavigate: (page: PageId) => void;
  onOpenShareModal?: () => void;
}

interface LiveUserRow {
  id: string;
  total_study_time?: number | null;
  live_study_minutes?: number | null;
  xp?: number | null;
  current_rank?: string | null;
  current_status?: string | null;
  updated_at?: string | null;
}

interface SessionRow {
  id: string;
  topic_name: string;
  duration_minutes: number;
  mode?: string | null;
  date_key?: string | null;
  completed_at?: string | null;
  created_at?: string | null;
}

const LIVE_FRESH_MS = 3 * 60 * 1000;

export const ProfilePremiumView: React.FC<ProfilePremiumViewProps> = ({
  profile,
  todayKey,
  onNavigate,
  onOpenShareModal,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'achievements'>('overview');
  const [dbUser, setDbUser] = useState<LiveUserRow | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [periodKey, setPeriodKey] = useState(0); // bump to re-fetch sessions
  const { isRunning, secondsElapsed } = useGlobalTimer();

  const uid = profile.uid;

  // ── Fetch live user row + realtime subscription ──────────────────────────
  useEffect(() => {
    if (!uid || uid === '' ) return;
    let chan: any = null;
    let alive = true;

    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('id', uid).maybeSingle();
        if (!alive) return;
        if (!error && data) {
          setDbUser(data as LiveUserRow);
          // fetch rank (head count)
          try {
            const myTime = Number(data.total_study_time || 0);
            const { count } = await supabase.from('users').select('*', { count: 'exact', head: true }).gt('total_study_time', myTime);
            if (!alive) return;
            // tie breaker naive (without live) — good enough for profile badge
            const { data: tied } = await supabase.from('users').select('id').eq('total_study_time', myTime);
            const aheadTied = (tied || []).filter((r: any) => String(r.id) < String(uid)).length;
            setRank((count || 0) + aheadTied + 1);
          } catch {}
        }
      } catch (e) {
        console.warn('[ProfilePremium] user fetch failed', e);
      }
    };

    fetchUser();

    // Realtime: listen to users changes for this id
    try {
      chan = supabase
        .channel(`profile-live-${uid}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `id=eq.${uid}` }, (payload: any) => {
          if (!alive) return;
          const row = (payload.new || payload.old) as LiveUserRow;
          if (row && row.id === uid) {
            setDbUser((prev) => ({ ...(prev || {}), ...row } as LiveUserRow));
          }
        })
        .subscribe();
    } catch (e) {
      console.warn('[ProfilePremium] realtime failed', e);
    }

    const poll = setInterval(fetchUser, 20_000);
    return () => {
      alive = false;
      clearInterval(poll);
      if (chan) supabase.removeChannel(chan).catch(() => {});
    };
  }, [uid, periodKey]);

  // ── Fetch study_sessions history (live) ────────────────────────────────
  useEffect(() => {
    if (!uid || uid === '') return;
    let alive = true;
    let channel: any = null;

    const load = async () => {
      try {
        const { data } = await supabase
          .from('study_sessions')
          .select('id, topic_name, duration_minutes, mode, date_key, completed_at, created_at')
          .eq('user_id', uid)
          .order('completed_at', { ascending: false })
          .limit(30);
        if (!alive) return;
        setSessions((data as SessionRow[]) || []);
      } catch (e) {
        console.warn('[ProfilePremium] sessions fetch failed', e);
      }
    };

    load();

    // realtime for new sessions
    try {
      channel = supabase
        .channel(`sessions-live-${uid}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'study_sessions', filter: `user_id=eq.${uid}` }, () => {
          load();
        })
        .subscribe();
    } catch {}

    const t = setInterval(load, 15_000);
    const onSessionDone = () => setTimeout(load, 800);
    window.addEventListener('campus6:timer-completed', onSessionDone);
    return () => {
      alive = false;
      clearInterval(t);
      window.removeEventListener('campus6:timer-completed', onSessionDone);
      if (channel) supabase.removeChannel(channel).catch(()=>{});
    };
  }, [uid]);

  // ── Derived live stats (personal account storage = timer → supabase → here) ──
  const live = useMemo(() => {
    const totalRaw = Number(dbUser?.total_study_time || 0);
    const liveRaw = Number((dbUser as any)?.live_study_minutes || 0);
    const liveMin = Number.isFinite(liveRaw) ? Math.max(0, Math.round(liveRaw * 100) / 100) : 0;
    const status = String(dbUser?.current_status || '').toLowerCase();
    const updatedMs = dbUser?.updated_at ? new Date(dbUser.updated_at).getTime() : 0;
    const fresh = status === 'focus' && updatedMs > 0 && Date.now() - updatedMs < LIVE_FRESH_MS;
    const effectiveLive = fresh ? liveMin : 0;
    // fractional gap since last publish (avoids double-count)
    const remainder = isRunning ? (secondsElapsed % 60) / 60 : 0;
    const gapRaw = isRunning ? Math.max(0, Math.round((remainder - (effectiveLive % 1)) * 100) / 100) : 0;
    const selfUnsynced = gapRaw > 0.01 ? gapRaw : 0;
    const effectiveTotal = Math.round((Math.floor(totalRaw) + effectiveLive + selfUnsynced) * 100) / 100;
    const effectiveXp = Math.floor(Number(dbUser?.xp || 0)) + Math.round((effectiveLive + selfUnsynced) * 10);
    const level = Math.floor(effectiveXp / 1000) + 1;
    const isLive = fresh || isRunning;
    return { totalRaw, liveMin, effectiveLive, selfUnsynced, effectiveTotal, effectiveXp, level, isLive, fresh };
  }, [dbUser, isRunning, secondsElapsed, uid]);

  const tier = (dbUser as any)?.current_rank || (dbUser as any)?.tier || 'SPARK III';
  const xp = live.effectiveXp;
  const level = live.level;
  const totalMinutes = live.effectiveTotal;
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMinsRem = totalMinutes % 60;

  const todaySessions = useMemo(() => sessions.filter((s) => s.date_key === todayKey), [sessions, todayKey]);
  const todayMinutes = useMemo(() => todaySessions.reduce((a, s) => a + Number(s.duration_minutes || 0), 0), [todaySessions]);
  // include live uncommitted for today view when running
  const todayLiveExtra = live.isLive ? Math.max(0, Math.floor(secondsElapsed / 60) - (live.fresh ? 0 : 0)) : 0;
  // Actually live minutes belong to today (since uncommitted is today's date). Add if running.
  const todayTotalWithLive = todayMinutes + (isRunning ? Math.max(0, Math.floor(secondsElapsed/60) - Math.floor(Number(live.liveMin||0) - Math.floor(live.selfUnsynced||0))) : 0);
  // Simpler: today total = todayMinutes + selfUnsynced when isLive (since selfUnsynced is unflushed)
  const todayEffective = todayMinutes + (live.isLive ? live.selfUnsynced : 0) + (live.fresh ? live.liveMin : 0) // but liveMin duplicates today committed? For today, committed includes today's chunk; live is extra. So okay.
  // Let's use todayMinutes already counts committed chunks (which are today's rows). Live not yet committed => add effectiveLive+selfUnsynced but careful double: live.liveMin already not in todayMinutes (since not committed). So todayEffective = todayMinutes + live.effectiveLive + live.selfUnsynced? But live.effectiveLive is liveMin only when fresh.
  // Simplify display: todayMinutes includes committed only, we add live fresh + unsynced.
  const todayDisplayMinutes = todayMinutes + live.effectiveLive + live.selfUnsynced;

  const sessionsCount = sessions.length;
  const weeklyMinutes = useMemo(() => {
    // last 7 days from sessions + live
    const now = new Date();
    const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 6);
    let sum = 0;
    sessions.forEach((s) => {
      if (!s.date_key) return;
      const d = new Date(s.date_key + 'T00:00:00');
      if (d >= weekAgo) sum += Number(s.duration_minutes || 0);
    });
    return sum + live.effectiveLive + live.selfUnsynced;
  }, [sessions, live.effectiveLive, live.selfUnsynced]);

  const progressPct = Math.min(100, Math.round(((level * 1000 - (1000 - (xp % 1000))) / (level * 1000)) * 100) || Math.min(95, (xp % 1000) / 10));

  return (
    <div className="profile-premium w-full max-w-4xl mx-auto overflow-x-hidden px-4 sm:px-5 pb-24">
      {/* Header */}
      <header className="p-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surface border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#DC2626]">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-wider text-text-primary">ZENO LEAGUE</h2>
            <p className="text-[10px] font-mono text-gold">ESPORTS EDITION • LIVE</p>
          </div>
        </div>

        <div className="p-header-actions">
          {onOpenShareModal && (
            <button onClick={onOpenShareModal} className="p-header-btn" title="Share Status">
              <Share2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => onNavigate('dashboard')} className="p-header-btn" title="Exit to Standard View">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero — live indicator */}
      <section className="p-hero">
        <div className="p-avatar-wrap mb-4">
          <div className="p-avatar-ring" style={{ borderColor: live.isLive ? '#10B981' : undefined, opacity: live.isLive ? 1 : 0.6 }} />
          <div className="p-avatar-inner flex items-center justify-center">
            {profile.photoURL ? (
              <img
                src={profile.photoURL}
                alt="Avatar"
                className="rounded-full object-cover w-full h-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-surface-muted flex items-center justify-center text-4xl font-bold text-gold">
                {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </div>
          <div className="p-online" style={{ background: live.isLive ? '#10B981' : undefined }}>
            <div className="p-online-dot" style={{ animation: live.isLive ? 'pulse 1.2s infinite' : undefined }} />
          </div>
        </div>

        <div className="p-name">
          <h1 className="flex items-center justify-center gap-2">
            {profile.displayName || 'PHANTOM'}
            {live.isLive && <span className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">LIVE STUDYING</span>}
          </h1>
          <p className="p-handle">@{profile.targetUniversity || 'ELITE_SQUAD'} • {profile.academicGroup}</p>
          {rank && <p className="text-[11px] font-mono text-gold mt-1">🏆 RANK #{rank} • {totalMinutes.toLocaleString()} MINUTES • {sessionsCount} SESSIONS</p>}
        </div>

        <div className="p-uid">
          <span className="p-uid-label">UID</span>
          <span className="p-uid-value">{profile.uid?.slice(0, 8).toUpperCase() || 'NEW-USER'}</span>
          <button className="p-uid-copy" title="Copy UID" onClick={() => navigator.clipboard.writeText(profile.uid || '')}>
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* LIVE TIMER personal storage bar */}
        <div className="mt-4 w-full max-w-md mx-auto rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)' }}>
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">Personal Storage</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">LIVE FROM TIMER</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-black font-mono text-white">{totalHours}h {String(totalMinsRem).padStart(2,'0')}m</p>
            <p className="text-[10px] font-mono text-slate-400">{xp.toLocaleString()} XP • Direct to Leaderboard</p>
          </div>
        </div>
      </section>

      {/* Rank Card — live */}
      <section className="p-rank">
        <div className="p-rank-header">
          <div>
            <p className="p-rank-label">CURRENT DIVISION {live.isLive && <span className="ml-2 text-emerald-400 animate-pulse">● LIVE</span>}</p>
            <h3 className="p-rank-title text-2xl sm:text-3xl md:text-4xl font-bold wrap-break-word whitespace-normal tracking-tight">⚡ {tier}</h3>
            <p className="text-[11px] font-mono text-slate-400 mt-1">Rank #{rank || '—'} • Every minute from Timer counts instantly</p>
          </div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0">
            <RankBadge rank={tier} size={80} animated />
          </div>
        </div>

        <div className="space-y-1.5 mb-4">
          <div className="p-rank-labels">
            <span>LEVEL {level}</span>
            <span className="text-gold">{xp.toLocaleString()} / {level * 1000} RP</span>
          </div>
          <div className="p-rank-track">
            <div className="p-rank-fill" style={{ width: `${Math.min(95, (xp % 1000)/10)}%` }} />
            <div className="p-rank-milestone" style={{ left: '25%' }} />
            <div className="p-rank-milestone" style={{ left: '50%' }} />
            <div className="p-rank-milestone" style={{ left: '75%' }} />
          </div>
          <p className="text-[10px] text-slate-500 font-mono">Live: +{live.effectiveLive + live.selfUnsynced}m uncommitted • Timer chunks auto-save every 60s + live preview every 12s</p>
        </div>
      </section>

      {/* Tabs */}
      <section className="p-tabs">
        <div className="p-tabs-list w-full flex flex-nowrap overflow-x-auto scrollbar-hide gap-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`p-tab shrink-0 ${activeTab === 'overview' ? 'active' : ''}`}
          >
            OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`p-tab shrink-0 ${activeTab === 'matches' ? 'active' : ''}`}
          >
            STUDY SESSIONS ({sessionsCount})
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`p-tab shrink-0 ${activeTab === 'achievements' ? 'active' : ''}`}
          >
            TROPHIES
          </button>
        </div>
      </section>

      {/* Content */}
      <div className="p-panel">
        {activeTab === 'overview' && (
          <>
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-balance w-full h-full">
                <p className="p-balance-label">TOTAL TIME (LIVE)</p>
                <div className="p-balance-row">
                  <span className="p-balance-num text-2xl">{totalHours}h {String(totalMinsRem).padStart(2,'0')}m</span>
                  <span className="p-balance-unit">LIVE</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">Direct from Timer → Supabase → Leaderboard</p>
                <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Every completed minute = +10 XP auto</p>
                <div className="p-balance-actions mt-3">
                  <button onClick={() => onNavigate('focus_timer')} className="p-btn p-btn-primary">
                    <Clock className="w-4 h-4"/> OPEN TIMER
                  </button>
                  <button className="p-btn-icon" onClick={() => setPeriodKey((k)=>k+1)}>
                    <History className="w-5 h-5 text-gold" />
                  </button>
                </div>
              </div>

              <div className="p-stat h-full flex flex-col justify-center">
                <p className="p-stat-label flex items-center gap-1"><Calendar className="w-3 h-3"/> TODAY</p>
                <p className="p-stat-value accent text-2xl">
                  {Math.floor(todayDisplayMinutes/60)}h {String(todayDisplayMinutes%60).padStart(2,'0')}m
                </p>
                <p className="text-[11px] text-slate-400 font-mono">{todaySessions.length} sessions today • Live + committed</p>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden bg-white/5">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${Math.min(100, (todayDisplayMinutes/480)*100)}%` }}/>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Goal 8h • {Math.round((todayDisplayMinutes/480)*100)}%</p>
              </div>

              <div className="p-stat h-full flex flex-col justify-center">
                <p className="p-stat-label">THIS WEEK • SESSIONS</p>
                <p className="p-stat-value text-2xl">
                  {sessionsCount}<span className="p-stat-suffix text-sm"> sessions</span>
                </p>
                <p className="text-[11px] text-slate-400 font-mono">{weeklyMinutes} mins this week • Live ranked</p>
                <p className="text-[10px] text-gold mt-1">XP: {xp.toLocaleString()} • Level {level}</p>
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] font-bold tracking-widest text-slate-500">LIVE STATUS</p>
                <p className={`text-sm font-black mt-1 ${live.isLive ? 'text-emerald-400' : 'text-slate-400'}`}>{live.isLive ? '● FOCUSING NOW' : '○ IDLE'}</p>
                <p className="text-[10px] text-slate-500">{live.isLive ? `+${live.effectiveLive + live.selfUnsynced}m live` : 'Start timer to go live'}</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] font-bold tracking-widest text-slate-500">TOTAL SESSIONS</p>
                <p className="text-sm font-black mt-1 text-white">{sessionsCount}</p>
                <p className="text-[10px] text-slate-500">Times you studied → leaderboard</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] font-bold tracking-widest text-slate-500">AVG / SESSION</p>
                <p className="text-sm font-black mt-1 text-white">{sessionsCount ? Math.round(totalMinutes / sessionsCount) : 0}m</p>
                <p className="text-[10px] text-slate-500">Average focus length</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] font-bold tracking-widest text-slate-500">RANK</p>
                <p className="text-sm font-black mt-1 text-gold">#{rank || '—'}</p>
                <p className="text-[10px] text-slate-500">Live leaderboard position</p>
              </div>
            </div>

            <div className="p-ref-code">
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">PERSONAL STORAGE ID</p>
                <p className="p-ref-code-value text-xs break-all">{uid}</p>
                <p className="text-[10px] text-slate-500 mt-1">All timer data auto-saved to Supabase → Leaderboard live</p>
              </div>
              <button className="p-ref-copy" onClick={() => navigator.clipboard.writeText(uid || '')}>
                <Copy className="w-4 h-4" /> COPY
              </button>
            </div>
          </>
        )}

        {activeTab === 'matches' && (
          <div className="p-card overflow-hidden w-full">
            <div className="flex items-center justify-between mb-4">
              <h4 className="p-card-title">RECENT STUDY SESSIONS</h4>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">LIVE • {sessions.length} total</span>
            </div>

            {/* Live currently running */}
            {isRunning && (
              <div className="mb-3 rounded-xl p-3 flex items-center justify-between" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 8px #34D399' }} />
                  <div>
                    <p className="text-sm font-bold text-white">Studying now — {Math.floor(secondsElapsed/60)}m {String(secondsElapsed%60).padStart(2,'0')}s</p>
                    <p className="text-[11px] text-emerald-300">Live → will appear in leaderboard in ~12s & permanently after 60s chunk</p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-1 rounded bg-emerald-500 text-white">LIVE</span>
              </div>
            )}

            {sessions.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <History className="w-8 h-8 mx-auto mb-2 text-slate-500"/>
                <p className="text-sm">No sessions yet — your reads will appear here live</p>
                <p className="text-xs mt-1">Start the Focus Timer; every minute counts toward ranking.</p>
                <button onClick={() => onNavigate('focus_timer')} className="mt-4 px-4 py-2 rounded-xl text-xs font-black" style={{ background: '#FBBF24', color: '#0F111A' }}>Start 25min Focus</button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {sessions.map((s) => {
                  const d = s.completed_at || s.created_at || '';
                  const when = d ? new Date(d).toLocaleString('bn-BD', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : s.date_key || '';
                  return (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{s.topic_name || 'General Study'}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>{when}</span>
                          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">{s.mode || 'focus'}</span>
                          <span>• {s.date_key}</span>
                        </p>
                      </div>
                      <span className="ml-3 shrink-0 text-sm font-black font-mono px-2.5 py-1 rounded-lg" style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.25)' }}>
                        +{Number(s.duration_minutes || 0).toFixed(1)}m
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-[10px] text-slate-500 font-mono mt-3 text-center">Personal account storage: every timer completion → study_sessions row → total_study_time increment → leaderboard live via Supabase Realtime</p>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="p-card w-full">
            <h4 className="p-card-title">TROPHY ROOM</h4>
            <div className="p-achieve-grid mb-5">
              <div className={`p-achieve-item ${totalMinutes > 0 ? 'unlocked' : ''}`}>
                {totalMinutes > 0 && <CheckCircle2 className="p-achieve-check w-3 h-3" />}
                <span className="p-achieve-icon">🏆</span>
                <span className="p-achieve-title">First Study</span>
              </div>
              <div className={`p-achieve-item ${sessionsCount >= 5 ? 'unlocked' : ''}`}>
                {sessionsCount >= 5 && <CheckCircle2 className="p-achieve-check w-3 h-3" />}
                <span className="p-achieve-icon">🔥</span>
                <span className="p-achieve-title">5 Sessions</span>
              </div>
              <div className={`p-achieve-item ${totalHours >= 10 ? 'unlocked' : ''}`}>
                {totalHours >= 10 && <CheckCircle2 className="p-achieve-check w-3 h-3" />}
                <span className="p-achieve-icon">⚡</span>
                <span className="p-achieve-title">10 Hours</span>
              </div>
              <div className={`p-achieve-item ${totalHours >= 50 ? 'unlocked' : ''}`}>
                {totalHours >= 50 && <CheckCircle2 className="p-achieve-check w-3 h-3" />}
                <span className="p-achieve-icon opacity-30">👑</span>
                <span className="p-achieve-title opacity-50">Champion (50h)</span>
              </div>
              <div className={`p-achieve-item ${level >= 10 ? 'unlocked' : ''}`}>
                {level >= 10 && <CheckCircle2 className="p-achieve-check w-3 h-3" />}
                <span className="p-achieve-icon opacity-30">🎯</span>
                <span className="p-achieve-title opacity-50">Level 10</span>
              </div>
            </div>

            <h4 className="p-card-title">LIVE STATS</h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <p className="text-2xl font-black text-gold">{totalMinutes.toLocaleString()}</p>
                <p className="text-[10px] font-mono text-slate-400">TOTAL MINUTES (LIVE)</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <p className="text-2xl font-black text-emerald-400">{sessionsCount}</p>
                <p className="text-[10px] font-mono text-slate-400">TIMES STUDIED</p>
              </div>
            </div>

            <h4 className="p-card-title">MILESTONES</h4>
            <div className={`p-milestone ${totalHours >= 10 ? 'done' : 'locked'}`}>
              <Medal className={`w-4 h-4 ${totalHours >= 10 ? 'text-success' : 'text-text-muted'}`} />
              <span className={`text-xs font-bold flex-1 ${totalHours >= 10 ? 'text-text-primary' : 'text-text-muted'}`}>Log 10 Hours ({totalHours}h)</span>
              <span className="text-[10px] font-mono text-gold">{Math.min(totalHours,100)}/100</span>
            </div>
            <div className={`p-milestone ${sessionsCount >= 20 ? 'done' : 'locked'}`}>
              <Swords className={`w-4 h-4 ${sessionsCount >= 20 ? 'text-success' : 'text-text-muted'}`} />
              <span className={`text-xs font-bold flex-1 ${sessionsCount >= 20 ? 'text-text-primary' : 'text-text-muted'}`}>Complete 20 Sessions ({sessionsCount})</span>
              <span className="text-[10px] font-mono text-text-muted">{sessionsCount}/20</span>
            </div>
            <div className={`p-milestone ${xp >= 5000 ? 'done' : 'locked'}`}>
              <Trophy className={`w-4 h-4 ${xp >= 5000 ? 'text-success' : 'text-text-muted'}`} />
              <span className={`text-xs font-bold flex-1 ${xp >= 5000 ? 'text-text-primary' : 'text-text-muted'}`}>Earn 5000 XP ({xp.toLocaleString()})</span>
              <span className="text-[10px] font-mono text-text-muted">{xp}/5000</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePremiumView;
