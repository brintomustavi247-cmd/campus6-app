import React from 'react';
import { CalendarX, RefreshCw } from 'lucide-react';

interface EmptyProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyProps> = ({
  title = 'আজকের জন্য কোনো ক্লাস রুটিন পাওয়া যায়নি',
  description = 'চাইলে নিজের custom task বা পড়া যোগ করে পড়তে পারো।',
  actionLabel,
  onAction,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-surface-muted border border-border">
      <div className="p-4 rounded-2xl bg-red-900/40 text-gold mb-3">
        {icon || <CalendarX className="w-8 h-8" />}
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-xs text-text-muted max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white shadow-sm border border-transparent text-slate-50 text-xs font-semibold shadow-md transition-colors min-h-[44px]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
