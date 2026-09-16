// DrJellyboneAstronaut — Dr. Jellybone drifting through the JMAtv sky
// with a bubble space helmet strapped on top of his fedora.
//
// Behavior mirrors <BlimpFlyby /> and <SatelliteFlyby />: he starts
// off-screen, drifts diagonally across a random lap over ~30–45s,
// bobs on the Y axis, then re-launches from the opposite side.
//
// Sprite is a 3-frame idle cycle (the "Jelly Man Jellybone no sax"
// swaps user provided) — swaps every 480ms so the tentacles feel
// alive without demanding attention. The bubble helmet is a small
// inline SVG overlay locked to the head area so we don't have to
// paint on the source PNGs.

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const FRAMES = [
  'assets/characters/dr-jellybone-astro-1.png',
  'assets/characters/dr-jellybone-astro-2.png',
  'assets/characters/dr-jellybone-astro-3.png',
];

const JMA_DARK = '#0A2540';

function makeLap(direction) {
  const startYvh = 6 + Math.random() * 28;
  const sign = Math.random() < 0.5 ? -1 : 1;
  const delta = sign * (4 + Math.random() * 10);
  const endYvh = Math.max(2, Math.min(38, startYvh + delta));
  return {
    direction,
    startYvh,
    endYvh,
    durationSec: 32 + Math.random() * 14,
    scale: 0.6 + Math.random() * 0.4,
  };
}

// Bubble helmet + collar, positioned as a percentage of the sprite's
// bounding box so it stays glued to his head regardless of scale.
function BubbleHelmet() {
  return (
    <div
      aria-hidden="true"
      className="absolute pointer-events-none"
      style={{
        top: '-3%',
        left: '10%',
        width: '68%',
        aspectRatio: '1 / 1',
        zIndex: 2,
      }}
    >
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        {/* Glass bubble — mostly transparent so his face + fedora
            show through */}
        <circle
          cx="50" cy="50" r="46"
          fill="rgba(200,230,255,0.10)"
          stroke={JMA_DARK}
          strokeWidth="4"
        />
        {/* Rim highlight */}
        <circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2"
        />
        {/* Glass glint */}
        <path
          d="M 22 32 Q 30 20 44 20"
          fill="none"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="70" cy="26" r="3" fill="rgba(255,255,255,0.55)" />
      </svg>
    </div>
  );
}

export default function DrJellyboneAstronaut() {
  const [lap, setLap] = useState(() => makeLap(1));
  const [frameIdx, setFrameIdx] = useState(0);

  // 3-frame idle cycle — swap every 480ms so his tentacles feel alive.
  useEffect(() => {
    const id = setInterval(() => {
      setFrameIdx((i) => (i + 1) % FRAMES.length);
    }, 480);
    return () => clearInterval(id);
  }, []);

  // Reset lap when duration ends — direction flips so the next entrance
  // comes from the opposite side of the sky.
  useEffect(() => {
    const id = setTimeout(() => {
      setLap((prev) => makeLap(-prev.direction));
    }, lap.durationSec * 1000);
    return () => clearTimeout(id);
  }, [lap]);

  const { direction, startYvh, endYvh, durationSec, scale } = lap;
  const fromX = direction === 1 ? '-25vw' : '110vw';
  const toX   = direction === 1 ? '110vw' : '-25vw';

  return (
    <motion.div
      aria-hidden="true"
      data-testid="dr-jellybone-astro"
      className="absolute pointer-events-none select-none"
      style={{
        left: 0,
        top: 0,
        width: 'clamp(90px, 14vw, 200px)',
        zIndex: 1,
        opacity: 0.95,
        filter: 'drop-shadow(0 8px 22px rgba(0,0,0,0.55))',
      }}
      key={`${direction}-${startYvh.toFixed(1)}-${endYvh.toFixed(1)}-${scale.toFixed(2)}`}
      initial={{ x: fromX, y: `${startYvh}vh`, rotate: -6 * direction, scale }}
      animate={{
        x: toX,
        y: `${endYvh}vh`,
        rotate: [direction * -6, direction * 6, direction * -6],
        scale,
      }}
      transition={{
        x: { duration: durationSec, ease: 'linear' },
        y: { duration: durationSec, ease: 'easeInOut' },
        rotate: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
        scale: { duration: 0 },
      }}
    >
      <div className="relative" style={{ transform: `scaleX(${-direction})`, transformOrigin: 'center' }}>
        <img
          src={FRAMES[frameIdx]}
          alt=""
          draggable={false}
          className="block w-full h-auto"
        />
        <BubbleHelmet />
      </div>
    </motion.div>
  );
}
