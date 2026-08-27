import { RoutineDay, ChecklistItem, ChecklistSectionId } from '../types';

export interface ChecklistSectionInfo {
  id: ChecklistSectionId;
  titleBn: string;
  titleEn: string;
}

export const CHECKLIST_SECTIONS_ORDER: ChecklistSectionInfo[] = [
  { id: 'pre_class', titleBn: '১. ক্লাস পূর্ববর্তী প্রস্তুতি (Pre-Class)', titleEn: '1. PRE-CLASS' },
  { id: 'class_time', titleBn: '২. ক্লাস চলাকালীন কাজ (Class Time)', titleEn: '2. CLASS TIME' },
  { id: 'after_class', titleBn: '৩. ক্লাসের পরপরই করণীয় (Right After Class)', titleEn: '3. RIGHT AFTER CLASS' },
  { id: 'deep_study', titleBn: '৪. গভীর অধ্যায়ন ও অনুশীলন (Deep Study)', titleEn: '4. DEEP STUDY' },
  { id: 'exam_prep', titleBn: '৫. পরীক্ষা প্রস্তুতি (Exam Preparation)', titleEn: '5. EXAM PREPARATION' },
  { id: 'revision', titleBn: '৬. রিভিশন (Revision)', titleEn: '6. REVISION' },
  { id: 'night', titleBn: '৭. রাতের শেষ পর্যালোচনা (Night Routine)', titleEn: '7. NIGHT' }
];

export function generateDefaultChecklist(routine: RoutineDay): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const dateKey = routine.dateKey;

  // A. PRE-CLASS
  items.push(
    {
      id: `${dateKey}-pre-1`,
      section: 'pre_class',
      label: 'Fajr Salah + Dua (Rabbi zidni ilma / রব্বি জিদনী ইলমা)',
      estimatedMinutes: 15,
      completed: false
    },
    {
      id: `${dateKey}-pre-2`,
      section: 'pre_class',
      label: `15-min preview: Read previous lecture notes on today's topic (${routine.topicRaw})`,
      estimatedMinutes: 15,
      completed: false
    },
    {
      id: `${dateKey}-pre-3`,
      section: 'pre_class',
      label: '10-min: Write down 3 questions you want answered in class',
      estimatedMinutes: 10,
      completed: false
    },
    {
      id: `${dateKey}-pre-4`,
      section: 'pre_class',
      label: 'Open notebook and date it',
      estimatedMinutes: 2,
      completed: false
    }
  );

  // B. CLASS TIME
  if (routine.sessions.length > 0) {
    routine.sessions.forEach((session, idx) => {
      items.push(
        {
          id: `${dateKey}-class-${idx + 1}-attend`,
          section: 'class_time',
          label: `Attend the ${session.time} class on ${session.topic}`,
          estimatedMinutes: 90,
          completed: false,
          sessionId: session.id
        },
        {
          id: `${dateKey}-class-${idx + 1}-notes`,
          section: 'class_time',
          label: `Take handwritten notes: key points only (${session.topic})`,
          estimatedMinutes: 90,
          completed: false,
          sessionId: session.id
        },
        {
          id: `${dateKey}-class-${idx + 1}-doubts`,
          section: 'class_time',
          label: `Mark 3 things you did not understand in ${session.topic}`,
          estimatedMinutes: 5,
          completed: false,
          sessionId: session.id
        }
      );
    });
  } else {
    items.push({
      id: `${dateKey}-class-self-study`,
      section: 'class_time',
      label: 'Self-guided study session on selected priority topics',
      estimatedMinutes: 60,
      completed: false
    });
  }

  // C. RIGHT AFTER CLASS
  items.push(
    {
      id: `${dateKey}-after-1`,
      section: 'after_class',
      label: 'Review and rewrite notes within 30 minutes of class ending',
      estimatedMinutes: 25,
      completed: false
    },
    {
      id: `${dateKey}-after-2`,
      section: 'after_class',
      label: 'Explain the main concept in your own words (Feynman Technique)',
      estimatedMinutes: 15,
      completed: false
    },
    {
      id: `${dateKey}-after-3`,
      section: 'after_class',
      label: `Create 5 Anki-style flashcards from today's topic (${routine.topicRaw})`,
      estimatedMinutes: 15,
      completed: false
    }
  );

  // D. DEEP STUDY
  items.push(
    {
      id: `${dateKey}-deep-1`,
      section: 'deep_study',
      label: `Read textbook/reference on today's topic for 1 hour`,
      estimatedMinutes: 60,
      completed: false
    },
    {
      id: `${dateKey}-deep-2`,
      section: 'deep_study',
      label: `Solve 10 problems or MCQs on today's topic`,
      estimatedMinutes: 30,
      completed: false
    },
    {
      id: `${dateKey}-deep-3`,
      section: 'deep_study',
      label: 'Watch 1 related educational video, maximum 20 minutes',
      estimatedMinutes: 20,
      completed: false
    },
    {
      id: `${dateKey}-deep-4`,
      section: 'deep_study',
      label: 'Write a summary in your own words',
      estimatedMinutes: 15,
      completed: false
    }
  );

  // E. EXAM PREPARATION (Only display if exam exists)
  if (routine.examTopic) {
    items.push(
      {
        id: `${dateKey}-exam-1`,
        section: 'exam_prep',
        label: `Open previous exam topic notes: ${routine.examTopic}`,
        estimatedMinutes: 15,
        completed: false
      },
      {
        id: `${dateKey}-exam-2`,
        section: 'exam_prep',
        label: `Solve 5 MCQs from previous exam topic (${routine.examTopic})`,
        estimatedMinutes: 20,
        completed: false
      },
      {
        id: `${dateKey}-exam-3`,
        section: 'exam_prep',
        label: 'Review mistakes and write corrections in error log',
        estimatedMinutes: 15,
        completed: false
      }
    );
  }

  // F. REVISION
  items.push(
    {
      id: `${dateKey}-rev-1`,
      section: 'revision',
      label: "Review yesterday's flashcards",
      estimatedMinutes: 10,
      completed: false
    },
    {
      id: `${dateKey}-rev-2`,
      section: 'revision',
      label: "Review today's new flashcards",
      estimatedMinutes: 10,
      completed: false
    },
    {
      id: `${dateKey}-rev-3`,
      section: 'revision',
      label: 'Close your eyes and recall what you learned today',
      estimatedMinutes: 10,
      completed: false
    }
  );

  // G. NIGHT
  items.push(
    {
      id: `${dateKey}-night-1`,
      section: 'night',
      label: 'Isha Salah + Dua',
      estimatedMinutes: 15,
      completed: false
    },
    {
      id: `${dateKey}-night-2`,
      section: 'night',
      label: 'Plan tomorrow & check tomorrow’s schedule',
      estimatedMinutes: 10,
      completed: false
    },
    {
      id: `${dateKey}-night-3`,
      section: 'night',
      label: 'Prepare materials and notebook for tomorrow',
      estimatedMinutes: 5,
      completed: false
    },
    {
      id: `${dateKey}-night-4`,
      section: 'night',
      label: 'Log today’s study hours & rate focus from 1 to 10',
      estimatedMinutes: 5,
      completed: false
    }
  );

  return items;
}
