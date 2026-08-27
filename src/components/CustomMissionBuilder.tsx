import React, { useState } from 'react';
import { Target, Users, Clock, Send } from 'lucide-react';
import { hscFullSyllabus } from '../data/hscSyllabus';
import { CustomDropdown } from './CustomDropdown';

interface CustomMissionBuilderProps {
  onAddMission: (mission: any) => void;
  onDeployCoopMission: (friendCode: string, mission: any) => void;
  friends: any[];
}

export const CustomMissionBuilder: React.FC<CustomMissionBuilderProps> = ({ onAddMission, onDeployCoopMission, friends }) => {
  const [subject, setSubject] = useState(Object.keys(hscFullSyllabus)[0]);
  const [chapter, setChapter] = useState(hscFullSyllabus[Object.keys(hscFullSyllabus)[0]][0]);
  const [estimatedMins, setEstimatedMins] = useState(45);
  const [mode, setMode] = useState<'solo' | 'coop'>('solo');
  const [selectedFriend, setSelectedFriend] = useState(friends.length > 0 ? friends[0].friendCode : '');

  // Update chapter list when subject changes
  const handleSubjectChange = (newSubject: string) => {
    setSubject(newSubject);
    setChapter(hscFullSyllabus[newSubject][0]);
  };

  const handleDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    const mission = {
      title: `${chapter} (${subject})`,
      subject: subject,
      estimatedMinutes: estimatedMins,
      mode: mode,
    };

    if (mode === 'coop' && selectedFriend) {
      onDeployCoopMission(selectedFriend, mission);
    }
    
    // Always add to my own tasks
    onAddMission(mission);
  };

  return (
    <div className="p-6 rounded-3xl bg-surface border border-border shadow-xl space-y-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-surface-muted border border-border flex items-center justify-center shadow-inner">
          <Target className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h3 className="text-lg font-black text-text-primary tracking-wide uppercase">Deploy Custom Mission</h3>
          <p className="text-[11px] text-text-muted font-medium">Build your personalized study session</p>
        </div>
      </div>

      <form onSubmit={handleDeploy} className="space-y-5 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CustomDropdown 
            label="Select Subject"
            value={subject}
            options={Object.keys(hscFullSyllabus)}
            onChange={handleSubjectChange}
            accentColor="emerald"
          />

          <CustomDropdown 
            label="Select Chapter"
            value={chapter}
            options={hscFullSyllabus[subject] || []}
            onChange={setChapter}
            accentColor="emerald"
          />
        </div>

        {/* Estimated Time Slider */}
        <div className="space-y-3 p-4 rounded-xl bg-surface-muted border border-border">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Time Allocation
            </label>
            <span className="text-sm font-black text-emerald-400 font-mono">{estimatedMins} Mins</span>
          </div>
          <input
            type="range"
            min="15"
            max="180"
            step="15"
            value={estimatedMins}
            onChange={e => setEstimatedMins(Number(e.target.value))}
            className="w-full h-1.5 bg-[#1E2030] rounded-full appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
          />
        </div>

        {/* Study Mode */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Mission Mode</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('solo')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                mode === 'solo' 
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                  : 'bg-surface-muted border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <Target className="w-5 h-5" />
              <span className="text-xs font-bold">Solo Mission</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('coop')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                mode === 'coop' 
                  ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                  : 'bg-surface-muted border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-xs font-bold">Co-op / Friend</span>
            </button>
          </div>
        </div>

        {/* Friend Selector if Coop */}
        {mode === 'coop' && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <CustomDropdown 
              label="Select Squad Member"
              value={selectedFriend ? `${friends.find(f => f.friendCode === selectedFriend)?.displayName} (${selectedFriend})` : ''}
              options={friends.map(f => `${f.displayName} (${f.friendCode})`)}
              onChange={(val) => {
                const match = val.match(/\(([^)]+)\)$/);
                if (match) setSelectedFriend(match[1]);
              }}
              accentColor="blue"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={mode === 'coop' && !selectedFriend}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-black uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          Deploy Mission
        </button>
      </form>
    </div>
  );
};
