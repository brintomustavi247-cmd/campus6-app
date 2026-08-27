const fs = require('fs');
const file = 'src/components/squad/EsportsRanking.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldFetch = `    const fetchUsers = async () => {
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

const newFetch = `    const fetchUsers = async () => {
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

const oldMap = `    const mapped: EsportsPlayer[] = staticUsers.map(u => {
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
        studyTime: Math.floor((u.total_study_time || 0) / 60), 
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
    });`;

const newMap = `    const mapped: EsportsPlayer[] = staticUsers.map(u => {
      const p = presences[u.id] || {};
      const isLive = p.status === 'focus';
      
      return {
        ...u,
        level: Math.floor((u.xp || 0) / 1000) + 1,
        nextLevelXp: (Math.floor((u.xp || 0) / 1000) + 2) * 1000,
        rank: u.rank_score || 0,
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
        team: 'None',
        socialLinks: {},
        goals: [],
        recentActivity: [],
        achievements: [],
        currentTask: p.topic || ''
      } as EsportsPlayer;
    });`;

content = content.replace(oldFetch, newFetch);
content = content.replace(oldMap, newMap);
fs.writeFileSync(file, content);
