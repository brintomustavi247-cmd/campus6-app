const fs = require('fs');
const file = 'src/components/squad/EsportsRanking.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldFetch = `    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('rank_score', { ascending: false });
      
      if (!error && data) {
        const formattedData = data.map(dbUser => ({
          ...dbUser,
          id: dbUser.id,
          name: dbUser.full_name || 'Unknown Player',
          username: dbUser.full_name || 'Unknown Player',
          avatar: dbUser.avatar_url || 'U',
          studyTime: dbUser.total_study_time || 0,
          xp: dbUser.xp || 0,
          tier: dbUser.current_rank || 'SPARK I',
          title: 'MEMBER',
          target: dbUser.current_rank || 'ELITE_SQUAD',
          rank_score: dbUser.rank_score || 0
        }));
        setStaticUsers(formattedData);
      } else if (error) {
        console.error('Supabase fetch error:', error);
      }
    };`;

const newFetch = `    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('rank_score', { ascending: false });
      
      if (!error && data) {
        setStaticUsers(data);
      } else if (error) {
        console.error('Supabase fetch error:', error);
      }
    };`;

const oldMap = `    const mapped: EsportsPlayer[] = staticUsers.map(u => {
      const p = presences[u.id] || {};
      const isLive = p.status === 'focus';
      
      return {
        id: u.id,
        name: u.name || 'Unknown Player',
        username: u.username || 'Unknown Player',
        avatar: u.avatar || 'U',
        title: u.title || 'MEMBER',
        bio: '',
        motto: '',
        level: Math.floor((u.xp || 0) / 1000) + 1,
        xp: u.xp || 0,
        studyTime: Math.floor((u.studyTime || 0) / 60), 
        nextLevelXp: (Math.floor((u.xp || 0) / 1000) + 2) * 1000,
        rank: u.rank_score || 0,
        tier: u.tier || 'SPARK I',
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
        target: u.target || 'N/A',
        team: 'None',
        socialLinks: {},
        goals: [],
        recentActivity: [],
        achievements: [],
        currentTask: p.topic || ''
      };
    });`;

const newMap = `    const mapped: EsportsPlayer[] = staticUsers.map(u => {
      const p = presences[u.id] || {};
      const isLive = p.status === 'focus';
      
      // Directly map from Supabase SQL column names to UI Component props
      return {
        id: u.id,
        name: u.full_name || 'Unknown Player',
        username: u.full_name || 'Unknown Player',
        avatar: u.avatar_url || 'U',
        title: 'MEMBER',
        bio: '',
        motto: '',
        level: Math.floor((u.xp || 0) / 1000) + 1,
        xp: u.xp || 0,
        studyTime: Math.floor((u.total_study_time || 0) / 60), // Keep as minutes for the UI logic
        nextLevelXp: (Math.floor((u.xp || 0) / 1000) + 2) * 1000,
        rank: u.rank_score || 0,
        tier: u.current_rank || 'SPARK I',
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
        target: u.current_rank || 'ELITE_SQUAD',
        team: 'None',
        socialLinks: {},
        goals: [],
        recentActivity: [],
        achievements: [],
        currentTask: p.topic || ''
      };
    });`;

content = content.replace(oldFetch, newFetch);
content = content.replace(oldMap, newMap);
fs.writeFileSync(file, content);
