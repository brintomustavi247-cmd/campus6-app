const fs = require('fs');

let code = fs.readFileSync('src/components/squad/EsportsRanking.tsx', 'utf8');

// Update imports
code = code.replace(
  "import { Trophy, ChevronUp, ChevronDown, Minus, Filter, MapPin, X } from 'lucide-react';",
  "import { Trophy, ChevronUp, ChevronDown, Minus, Filter, MapPin, X, Crown } from 'lucide-react';"
);

// We need to replace everything from `const top3 = sortedPlayers.slice(0, 3);` 
// up to `          )}        </div>      </div>`

const replaceRegex = /const top3 = sortedPlayers\.slice[\s\S]*?\{\/\* OVERLAY & SIDEBAR \*\//;

const replacementCode = `
  const displaySlots = Array.from({ length: Math.max(10, sortedPlayers.length) }).map((_, i) => sortedPlayers[i] || null);

  const getRankStyles = (rank) => {
    switch (rank) {
      case 1:
        return {
          cardBg: 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/40 hover:border-yellow-500/60',
          rankColor: 'text-yellow-500',
          avatarBorder: 'border-yellow-500',
          avatarGlow: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]'
        };
      case 2:
        return {
          cardBg: 'bg-gradient-to-r from-cyan-500/10 to-transparent border-cyan-500/40 hover:border-cyan-500/60',
          rankColor: 'text-cyan-500',
          avatarBorder: 'border-cyan-500',
          avatarGlow: 'shadow-[0_0_15px_rgba(6,182,212,0.5)]'
        };
      case 3:
        return {
          cardBg: 'bg-gradient-to-r from-red-500/10 to-transparent border-red-500/40 hover:border-red-500/60',
          rankColor: 'text-red-500',
          avatarBorder: 'border-red-500',
          avatarGlow: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]'
        };
      default:
        return {
          cardBg: 'bg-[#1E2030]/80 border-white/5 hover:border-cyan-500/30',
          rankColor: 'text-slate-400',
          avatarBorder: 'border-slate-700',
          avatarGlow: ''
        };
    }
  };

  return (
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

        {/* FILTERS */}
        {showFilter && (
          <div className="flex gap-2 mb-2 animate-in slide-in-from-top-2">
            <select 
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="flex-1 bg-[#161822] border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#06B6D4]"
            >
              <option value="All">All Divisions</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Rajshahi">Rajshahi</option>
              <option value="Chittagong">Chittagong</option>
              <option value="Khulna">Khulna</option>
              <option value="Sylhet">Sylhet</option>
              <option value="Barisal">Barisal</option>
              <option value="Rangpur">Rangpur</option>
              <option value="Mymensingh">Mymensingh</option>
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
          {displaySlots.map((player, index) => {
            if (!player) {
              return (
                <div key={\`empty-\${index}\`} className="w-full bg-[#1E2030]/40 border border-dashed border-white/10 rounded-2xl p-4 flex items-center justify-center opacity-50 min-h-[88px]">
                  <p className="text-xs text-slate-400 font-orbitron tracking-widest uppercase">Unclaimed Spot — Grind to Claim</p>
                </div>
              );
            }

            const styles = getRankStyles(player.displayRank);

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
          })}
        </div>
      </div>

      {/* OVERLAY & SIDEBAR */`;

code = code.replace(replaceRegex, replacementCode);

fs.writeFileSync('src/components/squad/EsportsRanking.tsx', code);
