import React, { useMemo } from 'react';
import { UserProfile, DailyProgress, ClassSession } from '../types';
import { getRoutineForDate } from '../data/routineData';
import { DailyAyahCard } from '../components/DailyAyahCard';
import { calculateStreak } from '../utils/storageEngine';
import { getClassWindow } from '../utils/classExamWindow';
import { ProgressRing } from '../components/ProgressRing';
import { StreakCard } from '../components/StreakCard';
import { ExamCard } from '../components/ExamCard';
import { DailyRoutineCard } from '../components/DailyRoutineCard';
import { PhysicsHunterLinkCard } from '../components/PhysicsHunterLinkCard';
import { PH_QUICK_LINKS } from '../data/phSubjectLinks';
import { getTodayTip } from '../utils/dailyTips';
import {
  Clock,
  Calendar,
  Zap,
  PlusCircle,
  BarChart2,
  Share2,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface DashboardViewProps {
  profile: UserProfile;
  todayKey: string;
  todayProgress: DailyProgress;
  onNavigate: (page: any) => void;
  onStartTimerWithSession: (session: ClassSession) => void;
  onOpenShareModal: () => void;
}

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 5) return 'শুভ রাত্রি';
  if (h < 12) return 'সুপ্রভাত';
  if (h < 17) return 'শুভ দুপুর';
  if (h < 20) return 'শুভ সন্ধ্যা';
  return 'শুভ রাত্রি';
};


