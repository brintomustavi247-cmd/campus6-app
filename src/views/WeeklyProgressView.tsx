import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { calculateStreak } from '../utils/storageEngine';
import { StreakCard } from '../components/StreakCard';
import { StudyCalendar } from '../components/StudyCalendar';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { BarChart3, Clock, Share2, Award, Lightbulb, CalendarDays, TrendingUp } from 'lucide-react';
import { getLast7DaysTotals, getLast30DaysTotals, DailyTotal } from '../services/db';

interface WeeklyProgressViewProps {
  profile: UserProfile;
  todayKey: string;
  selectedDateKey: string;
  onSelectDateKey: (dateKey: string) => void;
  onOpenShareModal: () => void;
}

type Range = '7' | '30';

const fmtMin = (m: number) => {
  if (!m || m <= 0) return '0m';
  const h = Math.floor(m / 60);
  const min = Math.round(m % 60);
  return h > 0 ? `${h}h ${String(min).padStart(2, '0')}m` : `${min}m`;
};

const dayLabel = (dateKey: string) =>
  new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });

export const WeeklyProgressView: React.FC<WeeklyProgressViewProps> = ({
  profile, todayKey, onOpenShareModal,
}) => {
  const streak = calculateStreak(todayKey);
  const [range, setRange] = useState<Range>('7');
  const [totals, setTotals] = useState<DailyTotal[]>([]);
  const [loading, setLoading] = useState(true);

  const uid = profile.uid && profile.uid !== 'demo-user' ? profile.uid : null;

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = range === '7' ? await getLast7DaysTotals(uid) : await getLast30DaysTotals(uid);
      if (!mounted) return;

      // Fill missing days with 0 so the chart has continuous bars
      const days = range === '7' ? 7 : 30;
      const filled: DailyTotal[] = [];
      const end = new Date();
      const map = new Map(data.map((d) => [d.dateKey, d]));
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(end);
        d.setDate(end.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        filled.push(map.get(key) || { dateKey: key, totalMinutes: 0, sessionCount: 0 });
      }
      setTotals(filled);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [uid, range]);

  const totalMinutes = totals.reduce((s, t) => s + t.totalMinutes, 0);
  const activeDays = totals.filter((t) => t.totalMinutes > 0).length;
  const avgMinutes = activeDays > 0 ? totalMinutes / activeDays : 0;

  const chartData = totals.map((t) => ({
    day: dayLabel(t.dateKey),
    minutes: Math.round(t.totalMinutes),
    dateKey: t.dateKey,
  }));

  return (
    <div className="space-y-6 pb-16 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-surface border border-border shadow-xl text-text-primary flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-gold">
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs font-bold">Study Time Analytics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-text-primary">
            {range === '7' ? 'Last 7 Days' : 'Last 30 Days'} Performance
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary/90 mt-1">
            Total: <span className="font-extrabold text-gold">{fmtMin(totalMinutes)}</span>
            {' · '}Avg/day: <span className="font-extrabold text-text-primary">{fmtMin(avgMinutes)}</span>
            {' · '}Active: <span className="font-extrabold text-emerald-400">{activeDays} days</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex p-1 rounded-xl bg-surface-muted border border-border">
            {(['7', '30'] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  range === r ? 'bg-gold text-[#0F111A]' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {r === '7' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
          <button
            onClick={onOpenShareModal}
            className="px-4 py-2.5 rounded-xl bg-gold hover:bg-[#b88e22] text-[#0F111A] text-xs font-extrabold shadow-lg transition-all flex items-center gap-2 min-h-11"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      {!uid && (
        <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-bold text-center">
          ⚠️ Log in to see your real study history synced from the cloud.
        </div>
      )}

      {/* Chart */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold" />
              Minutes Studied Per Day
            </h3>
            <p className="text-[11px] text-text-muted">Every minute you study is saved permanently — even 5 min counts.</p>
          </div>
          <span className="text-xs font-mono font-bold text-gold px-2.5 py-1 rounded-full bg-surface-muted border border-border">
            Σ {fmtMin(totalMinutes)}
          </span>
        </div>

        <div className="h-64 w-full pt-4">
          {loading ? (
            <div className="flex items-center justify-center h-full text-text-muted text-xs">Loading history...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {range === '7' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#6EE7B7" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6EE7B7" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F1720', borderColor: '#064E3B', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    formatter={(v: any) => [fmtMin(Number(v)), 'Studied']}
                  />
                  <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>
                    {chartData.map((e, i) => {
                      let c = '#DC2626';
                      if (e.minutes >= 180) c = '#8B5CF6';
                      else if (e.minutes >= 90) c = '#10B981';
                      else if (e.minutes >= 30) c = '#0EA5E9';
                      return <Cell key={i} fill={c} style={{ filter: `drop-shadow(0 0 8px ${c}80)` }} />;
                    })}
                  </Bar>
                </BarChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#6EE7B7" fontSize={10} tickLine={false} interval={4} />
                  <YAxis stroke="#6EE7B7" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F1720', borderColor: '#064E3B', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    formatter={(v: any) => [fmtMin(Number(v)), 'Studied']}
                  />
                  <Line type="monotone" dataKey="minutes" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3, fill: '#8B5CF6' }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Streak + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <StreakCard streak={streak} />
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-lg text-text-primary">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-text-secondary">Highlights</span>
              <Award className="w-5 h-5 text-gold" />
            </div>
            <div className="space-y-2">
              <Row label="Period total" value={fmtMin(totalMinutes)} />
              <Row label="Daily average" value={fmtMin(avgMinutes)} />
              <Row label="Active days" value={`${activeDays} / ${totals.length}`} />
              <Row label="Best day" value={fmtMin(Math.max(0, ...totals.map((t) => t.totalMinutes)))} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 p-5 rounded-2xl bg-surface border border-border shadow-lg">
          <StudyCalendar userId={uid} />
        </div>
      </div>

      {/* Tips */}
      <div className="p-5 rounded-2xl bg-surface-muted border border-amber-500/30 shadow-lg space-y-3">
        <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-gold" /> Smart Insights
        </h3>
        <ul className="space-y-2 text-xs text-text-primary">
          <li className="flex gap-2"><span className="text-gold font-bold">•</span>
            {avgMinutes < 30
              ? 'Your daily average is under 30 min. Even a single 2-min focus session counts — consistency beats intensity.'
              : 'Great consistency! Keep this daily rhythm and your weekly total will compound fast.'}
          </li>
          <li className="flex gap-2"><span className="text-gold font-bold">•</span>
            Studied {activeDays} of {totals.length} days. Aim to turn every red (zero) day into at least 5 minutes.
          </li>
          <li className="flex gap-2"><span className="text-gold font-bold">•</span>
            At this pace: ~{fmtMin(avgMinutes * 7)} / week · ~{fmtMin(avgMinutes * 30)} / month projected.
          </li>
        </ul>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-text-muted">{label}</span>
    <span className="font-mono font-bold text-text-primary">{value}</span>
  </div>
);