import React, { useState, useEffect } from 'react';

export const LiveClock: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!mounted) return null;

  return (
    <div className="hidden lg:flex flex-col items-end justify-center px-4 border-r border-border mr-1 h-full min-h-[40px]">
      <div 
        className="text-white text-[13px] font-black tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)] tabular-nums"
        style={{ fontFamily: "'Orbitron', 'JetBrains Mono', monospace" }}
      >
        {formatTime(time)}
      </div>
      <div 
        className="text-red-500 text-[9px] font-bold tracking-[0.15em] uppercase tabular-nums drop-shadow-[0_0_5px_rgba(220,38,38,0.4)]"
        style={{ fontFamily: "'Orbitron', 'JetBrains Mono', monospace" }}
      >
        {formatDate(time)}
      </div>
    </div>
  );
};