export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  todayKey,
  todayProgress,
  onNavigate,
  onStartTimerWithSession,
  onOpenShareModal,
}) => {
  const routine = getRoutineForDate(todayKey);
  const streak = calculateStreak(todayKey);
  const streakCount = (streak as any)?.count ?? (streak as any)?.current ?? (streak as any)?.days ?? 0;

  const dateLabel = useMemo(() => {
    try {
      return new Date().toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long' });
    } catch {
      return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    }
  }, []);

  const nextSession = useMemo(
    () => routine.sessions.find((s) => getClassWindow(s, todayKey).status === 'upcoming') || null,
    [routine, todayKey]
  );
  const nextWin = nextSession ? getClassWindow(nextSession, todayKey) : null;

  const pct = todayProgress.completionPercent;
  const targetHours = profile.dailyStudyTargetHours || 8;
  const studyPct = Math.min(100, Math.round((todayProgress.studyHours / targetHours) * 100));

  const todayTasks = (todayProgress.customTasks || []).filter((t) => t.dateKey === todayKey);
  const todayTasksTotal = todayTasks.length;
  const todayTasksDone = todayTasks.filter((t) => t.completed).length;
  const taskPct = todayTasksTotal > 0 ? Math.round((todayTasksDone / todayTasksTotal) * 100) : 0;

  const quickActions = [
    { icon: Clock, label: '২ মিনিটের Start Mode চালু করুন', page: 'focus_timer', color: '#38BDF8', bg: 'rgba(56,189,248,0.12)', autoStart: '2min' },
    { icon: PlusCircle, label: 'ব্যক্তিগত Task যোগ করুন', page: 'daily_plan', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
    { icon: BarChart2, label: 'সাপ্তাহিক প্রোগ্রেস চার্ট দেখুন', page: 'weekly_progress', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
    { icon: BookOpen, label: 'বিষয়ভিত্তিক সিলেবাস প্রোগ্রেস', page: 'subjects', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  ];

  return (
    <div className="space-y-5 pb-12 animate-in fade-in">
      {/* ═══ HERO BANNER — Deep Minimal Luxury ═══ */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: 'linear-gradient(165deg, #101014 0%, #0C0D12 50%, #12100C 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* ambient brand glows (whisper level) */}
        <div className="absolute -top-24 -left-16 w-80 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(220,20,60,0.09), transparent 70%)' }} />
        <div className="absolute -bottom-24 -right-16 w-80 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(251,191,36,0.07), transparent 70%)' }} />

        {/* top hairline */}
        <div className="absolute top-0 inset-x-0 h-px pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(220,20,60,0.5), rgba(251,191,36,0.45), transparent)' }} />

        <div className="relative z-10 p-5 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-8">
          {/* LEFT: identity */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px]" style={{ background: 'linear-gradient(135deg,#DC143C,#FBBF24)' }}>
                <div className="w-full h-full rounded-full overflow-hidden bg-surface-muted border-2 border-[#0C0D12]">
                  {(profile.photoURL || profile.avatar_url) ? (
                    <img
                      src={(profile.photoURL || profile.avatar_url) as string}
                      alt={profile.nickname || 'Profile'}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: 'center 25%' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-black text-lg" style={{ background: 'linear-gradient(135deg,#DC143C,#FBBF24)' }}>
                      {(profile.nickname || profile.displayName || 'S').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <span
                className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black text-white"
                style={{ background: 'linear-gradient(135deg,#F97316,#DC143C)', boxShadow: '0 2px 8px rgba(220,20,60,0.4)' }}
              >
                🔥 {streakCount}
              </span>
            </div>

            <div className="min-w-0">
              <p
                className="text-[10px] font-bold bn"
                style={{ color: 'rgba(251,191,36,0.85)', fontFamily: "'Anek Bangla', sans-serif", letterSpacing: '0.08em' }}
              >
                ✦ {getGreeting()},
              </p>
              <h1
                className="text-xl sm:text-2xl font-bold truncate mt-0.5 bn"
                style={{ color: '#F8FAFC', fontFamily: "'Anek Bangla', sans-serif", letterSpacing: '0.01em' }}
              >
                {profile.nickname || 'শিক্ষার্থী'}
              </h1>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bn" style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}>
                  🎯 {profile.targetUniversity}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bn" style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}>
                  🧬 {profile.academicGroup}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: quiet status + actions */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 shrink-0">
            <div className="flex flex-col gap-1.5">
              <p className="flex items-center gap-2 text-[11px] bn" style={{ color: '#94A3B8' }}>
                <Calendar className="w-3.5 h-3.5" style={{ color: 'rgba(251,191,36,0.7)' }} />
                {dateLabel}
              </p>
              <p className="flex items-center gap-2 text-[11px] bn" style={{ color: nextSession ? '#FBBF24' : '#64748B' }}>
                <Clock className="w-3.5 h-3.5" />
                {nextSession && nextWin ? `পরবর্তী ক্লাস: ${nextWin.countdown}` : 'আজ আর ক্লাস নেই'}
              </p>
              <p className="flex items-center gap-2 text-[11px] bn" style={{ color: routine.examTopic ? '#F87171' : '#64748B' }}>
                <Zap className="w-3.5 h-3.5" />
                {routine.examTopic ? `আজ পরীক্ষা: ${routine.examTopic}` : 'আজ পরীক্ষা নেই'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('daily_plan')}
                className="px-4 py-2.5 rounded-xl text-xs font-extrabold bn transition-all hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg,#FBBF24,#D97706)',
                  color: '#0F111A',
                  boxShadow: '0 4px 16px rgba(251,191,36,0.25)',
                }}
              >
                আজকের প্ল্যান
              </button>
              <button
                onClick={onOpenShareModal}
                className="p-2.5 rounded-xl transition-colors hover:text-gold"
                style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', background: 'rgba(255,255,255,0.02)' }}
                title="Share Progress"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ আজকের আয়াত (premium daily card) ═══ */}
      <DailyAyahCard />

      {/* ═══ STATS GRID ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative overflow-hidden p-5 rounded-2xl bg-surface border border-border shadow-lg flex items-center justify-between gap-4 transition-all hover:-translate-y-0.5">
          <div className="absolute top-0 left-0 right-0 h-0.75" style={{ background: 'linear-gradient(90deg,#DC143C,#FBBF24)' }} />

          {todayTasksTotal === 0 ? (
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

        <StreakCard streak={streak} />

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

        <div className="space-y-4">
          <PhysicsHunterLinkCard />

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

          <div className="p-5 rounded-2xl bg-surface border border-border shadow-lg space-y-3">
            <h3 className="text-xs font-bold text-text-secondary pb-2 border-b border-border flex items-center gap-2 bn">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Physics Hunter — Quick Access
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {PH_QUICK_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => window.open(link.url, '_blank')}
                  className="p-2.5 rounded-xl bg-surface-muted hover:bg-surface-hover border border-border text-text-primary text-[11px] font-bold flex items-center gap-2 transition-all hover:border-emerald-400/50 bn"
                >
                  <span className="text-base">{link.emoji}</span>
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-2xl p-5 shadow-lg"
            style={{
              background: 'linear-gradient(165deg, #101214 0%, #0C0D12 50%, #121014 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* ambient glow */}
            <div className="absolute -top-16 -right-16 w-48 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(251,191,36,0.08), transparent 70%)' }} />
            <div className="absolute top-0 inset-x-0 h-px pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent)' }} />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="h-px w-6" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.4))' }} />
                <span className="text-[9px] font-bold tracking-[0.25em] uppercase bn" style={{ color: '#FBBF24' }}>
                  আজকের টিপ
                </span>
                <span className="h-px w-6" style={{ background: 'linear-gradient(90deg, rgba(251,191,36,0.4), transparent)' }} />
              </div>

              {(() => {
                const tip = getTodayTip();
                return (
                  <>
                    <h4 className="text-sm font-bold bn mb-2 flex items-center gap-2" style={{ color: '#F8FAFC', fontFamily: "'Anek Bangla', sans-serif" }}>
                      <span className="text-base">{tip.emoji}</span>
                      {tip.title}
                    </h4>
                    <p className="text-[11px] leading-relaxed bn" style={{ color: '#94A3B8', fontFamily: "'Anek Bangla', sans-serif" }}>
                      {tip.body}
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};