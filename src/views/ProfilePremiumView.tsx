import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserProfile } from '../types';
import { PageId } from '../components/Sidebar';
import { RankBadge } from '../components/RankBadge';
import { 
  Trophy, 
  Zap, 
  Flame, 
  CheckCircle2, 
  ArrowRight,
  Share2,
  Copy,
  Gamepad2,
  Medal,
  Swords,
} from 'lucide-react';

interface ProfilePremiumViewProps {
  profile: UserProfile;
  todayKey: string;
  onNavigate: (page: PageId) => void;
  onOpenShareModal?: () => void;
}

interface PremiumUserSnapshot {
  xp?: number;
  level?: number;
  tier?: string;
  studyTime?: number;
}

export const ProfilePremiumView: React.FC<ProfilePremiumViewProps> = ({
  profile,
  todayKey,
  onNavigate,
  onOpenShareModal
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'achievements'>('overview');
  const [dbUser, setDbUser] = useState<PremiumUserSnapshot | null>(null);

  useEffect(() => {
    if (!auth?.currentUser || !db) return;
    const unsub = onSnapshot(doc(db, 'users', auth.currentUser.uid), (snap) => {
      if (snap.exists()) {
        setDbUser(snap.data() as PremiumUserSnapshot);
      }
    });
    return () => unsub();
  }, []);

  const xp = dbUser?.xp || 0;
  const level = dbUser?.level || 1;
  const tier = dbUser?.tier || 'BRONZE I';
  const studyHours = Math.floor((dbUser?.studyTime || 0) / 60);

  return (
    <div className="profile-premium w-full max-w-4xl mx-auto overflow-x-hidden px-4 sm:px-5 pb-24">
      {/* Header */}
      <header className="p-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surface border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#DC2626]">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-wider text-text-primary">ZENO LEAGUE</h2>
            <p className="text-[10px] font-mono text-gold">ESPORTS EDITION</p>
          </div>
        </div>

        <div className="p-header-actions">
          {onOpenShareModal && (
            <button onClick={onOpenShareModal} className="p-header-btn" title="Share Status">
              <Share2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => onNavigate('dashboard')} className="p-header-btn" title="Exit to Standard View">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="p-hero">
        <div className="p-avatar-wrap mb-4">
          <div className="p-avatar-ring" />
          <div className="p-avatar-inner flex items-center justify-center">
            {profile.photoURL ? (
              <img 
                src={profile.photoURL} 
                alt="Avatar" 
                className="rounded-full object-cover w-full h-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-surface-muted flex items-center justify-center text-4xl font-bold text-gold">
                {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </div>
          <div className="p-online">
            <div className="p-online-dot" />
          </div>
        </div>

        <div className="p-name">
          <h1>{profile.displayName || 'PHANTOM'}</h1>
          <p className="p-handle">@{profile.targetUniversity || 'ELITE_SQUAD'}</p>
        </div>

        <div className="p-uid">
          <span className="p-uid-label">UID</span>
          <span className="p-uid-value">{profile.uid?.slice(0, 8).toUpperCase() || 'NEW-USER'}</span>
          <button className="p-uid-copy" title="Copy UID" onClick={() => navigator.clipboard.writeText(profile.uid || '')}>
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Rank Card */}
      <section className="p-rank">
        <div className="p-rank-header">
          <div>
            <p className="p-rank-label">CURRENT DIVISION</p>
            <h3 className="p-rank-title text-2xl sm:text-3xl md:text-4xl font-bold wrap-break-word whitespace-normal tracking-tight">⚡ {tier}</h3>
          </div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0">
            <RankBadge rank={tier} size={80} animated />
          </div>
        </div>

        <div className="space-y-1.5 mb-4">
          <div className="p-rank-labels">
            <span>LEVEL {level}</span>
            <span className="text-gold">{xp} / {level * 500} RP</span>
          </div>
          <div className="p-rank-track">
            <div className="p-rank-fill" style={{ width: '85%' }} />
            <div className="p-rank-milestone" style={{ left: '25%' }} />
            <div className="p-rank-milestone" style={{ left: '50%' }} />
            <div className="p-rank-milestone" style={{ left: '75%' }} />
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="p-tabs">
        <div className="p-tabs-list w-full flex flex-nowrap overflow-x-auto scrollbar-hide gap-3">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`p-tab shrink-0 ${activeTab === 'overview' ? 'active' : ''}`}
          >
            OVERVIEW
          </button>
          <button 
            onClick={() => setActiveTab('matches')}
            className={`p-tab shrink-0 ${activeTab === 'matches' ? 'active' : ''}`}
          >
            STUDY SESSIONS
          </button>
          <button 
            onClick={() => setActiveTab('achievements')}
            className={`p-tab shrink-0 ${activeTab === 'achievements' ? 'active' : ''}`}
          >
            TROPHIES
          </button>
        </div>
      </section>

      {/* Content */}
      <div className="p-panel">
        {activeTab === 'overview' && (
          <>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
              <div className="p-balance w-full h-full">
                <p className="p-balance-label">TOTAL EARNINGS (RP)</p>
                <div className="p-balance-row">
                  <span className="p-balance-num">{xp}</span>
                  <span className="p-balance-unit">RP</span>
                </div>
                <div className="p-balance-actions">
                  <button className="p-btn p-btn-primary">
                    CLAIM REWARDS
                  </button>
                  <button className="p-btn-icon">
                    <Flame className="w-5 h-5 text-gold" />
                  </button>
                </div>
              </div>
              <div className="p-stat h-full flex flex-col justify-center">
                <p className="p-stat-label">CONSISTENCY (%)</p>
                <p className="p-stat-value accent">
                  {level > 5 ? '92.4' : '68.4'}<span className="p-stat-suffix">%</span>
                </p>
              </div>
              <div className="p-stat h-full flex flex-col justify-center">
                <p className="p-stat-label">FOCUS SCORE</p>
                <p className="p-stat-value">
                  {studyHours > 10 ? '4.85' : '2.45'}
                </p>
              </div>
            </div>

            <div className="p-ref-code">
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">REFERRAL CODE</p>
                <p className="p-ref-code-value">PHANTOM-X9</p>
              </div>
              <button className="p-ref-copy">
                <Copy className="w-4 h-4" /> COPY
              </button>
            </div>
          </>
        )}

        {activeTab === 'matches' && (
          <div className="p-card overflow-hidden w-full">
            <h4 className="p-card-title mb-4">RECENT SESSIONS</h4>
            <div className="text-center py-10 opacity-50">
              <p className="text-sm">No recent sessions found.</p>
              <p className="text-xs mt-1">Start a timer to log your focus sessions.</p>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="p-card w-full">
            <h4 className="p-card-title">TROPHY ROOM</h4>
            <div className="p-achieve-grid mb-5">
              <div className="p-achieve-item unlocked">
                <CheckCircle2 className="p-achieve-check w-3 h-3" />
                <span className="p-achieve-icon">🏆</span>
                <span className="p-achieve-title">First Win</span>
              </div>
              <div className="p-achieve-item unlocked">
                <CheckCircle2 className="p-achieve-check w-3 h-3" />
                <span className="p-achieve-icon">🔥</span>
                <span className="p-achieve-title">Hot Streak</span>
              </div>
              <div className="p-achieve-item unlocked">
                <CheckCircle2 className="p-achieve-check w-3 h-3" />
                <span className="p-achieve-icon">⚡</span>
                <span className="p-achieve-title">Fast Reflex</span>
              </div>
              <div className="p-achieve-item">
                <span className="p-achieve-icon opacity-30">👑</span>
                <span className="p-achieve-title opacity-50">Champion</span>
              </div>
              <div className="p-achieve-item">
                <span className="p-achieve-icon opacity-30">🎯</span>
                <span className="p-achieve-title opacity-50">Sharpshooter</span>
              </div>
            </div>

            <h4 className="p-card-title">MILESTONES</h4>
            <div className="p-milestone done">
              <Medal className="w-4 h-4 text-success" />
              <span className="text-xs font-bold text-text-primary flex-1">Log 100 Hours (${studyHours}h)</span>
              <span className="text-[10px] font-mono text-gold">{studyHours}/100</span>
            </div>
            <div className="p-milestone locked">
              <Swords className="w-4 h-4 text-text-muted" />
              <span className="text-xs font-bold text-text-muted flex-1">Complete 500 Questions</span>
              <span className="text-[10px] font-mono text-text-muted">412/500</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePremiumView;
