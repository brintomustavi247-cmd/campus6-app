import React from 'react';
import { EsportsPlayer } from './EsportsData';
import { RankBadge } from '../../components/RankBadge';
import { ArrowLeft, Target as TargetIcon, Trophy, Clock, Activity, Flag, Calendar, Medal, Plus, Twitter, Twitch, Youtube, Hexagon, Crosshair } from 'lucide-react';

interface Props {
  user: EsportsPlayer;
  onClose: () => void;
}

export const PremiumProfile: React.FC<Props> = ({ user, onClose }) => {
  // Helper for hexagonal shape
  const hexagonStyle = { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' };

  return (
    <div className="absolute inset-y-0 right-0 w-full md:w-[600px] bg-[#0A0C10] border-l border-slate-800 transform transition-transform duration-500 ease-in-out z-50 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.6)]">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-4 bg-[#0A0C10]/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-800/50">
        <button onClick={onClose} className="flex items-center gap-2 px-3 py-2 bg-[#161822] rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-[11px] font-black uppercase tracking-widest font-orbitron">Back to Leaderboard</span>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        
        {/* HERO SECTION */}
        <div className="relative pt-12 pb-8 px-6 flex flex-col items-center">
          {/* Abstract Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#06B6D4]/20 via-[#1E2030] to-[#0A0C10] pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#06B6D4]/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 w-36 h-36 mb-6">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90 scale-[1.15] drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
              <circle cx="50" cy="50" r="46" stroke="#161822" strokeWidth="4" fill="none" />
              <circle cx="50" cy="50" r="46" stroke="#06B6D4" strokeWidth="4" fill="none" strokeDasharray="220 80" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-2 rounded-full bg-[#161822] flex items-center justify-center text-white font-black text-5xl font-orbitron shadow-inner border border-slate-700/50">
              {user.avatar}
            </div>

            {/* Rank Badge overlay */}
            <div className="absolute -bottom-4 -left-4 w-16 h-16 z-30">
               <RankBadge rank={user.tier} size={64} animated className="drop-shadow-xl" />
            </div>

            {/* Level Badge */}
            <div className="absolute top-0 -right-2 w-10 h-10 bg-[#FACC15] rotate-45 border-[4px] border-[#0A0C10] flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.4)] z-20">
              <span className="-rotate-45 text-xs font-black text-black font-orbitron">{user.level}</span>
            </div>
            {/* Online Status */}
            {user.isOnline && (
               <div className="absolute bottom-2 right-2 w-5 h-5 bg-[#0A0C10] rounded-full flex items-center justify-center z-20">
                 <div className="w-3 h-3 bg-[#22C55E] rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
               </div>
            )}
          </div>

          <div className="text-center relative z-10 space-y-1">
            <h1 className="text-3xl font-black text-white uppercase tracking-wider font-rajdhani">{user.name}</h1>
            <p className="text-sm font-bold text-[#06B6D4] font-rajdhani">@{user.username}</p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <span className="text-[10px] bg-[#161822] px-3 py-1 rounded text-slate-300 border border-slate-700 font-black uppercase tracking-widest font-orbitron">
                {user.title}
              </span>
              <span className="text-[10px] bg-[#DC143C]/20 px-3 py-1 rounded text-[#DC143C] border border-[#DC143C]/50 font-black uppercase tracking-widest font-orbitron">
                Rank #{user.rank}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-12 space-y-8 relative z-10">
          
          {/* RANK PROGRESSION BAR */}
          <div className="bg-[#161822] border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
             <div className="absolute right-0 top-0 w-32 h-32 bg-[#FACC15]/5 blur-3xl -mr-10 -mt-10" />
             <div className="flex justify-between items-end mb-2 px-1 relative z-10">
               <span className="text-[11px] font-black bg-[#FACC15] text-black px-3 py-0.5 font-orbitron" style={{ transform: 'skewX(-15deg)' }}>
                 <div style={{ transform: 'skewX(15deg)' }}>LEVEL {user.level}</div>
               </span>
               <div className="text-right">
                 <span className="text-sm font-black text-[#FACC15] font-orbitron">{user.xp.toLocaleString()} <span className="text-slate-500 text-[10px]">/ {user.nextLevelXp.toLocaleString()} XP</span></span>
               </div>
             </div>
             
             <div className="w-full bg-[#0A0C10] h-6 -skew-x-12 overflow-hidden border border-slate-700 relative z-10">
               <div className="bg-[#FACC15] h-full shadow-[0_0_15px_rgba(250,204,21,0.4)] flex justify-end items-center pr-2" style={{ width: `${(user.xp / user.nextLevelXp) * 100}%` }}>
                  <div className="w-1.5 h-3 bg-black/20 skew-x-12" />
                  <div className="w-1.5 h-3 bg-black/20 skew-x-12 ml-1" />
               </div>
             </div>
             <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-3 font-orbitron text-center relative z-10">
               {user.nextLevelXp - user.xp} XP to Level {user.level + 1}
             </p>
          </div>

          {/* BIO SECTION */}
          <div className="space-y-3">
             <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest font-orbitron flex items-center gap-2">
               <Activity className="w-4 h-4 text-[#06B6D4]" />
               About Player
             </h3>
             <div className="bg-[#161822] border border-slate-800 p-5 rounded-2xl space-y-4">
               <div>
                 <p className="text-sm text-slate-300 font-medium font-rajdhani leading-relaxed italic">"{user.bio}"</p>
               </div>
               <div className="pt-4 border-t border-slate-700/50 grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 font-orbitron">Motto</p>
                   <p className="text-sm text-white font-bold font-orbitron">{user.motto}</p>
                 </div>
                 <div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 font-orbitron">Joined</p>
                   <p className="text-sm text-white font-bold font-orbitron flex items-center gap-1">
                     <Calendar className="w-3.5 h-3.5 text-[#06B6D4]" /> {user.joinDate}
                   </p>
                 </div>
               </div>
             </div>
          </div>

          {/* PERFORMANCE STATS */}
          <div className="space-y-3">
             <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest font-orbitron flex items-center gap-2">
               <TargetIcon className="w-4 h-4 text-[#FACC15]" />
               Performance
             </h3>
             <div className="grid grid-cols-3 gap-3">
               {[
                 { label: 'Win Rate', value: user.winRate.toString().includes('%') ? user.winRate : `${user.winRate}%`, color: 'text-white' },
                 { label: 'Study Time', value: `${user.studyTime}h`, color: 'text-[#22C55E]' },
                 { label: 'Streak', value: user.streak, color: 'text-[#22C55E]' },
                 { label: 'Best Streak', value: user.bestStreak, color: 'text-[#4ADE80]' },
                 { label: 'Efficiency', value: user.efficiency, color: 'text-[#06B6D4]' },
                 { label: 'Tier', value: user.tier, color: 'text-[#DC143C]', isString: true },
               ].map((stat, i) => (
                 <div key={i} className="bg-[#161822] border border-slate-800 py-3 px-2 overflow-hidden rounded-xl text-center flex flex-col justify-center hover:border-slate-600 transition-colors">
                   <span className={`font-black font-orbitron w-full truncate ${stat.isString ? 'text-[clamp(0.85rem,2.5vw,1.125rem)]' : 'text-xl'} ${stat.color}`}>{stat.value}</span>
                   <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 font-orbitron w-full truncate">{stat.label}</span>
                 </div>
               ))}
             </div>
          </div>

          {/* TARGETS / GOALS */}
          {user.goals.length > 0 && (
            <div className="space-y-3">
               <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest font-orbitron flex items-center gap-2">
                 <Crosshair className="w-4 h-4 text-emerald-400" />
                 Current Targets
               </h3>
               <div className="space-y-3">
                 {user.goals.map(goal => {
                   const percent = Math.min(100, Math.round((goal.current / goal.max) * 100));
                   return (
                     <div key={goal.id} className="bg-[#161822] border border-slate-800 p-4 rounded-xl">
                       <div className="flex justify-between items-center mb-3">
                         <span className="text-xs font-bold text-white font-orbitron uppercase tracking-wide">{goal.title}</span>
                         <span className="text-[10px] font-black text-[#06B6D4] font-orbitron tracking-widest">{percent}%</span>
                       </div>
                       <div className="w-full bg-[#0A0C10] h-2 rounded-full overflow-hidden">
                         <div className="h-full bg-[#06B6D4] shadow-[0_0_10px_rgba(6,182,212,0.5)] rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
                       </div>
                       <div className="text-right mt-2">
                         <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-orbitron">{goal.current} / {goal.max}</span>
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>
          )}

          {/* ACHIEVEMENTS */}
          {user.achievements.length > 0 && (
            <div className="space-y-3">
               <div className="flex justify-between items-center">
                 <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest font-orbitron flex items-center gap-2">
                   <Medal className="w-4 h-4 text-[#FACC15]" />
                   Achievements
                 </h3>
                 <button className="text-[9px] font-black text-[#06B6D4] hover:text-[#22D3EE] uppercase tracking-widest font-orbitron transition-colors">
                   View All
                 </button>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {user.achievements.map((ach) => {
                   let glowClass = 'shadow-[0_0_15px_rgba(255,255,255,0.1)]';
                   let borderClass = 'border-slate-600';
                   let bgClass = 'bg-[#161822]';
                   let iconColor = 'text-slate-300';
                   
                   if (ach.unlocked) {
                     switch(ach.rarity) {
                       case 'legendary':
                         glowClass = 'shadow-[0_0_20px_rgba(250,204,21,0.2)]';
                         borderClass = 'border-[#FACC15]/50';
                         bgClass = 'bg-[#FACC15]/10';
                         iconColor = 'text-[#FACC15]';
                         break;
                       case 'epic':
                         glowClass = 'shadow-[0_0_20px_rgba(220,20,60,0.2)]';
                         borderClass = 'border-[#DC143C]/50';
                         bgClass = 'bg-[#DC143C]/10';
                         iconColor = 'text-[#DC143C]';
                         break;
                       case 'rare':
                         glowClass = 'shadow-[0_0_20px_rgba(34,197,94,0.2)]';
                         borderClass = 'border-[#22C55E]/50';
                         bgClass = 'bg-[#22C55E]/10';
                         iconColor = 'text-[#22C55E]';
                         break;
                       case 'common':
                       default:
                         glowClass = 'shadow-[0_0_15px_rgba(6,182,212,0.1)]';
                         borderClass = 'border-[#06B6D4]/50';
                         bgClass = 'bg-[#06B6D4]/10';
                         iconColor = 'text-[#06B6D4]';
                         break;
                     }
                   } else {
                     glowClass = '';
                     borderClass = 'border-slate-800';
                     bgClass = 'bg-[#161822] opacity-50';
                     iconColor = 'text-slate-600';
                   }

                   return (
                     <div key={ach.id} className={`flex items-center gap-3 p-3 rounded-xl border ${borderClass} ${bgClass} ${glowClass} transition-all hover:bg-opacity-80`}>
                       <div style={hexagonStyle} className={`w-12 h-14 shrink-0 flex items-center justify-center bg-[#0A0C10] border border-current ${iconColor}`}>
                         {React.cloneElement(ach.icon as React.ReactElement<any>, { size: 20 })}
                       </div>
                       <div className="min-w-0">
                         <h4 className={`text-xs font-black uppercase tracking-wide font-orbitron truncate ${ach.unlocked ? 'text-white' : 'text-slate-500'}`}>
                           {ach.name}
                         </h4>
                         <p className="text-[10px] text-slate-400 font-orbitron mt-0.5 line-clamp-2 leading-tight">
                           {ach.description}
                         </p>
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>
          )}

          {/* RECENT ACTIVITY */}
          {user.recentActivity.length > 0 && (
            <div className="space-y-3">
               <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest font-orbitron flex items-center gap-2">
                 <Clock className="w-4 h-4 text-[#06B6D4]" />
                 Recent Activity
               </h3>
               <div className="bg-[#161822] border border-slate-800 rounded-2xl p-2">
                 {user.recentActivity.map((act, i) => (
                   <div key={act.id} className={`flex items-center justify-between p-3 ${i !== user.recentActivity.length -1 ? 'border-b border-slate-800/50' : ''}`}>
                     <div className="flex items-center gap-3">
                       <div className={`w-2 h-2 rounded-full ${act.type === 'xp' ? 'bg-[#FACC15]' : act.type === 'rank' ? 'bg-[#DC143C]' : 'bg-[#06B6D4]'} shadow-[0_0_8px_currentColor]`} />
                       <span className="text-xs font-bold text-white font-orbitron">{act.text}</span>
                     </div>
                     <span className="text-[9px] font-bold text-slate-500 uppercase font-orbitron">{act.date}</span>
                   </div>
                 ))}
               </div>
            </div>
          )}
          
          {/* SOCIAL & TEAM */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
             <div className="flex gap-3">
               {user.socialLinks.discord && <div className="w-8 h-8 rounded-lg bg-[#161822] border border-slate-700 flex items-center justify-center text-slate-400 hover:text-[#06B6D4] hover:border-[#06B6D4] cursor-pointer transition-colors"><Hexagon className="w-4 h-4" /></div>}
               {user.socialLinks.twitch && <div className="w-8 h-8 rounded-lg bg-[#161822] border border-slate-700 flex items-center justify-center text-slate-400 hover:text-[#06B6D4] hover:border-[#06B6D4] cursor-pointer transition-colors"><Twitch className="w-4 h-4" /></div>}
               {user.socialLinks.x && <div className="w-8 h-8 rounded-lg bg-[#161822] border border-slate-700 flex items-center justify-center text-slate-400 hover:text-[#06B6D4] hover:border-[#06B6D4] cursor-pointer transition-colors"><Twitter className="w-4 h-4" /></div>}
             </div>
             {user.team && user.team !== 'None' && (
               <div className="text-right">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-orbitron mb-0.5">Team</p>
                 <p className="text-xs font-bold text-white font-orbitron px-3 py-1 bg-[#161822] rounded-md border border-slate-700">{user.team}</p>
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};
