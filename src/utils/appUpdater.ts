/**
 * CAMPUS 6.0 — App Update Detector
 * নতুন SW deploy হলে user-কে prompt দেয়
 */
export const initAppUpdater = (onUpdate: (apply: () => void) => void) => {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.ready.then((reg) => {
    const handleNewWorker = (nw: ServiceWorker) => {
      nw.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
          onUpdate(() => nw.postMessage('SKIP_WAITING'));
        }
      });
    };

    if (reg.waiting) handleNewWorker(reg.waiting);
    reg.addEventListener('updatefound', () => {
      if (reg.installing) handleNewWorker(reg.installing);
    });

    setInterval(() => reg.update(), 5 * 60 * 1000);
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
};