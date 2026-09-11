import React, { useState } from 'react';
import { UserProfile, DailyProgress, CustomTask } from '../types';
import { getRoutineForDate } from '../data/routineData';
import { DateSelector } from '../components/DateSelector';
import { DailyRoutineCard } from '../components/DailyRoutineCard';
import { ExamCard } from '../components/ExamCard';
import { 
  Plus, 
  Trash2, 
  FileText,
  Target
} from 'lucide-react';

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

// 🎨 Rotating color palette for tasks
const TASK_COLORS = [
  { bar: '#DC143C', glow: 'rgba(220,20,60,0.35)' },
  { bar: '#FBBF24', glow: 'rgba(251,191,36,0.35)' },
  { bar: '#35D6FF', glow: 'rgba(53,214,255,0.35)' },
  { bar: '#8B5CF6', glow: 'rgba(139,92,246,0.35)' },
  { bar: '#10B981', glow: 'rgba(16,185,129,0.35)' },
  { bar: '#F97316', glow: 'rgba(249,115,22,0.35)' },
];

export const DailyPlanView: React.FC<DailyPlanViewProps> = ({
  profile,
  selectedDateKey,
  onDateChange,
  todayKey,
  dailyProgress,
  onUpdateProgress,
  onAddToast
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState(30);
  const routine = getRoutineForDate(selectedDateKey);

  // Add Custom Task
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
      completed: false
    };

    onUpdateProgress({
      ...dailyProgress,
      customTasks: [...(dailyProgress.customTasks || []), newTask]
    });

    setNewTaskTitle('');
    setNewTaskMinutes(30);
    onAddToast('success', 'Task added successfully');
  };

  // Toggle Custom Task
  const handleToggleTask = (taskId: string) => {
    const updatedTasks = (dailyProgress.customTasks || []).map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? new Date().toISOString() : undefined
        };
      }
      return t;
    });
    onUpdateProgress({
      ...dailyProgress,
      customTasks: updatedTasks
    });
  };

  // Delete Custom Task
  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = (dailyProgress.customTasks || []).filter(t => t.id !== taskId);
    onUpdateProgress({
      ...dailyProgress,
      customTasks: updatedTasks
    });
  };

  // Handle Notes Autosave
  const handleNotesChange = (text: string) => {
    onUpdateProgress({
      ...dailyProgress,
      notes: text
    });
  };

  const todayTasks = (dailyProgress.customTasks || []).filter(t => t.dateKey === selectedDateKey);
  const completedTasks = todayTasks.filter(t => t.completed).length;
  const totalTasks = todayTasks.length;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in">
      {/* Date Picker Header */}
      <DateSelector
        selectedDateKey={selectedDateKey}
        onDateChange={onDateChange}
        todayKey={todayKey}
      />

      {/* Progress Summary Card */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Today's Focus</h2>
              <p className="text-xs text-text-muted mt-0.5">
                {totalTasks === 0 
                  ? 'No tasks yet. Add one below.' 
                  : `${completedTasks} of ${totalTasks} tasks completed`}
              </p>
            </div>
          </div>
          {totalTasks > 0 && (
            <div className="text-right">
              <div className="text-2xl font-black text-primary">
                {Math.round((completedTasks / totalTasks) * 100)}%
              </div>
              <div className="text-[10px] text-text-muted uppercase tracking-wide">Progress</div>
            </div>
          )}
        </div>
      </div>

      {/* Routine & Exam Cards */}
      <div className="space-y-4">
        <DailyRoutineCard 
          routine={routine} 
          dateKey={selectedDateKey} 
        />
        
        {routine.examTopic && (
          <ExamCard 
            examTopic={routine.examTopic} 
            dateKey={selectedDateKey} 
          />
        )}
      </div>

      {/* ─── Personal Tasks — Colorful Edition ─── */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-lg space-y-4 relative overflow-hidden">
        {/* 🌈 Rainbow top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-0.75"
          style={{ background: 'linear-gradient(90deg, #DC143C, #FBBF24, #10B981, #35D6FF, #8B5CF6)' }}
        />

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Personal Tasks
          </h3>
          {totalTasks > 0 && (
            <span
              className="text-xs font-mono font-bold px-2.5 py-1 rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, #DC143C, #8B5CF6)', boxShadow: '0 2px 10px rgba(139,92,246,0.35)' }}
            >
              {completedTasks}/{totalTasks}
            </span>
          )}
        </div>

        {/* 🌈 Colorful progress bar */}
        {totalTasks > 0 && (
          <div className="w-full h-2 rounded-full bg-surface-muted border border-border overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.round((completedTasks / totalTasks) * 100)}%`,
                background: 'linear-gradient(90deg, #DC143C, #FBBF24, #10B981)',
                boxShadow: '0 0 10px rgba(251,191,36,0.4)',
              }}
            />
          </div>
        )}

        {/* Add Task Form */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleAddTask()}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
          />
          <input
            type="number"
            value={newTaskMinutes}
            onChange={e => setNewTaskMinutes(Number(e.target.value))}
            placeholder="Min"
            min="5"
            max="240"
            className="w-20 px-3 py-2.5 rounded-xl bg-surface-muted border border-border text-text-primary text-sm text-center focus:outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={handleAddTask}
            className="px-4 py-2.5 rounded-xl text-white font-bold transition-all flex items-center gap-1.5 min-w-11 justify-center hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #DC143C, #9E0E29)', boxShadow: '0 4px 14px rgba(220,20,60,0.35)' }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Task List — colorful rows + SQUARE tick box */}
        {todayTasks.length > 0 && (
          <div className="space-y-2">
            {todayTasks.map((task, idx) => {
              const color = TASK_COLORS[idx % TASK_COLORS.length];
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border transition-all relative overflow-hidden"
                  style={{
                    background: task.completed ? 'rgba(16,185,129,0.06)' : 'var(--color-surface-muted, #151721)',
                    borderColor: task.completed ? 'rgba(16,185,129,0.35)' : 'var(--color-border, rgba(255,255,255,0.07))',
                  }}
                >
                  {/* ⭐ Left color bar */}
                  <span
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{
                      background: task.completed ? '#10B981' : color.bar,
                      boxShadow: `0 0 8px ${task.completed ? 'rgba(16,185,129,0.5)' : color.glow}`,
                    }}
                  />

                  <div className="flex items-center gap-3 flex-1 min-w-0 pl-2">
                    {/* ⭐ SQUARE tick box (rounded-md, not rounded-full) */}
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0"
                      style={
                        task.completed
                          ? {
                              background: 'linear-gradient(135deg, #10B981, #059669)',
                              borderColor: '#10B981',
                              boxShadow: '0 0 10px rgba(16,185,129,0.45)',
                            }
                          : {
                              background: 'var(--color-surface, #181A23)',
                              borderColor: color.bar,
                            }
                      }
                    >
                      {task.completed && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                        {task.title}
                      </p>
                      <p className="text-[10px] mt-0.5 font-bold" style={{ color: task.completed ? '#10B981' : color.bar }}>
                        ⏱ {task.estimatedMinutes} min
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 rounded-lg text-text-muted hover:bg-danger/10 hover:text-danger transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {todayTasks.length === 0 && (
          <div className="py-8 text-center text-text-muted text-sm">
            No tasks yet. Add one above to get started. ✨
          </div>
        )}
      </div>

      {/* Daily Notes */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-lg space-y-3">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Notes & Reflections
        </h3>
        <textarea
          rows={4}
          value={dailyProgress.notes || ''}
          onChange={e => handleNotesChange(e.target.value)}
          placeholder="Write important notes, formulas, or reflections here..."
          className="w-full p-4 rounded-xl bg-surface-muted border border-border text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 leading-relaxed transition-all resize-none"
        />
        <p className="text-[10px] text-text-muted">Auto-saved • Private to you</p>
      </div>
    </div>
  );
};