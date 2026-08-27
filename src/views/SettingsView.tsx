import React, { useState } from 'react';
import { UserProfile, AcademicGroup, PreferredLanguage, AppTheme } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { clearAllLocalData, seedDemoData, flushPendingSyncs } from '../utils/storageEngine';
import { 
  Settings, 
  User, 
  Database, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  Moon, 
  Sun, 
  Globe, 
  Target, 
  Code,
  LogIn,
  LogOut
} from 'lucide-react';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onRefreshAppState: () => void;
  onNavigate: (page: any) => void;
  onAddToast: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onRefreshAppState,
  onNavigate,
  onAddToast,
  onLogout
}) => {
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [nickname, setNickname] = useState(profile.nickname || '');
  const [targetUniversity, setTargetUniversity] = useState(profile.targetUniversity || '');
  const [academicGroup, setAcademicGroup] = useState<AcademicGroup>(profile.academicGroup || 'Science');
  const [dailyTargetHours, setDailyTargetHours] = useState<number>(profile.dailyStudyTargetHours || 8);
  const [preferredLanguage, setPreferredLanguage] = useState<PreferredLanguage>(profile.preferredLanguage || 'bn');
  const [theme, setTheme] = useState<AppTheme>(profile.theme || 'dark');
  const [religion, setReligion] = useState(profile.religion || '');

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      displayName: displayName.trim() || 'HSC Candidate',
      nickname: nickname.trim() || 'Candidate',
      targetUniversity: targetUniversity.trim() || 'BUET / DU',
      academicGroup,
      dailyStudyTargetHours: Number(dailyTargetHours),
      preferredLanguage,
      theme,
      religion: religion || undefined,
      updatedAt: new Date().toISOString()
    };

    onUpdateProfile(updated);
    onAddToast('success', 'প্রোফাইল সেটিংস সেভ করা হয়েছে!');
  };

  const handleSeedData = () => {
    seedDemoData();
    onRefreshAppState();
    onAddToast('success', 'নমুনা ডেমো ডেটা লোড করা হয়েছে!');
  };

  const handleConfirmClear = () => {
    clearAllLocalData();
    onRefreshAppState();
    setIsClearModalOpen(false);
    onAddToast('warning', 'সকল লোকাল ডেটা মুছে ফেলা হয়েছে!');
  };

  const handleForceSync = async () => {
    const syncedCount = await flushPendingSyncs();
    onRefreshAppState();
    onAddToast('info', `${syncedCount} টি পেন্ডিং পরিবর্তন সিঙ্ক হয়েছে!`);
  };

  return (
    <div className="space-y-6  pb-16 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-surface border-border-strong shadow-xl text-text-primary">
        <div className="flex items-center gap-2 text-gold mb-1">
          <Settings className="w-5 h-5" />
          <span className="text-xs font-bold  ">অ্যাপ সেটিংস ও প্রেফারেন্স</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-text-primary">
          প্রোফাইল, থিম ও ডাটাবেজ কন্ট্রোল
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary/90 mt-1">
          প্রোফাইল তথ্য আপডেট, থিম পছন্দ এবং লোকাল স্টোরেজ সিঙ্ক ম্যানেজ করুন।
        </p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-surface border border-border shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 pb-2 border-b border-border">
          <User className="w-4 h-4 text-gold" />
          ব্যক্তিগত ও একাডেমিক তথ্য
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">পূর্ণ নাম</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-text-primary text-xs focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">ডাক নাম</label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-text-primary text-xs focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">টার্গেট ইউনিভার্সিটি/মেডিকেল</label>
            <input
              type="text"
              value={targetUniversity}
              onChange={e => setTargetUniversity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-text-primary text-xs focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">গ্রুপ (Academic Group)</label>
            <select
              value={academicGroup}
              onChange={e => setAcademicGroup(e.target.value as AcademicGroup)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-muted border border-border text-text-primary text-xs focus:outline-none focus:border-gold"
            >
              <option value="Science">Science (বিজ্ঞান)</option>
              <option value="Commerce">Commerce (ব্যবসায়)</option>
              <option value="Arts">Arts (মানবিক)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">দৈনিক অধ্যয়ন লক্ষ্য (ঘণ্টা)</label>
            <input
              type="number"
              min="1"
              max="18"
              value={dailyTargetHours}
              onChange={e => setDailyTargetHours(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-text-primary text-xs focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">ধর্ম (Religion)</label>
            <select
              value={religion}
              onChange={e => setReligion(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-muted border border-border text-text-primary text-xs focus:outline-none focus:border-gold"
            >
              <option value="">নির্বাচন করুন</option>
              <option value="Islam">Islam (ইসলাম)</option>
              <option value="Hinduism">Hinduism (সনাতন)</option>
              <option value="Buddhism">Buddhism (বৌদ্ধ)</option>
              <option value="Christianity">Christianity (খ্রিস্টান)</option>
              <option value="Other">Other (অন্যান্য)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">অ্যাপ থিম (App Theme)</label>
            <select
              value={theme}
              onChange={e => setTheme(e.target.value as AppTheme)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-muted border border-border text-text-primary text-xs focus:outline-none focus:border-gold"
            >
              <option value="dark">Dark Theme (ডিফল্ট)</option>
              <option value="light">Light Theme</option>
              <option value="system">System Default</option>
            </select>
          </div>
        </div>
               <div>
         <label className="text-xs font-semibold text-text-secondary block mb-1">অ্যাপ থিম (App Theme)</label>
         <select
           value={theme}
           onChange={e => setTheme(e.target.value as AppTheme)}
           className="w-full px-3 py-2.5 rounded-xl bg-surface-muted border border-border text-text-primary text-xs focus:outline-none focus:border-gold"
         >
           <option value="dark">Dark Theme (ডিফল্ট)</option>
           <option value="light">Light Theme</option>
           <option value="system">System Default</option>
         </select>
       </div>
       
       {/* ⭐ NEW: Language selector */}
       <div>
         <label className="text-xs font-semibold text-text-secondary block mb-1">পছন্দের ভাষা (Language)</label>
         <div className="grid grid-cols-3 gap-2">
           {[
             { id: 'bn', label: 'বাংলা' },
             { id: 'en', label: 'English' },
             { id: 'both', label: 'বাংলা+EN' }
           ].map(l => (
             <button
               key={l.id}
               type="button"
               onClick={() => setPreferredLanguage(l.id as PreferredLanguage)}
               className={`p-2.5 rounded-xl border text-xs font-bold transition-all min-h-[44px] ${
                 preferredLanguage === l.id
                   ? 'bg-gold hover:bg-[#b88e22] text-[#0F111A] shadow-md border-transparent'
                   : 'bg-surface-muted border-border text-text-secondary hover:border-gold/50'
               }`}
             >
               {l.label}
             </button>
           ))}
         </div>
         <p className="text-[10px] text-text-muted mt-1.5">
           {preferredLanguage === 'en' && 'All subjects and topics will appear in English.'}
           {preferredLanguage === 'bn' && 'সকল বিষয় ও টপিক বাংলায় দেখাবে।'}
           {preferredLanguage === 'both' && 'বিষয় ও টপিক বাংলায় দেখাবে (English in brackets)।'}
         </p>
       </div>

        <div className="pt-3 border-t border-border flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gold hover:bg-[#b88e22] text-[#0F111A] font-extrabold text-xs shadow-lg transition-all min-h-11"
          >
            পরিবর্তনগুলো সেভ করুন
          </button>
        </div>
      </form>

      {/* Storage & Demo Actions */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 pb-2 border-b border-border">
          <Database className="w-4 h-4 text-gold" />
          লোকাল স্টোরেজ ও ডেমো ডাটাবেজ
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSeedData}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover border border-transparent text-text-primary text-xs font-bold shadow-md transition-all flex items-center gap-2 min-h-11"
          >
            <Database className="w-4 h-4 text-gold" />
            নমুনা ডেমো ডেটা লোড করুন
          </button>

          <button
            onClick={handleForceSync}
            className="px-4 py-2.5 rounded-xl bg-red-900 hover:bg-red-800 text-text-primary text-xs font-bold border-border-strong transition-all flex items-center gap-2 min-h-11"
          >
            <RefreshCw className="w-4 h-4 text-gold" />
            Force Cloud Sync
          </button>

          <button
            onClick={() => onNavigate('dev_panel')}
            className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-2 min-h-11"
          >
            <Code className="w-4 h-4 text-gold" />
            Developer Test Suite
          </button>

          <button
            onClick={() => onNavigate('login')}
            className="px-4 py-2.5 rounded-xl bg-surface-muted hover:bg-red-900 border border-border text-text-muted text-xs font-mono font-bold transition-all flex items-center gap-2 min-h-11"
          >
            <LogIn className="w-4 h-4 text-gold" />
            System Login Page
          </button>

          <button
            onClick={onLogout}
            className="px-4 py-2.5 rounded-xl bg-red-950 hover:bg-red-900 border border-red-800/60 text-red-200 text-xs font-bold shadow-md transition-all flex items-center gap-2 min-h-11"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>

          <button
            onClick={() => setIsClearModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800/60 text-rose-200 text-xs font-bold shadow-md transition-all flex items-center gap-2 min-h-11 ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            Clear Storage
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Clearing Storage */}
      <ConfirmationModal
        isOpen={isClearModalOpen}
        title="সকল লোকাল ডেটা মুছে ফেলা"
        message="আপনি কি নিশ্চিত যে লোকাল স্টোরেজে সংরক্ষিত সকল প্রোগ্রেস ও কাস্টম নোটস মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা সম্ভব হবে না।"
        confirmLabel="হ্যাঁ, সব মুছে ফেলুন"
        onConfirm={handleConfirmClear}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
};
