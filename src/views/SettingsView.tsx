import React, { useState } from 'react';
import { UserProfile, AcademicGroup, PreferredLanguage, AppTheme } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { PageId } from '../components/Sidebar';
import { clearAllLocalData, seedDemoData, flushPendingSyncs } from '../utils/storageEngine';
import { NotificationSettings } from '../components/NotificationSettings';
import { PwaStatusCard } from '../components/PwaStatusCard';
import { AyahCollectionCard } from '../components/AyahCollectionCard';
import { AvatarPicker } from '../components/AvatarPicker';
import { AvatarCrop, DEFAULT_CROP } from '../components/UserAvatar';
import { getAvatarUrl } from '../utils/defaultAvatars';
import { Settings, User, Database, Trash2, RefreshCw, Code, LogIn, LogOut, Shield } from 'lucide-react';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onRefreshAppState: () => void;
  onNavigate: (page: PageId) => void;
  onAddToast: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
  onLogout: () => void;
}

const MICRO: React.CSSProperties = {
  fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
  color: '#475569', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
};

const CARD: React.CSSProperties = {
  background: 'rgba(13,16,22,0.7)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
  borderRadius: 16,
};

const INPUT = 'w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-[#FBBF24] transition-colors bn';

const LABEL = 'block text-[9px] font-bold mb-1.5 uppercase tracking-[0.15em]';

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile, onUpdateProfile, onRefreshAppState, onNavigate, onAddToast, onLogout,
}) => {
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [nickname, setNickname] = useState(profile.nickname || '');
  const [targetUniversity, setTargetUniversity] = useState(profile.targetUniversity || '');
  const [academicGroup, setAcademicGroup] = useState<AcademicGroup>(profile.academicGroup || 'Science');
  const [dailyTargetHours, setDailyTargetHours] = useState<number>(profile.dailyStudyTargetHours || 8);
  const [preferredLanguage, setPreferredLanguage] = useState<PreferredLanguage>(profile.preferredLanguage || 'bn');
  const [theme, setTheme] = useState<AppTheme>(profile.theme || 'dark');
  const [useGooglePhoto, setUseGooglePhoto] = useState<boolean>(profile.useGooglePhoto !== false);
  const [avatarCrop, setAvatarCrop] = useState<AvatarCrop>(profile.avatarCrop || DEFAULT_CROP);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const handleAvatarSelect = (id: string) => {
    setUseGooglePhoto(false);
    const url = getAvatarUrl(id);
    onUpdateProfile({ ...profile, defaultAvatarId: id, useGooglePhoto: false, avatar_url: url, photoURL: url });
    onAddToast('success', '🎭 Avatar আপডেট হয়েছে!');
  };

  const handleToggleGoogle = (v: boolean) => {
    setUseGooglePhoto(v);
    const g = profile.photoURL || profile.avatar_url || '';
    const url = v ? g : getAvatarUrl(profile.defaultAvatarId || 'av1');
    onUpdateProfile({ ...profile, useGooglePhoto: v, avatar_url: url, photoURL: url });
  };

  const handleCropChange = (c: AvatarCrop) => {
    setAvatarCrop(c);
    onUpdateProfile({ ...profile, avatarCrop: c });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      displayName: displayName.trim() || 'HSC Candidate',
      nickname: nickname.trim() || 'Candidate',
      targetUniversity: targetUniversity.trim() || 'BUET / DU',
      academicGroup,
      dailyStudyTargetHours: Number(dailyTargetHours),
      preferredLanguage,
      theme,
      updatedAt: new Date().toISOString(),
    });
    onAddToast('success', 'প্রোফাইল সেটিংস সেভ করা হয়েছে!');
  };

  const actions = [
    { label: 'ডেমো ডেটা', icon: Database, tint: '#38BDF8', onClick: () => { seedDemoData(); onRefreshAppState(); onAddToast('success', 'নমুনা ডেমো ডেটা লোড হয়েছে!'); } },
    { label: 'ক্লাউড সিঙ্ক', icon: RefreshCw, tint: '#FBBF24', onClick: async () => { const n = await flushPendingSyncs(); onRefreshAppState(); onAddToast('info', `${n} টি পরিবর্তন সিঙ্ক হয়েছে!`); } },
    { label: 'ডেভ প্যানেল', icon: Code, tint: '#F59E0B', onClick: () => onNavigate('dev_panel') },
    ...(profile.isAdmin ? [{ label: 'অ্যাডমিন', icon: Shield, tint: '#A855F7', onClick: () => onNavigate('admin') }] : []),
    { label: 'লগইন পেজ', icon: LogIn, tint: '#94A3B8', onClick: () => onNavigate('login') },
    { label: 'সাইন আউট', icon: LogOut, tint: '#F87171', onClick: onLogout },
    { label: 'স্টোরেজ মুছুন', icon: Trash2, tint: '#FB7185', onClick: () => setIsClearModalOpen(true) },
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      {/* ═══ PAGE HEADER ═══ */}
      <div>
        <p style={MICRO}>Settings</p>
        <h1 className="text-xl sm:text-2xl font-black bn mt-1" style={{ color: '#F4F6F8', fontFamily: "'Anek Bangla', sans-serif" }}>
          প্রোফাইল ও প্রেফারেন্স
        </h1>
      </div>

      {/* ═══ AVATAR ═══ */}
      <AvatarPicker
        googlePhotoUrl={profile.photoURL || profile.avatar_url}
        currentAvatarId={profile.defaultAvatarId || 'av1'}
        useGooglePhoto={profile.useGooglePhoto !== false}
        crop={profile.avatarCrop || DEFAULT_CROP}
        onSelectDefault={handleAvatarSelect}
        onToggleGoogle={handleToggleGoogle}
        onCropChange={handleCropChange}
      />

      {/* ═══ PROFILE FORM ═══ */}
      <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-5" style={CARD}>
        <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <User className="w-3.5 h-3.5" style={{ color: '#FBBF24' }} />
          <p style={{ ...MICRO, color: '#94A3B8' }}>Profile</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL} style={{ color: '#64748B' }}>পূর্ণ নাম</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className={LABEL} style={{ color: '#64748B' }}>ডাক নাম</label>
            <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className={LABEL} style={{ color: '#64748B' }}>টার্গেট ইউনিভার্সিটি</label>
            <input type="text" value={targetUniversity} onChange={(e) => setTargetUniversity(e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className={LABEL} style={{ color: '#64748B' }}>গ্রুপ</label>
            <select value={academicGroup} onChange={(e) => setAcademicGroup(e.target.value as AcademicGroup)} className={INPUT}>
              <option value="Science">Science (বিজ্ঞান)</option>
              <option value="Commerce">Commerce (ব্যবসায়)</option>
              <option value="Arts">Arts (মানবিক)</option>
            </select>
          </div>
          <div>
            <label className={LABEL} style={{ color: '#64748B' }}>দৈনিক লক্ষ্য (ঘণ্টা)</label>
            <input type="number" min={1} max={18} value={dailyTargetHours} onChange={(e) => setDailyTargetHours(Number(e.target.value))} className={INPUT} />
          </div>
          <div>
            <label className={LABEL} style={{ color: '#64748B' }}>থিম</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value as AppTheme)} className={INPUT}>
              <option value="dark">Dark (ডিফল্ট)</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        <div>
          <label className={LABEL} style={{ color: '#64748B' }}>ভাষা</label>
          <div className="grid grid-cols-3 gap-2">
            {([['bn', 'বাংলা'], ['en', 'English'], ['both', 'বাংলা+EN']] as [PreferredLanguage, string][]).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPreferredLanguage(id)}
                className="py-2.5 rounded-xl text-[11px] font-bold bn transition-all"
                style={
                  preferredLanguage === id
                    ? { background: 'linear-gradient(135deg,#FBBF24,#D97706)', color: '#0F111A', boxShadow: '0 4px 14px rgba(251,191,36,0.3)' }
                    : { background: 'rgba(255,255,255,0.03)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-xs font-extrabold bn transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg,#FBBF24,#D97706)', color: '#0F111A', boxShadow: '0 4px 14px rgba(251,191,36,0.3)' }}
          >
            সেভ করুন
          </button>
        </div>
      </form>

      {/* ═══ ACTIONS GRID ═══ */}
      <div className="p-5 sm:p-6 space-y-4" style={CARD}>
        <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Database className="w-3.5 h-3.5" style={{ color: '#FBBF24' }} />
          <p style={{ ...MICRO, color: '#94A3B8' }}>System</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              className="flex items-center gap-2.5 p-3 rounded-xl transition-all hover:bg-white/[0.05] active:scale-[0.98]"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${a.tint}15`, border: `1px solid ${a.tint}30` }}>
                <a.icon className="w-3.5 h-3.5" style={{ color: a.tint }} />
              </span>
              <span className="text-[10px] font-bold bn text-left" style={{ color: '#CBD5E1' }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ EXISTING SECTIONS ═══ */}
      <NotificationSettings />
      <PwaStatusCard />
      <AyahCollectionCard />

      <ConfirmationModal
        isOpen={isClearModalOpen}
        title="সকল লোকাল ডেটা মুছে ফেলা"
        message="আপনি কি নিশ্চিত যে লোকাল স্টোরেজে সংরক্ষিত সকল প্রোগ্রেস ও কাস্টম নোটস মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা সম্ভব হবে না।"
        confirmLabel="হ্যাঁ, সব মুছে ফেলুন"
        onConfirm={() => { clearAllLocalData(); onRefreshAppState(); setIsClearModalOpen(false); onAddToast('warning', 'সকল লোকাল ডেটা মুছে ফেলা হয়েছে!'); }}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
};