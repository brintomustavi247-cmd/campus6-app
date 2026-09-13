import { supabase } from '../supabaseClient';

export interface LeaderRow {
  id: string;
  name: string;
  avatar: string;
  minutes: number;
  lastActive: string | null;
  status?: string;
}

export const fetchLeaderboard = async (): Promise<LeaderRow[]> => {
  const { data } = await supabase
    .from('users')
    .select('id, full_name, avatar_url, total_study_time, live_study_minutes, current_status, last_active')
    .limit(100);

  return (data || [])
    .map((u: any) => ({
      id: u.id,
      name: u.full_name || 'Unknown',
      avatar: u.avatar_url || '',
      minutes: Math.round((u.total_study_time || 0) + (u.live_study_minutes || 0)),
      lastActive: u.last_active || null,
      status: u.current_status || 'offline',
    }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 50);
};
