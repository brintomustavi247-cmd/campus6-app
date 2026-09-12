import React, { useEffect, useState } from 'react';
import { Smartphone, CheckCircle2, XCircle, Loader2, Download } from 'lucide-react';

interface Check {
  label: string;
  ok: boolean | null; // null = loading
  detail?: string;
}

/**
 * 📱 PWA Status — console ছাড়াই সব check দেখায়
 * Settings-এ বসালে user নিজেই দেখতে পাবে কী ভাঙা
 */
export const PwaStatusCard: React.FC = () => {
  const [checks, setChecks] = useState<Check[]>([
    { label: 'HTTPS / Secure', ok: null },
    { label: 'Manifest load', ok: null },
    { label: 'Service Worker', ok: null },
    { label: 'Real App (standalone)', ok: null },
    { label: 'Notification permission', ok: null },
  ]);
  const [installEvt, setInstallEvt] = useState<any>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Install prompt capture
    const onPrompt = (e: any) => {
      e.preventDefault();
      setInstallEvt(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    const run = async () => {
      const next: Check[] = [];

      // 1. HTTPS
      const secure = window.isSecureContext;
      next.push({ label: 'HTTPS / Secure', ok: secure, detail: secure ? 'yes' : 'no' });

      // 2. Manifest
      let manifestOk = false;
      try {
        const r = await fetch('/manifest.webmanifest');
        manifestOk = r.ok;
      } catch {}
      next.push({ label: 'Manifest load', ok: manifestOk, detail: manifestOk ? '200' : '404' });

      // 3. Service Worker
      let swOk = false;
      try {
        const reg = await navigator.serviceWorker?.getRegistration();
        swOk = !!reg;
      } catch {}
      next.push({ label: 'Service Worker', ok: swOk, detail: swOk ? 'registered' : 'missing' });

      // 4. Standalone (real app vs bookmark)
      const standalone =
        matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone === true;
      next.push({
        label: 'Real App (standalone)',
        ok: standalone,
        detail: standalone ? 'installed app' : 'bookmark/tab',
      });

      // 5. Notification permission
      const perm = 'Notification' in window ? Notification.permission : 'unsupported';
      next.push({ label: 'Notification permission', ok: perm === 'granted', detail: perm });

      setChecks(next);
    };

    run();
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const doInstall = async () => {
    if (!installEvt) return;
    setInstalling(true);
    try {
      installEvt.prompt();
      const res = await installEvt.userChoice;
      console.log('[PWA] install choice:', res.outcome);
      if (res.outcome === 'accepted') setInstallEvt(null);
    } catch {}
    setInstalling(false);
  };

  const allOk = checks.every((c) => c.ok === true);

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-text-primary flex items-center gap-2 bn">
          <Smartphone className="w-4 h-4 text-gold" />
          App Install Status
        </h3>
        <span
          className="text-[9px] font-black px-2 py-0.5 rounded-full"
          style={{
            background: allOk ? 'rgba(16,185,129,0.15)' : 'rgba(251,191,36,0.12)',
            color: allOk ? '#10B981' : '#FBBF24',
          }}
        >
          {allOk ? 'READY' : 'CHECK'}
        </span>
      </div>

      <div className="space-y-2">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-2 bn text-text-secondary">
              {c.ok === null ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-text-muted" />
              ) : c.ok ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              )}
              {c.label}
            </span>
            <span className="font-mono text-[9px] text-text-muted">{c.detail}</span>
          </div>
        ))}
      </div>

      {installEvt && (
        <button
          onClick={doInstall}
          disabled={installing}
          className="w-full py-2.5 rounded-xl text-xs font-extrabold bn flex items-center justify-center gap-2 transition-all"
          style={{ background: 'linear-gradient(135deg,#FBBF24,#D97706)', color: '#0F111A' }}
        >
          <Download className="w-4 h-4" />
          {installing ? 'Installing...' : '📲 এখনই App Install করুন'}
        </button>
      )}

      {!installEvt && !allOk && (
        <p className="text-[10px] text-text-muted bn leading-relaxed">
          ⚠️ কিছু একটা ভাঙা আছে — নিচের ❌ গুলো দেখুন। সব ✅ হলে Install button আসবে।
        </p>
      )}
    </div>
  );
};