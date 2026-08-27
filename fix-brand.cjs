const fs = require('fs');
const path = require('path');

// 1. Create public/rankpush-icon.svg
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" fill="#090C11"/>
  <g transform="translate(112, 112) scale(8)">
    <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="none" stroke="#35D6FF" stroke-width="4" stroke-opacity="0.3"/>
    <path d="M 32 25 H 42 V 75 H 32 Z" fill="#0AA8D8"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M 42 25 H 65 C 75 25 80 32 80 40 C 80 48 75 55 65 55 H 42 V 25 Z M 52 47 H 62 C 65 47 68 45 68 40 C 68 35 65 33 62 33 H 52 V 47 Z" fill="#0AA8D8"/>
    <path d="M 52 58 H 66 L 80 75 H 66 L 52 58 Z" fill="#35D6FF"/>
  </g>
</svg>`;
fs.writeFileSync(path.join('public', 'rankpush-icon.svg'), iconSvg, 'utf8');

// 2. Create RankPushLogo.tsx
const logoTsx = `import React from 'react';
import { motion } from 'motion/react';

interface RankPushLogoProps {
  variant?: 'symbol-only' | 'symbol-text' | 'full' | 'horizontal';
  size?: number | string;
  showTagline?: boolean;
  animated?: boolean;
  monochrome?: boolean;
  className?: string;
}

