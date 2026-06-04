// SolfegeStaff — proper 5-line treble staff with USER-DRAWN quarter-note PNGs.
//
// Each note PNG is 291×854 with the note HEAD anchored at a known % of the
// image height. Stem-up notes (do/re/mi/fa/so/la) have the head at ~84.5% of
// the image (stem extends UP from the head). Stem-down notes (ti, hi do) have
// the head at ~15.2% (stem extends DOWN from the head).
//
// To place a note so the HEAD sits at staff y%, we set CSS `top: y%` on a
// 0-height anchor div and absolutely position the image inside translated up
// by the head-percent of its own height. That way swapping which note PNG
// renders doesn't change where the head lands.
//
// Treble-clef y positions (in % from top of staff container):
//   Bell    Solfege   Where it sits                Y%
//   ------  --------  --------------------------- ----
//   C       Do        Ledger line below staff      95
//   D       Re        Just below bottom line       89
//   E       Mi        Bottom line                  85
//   F       Fa        First space                  78
//   G       So        Second line                  71
//   A       La        Second space                 64
//   B       Ti        Middle line                  57
//   High C  Do↑       Third space                  50
// (Staff lines at: 29, 43, 57, 71, 85 %)

import { motion } from 'framer-motion';
import { BELLS } from './JellyBells';

// Map each bell note to the kid's quarter-note artwork + head-anchor.
// `headPct` is where the note head's vertical center lives inside the PNG.
const NOTE_ART = {
  C:        { src: 'assets/notes/do.png',     headPct: 84.5 },
  D:        { src: 'assets/notes/re.png',     headPct: 84.5 },
  E:        { src: 'assets/notes/mi.png',     headPct: 84.5 },
  F:        { src: 'assets/notes/fa.png',     headPct: 84.5 },
  G:        { src: 'assets/notes/so.png',     headPct: 84.5 },
  A:        { src: 'assets/notes/la.png',     headPct: 84.5 },
  B:        { src: 'assets/notes/ti.png',     headPct: 15.2 },
  'High C': { src: 'assets/notes/do-hi.png',  headPct: 15.2 },
};

const NOTE_Y = {
  C: 85,        // Middle C — sits on a ledger line just below the staff
  D: 80,
  E: 75,        // bottom line
  F: 69,        // first space
  G: 62,        // second line
  A: 55,        // second space
  B: 49,        // middle line
  'High C': 42, // third space
};

// The 5 staff lines, top to bottom (in %). Spaced 13% apart with the bottom
// line at 75% so there's room below for Middle C's ledger note.
const STAFF_LINES = [23, 36, 49, 62, 75];

const NOTE_IMG_H = 'clamp(140px, 22vw, 200px)';

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
        <path d="M18 8 C 24 16, 26 30, 18 42 C 6 52, 4 70, 18 76 C 30 80, 32 64, 22 60 C 14 58, 12 70, 20 72" />
        <path d="M18 8 L 18 88" />
        <circle cx="18" cy="92" r="3.2" fill="var(--jma-dark)" stroke="none" />
      </g>
    </svg>
  );
}

// Note image height as % of the staff container height. Unused — see NOTE_IMG_H.
const NOTE_IMG_HEIGHT_PCT = 100;

export default function SolfegeStaff({ sequence, currentIndex = -1, wrongAt = -1, doneIndices = new Set() }) {
  const heightStyle = 'clamp(240px, 34vw, 300px)';
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
      {/* The 5 staff lines — darker so they read clearly behind the bright notes */}
      <div className="absolute inset-x-2 inset-y-0 pointer-events-none">
        {STAFF_LINES.map((y, i) => (
          <div
            key={i}
            className="absolute left-0 right-0"
            style={{
              top: `${y}%`,
              height: '3px',
              backgroundColor: 'rgba(10,37,64,0.7)',
            }}
          />
        ))}
      </div>

      {/* Treble clef — anchored on the left, sized to the staff height */}
      <div
        className="absolute left-2 pointer-events-none"
        style={{ top: '20%', height: '64%', display: 'flex', alignItems: 'center' }}
      >
        <TrebleClef height={140} />
      </div>

      {/* Notes — laid out evenly to the right of the clef.
          Each cell is `flex-1 h-full relative` so absolutely-positioned
          children resolve against the full staff height. */}
      <div className="absolute inset-y-0 right-2 flex items-stretch" style={{ left: 'clamp(56px, 10vw, 84px)' }}>
        {sequence.map((note, i) => {
          const art = NOTE_ART[note];
          if (!art) return null;
          const y = NOTE_Y[note] ?? 60;
          const isCurrent = i === currentIndex;
          const isWrong = i === wrongAt;
          const isDone = doneIndices.has(i);
          const showLedger = note === 'C'; // Middle C ledger line

          return (
            <div
              key={`${i}-${note}`}
              data-testid={`staff-note-${i}`}
              className="relative flex-1 h-full"
            >
              {/* Ledger line for Middle C — drawn behind the note head, thicker so it reads */}
              {showLedger && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: '50%',
                    top: `${y}%`,
                    width: 'clamp(34px, 6vw, 50px)',
                    height: '3px',
                    backgroundColor: 'rgba(10,37,64,0.7)',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1,
                  }}
                />
              )}

              {/* The actual note PNG, anchored by its head.
                  Two-layer setup:
                    • Outer (static) div positions itself with the head-anchor transform.
                    • Inner motion.img owns the looping float animation so motion doesn't
                      stomp on our static head-anchor transform.
                  Image is sized to NOTE_IMG_H so head is a sensible size for staff. */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: '50%',
                  top: `${y}%`,
                  height: NOTE_IMG_H,
                  width: 'auto',
                  // Head-anchor: translate up by headPct of THIS DIV's height so
                  // the note HEAD lands precisely on the staff y%.
                  transform: `translate(-50%, ${-art.headPct}%)`,
                  zIndex: isCurrent ? 5 : 3,
                }}
              >
                <motion.img
                  src={art.src}
                  alt={note}
                  draggable={false}
                  style={{
                    display: 'block',
                    height: '100%',
                    width: 'auto',
                    filter: isWrong
                      ? 'hue-rotate(-30deg) saturate(2) brightness(0.95)'
                      : isDone
                        ? 'hue-rotate(60deg) saturate(1.6) brightness(0.95)'
                        : isCurrent
                          ? 'drop-shadow(0 0 6px rgba(255,204,0,0.95))'
                          : 'none',
                  }}
                  animate={isCurrent ? { y: [0, -4, 0] } : { y: 0 }}
                  transition={isCurrent ? { duration: 1.0, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
                />
              </div>

              {/* Position number — small badge at the very bottom */}
              <span
                className="absolute font-black"
                style={{
                  left: '50%',
                  bottom: 4,
                  transform: 'translateX(-50%)',
                  color: 'var(--jma-dark)',
                  fontSize: '11px',
                  opacity: isCurrent ? 1 : 0.45,
                  zIndex: 6,
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
