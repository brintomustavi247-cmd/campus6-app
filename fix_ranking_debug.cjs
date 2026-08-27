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
      
      console.log('SUPABASE RAW DATA:', data);
      console.log('SUPABASE ERROR:', error);
      
      if (!error && data) {
        setStaticUsers(data);
      } else if (error) {
        console.error('Supabase fetch error:', error);
      }
    };`;

const oldMap = `    const mapped: EsportsPlayer[] = staticUsers.map(u => {`;

const newMap = `    const mapped: EsportsPlayer[] = staticUsers.map(u => {`;

const mapEndIndex = content.indexOf('setDbPlayers(mapped);');
const replaceMapEnd = `    console.log('MAPPED PLAYERS:', mapped);
    setDbPlayers(mapped);`;

if (content.includes(oldFetch)) {
  content = content.replace(oldFetch, newFetch);
}
if (content.includes('setDbPlayers(mapped);') && !content.includes('console.log(\'MAPPED PLAYERS:\', mapped);')) {
  content = content.replace('setDbPlayers(mapped);', replaceMapEnd);
}

fs.writeFileSync(file, content);
