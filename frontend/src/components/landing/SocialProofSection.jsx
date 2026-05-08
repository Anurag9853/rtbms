import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Star, TrendingUp } from 'lucide-react';
import { CountUpNumber } from '../ui/CountUpNumber';
import { staggerContainer, fadeInUp } from '../../lib/design-system';

const testimonials = [
  {
    quote: "RTBMS helped us find AB- blood for an emergency surgery in under 10 minutes. It's genuinely life-saving technology.",
    name: 'Dr. Priya Sharma',
    role: 'Head of Trauma, AIIMS Delhi',
    initials: 'PS',
    color: 'from-crimson-700 to-crimson-500',
  },
  {
    quote: "As a blood bank coordinator, the real-time inventory system and AI alerts have reduced our wastage by 40%. Incredible platform.",
    name: 'Rajesh Gupta',
    role: 'Coordinator, LifeCare Blood Bank',
    initials: 'RG',
    color: 'from-electric-700 to-electric-500',
  },
  {
    quote: "I've donated 7 times through RTBMS. The eligibility tracker tells me exactly when I'm ready again. So smooth.",
    name: 'Ananya Krishnan',
    role: 'Regular Donor, Bangalore',
    initials: 'AK',
    color: 'from-purple-700 to-purple-500',
  },
];

const stats = [
  { value: 12000, label: 'Registered Donors', suffix: '+' },
  { value: 850,   label: 'Partner Hospitals', suffix: '+' },
  { value: 99.9,  label: 'Uptime',            suffix: '%', isStatic: true },
  { value: 50000, label: 'Lives Impacted',    suffix: '+' },
];

const partnerLogos = [
  'AIIMS', 'Apollo', 'Fortis', 'Manipal', 'Max Healthcare',
  'Lilavati', 'Narayana', 'Medanta', 'JIPMER', 'PGIMER',
];

export function SocialProofSection() {
  return (
    <section id="trust" className="relative py-24 md:py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-base-900" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer(0.1)}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-4 py-1.5 mb-4">
            <Shield className="w-3.5 h-3.5" /> Trusted Platform
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-h1 font-black text-white mb-4">
            Trusted by doctors,{' '}
            <span className="gradient-text">loved by donors</span>
          </motion.h2>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer(0.1)}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              className="glass-card rounded-card p-6 text-center border border-white/6"
            >
              <div className="text-3xl md:text-4xl font-black text-white mb-1">
                {stat.isStatic ? (
                  <span>{stat.value}{stat.suffix}</span>
                ) : (
                  <CountUpNumber end={stat.value} suffix={stat.suffix} />
                )}
              </div>
              <div className="text-xs text-white/45 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer(0.1)}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={fadeInUp}>
              <div className="glass-card rounded-card p-6 h-full border border-white/6 flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-sm text-white/70 leading-relaxed flex-1 mb-5">
                  "{t.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-white/40">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Partner Hospital Marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-center text-xs text-white/30 uppercase tracking-widest mb-6 font-medium">Trusted by India's leading hospitals</p>
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-20 z-10" style={{ background: 'linear-gradient(to right, #0f0f14, transparent)' }} />
            <div className="absolute right-0 top-0 bottom-0 w-20 z-10" style={{ background: 'linear-gradient(to left, #0f0f14, transparent)' }} />
            <div className="ticker-wrap">
              <div className="ticker-content gap-8" style={{ animationDuration: '20s' }}>
                {[...partnerLogos, ...partnerLogos].map((logo, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 glass px-6 py-3 rounded-input border border-white/8 text-sm font-semibold text-white/50 hover:text-white/80 transition-colors"
                  >
                    {logo}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
