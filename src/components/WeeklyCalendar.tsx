import React from 'react';
import { getLocalDailyProgress } from '../utils/storageEngine';
import { CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';

interface WeeklyCalendarProps {
  selectedDateKey: string;
  onSelectDate: (dateKey: string) => void;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  selectedDateKey,
  onSelectDate
}) => {
  // Get 7 days surrounding or containing selected date
  const curr = new Date(`${selectedDateKey}T00:00:00`);
  const dayOfWeek = curr.getDay(); // 0 is Sun
  
  // Start from Sunday or Monday
  const startDate = new Date(curr);
  startDate.setDate(curr.getDate() - dayOfWeek);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateKey = d.toISOString().split('T')[0];
    const progress = getLocalDailyProgress(dateKey);
    days.push({
      dateKey,
      dayName: d.toLocaleDateString('bn-BD', { weekday: 'short' }),
      dayNameEn: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      progress
    });
  }

  return (
    <div className="p-4 rounded-2xl bg-surface border border-border shadow-lg text-text-primary">
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-border">
        <h3 className="text-xs font-bold  text-text-secondary">
          সাপ্তাহিক ক্যালেন্ডার (Weekly Calendar)
        </h3>
        <span className="text-[10px] text-emerald-500 font-mono font-semibold">
          ৭০%+ সফলতার দিনসমূহ
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map(d => {
          const isSelected = d.dateKey === selectedDateKey;
          const isPassed70 = d.progress.completionPercent >= 70;

          return (
            <button
              key={d.dateKey}
              onClick={() => onSelectDate(d.dateKey)}
              className={`p-2 rounded-xl flex flex-col items-center justify-between transition-all min-h-[72px] border ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:bg-emerald-500/30'
                  : 'bg-bg border-border hover:border-border-strong text-text-secondary'
              }`}
            >
              <span className={`text-[10px] uppercase font-bold ${isSelected ? 'text-emerald-400/80' : 'text-text-muted'}`}>
                {d.dayNameEn}
              </span>
              <span className="text-sm font-extrabold my-0.5 font-mono">
                {d.dayNum}
              </span>
              <div className="flex items-center gap-1">
                {isPassed70 ? (
                  <span className={`text-[10px] font-bold flex items-center gap-0.5 ${isSelected ? 'text-emerald-400' : 'text-emerald-500'}`}>
                    {d.progress.completionPercent}%
                  </span>
                ) : (
                  <span className={`text-[10px] font-medium ${isSelected ? 'text-emerald-400' : 'text-gold'}`}>
                    {d.progress.completionPercent}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
