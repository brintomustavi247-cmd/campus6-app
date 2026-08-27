export type AcademicGroup = 'Science' | 'Commerce' | 'Arts';
export type PreferredLanguage = 'bn' | 'en' | 'both';
export type AppTheme = 'light' | 'dark' | 'system';

export interface UserProfile {
  uid: string;
  displayName: string;
  nickname: string;
  email?: string;
  photoURL?: string;
  avatar_url?: string;
  academicGroup: AcademicGroup;
  targetUniversity: string;
  dailyStudyTargetHours: number;
  preferredLanguage: PreferredLanguage;
  theme: AppTheme;
  religion?: string;
  reminderEnabled: boolean;
  startModeRequired: boolean;
  showReligiousReminders: boolean;
  showLeaderboard: boolean;
  soundEnabled: boolean;
  friendCode: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
  isOnboarded?: boolean;
}

export type SubjectCategory = 
  | 'Physics' 
  | 'Chemistry' 
  | 'Higher Mathematics' 
  | 'Biology' 
  | 'English' 
  | 'Bangla' 
  | 'ICT' 
  | 'Other';

export interface ClassSession {
  id: string;
  topic: string;
  subject: SubjectCategory;
  time: string; // e.g. "3PM" or "9PM"
  sessionIndex: number;
}

export interface RoutineDay {
  dateKey: string; // YYYY-MM-DD
  monthDay: string; // e.g. "Aug 21"
  topicRaw: string;
  timeRaw: string;
  examRaw: string;
  sessions: ClassSession[];
  examTopic?: string;
  isRestDay: boolean;
}

export type ChecklistSectionId = 
  | 'pre_class'
  | 'class_time'
  | 'after_class'
  | 'deep_study'
  | 'exam_prep'
  | 'revision'
  | 'night';

export interface ChecklistItem {
  id: string;
  section: ChecklistSectionId;
  label: string;
  estimatedMinutes?: number;
  completed: boolean;
  completedAt?: string;
  isCustom?: boolean;
  isPendingSync?: boolean;
  sessionId?: string;
}

export interface CustomTask {
  id: string;
  dateKey: string;
  title: string;
  subject: SubjectCategory;
  priority: 'Low' | 'Medium' | 'High';
  estimatedMinutes: number;
  note?: string;
  dueTime?: string;
  completed: boolean;
  completedAt?: string;
}

export interface DailyProgress {
  dateKey: string;
  checklist: ChecklistItem[];
  customTasks: CustomTask[];
  completedCount: number;
  totalCount: number;
  completionPercent: number;
  studyHours: number;
  focusRating: number; // 1 to 10
  notes: string;
  updatedAt: string;
  isPendingSync?: boolean;
}

export interface TimerSession {
  id: string;
  dateKey: string;
  topicName: string;
  subject: SubjectCategory;
  durationMinutes: number;
  mode: '2min' | '25min' | '5min' | '50min' | '15min' | 'custom' | 'infinity';
  completedAt: string;
  linkedChecklistItemId?: string;
}

export interface SubjectTopicProgress {
  topicName: string;
  completed: boolean;
  confidenceScore: number; // 1 to 5
  mcqsSolved: number;
  flashcardsCount: number;
  notes?: string;
  lastStudied?: string;
}

export interface SubjectStat {
  subject: SubjectCategory;
  totalRoutineTopics: number;
  completedTopicsCount: number;
  mcqsSolved: number;
  studyHours: number;
  weakTopics: string[];
  lastStudiedDate?: string;
  nextScheduledTopic?: string;
  topics: SubjectTopicProgress[];
}

export interface FriendUser {
  friendCode: string;
  displayName: string;
  nickname: string;
  targetUniversity?: string;
  streakCount: number;
  weeklyCompletionPercent: number;
  totalStudyHours: number;
  photoURL?: string;
  lastActive: string;
}

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}
