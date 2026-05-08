import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Lock, Bell, Palette, Trash2, ChevronRight,
  X, Save, Eye, EyeOff, Sun, Moon, Monitor, Check
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { API } from '../../stores/authStore';
import toast from 'react-hot-toast';
import { fadeInUp, staggerContainer } from '../../lib/design-system';

// ── Profile Panel ────────────────────────────────────────────────────────────
function ProfilePanel({ user, onClose }) {
  const { updateUser } = useAuthStore();
  const [form, setForm] = useState({
    name:  user?.name  ?? '',
    phone: user?.phone ?? '',
    city:  user?.city  ?? '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.patch('/auth/profile', form);
      updateUser(res.data.user ?? form);
      toast.success('Profile updated!');
      onClose();
    } catch {
      // Demo — just apply locally
      updateUser(form);
      toast.success('Profile updated! (demo mode)');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {[
        { id: 'name',  label: 'Full Name',  type: 'text', placeholder: 'Dr. Priya Sharma' },
        { id: 'phone', label: 'Phone',      type: 'tel',  placeholder: '+91 98765 43210' },
        { id: 'city',  label: 'City',       type: 'text', placeholder: 'Delhi' },
      ].map(({ id, label, type, placeholder }) => (
        <div key={id}>
          <label className="block text-xs font-semibold text-white/55 uppercase tracking-wider mb-1.5">{label}</label>
          <input
            type={type}
            value={form[id]}
            onChange={(e) => set(id, e.target.value)}
            placeholder={placeholder}
            className="w-full bg-white/5 border border-white/10 focus:border-crimson-500/50 text-white text-sm rounded-input px-4 py-2.5 outline-none transition-all input-glow-red placeholder-white/20"
          />
        </div>
      ))}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 text-sm text-white/60 border border-white/15 hover:border-white/30 py-2.5 rounded-input transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-crimson-700 hover:bg-crimson-600 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-input transition-all flex items-center justify-center gap-2"
        >
          {saving ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          ) : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

// ── Security Panel ───────────────────────────────────────────────────────────
function SecurityPanel({ onClose }) {
  const [form, setForm] = useState({ current: '', password: '', confirm: '' });
  const [show, setShow] = useState({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.current)                              e.current  = 'Required';
    if (form.password.length < 8)                   e.password = 'Minimum 8 characters';
    if (form.password !== form.confirm)             e.confirm  = 'Passwords do not match';
    return e;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSaving(true);
    try {
      await API.patch('/auth/password', { current_password: form.current, password: form.password, password_confirmation: form.confirm });
      toast.success('Password changed!');
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password.';
      setErrors({ current: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {[
        { id: 'current',  label: 'Current Password', placeholder: '••••••••' },
        { id: 'password', label: 'New Password',      placeholder: '8+ characters' },
        { id: 'confirm',  label: 'Confirm Password',  placeholder: '••••••••' },
      ].map(({ id, label, placeholder }) => (
        <div key={id}>
          <label className="block text-xs font-semibold text-white/55 uppercase tracking-wider mb-1.5">{label}</label>
          <div className="relative">
            <input
              type={show[id] ? 'text' : 'password'}
              value={form[id]}
              onChange={(e) => set(id, e.target.value)}
              placeholder={placeholder}
              className={`w-full bg-white/5 border text-white text-sm rounded-input px-4 py-2.5 pr-10 outline-none placeholder-white/20 ${errors[id] ? 'border-red-500/50' : 'border-white/10 focus:border-crimson-500/50'}`}
            />
            <button
              type="button"
              onClick={() => setShow((p) => ({ ...p, [id]: !p[id] }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              {show[id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors[id] && <p className="text-xs text-red-400 mt-1">⚠ {errors[id]}</p>}
        </div>
      ))}
      <div className="flex items-center gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 text-sm text-white/60 border border-white/15 hover:border-white/30 py-2.5 rounded-input transition-all">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 bg-crimson-700 hover:bg-crimson-600 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-input transition-all flex items-center justify-center gap-2">
          {saving ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg> : <Lock className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Change Password'}
        </button>
      </div>
    </form>
  );
}

// ── Notifications Panel ──────────────────────────────────────────────────────
const NOTIF_PREFS = [
  { id: 'emergency',     label: 'Emergency Alerts',    desc: 'Real-time alerts for critical blood requests' },
  { id: 'inventory',     label: 'Inventory Updates',   desc: 'Low stock and critical shortage notifications' },
  { id: 'request_status',label: 'Request Status',      desc: 'Updates when your request status changes' },
  { id: 'campaigns',     label: 'Blood Drive Campaigns', desc: 'New drives and RSVP reminders' },
  { id: 'eligibility',   label: 'Donation Eligibility', desc: 'Reminder when you become eligible to donate' },
];

function NotificationsPanel({ onClose }) {
  const [prefs, setPrefs] = useState({
    emergency: true, inventory: true, request_status: true, campaigns: false, eligibility: true,
  });
  const [saving, setSaving] = useState(false);

  const toggle = (id) => setPrefs((p) => ({ ...p, [id]: !p[id] }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate API
    toast.success('Notification preferences saved');
    setSaving(false);
    onClose();
  };

  return (
    <div className="space-y-3">
      {NOTIF_PREFS.map((pref) => (
        <div key={pref.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-all">
          <div>
            <p className="text-sm font-medium text-white">{pref.label}</p>
            <p className="text-xs text-white/40 mt-0.5">{pref.desc}</p>
          </div>
          <button
            onClick={() => toggle(pref.id)}
            className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${prefs[pref.id] ? 'bg-crimson-700' : 'bg-white/10'}`}
            role="switch"
            aria-checked={prefs[pref.id]}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs[pref.id] ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-3 pt-3">
        <button onClick={onClose} className="flex-1 text-sm text-white/60 border border-white/15 hover:border-white/30 py-2.5 rounded-input transition-all">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex-1 bg-crimson-700 hover:bg-crimson-600 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-input transition-all flex items-center justify-center gap-2">
          {saving ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg> : <Check className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}

// ── Appearance Panel ─────────────────────────────────────────────────────────
function AppearancePanel({ onClose }) {
  const [theme, setTheme] = useState('dark');
  const options = [
    { id: 'dark',   Icon: Moon,    label: 'Dark',   desc: 'Easy on the eyes' },
    { id: 'light',  Icon: Sun,     label: 'Light',  desc: 'Bright and clean' },
    { id: 'system', Icon: Monitor, label: 'System', desc: 'Follow OS preference' },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-white/40 mb-4">Choose your preferred interface theme</p>
      {options.map(({ id, Icon, label, desc }) => (
        <button
          key={id}
          onClick={() => setTheme(id)}
          className={`w-full flex items-center gap-3 p-3.5 rounded-lg border transition-all text-left ${
            theme === id ? 'bg-crimson-700/15 border-crimson-700/40 text-white' : 'bg-white/3 border-white/8 text-white/60 hover:bg-white/5'
          }`}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-xs text-white/40">{desc}</p>
          </div>
          {theme === id && <Check className="w-4 h-4 text-crimson-400 flex-shrink-0" />}
        </button>
      ))}
      <div className="flex gap-3 pt-3">
        <button onClick={onClose} className="flex-1 text-sm text-white/60 border border-white/15 py-2.5 rounded-input transition-all">Cancel</button>
        <button onClick={() => { toast.success('Theme saved (dark mode active)'); onClose(); }} className="flex-1 bg-crimson-700 hover:bg-crimson-600 text-white text-sm font-semibold py-2.5 rounded-input transition-all">
          Apply Theme
        </button>
      </div>
    </div>
  );
}

// ── Main Settings Page ───────────────────────────────────────────────────────
export function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [activePanel, setActivePanel] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const sections = [
    { id: 'profile',       Icon: User,    title: 'Profile',        desc: 'Update your name, phone, and city' },
    { id: 'security',      Icon: Lock,    title: 'Security',       desc: 'Password and account security' },
    { id: 'notifications', Icon: Bell,    title: 'Notifications',  desc: 'Choose what alerts you receive' },
    { id: 'appearance',    Icon: Palette, title: 'Appearance',     desc: 'Dark mode and display preferences' },
  ];

  const handleDelete = async () => {
    if (!window.confirm('Are you sure? This action cannot be undone.')) return;
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.error('Account deletion is disabled in demo mode');
    setDeleting(false);
  };

  const PanelComponent = {
    profile:       <ProfilePanel       user={user} onClose={() => setActivePanel(null)} />,
    security:      <SecurityPanel                  onClose={() => setActivePanel(null)} />,
    notifications: <NotificationsPanel             onClose={() => setActivePanel(null)} />,
    appearance:    <AppearancePanel                onClose={() => setActivePanel(null)} />,
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Settings</h1>
        <p className="text-sm text-white/40">Manage your account and preferences</p>
      </div>

      {/* User info summary */}
      {user && (
        <div className="glass-card rounded-card p-4 border border-white/8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-crimson-700 to-crimson-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
            {user.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-white/40">{user.email} · <span className="capitalize">{user.role?.replace('_', ' ')}</span></p>
          </div>
        </div>
      )}

      {/* Section list */}
      <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.06)} className="space-y-3">
        {sections.map(({ id, Icon, title, desc }) => (
          <motion.div key={id} variants={fadeInUp}>
            <button
              onClick={() => setActivePanel(activePanel === id ? null : id)}
              className={`w-full glass-card rounded-card p-5 border flex items-center gap-4 cursor-pointer hover:bg-white/3 transition-all text-left ${
                activePanel === id ? 'border-crimson-700/30 bg-crimson-700/5' : 'border-white/6'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activePanel === id ? 'bg-crimson-700/20 border border-crimson-700/30' : 'bg-white/5 border border-white/10'
              }`}>
                <Icon className={`w-5 h-5 ${activePanel === id ? 'text-crimson-400' : 'text-white/60'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-xs text-white/40">{desc}</p>
              </div>
              <ChevronRight className={`w-4 h-4 text-white/25 transition-transform ${activePanel === id ? 'rotate-90' : ''}`} />
            </button>

            {/* Inline panel */}
            <AnimatePresence>
              {activePanel === id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="glass-card rounded-b-card p-5 border border-t-0 border-crimson-700/20 bg-crimson-700/3">
                    {PanelComponent[id]}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full glass-card rounded-card p-5 border border-red-500/15 flex items-center gap-4 cursor-pointer hover:bg-red-500/5 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            {deleting
              ? <svg className="w-5 h-5 text-red-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
              : <Trash2 className="w-5 h-5 text-red-400" />
            }
          </div>
          <div>
            <p className="text-sm font-semibold text-red-400">Delete Account</p>
            <p className="text-xs text-white/35">Permanently remove your data — this cannot be undone</p>
          </div>
        </button>
      </motion.div>
    </div>
  );
}
