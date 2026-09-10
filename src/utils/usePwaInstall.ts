/**
 * CAMPUS 6.0 — PWA install state manager (singleton)
 * - beforeinstallprompt capture করে Chrome-এর default prompt block করে
 * - installed (standalone) detect করে — installed users-এ কিছুই দেখাবে না
 */
import { useEffect, useState, useCallback } from 'react';

let deferredPrompt: any = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

export const isStandalone = (): boolean =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true);

export const isIOS = (): boolean =>
  typeof window !== 'undefined' &&
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !(window as any).MSStream;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: any) => {
    e.preventDefault();
    console.log('[PWA] ✅ beforeinstallprompt captured — native prompt available');
    deferredPrompt = e;
    notify();
  });
  
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] 🎉 App installed successfully');
    deferredPrompt = null;
    notify();
  });
  
  // Debug: check on load
  window.addEventListener('load', () => {
    console.log('[PWA] Page loaded — checking install state:', {
      standalone: isStandalone(),
      ios: isIOS(),
    });
  });
}

export function usePwaInstall() {
  const [, force] = useState(0);
  const [installed, setInstalled] = useState<boolean>(() => isStandalone());

  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    
    const refresh = () => {
      const newInstalled = isStandalone();
      console.log('[PWA] Install state changed:', newInstalled);
      setInstalled(newInstalled);
    };
    
    window.addEventListener('appinstalled', refresh);
    const mq = window.matchMedia('(display-mode: standalone)');
    mq.addEventListener?.('change', refresh);
    
    return () => {
      listeners.delete(fn);
      window.removeEventListener('appinstalled', refresh);
      mq.removeEventListener?.('change', refresh);
    };
  }, []);

  const canInstall = !!deferredPrompt && !installed;

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) {
      console.warn('[PWA] ⚠️ No deferredPrompt available — native prompt not ready');
      return 'unavailable';
    }
    
    console.log('[PWA] Triggering install prompt...');
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] User choice:', outcome);
    deferredPrompt = null;
    notify();
    
    return outcome === 'accepted' ? 'accepted' : 'dismissed';
  }, []);

  return { canInstall, installed, ios: isIOS(), promptInstall };
}