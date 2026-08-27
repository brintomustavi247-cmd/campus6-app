const fs = require('fs');
const file = 'src/components/squad/EsportsRanking.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldEffect = `
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && presence?.sessionStartTime) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - presence.sessionStartTime) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRunning, presence]);
`;

const newEffect = `
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
`;

content = content.replace(oldEffect.trim(), newEffect.trim());

const oldRender = `
            let effectiveStudySeconds = (player.studyTime || 0) * 60;
            if (player.id === uid && player.isLive && isRunning) {
              effectiveStudySeconds += elapsedSeconds;
            }
`;

const newRender = `
            let effectiveStudySeconds = (player.studyTime || 0) * 60;
            if (player.isLive && (player as any).sessionStartTime) {
              effectiveStudySeconds += Math.floor((now - (player as any).sessionStartTime) / 1000);
            } else if (player.id === uid && player.isLive && isRunning && presence?.sessionStartTime) {
              effectiveStudySeconds += Math.floor((now - presence.sessionStartTime) / 1000);
            }
`;

content = content.replace(oldRender.trim(), newRender.trim());

fs.writeFileSync(file, content);