export const RankPushLogo: React.FC<RankPushLogoProps> = ({
  variant = 'full',
  size = 100,
  showTagline = true,
  animated = true,
  monochrome = false,
  className = ''
}) => {
  const isHorizontal = variant === 'horizontal';
  
  const primaryColor = monochrome ? 'currentColor' : '#35D6FF';
  const secondaryColor = monochrome ? 'currentColor' : '#0AA8D8';
  const textColor = monochrome ? 'currentColor' : '#F4F7FA';
  const taglineColor = monochrome ? 'currentColor' : '#0AA8D8';
  
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1, transition: { duration: 1, ease: "easeInOut" } }
  };
  
  const fillVariants = {
    hidden: { fillOpacity: 0 },
    visible: { fillOpacity: 1, transition: { delay: 0.6, duration: 0.5 } }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.8, duration: 0.4 } }
  };

  const pushVariants = {
    hidden: { opacity: 0, y: 10, color: '#F4F7FA', textShadow: '0px 0px 0px rgba(53,214,255,0)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      color: primaryColor,
      textShadow: monochrome ? 'none' : '0px 0px 15px rgba(53,214,255,0.4)',
      transition: { delay: 1.0, duration: 0.5 }
    }
  };

  const taglineVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: 1.2, duration: 0.5 } }
  };

  const Symbol = () => (
    <motion.svg 
      viewBox="0 0 100 100" 
      width={variant === 'symbol-only' ? size : (isHorizontal ? 40 : 80)} 
      height={variant === 'symbol-only' ? size : (isHorizontal ? 40 : 80)}
      className="overflow-visible"
      initial={animated ? "hidden" : "visible"}
      animate="visible"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={secondaryColor} />
          <stop offset="100%" stopColor={primaryColor} />
        </linearGradient>
      </defs>
      
      <motion.polygon 
        points="50,5 90,25 90,75 50,95 10,75 10,25" 
        fill="none" 
        stroke={monochrome ? 'currentColor' : 'rgba(53,214,255,0.2)'} 
        strokeWidth="2"
        variants={pathVariants}
      />
      
      <motion.path 
        d="M 32 25 H 42 V 75 H 32 Z" 
        fill={monochrome ? 'currentColor' : 'url(#logoGrad)'}
        stroke={monochrome ? 'currentColor' : 'url(#logoGrad)'}
        strokeWidth="1"
        variants={animated ? fillVariants : {}}
      />
      
      <motion.path 
        fillRule="evenodd" 
        clipRule="evenodd"
        d="M 42 25 H 65 C 75 25 80 32 80 40 C 80 48 75 55 65 55 H 42 V 25 Z M 52 47 H 62 C 65 47 68 45 68 40 C 68 35 65 33 62 33 H 52 V 47 Z"
        fill={monochrome ? 'currentColor' : 'url(#logoGrad)'}
        stroke={monochrome ? 'currentColor' : 'url(#logoGrad)'}
        strokeWidth="1"
        variants={animated ? fillVariants : {}}
      />
      
      <motion.path 
        d="M 52 58 H 66 L 80 75 H 66 L 52 58 Z" 
        fill={monochrome ? 'currentColor' : primaryColor}
        stroke={monochrome ? 'currentColor' : primaryColor}
        strokeWidth="1"
        variants={animated ? fillVariants : {}}
      />
    </motion.svg>
  );

  if (variant === 'symbol-only') return <Symbol />;

  return (
    <div className={\`flex \${isHorizontal ? 'flex-row items-center gap-3' : 'flex-col items-center'} \${className}\`}>
      <div className={isHorizontal ? '' : 'mb-5'}>
        <Symbol />
      </div>
      <div className={\`flex flex-col \${isHorizontal ? 'items-start' : 'items-center'}\`}>
        <motion.div 
          className="flex font-black tracking-[0.05em]"
          style={{ 
            fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
            fontSize: isHorizontal ? '20px' : '32px',
            lineHeight: 1
          }}
          initial={animated ? "hidden" : "visible"}
          animate="visible"
        >
          <motion.span variants={textVariants} style={{ color: textColor }}>RANK</motion.span>
          <motion.span variants={pushVariants}>PUSH</motion.span>
        </motion.div>
        
        {showTagline && (variant === 'full' || variant === 'horizontal') && (
          <motion.div
            className="font-mono uppercase font-bold tracking-[0.2em] mt-2 text-center"
            style={{ 
              fontSize: isHorizontal ? '8px' : '10px',
              color: taglineColor,
            }}
            initial={animated ? "hidden" : "visible"}
            animate="visible"
            variants={taglineVariants}
          >
            Competitive Academic Engine
          </motion.div>
        )}
      </div>
    </div>
  );
};
`;
fs.writeFileSync(path.join('src', 'components', 'RankPushLogo.tsx'), logoTsx, 'utf8');

// 3. Update src/index.css for new Cyan-based premium profile CSS
let indexCss = fs.readFileSync('src/index.css', 'utf8');
const newProfileCss = `
.profile-premium {
  --p-bg: #090C11;
  --p-card: #12151D;
  --p-card-border: rgba(53, 214, 255, 0.12);
  --p-card-top: rgba(53, 214, 255, 0.2);
  --p-nested: #0D1017;
  --p-text: #F4F7FA;
  --p-muted: #64748B;
  
  --p-cyan: #35D6FF;
  --p-cyan-deep: #0AA8D8;
  --p-cyan-glow: rgba(53, 214, 255, 0.25);
  
  --p-radius-xl: 24px;
  --p-radius-lg: 16px;
  --p-radius-md: 14px;
  --p-radius-full: 9999px;
  --p-shadow: 0 16px 32px rgba(0, 0, 0, 0.6);
  --p-font-display: 'Orbitron', 'Rajdhani', sans-serif;
  --p-font-body: 'Plus Jakarta Sans', sans-serif;
  --p-font-mono: 'JetBrains Mono', monospace;

  background-color: var(--p-bg);
  background-image:
    radial-gradient(circle at 15% 50%, rgba(53, 214, 255, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 85% 30%, rgba(10, 168, 216, 0.06) 0%, transparent 50%);
  color: var(--p-text);
  font-family: var(--p-font-body);
  min-height: 100dvh;
  position: relative;
  overflow-x: hidden;
  padding: 40px 16px;
}

.profile-premium ::selection {
  background: var(--p-cyan);
  color: #090C11;
}

.profile-premium::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 1;
  opacity: 1;
}

.p-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(9, 12, 17, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.p-btn {
  height: 48px;
  border-radius: var(--p-radius-lg);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  font-family: var(--p-font-display);
  letter-spacing: 1px;
}

.p-btn-primary {
  background: linear-gradient(135deg, var(--p-cyan-deep), var(--p-cyan));
  color: #090C11;
  box-shadow: 0 0 15px rgba(53, 214, 255, 0.2);
}

.p-btn-primary:hover {
  box-shadow: 0 0 25px rgba(53, 214, 255, 0.4);
  transform: translateY(-2px);
}

.p-edit-field {
  margin-bottom: 16px;
  position: relative;
}

.p-edit-field label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--p-cyan);
  margin-bottom: 6px;
  font-family: var(--p-font-display);
}

.p-edit-field input, .p-edit-field select {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: white;
  font-family: var(--p-font-body);
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.p-edit-field input:focus, .p-edit-field select:focus {
  border-color: var(--p-cyan);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 15px rgba(53, 214, 255, 0.15);
}

.profile-premium .p-container {
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
}

.profile-premium .p-card {
  background: var(--p-card);
  border: 1px solid var(--p-card-border);
  border-top: 1px solid var(--p-card-top);
  border-radius: var(--p-radius-xl);
  padding: 32px;
  box-shadow: var(--p-shadow);
  backdrop-filter: blur(10px);
}

@media (min-width: 768px) {
  .profile-premium .p-container.register-mode {
    max-width: 800px;
  }
}
`;

indexCss = indexCss.replace(/\.profile-premium\s*{[\s\S]*?}\n\n/g, '');
indexCss += newProfileCss;
fs.writeFileSync('src/index.css', indexCss, 'utf8');

// 4. Update index.html loader
let html = fs.readFileSync('index.html', 'utf8');
const newLoader = `<div class="logo-container" style="background: none; border: none; box-shadow: none; width: auto; height: auto;">
        <svg viewBox="0 0 100 100" width="64" height="64">
          <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="none" stroke="rgba(53,214,255,0.3)" stroke-width="2"/>
          <path d="M 32 25 H 42 V 75 H 32 Z" fill="#0AA8D8"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M 42 25 H 65 C 75 25 80 32 80 40 C 80 48 75 55 65 55 H 42 V 25 Z M 52 47 H 62 C 65 47 68 45 68 40 C 68 35 65 33 62 33 H 52 V 47 Z" fill="#0AA8D8"/>
          <path d="M 52 58 H 66 L 80 75 H 66 L 52 58 Z" fill="#35D6FF"/>
        </svg>
      </div>
      <div class="title" style="color: #F4F7FA; font-family: 'Orbitron', sans-serif;">RANK<span style="color: #35D6FF">PUSH</span></div>
      <div class="subtitle" style="color: #0AA8D8; font-family: 'JetBrains Mono', monospace; font-size: 9px;">COMPETITIVE ACADEMIC ENGINE</div>`;
html = html.replace(/<div class="logo-container">[\s\S]*?<div class="subtitle">.*?<\/div>/, newLoader);
html = html.replace(/background-color: #0F1720/g, 'background-color: #090C11');
fs.writeFileSync('index.html', html, 'utf8');

// 5. Update LoginView.tsx to use RankPushLogo and new colors
let loginView = fs.readFileSync('src/views/LoginView.tsx', 'utf8');
// Add import if missing
if (!loginView.includes('RankPushLogo')) {
  loginView = loginView.replace("import { Mail", "import { RankPushLogo } from '../components/RankPushLogo';\nimport { Mail");
}

// Replace header section
const oldHeaderRegex = /\{\/\* Header \/ Logo \*\/\}\s*<div className="text-center mb-8">[\s\S]*?<\/div>/;
const newHeader = `{/* Header / Logo */}
        <div className="flex justify-center w-full mb-10">
          <RankPushLogo />
        </div>`;
loginView = loginView.replace(oldHeaderRegex, newHeader);

// Update CustomSelect colors
loginView = loginView.replace(/1px solid #DC2626/g, '1px solid #35D6FF');
loginView = loginView.replace(/rgba\(220, 38, 38, 0\.2\)/g, 'rgba(53, 214, 255, 0.2)');
loginView = loginView.replace(/hover:bg-red-600\/20/g, 'hover:bg-cyan-500/20');
loginView = loginView.replace(/hover:text-red-400/g, 'hover:text-[#35D6FF]');
loginView = loginView.replace(/text-red-400/g, 'text-[#35D6FF]');
loginView = loginView.replace(/text-red-500/g, 'text-[#35D6FF]');
loginView = loginView.replace(/text-red-600/g, 'text-[#35D6FF]');
loginView = loginView.replace(/#00F0FF/g, '#35D6FF'); // Replace neon blue with proper brand cyan

fs.writeFileSync('src/views/LoginView.tsx', loginView, 'utf8');
console.log('Update Complete.');
