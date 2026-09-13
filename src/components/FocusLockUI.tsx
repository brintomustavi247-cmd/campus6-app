import React, { useEffect, useState, useRef } from 'react';
import { Lock, Unlock, Shield, Smartphone, AlertTriangle } from 'lucide-react';
import {
  activateFocusLock,
  deactivateFocusLock,
  forceUnlock,
  isFocusLockActive,
  getAllowedApps,
  setAllowedApps,
  syncWithNativeCompanion,
  AllowedApp,
} from '../utils/focusLock';
import { useGlobalTimer } from '../contexts/TimerContext';

interface FocusLockUIProps {
  onForceUnlock?: () => void;
}

export const FocusLockUI: React.FC<FocusLockUIProps> = ({ onForceUnlock }) => {
  const { isRunning, mode } = useGlobalTimer();
  const [locked, setLocked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [allowedApps, setAllowedAppsState] = useState<AllowedApp[]>(getAllowedApps());
  const [unlockProgress, setUnlockProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const holdIntervalRef = useRef<number | null>(null);

  const isBreakMode = mode === '5min' || mode === '2min';

  // Auto-activate when timer starts (except break modes)
  useEffect(() => {
    if (isRunning && !isBreakMode) {
      if (!isFocusLockActive()) {
        activateFocusLock({
          onEscape: () => {
            setLocked(false);
            onForceUnlock?.();
          },
        });
        setLocked(true);
        syncWithNativeCompanion('lock', allowedApps.map((a) => a.packageName));
      }
    } else if (!isRunning && locked) {
      deactivateFocusLock();
      setLocked(false);
      syncWithNativeCompanion('unlock', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, mode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (locked) deactivateFocusLock();
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Long-press unlock (3 seconds)
  const startHold = () => {
    setHolding(true);
    setUnlockProgress(0);
    const start = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(100, (elapsed / 3000) * 100);
      setUnlockProgress(progress);

      if (elapsed >= 3000) {
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
        forceUnlock();
        setLocked(false);
        setHolding(false);
        setUnlockProgress(0);
        onForceUnlock?.();
      }
    }, 50);
    holdIntervalRef.current = interval;
  };

  const endHold = () => {
    setHolding(false);
    setUnlockProgress(0);
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  const toggleApp = (pkg: string, label: string, icon?: string) => {
    const current = getAllowedApps();
    const exists = current.find((a) => a.packageName === pkg);
    let updated: AllowedApp[];

    if (exists) {
      updated = current.filter((a) => a.packageName !== pkg);
    } else {
      updated = [...current, { packageName: pkg, label, icon }];
    }

    setAllowedApps(updated);
    setAllowedAppsState(updated);
  };

  // Available apps to add (cosmetic list — in native companion, this would be real)
  const availableApps: AllowedApp[] = [
    { packageName: 'com.google.android.youtube', label: 'YouTube', icon: '📺' },
    { packageName: 'com.android.chrome', label: 'Chrome', icon: '🌐' },
    { packageName: 'org.mozilla.firefox', label: 'Firefox', icon: '🦊' },
    { packageName: 'com.whatsapp', label: 'WhatsApp', icon: '💬' },
    { packageName: 'com.facebook.katana', label: 'Facebook', icon: '📘' },
    { packageName: 'com.instagram.android', label: 'Instagram', icon: '📷' },
    { packageName: 'com.twitter.android', label: 'Twitter/X', icon: '🐦' },
    { packageName: 'com.spotify.music', label: 'Spotify', icon: '🎵' },
    { packageName: 'com.google.android.apps.maps', label: 'Maps', icon: '🗺️' },
    { packageName: 'com.google.android.dialer', label: 'Phone', icon: '📞' },
    { packageName: 'com.google.android.calculator', label: 'Calculator', icon: '🧮' },
    { packageName: 'com.adobe.reader', label: 'PDF Reader', icon: '📄' },
  ];

  if (!isRunning || isBreakMode) {
    return null;
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0A0C12', border: `1px solid ${locked ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
      {/* Header */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: locked ? 'rgba(239,68,68,0.06)' : 'transparent' }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: locked ? 'rgba(239,68,68,0.15)' : 'rgba(251,191,36,0.12)', border: `1px solid ${locked ? 'rgba(239,68,68,0.4)' : 'rgba(251,191,36,0.3)'}` }}>
            {locked ? <Lock className="w-4 h-4" style={{ color: '#F87171' }} /> : <Shield className="w-4 h-4" style={{ color: '#FBBF24' }} />}
          </span>
          <div className="min-w-0">
            <p className="text-[8px] font-black tracking-[0.25em] uppercase" style={{ color: locked ? '#F87171' : '#FBBF24', fontFamily: "'JetBrains Mono', monospace" }}>
              Focus Lock
            </p>
            <h3 className="text-[12px] font-black bn leading-tight" style={{ color: '#F8FAFC', fontFamily: "'Anek Bangla', sans-serif" }}>
              {locked ? '🔒 সক্রিয় — অন্য app বন্ধ' : 'পড়ায় মনোযোগ দিন'}
            </h3>
          </div>
        </div>

        {locked && (
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[8px] font-black tracking-widest uppercase" style={{ color: '#F87171' }}>ACTIVE</span>
          </span>
        )}
      </div>

      {/* Warning banner */}
      {locked && (
        <div className="px-5 py-3 flex items-start gap-2.5" style={{ background: 'rgba(239,68,68,0.05)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#FCA5A5' }} />
          <p className="text-[10px] bn leading-relaxed" style={{ color: '#CBD5E1', fontFamily: "'Anek Bangla', sans-serif" }}>
            অন্য app-এ গেলে alarm বাজবে + notification আসবে। Timer শেষ না হওয়া পর্যন্ত ফোকাস রাখুন।
          </p>
        </div>
      )}

      {/* Allowed apps section */}
      <div className="px-5 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" style={{ color: '#64748B' }} />
            <span className="text-[9px] font-black tracking-[0.2em] uppercase" style={{ color: '#64748B', fontFamily: "'JetBrains Mono', monospace" }}>
              Allowed Apps
            </span>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-[9px] font-bold px-2 py-1 rounded"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}
          >
            {showSettings ? 'Hide' : 'Configure'}
          </button>
        </div>

        {/* Current allowed */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {allowedApps.map((app) => (
            <span
              key={app.packageName}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold bn"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#6EE7B7', border: '1px solid rgba(16,185,129,0.3)' }}
            >
              <span>{app.icon || '📱'}</span>
              <span>{app.label}</span>
            </span>
          ))}
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[9px] font-bold bn mb-2" style={{ color: '#94A3B8' }}>
              ট্যাপ করে add/remove করুন:
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {availableApps.map((app) => {
                const isSelected = allowedApps.some((a) => a.packageName === app.packageName);
                return (
                  <button
                    key={app.packageName}
                    onClick={() => toggleApp(app.packageName, app.label, app.icon)}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:scale-[1.02]"
                    style={{
                      background: isSelected ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    <span className="text-base">{app.icon}</span>
                    <span className="text-[9px] font-bold bn truncate w-full text-center" style={{ color: isSelected ? '#6EE7B7' : '#94A3B8' }}>
                      {app.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 p-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}>
              <p className="text-[9px] bn leading-relaxed" style={{ color: '#FBBF24' }}>
                ⚠️ <strong>Native app install</strong> করলে real app blocking কাজ করবে। PWA-তে শুধু notification + alarm কাজ করে।
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Unlock button (3-sec long press) */}
      {locked && (
        <div className="px-5 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            className="relative w-full py-3 rounded-xl text-[11px] font-extrabold bn flex items-center justify-center gap-2 overflow-hidden transition-all"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#FCA5A5',
            }}
          >
            {/* Progress fill */}
            <div
              className="absolute inset-y-0 left-0"
              style={{
                width: `${unlockProgress}%`,
                background: 'linear-gradient(90deg, rgba(239,68,68,0.4), rgba(239,68,68,0.7))',
              }}
            />
            <span className="relative z-10 flex items-center gap-2">
              <Unlock className="w-4 h-4" />
              {holding ? `${Math.round(unlockProgress / 33)}s ধরে রাখুন...` : 'আনলক করতে ৩ সেকেন্ড ধরে রাখুন'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};