import React from 'react';
import { RefreshCw, X } from 'lucide-react';

export const UpdateBanner: React.FC<{
  show: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
}> = ({ show, onUpdate, onDismiss }) => {
  if (!show) return null;
  return (
    <div className="fixed bottom-20 sm:bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-[90] animate-in slide-in-from-bottom">
      <div
        className="flex items-center gap-3 p-3.5 rounded-2xl shadow-2xl"
        style={{ background: 'linear-gradient(135deg,#122016,#0C1210)', border: '1px solid rgba(16,185,129,0.4)' }}
      >
        <RefreshCw className="w-4 h-4 text-emerald-400 shrink-0" />
        <p className="flex-1 text-[11px] bn" style={{ color: '#D1FAE5' }}>
          <b>🆕 নতুন version এসেছে!</b> আপডেট করবেন?
        </p>
        <button
          onClick={onUpdate}
          className="px-3 py-2 rounded-xl text-[11px] font-extrabold bn shrink-0"
          style={{ background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff' }}
        >
          Update
        </button>
        <button onClick={onDismiss} className="p-1.5 rounded-lg shrink-0" style={{ color: '#64748B' }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};