const fs = require('fs');
const file = 'src/components/squad/EsportsRanking.tsx';
let content = fs.readFileSync(file, 'utf8');

const returnMatch = content.match(/  return \(\s*<div className="relative h-full flex flex-col bg-\[#0F111A\] overflow-hidden">/);
if (returnMatch) {
  const startIndex = returnMatch.index;
  const newReturn = `  return (
    <div className="p-8 text-white bg-[#0F111A] min-h-screen w-full flex flex-col gap-6 overflow-y-auto pb-20">
      <h2 className="text-2xl font-bold text-yellow-400 font-orbitron">LEADERBOARD DEBUGGER</h2>
      
      <div className="border border-red-500/50 p-4 rounded-xl bg-red-500/10">
        <h3 className="text-red-400 font-bold mb-2">1. RAW SUPABASE DATA (Length: {staticUsers?.length || 0})</h3>
        <pre className="text-xs text-gray-300 overflow-auto max-h-[300px]">
          {JSON.stringify(staticUsers, null, 2)}
        </pre>
      </div>

      <div className="border border-green-500/50 p-4 rounded-xl bg-green-500/10">
        <h3 className="text-green-400 font-bold mb-2">2. MAPPED UI DATA (Length: {dbPlayers?.length || 0})</h3>
        <pre className="text-xs text-gray-300 overflow-auto max-h-[300px]">
          {JSON.stringify(dbPlayers, null, 2)}
        </pre>
      </div>
    </div>
  );
};`;
  content = content.substring(0, startIndex) + newReturn;
  fs.writeFileSync(file, content);
  console.log("Replaced successfully.");
} else {
  console.log("Could not find the return match.");
}
