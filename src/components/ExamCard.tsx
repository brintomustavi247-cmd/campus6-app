import React from 'react';
import { Award, AlertCircle, ArrowRight } from 'lucide-react';

interface ExamCardProps {
  examTopic?: string;
  onOpenExamPrep?: () => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({
  examTopic,
  onOpenExamPrep
}) => {
  if (!examTopic) return null;

  return (
    <div className="p-4 rounded-2xl bg-surface-muted border border-border border border-amber-600/50 shadow-md text-amber-100 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-amber-900/80 text-gold border border-amber-700/60 shrink-0">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-gold">
            <AlertCircle className="w-3.5 h-3.5" />
            আজকের নির্ধারিত পরীক্ষা
          </div>
          <h4 className="text-sm font-extrabold text-text-primary mt-0.5">{examTopic}</h4>
          <p className="text-[11px] text-amber-200/80">পড়াশোনার পর ৫-১০টি MCQ সলভ করে নিজেকে ঝালিয়ে নাও!</p>
        </div>
      </div>

      {onOpenExamPrep && (
        <button
          onClick={onOpenExamPrep}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold hover:bg-[#b88e22] text-[#0F111A] text-xs font-bold shadow-md transition-all shrink-0 min-h-[44px]"
        >
          প্রস্তুতি
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
