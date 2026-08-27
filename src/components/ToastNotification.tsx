import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0 sm:bottom-8">
      {toasts.map((toast) => {
        const typeConfig = {
          success: {
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
            border: 'border-l-emerald-500',
            bgGlow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]'
          },
          error: {
            icon: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />,
            border: 'border-l-rose-500',
            bgGlow: 'shadow-[0_0_15px_rgba(225,29,72,0.15)]'
          },
          warning: {
            icon: <AlertCircle className="w-5 h-5 text-gold shrink-0" />,
            border: 'border-l-gold',
            bgGlow: 'shadow-[0_0_15px_rgba(250,204,21,0.1)]'
          },
          info: {
            icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
            border: 'border-l-blue-500',
            bgGlow: 'shadow-[0_0_15px_rgba(59,130,246,0.1)]'
          }
        };

        const style = typeConfig[toast.type] || typeConfig.info;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border border-white/10 border-l-4 ${style.border} shadow-2xl backdrop-blur-xl bg-[#1E2030]/95 text-white transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${style.bgGlow}`}
            role="alert"
          >
            {style.icon}
            <div className="flex-1 text-sm pt-0.5">
              {toast.title && <p className="font-bold text-xs tracking-wider uppercase text-gray-300 mb-1">{toast.title}</p>}
              <p className="leading-snug font-medium text-gray-100">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all min-h-[32px] min-w-[32px] flex items-center justify-center -mt-1 -mr-1"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

