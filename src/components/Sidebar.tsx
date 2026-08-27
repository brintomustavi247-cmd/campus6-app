import React from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  BarChart3, 
  BookOpenCheck, 
  Clock, 
  Users, 
  Settings, 
  Code,
  Flame,
  LogIn
} from 'lucide-react';

export type PageId = 
  | 'login'
  | 'red_gold'
  | 'dashboard' 
  | 'daily_plan' 
  | 'weekly_progress' 
  | 'subjects' 
  | 'focus_timer' 
  | 'friends' 
  | 'settings' 
  | 'dev_panel'
  | 'profile_premium'
  | 'rank_guide';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

export const NAV_ITEMS: { id: PageId; labelBn: string; labelEn: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', labelBn: 'ড্যাশবোর্ড', labelEn: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'red_gold', labelBn: 'রেড গোল্ড জেনো লিগ', labelEn: 'Red Gold League', icon: <Flame className="w-5 h-5 text-gold" /> },
  { id: 'daily_plan', labelBn: 'ডেইলি প্ল্যান', labelEn: 'Daily Plan', icon: <CalendarCheck className="w-5 h-5" /> },
  { id: 'weekly_progress', labelBn: 'সাপ্তাহিক গ্রাফ', labelEn: 'Weekly Progress', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'subjects', labelBn: 'বিষয়ভিত্তিক প্রোগ্রেস', labelEn: 'Subjects', icon: <BookOpenCheck className="w-5 h-5" /> },
  { id: 'focus_timer', labelBn: 'ফোকাস টাইমার', labelEn: 'Focus Timer', icon: <Clock className="w-5 h-5 text-cyan-400" /> },
  { id: 'friends', labelBn: 'লিডারবোর্ড ও বন্ধু', labelEn: 'Friends', icon: <Users className="w-5 h-5" /> },
  { id: 'settings', labelBn: 'সেটিংস', labelEn: 'Settings', icon: <Settings className="w-5 h-5" /> },
  { id: 'login', labelBn: 'সিস্টেম লগইন', labelEn: 'System Login', icon: <LogIn className="w-5 h-5 text-gold" /> },
  { id: 'dev_panel', labelBn: 'ডেভেলপার টেস্ট প্যানেল', labelEn: 'Dev Test Panel', icon: <Code className="w-5 h-5 text-gold-bright" /> },
  { id: 'profile_premium', labelBn: 'প্রিমিয়াম প্রোফাইল', labelEn: 'Profile Premium', icon: <Flame className="w-5 h-5 text-primary" /> },
  { id: 'rank_guide', labelBn: 'র‌্যাঙ্ক গাইড', labelEn: 'Rank Guide', icon: <Flame className="w-5 h-5 text-cyan-400" /> }
];

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border p-4 text-text-primary min-h-[calc(100vh-61px)] shrink-0">
      <div className="space-y-1.5 flex-1">
        {NAV_ITEMS.map(item => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                isActive
                  ? 'bg-primary hover:bg-primary-hover text-white shadow-sm border border-transparent text-text-primary shadow-lg shadow-red-600/20 border border-gold'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }`}
            >
              <span className={isActive ? 'text-gold' : 'text-text-muted'}>
                {item.icon}
              </span>
              <div className="flex flex-col text-left">
                <span className="leading-none">{item.labelBn}</span>
                <span className="text-[10px] text-text-muted font-mono mt-0.5">
                  {item.labelEn}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-border mt-auto text-center">
        <p className="text-[10px] text-text-muted font-mono">
          HSC Admission Study Engine v6.0
        </p>
      </div>
    </aside>
  );
};
