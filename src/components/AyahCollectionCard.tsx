import React, { useEffect, useState } from 'react';
import { BookMarked } from 'lucide-react';
import { AyahCollectionVault } from './AyahCollectionVault';
import { getCollection, CollectedAyah } from '../utils/ayahCollection';
import { DAILY_AYAHS } from '../data/dailyAyah';

const rarityStyle = (r: string) =>
  r === 'legendary'
    ? { border: '1px solid rgba(168,85,247,0.5)', background: 'rgba(168,85,247,0.08)', color: '#C084FC' }
    : r === 'rare'
    ? { border: '1px solid rgba(251,191,36,0.5)', background: 'rgba(251,191,36,0.08)', color: '#FBBF24' }
    : { border: '1px solid rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.06)', color: '#6EE7B7' };

export const AyahCollectionCard: React.FC = () => {
  const [col, setCol] = useState<CollectedAyah[]>(getCollection());
  const [vaultOpen, setVaultOpen] = useState(false);

  useEffect(() => {
    const onChange = () => setCol(getCollection());
    window.addEventListener('campus6:collection-changed', onChange);
    return () => window.removeEventListener('campus6:collection-changed', onChange);
  }, []);

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-text-primary flex items-center gap-2 bn">
          <BookMarked className="w-4 h-4 text-gold" /> আয়াত সংগ্রহ
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24' }}>
            {col.length}/{DAILY_AYAHS.length}
          </span>
          <button
            onClick={() => setVaultOpen(true)}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bn transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg,#FBBF24,#D97706)', color: '#0F111A' }}
          >
            🕌 ভল্ট খুলুন
          </button>
        </div>
      </div>

      {col.length === 0 ? (
        <p className="text-[11px] text-text-muted bn">
          এখনো কোনো আয়াত সংগ্রহ করা হয়নি। Dashboard-এর আজকের আয়াত card-এ "সংগ্রহ করুন" চাপুন!
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {col.map((c) => {
            const ayah = DAILY_AYAHS.find((a) => a.id === c.id);
            if (!ayah) return null;
            return (
              <div key={c.id} className="p-2.5 rounded-xl space-y-1" style={rarityStyle(c.rarity)}>
                <p className="text-[10px] font-bold bn truncate">{ayah.reference}</p>
                <p className="text-[9px] bn opacity-80 truncate">{ayah.bangla}</p>
                <span className="text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                  {c.rarity === 'legendary' ? '👑' : c.rarity === 'rare' ? '⭐' : '🌿'} {c.rarity}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <AyahCollectionVault open={vaultOpen} onClose={() => setVaultOpen(false)} />
    </div>
  );
};