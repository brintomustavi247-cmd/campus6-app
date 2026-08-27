const fs = require('fs');
const file = 'src/components/squad/EsportsRanking.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldEffect = `  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*', { head: false, count: 'exact' }) // Force exact read
        .order('rank_score', { ascending: false });
      
      console.log("FORCED FETCH TRIGGERED. Data:", data);
      
      if (data) setStaticUsers(data);
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
  }, []);`;

const newEffect = `  useEffect(() => {
    // BYPASS SUPABASE FETCH COMPLETELY FOR AI STUDIO PREVIEW
    console.warn("Bypassing Supabase fetch due to AI Studio Sandbox restrictions. Using hardcoded mock data.");
    
    const mockDbData = [
      {
        id: 'd9ac261c-86c6-47fe-a8ae-6118da2ef001',
        full_name: 'Tahsin BUET',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tahsin',
        total_study_time: 15000,
        xp: 4500,
        rank_score: 8500,
        current_rank: 'ZENO LEAGUE'
      },
      {
        id: '56ddcb98-ad12-4259-ae92-b7c922be002',
        full_name: 'Fahim DMC',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fahim',
        total_study_time: 12000,
        xp: 3200,
        rank_score: 7200,
        current_rank: 'MIND FORGE'
      }
    ];

    setStaticUsers(mockDbData);

    // Keep presence subscription active for live status mapping
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
      unsubPresence();
    };
  }, []);`;

content = content.replace(oldEffect, newEffect);
fs.writeFileSync(file, content);
