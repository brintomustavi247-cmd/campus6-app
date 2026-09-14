import React, { useEffect, useState, useMemo } from 'react';
import { X, BookMarked, Lock, RotateCw } from 'lucide-react';
import { getCollection, CollectedAyah, hydrateCollectionFromCloud } from '../utils/ayahCollection';
import { DAILY_AYAHS } from '../data/dailyAyah';

const RARITY = {
  common: {
    ar: 'مُبَارَك', latin: 'MUBARAK', bn: 'মুবারক',
    chip: '#6EE7B7', border: 'rgba(16,185,129,0.45)', glow: 'rgba(16,185,129,0.25)',
    bg: 'linear-gradient(145deg,#04231B 0%,#0A3A2A 45%,#06281E 100%)',
    shimmer: 'linear-gradient(115deg, transparent 30%, rgba(110,231,183,0.12) 50%, transparent 70%)',
  },
  rare: {
    ar: 'نُورَانِي', latin: 'NOORANI', bn: 'নূরানী',
    chip: '#FBBF24', border: 'rgba(251,191,36,0.55)', glow: 'rgba(251,191,36,0.32)',
    bg: 'linear-gradient(145deg,#332404 0%,#6B4A08 45%,#3A2A05 100%)',
    shimmer: 'linear-gradient(115deg, transparent 25%, rgba(251,191,36,0.22) 45%, rgba(255,255,255,0.15) 50%, rgba(251,191,36,0.22) 55%, transparent 75%)',
  },
  legendary: {
    ar: 'قُدْسِي', latin: 'QUDSI', bn: 'কুদসী',
    chip: '#7DD3FC',
    border: 'rgba(125,211,252,0.65)',
    glow: 'rgba(56,189,248,0.55)',
    bg: `
      radial-gradient(ellipse 120% 80% at 20% 10%, rgba(125,211,252,0.22) 0%, transparent 50%),
      radial-gradient(ellipse 100% 60% at 90% 95%, rgba(103,232,249,0.18) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(56,189,248,0.08) 0%, transparent 60%),
      linear-gradient(145deg,#041E3A 0%,#0C4A6E 35%,#0369A1 55%,#082F49 100%)
    `,
    shimmer: 'linear-gradient(115deg, transparent 15%, rgba(125,211,252,0.28) 35%, rgba(255,255,255,0.45) 50%, rgba(103,232,249,0.28) 65%, transparent 85%)',
    aurora: 'linear-gradient(135deg, rgba(125,211,252,0.15), rgba(103,232,249,0.1), rgba(56,189,248,0.15))',
  },
} as const;

const BN: React.CSSProperties = { fontFamily: "'Hind Siliguri', 'Anek Bangla', sans-serif" };

