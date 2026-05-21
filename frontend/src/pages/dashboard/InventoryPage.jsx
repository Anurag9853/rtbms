import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { BLOOD_GROUPS, BLOOD_GROUP_COLORS } from '../../lib/design-system';
import { inventoryApi } from '../../services/api';
import { subscribeToInventory } from '../../services/echoService';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

// Fallback data for demo when backend is unreachable
const FALLBACK_INVENTORY = [
  { _id: 'a1', blood_group: 'A+', total_units: 24, status: 'sufficient', sources_count: 3 },
  { _id: 'a2', blood_group: 'A-', total_units: 6,  status: 'low',        sources_count: 2 },
  { _id: 'b1', blood_group: 'B+', total_units: 18, status: 'sufficient', sources_count: 4 },
  { _id: 'b2', blood_group: 'B-', total_units: 4,  status: 'low',        sources_count: 1 },
  { _id: 'o1', blood_group: 'O+', total_units: 45, status: 'sufficient', sources_count: 5 },
  { _id: 'o2', blood_group: 'O-', total_units: 3,  status: 'critical',   sources_count: 2 },
  { _id: 'ab1',blood_group: 'AB+',total_units: 12, status: 'sufficient', sources_count: 3 },
  { _id: 'ab2',blood_group: 'AB-',total_units: 1,  status: 'critical',   sources_count: 1 },
];

function InventorySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="glass-card rounded-card p-5 border border-white/6 animate-pulse">
          <div className="h-8 w-12 bg-white/8 rounded-lg mb-4" />
          <div className="h-8 w-16 bg-white/8 rounded mb-1" />
          <div className="h-3 w-20 bg-white/5 rounded mb-4" />
          <div className="h-2 w-full bg-white/5 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function InventoryPage() {
  const [inventory, setInventory]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [isLive, setIsLive]         = useState(false);
  const [adjusting, setAdjusting]   = useState({});
  const { user }                    = useAuthStore();

  const canAdjust = user?.role === 'admin' || user?.role === 'blood_bank';

  const fetchInventory = useCallback(async () => {
    try {
      const data = await inventoryApi.getAll();
      const items = data.data ?? data;
      setInventory(Array.isArray(items) ? items : FALLBACK_INVENTORY);
      setIsLive(true);
    } catch {
      setInventory(FALLBACK_INVENTORY);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();

    // Real-time inventory updates
    const cleanup = subscribeToInventory((updated) => {
      setInventory((prev) =>
        prev.map((item) =>
          item.blood_group === updated.blood_group
            ? { ...item, total_units: updated.units_available }
            : item
        )
      );
    });
    return cleanup;
  }, [fetchInventory]);

  const adjust = useCallback(async (item, delta) => {
    let invId = null;
    if (item.banks?.length > 0) {
      // Use the global inventory record for this blood group
      invId = item.banks[0].inventory_id;
    }

    if (!canAdjust || !invId) {
      // Demo mode — local only
      setInventory((prev) =>
        prev.map((i) =>
          i.blood_group === item.blood_group
            ? { ...i, total_units: Math.max(0, i.total_units + delta) }
            : i
        )
      );
      return;
    }

    setAdjusting((p) => ({ ...p, [item.blood_group]: true }));
    try {
      await inventoryApi.update(invId, {
        operation: delta > 0 ? 'add' : 'subtract',
        units: Math.abs(delta),
      });
      await fetchInventory();
      toast.success(`${item.blood_group} inventory updated`);
    } catch {
      toast.error('Failed to update inventory');
    } finally {
      setAdjusting((p) => ({ ...p, [item.blood_group]: false }));
    }
  }, [canAdjust, fetchInventory, user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Blood Inventory</h1>
          <p className="text-sm text-white/40">Manage blood stock levels across all groups</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-pill border ${
            isLive ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-white/40 bg-white/5 border-white/10'
          }`}>
            {isLive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isLive ? 'Live' : 'Demo'}
          </span>
          <button
            onClick={fetchInventory}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            aria-label="Refresh inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <InventorySkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {inventory.map((item) => {
            const colors     = BLOOD_GROUP_COLORS[item.blood_group] ?? BLOOD_GROUP_COLORS['A+'];
            const units      = item.total_units ?? 0;
            const isCritical = item.status === 'critical' || units < 5;
            const isLow      = item.status === 'low' || (units >= 5 && units < 15);
            const isAdj      = adjusting[item.blood_group];

            return (
              <motion.div
                key={item.blood_group}
                whileHover={{ y: -2 }}
                className="glass-card rounded-card p-5 border"
                style={{ borderColor: isCritical ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-xl font-black px-2.5 py-1.5 rounded-badge"
                    style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                  >
                    {item.blood_group}
                  </span>
                  {isCritical && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
                </div>

                <div className="text-3xl font-black text-white mb-1">{units}</div>
                <div className="text-xs text-white/40 mb-1">
                  {isCritical
                    ? <span className="text-red-400 font-semibold">Critical</span>
                    : isLow
                    ? <span className="text-amber-400 font-semibold">Low</span>
                    : <span className="text-green-400">Sufficient</span>}
                </div>
                {item.sources_count != null && (
                  <div className="text-xs text-white/25 mb-3">{item.sources_count} bank{item.sources_count !== 1 ? 's' : ''}</div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjust(item, -1)}
                    disabled={isAdj || units === 0}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white flex items-center justify-center transition-all disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: isCritical ? '#ef4444' : isLow ? '#f59e0b' : '#22c55e' }}
                      animate={{ width: `${Math.min(100, (units / 60) * 100)}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  <button
                    onClick={() => adjust(item, 1)}
                    disabled={isAdj}
                    className="w-8 h-8 rounded-lg bg-crimson-700/20 border border-crimson-700/30 hover:bg-crimson-700/35 text-crimson-400 flex items-center justify-center transition-all disabled:opacity-40"
                  >
                    {isAdj ? (
                      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Low stock warning banner */}
      <AnimatePresence>
        {!loading && inventory.some((i) => i.status === 'critical' || i.total_units < 5) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-card p-4 border border-red-500/25 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-400">Critical Shortage Alert</p>
              <p className="text-xs text-white/50">
                {inventory.filter((i) => i.status === 'critical' || i.total_units < 5).map((i) => i.blood_group).join(', ')} blood groups are critically low. Consider alerting donors immediately.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
