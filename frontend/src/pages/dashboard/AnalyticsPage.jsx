import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Droplets, Heart, Activity, Users, Download, Calendar, Filter } from 'lucide-react';

// ── Mock analytics data ─────────────────────────────────────────────────────

const MONTHLY_DONATIONS = [
  { month: 'Nov', donations: 124, requests: 98,  fulfilled: 91 },
  { month: 'Dec', donations: 142, requests: 112, fulfilled: 108 },
  { month: 'Jan', donations: 189, requests: 134, fulfilled: 129 },
  { month: 'Feb', donations: 167, requests: 121, fulfilled: 115 },
  { month: 'Mar', donations: 214, requests: 156, fulfilled: 149 },
  { month: 'Apr', donations: 247, requests: 178, fulfilled: 172 },
  { month: 'May', donations: 198, requests: 143, fulfilled: 138 },
];

const BLOOD_GROUP_INVENTORY = [
  { group: 'O+',  units: 45, demand: 52, status: 'low' },
  { group: 'A+',  units: 38, demand: 30, status: 'ok' },
  { group: 'B+',  units: 27, demand: 25, status: 'ok' },
  { group: 'AB+', units: 14, demand: 12, status: 'ok' },
  { group: 'O-',  units: 6,  demand: 18, status: 'critical' },
  { group: 'A-',  units: 9,  demand: 14, status: 'low' },
  { group: 'B-',  units: 5,  demand: 8,  status: 'critical' },
  { group: 'AB-', units: 3,  demand: 5,  status: 'critical' },
];

const CITY_DEMAND = [
  { city: 'Delhi',     requests: 214, fulfilled: 198, donors: 412 },
  { city: 'Mumbai',    requests: 187, fulfilled: 172, donors: 367 },
  { city: 'Bangalore', requests: 156, fulfilled: 149, donors: 298 },
  { city: 'Chennai',   requests: 134, fulfilled: 127, donors: 234 },
  { city: 'Kolkata',   requests: 112, fulfilled: 103, donors: 198 },
  { city: 'Hyderabad', requests: 98,  fulfilled: 91,  donors: 189 },
];

const URGENCY_DISTRIBUTION = [
  { name: 'Routine',  value: 58, color: '#3B82F6' },
  { name: 'High',     value: 28, color: '#F59E0B' },
  { name: 'Critical', value: 14, color: '#EF4444' },
];

const DONOR_ELIGIBILITY_RADAR = [
  { metric: 'Age 18-65',   value: 94 },
  { metric: 'Weight >50kg', value: 88 },
  { metric: 'Hemoglobin',  value: 82 },
  { metric: '90-day Wait', value: 71 },
  { metric: 'No Illness',  value: 96 },
  { metric: 'Availability',value: 65 },
];

// ── Custom components ───────────────────────────────────────────────────────

const CUSTOM_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#1a1a2e',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '12px',
  },
  itemStyle: { color: '#fff' },
  labelStyle: { color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
};

