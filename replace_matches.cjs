const fs = require('fs');

let code = fs.readFileSync('src/views/ProfilePremiumView.tsx', 'utf8');

const targetMatches = `<div className="p-card p-0 overflow-hidden w-full">
            <h4 className="p-card-title px-5 pt-5 pb-2">RECENT SESSIONS</h4>
            
            <div className="p-match-item">
              <div className="p-match-dot live" />
              <div className="p-match-info">
                <h5 className="p-match-title">Deep Work Sprint - Physics</h5>
                <p className="p-match-meta">In Progress • Topic: Thermodynamics</p>
              </div>
              <span className="p-match-status bg-primary-soft text-primary border border-primary-soft">LIVE</span>
            </div>
            
            <div className="p-match-item">
              <div className="p-match-dot upcoming" />
              <div className="p-match-info">
                <h5 className="p-match-title">Mock Exam Simulation</h5>
                <p className="p-match-meta">Starts in 45m • Topic: Organic Chemistry</p>
              </div>
              <span className="p-match-status bg-gold-soft text-gold border border-gold-soft">WAITING</span>
            </div>

            <div className="p-match-item">
              <div className="p-match-dot completed" />
              <div className="p-match-info">
                <h5 className="p-match-title">Group Study Session</h5>
                <p className="p-match-meta">Yesterday • Efficiency: 92%</p>
              </div>
              <span className="p-match-status bg-success-soft text-success border border-success-soft">VICTORY</span>
            </div>
          </div>`;

const newMatches = `<div className="p-card overflow-hidden w-full">
            <h4 className="p-card-title mb-4">RECENT SESSIONS</h4>
            <div className="text-center py-10 opacity-50">
              <p className="text-sm">No recent sessions found.</p>
              <p className="text-xs mt-1">Start a timer to log your focus sessions.</p>
            </div>
          </div>`;

code = code.replace(targetMatches, newMatches);

fs.writeFileSync('src/views/ProfilePremiumView.tsx', code);
