import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export interface RankBadgeProps {
  rank: string;
  size?: 'small' | 'medium' | 'large' | 'xl' | number;
  animated?: boolean;
  className?: string;
}

const parseRank = (fullRank: string) => {
  let baseRank = fullRank.toUpperCase().replace('⚡', '').trim();
  let division = 3;
  
  if (baseRank.endsWith(' I')) {
    division = 1;
    baseRank = baseRank.slice(0, -2).trim();
  } else if (baseRank.endsWith(' II')) {
    division = 2;
    baseRank = baseRank.slice(0, -3).trim();
  } else if (baseRank.endsWith(' III')) {
    division = 3;
    baseRank = baseRank.slice(0, -4).trim();
  } else if (baseRank.endsWith(' IV')) {
    division = 4;
    baseRank = baseRank.slice(0, -3).trim();
  } else if (baseRank.endsWith(' V')) {
    division = 5;
    baseRank = baseRank.slice(0, -2).trim();
  }

  return { baseRank, division };
};

const getSize = (size: RankBadgeProps['size']) => {
  if (typeof size === 'number') return size;
  switch (size) {
    case 'small': return 24;
    case 'medium': return 48;
    case 'large': return 80;
    case 'xl': return 120;
    default: return 48;
  }
};

export const RankBadge: React.FC<RankBadgeProps> = ({
  rank,
  size = 'medium',
  animated = false,
  className = ''
}) => {
  const { baseRank, division } = useMemo(() => parseRank(rank || 'SPARK'), [rank]);
  const pxSize = getSize(size);
  
  // Outer frame evolution based on division
  const renderDivisionFrame = (color1: string, color2: string) => {
    return (
      <g className="division-frame">
        {division <= 2 && (
          <motion.circle 
            cx="50" cy="50" r="42" 
            fill="none" 
            stroke={color1} 
            strokeWidth="1" 
            strokeDasharray="4 4"
            opacity="0.6"
            animate={animated ? { rotate: 360 } : {}}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        )}
        {division === 1 && (
          <motion.path 
            d="M 50 2 L 98 50 L 50 98 L 2 50 Z" 
            fill="none" 
            stroke={color2} 
            strokeWidth="1.5" 
            opacity="0.8"
            animate={animated ? { scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </g>
    );
  };

  const renderBadgeContent = () => {
    switch (baseRank) {
      case 'SPARK':
        return (
          <>
            {renderDivisionFrame('#00F0FF', '#00A3FF')}
            <motion.path d="M 50 15 L 75 50 L 50 85 L 25 50 Z" fill="#00A3FF" fillOpacity="0.2" stroke="#00F0FF" strokeWidth="2" />
            <motion.path d="M 50 30 L 65 50 L 50 70 L 35 50 Z" fill="#00F0FF" animate={animated ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 2, repeat: Infinity }} />
          </>
        );
      case 'SCRIBE':
        return (
          <>
            {renderDivisionFrame('#00FFB2', '#00B2FF')}
            <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="#0A0C10" stroke="#00B2FF" strokeWidth="2" />
            <motion.path d="M 50 25 L 60 40 L 50 75 L 40 40 Z" fill="#00FFB2" animate={animated ? { y: [-2, 2, -2] } : {}} transition={{ duration: 3, repeat: Infinity }} />
            <path d="M 35 60 H 65" stroke="#00B2FF" strokeWidth="2" />
          </>
        );
      case 'LUMINARY':
        return (
          <>
            {renderDivisionFrame('#FDE047', '#38BDF8')}
            <path d="M 50 15 L 85 35 V 75 L 50 95 L 15 75 V 35 Z" fill="#0A0C10" stroke="#38BDF8" strokeWidth="2" />
            <path d="M 50 15 V 95" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" />
            <motion.polygon points="50,35 65,55 50,75 35,55" fill="#FDE047" animate={animated ? { opacity: [0.6, 1, 0.6] } : {}} transition={{ duration: 1.5, repeat: Infinity }} />
          </>
        );
      case 'SYNAPTIC':
        return (
          <>
            {renderDivisionFrame('#38BDF8', '#818CF8')}
            <circle cx="50" cy="50" r="35" fill="none" stroke="#818CF8" strokeWidth="2" />
            <path d="M 50 15 L 80 65 L 20 65 Z" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
            <motion.circle cx="50" cy="15" r="5" fill="#38BDF8" animate={animated ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 2, repeat: Infinity }} />
            <motion.circle cx="80" cy="65" r="5" fill="#38BDF8" animate={animated ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 2, delay: 0.6, repeat: Infinity }} />
            <motion.circle cx="20" cy="65" r="5" fill="#38BDF8" animate={animated ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 2, delay: 1.2, repeat: Infinity }} />
            <circle cx="50" cy="50" r="8" fill="#818CF8" />
          </>
        );
      case 'MINDFORGE':
        return (
          <>
            {renderDivisionFrame('#E11D48', '#00F0FF')}
            <polygon points="30,10 70,10 90,30 90,70 70,90 30,90 10,70 10,30" fill="#161822" stroke="#475569" strokeWidth="3" />
            <polygon points="35,18 65,18 82,35 82,65 65,82 35,82 18,65 18,35" fill="none" stroke="#00F0FF" strokeWidth="1.5" />
            <motion.circle cx="50" cy="50" r="15" fill="#E11D48" animate={animated ? { scale: [0.9, 1.1, 0.9], opacity: [0.8, 1, 0.8] } : {}} transition={{ duration: 1.2, repeat: Infinity }} />
            <circle cx="50" cy="50" r="6" fill="#00F0FF" />
          </>
        );
      case 'ASTRAL SCHOLAR':
        return (
          <>
            {renderDivisionFrame('#00F0FF', '#FACC15')}
            <motion.circle cx="50" cy="50" r="38" fill="none" stroke="#00F0FF" strokeWidth="1.5" animate={animated ? { rotate: -360 } : {}} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} strokeDasharray="60 20" />
            <motion.circle cx="50" cy="50" r="28" fill="none" stroke="#FACC15" strokeWidth="1" animate={animated ? { rotate: 360 } : {}} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} strokeDasharray="30 10" />
            <path d="M 35 40 H 65 V 65 H 35 Z" fill="#0F111A" stroke="#00F0FF" strokeWidth="2" />
            <motion.polygon points="50,25 55,40 70,40 58,50 62,65 50,55 38,65 42,50 30,40 45,40" fill="#FACC15" animate={animated ? { opacity: [0.5, 1, 0.5] } : {}} transition={{ duration: 2, repeat: Infinity }} />
          </>
        );
      case 'NEURAL SAGE':
        return (
          <>
            {renderDivisionFrame('#F59E0B', '#06B6D4')}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#06B6D4" strokeWidth="2" opacity="0.3" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <motion.circle 
                key={i} cx="50" cy="10" r="3" fill="#F59E0B"
                style={{ originX: '50px', originY: '50px', rotate: angle }}
                animate={animated ? { opacity: [0.3, 1, 0.3] } : {}}
                transition={{ duration: 2, delay: i * 0.25, repeat: Infinity }}
              />
            ))}
            <path d="M 50 20 Q 80 50 50 80 Q 20 50 50 20 Z" fill="#0A0C10" stroke="#06B6D4" strokeWidth="2" />
            <motion.circle cx="50" cy="50" r="12" fill="#F59E0B" animate={animated ? { scale: [0.95, 1.05, 0.95] } : {}} transition={{ duration: 2, repeat: Infinity }} />
            <circle cx="50" cy="50" r="4" fill="#0A0C10" />
          </>
        );
      case 'ARCHON':
        return (
          <>
            {renderDivisionFrame('#DC143C', '#FACC15')}
            <path d="M 50 5 L 75 35 L 65 90 H 35 L 25 35 Z" fill="#0A0C10" stroke="#DC143C" strokeWidth="3" />
            <path d="M 50 15 L 65 40 L 55 80 H 45 L 35 40 Z" fill="none" stroke="#FACC15" strokeWidth="1.5" />
            <motion.polygon points="50,25 60,45 50,60 40,45" fill="#FACC15" animate={animated ? { y: [-2, 2, -2] } : {}} transition={{ duration: 3, repeat: Infinity }} />
            <circle cx="50" cy="75" r="4" fill="#DC143C" />
          </>
        );
      case 'OMNISAGE':
        return (
          <>
            {renderDivisionFrame('#F5C518', '#00F0FF')}
            <motion.polygon points="50,5 95,75 5,75" fill="none" stroke="#E11D48" strokeWidth="2" animate={animated ? { rotate: 360 } : {}} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ originX: '50px', originY: '56px' }} />
            <motion.polygon points="50,95 5,25 95,25" fill="none" stroke="#F5C518" strokeWidth="2" animate={animated ? { rotate: -360 } : {}} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ originX: '50px', originY: '44px' }} />
            <circle cx="50" cy="50" r="22" fill="#0A0C10" stroke="#00F0FF" strokeWidth="3" />
            <motion.polygon points="50,35 62,58 38,58" fill="#F5C518" animate={animated ? { scale: [0.8, 1.1, 0.8] } : {}} transition={{ duration: 3, repeat: Infinity }} />
          </>
        );
      case 'TRANSCENDENT':
        return (
          <>
            {renderDivisionFrame('#FFFFFF', '#FACC15')}
            <motion.circle cx="50" cy="50" r="44" fill="none" stroke="#00F0FF" strokeWidth="1" strokeDasharray="4 12" animate={animated ? { rotate: 360 } : {}} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} />
            <motion.circle cx="50" cy="50" r="36" fill="none" stroke="#E11D48" strokeWidth="2" strokeDasharray="40 20" animate={animated ? { rotate: -20 } : {}} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
            <polygon points="50,10 65,35 90,50 65,65 50,90 35,65 10,50 35,35" fill="#0A0C10" stroke="#FACC15" strokeWidth="2" />
            <motion.polygon points="50,20 60,40 80,50 60,60 50,80 40,60 20,50 40,40" fill="#FFFFFF" opacity="0.8" animate={animated ? { scale: [0.9, 1.1, 0.9], opacity: [0.6, 1, 0.6] } : {}} transition={{ duration: 4, repeat: Infinity }} />
            <circle cx="50" cy="50" r="10" fill="#00F0FF" />
            <circle cx="50" cy="50" r="4" fill="#FFFFFF" />
          </>
        );
      default:
        return (
          <>
            {renderDivisionFrame('#00F0FF', '#00A3FF')}
            <motion.path d="M 50 15 L 75 50 L 50 85 L 25 50 Z" fill="#00A3FF" fillOpacity="0.2" stroke="#00F0FF" strokeWidth="2" />
            <circle cx="50" cy="50" r="10" fill="#00F0FF" />
          </>
        );
    }
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: pxSize, height: pxSize }}
    >
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full drop-shadow-xl overflow-visible"
        style={{ filter: division === 1 ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'drop-shadow(0 0 4px rgba(0,0,0,0.5))' }}
      >
        {renderBadgeContent()}
      </svg>
    </div>
  );
};
