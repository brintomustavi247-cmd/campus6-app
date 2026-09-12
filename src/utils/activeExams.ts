import { getRoutineForDate } from '../data/routineData';
import { getExamWindow } from './classExamWindow';
import { isDismissed, recentDateKeys } from './examDismiss';

export interface ActiveExam {
  dateKey: string;
  examTopic: string;
  status: 'upcoming' | 'live';
}

export const collectActiveExams = (currentDateKey: string): ActiveExam[] => {
  const active: ActiveExam[] = [];

  recentDateKeys(currentDateKey).forEach((dateKey) => {
    const routine = getRoutineForDate(dateKey);
    if (!routine.examTopic) return;

    routine.examTopic
      .split(/\s*\+\s*/)
      .map((topic) => topic.trim())
      .filter(Boolean)
      .forEach((examTopic) => {
        if (isDismissed(dateKey, examTopic)) return;
        const window = getExamWindow(examTopic, dateKey);
        if (window.status !== 'ended') {
          active.push({ dateKey, examTopic, status: window.status });
        }
      });
  });

  return active.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'live' ? -1 : 1;
    return a.dateKey.localeCompare(b.dateKey);
  });
};
