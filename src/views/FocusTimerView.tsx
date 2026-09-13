import React, { useState, useMemo } from 'react';
import { TimerSession, SubjectCategory } from '../types';
import { FocusTimer } from '../components/FocusTimer';
import { useGlobalTimer } from '../contexts/TimerContext';

interface FocusTimerViewProps {
  onSessionComplete: (session: TimerSession) => void;
  recentSessions: TimerSession[];
  initialTopic?: string;
  initialSubject?: SubjectCategory;
}

const SUBJECT_COLORS: Record<string, string> = {
  Physics: '#38BDF8', Chemistry: '#F472B6', 'Higher Mathematics': '#A78BFA',
  Biology: '#34D399', English: '#FBBF24', Bangla: '#F87171', ICT: '#22D3EE', Other: '#94A3B8',
};

const MODE_LABEL: Record<string, string> = {
  '2min': 'স্টার্ট', '5min': 'ব্রেক', '15min': 'কুইক', '25min': 'পোমোডোরো',
  '50min': 'ডিপ ওয়ার্ক', custom: 'কাস্টম', infinity: 'ইনফিনিটি',
};

const MICRO: React.CSSProperties = {
  fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
  color: '#475569', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
};

const fmtClock = (iso: string) => {
  try { return new Date(iso).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
};

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({
  onSessionComplete, recentSessions, initialTopic, initialSubject,
}) => {
  const { isRunning, secondsElapsed } = useGlobalTimer();

  const [autoStarted] = useState(() => {
    const hash = window.location.hash;
    if (hash.includes('#autostart=2min')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      return true;
    }
    return false;
  });

  /* ⭐ LIVE: চলন্ত সেশন সহ আজকের মোট */
  const baseMins = useMemo(() => recentSessions.reduce((a, s) => a + s.durationMinutes, 0), [recentSessions]);
  const liveMins = isRunning ? secondsElapsed / 60 : 0;
  const totalMins = baseMins + liveMins;
  const hours = Math.floor(totalMins / 60);
  const mins = Math.floor(totalMins % 60);
  const goalPct = Math.min(100, (totalMins / 480) * 100);

  const week = useMemo(() => {
    const bnWeek = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
    const days: { key: string; label: string; mins: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push({ key: d.toISOString().split('T')[0], label: bnWeek[d.getDay()], mins: 0 });
    }
    recentSessions.forEach((s) => {
      const slot = days.find((dd) => dd.key === s.dateKey);
      if (slot) slot.mins += s.durationMinutes;
    });
    return days;
  }, [recentSessions]);
  const weekMax = Math.max(60, ...week.map((w) => w.mins));

  return (
    <div className="space-y-8 pb-20 animate-in fade-in">
      {/* ═══ HEADER ROW ═══ */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p style={MICRO}>Focus</p>
          <h1 className="text-xl sm:text-2xl font-black bn mt-1 truncate" style={{ color: '#F4F6F8', fontFamily: "'Anek Bangla', sans-serif" }}>
            আজকের সেশন
          </h1>
        </div>
        <div className="text-right shrink-0">
          <p className="font-mono font-black tabular-nums leading-none" style={{ fontSize: 30, color: '#F8FAFC' }}>
            {hours > 0 ? `${hours}h ${String(mins).padStart(2, '0')}m` : `${mins}m`}
          </p>
          <p className="flex items-center justify-end gap-1.5 mt-1" style={MICRO}>
            {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 6px #34D399' }} />}
            {isRunning ? 'live counting' : 'today total'}
          </p>
        </div>
      </div>

      {/* ═══ GOAL HAIRLINE ═══ */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span style={MICRO}>Daily Goal · 8h</span>
          <span className="text-[10px] font-black font-mono tabular-nums" style={{ color: '#FBBF24' }}>{Math.round(goalPct)}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${goalPct}%`, background: 'linear-gradient(90deg,#DC143C,#FBBF24)', boxShadow: '0 0 10px rgba(251,191,36,0.4)' }}
          />
        </div>
      </div>

      {/* ═══ TIMER ═══ */}
      <FocusTimer
        onSessionComplete={onSessionComplete}
        initialTopic={initialTopic}
        initialSubject={initialSubject}
        skipSetup={autoStarted}
      />

      {/* ═══ LOG + RHYTHM (minimal, no boxes) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        <section>
          <div className="flex items-center justify-between mb-3">
            <p style={MICRO}>Session Log</p>
            <span className="text-[9px] font-mono" style={{ color: '#334155' }}>{String(recentSessions.length).padStart(2, '0')}</span>
          </div>

          {recentSessions.length === 0 ? (
            <p className="text-[11px] bn py-6" style={{ color: '#334155' }}>এখনো কোনো সেশন সম্পন্ন হয়নি</p>
          ) : (
            <div className="space-y-0">
              {recentSessions.slice(0, 8).map((s, idx) => {
                const color = SUBJECT_COLORS[s.subject] || '#94A3B8';
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 py-2.5"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                    <span className="w-11 text-[9px] font-mono tabular-nums shrink-0" style={{ color: '#334155' }}>{fmtClock(s.completedAt)}</span>
                    <p className="flex-1 text-[11px] font-semibold bn truncate" style={{ color: '#CBD5E1' }}>{s.topicName}</p>
                    <span className="text-[9px] bn shrink-0 hidden sm:block" style={{ color: '#334155' }}>{MODE_LABEL[s.mode] || s.mode}</span>
                    <span className="text-[11px] font-black font-mono tabular-nums shrink-0" style={{ color }}>+{s.durationMinutes}m</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <p style={MICRO}>Weekly Rhythm</p>
            <span className="text-[9px] font-mono" style={{ color: '#334155' }}>7d</span>
          </div>

          <div className="flex items-end gap-2 sm:gap-3" style={{ height: 96 }}>
            {week.map((d, i) => (
              <div key={d.key} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
                <div
                  className="w-full rounded-md transition-all duration-700"
                  style={{
                    height: `${Math.max(4, (d.mins / weekMax) * 100)}%`,
                    background: i === 6 ? 'linear-gradient(180deg,#FBBF24,#DC143C)' : 'rgba(255,255,255,0.07)',
                  }}
                />
                <span className="text-[8px] bn" style={{ color: i === 6 ? '#FBBF24' : '#334155' }}>{d.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};