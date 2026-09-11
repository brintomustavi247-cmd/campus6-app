import React from 'react';
import { RoutineDay, ClassSession } from '../types';
import { BookOpen, Clock, Play } from 'lucide-react';
import { getClassWindow } from '../utils/classExamWindow';

interface DailyRoutineCardProps {
  routine: RoutineDay;
  dateKey?: string;
  onStartFocusTimer?: (session: ClassSession) => void;
}

export const DailyRoutineCard: React.FC<DailyRoutineCardProps> = ({
  routine,
  dateKey,
  onStartFocusTimer,
}) => {
  if (routine.isRestDay) {
    return (
      <div className="p-5 rounded-2xl bg-surface-muted border border-border">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-text-primary">Rest Day</h3>
        </div>
        <p className="text-xs text-text-secondary">
          No official classes today. Use this time for revision or self-study.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border shadow-lg">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-text-primary">
            Today's Schedule
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
          {routine.sessions.length} Sessions
        </span>
      </div>

      <h2 className="text-base font-bold text-text-primary mb-4">
        {routine.topicRaw}
      </h2>

      <div className="space-y-2">
        {routine.sessions.map((session, idx) => {
          const win = dateKey ? getClassWindow(session, dateKey) : null;
          const isLive = win?.status === 'live';
          const isEnded = win?.status === 'ended';

          return (
            <div
              key={session.id}
              className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                isLive 
                  ? 'bg-primary/5 border-primary/50' 
                  : isEnded
                  ? 'bg-surface-muted/50 border-border/50 opacity-60'
                  : 'bg-surface-muted border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  isLive ? 'bg-primary text-white' : 'bg-surface-muted text-text-muted border border-border'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{session.topic}</p>
                  <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                      {session.subject}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {session.time}
                    </span>
                    {isLive && (
                      <span className="px-2 py-0.5 rounded-full bg-danger/20 text-danger font-bold text-[10px] animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {onStartFocusTimer && !isEnded && (
                <button
                  onClick={() => onStartFocusTimer(session)}
                  className="p-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors shrink-0"
                  title="Start studying"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};