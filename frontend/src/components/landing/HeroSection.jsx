import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Search, Zap, MapPin } from 'lucide-react';
import { TypingAnimation } from '../ui/TypingAnimation';
import { ActivityTicker } from '../ui/ActivityTicker';
import { CountUpNumber } from '../ui/CountUpNumber';
import { MagneticButton } from '../ui/MagneticButton';
import { BLOOD_GROUPS } from '../../lib/design-system';

const HERO_HEADLINE = 'AI-powered emergency blood management platform — saving lives in real time';

const stats = [
  { value: 12000, label: 'Donors Registered', suffix: '+', icon: Heart },
  { value: 850,   label: 'Hospitals Connected', suffix: '+', icon: Zap },
  { value: 50000, label: 'Lives Impacted', suffix: '+', icon: ArrowRight },
  { value: 99.9,  label: 'Uptime SLA', suffix: '%',  isDecimal: true, icon: Zap },
];

export function HeroSection() {
  const [searchGroup, setSearchGroup] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 500], ['0%', '20%']);
  const contentY = useTransform(scrollY, [0, 500], ['0%', '8%']);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section
      className="relative min-h-screen flex flex-col overflow-hidden"
      ref={containerRef}
      id="hero"
    >
      {/* ── Animated Gradient Mesh Background ───────────── */}
      <motion.div
        className="absolute inset-0 bg-mesh-animated"
        style={{ y: bgY }}
      />

      {/* ── Parallax Floating Orbs ──────────────────────── */}
      <motion.div
        className="absolute top-20 right-[15%] w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(192,57,43,0.2) 0%, transparent 70%)',
          y: useTransform(scrollY, [0, 500], ['0%', '30%']),
        }}
      />
      <motion.div
        className="absolute bottom-40 left-[10%] w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
          y: useTransform(scrollY, [0, 500], ['0%', '-20%']),
        }}
      />

      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-3">
          {/* Blood Drop SVG Logo */}
          <div className="relative">
            <div className="pulse-ring w-10 h-10 bg-crimson-700 rounded-full flex items-center justify-center">
              <BloodDropIcon />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">RTBMS</span>
            <span className="ml-2 text-xs text-white/40 hidden sm:inline">v2.0</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How It Works', 'Donors', 'Hospitals'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="text-sm text-white/60 hover:text-white transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2 rounded-input"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-sm bg-crimson-700 hover:bg-crimson-600 text-white px-4 py-2 rounded-input font-medium transition-all duration-200 ripple-btn"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Main Hero Content ────────────────────────────── */}
      <motion.div
        className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-8 pb-16"
        style={{ y: contentY, opacity }}
      >
        {/* Live Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 border border-white/10"
        >
          <span className="pulse-dot">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            <span className="absolute w-2 h-2 rounded-full bg-green-400 inline-block opacity-40"
              style={{ animation: 'pulseDot 2s infinite', inset: '-4px', position: 'absolute', borderRadius: '50%' }} />
          </span>
          <span className="text-xs text-white/70">
            <span className="text-green-400 font-semibold">Live</span> · 247 active donors right now
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white max-w-5xl leading-[1.05] tracking-tight text-balance mb-6"
        >
          <span className="gradient-text">AI-powered</span> emergency blood{' '}
          <br className="hidden md:block" />
          management{' '}
          <span className="relative inline-block">
            platform
            <motion.span
              className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-crimson-700 to-electric-600 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            />
          </span>
        </motion.h1>

        {/* Subheadline with typing */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-lg md:text-xl text-white/55 max-w-2xl leading-relaxed mb-10 text-balance"
        >
          Connect donors, hospitals, and blood banks in real time.
          Powered by GPT-4o — finding matches in seconds, not hours.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
        >
          <MagneticButton
            className="inline-flex items-center gap-2.5 bg-crimson-700 hover:bg-crimson-600 text-white text-base font-semibold px-7 py-3.5 rounded-pill shadow-glow-red"
          >
            <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
            Request Blood Now
            <ArrowRight className="w-4 h-4" />
          </MagneticButton>

          <MagneticButton
            className="inline-flex items-center gap-2.5 gradient-border text-white text-base font-medium px-7 py-3.5 rounded-pill bg-white/5 hover:bg-white/10 border border-white/15"
          >
            <Heart className="w-4 h-4 text-crimson-400" />
            Become a Donor
          </MagneticButton>
        </motion.div>

        {/* Quick Search Widget */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="w-full max-w-2xl glass-card rounded-2xl p-4 mb-10"
        >
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3 font-medium">Quick Blood Search</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[140px]">
              <select
                value={searchGroup}
                onChange={(e) => setSearchGroup(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-input px-3 py-2.5 text-sm focus:border-crimson-500 focus:bg-white/8 transition-all outline-none input-glow-red appearance-none cursor-pointer"
                aria-label="Select blood group"
              >
                <option value="">Blood Group</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g} className="bg-base-800">{g}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Enter city..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-input pl-9 pr-3 py-2.5 text-sm focus:border-crimson-500 transition-all outline-none input-glow-red placeholder-white/25"
                />
              </div>
            </div>
            <button
              className="inline-flex items-center gap-2 bg-crimson-700 hover:bg-crimson-600 text-white px-5 py-2.5 rounded-input text-sm font-semibold transition-all ripple-btn whitespace-nowrap"
              aria-label="Search for blood"
            >
              <Search className="w-4 h-4" />
              Find Blood
            </button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 w-full max-w-3xl"
        >
          {stats.map((stat, i) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-black text-white mb-1">
                {stat.isDecimal ? (
                  <span>{stat.value}{stat.suffix}</span>
                ) : (
                  <CountUpNumber end={stat.value} suffix={stat.suffix} duration={2000 + i * 200} />
                )}
              </div>
              <div className="text-xs text-white/40 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Activity Ticker ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="relative z-10 border-t border-white/5 py-2"
      >
        <ActivityTicker />
      </motion.div>

      {/* ── Floating AI Preview Card ─────────────────────── */}
      <motion.div
        className="absolute right-8 top-1/3 hidden xl:block"
        initial={{ opacity: 0, x: 60, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ animation: 'floatAnim 6s ease-in-out infinite' }}
      >
        <div className="glass-card rounded-2xl p-4 w-72 border border-electric-600/20 shadow-glow-blue">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-electric-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-white">RTBMS AI</span>
            <span className="ml-auto text-xs text-electric-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-electric-400 animate-pulse inline-block" />
              Online
            </span>
          </div>
          <div className="chat-bubble-ai p-3 text-sm text-white/80 leading-relaxed">
            <TypingAnimation
              text="Found 3 O- donors within 5km of AIIMS Delhi. Nearest: Rahul M., available now. Shall I connect?"
              speed={30}
              delay={1500}
            />
          </div>
          <div className="flex gap-2 mt-3">
            {['O- in Delhi', 'Nearest bank', 'Am I eligible?'].map((chip) => (
              <span
                key={chip}
                className="text-xs px-2.5 py-1 rounded-full bg-electric-600/15 border border-electric-600/25 text-electric-300 cursor-pointer hover:bg-electric-600/25 transition-colors whitespace-nowrap"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function BloodDropIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
      <path d="M12 2C12 2 5 9.5 5 14a7 7 0 0014 0C19 9.5 12 2 12 2z" />
    </svg>
  );
}
