/**
 * CAMPUS 6.0 — Period key helpers (Asia/Dhaka stable)
 * daily: '2026-09-10' | weekly: '2026-W37' | monthly: '2026-09'
 */
export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'all';

const TZ = 'Asia/Dhaka';

/** Date parts in app timezone */
function tzParts(d: Date = new Date()): { y: number; m: number; day: number } {
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    });
    const [y, m, day] = fmt.format(d).split('-').map(Number);
    return { y, m, day };
  } catch {
    return { y: d.getFullYear(), m: d.getMonth() + 1, day: d.getDate() };
  }
}

export function dailyKey(d: Date = new Date()): string {
  const { y, m, day } = tzParts(d);
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** ISO-8601 week (Monday start) */
export function weeklyKey(d: Date = new Date()): string {
  const { y, m, day } = tzParts(d);
  const date = new Date(Date.UTC(y, m - 1, day));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function monthlyKey(d: Date = new Date()): string {
  const { y, m } = tzParts(d);
  return `${y}-${String(m).padStart(2, '0')}`;
}

export function periodKeyFor(type: PeriodType, d: Date = new Date()): string | null {
  if (type === 'daily') return dailyKey(d);
  if (type === 'weekly') return weeklyKey(d);
  if (type === 'monthly') return monthlyKey(d);
  return null;
}

export const PERIOD_LABELS: Record<PeriodType, string> = {
  daily: 'আজ (Daily)',
  weekly: 'এই সপ্তাহ (Weekly)',
  monthly: 'এই মাস (Monthly)',
  all: 'সর্বকাল (All Time)',
};