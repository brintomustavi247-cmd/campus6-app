const fs = require('fs');

let code = fs.readFileSync('src/views/ProfilePremiumView.tsx', 'utf8');

code = code.replace(
  `<h3 className="p-rank-title text-2xl sm:text-3xl md:text-4xl font-bold break-words whitespace-normal tracking-tight">⚡ MINDFORGE II</h3>`,
  `<h3 className="p-rank-title text-2xl sm:text-3xl md:text-4xl font-bold break-words whitespace-normal tracking-tight">⚡ {tier}</h3>`
);
code = code.replace(
  `<RankBadge rank="MINDFORGE II" size={80} animated />`,
  `<RankBadge rank={tier} size={80} animated />`
);
code = code.replace(
  `<span>LEVEL 82</span>`,
  `<span>LEVEL {level}</span>`
);
code = code.replace(
  `<span className="text-gold">14,250 / 15,000 RP</span>`,
  `<span className="text-gold">{xp} / {level * 500} RP</span>`
);

code = code.replace(
  `<span className="p-balance-num">14,250</span>`,
  `<span className="p-balance-num">{xp}</span>`
);
code = code.replace(
  `<span className="text-[10px] font-mono text-gold">100/100</span>`,
  `<span className="text-[10px] font-mono text-gold">{studyHours}/100</span>`
);
code = code.replace(
  `<span className="text-xs font-bold text-text-primary flex-1">Log 100 Hours</span>`,
  `<span className="text-xs font-bold text-text-primary flex-1">Log 100 Hours ({studyHours}h)</span>`
);

const oldOverview = `<div className="p-balance w-full">
              <p className="p-balance-label">TOTAL EARNINGS (RP)</p>
              <div className="p-balance-row">
                <span className="p-balance-num">{xp}</span>
                <span className="p-balance-unit">RP</span>
              </div>
              <div className="p-balance-actions">
                <button className="p-btn p-btn-primary">
                  CLAIM REWARDS
                </button>
                <button className="p-btn-icon">
                  <Flame className="w-5 h-5 text-gold" />
                </button>
              </div>
            </div>

            <div className="p-stats grid grid-cols-2 gap-3 sm:gap-4 mb-4 w-full">
              <div className="p-stat">
                <p className="p-stat-label">CONSISTENCY (%)</p>
                <p className="p-stat-value accent">
                  68.4<span className="p-stat-suffix">%</span>
                </p>
              </div>
              <div className="p-stat">
                <p className="p-stat-label">FOCUS SCORE</p>
                <p className="p-stat-value">
                  2.45
                </p>
              </div>
            </div>`;

const newOverview = `<div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
              <div className="p-balance w-full h-full">
                <p className="p-balance-label">TOTAL EARNINGS (RP)</p>
                <div className="p-balance-row">
                  <span className="p-balance-num">{xp}</span>
                  <span className="p-balance-unit">RP</span>
                </div>
                <div className="p-balance-actions">
                  <button className="p-btn p-btn-primary">
                    CLAIM REWARDS
                  </button>
                  <button className="p-btn-icon">
                    <Flame className="w-5 h-5 text-gold" />
                  </button>
                </div>
              </div>
              <div className="p-stat h-full flex flex-col justify-center">
                <p className="p-stat-label">CONSISTENCY (%)</p>
                <p className="p-stat-value accent">
                  {level > 5 ? '92.4' : '68.4'}<span className="p-stat-suffix">%</span>
                </p>
              </div>
              <div className="p-stat h-full flex flex-col justify-center">
                <p className="p-stat-label">FOCUS SCORE</p>
                <p className="p-stat-value">
                  {studyHours > 10 ? '4.85' : '2.45'}
                </p>
              </div>
            </div>`;

code = code.replace(oldOverview, newOverview);

fs.writeFileSync('src/views/ProfilePremiumView.tsx', code);
