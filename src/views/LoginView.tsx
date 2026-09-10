import React, { useState } from 'react';
import { Mail, Key, User, Phone, BookOpen, ArrowRight, ChevronDown, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { getAppBaseUrl } from '../utils/authBaseUrl';

interface LoginViewProps {
  onLoginSuccess: (userEmail?: string) => void;
  onDemoEntry?: () => void;
  onAddToast?: (type: 'success' | 'info' | 'warning' | 'error', message: string, title?: string) => void;
}

type Lang = 'bn' | 'en';

/* ═══════════ PREMIUM FONTS ═══════════ */
const FONT_BN = "'Hind Siliguri', 'Noto Sans Bengali', sans-serif";
const FONT_EN = "'Plus Jakarta Sans', sans-serif";
const FONT_DISPLAY = "'Orbitron', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

const bodyFont = (l: Lang) => (l === 'bn' ? FONT_BN : FONT_EN);
const labelFont = (l: Lang) => (l === 'bn' ? FONT_BN : FONT_DISPLAY);

/* ═══════════ TRANSLATIONS ═══════════ */
const T = {
  bn: {
    subtitle: 'ডেইলি স্টাডি ইঞ্জিন',
    login: 'লগইন', register: 'রেজিস্টার',
    email: 'ইমেইল', emailPh: 'আপনার ইমেইল লিখুন',
    password: 'পাসওয়ার্ড', forgot: 'পাসওয়ার্ড ভুলে গেছেন?',
    loginBtn: 'লগইন করুন', or: 'অথবা',
    google: 'Google দিয়ে লগইন করুন', connecting: 'সংযোগ হচ্ছে...',
    demo: 'ডেমো মোডে ঘুরে দেখুন', demoHint: 'লগইন ছাড়াই অ্যাপ এক্সপ্লোর করুন',
    basicInfo: 'মৌলিক তথ্য', fullName: 'পুরো নাম', namePh: 'আপনার নাম',
    confirmPass: 'পাসওয়ার্ড নিশ্চিত করুন', personal: 'ব্যক্তিগত তথ্য',
    phone: 'মোবাইল নম্বর', gender: 'লিঙ্গ', genderPh: 'লিঙ্গ নির্বাচন করুন',
    religion: 'ধর্ম', religionPh: 'ধর্ম নির্বাচন করুন',
    academic: 'একাডেমিক তথ্য', institution: 'বর্তমান প্রতিষ্ঠান', institutionPh: 'কলেজের নাম',
    batch: 'HSC ব্যাচ', batchPh: 'বছর নির্বাচন করুন',
    target: 'ভর্তি লক্ষ্য', targetPh: 'লক্ষ্য নির্বাচন করুন',
    registerBtn: 'রেজিস্টার করুন',
    footer: 'ক্যাম্পাস ৬.০ • প্রিমিয়াম স্টাডি প্ল্যাটফর্ম',
    errFill: 'ইমেইল ও পাসওয়ার্ড দিন', errTitle: 'ত্রুটি',
    okLogin: 'লগইন সফল হয়েছে', okLoginTitle: 'স্বাগতম',
    errPassMatch: 'পাসওয়ার্ড মিলছে না',
    errDropdown: 'সব ড্রপডাউন পূরণ করুন', errDropdownTitle: 'অসম্পূর্ণ ফর্ম',
    okReg: 'রেজিস্ট্রেশন সফল! CAMPUS 6.0-তে স্বাগতম।', okRegTitle: 'সফল',
    options: {
      male: 'পুরুষ', female: 'মহিলা', other: 'অন্যান্য',
      islam: 'ইসলাম', hinduism: 'হিন্দু', buddhism: 'বৌদ্ধ', christianity: 'খ্রিস্টান',
      engineering: 'ইঞ্জিনিয়ারিং', medical: 'মেডিকেল', gst: 'GST', varsity: 'ভার্সিটি',
    },
  },
  en: {
    subtitle: 'Daily Study Engine',
    login: 'Login', register: 'Register',
    email: 'Email', emailPh: 'Enter your email',
    password: 'Password', forgot: 'Forgot password?',
    loginBtn: 'Sign In', or: 'OR',
    google: 'Continue with Google', connecting: 'Connecting...',
    demo: 'Explore Demo Mode', demoHint: 'Try the app without signing in',
    basicInfo: 'Basic Info', fullName: 'Full Name', namePh: 'Your name',
    confirmPass: 'Confirm Password', personal: 'Personal & Contact',
    phone: 'Phone Number', gender: 'Gender', genderPh: 'Select gender',
    religion: 'Religion', religionPh: 'Select religion',
    academic: 'Academic Profile', institution: 'Current Institution', institutionPh: 'College name',
    batch: 'HSC Batch', batchPh: 'Select year',
    target: 'Admission Target', targetPh: 'Select target',
    registerBtn: 'Create Account',
    footer: 'CAMPUS 6.0 • Premium Study Platform',
    errFill: 'Please enter email and password', errTitle: 'Error',
    okLogin: 'Login successful', okLoginTitle: 'Welcome',
    errPassMatch: 'Passwords do not match',
    errDropdown: 'Please fill all dropdown fields', errDropdownTitle: 'Incomplete Form',
    okReg: 'Registration successful! Welcome to CAMPUS 6.0.', okRegTitle: 'Success',
    options: {
      male: 'Male', female: 'Female', other: 'Other',
      islam: 'Islam', hinduism: 'Hinduism', buddhism: 'Buddhism', christianity: 'Christianity',
      engineering: 'Engineering', medical: 'Medical', gst: 'GST', varsity: 'Varsity',
    },
  },
};

/* ═══════════ REAL CAMPUS 6.0 LOGO (building + book + 6) ═══════════ */
const CampusLogo = ({ size = 130 }: { size?: number }) => (
  <div className="relative flex items-center justify-center group">
    <div
      className="absolute rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700"
      style={{
        width: size * 1.5,
        height: size * 1.5,
        background: 'radial-gradient(circle, rgba(53,214,255,0.30) 0%, rgba(220,20,60,0.12) 45%, transparent 70%)',
        animation: 'campusLogoPulse 2.5s ease-in-out infinite',
      }}
    />
    <svg
      width={size}
      height={size * 0.81}
      viewBox="0 0 260 210"
      xmlns="http://www.w3.org/2000/svg"
      className="relative z-10 transition-transform duration-500 group-hover:scale-105"
      style={{ filter: 'drop-shadow(0 0 25px rgba(53,214,255,0.3))' }}
    >
      <defs>
        <linearGradient id="loginSilver" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDFDFD" />
          <stop offset="55%" stopColor="#C7CED6" />
          <stop offset="100%" stopColor="#8E99A4" />
        </linearGradient>
      </defs>
      <g stroke="#29ABE2" strokeWidth="4" fill="none" strokeLinecap="round">
        <path d="M28 60 h22 l14 14" /><path d="M22 86 h30 l12 12" />
        <path d="M30 112 h26 l10 10" /><path d="M40 136 h20 l8 8" />
      </g>
      <g fill="#29ABE2">
        <circle cx="26" cy="60" r="5" /><circle cx="20" cy="86" r="5" />
        <circle cx="28" cy="112" r="5" /><circle cx="38" cy="136" r="5" />
      </g>
      <g stroke="#E23B4E" strokeWidth="4" fill="none" strokeLinecap="round">
        <path d="M232 60 h-22 l-14 14" /><path d="M238 86 h-30 l-12 12" />
        <path d="M230 112 h-26 l-10 10" /><path d="M220 136 h-20 l-8 8" />
      </g>
      <g fill="#E23B4E">
        <circle cx="234" cy="60" r="5" /><circle cx="240" cy="86" r="5" />
        <circle cx="232" cy="112" r="5" /><circle cx="222" cy="136" r="5" />
      </g>
      <polygon points="130,8 154,22 154,95 106,95 106,22" fill="url(#loginSilver)" />
      <polygon points="130,8 154,22 130,36 106,22" fill="#F1F5F9" />
      <g fill="#64748B" opacity=".5">
        <rect x="117" y="42" width="5" height="46" /><rect x="128" y="42" width="5" height="46" /><rect x="139" y="42" width="5" height="46" />
      </g>
      <polygon points="84,48 104,40 104,118 84,126" fill="url(#loginSilver)" />
      <polygon points="176,48 156,40 156,118 176,126" fill="url(#loginSilver)" />
      <g fill="#64748B" opacity=".5">
        <rect x="89" y="54" width="4" height="8" /><rect x="96" y="54" width="4" height="8" />
        <rect x="89" y="68" width="4" height="8" /><rect x="96" y="68" width="4" height="8" />
        <rect x="89" y="82" width="4" height="8" /><rect x="96" y="82" width="4" height="8" />
        <rect x="160" y="54" width="4" height="8" /><rect x="167" y="54" width="4" height="8" />
        <rect x="160" y="68" width="4" height="8" /><rect x="167" y="68" width="4" height="8" />
        <rect x="160" y="82" width="4" height="8" /><rect x="167" y="82" width="4" height="8" />
      </g>
      <path d="M58 134 Q95 122 130 142 Q165 122 202 134 L189 156 Q160 146 130 164 Q100 146 71 156 Z" fill="url(#loginSilver)" />
      <path d="M54 146 Q95 138 128 158 L130 164 Q100 146 71 156 Z" fill="#7DC242" />
      <path d="M206 146 Q165 138 132 158 L130 164 Q160 146 189 156 Z" fill="#7B4FBF" />
      <text x="130" y="130" textAnchor="middle" fontFamily="Orbitron, sans-serif" fontSize="62" fontWeight="700" fill="url(#loginSilver)">6</text>
    </svg>
    <style>{`@keyframes campusLogoPulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.75;transform:scale(1.08)}}`}</style>
  </div>
);

/* ═══════════ CUSTOM SELECT ═══════════ */
const CustomSelect = ({
  options, value, onChange, placeholder, font,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  font: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative w-full">
      <div
        className={`w-full flex justify-between items-center cursor-pointer transition-all duration-300 ease-in-out rounded-xl py-3.5 px-4 bg-[#0A0D13]/90 shadow-inner border ${
          isOpen ? 'border-[#DC143C]/80 ring-4 ring-[#DC143C]/20' : 'border-white/10 hover:border-white/20'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selected ? 'text-white' : 'text-gray-500'} style={{ fontSize: '14px', fontFamily: font }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#DC143C]' : ''}`} />
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <ul className="absolute z-50 w-full mt-2 bg-[#1A1C27] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
            {options.map((opt) => (
              <li
                key={opt.value}
                className="px-4 py-3 text-sm text-gray-300 hover:bg-[#DC143C]/15 hover:text-[#FBBF24] cursor-pointer transition-colors"
                style={{ fontFamily: font }}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

/* ═══════════ LOGIN VIEW ═══════════ */
export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onDemoEntry, onAddToast }) => {
  const appBaseUrl = getAppBaseUrl();

  const [lang, setLang] = useState<Lang>(() => {
    try {
      return localStorage.getItem('campus6_language') === 'en' ? 'en' : 'bn';
    } catch {
      return 'bn';
    }
  });
  const changeLang = (l: Lang) => {
    setLang(l);
    try { localStorage.setItem('campus6_language', l); } catch { /* ignore */ }
  };

  const t = T[lang];
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [religion, setReligion] = useState('');
  const [institution, setInstitution] = useState('');
  const [hscBatch, setHscBatch] = useState('');
  const [target, setTarget] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const inputFont = bodyFont(lang);
  const lblFont = labelFont(lang);
  const labelStyle: React.CSSProperties = { fontFamily: lblFont, color: '#FBBF24' };
  const labelCls = 'text-[11px] font-bold tracking-wide pl-1';
  const inputCls =
    'w-full bg-[#0A0D13]/90 border border-white/10 rounded-xl py-3.5 pr-4 pl-11 text-white transition-all duration-300 ease-in-out focus:outline-none focus:border-[#DC143C]/80 focus:ring-4 focus:ring-[#DC143C]/20 shadow-inner hover:border-white/20';

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setGoogleError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${appBaseUrl}/auth/callback`,
        queryParams: { prompt: 'select_account', access_type: 'offline' },
      },
    });
    if (error) {
      console.error('Supabase Google Sign-In Error:', error.message);
      setGoogleError(error.message);
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { onAddToast?.('error', t.errFill, t.errTitle); return; }
    onAddToast?.('success', t.okLogin, t.okLoginTitle);
    onLoginSuccess(email);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== confirmPassword) { onAddToast?.('error', t.errPassMatch, t.errTitle); return; }
    if (!gender || !religion || !hscBatch || !target) { onAddToast?.('warning', t.errDropdown, t.errDropdownTitle); return; }
    onAddToast?.('success', t.okReg, t.okRegTitle);
    onLoginSuccess(regEmail);
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-4 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out relative overflow-hidden"
      style={{
        backgroundColor: '#090C11',
        backgroundImage:
          'radial-gradient(circle at 20% 30%, rgba(220,20,60,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(53,214,255,0.06) 0%, transparent 50%)',
      }}
    >
      {/* ═══ SQUARE LANGUAGE TOGGLE ═══ */}
      <div className="absolute top-5 right-5 z-20 flex gap-2">
        {(['bn', 'en'] as Lang[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => changeLang(l)}
            className={`w-11 h-11 rounded-xl text-sm font-bold transition-all duration-300 border ${
              lang === l
                ? 'text-white border-transparent shadow-[0_0_18px_rgba(220,20,60,0.45)] scale-105'
                : 'bg-[#0A0D13]/80 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
            }`}
            style={{
              background: lang === l ? 'linear-gradient(135deg, #DC143C, #9E0E29)' : undefined,
              fontFamily: l === 'bn' ? FONT_BN : FONT_DISPLAY,
            }}
          >
            {l === 'bn' ? 'বাং' : 'EN'}
          </button>
        ))}
      </div>

      <div className={`w-full mx-auto transition-all duration-500 ease-in-out relative z-10 ${mode === 'register' ? 'max-w-3xl' : 'max-w-md'}`}>
        {/* ═══ HEADER ══ */}
        <div className="flex flex-col items-center justify-center w-full mb-8">
          <CampusLogo size={130} />
          <h2 className="mt-5 text-3xl font-black text-white tracking-[4px] uppercase" style={{ fontFamily: FONT_DISPLAY }}>
            CAMPUS <span style={{ color: '#29ABE2' }}>6</span><span style={{ color: '#7DC242' }}>.</span><span style={{ color: '#E23B4E' }}>0</span>
          </h2>
          <p className="text-[11px] tracking-[0.3em] uppercase mt-2" style={{ fontFamily: lang === 'bn' ? FONT_BN : FONT_MONO, color: '#0AA8D8' }}>
            {t.subtitle}
          </p>
        </div>

        {/* ═══ CARD ═══ */}
        <div
          className="bg-[#12151D]/85 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8"
          style={{ boxShadow: '0 20px 50px -10px rgba(0,0,0,0.7)', borderTop: '1px solid rgba(251,191,36,0.25)' }}
        >
          {/* Mode toggle */}
          <div className="flex bg-[#0A0D13] p-1.5 rounded-xl mb-8 border border-white/5 relative shadow-inner">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-300 z-10 ${mode === 'login' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-gray-500 hover:text-gray-300'}`}
              style={{ fontFamily: lblFont, letterSpacing: '1px' }}
            >
              {t.login}
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-300 z-10 ${mode === 'register' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-gray-500 hover:text-gray-300'}`}
              style={{ fontFamily: lblFont, letterSpacing: '1px' }}
            >
              {t.register}
            </button>
            <div
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-lg shadow-[0_0_18px_rgba(220,20,60,0.45)] transition-all duration-300 ease-out"
              style={{ background: 'linear-gradient(135deg, #DC143C 0%, #9E0E29 100%)', left: mode === 'login' ? '6px' : 'calc(50%)' }}
            />
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className={labelCls} style={labelStyle}>{t.email}</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#DC143C] transition-colors duration-300" />
                  <input type="email" placeholder={t.emailPh} className={inputCls} style={{ fontFamily: inputFont }} value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={labelCls} style={labelStyle}>{t.password}</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#DC143C] transition-colors duration-300" />
                  <input type="password" placeholder="••••••••" className={inputCls} style={{ fontFamily: inputFont }} value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>
              <div className="flex justify-end pt-1 mb-2">
                <a href="#" className="text-[11px] hover:text-[#FBBF24] transition-colors duration-300" style={{ fontFamily: lblFont, color: '#A4AFBC' }}>
                  {t.forgot}
                </a>
              </div>
              <button
                type="submit"
                className="w-full py-4 text-white font-black uppercase tracking-widest rounded-xl transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(220,20,60,0.45)] flex items-center justify-center gap-2"
                style={{ fontFamily: lblFont, background: 'linear-gradient(135deg, #DC143C 0%, #9E0E29 100%)' }}
              >
                {t.loginBtn} <ArrowRight className="w-4 h-4" />
              </button>

              {/* ── OR divider ── */}
              <div className="relative py-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <span className="relative bg-[#12151D] px-4 text-[10px] tracking-widest" style={{ fontFamily: lblFont, color: '#A4AFBC' }}>{t.or}</span>
              </div>

              {googleError && (
                <div className="text-red-500 text-xs font-bold text-center mb-4 tracking-wider animate-in fade-in" style={{ fontFamily: inputFont }}>
                  {googleError}
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-3.5 bg-[#0A0D13] hover:bg-[#1A1C27] border border-white/10 text-white font-bold transition-all duration-300 ease-in-out hover:scale-[1.02] rounded-xl flex items-center justify-center gap-3 hover:border-[#FBBF24]/30 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                style={{ fontFamily: lblFont, letterSpacing: '1px' }}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    <span className="text-gray-400">{t.connecting}</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                      </g>
                    </svg>
                    {t.google}
                  </>
                )}
              </button>

              {/* ── 🎯 DEMO ENTRY BUTTON ── */}
              <div className="relative py-3 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              </div>

              <button
                type="button"
                onClick={() => onDemoEntry ? onDemoEntry() : onLoginSuccess()}
                className="w-full py-3.5 bg-linear-to-r from-[#0AA8D8]/15 to-[#35D6FF]/15 hover:from-[#0AA8D8]/25 hover:to-[#35D6FF]/25 border border-[#35D6FF]/30 hover:border-[#35D6FF]/60 text-[#35D6FF] font-bold transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(53,214,255,0.25)] rounded-xl flex items-center justify-center gap-2 group"
                style={{ fontFamily: lblFont, letterSpacing: '1px' }}
              >
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span>{t.demo}</span>
              </button>
              <p className="text-center text-[10px] text-gray-500 -mt-2" style={{ fontFamily: inputFont }}>
                {t.demoHint}
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div className="col-span-1 md:col-span-2 mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-3 border-b border-white/5 pb-3" style={{ fontFamily: lblFont, color: '#FBBF24' }}>{t.basicInfo}</h3>
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls} style={labelStyle}>{t.fullName}</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#DC143C] transition-colors duration-300" />
                    <input type="text" placeholder={t.namePh} className={inputCls} style={{ fontFamily: inputFont }} value={regName} onChange={(e) => setRegName(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls} style={labelStyle}>{t.email}</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#DC143C] transition-colors duration-300" />
                    <input type="email" placeholder="example@email.com" className={inputCls} style={{ fontFamily: inputFont }} value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls} style={labelStyle}>{t.password}</label>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#DC143C] transition-colors duration-300" />
                    <input type="password" placeholder="••••••••" className={inputCls} style={{ fontFamily: inputFont }} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls} style={labelStyle}>{t.confirmPass}</label>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#DC143C] transition-colors duration-300" />
                    <input type="password" placeholder="••••••••" className={inputCls} style={{ fontFamily: inputFont }} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2 mt-4 mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-3 border-b border-white/5 pb-3" style={{ fontFamily: lblFont, color: '#FBBF24' }}>{t.personal}</h3>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className={labelCls} style={labelStyle}>{t.phone}</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#DC143C] transition-colors duration-300" />
                    <input type="tel" placeholder="+880 1XXXXXXXXX" className={inputCls} style={{ fontFamily: inputFont }} value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls} style={labelStyle}>{t.gender}</label>
                  <CustomSelect placeholder={t.genderPh} value={gender} onChange={setGender} font={inputFont}
                    options={[
                      { value: 'male', label: t.options.male },
                      { value: 'female', label: t.options.female },
                      { value: 'other', label: t.options.other },
                    ]} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls} style={labelStyle}>{t.religion}</label>
                  <CustomSelect placeholder={t.religionPh} value={religion} onChange={setReligion} font={inputFont}
                    options={[
                      { value: 'islam', label: t.options.islam },
                      { value: 'hinduism', label: t.options.hinduism },
                      { value: 'buddhism', label: t.options.buddhism },
                      { value: 'christianity', label: t.options.christianity },
                      { value: 'other', label: t.options.other },
                    ]} />
                </div>
                <div className="col-span-1 md:col-span-2 mt-4 mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-3 border-b border-white/5 pb-3" style={{ fontFamily: lblFont, color: '#FBBF24' }}>{t.academic}</h3>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className={labelCls} style={labelStyle}>{t.institution}</label>
                  <div className="relative group">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#DC143C] transition-colors duration-300" />
                    <input type="text" placeholder={t.institutionPh} className={inputCls} style={{ fontFamily: inputFont }} value={institution} onChange={(e) => setInstitution(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls} style={labelStyle}>{t.batch}</label>
                  <CustomSelect placeholder={t.batchPh} value={hscBatch} onChange={setHscBatch} font={inputFont}
                    options={[
                      { value: '2024', label: 'HSC 2024' },
                      { value: '2025', label: 'HSC 2025' },
                      { value: '2026', label: 'HSC 2026' },
                    ]} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls} style={labelStyle}>{t.target}</label>
                  <CustomSelect placeholder={t.targetPh} value={target} onChange={setTarget} font={inputFont}
                    options={[
                      { value: 'engineering', label: t.options.engineering },
                      { value: 'medical', label: t.options.medical },
                      { value: 'gst', label: t.options.gst },
                      { value: 'varsity', label: t.options.varsity },
                      { value: 'other', label: t.options.other },
                    ]} />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 mt-8 text-white font-black uppercase tracking-widest rounded-xl transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(220,20,60,0.45)] flex items-center justify-center gap-2"
                style={{ fontFamily: lblFont, background: 'linear-gradient(135deg, #DC143C 0%, #9E0E29 100%)' }}
              >
                {t.registerBtn} <ArrowRight className="w-4 h-4" />
              </button>

              {/* Demo option on register page too */}
              <div className="relative py-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              </div>
              <button
                type="button"
                onClick={() => onDemoEntry ? onDemoEntry() : onLoginSuccess()}
                className="w-full py-3 bg-transparent hover:bg-[#0AA8D8]/10 border border-[#35D6FF]/25 hover:border-[#35D6FF]/50 text-[#35D6FF]/80 hover:text-[#35D6FF] text-sm font-bold transition-all duration-300 rounded-xl flex items-center justify-center gap-2"
                style={{ fontFamily: lblFont }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t.demo}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[10px] mt-6 tracking-widest" style={{ fontFamily: lang === 'bn' ? FONT_BN : FONT_MONO, color: '#64748B' }}>
          {t.footer}
        </p>
      </div>
    </div>
  );
};

export default LoginView;