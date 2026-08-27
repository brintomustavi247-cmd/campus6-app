import React from 'react';
import { UserProfile, FriendUser } from '../../types';
import { Trophy, ChevronUp, ChevronDown } from 'lucide-react';
import { useLeaderboardPlayers } from '../../hooks/useLeaderboardPlayers';

interface GlobalLeagueProps {
  profile: UserProfile;
  friends: FriendUser[]; // kept for compatibility; real board replaces mock neighbors
}

export const GlobalLeague: React.FC<GlobalLeagueProps> = ({ profile }) => {
  const { players, ready } = useLeaderboardPlayers({ currentUserId: profile.uid || null });

  // ── REAL ranked board ──────────────────────────────────────────────────
  const rawLeaderboard = players.map((p) => ({
    id: p.id,
    nickname: p._isCurrentUser ? `${p.name} (You)` : p.name,
    targetUniversity: p.target || 'BUET / DU',
    score: p.studyTime,          // REAL minutes from users.total_study_time
    rank: p.rank,
    tier: p.tier,
    isUser: !!p._isCurrentUser,
    isLive: !!p.isLive,
    isOnline: p.isOnline,
  }));

  // Neighborhood slice: user + 2 above + 2 below (fallback: top of board)
  const userIdx = rawLeaderboard.findIndex((u) => u.isUser);
  const center = userIdx >= 0 ? userIdx : 0;
  const startIdx = Math.max(0, center - 2);
  const endIdx = Math.min(rawLeaderboard.length, center + 3);
  const neighborhood = rawLeaderboard.slice(startIdx, endIdx);

  // Real XP progress for the logged-in player
  const me = players.find((p) => p._isCurrentUser);
  const xpPct = me && me.nextLevelXp > 0
    ? Math.min(100, Math.round((me.xp / me.nextLevelXp) * 100))
    : 0;
  const xpRemaining = me ? Math.max(0, me.nextLevelXp - me.xp) : 0;

  return (
    <div className="p-5 rounded-2xl bg-[#1E2030] border border-slate-800 shadow-lg space-y-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-600 via-emerald-400 to-yellow-400" />

      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wide">
            <Trophy className="w-5 h-5 text-amber-400" />
            Global League
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
            Neighborhood View · Live
          </p>
        </div>

        {/* User Tier Display — REAL values now */}
        <div className="text-right">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-400/10 text-amber-400 border border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
            {me?.tier || 'SPARK'}
          </span>
          <div className="mt-2 w-24 h-1.5 bg-[#0F111A] rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-amber-400 transition-all duration-700" style={{ width: `${xpPct}%` }} />
          </div>
          <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">
            {xpRemaining} XP to Next Rank
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {!ready && (
          <p className="text-center text-xs text-slate-500 py-6 animate-pulse">লিডারবোর্ড লোড হচ্ছে…</p>
        )}
        {ready && neighborhood.length === 0 && (
          <p className="text-center text-xs text-slate-500 py-6">এখনো কোনো প্লেয়ার নেই। টাইমার চালু করো!</p>
        )}

        {neighborhood.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              item.isUser
                ? 'bg-blue-600/10 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                : 'bg-[#0F111A] border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center w-6 shrink-0">
                <span className={`text-xs font-black font-mono ${item.isUser ? 'text-blue-400' : 'text-slate-500'}`}>
                  #{item.rank}
                </span>
                {/* Trend replaced by REAL live status dot */}
                {item.isLive ? (
                  <ChevronUp className="w-3 h-3 text-emerald-500" />
                ) : item.isOnline ? (
                  <ChevronDown className="w-3 h-3 opacity-0" />
                ) : null}
                {item.isLive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mb-0.5" />
                )}
              </div>

              <div>
                <h4 className="text-xs font-extrabold flex items-center gap-1.5">{item.nickname}</h4>
                <p className="text-[10px] text-slate-500 font-semibold">{item.targetUniversity}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${'text-amber-400 bg-amber-400/10 border-amber-400/30'}`}>
                {item.tier}
              </span>
              <span className="font-bold font-mono text-amber-400 text-xs w-12" title="মোট স্টাডি মিনিট">
                {Math.floor(item.score / 60)}h{String(item.score % 60).padStart(2, '0')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};