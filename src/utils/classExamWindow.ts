/**
 * CAMPUS 6.0 — Class/Exam Window Calculator
 * 
 * Rules:
 * - Class: session.time অনুযায়ী (3PM = 15:00, 9PM = 21:00)
 * - Exam: dateKey-এর রাত ৮টা → পরের দিন রাত ৮টা (24-hour window)
 * 
 * Status:
 * - 'upcoming' → start এর আগে (countdown দেখাবে)
 * - 'live' → চলছে এখন
 * - 'ended' → শেষ হয়ে গেছে (আর দেখাবে না / archived)
 */

import { ClassSession } from '../types';

export type EventStatus = 'upcoming' | 'live' | 'ended';

export interface EventWindow {
  status: EventStatus;
  startTime: Date;
  endTime: Date;
  hoursUntilStart: number;
  hoursRemaining: number;
  minutesUntilStart: number;
  minutesRemaining: number;
  /** User-friendly label */
  label: string;
  /** Countdown label */
  countdown: string;
}

/** Parse "3PM" / "9PM" / "10AM" → hour (0-23) */
function parseTimeToHour(timeStr: string): number {
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/^(\d{1,2})(AM|PM)$/);
  if (!match) return 21; // fallback = 9PM
  let hour = parseInt(match[1], 10);
  const mer = match[2];
  if (mer === 'PM' && hour !== 12) hour += 12;
  if (mer === 'AM' && hour === 12) hour = 0;
  return hour;
}

/** dateKey (YYYY-MM-DD) + hour → Date */
function makeDateTime(dateKey: string, hour: number, minutes = 0): Date {
  return new Date(`${dateKey}T${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
}

/**
 * Class/Session window — ১ ঘণ্টা duration ধরি
 */
export function getClassWindow(session: ClassSession, dateKey: string): EventWindow {
  const hour = parseTimeToHour(session.time || '9PM');
  const start = makeDateTime(dateKey, hour);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour session
  const now = new Date();
  const msToStart = start.getTime() - now.getTime();
  const msToEnd = end.getTime() - now.getTime();

  const hoursUntilStart = msToStart / (1000 * 60 * 60);
  const minutesUntilStart = msToStart / (1000 * 60);
  const hoursRemaining = msToEnd / (1000 * 60 * 60);
  const minutesRemaining = msToEnd / (1000 * 60);

  let status: EventStatus;
  let label: string;
  let countdown: string;

  if (now < start) {
    status = 'upcoming';
    if (hoursUntilStart < 1) {
      label = 'শীঘ্রই শুরু';
      countdown = `${Math.max(1, Math.round(minutesUntilStart))} মিনিট বাকি`;
    } else if (hoursUntilStart < 24) {
      label = 'আজকের ক্লাস';
      countdown = `${Math.round(hoursUntilStart)} ঘণ্টা বাকি`;
    } else {
      label = 'আসন্ন ক্লাস';
      countdown = `${Math.round(hoursUntilStart / 24)} দিন বাকি`;
    }
  } else if (now < end) {
    status = 'live';
    label = '🔴 LIVE';
    countdown = `${Math.max(1, Math.round(minutesRemaining))} মিনিট বাকি`;
  } else {
    status = 'ended';
    label = 'সম্পন্ন';
    countdown = '';
  }

  return {
    status, startTime: start, endTime: end,
    hoursUntilStart, hoursRemaining, minutesUntilStart, minutesRemaining,
    label, countdown,
  };
}

/**
 * Exam window — dateKey-এর রাত ৮টা → পরের দিন রাত ৮টা (24-hour window)
 * 
 * Example: Sep 10 exam = Sep 10 20:00 → Sep 11 20:00
 */
export function getExamWindow(examTopic: string, dateKey: string): EventWindow {
  const start = makeDateTime(dateKey, 20, 0); // 8 PM
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000); // next day 8 PM
  const now = new Date();
  const msToStart = start.getTime() - now.getTime();
  const msToEnd = end.getTime() - now.getTime();

  const hoursUntilStart = msToStart / (1000 * 60 * 60);
  const minutesUntilStart = msToStart / (1000 * 60);
  const hoursRemaining = msToEnd / (1000 * 60 * 60);
  const minutesRemaining = msToEnd / (1000 * 60);

  let status: EventStatus;
  let label: string;
  let countdown: string;

  if (now < start) {
    status = 'upcoming';
    if (hoursUntilStart < 1) {
      label = 'শীঘ্রই পরীক্ষা';
      countdown = `${Math.max(1, Math.round(minutesUntilStart))} মিনিট বাকি`;
    } else if (hoursUntilStart < 12) {
      label = 'আজ রাত ৮টায় পরীক্ষা';
      countdown = `${Math.round(hoursUntilStart)} ঘণ্টা বাকি`;
    } else if (hoursUntilStart < 24) {
      label = 'আজকের পরীক্ষা';
      countdown = `${Math.round(hoursUntilStart)} ঘণ্টা বাকি`;
    } else {
      const days = Math.ceil(hoursUntilStart / 24);
      label = 'আসন্ন পরীক্ষা';
      countdown = `${days} দিন বাকি`;
    }
  } else if (now < end) {
    status = 'live';
    label = '🔴 পরীক্ষা চলছে';
    const hrs = Math.floor(hoursRemaining);
    countdown = hrs > 0 ? `${hrs} ঘণ্টা বাকি` : `${Math.round(minutesRemaining)} মিনিট বাকি`;
  } else {
    status = 'ended';
    label = 'পরীক্ষা সম্পন্ন';
    countdown = '';
  }

  return {
    status, startTime: start, endTime: end,
    hoursUntilStart, hoursRemaining, minutesUntilStart, minutesRemaining,
    label, countdown,
  };
}

/**
 * Check if a dateKey is "today" (same calendar day)
 */
export function isToday(dateKey: string, now = new Date()): boolean {
  const todayKey = now.toISOString().split('T')[0];
  return dateKey === todayKey;
}

/**
 * Check if a dateKey is "tomorrow"
 */
export function isTomorrow(dateKey: string, now = new Date()): boolean {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = tomorrow.toISOString().split('T')[0];
  return dateKey === tomorrowKey;
}