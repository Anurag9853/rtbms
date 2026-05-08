/**
 * SkeletonCard — animated shimmer loading skeleton
 */
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass-card rounded-card p-6 ${className}`}>
      <div className="skeleton h-4 rounded-full w-3/4 mb-4" />
      <div className="skeleton h-3 rounded-full w-full mb-2" />
      <div className="skeleton h-3 rounded-full w-5/6 mb-2" />
      <div className="skeleton h-3 rounded-full w-4/6 mb-6" />
      <div className="flex gap-3">
        <div className="skeleton h-8 rounded-input w-24" />
        <div className="skeleton h-8 rounded-input w-20" />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-3 rounded-full"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md', className = '' }) {
  const sizeMap = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14', xl: 'w-20 h-20' };
  return <div className={`skeleton rounded-full ${sizeMap[size]} ${className}`} />;
}
