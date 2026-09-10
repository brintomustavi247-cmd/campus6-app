/**
 * ============================================================================
 * CAMPUS 6.0 - HEADER COMPONENT (v8.0 — ProfileAvatar integrated)
 * ============================================================================
 * FIXES:
 * 1. ✅ firebase `auth` import REMOVED (Supabase migration-এর পরে ওটা dead weight ছিল)
 * 2. ✅ Avatar logic এখন ProfileAvatar component-এ (single source of truth)
 * 3. ✅ Google OAuth avatar: profile → live Supabase session → letter fallback
 * 4. ✅ React.memo + accessibility বজায়
 * ============================================================================
 */
import React, { memo } from 'react';
import { UserProfile } from '../types';
import { Bell, Wifi, WifiOff, Swords, RefreshCw } from 'lucide-react';
import { LiveClock } from './LiveClock';
import { ProfileAvatar } from './ProfileAvatar';
import { PwaInstallHeaderButton } from './PwaInstall';

/* ═══════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════ */
interface HeaderProps {
  activePage?: string;
  profile: UserProfile;
  isOnline: boolean;
  isPendingSync: boolean;
  onOpenProfile: () => void;
  onSyncNow?: () => void;
  onOpenNotification: () => void;
}

/* ═══════════════════════════════════════════════════════════
   STATUS BADGE (online / offline / syncing)
   ═══════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════
   DEMO BADGE
   ═══════════════════════════════════════════════════════════ */
const DemoBadge: React.FC = memo(() => (
  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs font-medium">
    <Swords className="w-3.5 h-3.5" />
    Demo Mode — progress saved locally only
  </span>
));
DemoBadge.displayName = 'DemoBadge';

/* ═══════════════════════════════════════════════════════════
   MAIN HEADER
   ═══════════════════════════════════════════════════════════ */
export const Header: React.FC<HeaderProps> = memo(({
  activePage,
  profile,
  isOnline,
  isPendingSync,
  onOpenProfile,
  onSyncNow,
  onOpenNotification,
}) => {
  const displayName: string = profile.displayName || profile.nickname || 'Student';
  const isDemoMode: boolean = !!profile.isDemo || !profile.uid;

  return (
    <header className="sticky top-0 z-40 bg-bg-elevated backdrop-blur-md border-b border-border text-text-primary shadow-md" role="banner">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* ═══ LEFT: Logo / Page title ═══ */}
        <div className="flex items-center gap-3">
          {activePage === 'leaderboard' ? (
            <h1 className="font-orbitron font-black italic tracking-widest text-2xl text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]">
              RANKING
            </h1>
          ) : (
            <>
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-gold to-gold-bright flex items-center justify-center text-bg font-black text-sm shadow-md select-none">
                6.0
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-text-primary leading-tight flex items-center gap-1.5">
                  CAMPUS 6.0
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold text-bg font-mono font-bold">PRO</span>
                </h1>
                <p className="text-[10px] text-text-muted font-medium">Daily Study Engine</p>
              </div>
            </>
          )}
        </div>

        {/* ═══ CENTER: Status (desktop) ═══ */}
        <div className="hidden md:flex items-center gap-2">
          {isDemoMode && <DemoBadge />}
          <StatusBadge isOnline={isOnline} isPendingSync={isPendingSync} onSyncNow={onSyncNow} />
        </div>

        {/* ═══ RIGHT: Clock + Install + Bell + Profile ═══ */}
        <div className="flex items-center gap-2 ml-auto">
          <LiveClock />

          {/* 📲 PWA Install button (notification bell-এর পাশে) */}
          <PwaInstallHeaderButton />

          <button
            onClick={onOpenNotification}
            className="group relative w-10 h-10 rounded-full flex items-center justify-center bg-[#1E2030] border border-white/10 hover:bg-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            aria-label="Open notifications"
            aria-haspopup="dialog"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
            <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
          </button>

          {/* 🎯 PROFILE BUTTON — এখন ProfileAvatar ব্যবহার করছে */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-surface-muted hover:bg-surface-hover border border-border text-text-primary transition-all min-h-11 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 group"
            aria-label={`Open profile for ${displayName}`}
            title={`Profile: ${displayName}`}
          >
            <ProfileAvatar profile={profile} size={34} />
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