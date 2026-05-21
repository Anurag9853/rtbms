import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Clock, CheckCircle, AlertTriangle, Circle,
  X, ChevronDown, RefreshCw, Send
} from 'lucide-react';
import { BLOOD_GROUPS, URGENCY_CONFIG } from '../../lib/design-system';
import { fadeInUp, staggerContainer } from '../../lib/design-system';
import { requestsApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

const FALLBACK_REQUESTS = [
  { _id: 'r1', patient_name: 'John Doe',   blood_group: 'O-', units_needed: 2, urgency: 'critical', status: 'matched',   created_at: new Date(Date.now()-7200000).toISOString(), hospital_name: 'Max Hospital',  hospital_city: 'Delhi' },
  { _id: 'r2', patient_name: 'Jane Smith',  blood_group: 'A+', units_needed: 4, urgency: 'high',     status: 'reviewing', created_at: new Date(Date.now()-18000000).toISOString(), hospital_name: 'Fortis',        hospital_city: 'Gurgaon' },
  { _id: 'r3', patient_name: 'Raj Patel',   blood_group: 'B+', units_needed: 1, urgency: 'routine',  status: 'fulfilled', created_at: new Date(Date.now()-86400000).toISOString(), hospital_name: 'AIIMS',         hospital_city: 'Delhi' },
];

const COMPATIBILITY = {
  'A+':  ['A+', 'AB+'],
  'A-':  ['A+', 'A-', 'AB+', 'AB-'],
  'B+':  ['B+', 'AB+'],
  'B-':  ['B+', 'B-', 'AB+', 'AB-'],
  'AB+': ['AB+'],
  'AB-': ['AB+', 'AB-'],
  'O+':  ['O+', 'A+', 'B+', 'AB+'],
  'O-':  ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
};

function canDonate(donorGroup, recipientGroup) {
  if (!donorGroup || !recipientGroup) return true;
  return COMPATIBILITY[donorGroup]?.includes(recipientGroup) || false;
}

const STATUS_CONFIG = {
  submitted:  { label: 'Submitted',  Icon: Circle,      color: 'text-white/40' },
  reviewing:  { label: 'Reviewing',  Icon: Clock,       color: 'text-amber-400' },
  matched:    { label: 'Matched',    Icon: CheckCircle, color: 'text-blue-400' },
  in_transit: { label: 'In Transit', Icon: Clock,       color: 'text-purple-400' },
  fulfilled:  { label: 'Fulfilled',  Icon: CheckCircle, color: 'text-green-400' },
  cancelled:  { label: 'Cancelled',  Icon: X,           color: 'text-white/30' },
};

const TABS = ['all', 'critical', 'reviewing', 'fulfilled'];

const EMPTY_FORM = {
  patient_name: '', blood_group: '', units_needed: 1,
  urgency: 'routine', hospital_name: '', hospital_city: '', notes: '',
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function NewRequestModal({ onClose, onSubmit, loading }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.patient_name.trim()) e.patient_name = 'Required';
    if (!form.blood_group)         e.blood_group  = 'Required';
    if (!form.hospital_name.trim())e.hospital_name= 'Required';
    if (!form.hospital_city.trim())e.hospital_city= 'Required';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        className="glass-card rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar"
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/6">
          <div>
            <h2 className="text-lg font-black text-white">New Blood Request</h2>
            <p className="text-xs text-white/40">Fill in patient and blood details</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Patient name */}
          <div>
            <label className="block text-xs font-semibold text-white/55 uppercase tracking-wider mb-1.5">Patient Name</label>
            <input
              value={form.patient_name}
              onChange={(e) => set('patient_name', e.target.value)}
              placeholder="Full name"
              className={`w-full bg-white/5 border text-white text-sm rounded-input px-4 py-2.5 outline-none input-glow-red placeholder-white/20 ${errors.patient_name ? 'border-red-500/50' : 'border-white/10 focus:border-crimson-500/50'}`}
            />
            {errors.patient_name && <p className="text-xs text-red-400 mt-1">⚠ {errors.patient_name}</p>}
          </div>

          {/* Blood group + units */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-white/55 uppercase tracking-wider mb-1.5">Blood Group</label>
              <select
                value={form.blood_group}
                onChange={(e) => set('blood_group', e.target.value)}
                className={`w-full bg-white/5 border text-white text-sm rounded-input px-4 py-2.5 outline-none ${errors.blood_group ? 'border-red-500/50' : 'border-white/10'}`}
              >
                <option value="" className="bg-base-800">Select</option>
                {BLOOD_GROUPS.map((g) => <option key={g} value={g} className="bg-base-800">{g}</option>)}
              </select>
              {errors.blood_group && <p className="text-xs text-red-400 mt-1">⚠ {errors.blood_group}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/55 uppercase tracking-wider mb-1.5">Units Needed</label>
              <input
                type="number" min={1} max={20}
                value={form.units_needed}
                onChange={(e) => set('units_needed', Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-input px-4 py-2.5 outline-none"
              />
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-xs font-semibold text-white/55 uppercase tracking-wider mb-1.5">Urgency</label>
            <div className="grid grid-cols-3 gap-2">
              {['routine', 'high', 'critical'].map((u) => {
                const cfg = URGENCY_CONFIG[u];
                return (
                  <button
                    key={u} type="button"
                    onClick={() => set('urgency', u)}
                    className="py-2 rounded-input text-xs font-bold transition-all capitalize"
                    style={form.urgency === u
                      ? { background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }
                      : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }
                    }
                  >
                    {u}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hospital */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-white/55 uppercase tracking-wider mb-1.5">Hospital Name</label>
              <input
                value={form.hospital_name}
                onChange={(e) => set('hospital_name', e.target.value)}
                placeholder="AIIMS"
                className={`w-full bg-white/5 border text-white text-sm rounded-input px-4 py-2.5 outline-none placeholder-white/20 ${errors.hospital_name ? 'border-red-500/50' : 'border-white/10'}`}
              />
              {errors.hospital_name && <p className="text-xs text-red-400 mt-1">⚠ {errors.hospital_name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/55 uppercase tracking-wider mb-1.5">City</label>
              <input
                value={form.hospital_city}
                onChange={(e) => set('hospital_city', e.target.value)}
                placeholder="Delhi"
                className={`w-full bg-white/5 border text-white text-sm rounded-input px-4 py-2.5 outline-none placeholder-white/20 ${errors.hospital_city ? 'border-red-500/50' : 'border-white/10'}`}
              />
              {errors.hospital_city && <p className="text-xs text-red-400 mt-1">⚠ {errors.hospital_city}</p>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-white/55 uppercase tracking-wider mb-1.5">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={2}
              placeholder="Any additional information..."
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-input px-4 py-2.5 outline-none resize-none placeholder-white/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-crimson-700 hover:bg-crimson-600 disabled:opacity-60 text-white font-semibold py-3 rounded-input transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            ) : <Send className="w-4 h-4" />}
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export function DonateModal({ request, onClose, onSubmit, loading }) {
  const [units, setUnits] = useState(1);
  const maxUnits = Math.min(3, request.units_needed);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        className="glass-card rounded-2xl border border-white/10 w-full max-w-sm"
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/6">
          <div>
            <h2 className="text-lg font-black text-white">Donate Blood</h2>
            <p className="text-xs text-white/40">For {request.patient_name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/55 uppercase tracking-wider mb-1.5">Units to Donate (Max {maxUnits})</label>
            <input
              type="number" min={1} max={maxUnits}
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-input px-4 py-2.5 outline-none"
            />
          </div>
          <button
            onClick={() => onSubmit(request, units)}
            disabled={loading || units < 1 || units > maxUnits}
            className="w-full bg-crimson-700 hover:bg-crimson-600 disabled:opacity-60 text-white font-semibold py-3 rounded-input transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : 'Confirm Donation'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function RequestsPage() {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [donateRequest, setDonateRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [donating, setDonating] = useState(false);
  const [expandedPledges, setExpandedPledges] = useState({});
  const { user }                  = useAuthStore();

  const togglePledges = (id) => {
    setExpandedPledges(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchRequests = useCallback(async () => {
    try {
      const data = await requestsApi.getAll(tab !== 'all' ? { status: tab === 'critical' ? undefined : tab, emergency: tab === 'critical' ? true : undefined } : {});
      const items = data.data ?? data.items ?? (Array.isArray(data) ? data : null);
      setRequests(items ?? FALLBACK_REQUESTS);
    } catch {
      setRequests(FALLBACK_REQUESTS);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    fetchRequests();
  }, [fetchRequests]);

  const handleCreate = async (form) => {
    setSubmitting(true);
    try {
      await requestsApi.create(form);
      toast.success('Blood request submitted!');
      setShowModal(false);
      fetchRequests();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit request.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this request?')) return;
    try {
      await requestsApi.cancel(id);
      toast.success('Request cancelled');
      fetchRequests();
    } catch {
      toast.error('Failed to cancel request');
    }
  };

  const handleDonateSubmit = async (req, units) => {
    setDonating(true);
    try {
      await requestsApi.donate(req._id || req.id, units);
      toast.success(`Successfully pledged ${units} unit(s) for ${req.patient_name}!`);
      setDonateRequest(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit donation.');
    } finally {
      setDonating(false);
    }
  };

  const handlePledgeStatus = async (donationId, status) => {
    try {
      await requestsApi.updateDonationStatus(donationId, status);
      toast.success(`Pledge marked as ${status}`);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to mark pledge as ${status}`);
    }
  };

  const canCreate = user?.role === 'hospital' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Blood Requests</h1>
          <p className="text-sm text-white/40">Manage and track all blood requests</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchRequests} className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {canCreate && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-crimson-700 hover:bg-crimson-600 text-white text-sm font-semibold px-4 py-2.5 rounded-input transition-all ripple-btn"
            >
              <Plus className="w-4 h-4" /> New Request
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/4 border border-white/8 rounded-lg p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded text-xs font-semibold capitalize transition-all ${tab === t ? 'bg-crimson-700 text-white' : 'text-white/40 hover:text-white/70'}`}
          >
            {t === 'all' ? 'All' : t}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card rounded-card p-5 border border-white/6 animate-pulse flex items-center gap-4">
              <div className="w-12 h-10 bg-white/8 rounded-badge" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-white/8 rounded" />
                <div className="h-3 w-60 bg-white/5 rounded" />
              </div>
              <div className="h-6 w-20 bg-white/5 rounded-badge" />
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="glass-card rounded-card p-12 border border-white/6 text-center">
          <p className="text-white/40 text-sm">No requests found</p>
          {canCreate && (
            <button onClick={() => setShowModal(true)} className="mt-4 text-crimson-400 text-sm hover:text-crimson-300 transition-colors">
              Submit a new request →
            </button>
          )}
        </div>
      ) : (
        <motion.div
          initial="hidden" animate="visible"
          variants={staggerContainer(0.07)}
          className="space-y-3"
        >
          {requests.map((req) => {
            const urgency = URGENCY_CONFIG[req.urgency] ?? URGENCY_CONFIG.routine;
            const status  = STATUS_CONFIG[req.status]  ?? STATUS_CONFIG.submitted;
            const StatusIcon = status.Icon;
            const id = req._id ?? req.id ?? '';
            return (
              <motion.div key={id} variants={fadeInUp}>
                <div className="glass-card rounded-card p-5 border border-white/6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span
                      className="font-black px-2.5 py-1.5 rounded-badge text-sm"
                      style={{ background: urgency.bg, color: urgency.color, border: `1px solid ${urgency.border}` }}
                    >
                      {req.blood_group}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{req.patient_name}</p>
                      <p className="text-xs text-white/40">
                        {req.hospital_name}, {req.hospital_city} · {req.units_needed} unit(s) · {timeAgo(req.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${status.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" /> {status.label}
                    </span>
                    {(user?.role === 'admin' || user?.role === 'blood_bank') ? (
                      <select
                        value={req.status}
                        disabled={req.status === 'fulfilled' || req.status === 'cancelled'}
                        onChange={async (e) => {
                          try {
                            await requestsApi.update(id, { status: e.target.value });
                            toast.success('Status updated');
                            fetchRequests();
                          } catch {
                            toast.error('Failed to update status');
                          }
                        }}
                        className="bg-white/5 border border-white/15 text-white/80 text-xs rounded px-2 py-1 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {Object.keys(STATUS_CONFIG).map(s => (
                          <option key={s} value={s} className="bg-base-900">{STATUS_CONFIG[s].label}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        {user?.role === 'donor' && (req.status === 'submitted' || req.status === 'reviewing') && canDonate(user?.blood_group, req.blood_group) && (
                          <button
                            onClick={() => setDonateRequest(req)}
                            className="bg-crimson-700 hover:bg-crimson-600 text-white text-xs font-semibold px-3 py-1.5 rounded-input transition-all ripple-btn"
                          >
                            Donate Blood
                          </button>
                        )}
                        {(req.status === 'submitted' || req.status === 'reviewing') && canCreate && (
                          <button
                            onClick={() => handleCancel(id)}
                            className="text-xs text-white/40 hover:text-red-400 border border-white/15 hover:border-red-500/30 px-3 py-1.5 rounded-input transition-all"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    )}
                    {req.donations?.length > 0 && (user?.role === 'hospital' || user?.role === 'admin') && (
                      <button
                        onClick={() => togglePledges(id)}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-input transition-all ${
                          expandedPledges[id] 
                            ? 'bg-crimson-700/20 text-crimson-400 border border-crimson-700/30' 
                            : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {req.donations.length} Pledges
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedPledges[id] ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
                {req.donations?.length > 0 && (user?.role === 'hospital' || user?.role === 'admin') && (
                  <AnimatePresence>
                    {expandedPledges[id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-white/5 grid gap-2 grid-cols-1 sm:grid-cols-2">
                            {req.donations.map(d => (
                              <div key={d._id || d.id} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                                 <div>
                                   <p className="text-sm font-semibold text-white">{d.donor?.name || 'Unknown Donor'}</p>
                                   <p className="text-xs text-white/40">{d.donor?.phone || d.donor?.email}</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-sm font-bold text-crimson-400">{d.units} Unit(s)</p>
                                    <p className="text-xs text-white/40 capitalize">{d.status}</p>
                                    {user?.role === 'hospital' && d.status === 'scheduled' && (
                                      <div className="flex items-center gap-2 mt-2 justify-end">
                                        <button onClick={() => handlePledgeStatus(d._id || d.id, 'completed')} className="text-[10px] px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded uppercase tracking-wider font-bold hover:bg-green-500/30">Fulfill</button>
                                        <button onClick={() => handlePledgeStatus(d._id || d.id, 'cancelled')} className="text-[10px] px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded uppercase tracking-wider font-bold hover:bg-red-500/30">Cancel</button>
                                      </div>
                                    )}
                                  </div>
                              </div>
                            ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <NewRequestModal
            onClose={() => setShowModal(false)}
            onSubmit={handleCreate}
            loading={submitting}
          />
        )}
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
