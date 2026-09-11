import React from 'react';
import { PageId } from './Sidebar';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Clock, 
  Trophy,
  Settings
} from 'lucide-react';

interface MobileBottomNavProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

export const MobileBottomNavigation: React.FC<MobileBottomNavProps> = ({
  activePage,
  onNavigate
}) => {
  const tabs: { id: PageId; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'daily_plan', label: 'Plan', icon: <CalendarCheck className="w-5 h-5" /> },
    { id: 'focus_timer', label: 'Focus', icon: <Clock className="w-5 h-5" /> },
    { id: 'friends', label: 'Rank', icon: <Trophy className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border px-2 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        {tabs.map(tab => {
          const isActive = activePage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all ${
                isActive 
                  ? 'text-primary' 
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <div className={isActive ? 'scale-110 transition-transform' : ''}>
                {tab.icon}
              </div>
              <span className="text-[10px] mt-1 font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};