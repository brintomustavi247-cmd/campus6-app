const fs = require('fs');
const file = 'src/components/squad/EsportsRanking.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldMap = `    const mapped: EsportsPlayer[] = staticUsers.map(u => {
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

const newMap = `    const mapped: EsportsPlayer[] = staticUsers.map(u => {
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

content = content.replace(oldMap, newMap);
fs.writeFileSync(file, content);
