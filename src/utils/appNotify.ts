/**
 * CAMPUS 6.0 - Unified Notification Sender
 * সব notification Service Worker দিয়ে পাঠায়, যাতে tap করলে app খোলে।
 */
export const showAppNotification = async (title: string, body: string, url = '/') => {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: `campus6-${Date.now()}`,
        data: { url },
        requireInteraction: false,
      });
      return;
    }

    const notification = new Notification(title, { body, icon: '/icons/icon-192.png' });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (error) {
    console.warn('[Notify] send failed:', error);
  }
};
