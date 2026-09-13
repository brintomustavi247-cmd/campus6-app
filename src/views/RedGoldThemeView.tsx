import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile } from '../types';
import { PageId } from '../components/Sidebar';
import { RankBadge } from '../components/RankBadge';
import { useLeaderboardPlayers } from '../hooks/useLeaderboardPlayers';
import { calculateStreak } from '../utils/storageEngine';
import { getUserRankPosition } from '../services/leaderboardSync';
import {
  Trophy, Zap, Flame, Crown, Swords, CheckCircle2, Award, Target,
  ArrowRight, Share2, TrendingUp,
} from 'lucide-react';

interface RedGoldThemeViewProps {
  profile: UserProfile;
  todayKey: string;
  onNavigate: (page: PageId) => void;
  onOpenShareModal?: () => void;
  onAddToast?: (type: 'success' | 'info' | 'warning' | 'error', message: string, title?: string) => void;
}

export const RedGoldThemeView: React.FC<RedGoldThemeViewProps> = ({
  profile, todayKey, onNavigate, onOpenShareModal, onAddToast,
}) => {
  const [activeTab, setActiveTab] = useState<'quests' | 'league' | 'stats' | 'perks'>('quests');
  const [completedQuests, setCompletedQuests] = useState<number[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);

  // ⭐ REAL DATA — একই pipeline যা সব leaderboard ব্যবহার করে
  // (Supabase users.total_study_time + live self-overlay)।
  // কোনো hardcoded/demo নাম বা XP নেই → সব device-এ একই rank।
  const { players } = useLeaderboardPlayers({ currentUserId: profile.uid, limit: 20 });
  const streak = calculateStreak(todayKey);
  const streakCount =
    (streak as any)?.currentStreak ??
    (streak as any)?.count ??
    (streak as any)?.current ??
    (streak as any)?.days ??
    0;

  useEffect(() => {
    if (profile.uid) {
      getUserRankPosition(profile.uid).then((r) => setMyRank(r));
    }
  }, [profile.uid, players]);

  const me = useMemo(() => players.find((p) => p._isCurrentUser) || null, [players]);
  const myStudyTime = me?.studyTime || 0;
  const myXp = me?.xp || 0;
  const myLevel = me?.level || 1;
  const nextLevelXp = me?.nextLevelXp || (myLevel + 1) * 1000;
  const currentLevelBase = (myLevel - 1) * 1000;
  const levelProgress = nextLevelXp > currentLevelBase
    ? Math.min(100, Math.round(((myXp - currentLevelBase) / (nextLevelXp - currentLevelBase)) * 100))
    : 0;

  // top 10 real players (DB snapshot — কোনো demo user নেই)
  const topPlayers = players.slice(0, 10);

  const toggleQuest = (id: number) => {
    if (completedQuests.includes(id)) {
      setCompletedQuests(completedQuests.filter((q) => q !== id));
    } else {
      setCompletedQuests([...completedQuests, id]);
      if (onAddToast) onAddToast('success', '+150 EXP EARNED // ZENO LEAGUE PROGRESS', 'QUEST COMPLETED');
    }
  };

  const quests = [
    { id: 1, title: 'Physics Vector Problem Set (10 Problems)', xp: 150, category: 'Main Routine' },
    { id: 2, title: 'Chemistry Organic Reactions Drill', xp: 200, category: 'Daily Quest' },
    { id: 3, title: 'Math Calculus Integration (30 Mins)', xp: 180, category: 'Deep Work' },
    { id: 4, title: 'English Synonyms Memorization', xp: 100, category: 'Side Quest' },
  ];

  const rankLabel = (r: number) => (r === 1 ? 'S-Rank' : r <= 5 ? 'A-Rank' : r <= 20 ? 'B-Rank' : 'C-Rank');

  return (
    <div className="campus-premium">
      {/* Header */}
      <header className="c-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1A1010] border border-[#C41E3A]/40 flex items-center justify-center text-[#F5C518] shadow-[0_0_12px_rgba(196,30,58,0.3)]">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-wider text-text-primary">CAMPUS 6.0</h2>
            <p className="text-[10px] font-mono text-[#F5C518]">RED GOLD // ZENO LEAGUE</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onOpenShareModal && (
            <button onClick={onOpenShareModal} className="c-header-btn" title="Share">
              <Share2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => onNavigate('dashboard')} className="c-header-btn" title="Exit">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="c-hero">
        <div className="c-avatar-wrap mb-4">
          <div className="c-avatar-ring" />
          <div className="c-avatar-inner flex items-center justify-center">
            {me?.avatar && me.avatar.startsWith('http') ? (
              <img src={me.avatar} alt={profile.displayName || 'You'} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-[#F5C518]">
                {(profile.displayName || profile.nickname || 'H').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <div className="c-name text-center">
          <h1>{profile.displayName || 'CAMPUS HUNTER'}</h1>
          <p className="c-handle">@{profile.targetUniversity || 'CANDIDATE'}</p>
        </div>
      </section>

      {/* Rank & XP */}
      <section className="c-rank">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] font-mono text-[#A89A92] uppercase tracking-widest">CURRENT RANK</p>
            <h3 className="c-rank-title">ZENO LEAGUE // {rankLabel(myRank || 99)}</h3>
          </div>
          <RankBadge rank={myRank && myRank <= 5 ? 'MINDFORGE II' : 'SPARK III'} size={48} animated />
        </div>

        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-[#A89A92]">LEVEL {myLevel}</span>
            <span className="text-[#F5C518] font-bold">{myXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP</span>
          </div>
          <div className="c-rank-track">
            <div className="c-rank-fill" style={{ width: `${levelProgress}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#C41E3A]/20 text-center">
          <div className="bg-[#140C0C] p-2.5 rounded-xl border border-[#C41E3A]/20">
            <p className="text-[10px] text-[#A89A92] font-mono">STREAK</p>
            <p className="text-lg font-bold text-[#F5C518] flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-[#C41E3A]" />
              {streakCount} DAYS
            </p>
          </div>
          <div className="bg-[#140C0C] p-2.5 rounded-xl border border-[#C41E3A]/20">
            <p className="text-[10px] text-[#A89A92] font-mono">STUDY</p>
            <p className="text-lg font-bold text-text-primary">{myStudyTime}m</p>
          </div>
          <div className="bg-[#140C0C] p-2.5 rounded-xl border border-[#C41E3A]/20">
            <p className="text-[10px] text-[#A89A92] font-mono">GLOBAL RANK</p>
            <p className="text-lg font-bold text-[#F5C518]">#{myRank || '—'}</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'quests', label: 'DAILY QUESTS' },
            { id: 'league', label: 'LEAGUE RANKINGS' },
            { id: 'stats', label: 'HUNTER STATS' },
          ].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`c-tab ${activeTab === t.id ? 'active' : ''}`}>
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* QUESTS */}
      {activeTab === 'quests' && (
        <section className="px-6 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-extrabold text-sm text-text-primary tracking-wider flex items-center gap-2">
              <Swords className="w-4 h-4 text-[#C41E3A]" /> ACTIVE QUESTS ({completedQuests.length}/{quests.length})
            </h4>
            <span className="text-[10px] font-mono text-[#F5C518]">DATE: {todayKey}</span>
          </div>

          {quests.map((q) => {
            const isDone = completedQuests.includes(q.id);
            return (
              <div
                key={q.id}
                onClick={() => toggleQuest(q.id)}
                className={`c-card cursor-pointer transition-all flex items-center justify-between gap-3 ${isDone ? 'opacity-60' : 'hover:border-[#F5C518]/50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDone ? 'bg-slate-500/20 text-gold' : 'bg-[#140C0C] text-[#F5C518] border border-[#C41E3A]/30'}`}>
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
            OPEN FULL DAILY ROUTINE <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* LEAGUE — ⭐ REAL DATA (Supabase, সব device-এ একই) */}
      {activeTab === 'league' && (
        <section className="px-6 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-extrabold text-sm text-text-primary tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#F5C518]" /> ZENO LEAGUE TOP HUNTERS
            </h4>
            <span className="flex items-center gap-1 text-[9px] font-mono text-[#34D399] font-bold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" /> LIVE
            </span>
          </div>

          {topPlayers.length === 0 ? (
            <div className="c-card text-center py-8">
              <p className="text-[11px] font-mono text-[#A89A92]">Loading real rankings...</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {topPlayers.map((p) => {
                const isMe = p._isCurrentUser;
                return (
                  <div
                    key={p.id}
                    className={`c-card flex items-center justify-between gap-3 p-3.5 ${isMe ? 'border-[#F5C518]/60 bg-[#1A1010] shadow-[0_0_20px_rgba(245,197,24,0.15)]' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-extrabold ${
                        p.rank === 1 ? 'bg-[#F5C518] text-[#0F0A0A]' :
                        p.rank === 2 ? 'bg-slate-400 text-[#0F0A0A]' :
                        p.rank === 3 ? 'bg-[#CD7F32] text-[#0F0A0A]' :
                        'bg-[#140C0C] text-[#A89A92]'
                      }`}>
                        #{p.rank}
                      </span>
                      {p.avatar && p.avatar.startsWith('http') ? (
                        <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-xl object-cover border border-[#C41E3A]/30" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl object-cover border border-[#C41E3A]/30 bg-[#140C0C] flex items-center justify-center text-xs font-extrabold text-[#F5C518]">
                          {(p.name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h5 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                          {p.name}
                          {isMe && <span className="text-[8px] font-mono bg-[#C41E3A] text-white px-1.5 py-0.5 rounded">YOU</span>}
                          {p.isOnline && <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />}
                        </h5>
                        <p className="text-[10px] text-[#A89A92] truncate max-w-[140px]">{p.target || 'HUNTER'}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-extrabold text-[#F5C518] block">{p.studyTime}m</span>
                      <span className="text-[9px] font-mono text-[#C41E3A] font-bold uppercase">{p.level > 0 ? `L${p.level}` : 'LV1'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* STATS — ⭐ REAL DATA */}
      {activeTab === 'stats' && (
        <section className="px-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="c-card text-center p-4">
              <Zap className="w-6 h-6 text-[#F5C518] mx-auto mb-1 animate-pulse" />
              <p className="text-[10px] font-mono text-[#A89A92]">TOTAL STUDY</p>
              <p className="text-xl font-extrabold text-text-primary mt-1">
                {Math.round(myStudyTime / 60 * 10) / 10} HRS
              </p>
            </div>
            <div className="c-card text-center p-4">
              <TrendingUp className="w-6 h-6 text-[#C41E3A] mx-auto mb-1" />
              <p className="text-[10px] font-mono text-[#A89A92]">GLOBAL RANK</p>
              <p className="text-xl font-extrabold text-[#F5C518] mt-1">#{myRank || '—'}</p>
            </div>
          </div>

          <div className="c-card">
            <h5 className="text-xs font-bold text-text-primary mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#F5C518]" /> ADMISSION TARGET
            </h5>
            <div className="bg-[#140C0C] p-3 rounded-xl border border-[#C41E3A]/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-text-primary">{profile.targetUniversity || 'Dhaka University (A Unit)'}</p>
                <p className="text-[10px] text-[#A89A92]">Seat: Top 500 Merit</p>
              </div>
              <button onClick={() => onNavigate('settings')} className="c-btn-secondary px-3 py-1.5 rounded-lg text-[10px] font-mono">
                EDIT TARGET
              </button>
            </div>
          </div>

          <div className="c-card">
            <h5 className="text-xs font-bold text-text-primary mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#F5C518]" /> PERFORMANCE
            </h5>
            <div className="space-y-2">
              {[
                { label: 'Level Progress', value: `${levelProgress}%`, bar: levelProgress },
                { label: 'Streak Days', value: String(streakCount), bar: Math.min(100, streakCount * 5) },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-[#A89A92]">{m.label}</span>
                    <span className="text-[#F5C518] font-bold">{m.value}</span>
                  </div>
                  <div className="c-rank-track">
                    <div className="c-rank-fill" style={{ width: `${m.bar}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="text-center pt-8 pb-4 text-[10px] font-mono text-[#A89A92] tracking-widest uppercase">
        CAMPUS 6.0 // RED GOLD ZENO LEAGUE — LIVE DATA
      </footer>
    </div>
  );
};

export default RedGoldThemeView;