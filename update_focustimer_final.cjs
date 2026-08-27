const fs = require('fs');
const content = `import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Bell, CheckCircle2, Sparkles, Clock, Infinity } from 'lucide-react';
import { TimerSession, SubjectCategory } from '../types';
import { useGlobalTimer } from '../contexts/TimerContext';
import { usePresence } from '../contexts/PresenceContext';

interface FocusTimerProps {
  onSessionComplete?: (session: TimerSession) => void;
  initialTopic?: string;
  initialSubject?: SubjectCategory;
}

const QUOTES = [
  "শুধু ২ মিনিট শুরু করো।",
  "Small start, big progress.",
  "আর ৫ মিনিট — তুমি পারবে।",
  "একগ্রতা ও মনোযোগই চান্স পাওয়ার চাবিকাঠি।",
  "Focus today, celebrate tomorrow."
];

export const FocusTimer: React.FC<FocusTimerProps> = ({
  onSessionComplete,
  initialTopic = 'সাধারণ পড়া',
  initialSubject = 'Physics'
}) => {
  const { isRunning, secondsLeft, mode, topicName, setTopicName: setGlobalTopic, setMode: setGlobalMode, startTimer, pauseTimer, stopTimer } = useGlobalTimer();
  const { stopFocus } = usePresence();

  const [minutes, setMinutes] = useState<number>(25);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [customMins, setCustomMins] = useState<number>(30);

  const handleModeChange = (newMode: '2min' | '25min' | '5min' | '50min' | '15min' | 'custom' | 'infinity') => {
    stopFocus();
    if (newMode === 'infinity') {
      setMinutes(0);
      setGlobalMode(newMode, 0);
    } else {
      let duration = 25;
      if (newMode === '2min') duration = 2;
      if (newMode === '5min') duration = 5;
      if (newMode === '50min') duration = 50;
      if (newMode === '15min') duration = 15;
      if (newMode === 'custom') duration = customMins;
      setMinutes(duration);
      setGlobalMode(newMode, duration * 60);
    }
  };

  const handleFinishSession = () => {
    if (soundEnabled && typeof window !== 'undefined') {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      } catch (e) {
        console.log('Audio notification fallback');
      }
    }
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Campus 6.0 Focus Session Done!', {
        body: \`চমৎকার! ফোকাস সেশন সফলভাবে সম্পন্ন হয়েছে।\`,
        icon: '/favicon.ico'
      });
    }

    if (onSessionComplete) {
      const finalMins = mode === 'infinity' ? Math.floor(secondsLeft / 60) : minutes;
      onSessionComplete({
        id: \`timer_\${Date.now()}\`,
        dateKey: new Date().toISOString().split('T')[0],
        topicName,
        subject: initialSubject,
        durationMinutes: finalMins,
        mode,
        completedAt: new Date().toISOString()
      });
    }
  };

  const toggleTimer = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      let duration = 25;
      if (mode === '2min') duration = 2;
      if (mode === '5min') duration = 5;
      if (mode === '50min') duration = 50;
      if (mode === '15min') duration = 15;
      if (mode === 'custom') duration = customMins;
      startTimer(mode, topicName || 'সাধারণ পড়া', mode === 'infinity' ? secondsLeft : secondsLeft > 0 ? secondsLeft : duration * 60);
    }
  };

  const resetTimer = () => {
    stopTimer();
    if (mode === 'infinity') {
      setGlobalMode(mode, 0);
    } else {
      setGlobalMode(mode, minutes * 60);
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          alert('নোটিফিকেশন পারমিশন চালু করা হয়েছে!');
        }
      });
    }
  };

  const formatTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    if (hours > 0) {
      return \`\${hours < 10 ? '0' : ''}\${hours}:\${mins < 10 ? '0' : ''}\${mins}:\${secs < 10 ? '0' : ''}\${secs}\`;
    }
    return \`\${mins < 10 ? '0' : ''}\${mins}:\${secs < 10 ? '0' : ''}\${secs}\`;
  };

  return (
    <div className="p-6 rounded-2xl bg-surface border border-cyan-500/20 shadow-lg text-text-primary flex flex-col items-center text-center">
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-cyan-900/50">
        <div className="flex items-center gap-2 text-cyan-400">
          <Clock className="w-5 h-5" />
          <h3 className="text-xs font-bold  ">ফোকাস টাইমার (Focus Engine)</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-surface-muted hover:bg-cyan-900/50 border border-cyan-800/40 text-cyan-400 min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="শব্দ অন/অফ"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={requestNotificationPermission}
            className="p-2 rounded-xl bg-surface-muted hover:bg-cyan-900/50 border border-cyan-800/40 text-cyan-400 min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="নোটিফিকেশন পারমিশন"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {[
          { id: '2min', label: '২ মিনিট Start Mode' },
          { id: '25min', label: '২৫ মিনিট Focus' },
          { id: '5min', label: '৫ মিনিট Break' },
          { id: '50min', label: '৫০ মিনিট Deep Work' },
          { id: '15min', label: '১৫ মিনিট Break' },
          { id: 'infinity', label: '∞ Infinity Mode', icon: <Infinity className="w-4 h-4 inline mr-1" /> }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => handleModeChange(m.id as any)}
            className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] \${
              mode === m.id
                ? 'bg-cyan-500 text-text-primary shadow-md shadow-cyan-500/20'
                : 'bg-surface-muted text-cyan-400 border border-cyan-800/40 hover:bg-cyan-900/50'
            }\`}
          >
            {m.icon}{m.label}
          </button>
        ))}
      </div>

      <div className="w-full max-w-sm mb-6">
        <label className="text-[11px] font-semibold text-cyan-400/80 block mb-1 text-left">
          বর্তমান পড়ার টপিক/বিষয়:
        </label>
        <input
          type="text"
          value={topicName}
          onChange={(e) => {
            setGlobalTopic(e.target.value);
          }}
          placeholder="যেমন: ভেক্টর-১ রিভিশন"
          className="w-full px-3.5 py-2 rounded-xl bg-surface-muted border border-cyan-800/60 text-text-primary text-xs focus:outline-none focus:border-cyan-400"
        />
      </div>

      <div className="my-2 p-8 rounded-full border-4 border-cyan-400/80 bg-surface-muted shadow-[0_0_40px_rgba(34,211,238,0.15)] min-w-[220px] min-h-[220px] flex flex-col items-center justify-center">
        <span className={\`font-black font-mono tracking-tight text-text-primary drop-shadow-md \${mode === 'infinity' && secondsLeft >= 3600 ? 'text-4xl' : 'text-5xl'}\`}>
          {formatTime(secondsLeft)}
        </span>
        <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-widest mt-2">
          {mode === 'infinity' ? (isRunning ? 'Counting Up' : 'Infinity Mode') : (mode === '2min' ? 'Start Mode' : isRunning ? 'In Session' : 'Paused')}
        </span>
      </div>

      <div className="my-4 px-4 py-2 rounded-xl bg-surface-muted border border-cyan-800/40 flex items-center gap-2 max-w-md">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
        <p className="text-xs font-semibold text-text-secondary">{QUOTES[quoteIndex]}</p>
      </div>

      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={toggleTimer}
          className={\`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm shadow-xl transition-all min-h-[48px] \${
            isRunning
              ? 'bg-red-600 hover:bg-red-700 text-text-primary'
              : 'bg-cyan-600 hover:bg-cyan-500 shadow-sm text-white border border-transparent'
          }\`}
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
          {isRunning ? 'পজ (Pause)' : 'শুরু করুন (Start)'}
        </button>

        {mode === 'infinity' && isRunning && (
          <button
            onClick={() => {
              stopTimer();
              handleFinishSession();
              setGlobalMode(mode, 0);
            }}
            className="p-3 px-4 rounded-2xl bg-red-900/50 hover:bg-red-900/80 border border-red-500/50 text-red-400 font-bold text-sm min-h-[48px] flex items-center justify-center"
          >
            Stop
          </button>
        )}

        <button
          onClick={resetTimer}
          className="p-3 rounded-2xl bg-surface-muted hover:bg-cyan-900/50 border border-cyan-800/60 text-cyan-400 min-h-[48px] min-w-[48px] flex items-center justify-center"
          title="রিসেট"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
`;
fs.writeFileSync('src/components/FocusTimer.tsx', content);
