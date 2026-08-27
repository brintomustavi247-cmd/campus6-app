import fs from 'fs';

let content = fs.readFileSync('src/views/FriendsView.tsx', 'utf8');

// Replace import
content = content.replace(
  "import { GlobalPodiumLeague } from '../components/squad/GlobalPodiumLeague';",
  "import { EsportsRanking } from '../components/squad/EsportsRanking';"
);

// Replace component
content = content.replace(
  "<GlobalPodiumLeague />",
  "<EsportsRanking />"
);

// Make the container layout stretch nicely
content = content.replace(
  '<div className="w-full max-w-4xl mx-auto">',
  '<div className="w-full h-full max-w-4xl mx-auto">'
);

fs.writeFileSync('src/views/FriendsView.tsx', content);
