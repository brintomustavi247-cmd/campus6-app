import React, { useEffect, useState } from 'react';
import { RoutineDay, ClassSession } from '../types';
import { BookOpen, Clock, Play, Video, Timer } from 'lucide-react';
import { getClassWindow } from '../utils/classExamWindow';
import { useClassLinks } from '../utils/useClassLinks';
import { getPhSubjectUrl, hasBuiltInLinks } from '../data/phSubjectLinks';
import { getPhLink, PhLink } from '../utils/phLink';

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
  const { getLink } = useClassLinks(dateKey || '');

  // ⭐ PH link state + live update listener
  const [phLink, setPhLink] = useState<PhLink | null>(getPhLink());
  useEffect(() => {
    const onChange = () => setPhLink(getPhLink());
    window.addEventListener('campus6:phlink-changed', onChange);
    return () => window.removeEventListener('campus6:phlink-changed', onChange);
  }, []);

  if (routine.isRestDay) {
    return (
      <div className="p-5 rounded-2xl bg-surface-muted border border-border">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-text-primary bn">Rest Day</h3>
        </div>
        <p className="text-xs text-text-secondary bn">
          আজ কোনো অফিসিয়াল ক্লাস নেই। রিভিশন বা self-study-এর জন্য দারুণ সময়!
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border shadow-lg">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-text-primary bn">Today's Schedule</h3>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
          {routine.sessions.length} Sessions
        </span>
      </div>

      <h2 className="text-base font-bold text-text-primary mb-3 bn">{routine.topicRaw}</h2>

      {/* ⭐ PH link setup hint (link না থাকলে) */}
      {!phLink && !hasBuiltInLinks && (
        <p className="text-[10px] bn mb-3 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400/90">
          🔗 Dashboard-এ "Physics Hunter Account Link" সেটআপ করুন — তাহলে button সরাসরি ক্লাস খুলবে
        </p>
      )}

      <div className="space-y-2">
        {routine.sessions.map((session, idx) => {
          const win = dateKey ? getClassWindow(session, dateKey) : null;
          const isLive = win?.status === 'live';
          const isEnded = win?.status === 'ended';

          // ⭐ SMART URL: scraped link → personal PH link → null
          const scraped = getLink(session.sessionIndex);
          // ⭐ Priority: scraped live link → built-in subject link → personal link
          const targetUrl =
            scraped?.url || getPhSubjectUrl(session.subject) || phLink?.courseUrl || null;

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
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    isLive ? 'bg-primary text-white' : 'bg-surface-muted text-text-muted border border-border'
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary bn">{session.topic}</p>
                  <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5 flex-wrap">
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
                    {targetUrl && !isEnded && (
                      <span className="px-2 py-0.5 rounded-full bg-success/15 text-success font-bold text-[10px] flex items-center gap-1">
                        <Video className="w-3 h-3" /> Link Ready
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ⭐ SMART BUTTONS */}
              <div className="flex items-center gap-2 shrink-0">
                {targetUrl && !isEnded ? (
                  <>
                    {/* 🎯 MAIN: Physics Hunter খোলে */}
                    <button
                      onClick={() => window.open(targetUrl, '_blank')}
                      className="px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all hover:scale-[1.04] flex items-center gap-1.5 bn"
                      style={{
                        background: 'linear-gradient(135deg,#10B981,#059669)',
                        boxShadow: '0 3px 12px rgba(16,185,129,0.4)',
                        color: '#fff',
                      }}
                    >
                      <Video className="w-4 h-4" />
                      {isLive ? 'Join Live' : 'ক্লাস'}
                    </button>
                    {/* ⏱ SECONDARY: timer */}
                    {onStartFocusTimer && (
                      <button
                        onClick={() => onStartFocusTimer(session)}
                        className="p-2.5 rounded-xl bg-surface-muted border border-border text-gold hover:bg-surface-hover transition-all shrink-0"
                        title="টাইমার দিয়ে পড়ুন"
                      >
                        <Timer className="w-4 h-4" />
                      </button>
                    )}
                  </>
                ) : (
                  /* link নেই → আগের মতো timer button */
                  onStartFocusTimer && !isEnded && (
                    <button
                      onClick={() => onStartFocusTimer(session)}
                      className="p-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white transition-all shrink-0"
                      title="পড়া শুরু করুন (টাইমার)"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};