/**
 * CAMPUS 6.0 — Ayah Card Collection (local + cloud sync)
 */
import { supabase } from '../supabaseClient';

export interface CollectedAyah {
  id: number;
  claimedAt: string;
  rarity: 'common' | 'rare' | 'legendary';
}

const KEY = 'campus6_ayah_collection';

export const rarityOf = (id: number): CollectedAyah['rarity'] =>
  id % 10 === 0 ? 'legendary' : id % 5 === 0 ? 'rare' : 'common';

export const getCollection = (): CollectedAyah[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
};

export const isClaimed = (id: number): boolean => getCollection().some((c) => c.id === id);

export const claimAyah = (id: number): CollectedAyah | null => {
  if (isClaimed(id)) return null;
  const item: CollectedAyah = { id, claimedAt: new Date().toISOString(), rarity: rarityOf(id) };
  const list = getCollection();
  list.push(item);
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('campus6:collection-changed'));

  // ⭐ Cloud sync (fire & forget — admin panel-এ দেখাবে)
  try {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id;
      if (!uid) return;
      supabase
        .from('ayah_claims')
        .upsert({ user_id: uid, ayah_id: id, rarity: item.rarity }, { onConflict: 'user_id,ayah_id' })
        .then(({ error }) => {
          if (error) console.warn('[Vault] cloud sync fail:', error.message);
        });
    });
  } catch {}

  return item;
};