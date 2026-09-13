import React from 'react';
import { PageId } from './Sidebar';
import { LayoutDashboard, CalendarCheck, Clock, Trophy, Settings } from 'lucide-react';

interface MobileBottomNavProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

export const MobileBottomNavigation: React.FC<MobileBottomNavProps> = ({ activePage, onNavigate }) => {
  const tabs: { id: PageId; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'daily_plan', label: 'Plan', icon: <CalendarCheck className="w-5 h-5" /> },
    { id: 'focus_timer', label: 'Focus', icon: <Clock className="w-5 h-5" /> },
    { id: 'friends', label: 'Rank', icon: <Trophy className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)' }}
    >
      <div
        className="mx-auto max-w-md rounded-2xl overflow-hidden backdrop-blur-xl"
        style={{
          background: 'rgba(12,14,20,0.92)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        <div className="grid grid-cols-5">
          {tabs.map((tab) => {
            const isActive = activePage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className="relative flex flex-col items-center justify-center gap-1 py-2.5 transition-all active:scale-95"
              >
                {/* active top indicator */}
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300"
                  style={{ width: isActive ? 20 : 0, background: '#FBBF24', boxShadow: isActive ? '0 0 8px #FBBF24' : 'none' }}
                />
                <span className="transition-transform duration-200" style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)', color: isActive ? '#FBBF24' : '#475569' }}>
                  {tab.icon}
                </span>
                <span className="text-[8px] font-bold tracking-wide" style={{ color: isActive ? '#FBBF24' : '#475569' }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};