/* ─── Floating Particle ─── */
const Particle: React.FC<{ i: number }> = ({ i }) => {
  const style = useMemo(() => {
    const size = 1 + Math.random() * 2;
    return {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${size}px`,
      height: `${size}px`,
      background: i % 3 === 0 ? '#FBBF24' : i % 3 === 1 ? '#6EE7B7' : '#C084FC',
      animation: `particleFloat ${8 + Math.random() * 12}s ease-in-out ${Math.random() * 8}s infinite`,
    } as React.CSSProperties;
  }, [i]);
  return <span className="absolute rounded-full opacity-30 pointer-events-none" style={style} />;
};

/* ─── shared card decorations ─── */
const CardDecor: React.FC<{ t: (typeof RARITY)[keyof typeof RARITY]; isLegendary?: boolean }> = ({ t, isLegendary }) => (
  <>
    <div className="absolute inset-x-0 top-0 h-1/2 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02) 55%, transparent)' }} />
    <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
    <span className="absolute -right-3 -bottom-8 text-[110px] leading-none pointer-events-none select-none" style={{ color: 'rgba(255,255,255,0.035)', fontFamily: "'Amiri', serif" }}>۞</span>
    <div className="absolute top-0 inset-x-6 h-px" style={{ background: `linear-gradient(90deg, transparent, ${t.chip}, transparent)`, opacity: 0.55 }} />
    <div className="absolute top-3.5 right-3.5 w-7 h-7 flex items-center justify-center">
      <span className="absolute inset-0 rotate-45 rounded-[5px]" style={{ border: `1px solid ${t.chip}`, opacity: 0.5 }} />
      <span className="absolute inset-0 rounded-[5px]" style={{ border: `1px solid ${t.chip}`, opacity: 0.5 }} />
      <span className="relative text-[11px] leading-none" style={{ color: t.chip, fontFamily: "'Amiri', serif" }}>۞</span>
    </div>
    {isLegendary && 'aurora' in t && (
      <div className="absolute inset-0 pointer-events-none opacity-60" style={{ background: t.aurora, mixBlendMode: 'screen' }} />
    )}
  </>
);

/* ─── Collected Card — FLIP: front = Arabic+Bangla, back = English transliteration ─── */
const VaultCard: React.FC<{ c: CollectedAyah; i: number }> = ({ c, i }) => {
  const [flipped, setFlipped] = useState(false);
  const ayah = DAILY_AYAHS.find((a) => a.id === c.id);
  const t = RARITY[c.rarity] || RARITY.common;
  const isLegendary = c.rarity === 'legendary';
  if (!ayah) return null;

  const cardStyle: React.CSSProperties = {
    background: t.bg,
    border: `1px solid ${t.border}`,
    boxShadow: `0 30px 60px -20px ${t.glow}, inset 0 1px 0 rgba(255,255,255,0.12)`,
    padding: '1.25rem 1.25rem 1rem',
    minHeight: '250px',
  };

  return (
    <div className="vault-enter vault-float mx-auto w-full max-w-85" style={{ animationDelay: `${i * 0.07}s, ${1 + i * 0.4}s` }}>
      <div
        className="cursor-pointer select-none"
        style={{ perspective: '1200px' }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          style={{
            display: 'grid',
            transformStyle: 'preserve-3d',
            transition: 'transform .7s cubic-bezier(.4,0,.2,1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* ═══ FRONT ═══ */}
          <div
            className="relative overflow-hidden rounded-[22px] flex flex-col gap-3"
            style={{ ...cardStyle, gridArea: '1 / 1', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <CardDecor t={t} isLegendary={isLegendary} />
            <div className="absolute inset-0 pointer-events-none transition-transform duration-1000 -translate-x-full group-hover:translate-x-full" style={{ background: t.shimmer }} />

            <div className="relative flex items-center justify-center gap-2 pr-8">
              <span className="h-px w-6 sm:w-8" style={{ background: `linear-gradient(90deg, transparent, ${t.chip})`, opacity: 0.6 }} />
              <span dir="rtl" className="text-[13px]" style={{ fontFamily: "'Amiri', serif", color: t.chip, letterSpacing: '0.05em' }}>{t.ar}</span>
              <span className="rotate-45 block w-1 h-1 shrink-0" style={{ background: t.chip }} />
              <span className="text-[7px] font-black tracking-[0.25em]" style={{ color: t.chip, opacity: 0.85 }}>{t.latin}</span>
              <span className="h-px w-6 sm:w-8" style={{ background: `linear-gradient(90deg, ${t.chip}, transparent)`, opacity: 0.6 }} />
            </div>

            <div className="relative flex flex-col items-center justify-center py-1">
              <p dir="rtl" className="text-center leading-loose px-1" style={{ fontFamily: "'Amiri', serif", color: '#F8FAFC', fontSize: 'clamp(17px, 4.8vw, 20px)', textShadow: `0 0 22px ${t.glow}` }}>
                <span style={{ color: t.chip, fontSize: '18px', opacity: 0.7 }}>﴿</span> {ayah.arabic}{' '}
                <span style={{ color: t.chip, fontSize: '18px', opacity: 0.7 }}>﴾</span>
              </p>
            </div>

            <p className="relative text-center px-1" style={{ ...BN, fontSize: '12.5px', fontWeight: 500, lineHeight: 1.75, color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 2px rgba(0,0,0,0.45)' }}>
              "{ayah.bangla}"
            </p>

            <div className="flex items-center gap-2 my-0.5">
              <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${t.chip}, transparent)`, opacity: 0.3 }} />
              <span style={{ color: t.chip, fontSize: '9px', fontFamily: "'Amiri', serif", opacity: 0.8 }}>۞</span>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${t.chip}, transparent, ${t.chip})`, opacity: 0.3 }} />
            </div>

            <div className="relative flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-bold truncate flex items-center gap-1" style={{ ...BN, color: t.chip }}>📖 {ayah.reference}</p>
                <p className="text-[8px] text-white/45 font-mono mt-0.5">#{String(c.id).padStart(3, '0')} · {new Date(c.claimedAt).toLocaleDateString('bn-BD')}</p>
              </div>
              <span className="flex items-center gap-1 text-[7px] font-black tracking-[0.15em] shrink-0" style={{ color: t.chip, opacity: 0.8 }}>
                <RotateCw className="w-2.5 h-2.5" /> উচ্চারণ
              </span>
            </div>
          </div>

          {/* ═══ BACK — Matte Black Debit Card + English Transliteration ═══ */}
          <div
            className="relative overflow-hidden rounded-[22px] flex flex-col gap-3"
            style={{
              gridArea: '1 / 1',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: `
                radial-gradient(120% 90% at 50% 0%, ${t.glow}, transparent 55%),
                linear-gradient(160deg, #0A0A0F 0%, #15151E 45%, #0D0D14 100%)
              `,
              border: `1px solid rgba(255,255,255,0.08)`,
              boxShadow: `
                0 30px 60px -20px rgba(0,0,0,0.95),
                inset 0 1px 0 rgba(255,255,255,0.08),
                inset 0 -1px 0 rgba(0,0,0,0.5),
                inset 0 0 80px rgba(0,0,0,0.65)
              `,
              padding: '1.25rem 1.25rem 1rem',
              minHeight: '250px',
            }}
          >
            <CardDecor t={t} />

            {/* metallic sheen */}
            <div className="absolute inset-0 pointer-events-none opacity-30" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)' }} />
            {/* inner premium ring */}
            <div className="absolute inset-2 rounded-[16px] pointer-events-none" style={{ border: `1px solid ${t.chip}25` }} />
            {/* vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(90% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />

            {/* chip-style indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <div className="w-8 h-6 rounded-md" style={{ background: `linear-gradient(135deg, ${t.chip}40, ${t.chip}20)`, border: `1px solid ${t.chip}50` }} />
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: t.chip, boxShadow: `0 0 8px ${t.glow}` }} />
            </div>

            {/* label */}
            <div className="relative flex items-center justify-center gap-2 pr-8 mt-2">
              <span className="h-px w-6 sm:w-8" style={{ background: `linear-gradient(90deg, transparent, ${t.chip})`, opacity: 0.6 }} />
              <span className="text-[10px] font-black tracking-[0.35em] uppercase" style={{ ...BN, color: t.chip }}>উচ্চারণ · Transliteration</span>
              <span className="h-px w-6 sm:w-8" style={{ background: `linear-gradient(90deg, ${t.chip}, transparent)`, opacity: 0.6 }} />
            </div>

            {/* ⭐ ENGLISH TRANSLITERATION — premium italic */}
            <div className="relative flex-1 flex items-center justify-center py-2">
              <p
                className="text-center px-2"
                style={{
                  fontFamily: "'Lexend', 'Plus Jakarta Sans', sans-serif",
                  fontSize: 'clamp(13px, 3.9vw, 16px)',
                  fontWeight: 500,
                  fontStyle: 'italic',
                  lineHeight: 2.05,
                  letterSpacing: '0.02em',
                  color: '#F8FAFC',
                  textShadow: `0 0 20px ${t.glow}`,
                }}
              >
                {ayah.translit}
              </p>
            </div>

            {/* bangla meaning whisper */}
            <p className="relative text-center px-2" style={{ ...BN, fontSize: '10px', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)' }}>
              "{ayah.bangla}"
            </p>

            <div className="flex items-center gap-2 my-0.5">
              <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${t.chip}, transparent)`, opacity: 0.3 }} />
              <span style={{ color: t.chip, fontSize: '9px', fontFamily: "'Amiri', serif", opacity: 0.8 }}>۞</span>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${t.chip}, transparent, ${t.chip})`, opacity: 0.3 }} />
            </div>

            <div className="relative flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-bold truncate flex items-center gap-1" style={{ ...BN, color: t.chip }}>📖 {ayah.reference}</p>
                <p className="text-[8px] text-white/45 font-mono mt-0.5">#{String(c.id).padStart(3, '0')}</p>
              </div>
              <span className="flex items-center gap-1 text-[7px] font-black tracking-[0.15em] shrink-0" style={{ color: t.chip, opacity: 0.8 }}>
                <RotateCw className="w-2.5 h-2.5" /> ফিরে যান
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Locked Slot ─── */
const LockedCard: React.FC<{ id: number; i: number }> = ({ id, i }) => (
  <div className="vault-enter mx-auto w-full max-w-85" style={{ animationDelay: `${i * 0.05}s` }}>
    <div className="relative overflow-hidden rounded-[22px] p-4 flex flex-col items-center justify-center gap-3" style={{ minHeight: '250px', background: 'linear-gradient(160deg,#0D1015 0%,#0A0C10 100%)', border: '1px dashed rgba(255,255,255,0.1)' }}>
      <div className="absolute inset-3 rounded-lg border pointer-events-none" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
      <span className="text-4xl opacity-10" style={{ fontFamily: "'Amiri', serif", color: '#FBBF24' }}>۞</span>
      <Lock className="w-5 h-5 text-text-muted" />
      <p className="text-[9px] font-bold text-text-muted" style={BN}>অসংগ্রহীত</p>
      <p className="text-[8px] font-mono text-text-muted/50">#{String(id).padStart(3, '0')}</p>
    </div>
  </div>
);

/* ─── VAULT MAIN ─── */
export const AyahCollectionVault: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [col, setCol] = useState<CollectedAyah[]>(getCollection());

  useEffect(() => {
    void hydrateCollectionFromCloud();
    const onChange = () => setCol(getCollection());
    window.addEventListener('campus6:collection-changed', onChange);
    return () => window.removeEventListener('campus6:collection-changed', onChange);
  }, []);

  const claimedIds = useMemo(() => new Set(col.map((c) => c.id)), [col]);
  const locked = useMemo(() => DAILY_AYAHS.filter((a) => !claimedIds.has(a.id)).map((a) => a.id), [claimedIds]);

  const rareCount = col.filter((c) => c.rarity === 'rare').length;
  const legendCount = col.filter((c) => c.rarity === 'legendary').length;
  const pct = Math.round((col.length / DAILY_AYAHS.length) * 100);

  const order = { legendary: 0, rare: 1, common: 2 } as Record<string, number>;
  const sorted = useMemo(() => [...col].sort((a, b) => order[a.rarity] - order[b.rarity]), [col]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-70 overflow-y-auto" style={{ background: 'radial-gradient(1200px 600px at 50% -10%, rgba(251,191,36,0.08), transparent 60%), radial-gradient(900px 500px at 85% 110%, rgba(168,85,247,0.06), transparent 60%), radial-gradient(700px 400px at 10% 50%, rgba(16,185,129,0.05), transparent 60%), linear-gradient(180deg,#070910 0%,#0B0D14 100%)' }}>
      <style>{`
        @keyframes vaultEnter { from { opacity: 0; transform: translateY(30px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes vaultFloat { 0%,100% { transform: translateY(0) rotate(-0.5deg); } 50% { transform: translateY(-10px) rotate(0.5deg); } }
        @keyframes particleFloat { 0%,100% { transform: translateY(0) scale(1); opacity: 0.15; } 50% { transform: translateY(-40px) scale(1.5); opacity: 0.5; } }
        @keyframes glowPulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
        .vault-enter { animation: vaultEnter .7s cubic-bezier(.16,1,.3,1) both; }
        .vault-float { animation: vaultEnter .7s cubic-bezier(.16,1,.3,1) both, vaultFloat 7s ease-in-out infinite; }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (<Particle key={i} i={i} />))}
      </div>

      <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 backdrop-blur-xl" style={{ background: 'rgba(7,9,16,0.82)', borderBottom: '1px solid rgba(251,191,36,0.18)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FBBF24,#B7791F)', boxShadow: '0 4px 12px rgba(251,191,36,0.35)' }}>
            <BookMarked className="w-4 h-4 text-[#0B0D14]" />
          </div>
          <div>
            <p className="text-[8px] tracking-[0.3em] uppercase font-black" style={{ color: '#FBBF24' }}>Private Vault</p>
            <h2 className="text-sm font-bold -mt-0.5" style={{ ...BN, color: '#F8FAFC' }}>আয়াত সংগ্রহশালা</h2>
          </div>
          <span className="text-[9px] font-black font-mono px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.3)' }}>
            {col.length}/{DAILY_AYAHS.length}
          </span>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl transition-all hover:scale-110" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8' }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="relative px-5 pt-8 pb-4 max-w-5xl mx-auto z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, #FBBF24)' }} />
          <p className="text-[9px] tracking-[0.35em] uppercase font-black" style={{ color: '#FBBF24' }}>Personal Collection</p>
          <span className="h-px w-8" style={{ background: 'linear-gradient(90deg, #FBBF24, transparent)' }} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold" style={{ ...BN, color: '#F8FAFC', lineHeight: 1.25 }}>
          তোমার আধ্যাত্মিক <br />সংগ্রহশালা
        </h1>
        <p className="text-[11px] mt-2 max-w-lg" style={{ ...BN, color: '#94A3B8', lineHeight: 1.7 }}>
          প্রতিদিন login করে আজকের আয়াত সংগ্রহ করো — card-এ <span style={{ color: '#FBBF24' }}>tap করলে উচ্চারণ</span> দেখাবে।
        </p>

        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { label: 'মোট সংগ্রহ', value: `${col.length}`, sub: 'cards', color: '#F8FAFC', grad: 'linear-gradient(135deg,#1F2937,#111827)' },
            { label: 'নূরানী', value: `${rareCount}`, sub: 'radiant', color: '#FBBF24', grad: 'linear-gradient(135deg,#3A2A05,#1F1503)' },
            { label: 'কুদসী', value: `${legendCount}`, sub: 'sacred', color: '#7DD3FC', grad: 'linear-gradient(135deg,#0C4A6E,#03101F)' },
          ].map((s) => (
            <div key={s.label} className="relative overflow-hidden p-3.5 rounded-2xl text-center" style={{ background: s.grad, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
              <p className="text-2xl sm:text-3xl font-black font-mono relative" style={{ color: s.color, textShadow: `0 0 20px ${s.color}33` }}>{s.value}</p>
              <p className="text-[9px] font-bold mt-0.5 relative" style={{ ...BN, color: '#64748B' }}>{s.label}</p>
              <p className="text-[8px] font-mono tracking-[0.2em] uppercase relative" style={{ color: s.color, opacity: 0.7 }}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black tracking-[0.25em] uppercase" style={{ color: '#FBBF24' }}>Collection Progress</span>
            <span className="text-[11px] font-black font-mono" style={{ color: '#F8FAFC' }}>{pct}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000 relative" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#10B981,#FBBF24,#7DD3FC)', boxShadow: '0 0 20px rgba(251,191,36,0.5)' }}>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', animation: 'glowPulse 2s ease-in-out infinite' }} />
            </div>
          </div>
          <div className="flex justify-between text-[9px] font-mono mt-2" style={{ color: '#64748B' }}>
            <span>{col.length} collected</span>
            <span>{DAILY_AYAHS.length - col.length} remaining</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-3 text-[9px]">
          {[
            { ar: 'مُبَارَك', label: 'MUBARAK', bn: 'মুবারক', chip: '#6EE7B7' },
            { ar: 'نُورَانِي', label: 'NOORANI', bn: 'নূরানী', chip: '#FBBF24' },
            { ar: 'قُدْسِي', label: 'QUDSI', bn: 'কুদসী', chip: '#7DD3FC' },
          ].map((r) => (
            <div key={r.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span dir="rtl" style={{ fontFamily: "'Amiri', serif", color: r.chip, fontSize: '11px' }}>{r.ar}</span>
              <span style={{ color: r.chip, opacity: 0.8 }}>·</span>
              <span className="font-bold tracking-wider" style={{ color: r.chip }}>{r.label}</span>
              <span className="text-text-muted" style={BN}>({r.bn})</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 px-5 pb-32 max-w-6xl mx-auto relative z-10">
        {sorted.map((c, i) => (<VaultCard key={c.id} c={c} i={i} />))}
        {locked.map((id, i) => (<LockedCard key={id} id={id} i={col.length + i} />))}
      </div>

      <div className="fixed bottom-0 inset-x-0 px-5 py-4 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent, rgba(7,9,16,0.95))' }}>
        <p className="text-center text-[9px] italic" style={{ ...BN, color: 'rgba(251,191,36,0.7)' }}>
          "যে আল্লাহর স্মরণে অন্তর প্রশান্ত হয়" — সূরা আর-রা'দ ১৩:২৮
        </p>
      </div>
    </div>
  );
};