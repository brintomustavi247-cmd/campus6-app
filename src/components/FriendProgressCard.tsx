import React from 'react';
import { FriendUser } from '../types';
import { Flame, Target, Trophy, Clock, Trash2 } from 'lucide-react';

interface FriendProgressCardProps {
  friend: FriendUser;
  onRemove?: (code: string) => void;
}

export const FriendProgressCard: React.FC<FriendProgressCardProps> = ({
  friend,
  onRemove
}) => {
  return (
    <div className="p-4 rounded-2xl bg-surface border border-border shadow-md text-text-primary flex flex-col justify-between hover:border-border-strong transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-900 border-2 border-gold flex items-center justify-center font-bold text-text-primary text-sm shadow-md shrink-0">
            {friend.nickname ? friend.nickname.charAt(0).toUpperCase() : 'F'}
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary">{friend.nickname}</h4>
            <p className="text-[11px] text-text-muted flex items-center gap-1">
              <Target className="w-3 h-3 text-gold" />
              {friend.targetUniversity || 'Admission Candidate'}
            </p>
          </div>
        </div>

        {onRemove && (
          <button
            onClick={() => onRemove(friend.friendCode)}
            className="p-1.5 rounded-lg text-gold hover:text-rose-400 hover:bg-rose-950/40 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Remove Friend"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center p-2.5 rounded-xl bg-surface-muted border border-border">
        <div>
          <span className="text-[9px] font-bold text-gold flex items-center justify-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" />
            স্ট্রিক
          </span>
          <p className="text-sm font-bold text-amber-400 font-mono mt-0.5">
            {friend.streakCount} দিন
          </p>
        </div>

        <div>
          <span className="text-[9px] font-bold text-gold flex items-center justify-center gap-1">
            <Trophy className="w-3 h-3 text-gold" />
            সাপ্তাহিক
          </span>
          <p className="text-sm font-bold text-gold font-mono mt-0.5">
            {friend.weeklyCompletionPercent}%
          </p>
        </div>

        <div>
          <span className="text-[9px] font-bold text-gold flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-text-muted" />
            পড়ার ঘণ্টা
          </span>
          <p className="text-sm font-bold text-text-secondary font-mono mt-0.5">
            {friend.totalStudyHours}h
          </p>
        </div>
      </div>
    </div>
  );
};
