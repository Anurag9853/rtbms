import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { API } from '../../stores/authStore';

export function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address'); return; }
    setLoading(true);
    setError('');
    try {
      await API.post('/auth/forgot-password', { email });
    } catch (err) {
      // Even if API fails, show success to prevent email enumeration
      // unless it's a server error
      if (err.response?.status === 500) {
        setError('Server error. Please try again.');
        setLoading(false);
        return;
      }
    }
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-base-900 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-crimson-700/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-crimson-700 to-crimson-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M12 2C12 2 5 9.5 5 14a7 7 0 0014 0C19 9.5 12 2 12 2z" />
              </svg>
            </div>
            <span className="text-xl font-black text-white tracking-tight">RTBMS</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card rounded-2xl p-8 border border-white/8"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
        >
          {!sent ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-black text-white mb-2">Forgot Password?</h1>
                <p className="text-sm text-white/50">
                  Enter your registered email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/55 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full bg-white/5 border border-white/10 focus:border-crimson-500/50 text-white text-sm rounded-input pl-10 pr-4 py-3 outline-none transition-all input-glow-red placeholder-white/20"
                    />
                  </div>
                  {error && <p className="text-xs text-red-400 mt-1.5">⚠ {error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-crimson-700 hover:bg-crimson-600 disabled:opacity-60 text-white font-semibold py-3 rounded-input transition-all flex items-center justify-center gap-2 ripple-btn"
                >
                  {loading ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                  ) : <Mail className="w-4 h-4" />}
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 bg-green-500/15 border border-green-500/25 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-black text-white mb-2">Check Your Email</h2>
              <p className="text-sm text-white/50 mb-6">
                If an account exists for <span className="text-white font-medium">{email}</span>, you'll receive a password reset link within a few minutes.
              </p>
              <p className="text-xs text-white/30">
                Didn't receive it? Check your spam folder or{' '}
                <button onClick={() => setSent(false)} className="text-crimson-400 hover:text-crimson-300 transition-colors">
                  try again
                </button>
              </p>
            </motion.div>
          )}

          <div className="mt-6 pt-5 border-t border-white/6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
