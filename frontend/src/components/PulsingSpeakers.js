// 3-frame pulsing speakers — cycles through the speaker animation frames.
// When the parent's `playing` prop is true, the cycle accelerates (~120 ms)
// to feel like the speakers are pumping with the beat. When idle, it cycles
// gently (~400 ms).
//
// Drop it anywhere with absolute positioning:
//   <PulsingSpeakers side="left"  playing={isPlaying} />
//   <PulsingSpeakers side="right" playing={isPlaying} />

import { useEffect, useState } from 'react';

const FRAMES = [
  'assets/animations/speakers-stew-1.png',
  'assets/animations/speakers-stew-2.png',
  'assets/animations/speakers-stew-3.png',
];

export function PulsingSpeakers({
  side = 'left',
  playing = false,
  bottom = '4%',
  width = 'clamp(70px, 12vw, 160px)',
  className = '',
  style = {},
  flip = false,
}) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const intervalMs = playing ? 120 : 400;
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), intervalMs);
    return () => clearInterval(id);
  }, [playing]);

  const positionStyle = side === 'left'
    ? { left: '1.5%', bottom }
    : { right: '1.5%', bottom };

  return (
    <div
      data-testid={`pulsing-speakers-${side}`}
      aria-hidden="true"
      className={`absolute pointer-events-none select-none ${className}`}
      style={{
        ...positionStyle,
        width,
        zIndex: 1,
        transform: flip ? 'scaleX(-1)' : undefined,
        ...style,
      }}
    >
      {FRAMES.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          draggable={false}
          loading="lazy"
          className="absolute inset-0 w-full h-auto"
          style={{
            display: i === frame ? 'block' : 'none',
            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.25))',
          }}
        />
      ))}
      {/* Aspect placeholder */}
      <img
        src={FRAMES[0]}
        alt=""
        aria-hidden="true"
        className="block w-full h-auto invisible"
      />
    </div>
  );
}

export default PulsingSpeakers;
