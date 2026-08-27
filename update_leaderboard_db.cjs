const fs = require('fs');
const file = 'src/services/db.ts';
let content = fs.readFileSync(file, 'utf8');

// Ensure supabase import is there
if (!content.includes("import { supabase } from '../supabaseClient';")) {
  content = content.replace("import { EsportsPlayer } from '../components/squad/EsportsData';", "import { EsportsPlayer } from '../components/squad/EsportsData';\nimport { supabase } from '../supabaseClient';");
}

const oldCode = `export const subscribeToLeaderboard = (
  callback: (players: EsportsPlayer[]) => void
) => {
  if (!db) return () => {};

  // Listen to both users and presence
  let users: any[] = [];
  let presences: Record<string, PresenceDocument> = {};

  const combineData = () => {
    const mapped: EsportsPlayer[] = users.map(u => {
      const p = presences[u.uid];
      return {
        id: u.uid,
        name: u.name || 'Unknown',
        username: u.name || 'Unknown',
        avatar: u.avatar || 'U',
        title: u.title || 'MEMBER',
        bio: '',
        motto: '',
        level: u.level || 1,
        xp: u.xp || 0,
        studyTime: u.studyTime || 0,
        nextLevelXp: ((u.level || 1) + 1) * 1000,
        rank: 0, // Calculated on frontend
        tier: u.tier || 'SPARK',
        winRate: u.winRate || '0',
        efficiency: '0%',
        streak: 0,
        bestStreak: 0,
        totalSessions: 0,
        isOnline: p ? p.liveStatus !== 'offline' : false,
        isLive: p ? p.liveStatus === 'focus' : false,
        trend: 'up',
        joinDate: '',
        country: 'Bangladesh',
        division: u.division || 'All',
        district: u.district || 'All',
        target: u.target || 'N/A',
        team: 'None',
        socialLinks: {},
        goals: [],
        recentActivity: [],
        achievements: [],
        currentTask: p ? p.currentTask : '' // Attached for UI
      };
    });
    callback(mapped);
  };

  const unsubUsers = onSnapshot(query(collection(db, 'users')), (snap) => {
    users = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    combineData();
  }, (err) => console.warn('Users leaderboard sync error:', err));

  const unsubPresence = onSnapshot(query(collection(db, 'presence')), (snap) => {
    const pMap: Record<string, PresenceDocument> = {};
    snap.docs.forEach(doc => {
      pMap[doc.id] = doc.data() as PresenceDocument;
    });
    presences = pMap;
    combineData();
  }, (err) => console.warn('Presence leaderboard sync error:', err));

  return () => {
    unsubUsers();
    unsubPresence();
  };
};`;

const newCode = `export const subscribeToLeaderboard = (
  callback: (players: EsportsPlayer[]) => void
) => {
  let users: any[] = [];
  let presences: Record<string, any> = {};

  const combineData = () => {
    const mapped: EsportsPlayer[] = users.map(u => {
      const p = presences[u.id] || {};
      const isLive = p.status === 'focus';
      return {
        id: u.id,
        name: u.full_name || 'Unknown',
        username: u.full_name || 'Unknown',
        avatar: u.avatar_url || 'U',
        title: 'MEMBER',
        bio: '',
        motto: '',
        level: Math.floor((u.xp || 0) / 1000) + 1,
        xp: u.xp || 0,
        studyTime: Math.floor((u.total_study_time || 0) / 60), // Assuming stored in minutes
        nextLevelXp: (Math.floor((u.xp || 0) / 1000) + 2) * 1000,
        rank: u.rank_score || 0,
        tier: u.current_rank || 'SPARK',
        winRate: '0',
        efficiency: '0%',
        streak: 0,
        bestStreak: 0,
        totalSessions: 0,
        isOnline: p.status && p.status !== 'offline',
        isLive: isLive,
        sessionStartTime: p.start_time || null,
        trend: 'up',
        joinDate: '',
        country: 'Bangladesh',
        division: 'All',
        district: 'All',
        target: 'N/A',
        team: 'None',
        socialLinks: {},
        goals: [],
        recentActivity: [],
        achievements: [],
        currentTask: p.topic || ''
      };
    });
    callback(mapped);
  };

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
};`;

content = content.replace(oldCode, newCode);

fs.writeFileSync(file, content);
