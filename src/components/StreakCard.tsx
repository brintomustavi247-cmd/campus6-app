import React from 'react';
import { Flame, Trophy, Award, Info } from 'lucide-react';
import { StreakResult } from '../utils/storageEngine';

interface StreakCardProps {
  streak: StreakResult;
}

export const StreakCard: React.FC<StreakCardProps> = ({ streak }) => {
  return (
    <div className="p-4 rounded-2xl bg-surface-muted border border-border border border-amber-600/40 shadow-lg text-text-primary relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-amber-300">
              স্ট্রিক ট্র্যাকার (Streak)
            </h3>
            <p className="text-[10px] text-text-muted">প্রতিদিন ৭০% লক্ষ্য পূরণে স্ট্রিক বাড়ে</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-amber-300/80 px-2 py-1 rounded-lg bg-amber-950/80 border border-amber-800/40" title="স্ট্রিক নিয়ম: ৭০% কাজ শেষ করলে একদিনের স্ট্রিক গণনা করা হয়">
          <Info className="w-3 h-3 text-gold" />
          <span>৭০% রুল</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center mt-2">
        <div className="p-2.5 rounded-xl bg-surface-muted border border-border">
          <p className="text-[10px] text-text-muted  font-semibold">চলতি স্ট্রিক</p>
          <p className="text-2xl font-black text-amber-400 font-mono mt-0.5">
            {streak.currentStreak} <span className="text-xs font-normal text-text-secondary">দিন</span>
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-surface-muted border border-border">
          <p className="text-[10px] text-text-muted  font-semibold">সেরা স্ট্রিক</p>
          <p className="text-2xl font-black text-gold font-mono mt-0.5">
            {streak.bestStreak} <span className="text-xs font-normal text-text-secondary">দিন</span>
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-surface-muted border border-border">
          <p className="text-[10px] text-text-muted  font-semibold">৭০%+ সফল দিন</p>
          <p className="text-2xl font-black text-text-muted font-mono mt-0.5">
            {streak.daysAbove70Count}
          </p>
        </div>
      </div>
    </div>
  );
};
