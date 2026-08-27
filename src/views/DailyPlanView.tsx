import React, { useState } from 'react';
import { UserProfile, DailyProgress, CustomTask, ChecklistItem, ChecklistSectionId } from '../types';
import { getRoutineForDate } from '../data/routineData';
import { DateSelector } from '../components/DateSelector';
import { DailyRoutineCard } from '../components/DailyRoutineCard';
import { ExamCard } from '../components/ExamCard';
import { ChecklistSection } from '../components/ChecklistSection';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { CustomMissionBuilder } from '../components/CustomMissionBuilder';
import { CHECKLIST_SECTIONS_ORDER } from '../utils/checklistGenerator';
import { getLocalFriends } from '../utils/storageEngine';
import { 
  Swords, 
  HeartHandshake, 
  Share2, 
  RotateCcw, 
  CheckCircle2, 
  Plus, 
  FileText, 
  Trash2, 
  Clock, 
  CheckCheck,
  Rocket
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

const MOTIVATIONAL_QUOTES = [
  "প্রতিদিনের ছোট ছোট প্রচেষ্টাই একদিন বুয়েট/ঢাবিতে চান্স এনে দেয়।",
  "আজ যে পরিশ্রম করছ, কাল তা তোমার বিজয়ের ইতিহাস হবে।",
  "অজুহাত নয়, কেবল একনিষ্ঠ পড়ার টেবিলই সফলতার একমাত্র পথ।",
  "পরিশ্রম কখনো বৃথা যায় না। লেগে থাকো শেষ মুহূর্ত পর্যন্ত।"
];

export const DailyPlanView: React.FC<DailyPlanViewProps> = ({
  profile,
  selectedDateKey,
  onDateChange,
  todayKey,
  dailyProgress,
  onUpdateProgress,
  onOpenShareModal,
  onAddToast
}) => {
  const [activeMode, setActiveMode] = useState<'campus' | 'custom'>('campus');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const friends = getLocalFriends();
  
  const routine = getRoutineForDate(selectedDateKey);

  // Filter checklist items by section
  const getSectionItems = (sectionId: ChecklistSectionId) => {
    return (dailyProgress.checklist || []).filter(item => item.section === sectionId);
  };

  // Checklist item toggle handler
  const handleToggleChecklistItem = (itemId: string) => {
    const updatedChecklist = dailyProgress.checklist.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          completed: !item.completed,
          completedAt: !item.completed ? new Date().toISOString() : undefined,
          isPendingSync: true
        };
      }
      return item;
    });
    onUpdateProgress({
      ...dailyProgress,
      checklist: updatedChecklist
    });
  };

  // Section complete all handler
  const handleCompleteAllSection = (sectionId: ChecklistSectionId) => {
    const updatedChecklist = dailyProgress.checklist.map(item => {
      if (item.section === sectionId) {
        return {
          ...item,
          completed: true,
          completedAt: new Date().toISOString(),
          isPendingSync: true
        };
      }
      return item;
    });
    onUpdateProgress({
      ...dailyProgress,
      checklist: updatedChecklist
    });
    onAddToast('success', 'সেকশনের সব কাজ সম্পন্ন চিহ্নিত করা হয়েছে!');
  };

  // Complete Entire Day
  const handleCompleteEntireDay = () => {
    const updatedChecklist = dailyProgress.checklist.map(item => ({
      ...item,
      completed: true,
      completedAt: new Date().toISOString(),
      isPendingSync: true
    }));
    const updatedCustom = (dailyProgress.customTasks || []).map(task => ({
      ...task,
      completed: true,
      completedAt: new Date().toISOString()
    }));
    onUpdateProgress({
      ...dailyProgress,
      checklist: updatedChecklist,
      customTasks: updatedCustom
    });
    onAddToast('success', '🎉 মাশাল্লাহ! পুরো দিনের সকল টাস্ক সফলভাবে সম্পন্ন করা হয়েছে!');
  };

  // Reset Entire Day
  const handleConfirmResetDay = () => {
    const resetChecklist = dailyProgress.checklist.map(item => ({
      ...item,
      completed: false,
      completedAt: undefined,
      isPendingSync: true
    }));
    const resetCustom = (dailyProgress.customTasks || []).map(task => ({
      ...task,
      completed: false,
      completedAt: undefined
    }));
    onUpdateProgress({
      ...dailyProgress,
      checklist: resetChecklist,
      customTasks: resetCustom,
      studyHours: 0,
      notes: ''
    });
    setIsResetModalOpen(false);
    onAddToast('warning', 'দিনের সকল প্রোগ্রেস রিসেট করা হয়েছে!');
  };

  // Add Custom Task
  const handleAddCustomMission = (mission: any) => {
    const newTask: CustomTask = {
      id: `custom_${Date.now()}`,
      dateKey: selectedDateKey,
      title: mission.title,
      subject: mission.subject as any,
      priority: 'High',
      estimatedMinutes: mission.estimatedMinutes,
      completed: false
    };
    onUpdateProgress({
      ...dailyProgress,
      customTasks: [...(dailyProgress.customTasks || []), newTask]
    });
    onAddToast('success', 'Mission deployed successfully!');
  };

  const handleDeployCoopMission = (friendCode: string, mission: any) => {
    const friend = friends.find(f => f.friendCode === friendCode);
    if (!friend) return;
    
    // Simulate real-time Firebase trigger delay
    setTimeout(() => {
      onAddToast('info', `🎮 ${friend.displayName} invited you to a Combined Study Session on ${mission.subject}! [Accept] / [Decline]`);
    }, 1500);
  };

  // Toggle Custom Task
  const handleToggleCustomTask = (taskId: string) => {
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
  const handleDeleteCustomTask = (taskId: string) => {
    const updatedTasks = (dailyProgress.customTasks || []).filter(t => t.id !== taskId);
    onUpdateProgress({
      ...dailyProgress,
      customTasks: updatedTasks
    });
    onAddToast('info', 'Task মুছে ফেলা হয়েছে।');
  };

  // Handle Notes Autosave
  const handleNotesChange = (text: string) => {
    onUpdateProgress({
      ...dailyProgress,
      notes: text
    });
  };

  // Calculate estimated study time sum
  const totalEstimatedMins = dailyProgress.checklist.reduce((acc, curr) => acc + (curr.estimatedMinutes || 0), 0);
  const totalEstimatedHours = (totalEstimatedMins / 60).toFixed(1);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in">
      {/* Date Picker Header */}
      <DateSelector
        selectedDateKey={selectedDateKey}
        onDateChange={onDateChange}
        todayKey={todayKey}
      />

      {/* DUAL-MODE TOGGLE (THE SWITCHER) */}
      <div className="relative flex p-1.5 rounded-full bg-surface-muted border border-border shadow-inner max-w-sm mx-auto overflow-hidden">
        {/* Animated Sliding Glow */}
        <div 
          className={`absolute inset-y-1.5 w-[calc(50%-6px)] rounded-full transition-all duration-500 ease-out z-0 ${
            activeMode === 'campus' 
              ? 'left-1.5 bg-gold/20 shadow-[0_0_15px_rgba(250,204,21,0.5)] border border-gold/50' 
              : 'left-[calc(50%+4.5px)] bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-500/50'
          }`} 
        />
        
        <button
          onClick={() => setActiveMode('campus')}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold transition-colors ${
            activeMode === 'campus' ? 'text-gold' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Swords className="w-4 h-4" />
          Campus 6.0 Mode
        </button>
        <button
          onClick={() => setActiveMode('custom')}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold transition-colors ${
            activeMode === 'custom' ? 'text-emerald-400' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Rocket className="w-4 h-4" />
          Custom Mission
        </button>
      </div>

      {activeMode === 'campus' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
          {/* Motivational Quote & Dua Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-white/14 shadow-lg text-text-primary flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-surface-muted text-gold border border-gold shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gold">
                  দৈনিক দোয়া ও অনুপ্রেরণা (Dua & Motivation)
                </h3>
                <p className="text-xs font-semibold text-text-primary mt-1 leading-snug">
                  "রব্বি জিদনী ইলমা" — হে আমার রব, আমার জ্ঞান বাড়িয়ে দিন। (সূরা ত্বাহা: ১১৪)
                </p>
                <p className="text-[11px] text-text-secondary/90 italic mt-0.5">
                  "{MOTIVATIONAL_QUOTES[Math.abs(selectedDateKey.length) % MOTIVATIONAL_QUOTES.length]}"
                </p>
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCompleteEntireDay}
                className="px-3.5 py-2 rounded-xl bg-[#16A34A] hover:bg-red-700 text-text-primary text-xs font-bold shadow-md transition-all flex items-center gap-1.5 min-h-11"
              >
                <CheckCheck className="w-4 h-4" />
                সমগ্র দিন সম্পন্ন
              </button>
              <button
                onClick={onOpenShareModal}
                className="p-2.5 rounded-xl bg-surface-muted hover:bg-red-900 border border-border text-gold transition-all min-h-11 min-w-11 flex items-center justify-center"
                title="শেয়ার করুন"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsResetModalOpen(true)}
                className="p-2.5 rounded-xl bg-surface-muted hover:bg-rose-950 border border-border text-rose-300 transition-all min-h-11 min-w-11 flex items-center justify-center"
                title="দিন রিসেট করুন"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Routine & Exam Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <DailyRoutineCard routine={routine} />
              {routine.examTopic && <ExamCard examTopic={routine.examTopic} />}
            </div>

            {/* Daily Stats Summary Box */}
            <div className="p-5 rounded-2xl bg-surface border border-border shadow-lg text-text-primary flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-xs font-bold text-text-secondary">
                    আজকের এডমিশন প্রোগ্রেস
                  </h3>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    মাস্টার রুটিন ট্র্যাকিং
                  </p>
                </div>
                <div className="w-14 h-14">
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3">
                <div className="p-2.5 rounded-xl bg-surface-muted border border-border">
                  <span className="text-[10px] font-bold text-emerald-500">সম্পন্ন কাজ</span>
                  <p className="text-base font-extrabold text-text-primary font-mono mt-0.5">
                    {dailyProgress.completedCount} / {dailyProgress.totalCount}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-muted border border-border">
                  <span className="text-[10px] font-bold text-gold">আনুমানিক সময়</span>
                  <p className="text-base font-extrabold text-gold font-mono mt-0.5">
                    ~{totalEstimatedHours} ঘণ্টা
                  </p>
                </div>
              </div>

              {/* Study Hours Logger */}
              <div className="pt-3 border-t border-border space-y-2">
                <label className="text-xs font-semibold text-text-secondary flex items-center justify-between">
                  <span>আজকের পড়ার সময় (ঘণ্টা):</span>
                  <span className="font-bold font-mono text-gold">{dailyProgress.studyHours}h</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="16"
                  step="0.5"
                  value={dailyProgress.studyHours}
                  onChange={e => onUpdateProgress({ ...dailyProgress, studyHours: parseFloat(e.target.value) })}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Checklist Sections (A to G in exact order) */}
          <div className="space-y-5">
            <h2 className="text-base font-extrabold text-text-primary flex items-center gap-2">
              <Swords className="w-5 h-5 text-gold" />
              আজকের মাস্টার এডমিশন চেকক্লিস্ট (Master Checklist)
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {CHECKLIST_SECTIONS_ORDER.map(section => {
                const items = getSectionItems(section.id);
                if (items.length === 0) return null;
                return (
                  <ChecklistSection
                    key={section.id}
                    sectionId={section.id}
                    items={items}
                    onToggleItem={handleToggleChecklistItem}
                    onCompleteAllSection={handleCompleteAllSection}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeMode === 'custom' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <CustomMissionBuilder 
            onAddMission={handleAddCustomMission} 
            onDeployCoopMission={handleDeployCoopMission}
            friends={friends}
          />
          
          {/* Custom Tasks Section */}
          <div className="p-6 rounded-3xl bg-surface border border-border shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 uppercase tracking-wide">
                <Rocket className="w-4 h-4 text-emerald-500" />
                Deployed Missions
              </h3>
              <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                {(dailyProgress.customTasks || []).filter(t => t.completed).length}/{(dailyProgress.customTasks || []).length}
              </span>
            </div>

            {/* List of custom tasks */}
            <div className="space-y-3">
              {(dailyProgress.customTasks || []).length === 0 && (
                <div className="py-8 text-center border border-dashed border-border rounded-xl bg-surface-muted/50 text-text-muted text-sm font-medium">
                  No missions deployed yet.
                </div>
              )}
              {(dailyProgress.customTasks || []).map(task => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${
                    task.completed
                      ? 'bg-emerald-500/5 border-emerald-500/30 opacity-80'
                      : 'bg-[#1E2030] border-border hover:border-emerald-500/50 shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleCustomTask(task.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shadow-inner ${
                        task.completed ? 'bg-emerald-500 border-emerald-500 text-[#1E2030]' : 'border-emerald-600/50 hover:bg-emerald-500/20'
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold tracking-wide ${task.completed ? 'line-through text-emerald-500/60' : 'text-emerald-50'}`}>
                        {task.title}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted flex gap-2">
                        <span>{task.subject}</span>
                        <span>•</span>
                        <span className="text-emerald-500/80">{task.estimatedMinutes} Mins</span>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCustomTask(task.id)}
                    className="p-2 rounded-lg text-text-muted hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                    title="Delete Mission"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Daily Notes Editor (Common for both modes) */}
      <div className="p-6 rounded-3xl bg-surface border border-border shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <FileText className="w-5 h-5 text-gold" />
          আজকের প্রাইভেট নোটস ও ভুল সংশোধনী (Daily Notes & Summary)
        </h3>
        <p className="text-xs text-text-muted">
          আজকে যে সুত্র বা থিওরি ভুলে গিয়েছিলে বা গুরুত্বপূর্ণ নোটস এখানে লিখে রাখো (অটো সেভ হয়, শেয়ার কার্ডে দেখাবে না)।
        </p>
        <textarea
          rows={4}
          value={dailyProgress.notes || ''}
          onChange={e => handleNotesChange(e.target.value)}
          placeholder="এখানে আজকের গুরুত্বপূর্ন নোটস বা ভুলগুলো লিখে রাখো..."
          className="w-full p-4 rounded-xl bg-surface-muted border border-border text-text-primary text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 leading-relaxed transition-all shadow-inner placeholder:text-text-muted/50"
        />
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={isResetModalOpen}
        title="দিনের প্রোগ্রেস রিসেট"
        message="আপনি কি আজকের সকল সম্পন্ন কাজ ও নোটস রিসেট করতে চান? এই কাজ পরবর্তীতে ফেরা যাবে না।"
        confirmLabel="হ্যাঁ, রিসেট করুন"
        onConfirm={handleConfirmResetDay}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
};
