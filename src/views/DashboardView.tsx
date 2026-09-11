import React, { useMemo } from 'react';
import { UserProfile, DailyProgress, ClassSession } from '../types';
import { getRoutineForDate } from '../data/routineData';
import { calculateStreak } from '../utils/storageEngine';
import { getClassWindow } from '../utils/classExamWindow';
import { ProgressRing } from '../components/ProgressRing';
import { StreakCard } from '../components/StreakCard';
import { ExamCard } from '../components/ExamCard';
import { DailyRoutineCard } from '../components/DailyRoutineCard';
import { ProfileAvatar } from '../components/ProfileAvatar';
import {
  Clock,
  Calendar,
  Zap,
  PlusCircle,
  BarChart2,
  Share2,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  profile: UserProfile;
  todayKey: string;
  todayProgress: DailyProgress;
  onNavigate: (page: any) => void;
  onStartTimerWithSession: (session: ClassSession) => void;
  onOpenShareModal: () => void;
}

/** ⭐ Time-based greeting */
const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 5) return 'শুভ রাত্রি';
  if (h < 12) return 'সুপ্রভাত';
  if (h < 17) return 'শুভ দুপুর';
  if (h < 20) return 'শুভ সন্ধ্যা';
  return 'শুভ রাত্রি';
};

