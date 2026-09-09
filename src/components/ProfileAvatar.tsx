/**
 * ============================================================================
 * CAMPUS 6.0 — PROFILE AVATAR (single source of truth)
 * ============================================================================
 * Avatar URL priority chain:
 *   1. profile.avatar_url   ← Supabase users table (Google OAuth picture)
 *   2. profile.photoURL     ← legacy Firebase field
 *   3. profile.picture / image / photo_url (extra safety)
 *   4. LIVE Supabase session metadata (যদি profile sync lag করে)
 *   5. Gradient letter avatar (কখনো fail হয় না)
 *
 * Features:
 *   ✅ referrerPolicy="no-referrer" (Google image block fix)
 *   ✅ onError → letter fallback (broken image কখনো দেখাবে না)
 *   ✅ React.memo (unnecessary re-render বন্ধ)
 *   ✅ Accessible (role="img" + aria-label)
 * ============================================================================
 */
import React, { memo, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../supabaseClient';

/* সব সম্ভাব্য field থেকে URL বের করি */
const pickUrl = (p: any): string =>
  p?.avatar_url || p?.photoURL || p?.photo_url || p?.picture || p?.image || '';

interface ProfileAvatarProps {
  profile: UserProfile;
  size?: number;
  className?: string;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = memo(({ profile, size = 38, className = '' }) => {
  const anyP = profile as any;
  const [url, setUrl] = useState<string>(() => pickUrl(anyP));
  const [failed, setFailed] = useState(false);

  /* profile update হলে url reset + retry */
  useEffect(() => {
    setUrl(pickUrl(anyP));
    setFailed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anyP.avatar_url, anyP.photoURL, anyP.picture, anyP.image]);

  /* 🎯 FALLBACK: profile-এ URL না থাকলে LIVE Supabase session থেকে নাও */
  useEffect(() => {
    if (url) return;
    let alive = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        const m = (data.session?.user?.user_metadata || {}) as any;
        const u = m.avatar_url || m.picture || m.image || '';
        if (alive && u) setUrl(u);
      })
      .catch(() => { /* silent */ });
    return () => { alive = false; };
  }, [url]);

  const name: string = profile.displayName || profile.nickname || 'Student';
  const initial = name.trim().charAt(0).toUpperCase() || 'S';

  /* ✅ আসল ছবি */
  if (url && !failed) {
    return (
      <img
        src={url}
        alt={name}
        title={name}
        referrerPolicy="no-referrer"
        role="img"
        aria-label={`Avatar: ${name}`}
        onError={() => setFailed(true)}
        className={`rounded-full object-cover border-2 border-[#FBBF24]/70 shadow-[0_0_12px_rgba(220,20,60,0.35)] transition-transform duration-200 hover:scale-105 select-none ${className}`}
        style={{ width: size, height: heightFix(size) }}
      />
    );
  }

  /* ✅ Fallback: gradient letter avatar */
  return (
    <div
      role="img"
      aria-label={`Avatar: ${name} (initial)`}
      title={name}
      className={`rounded-full flex items-center justify-center font-black text-white border-2 border-[#FBBF24]/50 shadow-[0_0_12px_rgba(220,20,60,0.35)] select-none ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: 'linear-gradient(135deg, #DC143C 0%, #9E0E29 100%)',
        fontFamily: "'Orbitron', sans-serif",
      }}
    >
      {initial}
    </div>
  );
});

/* square ratio keep করি */
function heightFix(size: number): number {
  return size;
}

ProfileAvatar.displayName = 'ProfileAvatar';
export default ProfileAvatar;