import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Layers } from 'lucide-react';
import { staggerContainer, fadeInUp } from '../../lib/design-system';

// Mock blood bank data for map preview (no Mapbox token needed for preview)
const mockBanks = [
  { id: 1, name: 'AIIMS Blood Bank',     city: 'Delhi',     x: 48, y: 32, status: 'available', units: 45, type: 'bank' },
  { id: 2, name: 'KEM Hospital',         city: 'Mumbai',    x: 28, y: 62, status: 'low',       units: 8,  type: 'hospital' },
  { id: 3, name: 'Fortis Bangalore',     city: 'Bangalore', x: 38, y: 72, status: 'available', units: 28, type: 'bank' },
  { id: 4, name: 'JIPMER Pondicherry',   city: 'Chennai',   x: 52, y: 78, status: 'critical',  units: 2,  type: 'hospital' },
  { id: 5, name: 'PGIMER Chandigarh',    city: 'Chandigarh',x: 40, y: 20, status: 'available', units: 60, type: 'bank' },
  { id: 6, name: 'Hyderabad Blood Ctr',  city: 'Hyderabad', x: 45, y: 65, status: 'available', units: 33, type: 'bank' },
  { id: 7, name: 'Kolkata Medical',      city: 'Kolkata',   x: 68, y: 45, status: 'low',       units: 5,  type: 'hospital' },
  { id: 8, name: 'Ruby Hall Pune',       city: 'Pune',      x: 33, y: 60, status: 'available', units: 19, type: 'bank' },
];

const statusColor = {
  available: '#22c55e',
  low:       '#f59e0b',
  critical:  '#ef4444',
};

export function LiveMapPreview() {
  const [hovered, setHovered] = useState(null);
  const [pulsing, setPulsing] = useState([]);

  useEffect(() => {
    // Random pulse effect on critical markers
    const criticals = mockBanks.filter((b) => b.status === 'critical').map((b) => b.id);
    setPulsing(criticals);
  }, []);

  return (
    <section id="map" className="relative py-24 md:py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-base-900" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer(0.1)}
          className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10"
        >
          <div>
            <motion.span variants={fadeInUp} className="inline-block text-xs font-semibold tracking-widest uppercase text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-4 py-1.5 mb-4">
              Live Map
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-h2 font-black text-white">
              Blood banks{' '}
              <span className="gradient-text">near you</span>
            </motion.h2>
          </div>
          <motion.div variants={fadeInUp} className="flex gap-3">
            {[
              { color: '#22c55e', label: 'Available' },
              { color: '#f59e0b', label: 'Low Stock' },
              { color: '#ef4444', label: 'Critical' },
              { color: '#2563eb', label: 'Blood Bank' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-white/50">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Map Container — stylized SVG India map preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass-card rounded-2xl overflow-hidden border border-white/6"
          style={{ height: '480px', position: 'relative' }}
        >
          {/* Map dark background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, #1a1a2e 0%, #0f0f14 100%)',
            }}
          >
            {/* Subtle grid */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          {/* India outline SVG */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full opacity-10"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              d="M38 15 L42 12 L50 14 L55 12 L60 15 L62 20 L68 22 L70 28 L72 32 L68 38 L72 42 L70 48 L65 52 L60 56 L58 62 L55 68 L50 74 L46 80 L42 75 L38 70 L34 64 L32 58 L28 52 L26 46 L28 40 L30 34 L28 28 L32 22 Z"
              fill="rgba(255,255,255,0.3)"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.5"
            />
          </svg>

          {/* Hovered tooltip */}
          {hovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute z-30 glass-card rounded-xl p-3 border text-sm pointer-events-none"
              style={{
                left: `${Math.min(hovered.x, 60)}%`,
                top: `${Math.max(hovered.y - 18, 5)}%`,
                borderColor: `${statusColor[hovered.status]}40`,
                minWidth: '180px',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: statusColor[hovered.status] }}
                />
                <span className="font-semibold text-white text-xs">{hovered.name}</span>
              </div>
              <p className="text-xs text-white/50">{hovered.city}</p>
              <p className="text-xs mt-1">
                <span className="font-bold text-white">{hovered.units}</span>
                <span className="text-white/50"> units available</span>
              </p>
            </motion.div>
          )}

          {/* Map pins */}
          {mockBanks.map((bank) => (
            <button
              key={bank.id}
              className="absolute z-20 group"
              style={{ left: `${bank.x}%`, top: `${bank.y}%`, transform: 'translate(-50%, -50%)' }}
              onMouseEnter={() => setHovered(bank)}
              onMouseLeave={() => setHovered(null)}
              aria-label={`${bank.name} — ${bank.units} units`}
            >
              {/* Pulse ring for critical */}
              {pulsing.includes(bank.id) && (
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: statusColor[bank.status],
                    animation: 'pulseDot 2s ease-out infinite',
                    transform: 'scale(2)',
                    opacity: 0.3,
                  }}
                />
              )}
              {/* Pin */}
              <span
                className="relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-white/30 group-hover:scale-150 transition-transform duration-200 shadow-lg"
                style={{ background: statusColor[bank.status] }}
              >
                {bank.type === 'bank' && (
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </span>
            </button>
          ))}

          {/* Bottom controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
            <button className="inline-flex items-center gap-2 glass text-white text-sm px-4 py-2.5 rounded-pill border border-white/15 hover:bg-white/10 transition-colors">
              <Navigation className="w-4 h-4 text-crimson-400" />
              Find Near Me
            </button>
            <div className="flex gap-2">
              <button className="glass p-2.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-white/60 hover:text-white">
                <Layers className="w-4 h-4" />
              </button>
              <button className="glass p-2.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-white/60 hover:text-white">
                <MapPin className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        <p className="text-xs text-center text-white/25 mt-3">
          Live map powered by Mapbox GL JS · Showing 8 of 850+ blood banks
        </p>
      </div>
    </section>
  );
}
