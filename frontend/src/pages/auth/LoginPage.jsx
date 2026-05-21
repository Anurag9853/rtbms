import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff, Heart, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '../../stores/authStore';

const LEFT_STATS = [
  { label: 'Donors online', value: '247' },
  { label: 'Requests today', value: '83' },
  { label: 'Units available', value: '1,420' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleMsg, setGoogleMsg] = useState(false);

  const { login } = useAuth();

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    
    const res = await login(form.email, form.password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrors({ auth: res.error });
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  return (
    <div className="min-h-screen flex dark bg-base-900">
      {/* ── Left brand panel ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-mesh-animated" />
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="pulse-ring w-10 h-10 bg-crimson-700 rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path d="M12 2C12 2 5 9.5 5 14a7 7 0 0014 0C19 9.5 12 2 12 2z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">RTBMS</span>
        </div>

        {/* Center copy */}
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white leading-tight mb-4 text-balance">
            Every second matters in{' '}
            <span className="gradient-text">emergency medicine</span>
          </h1>
          <p className="text-white/60 text-base leading-relaxed mb-8">
            Sign in to access real-time blood availability, manage requests, and connect with donors instantly.
          </p>
          {/* Live stats */}
          <div className="flex gap-6">
            {LEFT_STATS.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-white/40">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 glass rounded-xl p-4 border border-white/10">
          <p className="text-sm text-white/70 italic mb-2">
            "RTBMS found a matching donor in 4 minutes. It saved my patient's life."
          </p>
          <p className="text-xs text-white/40">— Dr. Priya Sharma, AIIMS Delhi</p>
        </div>
      </motion.div>

      {/* ── Right form panel ── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-crimson-700 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M12 2C12 2 5 9.5 5 14a7 7 0 0014 0C19 9.5 12 2 12 2z" /></svg>
            </div>
            <span className="text-base font-bold text-white">RTBMS</span>
          </div>

          <p className="text-sm text-white/45 mb-8">Sign in to your account</p>

          {errors.auth && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-red-400 font-bold">!</span>
              </div>
              <p className="text-sm text-red-400">{errors.auth}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="you@example.com"
                autoComplete="email"
                className={`w-full bg-white/5 border text-white text-sm rounded-input px-4 py-3 placeholder-white/20 outline-none transition-all input-glow-red ${
                  errors.email ? 'border-red-500/50' : 'border-white/10 focus:border-crimson-500/50'
                }`}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <motion.p
                  id="email-error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 mt-1.5 flex items-center gap-1"
                >
                  ⚠ {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-crimson-400 hover:text-crimson-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full bg-white/5 border text-white text-sm rounded-input px-4 py-3 pr-12 placeholder-white/20 outline-none transition-all input-glow-red ${
                    errors.password ? 'border-red-500/50' : 'border-white/10 focus:border-crimson-500/50'
                  }`}
                  aria-describedby={errors.password ? 'pw-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  id="pw-error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 mt-1.5"
                >
                  ⚠ {errors.password}
                </motion.p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-crimson-700 hover:bg-crimson-600 disabled:opacity-60 text-white font-semibold py-3 rounded-input transition-all duration-200 ripple-btn flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-xs text-white/25">or continue with</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={() => { setGoogleMsg(true); setTimeout(() => setGoogleMsg(false), 3500); }}
              className="w-full glass border border-white/12 hover:bg-white/8 text-white/70 hover:text-white text-sm font-medium py-3 rounded-input transition-all flex items-center justify-center gap-3"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            {googleMsg && (
              <p className="text-xs text-amber-400/80 text-center -mt-1">
                ⚠ Google sign-in is not yet configured on this server. Please use email &amp; password.
              </p>
            )}
          </form>

          <p className="text-sm text-white/40 text-center mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-crimson-400 hover:text-crimson-300 font-medium transition-colors">
              Register now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
