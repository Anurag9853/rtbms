import { motion } from 'framer-motion';
import {
  Brain, Radio, AlertTriangle, UserCheck,
  BarChart2, Building2
} from 'lucide-react';
import { TiltCard } from '../ui/TiltCard';
import { staggerContainer, fadeInUp } from '../../lib/design-system';

const features = [
  {
    icon: Brain,
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.1)',
    border: 'rgba(37,99,235,0.2)',
    title: 'AI Blood Assistant',
    description: 'GPT-4o powered chatbot that queries live database data. Ask in natural language — get instant, accurate matches.',
    badge: 'AI-Powered',
  },
  {
    icon: Radio,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.2)',
    title: 'Real-Time Blood Tracking',
    description: 'Live inventory updates via WebSockets. Inventory changes propagate instantly across all connected hospitals.',
    badge: 'Live',
  },
  {
    icon: AlertTriangle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.2)',
    title: 'Emergency Requests',
    description: 'One-tap SOS mode. Critical requests broadcast to nearby donors instantly with pulsing alerts.',
    badge: 'Critical',
  },
  {
    icon: UserCheck,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.2)',
    title: 'Smart Donor Matching',
    description: 'Geo-aware matching engine finds compatible donors by blood group, proximity, and eligibility status.',
    badge: 'Geo-Aware',
  },
  {
    icon: BarChart2,
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.1)',
    border: 'rgba(168,85,247,0.2)',
    title: 'Live Analytics',
    description: 'Real-time dashboards showing demand trends, donation rates, shortage forecasts, and city-level heatmaps.',
    badge: 'Insights',
  },
  {
    icon: Building2,
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.1)',
    border: 'rgba(6,182,212,0.2)',
    title: 'Hospital Coordination',
    description: 'Dedicated hospital portal for request management, approval workflows, and multi-facility inventory sharing.',
    badge: 'Enterprise',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 md:py-32 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-base-950" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(192,57,43,0.15) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer(0.1)}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-crimson-400 bg-crimson-400/10 border border-crimson-400/20 rounded-full px-4 py-1.5 mb-4">
              Platform Features
            </span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-h1 font-black text-white mb-4 text-balance">
            Everything you need to{' '}
            <span className="gradient-text">save lives faster</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-white/50 max-w-2xl mx-auto text-balance">
            A complete blood management ecosystem — from real-time donor matching to AI-powered emergency response.
          </motion.p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer(0.08, 0.1)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={fadeInUp}>
                <TiltCard className="h-full">
                  <div
                    className="h-full glass-card rounded-card p-6 cursor-default group transition-all duration-300"
                    style={{
                      borderColor: `${feature.border}`,
                      border: `1px solid ${feature.border}`,
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                      style={{ background: feature.bg, border: `1px solid ${feature.border}` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: feature.color }} />
                    </div>

                    {/* Badge */}
                    <span
                      className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-badge mb-3"
                      style={{
                        background: feature.bg,
                        color: feature.color,
                        border: `1px solid ${feature.border}`,
                      }}
                    >
                      {feature.badge}
                    </span>

                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>

                    {/* Hover bottom gradient line */}
                    <div
                      className="mt-5 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: `linear-gradient(90deg, ${feature.color}, transparent)` }}
                    />
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
