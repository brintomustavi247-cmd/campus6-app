import React from 'react';
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
    visible: { pathLength: 1, opacity: 1, transition: { duration: 1, ease: "easeInOut" as const } }
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

  const renderSymbol = () => (
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

  if (variant === 'symbol-only') return renderSymbol();

  return (
    <div className={`flex ${isHorizontal ? 'flex-row items-center gap-3' : 'flex-col items-center'} ${className}`}>
      <div className={isHorizontal ? '' : 'mb-5'}>
        {renderSymbol()}
      </div>
      <div className={`flex flex-col ${isHorizontal ? 'items-start' : 'items-center'}`}>
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
