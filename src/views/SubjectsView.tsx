import React, { useState } from 'react';
import { SubjectStat, SubjectCategory } from '../types';
import { SubjectProgressCard } from '../components/SubjectProgressCard';
import { BookOpenCheck, Search, Filter, AlertCircle, Plus, CheckCircle2 } from 'lucide-react';

interface SubjectsViewProps {
  subjectsStats: SubjectStat[];
  onUpdateSubjectStat?: (updated: SubjectStat) => void;
  onAddToast: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjectsStats,
  onUpdateSubjectStat,
  onAddToast
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [newWeakTopic, setNewWeakTopic] = useState('');
  const [activeSubjectForWeakTopic, setActiveSubjectForWeakTopic] = useState<SubjectCategory>('Physics');

  const filteredStats = subjectsStats.filter(stat => {
    const matchesSubject = selectedSubject === 'All' || stat.subject === selectedSubject;
    const matchesSearch = stat.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stat.weakTopics.some(wt => wt.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesSearch;
  });

  const handleAddWeakTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeakTopic.trim()) return;

    const targetStat = subjectsStats.find(s => s.subject === activeSubjectForWeakTopic);
    if (targetStat && onUpdateSubjectStat) {
      const updated: SubjectStat = {
        ...targetStat,
        weakTopics: [...targetStat.weakTopics, newWeakTopic.trim()]
      };
      onUpdateSubjectStat(updated);
      setNewWeakTopic('');
      onAddToast('success', `${activeSubjectForWeakTopic}-এ নতুন দুর্বল বিষয় যুক্ত হয়েছে!`);
    }
  };

  return (
    <div className="space-y-6  pb-16 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm border border-border-strong shadow-xl text-text-primary">
        <div className="flex items-center gap-2 text-gold mb-1">
          <BookOpenCheck className="w-5 h-5" />
          <span className="text-xs font-bold  ">বিষয়ভিত্তিক সিলেবাস এনালিটিক্স</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-text-primary">
          সাবজেক্ট প্রোগ্রেস ও দুর্বলতা ট্র্যাকার
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary/90 mt-1">
          পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত, জীববিজ্ঞান ও ইংরেজির অধ্যায়ভিত্তিক অগ্রগতি ট্র্যাকিং।
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface border border-border shadow-md">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gold" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="বিষয় বা টপিক খুঁজুন..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-surface-muted border border-border text-text-primary text-xs focus:outline-none focus:border-gold"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Physics', 'Chemistry', 'Higher Mathematics', 'Biology', 'English'].map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all min-h-[38px] ${
                selectedSubject === sub
                  ? 'bg-gold text-[#0F111A] shadow-md'
                  : 'bg-surface-muted text-text-muted hover:bg-red-900 border border-border'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStats.map(stat => (
          <SubjectProgressCard
            key={stat.subject}
            stat={stat}
            onSelectSubject={sub => setSelectedSubject(sub)}
          />
        ))}
      </div>

      {/* Add Weak Topic Form */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-lg space-y-3">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          দুর্বল বিষয়/টপিক চিহ্নিত করুন (Weak Topic Logger)
        </h3>
        <p className="text-[11px] text-text-muted">
          যে অধ্যায় বা সূত্রে সমস্যা হচ্ছে তা নোট করে রাখো যেন পরীক্ষার আগে রিভিশন দেওয়া সহজ হয়।
        </p>

        <form onSubmit={handleAddWeakTopic} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <select
            value={activeSubjectForWeakTopic}
            onChange={e => setActiveSubjectForWeakTopic(e.target.value as SubjectCategory)}
            className="sm:col-span-4 px-3 py-2 rounded-xl bg-surface-muted border border-border text-text-primary text-xs focus:outline-none focus:border-gold"
          >
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Higher Mathematics">Higher Mathematics</option>
            <option value="Biology">Biology</option>
            <option value="English">English</option>
          </select>

          <input
            type="text"
            value={newWeakTopic}
            onChange={e => setNewWeakTopic(e.target.value)}
            placeholder="যেমন: ভেক্টর নদী-নৌকার টাইপ ৩"
            className="sm:col-span-6 px-3.5 py-2 rounded-xl bg-surface-muted border border-border text-text-primary text-xs focus:outline-none focus:border-gold"
          />

          <button
            type="submit"
            className="sm:col-span-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white shadow-sm border border-transparent text-slate-50 text-xs font-bold shadow-md transition-colors min-h-[40px] flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            সেভ করুন
          </button>
        </form>
      </div>
    </div>
  );
};
