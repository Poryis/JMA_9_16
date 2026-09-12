// ConsolePadOverlay — a strip of 16 chunky colored square "step pads"
// absolutely positioned at the bottom of the Beat Lab page, roughly
// aligned with the empty grey step-sequencer console in the background
// image (beat-lab-studio.png). Each pad flashes when its step index
// matches the currently-playing step, so the physical hardware in the
// backdrop appears to run in sync with the on-screen sequencer.
//
// Pads are always faintly lit so the strip reads as a piece of gear
// even when the sequence isn't playing.

import { motion } from 'framer-motion';

// Matches the JMA palette + gives the strip a rainbow spectrum. Repeats
// every 4 pads so the downbeats (1, 5, 9, 13) all share a color, which
// makes the beat easier to feel.
const PAD_COLORS = ['#FF3B30', '#FFCC00', '#4285F4', '#4CD964'];

export default function ConsolePadOverlay({ currentStep, isPlaying }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 flex justify-center z-[6]"
      style={{ bottom: 'clamp(48px, 9%, 120px)' }}
      data-testid="console-pad-overlay"
    >
      <div
        className="flex gap-[0.4%]"
        style={{ width: 'min(46vw, 720px)' }}
      >
        {Array.from({ length: 16 }, (_, i) => {
          const color = PAD_COLORS[i % PAD_COLORS.length];
          const lit = isPlaying && currentStep === i;
          return (
            <motion.div
              key={i}
              className="flex-1 rounded-[3px]"
              style={{
                aspectRatio: '1 / 1',
                backgroundColor: color,
                border: '2px solid #0A2540',
                opacity: lit ? 1 : 0.55,
                boxShadow: lit
                  ? `0 0 14px 4px ${color}, inset 0 -2px 0 rgba(255,255,255,0.5)`
                  : 'inset 0 -2px 0 rgba(0,0,0,0.15)',
              }}
              animate={{ scale: lit ? 1.12 : 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            />
          );
        })}
      </div>
    </div>
  );
}
