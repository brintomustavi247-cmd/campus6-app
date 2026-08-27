import React, { useState } from 'react';
import { TimerSession, SubjectCategory } from '../types';
import { FocusTimer } from '../components/FocusTimer';
import { Clock, Swords, CheckCircle2, History, Zap, Trophy } from 'lucide-react';

interface FocusTimerViewProps {
  onSessionComplete: (session: TimerSession) => void;
  recentSessions: TimerSession[];
  initialTopic?: string;
  initialSubject?: SubjectCategory;
}

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({
  onSessionComplete,
  recentSessions,
  initialTopic,
  initialSubject
}) => {
  const totalFocusMins = recentSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  return (
    <div className="space-y-6  pb-16 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-cyan-950 to-surface border border-cyan-800/60 shadow-xl text-text-primary text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-400 border-cyan-500/40 text-xs font-bold mb-2">
          <Zap className="w-4 h-4" />
          ২ মিনিট Start Rule & Pomodoro Engine
        </div>
        <h2 className="text-2xl font-black text-text-primary">
          ডেইলি ফোকাস ও স্টাডি টাইমার
        </h2>
        <p className="text-xs text-text-secondary/90  mt-1">
          পড়ায় মন না বসলে প্রথমে মাত্র ২ মিনিটের জন্য Start Mode চালু করো। পড়ার ফ্লো তৈরি হয়ে যাবে!
        </p>
      </div>

      {/* Main Focus Timer Component */}
      <FocusTimer
        onSessionComplete={onSessionComplete}
        initialTopic={initialTopic}
        initialSubject={initialSubject}
      />

      {/* Timer Session History & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-cyan-900/50 shadow-lg text-text-primary flex items-center justify-between">
          <div>
            <span className="text-xs font-bold   text-cyan-400">আজকের মোট ফোকাস সময়</span>
            <p className="text-2xl font-black text-text-primary font-mono mt-1">
              {totalFocusMins} <span className="text-xs font-normal text-cyan-400">মিনিট</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-950/80 text-cyan-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-cyan-900/50 shadow-lg text-text-primary flex items-center justify-between">
          <div>
            <span className="text-xs font-bold   text-cyan-400">সম্পন্ন ফোকাস সেশন</span>
            <p className="text-2xl font-black text-cyan-400 font-mono mt-1">
              {recentSessions.length} <span className="text-xs font-normal text-cyan-400">টি</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-950/80 text-cyan-400">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-cyan-900/50 shadow-lg text-text-primary flex items-center justify-between">
          <div>
            <span className="text-xs font-bold   text-cyan-400">পড়াশোনার ফ্লো রেটিং</span>
            <p className="text-2xl font-black text-cyan-400 font-mono mt-1">
              {recentSessions.length >= 3 ? 'High Flow 🔥' : 'Moderate'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-950/80 text-cyan-400">
            <Swords className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* History Log Table */}
      <div className="p-5 rounded-2xl bg-surface border border-cyan-900/50 shadow-lg space-y-3">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          সাম্প্রতিক ফোকাস সেশন লগে (Focus Logs)
        </h3>

        {recentSessions.length === 0 ? (
          <p className="text-xs text-cyan-400/70 italic py-4 text-center">
            এখনো কোনো ফোকাস সেশন সম্পন্ন হয়নি। টাইমার চালু করে পড়া শেষ করো!
          </p>
        ) : (
          <div className="space-y-2">
            {recentSessions.map(s => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-muted border border-cyan-900/50 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="font-bold text-text-primary">{s.topicName}</span>
                    <span className="text-[10px] text-cyan-400/70 ml-2">({s.subject})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-cyan-400">
                    {s.durationMinutes} মি.
                  </span>
                  <span className="text-[10px] text-cyan-400/80">
                    {new Date(s.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
