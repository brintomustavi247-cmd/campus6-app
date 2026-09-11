/**
 * CAMPUS 6.0 — Daily Study Notifications Scheduler
 *
 * Features:
 *  • দিনে ৩টা strategic notification (সকাল, দুপুর, সন্ধ্যা)
 *  • প্রতিদিন ভিন্ন tip (36 থেকে rotate)
 *  • Class/Exam reminder (already আছে)
 *  • Settings localStorage-এ save (user customize করতে পারবে)
 */

import { PREMIUM_STUDY_TIPS, type StudyTip } from './dailyTips.ts';
import { getPhLink } from './phLink';

export interface NotificationPreferences {
  enabled: boolean;
  morningTime: string;   // "07:00"
  afternoonTime: string; // "13:30"
  eveningTime: string;   // "19:00"
  classReminders: boolean;
  examReminders: boolean;
}

const PREFS_KEY = 'campus6_notif_prefs';
const LAST_SENT_KEY = 'campus6_notif_last_sent';

export const DEFAULT_PREFS: NotificationPreferences = {
  enabled: true,
  morningTime: '07:00',
  afternoonTime: '13:30',
  eveningTime: '19:00',
  classReminders: true,
  examReminders: true,
};

export const getNotifPrefs = (): NotificationPreferences => {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
};

export const saveNotifPrefs = (prefs: NotificationPreferences): void => {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  // scheduler-কে জানান — নতুন time schedule হবে
  window.dispatchEvent(new CustomEvent('campus6:notif-prefs-changed'));
};

/** দিনের slot অনুযায়ী tip pick */
const pickTipForSlot = (slot: 'morning' | 'afternoon' | 'evening'): StudyTip => {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  const doy = Math.floor((d.getTime() - start.getTime()) / 86400000);

  // slot offset: সকাল = 0, দুপুর = 12, সন্ধ্যা = 24 → ভিন্ন tip
  const offset = slot === 'morning' ? 0 : slot === 'afternoon' ? 12 : 24;
  return PREMIUM_STUDY_TIPS[(doy + offset) % PREMIUM_STUDY_TIPS.length];
};

const sendNotification = (title: string, body: string, icon: string = '/icons/icon-192.png') => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready
        .then((reg) => reg.showNotification(title, {
          body,
          icon,
          badge: icon,
          tag: `campus6-${Date.now()}`,
          requireInteraction: false,
        }))
        .catch(() => {
          new Notification(title, { body, icon, badge: icon });
        });
    } else {
      new Notification(title, { body, icon, badge: icon });
    }
  } catch (e) {
    console.warn('[Notif] send failed:', e);
  }
};

const sendSlot = (slot: 'morning' | 'afternoon' | 'evening') => {
  const tip = pickTipForSlot(slot);
  const phLink = getPhLink();

  let title = '';
  switch (slot) {
    case 'morning':
      title = `🌅 ${tip.emoji} ${tip.title}`;
      break;
    case 'afternoon':
      title = `☀️ ${tip.emoji} ${tip.title}`;
      break;
    case 'evening':
      title = `🌙 ${tip.emoji} ${tip.title}`;
      break;
  }

  const suffix = phLink ? ' — আজকের class join করো!' : '';
  sendNotification(title, tip.body + suffix);
};

let intervalId: number | null = null;

export const startScheduler = () => {
  if (intervalId !== null) window.clearInterval(intervalId);

  intervalId = window.setInterval(() => {
    const prefs = getNotifPrefs();
    if (!prefs.enabled) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const now = new Date();
    const nowHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const todayKey = now.toISOString().split('T')[0];

    // প্রতিটা slot-এর জন্য আলাদা tracking
    const lastSent = JSON.parse(localStorage.getItem(LAST_SENT_KEY) || '{}');

    const checkSlot = (slot: 'morning' | 'afternoon' | 'evening', time: string) => {
      const sentKey = `${todayKey}_${slot}`;
      if (lastSent[sentKey]) return;
      if (nowHHMM === time) {
        sendSlot(slot);
        lastSent[sentKey] = Date.now();
        localStorage.setItem(LAST_SENT_KEY, JSON.stringify(lastSent));
        console.log(`[Notif] ✅ ${slot} sent: ${time}`);
      }
    };

    checkSlot('morning', prefs.morningTime);
    checkSlot('afternoon', prefs.afternoonTime);
    checkSlot('evening', prefs.eveningTime);
  }, 30_000); // প্রতি ৩০ সেকেন্ডে check

  console.log('[Notif] 📬 Scheduler started');
};

export const stopScheduler = () => {
  if (intervalId !== null) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
};

/** Test notification (settings থেকে call হবে) */
export const sendTestNotification = () => {
  const tip = PREMIUM_STUDY_TIPS[Math.floor(Math.random() * PREMIUM_STUDY_TIPS.length)];
  sendNotification(`🧪 ${tip.emoji} ${tip.title}`, tip.body);
};