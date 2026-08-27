import React from 'react';
import { SubjectStat } from '../types';
import { BookMarked, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface SubjectProgressCardProps {
  stat: SubjectStat;
  onSelectSubject?: (subject: string) => void;
}

export const SubjectProgressCard: React.FC<SubjectProgressCardProps> = ({
  stat,
  onSelectSubject
}) => {
  const percent = stat.totalRoutineTopics > 0 
    ? Math.round((stat.completedTopicsCount / stat.totalRoutineTopics) * 100) 
    : 0;

  return (
    <div className="p-4 rounded-2xl bg-surface border border-border shadow-md text-text-primary flex flex-col justify-between hover:border-emerald-500/50 transition-all">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold text-xs border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
            {stat.subject}
          </span>
          <span className="text-xs font-mono font-bold text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]">
            {percent}%
          </span>
        </div>

        <div className="w-full bg-surface-muted rounded-full h-2 mb-3 overflow-hidden border border-border">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] text-text-muted mb-3">
          <div className="flex items-center gap-1.5">
            <BookMarked className="w-3.5 h-3.5 text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
            <span>টপিক: {stat.completedTopicsCount}/{stat.totalRoutineTopics}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
            <span>MCQs: {stat.mcqsSolved}</span>
          </div>
        </div>

        {stat.weakTopics.length > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20 mb-3 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">দুর্বল বিষয়: {stat.weakTopics.join(', ')}</span>
          </div>
        )}
      </div>

      {onSelectSubject && (
        <button
          onClick={() => onSelectSubject(stat.subject)}
          className="mt-2 w-full py-2 rounded-xl bg-surface-muted hover:bg-emerald-500/10 border border-border-strong text-text-primary text-xs font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[40px] hover:text-emerald-400 group"
        >
          অধ্যায় বিস্তারিত
          <ArrowRight className="w-3.5 h-3.5 group-hover:text-emerald-400" />
        </button>
      )}
    </div>
  );
};
