/**
 * CAMPUS 6.0 — Timer Completion Feedback (Global)
 */

let isInitialized = false;

export const initTimerCompletionFeedback = () => {
  if (isInitialized) return;
  isInitialized = true;

  if (typeof window === 'undefined') return;

  console.log('[TimerFeedback] 🚀 Initializing global listener...');

  const handler = (e: any) => {
    const s = e?.detail;
    console.log('[TimerFeedback] 📥 Event received:', s);
    
    if (!s) {
      console.warn('[TimerFeedback] ❌ No session data');
      return;
    }

    // ⭐ VIBRATE — force try even if permission check fails
    const tryVibrate = () => {
      try {
        if ('vibrate' in navigator) {
          const pattern = [200, 100, 200, 100, 200, 100, 400];
          const result = navigator.vibrate(pattern);
          console.log('[TimerFeedback] 📳 Vibrate result:', result, 'Pattern:', pattern);
        } else {
          console.warn('[TimerFeedback] ⚠️ Vibrate API NOT available');
        }
      } catch (err) {
        console.error('[TimerFeedback] ❌ Vibrate error:', err);
      }
    };

    // ⭐ NOTIFICATION
    const tryNotification = () => {
      try {
        if (!('Notification' in window)) {
          console.warn('[TimerFeedback] ⚠️ Notification API not available');
          return;
        }

        console.log('[TimerFeedback] 📋 Permission:', Notification.permission);

        if (Notification.permission !== 'granted') {
          console.warn('[TimerFeedback] ⚠️ Permission not granted. Click bell icon to enable.');
          return;
        }

        const title = s.mode === '2min'
          ? '⚡ Quick Focus Complete!'
          : s.mode === 'infinity'
          ? '⏱ Infinity Session Ended!'
          : '⏰ Focus Session Complete!';

        const body = s.topicName
          ? `${s.topicName} — ${s.durationMinutes} মিনিট সম্পন্ন!`
          : `${s.durationMinutes} মিনিট সম্পন্ন!`;

        const notif = new Notification(title, {
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: `campus6-timer-${Date.now()}`,
          requireInteraction: false,
        });

        console.log('[TimerFeedback] ✅ Notification created:', title);
        setTimeout(() => { try { notif.close(); } catch {} }, 6000);
      } catch (err) {
        console.error('[TimerFeedback] ❌ Notification error:', err);
      }
    };

    // Run both
    tryVibrate();
    tryNotification();
  };

  window.addEventListener('campus6:timer-completed', handler);
  console.log('[TimerFeedback] ✅ Listener registered on window');
};

/** ⭐ Manual test function — console-এ call করুন */
export const testTimerFeedback = () => {
  console.log('[TimerFeedback] 🧪 Manual test triggered');
  window.dispatchEvent(
    new CustomEvent('campus6:timer-completed', {
      detail: {
        id: 'manual-test',
        topicName: 'Test Topic',
        durationMinutes: 2,
        mode: '2min',
        completedAt: new Date().toISOString(),
      },
    })
  );
};

// Expose to window for console debugging
if (typeof window !== 'undefined') {
  (window as any).testTimerFeedback = testTimerFeedback;
}