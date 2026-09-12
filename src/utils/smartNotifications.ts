/**
 * CAMPUS 6.0 — Smart Notification Engine (v2)
 * - Dedupe by id (same notification twice আসবে না)
 * - Service Worker দিয়ে phone tray-তে notification (tab background-এ থাকলেও)
 * - Live event dispatch → drawer + badge realtime update
 */

import { getRoutineForDate } from '../data/routineData';
import { getClassWindow, getExamWindow } from './classExamWindow';

export interface SmartNotification {
  id: string;
  type: 'class_reminder' | 'exam_alert' | 'streak_save' | 'motivation' | 'achievement';
  title: string;
  message: string;
  emoji: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  timestamp: number;
  read?: boolean;
}

const NOTIFICATIONS_KEY = 'campus6_smart_notifications';
const CHANGED_EVENT = 'campus6:notifications-changed';

export const getNotifications = (): SmartNotification[] => {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
  } catch {
    return [];
  }
};

/** ⭐ Dedupe by id + live event dispatch */
export const saveNotification = (notif: SmartNotification): boolean => {
  const all = getNotifications();
  if (all.some((n) => n.id === notif.id)) return false; // already exists
  all.unshift(notif);
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all.slice(0, 50)));
  } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent(CHANGED_EVENT));
  return true;
};

export const markAllAsRead = () => {
  const all = getNotifications().map((n) => ({ ...n, read: true }));
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent(CHANGED_EVENT));
};

export const getUnreadCount = (): number =>
  getNotifications().filter((n) => !n.read).length;

// ─── Generate smart notifications from routine ───
export const generateSmartNotifications = (todayKey: string): SmartNotification[] => {
  const routine = getRoutineForDate(todayKey);
  const notifications: SmartNotification[] = [];
  const now = Date.now();

  if (routine.sessions) {
    routine.sessions.forEach((session) => {
      const win = getClassWindow(session, todayKey);

      if (win.minutesUntilStart > 0 && win.minutesUntilStart <= 60) {
        notifications.push({
          id: `class_1h_${session.id}_${todayKey}`,
          type: 'class_reminder',
          title: 'Class Starting Soon!',
          message: `${session.topic} class শুরু হতে ${Math.round(win.minutesUntilStart)} মিনিট বাকি!`,
          emoji: '⏰',
          priority: 'high',
          timestamp: now,
        });
      }

      if (win.minutesUntilStart > 0 && win.minutesUntilStart <= 10) {
        notifications.push({
          id: `class_10m_${session.id}_${todayKey}`,
          type: 'class_reminder',
          title: 'Hurry Up!',
          message: `${session.topic} শুরু হতে ${Math.round(win.minutesUntilStart)} মিনিট! বই খোলো!`,
          emoji: '🔥',
          priority: 'urgent',
          timestamp: now,
        });
      }

      if (win.status === 'live') {
        notifications.push({
          id: `class_live_${session.id}_${todayKey}`,
          type: 'class_reminder',
          title: 'Class LIVE Now!',
          message: `${session.topic} class এখন চলছে — join করো!`,
          emoji: '🔴',
          priority: 'urgent',
          timestamp: now,
        });
      }
    });
  }

  if (routine.examTopic) {
    const examWin = getExamWindow(routine.examTopic, todayKey);

    if (examWin.hoursUntilStart > 0 && examWin.hoursUntilStart <= 3) {
      notifications.push({
        id: `exam_3h_${todayKey}`,
        type: 'exam_alert',
        title: 'Exam Alert!',
        message: `${routine.examTopic} exam-এ ${Math.round(examWin.hoursUntilStart)} ঘণ্টা বাকি!`,
        emoji: '⚠️',
        priority: 'high',
        timestamp: now,
      });
    }

    if (examWin.minutesUntilStart > 0 && examWin.minutesUntilStart <= 30) {
      notifications.push({
        id: `exam_30m_${todayKey}`,
        type: 'exam_alert',
        title: 'Final Prep Time!',
        message: `${routine.examTopic} exam-এ ${Math.round(examWin.minutesUntilStart)} মিনিট বাকি!`,
        emoji: '🚨',
        priority: 'urgent',
        timestamp: now,
      });
    }
  }

  return notifications;
};

// ─── Permission (call from user gesture — button click) ───
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    const permission = await Notification.requestPermission();
    window.dispatchEvent(new CustomEvent(CHANGED_EVENT));
    return permission === 'granted';
  } catch {
    return false;
  }
};

export const getNotificationPermission = (): string => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

// ─── ⭐ Send via Service Worker (phone tray-তে দেখায়, tab background-এ থাকলেও) ───
const fallbackNotification = (title: string, opts: NotificationOptions) => {
  try {
    const n = new Notification(title, opts);
    setTimeout(() => n.close(), 8000);
  } catch { /* ignore */ }
};

export const sendBrowserNotification = (title: string, body: string, icon?: string) => {
  if (typeof window === 'undefined') return;
  if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
    window.dispatchEvent(new CustomEvent('campus6:premium-notif', { detail: { title, body } }));
    return;
  }
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const opts: NotificationOptions & { vibrate?: number[] } = {
    body,
    icon: icon || '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'campus6-' + title,
    vibrate: [200, 100, 200],
  };

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((reg) => reg.showNotification(title, opts))
      .catch(() => fallbackNotification(title, opts));
  } else {
    fallbackNotification(title, opts);
  }
};