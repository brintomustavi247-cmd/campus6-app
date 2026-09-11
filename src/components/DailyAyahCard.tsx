import React, { useMemo, useState } from 'react';
import { Copy, Check, Lightbulb } from 'lucide-react';
import { DAILY_AYAHS } from '../data/dailyAyah';

/**
 * ⭐ Daily Ayah Card — "Deep Minimal Luxury"
 *
 * Design philosophy:
 *   • Deep near-black canvas + whisper-level ambient glows
 *   • Zero heavy frames — typography-ই decoration
 *   • Mushaf ornaments ﴿ ﴾ + single gold diamond divider
 *   • Amiri (Arabic) + Tiro Bangla serif (translation) + Anek Bangla (UI)
 */
export const DailyAyahCard: React.FC = () => {
  const today = useMemo(() => {
    const d = new Date();
    const start = new Date(d.getFullYear(), 0, 0);
    const doy = Math.floor((d.getTime() - start.getTime()) / 86400000);
    return DAILY_AYAHS[doy % DAILY_AYAHS.length];
  }, []);

  const [copied, setCopied] = useState(false);

  const copyAyah = async () => {
    const text = `${today.arabic}\n${today.translit}\n"${today.bangla}"\n📌 ${today.reference}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-2xl"
      style={{
        background: 'linear-gradient(165deg, #0B120E 0%, #0A0D12 45%, #0D0B12 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <style>{`
        @keyframes ayahBreath { 0%,100% { opacity:.6; } 50% { opacity:1; } }
      `}</style>

      {/* ── ambient depth glows (whisper level) ── */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[220px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.10), transparent 70%)' }}
      />
      <div
        className="absolute -bottom-28 -right-10 w-72 h-56 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.06), transparent 70%)' }}
      />

      {/* ── top hairline ── */}
      <div
        className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.5), rgba(251,191,36,0.45), transparent)' }}
      />

      {/* ── watermark ── */}
      <span
        className="absolute -right-3 -bottom-10 text-[130px] leading-none pointer-events-none select-none"
        style={{ color: 'rgba(255,255,255,0.025)' }}
      >
        ۞
      </span>

      {/* ── copy button (ghost) ── */}
      <button
        onClick={copyAyah}
        className="absolute top-4 right-4 z-20 p-2 rounded-lg text-text-muted hover:text-gold transition-colors"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        title="আয়াত কপি করুন"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>

      <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-10 text-center">
        {/* ── label with hairlines ── */}
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-8 sm:w-12" style={{ background: 'linear-gradient(90deg, transparent, rgba(110,231,183,0.4))' }} />
          <span
            className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase bn"
            style={{ color: '#6EE7B7', fontFamily: "'Anek Bangla', sans-serif" }}
          >
            {today.type === 'ayah' ? 'আজকের আয়াত' : 'আজকের দোয়া'}
          </span>
          <span className="h-px w-8 sm:w-12" style={{ background: 'linear-gradient(90deg, rgba(110,231,183,0.4), transparent)' }} />
        </div>

        {/* ── Arabic — mushaf ornaments ── */}
        <p
          dir="rtl"
          className="mt-6 text-[26px] sm:text-[34px] leading-[2.1]"
          style={{
            fontFamily: "'Amiri', 'Scheherazade New', serif",
            color: '#ECFDF5',
            textShadow: '0 2px 30px rgba(16,185,129,0.25)',
          }}
        >
          <span style={{ color: 'rgba(251,191,36,0.55)' }}>﴿</span>
          {' '}{today.arabic}{' '}
          <span style={{ color: 'rgba(251,191,36,0.55)' }}>﴾</span>
        </p>

        {/* ── minimal divider: gold diamond ── */}
        <div className="flex items-center justify-center gap-3 mt-5">
          <div className="h-px w-16 sm:w-24" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.16))' }} />
          <span
            className="w-1.5 h-1.5 rotate-45 shrink-0"
            style={{ background: '#FBBF24', animation: 'ayahBreath 4s ease-in-out infinite' }}
          />
          <div className="h-px w-16 sm:w-24" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.16), transparent)' }} />
        </div>

        {/* ── transliteration ── */}
        <p
          className="mt-4 text-[10px] sm:text-[11px] italic tracking-wide"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: '#64748B' }}
        >
          {today.translit}
        </p>

        {/* ── Bangla translation — premium serif ── */}
        <p
          className="mt-3 text-[15px] sm:text-lg leading-[1.9] bn-serif"
          style={{
            fontFamily: "'Tiro Bangla', 'Noto Serif Bengali', serif",
            color: '#E2E8F0',
          }}
        >
          "{today.bangla}"
        </p>

        {/* ── reference — minimal dash style ── */}
        <p
          className="mt-3 text-[10px] font-semibold tracking-wider bn"
          style={{ color: 'rgba(251,191,36,0.85)', fontFamily: "'Anek Bangla', sans-serif" }}
        >
          — {today.reference} —
        </p>

        {/* ── tip footer (hairline separated) ── */}
        {today.tip && (
          <div
            className="mt-6 pt-4 flex items-start justify-center gap-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'rgba(110,231,183,0.8)' }} />
            <p
              className="text-[11px] leading-relaxed bn max-w-md"
              style={{ color: 'rgba(148,163,184,0.9)', fontFamily: "'Anek Bangla', sans-serif" }}
            >
              <span className="font-bold" style={{ color: '#6EE7B7' }}>Student Tip — </span>
              {today.tip}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};