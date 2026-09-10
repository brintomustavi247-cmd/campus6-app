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

export const FriendsView: React.FC<FriendsViewProps> = ({ profile }) => {
  return (
    <div className="w-full h-full animate-in fade-in pb-16">
      <RealtimeGlobalRanking currentUserId={profile.uid || null} />
    </div>
  );
};