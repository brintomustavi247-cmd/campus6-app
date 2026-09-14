import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

webpush.setVapidDetails(
  'mailto:admin@campus6.app',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
);

// ⏰ BDT reminder times — routine অনুযায়ী বদলান
const REMINDERS = [
  { hour: 20, minute: 50, title: '🔔 ক্লাস শুরু হতে ১০ মিনিট!', body: 'আজকের ক্লাস 9PM — এখনই join করো।' },
  { hour: 8, minute: 0, title: '🌅 আজকের প্ল্যান ready', body: 'Daily Plan দেখো এবং দিন শুরু করো।' },
];

function bdtNow() {
  const now = new Date();
  return new Date(now.getTime() + (6 * 60 + now.getTimezoneOffset()) * 60000);
}

serve(async (req) => {
  const force = new URL(req.url).searchParams.get('force') === '1';
  const now = bdtNow();
  const due = force
    ? [{ hour: now.getHours(), minute: now.getMinutes(), title: '✅ Test Notification', body: 'Push is working! App বন্ধ থাকলেও আসবে।' }]
    : REMINDERS.filter((r) => r.hour === now.getHours() && Math.abs(r.minute - now.getMinutes()) <= 4);

  if (due.length === 0) return new Response(JSON.stringify({ sent: 0 }));

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: subs } = await supabase.from('push_subscriptions').select('*');
  let sent = 0;
  for (const s of subs ?? []) {
    for (const r of due) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title: r.title, body: r.body, url: '/' }),
        );
        sent++;
      } catch { /* dead subscription */ }
    }
  }
  return new Response(JSON.stringify({ sent }));
});
