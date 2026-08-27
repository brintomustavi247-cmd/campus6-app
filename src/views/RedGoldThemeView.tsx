import React, { useState } from 'react';
import { UserProfile } from '../types';
import { PageId } from '../components/Sidebar';
import { RankBadge } from '../components/RankBadge';
import { 
  Trophy, 
  Zap, 
  Flame, 
  ShieldCheck, 
  Crown, 
  Swords, 
  CheckCircle2, 
  Award, 
  Target, 
  ArrowRight,
  Share2,
  Calendar
} from 'lucide-react';

interface RedGoldThemeViewProps {
  profile: UserProfile;
  todayKey: string;
  onNavigate: (page: PageId) => void;
  onOpenShareModal?: () => void;
  onAddToast?: (type: 'success' | 'info' | 'warning' | 'error', message: string, title?: string) => void;
}

export const RedGoldThemeView: React.FC<RedGoldThemeViewProps> = ({
  profile,
  todayKey,
  onNavigate,
  onOpenShareModal,
  onAddToast
}) => {
  const [activeTab, setActiveTab] = useState<'quests' | 'league' | 'stats' | 'perks'>('quests');
  const [completedQuests, setCompletedQuests] = useState<number[]>([1]);

  const toggleQuest = (id: number) => {
    if (completedQuests.includes(id)) {
      setCompletedQuests(completedQuests.filter(q => q !== id));
    } else {
      setCompletedQuests([...completedQuests, id]);
      if (onAddToast) {
        onAddToast('success', '+150 EXP EARNED // ZENO LEAGUE PROGRESS INCREASED', 'QUEST COMPLETED');
      }
    }
  };

  const quests = [
    { id: 1, title: 'Physics Vector Problem Set (10 Problems)', xp: 150, category: 'Main Routine' },
    { id: 2, title: 'Chemistry Organic Reactions Flashcard Drill', xp: 200, category: 'Daily Quest' },
    { id: 3, title: 'Math Calculus Integration Practice (30 Mins)', xp: 180, category: 'Deep Work' },
    { id: 4, title: 'English Synonyms & Antonyms Memorization', xp: 100, category: 'Side Quest' }
  ];

  const leaderboard = [
    { rank: 1, name: 'Tanvir Hossain', target: 'BUET CSE', level: 'S-Rank', exp: '14,850 XP', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
    { rank: 2, name: profile.displayName || 'You (Hunter)', target: profile.targetUniversity || 'DU A-Unit', level: 'A-Rank', exp: '12,400 XP', isUser: true, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' },
    { rank: 3, name: 'Farhan Kabir', target: 'DMC Medical', level: 'A-Rank', exp: '11,920 XP', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80' },
    { rank: 4, name: 'Ayesha Siddiqua', target: 'CKRUET Eng', level: 'B-Rank', exp: '10,150 XP', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' }
  ];

  return (
    <div className="campus-premium">
      
      {/* Red-Gold Sticky Header */}
      <header className="c-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1A1010] border border-[#C41E3A]/40 flex items-center justify-center text-[#F5C518] shadow-[0_0_12px_rgba(196,30,58,0.3)]">
            <Crown className="w-5 h-5 text-[#F5C518]" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-wider text-text-primary">CAMPUS 6.0</h2>
            <p className="text-[10px] font-mono text-[#F5C518]">RED GOLD // ZENO LEAGUE</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenShareModal && (
            <button onClick={onOpenShareModal} className="c-header-btn" title="Share Status">
              <Share2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => onNavigate('dashboard')} className="c-header-btn" title="Exit to Standard View">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Avatar Profile Section */}
      <section className="c-hero">
        <div className="c-avatar-wrap mb-4">
          <div className="c-avatar-ring" />
          <div className="c-avatar-inner flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80" 
              alt="Hunter Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 p-1 bg-[#0F0A0A] rounded-full">
            <div className="c-online-dot" />
          </div>
        </div>

        <div className="c-name text-center">
          <h1>{profile.displayName || 'CAMPUS HUNTER'}</h1>
          <p className="c-handle">@{profile.targetUniversity || 'DU A-UNIT CANDIDATE'}</p>
        </div>
      </section>

      {/* Rank & XP Progress Card */}
      <section className="c-rank">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] font-mono text-[#A89A92] uppercase tracking-widest">CURRENT RANK</p>
            <h3 className="c-rank-title">ZENO LEAGUE // A-RANK</h3>
          </div>
          <div className="shrink-0">
            <RankBadge rank="MINDFORGE II" size={48} animated />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-[#A89A92]">LEVEL 42 EXP</span>
            <span className="text-[#F5C518] font-bold">12,400 / 15,000 XP</span>
          </div>
          <div className="c-rank-track">
            <div className="c-rank-fill" style={{ width: '82%' }} />
          </div>
        </div>

        {/* Quick Stats Metrics */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#C41E3A]/20 text-center">
          <div className="bg-[#140C0C] p-2.5 rounded-xl border border-[#C41E3A]/20">
            <p className="text-[10px] text-[#A89A92] font-mono">DAILY STREAK</p>
            <p className="text-lg font-bold text-[#F5C518] flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-[#C41E3A] animate-bounce" />
              <span>18 DAYS</span>
            </p>
          </div>
          <div className="bg-[#140C0C] p-2.5 rounded-xl border border-[#C41E3A]/20">
            <p className="text-[10px] text-[#A89A92] font-mono">SYLLABUS</p>
            <p className="text-lg font-bold text-text-primary">74.2%</p>
          </div>
          <div className="bg-[#140C0C] p-2.5 rounded-xl border border-[#C41E3A]/20">
            <p className="text-[10px] text-[#A89A92] font-mono">GLOBAL RANK</p>
            <p className="text-lg font-bold text-[#F5C518]">#02</p>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button 
            onClick={() => setActiveTab('quests')}
            className={`c-tab ${activeTab === 'quests' ? 'active' : ''}`}
          >
            DAILY QUESTS
          </button>
          <button 
            onClick={() => setActiveTab('league')}
            className={`c-tab ${activeTab === 'league' ? 'active' : ''}`}
          >
            LEAGUE RANKINGS
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`c-tab ${activeTab === 'stats' ? 'active' : ''}`}
          >
            HUNTER STATS
          </button>
        </div>
      </section>

      {/* TAB CONTENT 1: DAILY QUESTS */}
      {activeTab === 'quests' && (
        <section className="px-6 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-extrabold text-sm text-text-primary tracking-wider flex items-center gap-2">
              <Swords className="w-4 h-4 text-[#C41E3A]" />
              ACTIVE DAILY QUESTS ({completedQuests.length}/{quests.length})
            </h4>
            <span className="text-[10px] font-mono text-[#F5C518]">DATE: {todayKey}</span>
          </div>

          {quests.map((q) => {
            const isDone = completedQuests.includes(q.id);
            return (
              <div 
                key={q.id}
                onClick={() => toggleQuest(q.id)}
                className={`c-card cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isDone ? 'opacity-60 border-slate-500/30' : 'hover:border-[#F5C518]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    isDone ? 'bg-slate-500/20 text-gold border border-slate-500/40' : 'bg-[#140C0C] text-[#F5C518] border border-[#C41E3A]/30'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#A89A92]">{q.category}</span>
                    <h5 className={`text-xs sm:text-sm font-semibold ${isDone ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                      {q.title}
                    </h5>
                  </div>
                </div>

                <span className="text-xs font-mono font-extrabold text-[#F5C518] bg-[#140C0C] px-2.5 py-1 rounded-full border border-[#F5C518]/20 whitespace-nowrap">
                  +{q.xp} XP
                </span>
              </div>
            );
          })}

          <button 
            onClick={() => onNavigate('daily_plan')}
            className="w-full py-3.5 rounded-xl c-btn-primary font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 mt-4"
          >
            <span>OPEN FULL DAILY ROUTINE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* TAB CONTENT 2: LEAGUE RANKINGS */}
      {activeTab === 'league' && (
        <section className="px-6 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-extrabold text-sm text-text-primary tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#F5C518]" />
              ZENO LEAGUE TOP HUNTERS
            </h4>
            <span className="text-[10px] font-mono text-[#C41E3A] font-bold">SEASON 1 // ACTIVE</span>
          </div>

          <div className="space-y-2.5">
            {leaderboard.map((item) => (
              <div 
                key={item.rank}
                className={`c-card flex items-center justify-between gap-3 p-3.5 mb-0 ${
                  item.isUser ? 'border-[#F5C518]/60 bg-[#1A1010] shadow-[0_0_20px_rgba(245,197,24,0.15)]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-extrabold ${
                    item.rank === 1 ? 'bg-[#F5C518] text-[#0F0A0A]' : 
                    item.rank === 2 ? 'bg-[#C41E3A] text-text-primary' : 'bg-[#140C0C] text-[#A89A92]'
                  }`}>
                    #{item.rank}
                  </span>
                  <img src={item.avatar} alt={item.name} className="w-9 h-9 rounded-xl object-cover border border-[#C41E3A]/30" />
                  <div>
                    <h5 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                      {item.name}
                      {item.isUser && <span className="text-[9px] font-mono bg-[#C41E3A] text-text-primary px-1.5 py-0.2 rounded">YOU</span>}
                    </h5>
                    <p className="text-[10px] text-[#A89A92]">{item.target}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-extrabold text-[#F5C518] block">{item.exp}</span>
                  <span className="text-[9px] font-mono text-[#C41E3A] font-bold uppercase">{item.level}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB CONTENT 3: HUNTER STATS */}
      {activeTab === 'stats' && (
        <section className="px-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="c-card text-center p-4">
              <Zap className="w-6 h-6 text-[#F5C518] mx-auto mb-1 animate-pulse" />
              <p className="text-[10px] font-mono text-[#A89A92]">TOTAL STUDY HOURS</p>
              <p className="text-xl font-extrabold text-text-primary mt-1">142.5 HRS</p>
            </div>
            <div className="c-card text-center p-4">
              <Award className="w-6 h-6 text-[#C41E3A] mx-auto mb-1" />
              <p className="text-[10px] font-mono text-[#A89A92]">PERFECT DAYS</p>
              <p className="text-xl font-extrabold text-[#F5C518] mt-1">14 DAYS</p>
            </div>
          </div>

          <div className="c-card">
            <h5 className="text-xs font-bold text-text-primary mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#F5C518]" />
              DESIRED ADMISSION TARGET
            </h5>
            <div className="bg-[#140C0C] p-3 rounded-xl border border-[#C41E3A]/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-text-primary">{profile.targetUniversity || 'Dhaka University (A Unit)'}</p>
                <p className="text-[10px] text-[#A89A92]">Target Seat: Top 500 Merit</p>
              </div>
              <button 
                onClick={() => onNavigate('settings')}
                className="c-btn-secondary px-3 py-1.5 rounded-lg text-[10px] font-mono"
              >
                EDIT TARGET
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer System Signature */}
      <footer className="text-center pt-8 pb-4 text-[10px] font-mono text-[#A89A92] tracking-widest uppercase">
        CAMPUS 6.0 // RED GOLD ZENO LEAGUE ENGINE
      </footer>

    </div>
  );
};

export default RedGoldThemeView;
