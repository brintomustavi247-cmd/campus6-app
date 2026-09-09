import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Lock, CheckCircle2, Play, Pause } from 'lucide-react';
import { PageId } from '../components/Sidebar';
import { UserProfile } from '../types';
import { getLocalUserProfile } from '../utils/storageEngine';

/* ═══════════════════════════════════════════════════════════════════
   TYPOGRAPHY — mystical serif + data mono + bengali
   ═══════════════════════════════════════════════════════════════════ */
const FONT_SERIF = "'Cormorant Garamond', 'Noto Serif Bengali', 'Times New Roman', serif";
const FONT_MONO = "'JetBrains Mono', monospace";
const FONT_BN = "'Hind Siliguri', 'Noto Sans Bengali', sans-serif";

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Noto+Serif+Bengali:wght@500;600;700&display=swap');

  @keyframes mxSpinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes mxSpinRev  { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
  @keyframes mxTwinkle  { 0%,100% { opacity: 0; transform: scale(.5); } 50% { opacity: 1; transform: scale(1.3); } }
  @keyframes mxFloat    { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
  @keyframes mxPulse    { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
  @keyframes mxFade     { from { opacity: 0; } to { opacity: 1; } }
  @keyframes mxBurst    { 0% { transform: scale(.4); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
  @keyframes mxRise     { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes mxShimmer  { 0% { transform: translateX(-100%); } 100% { transform: translateX(320%); } }
  .mx-shimmer::after { content:''; position:absolute; top:0; left:0; height:100%; width:30%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent); animation: mxShimmer 2.2s ease-in-out infinite; }
`;

/* ═══════════════════════════════════════════════════════════════════
   RANKED MATH — 1h focus = 100 XP • 20 XP = 1 LP • 100 LP = promotion
   ═══════════════════════════════════════════════════════════════════ */
const XP_PER_HOUR = 100;
const XP_PER_DIV = 2000;
const DIV_ROMAN = ['IV', 'III', 'II', 'I'];

type GroupName = 'AWAKENING' | 'RADIANCE' | 'TRANSCENDENCE';

interface Tier {
  id: number;
  name: string;
  title: string;
  bn: string;
  group: GroupName;
  lore: string;
  color: string;
  sigil: number;
  divisions: number;
  rewards: string[];
}

const TIERS: Tier[] = [
  { id: 1, name: 'IRON NOVICE',        title: 'IGNITION',    bn: 'নবীন',      group: 'AWAKENING',     lore: 'The first spark beneath the ash.',        color: '#8B93A8', sigil: 5,  divisions: 4, rewards: ['Basic Badge'] },
  { id: 2, name: 'BRONZE SCHOLAR',     title: 'EMBER',       bn: 'ব্রোঞ্জ',    group: 'AWAKENING',     lore: 'A flame that refuses to die.',            color: '#CD7F32', sigil: 1,  divisions: 4, rewards: ['Bronze Frame', 'Streak Shield'] },
  { id: 3, name: 'SILVER SCRIBE',      title: 'INSCRIPTION', bn: 'রৌপ্য',     group: 'AWAKENING',     lore: 'Knowledge etched in silver ink.',         color: '#C0C8D8', sigil: 2,  divisions: 4, rewards: ['Silver Frame', 'Quest Bonus +5%'] },
  { id: 4, name: 'GOLD LUMINARY',      title: 'RADIANCE',    bn: 'স্বর্ণ',     group: 'RADIANCE',      lore: 'One who carries the light of knowledge.', color: '#FACC15', sigil: 3,  divisions: 4, rewards: ['Gold Frame', 'Profile Glow'] },
  { id: 5, name: 'PLATINUM SYNAPTIC',  title: 'NEXUS',       bn: 'প্লাটিনাম',  group: 'RADIANCE',      lore: 'Where every thought begins to connect.',  color: '#6EE7D8', sigil: 4,  divisions: 4, rewards: ['Plat Frame', 'Elite Quests'] },
  { id: 6, name: 'DIAMOND ASTRAL',     title: 'ASTRAL',      bn: 'ডায়মন্ড',    group: 'RADIANCE',      lore: 'A mind orbiting beyond ordinary limits.', color: '#38BDF8', sigil: 6,  divisions: 4, rewards: ['Diamond Frame', 'Animated Badge'] },
  { id: 7, name: 'MASTER NEURAL',      title: 'COGNITION',   bn: 'মাস্টার',    group: 'TRANSCENDENCE', lore: 'The eye that sees through every veil.',   color: '#C9A6F0', sigil: 7,  divisions: 1, rewards: ['Master Aura', 'Top-500 List'] },
  { id: 8, name: 'GRAND ARCHON',       title: 'DOMINION',    bn: 'গ্র্যান্ড',   group: 'TRANSCENDENCE', lore: 'A crown forged from discipline.',         color: '#F0A0C0', sigil: 8,  divisions: 1, rewards: ['Grand Aura', 'Top-100 List'] },
  { id: 9, name: 'CHALLENGER GENESIS', title: 'ETERNITY',    bn: 'চ্যালেঞ্জার', group: 'TRANSCENDENCE', lore: 'The origin. The eternal flame of wisdom.',color: '#F8FAFC', sigil: 11, divisions: 1, rewards: ['Genesis Crown', 'Hall of Fame'] },
];

const GROUPS: { name: GroupName; bn: string; sub: string }[] = [
  { name: 'TRANSCENDENCE', bn: 'ঊর্ধ্বগমন', sub: 'Beyond the mortal ladder' },
  { name: 'RADIANCE',      bn: 'দীপ্তি',    sub: 'Bearers of the light' },
  { name: 'AWAKENING',     bn: 'জাগরণ',     sub: 'Where the journey begins' },
];

const TIER_START: number[] = (() => {
  const out: number[] = []; let acc = 0;
  for (const t of TIERS) { out.push(acc); acc += t.divisions * XP_PER_DIV; }
  return out;
})();

interface Progress { tierIdx: number; divIdx: number; lp: number; divStart: number; hoursToNext: number; nextLabel: string; }

type RankProfile = UserProfile & {
  xp?: number;
  total_xp?: number;
  rank_score?: number;
  total_study_time?: number;
  studyHours?: number;
  current_streak?: number;
  streak?: number;
};

const getProgress = (xp: number): Progress => {
  let tierIdx = 0;
  for (let i = TIERS.length - 1; i >= 0; i--) if (xp >= TIER_START[i]) { tierIdx = i; break; }
  const tier = TIERS[tierIdx];
  const divIdx = Math.min(tier.divisions - 1, Math.floor((xp - TIER_START[tierIdx]) / XP_PER_DIV));
  const divStart = TIER_START[tierIdx] + divIdx * XP_PER_DIV;
  const lp = Math.min(100, Math.floor(((xp - divStart) / XP_PER_DIV) * 100));
  const hoursToNext = Math.max(0, (divStart + XP_PER_DIV - xp) / XP_PER_HOUR);
  const nextLabel = divIdx < tier.divisions - 1 ? `${tier.name} ${DIV_ROMAN[divIdx + 1]}` : TIERS[tierIdx + 1] ? `${TIERS[tierIdx + 1].name}${TIERS[tierIdx + 1].divisions > 1 ? ' IV' : ''}` : 'MAX RANK';
  return { tierIdx, divIdx, lp, divStart, hoursToNext, nextLabel };
};

const fmt = (n: number) => n.toLocaleString('en-US');
const fmtHours = (h: number) => (h >= 1 ? `${h.toFixed(1)}h` : `${Math.round(h * 60)}m`);

/* ═══════════════════════════════════════════════════════════════════
   CODE-DRAWN SIGILS (pure SVG)
   ═══════════════════════════════════════════════════════════════════ */
const SIGIL_ART: Record<number, React.ReactNode> = {
  1: (<><path d="M50 16 C59 28 67 37 67 52 C67 67 59 76 50 82 C41 76 33 67 33 52 C33 37 41 28 50 16 Z" /><path d="M50 38 L59 52 L50 66 L41 52 Z" fill="currentColor" stroke="none" /><path d="M50 4 V12 M50 88 V96 M14 50 H6 M94 50 H86" strokeOpacity=".8" /><path d="M24 24 L30 30 M76 24 L70 30 M24 76 L30 70 M76 76 L70 70" strokeOpacity=".5" /></>),
  2: (<><path d="M64 16 C50 26 40 40 35 58 L31 72 L45 68 C61 62 70 46 72 28 C72 22 68 18 64 16 Z" /><path d="M35 58 L55 38" strokeOpacity=".9" /><path d="M31 72 L26 80" /><path d="M40 84 H74" strokeOpacity=".7" /><circle cx="64" cy="24" r="3" fill="currentColor" stroke="none" /></>),
  3: (<><circle cx="50" cy="50" r="15" /><circle cx="50" cy="50" r="6" fill="currentColor" stroke="none" /><path d="M50 12 V24 M50 76 V88 M12 50 H24 M76 50 H88" /><path d="M25 25 L33 33 M75 25 L67 33 M25 75 L33 67 M75 75 L67 67" strokeOpacity=".7" /><circle cx="50" cy="50" r="24" strokeOpacity=".35" strokeDasharray="3 5" /></>),
  4: (<><circle cx="50" cy="50" r="7" fill="currentColor" stroke="none" /><circle cx="50" cy="20" r="4" fill="currentColor" stroke="none" /><circle cx="76" cy="35" r="4" fill="currentColor" stroke="none" /><circle cx="76" cy="65" r="4" fill="currentColor" stroke="none" /><circle cx="50" cy="80" r="4" fill="currentColor" stroke="none" /><circle cx="24" cy="65" r="4" fill="currentColor" stroke="none" /><circle cx="24" cy="35" r="4" fill="currentColor" stroke="none" /><path d="M50 43 V24 M56 46 L72 37 M56 54 L72 63 M50 57 V76 M44 54 L28 63 M44 46 L28 37" strokeOpacity=".85" /><path d="M50 20 L76 35 L76 65 L50 80 L24 65 L24 35 Z" strokeOpacity=".35" strokeDasharray="2 4" /></>),
  5: (<><circle cx="50" cy="42" r="15" /><circle cx="50" cy="42" r="6" fill="currentColor" stroke="none" /><path d="M50 22 V16 M50 62 V68 M30 42 H24 M76 42 H70 M36 28 L31 23 M64 28 L69 23 M36 56 L31 61 M64 56 L69 61" strokeOpacity=".8" /><path d="M28 76 H72 L64 86 H36 Z" /><path d="M50 68 V76" strokeOpacity=".6" /></>),
  6: (<><path d="M50 20 L56 44 L80 50 L56 56 L50 80 L44 56 L20 50 L44 44 Z" fill="currentColor" stroke="none" fillOpacity=".9" /><ellipse cx="50" cy="50" rx="36" ry="13" transform="rotate(-18 50 50)" strokeOpacity=".6" /><circle cx="80" cy="38" r="4" fill="currentColor" stroke="none" /><path d="M50 6 V14" strokeOpacity=".7" /></>),
  7: (<><path d="M50 16 L84 78 H16 Z" /><path d="M33 56 Q50 42 67 56 Q50 70 33 56 Z" /><circle cx="50" cy="56" r="5" fill="currentColor" stroke="none" /><path d="M50 4 V10 M38 8 L41 14 M62 8 L59 14" strokeOpacity=".7" /></>),
  8: (<><path d="M50 10 V58" /><path d="M38 24 H62" /><circle cx="50" cy="10" r="3" fill="currentColor" stroke="none" /><path d="M44 58 L50 66 L56 58" /><path d="M26 72 L33 58 L41 68 L50 54 L59 68 L67 58 L74 72 Z" /><path d="M26 78 H74" strokeOpacity=".8" /></>),
  9: (<><circle cx="50" cy="50" r="24" /><circle cx="50" cy="50" r="14" strokeOpacity=".8" /><circle cx="50" cy="50" r="6" fill="currentColor" stroke="none" /><path d="M50 18 L54 26 L46 26 Z M50 82 L54 74 L46 74 Z M18 50 L26 46 L26 54 Z M82 50 L74 46 L74 54 Z" fill="currentColor" stroke="none" /></>),
  10: (<><path d="M50 22 L66 50 L50 78 L34 50 Z" /><path d="M50 34 L58 50 L50 66 L42 50 Z" fill="currentColor" stroke="none" /><path d="M30 46 C22 40 14 38 7 40 C13 47 20 51 30 53 Z" /><path d="M70 46 C78 40 86 38 93 40 C87 47 80 51 70 53 Z" /></>),
  11: (<><circle cx="50" cy="52" r="26" strokeDasharray="4 3" strokeOpacity=".8" /><path d="M50 34 L64 52 L50 70 L36 52 Z" fill="currentColor" stroke="none" /><path d="M24 74 C18 62 18 46 26 34" strokeOpacity=".8" /><path d="M76 74 C82 62 82 46 74 34" strokeOpacity=".8" /><ellipse cx="21" cy="60" rx="3" ry="6" transform="rotate(20 21 60)" fill="currentColor" stroke="none" fillOpacity=".8" /><ellipse cx="20" cy="46" rx="3" ry="6" transform="rotate(10 20 46)" fill="currentColor" stroke="none" fillOpacity=".8" /><ellipse cx="79" cy="60" rx="3" ry="6" transform="rotate(-20 79 60)" fill="currentColor" stroke="none" fillOpacity=".8" /><ellipse cx="80" cy="46" rx="3" ry="6" transform="rotate(-10 80 46)" fill="currentColor" stroke="none" fillOpacity=".8" /><path d="M50 8 V18" /><path d="M50 20 L54 26 L50 32 L46 26 Z" fill="currentColor" stroke="none" /></>),
};

const SigilArt: React.FC<{ id: number }> = ({ id }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    {SIGIL_ART[id]}
  </svg>
);

/* CAMPUS 6.0 crest (logo.svg) */
const CampusCrest: React.FC<{ size?: number }> = ({ size = 30 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} style={{ filter: 'drop-shadow(0 0 8px rgba(53,214,255,0.55))' }}>
    <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="none" stroke="#35D6FF" strokeWidth="4" strokeOpacity="0.5" />
    <path d="M32 25 H42 V75 H32 Z" fill="#0AA8D8" />
    <path fillRule="evenodd" clipRule="evenodd" d="M42 25 H65 C75 25 80 32 80 40 C80 48 75 55 65 55 H42 V25 Z M52 47 H62 C65 47 68 45 68 40 C68 35 65 33 62 33 H52 V47 Z" fill="#0AA8D8" />
    <path d="M52 58 H66 L80 75 H66 L52 58 Z" fill="#35D6FF" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════
   ORNAMENT ── ◆ ─
   ═══════════════════════════════════════════════════════════════════ */
const Ornament: React.FC<{ color?: string; width?: number }> = ({ color = 'rgba(255,255,255,0.35)', width = 80 }) => (
  <div className="flex items-center gap-2 select-none shrink-0">
    <div style={{ width, height: 1, background: `linear-gradient(90deg, transparent, ${color})` }} />
    <div style={{ width: 6, height: 6, transform: 'rotate(45deg)', background: color, boxShadow: `0 0 7px ${color}` }} />
    <div style={{ width, height: 1, background: `linear-gradient(90deg, ${color}, transparent)` }} />
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   GRAND SIGIL — rays + rune ring + halo + sparks + optional LP ring
   ═══════════════════════════════════════════════════════════════════ */
const GrandSigil: React.FC<{ tier: Tier; size?: number; locked?: boolean; bright?: boolean; lp?: number | null }> = ({ tier, size = 200, locked = false, bright = false, lp = null }) => {
  const color = locked ? '#3A3F4E' : tier.color;
  const sparks = useMemo(() => Array.from({ length: 12 }, () => ({ x: Math.random() * 150 - 25, y: Math.random() * 150 - 25, d: Math.random() * 3, s: 1.5 + Math.random() * 2.5 })), []);
  const r = 47;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* starburst rays */}
      <div className="absolute inset-[-40%]" style={{ background: `repeating-conic-gradient(from 0deg, ${color}${locked ? '0a' : bright ? '38' : '24'} 0deg 1.5deg, transparent 1.5deg 14deg)`, maskImage: 'radial-gradient(circle, black 12%, transparent 64%)', WebkitMaskImage: 'radial-gradient(circle, black 12%, transparent 64%)', animation: 'mxSpinSlow 80s linear infinite' }} />
      {/* halo */}
      <div className="absolute inset-[-10%] rounded-full" style={{ background: `radial-gradient(circle, ${color}${locked ? '0d' : '30'} 0%, transparent 68%)`, animation: bright ? 'mxPulse 3s ease-in-out infinite' : undefined }} />
      {/* rune tick ring */}
      <div className="absolute inset-[2%] rounded-full" style={{ background: `repeating-conic-gradient(from 0deg, ${color}${locked ? '22' : '55'} 0deg 1deg, transparent 1deg 12deg)`, maskImage: 'radial-gradient(circle, transparent 62%, black 63%, black 66%, transparent 67%)', WebkitMaskImage: 'radial-gradient(circle, transparent 62%, black 63%, black 66%, transparent 67%)', animation: 'mxSpinRev 50s linear infinite' }} />
      {/* rings */}
      <div className="absolute inset-[7%] rounded-full border" style={{ borderColor: `${color}${locked ? '22' : '44'}` }} />
      <div className="absolute inset-[12%] rounded-full border border-dashed" style={{ borderColor: `${color}${locked ? '18' : '33'}`, animation: 'mxSpinRev 70s linear infinite' }} />
      {/* LP progress ring */}
      {lp !== null && !locked && (
        <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={3} fill="none" />
          <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * lp) / 100} style={{ transition: 'stroke-dashoffset .9s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 6px ${color})` }} />
        </svg>
      )}
      {/* sparks */}
      {!locked && sparks.map((p, i) => (
        <div key={i} className="absolute rounded-full" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, background: tier.color, boxShadow: `0 0 7px ${tier.color}`, animation: `mxTwinkle ${2.4 + p.d}s ease-in-out ${p.d}s infinite` }} />
      ))}
      {/* sigil */}
      <div className="absolute inset-[18%]" style={{ color, filter: locked ? 'none' : `drop-shadow(0 0 10px ${tier.color}) drop-shadow(0 0 30px ${tier.color}77)`, animation: locked ? undefined : 'mxFloat 5s ease-in-out infinite' }}>
        <SigilArt id={tier.sigil} />
      </div>
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-black/75 border border-white/15 flex items-center justify-center backdrop-blur-sm">
            <Lock className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   DIVISION DIAMONDS
   ═══════════════════════════════════════════════════════════════════ */
