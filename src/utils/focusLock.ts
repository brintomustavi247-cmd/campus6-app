/**
 * 🔒 FOCUS LOCK — YPT-style focus enforcement (PWA version)
 *
 * PWA থেকে OS-level app blocking সম্ভব না, কিন্তু strong deterrent বানানো যায়:
 * 1. Tab blur হলেই audio alarm + notification + vibration
 * 2. Fullscreen mode lock
 * 3. Screen wake lock (screen off হতে দেবে না)
 * 4. 3-second long-press escape hatch (discourages casual switching)
 *
 * Native companion app-এর জন্য hook points রেখেছি (Phase 2-তে যাবে)
 */

const FOCUS_LOCK_STATE_KEY = 'campus6_focus_lock_active';
const ALLOWED_APPS_KEY = 'campus6_allowed_apps';

let audioCtx: AudioContext | null = null;
let alarmInterval: number | null = null;
let nagInterval: number | null = null;
let wakeLock: any = null;
let isLocked = false;
let onEscapeCallbacks: Set<() => void> = new Set();

/** Start alarm beep loop (WebAudio oscillator — no external file needed) */
const startAlarm = () => {
  if (alarmInterval) return;

  const playBeep = () => {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 880;
      osc.type = 'square';
      gain.gain.value = 0.15;
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) { /* ignore */ }
  };

  playBeep();
  alarmInterval = window.setInterval(playBeep, 1500);
};

const stopAlarm = () => {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
};

/** Vibration pattern (if supported) */
const vibrateAlert = () => {
  if ('vibrate' in navigator) {
    try { navigator.vibrate([200, 100, 200, 100, 200]); } catch (e) { /* ignore */ }
  }
};

/** Send nag notification */
const sendNagNotification = () => {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const n = new Notification('🔒 ফোকাস লক সক্রিয়!', {
        body: 'Timer চলছে — পড়ায় ফিরে আসুন',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'focus-lock-nag',
      });
      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch (e) { /* ignore */ }
  }
};

/** Request Wake Lock (keep screen on) */
const requestWakeLock = async () => {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await (navigator as any).wakeLock.request('screen');
      console.log('[FocusLock] 🔆 Wake lock active');
    } catch (e) { /* ignore */ }
  }
};

const releaseWakeLock = async () => {
  if (wakeLock) {
    try {
      await wakeLock.release();
      wakeLock = null;
    } catch (e) { /* ignore */ }
  }
};

/** Request Fullscreen (lock to this page) */
const requestFullscreen = async () => {
  try {
    const el = document.documentElement as any;
    if (el.requestFullscreen) await el.requestFullscreen();
    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
  } catch (e) { /* ignore */ }
};

const exitFullscreen = async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  } catch (e) { /* ignore */ }
};

// ═══════════════════════════════════════════════════════════════════
// VISIBILITY CHANGE HANDLER (the core enforcement)
// ═══════════════════════════════════════════════════════════════════

const handleVisibilityChange = () => {
  if (!isLocked) return;

  if (document.visibilityState === 'hidden' || document.hidden) {
    // User left the tab — trigger alarm!
    console.log('[FocusLock] ⚠️ User left tab — triggering alarm');
    startAlarm();
    vibrateAlert();
    sendNagNotification();

    // Repeat nag every 10 seconds while away
    if (!nagInterval) {
      nagInterval = window.setInterval(() => {
        if (document.hidden && isLocked) {
          sendNagNotification();
          vibrateAlert();
        }
      }, 10000);
    }
  } else {
    // User came back — stop alarm
    stopAlarm();
    if (nagInterval) {
      clearInterval(nagInterval);
      nagInterval = null;
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════

/**
 * Activate focus lock.
 * @param options.onEscape — called when user force-unlocks (3-sec long press)
 */
export const activateFocusLock = async (options: { onEscape?: () => void } = {}) => {
  if (isLocked) return;

  if (options.onEscape) onEscapeCallbacks.add(options.onEscape);

  isLocked = true;
  localStorage.setItem(FOCUS_LOCK_STATE_KEY, '1');

  document.addEventListener('visibilitychange', handleVisibilityChange);
  await requestWakeLock();
  await requestFullscreen();

  // Ask for notification permission if not granted
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch (e) { /* ignore */ }
  }

  console.log('[FocusLock] 🔒 ACTIVATED');
};

/**
 * Deactivate focus lock (normal unlock — timer ended or paused).
 */
export const deactivateFocusLock = () => {
  if (!isLocked) return;

  isLocked = false;
  localStorage.removeItem(FOCUS_LOCK_STATE_KEY);

  stopAlarm();
  if (nagInterval) {
    clearInterval(nagInterval);
    nagInterval = null;
  }

  document.removeEventListener('visibilitychange', handleVisibilityChange);
  releaseWakeLock();
  exitFullscreen();

  onEscapeCallbacks.clear();

  console.log('[FocusLock] 🔓 DEACTIVATED');
};

/**
 * Force unlock (user wants out early — penalized).
 * Call this from "Unlock" button with 3-sec long press.
 */
export const forceUnlock = () => {
  deactivateFocusLock();
  onEscapeCallbacks.forEach((cb) => {
    try { cb(); } catch (e) { /* ignore */ }
  });
};

export const isFocusLockActive = () => isLocked;

// ═══════════════════════════════════════════════════════════════════
// ALLOWED APPS (cosmetic in PWA, real in Phase 2 native companion)
// ═══════════════════════════════════════════════════════════════════

export interface AllowedApp {
  packageName: string;
  label: string;
  icon?: string;
}

const DEFAULT_ALLOWED: AllowedApp[] = [
  { packageName: 'com.google.android.youtube', label: 'YouTube', icon: '📺' },
  { packageName: 'com.android.chrome', label: 'Chrome', icon: '🌐' },
  { packageName: 'com.google.android.apps.maps', label: 'Maps', icon: '🗺️' },
  { packageName: 'com.google.android.dialer', label: 'Phone', icon: '📞' },
  { packageName: 'com.whatsapp', label: 'WhatsApp', icon: '💬' },
];

export const getAllowedApps = (): AllowedApp[] => {
  try {
    const raw = localStorage.getItem(ALLOWED_APPS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_ALLOWED;
  } catch {
    return DEFAULT_ALLOWED;
  }
};

export const setAllowedApps = (apps: AllowedApp[]) => {
  localStorage.setItem(ALLOWED_APPS_KEY, JSON.stringify(apps));
};

export const addAllowedApp = (app: AllowedApp) => {
  const current = getAllowedApps();
  if (!current.find((a) => a.packageName === app.packageName)) {
    current.push(app);
    setAllowedApps(current);
  }
};

export const removeAllowedApp = (packageName: string) => {
  const current = getAllowedApps().filter((a) => a.packageName !== packageName);
  setAllowedApps(current);
};

/**
 * Hook to communicate with native companion app (Phase 2).
 * For now, this is a no-op that logs intent.
 */
export const syncWithNativeCompanion = (action: 'lock' | 'unlock', allowedPackages: string[]) => {
  // Phase 2 implementation will use:
  // - Android Intent via deep link: campus6://lock?apps=youtube,chrome
  // - Or window.AppCompanion.postMessage() (if injected by native wrapper)
  console.log(`[FocusLock] Native sync: ${action}`, allowedPackages);
};