import React from 'react';
import { X } from 'lucide-react';
import { EmotionalNote } from '../utils/emotionalNotifications';

export const EmotionalPopup: React.FC<{
  note: EmotionalNote;
  onStart: () => void;
  onClose: () => void;
}> = ({ note, onStart, onClose }) => (
  <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
    <style>{`@keyframes emoPop { from { transform: scale(.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div
      className="relative w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl"
      style={{
        background: 'linear-gradient(165deg,#141018,#0C0D12)',
        border: '1px solid rgba(251,191,36,0.25)',
        animation: 'emoPop .5s cubic-bezier(.16,1,.3,1)',
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1.5 rounded-lg text-text-muted hover:text-white transition-colors"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <X className="w-4 h-4" />
      </button>

      <div className="text-5xl mb-3">{note.emoji}</div>
      <h3 className="text-lg font-bold bn mb-2" style={{ color: '#F8FAFC', fontFamily: "'Anek Bangla', sans-serif" }}>
        {note.title}
      </h3>
      <p className="text-xs leading-relaxed bn mb-5" style={{ color: '#94A3B8' }}>
        {note.body}
      </p>
      <button
        onClick={onStart}
        className="w-full py-3 rounded-xl text-sm font-extrabold bn transition-all hover:brightness-110"
        style={{ background: 'linear-gradient(135deg,#FBBF24,#D97706)', color: '#0F111A' }}
      >
        ⚡  মিনিট দিয়ে শুরু করি
      </button>
    </div>
  </div>
);