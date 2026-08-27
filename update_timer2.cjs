const fs = require('fs');
const file = 'src/contexts/TimerContext.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/channel\.track\(\{ status: 'focus', topic, start_time: Date\.now\(\) \}\)/g, "channel.track({ userId: auth.currentUser?.uid, status: 'focus', topic, start_time: Date.now() })");

fs.writeFileSync(file, content);
