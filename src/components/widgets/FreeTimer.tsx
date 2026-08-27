import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';

const FREE_TIMER_STORAGE_KEY = 'freeTimerState';

export const FreeTimer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // Refs to track state inside intervals without dependency issues
  const isActiveRef = useRef(false);
  const secondsRef = useRef(0);
  const restoredRef = useRef(false);

  // 🐛 FIX: Restore state from localStorage on mount
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    try {
      const saved = localStorage.getItem(FREE_TIMER_STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved);
      if (!parsed || typeof parsed !== 'object') return;

      const savedSeconds = typeof parsed.seconds === 'number' ? parsed.seconds : 0;
      const savedIsActive = Boolean(parsed.isActive);
      const savedAt = typeof parsed.savedAt === 'number' ? parsed.savedAt : Date.now();

      let restoredSeconds = savedSeconds;

      // If it was running when closed, add the time passed while away
      if (savedIsActive) {
        const elapsedAway = Math.max(0, Math.floor((Date.now() - savedAt) / 1000));
        restoredSeconds += elapsedAway;
      }

      secondsRef.current = restoredSeconds;
      setSeconds(restoredSeconds);

      if (savedIsActive) {
        isActiveRef.current = true;
        setIsActive(true);
      }
    } catch (error) {
      console.warn('[FreeTimer] Restore failed:', error);
    }
  }, []);

  // 🐛 FIX: Save state to localStorage whenever it changes
  const saveState = (active: boolean, secs: number) => {
    try {
      localStorage.setItem(FREE_TIMER_STORAGE_KEY, JSON.stringify({
        isActive: active,
        seconds: secs,
        savedAt: Date.now(),
      }));
    } catch (error) {
      console.warn('[FreeTimer] Save failed:', error);
    }
  };

  // 🐛 FIX: Save perfectly right before page unload/refresh
  useEffect(() => {
    const handlePageHide = () => {
      saveState(isActiveRef.current, secondsRef.current);
    };
    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => {
          const next = s + 1;
          secondsRef.current = next;
          // Save every tick so refresh never loses more than 1 second
          saveState(true, next); 
          return next;
        });
      }, 1000);
    } else if (!isActive && seconds !== 0 && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const toggleTimer = () => {
    const nextState = !isActive;
    isActiveRef.current = nextState;
    setIsActive(nextState);
    saveState(nextState, secondsRef.current);
  };

  const resetTimer = () => {
    isActiveRef.current = false;
    secondsRef.current = 0;
    setIsActive(false);
    setSeconds(0);
    localStorage.removeItem(FREE_TIMER_STORAGE_KEY);
  };

  const formatTime = (totalSeconds: number) => {
    const getSeconds = `0${(totalSeconds % 60)}`.slice(-2);
    const minutes = Math.floor(totalSeconds / 60);
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(totalSeconds / 3600)}`.slice(-2);
    return `${getHours}:${getMinutes}:${getSeconds}`;
  };

  return (
    <div className="bg-surface rounded-xl border border-white/5 p-6 shadow-md flex flex-col justify-between hover:bg-[#151728] transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] font-bold text-text-primary/50 uppercase tracking-widest block">Free Session</span>
          <span className="text-sm font-bold text-text-primary tracking-tight block mt-1">Stopwatch</span>
        </div>
        <span className="text-[#38BDF8] p-1.5 rounded-lg bg-[#38BDF8]/5 border border-[#38BDF8]/10">
          <Clock className="w-4 h-4" />
        </span>
      </div>

      <div className="flex justify-center my-6">
        <span className="text-4xl font-black text-text-primary font-mono tabular-nums tracking-tight">
          {formatTime(seconds)}
        </span>
      </div>

      <div className="flex justify-center gap-4 mt-2">
        <button
          onClick={toggleTimer}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
            isActive
              ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
              : "bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20"
          }`}
        >
          {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
        </button>
        <button
          onClick={resetTimer}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>
      </div>
    </div>
  );
};