/** Persist dismissed exams locally so completed exam cards stay hidden after refresh. */
const KEY = 'campus6_dismissed_exams';
const MAX_AGE_MS = 48 * 60 * 60 * 1000;

interface DismissedEntry {
  key: string;
  dismissedAt: number;
}

const read = (): DismissedEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
};

const write = (list: DismissedEntry[]) => {
  localStorage.setItem(KEY, JSON.stringify(list));
};

const freshEntries = (): DismissedEntry[] => {
  const list = read();
  const fresh = list.filter((entry) => Date.now() - entry.dismissedAt < MAX_AGE_MS);
  if (fresh.length !== list.length) write(fresh);
  return fresh;
};

export const isDismissed = (dateKey: string, examTopic: string): boolean =>
  freshEntries().some((entry) => entry.key === `${dateKey}__${examTopic}`);

export const dismissExam = (dateKey: string, examTopic: string) => {
  const key = `${dateKey}__${examTopic}`;
  const list = freshEntries().filter((entry) => entry.key !== key);
  list.push({ key, dismissedAt: Date.now() });
  write(list);
  window.dispatchEvent(new CustomEvent('campus6:exam-dismissed'));
};

export const recentDateKeys = (currentDateKey: string): string[] => {
  const [year, month, day] = currentDateKey.split('-').map(Number);
  const keys: string[] = [];
  for (let offset = -2; offset <= 1; offset += 1) {
    const date = new Date(year, month - 1, day + offset);
    keys.push(date.toISOString().split('T')[0]);
  }
  return keys;
};
