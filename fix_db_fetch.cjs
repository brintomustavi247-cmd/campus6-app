const fs = require('fs');
const file = 'src/services/db.ts';
let content = fs.readFileSync(file, 'utf8');

const oldFetch = `  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (!error && data) {
      users = data;
      combineData();
    }
  };`;

const newFetch = `  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*').order('rank_score', { ascending: false });
    if (error) {
      console.error('Supabase fetch error (RLS likely blocking):', error);
      return;
    }
    if (data) {
      users = data;
      combineData();
    }
  };`;

content = content.replace(oldFetch, newFetch);
fs.writeFileSync(file, content);