const DivDiamonds: React.FC<{ filled: number; total: number; color: string; size?: number }> = ({ filled, total, color, size = 10 }) => (
  <div className="flex gap-2">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{ width: size, height: size, transform: 'rotate(45deg)', background: i < filled ? `linear-gradient(135deg, ${color}, ${color}88)` : 'rgba(255,255,255,0.08)', boxShadow: i < filled ? `0 0 10px ${color}99` : 'none', transition: 'all .5s ease' }} />
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   GROUP HEADER
   ═══════════════════════════════════════════════════════════════════ */
const GroupHeader: React.FC<{ group: typeof GROUPS[number]; tiers: Tier[] }> = ({ group, tiers }) => (
  <div className="flex flex-col items-center gap-4 pt-20 pb-10" style={{ animation: 'mxRise .9s ease-out both' }}>
    <p className="text-[10px] tracking-[0.5em] uppercase text-center" style={{ fontFamily: FONT_SERIF, color: 'rgba(255,255,255,0.4)' }}>Campus 6.0 • The Mysteries</p>
    <p className="text-[11px] tracking-[0.35em] uppercase text-center" style={{ fontFamily: FONT_SERIF, color: 'rgba(255,255,255,0.55)' }}>{group.sub}</p>
    <h2 className="text-4xl sm:text-5xl font-semibold tracking-[0.22em] text-center" style={{ fontFamily: FONT_SERIF, color: '#F4F1E8', textShadow: '0 0 34px rgba(255,255,255,0.28)' }}>{group.name}</h2>
    <p className="text-lg" style={{ fontFamily: FONT_SERIF, color: 'rgba(255,255,255,0.6)' }}>{group.bn}</p>
    <Ornament color="rgba(255,255,255,0.3)" width={120} />
    <div className="flex items-end justify-center gap-9 mt-3 flex-wrap">
      {tiers.map((t) => (
        <div key={t.id} className="flex flex-col items-center gap-2 group/mini cursor-default">
          <div className="w-14 h-14 transition-transform duration-300 group-hover/mini:scale-110" style={{ color: 'rgba(255,255,255,0.88)', filter: 'drop-shadow(0 0 9px rgba(255,255,255,0.5))' }}>
            <SigilArt id={t.sigil} />
          </div>
          <span className="text-[10px] tracking-[0.25em] uppercase text-center" style={{ fontFamily: FONT_SERIF, color: 'rgba(255,255,255,0.55)' }}>{t.name.split(' ')[0]}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   TIER PANEL (mysteries-style alternating)
   ═══════════════════════════════════════════════════════════════════ */
const TierPanel: React.FC<{
  tier: Tier;
  state: 'attained' | 'current' | 'sealed';
  divFilled: number;
  flip: boolean;
  onClick?: () => void;
  clickable?: boolean;
}> = ({ tier, state, divFilled, flip, onClick, clickable }) => {
  const locked = state === 'sealed';
  const current = state === 'current';

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden transition-all duration-500 ${clickable ? 'cursor-pointer' : ''} ${locked ? 'opacity-60 hover:opacity-90' : 'hover:opacity-100'}`}
      style={{
        background: `radial-gradient(circle at ${flip ? 80 : 20}% 50%, ${tier.color}${locked ? '08' : '13'} 0%, transparent 58%), linear-gradient(180deg, #0C0F15 0%, #090C11 100%)`,
        boxShadow: current ? `inset 0 0 70px ${tier.color}16, 0 0 44px ${tier.color}1c` : 'inset 0 0 55px rgba(0,0,0,0.55)',
        border: `1px solid ${current ? `${tier.color}4d` : 'rgba(255,255,255,0.05)'}`,
        animation: 'mxRise .8s ease-out both',
      }}
    >
      {/* diagonal light lines */}
      <div className="pointer-events-none absolute" style={{ left: '-20%', width: '140%', top: '26%', height: 1, transform: 'rotate(-5deg)', background: `linear-gradient(90deg, transparent, ${tier.color}33, transparent)` }} />
      <div className="pointer-events-none absolute" style={{ left: '-20%', width: '140%', top: '74%', height: 1, transform: 'rotate(4deg)', background: `linear-gradient(90deg, transparent, ${tier.color}22, transparent)` }} />
      {/* watermark */}
      <div className="pointer-events-none absolute select-none" style={{ width: 360, height: 360, ...(flip ? { left: -70 } : { right: -70 }), top: '50%', transform: 'translateY(-50%)', color: tier.color, opacity: 0.05 }}>
        <SigilArt id={tier.sigil} />
      </div>

      <div className={`relative flex flex-col sm:flex-row items-center gap-8 sm:gap-12 px-6 sm:px-14 py-12 ${flip ? 'sm:flex-row-reverse' : ''}`}>
        <GrandSigil tier={tier} size={210} locked={locked} bright={current} />

        <div className={`flex-1 min-w-0 w-full flex flex-col items-center gap-3.5 text-center ${flip ? 'sm:items-end sm:text-right' : 'sm:items-start sm:text-left'}`}>
          <p className="text-[11px] tracking-[0.42em] uppercase wrap-break-word max-w-full" style={{ fontFamily: FONT_SERIF, color: `${tier.color}${locked ? '88' : 'CC'}` }}>
            {tier.name} • {tier.group}
          </p>

          <div className={`flex items-center gap-3 max-w-full ${flip ? 'sm:flex-row-reverse' : ''}`}>
            <Ornament color={`${tier.color}66`} width={46} />
            <h3 className="font-semibold tracking-[0.12em] leading-tight wrap-break-word" style={{ fontFamily: FONT_SERIF, fontSize: 'clamp(28px, 3.4vw, 46px)', color: locked ? '#8A8F98' : '#F4F1E8', textShadow: locked ? 'none' : `0 0 28px ${tier.color}66` }}>
              {tier.title}
            </h3>
            <Ornament color={`${tier.color}66`} width={46} />
          </div>

          <div className={`flex flex-col gap-0.5 ${flip ? 'sm:items-end' : 'sm:items-start'}`}>
            <p className="text-[12px] tracking-[0.35em] uppercase" style={{ fontFamily: FONT_SERIF, color: 'rgba(255,255,255,0.5)' }}>Campus 6.0</p>
            <p className="text-[15px] tracking-[0.3em] uppercase" style={{ fontFamily: FONT_SERIF, color: 'rgba(255,255,255,0.75)' }}>Mysteries</p>
          </div>

          <p className="text-[11px] tracking-[0.28em] flex items-center gap-2 flex-wrap justify-center" style={{ fontFamily: FONT_MONO, color: locked ? '#5B616B' : 'rgba(255,255,255,0.6)' }}>
            {locked && <Lock className="w-3 h-3" />}
            {state === 'attained' && <CheckCircle2 className="w-3 h-3" style={{ color: tier.color }} />}
            {tier.divisions > 1 ? `DIV ${DIV_ROMAN[0]}–${DIV_ROMAN[tier.divisions - 1]}` : 'SINGLE DIVISION'} • {fmt(TIER_START[tier.id - 1])}–{fmt(TIER_START[tier.id - 1] + tier.divisions * XP_PER_DIV)} XP
          </p>

          {/* divisions + rewards */}
          <div className={`flex items-center gap-4 flex-wrap justify-center ${flip ? 'sm:justify-end' : 'sm:justify-start'}`}>
            {tier.divisions > 1 && <DivDiamonds filled={divFilled} total={tier.divisions} color={tier.color} />}
            <div className="flex flex-wrap gap-2 justify-center">
              {tier.rewards.map((rw) => (
                <span key={rw} className="flex items-center gap-1.5 text-[10px] tracking-[0.14em] uppercase px-2.5 py-1" style={{ fontFamily: FONT_SERIF, color: locked ? '#4B5563' : '#CBD5E1', background: locked ? 'transparent' : `${tier.color}0d`, boxShadow: `inset 0 0 0 1px ${locked ? 'rgba(255,255,255,0.05)' : `${tier.color}33`}` }}>
                  <span style={{ width: 5, height: 5, transform: 'rotate(45deg)', background: locked ? '#4B5563' : tier.color }} />
                  {rw}
                </span>
              ))}
            </div>
          </div>

          {current && (
            <span className="mt-1 px-3.5 py-1.5 rounded-full border text-[9px] tracking-[0.35em] uppercase" style={{ fontFamily: FONT_SERIF, color: tier.color, borderColor: `${tier.color}55`, background: `${tier.color}12`, animation: 'mxPulse 2.4s ease-in-out infinite' }}>
              Current Path • বর্তমান ধাপ
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   PROMOTION CINEMATIC
   ═══════════════════════════════════════════════════════════════════ */
const PromoOverlay: React.FC<{ tier: Tier; label: string }> = ({ tier, label }) => (
  <div className="fixed inset-0 z-100 flex items-center justify-center" style={{ background: 'radial-gradient(circle, rgba(8,10,14,0.94) 0%, rgba(6,8,11,0.99) 100%)', animation: 'mxFade .35s ease-out' }}>
    <div className="flex flex-col items-center gap-5 px-6 text-center" style={{ animation: 'mxBurst .7s cubic-bezier(0.16,1,0.3,1)' }}>
      <GrandSigil tier={tier} size={270} bright lp={100} />
      <p className="text-[11px] tracking-[0.5em] uppercase" style={{ fontFamily: FONT_SERIF, color: `${tier.color}CC` }}>Promoted • পদোন্নতি</p>
      <h2 className="font-semibold tracking-[0.14em] wrap-break-word" style={{ fontFamily: FONT_SERIF, fontSize: 'clamp(36px, 6vw, 54px)', color: '#F4F1E8', textShadow: `0 0 44px ${tier.color}88` }}>{tier.title}</h2>
      <Ornament color={`${tier.color}88`} width={110} />
      <p className="text-[12px] tracking-[0.4em]" style={{ fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.6)' }}>{label}</p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   MAIN VIEW
   ═══════════════════════════════════════════════════════════════════ */
interface RankGuideViewProps { onNavigate: (page: PageId) => void; }

const RankGuideView: React.FC<RankGuideViewProps> = ({ onNavigate }) => {
  const base = useMemo(() => {
    try {
      const p = getLocalUserProfile() as RankProfile;
      return { xp: Number(p.xp ?? p.total_xp ?? p.rank_score ?? 0), hours: Number(p.total_study_time ?? p.studyHours ?? 0), streak: Number(p.current_streak ?? p.streak ?? 0), isDemo: !p.uid || p.isDemo === true };
    } catch {
      return { xp: 0, hours: 0, streak: 0, isDemo: true };
    }
  }, []);

  const [previewTier, setPreviewTier] = useState<number | null>(null);
  const [autoShow, setAutoShow] = useState(false);
  const [fx, setFx] = useState<{ tier: Tier; label: string } | null>(null);
  const prevRef = useRef<number | null>(null);
  const isDemo = base.isDemo;

  const xp = useMemo(() => (isDemo && previewTier !== null ? TIER_START[previewTier] + Math.floor(XP_PER_DIV * 0.6) : base.xp), [isDemo, previewTier, base.xp]);
  const prog = useMemo(() => getProgress(xp), [xp]);
  const cur = TIERS[prog.tierIdx];
  const curLabel = `${cur.name}${cur.divisions > 1 ? ` ${DIV_ROMAN[prog.divIdx]}` : ''}`;

  const stars = useMemo(() => Array.from({ length: 70 }, () => ({ x: Math.random() * 100, y: Math.random() * 100, d: Math.random() * 5, dur: 2.5 + Math.random() * 3, s: 1 + Math.random() * 2 })), []);

  useEffect(() => {
    if (!isDemo || !autoShow) return;
    const id = setInterval(() => setPreviewTier((p) => ((p ?? TIERS.length - 1) + 1) % TIERS.length), 3000);
    return () => clearInterval(id);
  }, [isDemo, autoShow]);

  useEffect(() => {
    if (isDemo && prevRef.current !== null && prevRef.current !== prog.tierIdx) {
      const t = TIERS[prog.tierIdx];
      setFx({ tier: t, label: `${t.name}${t.divisions > 1 ? ` ${DIV_ROMAN[prog.divIdx]}` : ''}` });
      const to = setTimeout(() => setFx(null), 2300);
      prevRef.current = prog.tierIdx;
      return () => clearTimeout(to);
    }
    prevRef.current = prog.tierIdx;
  }, [prog.tierIdx, prog.divIdx, isDemo]);

  const quests = useMemo(() => [
    { sigil: 10, name: 'Complete 4 focus sessions', bn: '৪টা ফোকাস সেশন শেষ করো', reward: '+40 LP', done: isDemo ? 3 : 1, total: 4 },
    { sigil: 1, name: 'Keep your streak alive', bn: 'স্ট্রিক ধরে রাখো', reward: '+15 LP', done: isDemo ? 1 : 0, total: 1 },
    { sigil: 9, name: 'Score 80%+ on a checklist', bn: 'চেকলিস্টে ৮০%+ স্কোর করো', reward: '+25 LP', done: isDemo ? 1 : 0, total: 1 },
  ], [isDemo]);

  return (
    <div className="relative w-full max-w-full overflow-x-hidden px-4 sm:px-8 pb-24 min-h-screen text-white" style={{ background: 'linear-gradient(180deg, #0B0E13 0%, #090C11 40%, #0A0C10 100%)' }}>
      <style>{GLOBAL_STYLES}</style>

      {/* starfield + fog */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {stars.map((s, i) => (
          <div key={i} className="absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animation: `mxTwinkle ${s.dur}s ease-in-out ${s.d}s infinite`, opacity: 0.5 }} />
        ))}
      </div>
      <div className="pointer-events-none fixed inset-0 z-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.045) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.72) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* ═══ HEADER ═══ */}
        <header className="flex items-center justify-between pt-6 pb-2">
          <button onClick={() => onNavigate('dashboard')} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/30 transition-all group" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div className="flex items-center gap-3">
            <CampusCrest size={30} />
            <span className="hidden sm:block text-[10px] tracking-[0.4em] uppercase" style={{ fontFamily: FONT_SERIF, color: 'rgba(255,255,255,0.5)' }}>Season 6</span>
            {isDemo && (
              <button
                onClick={() => setAutoShow((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] tracking-[0.3em] uppercase transition-all hover:scale-105"
                style={{ fontFamily: FONT_SERIF, color: autoShow ? '#0A0C10' : 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.25)', background: autoShow ? 'linear-gradient(135deg,#F4F1E8,#C9C2B2)' : 'transparent' }}
              >
                {autoShow ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {autoShow ? 'Pause' : 'Showcase'}
              </button>
            )}
          </div>
        </header>

        {/* ═══ HERO — CURRENT PATH ═══ */}
        <div className="flex flex-col items-center gap-4 pt-10 pb-6" style={{ animation: 'mxRise .9s ease-out both' }}>
          <p className="text-[10px] tracking-[0.5em] uppercase text-center" style={{ fontFamily: FONT_SERIF, color: 'rgba(255,255,255,0.4)' }}>
            {isDemo ? 'Demo • All Paths Unveiled' : 'Your Current Path'}
          </p>
          <GrandSigil tier={cur} size={250} bright lp={prog.lp} />
          <p className="text-[11px] tracking-[0.42em] uppercase" style={{ fontFamily: FONT_SERIF, color: `${cur.color}CC` }}>{cur.name} • {cur.group}</p>
          <h1 className="font-semibold tracking-[0.14em] leading-tight wrap-break-word max-w-full text-center" style={{ fontFamily: FONT_SERIF, fontSize: 'clamp(34px, 5.4vw, 58px)', color: '#F4F1E8', textShadow: `0 0 44px ${cur.color}77` }}>
            {cur.title}
          </h1>
          <Ornament color={`${cur.color}88`} width={130} />
          <p className="text-[12px] tracking-[0.4em]" style={{ fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.6)' }}>
            {curLabel} • {prog.lp}/100 LP
          </p>
          {cur.divisions > 1 && <DivDiamonds filled={prog.divIdx + 1} total={cur.divisions} color={cur.color} size={12} />}
          <p className="text-sm italic max-w-md text-center" style={{ fontFamily: FONT_SERIF, color: 'rgba(255,255,255,0.5)' }}>“{cur.lore}”</p>

          {prog.nextLabel !== 'MAX RANK' && (
            <div className="w-full max-w-md mt-3 flex flex-col items-center gap-2">
              <div className="relative w-full h-0.75" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div className="mx-shimmer relative h-full overflow-hidden" style={{ width: `${prog.lp}%`, background: `linear-gradient(90deg, ${cur.color}66, ${cur.color})`, boxShadow: `0 0 12px ${cur.color}88`, transition: 'width .9s cubic-bezier(0.16,1,0.3,1)' }} />
                <div className="absolute top-1/2" style={{ left: `calc(${prog.lp}% - 4px)`, width: 8, height: 8, transform: 'translateY(-50%) rotate(45deg)', background: cur.color, boxShadow: `0 0 10px ${cur.color}` }} />
              </div>
              <p className="text-[10px] tracking-[0.28em] text-center" style={{ fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.45)' }}>
                ≈ {fmtHours(prog.hoursToNext)} FOCUS → {prog.nextLabel}
              </p>
              <p className="text-[10px] text-center" style={{ fontFamily: FONT_BN, color: 'rgba(255,255,255,0.4)' }}>
                ১ ঘণ্টা ফোকাস = 100 XP • 20 XP = 1 LP • 100 LP = পরের ধাপ
              </p>
            </div>
          )}
        </div>

        {/* ═══ DAILY QUESTS (scroll cards) ═══ */}
        <div className="max-w-3xl mx-auto mb-6 flex flex-col items-center gap-3" style={{ animation: 'mxRise 1s ease-out both' }}>
          <Ornament color="rgba(250,204,21,0.5)" width={100} />
          <p className="text-[11px] tracking-[0.4em] uppercase" style={{ fontFamily: FONT_SERIF, color: 'rgba(250,204,21,0.85)' }}>Daily Ranked Quests • দৈনিক কাজ</p>
          <div className="w-full space-y-2.5 mt-2">
            {quests.map((q) => {
              const done = q.done >= q.total;
              return (
                <div key={q.name} className="flex items-center gap-4 px-5 py-3.5" style={{ background: done ? 'rgba(34,197,94,0.05)' : 'rgba(18,20,29,0.75)', border: `1px solid ${done ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.06)'}` }}>
                  <div className="w-9 h-9 shrink-0" style={{ color: done ? '#22C55E' : '#FACC15', filter: `drop-shadow(0 0 6px ${done ? '#22C55E' : '#FACC15'}88)` }}>
                    <SigilArt id={q.sigil} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ fontFamily: FONT_SERIF, color: '#E2E8F0', letterSpacing: '0.06em' }}>{q.name}</p>
                    <p className="text-[11px]" style={{ fontFamily: FONT_BN, color: 'rgba(255,255,255,0.4)' }}>{q.bn}</p>
                  </div>
                  <div className="hidden sm:block w-24 h-1 rounded-full overflow-hidden bg-white/5">
                    <div className="h-full" style={{ width: `${(q.done / q.total) * 100}%`, background: done ? '#22C55E' : '#FACC15', boxShadow: `0 0 8px ${done ? '#22C55E' : '#FACC15'}` }} />
                  </div>
                  <span className="text-[11px] font-bold shrink-0" style={{ fontFamily: FONT_MONO, color: done ? '#22C55E' : '#FACC15' }}>{q.reward}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ GROUPS + TIER PANELS ═══ */}
        {GROUPS.map((g) => {
          const gTiers = TIERS.filter((t) => t.group === g.name);
          const ordered = [...gTiers].reverse();
          return (
            <div key={g.name}>
              <GroupHeader group={g} tiers={gTiers} />
              <div className="space-y-7">
                {ordered.map((tier, i) => {
                  const idx = tier.id - 1;
                  const state: 'attained' | 'current' | 'sealed' = idx === prog.tierIdx ? 'current' : isDemo || idx < prog.tierIdx ? 'attained' : 'sealed';
                  const divFilled = state === 'attained' ? tier.divisions : state === 'current' ? prog.divIdx + 1 : 0;
                  return (
                    <TierPanel
                      key={tier.id}
                      tier={tier}
                      state={state}
                      divFilled={divFilled}
                      flip={(tier.id + i) % 2 === 1}
                      clickable={isDemo}
                      onClick={() => isDemo && setPreviewTier(idx)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* ═══ FOOTER ═══ */}
        <div className="flex flex-col items-center gap-4 pt-24 pb-6">
          <Ornament color="rgba(255,255,255,0.25)" width={140} />
          <p className="text-sm italic tracking-[0.15em] text-center" style={{ fontFamily: FONT_SERIF, color: 'rgba(255,255,255,0.45)' }}>Every hour studied is a step beyond the veil.</p>
          <p className="text-[9px] tracking-[0.4em] uppercase text-center" style={{ fontFamily: FONT_MONO, color: 'rgba(255,255,255,0.25)' }}>Campus 6.0 • The Mysteries • Season 6</p>
        </div>
      </div>

      {fx && <PromoOverlay tier={fx.tier} label={fx.label} />}
    </div>
  );
};

export default RankGuideView;