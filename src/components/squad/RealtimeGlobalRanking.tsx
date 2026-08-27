import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLeaderboardPlayers } from '../../hooks/useLeaderboardPlayers';
import { EsportsPlayer } from './EsportsData';

// ═══════════════════════════════════════════════════════════
// CAMPUS 6.0 PRO — PODIUM LEADERBOARD (mockup-exact UI, live data)
// v11: sticky personal-rank bar (floats over list, clears mobile
//      bottom-nav, desktop-sized), clean deterministic ranking
// ═══════════════════════════════════════════════════════════
const C = {
  bgMain: '#10121b', bgCardHover: '#1e2130',
  border: 'rgba(255,255,255,0.06)',
  textMuted: '#8892b0',
  c1st: '#00E5FF', c2nd: '#FFD700', c3rd: '#FF4D4D',
  violet: '#8B5CF6', green: '#10B981',
};
const FONT_DISPLAY = "'Lexend', sans-serif";
const FONT_BODY = "'Plus Jakarta Sans', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

const fmt = (m: number): string => {
  const s = Math.max(0, Math.floor(m));
  const h = Math.floor(s / 60), r = s % 60;
  return h > 0 ? `${h}h ${String(r).padStart(2, '0')}m` : `${r}m`;
};

const avatarUrl = (p?: EsportsPlayer) =>
  p?.avatar && p.avatar.startsWith('http')
    ? p.avatar
    : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p?.name || 'Player')}&backgroundColor=171924`;

/* ─── Activity Tag (Studying / Break / …) ─── */
const ActivityTag: React.FC<{ p: EsportsPlayer }> = ({ p }) => {
  const cfg = p.isLive
    ? { t: 'STUDYING', cls: { background: 'rgba(16,185,129,0.15)', color: C.green } }
    : p._presenceStatus === 'break'
      ? { t: 'ON BREAK', cls: { background: 'rgba(249,115,22,0.15)', color: '#F97316' } }
      : null;
  if (!cfg) return null;
  return (
    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide" style={{ fontFamily: FONT_BODY, ...cfg.cls }}>
      {cfg.t}
    </span>
  );
};

/* ─── Static Green Dot ─── */
const Dot: React.FC<{ on?: boolean; big?: boolean }> = ({ on, big }) =>
  !on ? null : (
    <div className="absolute rounded-full" style={{
      bottom: 2, right: 2,
      width: big ? 14 : 12, height: big ? 14 : 12,
      backgroundColor: C.green, border: `${big ? 3 : 2}px solid ${C.bgMain}`,
    }} />
  );

/* ─── Top-3 Podium Card ─── */
const PodiumCard: React.FC<{ player: EsportsPlayer; rank: number }> = ({ player, rank }) => {
  const cfg = [
    { tag: C.c1st, ring: `conic-gradient(${C.c1st} 80%, transparent 80%)`, size: 90, score: C.c1st },
    { tag: '#fff',  ring: `conic-gradient(${C.c2nd} 60%, transparent 60%)`, size: 70, score: C.c2nd },
    { tag: C.c3rd, ring: `conic-gradient(${C.c3rd} 40%, transparent 40%)`, size: 70, score: C.c3rd },
  ][rank - 1];

  return (
    <div className="flex flex-col items-center relative shrink-0" style={{ marginBottom: rank !== 1 ? -15 : 0 }}>
      <div className="flex items-center gap-1 mb-2 text-[10px] font-extrabold uppercase"
        style={{ fontFamily: FONT_DISPLAY, color: cfg.tag, marginBottom: 8 }}>
        {rank === 1 && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></svg>
        )}
        {rank === 1 ? '1ST' : rank === 2 ? '2ND' : '3RD'}
      </div>

      <div className="rounded-full flex justify-center items-center relative" style={{ width: cfg.size, height: cfg.size, background: cfg.ring, padding: 4 }}>
        <div className="w-full h-full rounded-full overflow-hidden relative border-[3px]" style={{ background: C.bgMain }}>
          <img src={avatarUrl(player)} alt={player.name} className="w-full h-full object-cover" />
          <Dot on={player.isOnline || player.isLive} big />
        </div>
      </div>

      <div className="flex flex-col items-center mt-3" style={{ gap: 4 }}>
        <p className="text-white font-bold leading-none" style={{ fontFamily: FONT_BODY, fontSize: rank === 1 ? 15 : 13 }}>
          {(player.username || player.name)?.slice(0, 14)}
        </p>
        <ActivityTag p={player} />
        {player._hasActiveTimer && (
          <span className="text-[8px] font-bold animate-pulse" style={{ color: C.violet }}>⏱ LIVE SESSION</span>
        )}
        <span className="font-extrabold font-mono" style={{ fontSize: rank === 1 ? 16 : 14, color: cfg.score, marginTop: 2 }}>
          {fmt(player.studyTime)}
        </span>
      </div>
    </div>
  );
};

/* ─── Rank 4+ Row ─── */
const Row: React.FC<{ player: EsportsPlayer; isMe: boolean; onClick: () => void }> = ({ player, isMe, onClick }) => (
  <div onClick={onClick}
    className="flex items-center justify-between cursor-pointer transition-all duration-200 hover:bg-[#1e2130]"
    style={{
      padding: '12px 16px', borderRadius: 16,
      background: isMe ? 'rgba(139,92,246,0.1)' : 'transparent',
      border: isMe ? `1px solid rgba(139,92,246,0.3)` : '1px solid transparent',
    }}>
    <div className="flex items-center min-w-0" style={{ gap: 14 }}>
      <div className="flex flex-col items-center shrink-0" style={{ width: 22 }}>
        {player.trend === 'up' ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="3"><polyline points="18 15 12 9 6 15" /></svg>
        ) : player.trend === 'down' ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.c3rd} strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
        ) : <span style={{ height: 10 }} />}
        <span className="font-extrabold text-sm leading-none mt-1" style={{ fontFamily: FONT_DISPLAY, color: isMe ? C.violet : '#fff' }}>
          {player.rank}
        </span>
      </div>
      <div className="relative rounded-full shrink-0" style={{ width: 44, height: 44, padding: 2, background: `conic-gradient(${C.violet} 30%, ${C.border} 30%)` }}>
        <div className="w-full h-full rounded-full overflow-hidden relative border-2" style={{ borderColor: C.bgMain }}>
          <img src={avatarUrl(player)} alt="" className="w-full h-full object-cover" />
          <Dot on={player.isOnline || player.isLive} />
        </div>
      </div>
      <div className="flex flex-col min-w-0" style={{ gap: 4 }}>
        <h4 className="text-sm font-semibold text-white leading-none truncate">
          {isMe ? `${player.name} (You)` : (player.username || player.name)}
        </h4>
        <div className="flex items-center flex-wrap" style={{ gap: 6 }}>
          <span className="text-[9px] uppercase truncate" style={{ color: isMe ? C.violet : C.textMuted }}>{player.tier}</span>
          <ActivityTag p={player} />
          {player._hasActiveTimer && (
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(139,92,246,0.15)', color: C.violet }}>LIVE</span>
          )}
        </div>
      </div>
    </div>
    <div className="shrink-0 ml-2 text-right">
      <span className="font-mono text-sm font-extrabold" style={{ fontFamily: FONT_MONO, color: isMe ? C.violet : '#fff' }}>
        {fmt(player.studyTime)}
      </span>
    </div>
  </div>
);

/* ═════════ MAIN ═════════ */
export const RealtimeGlobalRanking: React.FC<{ currentUserId?: string | null }> = ({ currentUserId }) => {
  const { players, ready } = useLeaderboardPlayers({ currentUserId });
  const [metric, setMetric] = useState<'xp' | 'study'>('study');
  const [updatedAgo, setUpdatedAgo] = useState('Just now');
  const updatedAtRef = useRef<number>(Date.now());

  // "Updated Xs ago" ticker
  useEffect(() => {
    if (players.length) updatedAtRef.current = Date.now();
    const id = setInterval(() => {
      const sec = Math.floor((Date.now() - updatedAtRef.current) / 1000);
      setUpdatedAgo(sec < 5 ? 'Just now' : `${sec}s ago`);
    }, 1000);
    return () => clearInterval(id);
  }, [players]);

  // Deterministic per-metric ranking — identical order on EVERY device.
  // study/xp primary → secondary → unique id tie-break. No device-local math.
  const ranked = useMemo(() => {
    const list = [...players].sort((a, b) => {
      if (metric === 'study') {
        if ((b.studyTime || 0) !== (a.studyTime || 0)) return (b.studyTime || 0) - (a.studyTime || 0);
        if ((b.xp || 0) !== (a.xp || 0)) return (b.xp || 0) - (a.xp || 0);
      } else {
        if ((b.xp || 0) !== (a.xp || 0)) return (b.xp || 0) - (a.xp || 0);
        if ((b.studyTime || 0) !== (a.studyTime || 0)) return (b.studyTime || 0) - (a.studyTime || 0);
      }
      return String(a.id).localeCompare(String(b.id));
    });
    list.forEach((p, i) => { p.rank = i + 1; });
    return list;
  }, [players, metric]);

  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  const me = ranked.find((p) => p._isCurrentUser);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: C.bgMain, fontFamily: FONT_BODY, minHeight: 0 }}>

      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 z-0" style={{ height: 300, background: 'radial-gradient(ellipse at 50% 0%, rgba(0,229,255,0.12) 0%, transparent 70%)' }} />

      {/* Header */}
      <header className="shrink-0 relative z-10 flex justify-between items-center" style={{ padding: '24px 24px 10px' }}>
        <div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 800, color: C.c1st, textTransform: 'uppercase', letterSpacing: 1, textShadow: '0 0 10px rgba(0,229,255,0.3)' }}>Ranking</h1>
          <span style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>
            Last updated: {!ready ? 'Loading…' : updatedAgo}
          </span>
        </div>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.c1st} strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
      </header>

      {/* Tabs */}
      <div className="shrink-0 relative z-10 flex" style={{ gap: 10, padding: '10px 24px' }}>
        {(['xp', 'study'] as const).map((k) => (
          <button key={k} onClick={() => setMetric(k)}
            className="uppercase pb-1.5 transition-all"
            style={{ fontSize: 11, fontWeight: 700, fontFamily: FONT_DISPLAY, borderBottom: `2px solid ${metric === k ? C.c1st : 'transparent'}`, color: metric === k ? '#fff' : C.textMuted }}>
            {k === 'xp' ? 'XP RANKING' : 'STUDY TIME'}
          </button>
        ))}
      </div>

      {/* Scroll area */}
      <div className="flex-1 relative z-10 overflow-y-auto" style={{ paddingBottom: 160, scrollbarWidth: 'none' }}>
        {/* Podium */}
        {top3.length > 0 && (
          <div className="flex flex-nowrap justify-center items-end mb-2.5"
            style={{ gap: 15, padding: '20px 24px 30px', borderBottom: `1px solid ${C.border}` }}>
            {top3.length >= 2 && <PodiumCard player={top3[1]} rank={2} />}
            {top3.length >= 1 && <PodiumCard player={top3[0]} rank={1} />}
            {top3.length >= 3 && <PodiumCard player={top3[2]} rank={3} />}
          </div>
        )}

        {/* List */}
        <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rest.map((p) => (
            <Row key={p.id} player={p} isMe={!!p._isCurrentUser} onClick={() => {}} />
          ))}

          {!ready && (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 rounded-full animate-spin mb-4" style={{ border: `2px solid ${C.c1st}`, borderTopColor: 'transparent' }} />
              <p className="animate-pulse" style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: C.textMuted }}>Loading rankings…</p>
            </div>
          )}

          {ready && ranked.length === 0 && (
            <div className="text-center py-16">
              <p style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: C.textMuted }}>
                এখনো কেউ র‍্যাঙ্ক করেনি — টাইমার চালু করে প্রথম হও!
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Fixed rank bar: clears the mobile navigation and starts after the desktop sidebar. */}
      {me && (
        <div className="fixed z-9998 left-4 right-4 bottom-24 md:bottom-6 md:left-70 md:right-6 md:flex md:justify-end" style={{ pointerEvents: 'none' }}>
          <div className="flex justify-between items-center w-full md:w-140" style={{
            pointerEvents: 'auto',
            background: 'rgba(23,25,36,0.98)',
            border: `1px solid ${C.violet}`,
            borderRadius: 22,
            padding: '16px 20px',
            boxShadow: '0 12px 48px rgba(139,92,246,0.35), 0 12px 32px rgba(0,0,0,0.85)',
          }}>
            <div className="flex items-center min-w-0" style={{ gap: 16 }}>
              <div className="flex flex-col items-center justify-center shrink-0" style={{ width: 48 }}>
                <span className="uppercase text-center" style={{ fontSize: 10, fontWeight: 800, lineHeight: 1.1, color: C.violet, marginBottom: 3 }}>Your<br />Rank</span>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 800, color: C.violet, lineHeight: 1 }}>{me.rank}</span>
              </div>
              <div className="relative rounded-full shrink-0" style={{ width: 60, height: 60, padding: 2, background: C.violet }}>
                <div className="w-full h-full rounded-full overflow-hidden border-2 relative" style={{ borderColor: C.bgMain }}>
                  <img src={avatarUrl(me)} alt="" className="w-full h-full object-cover" />
                  <Dot on={me.isLive} big />
                </div>
                {me._hasActiveTimer && <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ border: `2px solid ${C.violet}` }} />}
              </div>
              <div className="flex flex-col min-w-0" style={{ gap: 4 }}>
                <h4 className="text-white font-bold truncate text-lg md:text-xl">{me.name}</h4>
                {me.isLive ? <ActivityTag p={me} /> : <span style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase' }}>Total Time</span>}
              </div>
            </div>
            <div className="shrink-0 ml-3 text-right">
              <span className="font-mono font-extrabold text-xl md:text-2xl" style={{ fontFamily: FONT_MONO, color: C.violet }}>{fmt(me.studyTime)}</span>
              <p style={{ fontSize: 10, marginTop: 3, color: C.textMuted, textTransform: 'uppercase' }}>Total Time</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeGlobalRanking;