/**
 * CAMPUS 6.0 — Class Link Realtime Hook (v2 — crash-fixed)
 *
 * FIX: আগে সব instance একই channel name ব্যবহার করত →
 * ২য় component subscribe-এর পরে .on() চালাতে গিয়ে throw করত → black screen।
 * এখন: unique channel name per instance + try/catch + polling fallback।
 */
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export interface ClassLink {
  id: string;
  date_key: string;
  session_index: number;
  platform: string;
  url: string;
  title?: string;
  time?: string;
  ends_in?: string;
  link_type?: string;
  created_at?: string;
}

export function useClassLinks(dateKey: string) {
  const [links, setLinks] = useState<ClassLink[]>([]);

  useEffect(() => {
    if (!dateKey) return;
    let alive = true;

    const load = async () => {
      try {
        const { data } = await supabase
          .from('class_links')
          .select('*')
          .eq('date_key', dateKey);
        if (alive) setLinks(data || []);
      } catch (err) {
        console.warn('[ClassLinks] fetch failed:', err);
      }
    };

    load();

    // ⭐ UNIQUE channel name — একই নাম হলে crash করে
    const channelName = `class-links-${dateKey}-${Math.random().toString(36).slice(2, 8)}`;
    let channel: any = null;

    try {
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'class_links' },
          () => load()
        )
        .subscribe();
    } catch (err) {
      // Realtime fail হলেও app crash করবে না
      console.warn('[ClassLinks] realtime subscribe failed → polling mode:', err);
      channel = null;
    }

    // ⭐ Polling fallback — realtime না চললেও ৬ সেকেন্ড পরপর update
    const poll = window.setInterval(load, 60_000);

    return () => {
      alive = false;
      window.clearInterval(poll);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          /* noop */
        }
      }
    };
  }, [dateKey]);

  /** session অনুযায়ী class link খোঁজে */
  const getLink = (sessionIndex: number): ClassLink | undefined =>
    links.find(
      (l) => l.session_index === sessionIndex && (l.link_type === 'class' || !l.link_type)
    );

  return { links, getLink };
}