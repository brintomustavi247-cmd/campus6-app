import React, { useState } from 'react';
import { FriendUser } from '../../types';
import { Flame, Zap, Target, MoreVertical, Trash2 } from 'lucide-react';

interface LiveFriendCardProps {
  friend: FriendUser;
  onRemove?: (code: string) => void;
  // Mock properties for the ambient competition
  status: 'deep_focus' | 'idle' | 'offline';
  currentTask?: string;
  focusTime?: string;
  momentumScore: number;
}

export const LiveFriendCard: React.FC<LiveFriendCardProps> = ({ friend, onRemove, status, currentTask, focusTime, momentumScore }) => {
  const [pokeSent, setPokeSent] = useState(false);

  const handlePoke = () => {
    setPokeSent(true);
    setTimeout(() => setPokeSent(false), 2000);
  };

  const statusColors = {
    deep_focus: 'bg-emerald-500',
    idle: 'bg-yellow-400',
    offline: 'bg-slate-600'
  };

  const statusBorder = {
    deep_focus: 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    idle: 'border-yellow-400/30',
    offline: 'border-slate-800'
  };

  return (
    <div className={`p-4 rounded-2xl bg-[#1E2030] border ${statusBorder[status]} transition-all flex flex-col justify-between group relative`}>
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-11 h-11 rounded-full bg-[#0F111A] border-2 ${status === 'deep_focus' ? 'border-emerald-500' : 'border-slate-700'} flex items-center justify-center font-bold text-white text-sm shadow-md shrink-0`}>
              {friend.nickname ? friend.nickname.charAt(0).toUpperCase() : 'F'}
            </div>
            {/* Status Dot */}
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#1E2030] ${statusColors[status]}`} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              {friend.nickname}
            </h4>
            <p className="text-[11px] text-blue-400 font-semibold flex items-center gap-1 mt-0.5">
              <Target className="w-3 h-3" />
              {friend.targetUniversity || 'Admission Candidate'}
            </p>
          </div>
        </div>
        
        {onRemove && (
          <button
            onClick={() => onRemove(friend.friendCode)}
            className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
            title="Remove Friend"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Rich Presence Context */}
      <div className="mb-4">
        {status === 'deep_focus' ? (
          <div className="bg-[#0F111A] rounded-xl p-3 border border-emerald-900/30">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Deep Focus
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-100">{focusTime}</span>
            </div>
            <p className="text-xs font-semibold text-slate-300 truncate">{currentTask}</p>
          </div>
        ) : status === 'idle' ? (
          <div className="bg-[#0F111A] rounded-xl p-3 border border-yellow-900/30">
            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-1 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              Idle (5m+)
            </span>
            <p className="text-xs font-semibold text-slate-400 truncate">Away from desk</p>
          </div>
        ) : (
          <div className="bg-[#0F111A] rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-1">
              Offline
            </span>
            <p className="text-xs font-semibold text-slate-600 truncate">Last active 2h ago</p>
          </div>
        )}
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-[#0F111A] rounded-xl p-2.5 flex items-center justify-center gap-1.5 border border-slate-800">
          <Flame className={`w-3.5 h-3.5 ${momentumScore >= 50 ? 'text-amber-500' : 'text-slate-500'}`} />
          <span className="text-xs font-black font-mono text-white">{momentumScore}</span>
          <span className="text-[9px] text-slate-500 font-bold uppercase">Mom</span>
        </div>
        
        {status !== 'offline' && (
          <button 
            onClick={handlePoke}
            disabled={pokeSent}
            className={`flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border font-bold text-xs transition-all ${
              pokeSent 
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                : 'bg-blue-600 hover:bg-blue-500 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)]'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${pokeSent ? 'animate-bounce' : ''}`} />
            {pokeSent ? 'Sent!' : 'Energy'}
          </button>
        )}
      </div>
    </div>
  );
};
