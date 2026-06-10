// CountInOverlay — big, can't-miss-it count-in display for Boom Garden.
//
// Shows a sequence of huge numbers ("4 → 3 → 2 → 1") followed by a "GO!"
// burst, perfectly synced to the BEAT_MS click track. Each number pops in,
// scales up, fades out as the next beat arrives. Color shifts from cool
// blue → warm yellow → green "GO" so kids feel the heat building.
//
// Driven by a wall-clock reference (`startAtMs` = Date.now() of the first
// click) and `running` boolean. Pure CSS / framer-motion animations — no
// React state per beat, so we stay in lockstep with the audio.

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BEAT_MS } from '../data/rhythms';

const STEPS = [
  { label: '4', color: '#4285F4', textColor: 'white' },
  { label: '3', color: '#FF9500', textColor: 'white' },
  { label: '2', color: '#FFCC00', textColor: '#0A2540' },
  { label: '1', color: '#FF3B30', textColor: 'white' },
  { label: 'GO!', color: '#34A853', textColor: 'white' },
];

export default function CountInOverlay({ running, startAtMs }) {
  const [stepIdx, setStepIdx] = useState(-1);

  useEffect(() => {
    if (!running || !startAtMs) {
      setStepIdx(-1);
      return undefined;
    }
    let raf;
    const tick = () => {
      const elapsed = Date.now() - startAtMs;
      // Step 0 (number "4") fires AT t=0. Step 4 ("GO!") fires at t=4*BEAT_MS
      // — the exact moment the input window opens / beat-1 is expected.
      const idx = Math.min(4, Math.max(-1, Math.floor(elapsed / BEAT_MS)));
      setStepIdx(idx);
      // Stop polling once we've shown "GO!" plus a brief hold.
      if (elapsed < 4 * BEAT_MS + 600) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, startAtMs]);

  const current = stepIdx >= 0 ? STEPS[stepIdx] : null;

  return (
    <div
      data-testid="count-in-overlay"
      className="pointer-events-none fixed inset-0 flex items-start justify-center z-20"
      style={{ paddingTop: 'clamp(120px, 26vh, 220px)' }}
    >
      <AnimatePresence>
        {current && (
          <motion.div
            key={stepIdx}
            initial={{ scale: 0.3, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.5, opacity: 0, rotate: 0 }}
            transition={{
              scale:   { type: 'spring', stiffness: 520, damping: 16, mass: 0.55 },
              opacity: { duration: 0.18, ease: 'easeOut' },
              rotate:  { type: 'spring', stiffness: 520, damping: 18 },
              exit:    { duration: 0.22, ease: 'easeIn' },
            }}
            className="absolute rounded-3xl border-4 flex items-center justify-center font-black font-display select-none"
            style={{
              width: 'clamp(180px, 36vw, 320px)',
              height: 'clamp(180px, 36vw, 320px)',
              backgroundColor: current.color,
              borderColor: 'var(--jma-dark)',
              color: current.textColor,
              fontSize: 'clamp(80px, 18vw, 180px)',
              lineHeight: 1,
              boxShadow: '0 14px 0 0 var(--jma-dark), 0 22px 36px rgba(0,0,0,0.28)',
              textShadow: '4px 4px 0 rgba(10,37,64,0.4)',
            }}
          >
            {current.label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
