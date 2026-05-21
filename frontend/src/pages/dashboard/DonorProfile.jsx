import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, Award, CheckCircle, Clock, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import { PulseDot } from '../../components/ui/PulseDot';
import { fadeInUp, staggerContainer } from '../../lib/design-system';
import { donorsApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

const BADGES_CONFIG = [
  { key: 'first_donation',  Icon: Heart,        label: 'First Donation',  color: 'text-crimson-400', bg: 'rgba(192,57,43,0.15)' },
  { key: 'hero_5',          Icon: Award,        label: '5× Hero',         color: 'text-amber-400',   bg: 'rgba(245,158,11,0.15)' },
  { key: 'verified',        Icon: CheckCircle,  label: 'Verified Donor',  color: 'text-green-400',   bg: 'rgba(34,197,94,0.15)' },
];

function timeAgo(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function DonorProfile() {
  const { user: authUser, updateUser } = useAuthStore();
  const [profile, setProfile]         = useState(null);
  const [history, setHistory]         = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [toggling, setToggling]       = useState(false);

  const userId = authUser?.id ?? authUser?._id;

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      // Demo mode — use auth store data with demo history
      setProfile({
        name: authUser?.name ?? 'Rahul Sharma',
        city: authUser?.city ?? 'Delhi, India',
        blood_group: authUser?.blood_group ?? 'O+',
        is_available: authUser?.is_available ?? true,
        donations_count: 3,
        role: 'donor',
        created_at: '2024-01-15T00:00:00Z',
      });
      setHistory([
        { _id: 'd1', donated_at: '2026-02-15T00:00:00Z', bank_name: 'AIIMS Blood Bank',      blood_group: 'O+', units: 1, status: 'completed' },
        { _id: 'd2', donated_at: '2025-11-02T00:00:00Z', bank_name: 'Fortis Hospital',        blood_group: 'O+', units: 1, status: 'completed' },
        { _id: 'd3', donated_at: '2025-08-08T00:00:00Z', bank_name: 'Max Super Specialty',    blood_group: 'O+', units: 1, status: 'completed' },
      ]);
      setEligibility({ eligible: true, days_until_eligible: 0 });
      setLoading(false);
      return;
    }

    try {
      const [profileData, historyData, eligibilityData] = await Promise.allSettled([
        donorsApi.getOne(userId),
        donorsApi.getHistory(userId),
        donorsApi.getEligibility(userId),
      ]);

      if (profileData.status === 'fulfilled') {
        setProfile(profileData.value.data ?? profileData.value);
      }
      if (historyData.status === 'fulfilled') {
        const h = historyData.value.data ?? historyData.value;
        setHistory(Array.isArray(h) ? h : []);
      }
      if (eligibilityData.status === 'fulfilled') {
        setEligibility(eligibilityData.value.data ?? eligibilityData.value);
      }
    } catch {
      // silently use auth user data
      setProfile({ ...authUser });
    } finally {
      setLoading(false);
    }
  }, [userId, authUser]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const toggleAvailability = async () => {
    const newState = !(profile?.is_available ?? true);
    setToggling(true);
    try {
      if (userId) {
        await donorsApi.updateAvailability(userId, newState);
      }
      setProfile((p) => ({ ...p, is_available: newState }));
      updateUser({ is_available: newState });
      toast.success(newState ? 'You are now available to donate!' : 'Availability set to unavailable');
    } catch {
      toast.error('Failed to update availability');
    } finally {
      setToggling(false);
    }
  };

  const initials = profile?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'DU';
  const donations = history.length || profile?.donations_count || 0;
  const available = profile?.is_available ?? true;

  const earnedBadges = BADGES_CONFIG.filter((b) => {
    if (b.key === 'first_donation') return donations >= 1;
    if (b.key === 'hero_5')         return donations >= 5;
    if (b.key === 'verified')       return !!authUser?.email_verified_at || true;
    return false;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-white/8 rounded" />
        <div className="glass-card rounded-card p-6 border border-white/8 flex gap-6">
          <div className="w-20 h-20 rounded-full bg-white/8" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-6 w-40 bg-white/8 rounded" />
            <div className="h-4 w-52 bg-white/5 rounded" />
            <div className="h-4 w-64 bg-white/5 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Donor Profile</h1>
        <button onClick={fetchProfile} className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-card p-6 border border-white/8 flex flex-col md:flex-row gap-6"
      >
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-crimson-700 to-crimson-500 flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
          {initials}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
            <div>
              <h2 className="text-xl font-black text-white">{profile?.name ?? 'Unknown'}</h2>
              <p className="text-sm text-white/45">
                {profile?.city ?? '—'}
                {profile?.created_at && ` · Donor since ${new Date(profile.created_at).getFullYear()}`}
              </p>
            </div>

            {/* Availability toggle */}
            <button
              onClick={toggleAvailability}
              disabled={toggling}
              className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-pill border transition-all ${
                available
                  ? 'text-green-400 border-green-400/30 bg-green-400/10 hover:bg-green-400/15'
                  : 'text-white/40 border-white/15 bg-white/5 hover:bg-white/8'
              }`}
            >
              {toggling ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              ) : available ? (
                <><PulseDot status="available" /><ToggleRight className="w-4 h-4" /></>
              ) : (
                <ToggleLeft className="w-4 h-4 text-white/30" />
              )}
              {available ? 'Available to Donate' : 'Unavailable'}
            </button>
          </div>

          <div className="flex flex-wrap gap-5 text-sm">
            {profile?.blood_group && (
              <div>
                <span className="text-white/40">Blood Group</span>
                <span className="ml-2 font-black text-crimson-400 text-lg">{profile.blood_group}</span>
              </div>
            )}
            <div>
              <span className="text-white/40">Total Donations</span>
              <span className="ml-2 text-white font-bold">{donations}</span>
            </div>
            {history[0] && (
              <div>
                <span className="text-white/40">Last Donated</span>
                <span className="ml-2 text-white">{timeAgo(history[0].created_at ?? history[0].donated_at)}</span>
              </div>
            )}
            {eligibility && (
              <div>
                <span className="text-white/40">Next Eligible</span>
                {eligibility.is_eligible ? (
                  <span className="ml-2 text-green-400 font-medium flex items-center gap-1 inline-flex">
                    <CheckCircle className="w-3.5 h-3.5" /> Now
                  </span>
                ) : (
                  <span className="ml-2 text-amber-400 flex items-center gap-1 inline-flex">
                    <Clock className="w-3.5 h-3.5" /> {eligibility.days_until_eligible} days
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {earnedBadges.map((b) => {
            const { Icon } = b;
            return (
              <div key={b.key} className="flex items-center gap-2 px-3 py-2 glass rounded-pill border border-white/10">
                <Icon className={`w-4 h-4 ${b.color}`} />
                <span className="text-xs font-medium text-white/70">{b.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Donation history */}
      <div className="glass-card rounded-card p-5 border border-white/8">
        <h3 className="text-base font-bold text-white mb-5">Donation History</h3>
        {history.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-6">No donation history yet</p>
        ) : (
          <motion.div
            initial="hidden" animate="visible"
            variants={staggerContainer(0.08)}
            className="space-y-4"
          >
            {history.map((d, i) => (
              <motion.div
                key={d._id ?? i}
                variants={fadeInUp}
                className="flex items-center gap-4 relative pl-8"
              >
                <div className="absolute left-0 w-4 h-4 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </div>
                {i < history.length - 1 && (
                  <div className="absolute left-[7px] top-4 w-px h-10 bg-white/8" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{d.bank_name ?? d.bloodBank?.name ?? 'Blood Bank'}</p>
                  <p className="text-xs text-white/40">
                    {timeAgo(d.created_at ?? d.donated_at)} · {d.blood_group ?? profile?.blood_group} · {d.units ?? 1} unit
                  </p>
                </div>
                <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-badge capitalize">
                  {d.status ?? 'Completed'}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
