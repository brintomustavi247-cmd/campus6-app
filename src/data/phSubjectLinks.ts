/**
 * CAMPUS 6.0 — Built-in Physics Hunter Subject Links
 *
 * ⭐ সব student-এর জন্য একই link — আলাদা করে add করতে হয় না!
 * Student-এর browser-এ নিজের PH account logged in থাকলে
 * click করলেই সরাসরি subject page-এ ঢুকে যাবে।
 */

export const PH_PROFILE = 'https://www.phyhunt.com/profile/';
export const PH_EXAM_PORTAL = 'https://www.phyhunt.com/examportal/';
export const PH_LOGIN_URL = 'https://www.phyhunt.com/login';

/** Subject → PH page URL (Admin provided) */
export const PH_SUBJECT_LINKS: Record<string, string> = {
  Physics: 'https://www.phyhunt.com/course/lms-v2/dashboard/campus6pcb/#subject/0',
  Chemistry: 'https://www.phyhunt.com/course/lms-v2/dashboard/campus6pcb/#subject/3',
  Biology: 'https://www.phyhunt.com/course/lms-v2/dashboard/campus6pcb/#subject/4',
  'Higher Mathematics': 'https://www.phyhunt.com/course/lms-v2/dashboard/campus6math/#subject/0',
  Math: 'https://www.phyhunt.com/course/lms-v2/dashboard/campus6math/#subject/0',
  English: 'https://www.phyhunt.com/course/lms-v2/dashboard/campus6pcb/#subject/1',
  Bangla: 'https://www.phyhunt.com/course/lms-v2/dashboard/campus6pcb/#subject/2',
  Other: PH_PROFILE,
};

/** Quick access buttons (Dashboard-এ দেখাবে) */
export const PH_QUICK_LINKS: { label: string; emoji: string; url: string }[] = [
  { label: 'Physics', emoji: '⚛️', url: PH_SUBJECT_LINKS.Physics },
  { label: 'Chemistry', emoji: '🧪', url: PH_SUBJECT_LINKS.Chemistry },
  { label: 'Biology', emoji: '🧬', url: PH_SUBJECT_LINKS.Biology },
  { label: 'Math', emoji: '📐', url: PH_SUBJECT_LINKS['Higher Mathematics'] },
  { label: 'Exam Portal', emoji: '📝', url: PH_EXAM_PORTAL },
  { label: 'Profile', emoji: '👤', url: PH_PROFILE },
];

/** Subject অনুযায়ী built-in URL */
export const getPhSubjectUrl = (subject?: string): string | null => {
  if (!subject) return null;
  return PH_SUBJECT_LINKS[subject] || PH_PROFILE;
};

/** কোনো built-in link দেওয়া আছে কিনা */
export const hasBuiltInLinks = Object.values(PH_SUBJECT_LINKS).some((v) => !!v);