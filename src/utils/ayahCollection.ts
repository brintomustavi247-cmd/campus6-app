/** CAMPUS 6.0 - Ayah collection with per-user local storage and cloud hydration. */
import { supabase } from '../supabaseClient';
import { getLocalUserProfile } from './storageEngine';

export interface CollectedAyah {
  id: number;
  claimedAt: string;
  rarity: 'common' | 'rare' | 'legendary';
}

const keyFor = () => `campus6_ayah_collection_${getLocalUserProfile()?.uid || 'guest'}`;

const read = (): CollectedAyah[] => {
  try { return JSON.parse(localStorage.getItem(keyFor()) || '[]'); } catch { return []; }
};

const save = (list: CollectedAyah[]) => localStorage.setItem(keyFor(), JSON.stringify(list));

export const rarityOf = (id: number): CollectedAyah['rarity'] =>
  id % 10 === 0 ? 'legendary' : id % 5 === 0 ? 'rare' : 'common';

export const getCollection = (): CollectedAyah[] => read();

export const isClaimed = (id: number): boolean => read().some((c) => c.id === id);

export const claimAyah = (id: number): CollectedAyah | null => {
  if (isClaimed(id)) return null;
  const item: CollectedAyah = { id, claimedAt: new Date().toISOString(), rarity: rarityOf(id) };
  const list = read();
  list.push(item);
  save(list);
  window.dispatchEvent(new CustomEvent('campus6:collection-changed'));

  // ⭐ Cloud sync (fire & forget — admin panel-এ দেখাবে)
  try {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id;
      if (!uid) return;
      supabase
        .from('ayah_claims')
        .upsert({ user_id: uid, ayah_id: id, rarity: item.rarity }, { onConflict: 'user_id,ayah_id' })
        .then(() => {});
    });
  } catch {}

  return item;
};

export const hydrateCollectionFromCloud = async (): Promise<void> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    const uid = user.user?.id;
    if (!uid) return;

    const { data } = await supabase
      .from('ayah_claims')
      .select('ayah_id, rarity, claimed_at')
      .eq('user_id', uid);
    if (!data?.length) return;

    const list = read();
    const have = new Set(list.map((item) => item.id));
    let added = false;
    (data as Array<{ ayah_id: number; rarity: CollectedAyah['rarity']; claimed_at: string }>).forEach((row) => {
      if (have.has(row.ayah_id)) return;
      list.push({ id: row.ayah_id, claimedAt: row.claimed_at, rarity: row.rarity });
      added = true;
    });

    if (added) {
      save(list);
      window.dispatchEvent(new CustomEvent('campus6:collection-changed'));
    }
  } catch {
    // Cloud hydration is best effort; local collection remains available offline.
  }
};