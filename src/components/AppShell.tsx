import React, { useState, useEffect, useCallback } from 'react';
import { X, Bell, CheckCheck } from 'lucide-react';
import {
  getNotifications,
  markAllAsRead,
  requestNotificationPermission,
  getNotificationPermission,
  SmartNotification,
} from '../utils/smartNotifications';
import { UserProfile, ToastMessage } from '../types';
import { PageId, Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { ToastNotification } from './ToastNotification';
import { showAppNotification } from '../utils/appNotify';

interface AppShellProps {
  children: React.ReactNode;
  profile: UserProfile;
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  isOnline: boolean;
  isPendingSync: boolean;
  toasts: ToastMessage[];
  onDismissToast: (id: string) => void;
  onOpenProfile: () => void;
  onSyncNow: () => void;
  unreadNotifications?: number; // ⭐ NEW
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  profile,
  activePage,
  onNavigate,
  isOnline,
  isPendingSync,
  toasts,
  onDismissToast,
  onOpenProfile,
  onSyncNow,
  unreadNotifications = 0, // ⭐ NEW (default 0)
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifList, setNotifList] = useState<SmartNotification[]>([]);
  const [notifPermission, setNotifPermission] = useState<string>('default');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  }, []);

  const refreshNotifs = useCallback(() => {
    setNotifList(getNotifications());
    setNotifPermission(getNotificationPermission());
  }, []);

  // Live update যখন নতুন notification আসে
  useEffect(() => {
    const onChange = () => refreshNotifs();
    window.addEventListener('campus6:notifications-changed', onChange);
    return () => window.removeEventListener('campus6:notifications-changed', onChange);
  }, [refreshNotifs]);

  const openDrawer = async () => {
    // ⭐ FIRST CLICK-এ permission চাই (user gesture — mobile Chrome-এ কাজ করে)
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const result = await Notification.requestPermission();
        console.log('[Bell] 🔔 Permission result:', result);
        if (result === 'granted') {
          try {
            void showAppNotification('🔔 Notifications Enabled!', 'Timer complete হলে এখন phone vibrate + notification পাবেন।');
          } catch { /* noop */ }
        }
        refreshNotifs();
      } catch (err) {
        console.error('[Bell] Permission request failed:', err);
      }
    }
    
    setIsNotificationOpen(true);
    refreshNotifs();
  };

  const closeDrawer = () => {
    setIsNotificationOpen(false);
    markAllAsRead(); // বন্ধ করলে সব read → badge মুছে যাবে
  };

  const timeAgo = (ts: number): string => {
    const sec = Math.floor((Date.now() - ts) / 1000);
    if (sec < 60) return 'এইমাত্র';
    if (sec < 3600) return `${Math.floor(sec / 60)} মিনিট আগে`;
    if (sec < 86400) return `${Math.floor(sec / 3600)} ঘণ্টা আগে`;
    return `${Math.floor(sec / 86400)} দিন আগে`;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const scrollableContainer = document.getElementById('main-scroll-container');
    if (scrollableContainer) scrollableContainer.scrollTop = 0;
  }, [activePage]);

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col font-sans selection:bg-red-600 selection:text-text-primary">
      {/* Top Fixed Header */}
      <Header
        activePage={activePage}
        profile={profile}
        isOnline={isOnline}
        isPendingSync={isPendingSync}
        onOpenProfile={onOpenProfile}
        onSyncNow={onSyncNow}
        onOpenNotification={openDrawer}
        unreadNotifications={unreadNotifications} // ⭐ Pass unread count
      />

      {/* Main Body Layout with Sidebar */}
      <div className="flex-1 flex w-full">
        <Sidebar activePage={activePage} onNavigate={onNavigate} />

        <main id="main-scroll-container" className="flex-1 w-full p-6 lg:p-8 overflow-y-auto overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNavigation activePage={activePage} onNavigate={onNavigate} />

      
      {/* Notification Drawer — REAL notifications */}
      {isNotificationOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={closeDrawer} />
          <div className="relative w-full max-w-sm bg-[#12141D]/98 border-l border-white/10 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <h3 className="font-bold flex items-center gap-2 text-white">
                <Bell className="w-5 h-5 text-gold" /> Notifications
                {notifList.filter((n) => !n.read).length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {notifList.filter((n) => !n.read).length}
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                {notifList.length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    title="সব read করুন"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button onClick={closeDrawer} className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ⭐ Permission banner — user gesture এ permission চায় (mobile-এ কাজ করে) */}
            {notifPermission === 'default' && (
              <div className="p-3 mx-3 mt-3 rounded-xl border border-[#35D6FF]/40 bg-[#35D6FF]/10 shrink-0">
                <p className="text-[12px] text-gray-200 mb-2">
                  📱 Phone-এ notification পেতে permission দিন — class/exam reminder পাবেন!
                </p>
                <button
                  onClick={async () => {
                    const ok = await requestNotificationPermission();
                    refreshNotifs();
                    if (ok) window.dispatchEvent(new CustomEvent('campus6:notifications-changed'));
                  }}
                  className="w-full py-2 rounded-lg bg-linear-to-r from-[#0AA8D8] to-[#35D6FF] text-[#04121a] text-xs font-extrabold"
                >
                  🔔 Notification চালু করুন
                </button>
              </div>
            )}
            {notifPermission === 'denied' && (
              <div className="p-3 mx-3 mt-3 rounded-xl border border-red-500/40 bg-red-500/10 text-[11px] text-red-200 shrink-0">
                ⚠️ Notification block করা আছে। Browser settings → Site settings → Notifications → Allow করুন।
              </div>
            )}

            {/* List */}
            <div className="p-3 flex-1 overflow-y-auto space-y-2">
              {notifList.length === 0 && (
                <div className="text-center text-sm text-gray-400 mt-10">
                  <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  এখনো কোনো notification নেই।
                  <p className="text-[11px] text-gray-500 mt-2">Class/exam শুরু হওয়ার আগে এখানে reminder আসবে।</p>
                </div>
              )}

              {notifList.map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-xl border transition-all"
                  style={{
                    background: n.read ? 'rgba(255,255,255,0.03)' : 'rgba(0,229,255,0.08)',
                    borderColor: n.read ? 'rgba(255,255,255,0.06)' : 'rgba(0,229,255,0.3)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0">{n.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[12px] font-bold text-white truncate">{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-[#35D6FF] shrink-0 animate-pulse" />}
                      </div>
                      <p className="text-[11px] text-gray-300 mt-0.5 leading-snug">{n.message}</p>
                      <p className="text-[9px] text-gray-500 mt-1">{timeAgo(n.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <ToastNotification toasts={toasts} onDismiss={onDismissToast} />
    </div>
  );
};
