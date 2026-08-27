import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface ErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorProps> = ({
  title = 'সমস্যা দেখা দিয়েছে',
  message = 'ডেটা লোড করতে বা সিঙ্ক করতে ব্যর্থ হয়েছে। অনুগ্রহ করে ইন্টারনেট কানেকশন বা ফায়ারবেস কনফিগারেশন চেক করুন।',
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-rose-950/20 border border-rose-900/40">
      <div className="p-3.5 rounded-2xl bg-rose-900/30 text-rose-400 mb-3">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-rose-100 mb-1">{title}</h3>
      <p className="text-xs text-rose-200/80 max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-rose-100 text-xs font-semibold shadow-md transition-colors min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4" />
          আবার চেষ্টা করুন
        </button>
      )}
    </div>
  );
};
