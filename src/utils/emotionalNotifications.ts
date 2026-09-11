/**
 * CAMPUS 6.0 — Emotional / Duolingo-style notifications
 */

export interface EmotionalNote {
  emoji: string;
  title: string;
  body: string;
  tone: 'love' | 'fire' | 'calm';
}

const LAST_ACTIVE = 'campus6_last_active';

const COMEBACK: EmotionalNote[] = [
  { emoji: '🥺', tone: 'love', title: 'আমরা তোমাকে মিস করেছি!', body: '২ দিন ধরে দেখা নেই। তোমার স্ট্রিক আর স্বপ্ন—দুটোই তোমার অপেক্ষায়।' },
  { emoji: '💭', tone: 'love', title: 'তোমার পড়ার টেবিল খালি ছিল', body: 'আজ একটা ২ মিনিটের Start Mode দিয়ে আবার শুরু করো? আমরা আছি তোমার সাথে।' },
  { emoji: '🌱', tone: 'calm', title: 'ফিরে আসাই আসল জয়', body: 'Break নেওয়া ভুল না। কিন্তু ফিরে আসাটা সাহসের কাজ। আজ একটু পড়ো?' },
];

const STREAK_RISK: EmotionalNote[] = [
  { emoji: '🔥', tone: 'fire', title: 'স্ট্রিক বিপদে!', body: 'আজ এখনো পড়া হয়নি। মাত্র ১০ মিনিট পড়লেই স্ট্রিক বেঁচে যাবে!' },
  { emoji: '⏳', tone: 'fire', title: 'রাত নামছে...', body: 'আজকের টার্গেট বাকি। ২ মিনিট দিয়ে শুরু করলেই হবে!' },
];

export const markActive = () => {
  try {
    localStorage.setItem(LAST_ACTIVE, new Date().toISOString());
  } catch {}
};

export const getEmotionalNote = (): EmotionalNote | null => {
  try {
    const now = new Date();
    const todayKey = now.toISOString().split('T')[0];
    const shownKey = `campus6_emotional_${todayKey}`;
    if (localStorage.getItem(shownKey)) return null;

    let note: EmotionalNote | null = null;
    const last = localStorage.getItem(LAST_ACTIVE);

    if (last) {
      const days = (now.getTime() - new Date(last).getTime()) / 86400000;
      if (days >= 2) note = COMEBACK[Math.floor(Math.random() * COMEBACK.length)];
    }
    if (!note && now.getHours() >= 20) {
      note = STREAK_RISK[Math.floor(Math.random() * STREAK_RISK.length)];
    }

    if (note) localStorage.setItem(shownKey, '1');
    return note;
  } catch {
    return null;
  }
};