const fs = require('fs');
let loginView = fs.readFileSync('src/views/LoginView.tsx', 'utf8');

// The file currently has:
/*
        {/* Header / Logo *\/}
        <div className="flex justify-center w-full mb-10">
          <RankPushLogo />
        </div>
          <h1 className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '2px' }}>
            RANK<span className="text-[#35D6FF]">PUSH</span>
          </h1>
          <p className="text-[11px] font-mono text-[#35D6FF] uppercase tracking-[0.2em] mt-2 font-bold drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
            Competitive Academic Engine
          </p>
        </div>
*/

// I'll replace everything from {/* Header / Logo */} down to the stray </div> with just the RankPushLogo block.

loginView = loginView.replace(/\{\/\* Header \/ Logo \*\/\}(.|\n)*?Competitive Academic Engine\s*<\/p>\s*<\/div>/,
`{/* Header / Logo */}
        <div className="flex justify-center w-full mb-10">
          <RankPushLogo />
        </div>`
);

fs.writeFileSync('src/views/LoginView.tsx', loginView, 'utf8');
