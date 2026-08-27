import React from 'react';
import { UserProfile, DailyProgress, ClassSession } from '../types';
import { getRoutineForDate } from '../data/routineData';
import { calculateStreak } from '../utils/storageEngine';
import { ProgressRing } from '../components/ProgressRing';
import { StreakCard } from '../components/StreakCard';
import { ExamCard } from '../components/ExamCard';
import { DailyRoutineCard } from '../components/DailyRoutineCard';
import { 
  Swords, 
  Clock, 
  Calendar, 
  Zap, 
  PlusCircle, 
  BarChart2, 
  Share2, 
  BookOpen, 
  ArrowRight,
  Flame
} from 'lucide-react';

interface DashboardViewProps {
  profile: UserProfile;
  todayKey: string;
  todayProgress: DailyProgress;
  onNavigate: (page: any) => void;
  onStartTimerWithSession: (session: ClassSession) => void;
  onOpenShareModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  todayKey,
  todayProgress,
  onNavigate,
  onStartTimerWithSession,
  onOpenShareModal
}) => {
  const routine = getRoutineForDate(todayKey);
  const streak = calculateStreak(todayKey);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Welcome Banner */}
      <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm text-text-primary shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-gold/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-gold">
              <Swords className="w-4 h-4" />
              <span className="text-xs font-bold ">
                স্বাগতম, {profile.nickname || 'শিক্ষার্থী'}!
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-text-primary leading-tight">
              আজকের এডমিশন মিশন প্রস্তুত
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              লক্ষ্য: {profile.targetUniversity} | গ্রুপ: {profile.academicGroup}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('daily_plan')}
              className="px-4 py-2.5 rounded-xl bg-gold hover:bg-[#b88e22] text-[#0F111A] text-xs font-extrabold shadow-lg transition-all flex items-center gap-1.5 min-h-[44px]"
            >
              <Calendar className="w-4 h-4" />
              আজকের প্ল্যান ওপেন করুন
            </button>
            <button
              onClick={onOpenShareModal}
              className="p-2.5 rounded-xl bg-surface-muted hover:bg-surface-muted border border-border-strong text-text-primary text-xs font-bold transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Share Progress"
            >
              <Share2 className="w-4 h-4 text-gold" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Overview Stats, Progress Ring, Streak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Ring Card */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-lg flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-text-secondary">
              আজকের কাজ সম্পন্ন
            </h3>
            <p className="text-2xl font-black text-text-primary font-mono mt-1">
              {todayProgress.completedCount} / {todayProgress.totalCount}
            </p>
            <p className="text-[11px] text-text-muted mt-1">
              {todayProgress.completionPercent >= 70
                ? '🎉 ৭০% এর বেশি সম্পন্ন! স্ট্রিক সুরক্ষিত।'
                : `আর ${Math.max(0, Math.ceil(todayProgress.totalCount * 0.7) - todayProgress.completedCount)} টি কাজ বাকি ৭০% স্ট্রিকের জন্য।`}
            </p>
          </div>

          <ProgressRing
            percent={todayProgress.completionPercent}
            size={100}
            strokeWidth={8}
            primaryColor="var(--color-gold)"
            secondaryColor="var(--color-surface-muted)"
            label="কাজ"
          />
        </div>

        {/* Streak Tracker Card */}
        <StreakCard streak={streak} />

        {/* Quick Stats: Study Hours */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold  text-text-secondary">
              পড়ার ঘণ্টা ও টার্গেট
            </span>
            <Clock className="w-4 h-4 text-gold" />
          </div>

          <div className="my-2">
            <p className="text-3xl font-black text-text-primary font-mono">
              {todayProgress.studyHours}h <span className="text-xs font-normal text-text-muted">/ {profile.dailyStudyTargetHours}h target</span>
            </p>
            <div className="w-full bg-surface-muted rounded-full h-2 mt-2 overflow-hidden border border-border">
              <div
                className="bg-gold h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((todayProgress.studyHours / (profile.dailyStudyTargetHours || 8)) * 100))}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-text-muted">
            ফোকাস রেটিং: <span className="font-bold text-gold">{todayProgress.focusRating || 8}/10</span>
          </p>
        </div>
      </div>

      {/* Routine & Exam Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <DailyRoutineCard
            routine={routine}
            onStartFocusTimer={(session) => {
              onStartTimerWithSession(session);
              onNavigate('focus_timer');
            }}
          />

          {routine.examTopic && (
            <ExamCard
              examTopic={routine.examTopic}
              onOpenExamPrep={() => onNavigate('daily_plan')}
            />
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-lg space-y-3">
          <h3 className="text-xs font-bold text-text-secondary pb-2 border-b border-border flex items-center gap-2">
            <Zap className="w-4 h-4 text-gold" />
            দ্রুত অ্যাকশনসমূহ (Quick Actions)
          </h3>

          <div className="space-y-2">
            <button
              onClick={() => onNavigate('focus_timer')}
              className="w-full p-3 rounded-xl bg-focus-soft hover:bg-focus border border-focus text-focus text-xs font-bold flex items-center justify-between transition-all min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold" />
                ২ মিনিটের Start Mode চালু করুন
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('daily_plan')}
              className="w-full p-3 rounded-xl bg-surface-muted hover:bg-surface-hover border border-border text-text-primary text-xs font-bold flex items-center justify-between transition-all min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-gold" />
                ব্যক্তিগত Task যোগ করুন
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('weekly_progress')}
              className="w-full p-3 rounded-xl bg-surface-muted hover:bg-surface-hover border border-border text-text-primary text-xs font-bold flex items-center justify-between transition-all min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-gold" />
                সাপ্তাহিক প্রোগ্রেস চার্ট দেখুন
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('subjects')}
              className="w-full p-3 rounded-xl bg-surface-muted hover:bg-surface-hover border border-border text-text-primary text-xs font-bold flex items-center justify-between transition-all min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gold" />
                বিষয়ভিত্তিক সিলেবাস প্রোগ্রেস
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
