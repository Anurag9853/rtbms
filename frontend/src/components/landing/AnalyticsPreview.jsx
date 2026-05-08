import { motion } from 'framer-motion';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { staggerContainer, fadeInUp } from '../../lib/design-system';

const donorGrowthData = [
  { month: 'Oct', donors: 7200 },
  { month: 'Nov', donors: 8100 },
  { month: 'Dec', donors: 8600 },
  { month: 'Jan', donors: 9200 },
  { month: 'Feb', donors: 10100 },
  { month: 'Mar', donors: 10800 },
  { month: 'Apr', donors: 11500 },
  { month: 'May', donors: 12247 },
];

const availabilityData = [
  { month: 'Oct', 'O+': 62, 'A+': 71, 'B+': 55, 'O-': 28 },
  { month: 'Nov', 'O+': 58, 'A+': 65, 'B+': 60, 'O-': 22 },
  { month: 'Dec', 'O+': 70, 'A+': 72, 'B+': 68, 'O-': 31 },
  { month: 'Jan', 'O+': 55, 'A+': 60, 'B+': 52, 'O-': 19 },
  { month: 'Feb', 'O+': 75, 'A+': 78, 'B+': 70, 'O-': 35 },
  { month: 'Mar', 'O+': 80, 'A+': 82, 'B+': 75, 'O-': 40 },
  { month: 'Apr', 'O+': 73, 'A+': 76, 'B+': 71, 'O-': 33 },
  { month: 'May', 'O+': 84, 'A+': 87, 'B+': 79, 'O-': 42 },
];

const emergencyData = [
  { week: 'W1', critical: 12, high: 24, resolved: 33 },
  { week: 'W2', critical: 18, high: 31, resolved: 44 },
  { week: 'W3', critical: 9,  high: 19, resolved: 27 },
  { week: 'W4', critical: 22, high: 38, resolved: 57 },
  { week: 'W5', critical: 15, high: 27, resolved: 40 },
  { week: 'W6', critical: 7,  high: 16, resolved: 22 },
];

const customTooltipStyle = {
  backgroundColor: '#1a1a24',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  color: '#fafafa',
  fontSize: '12px',
  padding: '10px 14px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
};

export function AnalyticsPreview() {
  return (
    <section id="analytics" className="relative py-24 md:py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-base-950" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(ellipse at 0% 50%, rgba(192,57,43,0.2) 0%, transparent 50%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer(0.1)}
          className="text-center mb-14"
        >
          <motion.span variants={fadeInUp} className="inline-block text-xs font-semibold tracking-widest uppercase text-purple-400 bg-purple-400/10 border border-purple-400/20 rounded-full px-4 py-1.5 mb-4">
            Live Analytics
          </motion.span>
          <motion.h2 variants={fadeInUp} className="text-h1 font-black text-white mb-4">
            Data-driven{' '}
            <span className="gradient-text">life-saving</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-white/50 max-w-xl mx-auto">
            Real-time analytics help hospitals anticipate shortages before they become emergencies.
          </motion.p>
        </motion.div>

        {/* Charts Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={staggerContainer(0.12)}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Donor Growth — Area */}
          <motion.div variants={fadeInUp}>
            <div className="glass-card rounded-card p-5 border border-white/6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Donor Growth</p>
                  <p className="text-2xl font-black text-white">12,247</p>
                </div>
                <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-badge font-semibold">
                  +24.3% ↑
                </span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={donorGrowthData}>
                  <defs>
                    <linearGradient id="donorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c0392b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#c0392b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={customTooltipStyle} formatter={(v) => [v.toLocaleString(), 'Donors']} />
                  <Area type="monotone" dataKey="donors" stroke="#e74c3c" strokeWidth={2.5} fill="url(#donorGrad)" dot={false} activeDot={{ r: 5, fill: '#e74c3c' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Blood Availability Trends — Line */}
          <motion.div variants={fadeInUp}>
            <div className="glass-card rounded-card p-5 border border-white/6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Availability Trends</p>
                  <p className="text-lg font-bold text-white">by Blood Group</p>
                </div>
                <span className="text-xs text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2.5 py-1 rounded-badge font-semibold">
                  Live
                </span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={availabilityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }} />
                  <Line type="monotone" dataKey="O+" stroke="#2563eb" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="A+" stroke="#e74c3c" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="B+" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="O-" stroke="#a855f7" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Emergency Requests — Bar */}
          <motion.div variants={fadeInUp} className="lg:col-span-2">
            <div className="glass-card rounded-card p-5 border border-white/6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Emergency Requests</p>
                  <p className="text-lg font-bold text-white">Weekly Volume & Resolution Rate</p>
                </div>
                <div className="flex gap-4 text-xs text-white/50">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-red-500 inline-block" /> Critical</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-amber-500 inline-block" /> High</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-green-500 inline-block" /> Resolved</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={emergencyData} barSize={16} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Bar dataKey="critical" fill="#ef4444" fillOpacity={0.85} radius={[4,4,0,0]} />
                  <Bar dataKey="high"     fill="#f59e0b" fillOpacity={0.85} radius={[4,4,0,0]} />
                  <Bar dataKey="resolved" fill="#22c55e" fillOpacity={0.85} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
