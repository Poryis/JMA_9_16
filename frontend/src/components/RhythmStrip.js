// RhythmStrip — horizontal rhythm-notation strip for Boom Garden.
//
// Each block shows:
//   - A real musical note PNG (whole / half / quarter / eighth — provided by
//     the user) for non-rest notes, OR the seahorse-rest illustration.
//   - The Kodály counting syllable underneath (Ta / Ti / Toe-ee /
//     Toe-ee--O-ee / Shh). Match the JMA's chunky-block aesthetic.
//
// `highlightIndex` lifts and brightens one block — used for the demo
// playhead in Copy Cat and Tap Trail. Highlighted blocks swap to the user's
// "highlighted" note PNG variants for a real notation-style emphasis.

import { NOTE_DEFS, patternBeats } from '../data/rhythms';

export default function RhythmStrip({
  pattern,
  highlightIndex = -1,
  hitStates = null,    // optional array of 'perfect' | 'miss' per index
  height = 110,
  testIdPrefix = 'rhythm-block',
  onBlockTap = null,   // optional handler: called with index when a block is tapped
}) {
  const totalBeats = patternBeats(pattern);

  return (
    <div
      className="flex items-stretch gap-1 rounded-2xl border-4 p-2 bg-white/85 backdrop-blur"
      data-testid="rhythm-strip"
      style={{
        borderColor: 'var(--jma-dark)',
        boxShadow: '0 4px 0 0 var(--jma-dark)',
        height,
        maxHeight: height,
        width: '100%',
      }}
    >
      {pattern.map((key, i) => {
        const def = NOTE_DEFS[key];
        const widthPct = (def.beats / totalBeats) * 100;
        const isHi = i === highlightIndex;
        const isRest = key === 'rest';
        const hit = hitStates?.[i];
        const tintBg =
          hit === 'perfect' ? '#34A85355'
          : hit === 'miss'   ? '#FF3B3055'
          : (isHi ? `${def.color}AA` : `${def.color}33`);
        const Tag = onBlockTap ? 'button' : 'div';
        const tapProps = onBlockTap
          ? {
              type: 'button',
              onClick: () => onBlockTap(i),
              'aria-label': `Pattern option ${i + 1}`,
            }
          : {};
        return (
          <Tag
            key={i}
            data-testid={`${testIdPrefix}-${i}`}
            {...tapProps}
            className="flex flex-col items-center justify-between rounded-xl border-3 select-none overflow-hidden py-1"
            style={{
              width: `${widthPct}%`,
              backgroundColor: tintBg,
              borderColor: 'var(--jma-dark)',
              boxShadow: isHi ? '0 4px 0 0 var(--jma-dark)' : '0 2px 0 0 var(--jma-dark)',
              color: 'var(--jma-dark)',
              transform: isHi ? 'translateY(-3px) scale(1.04)' : 'none',
              transition: 'transform 0.15s ease-out, background-color 0.15s, box-shadow 0.15s',
              cursor: onBlockTap ? 'pointer' : 'default',
              padding: '6px 4px',
              minWidth: `${Math.max(40, widthPct * 3)}px`,
            }}
          >
            {/* Note PNG (or seahorse rest) */}
            <img
              src={isHi ? def.imgHi : def.img}
              alt={isRest ? 'rest' : def.label}
              draggable={false}
              className="object-contain pointer-events-none select-none"
              style={{
                maxHeight: '60%',
                maxWidth: '80%',
                filter: isRest ? 'none' : 'drop-shadow(0 1px 0 rgba(255,255,255,0.6))',
              }}
            />
            {/* Counting syllable */}
            <span
              className="text-[10px] sm:text-xs md:text-sm font-black font-display leading-none text-center pointer-events-none"
              style={{
                textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
                marginTop: 2,
              }}
            >
              {def.syllable}
            </span>
          </Tag>
        );
      })}
    </div>
  );
}
