import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface Note { id: number; title: string; body: string; emoji: string; }

const pickEmoji = (t: string) => (t.match(/\p{Extended_Pictographic}/u)?.[0]) || '🔔';

export const PremiumNotificationPopup: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const onNotif = (e: any) => {
      const { title = '', body = '' } = e.detail || {};
      const id = ++idRef.current;
      setNotes((p) => [...p.slice(-2), { id, title, body, emoji: pickEmoji(title) }]);
      setTimeout(() => setNotes((p) => p.filter((n) => n.id !== id)), 6000);
    };
    window.addEventListener('campus6:premium-notif', onNotif);
    return () => window.removeEventListener('campus6:premium-notif', onNotif);
  }, []);

  if (!notes.length) return null;

  return (
    <div className="fixed top-4 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[380px] z-[95] space-y-2 pointer-events-none">
      <style>{`
        @keyframes pnIn { from { opacity:0; transform: translateY(-18px) scale(.95);} to { opacity:1; transform: translateY(0) scale(1);} }
        @keyframes pnBar { from { width:100%; } to { width:0%; } }
      `}</style>
      {notes.map((n) => (
        <div
          key={n.id}
          onClick={() => setNotes((p) => p.filter((x) => x.id !== n.id))}
          className="pointer-events-auto relative overflow-hidden rounded-2xl p-3.5 pr-9 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(23,20,31,0.92), rgba(13,11,18,0.95))',
            border: '1px solid rgba(251,191,36,0.3)',
            backdropFilter: 'blur(14px)',
            animation: 'pnIn .4s cubic-bezier(.16,1,.3,1)',
            boxShadow: '0 18px 40px -12px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.6), transparent)' }} />
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base"
              style={{ background: 'linear-gradient(135deg,#FBBF24,#D97706)', boxShadow: '0 4px 14px rgba(251,191,36,0.35)' }}
            >
              {n.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black bn truncate" style={{ color: '#F8FAFC' }}>{n.title}</p>
              <p className="text-[10px] bn mt-0.5 leading-relaxed" style={{ color: '#94A3B8' }}>{n.body}</p>
            </div>
          </div>
          <button
            className="absolute top-2.5 right-2.5 p-1 rounded-md hover:text-white"
            style={{ color: '#64748B' }}
            onClick={(e) => { e.stopPropagation(); setNotes((p) => p.filter((x) => x.id !== n.id)); }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="absolute bottom-0 left-0 h-0.5" style={{ background: 'linear-gradient(90deg,#FBBF24,#DC143C)', animation: 'pnBar 6s linear forwards' }} />
        </div>
      ))}
    </div>
  );
};