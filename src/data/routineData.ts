import { RoutineDay, ClassSession } from '../types';
import { detectSubject } from '../utils/subjectDetector';

export const ROUTINE_YEAR = 2026;

interface RawRoutineEntry {
  monthDay: string; // e.g. "Aug 21" or "Sep 1" or "Oct 5"
  topicRaw: string;
  timeRaw: string;
  examRaw: string;
}

const MASTER_ROUTINE_RAW: RawRoutineEntry[] = [
  { monthDay: "Aug 21", topicRaw: "ভেক্টর-১", timeRaw: "9PM", examRaw: "None" },
  { monthDay: "Aug 22", topicRaw: "ভেক্টর-২", timeRaw: "9PM", examRaw: "None" },
  { monthDay: "Aug 23", topicRaw: "পরিমাণগত রসায়ন-১", timeRaw: "9PM", examRaw: "Noun/Pronoun/Determiner" },
  { monthDay: "Aug 24", topicRaw: "পরিমাণগত রসায়ন-২", timeRaw: "9PM", examRaw: "ভেক্টর" },
  { monthDay: "Aug 25", topicRaw: "পরিমাণগত রসায়ন-৩ + উদ্ভিদের প্রজনন", timeRaw: "3PM+9PM", examRaw: "None" },
  { monthDay: "Aug 26", topicRaw: "পরিমাণগত রসায়ন-৪", timeRaw: "9PM", examRaw: "Parts of Speech" },
  { monthDay: "Aug 27", topicRaw: "সরলরেখা-১", timeRaw: "9PM", examRaw: "উদ্ভিদের প্রজনন" },
  { monthDay: "Aug 28", topicRaw: "সরলরেখা-২", timeRaw: "9PM", examRaw: "পরিমাণগত রসায়ন" },
  { monthDay: "Aug 29", topicRaw: "গতিবিদ্যা-১ + টিস্যু ও টিস্যুতন্ত্র", timeRaw: "3PM+9PM", examRaw: "Number/Gender/Conditional" },
  { monthDay: "Aug 30", topicRaw: "শ্বসন ও শ্বাসক্রিয়া + গতিবিদ্যা-২", timeRaw: "3PM+9PM", examRaw: "সরলরেখা" },
  { monthDay: "Aug 31", topicRaw: "বৃত্ত-১", timeRaw: "9PM", examRaw: "গতিবিদ্যা" },
  { monthDay: "Sep 1", topicRaw: "রাসায়নিক পরিবর্তন-১ + বৃত্ত-২", timeRaw: "3PM+9PM", examRaw: "টিস্যু+শ্বসন" },
  { monthDay: "Sep 2", topicRaw: "রাসায়নিক পরিবর্তন-২", timeRaw: "9PM", examRaw: "Weekly Revision (Aug 23-Sep 1)" },
  { monthDay: "Sep 3", topicRaw: "রাসায়নিক পরিবর্তন-৩ + রক্ত ও সঞ্চালন", timeRaw: "3PM+9PM", examRaw: "বৃত্ত" },
  { monthDay: "Sep 4", topicRaw: "রাসায়নিক পরিবর্তন-৪", timeRaw: "9PM", examRaw: "রক্ত ও সঞ্চালন" },
  { monthDay: "Sep 5", topicRaw: "জটিল সংখ্যা-১", timeRaw: "9PM", examRaw: "Voice+Narration" },
  { monthDay: "Sep 6", topicRaw: "জটিল সংখ্যা-২", timeRaw: "9PM", examRaw: "রাসায়নিক পরিবর্তন" },
  { monthDay: "Sep 7", topicRaw: "নিউটনিয়ান বলবিদ্যা-১", timeRaw: "9PM", examRaw: "None" },
  { monthDay: "Sep 8", topicRaw: "নিউটনিয়ান বলবিদ্যা-২ + উদ্ভিদের শারীরতত্ত্ব-১", timeRaw: "3PM+9PM", examRaw: "জটিল সংখ্যা" },
  { monthDay: "Sep 9", topicRaw: "উদ্ভিদের শারীরতত্ত্ব-২", timeRaw: "9PM", examRaw: "None" },
  { monthDay: "Sep 10", topicRaw: "প্রাণীর পরিচিতি (হাইড্রা+রুইমাছ)", timeRaw: "9PM", examRaw: "নিউটনিয়ান বলবিদ্যা" },
  { monthDay: "Sep 11", topicRaw: "প্রাণীর পরিচিতি (ঘাসফড়িং) + গুণগত রসায়ন-১", timeRaw: "3PM+9PM", examRaw: "উদ্ভিদের শারীরতত্ত্ব" },
  { monthDay: "Sep 12", topicRaw: "গুণগত রসায়ন-২", timeRaw: "9PM", examRaw: "প্রাণীর পরিচিতি" },
  { monthDay: "Sep 13", topicRaw: "গুণগত রসায়ন-৩", timeRaw: "9PM", examRaw: "Weekly Revision (Sep 3-12)" },
  { monthDay: "Sep 14", topicRaw: "কাজ, শক্তি ও ক্ষমতা-১", timeRaw: "9PM", examRaw: "Sentence+Phrase/Clause" },
  { monthDay: "Sep 15", topicRaw: "কাজ, শক্তি ও ক্ষমতা-২ + কনিকস-১", timeRaw: "3PM+9PM", examRaw: "None" },
  { monthDay: "Sep 16", topicRaw: "মহাকর্ষ ও অভিকর্ষ-১ + কনিকস-২", timeRaw: "3PM+9PM", examRaw: "গুণগত রসায়ন" },
  { monthDay: "Sep 17", topicRaw: "মহাকর্ষ ও অভিকর্ষ-২ + জীনতত্ত্ব ও বিবর্তন", timeRaw: "3PM+9PM", examRaw: "কাজ/শক্তি/ক্ষমতা" },
  { monthDay: "Sep 18", topicRaw: "কোষ রসায়ন", timeRaw: "9PM", examRaw: "কনিকস" },
  { monthDay: "Sep 19", topicRaw: "ল্যাবরেটরির নিরাপদ ব্যবহার", timeRaw: "9PM", examRaw: "মহাকর্ষ ও অভিকর্ষ" },
  { monthDay: "Sep 20", topicRaw: "মানবদেহের প্রতিরক্ষা", timeRaw: "9PM", examRaw: "ল্যাবরেটরির নিরাপদ ব্যবহার" },
  { monthDay: "Sep 21", topicRaw: "মৌলের পর্যায়বৃত্ত ধর্ম-১", timeRaw: "9PM", examRaw: "কোষ রসায়ন" },
  { monthDay: "Sep 22", topicRaw: "মৌলের পর্যায়বৃত্ত ধর্ম-২ + প্রাণীর বিভিন্নতা", timeRaw: "3PM+9PM", examRaw: "জীনতত্ত্ব+মানবদেহ" },
  { monthDay: "Sep 23", topicRaw: "মৌলের পর্যায়বৃত্ত ধর্ম-৩ + বিন্যাস", timeRaw: "3PM+9PM", examRaw: "Verb+Subject Verb Agreement" },
  { monthDay: "Sep 24", topicRaw: "মৌলের পর্যায়বৃত্ত ধর্ম-৪ + সমাবেশ", timeRaw: "3PM+9PM", examRaw: "প্রাণীর বিভিন্নতা" },
  { monthDay: "Sep 25", topicRaw: "পদার্থের গাঠনিক ধর্ম", timeRaw: "9PM", examRaw: "Weekly Revision (Sep 14-24)" },
  { monthDay: "Sep 26", topicRaw: "কর্মমুখী রসায়ন + আদর্শ গ্যাস", timeRaw: "3PM+9PM", examRaw: "মৌলের পর্যায়বৃত্ত ধর্ম" },
  { monthDay: "Sep 27", topicRaw: "নগ্নবীজী ও আবৃতবীজী + বিস্তার/পরিমাপ/সম্ভাবনা-১", timeRaw: "3PM+9PM", examRaw: "বিন্যাস+সমাবেশ" },
  { monthDay: "Sep 28", topicRaw: "বিস্তার/পরিমাপ/সম্ভাবনা-২", timeRaw: "9PM", examRaw: "আদর্শ গ্যাস+পদার্থের গাঠনিক ধর্ম" },
  { monthDay: "Sep 29", topicRaw: "তড়িৎ রসায়ন-১", timeRaw: "9PM", examRaw: "কর্মমুখী রসায়ন" },
  { monthDay: "Sep 30", topicRaw: "তড়িৎ রসায়ন-২ + পর্যায়বৃত্ত গতি-১", timeRaw: "3PM+9PM", examRaw: "বিস্তার/পরিমাপ/সম্ভাবনা" },
  { monthDay: "Oct 1", topicRaw: "পর্যায়বৃত্ত গতি-২", timeRaw: "9PM", examRaw: "নগ্নবীজী ও আবৃতবীজী" },
  { monthDay: "Oct 2", topicRaw: "বহুপদী-১", timeRaw: "9PM", examRaw: "পর্যায়বৃত্ত গতি" },
  { monthDay: "Oct 3", topicRaw: "বহুপদী-২", timeRaw: "9PM", examRaw: "তড়িৎ রসায়ন" },
  { monthDay: "Oct 4", topicRaw: "তরঙ্গ", timeRaw: "9PM", examRaw: "বহুপদী" },
  { monthDay: "Oct 5", topicRaw: "দ্বিপদী বিস্তৃতি", timeRaw: "9PM", examRaw: "তরঙ্গ" }
];

