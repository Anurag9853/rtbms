import { useEffect, useState } from 'react';

/**
 * TypingAnimation — typewriter text effect with blinking cursor
 */
export function TypingAnimation({
  text,
  speed = 40,
  delay = 0,
  className = '',
  cursorClass = 'text-crimson-500',
  onComplete,
}) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, started, onComplete]);

  return (
    <span className={className}>
      {displayText}
      {!isComplete && (
        <span
          className={`inline-block w-0.5 h-[1em] ml-0.5 align-middle ${cursorClass} bg-current`}
          style={{ animation: 'blink 1s step-end infinite' }}
        />
      )}
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </span>
  );
}
