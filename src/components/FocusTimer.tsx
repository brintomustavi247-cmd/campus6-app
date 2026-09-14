import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Bell, Clock, Infinity, Zap } from 'lucide-react';
import { TimerSession, SubjectCategory } from '../types';
import { useGlobalTimer } from '../contexts/TimerContext';
import { TopicPickerModal } from './TopicPickerModal';
import { getTopicPickerMode } from '../data/hscSyllabus';

interface FocusTimerProps {
  onSessionComplete?: (session: TimerSession) => void;
  initialTopic?: string;
  initialSubject?: SubjectCategory;
  skipSetup?: boolean;
}

const QUOTES = [
  'শুধু ২ মিনিট শুরু করো।',
  'ছোট শুরু, বড় অগ্রগতি।',
  'আর ৫ মিনিট — তুমি পারবে।',
  'মনোযোগই সাফল্যের চাবিকাঠি।',
  'আজ ফোকাস, আগামীকাল উদযাপন।',
];

const getModeDuration = (mode: string, customMins: number): number => {
  if (mode === 'infinity') return 0;
  if (mode === 'custom') return customMins * 60;
  return ({ '2min': 120, '5min': 300, '15min': 900, '25min': 1500, '50min': 3000 } as Record<string, number>)[mode] ?? 1500;
};

const MODE_CONFIG = {
  '2min': { label: '2', desc: 'Start', color: '#F97316', accent: '#FCD34D' },
  '5min': { label: '5', desc: 'Break', color: '#10B981', accent: '#6EE7B7' },
  '15min': { label: '15', desc: 'Quick', color: '#F59E0B', accent: '#FCD34D' },
  '25min': { label: '25', desc: 'Pomodoro', color: '#3B82F6', accent: '#60A5FA' },
  '50min': { label: '50', desc: 'Deep', color: '#8B5CF6', accent: '#C4B5FD' },
  custom: { label: '∞', desc: 'Custom', color: '#64748B', accent: '#94A3B8' },
  infinity: { label: '∞', desc: 'Infinity', color: '#EC4899', accent: '#F9A8D4' },
} as const;

/* ─── Flip-clock digit card (responsive) ─── */
const FlipDigit: React.FC<{ value: string; color: string }> = ({ value, color }) => (
  <div
    className="relative flex items-center justify-center overflow-hidden"
    style={{
      width: 'clamp(36px, 10.5vw, 68px)',
      height: 'clamp(50px, 14.5vw, 92px)',
      background: 'linear-gradient(180deg, rgba(20,25,35,0.95) 0%, rgba(10,15,25,0.98) 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 8,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.4)',
    }}
  >
    {/* center divider line (like flip-clock) */}
    <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: 'rgba(0,0,0,0.6)' }} />
    {/* holographic shimmer top */}
    <div
      className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
      style={{
        background: `linear-gradient(180deg, ${color}12 0%, transparent 100%)`,
      }}
    />
    {/* digit */}
    <span
      className="font-black font-mono leading-none relative z-10"
      style={{
        fontSize: 'clamp(22px, 7vw, 56px)',
        color: '#F8FAFC',
        textShadow: `0 0 20px ${color}60`,
        letterSpacing: '-0.04em',
      }}
    >
      {value}
    </span>
    {/* corner notch */}
    <div
      className="absolute top-0 right-0 w-2 h-2 pointer-events-none"
      style={{ background: `linear-gradient(135deg, transparent 50%, ${color}40 50%)` }}
    />
  </div>
);

/* ─── Colon separator (responsive) ─── */
const FlipColon: React.FC<{ color: string; pulse: boolean }> = ({ color, pulse }) => (
  <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 px-0.5 sm:px-1">
    <span
      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
      style={{
        background: color,
        boxShadow: `0 0 12px ${color}`,
        animation: pulse ? 'colonBlink 1s ease-in-out infinite' : 'none',
      }}
    />
    <span
      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
      style={{
        background: color,
        boxShadow: `0 0 12px ${color}`,
        animation: pulse ? 'colonBlink 1s ease-in-out infinite' : 'none',
      }}
    />
  </div>
);

