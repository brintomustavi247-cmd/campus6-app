import React from 'react';
import { motion } from 'motion/react';
import { Zap, Shield, Cpu } from 'lucide-react';

interface MechaProps {
  xp: number;
  level: number;
}

export default function MechaEvolutionCore({ xp, level }: MechaProps) {
  // Level 1: Basic core
  // Level 2: Shoulder armor
  // Level 3: Energy shield
  // Level 4: Full Mecha evolution
  
  const getGlowColor = () => {
    if (level >= 4) return 'shadow-[0_0_50px_rgba(16,185,129,0.5)] border-slate-500/50';
    if (level >= 3) return 'shadow-[0_0_40px_rgba(59,130,246,0.4)] border-slate-500/40';
    if (level >= 2) return 'shadow-[0_0_30px_rgba(99,102,241,0.3)] border-slate-500/30';
    return 'shadow-[0_0_20px_rgba(99,102,241,0.1)] border-white/10';
  };

  const getCoreColor = () => {
    if (level >= 4) return 'from-slate-500 to-red-400 text-text-primary';
    if (level >= 3) return 'from-slate-500 to-red-400 text-text-primary';
    if (level >= 2) return 'from-slate-500 to-purple-400 text-text-primary';
    return 'from-gray-700 to-gray-500 text-gray-100';
  };

  return (
    <div className="bg-surface rounded-2xl border border-white/5 p-6 shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <h3 className="text-xs font-black text-text-primary/40 uppercase tracking-widest mb-6">Mecha Evolution</h3>
        
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={`w-32 h-32 rounded-full border-2 bg-bg flex items-center justify-center relative ${getGlowColor()}`}
        >
          {/* Core Energy */}
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getCoreColor()} flex items-center justify-center animate-pulse`}>
            {level >= 4 ? <Shield className="w-10 h-10" /> : level >= 3 ? <Zap className="w-10 h-10" /> : <Cpu className="w-10 h-10" />}
          </div>
          
          {/* Orbiting rings based on level */}
          {level >= 2 && (
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-10px] rounded-full border border-slate-500/30 border-dashed"
            />
          )}
          {level >= 3 && (
            <motion.div 
              animate={{ rotate: -360 }} 
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-20px] rounded-full border border-slate-500/20 border-t-yellow-400"
            />
          )}
          {level >= 4 && (
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-30px] rounded-full border border-slate-500/10 border-b-red-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            />
          )}
        </motion.div>
        
        <div className="mt-12 text-center">
          <p className="text-xl font-black text-text-primary uppercase tracking-wider">Armor Level {level}</p>
          <p className="text-xs text-text-primary/50 font-mono mt-1">{xp} Momentum XP</p>
        </div>
      </div>
    </div>
  );
}
