/**
 * PulseDot — live availability indicator with animated pulse ring
 */
export function PulseDot({ status = 'available', size = 'sm', className = '' }) {
  const colorMap = {
    available: 'bg-green-500',
    low:       'bg-amber-500',
    critical:  'bg-red-500',
    offline:   'bg-gray-500',
    online:    'bg-green-400',
  };

  const sizeMap = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span className={`relative inline-flex ${className}`}>
      <span
        className={`${sizeMap[size]} ${colorMap[status]} rounded-full`}
        style={{ boxShadow: 'none' }}
      />
      <span
        className={`absolute inline-flex ${sizeMap[size]} rounded-full ${colorMap[status]} opacity-50`}
        style={{
          animation: 'pulseDot 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        }}
      />
    </span>
  );
}
