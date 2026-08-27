import React from 'react';
import { RoutineDay, ClassSession } from '../types';
import { BookOpen, Clock, Swords, CheckCircle } from 'lucide-react';

interface DailyRoutineCardProps {
  routine: RoutineDay;
  onStartFocusTimer?: (session: ClassSession) => void;
}

export const DailyRoutineCard: React.FC<DailyRoutineCardProps> = ({
  routine,
  onStartFocusTimer
}) => {
  if (routine.isRestDay) {
    return (
      <div className="p-5 rounded-2xl bg-surface-muted border border-border text-text-primary">
        <div className="flex items-center gap-3 mb-2 text-gold">
          <Swords className="w-5 h-5" />
          <h3 className="text-sm font-bold  ">রুটিন আপডেট</h3>
        </div>
        <p className="text-sm font-medium text-text-secondary">
          আজকের জন্য কোনো অফিসিয়াল ক্লাস নেই। নিজেকে রিফ্রেশ করো বা ব্যাকলগ রিভিশন করো!
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm border border-border-strong shadow-xl text-text-primary relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-gold rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-surface-muted text-gold border border-gold">
            <BookOpen className="w-4 h-4" />
          </span>
          <h3 className="text-xs font-bold text-text-secondary">
            আজকের ক্লাস রুটিন ({routine.sessions.length} টি সেশন)
          </h3>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-surface-muted text-gold border border-border-strong">
          {routine.timeRaw}
        </span>
      </div>

      <h2 className="text-lg font-extrabold text-text-primary mb-3 leading-snug">
        {routine.topicRaw}
      </h2>

      <div className="space-y-2.5 mt-4">
        {routine.sessions.map((session, idx) => (
          <div
            key={session.id}
            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-muted border border-border backdrop-blur-sm hover:border-gold transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-red-900 border border-border-strong flex items-center justify-center text-xs font-bold text-gold">
                {idx + 1}
              </span>
              <div>
                <p className="text-xs font-bold text-text-primary">{session.topic}</p>
                <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
                  <span className="px-2 py-0.5 rounded bg-red-900/80 text-text-secondary font-medium">
                    {session.subject}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gold" />
                    {session.time}
                  </span>
                </div>
              </div>
            </div>

            {onStartFocusTimer && (
              <button
                onClick={() => onStartFocusTimer(session)}
                className="px-3 py-1.5 rounded-lg bg-gold hover:bg-[#b88e22] text-[#0F111A] text-xs font-bold shadow-md transition-all shrink-0 min-h-[38px]"
              >
                পড়া শুরু
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
