// SolfegeStaff — proper 5-line treble staff with notes positioned by pitch.
//
// Note vertical positions (treble clef, our C5–C6 + middle C bell range):
//   Bell    Solfege   Staff position                     Y%
//   ------  --------  ---------------------------------  -----
//   C       Do        Ledger line below staff (Middle C) 100% (well below)
//   D       Re        Just below bottom line              ~92%
//   E       Mi        On bottom line                      85%
//   F       Fa        In first space                      78%
//   G       So        On second line                      71%
//   A       La        In second space                     64%
//   B       Ti        On middle line                      57%
//   High C  Do↑       In third space                      50%
//
// The 5 staff lines sit at y = 85%, 71%, 57%, 43%, 29%.
// Notes are rendered as colored "lollipop" note heads with a thin stem.
// The currently-aimed-at note pulses, completed notes turn green, and a
// wrong tap flashes red briefly.

import { motion } from 'framer-motion';
import { BELLS } from './JellyBells';
import { ChevronUp } from 'lucide-react';

const BELL_BY_NOTE = Object.fromEntries(BELLS.map(b => [b.note, b]));

// y in %: where the CENTER of the note head sits inside the staff container.
// These match real treble-clef positions for our bell range.
const NOTE_Y = {
  C: 99,       // Middle C — sits on a ledger line below the staff
  D: 92,
  E: 85,       // bottom line
  F: 78,       // first space
  G: 71,       // second line
  A: 64,       // second space
  B: 57,       // middle line
  'High C': 50, // third space (still inside the staff, just above the middle line)
};

// The 5 staff lines, top to bottom (in %).
const STAFF_LINES = [29, 43, 57, 71, 85];

// Inline treble-clef SVG. Anchored at the left of the staff and scales with it.
function TrebleClef({ height }) {
  return (
    <svg
      viewBox="0 0 36 100"
      width={height * 0.36}
      height={height}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      <g fill="none" stroke="var(--jma-dark)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Stylized G clef — simplified for clarity */}
        <path d="M18 8 C 24 16, 26 30, 18 42 C 6 52, 4 70, 18 76 C 30 80, 32 64, 22 60 C 14 58, 12 70, 20 72" />
        <path d="M18 8 L 18 88" />
        <circle cx="18" cy="92" r="3.2" fill="var(--jma-dark)" stroke="none" />
      </g>
    </svg>
  );
}

export default function SolfegeStaff({ sequence, currentIndex = -1, wrongAt = -1, doneIndices = new Set() }) {
  // Container height stays in a clamp range so it scales with viewport but
  // never collapses on tiny phones.
  const heightStyle = 'clamp(180px, 28vw, 240px)';
  return (
    <div
      data-testid="solfege-staff"
      className="relative w-full max-w-2xl mx-auto rounded-2xl border-4 overflow-hidden"
      style={{
        borderColor: 'var(--jma-dark)',
        background: 'linear-gradient(180deg, #FFFBEE 0%, #FFF4D6 100%)',
        boxShadow: '0 6px 0 0 var(--jma-dark)',
        height: heightStyle,
      }}
    >
      {/* The 5 staff lines */}
      <div className="absolute inset-x-2 inset-y-0 pointer-events-none">
        {STAFF_LINES.map((y, i) => (
          <div
            key={i}
            className="absolute left-0 right-0"
            style={{
              top: `${y}%`,
              height: '2px',
              backgroundColor: 'rgba(10,37,64,0.55)',
            }}
          />
        ))}
      </div>

      {/* Treble clef — anchored on the left */}
      <div
        className="absolute left-2 pointer-events-none"
        style={{
          top: '20%',
          bottom: '4%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <TrebleClef height={150} />
      </div>

      {/* Notes — laid out evenly to the right of the clef */}
      <div className="absolute inset-y-0 right-2 flex items-stretch" style={{ left: 'clamp(50px, 9vw, 76px)' }}>
        {sequence.map((note, i) => {
          const bell = BELL_BY_NOTE[note];
          if (!bell) return null;
          const y = NOTE_Y[note] ?? 60;
          const isCurrent = i === currentIndex;
          const isWrong = i === wrongAt;
          const isDone = doneIndices.has(i);
          const headColor = isWrong ? '#FF3B30'
                          : isDone  ? '#34A853'
                          : bell.color;
          const showLedger = note === 'C'; // middle C needs a ledger line through the head

          return (
            <div
              key={`${i}-${note}`}
              data-testid={`staff-note-${i}`}
              className="relative flex-1 h-full"
            >
              {/* Stem — drawn from the note head upward (or downward for high notes) */}
              <div
                className="absolute"
                style={{
                  left: '50%',
                  // For notes at or below middle line (B = 57%), stem goes up; above, stem goes down.
                  top: y < 57 ? `${y}%` : `${Math.max(0, y - 28)}%`,
                  height: '28%',
                  width: '2px',
                  backgroundColor: 'var(--jma-dark)',
                  transform: 'translateX(-50%)',
                  opacity: 0.85,
                }}
              />

              {/* Ledger line for Middle C (and any other below-staff notes) */}
              {showLedger && (
                <div
                  className="absolute"
                  style={{
                    left: '50%',
                    top: `${y}%`,
                    width: '36px',
                    height: '2px',
                    backgroundColor: 'rgba(10,37,64,0.55)',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              )}

              {/* Note head — colored oval, solfege label below */}
              <motion.div
                className="absolute flex flex-col items-center"
                style={{
                  left: '50%',
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isCurrent ? 5 : 2,
                }}
                animate={isCurrent ? { scale: [1, 1.14, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }}
                transition={isCurrent ? { duration: 1.0, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
              >
                {/* Oval note head, tilted like a real notehead */}
                <div
                  className="rounded-full border-2"
                  style={{
                    width: 'clamp(22px, 4.2vw, 30px)',
                    height: 'clamp(16px, 3.2vw, 22px)',
                    backgroundColor: headColor,
                    borderColor: 'var(--jma-dark)',
                    transform: 'rotate(-18deg)',
                    boxShadow: isCurrent
                      ? `0 0 0 5px rgba(255,204,0,0.85), 0 3px 0 0 var(--jma-dark)`
                      : '0 3px 0 0 var(--jma-dark)',
                  }}
                />
                {/* Solfege label — pinned below the head with a small offset */}
                <span
                  className="font-black font-display leading-none"
                  style={{
                    marginTop: '4px',
                    color: headColor,
                    fontSize: 'clamp(11px, 2.2vw, 14px)',
                    textShadow: '1px 1px 0 rgba(255,255,255,0.85)',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {bell.solfege}
                  {note === 'High C' && (
                    <ChevronUp className="w-3 h-3 ml-0.5" strokeWidth={4} />
                  )}
                </span>
              </motion.div>

              {/* Position number — anchored to the bottom of the staff cell */}
              <span
                className="absolute font-black"
                style={{
                  left: '50%',
                  bottom: 4,
                  transform: 'translateX(-50%)',
                  color: 'var(--jma-dark)',
                  fontSize: '11px',
                  opacity: isCurrent ? 1 : 0.45,
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
