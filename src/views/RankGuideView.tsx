import React from 'react';
import { ArrowRight, Trophy } from 'lucide-react';
import { PageId } from '../components/Sidebar';
import { RankBadge } from '../components/RankBadge';

interface RankGuideViewProps {
  onNavigate: (page: PageId) => void;
}


const academicRanks = [
  { id: 1, name: "SPARK", lore: "The first light of knowledge.", color: "text-cyan-400", division: "III, II, I" },
  { id: 2, name: "SCRIBE", lore: "The keeper of knowledge.", color: "text-emerald-400", division: "III, II, I" },
  { id: 3, name: "LUMINARY", lore: "One who carries the light of knowledge.", color: "text-yellow-300", division: "III, II, I" },
  { id: 4, name: "SYNAPTIC", lore: "Where knowledge begins to connect.", color: "text-cyan-500", division: "III, II, I" },
  { id: 5, name: "MINDFORGE", lore: "The mind is forged through discipline.", color: "text-red-500", division: "III, II, I" },
  { id: 6, name: "ASTRAL SCHOLAR", lore: "Knowledge beyond ordinary limits.", color: "text-yellow-500", division: "III, II, I" },
  { id: 7, name: "NEURAL SAGE", lore: "Mastery of learning and cognition.", color: "text-yellow-400", division: "III, II, I" },
  { id: 8, name: "ARCHON", lore: "A master among scholars.", color: "text-red-600", division: "Elite Rank" },
  { id: 9, name: "OMNISAGE", lore: "Vast knowledge. Exceptional mastery.", color: "text-yellow-600", division: "Legendary Rank" },
  { id: 10, name: "TRANSCENDENT", lore: "Beyond the limits of ordinary learning.", color: "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]", division: "Mythic Rank" }
];

const RankGuideView: React.FC<RankGuideViewProps> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-full overflow-x-hidden px-4 sm:px-6 py-6 pb-24 bg-[#0A0C10] min-h-screen text-white">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="w-10 h-10 rounded-full bg-[#161822] border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-[#06B6D4] transition-colors group"
          >
            <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider font-orbitron flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#FACC15]" />
              ACADEMIC EVOLUTION
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-400 font-rajdhani uppercase tracking-widest mt-1">
              Develop your mind. Climb the ranks.
            </p>
          </div>
        </div>
      </header>

      {/* Ranks Grid/List */}
      <div className="max-w-4xl mx-auto space-y-4">
        {academicRanks.map((rank) => (
          <div 
            key={rank.id} 
            className="relative bg-[#1E2030] rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all group"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${rank.color.replace('text-', 'bg-').split(' ')[0]} opacity-70 group-hover:opacity-100 transition-opacity`} />
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
                  <RankBadge rank={rank.name} size={64} animated />
                </div>
                <div>
                  <h3 className={`text-lg sm:text-xl font-black font-lexend uppercase tracking-widest ${rank.color}`}>
                    {rank.name}
                  </h3>
                  <p className="text-sm font-medium text-slate-300 font-rajdhani mt-1">
                    "{rank.lore}"
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-left sm:text-right bg-[#0A0C10] px-4 py-2 rounded-lg border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-orbitron mb-0.5">Divisions</p>
                <p className="text-sm font-black text-white font-orbitron">{rank.division}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankGuideView;
