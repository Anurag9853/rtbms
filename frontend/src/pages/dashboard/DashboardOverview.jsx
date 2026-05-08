import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Droplets, AlertTriangle, CheckCircle,
  TrendingUp, Activity, Clock, ArrowRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';
import { PulseDot }     from '../../components/ui/PulseDot';
import { CountUpNumber } from '../../components/ui/CountUpNumber';
import { staggerContainer, fadeInUp } from '../../lib/design-system';
import { analyticsApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

// Fallback data for demo
const FALLBACK_STATS = {
  active_donors:     247,
  units_available:   1420,
  active_emergencies: 8,
  requests_fulfilled: 342,
};

const FALLBACK_CHART = [
  { day: 'Mon', donations: 22, requests: 15 },
  { day: 'Tue', donations: 28, requests: 19 },
  { day: 'Wed', donations: 18, requests: 24 },
  { day: 'Thu', donations: 34, requests: 18 },
  { day: 'Fri', donations: 29, requests: 22 },
  { day: 'Sat', donations: 42, requests: 14 },
  { day: 'Sun', donations: 36, requests: 11 },
];

const FALLBACK_ACTIVITY = [
  { type: 'donation', text: 'Rahul M. donated O+ blood',           time: '2m ago',  status: 'available' },
  { type: 'emergency',text: 'Critical A- request — Max Hospital',   time: '5m ago',  status: 'critical'  },
  { type: 'fulfilled', text: 'B+ request fulfilled — AIIMS',        time: '8m ago',  status: 'available' },
  { type: 'donor',    text: 'Priya S. registered as donor',         time: '15m ago', status: 'online'    },
  { type: 'emergency',text: 'Emergency AB- resolved',               time: '22m ago', status: 'available' },
];

const FALLBACK_INVENTORY = [
  { group: 'A+',  units: 24, pct: 80 },
  { group: 'A-',  units: 6,  pct: 20 },
  { group: 'B+',  units: 18, pct: 60 },
  { group: 'B-',  units: 4,  pct: 13 },
  { group: 'O+',  units: 45, pct: 90 },
  { group: 'O-',  units: 3,  pct: 10 },
  { group: 'AB+', units: 12, pct: 40 },
  { group: 'AB-', units: 1,  pct:  4 },
];

const CUSTOM_TOOLTIP = {
  backgroundColor: '#1a1a24',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
  color: '#fafafa',
  fontSize: '12px',
  padding: '8px 12px',
};

function StatsCardSkeleton() {
  return (
    <div className="glass-card rounded-card p-5 border border-white/6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9 rounded-xl bg-white/8" />
        <div className="h-5 w-10 bg-white/5 rounded-badge" />
      </div>
      <div className="h-7 w-16 bg-white/8 rounded mb-1" />
      <div className="h-3 w-28 bg-white/5 rounded" />
    </div>
  );
}

export function DashboardOverview() {
  const { user } = useAuthStore();
  const [stats, setStats]         = useState(null);
  const [chartData, setChartData] = useState(FALLBACK_CHART);
  const [inventory, setInventory] = useState(FALLBACK_INVENTORY);
  const [activity]                = useState(FALLBACK_ACTIVITY);
  const [loading, setLoading]     = useState(true);

  const greeting = user
    ? `Welcome back, ${user.name}`
    : 'Welcome back';

  const subtitle = user?.role
    ? `${user.role.replace('_', ' ')} Portal`
    : 'Dashboard';

  useEffect(() => {
    analyticsApi.getSummary()
      .then((data) => {
        const d = data.data ?? data;
        setStats({
          active_donors:      d.active_donors      ?? FALLBACK_STATS.active_donors,
          units_available:    d.units_available     ?? FALLBACK_STATS.units_available,
          active_emergencies: d.active_emergencies  ?? FALLBACK_STATS.active_emergencies,
          requests_fulfilled: d.requests_fulfilled  ?? FALLBACK_STATS.requests_fulfilled,
        });
        if (d.weekly_chart) setChartData(d.weekly_chart);
        if (d.inventory)    setInventory(d.inventory.map((i) => ({
          group: i.blood_group,
          units: i.total_units ?? i.units_available ?? 0,
          pct:   Math.min(100, ((i.total_units ?? i.units_available ?? 0) / 60) * 100),
        })));
      })
      .catch(() => setStats(FALLBACK_STATS))
      .finally(() => setLoading(false));
  }, []);

  const statsCards = [
    { label: 'Active Donors',      value: stats?.active_donors,      change: '+12', trend: 'up',   icon: Heart,         color: 'text-crimson-400', bg: 'rgba(192,57,43,0.1)',  border: 'rgba(192,57,43,0.2)',  link: '/dashboard/donors' },
    { label: 'Units Available',    value: stats?.units_available,     change: '+85', trend: 'up',   icon: Droplets,      color: 'text-blue-400',    bg: 'rgba(37,99,235,0.1)',  border: 'rgba(37,99,235,0.2)',  link: '/dashboard/inventory' },
    { label: 'Active Emergencies', value: stats?.active_emergencies,  change: '-3',  trend: 'down', icon: AlertTriangle, color: 'text-red-400',     bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)',  link: '/dashboard/emergency' },
    { label: 'Requests Fulfilled', value: stats?.requests_fulfilled,  change: '+28', trend: 'up',   icon: CheckCircle,   color: 'text-green-400',   bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)',  link: '/dashboard/requests' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.06)}>
        <motion.div variants={fadeInUp}>
          <h1 className="text-2xl font-black text-white mb-1">Dashboard Overview</h1>
          <p className="text-sm text-white/45">
            {greeting} · <span className="capitalize">{subtitle}</span>
          </p>
        </motion.div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
          : statsCards.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                className="glass-card rounded-card p-5 border cursor-default group relative overflow-hidden"
                style={{ borderColor: s.border }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-badge ${
                    s.trend === 'up' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
                  }`}>
                    {s.change}
                  </span>
                </div>
                <div className="text-2xl font-black text-white mb-1">
                  <CountUpNumber end={s.value ?? 0} />
                </div>
                <p className="text-xs text-white/40">{s.label}</p>
                {s.link && (
                  <Link
                    to={s.link}
                    className="absolute inset-0 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                )}
              </motion.div>
            );
          })
        }
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-card rounded-card p-5 border border-white/6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white">Weekly Activity</h3>
              <p className="text-xs text-white/40">Donations vs Requests</p>
            </div>
            <div className="flex gap-4 text-xs text-white/50">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-crimson-500 inline-block" /> Donations</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-blue-500 inline-block" /> Requests</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="donGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#c0392b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#c0392b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP} />
              <Area type="monotone" dataKey="donations" stroke="#e74c3c" strokeWidth={2} fill="url(#donGrad)" dot={false} activeDot={{ r: 4, fill: '#e74c3c' }} />
              <Area type="monotone" dataKey="requests"  stroke="#2563eb" strokeWidth={2} fill="url(#reqGrad)"  dot={false} activeDot={{ r: 4, fill: '#2563eb' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-card rounded-card p-5 border border-white/6"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-white">Live Activity</h3>
            <Activity className="w-4 h-4 text-white/30" />
          </div>
          <div className="space-y-4">
            {activity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5"><PulseDot status={item.status} size="xs" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/75 leading-snug truncate">{item.text}</p>
                  <p className="text-xs text-white/30 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {item.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Blood Group Inventory Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="glass-card rounded-card p-5 border border-white/6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white">Blood Group Inventory</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30 flex items-center gap-1">
              <PulseDot status="available" size="xs" /> Live
            </span>
            <Link to="/dashboard/inventory" className="text-xs text-crimson-400 hover:text-crimson-300 flex items-center gap-1 transition-colors">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {inventory.map((bg) => (
            <div key={bg.group} className="text-center">
              <div className="text-sm font-black text-white mb-2">{bg.group}</div>
              <div className="h-20 bg-white/5 rounded-lg relative overflow-hidden mb-1.5">
                <motion.div
                  className="absolute bottom-0 left-0 right-0 rounded-lg"
                  style={{
                    background: bg.pct < 15 ? '#ef4444' : bg.pct < 40 ? '#f59e0b' : '#22c55e',
                    opacity: 0.8,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${bg.pct}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                />
              </div>
              <div className="text-xs font-bold text-white/70">{bg.units}u</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
