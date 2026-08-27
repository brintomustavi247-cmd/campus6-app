import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';

interface DateSelectorProps {
  selectedDateKey: string;
  onDateChange: (newDateKey: string) => void;
  todayKey: string;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDateKey,
  onDateChange,
  todayKey
}) => {
  const handlePrevDay = () => {
    const d = new Date(`${selectedDateKey}T00:00:00`);
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onDateChange(`${year}-${month}-${day}`);
  };

  const handleNextDay = () => {
    const d = new Date(`${selectedDateKey}T00:00:00`);
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onDateChange(`${year}-${month}-${day}`);
  };

  const handleToday = () => {
    onDateChange(todayKey);
  };

  const isToday = selectedDateKey === todayKey;

  // Format date display in Bengali/English mix
  // Parse date string explicitly as local time to avoid UTC offset issues
  const dateObj = new Date(`${selectedDateKey}T00:00:00`);
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  };
  const formattedDate = dateObj.toLocaleDateString('bn-BD', options);
  const formattedDateEn = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface border border-border shadow-lg text-text-primary backdrop-blur-md">
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevDay}
          className="p-2 rounded-xl bg-surface-muted hover:bg-red-900 border border-border text-text-secondary hover:text-text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Previous Day"
          title="পূর্ববর্তী দিন"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-muted border border-border">
          <CalendarIcon className="w-4 h-4 text-gold shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-primary tracking-wide">
              {formattedDateEn}
            </span>
            <span className="text-[11px] text-text-muted font-medium">
              {formattedDate}
            </span>
          </div>
          <input
            type="date"
            value={selectedDateKey}
            onChange={(e) => e.target.value && onDateChange(e.target.value)}
            className="opacity-0 absolute w-8 h-8 cursor-pointer"
            aria-label="Choose Date"
          />
        </div>

        <button
          onClick={handleNextDay}
          className="p-2 rounded-xl bg-surface-muted hover:bg-red-900 border border-border text-text-secondary hover:text-text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Next Day"
          title="পরবর্তী দিন"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {!isToday && (
          <button
            onClick={handleToday}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold hover:bg-[#b88e22] text-[#0F111A] font-bold text-xs shadow-md transition-all min-h-[44px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            আজ (Today)
          </button>
        )}
        {isToday && (
          <span className="px-3 py-1 rounded-full bg-red-900/80 text-gold border border-gold text-xs font-bold">
            আজকের রুটিন
          </span>
        )}
      </div>
    </div>
  );
};
