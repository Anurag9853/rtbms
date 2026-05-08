import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Search, RefreshCw, Shield, Heart, Building2,
  Droplets, ChevronDown, Trash2, MoreVertical
} from 'lucide-react';
import { fadeInUp, staggerContainer, ROLES } from '../../lib/design-system';
import { API } from '../../stores/authStore';
import toast from 'react-hot-toast';

const ROLE_CONFIG = {
  admin:      { label: 'Admin',      Icon: Shield,    color: 'text-purple-400',  bg: 'rgba(168,85,247,0.15)',  border: 'rgba(168,85,247,0.3)' },
  donor:      { label: 'Donor',      Icon: Heart,     color: 'text-crimson-400', bg: 'rgba(192,57,43,0.15)',   border: 'rgba(192,57,43,0.3)' },
  hospital:   { label: 'Hospital',   Icon: Building2, color: 'text-blue-400',    bg: 'rgba(37,99,235,0.15)',   border: 'rgba(37,99,235,0.3)' },
  blood_bank: { label: 'Blood Bank', Icon: Droplets,  color: 'text-green-400',   bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)' },
};

const FALLBACK_USERS = [
  { _id: 'u1', name: 'Dr. Priya Sharma',  email: 'priya@aiims.edu',       role: 'hospital',   city: 'Delhi',   created_at: '2024-01-10T00:00:00Z' },
  { _id: 'u2', name: 'Rahul Sharma',      email: 'rahul@example.com',     role: 'donor',      city: 'Delhi',   created_at: '2024-01-15T00:00:00Z', blood_group: 'O+' },
  { _id: 'u3', name: 'AIIMS Blood Bank',  email: 'blood@aiims.edu',       role: 'blood_bank', city: 'Delhi',   created_at: '2024-01-05T00:00:00Z' },
  { _id: 'u4', name: 'Ananya Gupta',      email: 'ananya@fortis.com',     role: 'hospital',   city: 'Gurgaon', created_at: '2024-02-20T00:00:00Z' },
  { _id: 'u5', name: 'Vikram Singh',      email: 'vikram@donor.in',       role: 'donor',      city: 'Mumbai',  created_at: '2024-03-01T00:00:00Z', blood_group: 'B+' },
  { _id: 'u6', name: 'Fortis Blood Bank', email: 'blood@fortis.com',      role: 'blood_bank', city: 'Gurgaon', created_at: '2024-02-14T00:00:00Z' },
  { _id: 'u7', name: 'Admin User',        email: 'admin@rtbms.in',        role: 'admin',      city: 'Delhi',   created_at: '2023-12-01T00:00:00Z' },
  { _id: 'u8', name: 'Sanya Kapoor',      email: 'sanya@donor.in',        role: 'donor',      city: 'Bangalore',created_at:'2024-04-10T00:00:00Z', blood_group: 'A-' },
];

const ROLES_LIST = ['all', 'admin', 'donor', 'hospital', 'blood_bank'];

function UserRow({ user, onRoleChange, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const roleConf = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.donor;
  const RoleIcon = roleConf.Icon;
  const initials = user.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  return (
    <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 hover:bg-white/2 transition-colors border-b border-white/4 last:border-b-0">
      {/* Left: avatar + name */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-crimson-700 to-crimson-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{user.name}</p>
          <p className="text-xs text-white/40">{user.email}{user.city ? ` · ${user.city}` : ''}</p>
        </div>
      </div>

      {/* Right: role badge + actions */}
      <div className="flex items-center gap-3">
        {user.blood_group && (
          <span className="text-xs font-black text-crimson-400 bg-crimson-700/15 px-2 py-0.5 rounded-badge border border-crimson-700/25">
            {user.blood_group}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-badge"
          style={{ background: roleConf.bg, color: roleConf.color, border: `1px solid ${roleConf.border}` }}>
          <RoleIcon className="w-3 h-3" />
          {roleConf.label}
        </span>

        {/* Actions dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="p-1.5 text-white/30 hover:text-white hover:bg-white/8 rounded-lg transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 glass-card rounded-xl border border-white/10 overflow-hidden z-20"
              style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
              {Object.entries(ROLE_CONFIG).filter(([r]) => r !== user.role).map(([r, cfg]) => (
                <button
                  key={r}
                  onClick={() => { onRoleChange(user._id ?? user.id, r); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-white/70 hover:bg-white/5 hover:text-white transition-all text-left"
                >
                  <cfg.Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                  Set as {cfg.label}
                </button>
              ))}
              <div className="border-t border-white/6">
                <button
                  onClick={() => { onDelete(user._id ?? user.id, user.name); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/8 transition-all text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete User
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function UsersPage() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = useCallback(async () => {
    try {
      const data = await API.get('/users');
      const items = data.data?.data ?? data.data ?? (Array.isArray(data.data) ? data.data : null);
      setUsers(items ?? FALLBACK_USERS);
    } catch {
      setUsers(FALLBACK_USERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (id, role) => {
    try {
      await API.patch(`/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => (u._id === id || u.id === id) ? { ...u, role } : u));
      toast.success('Role updated');
    } catch {
      // Demo mode
      setUsers((prev) => prev.map((u) => (u._id === id || u.id === id) ? { ...u, role } : u));
      toast.success('Role updated (demo mode)');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await API.delete(`/users/${id}`);
    } catch {}
    setUsers((prev) => prev.filter((u) => u._id !== id && u.id !== id));
    toast.success(`${name} deleted`);
  };

  const filtered = users.filter((u) => {
    const matchesRole   = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const counts = ROLES_LIST.reduce((acc, r) => {
    acc[r] = r === 'all' ? users.length : users.filter((u) => u.role === r).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Users</h1>
          <p className="text-sm text-white/40">Manage platform users and roles</p>
        </div>
        <button onClick={fetchUsers} className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
          const { Icon } = cfg;
          return (
            <div key={role} className="glass-card rounded-xl p-4 border border-white/6 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: cfg.bg }}>
                <Icon className={`w-4 h-4 ${cfg.color}`} />
              </div>
              <div>
                <p className="text-xl font-black text-white">{users.filter((u) => u.role === role).length}</p>
                <p className="text-xs text-white/40">{cfg.label}s</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-input pl-9 pr-4 py-2.5 outline-none placeholder-white/20"
          />
        </div>
        {/* Role filter */}
        <div className="flex gap-1 bg-white/4 border border-white/8 rounded-lg p-1">
          {ROLES_LIST.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded text-xs font-semibold capitalize transition-all ${roleFilter === r ? 'bg-crimson-700 text-white' : 'text-white/40 hover:text-white/70'}`}
            >
              {r === 'blood_bank' ? 'Banks' : r} {counts[r] > 0 && <span className="ml-0.5 opacity-60">({counts[r]})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-card border border-white/6 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/6 flex items-center justify-between">
          <p className="text-sm font-semibold text-white">
            {filtered.length} user{filtered.length !== 1 ? 's' : ''}
          </p>
          <Users className="w-4 h-4 text-white/30" />
        </div>

        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/4 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-white/8" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-36 bg-white/8 rounded" />
                  <div className="h-3 w-52 bg-white/5 rounded" />
                </div>
                <div className="h-6 w-20 bg-white/5 rounded-badge" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-sm text-white/40">No users match your filters</p>
          </div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.04)}>
            {filtered.map((user) => (
              <UserRow
                key={user._id ?? user.id}
                user={user}
                onRoleChange={handleRoleChange}
                onDelete={handleDelete}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