export const FocusTimer: React.FC<FocusTimerProps> = ({
  onSessionComplete,
  initialTopic = 'সাধারণ পড়া',
  initialSubject = 'Physics',
  skipSetup = false,
}) => {
  const {
    isRunning, secondsLeft, mode, topicName,
    setTopicName: setGlobalTopic, setMode: setGlobalMode,
    startTimer, pauseTimer, resumeTimer, stopTimer,
    discardCurrentSession,
  } = useGlobalTimer();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [quoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [customMins, setCustomMins] = useState(30);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingStart, setPendingStart] = useState<{ mode: any; duration: number } | null>(null);

  useEffect(() => {
    if (!skipSetup || isRunning) return;
    setTimeout(() => {
      setGlobalTopic('Quick Focus Session');
      startTimer('2min', 'Quick Focus Session', 120);
    }, 200);
  }, [skipSetup, isRunning, startTimer, setGlobalTopic]);

  const handleModeChange = (newMode: typeof mode) => {
    if (newMode === 'infinity') {
      setGlobalMode(newMode, 0);
    } else {
      const mins = newMode === '2min' ? 2 : newMode === '5min' ? 5 : newMode === '15min' ? 15 : newMode === '50min' ? 50 : newMode === 'custom' ? customMins : 25;
      setGlobalMode(newMode, mins * 60);
    }
  };

  const hasPausedSession =
    !isRunning && secondsLeft > 0 &&
    (mode === 'infinity' ? true : secondsLeft < getModeDuration(mode, customMins));

  const toggleTimer = () => {
    if (isRunning) { pauseTimer(); return; }
    if (hasPausedSession) { resumeTimer(); return; }
    const trueInitialDuration = getModeDuration(mode, customMins);
    if (mode === '2min') {
      startTimer(mode, topicName || 'Quick Focus Session', trueInitialDuration);
      return;
    }
    if (getTopicPickerMode() === 'syllabus') {
      setPendingStart({ mode, duration: trueInitialDuration });
      setPickerOpen(true);
    } else {
      startTimer(mode, topicName || initialTopic, trueInitialDuration);
    }
  };

  const handleTopicPicked = (label: string) => {
    setGlobalTopic(label);
    if (pendingStart) {
      startTimer(pendingStart.mode, label, pendingStart.duration);
      setPendingStart(null);
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(p => {
        if (p === 'granted') alert('নোটিফিকেশন পারমিশন চালু করা হয়েছে!');
      });
    }
  };

  const formatTime = (t: number) => {
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    if (h > 0) return { h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0'), showH: true };
    return { h: '', m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0'), showH: false };
  };

  const totalDuration = getModeDuration(mode, customMins);
  const elapsed = totalDuration - secondsLeft;
  const progress = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0;
  const cfg = MODE_CONFIG[mode as keyof typeof MODE_CONFIG] || MODE_CONFIG['25min'];
  const time = formatTime(secondsLeft);

  // Progress ring (SVG)
  const ringSize = 340;
  const strokeW = 3;
  const radius = (ringSize - strokeW) / 2;
  const C = 2 * Math.PI * radius;
  const offset = mode === 'infinity' ? 0 : C * (1 - progress / 100);

  // Tick marks (60)
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = (i / 60) * 360;
    const isMajor = i % 5 === 0;
    const rad = ((angle - 90) * Math.PI) / 180;
    const innerR = isMajor ? 138 : 144;
    const outerR = 152;
    return {
      x1: ringSize / 2 + Math.cos(rad) * innerR,
      y1: ringSize / 2 + Math.sin(rad) * innerR,
      x2: ringSize / 2 + Math.cos(rad) * outerR,
      y2: ringSize / 2 + Math.sin(rad) * outerR,
      isMajor,
      passed: (angle / 360) * 100 <= progress,
    };
  });

  // Hour marks (12) with labels
  const hourMarks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const r = 168;
    return {
      x: ringSize / 2 + Math.cos(rad) * r,
      y: ringSize / 2 + Math.sin(rad) * r,
      label: i === 0 ? '12' : String(i),
    };
  });

  return (
    <div
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: 'linear-gradient(165deg, #0A0E18 0%, #0F141F 50%, #080B13 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* holographic background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(125deg, #F97316 0%, #3B82F6 25%, #8B5CF6 50%, #EC4899 75%, #F97316 100%)',
          backgroundSize: '200% 200%',
          animation: 'holoShift 15s ease infinite',
        }}
      />

      {/* ambient glow */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: `radial-gradient(ellipse, ${cfg.color}, transparent)` }}
      />

      <style>{`
        @keyframes holoShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes colonBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes tickPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>

      <div className="relative z-10 p-4 sm:p-8">
        {/* ─── Top Bar ─── */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div
              className="relative w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${cfg.color}25, ${cfg.color}10)`,
                border: `1px solid ${cfg.color}40`,
              }}
            >
              <Clock className="w-5 h-5" style={{ color: cfg.color }} />
              {isRunning && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0A0E18]" />
              )}
            </div>
            <div>
              <p className="text-[9px] font-black tracking-[0.3em] uppercase" style={{ color: cfg.color }}>
                Precision Chronometer
              </p>
              <h3 className="text-base font-black bn mt-0.5" style={{ color: '#F8FAFC', fontFamily: "'Anek Bangla', sans-serif" }}>
                ফোকাস টাইমার
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl transition-all hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: soundEnabled ? cfg.color : '#475569',
              }}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={requestNotificationPermission}
              className="p-2.5 rounded-xl transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#64748B' }}
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── Mode Pills (horizontal, scrollable) ─── */}
        <div className="mb-6 sm:mb-8 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 w-max">
            {Object.entries(MODE_CONFIG).map(([modeId, config]) => (
              <button
                key={modeId}
                onClick={() => handleModeChange(modeId as any)}
                className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl transition-all"
                style={{
                  background: mode === modeId
                    ? `linear-gradient(135deg, ${config.color}30, ${config.color}15)`
                    : 'rgba(255,255,255,0.02)',
                  border: mode === modeId ? `1px solid ${config.color}60` : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: mode === modeId ? `0 0 20px ${config.color}30, inset 0 1px 0 ${config.color}20` : 'none',
                }}
              >
                <span
                  className="text-sm font-black font-mono"
                  style={{ color: mode === modeId ? config.color : '#64748B' }}
                >
                  {config.label}
                </span>
                <span
                  className="text-[9px] font-black tracking-widest uppercase"
                  style={{ color: mode === modeId ? config.accent : '#475569' }}
                >
                  {config.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom minutes */}
        {mode === 'custom' && (
          <div className="mb-8 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[9px] font-black tracking-[0.2em] uppercase mb-3" style={{ color: '#64748B' }}>Custom Duration</p>
            <div className="flex flex-wrap gap-2">
              {[15, 30, 45, 60, 90, 120].map((v) => (
                <button
                  key={v}
                  onClick={() => { setCustomMins(v); setGlobalMode('custom', v * 60); }}
                  className="px-4 py-2.5 rounded-xl text-xs font-black font-mono transition-all hover:scale-105"
                  style={{
                    background: customMins === v ? cfg.color : 'rgba(255,255,255,0.04)',
                    color: customMins === v ? '#0A0E18' : '#94A3B8',
                    border: customMins === v ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: customMins === v ? `0 8px 20px ${cfg.color}40` : 'none',
                  }}
                >
                  {v}m
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Topic Input */}
        <div className="mb-6 sm:mb-8">
          <p className="text-[9px] font-black tracking-[0.2em] uppercase mb-2 ml-1" style={{ color: '#475569' }}>Current Focus</p>
          <div className="relative">
            <input
              type="text"
              value={topicName}
              onChange={(e) => setGlobalTopic(e.target.value)}
              placeholder="যেমন: ভেক্টর-১ রিভিশন"
              className="w-full px-5 py-4 rounded-2xl text-sm font-semibold bn transition-all focus:outline-none"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F8FAFC',
              }}
            />
            <div
              className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}40, transparent)` }}
            />
          </div>
        </div>

        {/* ─── Precision Chronometer Display (responsive) ─── */}
        <div className="relative flex items-center justify-center mb-8 sm:mb-10">
          <div className="relative w-full max-w-[290px] sm:max-w-[340px] aspect-square">
            {/* Outer bezel */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4), 0 10px 40px rgba(0,0,0,0.5)',
              }}
            />

            {/* SVG scales with container via viewBox */}
            <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${ringSize} ${ringSize}`}>
              <defs>
                <linearGradient id="chronoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={cfg.color} />
                  <stop offset="100%" stopColor={cfg.accent} />
                </linearGradient>
              </defs>

              <circle cx={ringSize / 2} cy={ringSize / 2} r={radius} stroke="rgba(255,255,255,0.04)" strokeWidth={strokeW} fill="none" />
              <circle
                cx={ringSize / 2} cy={ringSize / 2} r={radius}
                stroke="url(#chronoGrad)" strokeWidth={strokeW} fill="none" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={offset}
                transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)', filter: `drop-shadow(0 0 8px ${cfg.color})` }}
              />

              {ticks.map((t, i) => (
                <line
                  key={i}
                  x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                  stroke={t.passed ? cfg.color : 'rgba(255,255,255,0.15)'}
                  strokeWidth={t.isMajor ? 2 : 1}
                  strokeLinecap="round"
                  style={t.passed ? { filter: `drop-shadow(0 0 4px ${cfg.color})` } : {}}
                />
              ))}

              {hourMarks.map((h, i) => (
                <text
                  key={i}
                  x={h.x} y={h.y}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="rgba(255,255,255,0.25)"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="700"
                >
                  {h.label}
                </text>
              ))}
            </svg>

            {/* Inner display — percentage inset = scales with ring */}
            <div
              className="absolute rounded-full flex flex-col items-center justify-center px-2"
              style={{
                inset: '6%',
                background: 'radial-gradient(circle at 30% 20%, rgba(20,25,35,0.95), rgba(5,8,15,0.98))',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.3)',
              }}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                {isRunning && <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color, animation: 'colonBlink 1s ease-in-out infinite' }} />}
                <span className="text-[8px] sm:text-[9px] font-black tracking-[0.25em] sm:tracking-[0.3em] uppercase" style={{ color: cfg.color }}>
                  {mode === 'infinity' ? (isRunning ? 'Counting' : 'Infinity') : isRunning ? 'Focusing' : hasPausedSession ? 'Paused' : 'Ready'}
                </span>
                {isRunning && <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color, animation: 'colonBlink 1s ease-in-out infinite' }} />}
              </div>

              <div className="flex items-center gap-0.5 sm:gap-1">
                {time.showH && (
                  <>
                    <FlipDigit value={time.h[0]} color={cfg.color} />
                    <FlipDigit value={time.h[1]} color={cfg.color} />
                    <FlipColon color={cfg.color} pulse={isRunning} />
                  </>
                )}
                <FlipDigit value={time.m[0]} color={cfg.color} />
                <FlipDigit value={time.m[1]} color={cfg.color} />
                <FlipColon color={cfg.color} pulse={isRunning} />
                <FlipDigit value={time.s[0]} color={cfg.color} />
                <FlipDigit value={time.s[1]} color={cfg.color} />
              </div>

              {totalDuration > 0 && progress > 0 && (
                <div className="mt-2 sm:mt-4 flex items-center gap-2">
                  <div className="w-12 sm:w-16 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.accent})`, boxShadow: `0 0 8px ${cfg.color}` }}
                    />
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-black font-mono" style={{ color: cfg.accent }}>{Math.round(progress)}%</span>
                </div>
              )}

              <div className="mt-2 sm:mt-3 flex items-center gap-1.5">
                <Zap className="w-3 h-3" style={{ color: cfg.color }} />
                <span className="text-[8px] sm:text-[9px] font-bold bn" style={{ color: '#64748B' }}>
                  {MODE_CONFIG[mode as keyof typeof MODE_CONFIG]?.desc || 'Mode'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="mb-6 sm:mb-8 px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}
          >
            <Zap className="w-4 h-4" style={{ color: cfg.color }} />
          </div>
          <p className="text-xs font-semibold bn" style={{ color: '#94A3B8' }}>{QUOTES[quoteIndex]}</p>
        </div>

        {/* ─── Controls ─── */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={toggleTimer}
            className="relative flex items-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: isRunning
                ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                : hasPausedSession
                  ? 'linear-gradient(135deg, #10B981, #059669)'
                  : `linear-gradient(135deg, ${cfg.color}, ${cfg.accent})`,
              color: '#fff',
              boxShadow: isRunning
                ? '0 12px 30px rgba(239,68,68,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
                : hasPausedSession
                  ? '0 12px 30px rgba(16,185,129,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
                  : `0 12px 30px ${cfg.color}50, inset 0 1px 0 rgba(255,255,255,0.2)`,
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            <span className="bn">{isRunning ? 'পজ' : hasPausedSession ? 'চালু' : 'শুরু'}</span>
          </button>

          {mode === 'infinity' && (
            <button
              onClick={stopTimer}
              disabled={!isRunning && secondsLeft <= 0}
              className="px-6 py-4 rounded-2xl font-black text-sm transition-all hover:brightness-110 disabled:opacity-40"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', color: '#EF4444' }}
            >
              Stop
            </button>
          )}

          <button
            onClick={discardCurrentSession}
            title="রিসেট"
            className="p-4 rounded-2xl transition-all hover:scale-105 hover:brightness-125"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <TopicPickerModal
        open={pickerOpen}
        onClose={() => { setPickerOpen(false); setPendingStart(null); }}
        onPick={handleTopicPicked}
      />
    </div>
  );
};