import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Filter, RefreshCw, Phone, Clock, ExternalLink } from 'lucide-react';
import { PulseDot } from '../../components/ui/PulseDot';
import { BLOOD_GROUPS, BLOOD_GROUP_COLORS } from '../../lib/design-system';
import { fadeInUp, staggerContainer } from '../../lib/design-system';
import { inventoryApi } from '../../services/api';
import toast from 'react-hot-toast';

const FALLBACK_RESULTS = [
  { _id: 'r1', blood_group: 'O-', units_available: 8, bloodBank: { name: 'Sir Ganga Ram',       city: 'Delhi',   contact_phone: '+91-11-2575-0000', hours: { is_24hr: true } }, dist: '5.1 km', status: 'available' },
  { _id: 'r2', blood_group: 'O-', units_available: 3, bloodBank: { name: 'AIIMS Blood Bank',     city: 'Delhi',   contact_phone: '+91-11-2658-8500', hours: { is_24hr: true } }, dist: '2.4 km', status: 'low' },
  { _id: 'r3', blood_group: 'O-', units_available: 2, bloodBank: { name: 'Fortis Vasant Kunj',   city: 'Delhi',   contact_phone: '+91-11-4277-6222', hours: { open: '8am', close: '8pm' } }, dist: '12.3 km', status: 'critical' },
];

function ResultCard({ result, onRequest }) {
  const colors = BLOOD_GROUP_COLORS[result.blood_group] ?? BLOOD_GROUP_COLORS['A+'];
  const bank = result.bloodBank ?? {};
  const isCritical = result.units_available < 5 || result.status === 'critical';
  const isLow = !isCritical && (result.units_available < 15 || result.status === 'low');

  const statusKey = isCritical ? 'critical' : isLow ? 'low' : 'available';

  return (
    <motion.div variants={fadeInUp}>
      <div className="glass-card rounded-card p-5 border border-white/6 hover:border-white/12 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: blood group + bank */}
          <div className="flex items-center gap-4">
            <span
              className="text-xl font-black px-3 py-2 rounded-badge flex-shrink-0"
              style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
            >
              {result.blood_group}
            </span>
            <div>
              <p className="font-semibold text-white">{bank.name ?? 'Blood Bank'}</p>
              <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-white/40">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{bank.city ?? '—'}</span>
                {result.dist && <span>{result.dist}</span>}
                {bank.contact_phone && (
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{bank.contact_phone}</span>
                )}
                {bank.hours && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {bank.hours.is_24hr ? '24/7' : `${bank.hours.open}–${bank.hours.close}`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: units + action */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xl font-black text-white">{result.units_available}</p>
              <p className="text-xs text-white/40">units</p>
            </div>
            <PulseDot status={statusKey} />
            <button
              onClick={() => onRequest(result)}
              className="bg-crimson-700 hover:bg-crimson-600 text-white text-sm font-semibold px-4 py-2 rounded-input transition-all ripple-btn"
            >
              Request
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function BloodSearch() {
  const [query, setQuery]     = useState({ group: '', city: '' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.group && !query.city) {
      toast.error('Please select a blood group or enter a city');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const data = await inventoryApi.search(query.group || undefined, query.city || undefined);
      const items = data.data ?? (Array.isArray(data) ? data : []);
      setResults(items.length > 0 ? items : []);
      setUsedFallback(false);
    } catch {
      // Fall back to filtered demo results
      const filtered = FALLBACK_RESULTS.filter((r) =>
        (!query.group || r.blood_group === query.group) &&
        (!query.city  || r.bloodBank?.city?.toLowerCase().includes(query.city.toLowerCase()))
      );
      setResults(filtered);
      setUsedFallback(true);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleRequest = (result) => {
    toast.success(`Request initiated for ${result.blood_group} at ${result.bloodBank?.name ?? 'blood bank'}`, { duration: 4000 });
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Blood Search</h1>
        <p className="text-sm text-white/40">Find blood across all connected blood banks in real time</p>
      </div>

      {/* Search form */}
      <div className="glass-card rounded-card p-5 border border-white/8">
        <div className="flex flex-wrap gap-3">
          <select
            value={query.group}
            onChange={(e) => setQuery((p) => ({ ...p, group: e.target.value }))}
            className="bg-white/5 border border-white/10 text-white rounded-input px-4 py-2.5 text-sm outline-none input-glow-red min-w-[140px]"
            aria-label="Blood group"
          >
            <option value="">All Groups</option>
            {BLOOD_GROUPS.map((g) => <option key={g} value={g} className="bg-base-800">{g}</option>)}
          </select>

          <div className="relative flex-1 min-w-[180px]">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Enter city..."
              value={query.city}
              onChange={(e) => setQuery((p) => ({ ...p, city: e.target.value }))}
              onKeyDown={handleKeyDown}
              className="w-full bg-white/5 border border-white/10 text-white rounded-input pl-9 pr-4 py-2.5 text-sm outline-none input-glow-red placeholder-white/20"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-2 bg-crimson-700 hover:bg-crimson-600 disabled:opacity-60 text-white px-5 py-2.5 rounded-input text-sm font-semibold transition-all ripple-btn"
          >
            {loading
              ? <RefreshCw className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />
            }
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {searched && (
          <motion.div
            key={`${query.group}-${query.city}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="glass-card rounded-card p-5 border border-white/6 animate-pulse flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-10 bg-white/8 rounded-badge" />
                      <div className="space-y-2">
                        <div className="h-4 w-44 bg-white/8 rounded" />
                        <div className="h-3 w-60 bg-white/5 rounded" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-10 bg-white/8 rounded" />
                      <div className="h-8 w-20 bg-white/5 rounded-input" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="glass-card rounded-card p-12 border border-white/6 text-center">
                <Search className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">No blood found matching your criteria</p>
                <p className="text-white/25 text-xs mt-1">Try a different blood group or city</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-white/40">
                    {results.length} source{results.length !== 1 ? 's' : ''} found
                    {usedFallback && <span className="ml-2 text-amber-400/70">(demo data)</span>}
                  </p>
                  {query.group && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-badge"
                      style={{ background: BLOOD_GROUP_COLORS[query.group]?.bg, color: BLOOD_GROUP_COLORS[query.group]?.text }}>
                      {query.group}
                    </span>
                  )}
                </div>
                <motion.div
                  initial="hidden" animate="visible"
                  variants={staggerContainer(0.07)}
                  className="space-y-3"
                >
                  {results.map((r, i) => (
                    <ResultCard key={r._id ?? i} result={r} onRequest={handleRequest} />
                  ))}
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
