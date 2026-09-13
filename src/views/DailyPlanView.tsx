import React, { useState } from 'react';
import { UserProfile, DailyProgress, CustomTask } from '../types';
import { getRoutineForDate } from '../data/routineData';
import { DateSelector } from '../components/DateSelector';
import { DailyRoutineCard } from '../components/DailyRoutineCard';
import { ExamCard } from '../components/ExamCard';
import { Plus, Trash2, FileText, Target } from 'lucide-react';

interface DailyPlanViewProps {
  profile: UserProfile;
  selectedDateKey: string;
  onDateChange: (dateKey: string) => void;
  todayKey: string;
  dailyProgress: DailyProgress;
  onUpdateProgress: (updated: DailyProgress) => void;
  onOpenShareModal: () => void;
  onAddToast: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
}

const TASK_COLORS = ['#DC143C', '#FBBF24', '#35D6FF', '#8B5CF6', '#10B981', '#F97316'];

const PANEL: React.CSSProperties = {
  background: 'rgba(18,22,30,0.9)',
  border: '1px solid rgba(255,255,255,0.11)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 10px 30px rgba(0,0,0,0.35)',
  borderRadius: 16,
};

const MICRO: React.CSSProperties = {
  fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
  color: '#475569', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
};

const INPUT = 'px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-[#FBBF24] transition-colors';

export const DailyPlanView: React.FC<DailyPlanViewProps> = ({
  selectedDateKey, onDateChange, todayKey, dailyProgress, onUpdateProgress, onAddToast,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState(30);
  const routine = getRoutineForDate(selectedDateKey);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      onAddToast('warning', 'Task title cannot be empty');
      return;
    }
    const newTask: CustomTask = {
      id: `task_${Date.now()}`,
      dateKey: selectedDateKey,
      title: newTaskTitle.trim(),
      subject: 'Other',
      priority: 'Medium',
      estimatedMinutes: newTaskMinutes,
      completed: false,
    };
    onUpdateProgress({ ...dailyProgress, customTasks: [...(dailyProgress.customTasks || []), newTask] });
    setNewTaskTitle('');
    setNewTaskMinutes(30);
    onAddToast('success', 'Task added successfully');
  };

  const handleToggleTask = (taskId: string) => {
    const updatedTasks = (dailyProgress.customTasks || []).map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined } : t
    );
    onUpdateProgress({ ...dailyProgress, customTasks: updatedTasks });
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateProgress({ ...dailyProgress, customTasks: (dailyProgress.customTasks || []).filter((t) => t.id !== taskId) });
  };

  const handleNotesChange = (text: string) => {
    onUpdateProgress({ ...dailyProgress, notes: text });
  };

  const todayTasks = (dailyProgress.customTasks || []).filter((t) => t.dateKey === selectedDateKey);
  const completedTasks = todayTasks.filter((t) => t.completed).length;
  const totalTasks = todayTasks.length;
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-5 pb-16 animate-in fade-in">
      {/* date selector */}
      <DateSelector selectedDateKey={selectedDateKey} onDateChange={onDateChange} todayKey={todayKey} />

      {/* ═══ progress summary ═══ */}
      <div className="p-5" style={PANEL}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5" style={{ color: '#FBBF24' }} />
            <p style={{ ...MICRO, color: '#94A3B8' }}>Today's Focus</p>
          </div>
          <span className="text-lg font-black font-mono tabular-nums" style={{ color: pct >= 70 ? '#34D399' : '#F8FAFC' }}>
            {pct}%
          </span>
        </div>

        <div className="h-1 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#DC143C,#FBBF24)', boxShadow: '0 0 8px rgba(251,191,36,0.35)' }}
          />
        </div>

        <p className="text-[10px] bn" style={{ color: '#475569' }}>
          {totalTasks === 0 ? 'এখনো কোনো task নেই — নিচে যোগ করুন' : `${totalTasks} টির মধ্যে ${completedTasks} টি সম্পন্ন`}
        </p>
      </div>

      {/* routine + exam */}
      <div className="space-y-4">
        <DailyRoutineCard routine={routine} dateKey={selectedDateKey} />
        {routine.examTopic && <ExamCard examTopic={routine.examTopic} dateKey={selectedDateKey} />}
      </div>

      {/* ═══ personal tasks ═══ */}
      <div className="overflow-hidden" style={PANEL}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={MICRO}>Personal Tasks</p>
          {totalTasks > 0 && (
            <span className="text-[9px] font-black font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.25)' }}>
              {completedTasks}/{totalTasks}
            </span>
          )}
        </div>

        <div className="p-5 space-y-4">
          {/* add form */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="নতুন task লিখুন..."
              className={`flex-1 min-w-0 bn ${INPUT}`}
            />
            <input
              type="number"
              value={newTaskMinutes}
              onChange={(e) => setNewTaskMinutes(Number(e.target.value))}
              min={5}
              max={240}
              className={`w-16 text-center font-mono ${INPUT}`}
            />
            <button
              onClick={handleAddTask}
              className="px-4 rounded-xl flex items-center justify-center transition-all hover:brightness-110 active:scale-95 shrink-0"
              style={{ background: 'linear-gradient(135deg,#FBBF24,#D97706)', color: '#0F111A', boxShadow: '0 4px 14px rgba(251,191,36,0.3)' }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* task rows */}
          {todayTasks.length === 0 ? (
            <p className="text-[11px] bn py-6 text-center" style={{ color: '#334155' }}>
              কোনো task নেই — উপরে যোগ করুন ✨
            </p>
          ) : (
            <div>
              {todayTasks.map((task, idx) => {
                const color = TASK_COLORS[idx % TASK_COLORS.length];
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 py-3 relative"
                    style={{ borderBottom: idx !== todayTasks.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                  >
                    <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ background: task.completed ? '#10B981' : color }} />

                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 ml-2"
                      style={
                        task.completed
                          ? { background: 'linear-gradient(135deg,#10B981,#059669)', border: '1px solid #10B981', boxShadow: '0 0 10px rgba(16,185,129,0.4)' }
                          : { background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}60` }
                      }
                    >
                      {task.completed && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-semibold bn truncate ${task.completed ? 'line-through' : ''}`} style={{ color: task.completed ? '#475569' : '#E2E8F0' }}>
                        {task.title}
                      </p>
                      <p className="text-[9px] font-mono mt-0.5" style={{ color: task.completed ? '#10B981' : color }}>
                        ⏱ {task.estimatedMinutes} min
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 rounded-lg transition-colors hover:bg-white/5 shrink-0"
                      style={{ color: '#475569' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══ notes ═══ */}
      <div className="p-5" style={PANEL}>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-3.5 h-3.5" style={{ color: '#FBBF24' }} />
          <p style={{ ...MICRO, color: '#94A3B8' }}>Notes & Reflections</p>
        </div>
        <textarea
          rows={4}
          value={dailyProgress.notes || ''}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="গুরুত্বপূর্ণ নোট, সূত্র বা অনুভূতি লিখুন..."
          className={`w-full p-4 bn leading-relaxed resize-none ${INPUT}`}
        />
        <p className="text-[9px] mt-2" style={{ color: '#334155' }}>Auto-saved • শুধু আপনার জন্য</p>
      </div>
    </div>
  );
};