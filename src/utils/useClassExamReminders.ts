/**
 * CAMPUS 6.0 — Class/Exam Reminder Engine
 * 
 * Features:
 * - প্রতি ৬০ সেকেন্ডে routine scan
 * - ১ ঘণ্টা আগে → info toast + bell notification
 * - ১০ মিনিট আগে → warning toast + bell
 * - LIVE শুরু হলে → success toast + bell + badge
 * - Browser Notification API (permission সহ)
 * - localStorage-এ "already notified" tracking
 */

import { useEffect, useRef, useCallback } from 'react';
import { ToastMessage } from '../types';
import { getRoutineForDate, getAllRoutineDays } from '../data/routineData';
import { getClassWindow, getExamWindow, isToday, isTomorrow } from './classExamWindow';

interface ReminderConfig {
  onAddToast: (type: ToastMessage['type'], message: string, title?: string) => void;
}

const NOTIFIED_KEY = 'campus6_notified_events';
const NOTIF_PERMISSION_KEY = 'campus6_notif_permission_asked';

interface NotifiedEvent {
  key: string;
  at: number; // timestamp
}

function getNotifiedEvents(): NotifiedEvent[] {
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as NotifiedEvent[];
    // ৩০ দিন পুরনো clean up
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return list.filter((e) => e.at > cutoff);
  } catch {
    return [];
  }
}

