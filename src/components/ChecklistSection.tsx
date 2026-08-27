import React from 'react';
import { ChecklistItem as ChecklistItemType, ChecklistSectionId } from '../types';
import { ChecklistItem } from './ChecklistItem';
import { CHECKLIST_SECTIONS_ORDER } from '../utils/checklistGenerator';
import { CheckCheck } from 'lucide-react';

interface ChecklistSectionProps {
  sectionId: ChecklistSectionId;
  items: ChecklistItemType[];
  onToggleItem: (id: string) => void;
  onCompleteAllSection: (sectionId: ChecklistSectionId) => void;
}

export const ChecklistSection: React.FC<ChecklistSectionProps> = ({
  sectionId,
  items,
  onToggleItem,
  onCompleteAllSection
}) => {
  if (!items || items.length === 0) return null;

  const sectionInfo = CHECKLIST_SECTIONS_ORDER.find(s => s.id === sectionId) || {
    id: sectionId,
    titleBn: sectionId,
    titleEn: sectionId
  };

  const completedCount = items.filter(i => i.completed).length;
  const isAllCompleted = completedCount === items.length && items.length > 0;

  return (
    <div className="p-4 rounded-2xl bg-surface border border-border shadow-md">
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-border">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2">
            <span>{sectionInfo.titleBn}</span>
          </h3>
          <p className="text-[10px] text-gold font-mono tracking-wider">
            {sectionInfo.titleEn}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-surface-muted text-gold border border-border">
            {completedCount}/{items.length}
          </span>

          {!isAllCompleted && (
            <button
              onClick={() => onCompleteAllSection(sectionId)}
              className="p-1.5 rounded-lg bg-red-900/50 hover:bg-red-800 text-text-secondary hover:text-text-primary transition-colors text-xs font-medium min-h-[36px] flex items-center gap-1"
              title="সবগুলো সম্পন্ন চিহ্নিত করুন"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">সবগুলো</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {items.map(item => (
          <ChecklistItem key={item.id} item={item} onToggle={onToggleItem} />
        ))}
      </div>
    </div>
  );
};
