// HarpConstellation — a cluster of background stars traces the JMA harp
// silhouette in the corner of the JMAtv sky. Ultra-subtle: stars twinkle
// out of sync so the shape reveals itself only if you're looking, and
// faint "string" lines connect them at very low opacity.
//
// Anchored via absolute % on the shared SpaceBackdrop so it lives well
// away from the CRT tile grid (upper-left quadrant).

import { motion } from 'framer-motion';

// Harp shape in a 100×100 local coordinate space.
// 12 points trace: soundbox base → left column → crested neck →
// diagonal strings back down to the base.
const HARP_POINTS = [
  { x: 22, y: 82 },  // base left
  { x: 22, y: 62 },  // column mid
  { x: 22, y: 42 },  // column upper
  { x: 22, y: 26 },  // column top
  { x: 34, y: 14 },  // neck rise 1
  { x: 52, y: 8  },  // neck crest
  { x: 70, y: 12 },  // neck curl
  { x: 76, y: 24 },  // neck tip
  { x: 68, y: 38 },  // string 1
  { x: 58, y: 52 },  // string 2
  { x: 48, y: 66 },  // string 3
  { x: 42, y: 82 },  // base right
];

// String lines — draw between neck arch and soundbox base.
const STRING_LINES = [
  { x1: 70, y1: 12, x2: 30, y2: 82 },
  { x1: 68, y1: 18, x2: 34, y2: 82 },
  { x1: 66, y1: 24, x2: 38, y2: 82 },
];

export default function HarpConstellation() {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute pointer-events-none"
      style={{
        left: '4%',
        top: '38%',
        width: 'clamp(120px, 14vw, 200px)',
        aspectRatio: '1 / 1',
        zIndex: 0,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 3 }}
    >
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        {/* Faint string lines — nearly invisible until the eye picks
            them out. Solid, no animation, so the twinkling stars are
            the only motion. */}
        {STRING_LINES.map((s, i) => (
          <line
            key={`str-${i}`}
            x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
            stroke="rgba(255,231,194,0.10)"
            strokeWidth="0.4"
          />
        ))}

        {/* Constellation stars — each blinks on its own cycle so the
            harp shimmers rather than pulses in unison. */}
        {HARP_POINTS.map((p, i) => {
          const dur = 2.2 + (i % 5) * 0.6;   // 2.2–4.6s per star
          const delay = -(i * 0.37);          // stagger so no two hit
          const size  = i % 3 === 0 ? 1.6 : 1.1;
          return (
            <g key={`pt-${i}`}>
              {/* Soft halo */}
              <circle cx={p.x} cy={p.y} r={size * 2.4} fill="#FFCC00" opacity="0.18">
                <animate
                  attributeName="opacity"
                  values="0.05;0.25;0.05"
                  dur={`${dur}s`}
                  begin={`${delay}s`}
                  repeatCount="indefinite"
                />
              </circle>
              {/* Star core */}
              <circle cx={p.x} cy={p.y} r={size} fill="#FFFFFF">
                <animate
                  attributeName="opacity"
                  values="0.4;1;0.4"
                  dur={`${dur}s`}
                  begin={`${delay}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}
      </svg>
    </motion.div>
  );
}