function StatCard({ icon: Icon, label, value, change, color = 'crimson', sub }) {
  const positive = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-5 border border-white/6 hover:border-white/12 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          color === 'crimson'  ? 'bg-crimson-700/20'  :
          color === 'electric' ? 'bg-electric-600/20' :
          color === 'green'    ? 'bg-green-500/20'    : 'bg-amber-500/20'
        }`}>
          <Icon className={`w-5 h-5 ${
            color === 'crimson'  ? 'text-crimson-400'  :
            color === 'electric' ? 'text-electric-400' :
            color === 'green'    ? 'text-green-400'    : 'text-amber-400'
          }`} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${positive ? 'text-green-400' : 'text-red-400'}`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-2xl font-black text-white mb-1">{value}</p>
      <p className="text-xs text-white/40">{label}</p>
      {sub && <p className="text-xs text-white/25 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-bold text-white">{title}</h2>
      {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const [period, setPeriod] = useState('7m');

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-white mb-0.5">Analytics</h1>
          <p className="text-sm text-white/40">Platform-wide blood management insights and trends</p>
        </motion.div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white/4 border border-white/8 rounded-lg p-1">
            {['7d', '30d', '7m', '1y'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  period === p ? 'bg-electric-600 text-white' : 'text-white/40 hover:text-white/70'
                }`}
                aria-pressed={period === p}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 glass border border-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-all">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Heart}     label="Total Donations"     value="1,247" change={+12} color="crimson"  sub="This month: 247" />
        <StatCard icon={Droplets}  label="Units Distributed"   value="8,412" change={+8}  color="electric" sub="Avg 34/day" />
        <StatCard icon={Activity}  label="Requests Fulfilled"  value="96.2%" change={+3}  color="green"    sub="342 this month" />
        <StatCard icon={Users}     label="Active Donors"       value="2,847" change={-4}  color="amber"    sub="247 available now" />
      </div>

      {/* ── Donations vs Requests Trend ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card rounded-xl p-6 border border-white/6"
      >
        <SectionTitle title="Donations vs Requests" subtitle="Monthly comparison — donations and request fulfillment rate" />
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={MONTHLY_DONATIONS} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="gradDonations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#C0392B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C0392B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradFulfilled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} />
            <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} />
            <Tooltip {...CUSTOM_TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }} />
            <Area type="monotone" dataKey="donations" stroke="#C0392B" strokeWidth={2} fill="url(#gradDonations)" name="Donations" dot={{ fill: '#C0392B', r: 3 }} />
            <Area type="monotone" dataKey="requests"  stroke="#2563EB" strokeWidth={2} fill="url(#gradRequests)"  name="Requests"  dot={false} />
            <Area type="monotone" dataKey="fulfilled" stroke="#10B981" strokeWidth={2} fill="url(#gradFulfilled)" name="Fulfilled"  dot={false} strokeDasharray="4 2" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── Blood Group Inventory + Urgency Distribution ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Blood Group Supply vs Demand */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card rounded-xl p-6 border border-white/6 lg:col-span-2"
        >
          <SectionTitle title="Blood Group Supply vs Demand" subtitle="Current units available vs projected demand" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={BLOOD_GROUP_INVENTORY} barGap={4} margin={{ top: 0, right: 10, bottom: 0, left: -15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="group" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
              <Tooltip {...CUSTOM_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }} />
              <Bar dataKey="units"  name="Available" radius={[4,4,0,0]}>
                {BLOOD_GROUP_INVENTORY.map((entry, i) => (
                  <Cell key={i} fill={
                    entry.status === 'critical' ? '#EF4444' :
                    entry.status === 'low'      ? '#F59E0B' : '#2563EB'
                  } />
                ))}
              </Bar>
              <Bar dataKey="demand" name="Demand" fill="rgba(255,255,255,0.08)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-electric-600 inline-block" /> Sufficient</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> Low Stock</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" /> Critical</span>
          </div>
        </motion.div>

        {/* Request Urgency Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6 border border-white/6"
        >
          <SectionTitle title="Urgency Distribution" subtitle="All-time request breakdown" />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={URGENCY_DISTRIBUTION}
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {URGENCY_DISTRIBUTION.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip {...CUSTOM_TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Share']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {URGENCY_DISTRIBUTION.map((u) => (
              <div key={u.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-white/60">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: u.color }} />
                  {u.name}
                </span>
                <span className="text-white font-semibold">{u.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── City Demand + Donor Eligibility Radar ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* City-wise demand */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass-card rounded-xl p-6 border border-white/6"
        >
          <SectionTitle title="City-Wise Demand" subtitle="Top cities by blood request volume" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={CITY_DEMAND} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="city" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} width={70} />
              <Tooltip {...CUSTOM_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
              <Bar dataKey="requests"  name="Requests"  fill="#2563EB"         radius={[0,4,4,0]} barSize={10} />
              <Bar dataKey="fulfilled" name="Fulfilled" fill="#10B981"         radius={[0,4,4,0]} barSize={10} />
              <Bar dataKey="donors"    name="Donors"    fill="rgba(192,57,43,0.6)" radius={[0,4,4,0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Donor eligibility radar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-6 border border-white/6"
        >
          <SectionTitle title="Donor Eligibility Health" subtitle="Platform-wide donor eligibility compliance rates" />
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={DONOR_ELIGIBILITY_RADAR} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <Radar name="Eligibility %" dataKey="value" stroke="#C0392B" fill="#C0392B" fillOpacity={0.15} strokeWidth={2} dot={{ fill: '#C0392B', r: 3 }} />
              <Tooltip {...CUSTOM_TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Compliance']} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Fulfillment Rate Trend ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="glass-card rounded-xl p-6 border border-white/6"
      >
        <div className="flex items-center justify-between mb-4">
          <SectionTitle title="Fulfillment Rate Trend" subtitle="% of requests fulfilled within 6 hours — target: 95%" />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
            <TrendingUp className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs font-semibold text-green-400">+3.1% vs last period</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={[
              { month: 'Nov', rate: 88.2, target: 95 },
              { month: 'Dec', rate: 91.4, target: 95 },
              { month: 'Jan', rate: 90.7, target: 95 },
              { month: 'Feb', rate: 93.1, target: 95 },
              { month: 'Mar', rate: 94.5, target: 95 },
              { month: 'Apr', rate: 96.6, target: 95 },
              { month: 'May', rate: 96.2, target: 95 },
            ]}
            margin={{ top: 5, right: 10, bottom: 0, left: -15 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} />
            <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} domain={[80, 100]} unit="%" />
            <Tooltip {...CUSTOM_TOOLTIP_STYLE} formatter={(v) => [`${v}%`]} />
            <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }} />
            <Line type="monotone" dataKey="rate"   stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 4 }} name="Fulfillment Rate" />
            <Line type="monotone" dataKey="target" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="6 3" dot={false} name="Target (95%)" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── Critical Alerts Table ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass-card rounded-xl border border-white/6 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Critical Inventory Alerts</h2>
            <p className="text-xs text-white/40 mt-0.5">Blood groups below minimum threshold</p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full font-semibold">
            3 Critical
          </span>
        </div>
        <div className="divide-y divide-white/4">
          {BLOOD_GROUP_INVENTORY.filter((g) => g.status !== 'ok').map((group) => (
            <div key={group.group} className="flex items-center justify-between px-6 py-3.5 hover:bg-white/2 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black ${
                  group.status === 'critical' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
                }`}>
                  {group.group}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{group.group} Blood Group</p>
                  <p className="text-xs text-white/40">{group.units} units available · {group.demand} needed</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`text-sm font-bold ${group.status === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>
                    {Math.round((group.units / group.demand) * 100)}%
                  </p>
                  <p className="text-xs text-white/30">of demand</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  group.status === 'critical'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {group.status === 'critical' ? '🚨 Critical' : '⚠️ Low'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
