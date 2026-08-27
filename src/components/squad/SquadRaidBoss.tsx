import React from 'react';
import { Target, Swords, Zap } from 'lucide-react';

export const SquadRaidBoss: React.FC = () => {
  // Mock boss data
  const bossTotalHp = 120; // 120 hours
  const bossCurrentHp = 42; // 42 hours remaining
  const progressPercent = ((bossTotalHp - bossCurrentHp) / bossTotalHp) * 100;

  return (
    <div className="p-5 rounded-2xl bg-[#1E2030] border border-blue-900/30 shadow-lg relative overflow-hidden group">
      {/* Dynamic background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0F111A] border-2 border-crimson-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.2)]">
            <Swords className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              Squad Raid 
              <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/30">
                ACTIVE
              </span>
            </h3>
            <p className="text-xs text-blue-400 font-bold mt-0.5">Defeat Procrastination Beast</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Boss HP</p>
          <p className="text-lg font-black text-red-400 font-mono tracking-tighter">
            {bossCurrentHp}h <span className="text-sm text-slate-500">/ {bossTotalHp}h</span>
          </p>
        </div>
      </div>

      <div className="space-y-1.5 relative z-10">
        <div className="h-4 w-full bg-[#0F111A] rounded-full overflow-hidden border border-slate-800 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-1000 ease-out rounded-full relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 animate-pulse" />
          </div>
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <Zap className="w-3 h-3" /> Squad drained 78h this week
          </span>
          <span>Rewards: ✨ 500 XP</span>
        </div>
      </div>
    </div>
  );
};
