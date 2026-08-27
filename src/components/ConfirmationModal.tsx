import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'হ্যাঁ, নিশ্চিত করুন',
  cancelLabel = 'বাতিল',
  isDanger = true,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-bg border border-border rounded-2xl shadow-2xl p-6 text-text-primary"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-xl text-gold hover:text-text-primary hover:bg-red-900/40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5 mb-4">
          <div className={`p-3 rounded-xl shrink-0 ${isDanger ? 'bg-rose-950/80 text-rose-400 border border-rose-800/40' : 'bg-amber-950/80 text-gold border border-amber-800/40'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 id="modal-title" className="text-base font-bold text-text-primary">
              {title}
            </h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-border text-text-muted hover:bg-red-900/40 text-xs font-semibold transition-colors min-h-[44px]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg transition-colors min-h-[44px] ${
              isDanger 
                ? 'bg-rose-600 hover:bg-rose-700 text-text-primary' 
                : 'bg-primary hover:bg-primary-hover text-white shadow-sm border border-transparent text-slate-50'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
