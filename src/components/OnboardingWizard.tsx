import React, { useState } from 'react';
import { UserProfile, AcademicGroup, PreferredLanguage, AppTheme } from '../types';
import { Swords, ArrowRight, ArrowLeft, CheckCircle2, Target, BookOpen, Clock } from 'lucide-react';

interface OnboardingWizardProps {
  isOpen: boolean;
  initialProfile: UserProfile;
  onComplete: (updatedProfile: UserProfile) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  initialProfile,
  onComplete
}) => {
  const [step, setStep] = useState<number>(1);
  const [displayName, setDisplayName] = useState(initialProfile.displayName || '');
  const [nickname, setNickname] = useState(initialProfile.nickname || '');
  const [targetUniversity, setTargetUniversity] = useState(initialProfile.targetUniversity || 'Dhaka University (A Unit) / BUET');
  const [academicGroup, setAcademicGroup] = useState<AcademicGroup>(initialProfile.academicGroup || 'Science');
  const [dailyTargetHours, setDailyTargetHours] = useState<number>(initialProfile.dailyStudyTargetHours || 8);
  const [preferredLanguage, setPreferredLanguage] = useState<PreferredLanguage>(initialProfile.preferredLanguage || 'bn');
  const [theme, setTheme] = useState<AppTheme>(initialProfile.theme || 'dark');
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(initialProfile.reminderEnabled ?? true);

  if (!isOpen) return null;

  const handleFinish = () => {
    const updated: UserProfile = {
      ...initialProfile,
      displayName: displayName || nickname || 'HSC Candidate',
      nickname: nickname || displayName || 'Candidate',
      targetUniversity,
      academicGroup,
      dailyStudyTargetHours: dailyTargetHours,
      preferredLanguage,
      theme,
      reminderEnabled,
      updatedAt: new Date().toISOString()
    };
    onComplete(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-bg border border-border rounded-3xl p-6 sm:p-8 shadow-2xl text-text-primary flex flex-col justify-between max-h-[90vh] overflow-y-auto">
        {/* Wizard Header Progress */}
        <div>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2 text-gold">
              <Swords className="w-5 h-5" />
              <span className="text-xs font-bold ">CAMPUS 6.0 Onboarding</span>
            </div>
            <span className="text-xs font-mono font-bold text-text-muted">
              Step {step} of 3
            </span>
          </div>

          <div className="w-full bg-surface-muted rounded-full h-1.5 mb-6">
            <div
              className="bg-gold h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          {/* STEP 1: Academic Profile */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-text-primary">১. তোমার একাডেমিক লক্ষ্য ও পরিচয়</h2>
              <p className="text-xs text-text-muted leading-relaxed">
                এইচএসসি এডমিশন প্রস্তুতিকে সুশৃঙ্খল করতে তোমার লক্ষ্য তথ্য সেট করো।
              </p>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">পূর্ণ নাম (Full Name)</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="যেমন: রহিম আহমেদ"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-text-primary text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">ডাক নাম (Nickname)</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="যেমন: রহিম"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-text-primary text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">টার্গেট ইউনিভার্সিটি/মেডিকেল</label>
                <input
                  type="text"
                  value={targetUniversity}
                  onChange={e => setTargetUniversity(e.target.value)}
                  placeholder="যেমন: DU A Unit / BUET / DMC"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-text-primary text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">গ্রুপ (Group)</label>
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
                  <label className="text-xs font-semibold text-text-secondary block mb-1">দৈনিক টার্গেট (ঘণ্টা)</label>
                  <input
                    type="number"
                    min="1"
                    max="18"
                    value={dailyTargetHours}
                    onChange={e => setDailyTargetHours(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-muted border border-border text-text-primary text-xs focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Preferences */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-text-primary">২. ভাষা ও অ্যাপ প্রেফারেন্স</h2>
              <p className="text-xs text-text-muted leading-relaxed">
                পছন্দের থিম ও নোটিফিকেশন সেটিংস সিলেক্ট করুন।
              </p>

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
                      onClick={() => setPreferredLanguage(l.id as PreferredLanguage)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all min-h-[44px] ${
                        preferredLanguage === l.id
                          ? 'bg-primary hover:bg-primary-hover text-white shadow-sm border border-transparent text-text-primary shadow-md'
                          : 'bg-surface-muted border-border text-text-secondary'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">অ্যাপ থিম (Theme)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'dark', label: 'Dark Mode' },
                    { id: 'light', label: 'Light Mode' },
                    { id: 'system', label: 'System' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as AppTheme)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all min-h-[44px] ${
                        theme === t.id
                          ? 'bg-primary hover:bg-primary-hover text-white shadow-sm border border-transparent text-text-primary shadow-md'
                          : 'bg-surface-muted border-border text-text-secondary'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-muted border border-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={e => setReminderEnabled(e.target.checked)}
                    className="w-4 h-4 accent-yellow-400 rounded"
                  />
                  <span className="text-xs text-text-primary font-medium">
                    ক্লাস ও পরীক্ষার ৩০ মিনিট আগে রিমাইন্ডার পান
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: Explanation & Getting Started */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-text-primary">৩. ডেইলি স্টাডি ইঞ্জিন যেভাবে কাজ করে</h2>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-muted border border-border">
                  <BookOpen className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">মাসটার রুটিন অনুসারণ</h4>
                    <p className="text-[11px] text-text-muted">আগস্ট ২১ - অক্টোবর ৫ পর্যন্ত নির্ভুল সিলেবাসভিত্তিক রুটিন অটো লোড হবে।</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-muted border border-border">
                  <Target className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">৭০% রুল ও স্ট্রিক অর্জন</h4>
                    <p className="text-[11px] text-text-muted">প্রতিদিনেরChecklist এর ৭০% কাজ সম্পন্ন করলে তোমার Study Streak সুরক্ষিত থাকবে।</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-muted border border-border">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">২ মিনিট Start Mode & টাইমার</h4>
                    <p className="text-[11px] text-text-muted">পড়াশোনায় অলসতা দূর করতে প্রথমে শুধু ২ মিনিটের ফোকাস টাইমার শুরু করো!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between gap-3 mt-8 pt-4 border-t border-border">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-text-muted text-xs font-bold hover:bg-red-900/40 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              পেছনে
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white shadow-sm border border-transparent text-text-primary text-xs font-bold shadow-lg min-h-[44px] ml-auto"
            >
              পরবর্তী step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gold hover:bg-[#b88e22] text-[#0F111A] text-xs font-extrabold shadow-xl min-h-[44px] ml-auto"
            >
              <CheckCircle2 className="w-4 h-4" />
              পড়ালেখা শুরু করো
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
