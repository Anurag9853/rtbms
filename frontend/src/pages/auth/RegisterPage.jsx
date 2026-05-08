import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, Building2, Droplets, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../../stores/authStore';

const ROLES = [
  {
    id: 'donor',
    icon: Heart,
    color: '#c0392b',
    bg: 'rgba(192,57,43,0.12)',
    border: 'rgba(192,57,43,0.3)',
    label: 'Blood Donor',
    desc: 'Register to donate blood and save lives. Track eligibility, history, and nearby drives.',
  },
  {
    id: 'hospital',
    icon: Building2,
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.12)',
    border: 'rgba(37,99,235,0.3)',
    label: 'Hospital / Requester',
    desc: 'Access real-time blood availability and submit emergency requests for your patients.',
  },
  {
    id: 'blood_bank',
    icon: Droplets,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.3)',
    label: 'Blood Bank',
    desc: 'Manage your inventory, receive requests, and connect with donors and hospitals.',
  },
];

const steps = ['Choose Role', 'Basic Info', 'Confirm'];

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState(searchParams.get('role') || '');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', city: '', bloodGroup: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const validateStep1 = () => {
    if (!form.name.trim()) return { name: 'Full name is required' };
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) return { email: 'Valid email is required' };
    if (!form.password || form.password.length < 8) return { password: 'Minimum 8 characters' };
    return {};
  };

  const handleNext = () => {
    if (step === 0 && !role) return;
    if (step === 1) {
      const e = validateStep1();
      if (Object.keys(e).length) { setErrors(e); return; }
    }
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const res = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      password_confirmation: form.password,
      role: role,
      phone: form.phone || null,
      city: form.city || null,
      blood_group: form.bloodGroup || null,
    });
    
    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrors({ auth: res.error });
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="min-h-screen flex dark bg-base-900">
      {/* Left panel */}
      <div className="hidden lg:flex w-2/5 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-animated" />
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-crimson-700 rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M12 2C12 2 5 9.5 5 14a7 7 0 0014 0C19 9.5 12 2 12 2z" /></svg>
          </div>
          <span className="text-base font-bold text-white">RTBMS</span>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white mb-3">Join the network saving lives</h2>
          <p className="text-white/55 text-sm leading-relaxed">Register in under 2 minutes. Start making an impact today.</p>
          {/* Step indicator */}
          <div className="mt-8 space-y-3">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? 'bg-green-500 text-white' :
                  i === step ? 'bg-crimson-700 text-white' : 'bg-white/10 text-white/30'
                }`}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-sm transition-colors ${i <= step ? 'text-white' : 'text-white/30'}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 glass rounded-xl p-4 border border-white/10">
          <p className="text-xs text-white/40">Already have an account?</p>
          <Link to="/login" className="text-sm text-crimson-400 hover:text-crimson-300 font-medium">Sign in instead →</Link>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-crimson-700 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M12 2C12 2 5 9.5 5 14a7 7 0 0014 0C19 9.5 12 2 12 2z" /></svg>
            </div>
            <span className="text-base font-bold text-white">RTBMS</span>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-white/8 rounded-full mb-8 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-crimson-700 to-electric-600 rounded-full"
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          <AnimatePresence mode="wait">
            {/* Step 0: Role selection */}
            {step === 0 && (
              <motion.div
                key="step0"
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <h2 className="text-2xl font-black text-white mb-1">How will you use RTBMS?</h2>
                <p className="text-sm text-white/45 mb-8">Select your account type to get started</p>
                <div className="space-y-3">
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setRole(r.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-card border text-left transition-all duration-200 ${
                          role === r.id
                            ? 'border-2 shadow-lg'
                            : 'border bg-white/3 hover:bg-white/6 border-white/10'
                        }`}
                        style={role === r.id ? {
                          background: r.bg,
                          borderColor: r.border,
                          boxShadow: `0 0 0 1px ${r.border}`,
                        } : {}}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: r.bg, border: `1px solid ${r.border}` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: r.color }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{r.label}</p>
                          <p className="text-xs text-white/45 leading-relaxed">{r.desc}</p>
                        </div>
                        {role === r.id && (
                          <Check className="w-4 h-4 flex-shrink-0" style={{ color: r.color }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 1: Basic info */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <h2 className="text-2xl font-black text-white mb-1">Basic Information</h2>
                <p className="text-sm text-white/45 mb-8">Tell us a bit about yourself</p>
                <div className="space-y-4">
                  {[
                    { id: 'name',  label: 'Full Name',    type: 'text',     placeholder: 'Dr. Priya Sharma' },
                    { id: 'email', label: 'Email Address',type: 'email',    placeholder: 'you@example.com' },
                    { id: 'password', label: 'Password',  type: 'password', placeholder: '8+ characters' },
                    { id: 'phone', label: 'Phone (optional)', type: 'tel',  placeholder: '+91 98765 43210' },
                    { id: 'city',  label: 'City',         type: 'text',     placeholder: 'Mumbai' },
                  ].map(({ id, label, type, placeholder }) => (
                    <div key={id}>
                      <label htmlFor={id} className="block text-xs font-semibold text-white/55 uppercase tracking-wider mb-1.5">{label}</label>
                      <input
                        id={id}
                        type={type}
                        value={form[id]}
                        onChange={(e) => { setForm((p) => ({ ...p, [id]: e.target.value })); setErrors((p) => ({ ...p, [id]: '' })); }}
                        placeholder={placeholder}
                        className={`w-full bg-white/5 border text-white text-sm rounded-input px-4 py-2.5 placeholder-white/20 outline-none transition-all input-glow-red ${
                          errors[id] ? 'border-red-500/50' : 'border-white/10 focus:border-crimson-500/50'
                        }`}
                      />
                      {errors[id] && <p className="text-xs text-red-400 mt-1">⚠ {errors[id]}</p>}
                    </div>
                  ))}
                  {role === 'donor' && (
                    <div>
                      <label className="block text-xs font-semibold text-white/55 uppercase tracking-wider mb-1.5">Blood Group</label>
                      <div className="grid grid-cols-4 gap-2">
                        {BLOOD_GROUPS.map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, bloodGroup: g }))}
                            className={`py-2 rounded-input text-sm font-bold transition-all ${
                              form.bloodGroup === g
                                ? 'bg-crimson-700 text-white border border-crimson-500/50'
                                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                            }`}
                          >{g}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Confirm */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Ready to register!</h2>
                <p className="text-sm text-white/45 mb-8">Review your details and create your account</p>
                <div className="glass-card rounded-card p-5 text-left space-y-3 mb-8 border border-white/8">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Role</span>
                    <span className="text-white font-medium capitalize">{role.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Name</span>
                    <span className="text-white font-medium">{form.name || '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Email</span>
                    <span className="text-white font-medium">{form.email || '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">City</span>
                    <span className="text-white font-medium">{form.city || '—'}</span>
                  </div>
                  {form.bloodGroup && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Blood Group</span>
                      <span className="text-crimson-400 font-bold">{form.bloodGroup}</span>
                    </div>
                  )}
                </div>
                {errors.auth && (
                  <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-400 font-bold">!</span>
                    </div>
                    <p className="text-sm text-red-400">{errors.auth}</p>
                  </div>
                )}
                <p className="text-xs text-white/30 mb-6">By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 text-sm text-white/60 hover:text-white border border-white/15 hover:border-white/30 px-4 py-2.5 rounded-input transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button
              onClick={step < 2 ? handleNext : handleSubmit}
              disabled={step === 0 && !role}
              className="flex-1 bg-crimson-700 hover:bg-crimson-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-input transition-all flex items-center justify-center gap-2 ripple-btn"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              ) : step === 2 ? (
                <><Check className="w-4 h-4" /> Create Account</>
              ) : (
                <>Continue <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

          {step === 0 && (
            <p className="text-sm text-white/35 text-center mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-crimson-400 hover:text-crimson-300 font-medium">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
