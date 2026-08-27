const fs = require('fs');
let code = fs.readFileSync('src/views/ProfilePremiumView.tsx', 'utf8');

const targetTrophies = `<div className="p-card w-full">
            <h4 className="p-card-title">TROPHY ROOM</h4>
            <div className="p-achieve-grid mb-5">
              <div className="p-achieve-item unlocked">
                <CheckCircle2 className="p-achieve-check w-3 h-3" />
                <span className="p-achieve-icon">🏆</span>
                <span className="p-achieve-title">First Win</span>
              </div>
              <div className="p-achieve-item unlocked">
                <CheckCircle2 className="p-achieve-check w-3 h-3" />
                <span className="p-achieve-icon">🔥</span>
                <span className="p-achieve-title">Hot Streak</span>
              </div>
              <div className="p-achieve-item unlocked">
                <CheckCircle2 className="p-achieve-check w-3 h-3" />
                <span className="p-achieve-icon">⚡</span>
                <span className="p-achieve-title">Fast Reflex</span>
              </div>
              <div className="p-achieve-item">
                <span className="p-achieve-icon opacity-30">👑</span>
                <span className="p-achieve-title opacity-50">Champion</span>
              </div>
              <div className="p-achieve-item">
                <span className="p-achieve-icon opacity-30">🎯</span>
                <span className="p-achieve-title opacity-50">Sharpshooter</span>
              </div>
            </div>

            <h4 className="p-card-title">MILESTONES</h4>
            <div className="p-milestone done">
              <Medal className="w-4 h-4 text-success" />
              <span className="text-xs font-bold text-text-primary flex-1">Log 100 Hours</span>
              <span className="text-[10px] font-mono text-gold">100/100</span>
            </div>
            <div className="p-milestone locked">
              <Swords className="w-4 h-4 text-text-muted" />
              <span className="text-xs font-bold text-text-muted flex-1">Complete 500 Questions</span>
              <span className="text-[10px] font-mono text-text-muted">412/500</span>
            </div>
          </div>`;

const newTrophies = `<div className="p-card w-full">
            <h4 className="p-card-title mb-4">TROPHY ROOM</h4>
            <div className="text-center py-10 opacity-50">
              <p className="text-sm">No trophies unlocked yet.</p>
              <p className="text-xs mt-1">Keep studying to earn achievements!</p>
            </div>
          </div>`;

code = code.replace(targetTrophies, newTrophies);
fs.writeFileSync('src/views/ProfilePremiumView.tsx', code);
