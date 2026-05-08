import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PulseDot } from '../ui/PulseDot';
import { SkeletonCard } from '../ui/SkeletonCard';
import { BLOOD_GROUPS, BLOOD_GROUP_COLORS } from '../../lib/design-system';
import { staggerContainer, fadeInUp } from '../../lib/design-system';

const mockBloodData = [
  { group: 'O-',  units: 3,   city: 'Mumbai',    status: 'critical',  updated: '2m ago',  bank: 'Lilavati Hospital Blood Bank' },
  { group: 'A+',  units: 24,  city: 'Delhi',     status: 'available', updated: '5m ago',  bank: 'AIIMS Blood Centre' },
  { group: 'B+',  units: 8,   city: 'Bangalore', status: 'low',       updated: '10m ago', bank: 'Manipal Blood Bank' },
  { group: 'AB-', units: 1,   city: 'Chennai',   status: 'critical',  updated: '1m ago',  bank: 'Apollo Hospitals' },
  { group: 'O+',  units: 45,  city: 'Hyderabad', status: 'available', updated: '8m ago',  bank: 'Care Foundation' },
  { group: 'A-',  units: 6,   city: 'Pune',      status: 'low',       updated: '15m ago', bank: 'Ruby Hall Clinic' },
  { group: 'B-',  units: 12,  city: 'Kolkata',   status: 'available', updated: '3m ago',  bank: 'AMRI Hospitals' },
  { group: 'AB+', units: 18,  city: 'Ahmedabad', status: 'available', updated: '7m ago',  bank: 'Sterling Hospital' },
];

const statusConfig = {
  available: { label: 'Available', dot: 'available', textColor: 'text-green-400' },
  low:       { label: 'Low Stock', dot: 'low',       textColor: 'text-amber-400' },
  critical:  { label: 'Critical',  dot: 'critical',  textColor: 'text-red-400' },
};

export function BloodAvailabilityPreview() {
  const [filterGroup, setFilterGroup] = useState('');
  const [filterCity, setFilterCity]   = useState('');
  const [loading]                      = useState(false);

  const cities = [...new Set(mockBloodData.map((d) => d.city))];

  const filtered = mockBloodData.filter((item) => {
    const matchGroup = !filterGroup || item.group === filterGroup;
    const matchCity  = !filterCity  || item.city  === filterCity;
    return matchGroup && matchCity;
  });

  return (
    <section id="blood-availability" className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-base-900" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer(0.1)}
          className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10"
        >
          <div>
            <motion.span variants={fadeInUp} className="inline-block text-xs font-semibold tracking-widest uppercase text-crimson-400 bg-crimson-400/10 border border-crimson-400/20 rounded-full px-4 py-1.5 mb-4">
              Live Inventory
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-h2 font-black text-white">
              Blood Availability{' '}
              <span className="gradient-text">Right Now</span>
            </motion.h2>
          </div>

          {/* Filters */}
          <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 glass rounded-input px-3 py-2 border border-white/10">
              <SlidersHorizontal className="w-4 h-4 text-white/40" />
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="bg-transparent text-sm text-white/70 outline-none cursor-pointer"
                aria-label="Filter by blood group"
              >
                <option value="">All Groups</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g} className="bg-base-800">{g}</option>
                ))}
              </select>
            </div>
            <div className="glass rounded-input px-3 py-2 border border-white/10">
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="bg-transparent text-sm text-white/70 outline-none cursor-pointer"
                aria-label="Filter by city"
              >
                <option value="">All Cities</option>
                {cities.map((c) => (
                  <option key={c} value={c} className="bg-base-800">{c}</option>
                ))}
              </select>
            </div>
          </motion.div>
        </motion.div>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer(0.06)}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {filtered.map((item) => {
              const colors = BLOOD_GROUP_COLORS[item.group];
              const status = statusConfig[item.status];
              return (
                <motion.div
                  key={`${item.group}-${item.city}`}
                  variants={fadeInUp}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <div
                    className="glass-card rounded-card p-5 h-full cursor-pointer group border"
                    style={{ borderColor: item.status === 'critical' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)' }}
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="text-2xl font-black px-3 py-1.5 rounded-badge"
                        style={{
                          background: colors.bg,
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        {item.group}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <PulseDot status={item.status} size="sm" />
                        <span className={`text-xs font-medium ${status.textColor}`}>{status.label}</span>
                      </div>
                    </div>

                    {/* Units */}
                    <div className="mb-3">
                      <span className="text-3xl font-black text-white">{item.units}</span>
                      <span className="text-sm text-white/40 ml-1.5">units</span>
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white/80 truncate">{item.bank}</p>
                      <p className="text-xs text-white/40">{item.city}</p>
                    </div>

                    {/* Last updated */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-white/30">Updated {item.updated}</span>
                      {item.status === 'critical' && (
                        <span className="text-xs font-bold text-red-400 animate-pulse">⚠ URGENT</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-10"
        >
          <Link
            to="/search"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white border border-white/15 hover:border-white/30 px-6 py-2.5 rounded-pill transition-all duration-200 group"
          >
            View all blood availability
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
