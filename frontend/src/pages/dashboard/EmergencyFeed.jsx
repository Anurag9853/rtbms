import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Clock, Wifi, WifiOff, Bell, BellOff } from 'lucide-react';
import { PulseDot } from '../../components/ui/PulseDot';
import { fadeInUp, staggerContainer } from '../../lib/design-system';
import { requestsApi } from '../../services/api';
import { subscribeToEmergencies } from '../../services/echoService';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import { DonateModal } from './RequestsPage';

const FALLBACK = [
  { _id: '1', blood_group: 'O-',  patient_name: 'ICU Patient #4', hospital_name: 'Max Hospital',       hospital_city: 'Delhi',   urgency: 'critical', units_needed: 3, created_at: new Date(Date.now()-120000).toISOString() },
  { _id: '2', blood_group: 'AB-', patient_name: 'Trauma Case',    hospital_name: 'AIIMS',              hospital_city: 'Delhi',   urgency: 'critical', units_needed: 2, created_at: new Date(Date.now()-300000).toISOString() },
  { _id: '3', blood_group: 'A-',  patient_name: 'Surgery Case',   hospital_name: 'Fortis',             hospital_city: 'Gurgaon', urgency: 'high',     units_needed: 4, created_at: new Date(Date.now()-720000).toISOString() },
];

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function EmergencyFeed() {
  const { user } = useAuthStore();
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [isLive, setIsLive]           = useState(false);
  const [newCount, setNewCount]       = useState(0);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [donateRequest, setDonateRequest] = useState(null);
  const [donating, setDonating] = useState(false);
  const audioRef = useRef(null);

  const fetchEmergencies = useCallback(async () => {
    try {
      const data = await requestsApi.getEmergencies();
      const items = data.data ?? (Array.isArray(data) ? data : null);
      setEmergencies(items ?? FALLBACK);
      setIsLive(true);
    } catch {
      setEmergencies(FALLBACK);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmergencies();

    // Subscribe to real-time emergency events
    const cleanup = subscribeToEmergencies((payload) => {
      setNewCount((n) => n + 1);
      setEmergencies((prev) => [payload, ...prev]);
      toast.error(`🚨 New Emergency: ${payload.blood_group} needed at ${payload.hospital_name}`, {
        duration: 8000,
        id: `em-${payload._id}`,
      });
    });

    return cleanup;
  }, [fetchEmergencies]);

  const handleHelp = async (em) => {
    const id = em._id ?? em.id;
    if (user?.role === 'admin' || user?.role === 'blood_bank') {
      try {
        await requestsApi.update(id, { status: 'reviewing' });
        toast.success(`You are now reviewing the request for ${em.patient_name}`);
        fetchEmergencies();
      } catch {
        toast.error('Failed to update request');
      }
    } else {
      setDonateRequest(em);
    }
  };

  const handleDonateSubmit = async (req, units) => {
    setDonating(true);
    try {
      await requestsApi.donate(req._id || req.id, units);
      toast.success(`Successfully pledged ${units} unit(s) for ${req.patient_name}!`);
      setDonateRequest(null);
      fetchEmergencies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit donation.');
    } finally {
      setDonating(false);
    }
  };

  const requestNotifications = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotifEnabled(perm === 'granted');
      if (perm === 'granted') toast.success('Emergency notifications enabled');
      else toast.error('Notification permission denied');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            {newCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                {newCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Emergency Feed</h1>
            <p className="text-sm text-white/40 flex items-center gap-2">
              <PulseDot status="critical" size="xs" />
              Live emergency requests — real-time
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-pill border ${
            isLive ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-white/40 bg-white/5 border-white/10'
          }`}>
            {isLive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isLive ? 'Live' : 'Demo'}
          </span>
          <button
            onClick={requestNotifications}
            title={notifEnabled ? 'Notifications on' : 'Enable notifications'}
            className={`p-2 rounded-lg transition-all border ${notifEnabled ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 'text-white/40 hover:text-white hover:bg-white/5 border-white/10'}`}
          >
            {notifEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => { setLoading(true); fetchEmergencies(); setNewCount(0); }}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Live badge */}
      {isLive && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs text-green-400 bg-green-400/8 border border-green-400/15 rounded-lg px-3 py-2 w-fit"
        >
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Connected to live emergency broadcast channel
        </motion.div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card rounded-card p-5 border border-red-500/10 animate-pulse">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-10 bg-red-500/10 rounded-badge" />
                  <div className="space-y-2">
                    <div className="h-4 w-36 bg-white/8 rounded" />
                    <div className="h-3 w-52 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-24 bg-white/5 rounded-input" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : emergencies.length === 0 ? (
        <div className="glass-card rounded-card p-12 border border-white/6 text-center">
          <AlertTriangle className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No active emergencies right now</p>
          <p className="text-white/25 text-xs mt-1">You'll be notified in real-time when one is posted</p>
        </div>
      ) : (
        <motion.div
          initial="hidden" animate="visible"
          variants={staggerContainer(0.08)}
          className="space-y-4"
        >
          <AnimatePresence>
            {emergencies.map((em) => {
              const id = em._id ?? em.id;
              const isHigh = em.urgency === 'critical';
              return (
                <motion.div
                  key={id}
                  variants={fadeInUp}
                  layout
                  className="glass-card rounded-card p-5 border border-red-500/20"
                  style={{ boxShadow: '0 0 0 1px rgba(239,68,68,0.1), 0 8px 32px rgba(0,0,0,0.4)' }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-xl font-black px-3 py-2 rounded-badge bg-red-500/15 text-red-400 border border-red-500/30 flex-shrink-0">
                        {em.blood_group}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{em.patient_name}</p>
                        <p className="text-sm text-white/50">{em.hospital_name}, {em.hospital_city}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(em.created_at)}</span>
                          <span>{em.units_needed} unit{em.units_needed !== 1 ? 's' : ''} needed</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {user?.role !== 'hospital' && (
                        <button
                          onClick={() => handleHelp(em)}
                          className="bg-crimson-700 hover:bg-crimson-600 text-white text-sm font-semibold px-4 py-2 rounded-input transition-all ripple-btn"
                        >
                          I Can Help
                        </button>
                      )}
                      <button 
                        onClick={() => toast('Detailed view coming soon!', { icon: 'ℹ️' })}
                        className="glass border border-white/15 text-white/60 hover:text-white text-sm px-4 py-2 rounded-input transition-all"
                      >
                        Details
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    {isHigh ? (
                      <span className="flex items-center gap-1.5 text-xs text-red-400 font-semibold animate-pulse">
                        <PulseDot status="critical" size="xs" /> CRITICAL EMERGENCY
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                        <PulseDot status="low" size="xs" /> HIGH PRIORITY
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {donateRequest && (
          <DonateModal
            request={donateRequest}
            onClose={() => setDonateRequest(null)}
            onSubmit={handleDonateSubmit}
            loading={donating}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
