/**
 * CAMPUS 6.0 — Physics Hunter Personal Link
 * 
 * Student নিজের PH account-এর course page URL save করে রাখে।
 * Password কখনো store হয় না — শুধু URL।
 * Browser session login মনে রাখে → direct deep link কাজ করে।
 */

export interface PhLink {
  courseUrl: string;
  linkedAt: string;
}

const KEY = 'campus6_ph_link';

export const getPhLink = (): PhLink | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PhLink) : null;
  } catch {
    return null;
  }
};

export const savePhLink = (courseUrl: string): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ courseUrl, linkedAt: new Date().toISOString() }));
  } catch { /* noop */ }
};

export const clearPhLink = (): void => {
  try { localStorage.removeItem(KEY); } catch { /* noop */ }
};

/** PH login page — প্রথমবার setup-এর জন্য */
export const PH_LOGIN_URL = 'https://phyhunt.com/login';
/** ⭐ একটাই page-এ সব: Live Classes + Live Exams + My Courses */
export const PH_DEFAULT_URL = 'https://phyhunt.com/profile/';