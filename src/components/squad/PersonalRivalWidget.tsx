import React from 'react';
import { Target, TrendingUp, Trophy } from 'lucide-react';

export const PersonalRivalWidget: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl bg-[#1E2030] border border-slate-800 shadow-lg relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Target className="w-5 h-5 text-yellow-400" />
          Personal Rival
        </h3>
        <span className="text-[10px] bg-[#0F111A] text-slate-400 px-2 py-1 rounded border border-slate-700 font-bold uppercase">
          Vs Best Week
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 relative z-10">
        <div className="p-3 bg-[#0F111A] rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">This Week</span>
          <span className="text-xl font-black font-mono text-emerald-400 mt-1">42.5h</span>
          <span className="text-[9px] text-emerald-500 font-bold mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +5h pace
          </span>
        </div>
        <div className="p-3 bg-[#0F111A] rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
            <Trophy className="w-3 h-3 text-yellow-400" /> Best Week
          </span>
          <span className="text-xl font-black font-mono text-slate-300 mt-1">45.0h</span>
          <span className="text-[9px] text-slate-500 font-bold mt-0.5">Record</span>
        </div>
      </div>
    </div>
  );
};
