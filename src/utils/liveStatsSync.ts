/**
 * DEPRECATED — study time এখন একটাই pipeline লেখে:
 * TimerContext → db.ts chunk commit → users.total_study_time
 * Double-write এড়াতে এই listener নিষ্ক্রিয়।
 */
export const initLiveStatsSync = () => {
  console.log('[LiveStats] disabled — single-writer pipeline active');
};