function markNotified(key: string) {
  const list = getNotifiedEvents();
  if (list.some((e) => e.key === key)) return;
  list.push({ key, at: Date.now() });
  try { localStorage.setItem(NOTIFIED_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

function wasNotified(key: string): boolean {
  return getNotifiedEvents().some((e) => e.key === key);
}

function sendBrowserNotification(title: string, body: string) {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      const n = new Notification(title, { body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png' });
      setTimeout(() => n.close(), 8000);
    }
  } catch (err) {
    console.warn('[Reminders] Browser notification failed:', err);
  }
}

export function useClassExamReminders({ onAddToast }: ReminderConfig) {
  const intervalRef = useRef<number | null>(null);
  const lastScanRef = useRef<number>(0);

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      try {
        const alreadyAsked = localStorage.getItem(NOTIF_PERMISSION_KEY) === 'true';
        if (alreadyAsked) return;
        const result = await Notification.requestPermission();
        localStorage.setItem(NOTIF_PERMISSION_KEY, 'true');
        if (result === 'granted') {
          onAddToast('success', 'Notification চালু হয়েছে! Class/Exam reminder পাবেন।', 'Notifications Enabled');
        }
      } catch (err) {
        console.warn('[Reminders] Permission request failed:', err);
      }
    }
  }, [onAddToast]);

  const scan = useCallback(() => {
    // প্রতি মিনিটে ১ বার এর বেশি না
    if (Date.now() - lastScanRef.current < 55_000) return;
    lastScanRef.current = Date.now();

    try {
      const allDays = getAllRoutineDays();
      const now = new Date();
      const todayKey = now.toISOString().split('T')[0];

      // আজ + আগামীকাল scan করি
      const daysToScan = allDays.filter((d) => isToday(d.dateKey, now) || isTomorrow(d.dateKey, now));

      for (const day of daysToScan) {
        // ── Class sessions ──
        for (const session of day.sessions) {
          const win = getClassWindow(session, day.dateKey);
          const sessionKey = `${day.dateKey}-session-${session.id}`;
          const minsLeft = win.minutesUntilStart;

          // ১ ঘণ্টা আগে (60-59 মিনিট বাকি)
          if (minsLeft <= 60 && minsLeft > 55 && !wasNotified(`${sessionKey}-1h`)) {
            markNotified(`${sessionKey}-1h`);
            onAddToast('info', `${session.topic} ক্লাস ১ ঘণ্টা পরে শুরু হচ্ছে!`, 'Class Reminder');
            sendBrowserNotification('CAMPUS 6.0 — Class in 1 hour', `${session.topic} (${session.subject})`);
          }

          // ১০ মিনিট আগে
          if (minsLeft <= 10 && minsLeft > 5 && !wasNotified(`${sessionKey}-10m`)) {
            markNotified(`${sessionKey}-10m`);
            onAddToast('warning', `${session.topic} ক্লাস ১০ মিনিট পরে! প্রস্তুত হও।`, 'Class Starting Soon');
            sendBrowserNotification('CAMPUS 6.0 — Class in 10 minutes!', `${session.topic} — এখনই প্রস্তুতি নাও`);
          }

          // LIVE শুরু
          if (win.status === 'live' && !wasNotified(`${sessionKey}-live`)) {
            markNotified(`${sessionKey}-live`);
            onAddToast('success', `🔴 ${session.topic} ক্লাস এখন LIVE!`, 'Class Started');
            sendBrowserNotification('CAMPUS 6.0 — Class LIVE NOW', `${session.topic} শুরু হয়ে গেছে!`);
          }
        }

        // ── Exam ──
        if (day.examTopic) {
          const win = getExamWindow(day.examTopic, day.dateKey);
          const examKey = `${day.dateKey}-exam`;
          const hoursLeft = win.hoursUntilStart;

          // ১ দিন আগে
          if (hoursLeft <= 24 && hoursLeft > 23 && !wasNotified(`${examKey}-1d`)) {
            markNotified(`${examKey}-1d`);
            onAddToast('info', `আগামীকাল ${day.examTopic} পরীক্ষা! আজ রাতে ভালো করে revise করো।`, 'Exam Tomorrow');
            sendBrowserNotification('CAMPUS 6.0 — Exam Tomorrow', `${day.examTopic}`);
          }

          // ৩ ঘণ্টা আগে
          if (hoursLeft <= 3 && hoursLeft > 2.5 && !wasNotified(`${examKey}-3h`)) {
            markNotified(`${examKey}-3h`);
            onAddToast('warning', `${day.examTopic} পরীক্ষা ৩ ঘণ্টা পরে!`, 'Exam Reminder');
            sendBrowserNotification('CAMPUS 6.0 — Exam in 3 hours', `${day.examTopic}`);
          }

          // ৩০ মিনিট আগে
          if (hoursLeft <= 0.5 && hoursLeft > 0.3 && !wasNotified(`${examKey}-30m`)) {
            markNotified(`${examKey}-30m`);
            onAddToast('warning', `${day.examTopic} পরীক্ষা ৩০ মিনিট পরে! Final preparation নাও।`, 'Exam Starting Soon');
            sendBrowserNotification('CAMPUS 6.0 — Exam in 30 minutes!', `${day.examTopic} — Final prep!`);
          }

          // LIVE শুরু
          if (win.status === 'live' && !wasNotified(`${examKey}-live`)) {
            markNotified(`${examKey}-live`);
            onAddToast('success', `🔴 ${day.examTopic} পরীক্ষা এখন চলছে!`, 'Exam LIVE');
            sendBrowserNotification('CAMPUS 6.0 — Exam LIVE NOW', `${day.examTopic} — পরীক্ষা চলছে!`);
          }
        }
      }
    } catch (err) {
      console.warn('[Reminders] Scan error:', err);
    }
  }, [onAddToast]);

  useEffect(() => {
    // প্রথমবার permission চাই (একটু delay দিয়ে — যাতে app load হয়ে যায়)
    const permTimeout = window.setTimeout(() => requestNotificationPermission(), 5000);

    // Initial scan
    scan();

    // প্রতি ৬০ সেকেন্ডে scan
    intervalRef.current = window.setInterval(scan, 60_000);

    // Tab focus-এ re-scan (user যখন app-এ ফিরে আসে)
    const onFocus = () => scan();
    window.addEventListener('focus', onFocus);

    return () => {
      window.clearTimeout(permTimeout);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      window.removeEventListener('focus', onFocus);
    };
  }, [scan, requestNotificationPermission]);
}