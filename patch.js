const fs = require('fs');
let content = fs.readFileSync('src/views/FriendsView.tsx', 'utf8');

// 1. Add import
content = content.replace(
  "import { \n  Copy, Plus",
  "import { GlobalPodiumLeague } from '../components/squad/GlobalPodiumLeague';\nimport { \n  Copy, Plus"
);

// 2. Remove MOCK_GLOBAL_LEADERBOARD array from FriendsView
content = content.replace(/\/\/ --- MOCK DATA ---[\s\S]*?];/m, '');

// 3. Replace the global tab block
const globalTabStart = "{/* --- GLOBAL RANK TAB --- */}\n      {activeTab === 'global' && (";
const globalTabEndRegex = /<div className="space-y-4 animate-in slide-in-from-right-4 duration-300">[\s\S]*?<\/div>\n        <\/div>\n      \)}/;

const newGlobalTabBlock = `<div className="w-full max-w-4xl mx-auto">
          <GlobalPodiumLeague />
        </div>
      )}`;

content = content.replace(globalTabEndRegex, newGlobalTabBlock);

fs.writeFileSync('src/views/FriendsView.tsx', content);
