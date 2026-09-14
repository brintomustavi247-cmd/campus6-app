import React, { useEffect, useState } from 'react';
import { RoutineDay, ClassSession } from '../types';
import { useClassLinks } from '../utils/useClassLinks';
import { getClassWindow } from '../utils/classExamWindow';
import { Video, Timer as TimerIcon, BookOpen, Radio, Calendar, CheckCircle2, Sparkles } from 'lucide-react';

const SUBJECT_COLORS: Record<string, string> = {
  Physics: '#38BDF8', Chemistry: '#F472B6', 'Higher Mathematics': '#A78BFA',
  Biology: '#34D399', English: '#FBBF24', Bangla: '#F87171', ICT: '#22D3EE', Other: '#94A3B8',
};

const BN: React.CSSProperties = { fontFamily: "'Hind Siliguri', 'Anek Bangla', sans-serif" };
const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };
const ORBITRON: React.CSSProperties = { fontFamily: "'Orbitron', 'Lexend', sans-serif" };

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
  const liveSession = sessions.find((s) => getClassWindow(s, dateKey).status === 'live');
  const endedCount = sessions.filter((s) => getClassWindow(s, dateKey).status === 'ended').length;

  const isLive = !!liveSession;
  const allDone = sessions.length > 0 && endedCount === sessions.length;
  const progressPct = sessions.length > 0 ? (endedCount / sessions.length) * 100 : 0;

  const liveWin = liveSession ? getClassWindow(liveSession, dateKey) : null;
  const nextWin = nextUp ? getClassWindow(nextUp, dateKey) : null;
  const targetWin = isLive ? liveWin : nextWin;
  const targetSec = targetWin
    ? Math.max(0, Math.round((isLive ? targetWin!.minutesRemaining : targetWin!.minutesUntilStart) * 60))
    : 0;
  const hh = pad(Math.floor(targetSec / 3600));
  const mm = pad(Math.floor((targetSec % 3600) / 60));
  const ss = pad(targetSec % 60);

  const accent = isLive ? '#F87171' : allDone ? '#6EE7B7' : '#FBBF24';

  /* ─── Rest day ─── */
  if (!routine || routine.isRestDay || sessions.length === 0) {
    return (
      <article
        className="relative rounded-2xl p-8 text-center overflow-hidden"
        style={{ background: '#0A0C12', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(59,130,246,0.05)' }} />
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <BookOpen className="w-6 h-6" style={{ color: '#64748B' }} />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ ...BN, color: '#F8FAFC' }}>বিশ্রামের দিন</h3>
        <p className="text-sm max-w-xs mx-auto" style={{ ...BN, color: '#94A3B8', lineHeight: 1.6 }}>
          আজ কোনো ক্লাস নেই — নিজের মতো পড়ুন বা বিশ্রাম নিন
        </p>
      </article>
    );
  }

  return (
    <article
      className="relative rounded-2xl overflow-hidden"
      style={{ background: '#0A0C12', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* ═══ HEADER ═══ */}
      <header className="px-6 py-5 flex items-center justify-between gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Calendar className="w-4 h-4" style={{ color: '#CBD5E1' }} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[17px] font-bold leading-tight truncate" style={{ ...BN, color: '#F8FAFC' }}>
              আজকের ক্লাস রুটিন
            </h2>
            <p className="text-[10px] font-black tracking-[0.22em] uppercase mt-0.5" style={{ ...MONO, color: '#64748B' }}>
              {dateKey} · {sessions.length} SESSIONS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: accent, boxShadow: `0 0 8px ${accent}`, animation: isLive ? 'routinePulse 1.4s infinite' : 'none' }}
          />
          <span className="text-[9px] font-black tracking-[0.2em] uppercase" style={{ ...MONO, color: accent }}>
            {isLive ? 'LIVE' : allDone ? 'DONE' : 'UPCOMING'}
          </span>
        </div>
      </header>

      {/* ═══ HERO COUNTDOWN ═══ */}
      {targetWin && (
        <div
          className="relative px-6 py-6 overflow-hidden"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: `radial-gradient(ellipse at top right, ${accent}08, transparent 60%), radial-gradient(ellipse at bottom left, ${accent}05, transparent 60%)`,
          }}
        >
          {/* Glow accent */}
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none"
            style={{ background: `${accent}10` }}
          />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            {/* Left: session info */}
            <div className="min-w-0 flex-1">
              <p
                className="flex items-center gap-1.5 text-[9px] font-black tracking-[0.22em] uppercase mb-2"
                style={{ ...MONO, color: accent }}
              >
                {isLive ? (
                  <><Radio className="w-3 h-3" /> LIVE · ENDS IN</>
                ) : (
                  <><Sparkles className="w-3 h-3" /> NEXT UP</>
                )}
              </p>
              <h3
                className="text-lg sm:text-xl font-bold leading-snug truncate mb-1.5"
                style={{ ...BN, color: '#F1F5F9' }}
              >
                {isLive ? liveSession!.topic : nextUp!.topic}
              </h3>
              <div className="flex items-center gap-3 text-[11px]" style={{ ...MONO, color: '#64748B' }}>
                <span>{isLive ? liveSession!.time : nextUp!.time}</span>
                <span style={{ color: '#334155' }}>·</span>
                <span className="flex items-center gap-1.5" style={{ ...BN, fontFamily: "'Hind Siliguri', sans-serif" }}>
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: SUBJECT_COLORS[isLive ? liveSession!.subject : nextUp!.subject] || '#94A3B8' }}
                  />
                  {isLive ? liveSession!.subject : nextUp!.subject}
                </span>
              </div>
            </div>

            {/* Right: editorial flip timer */}
            <div className="flex items-end gap-1.5 shrink-0">
              {[{ v: hh, l: 'HRS' }, { v: mm, l: 'MIN' }, { v: ss, l: 'SEC' }].map((b, i) => (
                <React.Fragment key={b.l}>
                  {i > 0 && (
                    <span
                      className="font-black text-xl pb-3"
                      style={{ ...ORBITRON, color: accent, opacity: 0.5 }}
                    >
                      :
                    </span>
                  )}
                  <div className="flex flex-col items-center">
                    <div
                      className="relative px-3 py-2.5 rounded-lg overflow-hidden"
                      style={{
                        background: 'rgba(0,0,0,0.6)',
                        border: `1px solid ${accent}35`,
                        boxShadow: `inset 0 0 16px ${accent}12, 0 0 16px ${accent}08`,
                      }}
                    >
                      {/* Flip hairline */}
                      <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: `${accent}30` }} />
                      <span
                        className="relative text-2xl sm:text-[28px] font-black tabular-nums leading-none"
                        style={{ ...ORBITRON, color: accent, letterSpacing: '-0.02em' }}
                      >
                        {b.v}
                      </span>
                    </div>
                    <span
                      className="text-[8px] font-black tracking-[0.15em] mt-1.5"
                      style={{ ...MONO, color: '#475569' }}
                    >
                      {b.l}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ PROGRESS BAR ═══ */}
      <div className="px-6 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex-1 h-px relative overflow-visible" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="absolute top-0 bottom-0 left-0 transition-all duration-1000 ease-out"
            style={{
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, ${accent}, ${accent}80)`,
              boxShadow: `0 0 8px ${accent}50`,
            }}
          />
        </div>
        <span
          className="text-[10px] font-black tabular-nums shrink-0"
          style={{ ...MONO, color: '#94A3B8' }}
        >
          <span style={{ color: accent }}>{endedCount}</span>
          <span style={{ color: '#334155' }}> / </span>
          <span>{sessions.length}</span>
        </span>
      </div>

      {/* ═══ SESSION TIMELINE ═══ */}
      <div>
        {sessions.map((s, i) => {
          const color = SUBJECT_COLORS[s.subject] || '#94A3B8';
          const link = classLinkFor(s);
          const win = getClassWindow(s, dateKey);
          const isSessionLive = win.status === 'live';
          const isEnded = win.status === 'ended';
          const isNext = !isSessionLive && !isEnded && s === nextUp;
          const isHighlighted = isSessionLive || isNext;

          return (
            <div
              key={s.id}
              className="group relative px-6 py-4 transition-all hover:bg-white/[0.02]"
              style={{
                borderBottom: i < sessions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                opacity: isEnded ? 0.4 : 1,
                background: isSessionLive ? `${accent}04` : undefined,
              }}
            >
              {/* Left accent spine — status indicator */}
              {isHighlighted && (
                <div
                  className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r"
                  style={{ background: accent, boxShadow: `0 0 8px ${accent}80` }}
                />
              )}

              <div className="flex items-center gap-4">
                {/* Time + subject dot */}
                <div className="flex items-center gap-3 shrink-0" style={{ width: 90 }}>
                  <span
                    className="text-[13px] font-black tabular-nums"
                    style={{
                      ...MONO,
                      color: isSessionLive ? accent : isEnded ? '#475569' : '#F8FAFC',
                      textShadow: isSessionLive ? `0 0 10px ${accent}60` : 'none',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {s.time}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: isEnded ? '#334155' : color,
                      boxShadow: isSessionLive ? `0 0 6px ${color}` : 'none',
                    }}
                  />
                </div>

                {/* Content — topic + subject label (single line) */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[13px] font-semibold truncate leading-tight ${isEnded ? 'line-through' : ''}`}
                    style={{
                      ...BN,
                      color: isEnded ? '#475569' : isSessionLive ? '#F8FAFC' : '#E2E8F0',
                      textDecorationColor: isEnded ? '#334155' : undefined,
                    }}
                  >
                    {s.topic}
                  </p>
                  <p
                    className="text-[9px] font-black tracking-[0.15em] uppercase mt-1"
                    style={{ ...MONO, color: isEnded ? '#334155' : color, opacity: 0.9 }}
                  >
                    {s.subject}
                  </p>
                </div>

                {/* Actions — subtle icon buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {link && !isEnded && (
                    <button
                      onClick={() => window.open(link.url, '_blank')}
                      className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-extrabold transition-all hover:scale-[1.03] active:scale-95"
                      style={{
                        ...BN,
                        fontSize: 10,
                        background: isSessionLive ? accent : 'rgba(16,185,129,0.12)',
                        color: isSessionLive ? '#fff' : '#34D399',
                        border: `1px solid ${isSessionLive ? accent : 'rgba(16,185,129,0.3)'}`,
                        boxShadow: isSessionLive ? `0 0 12px ${accent}40` : 'none',
                      }}
                    >
                      <Video className="w-3 h-3" />
                      {isSessionLive ? 'Join' : 'ক্লাস'}
                    </button>
                  )}
                  {isEnded && (
                    <div
                      className="flex items-center justify-center w-7 h-7 rounded-lg"
                      style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#34D399' }} />
                    </div>
                  )}
                  {onStartFocusTimer && !isEnded && (
                    <button
                      onClick={() => onStartFocusTimer(s)}
                      className="flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:scale-105 active:scale-95"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                      title="ফোকাস টাইমার"
                    >
                      <TimerIcon className="w-3.5 h-3.5" style={{ color: '#FBBF24' }} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer
        className="px-6 py-3 flex items-center justify-between"
        style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <span className="text-[10px] font-semibold flex items-center gap-1.5" style={{ ...BN, color: '#64748B' }}>
          {allDone ? (
            <>🎉 সব ক্লাস সম্পন্ন — দারুণ!</>
          ) : isLive ? (
            <>ক্লাস চলছে — ফোকাস রাখুন</>
          ) : (
            <>{sessions.length - endedCount} টি ক্লাস বাকি</>
          )}
        </span>
        <span className="text-[9px] font-black tabular-nums" style={{ ...MONO, color: '#334155' }}>
          {Math.round(progressPct)}% COMPLETE
        </span>
      </footer>

      <style>{`
        @keyframes routinePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </article>
  );
};