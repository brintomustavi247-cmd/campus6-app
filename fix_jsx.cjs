const fs = require('fs');
const file = 'src/components/squad/EsportsRanking.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldDisplaySlots = `  const displaySlots = Array.from({ length: Math.max(10, sortedPlayers.length) }).map((_, i) => sortedPlayers[i] || null);`;
const newDisplaySlots = `  // Removed displaySlots variable in favor of direct mapping in JSX`;
content = content.replace(oldDisplaySlots, newDisplaySlots);

const oldJSXLoop = `{displaySlots.map((player, index) => {
            if (!player) {
              return (
                <div key={\`empty-\${index}\`} className="w-full bg-[#1E2030]/40 border border-dashed border-white/10 rounded-2xl p-4 flex items-center justify-center opacity-50 min-h-[88px]">
                  <p className="text-xs text-slate-400 font-orbitron tracking-widest uppercase">Unclaimed Spot — Grind to Claim</p>
                </div>
              );
            }`;

const newJSXLoop = `{Array.from({ length: Math.max(10, sortedPlayers.length) }).map((_, index) => {
            const player = sortedPlayers[index];
            if (!player) {
              return (
                <div key={\`empty-\${index}\`} className="w-full bg-[#1E2030]/40 border border-dashed border-white/10 rounded-2xl p-4 flex items-center justify-center opacity-50 min-h-[88px]">
                  <p className="text-xs text-slate-400 font-orbitron tracking-widest uppercase">Unclaimed Spot — Grind to Claim</p>
                </div>
              );
            }`;

content = content.replace(oldJSXLoop, newJSXLoop);
fs.writeFileSync(file, content);
