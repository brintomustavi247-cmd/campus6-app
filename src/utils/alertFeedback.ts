/**
 * CAMPUS 6.0 — Sound + Vibration (Web Audio — কোনো file লাগবে না)
 */

let ctx: AudioContext | null = null;

const getCtx = (): AudioContext | null => {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
};

/** Mobile-এ audio unlock (first touch-এ call হবে) */
export const unlockAudio = () => {
  getCtx();
};

const tone = (freq: number, start: number, dur: number, gain = 0.12, type: OscillatorType = 'sine') => {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t0 = c.currentTime + start;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
};

/** ✅ Success chime — timer complete / claim (C-E-G) */
export const playSuccessChime = () => {
  tone(523.25, 0, 0.35);
  tone(659.25, 0.12, 0.35);
  tone(783.99, 0.24, 0.5);
};

/** 🔔 Notification pop — soft 2-note */
export const playNotifPop = () => {
  tone(880, 0, 0.18, 0.1);
  tone(1174.66, 0.09, 0.25, 0.1);
};

/** ⚠️ Urgent — exam live */
export const playUrgent = () => {
  tone(392, 0, 0.25, 0.14, 'triangle');
  tone(392, 0.3, 0.25, 0.14, 'triangle');
  tone(523.25, 0.6, 0.4, 0.14, 'triangle');
};

export const vibrateSuccess = () => { try { navigator.vibrate?.([200, 100, 200, 100, 400]); } catch {} };
export const vibrateNotif = () => { try { navigator.vibrate?.([120, 60, 120]); } catch {} };
export const vibrateUrgent = () => { try { navigator.vibrate?.([300, 100, 300, 100, 300]); } catch {} };

export const feedbackSuccess = () => { playSuccessChime(); vibrateSuccess(); };
export const feedbackNotif = () => { playNotifPop(); vibrateNotif(); };
export const feedbackUrgent = () => { playUrgent(); vibrateUrgent(); };