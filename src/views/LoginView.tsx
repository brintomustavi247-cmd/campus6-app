import React, { useState } from 'react';
import { Mail, Key, User, Phone, BookOpen, Target, ArrowRight, ChevronDown, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { getAppBaseUrl } from '../utils/authBaseUrl';

interface LoginViewProps {
  onLoginSuccess: (userEmail?: string) => void;
  onAddToast?: (type: 'success' | 'info' | 'warning' | 'error', message: string, title?: string) => void;
}

const EsportsShield = () => (
  <div className="relative flex justify-center items-center group">
    <div className="absolute inset-0 bg-linear-to-r from-red-600 to-blue-600 blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-700"></div>
    <svg width="100" height="110" viewBox="0 0 120 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-transform duration-500 hover:scale-105">
      <defs>
        <linearGradient id="shieldOuterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="shieldInnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#991B1B" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>
      
      <path d="M60 5L110 25V65C110 95 85 120 60 128C35 120 10 95 10 65V25L60 5Z" fill="url(#shieldOuterGrad)" stroke="white" strokeWidth="2" strokeOpacity="0.2"/>
      <path d="M60 15L95 30V65C95 88 78 108 60 115C42 108 25 88 25 65V30L60 15Z" fill="url(#shieldInnerGrad)" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>
      
      <path d="M60 15V115" stroke="white" strokeWidth="2" strokeOpacity="0.3" strokeDasharray="4 4"/>
      <path d="M35 50L60 65L85 50" stroke="white" strokeWidth="2" strokeOpacity="0.6"/>
      <path d="M45 75L60 85L75 75" stroke="white" strokeWidth="2" strokeOpacity="0.6"/>
      
      <circle cx="60" cy="65" r="6" fill="#FFF" className="animate-pulse" style={{ filter: 'drop-shadow(0 0 6px #FFF)' }}/>
    </svg>
  </div>
);

const CustomSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder 
}: { 
  options: {value: string, label: string}[], 
  value: string, 
  onChange: (val: string) => void, 
  placeholder: string 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div className="relative w-full">
      <div
        className={`w-full flex justify-between items-center cursor-pointer transition-all duration-300 ease-in-out rounded-xl py-3.5 px-4 bg-[#0F111A]/80 shadow-inner ${isOpen ? 'border-red-500/80 ring-4 ring-red-500/20' : 'border border-white/10 hover:border-white/20'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selected ? 'text-white' : 'text-gray-500'} style={{ fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-red-500' : ''}`} />
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <ul className="absolute z-50 w-full mt-2 bg-[#1E2030] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
            {options.map(opt => (
              <li
                key={opt.value}
                className="px-4 py-3 text-sm text-gray-300 hover:bg-red-500/20 hover:text-red-400 cursor-pointer transition-colors font-body"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
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

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onAddToast
}) => {
  const appBaseUrl = getAppBaseUrl();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register State
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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setGoogleError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${appBaseUrl}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline',
        },
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
    if (!email || !password) {
      onAddToast?.('error', 'Please enter email and password', 'Error');
      return;
    }
    onAddToast?.('success', 'Authentication successful', 'Access Granted');
    onLoginSuccess(email);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== confirmPassword) {
      onAddToast?.('error', 'Passwords do not match', 'Error');
      return;
    }
    if (!gender || !religion || !hscBatch || !target) {
      onAddToast?.('warning', 'Please fill in all dropdown fields', 'Incomplete Form');
      return;
    }
    onAddToast?.('success', 'Registration successful. Welcome to RankPush!', 'Success');
    onLoginSuccess(regEmail);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-4 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      <div className={`w-full mx-auto transition-all duration-500 ease-in-out ${mode === 'register' ? 'max-w-3xl' : 'max-w-md'}`}>
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center justify-center w-full mb-8">
          <EsportsShield />
          <h2 className="mt-4 text-2xl font-black text-white tracking-widest uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            RANK<span className="text-red-500">PUSH</span>
          </h2>
          <p className="text-[10px] text-gray-400 font-mono tracking-[0.2em] uppercase mt-1">Competitive Academic Engine</p>
        </div>

        <div className="bg-[#1E2030]/80 backdrop-blur-xl border border-white/5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] rounded-2xl p-6 md:p-8">
          
          {/* Toggle */}
          <div className="flex bg-[#161825] p-1.5 rounded-xl mb-8 border border-white/5 relative shadow-inner">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-300 z-10 ${mode === 'login' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-gray-500 hover:text-gray-300'}`}
              style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: '1px' }}
            >
              SYSTEM LOGIN
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-300 z-10 ${mode === 'register' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-gray-500 hover:text-gray-300'}`}
              style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: '1px' }}
            >
              NEW RECRUIT
            </button>
            <div 
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-linear-to-r from-red-600 to-red-800 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all duration-300 ease-out"
              style={{ left: mode === 'login' ? '6px' : 'calc(50%)' }}
            />
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Operator Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors duration-300" />
                  <input
                    type="email"
                    placeholder="Enter your transmission address"
                    className="w-full bg-[#0F111A]/80 border border-white/10 rounded-xl py-3.5 pr-4 pl-11 text-white transition-all duration-300 ease-in-out focus:outline-none focus:border-red-500/80 focus:ring-4 focus:ring-red-500/20 shadow-inner hover:border-white/20"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Access Code</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors duration-300" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-[#0F111A]/80 border border-white/10 rounded-xl py-3.5 pr-4 pl-11 text-white transition-all duration-300 ease-in-out focus:outline-none focus:border-red-500/80 focus:ring-4 focus:ring-red-500/20 shadow-inner hover:border-white/20"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1 mb-2">
                <a href="#" className="text-[10px] text-gray-400 hover:text-red-400 transition-colors duration-300" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  FORGOT CODE?
                </a>
              </div>

              <button type="submit" className="w-full py-4 bg-linear-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest rounded-xl transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2">
                Initialize Login <ArrowRight className="w-4 h-4" />
              </button>

              <div className="relative py-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <span className="relative bg-[#1E2030] px-4 text-[10px] text-gray-500 tracking-widest" style={{ fontFamily: "'Orbitron', sans-serif" }}>OR</span>
              </div>

              {googleError && (
                <div className="text-red-500 text-xs font-bold text-center mb-4 tracking-wider animate-in fade-in">
                  {googleError}
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-3.5 bg-[#161825] hover:bg-[#1f2233] border border-white/10 text-white font-bold transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] rounded-xl flex items-center justify-center gap-3 hover:border-white/20 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    <span className="text-gray-400 tracking-wider">CONNECTING...</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                      </g>
                    </svg>
                    CONTINUE WITH GOOGLE
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6 animate-in fade-in duration-500">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div className="col-span-1 md:col-span-2 mb-2">
                  <h3 className="text-red-500 text-xs font-bold uppercase tracking-widest mb-3 border-b border-white/5 pb-3 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" style={{ fontFamily: "'Orbitron', sans-serif" }}>Basic Info</h3>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors duration-300" />
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      className="w-full bg-[#0F111A]/80 border border-white/10 rounded-xl py-3.5 pr-4 pl-11 text-white transition-all duration-300 ease-in-out focus:outline-none focus:border-red-500/80 focus:ring-4 focus:ring-red-500/20 shadow-inner hover:border-white/20"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Operator Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors duration-300" />
                    <input 
                      type="email" 
                      placeholder="john@example.com" 
                      className="w-full bg-[#0F111A]/80 border border-white/10 rounded-xl py-3.5 pr-4 pl-11 text-white transition-all duration-300 ease-in-out focus:outline-none focus:border-red-500/80 focus:ring-4 focus:ring-red-500/20 shadow-inner hover:border-white/20"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Access Code (Password)</label>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors duration-300" />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full bg-[#0F111A]/80 border border-white/10 rounded-xl py-3.5 pr-4 pl-11 text-white transition-all duration-300 ease-in-out focus:outline-none focus:border-red-500/80 focus:ring-4 focus:ring-red-500/20 shadow-inner hover:border-white/20"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Confirm Access Code</label>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors duration-300" />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full bg-[#0F111A]/80 border border-white/10 rounded-xl py-3.5 pr-4 pl-11 text-white transition-all duration-300 ease-in-out focus:outline-none focus:border-red-500/80 focus:ring-4 focus:ring-red-500/20 shadow-inner hover:border-white/20"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 mt-4 mb-2">
                  <h3 className="text-red-500 text-xs font-bold uppercase tracking-widest mb-3 border-b border-white/5 pb-3 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" style={{ fontFamily: "'Orbitron', sans-serif" }}>Personal & Contact</h3>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Comms Link (Phone)</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors duration-300" />
                    <input 
                      type="tel" 
                      placeholder="+880 1..." 
                      className="w-full bg-[#0F111A]/80 border border-white/10 rounded-xl py-3.5 pr-4 pl-11 text-white transition-all duration-300 ease-in-out focus:outline-none focus:border-red-500/80 focus:ring-4 focus:ring-red-500/20 shadow-inner hover:border-white/20"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Gender</label>
                  <CustomSelect 
                    placeholder="Select Gender"
                    value={gender}
                    onChange={setGender}
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' }
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Religion</label>
                  <CustomSelect 
                    placeholder="Select Religion"
                    value={religion}
                    onChange={setReligion}
                    options={[
                      { value: 'islam', label: 'Islam' },
                      { value: 'hinduism', label: 'Hinduism' },
                      { value: 'buddhism', label: 'Buddhism' },
                      { value: 'christianity', label: 'Christianity' },
                      { value: 'other', label: 'Other' }
                    ]}
                  />
                </div>

                <div className="col-span-1 md:col-span-2 mt-4 mb-2">
                  <h3 className="text-red-500 text-xs font-bold uppercase tracking-widest mb-3 border-b border-white/5 pb-3 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" style={{ fontFamily: "'Orbitron', sans-serif" }}>Academic Profile</h3>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Current Institution</label>
                  <div className="relative group">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors duration-300" />
                    <input 
                      type="text" 
                      placeholder="College Name" 
                      className="w-full bg-[#0F111A]/80 border border-white/10 rounded-xl py-3.5 pr-4 pl-11 text-white transition-all duration-300 ease-in-out focus:outline-none focus:border-red-500/80 focus:ring-4 focus:ring-red-500/20 shadow-inner hover:border-white/20"
                      value={institution}
                      onChange={e => setInstitution(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">HSC Batch</label>
                  <CustomSelect 
                    placeholder="Select Year"
                    value={hscBatch}
                    onChange={setHscBatch}
                    options={[
                      { value: '2024', label: 'HSC 2024' },
                      { value: '2025', label: 'HSC 2025' },
                      { value: '2026', label: 'HSC 2026' }
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Admission Target</label>
                  <CustomSelect 
                    placeholder="Select Target"
                    value={target}
                    onChange={setTarget}
                    options={[
                      { value: 'engineering', label: 'Engineering' },
                      { value: 'medical', label: 'Medical' },
                      { value: 'gst', label: 'GST' },
                      { value: 'varsity', label: 'Varsity' },
                      { value: 'other', label: 'Other' }
                    ]}
                  />
                </div>

              </div>

              <button type="submit" className="w-full py-4 mt-8 bg-linear-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest rounded-xl transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2">
                Register Recruit <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
