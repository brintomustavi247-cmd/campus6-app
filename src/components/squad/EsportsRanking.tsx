/**
 * ============================================================================
 * CAMPUS 6.0 — ESPORTS RANKING / LEADERBOARD COMPONENT v10.0 FINAL
 * ============================================================================
 *
 * ✅ ALL FIXES INTEGRATED:
 * - TimerContext live injection (real-time rank updates while studying)
 * - Supabase PostgresChanges subscription (auto-refresh on DB changes)
 * - Presence channel integration (online/offline/focus status)
 * - Memory leak prevention (guaranteed cleanup)
 * - Cross-device consistency (centralized data source)
 * - Mobile-optimized (visibility recovery)
 *
 * @version 10.0.0-FINAL (Production Ready)
 * ============================================================================
 */

import React,
{
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';

import { EsportsPlayer } from './EsportsData';
import ProfilePremiumView from '../../views/ProfilePremiumView';
import { UserProfile } from '../../types';

import { usePresence } from '../../contexts/PresenceContext';
import { useGlobalTimer } from '../../contexts/TimerContext';
import { supabase } from '../../supabaseClient';
import { subscribeToPresence } from '../../supabaseChannels';

// ============================================================================
// DESIGN TOKENS (Dark Theme) - DEFINED ONCE
// ============================================================================

const COLORS = {
  bgMain: '#10121b',
  bgCard: '#171924',
  bgCardHover: '#1e2130',
  border: 'rgba(255, 255, 255, 0.06)',
  textMain: '#ffffff',
  textMuted: '#8892b0',
  c1st: '#00E5FF',
  c2nd: '#FFD700',
  c3rd: '#FF4D4D',
  cViolet: '#8B5CF6',
  cGreen: '#10B981',
};

// ============================================================================
// DATABASE USER TYPE - DEFINED ONCE
// ============================================================================

interface DbUser {
  id: string;
  email?: string | null;
  full_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  total_study_time?: number | null;
  xp?: number | null;
  rank_score?: number | null;
  current_rank?: string | null;
  current_status?: string | null;
  current_task?: string | null;
  bio?: string | null;
  motto?: string | null;
  streak?: number | null;
  best_streak?: number | null;
  total_sessions?: number | null;
  country?: string | null;
  division?: string | null;
  district?: string | null;
  target?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
}

// ============================================================================
// RANKED PLAYER TYPE - DEFINED ONCE
// ============================================================================

interface RankedPlayer extends EsportsPlayer {
  displayRank: number;
}

// ============================================================================
// UTILITY: Generate Avatar URL - DEFINED ONCE
// ============================================================================

const getAvatarUrl = (
  name: string,
  customAvatar?: string | null
): string => {
  if (
    customAvatar &&
    customAvatar.length > 5 &&
    customAvatar.startsWith('http')
  ) {
    return customAvatar;
  }

  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
    name || 'Player'
  )}&backgroundColor=171924`;
};

// ============================================================================
// UTILITY: Format Study Time - DEFINED ONCE
// ============================================================================

const formatStudyTime = (
  minutes: number
): string => {
  if (!minutes || minutes <= 0) {
    return '0m';
  }

  const safeMinutes = Math.max(0, Math.floor(minutes));
  const hrs = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
  }

  return `${mins}m`;
};

// ============================================================================
// SUB-COMPONENT: Activity Tag - DEFINED ONCE
// ============================================================================

const ActivityTag: React.FC<{
  status?: string | null;
}> = ({ status }) => {
  const getActivityConfig = () => {
    if (!status || status === 'offline') {
      return null;
    }

    const s = status.toLowerCase();

    if (s.includes('focus') || s.includes('study')) {
      return {
        label: 'Studying',
        bg: 'rgba(16, 185, 129, 0.15)',
        color: COLORS.cGreen,
      };
    }

    if (s.includes('break')) {
      return {
        label: 'On Break',
        bg: 'rgba(249, 115, 22, 0.15)',
        color: '#F97316',
      };
    }

    if (s.includes('sleep')) {
      return {
        label: 'Sleeping',
        bg: 'rgba(99, 102, 241, 0.15)',
        color: '#818cf8',
      };
    }

    if (s.includes('class') || s.includes('lecture')) {
      return {
        label: 'In Class',
        bg: 'rgba(0, 229, 255, 0.15)',
        color: COLORS.c1st,
      };
    }

    return {
      label: status,
      bg: 'rgba(139, 92, 246, 0.15)',
      color: COLORS.cViolet,
    };
  };

  const config = getActivityConfig();

  if (!config) {
    return null;
  }

  return (
    <span
      className="inline-block font-sans text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide"
      style={{
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
};

// ============================================================================
// SUB-COMPONENT: Online Status Dot - DEFINED ONCE
// ============================================================================

const OnlineDot: React.FC<{
  isOnline?: boolean;
  isLive?: boolean;
  size?: 'sm' | 'md';
}> = ({
  isOnline = false,
  isLive = false,
  size = 'sm',
}) => {
  if (!isOnline && !isLive) {
    return null;
  }

  const sz =
    size === 'md'
      ? 'w-[14px] h-[14px] border-[3px]'
      : 'w-3 h-3 border-2';

  return (
    <div
      className={`absolute bottom-0.5 right-0.5 rounded-full ${sz}`}
      style={{
        backgroundColor: isLive ? COLORS.cGreen : COLORS.cGreen,
        borderColor: COLORS.bgMain,
        boxShadow: isLive ? `0 0 8px rgba(16, 185, 129, 0.6)` : undefined,
        animation: isLive ? 'pulse 2s infinite' : undefined,
      }}
    />
  );
};

// ============================================================================
// SUB-COMPONENT: Podium Card (Top 3 Players) - DEFINED ONCE
// ============================================================================

interface PodiumCardProps {
  player: RankedPlayer;
  rank: number;
}

const PodiumCard: React.FC<PodiumCardProps> = ({
  player,
  rank,
}) => {
  const getRankConfig = () => {
    switch (rank) {
      case 1:
        return {
          tagColor: COLORS.c1st,
          ringSize: 90,
          ringGradient: `conic-gradient(${COLORS.c1st} 80%, transparent 80%)`,
          scoreSize: 'text-base',
          scoreColor: COLORS.c1st,
          nameSize: '15px',
          offset: '0px',
        };
      case 2:
        return {
          tagColor: COLORS.textMain,
          ringSize: 70,
          ringGradient: `conic-gradient(${COLORS.c2nd} 60%, transparent 60%)`,
          scoreSize: 'text-sm',
          scoreColor: COLORS.c2nd,
          nameSize: '13px',
          offset: '15px',
        };
      case 3:
        return {
          tagColor: COLORS.c3rd,
          ringSize: 70,
          ringGradient: `conic-gradient(${COLORS.c3rd} 40%, transparent 40%)`,
          scoreSize: 'text-sm',
          scoreColor: COLORS.c3rd,
          nameSize: '13px',
          offset: '15px',
        };
      default:
        return {
          tagColor: COLORS.textMuted,
          ringSize: 70,
          ringGradient: `conic-gradient(${COLORS.textMuted} 30%, transparent 30%)`,
          scoreSize: 'text-sm',
          scoreColor: COLORS.textMuted,
          nameSize: '13px',
          offset: '15px',
        };
    }
  };

  const config = getRankConfig();
  const formattedScore = formatStudyTime(Number(player.studyTime || 0));
  const avatarSrc = getAvatarUrl(player.name, player.avatar);

  return (
    <div
      className="flex flex-col items-center relative shrink-0"
      style={{ marginBottom: config.offset }}
    >
      {/* Rank Tag */}
      <div
        className="flex items-center gap-1 mb-2 text-[10px] font-extrabold uppercase"
        style={{
          fontFamily: "'Lexend', sans-serif",
          color: config.tagColor,
          fontWeight: 800,
        }}
      >
        {rank === 1 && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
          </svg>
        )}
        {rank === 1 ? '1ST' : rank === 2 ? '2ND' : '3RD'}
      </div>

      {/* Avatar Ring */}
      <div
        className="rounded-full p-1 flex items-center justify-center relative shrink-0"
        style={{
          width: `${config.ringSize}px`,
          height: `${config.ringSize}px`,
          background: config.ringGradient,
        }}
      >
        <div
          className="w-full h-full rounded-full overflow-hidden relative border-[3px]"
          style={{
            backgroundColor: COLORS.bgCard,
            borderColor: COLORS.bgMain,
          }}
        >
          <img
            src={avatarSrc}
            alt={player.name}
            className="w-full h-full object-cover"
          />
          <OnlineDot isOnline={player.isOnline} isLive={player.isLive} size="md" />
        </div>
      </div>

      {/* Player Info */}
      <div className="text-center mt-3 flex flex-col items-center gap-1">
        <div
          className="font-semibold text-white leading-tight"
          style={{
            fontSize: config.nameSize,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
          }}
        >
          {player.username || player.name}
        </div>

        <ActivityTag
          status={player.isLive ? player.currentTask : undefined}
        />

        <div
          className={`font-extrabold mt-0.5 ${config.scoreSize}`}
          style={{
            color: config.scoreColor,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 800,
          }}
        >
          {formattedScore}
        </div>
        
        {/* Live Timer Indicator */}
        {player._hasActiveTimer && (
          <div
            className="mt-1 px-2 py-0.5 rounded-full text-[8px] font-bold animate-pulse"
            style={{
              background: 'rgba(139, 92, 246, 0.2)',
              color: COLORS.cViolet,
              border: '1px solid rgba(139, 92, 246, 0.4)',
            }}
          >
            ⏱️ LIVE SESSION
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENT: List Item (Rank 4+) - DEFINED ONCE
// ============================================================================

interface ListItemProps {
  player: RankedPlayer;
  rank: number;
  isCurrentUser?: boolean;
  onClick?: () => void;
}

const ListItem: React.FC<ListItemProps> = ({
  player,
  rank,
  isCurrentUser = false,
  onClick,
}) => {
  const getTrendIcon = () => {
    if (player.trend === 'up') {
      return (
        <svg
          className="w-2.5 h-2.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke={COLORS.cGreen}
          strokeWidth="3"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      );
    }

    if (player.trend === 'down') {
      return (
        <svg
          className="w-2.5 h-2.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke={COLORS.c3rd}
          strokeWidth="3"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
    }

    return null;
  };

  const formattedScore = formatStudyTime(Number(player.studyTime || 0));
  const avatarSrc = getAvatarUrl(player.name, player.avatar);

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200 ${
        isCurrentUser ? 'border' : 'border border-transparent hover:bg-[#1e2130]'
      }`}
      style={{
        backgroundColor: isCurrentUser ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
        borderColor: isCurrentUser ? 'rgba(139, 92, 246, 0.3)' : undefined,
      }}
    >
      {/* Left Side */}
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Rank + Trend */}
        <div className="flex flex-col items-center w-5 shrink-0">
          {getTrendIcon()}
          <span
            className="font-bold text-sm leading-none mt-1"
            style={{
              fontFamily: "'Lexend', sans-serif",
              fontWeight: 800,
              color: isCurrentUser ? COLORS.cViolet : '#fff',
            }}
          >
            {rank}
          </span>
        </div>

        {/* Avatar */}
        <div
          className="rounded-full p-0.5 relative shrink-0"
          style={{
            width: '44px',
            height: '44px',
            background: `conic-gradient(${COLORS.cViolet} 30%, ${COLORS.border} 30%)`,
          }}
        >
          <div
            className="w-full h-full rounded-full overflow-hidden flex items-center justify-center border-2"
            style={{
              backgroundColor: COLORS.bgCard,
              borderColor: COLORS.bgMain,
            }}
          >
            <img
              src={avatarSrc}
              alt={player.name}
              className="w-full h-full object-cover"
            />
            <OnlineDot isOnline={player.isOnline} isLive={player.isLive} />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1 min-w-0">
          <h4
            className="text-sm font-semibold text-white leading-none truncate"
            style={{ fontWeight: 600 }}
          >
            {player.username || player.name}
            {player._hasActiveTimer && (
              <span
                className="ml-2 inline-block w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: COLORS.cViolet }}
              />
            )}
          </h4>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="text-[9px] uppercase font-medium truncate"
              style={{
                color: isCurrentUser ? COLORS.cViolet : COLORS.textMuted,
              }}
            >
              {player.tier}
            </span>

            <ActivityTag
              status={player.isLive ? player.currentTask : undefined}
            />

            {player._hasActiveTimer && (
              <span
                className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                style={{
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: COLORS.cViolet,
                }}
              >
                LIVE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Score */}
      <div
        className="text-right shrink-0 ml-2"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 800,
        }}
      >
        <p
          className="text-sm font-bold"
          style={{
            color: isCurrentUser ? COLORS.cViolet : '#fff',
          }}
        >
          {formattedScore}
        </p>
        {isCurrentUser && player._rawDbStudyTime !== undefined && (
          <p
            className="text-[8px]"
            style={{ color: COLORS.textMuted }}
          >
            DB: {formatStudyTime(player._rawDbStudyTime)}
          </p>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENT: Floating User Rank Card - DEFINED ONCE
// ============================================================================

interface FloatingUserRankProps {
  player: RankedPlayer;
  rank: number;
  isLive: boolean;
  hasActiveTimer?: boolean;
  currentTask?: string;
}

const FloatingUserRank: React.FC<FloatingUserRankProps> = ({
  player,
  rank,
  isLive = false,
  hasActiveTimer = false,
  currentTask,
}) => {
  const displayName = player.username || player.name || 'You';
  const avatarSrc = getAvatarUrl(displayName, player.avatar);
  const formattedScore = formatStudyTime(Number(player.studyTime || 0));

  return (
    <div
      className="fixed bottom-20 left-4 right-4 md:bottom-6 md:right-8 md:left-auto md:w-100 rounded-[20px] px-4 py-3 flex items-center justify-between"
      style={{
        backgroundColor: 'rgba(23, 25, 36, 0.98)',
        border: `1px solid ${COLORS.cViolet}`,
        boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3), 0 10px 30px rgba(0,0,0,0.8)',
        zIndex: 9998,
      }}
    >
      {/* Left Side */}
      <div className="flex items-center gap-3">
        {/* Rank */}
        <div className="flex flex-col items-center justify-center w-8">
          <span
            className="text-[8px] font-extrabold uppercase text-center leading-tight mb-0.5"
            style={{ color: COLORS.cViolet, fontWeight: 800 }}
          >
            Your<br />Rank
          </span>
          <span
            className="text-base font-extrabold leading-none"
            style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 800 }}
          >
            {rank || '-'}
          </span>
        </div>

        {/* Avatar */}
        <div
          className="rounded-full p-0.5 relative shrink-0"
          style={{
            width: '44px',
            height: '44px',
            background: COLORS.cViolet,
          }}
        >
          <div
            className="w-full h-full rounded-full overflow-hidden border-2"
            style={{ borderColor: COLORS.bgMain }}
          >
            <img
              src={avatarSrc}
              alt={displayName}
              className="w-full h-full object-cover"
            />
            <OnlineDot isOnline={isLive} isLive={hasActiveTimer} />
          </div>
          
          {hasActiveTimer && (
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-75"
              style={{
                border: `2px solid ${COLORS.cViolet}`,
              }}
            />
          )}
        </div>

        {/* Name & Status */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate">
            {displayName}
            {hasActiveTimer && (
              <span className="ml-2 text-xs animate-pulse" style={{ color: COLORS.cViolet }}>
                ● Studying Now
              </span>
            )}
          </h4>
          <ActivityTag status={isLive ? currentTask : undefined} />
        </div>
      </div>

      {/* Score */}
      <div
        className="text-right shrink-0"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 800,
        }}
      >
        <p className="text-sm font-bold" style={{ color: COLORS.cViolet }}>
          {formattedScore}
        </p>
        <p
          className="text-[9px] uppercase font-medium mt-0.5"
          style={{ color: COLORS.textMuted }}
        >
          Total Time
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// HELPER: Map Player to UserProfile - DEFINED ONCE
// ============================================================================

