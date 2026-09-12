/**
 * ⚡ Live Stats Sync — timer complete হলে Supabase-এ লেখে
 * postgres_changes subscription সব user-এর leaderboard live update করবে
 */
import { supabase } from '../supabaseClient';

let inited = false;

export const upsertStudyStats = async (userId: string, minutesToAdd: number) => {
  try {
    const { data: row } = await supabase.from('users').select('study_minutes').eq('id', userId).single();
    const total = (row?.study_minutes || 0) + minutesToAdd;
    const { error } = await supabase
      .from('users')
      .update({ study_minutes: total, last_active: new Date().toISOString() })
      .eq('id', userId);
    if (error) console.warn('[LiveStats] upsert fail:', error.message);
  } catch (e) {
    console.warn('[LiveStats] exception:', e);
  }
};

export const initLiveStatsSync = () => {
  if (inited) return;
  inited = true;

  window.addEventListener('campus6:timer-completed', async (e: any) => {
    const s = e?.detail;
    if (!s?.durationMinutes) return;
    try {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;
      await upsertStudyStats(uid, s.durationMinutes);
      console.log('[LiveStats] ⚡ synced minutes:', s.durationMinutes);
    } catch {}
  });

  console.log('[LiveStats] ✅ listener ready');
};