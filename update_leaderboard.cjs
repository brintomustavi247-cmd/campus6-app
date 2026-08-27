const fs = require('fs');
const file = 'src/components/squad/EsportsRanking.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add TimerContext import
content = content.replace(
  "import { subscribeToLeaderboard } from '../../services/db';",
  "import { subscribeToLeaderboard } from '../../services/db';\nimport { useGlobalTimer } from '../../contexts/TimerContext';"
);

// 2. Add Timer state to EsportsRanking
const timerStateCode = `
  const { isRunning } = useGlobalTimer();
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

content = content.replace(
  "const { presence, uid } = usePresence();",
  "const { presence, uid } = usePresence();\n" + timerStateCode
);

// 3. Fix the rendering logic
const oldRenderCode = `
            return (
              <div 
                key={player.id}
                onClick={() => setSelectedUser(player)}
                className={\`w-full rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer border \${styles.cardBg}\`}
              >
                {/* LEFT SECTION */}
                <div className="flex items-center gap-4 min-w-0">
                  {/* Rank Number */}
                  <div className={\`w-8 text-center flex justify-center shrink-0 font-orbitron font-extrabold text-lg \${styles.rankColor}\`}>
                    {player.displayRank === 1 ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />
                        <span>#1</span>
                      </div>
                    ) : (
                      \`#\${player.displayRank}\`
                    )}
                  </div>

                  {/* Avatar */}
                  <div className={\`w-12 h-12 rounded-full bg-[#0A0C10] border-2 flex items-center justify-center text-white font-black text-lg font-orbitron shrink-0 relative overflow-hidden \${styles.avatarBorder} \${styles.avatarGlow}\`}>
                    {player.avatar?.length > 5 ? (
                      <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      player.avatar || player.name.charAt(0)
                    )}
                  </div>

                  {/* User Details */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-sans font-bold text-white text-base truncate">
                        {player.name}
                      </h4>
                      <RankBadge rank={player.tier} size={16} />
                    </div>
                    <p className="font-sans text-gray-400 text-xs truncate">
                      {player.target || player.title} {player.district && player.district !== 'All' ? \`• \${player.district}\` : ''}
                    </p>
                    {player.isLive && player.currentTask && (
                      <p className="flex items-center gap-1.5 mt-0.5 font-sans text-xs text-[#22C55E]">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
                        </span>
                        Studying: {player.currentTask}
                      </p>
                    )}
                  </div>
                </div>

                {/* RIGHT SECTION */}
                <div className="flex flex-col items-end shrink-0 pl-3">
                  <p className={\`font-orbitron font-bold text-base whitespace-nowrap \${metric === 'xp' ? 'text-yellow-400' : 'text-[#22C55E]'}\`}>
                    {metric === 'xp' ? \`\${player.xp.toLocaleString()} XP\` : \`\${player.studyTime}h 00m\`}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                    {metric === 'xp' ? 'Total XP' : 'Study Time'}
                  </p>
                </div>
              </div>
            );
`;

const newRenderCode = `
            let effectiveStudySeconds = (player.studyTime || 0) * 60;
            if (player.id === uid && player.isLive && isRunning) {
              effectiveStudySeconds += elapsedSeconds;
            }
            const hours = Math.floor(effectiveStudySeconds / 3600);
            const minutes = Math.floor((effectiveStudySeconds % 3600) / 60);
            const formattedStudyTime = \`\${hours}h \${minutes.toString().padStart(2, '0')}m\`;

            return (
              <div 
                key={player.id}
                onClick={() => setSelectedUser(player)}
                className={\`w-full rounded-2xl py-2.5 px-3 min-h-[58px] flex items-center justify-between transition-all cursor-pointer border \${styles.cardBg}\`}
              >
                {/* LEFT SECTION */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank Number */}
                  <div className={\`w-6 text-center flex justify-center shrink-0 font-orbitron font-extrabold text-sm \${styles.rankColor}\`}>
                    {player.displayRank === 1 ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
                        <span>#1</span>
                      </div>
                    ) : (
                      \`#\${player.displayRank}\`
                    )}
                  </div>

                  {/* Avatar */}
                  <div className={\`w-9 h-9 rounded-full bg-[#0A0C10] border-2 flex items-center justify-center text-white font-black text-sm font-orbitron shrink-0 relative overflow-hidden \${styles.avatarBorder} \${styles.avatarGlow}\`}>
                    {player.avatar?.length > 5 ? (
                      <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      player.avatar || player.name.charAt(0)
                    )}
                  </div>

                  {/* User Details */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 leading-tight">
                      <h4 className="font-lexend font-bold text-sm text-white truncate">
                        {player.name}
                      </h4>
                      <RankBadge rank={player.tier} size={14} />
                      <span className="text-[11px] text-gray-400">
                         {player.target || player.title} {player.district && player.district !== 'All' ? \`• \${player.district}\` : ''}
                      </span>
                    </div>
                    {player.isLive && player.currentTask && (
                      <p className="text-[10px] text-emerald-400 flex items-center gap-1 leading-none mt-0.5">
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        Studying: {player.currentTask}
                      </p>
                    )}
                  </div>
                </div>

                {/* RIGHT SECTION */}
                <div className="flex flex-col items-end shrink-0 pl-3">
                  <p className={\`font-orbitron font-bold text-sm whitespace-nowrap \${metric === 'xp' ? 'text-yellow-400' : 'text-[#22C55E]'}\`}>
                    {metric === 'xp' ? \`\${player.xp.toLocaleString()} XP\` : formattedStudyTime}
                  </p>
                  <p className="text-[8px] text-gray-500 uppercase tracking-wider mt-0.5">
                    {metric === 'xp' ? 'TOTAL XP' : 'STUDY TIME'}
                  </p>
                </div>
              </div>
            );
`;

content = content.replace(oldRenderCode.trim(), newRenderCode.trim());

fs.writeFileSync(file, content);
