import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Mail, CheckCircle, ExternalLink } from 'lucide-react';
import { staggerContainer, fadeInUp } from '../../lib/design-system';

const footerLinks = {
  Product: ['Features', 'Analytics', 'AI Assistant', 'Emergency Mode', 'Blood Map'],
  Platform: ['For Donors', 'For Hospitals', 'For Blood Banks', 'API Docs', 'Status'],
  Company: ['About', 'Blog', 'Careers', 'Press Kit', 'Contact'],
  Legal: ['Privacy Policy', 'Terms of Service', 'HIPAA Compliance', 'Cookie Policy'],
};

export function CTAFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setSubscribed(true);
  };

  return (
    <footer className="relative overflow-hidden grain-texture">
      {/* Dark bg with subtle grain */}
      <div className="absolute inset-0 bg-base-950" />
      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(192,57,43,0.15) 0%, transparent 50%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* CTA Block */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer(0.1)}
          className="text-center py-24 border-b border-white/6"
        >
          <motion.span variants={fadeInUp} className="inline-block text-xs font-semibold tracking-widest uppercase text-crimson-400 bg-crimson-400/10 border border-crimson-400/20 rounded-full px-4 py-1.5 mb-6">
            Join the Mission
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 max-w-3xl mx-auto leading-tight text-balance"
          >
            Be the reason{' '}
            <span className="gradient-text-warm">someone survives</span>{' '}
            today
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-white/50 max-w-xl mx-auto mb-10">
            Join 12,000+ donors and 850+ hospitals on the platform that's making blood shortages history.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Link
              to="/register?role=donor"
              className="inline-flex items-center gap-2.5 relative overflow-hidden rounded-pill px-7 py-3.5 text-base font-semibold text-white group"
              style={{ background: 'linear-gradient(135deg, #c0392b, #e74c3c)' }}
            >
              <Heart className="w-4 h-4" />
              Become a Donor
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register?role=hospital"
              className="inline-flex items-center gap-2.5 gradient-border rounded-pill px-7 py-3.5 text-base font-medium text-white/80 hover:text-white bg-white/4 hover:bg-white/8 border border-white/15 transition-all"
            >
              Register Your Hospital
            </Link>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={fadeInUp} className="max-w-md mx-auto">
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 text-green-400 text-sm"
              >
                <CheckCircle className="w-5 h-5" />
                You're subscribed! Thanks for joining.
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="Enter your email"
                    className={`w-full bg-white/5 border text-white text-sm rounded-input px-4 py-2.5 placeholder-white/25 outline-none transition-all input-glow-red ${
                      error ? 'border-red-500/50' : 'border-white/10'
                    }`}
                  />
                  {error && <p className="text-xs text-red-400 mt-1 text-left">{error}</p>}
                </div>
                <button
                  type="submit"
                  className="bg-crimson-700 hover:bg-crimson-600 text-white text-sm font-semibold px-5 py-2.5 rounded-input transition-all whitespace-nowrap ripple-btn"
                >
                  Subscribe
                </button>
              </form>
            )}
            <p className="text-xs text-white/25 mt-2">Platform updates, blood drives, and impact reports. No spam.</p>
          </motion.div>
        </motion.div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-14 border-b border-white/6">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/35 mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/50 hover:text-white/80 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-crimson-700 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M12 2C12 2 5 9.5 5 14a7 7 0 0014 0C19 9.5 12 2 12 2z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white/70">RTBMS</span>
            <span className="text-xs text-white/25">v2.0</span>
          </div>

          <p className="text-xs text-white/25">
            © 2026 RTBMS. Built with{' '}
            <Heart className="w-3 h-3 inline text-crimson-500" /> for a world without blood shortages.
          </p>

          {/* Socials */}
          <div className="flex items-center gap-4">
            {['Twitter/X', 'GitHub', 'LinkedIn', 'Email'].map((label) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-8 h-8 glass rounded-full flex items-center justify-center border border-white/10 text-white/40 hover:text-white hover:border-white/25 transition-all text-xs font-bold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
