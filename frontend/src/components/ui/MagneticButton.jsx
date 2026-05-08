import { useEffect, useRef, useCallback } from 'react';

/**
 * MagneticButton — cursor proximity causes button to drift toward cursor
 */
export function MagneticButton({ children, className = '', strength = 0.3, ...props }) {
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = Math.max(rect.width, rect.height) * 1.5;
    if (dist < radius) {
      const factor = (1 - dist / radius) * strength;
      ref.current.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    }
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = 'translate(0px, 0px)';
    ref.current.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transition = 'transform 0.1s ease';
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <button
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`ripple-btn morph-btn transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
