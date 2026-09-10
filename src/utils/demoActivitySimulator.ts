/**
 * CAMPUS 6.0 — Demo Activity Simulator
 * Public/demo players রা "majhe majhe" পড়বে: random study/break cycles।
 * → live badge জ্বলবে-নিভবে, time বাড়বে, rank উপর-নিচ হবে।
 * State localStorage-এ persist হয় → refresh-এর পরেও continuity থাকে।
 */

export interface SimState {
  mode: 'study' | 'break';
  until: number;        // epoch ms — কখন mode বদলাবে
  simMinutes: number;   // মোট simulated পড়ার মিনিট (all-time overlay)
  topic: string;
  lastTick: number;
}

const KEY = 'campus6_demo_sim_v1';

const TOPICS = [
  'ভেক্টর', 'পরিমাণগত রসায়ন', 'সরলরেখা', 'গতিবিদ্যা', 'জটিল সংখ্যা',
  'কোষ রসায়ন', 'বৃত্ত', 'নিউটনিয়ান বলবিদ্যা', 'English Grammar', 'মহাকর্ষ ও অভিকর্ষ',
];

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function loadAll(): Record<string, SimState> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAll(states: Record<string, SimState>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(states));
  } catch { /* ignore */ }
}

function freshState(now: number): SimState {
  const study = Math.random() < 0.4; // ৪০% chance এখন পড়ছে
  return {
    mode: study ? 'study' : 'break',
    until: now + (study ? rand(15, 45) : rand(10, 60)) * 60_000,
    simMinutes: 0,
    topic: pick(TOPICS),
    lastTick: now,
  };
}

/** Advance simulation for given player ids; returns state map */
export function simulateDemoActivity(playerIds: string[], now = Date.now()): Map<string, SimState> {
  const all = loadAll();
  const out = new Map<string, SimState>();

  for (const id of playerIds) {
    let s = all[id];
    if (!s) s = freshState(now);

    // throttle: ২০ সেকেন্ডের কম হলে skip (micro-add এড়াই)
    if (now - s.lastTick >= 20_000) {
      const elapsedMin = (now - s.lastTick) / 60_000;

      if (s.mode === 'study') {
        s.simMinutes += Math.min(elapsedMin, 5); // tick-per-cap
      }

      if (now > s.until) {
        // mode switch: study → break, break → (45% study | 55% break)
        if (s.mode === 'study') {
          s.mode = 'break';
          s.until = now + rand(10, 60) * 60_000;
        } else {
          s.mode = Math.random() < 0.45 ? 'study' : 'break';
          s.until = now + (s.mode === 'study' ? rand(15, 50) : rand(10, 60)) * 60_000;
          if (s.mode === 'study') s.topic = pick(TOPICS);
        }
      }
      s.lastTick = now;
    }

    all[id] = s;
    out.set(id, s);
  }

  saveAll(all);
  return out;
}

export interface OverlayPlayer {
  id: string;
  studyTime: number;
  xp?: number;
  isLive?: boolean;
  currentTask?: string;
  _isCurrentUser?: boolean;
}

/**
 * Player list-এর উপর simulation overlay apply করো।
 * Current user কখনো simulate হয় না (নিজের সত্যিকারের data থাকে)।
 */
export function applyDemoOverlay<T extends OverlayPlayer>(players: T[], now = Date.now()): T[] {
  const ids = players.filter((p) => !p._isCurrentUser).map((p) => p.id);
  if (ids.length === 0) return players;

  const states = simulateDemoActivity(ids, now);

  return players.map((p) => {
    if (p._isCurrentUser) return p;
    const s = states.get(p.id);
    if (!s) return p;
    const added = Math.floor(s.simMinutes);
    return {
      ...p,
      studyTime: p.studyTime + added,
      xp: (p.xp || 0) + added * 10,
      isLive: s.mode === 'study',
      currentTask: s.mode === 'study' ? s.topic : p.currentTask,
    };
  });
}