import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, BookOpen, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../supabaseClient';
import {
  getStudyTotalsByDateRange,
  getSessionsForDate,
  DailyTotal,
} from '../services/db';

/* ───────────────────────── helpers ───────────────────────── */

const pad = (n: number) => String(n).padStart(2, '0');
const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayKey = () => toKey(new Date());

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatMinutes = (m: number) => {
  if (!m || m <= 0) return '0m';
  const h = Math.floor(m / 60);
  const min = Math.round(m % 60);
  return h > 0 ? `${h}h ${pad(min)}m` : `${min}m`;
};

/** Heat color by minutes studied that day */
const heatStyle = (minutes: number): { bg: string; text: string } => {
  if (minutes <= 0) return { bg: 'rgba(255,255,255,0.03)', text: '#4b5563' };
  if (minutes < 30) return { bg: 'rgba(16,185,129,0.18)', text: '#6ee7b7' };
  if (minutes < 90) return { bg: 'rgba(16,185,129,0.35)', text: '#a7f3d0' };
  if (minutes < 180) return { bg: 'rgba(14,165,233,0.45)', text: '#bae6fd' };
  return { bg: 'rgba(139,92,246,0.55)', text: '#ede9fe' }; // 3h+ = elite purple
};

/* ───────────────────────── component ───────────────────────── */

interface StudyCalendarProps {
  userId: string | null;
}

export const StudyCalendar: React.FC<StudyCalendarProps> = ({ userId }) => {
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [monthTotals, setMonthTotals] = useState<Record<string, DailyTotal>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [daySessions, setDaySessions] = useState<{ id: string; topic: string; minutes: number; completedAt: string }[]>([]);
  const [loading, setLoading] = useState(false);

  /* ── Fetch the whole visible month's totals ── */
  useEffect(() => {
    if (!userId) return;
    let mounted = true;

    const start = new Date(viewYear, viewMonth, 1);
    const end = new Date(viewYear, viewMonth + 1, 0);

    (async () => {
      const totals = await getStudyTotalsByDateRange(userId, toKey(start), toKey(end));
      if (!mounted) return;
      const map: Record<string, DailyTotal> = {};
      totals.forEach((t) => (map[t.dateKey] = t));
      setMonthTotals(map);
    })();

    return () => { mounted = false; };
  }, [userId, viewYear, viewMonth]);

  /* ── Fetch sessions when a day is clicked ── */
  useEffect(() => {
    if (!userId || !selectedDate) {
      setDaySessions([]);
      return;
    }
    let mounted = true;
    (async () => {
      const s = await getSessionsForDate(userId, selectedDate);
      if (mounted) setDaySessions(s);
    })();
    return () => { mounted = false; };
  }, [userId, selectedDate]);

  /* ── Build the calendar grid (6 weeks max) ── */
  const grid = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  /* ── Month summary ── */
  const monthMinutes = useMemo(
    () => Object.values(monthTotals).reduce((sum, t) => sum + t.totalMinutes, 0),
    [monthTotals]
  );
  const activeDays = useMemo(
    () => Object.values(monthTotals).filter((t) => t.totalMinutes > 0).length,
    [monthTotals]
  );

  const changeMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
    setSelectedDate(null);
  };

  const tk = todayKey();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-300">
          <CalendarIcon className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white">Study History Calendar</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-white min-w-35 text-center">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Month Total" value={formatMinutes(monthMinutes)} icon={<Clock className="w-4 h-4" />} color="text-cyan-300" />
        <StatCard label="Active Days" value={`${activeDays}`} icon={<BookOpen className="w-4 h-4" />} color="text-emerald-300" />
        <StatCard
          label="Daily Avg"
          value={formatMinutes(activeDays > 0 ? monthMinutes / activeDays : 0)}
          icon={<CalendarIcon className="w-4 h-4" />}
          color="text-violet-300"
        />
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[10px] font-bold text-slate-500 uppercase py-1">{w}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {grid.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const key = toKey(date);
          const total = monthTotals[key]?.totalMinutes || 0;
          const heat = heatStyle(total);
          const isToday = key === tk;
          const isSelected = key === selectedDate;

          return (
            <button
              key={key}
              onClick={() => setSelectedDate(key)}
              className="relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all border"
              style={{
                backgroundColor: heat.bg,
                borderColor: isSelected ? '#8B5CF6' : isToday ? '#00E5FF' : 'rgba(255,255,255,0.06)',
                boxShadow: isSelected ? '0 0 0 2px rgba(139,92,246,0.5)' : undefined,
              }}
            >
              <span className="text-xs font-bold" style={{ color: heat.text }}>{date.getDate()}</span>
              {total > 0 && (
                <span className="text-[8px] font-mono font-bold leading-none" style={{ color: heat.text }}>
                  {total >= 60 ? `${Math.round(total / 60)}h` : `${Math.round(total)}m`}
                </span>
              )}
              {isToday && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400" />}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 text-[10px] text-slate-500">
        <span>Less</span>
        {[0, 15, 60, 120, 200].map((m) => {
          const h = heatStyle(m);
          return <span key={m} className="w-3.5 h-3.5 rounded" style={{ backgroundColor: h.bg }} />;
        })}
        <span>More</span>
      </div>

      {/* Selected day drill-down */}
      {selectedDate && (
        <div className="p-4 rounded-2xl bg-white/3 border border-violet-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">
              📅 {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h4>
            <span className="text-xs font-mono font-bold text-violet-300 px-2 py-1 rounded-full bg-violet-500/20 border border-violet-500/30">
              {formatMinutes(monthTotals[selectedDate]?.totalMinutes || 0)} total
            </span>
          </div>

          {daySessions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No study sessions recorded this day.</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {daySessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/3 border border-white/5">
                  <div className="flex items-center gap-2 min-w-0">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-xs font-semibold text-white truncate">{s.topic}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-300 shrink-0 ml-2">{formatMinutes(s.minutes)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div className="p-3 rounded-xl bg-white/3 border border-white/5">
    <div className={`flex items-center gap-1.5 ${color} mb-1`}>{icon}<span className="text-[10px] font-bold uppercase">{label}</span></div>
    <p className="text-base font-extrabold text-white font-mono">{value}</p>
  </div>
);

export default StudyCalendar;