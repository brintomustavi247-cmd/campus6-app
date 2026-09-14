import { supabase } from '../supabaseClient';

// 🔑 VAPID keys (npx web-push generate-vapid-keys দিয়ে তৈরি)
// ⚠️ একই key pair Supabase Edge Function secrets-এও সেট করতে হবে:
// supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=...
export const VAPID_PUBLIC_KEY = 'BNWHn0Z_TpDT9A3vac64B8K9Mb92LzmC-jc7BgeNHCOf_kpJIH3H9dWS1Q94TsojHDSLcqb85E2Jnpdu23x4op4';

function b64ToUint8(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export async function enablePush(userId: string): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return false;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: b64ToUint8(VAPID_PUBLIC_KEY),
    });
    const json = sub.toJSON();
    await supabase.from('push_subscriptions').upsert(
      { user_id: userId, endpoint: json.endpoint!, p256dh: json.keys!.p256dh, auth: json.keys!.auth, updated_at: new Date().toISOString() },
      { onConflict: 'endpoint' },
    );
    return true;
  } catch {
    return false;
  }
}