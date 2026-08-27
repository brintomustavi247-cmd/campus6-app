const fs = require('fs');
const file = 'src/components/squad/EsportsRanking.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldFetch = `    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('rank_score', { ascending: false });
      
      if (data) setStaticUsers(data);
    };`;

const newFetch = `    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*', { head: false, count: 'exact' }) // Force exact read
        .order('rank_score', { ascending: false });
      
      console.log("FORCED FETCH TRIGGERED. Data:", data);
      
      if (data) setStaticUsers(data);
    };`;

content = content.replace(oldFetch, newFetch);
fs.writeFileSync(file, content);
