import React, { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { UserProfile, ToastMessage } from '../types';
import { PageId, Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { ToastNotification } from './ToastNotification';

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
  onSyncNow
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

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
        onOpenNotification={() => setIsNotificationOpen(true)}
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

      
      {/* Notification Drawer */}
      {isNotificationOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsNotificationOpen(false)} />
          <div className="relative w-80 bg-[#1E2030]/95 backdrop-blur-xl border-l border-white/10 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2"><Bell className="w-5 h-5 text-gold"/> Notifications</h3>
              <button onClick={() => setIsNotificationOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="text-center text-sm text-gray-400 mt-10">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                No new notifications.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <ToastNotification toasts={toasts} onDismiss={onDismissToast} />
    </div>
  );
};
