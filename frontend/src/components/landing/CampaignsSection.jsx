import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, CheckCircle } from 'lucide-react';
import { staggerContainer, fadeInUp } from '../../lib/design-system';

const campaigns = [
  {
    id: 1,
    title: 'Mega Blood Drive — IIT Delhi',
    date: 'May 15, 2026',
    location: 'IIT Delhi Campus, Hauz Khas',
    organizer: 'NSS IIT Delhi',
    slots: 200,
    filled: 134,
    urgency: 'high',
    target: ['O+', 'A+', 'B+'],
    days: 7,
    hours: 14,
    mins: 23,
    secs: 10,
  },
  {
    id: 2,
    title: 'City Blood Camp — Infosys Bangalore',
    date: 'May 18, 2026',
    location: 'Infosys Campus, Electronic City',
    organizer: 'Infosys Foundation',
    slots: 150,
    filled: 89,
    urgency: 'medium',
    target: ['O-', 'AB+', 'B-'],
    days: 10,
    hours: 6,
    mins: 45,
    secs: 33,
  },
  {
    id: 3,
    title: 'Emergency Blood Week — Mumbai',
    date: 'May 20, 2026',
    location: 'Bandra Kurla Complex, Mumbai',
    organizer: 'Red Cross Mumbai',
    slots: 300,
    filled: 241,
    urgency: 'critical',
    target: ['O-', 'AB-', 'A-'],
    days: 12,
    hours: 9,
    mins: 12,
    secs: 55,
  },
];

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="glass w-10 h-10 rounded-lg flex items-center justify-center text-base font-black text-white border border-white/10">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-xs text-white/30 mt-1">{label}</span>
    </div>
  );
}

export function CampaignsSection() {
  const [rsvpd, setRsvpd] = useState({});
  const [counts, setCounts] = useState({});

  const handleRsvp = (campaign) => {
    if (rsvpd[campaign.id]) return;
    setRsvpd((prev) => ({ ...prev, [campaign.id]: true }));
    setCounts((prev) => ({
      ...prev,
      [campaign.id]: (prev[campaign.id] ?? campaign.filled) + 1,
    }));
  };

  const urgencyColors = {
    critical: { text: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20' },
    high:     { text: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/20' },
    medium:   { text: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20' },
  };

  return (
    <section id="campaigns" className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-base-950" />
      <div
        className="absolute inset-0 opacity-15"
        style={{ backgroundImage: 'radial-gradient(ellipse at 100% 50%, rgba(245,158,11,0.2) 0%, transparent 60%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer(0.1)}
          className="text-center mb-12"
        >
          <motion.span variants={fadeInUp} className="inline-block text-xs font-semibold tracking-widest uppercase text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 mb-4">
            Blood Drives
          </motion.span>
          <motion.h2 variants={fadeInUp} className="text-h1 font-black text-white mb-4">
            Upcoming{' '}
            <span className="gradient-text">donation camps</span>
          </motion.h2>
        </motion.div>

        {/* Campaign Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer(0.1)}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {campaigns.map((camp) => {
            const u = urgencyColors[camp.urgency];
            const filledCount = counts[camp.id] ?? camp.filled;
            const pct = Math.round((filledCount / camp.slots) * 100);
            const isRsvpd = rsvpd[camp.id];

            return (
              <motion.div key={camp.id} variants={fadeInUp}>
                <div className={`glass-card rounded-card p-6 border h-full flex flex-col ${
                  camp.urgency === 'critical' ? 'border-red-500/25' : 'border-white/6'
                }`}>
                  {/* Urgency badge */}
                  <div className="flex items-start justify-between mb-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-badge ${u.bg} ${u.text} border ${u.border}`}>
                      {camp.urgency.toUpperCase()}
                    </span>
                    {camp.urgency === 'critical' && (
                      <span className="text-xs text-red-400 font-bold animate-pulse">⚠ URGENT NEED</span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white mb-3 leading-tight">{camp.title}</h3>

                  {/* Details */}
                  <div className="space-y-2 mb-4 flex-1">
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Calendar className="w-3.5 h-3.5" /> {camp.date}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <MapPin className="w-3.5 h-3.5" /> {camp.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Users className="w-3.5 h-3.5" /> {camp.organizer}
                    </div>
                  </div>

                  {/* Blood groups needed */}
                  <div className="flex gap-2 mb-4">
                    {camp.target.map((g) => (
                      <span key={g} className="text-xs font-bold px-2 py-1 rounded-badge bg-crimson-700/20 text-crimson-400 border border-crimson-700/30">
                        {g}
                      </span>
                    ))}
                  </div>

                  {/* Slots progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-white/45 mb-1.5">
                      <span>{filledCount} registered</span>
                      <span>{camp.slots - filledCount} slots left</span>
                    </div>
                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: pct > 85 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#22c55e' }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Countdown */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-white/35 mr-1">Starts in</span>
                    <CountdownUnit value={camp.days}  label="D" />
                    <span className="text-white/20 text-xs">:</span>
                    <CountdownUnit value={camp.hours} label="H" />
                    <span className="text-white/20 text-xs">:</span>
                    <CountdownUnit value={camp.mins}  label="M" />
                  </div>

                  {/* RSVP button */}
                  <button
                    onClick={() => handleRsvp(camp)}
                    disabled={isRsvpd}
                    className={`w-full py-2.5 rounded-input text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      isRsvpd
                        ? 'bg-green-600/20 text-green-400 border border-green-600/30 cursor-default'
                        : 'bg-crimson-700 hover:bg-crimson-600 text-white ripple-btn'
                    }`}
                  >
                    {isRsvpd ? (
                      <><CheckCircle className="w-4 h-4" /> Registered!</>
                    ) : (
                      'RSVP — Reserve My Slot'
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
