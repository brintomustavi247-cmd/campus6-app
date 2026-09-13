import React, { useState } from 'react';
import { Link2, ExternalLink, Save } from 'lucide-react';

const PANEL: React.CSSProperties = {
  background: 'rgba(13,16,22,0.7)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
  borderRadius: 16,
};

const MICRO: React.CSSProperties = {
  fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
  color: '#475569', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
};

/* পুরনো saved link যেন হারিয়ে না যায় — সব সম্ভাব্য key check */
const KEYS = ['campus6_ph_link', 'ph_link', 'physicsHunterLink', 'phProfileLink'];
const readLink = () => {
  for (const k of KEYS) {
    const v = localStorage.getItem(k);
    if (v) return v;
  }
  return '';
};
const writeLink = (v: string) => {
  const existing = KEYS.find((k) => localStorage.getItem(k));
  localStorage.setItem(existing || KEYS[0], v);
};

export const PhysicsHunterLinkCard: React.FC = () => {
  const [url, setUrl] = useState(readLink());
  const [saved, setSaved] = useState(readLink());

  const save = () => {
    writeLink(url);
    setSaved(url);
  };

  return (
    <div className="p-5" style={PANEL}>
      <div className="flex items-center gap-2 mb-1">
        <Link2 className="w-3.5 h-3.5" style={{ color: '#F472B6' }} />
        <p style={{ ...MICRO, color: '#94A3B8' }}>Physics Hunter Link</p>
      </div>
      <p className="text-[10px] bn mb-3" style={{ color: '#475569' }}>
        ক্লাস ও পরীক্ষা দ্রুত খুলতে আপনার course link রাখুন
      </p>

      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://phyhunt.com/profile/"
          className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-slate-100 focus:outline-none focus:border-[#FBBF24] transition-colors"
        />
        <button
          onClick={save}
          className="px-3.5 py-2.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1.5 transition-all hover:brightness-110 shrink-0"
          style={{ background: 'rgba(220,20,60,0.15)', border: '1px solid rgba(220,20,60,0.4)', color: '#F87171' }}
        >
          <Save className="w-3.5 h-3.5" /> Save
        </button>
      </div>

      {saved && (
        <button
          onClick={() => window.open(saved, '_blank')}
          className="mt-3 flex items-center gap-1.5 text-[10px] font-bold bn transition-all hover:brightness-125"
          style={{ color: '#F472B6' }}
        >
          <ExternalLink className="w-3 h-3" /> Open Physics Hunter
        </button>
      )}
    </div>
  );
};