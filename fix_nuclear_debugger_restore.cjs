const fs = require('fs');
const file = 'src/components/squad/EsportsRanking.tsx';
let content = fs.readFileSync(file, 'utf8');

const returnMatch = content.match(/  return \(\s*<div className="p-8 text-white bg-\[#0F111A\] min-h-screen w-full flex flex-col gap-6 overflow-y-auto pb-20">/);
if (returnMatch) {
  const startIndex = returnMatch.index;
  const newReturn = `  return (
    <div className="relative h-full flex flex-col bg-[#0F111A] overflow-hidden">
      {/* HEADER */}
      <div className="shrink-0 p-4 pb-2 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2 font-orbitron tracking-wider">
            <Trophy className="w-5 h-5 text-gold" />
            RANKING
          </h2>
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={\`p-1.5 rounded-lg border transition-colors \${showFilter ? 'bg-[#06B6D4]/20 border-[#06B6D4]/50 text-[#06B6D4]' : 'bg-[#161822] border-slate-800 text-slate-400 hover:text-white'}\`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* METRIC TOGGLE */}
        <div className="flex bg-[#0A0C10] rounded-lg p-1 border border-slate-800/80 mb-3">
          <button
            onClick={() => setMetric('xp')}
            className={\`flex-1 py-1.5 text-xs font-bold font-orbitron rounded-md transition-all \${metric === 'xp' ? 'bg-[#1E2030] text-[#FACC15] shadow-sm' : 'text-slate-500 hover:text-slate-300'}\`}
          >
            XP RANKING
          </button>
          <div className="relative flex-1">
            <button
              onClick={() => {
                setMetric('study');
                setShowStudyDropdown(!showStudyDropdown);
              }}
              className={\`w-full h-full py-1.5 text-xs font-bold font-orbitron rounded-md transition-all flex items-center justify-center gap-1 \${metric === 'study' ? 'bg-[#1E2030] text-[#22C55E] shadow-sm' : 'text-slate-500 hover:text-slate-300'}\`}
            >
              STUDY TIME: {studyFilter.toUpperCase()} <ChevronDown className="w-3 h-3" />
            </button>
            
            {showStudyDropdown && metric === 'study' && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1E2030] border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                {['Daily (Per Day)', 'Weekly', 'Monthly', 'All Time'].map((f) => (
                  <div 
                    key={f}
                    onClick={() => {
                      setStudyFilter(f as any);
                      setShowStudyDropdown(false);
                    }}
                    className={\`px-3 py-2 text-xs font-orbitron cursor-pointer transition-colors \${studyFilter === f ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'text-slate-300 hover:bg-white/5'}\`}
                  >
                    {f}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LOCATION FILTERS */}
        {showFilter && (
          <div className="flex gap-2 mb-3 animate-in slide-in-from-top-2">
            <select 
              value={selectedDivision}
              onChange={(e) => {
                setSelectedDivision(e.target.value);
                setSelectedDistrict('All');
              }}
              className="flex-1 bg-[#161822] border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#06B6D4]"
            >
              <option value="All">All Divisions</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Chattogram">Chattogram</option>
            </select>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="flex-1 bg-[#161822] border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#06B6D4]"
            >
              <option value="All">All Districts</option>
              {selectedDivision === 'Dhaka' && (
                <>
                  <option value="Dhaka">Dhaka</option>
                  <option value="Gazipur">Gazipur</option>
                  <option value="Narayanganj">Narayanganj</option>
                </>
              )}
            </select>
          </div>
        )}
      </div>

      {/* LIST VIEW */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-20">
        <div className="flex flex-col gap-3 w-full px-4 py-4">
          {Array.from({ length: Math.max(10, sortedPlayers.length) }).map((_, index) => {
            const player = sortedPlayers[index];
            if (!player) {
              return (
                <div key={\`empty-\${index}\`} className="w-full bg-[#1E2030]/40 border border-dashed border-white/10 rounded-2xl p-4 flex items-center justify-center opacity-50 min-h-[88px]">
                  <p className="text-xs text-slate-400 font-orbitron tracking-widest uppercase">Unclaimed Spot — Grind to Claim</p>
                </div>
              );
            }

            const styles = getRankStyles(player.displayRank);

            let effectiveStudySeconds = (player.studyTime || 0) * 60;
            if (player.isLive && (player as any).sessionStartTime) {
              effectiveStudySeconds += Math.floor((now - (player as any).sessionStartTime) / 1000);
            } else if (player.id === uid && player.isLive && isRunning && presence?.sessionStartTime) {
              effectiveStudySeconds += Math.floor((now - presence.sessionStartTime) / 1000);
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
          })}
        </div>
      </div>

      {/* OVERLAY & SIDEBAR */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] bg-[#0F111A] overflow-y-auto">
          <ProfilePremiumView 
             profile={mapToUserProfile(selectedUser)} 
             todayKey={new Date().toISOString().split('T')[0]} 
             onNavigate={() => setSelectedUser(null)} 
           />
        </div>
      )}
    </div>
  );
};`;
  content = content.substring(0, startIndex) + newReturn;
  fs.writeFileSync(file, content);
  console.log("Restored UI successfully.");
} else {
  console.log("Could not find the return match.");
}
