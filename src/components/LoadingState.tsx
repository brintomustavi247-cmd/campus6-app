import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  subtext?: string;
}

export const LoadingState: React.FC<LoadingProps> = ({ 
  message = 'লোড হচ্ছে...', 
  subtext = 'অনুগ্রহ করে অপেক্ষা করুন' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[260px] rounded-2xl bg-surface-muted border border-border">
      <Loader2 className="w-10 h-10 text-gold animate-spin mb-3" />
      <h3 className="text-base font-semibold text-text-primary">{message}</h3>
      {subtext && <p className="text-xs text-text-muted mt-1">{subtext}</p>}
    </div>
  );
};
