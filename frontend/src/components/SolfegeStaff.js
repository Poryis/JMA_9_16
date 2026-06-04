// SolfegeStaff — displays a short sequence of solfege names as colored
// "note circles" sitting on a small 3-line staff. Used by the Sight-Reading
// Sprint mode in Note Match.
//
// Each note shows:
//   - Solfege name (Do, Re, Mi, etc.)
//   - The bell's signature color
//   - A vertical position keyed to the pitch (lower notes sit lower)
//
// `playedIndex` lights up the note the kid is currently aiming for.
// `wrongAt` flashes red on a specific index (passed by the parent).

import { motion } from 'framer-motion';
import { BELLS } from './JellyBells';
import { ChevronUp } from 'lucide-react';

const BELL_BY_NOTE = Object.fromEntries(BELLS.map(b => [b.note, b]));
// Note order from low (bottom) to high (top) maps to a vertical y position.
const PITCH_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'High C'];

function noteY(note) {
  const idx = PITCH_ORDER.indexOf(note);
  if (idx < 0) return 50;
  // Map idx 0..7 → y 78%..14% (lower notes bottom, higher notes top)
  return 78 - (idx / 7) * 64;
}

export default function SolfegeStaff({ sequence, currentIndex = -1, wrongAt = -1, doneIndices = new Set() }) {
  // Width is responsive — staff scales to fit container
  return (
    <div
      data-testid="solfege-staff"
      className="relative w-full max-w-2xl mx-auto rounded-2xl border-4 overflow-hidden"
      style={{
        borderColor: 'var(--jma-dark)',
        background: 'linear-gradient(180deg, #FFFBEE 0%, #FFF4D6 100%)',
        boxShadow: '0 6px 0 0 var(--jma-dark)',
        height: 'clamp(140px, 22vw, 200px)',
      }}
    >
      {/* Staff lines (decorative, 3 lines so it's kid-friendly) */}
      <div className="absolute inset-x-6 inset-y-0 pointer-events-none">
        {[28, 50, 72].map((y, i) => (
          <div
            key={i}
            className="absolute left-0 right-0"
            style={{
              top: `${y}%`,
              height: '2px',
              backgroundColor: 'rgba(10,37,64,0.35)',
            }}
          />
        ))}
      </div>

      {/* Notes */}
      <div className="absolute inset-0 flex items-center justify-around px-4">
        {sequence.map((note, i) => {
          const bell = BELL_BY_NOTE[note];
          if (!bell) return null;
          const y = noteY(note);
          const isCurrent = i === currentIndex;
          const isWrong = i === wrongAt;
          const isDone = doneIndices.has(i);

          return (
            <div
              key={`${i}-${note}`}
              data-testid={`staff-note-${i}`}
              className="relative flex-1 h-full flex items-center justify-center"
            >
              <motion.div
                className="absolute rounded-full border-3 flex items-center justify-center font-black font-display"
                style={{
                  top: `calc(${y}% - 24px)`,
                  width: 'clamp(46px, 8vw, 64px)',
                  height: 'clamp(46px, 8vw, 64px)',
                  backgroundColor: isWrong ? '#FF3B30' : (isDone ? '#34A853' : bell.color),
                  borderColor: 'var(--jma-dark)',
                  color: 'white',
                  textShadow: '1px 1px 0 rgba(0,0,0,0.4)',
                  fontSize: 'clamp(13px, 2.6vw, 18px)',
                  boxShadow: isCurrent
                    ? `0 0 0 5px rgba(255,204,0,0.9), 0 4px 0 0 var(--jma-dark)`
                    : '0 4px 0 0 var(--jma-dark)',
                  zIndex: isCurrent ? 5 : 2,
                }}
                animate={isCurrent ? { scale: [1, 1.12, 1], y: [0, -3, 0] } : { scale: 1, y: 0 }}
                transition={isCurrent ? { duration: 1.0, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
              >
                <span className="flex items-center leading-none">
                  {bell.solfege}
                  {note === 'High C' && (
                    <ChevronUp className="w-3 h-3 ml-0.5" strokeWidth={4} />
                  )}
                </span>
              </motion.div>
              {/* Position number under the staff */}
              <span
                className="absolute text-xs font-black"
                style={{
                  bottom: 4,
                  color: 'var(--jma-dark)',
                  opacity: isCurrent ? 1 : 0.5,
                }}
              >
                {i + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
