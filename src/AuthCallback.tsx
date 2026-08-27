import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

/**
 * Handles the post-Google redirect (both PKCE ?code= and legacy #access_token=).
 *
 * FIXES vs prior version:
 *  • Never blind-calls exchangeCodeForSession — detectSessionInUrl (client
 *    config) usually consumes ?code= BEFORE this component mounts; calling it
 *    again caused "code already used". We CHECK session first.
 *  • When an explicit exchange IS needed, we extract the BARE code param —
 *    previously the whole raw hash/search string was passed (API misuse).
 *  • Search-before-hash precedence fixed for PKCE flows.
 *  • Errors now surface to the user instead of silently redirecting anyway.
 */
export const AuthCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let redirected = false;

    const goHome = () => {
      if (redirected || cancelled) return;
      redirected = true;
      setTimeout(() => window.location.replace(window.location.origin + '/'), 600);
    };

    const run = async () => {
      try {
        // 1) Fast path: auto-detection may already have established the session.
        let { data: { session } } = await supabase.auth.getSession();

        // 2) Slow path: explicit exchange — ONLY if truly no session and a code exists.
        if (!session?.user) {
          const qp = new URLSearchParams(window.location.search);
          const hp = new URLSearchParams(
            window.location.hash.startsWith('#')
              ? window.location.hash.slice(1)
              : window.location.hash,
          );
          const code = qp.get('code') ?? hp.get('code'); // ⭐ search-first (PKCE)

          if (code) {
            const res = await supabase.auth.exchangeCodeForSession(code);
            const err = (res as any)?.error;
            if (err) console.warn('[AuthCallback] exchange:', err.message);
          }
          // Re-check — implicit flows also land here with session already set.
          ({ data: { session } } = await supabase.auth.getSession());
        }

        if (cancelled) return;

        if (session?.user) {
          console.log('[AuthCallback] ✅ session confirmed, going home');
          goHome();
        } else {
          setError('সাইন-ইন সম্পন্ন হয়নি। আবার চেষ্টা করুন।');
        }
      } catch (err: any) {
        console.error('[AuthCallback] ❌', err);
        if (!cancelled) setError(err?.message || 'Authentication failed. Please try again.');
      }
    };

    void run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-[#0E1017] flex items-center justify-center">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <p className="text-red-400 font-bold">{error}</p>
            <a href="/" className="text-cyan-400 underline text-sm">Back to login</a>
          </>
        ) : (
          <>
            <div className="w-10 h-10 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin mx-auto" />
            <p className="text-gray-300 text-sm font-semibold tracking-wide">Signing you in...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;