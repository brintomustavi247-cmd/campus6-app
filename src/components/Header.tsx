/**
 * ============================================================================
 * CAMPUS 6.0 - HEADER COMPONENT (v10.0 — Mobile Compact + Premium Logo)
 * ============================================================================
 * Mobile: single-row 56px header, no wrap, compact buttons
 * Desktop: full branding with subtitle + glow
 * ============================================================================
 */
import React, { memo } from 'react';
import { UserProfile } from '../types';
import { Bell, Wifi, WifiOff, Swords, RefreshCw } from 'lucide-react';
import { LiveClock } from './LiveClock';
import { ProfileAvatar } from './ProfileAvatar';
import { PwaInstallHeaderButton } from './PwaInstall';

interface HeaderProps {
  activePage?: string;
  profile: UserProfile;
  isOnline: boolean;
  isPendingSync: boolean;
  onOpenProfile: () => void;
  onSyncNow?: () => void;
  onOpenNotification: () => void;
  unreadNotifications?: number;
}

/* ═══ STATUS BADGE ═══ */
const StatusBadge: React.FC<{
  isOnline: boolean;
  isPendingSync: boolean;
  onSyncNow?: () => void;
}> = memo(({ isOnline, isPendingSync, onSyncNow }) => {
  if (!isOnline) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-950/80 text-red-300 border border-red-800/60">
        <WifiOff className="w-3.5 h-3.5" />
        Offline
      </span>
    );
  }
  if (isPendingSync && onSyncNow) {
    return (
      <button
        onClick={onSyncNow}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-500/30 transition-colors cursor-pointer"
        title="Sync pending changes to cloud"
      >
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        Syncing
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-muted text-text-muted border border-border">
      <Wifi className="w-3.5 h-3.5 text-green-400" />
      Online
    </span>
  );
});
StatusBadge.displayName = 'StatusBadge';

/* ═══ DEMO BADGE ═══ */
const DemoBadge: React.FC = memo(() => (
  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs font-medium">
    <Swords className="w-3.5 h-3.5" />
    Demo Mode — progress saved locally only
  </span>
));
DemoBadge.displayName = 'DemoBadge';

/* ═══ MAIN HEADER v10 ═══ */
export const Header: React.FC<HeaderProps> = memo(({
  activePage,
  profile,
  isOnline,
  isPendingSync,
  onOpenProfile,
  onSyncNow,
  onOpenNotification,
  unreadNotifications = 0,
}) => {
  const displayName: string = profile.displayName || profile.nickname || 'Student';
  const isDemoMode: boolean = !!profile.isDemo || !profile.uid;

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-xl border-b border-border text-text-primary shadow-lg relative"
      style={{ background: 'rgba(16,18,26,0.88)' }}
      role="banner"
    >
      <style>{`
        @keyframes logoShine { 0% { transform: translateX(-130%) skewX(-15deg); } 60%, 100% { transform: translateX(230%) skewX(-15deg); } }
        @keyframes logoPulse { 0%,100% { opacity: .45; } 50% { opacity: 1; } }
      `}</style>

      {/* rainbow hairline bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(220,20,60,0.6), rgba(251,191,36,0.6), rgba(53,214,255,0.5), transparent)' }}
      />

      {/* ⭐ single-row compact container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
        {/* ═══ LEFT: Logo ═══ */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {activePage === 'leaderboard' ? (
            <h1
              className="font-black italic tracking-widest text-xl sm:text-2xl whitespace-nowrap"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                background: 'linear-gradient(90deg,#FBBF24,#F87171)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                filter: 'drop-shadow(0 0 12px rgba(250,204,21,0.45))',
              }}
            >
              RANKING
            </h1>
          ) : (
            <>
              {/* logo mark */}
              <div className="relative shrink-0">
                <span
                  className="absolute -inset-1 sm:-inset-1.5 rounded-2xl pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(251,191,36,0.3), transparent 70%)',
                    filter: 'blur(6px)',
                    animation: 'logoPulse 3s ease-in-out infinite',
                  }}
                />
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg,#DC143C 0%,#FBBF24 100%)',
                    boxShadow: '0 4px 16px rgba(220,20,60,0.45), inset 0 1px 0 rgba(255,255,255,0.3)',
                  }}
                >
                  <span
                    className="font-black text-xs sm:text-sm text-white relative z-10"
                    style={{ fontFamily: "'Orbitron', sans-serif", textShadow: '0 1px 3px rgba(0,0,0,0.45)' }}
                  >
                    6.0
                  </span>
                  <span
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.45) 50%, transparent 65%)',
                      animation: 'logoShine 3.8s ease-in-out infinite',
                    }}
                  />
                </div>
              </div>

              {/* wordmark — NEVER wraps */}
              <div className="leading-none min-w-0">
                <h1 className="flex items-center gap-1.5" style={{ flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                  <span
                    className="text-[13px] sm:text-base font-black tracking-wider whitespace-nowrap"
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      background: 'linear-gradient(90deg,#FFFFFF 0%,#FBBF24 80%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    CAMPUS 6.0
                  </span>
                  <span
                    className="hidden min-[380px]:inline-block text-[8px] px-1.5 py-0.5 rounded-md font-mono font-bold text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg,#DC143C,#9E0E29)', boxShadow: '0 2px 8px rgba(220,20,60,0.45)' }}
                  >
                    PRO
                  </span>
                </h1>
                <p
                  className="hidden sm:block text-[9px] text-text-muted font-medium mt-1 uppercase tracking-[0.22em]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Daily Study Engine
                </p>
              </div>
            </>
          )}
        </div>

        {/* ═══ CENTER: Status (desktop) ═══ */}
        <div className="hidden md:flex items-center gap-2">
          {isDemoMode && <DemoBadge />}
          <StatusBadge isOnline={isOnline} isPendingSync={isPendingSync} onSyncNow={onSyncNow} />
        </div>

        {/* ═══ RIGHT: compact buttons ═══ */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
          <LiveClock />

          <PwaInstallHeaderButton />

          <button
            onClick={onOpenNotification}
            className="group relative shrink-0 rounded-full flex items-center justify-center bg-[#1E2030] border border-white/10 hover:bg-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            style={{ width: 40, height: 40 }}
            aria-label="Open notifications"
            aria-haspopup="dialog"
            title="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-white transition-colors" />
            {unreadNotifications > 0 && (
              <span
                className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-red-500 rounded-full animate-pulse flex items-center justify-center text-[9px] font-bold text-white"
                style={{ boxShadow: '0 0 8px rgba(239,68,68,0.6)' }}
                aria-hidden="true"
              >
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>

          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 shrink-0 rounded-xl bg-surface-muted hover:bg-surface-hover border border-border text-text-primary transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 group"
            style={{ height: 40, paddingLeft: 6, paddingRight: 6 }}
            aria-label={`Open profile for ${displayName}`}
            title={`Profile: ${displayName}`}
          >
            <ProfileAvatar profile={profile} size={32} />
            <span className="hidden sm:inline text-xs font-bold truncate max-w-27.5 group-hover:text-gold transition-colors" title={displayName}>
              {displayName}
            </span>
          </button>
        </div>
      </div>

      {/* ═══ Mobile status bar ═══ */}
      {(isDemoMode || !isOnline || isPendingSync) && (
        <div className="md:hidden px-4 pb-2 flex items-center justify-center gap-2 border-t border-border/50 pt-2">
          {isDemoMode && <DemoBadge />}
          <StatusBadge isOnline={isOnline} isPendingSync={isPendingSync} onSyncNow={onSyncNow} />
        </div>
      )}
    </header>
  );
});

Header.displayName = 'Header';