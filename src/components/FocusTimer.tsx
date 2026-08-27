import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Bell, Swords, Clock, Infinity } from 'lucide-react';
import { TimerSession, SubjectCategory } from '../types';
import { useGlobalTimer } from '../contexts/TimerContext';
import { TopicPickerModal } from './TopicPickerModal';
import { getTopicPickerMode } from '../data/hscSyllabus';

interface FocusTimerProps {
  onSessionComplete?: (session: TimerSession) => void;
  initialTopic?: string;
  initialSubject?: SubjectCategory;
}

const QUOTES = [
  'শুধু ২ মিনিট শুরু করো।',
  'Small start, big progress.',
  'আর ৫ মিনিট — তুমি পারবে।',
  'একগ্রতা ও মনোযোগই চান্স পাওয়ার চাবিকাঠি।',
  'Focus today, celebrate tomorrow.',
];

const getModeDuration = (mode: string, customMins: number): number => {
  if (mode === 'infinity') return 0;
  if (mode === 'custom') return customMins * 60;
  return ({ '2min': 120, '5min': 300, '15min': 900, '25min': 1500, '50min': 3000 } as Record<string, number>)[mode] ?? 1500;
};

export const FocusTimer: React.FC<FocusTimerProps> = ({
  onSessionComplete,
  initialTopic = 'সাধারণ পড়া',
  initialSubject = 'Physics',
}) => {
  const {
    isRunning, secondsLeft, mode, topicName,
    setTopicName: setGlobalTopic, setMode: setGlobalMode,
    startTimer, pauseTimer, resumeTimer, stopTimer,
    discardCurrentSession,                      // ⭐ authoritative reset (saves ≥1min)
  } = useGlobalTimer();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [customMins, setCustomMins] = useState(30);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingStart, setPendingStart] = useState<{ mode: any; duration: number } | null>(null);

  // Light quote rotation while idle
  useEffect(() => {
    if (isRunning) return;
    const id = window.setInterval(() => setQuoteIndex(q => (q + 1) % QUOTES.length), 8000);
    return () => window.clearInterval(id);
  }, [isRunning]);

  const handleModeChange = (newMode: typeof mode) => {
    if (newMode === 'custom' || newMode === '50min' || newMode === '15min') {
      setCustomMins(newMode === 'custom' ? customMins : customMins);
    }
    if (newMode === 'infinity') {
      setGlobalMode(newMode, 0);
    } else {
      const mins = newMode === '2min' ? 2 : newMode === '5min' ? 5 : newMode === '15min' ? 15 : newMode === '50min' ? 50 : newMode === 'custom' ? customMins : 25;
      setGlobalMode(newMode, mins * 60);
    }
  };

  const hasPausedSession =
    !isRunning && secondsLeft > 0 &&
    (mode === 'infinity'
      ? true
      : secondsLeft < getModeDuration(mode, customMins));

  const toggleTimer = () => {
    if (isRunning) { pauseTimer(); return; }
    if (hasPausedSession) { resumeTimer(); return; }

    const trueInitialDuration = getModeDuration(mode, customMins);
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

  // ⭐ Fix F2/F3 — Reset delegates to the engine's guarded path. Behavior:
  //   ≥1 min studied → treated as Finish & Save (commits, ends at 00:00);
  //   otherwise pure restore of the full duration. No races, no double-writes.
  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(p => {
        if (p === 'granted') alert('নোটিফিকেশন পারমিশন চালু করা হয়েছে!');
      });
    }
  };

  const formatTime = (t: number) => {
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="p-6 rounded-2xl bg-surface border border-cyan-500/20 shadow-lg text-text-primary flex flex-col items-center text-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-cyan-900/50">
        <div className="flex items-center gap-2 text-cyan-400">
          <Clock className="w-5 h-5" />
          <h3 className="text-xs font-bold">ফোকাস টাইমার (Focus Engine)</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-surface-muted hover:bg-cyan-900/50 border border-cyan-800/40 text-cyan-400 min-h-9 min-w-9 flex items-center justify-center"
            title="শব্দ অন/অফ">
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button onClick={requestNotificationPermission}
            className="p-2 rounded-xl bg-surface-muted hover:bg-cyan-900/50 border border-cyan-800/40 text-cyan-400 min-h-9 min-w-9 flex items-center justify-center"
            title="নোটিফিকেশন পারমিশন">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {[
          { id: '2min', label: '২ মিনিট Start Mode' },
          { id: '25min', label: '২৫ মিনিট Focus' },
          { id: '5min', label: '৫ মিনিট Break' },
          { id: '50min', label: '৫০ মিনিট Deep Work' },
          { id: '15min', label: '১৫ মিনিট Break' },
          { id: 'custom', label: `কাস্টম (${customMins} মি.)` },
          { id: 'infinity', label: '∞ Infinity', icon: <Infinity className="w-4 h-4 inline mr-1" /> },
        ].map(m => (
          <button key={m.id}
            onClick={() => handleModeChange(m.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-9.5 ${
              mode === m.id
                ? 'bg-cyan-500 text-text-primary shadow-md shadow-cyan-500/20'
                : 'bg-surface-muted text-cyan-400 border border-cyan-800/40 hover:bg-cyan-900/50'
            }`}>
            {m.icon}{m.label}
          </button>
        ))}
      </div>

      {/* Custom minutes selector */}
      {mode === 'custom' && (
        <div className="mb-4 flex items-center gap-2">
          {[15, 30, 45, 60, 90, 120].map(v => (
            <button key={v}
              onClick={() => { setCustomMins(v); setGlobalMode('custom', v * 60); }}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold ${customMins === v ? 'bg-cyan-500 text-black' : 'bg-surface-muted text-cyan-400 border border-cyan-800/40'}`}>
              {v}m
            </button>
          ))}
        </div>
      )}

      {/* Topic */}
      <div className="w-full max-w-sm mb-6">
        <label className="text-[11px] font-semibold text-cyan-400/80 block mb-1 text-left">বর্তমান পড়ার টপিক/বিষয়:</label>
        <input type="text" value={topicName}
          onChange={(e) => setGlobalTopic(e.target.value)}
          placeholder="যেমন: ভেক্টর-১ রিভিশন"
          className="w-full px-3.5 py-2 rounded-xl bg-surface-muted border border-cyan-800/60 text-text-primary text-xs focus:outline-none focus:border-cyan-400" />
      </div>

      {/* Dial */}
      <div className="my-2 p-8 rounded-full border-4 border-cyan-400/80 bg-surface-muted shadow-[0_0_40px_rgba(34,211,238,0.15)] min-w-55 min-h-55 flex flex-col items-center justify-center">
        <span className={`font-black font-mono tracking-tight text-text-primary drop-shadow-md ${mode === 'infinity' && secondsLeft >= 3600 ? 'text-4xl' : 'text-5xl'}`}>
          {formatTime(secondsLeft)}
        </span>
        <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-widest mt-2">
          {mode === 'infinity'
            ? (isRunning ? 'Counting Up' : 'Infinity Mode')
            : (mode === '2min' ? 'Start Mode' : isRunning ? 'In Session' : 'Paused')}
        </span>
      </div>

      {/* Quote */}
      <div className="my-4 px-4 py-2 rounded-xl bg-surface-muted border border-cyan-800/40 flex items-center gap-2 max-w-md">
        <Swords className="w-4 h-4 text-cyan-400 shrink-0" />
        <p className="text-xs font-semibold text-text-secondary">{QUOTES[quoteIndex]}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mt-2">
        <button onClick={toggleTimer}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm shadow-xl transition-all min-h-12 ${
            isRunning ? 'bg-red-600 hover:bg-red-700 text-text-primary'
              : hasPausedSession ? 'bg-green-600 hover:bg-green-500 shadow-sm text-white border border-transparent'
              : 'bg-cyan-600 hover:bg-cyan-500 shadow-sm text-white border border-transparent'
          }`}>
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
          {isRunning ? 'পজ (Pause)' : hasPausedSession ? 'চালু করুন (Resume)' : 'শুরু করুন (Start)'}
        </button>

        {/* ⭐ Fix F3 — infinity Stop is now ONE action; engine handles everything */}
        {mode === 'infinity' && (
          <button onClick={() => stopTimer()}
            disabled={!isRunning && secondsLeft <= 0}
            className="p-3 px-4 rounded-2xl bg-red-900/50 hover:bg-red-900/80 border border-red-500/50 text-red-400 font-bold text-sm min-h-12 flex items-center justify-center disabled:opacity-40">
            Stop
          </button>
        )}

        <button onClick={discardCurrentSession}
          title="রিসেট (১ মিনিট+ পড়লে সেভ হয়ে যাবে)"
          className="p-3 rounded-2xl bg-surface-muted hover:bg-cyan-900/50 border border-cyan-800/60 text-cyan-400 min-h-12 min-w-12 flex items-center justify-center">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <TopicPickerModal open={pickerOpen}
        onClose={() => { setPickerOpen(false); setPendingStart(null); }}
        onPick={handleTopicPicked} />
    </div>
  );
};