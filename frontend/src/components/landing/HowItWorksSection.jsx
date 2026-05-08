import { motion } from 'framer-motion';
import { UserPlus, Search, Zap } from 'lucide-react';
import { staggerContainer, fadeInUp } from '../../lib/design-system';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    color: '#c0392b',
    bg: 'rgba(192,57,43,0.12)',
    border: 'rgba(192,57,43,0.25)',
    title: 'Register as Donor or Hospital',
    description: 'Create your profile in under 2 minutes. Donors set blood group, location, and availability. Hospitals get a dedicated coordinator portal.',
  },
  {
    number: '02',
    icon: Search,
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.12)',
    border: 'rgba(37,99,235,0.25)',
    title: 'Search or Request Blood in Seconds',
    description: 'Use the smart search or ask the AI assistant in plain English. Filter by blood group, proximity, urgency, and live availability.',
  },
  {
    number: '03',
    icon: Zap,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.25)',
    title: 'AI Matches and Connects Instantly',
    description: 'The AI engine finds the best match and sends real-time alerts to compatible donors. Connection happens in seconds, not hours.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-base-950" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(ellipse at 50% 100%, rgba(37,99,235,0.2) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer(0.1)}
          className="text-center mb-16"
        >
          <motion.span variants={fadeInUp} className="inline-block text-xs font-semibold tracking-widest uppercase text-electric-400 bg-electric-400/10 border border-electric-400/20 rounded-full px-4 py-1.5 mb-4">
            How It Works
          </motion.span>
          <motion.h2 variants={fadeInUp} className="text-h1 font-black text-white mb-4">
            From request to rescue —{' '}
            <span className="gradient-text">in 3 steps</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-white/50 max-w-xl mx-auto">
            The fastest path from critical need to life-saving donation.
          </motion.p>
        </motion.div>

        {/* Steps */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={staggerContainer(0.15)}
          className="relative"
        >
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px">
            <motion.div
              className="h-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: 'linear-gradient(90deg, #c0392b, #2563eb, #22c55e)',
                transformOrigin: 'left center',
              }}
            />
            {/* Arrow heads */}
            <div className="absolute top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/2">
              <div className="w-2 h-2 border-t-2 border-r-2 border-electric-500 rotate-45" />
            </div>
            <div className="absolute top-1/2 right-1/3 -translate-y-1/2 translate-x-1/2">
              <div className="w-2 h-2 border-t-2 border-r-2 border-green-500 rotate-45" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  variants={fadeInUp}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Number Badge + Icon */}
                  <div className="relative mb-6">
                    {/* Outer pulse ring for step 3 (active/final) */}
                    {i === 2 && (
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: step.bg,
                          animation: 'pulseRing 2.5s ease-out infinite',
                          transform: 'scale(1.3)',
                        }}
                      />
                    )}
                    <div
                      className="relative w-16 h-16 rounded-full flex items-center justify-center border-2 z-10"
                      style={{ background: step.bg, borderColor: step.border }}
                    >
                      <Icon className="w-7 h-7" style={{ color: step.color }} />
                    </div>
                    {/* Step number */}
                    <div
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                      style={{ background: step.color }}
                    >
                      {i + 1}
                    </div>
                  </div>

                  {/* Vertical connector (mobile) */}
                  {i < steps.length - 1 && (
                    <div className="lg:hidden w-px h-8 mb-2" style={{ background: `linear-gradient(${step.color}, ${steps[i+1].color})` }} />
                  )}

                  <div
                    className="glass-card rounded-card p-6 border w-full"
                    style={{ borderColor: step.border }}
                  >
                    <span className="text-xs font-black tracking-wider text-white/25 mb-2 block">{step.number}</span>
                    <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-sm text-white/55 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
