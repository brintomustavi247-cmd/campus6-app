import React, { useEffect, useState } from 'react';
import { RoutineDay, ClassSession } from '../types';
import { useClassLinks } from '../utils/useClassLinks';
import { getClassWindow } from '../utils/classExamWindow';
import { Video, Timer as TimerIcon, BookOpen, Radio, Calendar } from 'lucide-react';

const SUBJECT_COLORS: Record<string, string> = {
  Physics: '#38BDF8', Chemistry: '#F472B6', 'Higher Mathematics': '#A78BFA',
  Biology: '#34D399', English: '#FBBF24', Bangla: '#F87171', ICT: '#22D3EE', Other: '#94A3B8',
};

interface DailyRoutineCardProps {
  routine: RoutineDay;
  dateKey: string;
  onStartFocusTimer?: (session: ClassSession) => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

export const DailyRoutineCard: React.FC<DailyRoutineCardProps> = ({ routine, dateKey, onStartFocusTimer }) => {
  const { links } = useClassLinks(dateKey || '');
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const classLinkFor = (s: ClassSession) =>
    (links || []).find((l: any) => l.link_type === 'class' && (l.session_index === s.sessionIndex || l.sessionIndex === s.sessionIndex)) ||
    (links || []).find((l: any) => l.link_type === 'class');

  const sessions = routine?.sessions || [];
  const nextUp = sessions.find((s) => getClassWindow(s, dateKey).status === 'upcoming');
  const nextWin = nextUp ? getClassWindow(nextUp, dateKey) : null;
  const liveSession = sessions.find((s) => getClassWindow(s, dateKey).status === 'live');
  const endedCount = sessions.filter((s) => getClassWindow(s, dateKey).status === 'ended').length;

  const isLive = !!liveSession;
  const allDone = sessions.length > 0 && endedCount === sessions.length;

  const liveWin = liveSession ? getClassWindow(liveSession, dateKey) : null;
  const targetWin = isLive ? liveWin : nextWin;
  const targetSec = targetWin
    ? Math.max(0, Math.round((isLive ? targetWin!.minutesRemaining : targetWin!.minutesUntilStart) * 60))
    : 0;
  const hh = pad(Math.floor(targetSec / 3600));
  const mm = pad(Math.floor((targetSec % 3600) / 60));
  const ss = pad(targetSec % 60);

  const accent = isLive ? '#F87171' : allDone ? '#6EE7B7' : '#FBBF24';
  const accentLabel = isLive ? 'LIVE' : allDone ? 'COMPLETE' : 'UPCOMING';

  if (!routine || routine.isRestDay || sessions.length === 0) {
    return (
      <article
        className="relative rounded-3xl p-8 text-center"
        style={{
          background: '#0A0C12',
          border: '1px solid rgba(255,255,255,0.06)',
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.04), transparent 50%)',
        }}
      >
        <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-3" style={{ color: '#64748B', fontFamily: "'JetBrains Mono', monospace" }}>
          § Today
        </p>
        <h3 className="text-2xl font-black bn mb-2" style={{ color: '#F8FAFC', fontFamily: "'Anek Bangla', sans-serif" }}>
          বিশ্রামের দিন
        </h3>
        <p className="text-sm bn" style={{ color: '#94A3B8', fontFamily: "'Anek Bangla', sans-serif" }}>
          আজ কোনো ক্লাস নেই — নিজের মতো পড়ুন বা বিশ্রাম নিন
        </p>
      </article>
    );
  }

  return (
    <article
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: '#0A0C12',
        border: '1px solid rgba(255,255,255,0.08)',
        backgroundImage:
          'radial-gradient(circle at 100% 0%, rgba(251,191,36,0.04), transparent 50%), radial-gradient(circle at 0% 100%, rgba(59,130,246,0.03), transparent 50%)',
      }}
    >
      {/* ═══ TOP: Section label + meta ═══ */}
      <header className="px-6 sm:px-8 pt-6 sm:pt-8 pb-5 flex items-start justify-between gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: '#64748B', fontFamily: "'JetBrains Mono', monospace" }}>
              § Today · Classes
            </span>
            <span className="h-px flex-1 max-w-[40px]" style={{ background: 'rgba(255,255,255,0.12)' }} />
          </div>
          <h2 className="text-2xl sm:text-[28px] font-black bn leading-tight" style={{ color: '#F8FAFC', fontFamily: "'Anek Bangla', sans-serif", letterSpacing: '-0.01em' }}>
            আজকের ক্লাস
          </h2>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}`, animation: isLive ? 'routinePulse 1.5s ease-in-out infinite' : 'none' }} />
            <span className="text-[9px] font-black tracking-[0.25em] uppercase" style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}>
              {accentLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Calendar className="w-3 h-3" style={{ color: '#64748B' }} />
            <span className="text-[10px] font-mono" style={{ color: '#64748B' }}>{dateKey}</span>
          </div>
        </div>
      </header>

      {/* ═══ TOPIC + COUNTDOWN HERO ═══ */}
      <section className="px-6 sm:px-8 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Topic (left) */}
          <div className="lg:col-span-3 min-w-0">
            <p className="text-[9px] font-black tracking-[0.25em] uppercase mb-2" style={{ color: '#64748B', fontFamily: "'JetBrains Mono', monospace" }}>
              Next Focus
            </p>
            <h3
              className="text-xl sm:text-2xl font-bold bn leading-snug"
              style={{
                color: '#F1F5F9',
                fontFamily: "'Anek Bangla', sans-serif",
                letterSpacing: '-0.005em',
              }}
            >
              {routine.topicRaw}
            </h3>

            {/* Stats row */}
            <div className="flex items-center gap-4 mt-4">
              {[
                { label: 'Classes', value: String(sessions.length) },
                { label: 'Done', value: String(endedCount) },
                { label: 'Next', value: nextUp ? nextUp.time : '—' },
              ].map((s, i) => (
                <div key={s.label} className="flex items-center gap-2" style={i > 0 ? { paddingLeft: 16, borderLeft: '1px solid rgba(255,255,255,0.08)' } : undefined}>
                  <span className="text-sm font-black font-mono" style={{ color: '#F8FAFC' }}>{s.value}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#64748B' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Countdown (right) */}
          {targetWin && (
            <div className="lg:col-span-2">
              <div
                className="relative rounded-2xl p-5"
                style={{
                  background: isLive ? 'rgba(239,68,68,0.06)' : 'rgba(251,191,36,0.04)',
                  border: `1px solid ${accent}30`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05)`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isLive && <Radio className="w-3.5 h-3.5" style={{ color: accent }} />}
                    <p className="text-[9px] font-black tracking-[0.25em] uppercase" style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}>
                      {isLive ? 'Ends In' : 'Starts In'}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] font-semibold bn mb-3 truncate" style={{ color: '#CBD5E1' }}>
                  {isLive ? liveSession!.topic : nextUp!.topic}
                </p>

                {/* Time display — big mono */}
                <div className="flex items-baseline gap-1 font-mono font-black" style={{ color: '#F8FAFC' }}>
                  <span className="text-3xl sm:text-4xl tabular-nums tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                    {hh}:{mm}
                  </span>
                  <span className="text-lg tabular-nums" style={{ color: accent }}>.{ss}</span>
                </div>

                <p className="text-[9px] font-bold uppercase tracking-wider mt-2" style={{ color: '#64748B' }}>
                  {isLive ? liveSession!.time : nextUp!.time} · {isLive ? liveSession!.subject : nextUp!.subject}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══ PROGRESS HAIRLINE ═══ */}
      <div className="px-6 sm:px-8 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-black tracking-[0.25em] uppercase shrink-0" style={{ color: '#64748B', fontFamily: "'JetBrains Mono', monospace" }}>
            Progress
          </span>
          <div className="flex-1 h-px relative" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="absolute inset-y-0 left-0 transition-all duration-1000"
              style={{
                width: `${(endedCount / sessions.length) * 100}%`,
                background: `linear-gradient(90deg, ${accent}, transparent)`,
                boxShadow: `0 0 12px ${accent}50`,
              }}
            />
          </div>
          <span className="text-[11px] font-black font-mono tabular-nums shrink-0" style={{ color: accent }}>
            {endedCount}/{sessions.length}
          </span>
        </div>
      </div>

      {/* ═══ SESSION LIST — editorial rows ═══ */}
      <div>
        {sessions.map((s, i) => {
          const color = SUBJECT_COLORS[s.subject] || '#94A3B8';
          const link = classLinkFor(s);
          const win = getClassWindow(s, dateKey);
          const isSessionLive = win.status === 'live';
          const isEnded = win.status === 'ended';
          const isNext = !isSessionLive && !isEnded && s === nextUp;

          return (
            <div
              key={s.id}
              className="group relative px-6 sm:px-8 py-5 transition-all hover:bg-white/[0.015]"
              style={{
                borderBottom: i < sessions.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                opacity: isEnded ? 0.45 : 1,
              }}
            >
              {/* Active indicator bar (left edge) */}
              {(isSessionLive || isNext) && (
                <div
                  className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r"
                  style={{
                    background: accent,
                    boxShadow: `0 0 10px ${accent}`,
                  }}
                />
              )}

              <div className="grid grid-cols-[auto_1fr_auto] gap-4 sm:gap-6 items-center">
                {/* Time column */}
                <div className="flex flex-col items-center" style={{ width: 56 }}>
                  <span
                    className="text-[14px] font-black font-mono tabular-nums"
                    style={{
                      color: isSessionLive ? accent : isEnded ? '#475569' : '#F8FAFC',
                      textShadow: isSessionLive ? `0 0 12px ${accent}60` : 'none',
                    }}
                  >
                    {s.time}
                  </span>
                  <span className="text-[8px] font-black tracking-wider uppercase mt-0.5" style={{ color: '#475569' }}>
                    {isSessionLive ? 'NOW' : isEnded ? 'DONE' : isNext ? 'NEXT' : 'WAIT'}
                  </span>
                </div>

                {/* Content */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider"
                      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                    >
                      {s.subject}
                    </span>
                    {isSessionLive && (
                      <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.12)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.3)' }}>
                        <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                        LIVE
                      </span>
                    )}
                    {isNext && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bn" style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.25)' }}>
                        পরবর্তী
                      </span>
                    )}
                  </div>
                  <h4
                    className={`text-[14px] sm:text-[15px] font-bold bn leading-tight ${isEnded ? 'line-through' : ''}`}
                    style={{
                      color: isEnded ? '#475569' : '#F1F5F9',
                      fontFamily: "'Anek Bangla', sans-serif",
                    }}
                  >
                    {s.topic}
                  </h4>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {link && !isEnded && (
                    <button
                      onClick={() => window.open(link.url, '_blank')}
                      className="group/btn relative overflow-hidden px-4 py-2 rounded-xl text-[11px] font-extrabold bn flex items-center gap-1.5 transition-all hover:scale-[1.03] active:scale-[0.97]"
                      style={{
                        background: 'linear-gradient(135deg,#10B981,#059669)',
                        color: '#fff',
                        boxShadow: '0 4px 14px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                      }}
                    >
                      <Video className="w-3.5 h-3.5" /> ক্লাস
                    </button>
                  )}
                  {onStartFocusTimer && !isEnded && (
                    <button
                      onClick={() => onStartFocusTimer(s)}
                      className="p-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#FBBF24' }}
                      title="ফোকাস টাইমার"
                    >
                      <TimerIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ FOOTER ═══ */}
      {sessions.length > 0 && (
        <footer className="px-6 sm:px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" style={{ color: '#64748B' }} />
            <span className="text-[10px] font-bold bn" style={{ color: '#64748B' }}>
              {allDone ? 'সব ক্লাস সম্পন্ন — দারুণ!' : isLive ? 'ক্লাস চলছে — ফোকাস রাখুন' : `${sessions.length - endedCount} টি ক্লাস বাকি`}
            </span>
          </div>
          <span className="text-[9px] font-mono" style={{ color: '#475569' }}>
            {dateKey}
          </span>
        </footer>
      )}

      <style>{`
        @keyframes routinePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.9); }
        }
      `}</style>
    </article>
  );
};