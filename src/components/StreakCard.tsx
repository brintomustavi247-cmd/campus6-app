import React from 'react';
import { Flame } from 'lucide-react';

const PANEL: React.CSSProperties = {
  background: 'rgba(13,16,22,0.7)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
  borderRadius: 16,
};

const MICRO: React.CSSProperties = {
  fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
  color: '#475569', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
};

export const StreakCard: React.FC<{ streak: any }> = ({ streak }) => {
  const s: any = streak || {};
  const current = s.count ?? s.current ?? s.days ?? s.streak ?? 0;
  const best = s.best ?? s.longest ?? s.max ?? current;
  const success = s.successDays ?? s.seventyPlus ?? s.goodDays ?? s.totalSuccess ?? 0;

  const cells = [
    { label: 'চলমান', value: current, color: '#F97316' },
    { label: 'সেরা', value: best, color: '#FBBF24' },
    { label: '৭০%+ দিন', value: success, color: '#34D399' },
  ];

  return (
    <div className="p-5" style={PANEL}>
      <div className="flex items-center justify-between mb-4">
        <p style={MICRO}>Streak Tracker</p>
        <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)' }}>
          <Flame className="w-3.5 h-3.5" style={{ color: '#F97316' }} />
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {cells.map((c, i) => (
          <div key={c.label} className="text-center py-2" style={i > 0 ? { borderLeft: '1px solid rgba(255,255,255,0.06)' } : undefined}>
            <p className="text-xl font-black font-mono tabular-nums leading-none" style={{ color: c.color }}>{c.value}</p>
            <p className="text-[9px] bn mt-1.5" style={{ color: '#475569' }}>{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};