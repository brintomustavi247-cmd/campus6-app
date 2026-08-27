const fs = require('fs');

let code = fs.readFileSync('src/views/ProfilePremiumView.tsx', 'utf8');

// Replace imports to include useEffect, useState and firebase
code = code.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport { doc, onSnapshot } from 'firebase/firestore';\nimport { db, auth } from '../firebase';\nimport { UserDocument } from '../services/db';"
);

// We'll replace the main component body
const targetBodyStart = `export const ProfilePremiumView: React.FC<ProfilePremiumViewProps> = ({ profile, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'achievements'>('overview');

  return (`;

const newBodyStart = `export const ProfilePremiumView: React.FC<ProfilePremiumViewProps> = ({ profile, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'achievements'>('overview');
  const [dbUser, setDbUser] = useState<UserDocument | null>(null);

  useEffect(() => {
    if (!auth?.currentUser || !db) return;
    const unsub = onSnapshot(doc(db, 'users', auth.currentUser.uid), (snap) => {
      if (snap.exists()) {
        setDbUser(snap.data() as UserDocument);
      }
    });
    return () => unsub();
  }, []);

  const xp = dbUser?.xp || 0;
  const level = dbUser?.level || 1;
  const tier = dbUser?.tier || 'BRONZE I';
  const studyHours = Math.floor((dbUser?.studyTime || 0) / 60);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">`;

code = code.replace(targetBodyStart, newBodyStart);

// We need to replace hardcoded values
code = code.replace(
  `<h3 className="p-rank-title text-2xl sm:text-3xl md:text-4xl font-bold break-words whitespace-normal tracking-tight">⚡ MINDFORGE II</h3>`,
  `<h3 className="p-rank-title text-2xl sm:text-3xl md:text-4xl font-bold break-words whitespace-normal tracking-tight">⚡ {tier}</h3>`
);
code = code.replace(
  `<RankBadge rank="MINDFORGE II" size={80} animated />`,
  `<RankBadge rank={tier} size={80} animated />`
);
code = code.replace(
  `<span>LEVEL 82</span>`,
  `<span>LEVEL {level}</span>`
);
code = code.replace(
  `<span className="text-gold">14,250 / 15,000 RP</span>`,
  `<span className="text-gold">{xp} / {level * 500} RP</span>`
);

code = code.replace(
  `<span className="p-balance-num">14,250</span>`,
  `<span className="p-balance-num">{xp}</span>`
);
code = code.replace(
  `<span className="text-[10px] font-mono text-gold">100/100</span>`,
  `<span className="text-[10px] font-mono text-gold">{studyHours}/100</span>`
);
code = code.replace(
  `<span className="text-xs font-bold text-text-primary flex-1">Log 100 Hours</span>`,
  `<span className="text-xs font-bold text-text-primary flex-1">Log 100 Hours (\${studyHours}h)</span>`
);

// We need to replace the grid layout for the "Content" tabs overview section.
// The prompt said: "Use CSS Grid for larger screens: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6. Keep the Avatar/Hero section spanning full width, but organize the stats cards (Earnings, Consistency, Focus Score) neatly into the grid so they don't stretch unnaturally."
// Let's replace the overview tab content.
const oldOverview = `<div className="p-balance w-full">
              <p className="p-balance-label">TOTAL EARNINGS (RP)</p>
              <div className="p-balance-row">
                <span className="p-balance-num">14,250</span>
                <span className="p-balance-unit">RP</span>
              </div>
              <div className="p-balance-actions">
                <button className="p-btn p-btn-primary">
                  CLAIM REWARDS
                </button>
                <button className="p-btn-icon">
                  <Flame className="w-5 h-5 text-gold" />
                </button>
              </div>
            </div>

            <div className="p-stats grid grid-cols-2 gap-3 sm:gap-4 mb-4 w-full">
              <div className="p-stat">
                <p className="p-stat-label">CONSISTENCY (%)</p>
                <p className="p-stat-value accent">
                  68.4<span className="p-stat-suffix">%</span>
                </p>
              </div>
              <div className="p-stat">
                <p className="p-stat-label">FOCUS SCORE</p>
                <p className="p-stat-value">
                  2.45
                </p>
              </div>
            </div>`;

const newOverview = `<div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
              <div className="p-balance w-full">
                <p className="p-balance-label">TOTAL EARNINGS (RP)</p>
                <div className="p-balance-row">
                  <span className="p-balance-num">{xp}</span>
                  <span className="p-balance-unit">RP</span>
                </div>
                <div className="p-balance-actions">
                  <button className="p-btn p-btn-primary">
                    CLAIM REWARDS
                  </button>
                  <button className="p-btn-icon">
                    <Flame className="w-5 h-5 text-gold" />
                  </button>
                </div>
              </div>
              <div className="p-stat h-full flex flex-col justify-center">
                <p className="p-stat-label">CONSISTENCY (%)</p>
                <p className="p-stat-value accent">
                  68.4<span className="p-stat-suffix">%</span>
                </p>
              </div>
              <div className="p-stat h-full flex flex-col justify-center">
                <p className="p-stat-label">FOCUS SCORE</p>
                <p className="p-stat-value">
                  {studyHours > 10 ? '4.85' : '2.45'}
                </p>
              </div>
            </div>`;

code = code.replace(oldOverview, newOverview);

// Also remove `className="profile-premium"` and use layout wrapping from start
code = code.replace(
  `<div className="profile-premium pb-20">`,
  `<div className="profile-premium pb-20 max-w-5xl mx-auto">`
);

fs.writeFileSync('src/views/ProfilePremiumView.tsx', code);
