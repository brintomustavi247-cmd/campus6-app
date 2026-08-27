import React from 'react';
import { Sword, Flame, Shield, Zap, Target, Star, Trophy, Target as TargetIcon, Crosshair, Award } from 'lucide-react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockDate?: string;
}

export interface Goal {
  id: string;
  title: string;
  current: number;
  max: number;
  isCompleted: boolean;
}

export interface Activity {
  id: string;
  type: 'xp' | 'achievement' | 'goal' | 'rank';
  text: string;
  date: string;
}

export interface SocialLinks {
  discord?: string;
  youtube?: string;
  twitch?: string;
  x?: string;
}

export interface EsportsPlayer {
  id: string;
  name: string;
  username: string;
  avatar: string; // URL or Initials
  title: string;
  bio: string;
  motto: string;
  level: number;
  xp: number;
  studyTime: number; // in hours
  nextLevelXp: number;
  rank: number;
  tier: string;
  winRate: string;
  efficiency: string;
  streak: number;
  bestStreak: number;
  totalSessions: number;
  isOnline: boolean;
  isLive?: boolean;
  currentTask?: string;
  sessionStartTime?: number | null;
  _isCurrentUser?: boolean;
  _hasActiveTimer?: boolean;
  _rawDbStudyTime?: number;
  _presenceStatus?: string;
  trend: 'up' | 'down' | 'same';
  joinDate: string;
  country: string;
  division?: string;
  district?: string;
  target?: string;
  achievements: Achievement[];
  goals: Goal[];
  recentActivity: Activity[];
  socialLinks: SocialLinks;
  team: string;
}

