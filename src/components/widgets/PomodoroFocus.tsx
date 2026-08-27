import React, { useState, useEffect, useRef } from 'react';

// --- INLINE SVG COMPONENTS FOR THE CONTROLS ---
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-black">
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-black">
    <rect x="14" y="4" width="4" height="16" rx="1" />
    <rect x="6" y="4" width="4" height="16" rx="1" />
  </svg>
);

const RotateCcwIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#6366F1] animate-pulse">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

type TimerMode = 'focus' | 'shortBreak';

export const PomodoroFocus: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [focusLength, setFocusLength] = useState(25); // in minutes
  const [breakLength, setBreakLength] = useState(5);   // in minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set times based on chosen mode and lengths
  const getInitialTime = (targetMode: TimerMode, customFocus = focusLength, customBreak = breakLength) => {
    switch (targetMode) {
      case 'focus':
        return customFocus * 60;
      case 'shortBreak':
        return customBreak * 60;
    }
  };

  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getInitialTime(newMode));
  };

  const adjustFocusLength = (amount: number) => {
    const nextVal = Math.max(1, Math.min(180, focusLength + amount));
    setFocusLength(nextVal);
    if (!isRunning && mode === 'focus') {
      setTimeLeft(nextVal * 60);
    }
  };

  const adjustBreakLength = (amount: number) => {
    const nextVal = Math.max(1, Math.min(60, breakLength + amount));
    setBreakLength(nextVal);
    if (!isRunning && mode === 'shortBreak') {
      setTimeLeft(nextVal * 60);
    }
  };

  // Keep track of the countdown
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            // Completed notification sound feedback
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const oscillator = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              oscillator.type = 'sine';
              oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
              gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
              oscillator.start();
              oscillator.stop(audioCtx.currentTime + 0.3);
            } catch (e) {
              console.log('Audio feedback error', e);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getInitialTime(mode));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Progress percentage calculation
  const totalSeconds = getInitialTime(mode);
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  
  // Circumference of 34px radius circle (2 * PI * r) = ~213.6
  const radius = 34;
  const strokeDasharray = 2 * Math.PI * radius;
  const strokeDashoffset = strokeDasharray - (progressPercent / 100) * strokeDasharray;

  return (
    <div className="bg-surface rounded-xl border border-white/5 p-6 shadow-md transition-all duration-300 flex flex-col justify-between h-full">
      {/* Header bar */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-[#6366F1]/5 border border-[#6366F1]/10 text-[#6366F1]">
            <ZapIcon />
          </span>
          <div>
            <span className="text-[10px] font-bold text-text-primary/50 uppercase tracking-widest block font-sans">Focus arena</span>
            <span className="text-sm font-bold text-text-primary block">Pomodoro</span>
          </div>
        </div>

        {/* Short toggle indicators */}
        <div className="flex bg-surface p-1 rounded-lg border border-white/5">
          <button
            onClick={() => handleModeChange('focus')}
            className={`px-3 py-1 rounded-md text-[9px] font-bold transition duration-200 cursor-pointer ${
              mode === 'focus' ? 'bg-[#6366F1] text-text-primary' : 'text-text-primary/40 hover:text-text-primary/60'
            }`}
          >
            Focus
          </button>
          <button
            onClick={() => handleModeChange('shortBreak')}
            className={`px-3 py-1 rounded-md text-[9px] font-bold transition duration-200 cursor-pointer ${
              mode === 'shortBreak' ? 'bg-[#22C55E] text-text-primary' : 'text-text-primary/40 hover:text-text-primary/60'
            }`}
          >
            Break
          </button>
        </div>
      </div>

      {/* Main geometric minimal layout */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
        {/* Geometric Circular Progress Indicator */}
        <div className="relative flex items-center justify-center shrink-0 w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90">
            {/* Background track circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="stroke-white/[0.03]"
              strokeWidth="4"
              fill="transparent"
            />
            {/* Active loading circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className={`transition-all duration-300 ease-linear ${
                mode === 'focus' ? 'stroke-[#6366F1]' : 'stroke-[#22C55E]'
              }`}
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Inner details */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[8px] font-bold uppercase tracking-wider font-mono text-text-primary/40">
              {mode === 'focus' ? 'focus' : 'rest'}
            </span>
            <span className="text-[10px] font-black text-text-primary font-mono leading-none mt-0.5">
              {Math.round(progressPercent)}%
            </span>
          </div>
        </div>

        {/* Timer text & interactive controls */}
        <div className="flex-grow flex flex-col justify-center text-left w-full sm:w-auto">
          {/* Countdown Clock */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text-primary font-mono tracking-tight tabular-nums select-none">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[9px] font-bold text-text-primary/40 lowercase tracking-wide">
              {isRunning ? 'active' : 'paused'}
            </span>
          </div>

          {/* Micro Control Buttons */}
          <div className="flex items-center gap-1.5 mt-2">
            <button
              onClick={toggleTimer}
              className={`w-7 h-7 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center ${
                isRunning
                  ? 'bg-amber-400 hover:bg-amber-500 text-black'
                  : 'bg-slate-500 hover:bg-red-600 text-text-primary'
              }`}
              title={isRunning ? 'Pause' : 'Start session'}
            >
              {isRunning ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              onClick={resetTimer}
              className="w-7 h-7 rounded-lg bg-surface border border-white/5 hover:border-white/10 text-text-primary/50 hover:text-text-primary transition cursor-pointer flex items-center justify-center"
              title="Reset Timer"
            >
              <RotateCcwIcon />
            </button>

            {/* Micro preset break modifier */}
            <button
              onClick={() => handleModeChange(mode === 'focus' ? 'shortBreak' : 'focus')}
              className="text-[9px] font-bold text-text-primary/50 hover:text-gold tracking-wide transition pl-1 cursor-pointer"
            >
              {mode === 'focus' ? 'Break' : 'Focus'}
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Duration Adjusters Panel */}
      <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-3 text-left">
        {/* Adjust Focus length */}
        <div>
          <span className="text-[9px] font-bold text-text-primary/40 uppercase tracking-widest block font-mono">Focus Session</span>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => adjustFocusLength(-1)}
              className="w-5 h-5 rounded bg-surface border border-white/5 text-text-primary/60 hover:text-text-primary flex items-center justify-center text-xs font-bold cursor-pointer"
            >
              -
            </button>
            <span className="text-xs font-bold text-text-primary font-mono">{focusLength}m</span>
            <button
              onClick={() => adjustFocusLength(1)}
              className="w-5 h-5 rounded bg-surface border border-white/5 text-text-primary/60 hover:text-text-primary flex items-center justify-center text-xs font-bold cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Adjust Break length */}
        <div>
          <span className="text-[9px] font-bold text-text-primary/40 uppercase tracking-widest block font-mono">Rest Break</span>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => adjustBreakLength(-1)}
              className="w-5 h-5 rounded bg-surface border border-white/5 text-text-primary/60 hover:text-text-primary flex items-center justify-center text-xs font-bold cursor-pointer"
            >
              -
            </button>
            <span className="text-xs font-bold text-text-primary font-mono">{breakLength}m</span>
            <button
              onClick={() => adjustBreakLength(1)}
              className="w-5 h-5 rounded bg-surface border border-white/5 text-text-primary/60 hover:text-text-primary flex items-center justify-center text-xs font-bold cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
