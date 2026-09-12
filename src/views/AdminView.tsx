import React, { useEffect, useState, useCallback } from 'react';
import { Users, UserPlus, Gem, Clock, Flame, Trophy, ShieldAlert, RefreshCw, Crown, Star, Leaf } from 'lucide-react';
import { UserProfile } from '../types';
import { fetchAdminOverview, fetchAdminUsers, AdminOverview, AdminUser } from '../services/adminStats';

const rarityMeta: Record<string, { icon: any; color: string; label: string }> = {
  common: { icon: Leaf, color: '#6EE7B7', label: 'মুবারক' },
  rare: { icon: Star, color: '#FBBF24', label: 'নূরানী' },
  legendary: { icon: Crown, color: '#C084FC', label: 'কুদসী' },
};

export const AdminView: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, us] = await Promise.all([fetchAdminOverview(), fetchAdminUsers()]);
      setData(ov);
      setUsers(us);
    } catch (e) {
      console.warn('[Admin] fetch fail:', e);
    }
    setLoading(false);
  }, []);

  const fmt = (iso: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('bn-BD', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return '—'; }
  };

  useEffect(() => { load(); }, [load]);

  if (!profile.isAdmin) {
    return (
      <div className="p-10 rounded-2xl bg-surface border border-border text-center space-y-3">
        <ShieldAlert className="w-10 h-10 mx-auto text-rose-400" />
        <h2 className="text-lg font-black bn" style={{ color: '#F8FAFC' }}>Admin Access Denied</h2>
        <p className="text-xs bn" style={{ color: '#94A3B8' }}>এই panel শুধু administrator-দের জন্য।</p>
      </div>
    );
  }

  const hours = Math.round((data?.totalStudyMinutes || 0) / 60);

  const cards = [
    { icon: Users, label: 'Total Users', value: data?.totalUsers ?? '—', color: '#38BDF8' },
    { icon: UserPlus, label: 'আজকে Join', value: data?.newToday ?? '—', color: '#10B981' },
    { icon: Gem, label: 'Vault Claims', value: data?.totalClaims ?? '—', color: '#FBBF24' },
    { icon: Clock, label: 'Total Study Hours', value: hours, color: '#C084FC' },
    { icon: Flame, label: 'Active Today', value: data?.activeToday ?? '—', color: '#F97316' },
  ];

  return (
    <div className="space-y-5 pb-12 animate-in fade-in">
      {/* header */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-surface border border-border shadow-lg">
        <div>
          <h2 className="text-lg font-black bn flex items-center gap-2" style={{ color: '#F8FAFC' }}>
            <Trophy className="w-5 h-5 text-gold" /> Admin Dashboard
          </h2>
          <p className="text-[11px] bn mt-0.5" style={{ color: '#94A3B8' }}>
            Users, vault claims ও study stats — সব এক জায়গায়
          </p>
        </div>
        <button
          onClick={load}
          className="p-2.5 rounded-xl transition-all hover:rotate-180 duration-500"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8' }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="p-4 rounded-2xl bg-surface border border-border shadow-lg text-center">
            <c.icon className="w-5 h-5 mx-auto mb-2" style={{ color: c.color }} />
            <p className="text-2xl font-black font-mono" style={{ color: c.color }}>{c.value}</p>
            <p className="text-[9px] font-bold bn mt-1" style={{ color: '#64748B' }}>{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* rarity breakdown */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-lg space-y-3">
          <h3 className="text-xs font-bold bn flex items-center gap-2" style={{ color: '#F8FAFC' }}>
            <Gem className="w-4 h-4 text-gold" /> Rarity Breakdown
          </h3>
          {(data?.rarityBreakdown.length || 0) === 0 ? (
            <p className="text-[11px] bn" style={{ color: '#64748B' }}>এখনো কোনো claim নেই।</p>
          ) : (
            data!.rarityBreakdown.map((r) => {
              const m = rarityMeta[r.rarity] || rarityMeta.common;
              const pct = data!.totalClaims ? Math.round((r.count / data!.totalClaims) * 100) : 0;
              return (
                <div key={r.rarity} className="space-y-1">
                  <div className="flex justify-between text-[10px] bn">
                    <span className="flex items-center gap-1.5" style={{ color: m.color }}>
                      <m.icon className="w-3 h-3" /> {m.label} ({r.rarity})
                    </span>
                    <span className="font-mono" style={{ color: '#94A3B8' }}>{r.count} · {pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: m.color }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* top collectors */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-lg space-y-2">
          <h3 className="text-xs font-bold bn flex items-center gap-2" style={{ color: '#F8FAFC' }}>
            <Trophy className="w-4 h-4 text-gold" /> Top Collectors
          </h3>
          {(data?.topCollectors.length || 0) === 0 ? (
            <p className="text-[11px] bn" style={{ color: '#64748B' }}>এখনো কেউ collect করেনি।</p>
          ) : (
            data!.topCollectors.map((t, i) => (
              <div key={t.user_id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0" style={{ background: i === 0 ? '#FBBF24' : i === 1 ? '#94A3B8' : i === 2 ? '#B45309' : 'rgba(255,255,255,0.08)', color: i < 3 ? '#0F111A' : '#94A3B8' }}>
                  {i + 1}
                </span>
                {t.avatar ? (
                  <img src={t.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-surface-muted flex items-center justify-center text-[10px] font-black shrink-0" style={{ color: '#94A3B8' }}>
                    {t.name.charAt(0)}
                  </div>
                )}
                <p className="flex-1 text-[11px] font-bold bn truncate" style={{ color: '#E2E8F0' }}>{t.name}</p>
                <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24' }}>
                  💎 {t.claims}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ⭐ USER DETAILS TABLE — নতুন section */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-lg space-y-3">
        <h3 className="text-xs font-bold bn flex items-center gap-2" style={{ color: '#F8FAFC' }}>
          <Users className="w-4 h-4 text-gold" /> User Details ({users.length})
        </h3>

        {users.length === 0 ? (
          <p className="text-[11px] bn py-6 text-center" style={{ color: '#64748B' }}>এখনো কোনো user নেই।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] uppercase tracking-wider" style={{ color: '#64748B' }}>
                  <th className="py-2 pr-3">User</th>
                  <th className="py-2 pr-3">Joined</th>
                  <th className="py-2 pr-3">Last Login</th>
                  <th className="py-2 pr-3">Study</th>
                  <th className="py-2 pr-3">Claims</th>
                  <th className="py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2.5 min-w-[160px]">
                        {u.avatar ? (
                          <img src={u.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-surface-muted flex items-center justify-center text-[10px] font-black shrink-0" style={{ color: '#94A3B8' }}>
                            {u.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold bn truncate" style={{ color: '#E2E8F0' }}>{u.name}</p>
                          <p className="text-[9px] truncate" style={{ color: '#64748B' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-[10px] font-mono whitespace-nowrap" style={{ color: '#94A3B8' }}>{fmt(u.createdAt)}</td>
                    <td className="py-2.5 pr-3 text-[10px] font-mono whitespace-nowrap" style={{ color: u.lastActive ? '#6EE7B7' : '#64748B' }}>{fmt(u.lastActive)}</td>
                    <td className="py-2.5 pr-3 text-[10px] font-mono whitespace-nowrap" style={{ color: '#FBBF24' }}>{Math.round(u.studyMinutes / 60)}h</td>
                    <td className="py-2.5 pr-3 text-[10px] font-mono whitespace-nowrap" style={{ color: '#C084FC' }}>💎 {u.claims}</td>
                    <td className="py-2.5">
                      {u.isAdmin ? (
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded" style={{ background: 'rgba(168,85,247,0.15)', color: '#C084FC' }}>ADMIN</span>
                      ) : (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B' }}>USER</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};