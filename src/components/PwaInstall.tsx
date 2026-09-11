/**
 * CAMPUS 6.0 — Themed install popup + header button (v2)
 * v2: button ALWAYS visible when not installed;
 *     click → native prompt (যদি থাকে) নাহলে manual guide popup
 */
import React, { useEffect, useState } from 'react';
import { Download, X, Zap, WifiOff, Smartphone, Share, PlusSquare, CheckCircle2, MoreVertical } from 'lucide-react';
import { usePwaInstall } from '../utils/usePwaInstall';

const DISMISS_KEY = 'campus6_install_dismissed';
const DISMISS_MS = 3 * 24 * 60 * 60 * 1000; // ৩ দিন

const FONT_BN = "'Hind Siliguri', 'Noto Sans Bengali', sans-serif";
const FONT_DISPLAY = "'Orbitron', sans-serif";

/* ═══════════ HEADER BUTTON — install না থাকলে সবসময় দেখাবে ═══════════ */
export const PwaInstallHeaderButton: React.FC = () => {
  const { installed } = usePwaInstall();
  if (installed) return null; // installed users → কিছুই না ✅
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('campus6:open-install'))}
      className="group relative shrink-0 rounded-full flex items-center justify-center bg-[#0A1220]/90 border border-[#35D6FF]/35 hover:border-[#35D6FF]/75 hover:bg-[#35D6FF]/10 shadow-[0_0_16px_rgba(53,214,255,0.12)] hover:shadow-[0_0_22px_rgba(53,214,255,0.35)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#35D6FF]/45"
      style={{ width: 40, height: 40 }}
      title="অ্যাপ ইনস্টল করুন"
      aria-label="Install CAMPUS 6.0"
    >
      <Download className="w-5 h-5 text-[#35D6FF] group-hover:text-[#7DEBFF] group-hover:scale-110 transition-all duration-300 drop-shadow-[0_0_8px_rgba(53,214,255,0.45)]" />
      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#35D6FF] shadow-[0_0_10px_rgba(53,214,255,0.9)] animate-pulse" aria-hidden="true" />
    </button>
  );
};

