import React, { memo } from 'react';
import { UserProfile } from '../types';
import { Bell, WifiOff, RefreshCw } from 'lucide-react';
import { LiveClock } from './LiveClock';
import { UserAvatar } from './UserAvatar';
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

export const Header: React.FC<HeaderProps> = memo(({
  profile, isOnline, isPendingSync, onOpenProfile, onSyncNow, onOpenNotification, unreadNotifications = 0,
}) => {
  const displayName = profile.displayName || profile.nickname || 'Student';
  const isDemoMode = !!profile.isDemo || !profile.uid;

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-xl border-b"
      style={{ background: 'rgba(10,12,16,0.85)', borderColor: 'rgba(255,255,255,0.06)' }}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-5 h-14 flex items-center justify-between gap-2">
        {/* LEFT — mark + wordmark */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#DC143C,#FBBF24)', boxShadow: '0 2px 10px rgba(220,20,60,0.35)' }}
          >
            <span className="font-black text-[10px] text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>6.0</span>
          </div>
          <div className="leading-none min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-black tracking-[0.06em] whitespace-nowrap" style={{ fontFamily: "'Orbitron', sans-serif", color: '#F8FAFC' }}>
                CAMPUS 6.0
              </span>
              {isDemoMode && (
                <span className="text-[7px] font-black px-1 py-0.5 rounded" style={{ background: 'rgba(251,191,36,0.15)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.3)' }}>
                  DEMO
                </span>
              )}
            </div>
            <p className="hidden sm:block text-[8px] mt-1 uppercase" style={{ letterSpacing: '0.24em', color: '#475569', fontFamily: "'JetBrains Mono', monospace" }}>
              Daily Study Engine
            </p>
          </div>
        </div>

        {/* RIGHT — minimal actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {!isOnline ? (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold" style={{ background: 'rgba(239,68,68,0.12)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.3)' }}>
              <WifiOff className="w-3 h-3" /> Offline
            </span>
          ) : isPendingSync && onSyncNow ? (
            <button onClick={onSyncNow} className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold" style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.3)' }}>
              <RefreshCw className="w-3 h-3 animate-spin" /> Sync
            </button>
          ) : (
            <span className="hidden sm:flex items-center gap-1.5 text-[9px] font-bold" style={{ color: '#475569' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#34D399', boxShadow: '0 0 6px #34D399' }} /> Online
            </span>
          )}

          <span className="hidden md:block"><LiveClock /></span>

          <PwaInstallHeaderButton />

          <button
            onClick={onOpenNotification}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" style={{ color: '#94A3B8' }} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full flex items-center justify-center text-[8px] font-black text-white" style={{ background: '#DC143C', boxShadow: '0 0 8px rgba(220,20,60,0.6)' }}>
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>

          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 h-9 pl-1 pr-1 sm:pr-3 rounded-xl transition-colors hover:bg-white/5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            aria-label={`Profile: ${displayName}`}
          >
            <UserAvatar src={profile.photoURL || profile.avatar_url} size={26} crop={profile.avatarCrop} rounded="full" />
            <span className="hidden sm:inline text-[11px] font-bold truncate max-w-28" style={{ color: '#E2E8F0' }}>
              {displayName}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';