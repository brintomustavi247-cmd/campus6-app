import React, { useMemo, useState, useEffect } from 'react';
import { EmotionalPopup } from '../components/EmotionalPopup';
import { getEmotionalNote, markActive, EmotionalNote } from '../utils/emotionalNotifications';
import { feedbackNotif } from '../utils/alertFeedback';
import { UserProfile, DailyProgress, ClassSession } from '../types';
import { getRoutineForDate } from '../data/routineData';
import { DailyAyahCard } from '../components/DailyAyahCard';
import { calculateStreak } from '../utils/storageEngine';
import { getClassWindow } from '../utils/classExamWindow';
import { ProgressRing } from '../components/ProgressRing';
import { StreakCard } from '../components/StreakCard';
import { ExamCard } from '../components/ExamCard';
import { DailyRoutineCard } from '../components/DailyRoutineCard';
import { collectActiveExams } from '../utils/activeExams';
import { dismissExam } from '../utils/examDismiss';
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

/* ─── premium primitives ─── */
const PANEL: React.CSSProperties = {
  background: 'rgba(18,22,30,0.9)',
  border: '1px solid rgba(255,255,255,0.11)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 10px 30px rgba(0,0,0,0.35)',
  borderRadius: 16,
};

const MICRO: React.CSSProperties = {
  fontSize: 9,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: '#475569',
  fontWeight: 800,
  fontFamily: "'JetBrains Mono', monospace",
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  todayKey,
  todayProgress,
  onNavigate,
  onStartTimerWithSession,
  onOpenShareModal,
}) => {
  const [emoNote, setEmoNote] = useState<EmotionalNote | null>(null);

  useEffect(() => {
    markActive();
    const t = setTimeout(() => {
      const n = getEmotionalNote();
      if (n) {
        setEmoNote(n);
        feedbackNotif();
      }
    }, 2500);
    return () => clearTimeout(t);
  }, []);

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

  const [, setExamTick] = useState(0);
  useEffect(() => {
    const refresh = () => setExamTick((tick) => tick + 1);
    const id = window.setInterval(refresh, 30_000);
    window.addEventListener('campus6:exam-dismissed', refresh);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('campus6:exam-dismissed', refresh);
    };
  }, []);

  const activeExams = collectActiveExams(todayKey);
  const liveExams = activeExams.filter((exam) => exam.status === 'live');
  const upcomingExams = activeExams.filter((exam) => exam.status === 'upcoming');

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
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* ═══ HERO BANNER — অপরিবর্তিত ═══ */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: 'linear-gradient(165deg, #101014 0%, #0C0D12 50%, #12100C 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="absolute -top-24 -left-16 w-80 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(220,20,60,0.09), transparent 70%)' }} />
        <div className="absolute -bottom-24 -right-16 w-80 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(251,191,36,0.07), transparent 70%)' }} />
        <div className="absolute top-0 inset-x-0 h-px pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(220,20,60,0.5), rgba(251,191,36,0.45), transparent)' }} />

        <div className="relative z-10 p-5 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-8">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5" style={{ background: 'linear-gradient(135deg,#DC143C,#FBBF24)' }}>
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
              <p className="text-[10px] font-bold bn" style={{ color: 'rgba(251,191,36,0.85)', fontFamily: "'Anek Bangla', sans-serif", letterSpacing: '0.08em' }}>
                ✦ {getGreeting()},
              </p>
              <h1
                className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold truncate mt-1"
                style={{
                  fontFamily: "'Lexend', 'Anek Bangla', sans-serif",
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  background: 'linear-gradient(100deg, #F8FAFC 0%, #E2E8F0 45%, #FBBF24 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 18px rgba(251,191,36,0.15))',
                }}
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
                style={{ background: 'linear-gradient(135deg,#FBBF24,#D97706)', color: '#0F111A', boxShadow: '0 4px 16px rgba(251,191,36,0.25)' }}
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

      {/* ═══ আজকের আয়াত — অপরিবর্তিত ═══ */}
      <DailyAyahCard />

      {/* ═══ STATS — premium minimal ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* tasks */}
        <div className="p-5" style={PANEL}>
          <div className="flex items-center justify-between mb-4">
            <p style={MICRO}>Today's Tasks</p>
            <span className="text-[10px] font-black font-mono tabular-nums" style={{ color: '#94A3B8' }}>
              {todayTasksDone}/{todayTasksTotal}
            </span>
          </div>

          {todayTasksTotal === 0 ? (
            <div>
              <p className="text-[11px] bn" style={{ color: '#475569' }}>এখনো কোনো টার্গেট সেট করা হয়নি</p>
              <button
                onClick={() => onNavigate('daily_plan')}
                className="mt-3 px-3.5 py-2 rounded-xl text-[10px] font-extrabold bn transition-all hover:brightness-110"
                style={{ background: 'rgba(220,20,60,0.12)', border: '1px solid rgba(220,20,60,0.35)', color: '#F87171' }}
              >
                + টার্গেট সেট করুন
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-black font-mono tabular-nums" style={{ color: '#F8FAFC' }}>{taskPct}%</p>
                <p className="text-[10px] bn mt-1" style={{ color: '#475569' }}>
                  {taskPct >= 70 ? '🎉 স্ট্রিক সুরক্ষিত' : `আর ${todayTasksTotal - todayTasksDone} টি বাকি`}
                </p>
              </div>
              <ProgressRing
                percent={taskPct}
                size={84}
                strokeWidth={7}
                primaryColor={taskPct >= 70 ? '#10B981' : taskPct >= 40 ? '#FBBF24' : '#DC143C'}
                secondaryColor="rgba(255,255,255,0.06)"
                label="কাজ"
              />
            </div>
          )}
        </div>

        <StreakCard streak={streak} />

        {/* study hours */}
        <div className="p-5" style={PANEL}>
          <div className="flex items-center justify-between mb-4">
            <p style={MICRO}>Study Hours</p>
            <span
              className="text-[9px] font-black font-mono px-1.5 py-0.5 rounded"
              style={{
                background: studyPct >= 100 ? 'rgba(16,185,129,0.12)' : 'rgba(251,191,36,0.1)',
                color: studyPct >= 100 ? '#34D399' : '#FBBF24',
                border: `1px solid ${studyPct >= 100 ? 'rgba(16,185,129,0.3)' : 'rgba(251,191,36,0.25)'}`,
              }}
            >
              {studyPct}%
            </span>
          </div>

          <p className="text-3xl font-black font-mono tabular-nums leading-none" style={{ color: '#F8FAFC' }}>
            {todayProgress.studyHours}
            <span className="text-sm ml-1" style={{ color: '#475569' }}>h</span>
          </p>
          <p className="text-[10px] mt-1 mb-3" style={{ color: '#475569' }}>/ {targetHours}h target</p>

          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${studyPct}%`,
                background: studyPct >= 100 ? 'linear-gradient(90deg,#10B981,#34D399)' : 'linear-gradient(90deg,#DC143C,#FBBF24)',
                boxShadow: '0 0 8px rgba(251,191,36,0.35)',
              }}
            />
          </div>

          <p className="text-[10px] bn mt-3" style={{ color: '#475569' }}>
            ফোকাস রেটিং <span className="font-black font-mono" style={{ color: '#FBBF24' }}>{todayProgress.focusRating || 8}/10</span>
          </p>
        </div>
      </div>

      {/* ═══ SCHEDULE + EXAMS + SIDEBAR ═══ */}
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

          {liveExams.map((exam) => (
            <ExamCard
              key={`live-${exam.dateKey}-${exam.examTopic}`}
              examTopic={exam.examTopic}
              dateKey={exam.dateKey}
              onOpenExamPrep={() => onNavigate('daily_plan')}
              onDismiss={() => dismissExam(exam.dateKey, exam.examTopic)}
            />
          ))}

          {upcomingExams.map((exam) => (
            <ExamCard
              key={`upcoming-${exam.dateKey}-${exam.examTopic}`}
              examTopic={exam.examTopic}
              dateKey={exam.dateKey}
              onOpenExamPrep={() => onNavigate('daily_plan')}
            />
          ))}
        </div>

        <div className="space-y-4">
          <PhysicsHunterLinkCard />

          {/* quick actions — minimal rows */}
          <div className="overflow-hidden" style={PANEL}>
            <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={MICRO}>Quick Actions</p>
            </div>
            {quickActions.map((a, i) => (
              <button
                key={a.page}
                onClick={() => {
                  if ((a as any).autoStart) window.location.hash = `#autostart=${(a as any).autoStart}`;
                  onNavigate(a.page);
                }}
                className="w-full flex items-center gap-3 px-5 py-3 transition-all hover:bg-white/[0.02] hover:translate-x-0.5"
                style={{ borderBottom: i !== quickActions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
              >
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: a.bg, border: `1px solid ${a.color}25` }}>
                  <a.icon className="w-3.5 h-3.5" style={{ color: a.color }} />
                </span>
                <span className="flex-1 text-left text-[11px] font-bold bn" style={{ color: '#CBD5E1' }}>{a.label}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: '#334155' }} />
              </button>
            ))}
          </div>

          {/* physics hunter links */}
          <div className="p-5" style={PANEL}>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-3.5 h-3.5" style={{ color: '#34D399' }} />
              <p style={{ ...MICRO, color: '#94A3B8' }}>Physics Hunter</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PH_QUICK_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => window.open(link.url, '_blank')}
                  className="p-2.5 rounded-xl text-[10px] font-bold bn flex items-center gap-2 transition-all hover:bg-white/[0.05] active:scale-[0.98]"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#CBD5E1' }}
                >
                  <span className="text-sm">{link.emoji}</span>
                  <span className="truncate">{link.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* daily tip */}
          <div className="p-5" style={PANEL}>
            <p style={MICRO}>Daily Tip</p>
            {(() => {
              const tip = getTodayTip();
              return (
                <>
                  <h4 className="text-[13px] font-bold bn mt-3 mb-1.5 flex items-center gap-2" style={{ color: '#F8FAFC', fontFamily: "'Anek Bangla', sans-serif" }}>
                    <span className="text-base">{tip.emoji}</span>
                    {tip.title}
                  </h4>
                  <p className="text-[11px] leading-relaxed bn" style={{ color: '#64748B', fontFamily: "'Anek Bangla', sans-serif" }}>
                    {tip.body}
                  </p>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {emoNote && (
        <EmotionalPopup
          note={emoNote}
          onStart={() => {
            setEmoNote(null);
            window.location.hash = '#autostart=2min';
            onNavigate('focus_timer');
          }}
          onClose={() => setEmoNote(null)}
        />
      )}
    </div>
  );
};