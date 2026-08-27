const fs = require('fs');
const file = 'src/components/squad/EsportsRanking.tsx';
let content = fs.readFileSync(file, 'utf8');

const newImports = `import { supabase } from '../../supabaseClient';
import { subscribeToPresence, subscribeToUsersChanges } from '../../supabaseChannels';`;

content = content.replace("import { subscribeToLeaderboard } from '../../services/db';", newImports);

const oldUseEffect = `  useEffect(() => {
    const unsub = subscribeToLeaderboard((players) => {
      setDbPlayers(players);
    });
    return () => unsub();
  }, []);`;

const newUseEffect = `  const [presences, setPresences] = useState<Record<string, any>>({});
  const [staticUsers, setStaticUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('rank_score', { ascending: false });
      
      if (!error && data) {
        setStaticUsers(data);
      } else if (error) {
        console.error('Supabase fetch error:', error);
      }
    };

    fetchUsers();

    const unsubUsers = subscribeToUsersChanges(() => {
      fetchUsers();
    });

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
      setPresences(newPresences);
    });

    return () => {
      unsubUsers();
      unsubPresence();
    };
  }, []);

  useEffect(() => {
    const mapped: EsportsPlayer[] = staticUsers.map(u => {
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
    });
    setDbPlayers(mapped);
  }, [staticUsers, presences]);`;

content = content.replace(oldUseEffect, newUseEffect);
fs.writeFileSync(file, content);
