const fs = require('fs');
const file = 'src/services/db.ts';
let content = fs.readFileSync(file, 'utf8');

const importStatement = "import { getPresenceChannel, subscribeToPresence, subscribeToUsersChanges } from '../supabaseChannels';\n";
if (!content.includes('supabaseChannels')) {
  content = content.replace("import { supabase } from '../supabaseClient';", "import { supabase } from '../supabaseClient';\n" + importStatement);
}

const oldLeaderboard = `
  // 1. Fetch static users initially and listen to updates
  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (!error && data) {
      users = data;
      combineData();
    }
  };

  fetchUsers();

  const usersSubscription = supabase
    .channel('public:users')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
      fetchUsers(); // Re-fetch on any change
    })
    .subscribe();

  // 2. Listen to presence updates
  const presenceChannel = supabase.channel('online-users');

  presenceChannel.on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState();
    const newPresences: Record<string, any> = {};
    for (const key in state) {
      if (state[key] && state[key].length > 0) {
        const presence = state[key][0] as any;
        if (presence.userId) {
          newPresences[presence.userId] = presence;
        }
      }
    }
    presences = newPresences;
    combineData();
  });

  presenceChannel.subscribe();

  return () => {
    supabase.removeChannel(usersSubscription);
    supabase.removeChannel(presenceChannel);
  };
`;

const newLeaderboard = `
  // 1. Fetch static users initially and listen to updates
  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (!error && data) {
      users = data;
      combineData();
    }
  };

  fetchUsers();

  const unsubUsers = subscribeToUsersChanges(() => {
    fetchUsers();
  });

  // 2. Listen to presence updates
  const unsubPresence = subscribeToPresence((state: any) => {
    const newPresences: Record<string, any> = {};
    for (const key in state) {
      if (state[key] && state[key].length > 0) {
        const presence = state[key][0] as any;
        if (presence.userId) {
          newPresences[presence.userId] = presence;
        }
      }
    }
    presences = newPresences;
    combineData();
  });

  return () => {
    unsubUsers();
    unsubPresence();
  };
`;

content = content.replace(oldLeaderboard.trim(), newLeaderboard.trim());
fs.writeFileSync(file, content);