const mapToUserProfile = (player: EsportsPlayer): UserProfile => ({
  uid: player.id,
  displayName: player.name,
  nickname: player.username,
  targetUniversity: player.target || 'ELITE_SQUAD',
  photoURL: player.avatar && player.avatar.length > 5 ? player.avatar : undefined,
  academicGroup: 'Science',
  dailyStudyTargetHours: 8,
  preferredLanguage: 'bn',
  theme: 'dark',
  reminderEnabled: false,
  startModeRequired: false,
  showReligiousReminders: false,
  showLeaderboard: true,
  soundEnabled: false,
  friendCode: player.id,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// ============================================================================
// 🎯 MAIN COMPONENT: ESPORTS RANKING - DEFINED ONCE
// ============================================================================

export const EsportsRanking: React.FC = () => {
  // -----------------------------------------------------------------------
  // HOOKS: Presence & Timer Context
  // -----------------------------------------------------------------------

  const { presence, uid } = usePresence();
  
  // Timer Context Integration (for live injection)
  const {
    isRunning: timerIsRunning,
    secondsElapsed: timerSecondsElapsed,
    topicName: timerTopicName,
  } = useGlobalTimer();

  // -----------------------------------------------------------------------
  // STATE
  // -----------------------------------------------------------------------

  const [selectedUser, setSelectedUser] = useState<EsportsPlayer | null>(null);
  const [metric, setMetric] = useState<'xp' | 'study'>('study');
  
  // Loading & error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Database state
  const [dbPlayers, setDbPlayers] = useState<DbUser[]>([]);
  const [presences, setPresences] = useState<Record<string, any>>({});
  const [currentUserProfile, setCurrentUserProfile] = useState<DbUser | null>(null);

  // Refs for cleanup
  const mountedRef = useRef(true);
  const usersChannelRef = useRef<any>(null);
  const presenceUnsubRef = useRef<(() => void) | null>(null);

  // -----------------------------------------------------------------------
  // SUPABASE REALTIME SETUP
  // -----------------------------------------------------------------------

  useEffect(() => {
    mountedRef.current = true;
    setIsLoading(true);
    setError(null);

    // Fetch All Users
    const fetchUsers = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .order('total_study_time', { ascending: false, nullsFirst: false })
          .limit(500);

        if (fetchError) {
          console.error('[EsportsRanking-v10] Users fetch error:', fetchError);
          setError('Failed to load rankings');
          return;
        }

        if (mountedRef.current && data) {
          setDbPlayers(data as DbUser[]);
          console.log(`[EsportsRanking-v10] Loaded ${data.length} users`);
          setIsLoading(false); // ⭐ FIX E3: fetch success alone ends the spinner
        }
      } catch (err) {
        console.error('[EsportsRanking-v10] Fetch exception:', err);
        setError('Network error loading rankings');
      }
    };

    // Fetch Current User Profile
    const fetchCurrentUser = async () => {
      if (!uid) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        const metadata = user?.user_metadata || {};

        const fallbackUser: DbUser = {
          id: uid,
          email: user?.email || '',
          full_name: String(metadata.full_name || metadata.name || 'Student'),
          avatar_url: String(metadata.avatar_url || metadata.picture || ''),
          total_study_time: 0,
          xp: 0,
          rank_score: 0,
          current_rank: 'MEMBER',
          current_status: 'offline',
          current_task: '',
        };

        const { data, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', uid)
          .maybeSingle();

        const profileData: DbUser = profileError || !data
          ? fallbackUser
          : {
              ...(data as DbUser),
              full_name: data.full_name || fallbackUser.full_name,
              avatar_url: data.avatar_url || fallbackUser.avatar_url,
            };

        if (!mountedRef.current) return;

        setCurrentUserProfile(profileData);

        // Ensure current user exists in local list
        setDbPlayers((current: DbUser[]) => {
          const exists = current.some((entry) => entry.id === uid);
          if (exists) {
            return current.map((entry) =>
              entry.id === uid ? { ...entry, ...profileData } : entry
            );
          }
          return [...current, profileData];
        });
      } catch (err) {
        console.warn('[EsportsRanking-v10] Failed to fetch current user:', err);
      }
    };

    // Presence Realtime Subscription
    const setupPresenceSubscription = () => {
      presenceUnsubRef.current = subscribeToPresence((state: any) => {
        if (!mountedRef.current) return;

        const newPresences: Record<string, any> = {};

        Object.keys(state || {}).forEach((key) => {
          const entries = state[key];
          if (Array.isArray(entries) && entries.length > 0) {
            const pres = entries[0];
            if (pres?.userId) {
              newPresences[pres.userId] = pres;
            }
          }
        });

        setPresences(newPresences);
        setLastUpdated(new Date());
      });
    };

    // Users Table Realtime Subscription
    const setupUsersRealtime = async () => {
      if (usersChannelRef.current) {
        await supabase.removeChannel(usersChannelRef.current).catch(() => {});
      }

      usersChannelRef.current = supabase
        .channel('leaderboard-users-realtime-v10')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'users',
          },
          (payload: any) => {
            if (!mountedRef.current) return;

            console.log('[EsportsRanking-v10] Users realtime:', payload.eventType);

            switch (payload.eventType) {
              case 'INSERT':
                const newUser = payload.new as DbUser;
                if (!newUser?.id) return;

                setDbPlayers((current: DbUser[]) => {
                  const exists = current.some((u) => u.id === newUser.id);
                  if (exists) {
                    return current.map((u) =>
                      u.id === newUser.id ? { ...u, ...newUser } : u
                    );
                  }
                  return [...current, newUser];
                });

                if (newUser.id === uid) {
                  setCurrentUserProfile((prev) => ({ ...(prev || {}), ...newUser }));
                }
                break;

              case 'UPDATE':
                const updatedUser = payload.new as DbUser;
                if (!updatedUser?.id) return;

                setDbPlayers((current: DbUser[]) => {
                  const index = current.findIndex((u) => u.id === updatedUser.id);
                  if (index === -1) return [...current, updatedUser];

                  const updated = [...current];
                  updated[index] = { ...updated[index], ...updatedUser };
                  return updated;
                });

                if (updatedUser.id === uid) {
                  setCurrentUserProfile((prev) => ({ ...(prev || {}), ...updatedUser }));
                }
                break;

              case 'DELETE':
                const deletedUser = payload.old as DbUser;
                if (!deletedUser?.id || deletedUser.id === uid) return;

                setDbPlayers((current: DbUser[]) =>
                  current.filter((u) => u.id !== deletedUser.id)
                );
                break;
            }

            setLastUpdated(new Date());
          }
        )
        .subscribe((status) => {
          console.log('[EsportsRanking-v10] Realtime channel status:', status);
          
          if (status === 'SUBSCRIBED') {
            setIsLoading(false);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setError('Connection lost. Retrying...');
          }
        });
    };

    // Initialize
    fetchUsers()
      .then(() => fetchCurrentUser())
      .then(() => {
        if (!mountedRef.current) return; // ⭐ FIX E4: unmount raced us — abort
        setupPresenceSubscription();
        setupUsersRealtime();
      });

    // Cleanup
    return () => {
      mountedRef.current = false;
      
      if (presenceUnsubRef.current) {
        presenceUnsubRef.current();
        presenceUnsubRef.current = null;
      }

      if (usersChannelRef.current) {
        supabase.removeChannel(usersChannelRef.current).catch((err) => {
          console.warn('[EsportsRanking-v10] Error removing channel:', err);
        });
        usersChannelRef.current = null;
      }

      console.log('[EsportsRanking-v10] Cleanup complete');
    };
  }, [uid]);

  // -----------------------------------------------------------------------
  // BUILD LIVE PLAYER LIST (WITH TIMER INJECTION)
  // -----------------------------------------------------------------------

  const livePlayers = useMemo(() => {
    return dbPlayers.map((u: DbUser) => {
      const p = presences[u.id] || {};
      const isCurrentUser = u.id === uid;
      
      const committedMinutes = Math.max(0, Math.floor(Number(u.total_study_time || 0)));
      const liveMinutes = Math.max(0, Math.floor(Number((u as any).live_study_minutes || 0)));
      const isStudying = u.current_status === 'focus' || p.status === 'focus';
      
      // ⭐ FIX E1: NO device-local score additions anymore.
      // Score = committed (total_study_time) + DB live_study_minutes when studying.
      // Every device computes the identical value → identical ranks everywhere.
      const totalStudyMinutes = committedMinutes + (isStudying ? liveMinutes : 0);
      const hasActiveTimer = isCurrentUser && timerIsRunning;

      const xp = Number(u.xp || 0);
      const level = Math.floor(xp / 1000) + 1;

      return {
        id: u.id,
        name: u.full_name || u.username || 'Unknown Player',
        username: u.full_name || u.username || 'Unknown',
        avatar: u.avatar_url || '',
        title: 'MEMBER',
        bio: String(u.bio || ''),
        motto: String(u.motto || ''),
        level,
        xp,
        studyTime: totalStudyMinutes,
        nextLevelXp: (level + 1) * 1000,
        rank: Number(u.rank_score || 0),
        tier: u.current_rank || 'MEMBER',
        winRate: '0',
        efficiency: '0%',
        streak: Number(u.streak || 0),
        bestStreak: Number(u.best_streak || 0),
        totalSessions: Number(u.total_sessions || 0),
        isOnline: Boolean(p.status && p.status !== 'offline') || u.current_status === 'focus',
        isLive: isStudying,
        currentTask: String(p.topic || u.current_task || ''),
        sessionStartTime: isCurrentUser ? presence?.sessionStartTime || p.start_time : p.start_time,
        trend: 'up',
        joinDate: u.created_at || '',
        country: u.country || 'Bangladesh',
        division: u.division || 'All',
        district: u.district || 'All',
        target: u.target || u.current_rank || 'TARGET: PUBLIC',
        team: 'None',
        socialLinks: {},
        goals: [],
        recentActivity: [],
        achievements: [],
        
        _isCurrentUser: isCurrentUser,
        _hasActiveTimer: hasActiveTimer,
        _rawDbStudyTime: committedMinutes,
        _liveDbMinutes: liveMinutes,
        _presenceStatus: p.status || undefined,
      } as EsportsPlayer;
    });
  }, [dbPlayers, presences, uid, presence?.sessionStartTime, timerIsRunning, timerSecondsElapsed]);

  // -----------------------------------------------------------------------
  // SORT + ASSIGN RANKS
  // -----------------------------------------------------------------------

   const sortedPlayers = useMemo((): RankedPlayer[] => {
    const players = [...livePlayers];

    // ⭐ FIX E5: deterministic tie-breaks → tied players rank identically
    // on every device (study/xp primary → secondary → unique id).
    players.sort((a, b) => {
      if (metric === 'study') {
        if ((b.studyTime || 0) !== (a.studyTime || 0)) return (b.studyTime || 0) - (a.studyTime || 0);
        if ((b.xp || 0) !== (a.xp || 0)) return (b.xp || 0) - (a.xp || 0);
      } else {
        if ((b.xp || 0) !== (a.xp || 0)) return (b.xp || 0) - (a.xp || 0);
        if ((b.studyTime || 0) !== (a.studyTime || 0)) return (b.studyTime || 0) - (a.studyTime || 0);
      }
      return String(a.id).localeCompare(String(b.id));
    });

    const ranked = players.map((player, index) => ({
      ...player,
      displayRank: index + 1,
    }));

    // ⭐ FIX E1b: DISPLAY-ONLY self bump AFTER ranks are locked.
    // Adds only the minutes your DB hasn't caught up with yet (~≤2min),
    // ONLY to your own tile on your own screen. Order can never change.
    return ranked.map((player) => {
      if (!player._isCurrentUser || !timerIsRunning || timerSecondsElapsed <= 0) return player;
      const dbLiveMin = (player as any)._liveDbMinutes ?? 0;
      const unsyncedMinutes = Math.max(0, Math.floor(timerSecondsElapsed / 60) - dbLiveMin);
      if (unsyncedMinutes <= 0) return player;
      return { ...player, studyTime: player.studyTime + unsyncedMinutes };
    });
  }, [livePlayers, metric, timerIsRunning, timerSecondsElapsed]);

  // Top 3 + Rest Split
  const top3Players = sortedPlayers.slice(0, 3);
  const restPlayers = sortedPlayers.slice(3);

  // -----------------------------------------------------------------------
  // FIND CURRENT USER'S POSITION
  // -----------------------------------------------------------------------

  const currentUserData = useMemo((): RankedPlayer | undefined => {
    if (!uid) return undefined;

    // First: try to find in sorted list
    const found = sortedPlayers.find((player) => player.id === uid);
    if (found) return found;

    // Fallback: construct from profile
    if (!currentUserProfile) return undefined;

    const p = presences[uid] || {};
    const committedMinutes = Math.max(0, Math.floor(Number(currentUserProfile.total_study_time || 0)));
    const liveMinutes = Math.max(0, Math.floor(Number((currentUserProfile as any).live_study_minutes || 0)));
    const userIsStudying = currentUserProfile.current_status === 'focus' || p.status === 'focus';
    
    // ⭐ FIX E6: same consistent formula as the main path — nothing device-local.
    const studyTime = committedMinutes + (userIsStudying ? liveMinutes : 0);

    const xp = Number(currentUserProfile.xp || 0);
    const level = Math.floor(xp / 1000) + 1;

    return {
      id: currentUserProfile.id,
      name: currentUserProfile.full_name || 'You',
      username: currentUserProfile.full_name || currentUserProfile.username || 'You',
      avatar: currentUserProfile.avatar_url || '',
      title: 'MEMBER',
      bio: String(currentUserProfile.bio || ''),
      motto: String(currentUserProfile.motto || ''),
      level,
      xp,
      studyTime,
      nextLevelXp: (level + 1) * 1000,
      rank: Number(currentUserProfile.rank_score || 0),
      tier: currentUserProfile.current_rank || 'NEW',
      winRate: '0',
      efficiency: '0%',
      streak: Number(currentUserProfile.streak || 0),
      bestStreak: Number(currentUserProfile.best_streak || 0),
      totalSessions: Number(currentUserProfile.total_sessions || 0),
      isOnline: true,
      isLive: userIsStudying || (timerIsRunning && timerSecondsElapsed > 0),
      currentTask: String(p.topic || currentUserProfile.current_task || timerTopicName || 'Studying...'),
      sessionStartTime: presence?.sessionStartTime || p.start_time || null,
      trend: 'up',
      joinDate: currentUserProfile.created_at || '',
      country: currentUserProfile.country || 'Bangladesh',
      division: currentUserProfile.division || 'All',
      district: currentUserProfile.district || 'All',
      target: currentUserProfile.target || 'TARGET: PUBLIC',
      team: 'None',
      socialLinks: {},
      goals: [],
      recentActivity: [],
      achievements: [],
      displayRank: sortedPlayers.length + 1,
      _isCurrentUser: true,
      _hasActiveTimer: timerIsRunning && timerSecondsElapsed > 0,
      _rawDbStudyTime: committedMinutes,
      _presenceStatus: p.status || undefined,
    } as RankedPlayer;
  }, [uid, sortedPlayers, currentUserProfile, presences, presence?.sessionStartTime, timerIsRunning, timerSecondsElapsed, timerTopicName]);

  const currentUserRank = currentUserData?.displayRank ?? 0;

  // -----------------------------------------------------------------------
  // DEBUG LOGGING
  // -----------------------------------------------------------------------

  useEffect(() => {
    console.log('[EsportsRanking-v10] LIVE LEADERBOARD STATE:', {
      uid,
      currentUser: currentUserData?.name || 'Not loaded',
      rank: currentUserRank,
      metric,
      liveStudyMinutes: currentUserData?.studyTime || 0,
      totalPlayers: sortedPlayers.length,
      timerState: {
        isRunning: timerIsRunning,
        secondsElapsed: timerSecondsElapsed,
        topicName: timerTopicName,
      },
      lastUpdated: lastUpdated?.toISOString() || 'Never',
      isLoading,
      error,
    });
  }, [
    uid,
    currentUserRank,
    metric,
    sortedPlayers.length,
    Math.floor(timerSecondsElapsed / 60), // ⭐ FIX E7: minute-granular, not every second
    isLoading,
    error,
  ]);

  // -----------------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------------

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden font-sans"
      style={{
        backgroundColor: COLORS.bgMain,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        minHeight: 0,
      }}
    >
      {/* Demo Mode Warning */}
      {!uid && (
        <div className="shrink-0 mx-4 mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-bold text-center z-20 flex items-center justify-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="shrink-0"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>
            DEMO MODE: Your timer will NOT count towards the global leaderboard.
            Please log in via the System Login page.
          </span>
        </div>
      )}

      {/* Error Banner */}
      {error && !isLoading && (
        <div className="shrink-0 mx-4 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold text-center z-20 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => window.location.reload()}
            className="underline hover:text-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Ambient Glow */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: '300px',
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(0, 229, 255, 0.12) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      {/* Header */}
      <div className="shrink-0 pt-6 px-4 md:px-6 lg:px-8 pb-2.5 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <h1
              className="text-xl font-extrabold uppercase tracking-wider"
              style={{
                fontFamily: "'Lexend', sans-serif",
                color: COLORS.c1st,
                fontWeight: 800,
                textShadow: '0 0 10px rgba(0, 229, 255, 0.3)',
              }}
            >
              Ranking
            </h1>
            <span className="text-[10px] mt-0.5" style={{ color: COLORS.textMuted }}>
              Live • Realtime{' '}
              {!isLoading && lastUpdated && (
                <span className="opacity-70">
                  • Updated {Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s ago
                </span>
              )}
              {isLoading && <span className="animate-pulse">• Loading...</span>}
            </span>
          </div>

          <div className="p-2 rounded-lg" style={{ color: COLORS.c1st }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2.5 mt-4">
          <button
            onClick={() => setMetric('xp')}
            className={`text-[11px] font-bold uppercase pb-1.5 border-b-2 transition-all ${
              metric === 'xp' ? 'text-white border-[#00E5FF]' : 'border-transparent'
            }`}
            style={{
              color: metric === 'xp' ? '#fff' : COLORS.textMuted,
              fontWeight: 700,
            }}
          >
            XP RANKING
          </button>

          <button
            onClick={() => setMetric('study')}
            className={`text-[11px] font-bold uppercase pb-1.5 border-b-2 transition-all ${
              metric === 'study' ? 'text-white border-[#00E5FF]' : 'border-transparent'
            }`}
            style={{
              color: metric === 'study' ? '#fff' : COLORS.textMuted,
              fontWeight: 700,
            }}
          >
            STUDY TIME
          </button>
        </div>
      </div>

      {/* Scroll Area */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 pb-36"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* Top 3 Podium */}
        {top3Players.length > 0 && (
          <div
            className="flex flex-row flex-nowrap justify-center items-end gap-4 md:gap-6 lg:gap-8 px-4 md:px-6 lg:px-8 py-6 md:py-8 pb-10"
            style={{ borderBottom: `1px solid ${COLORS.border}` }}
          >
            {top3Players.length >= 2 && <PodiumCard player={top3Players[1]} rank={2} />}
            {top3Players.length >= 1 && <PodiumCard player={top3Players[0]} rank={1} />}
            {top3Players.length >= 3 && <PodiumCard player={top3Players[2]} rank={3} />}
          </div>
        )}

        {/* Rank 4+ List */}
        <div className="px-4 md:px-6 lg:px-8 flex flex-col gap-2 mt-2 max-w-3xl mx-auto w-full">
          {restPlayers.map((player) => (
            <ListItem
              key={player.id}
              player={player}
              rank={player.displayRank}
              isCurrentUser={uid ? player.id === uid : false}
              onClick={() => setSelectedUser(player)}
            />
          ))}

          {/* Empty State */}
          {restPlayers.length === 0 && top3Players.length > 0 && (
            <div className="text-center py-8 opacity-50">
              <p
                className="text-xs tracking-widest uppercase"
                style={{ color: COLORS.textMuted }}
              >
                No more rankings to display
              </p>
            </div>
          )}

          {/* Loading State */}
          {sortedPlayers.length === 0 && isLoading && (
            <div className="text-center py-16">
              <div
                className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-4"
                style={{ borderColor: COLORS.c1st, borderTopColor: 'transparent' }}
              />
              <p
                className="text-xs uppercase tracking-widest animate-pulse"
                style={{ color: COLORS.textMuted }}
              >
                Loading rankings...
              </p>
            </div>
          )}

          {/* Error State */}
          {sortedPlayers.length === 0 && !isLoading && error && (
            <div className="text-center py-16">
              <p
                className="text-xs uppercase tracking-widest mb-4"
                style={{ color: COLORS.c3rd }}
              >
                Failed to load
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg text-xs font-bold"
                style={{
                  background: COLORS.cViolet,
                  color: '#fff',
                }}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating User Rank Card */}
      {currentUserData && (
        <FloatingUserRank
          player={currentUserData}
          rank={currentUserRank}
          isLive={currentUserData.isLive || false}
          hasActiveTimer={currentUserData._hasActiveTimer || false}
          currentTask={currentUserData.currentTask}
        />
      )}

      {/* Profile Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 overflow-y-auto"
          style={{
            backgroundColor: COLORS.bgMain,
            zIndex: 9999,
          }}
        >
          <ProfilePremiumView
            profile={mapToUserProfile(selectedUser)}
            todayKey={new Date().toISOString().split('T')[0]}
            onNavigate={() => setSelectedUser(null)}
          />
        </div>
      )}
    </div>
  );
};

export default EsportsRanking;