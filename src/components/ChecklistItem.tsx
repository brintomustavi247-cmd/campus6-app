import React from 'react';
import { ChecklistItem as ChecklistItemType } from '../types';
import { Check, Clock, CloudOff, CheckCircle2 } from 'lucide-react';

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: (id: string) => void;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onToggle }) => {
  return (
    <div
      className={`group flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 ${
        item.completed
          ? 'bg-surface-muted border-white/10 opacity-50'
          : 'bg-[#1E2030] border-white/5 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] shadow-sm'
      }`}
    >
      <button
        onClick={() => onToggle(item.id)}
        className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 min-h-[36px] min-w-[36px] ${
          item.completed
            ? 'bg-[#EAB308] border-[#EAB308] text-black shadow-[0_0_10px_rgba(234,179,8,0.5)]'
            : 'border-white/20 hover:border-[#EAB308] bg-transparent'
        }`}
        aria-label={`Mark task ${item.label} as ${item.completed ? 'incomplete' : 'complete'}`}
      >
        {item.completed && <Check className="w-5 h-5 stroke-[3]" />}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs sm:text-sm font-medium leading-snug transition-all duration-300 ${
            item.completed
              ? 'line-through text-white/50 decoration-white/30 font-normal'
              : 'text-text-primary font-medium'
          }`}
        >
          {item.label}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-text-muted">
          {item.estimatedMinutes && (
            <span className="flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-muted border border-border text-gold">
              <Clock className="w-3 h-3" />
              {item.estimatedMinutes} মি.
            </span>
          )}
          {item.isPendingSync && (
            <span className="flex items-center gap-1 text-amber-400 text-[10px]" title="Pending cloud sync">
              <CloudOff className="w-3 h-3" />
              Pending
            </span>
          )}
          {item.completed && !item.isPendingSync && (
            <span className="flex items-center gap-1 text-emerald-500/80 text-[10px]">
              <CheckCircle2 className="w-3 h-3" />
              Saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