const MONTH_MAP: Record<string, string> = {
  Aug: "08",
  Sep: "09",
  Oct: "10"
};

function formatMonthDayToDateKey(monthDay: string, year = ROUTINE_YEAR): string {
  const parts = monthDay.split(" ");
  if (parts.length < 2) return `${year}-08-21`;
  const mStr = MONTH_MAP[parts[0]] || "08";
  const dNum = parseInt(parts[1], 10);
  const dStr = dNum < 10 ? `0${dNum}` : `${dNum}`;
  return `${year}-${mStr}-${dStr}`;
}

export function parseRoutineDay(entry: RawRoutineEntry, year = ROUTINE_YEAR): RoutineDay {
  const dateKey = formatMonthDayToDateKey(entry.monthDay, year);
  
  // Parse topics and times into individual sessions
  const topicParts = entry.topicRaw.split(/\s*\+\s*/).map(t => t.trim()).filter(Boolean);
  const timeParts = entry.timeRaw.split(/\s*\+\s*/).map(t => t.trim()).filter(Boolean);

  const sessions: ClassSession[] = topicParts.map((tp, idx) => {
    const time = timeParts[idx] || timeParts[0] || "9PM";
    const subject = detectSubject(tp);
    return {
      id: `${dateKey}-session-${idx + 1}`,
      topic: tp,
      subject,
      time,
      sessionIndex: idx + 1
    };
  });

  const examTopic = entry.examRaw && entry.examRaw.toLowerCase() !== "none" ? entry.examRaw : undefined;

  return {
    dateKey,
    monthDay: entry.monthDay,
    topicRaw: entry.topicRaw,
    timeRaw: entry.timeRaw,
    examRaw: entry.examRaw,
    sessions,
    examTopic,
    isRestDay: false
  };
}

// Build the map of parsed routine days
export const MASTER_ROUTINE_MAP: Record<string, RoutineDay> = {};

MASTER_ROUTINE_RAW.forEach(entry => {
  const parsed = parseRoutineDay(entry);
  MASTER_ROUTINE_MAP[parsed.dateKey] = parsed;
});

export function getRoutineForDate(dateKey: string): RoutineDay {
  if (MASTER_ROUTINE_MAP[dateKey]) {
    return MASTER_ROUTINE_MAP[dateKey];
  }

  // Format month and day for fallback display
  const [y, m, d] = dateKey.split('-');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mIndex = parseInt(m, 10) - 1;
  const monthStr = monthNames[mIndex] || "Day";
  const dayNum = parseInt(d, 10) || 1;

  return {
    dateKey,
    monthDay: `${monthStr} ${dayNum}`,
    topicRaw: "Rest & Custom Self-Study Day",
    timeRaw: "Flexible",
    examRaw: "None",
    sessions: [],
    isRestDay: true
  };
}

export function getAllRoutineDays(): RoutineDay[] {
  return Object.values(MASTER_ROUTINE_MAP);
}

export const ALL_ROUTINE_DATES: string[] = Object.keys(MASTER_ROUTINE_MAP).sort();

