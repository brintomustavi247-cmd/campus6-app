import { supabase } from './supabaseClient';

// ============================================================================
// FIX: presence key was the CONSTANT 'user-status' for every device.
// Two devices/tabs of the SAME student overwrote each other's tracked state
// (ghost-offline), and debugging collisions were undiagnosable.
// Key is now UNIQUE PER USER (auth uid) — passed from db.ts via the optional
// argument; falls back to a stable per-tab id for anonymous contexts.
// ============================================================================

let tabPresenceKey: string =
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `tab_${crypto.randomUUID()}`
    : `tab_${Date.now()}_${Math.random().toString(36).slice(2)}`;

let onlineUsersChannel: any = null;

export const getPresenceChannel = (userId?: string | null) => {
  if (!onlineUsersChannel) {
    onlineUsersChannel = supabase.channel('online-users', {
      config: { presence: { key: userId || tabPresenceKey } },
    });
    onlineUsersChannel.on('presence', { event: 'sync' }, () => {
      presenceListeners.forEach((fn) => fn(onlineUsersChannel.presenceState()));
    });
    onlineUsersChannel.subscribe();
  }
  return onlineUsersChannel;
};

export const resetPresenceChannel = () => {
  if (onlineUsersChannel) {
    supabase.removeChannel(onlineUsersChannel).catch(() => {});
    onlineUsersChannel = null;
  }
};

type PresenceListener = (state: Record<string, any>) => void;
let presenceListeners: PresenceListener[] = [];

export const subscribeToPresence = (fn: PresenceListener) => {
  getPresenceChannel();
  presenceListeners.push(fn);
  try { fn(onlineUsersChannel.presenceState()); } catch { /* pre-connect */ }
  return () => {
    presenceListeners = presenceListeners.filter((l) => l !== fn);
  };
};

// ============================================================================
// Postgres changes — singleton + debounce PRESERVED (this part was correct).
// ============================================================================
let usersChannel: any = null;
let usersListeners: (() => void)[] = [];
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export const subscribeToUsersChanges = (fn: () => void) => {
  if (!usersChannel) {
    usersChannel = supabase.channel('public:users').on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'users' },
      () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          usersListeners.forEach((l) => l());
        }, 1500);
      },
    ).subscribe();
  }
  usersListeners.push(fn);
  return () => {
    usersListeners = usersListeners.filter((l) => l !== fn);
  };
};