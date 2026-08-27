const fs = require('fs');
const file = 'src/contexts/TimerContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const importStatement = "import { getPresenceChannel } from '../supabaseChannels';\n";
if (!content.includes('supabaseChannels')) {
  content = content.replace("import { auth } from '../firebase';", "import { auth } from '../firebase';\n" + importStatement);
}

const oldEffect = `
  // Initialize Supabase Channel
  useEffect(() => {
    const presenceChannel = supabase.channel('online-users', {
      config: {
        presence: {
          key: 'user-status',
        },
      },
    });

    presenceChannel.subscribe();
    setChannel(presenceChannel);

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, []);
`;

const newEffect = `
  // Initialize Supabase Channel
  useEffect(() => {
    const presenceChannel = getPresenceChannel();
    setChannel(presenceChannel);
  }, []);
`;

content = content.replace(oldEffect.trim(), newEffect.trim());
fs.writeFileSync(file, content);
