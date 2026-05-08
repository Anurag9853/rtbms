import { useEffect, useState, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useInView } from 'framer-motion';

/**
 * CountUpNumber — animates from 0 to final value when scrolled into view
 */
export function CountUpNumber({ end, duration = 2000, suffix = '', prefix = '', className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (isInView && !hasStarted) setHasStarted(true);
  }, [isInView, hasStarted]);

  const { number } = useSpring({
    from: { number: 0 },
    to: { number: hasStarted ? end : 0 },
    config: { duration },
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      <animated.span>
        {number.to((n) => {
          if (end >= 1000) return `${(n / 1000).toFixed(1)}K`;
          return Math.floor(n).toLocaleString();
        })}
      </animated.span>
      {suffix}
    </span>
  );
}
