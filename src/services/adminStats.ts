import { supabase } from '../supabaseClient';

export interface AdminOverview {
  totalUsers: number;
  newToday: number;
  totalClaims: number;
  rarityBreakdown: { rarity: string; count: number }[];
  topCollectors: { user_id: string; name: string; avatar: string; claims: number }[];
  totalStudyMinutes: number;
  activeToday: number;
}

export const fetchAdminOverview = async (): Promise<AdminOverview> => {
  const out: AdminOverview = {
    totalUsers: 0, newToday: 0, totalClaims: 0,
    rarityBreakdown: [], topCollectors: [], totalStudyMinutes: 0, activeToday: 0,
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayIso = todayStart.toISOString();

  const [{ count: users }, { count: newToday }, { count: claims }] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', todayIso),
    supabase.from('ayah_claims').select('*', { count: 'exact', head: true }),
  ]);
  out.totalUsers = users || 0;
  out.newToday = newToday || 0;
  out.totalClaims = claims || 0;

  const { data: rarityRows } = await supabase.from('ayah_claims').select('rarity');
  const rmap: Record<string, number> = {};
  (rarityRows || []).forEach((r: any) => { rmap[r.rarity] = (rmap[r.rarity] || 0) + 1; });
  out.rarityBreakdown = Object.entries(rmap).map(([rarity, count]) => ({ rarity, count }));

  const { data: claimRows } = await supabase
    .from('ayah_claims')
    .select('user_id, users(full_name, avatar_url)');
  const agg: Record<string, { name: string; avatar: string; claims: number }> = {};
  (claimRows || []).forEach((row: any) => {
    const u = row.users || {};
    const key = row.user_id;
    if (!agg[key]) agg[key] = { name: u.full_name || 'Unknown', avatar: u.avatar_url || '', claims: 0 };
    agg[key].claims += 1;
  });
  out.topCollectors = Object.entries(agg)
    .map(([user_id, v]) => ({ user_id, ...v }))
    .sort((a, b) => b.claims - a.claims)
    .slice(0, 10);

  const { data: statRows } = await supabase.from('users').select('total_study_time, last_active');
  (statRows || []).forEach((s: any) => {
    out.totalStudyMinutes += s.total_study_time || 0;
    if (s.last_active && new Date(s.last_active).getTime() >= todayStart.getTime()) out.activeToday += 1;
  });

  return out;
};
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
  lastActive: string | null;
  studyMinutes: number;
  claims: number;
  isAdmin: boolean;
}

export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  const [{ data: users }, { data: claims }] = await Promise.all([
    supabase.from('users').select('id, full_name, email, avatar_url, created_at, last_active, total_study_time, is_admin'),
    supabase.from('ayah_claims').select('user_id'),
  ]);

  const cmap: Record<string, number> = {};
  (claims || []).forEach((c: any) => { cmap[c.user_id] = (cmap[c.user_id] || 0) + 1; });

  return (users || [])
    .map((u: any) => ({
      id: u.id,
      name: u.full_name || 'Unknown',
      email: u.email || '',
      avatar: u.avatar_url || '',
      createdAt: u.created_at,
      lastActive: u.last_active || null,
      studyMinutes: u.total_study_time || 0,
      claims: cmap[u.id] || 0,
      isAdmin: !!u.is_admin,
    }))
    .sort((a, b) => (b.lastActive || '').localeCompare(a.lastActive || ''));
};