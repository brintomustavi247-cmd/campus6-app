import React from 'react';
import { Crown } from 'lucide-react';
import { useLeaderboardPlayers } from '../../hooks/useLeaderboardPlayers';

const fmtHours = (minutes: number): string =>
  `${Math.floor(minutes / 60)}:${String(Math.floor(minutes % 60)).padStart(2, '0')}`;

export const GlobalPodiumLeague: React.FC = () => {
  const { players, ready } = useLeaderboardPlayers();

  if (!ready) {
    return (
      <div className="py-24 text-center text-sm text-[#889299] animate-pulse">
        গ্লোবাল র‍্যাঙ্কিং লোড হচ্ছে…
      </div>
    );
  }

  const top3 = players.slice(0, 3);
  const rest = players.slice(3);

  const PodiumSpot: React.FC<{ p?: typeof players[number]; place: number }> = ({ p, place }) => {
    if (!p) return <div className="w-1/3 max-w-30" />;
    const borders = ['border-yellow-400', 'border-slate-300', 'border-amber-700'];
    const heights = ['h-40', 'h-32', 'h-24'];
    return (
      <div className="flex flex-col items-center w-1/3 max-w-30 relative z-10">
        <div className="relative -mb-6 z-30">
          {place === 1 && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400">
              <Crown className="w-6 h-6" fill="currentColor" />
            </div>
          )}
          <div className={`w-16 h-16 rounded-full bg-[#0F111A] border-2 ${borders[place - 1]} flex items-center justify-center text-white font-bold text-xl`}>
            {(typeof p.avatar === 'string' && p.avatar.slice(0, 1).toUpperCase()) || '?'}
          </div>
        </div>
        <div className={`w-full ${heights[place - 1]} bg-linear-to-t from-[#0F111A] via-[#161825] to-[#1E2030] rounded-t-lg border-t border-x border-[#1E2030]/80 flex flex-col items-center justify-start pt-8`}>
          <p className="text-white font-bold text-xs truncate w-full text-center px-1">{p.name}</p>
          <p className="text-[#889299] text-[10px] font-black uppercase mt-1">{fmtHours(p.studyTime)}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="pt-8 pb-4 px-2 relative flex items-end justify-center gap-1 sm:gap-4 h-64 border-b border-[#1E2030]/50">
        <PodiumSpot p={top3[1]} place={2} />
        <div className="flex flex-col items-center w-1/3 max-w-35 relative z-20">
          <div className="relative -mb-6 z-30">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400">
              <Crown className="w-6 h-6" fill="currentColor" />
            </div>
            <div className="w-20 h-20 rounded-full bg-[#0F111A] border-2 border-yellow-400 flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_30px_rgba(250,204,21,0.4)]">
              {(typeof top3[0]?.avatar === 'string' && top3[0].avatar.slice(0, 1).toUpperCase()) || '?'}
            </div>
          </div>
          <div className="w-full h-40 bg-linear-to-t from-[#0F111A] via-[#1a1c29] to-[#25283D] rounded-t-lg border-t border-x border-[#25283D]/80 flex flex-col items-center justify-start pt-10">
            <p className="text-white font-bold text-sm truncate w-full text-center px-1">{top3[0]?.name}</p>
            <p className="text-[#889299] text-[11px] font-black uppercase mt-1">
              {top3[0] ? fmtHours(top3[0].studyTime) : ''}
            </p>
          </div>
        </div>
        <PodiumSpot p={top3[2]} place={3} />
      </div>

      <div className="px-2 space-y-3">
        {rest.map((user) => (
          <div key={user.id} className={`flex items-center justify-between p-4 rounded-2xl bg-[#1E2030] hover:bg-[#25283D] transition-colors ${user._isCurrentUser ? 'ring-1 ring-blue-500' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="w-6 text-center shrink-0">
                <span className="text-[#889299] font-bold text-sm">{user.rank}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0F111A] flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {(typeof user.avatar === 'string' && user.avatar.slice(0, 1).toUpperCase()) || '?'}
                </div>
                <div>
                  <h4 className="text-white font-bold text-base tracking-wide">
                    {user._isCurrentUser ? `${user.name} (You)` : user.name}
                  </h4>
                  <p className="text-[#889299] text-xs mt-0.5">{user.currentTask || user.tier}</p>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0 pl-2">
              <span className="text-[#889299] font-mono text-sm tracking-wider">{fmtHours(user.studyTime)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};