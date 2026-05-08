import { useEffect, useRef } from 'react';

/**
 * ActivityTicker — smooth horizontal scrolling marquee
 */
export function ActivityTicker({ items = [], speed = 35 }) {
  const defaultItems = [
    { type: 'donation', text: 'Rahul M. donated O+ blood in Mumbai', time: '2m ago', icon: '🩸' },
    { type: 'request',  text: 'Emergency A- request fulfilled in Delhi', time: '5m ago', icon: '🏥' },
    { type: 'donor',    text: 'New donor Priya S. registered in Bangalore', time: '8m ago', icon: '✅' },
    { type: 'donation', text: 'City Hospital received 10 units of B+', time: '12m ago', icon: '💉' },
    { type: 'request',  text: 'Critical O- request resolved in Chennai', time: '15m ago', icon: '🚨' },
    { type: 'donor',    text: 'Arjun K. marked available in Hyderabad', time: '18m ago', icon: '🟢' },
    { type: 'donation', text: 'Blood Drive: 45 units collected in Pune', time: '22m ago', icon: '❤️' },
    { type: 'request',  text: 'AB+ found for patient in Kolkata ICU', time: '25m ago', icon: '🎯' },
  ];

  const allItems = items.length > 0 ? items : defaultItems;
  const doubled = [...allItems, ...allItems]; // duplicate for seamless loop

  return (
    <div className="relative overflow-hidden py-3" aria-hidden="true">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #0f0f14, transparent)' }} />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #0f0f14, transparent)' }} />

      <div className="ticker-wrap">
        <div
          className="ticker-content"
          style={{ animationDuration: `${speed}s` }}
        >
          {doubled.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-sm text-white/70 whitespace-nowrap flex-shrink-0"
            >
              <span>{item.icon}</span>
              <span>{item.text}</span>
              <span className="text-white/30 text-xs">· {item.time}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
