import React, { useState } from 'react';
import { PageId } from './Sidebar';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Clock, 
  BarChart3, 
  MoreHorizontal, 
  BookOpenCheck, 
  Users, 
  Settings, 
  Code,
  Flame,
  X,
  Trophy
} from 'lucide-react';

interface MobileBottomNavProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

export const MobileBottomNavigation: React.FC<MobileBottomNavProps> = ({
  activePage,
  onNavigate
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const primaryTabs: { id: PageId; labelBn: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', labelBn: 'ড্যাশবোর্ড', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'daily_plan', labelBn: 'ডেইলি প্ল্যান', icon: <CalendarCheck className="w-5 h-5" /> },
    { id: 'focus_timer', labelBn: 'ফোকাস', icon: <Clock className="w-5 h-5 text-cyan-400" /> },
    { id: 'friends', labelBn: 'লিডারবোর্ড', icon: <Trophy className="w-5 h-5" /> }
  ];

  const secondaryTabs: { id: PageId; labelBn: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'weekly_progress', labelBn: 'সাপ্তাহিক গ্রাফ', labelEn: 'Weekly Progress', icon: <BarChart3 className="w-5 h-5 text-gold" /> },
    { id: 'red_gold', labelBn: 'রেড গোল্ড জেনো লিগ', labelEn: 'Red Gold Premium Theme', icon: <Flame className="w-5 h-5 text-gold" /> },
    { id: 'subjects', labelBn: 'বিষয়ভিত্তিক প্রোগ্রেস', labelEn: 'Subjects Breakdown', icon: <BookOpenCheck className="w-5 h-5 text-gold" /> },
    { id: 'profile_premium', labelBn: 'প্রিমিয়াম প্রোফাইল', labelEn: 'Profile Premium', icon: <Flame className="w-5 h-5 text-primary" /> },
    { id: 'rank_guide', labelBn: 'র‌্যাঙ্ক গাইড', labelEn: 'Rank Guide', icon: <Flame className="w-5 h-5 text-cyan-400" /> },
    { id: 'settings', labelBn: 'সেটিংস', labelEn: 'Preferences & Storage', icon: <Settings className="w-5 h-5 text-text-muted" /> },
    { id: 'login', labelBn: 'সিস্টেম লগইন', labelEn: 'Solo Leveling Login', icon: <Code className="w-5 h-5 text-gold" /> },
    { id: 'dev_panel', labelBn: 'ডেভেলপার টেস্ট প্যানেল', labelEn: 'Dev Tools & Seeder', icon: <Code className="w-5 h-5 text-gold" /> }
  ];

  const handleSelect = (page: PageId) => {
    onNavigate(page);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* Bottom Sheet Modal for 'More' Menu */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-bg border-t sm:border border-border rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl text-text-primary">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <span>আরও অপশন (More Options)</span>
              </h3>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-2 rounded-xl text-gold hover:text-text-primary hover:from-red-500 hover:to-yellow-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {secondaryTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleSelect(tab.id)}
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-all text-left min-h-[48px] ${
                    activePage === tab.id
                      ? 'bg-primary hover:bg-primary-hover text-white shadow-sm border border-transparent-500/40 text-text-primary shadow-md'
                      : 'bg-surface-muted border-border text-text-secondary hover:from-red-500 hover:to-yellow-500'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-surface-muted shrink-0">
                    {tab.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary">{tab.labelBn}</p>
                    <p className="text-[10px] text-text-muted font-mono">{tab.labelEn}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Mobile Bottom Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface backdrop-blur-md border-t border-border text-text-primary px-2 py-1.5 shadow-2xl">
        <div className="flex items-center justify-around">
          {primaryTabs.map(tab => {
            const isActive = activePage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelect(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[48px] min-w-[56px] ${
                  isActive ? 'text-gold font-bold' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <div className={isActive ? 'scale-110 transition-transform' : ''}>
                  {tab.icon}
                </div>
                <span className="text-[10px] mt-0.5  truncate max-w-[64px]">
                  {tab.labelBn}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[48px] min-w-[56px] ${
              isMoreOpen ? 'text-gold font-bold' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 ">আরও</span>
          </button>
        </div>
      </nav>
    </>
  );
};