/* ═══════════ THEMED POPUP ═══════════ */
export const PwaInstallModal: React.FC<{
  onAddToast?: (type: 'success' | 'info' | 'warning' | 'error', message: string, title?: string) => void;
}> = ({ onAddToast }) => {
  const { canInstall, installed, ios, promptInstall } = usePwaInstall();
  const [open, setOpen] = useState(false);

  const dismissedRecently = () => {
    try { return Date.now() - Number(localStorage.getItem(DISMISS_KEY) || 0) < DISMISS_MS; } catch { return false; }
  };

  /* Auto popup — শুধু যখন native prompt available বা iOS */
  useEffect(() => {
    if (installed || !(canInstall || ios) || dismissedRecently()) return;
    const t = setTimeout(() => setOpen(true), 2500);
    return () => clearTimeout(t);
  }, [canInstall, ios, installed]);

  /* Header button থেকে manual open */
  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener('campus6:open-install', openHandler);
    return () => window.removeEventListener('campus6:open-install', openHandler);
  }, []);

  /* Install success */
  useEffect(() => {
    const onInstalled = () => {
      setOpen(false);
      onAddToast?.('success', 'অ্যাপ ইনস্টল হয়েছে! Home screen-এ CAMPUS 6.0 icon পাবেন 🎉', 'Installed');
    };
    window.addEventListener('appinstalled', onInstalled);
    return () => window.removeEventListener('appinstalled', onInstalled);
  }, [onAddToast]);

  if (installed || !open) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ignore */ }
    setOpen(false);
  };

  const install = async () => {
    const res = await promptInstall();
    if (res === 'accepted') {
      setOpen(false);
      onAddToast?.('info', 'ইনস্টল শুরু হয়েছে… Home screen-এ icon চলে আসবে 🎉', 'Installing');
    } else {
      dismiss();
    }
  };

  /* কোন mode দেখাবে: native / ios / manual */
  const mode: 'native' | 'ios' | 'manual' = canInstall ? 'native' : ios ? 'ios' : 'manual';

  return (
    <div className="fixed inset-0 z-95 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', animation: 'pwaFade .25s ease-out' }} role="dialog" aria-modal="true">
      <div className="relative w-full max-w-sm rounded-2xl p-6 backdrop-blur-xl" style={{ background: 'rgba(18,21,29,0.97)', border: '1px solid rgba(255,255,255,0.08)', borderTop: '1px solid rgba(53,214,255,0.4)', boxShadow: '0 24px 60px -12px rgba(0,0,0,0.85), 0 0 40px rgba(53,214,255,0.10)', animation: 'pwaPop .35s cubic-bezier(0.16,1,0.3,1)' }}>
        <button onClick={dismiss} className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors" aria-label="Close">
          <X className="w-4 h-4" />
        </button>

        {/* crest + title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, rgba(53,214,255,0.15), rgba(220,20,60,0.10))', border: '1px solid rgba(53,214,255,0.35)' }}>
            <Download className="w-6 h-6 text-[#35D6FF]" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-widest text-white" style={{ fontFamily: FONT_DISPLAY }}>
              CAMPUS <span style={{ color: '#29ABE2' }}>6</span><span style={{ color: '#7DC242' }}>.</span><span style={{ color: '#E23B4E' }}>0</span>
            </h3>
            <p className="text-[11px] text-gray-400" style={{ fontFamily: FONT_BN }}>অ্যাপটি আপনার ডিভাইসে ইনস্টল করে নিন</p>
          </div>
        </div>

        {/* ═══ MODE: NATIVE PROMPT ═══ */}
        {mode === 'native' && (
          <div className="space-y-2.5 mb-5">
            {[
              { icon: WifiOff, text: 'ইন্টারনেট ছাড়াও কাজ করবে (offline-first)', color: '#35D6FF' },
              { icon: Zap, text: 'Browser-এর চেয়ে দ্রুত লোড হবে', color: '#FBBF24' },
              { icon: Smartphone, text: 'Home screen-এ আসল app-এর মতো icon', color: '#7DC242' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(10,13,19,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <b.icon className="w-4 h-4 shrink-0" style={{ color: b.color }} />
                <span className="text-[12px] text-gray-200" style={{ fontFamily: FONT_BN }}>{b.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* ═══ MODE: iOS MANUAL ═══ */}
        {mode === 'ios' && (
          <div className="space-y-2.5 mb-5">
            <p className="text-[13px] text-gray-300" style={{ fontFamily: FONT_BN }}>iPhone-এ ইনস্টল করতে:</p>
            {[
              { icon: Share, text: 'Safari-র নিচে Share (⬆) বাটনে চাপুন' },
              { icon: PlusSquare, text: '"Add to Home Screen" সিলেক্ট করুন' },
              { icon: CheckCircle2, text: 'Add চাপুন — icon home screen-এ চলে আসবে' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(10,13,19,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <s.icon className="w-4 h-4 shrink-0 text-[#35D6FF]" />
                <span className="text-[12px] text-gray-200" style={{ fontFamily: FONT_BN }}>{s.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* ═══ MODE: MANUAL (Chrome menu) ═══ */}
        {mode === 'manual' && (
          <div className="space-y-2.5 mb-5">
            <p className="text-[13px] text-gray-300" style={{ fontFamily: FONT_BN }}>Browser থেকে এক ক্লিকে ইনস্টল:</p>
            {[
              { icon: MoreVertical, text: 'Browser-এর ডান উপরের menu (⋮) খুলুন' },
              { icon: Download, text: '"Install CAMPUS 6.0…" / "অ্যাপ ইনস্টল করুন" এ ক্লিক করুন' },
              { icon: CheckCircle2, text: 'Install চাপুন — app টা ডিভাইসে চলে আসবে' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(10,13,19,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <s.icon className="w-4 h-4 shrink-0 text-[#35D6FF]" />
                <span className="text-[12px] text-gray-200" style={{ fontFamily: FONT_BN }}>{s.text}</span>
              </div>
            ))}
            <p className="text-[10px] text-gray-500" style={{ fontFamily: FONT_BN }}>
              💡 Menu-তে option না দেখলে: address bar-এর ডান পাশে ⊕ icon আছে কিনা দেখুন
            </p>
          </div>
        )}

        {/* buttons */}
        <div className="flex gap-2.5">
          {mode === 'native' ? (
            <>
              <button onClick={install} className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(220,20,60,0.4)]" style={{ fontFamily: FONT_BN, background: 'linear-gradient(135deg, #DC143C, #9E0E29)' }}>
                <Download className="w-4 h-4" /> ইনস্টল করুন
              </button>
              <button onClick={dismiss} className="px-4 py-3 rounded-xl font-bold text-gray-300 border border-white/10 hover:bg-white/5 transition-all" style={{ fontFamily: FONT_BN }}>
                পরে
              </button>
            </>
          ) : (
            <button onClick={dismiss} className="flex-1 py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02]" style={{ fontFamily: FONT_BN, background: 'linear-gradient(135deg, #DC143C, #9E0E29)' }}>
              বুঝেছি
            </button>
          )}
        </div>

        <style>{`
          @keyframes pwaFade { from { opacity: 0; } to { opacity: 1; } }
          @keyframes pwaPop { from { opacity: 0; transform: scale(0.9) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        `}</style>
      </div>
    </div>
  );
};