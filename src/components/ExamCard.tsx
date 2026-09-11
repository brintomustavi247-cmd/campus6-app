import React, { useEffect, useState } from 'react';
import { Award, ArrowRight, Radio, CalendarClock } from 'lucide-react';
import { getExamWindow } from '../utils/classExamWindow';
import { useClassLinks } from '../utils/useClassLinks';

interface ExamCardProps {
  examTopic?: string;
  dateKey?: string;
  onOpenExamPrep?: () => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

export const ExamCard: React.FC<ExamCardProps> = ({ examTopic, dateKey, onOpenExamPrep }) => {
  // ⭐ Live countdown tick (৩০ সেকেন্ড পর পর)
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!examTopic) return null;
  const win = dateKey ? getExamWindow(examTopic, dateKey) : null;
  if (!win || win.status === 'ended') return null;

  const isLive = win.status === 'live';
    // ⭐ Scraper-এর আনা live exam link (এক্সাম দেই → deep url)
  const { links } = useClassLinks(dateKey || '');
  const examLink = links.find((l: any) => l.link_type === 'exam');
  const totalWindow = 24 * 60;
  const elapsed = Math.min(totalWindow, Math.max(0, totalWindow - win.minutesRemaining));
  const progress = isLive ? (elapsed / totalWindow) * 100 : 0;

  const remainM = Math.max(0, Math.round(isLive ? win.minutesRemaining : win.minutesUntilStart));
  const hh = Math.floor(remainM / 60);
  const mm = remainM % 60;

