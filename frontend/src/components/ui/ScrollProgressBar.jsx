import { useEffect, useState } from 'react';

/**
 * ScrollProgressBar — fixed top bar showing scroll progress
 */
export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(pct);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      id="scroll-progress"
      style={{
        position: 'fixed',
        top: 0, left: 0,
        height: '3px',
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #c0392b, #e74c3c, #2563eb)',
        zIndex: 9999,
        transition: 'width 0.05s linear',
        pointerEvents: 'none',
      }}
    />
  );
}
