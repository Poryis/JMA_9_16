// ConsolePadOverlay — a strip of 16 chunky colored square "step pads"
// positioned to sit ON the empty grey step-sequencer console in the
// beat-lab-studio.png backdrop. Each pad flashes when the current
// sequencer step maps to it, so the physical gear appears to be
// driving the on-screen grid.
//
// Because the sequencer can run 1, 2, or 4 bars (16, 32, or 64 steps)
// but the physical console only has 16 visible pads, we map every
// step to `step % 16` so the pad row keeps flashing for the whole
// loop instead of stopping after the first bar.

import { motion } from 'framer-motion';

const PAD_COLORS = ['#FF3B30', '#FFCC00', '#4285F4', '#4CD964'];

export default function ConsolePadOverlay({ currentStep, isPlaying }) {
  const litIndex = isPlaying && currentStep >= 0 ? currentStep % 16 : -1;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 flex justify-center z-[6]"
      style={{ bottom: '5.5vh' }}
      data-testid="console-pad-overlay"
    >
      <div
        className="flex"
        style={{
          width: 'min(42vw, 640px)',
          gap: '0.25vw',
        }}
      >
        {Array.from({ length: 16 }, (_, i) => {
          const color = PAD_COLORS[i % PAD_COLORS.length];
          const lit = litIndex === i;
          return (
            <motion.div
              key={i}
              className="flex-1 rounded-[4px]"
              style={{
                aspectRatio: '1 / 1',
                backgroundColor: color,
                border: '1.5px solid #0A2540',
                opacity: lit ? 1 : 0.72,
                boxShadow: lit
                  ? `0 0 12px 3px ${color}, inset 0 -3px 0 rgba(0,0,0,0.25), inset 0 2px 0 rgba(255,255,255,0.5)`
                  : 'inset 0 -3px 0 rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
              }}
              animate={{ scale: lit ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            />
          );
        })}
      </div>
    </div>
  );
}
