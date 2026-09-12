import React, { useEffect, useState } from 'react';
import { Bell, BellOff, CheckCircle2 } from 'lucide-react';
import { feedbackNotif } from '../utils/alertFeedback';

/**
 * 🔔 Notification Onboarding — এক tap-এ permission
 *
 * User experience:
 *   app খোলার ৩ সেক পর সুন্দর card → "চালু করুন" tap → হয়ে গেল
 *   একবারই চায়, তারপর আর কখনো না
 */

const ASK_KEY = 'campus6_notif_onboard';
const LATER_KEY = 'campus6_notif_onboard_later';

export const NotificationOnboarding: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<'idle' | 'granted' | 'denied'>('idle');

  useEffect(() => {
    if (!('Notification' in window)) return;

    const permanent = localStorage.getItem(ASK_KEY); // granted/denied — আর চাইবে না
    if (permanent) return;

    const laterTs = Number(localStorage.getItem(LATER_KEY) || 0);
    if (Date.now() - laterTs < 24 * 3600 * 1000) return; // ২ ঘণ্টা আগে "পরে" চাপলে

    if (Notification.permission !== 'default') return;

    const t = setTimeout(() => setOpen(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const enable = async () => {
    const res = await Notification.requestPermission();
    localStorage.setItem(ASK_KEY, res);
    setState(res === 'granted' ? 'granted' : 'denied');
    if (res === 'granted') {
      feedbackNotif();
      setTimeout(() => setOpen(false), 1400);
    } else {
      setTimeout(() => setOpen(false), 1600);
    }
  };

  const later = () => {
    localStorage.setItem(LATER_KEY, String(Date.now()));
    setOpen(false);
  };

  if (!open) return null;

  return (
      <div className="fixed inset-0 z-80 flex items-end sm:items-center justify-center p-4">
      <style>{`@keyframes nbPop { from { opacity:0; transform: translateY(30px) scale(.95);} to { opacity:1; transform: translateY(0) scale(1);} }`}</style>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={later} />

      <div
        className="relative w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl"
        style={{
          background: 'linear-gradient(165deg,#141018,#0C0D12)',
          border: '1px solid rgba(251,191,36,0.25)',
          animation: 'nbPop .5s cubic-bezier(.16,1,.3,1)',
        }}
      >
        {state === 'idle' && (
          <>
            <div
              className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg,#FBBF24,#D97706)', boxShadow: '0 8px 24px rgba(251,191,36,0.35)' }}
            >
              <Bell className="w-7 h-7 text-[#0F111A]" />
            </div>
            <h3 className="text-lg font-black bn mb-2" style={{ color: '#F8FAFC', fontFamily: "'Anek Bangla', sans-serif" }}>
              Notification চালু করুন
            </h3>
            <p className="text-xs bn leading-relaxed mb-5" style={{ color: '#94A3B8' }}>
              ক্লাস শুরু, পরীক্ষার reminder আর প্রতিদিনের study tip — কিছুই মিস হবে না।
              <br />
              <span style={{ color: '#FBBF24' }}>একবারই চাইবো, তারপর আর নয়।</span>
            </p>
            <button
              onClick={enable}
              className="w-full py-3 rounded-xl text-sm font-extrabold bn mb-2 transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg,#FBBF24,#D97706)', color: '#0F111A' }}
            >
              🔔 চালু করুন
            </button>
            <button onClick={later} className="w-full py-2 text-[11px] bn bn-text-muted" style={{ color: '#64748B' }}>
              পরে মনে করিয়ে দিও
            </button>
          </>
        )}

        {state === 'granted' && (
          <div className="py-6">
            <CheckCircle2 className="w-14 h-14 mx-auto mb-3 text-emerald-400" />
            <p className="text-sm font-bold bn" style={{ color: '#6EE7B7' }}>Notification চালু হয়েছে! 🎉</p>
          </div>
        )}

        {state === 'denied' && (
          <div className="py-6">
            <BellOff className="w-14 h-14 mx-auto mb-3 text-rose-400" />
            <p className="text-sm font-bold bn mb-1" style={{ color: '#F87171' }}>Notification বন্ধ আছে</p>
            <p className="text-[11px] bn" style={{ color: '#94A3B8' }}>
              চাইলে পরে Settings → App Install Status থেকে চালু করতে পারবেন।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};