  return (
    <div className="exam-wrap relative rounded-2xl p-[1.5px] overflow-hidden shadow-2xl">
      {/* ⭐ Rotating gradient border + shimmer + pulse animations */}
      <style>{`
        @keyframes examBorderSpin { to { transform: rotate(360deg); } }
        .exam-wrap::before {
          content: '';
          position: absolute;
          inset: -60%;
          background: conic-gradient(from 0deg, transparent 0 60%, ${isLive ? '#EF4444' : '#FBBF24'} 75%, ${isLive ? '#F97316' : '#DC143C'} 88%, transparent 100%);
          animation: examBorderSpin 5s linear infinite;
        }
        @keyframes examShimmer { 0% { transform: translateX(-120%) skewX(-15deg); } 100% { transform: translateX(320%) skewX(-15deg); } }
        @keyframes examPulse { 0%,100% { opacity: .5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.06); } }
      `}</style>

      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: isLive
            ? 'linear-gradient(140deg, rgba(69,10,10,0.92), rgba(24,10,14,0.96) 55%, rgba(24,26,35,0.98))'
            : 'linear-gradient(140deg, rgba(24,26,35,0.98), rgba(20,18,28,0.98))',
        }}
      >
        {/* shimmer sweep (live mode) */}
        {isLive && (
          <div
            className="absolute top-0 bottom-0 w-1/3 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
              animation: 'examShimmer 3.2s ease-in-out infinite',
            }}
          />
        )}
        {/* pulsing glow blob */}
        <div
          className="absolute -right-12 -top-12 w-44 h-44 rounded-full blur-3xl pointer-events-none"
          style={{
            background: isLive ? 'rgba(239,68,68,0.2)' : 'rgba(251,191,36,0.12)',
            animation: 'examPulse 3s ease-in-out infinite',
          }}
        />

        <div className="p-5 relative z-10">
          {/* ─── top row: status pill + window label ─── */}
          <div className="flex items-center justify-between gap-3">
            <span
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bn"
              style={{
                background: isLive ? 'rgba(239,68,68,0.15)' : 'rgba(251,191,36,0.1)',
                borderColor: isLive ? 'rgba(239,68,68,0.5)' : 'rgba(251,191,36,0.35)',
                color: isLive ? '#FCA5A5' : '#FBBF24',
              }}
            >
              {isLive ? <Radio className="w-3.5 h-3.5 animate-pulse" /> : <CalendarClock className="w-3.5 h-3.5" />}
              {win.label}
              {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
            </span>
            <span
              className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted hidden sm:block"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              EXAM WINDOW · 8PM → 8PM
            </span>
          </div>

          {/* ─── title + segmented countdown ─── */}
          <div className="flex items-end justify-between gap-4 mt-4">
            <div className="min-w-0">
              <h4
                className="text-lg font-black text-text-primary truncate bn"
                style={{ textShadow: isLive ? '0 0 18px rgba(239,68,68,0.35)' : 'none' }}
              >
                {examTopic}
              </h4>
              <p className="text-[11px] text-text-muted mt-1 bn">
                {isLive ? 'পরীক্ষা চলছে — এখনই অংশ নিন!' : 'পড়াশোনার পর ৫-১০টি MCQ সলভ করে নিজেকে ঝালিয়ে নাও!'}
              </p>
            </div>

            {/* ⭐ flip-style segmented countdown */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex flex-col items-center">
                <div
                  className="px-2.5 py-1.5 rounded-lg border font-mono font-black text-lg leading-none"
                  style={{
                    background: 'rgba(0,0,0,0.45)',
                    borderColor: isLive ? 'rgba(239,68,68,0.4)' : 'rgba(251,191,36,0.3)',
                    color: isLive ? '#F87171' : '#FBBF24',
                    boxShadow: isLive ? 'inset 0 0 12px rgba(239,68,68,0.15)' : 'inset 0 0 12px rgba(251,191,36,0.12)',
                  }}
                >
                  {pad(hh)}
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-text-muted mt-1 bn">ঘণ্টা</span>
              </div>
              <span className="font-mono font-black text-lg pb-4" style={{ color: isLive ? '#F87171' : '#FBBF24' }}>:</span>
              <div className="flex flex-col items-center">
                <div
                  className="px-2.5 py-1.5 rounded-lg border font-mono font-black text-lg leading-none"
                  style={{
                    background: 'rgba(0,0,0,0.45)',
                    borderColor: isLive ? 'rgba(239,68,68,0.4)' : 'rgba(251,191,36,0.3)',
                    color: isLive ? '#F87171' : '#FBBF24',
                    boxShadow: isLive ? 'inset 0 0 12px rgba(239,68,68,0.15)' : 'inset 0 0 12px rgba(251,191,36,0.12)',
                  }}
                >
                  {pad(mm)}
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-text-muted mt-1 bn">মিনিট</span>
              </div>
            </div>
          </div>

          {/* ─── window progress bar ─── */}
          <div className="mt-4">
            <div className="w-full h-1.5 rounded-full bg-black/50 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${isLive ? progress : 0}%`,
                  background: 'linear-gradient(90deg,#EF4444,#F97316,#FBBF24)',
                  boxShadow: '0 0 10px rgba(239,68,68,0.6)',
                }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-text-muted mt-1 font-mono">
              <span>START 8:00 PM</span>
              <span>{isLive ? `${Math.round(progress)}% COMPLETE` : 'UPCOMING'}</span>
              <span>END 8:00 PM</span>
            </div>
          </div>

          {/* ─── CTA row ─── */}
          <div className="mt-4 flex items-center gap-2">
            {onOpenExamPrep && (
             <button
              onClick={() => {
                if (examLink?.url) window.open(examLink.url, '_blank');
                else onOpenExamPrep?.();
              }}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] bn"
                style={{
                  background: isLive ? 'linear-gradient(135deg,#EF4444,#DC2626)' : 'linear-gradient(135deg,#FBBF24,#D97706)',
                  boxShadow: isLive ? '0 4px 18px rgba(239,68,68,0.45)' : '0 4px 18px rgba(251,191,36,0.35)',
                  color: isLive ? '#fff' : '#0F111A',
                }}
              >
                      {isLive ? (examLink ? '🎯 এক্সাম দেই' : 'এখনই শুরু') : 'প্রস্তুতি নিন'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <div
              className="px-3 py-2.5 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 bn"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#94A3B8', background: 'rgba(255,255,255,0.03)' }}
            >
              <Award className="w-3.5 h-3.5" style={{ color: isLive ? '#F87171' : '#FBBF24' }} />
              MCQ · ৩৫ টি
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};