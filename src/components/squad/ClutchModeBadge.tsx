import React from 'react';
import { Flame } from 'lucide-react';

export const ClutchModeBadge: React.FC = () => {
  return (
    <div className="relative animate-in zoom-in duration-500">
      <div className="absolute -inset-1 bg-red-500/20 rounded-lg blur animate-pulse" />
      <div className="relative px-3 py-1.5 rounded-lg bg-red-950/80 border-2 border-red-500/50 flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
        <Flame className="w-4 h-4 text-red-500 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
          Clutch Opportunity
        </span>
        <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold ml-1">
          2x XP
        </span>
      </div>
    </div>
  );
};
