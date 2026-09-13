import { getRoutineForDate } from '../data/routineData';
import { getClassWindow } from './classExamWindow';
import { showAppNotification } from './appNotify';

const SENT_KEY = 'campus6_class_reminders_sent';
const REMINDER_BEFORE_MIN = 5;

const readSent = (): Set<string> => {
  try {
    const raw = localStorage.getItem(SENT_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

const markSent = (key: string) => {
  const s = readSent();
  s.add(key);
  // Keep only today's keys (YYYY-MM-DD prefix)
  const today = new Date().toISOString().slice(0, 10);
  const filtered = Array.from(s).filter((k) => k.startsWith(today));
  localStorage.setItem(SENT_KEY, JSON.stringify([...filtered, key]));
};

/**
 * Class reminder scanner.
 *
 * Call this every 30s. It will fire ONE notification per session,
 * 5 minutes before start time, using Service Worker so tap opens the class link.
 */
export const scanClassReminders = async () => {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const today = new Date().toISOString().slice(0, 10);
    const routine = getRoutineForDate(today);
    if (!routine || routine.isRestDay || !routine.sessions?.length) return;

    const sent = readSent();

    for (const session of routine.sessions) {
      const win = getClassWindow(session, today);
      if (win.status !== 'upcoming') continue;

      const minsUntil = win.minutesUntilStart;
      if (minsUntil > REMINDER_BEFORE_MIN || minsUntil <= 0) continue;

      const key = `${today}_${session.sessionIndex}_${session.subject}`;
      if (sent.has(key)) continue;

      const title = `🎯 ${session.subject} ক্লাস ${minsUntil} মিনিটে`;
      const body = `${session.topic} — ক্লাসে যোগ দিতে tap করুন`;

      // ⭐ data.url will be handled by sw.js notificationclick → opens class link
      await showAppNotification(title, body, `#/autostart-class=${today}_${session.sessionIndex}`);
      markSent(key);
      console.log(`[ClassReminder] ✅ Sent: ${session.subject} in ${minsUntil}m`);
    }
  } catch (err) {
    console.warn('[ClassReminder] scan failed:', err);
  }
};

/**
 * Initialize periodic scan.
 * Call once from AppShell mount.
 */
export const initClassReminders = () => {
  scanClassReminders(); // immediate
  const id = setInterval(scanClassReminders, 30_000); // every 30s
  return () => clearInterval(id);
};

/**
 * Find the class link for a reminder key (date_sessionIndex).
 * Used by AppShell to open the class link when hash changes.
 */
export const findClassLinkFromKey = (key: string): string | null => {
  try {
    const parts = key.split('_');
    if (parts.length < 2) return null;
    const dateKey = parts[0];
    const sessionIdx = Number(parts[1]);

    const routine = getRoutineForDate(dateKey);
    const session = routine?.sessions?.find((s: any) => s.sessionIndex === sessionIdx);
    if (!session) return null;

    // Dynamic import to avoid circular deps — useClassLinks is a hook, so we read from localStorage cache
    const linksKey = `campus6_links_${dateKey}`;
    const raw = localStorage.getItem(linksKey);
    if (!raw) return null;

    const links = JSON.parse(raw);
    const match =
      links.find((l: any) => l.link_type === 'class' && (l.session_index === sessionIdx || l.sessionIndex === sessionIdx)) ||
      links.find((l: any) => l.link_type === 'class');

    return match?.url || null;
  } catch {
    return null;
  }
};