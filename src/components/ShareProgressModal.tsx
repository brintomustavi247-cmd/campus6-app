import React, { useState } from 'react';
import { UserProfile, DailyProgress } from '../types';
import { calculateStreak } from '../utils/storageEngine';
import { X, Share2, Copy, Check, Flame, Trophy, Calendar, Swords } from 'lucide-react';

interface ShareProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  todayKey: string;
  progress: DailyProgress;
  onAddToast: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
}

export const ShareProgressModal: React.FC<ShareProgressModalProps> = ({
  isOpen,
  onClose,
  profile,
  todayKey,
  progress,
  onAddToast
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const streak = calculateStreak(todayKey);

  const dateObj = new Date(`${todayKey}T00:00:00`);
  const formattedDate = dateObj.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', year: 'numeric' });

  const shareText = `🎓 Campus 6.0 — Daily Study Engine Progress Report
📅 Date: ${formattedDate}
🎯 Target: ${profile.targetUniversity}
🔥 Streak: ${streak.currentStreak} Days
✅ Progress: ${progress.completionPercent}% (${progress.completedCount}/${progress.totalCount} Tasks)
⏱️ Study Hours: ${progress.studyHours}h

"রব্বি জিদনী ইলমা" — হে আমার রব, আমার জ্ঞান বাড়িয়ে দিন।`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    onAddToast('success', 'শেয়ারিং টেক্সট ক্লিপবোর্ডে কপি করা হয়েছে!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="relative w-full max-w-md bg-bg border border-border rounded-3xl p-6 shadow-2xl text-text-primary space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-gold hover:text-text-primary hover:bg-red-900/40 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-gold">
          <Share2 className="w-5 h-5" />
          <h3 className="text-sm font-bold  ">সোশ্যাল প্রোগ্রেস কার্ড শেয়ার</h3>
        </div>

        {/* Visual Share Card Mockup */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm border-gold shadow-xl text-text-primary space-y-4 text-center relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-border-strong text-left">
            <div>
              <h4 className="text-sm font-black text-text-primary">{profile.nickname || 'Student'}</h4>
              <p className="text-[10px] text-text-secondary">Target: {profile.targetUniversity}</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-muted text-gold font-mono font-bold">
              CAMPUS 6.0
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 my-2">
            <div className="p-2 rounded-xl bg-surface-muted border border-border">
              <span className="text-[9px]  font-bold text-text-muted">স্ট্রিক</span>
              <p className="text-lg font-black text-amber-400 font-mono mt-0.5">{streak.currentStreak}d</p>
            </div>
            <div className="p-2 rounded-xl bg-surface-muted border border-border">
              <span className="text-[9px]  font-bold text-text-muted">সম্পন্ন %</span>
              <p className="text-lg font-black text-gold font-mono mt-0.5">{progress.completionPercent}%</p>
            </div>
            <div className="p-2 rounded-xl bg-surface-muted border border-border">
              <span className="text-[9px]  font-bold text-text-muted">পড়ার সময়</span>
              <p className="text-lg font-black text-text-secondary font-mono mt-0.5">{progress.studyHours}h</p>
            </div>
          </div>

          <p className="text-[11px] text-text-primary font-medium italic">
            "রব্বি জিদনী ইলমা" — হে আমার রব, আমার জ্ঞান বাড়িয়ে দিন।
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleCopyText}
            className="w-full py-3 rounded-xl bg-gold hover:bg-[#b88e22] text-[#0F111A] text-xs font-extrabold shadow-lg transition-all flex items-center justify-center gap-2 min-h-[44px]"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'কপি করা হয়েছে!' : 'কপি প্রোগ্রেস টেক্সট'}
          </button>
        </div>
      </div>
    </div>
  );
};
