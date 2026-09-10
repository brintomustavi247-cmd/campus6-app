import React from 'react';
import { Award, AlertCircle, ArrowRight, Clock, Zap } from 'lucide-react';
import { getExamWindow } from '../utils/classExamWindow';

interface ExamCardProps {
  examTopic?: string;
  dateKey?: string; // NEW: date pass করতে হবে
  onOpenExamPrep?: () => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({
  examTopic,
  dateKey,
  onOpenExamPrep,
}) => {
  if (!examTopic) return null;

  const win = dateKey ? getExamWindow(examTopic, dateKey) : null;
  const status = win?.status || 'upcoming';
  const isLive = status === 'live';
  const isEnded = status === 'ended';

  if (isEnded) return null; // পরীক্ষা শেষ → আর দেখাবে না ✅

  const accentColor = isLive ? '#EF4444' : '#F59E0B'; // red for LIVE, amber for upcoming
  const glowColor = isLive ? 'rgba(239,68,68,0.35)' : 'rgba(251,191,36,0.2)';

  return (
    <div
      className="p-4 rounded-2xl shadow-md text-amber-100 flex items-center justify-between gap-4 relative overflow-hidden"
      style={{
        background: isLive ? 'rgba(127,29,29,0.4)' : 'rgba(30,25,18,0.8)',
        border: `1px solid ${accentColor}66`,
        boxShadow: `0 0 20px ${glowColor}`,
      }}
    >
      {/* LIVE pulse effect */}
      {isLive && (
        <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
      )}

      <div className="flex items-center gap-3 relative z-10">
        <div
          className="p-3 rounded-xl shrink-0"
          style={{
            background: isLive ? 'rgba(220,38,38,0.3)' : 'rgba(120,53,15,0.5)',
            border: `1px solid ${accentColor}77`,
          }}
        >
          {isLive ? <Zap className="w-6 h-6 text-red-300" /> : <Award className="w-6 h-6 text-gold" />}
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: accentColor }}>
            {isLive ? <Zap className="w-3.5 h-3.5 animate-pulse" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {win?.label || 'আজকের নির্ধারিত পরীক্ষা'}
          </div>
          <h4 className="text-sm font-extrabold text-text-primary mt-0.5">{examTopic}</h4>
          {win && (
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-200/80">
              <Clock className="w-3 h-3" />
              <span className="font-semibold">{win.countdown}</span>
            </div>
          )}
          {!win && (
            <p className="text-[11px] text-amber-200/80 mt-0.5">
              পড়াশোনার পর ৫-১০টি MCQ সলভ করে নিজেকে ঝালিয়ে নাও!
            </p>
          )}
        </div>
      </div>

      {onOpenExamPrep && (
        <button
          onClick={onOpenExamPrep}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[#0F111A] text-xs font-bold shadow-md transition-all shrink-0 min-h-11 relative z-10"
          style={{
            background: isLive ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'linear-gradient(135deg, #FBBF24, #D97706)',
          }}
        >
          {isLive ? 'এখনই শুরু' : 'প্রস্তুতি'}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};