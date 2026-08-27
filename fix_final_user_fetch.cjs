const fs = require('fs');
const file = 'src/components/squad/EsportsRanking.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldFetch = `    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('rank_score', { ascending: false });
      
      console.log('SUPABASE RAW DATA:', data);
      console.log('SUPABASE ERROR:', error);
      
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
      
      if (data) setStaticUsers(data);
    };`;

content = content.replace(oldFetch, newFetch);

const oldMappedLog = `
    console.log('MAPPED PLAYERS:', mapped);
    setDbPlayers(mapped);`;

const newMappedLog = `
    setDbPlayers(mapped);`;

content = content.replace(oldMappedLog, newMappedLog);

fs.writeFileSync(file, content);