/** ⭐ Rotating daily tips */
const TIPS = [
  'পোমোডোরো টেকনিক: ২৫ মিনিট পড়ো → ৫ মিনিট ব্রেক। মস্তিষ্ক সতেজ থাকে, মনোযোগ বাড়ে।',
  'যে টপিক সবচেয়ে কঠিন লাগে — দিনের শুরুতে সেটা শেষ করো। বাকি দিন সহজ লাগবে।',
  'পড়ার পর নিজেকে প্রশ্ন করো — "আজ কী শিখলাম?" না জানলে আবার পড়ো।',
  'মোবাইল দূরে রাখো — ১টা notification = ২৩ মিনিটের মনোযোগ নষ্ট।',
  'ঘুমানোর আগে ১০ মিনিট রিভিশন — রাতে memory ৩০% বেশি consolidate হয়।',
];

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
  const streakCount = (streak as any)?.count ?? (streak as any)?.current ?? (streak as any)?.days ?? 0;

  /** ⭐ আজকের তারিখ (বাংলা) */
  const dateLabel = useMemo(() => {
    try {
      return new Date().toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long' });
    } catch {
      return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    }
  }, []);

  /** ⭐ পরবর্তী upcoming class */
  const nextSession = useMemo(
    () => routine.sessions.find((s) => getClassWindow(s, todayKey).status === 'upcoming') || null,
    [routine, todayKey]
  );
  const nextWin = nextSession ? getClassWindow(nextSession, todayKey) : null;

  const pct = todayProgress.completionPercent;
  const ringColor = pct >= 70 ? 'var(--color-success)' : pct >= 40 ? 'var(--color-gold)' : 'var(--color-primary)';
  const targetHours = profile.dailyStudyTargetHours || 8;
  const studyPct = Math.min(100, Math.round((todayProgress.studyHours / targetHours) * 100));

  /** ⭐ Target-based tasks (user যত task সেট করবে শুধু ততই) */
  const todayTasks = (todayProgress.customTasks || []).filter((t) => t.dateKey === todayKey);
  const todayTasksTotal = todayTasks.length;
  const todayTasksDone = todayTasks.filter((t) => t.completed).length;
  const taskPct = todayTasksTotal > 0 ? Math.round((todayTasksDone / todayTasksTotal) * 100) : 0;
  const tipIndex = new Date().getDate() % TIPS.length;

  /** ⭐ Colored quick actions */
  const quickActions = [
    { icon: Clock, label: '২ মিনিটের Start Mode চালু করুন', page: 'focus_timer', color: '#38BDF8', bg: 'rgba(56,189,248,0.12)', autoStart: '2min' },
    { icon: PlusCircle, label: 'ব্যক্তিগত Task যোগ করুন', page: 'daily_plan', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
    { icon: BarChart2, label: 'সাপ্তাহিক প্রোগ্রেস চার্ট দেখুন', page: 'weekly_progress', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
    { icon: BookOpen, label: 'বিষয়ভিত্তিক সিলেবাস প্রোগ্রেস', page: 'subjects', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  ];

  return (
    <div className="space-y-5 pb-12 animate-in fade-in">
           {/* ═══ HERO BANNER (mobile-compact ultra premium) ═══ */}
      <div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border shadow-2xl"
        style={{ background: 'linear-gradient(140deg, #181A23 0%, #14121C 55%, #1A1016 100%)' }}
      >
        <style>{`
          @keyframes heroFloat { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(12px,-10px) scale(1.08); } }
          @keyframes nameShine { to { background-position: 200% center; } }
          @keyframes heroLine { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
        `}</style>

        {/* rainbow line + shine */}
        <div className="absolute top-0 left-0 right-0 h-0.75 overflow-hidden">
          <div className="w-full h-full" style={{ background: 'linear-gradient(90deg, #DC143C, #FBBF24, #10B981, #35D6FF)' }} />
          <div className="absolute top-0 bottom-0 w-1/3" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)', animation: 'heroLine 4s ease-in-out infinite' }} />
        </div>

        {/* aurora blobs */}
        <div className="absolute -top-24 -left-24 w-56 sm:w-72 h-56 sm:h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(220,20,60,0.3), transparent 70%)', animation: 'heroFloat 9s ease-in-out infinite' }} />
        <div className="absolute -bottom-24 -right-24 w-56 sm:w-72 h-56 sm:h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.25), transparent 70%)', animation: 'heroFloat 11s ease-in-out infinite reverse' }} />

        {/* grid pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />

        {/* watermark */}
        <span className="absolute right-3 sm:right-4 -bottom-4 sm:-bottom-6 font-black text-[64px] sm:text-[110px] leading-none opacity-[0.05] pointer-events-none select-none" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          6.0
        </span>

        <div className="p-4 sm:p-6 relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
          {/* LEFT column */}
          <div className="min-w-0 flex-1">
            {/* avatar + greeting row */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative shrink-0">
                <div
                  className="w-12 h-12 sm:w-18 sm:h-18 rounded-full p-0.5 sm:p-0.75"
                  style={{ background: 'linear-gradient(135deg,#DC143C,#FBBF24,#35D6FF)', boxShadow: '0 0 20px rgba(251,191,36,0.3)' }}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-surface-muted border-2 border-[#0C0D12]">
                    {(profile.photoURL || profile.avatar_url) ? (
                      <img
                        src={(profile.photoURL || profile.avatar_url) as string}
                        alt={profile.nickname || 'Profile'}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: 'center 25%' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary to-gold text-white font-black text-base sm:text-xl">
                        {(profile.nickname || profile.displayName || 'S').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <span
                  className="absolute -bottom-1 -right-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black text-white flex items-center gap-0.5"
                  style={{ background: 'linear-gradient(135deg,#F97316,#DC143C)', boxShadow: '0 2px 10px rgba(220,20,60,0.55)' }}
                >
                  🔥 {streakCount}
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-bold text-gold bn flex items-center gap-1">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {getGreeting()},
                </p>
                <h1
                  className="text-lg sm:text-3xl font-black leading-tight truncate bn mt-0.5"
                  style={{
                    background: 'linear-gradient(90deg, #FFFFFF, #FBBF24, #FFFFFF)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    animation: 'nameShine 5s linear infinite',
                  }}
                >
                  {profile.nickname || 'শিক্ষার্থী'}
                </h1>
                <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-1.5 sm:mt-2">
                  <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-white/5 border border-white/10 text-text-secondary backdrop-blur-sm bn truncate max-w-42.5">
                    🎯 {profile.targetUniversity}
                  </span>
                  <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-white/5 border border-white/10 text-text-secondary backdrop-blur-sm bn">
                    🧬 {profile.academicGroup}
                  </span>
                </div>
              </div>
            </div>

            {/* ⭐ mobile-only info chips (glass panel-এর বদলে) */}
            <div className="flex flex-wrap gap-1.5 mt-3 lg:hidden">
              <span className="px-2 py-1 rounded-full text-[9px] font-bold bg-white/5 border border-white/10 text-text-secondary bn">
                📅 {dateLabel}
              </span>
              {nextSession && nextWin && (
                <span className="px-2 py-1 rounded-full text-[9px] font-bold border bn" style={{ background: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.35)', color: '#FBBF24' }}>
                  ⏰ ক্লাস: {nextWin.countdown}
                </span>
              )}
              {routine.examTopic && (
                <span className="px-2 py-1 rounded-full text-[9px] font-bold border bn" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.35)', color: '#F87171' }}>
                  ⚡ আজ পরীক্ষা
                </span>
              )}
            </div>

            {/* ⭐ mobile-only buttons */}
            <div className="flex gap-2 mt-3 lg:hidden">
              <button
                onClick={() => onNavigate('daily_plan')}
                className="flex-1 px-3 py-2 rounded-xl bg-gold hover:bg-[#b88e22] text-[#0F111A] text-[11px] font-extrabold shadow-lg transition-all flex items-center justify-center gap-1.5 min-h-10 hover:scale-[1.02] bn"
              >
                <Calendar className="w-3.5 h-3.5" />
                আজকের প্ল্যান
              </button>
              <button
                onClick={onOpenShareModal}
                className="p-2 rounded-xl bg-white/6 hover:bg-white/12 border border-white/10 text-text-primary transition-all min-h-10 min-w-10 flex items-center justify-center"
                title="Share Progress"
              >
                <Share2 className="w-4 h-4 text-gold" />
              </button>
            </div>
          </div>

          {/* RIGHT: glass panel — desktop only */}
          <div
            className="hidden lg:flex rounded-2xl border border-white/10 p-4 flex-col gap-2.5 min-w-65"
            style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)' }}
          >
            <div className="flex items-center gap-2 text-[11px] text-text-secondary bn">
              <Calendar className="w-3.5 h-3.5 text-gold" />
              {dateLabel}
            </div>
            <div className="flex items-center gap-2 text-[11px] bn" style={{ color: nextSession ? '#FBBF24' : '#94A3B8' }}>
              <Clock className="w-3.5 h-3.5" />
              {nextSession && nextWin ? `পরবর্তী ক্লাস: ${nextWin.countdown}` : 'আজ আর কোনো ক্লাস নেই'}
            </div>
            <div className="flex items-center gap-2 text-[11px] bn" style={{ color: routine.examTopic ? '#F87171' : '#94A3B8' }}>
              <Zap className="w-3.5 h-3.5" />
              {routine.examTopic ? `আজ পরীক্ষা: ${routine.examTopic}` : 'আজ কোনো পরীক্ষা নেই'}
            </div>
            <div className="flex gap-2 mt-1.5">
              <button
                onClick={() => onNavigate('daily_plan')}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gold hover:bg-[#b88e22] text-[#0F111A] text-xs font-extrabold shadow-lg transition-all flex items-center justify-center gap-1.5 min-h-11 hover:scale-[1.02] bn"
              >
                <Calendar className="w-4 h-4" />
                আজকের প্ল্যান
              </button>
              <button
                onClick={onOpenShareModal}
                className="p-2.5 rounded-xl bg-white/6 hover:bg-white/12 border border-white/10 text-text-primary transition-all min-h-11 min-w-11 flex items-center justify-center"
                title="Share Progress"
              >
                <Share2 className="w-4 h-4 text-gold" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* ═══ STATS GRID (premium cards) ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tasks ring — ⭐ target-based (খালি থাকলে empty state) */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-surface border border-border shadow-lg flex items-center justify-between gap-4 transition-all hover:-translate-y-0.5">
          <div className="absolute top-0 left-0 right-0 h-0.75" style={{ background: 'linear-gradient(90deg,#DC143C,#FBBF24)' }} />

          {todayTasksTotal === 0 ? (
            /* ⭐ কোনো target set করা নেই */
            <div className="w-full">
              <h3 className="text-xs font-bold text-text-secondary bn">আজকের কাজ সম্পন্ন</h3>
              <p className="text-sm font-bold text-text-muted mt-2 bn">
                এখনো কোনো টার্গেট সেট করা হয়নি
              </p>
              <button
                onClick={() => onNavigate('daily_plan')}
                className="mt-3 px-3 py-2 rounded-xl bg-primary/10 border border-primary/40 text-primary text-[11px] font-extrabold transition-all hover:bg-primary/20 bn"
              >
                + টার্গেট সেট করুন
              </button>
            </div>
          ) : (
            /* ⭐ target set করা আছে → real count */
            <>
              <div>
                <h3 className="text-xs font-bold text-text-secondary bn">আজকের কাজ সম্পন্ন</h3>
                <p className="text-2xl font-black text-text-primary font-mono mt-1">
                  {todayTasksDone} / {todayTasksTotal}
                </p>
                <p className="text-[11px] text-text-muted mt-1 bn">
                  {taskPct >= 70
                    ? '🎉 ৭০%+ সম্পন্ন! স্ট্রিক সুরক্ষিত।'
                    : `আর ${todayTasksTotal - todayTasksDone} টি কাজ বাকি`}
                </p>
              </div>
              <ProgressRing
                percent={taskPct}
                size={100}
                strokeWidth={8}
                primaryColor={taskPct >= 70 ? 'var(--color-success)' : taskPct >= 40 ? 'var(--color-gold)' : 'var(--color-primary)'}
                secondaryColor="var(--color-surface-muted)"
                label="কাজ"
              />
            </>
          )}
        </div>

        {/* Streak */}
        <StreakCard streak={streak} />

        {/* Study hours */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-surface border border-border shadow-lg flex flex-col justify-between transition-all hover:-translate-y-0.5">
          <div className="absolute top-0 left-0 right-0 h-0.75" style={{ background: 'linear-gradient(90deg,#FBBF24,#10B981)' }} />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary bn">পড়ার ঘণ্টা ও টার্গেট</span>
            <span
              className="text-[10px] font-black font-mono px-2 py-0.5 rounded-full"
              style={{
                background: studyPct >= 100 ? 'rgba(16,185,129,0.15)' : 'rgba(251,191,36,0.12)',
                color: studyPct >= 100 ? '#10B981' : '#FBBF24',
              }}
            >
              {studyPct}%
            </span>
          </div>

          <div className="my-2">
            <p
              className="text-3xl font-black font-mono"
              style={{
                background: studyPct >= 100 ? 'linear-gradient(90deg,#10B981,#35D6FF)' : 'linear-gradient(90deg,#FBBF24,#DC143C)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {todayProgress.studyHours}h
            </p>
            <p className="text-xs text-text-muted mt-0.5">/ {targetHours}h target</p>
            <div className="w-full bg-surface-muted rounded-full h-2 mt-2 overflow-hidden border border-border">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${studyPct}%`,
                  background: studyPct >= 100 ? 'linear-gradient(90deg,#10B981,#059669)' : 'linear-gradient(90deg,#DC143C,#FBBF24)',
                  boxShadow: studyPct >= 100 ? '0 0 10px rgba(16,185,129,0.4)' : '0 0 10px rgba(251,191,36,0.3)',
                }}
              />
            </div>
          </div>

          <p className="text-[11px] text-text-muted bn">
            ফোকাস রেটিং: <span className="font-bold text-gold">{todayProgress.focusRating || 8}/10</span>
          </p>
        </div>
      </div>

      {/* ═══ SCHEDULE + EXAM + QUICK ACTIONS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <DailyRoutineCard
            routine={routine}
            dateKey={todayKey}
            onStartFocusTimer={(session) => {
              onStartTimerWithSession(session);
              onNavigate('focus_timer');
            }}
          />

          {routine.examTopic && (
            <ExamCard
              examTopic={routine.examTopic}
              dateKey={todayKey}
              onOpenExamPrep={() => onNavigate('daily_plan')}
            />
          )}
        </div>

        {/* right column: quick actions + tip */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-lg space-y-3">
            <h3 className="text-xs font-bold text-text-secondary pb-2 border-b border-border flex items-center gap-2 bn">
              <Zap className="w-4 h-4 text-gold" />
              দ্রুত অ্যাকশনসমূহ (Quick Actions)
            </h3>

            <div className="space-y-2">
              {quickActions.map((a) => (
                <button
                  key={a.page}
                  onClick={() => {
                    if ((a as any).autoStart) {
                      // ⭐ Special: 2min start mode — skip subject picker, auto-start
                      window.location.hash = `#autostart=${(a as any).autoStart}`;
                    }
                    onNavigate(a.page);
                  }}
                  className="w-full p-3 rounded-xl bg-surface-muted hover:bg-surface-hover border border-border text-text-primary text-xs font-bold flex items-center justify-between transition-all min-h-11 group hover:border-white/20 bn"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: a.bg }}>
                      <a.icon className="w-4 h-4" style={{ color: a.color }} />
                    </span>
                    {a.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* ⭐ Daily tip card */}
          <div className="p-4 rounded-2xl border border-border space-y-2" style={{ background: 'linear-gradient(135deg, var(--color-surface), var(--color-surface-muted))' }}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              <h4 className="text-xs font-bold text-text-primary bn">আজকের টিপ</h4>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed bn">{TIPS[tipIndex]}</p>
          </div>
        </div>
      </div>
    </div>
  );
};