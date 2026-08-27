import React from 'react';
import { UserProfile, FriendUser } from '../types';
import { RealtimeGlobalRanking } from '../components/squad/RealtimeGlobalRanking';

interface FriendsViewProps {
  profile: UserProfile;
  friends: FriendUser[];
  onAddFriend: (code: string) => void;
  onRemoveFriend: (code: string) => void;
  onAddToast: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
}

/**
 * Ranking screen — শুধু leaderboard, friend-list block নেই
 * (App.tsx থেকে props এসেই থাক, interface রাখা হয়েছে যাতে App না ভাঙে)
 */
export const FriendsView: React.FC<FriendsViewProps> = ({ profile }) => {
  return (
    <div className="w-full h-full animate-in fade-in pb-16">
      <RealtimeGlobalRanking currentUserId={profile.uid || null} />
    </div>
  );
};