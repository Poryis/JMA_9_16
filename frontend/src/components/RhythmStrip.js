// RhythmStrip — horizontal notation strip for Boom Garden.
//
// Renders each note as a colored block, sized proportionally to its beat
// length. The Kodály counting syllable (Ta, Ti, Toe-ee, Toe-ee--O-ee) is
// printed inside each block. Rests use the existing seahorse asset to stay
// visually consistent with the rest of the JMA world.
//
// `highlightIndex` lifts and brightens one block — used by Copy Cat to show
// the demo playhead, and by Tap Trail to mark the current beat target.

import { NOTE_DEFS, patternBeats } from '../data/rhythms';

const REST_IMG = 'assets/ui/seahorse-rest.png';

export default function RhythmStrip({
  pattern,
  highlightIndex = -1,
  hitStates = null,   // optional array of 'perfect' | 'miss' per index
  height = 90,
  testIdPrefix = 'rhythm-block',
  onBlockTap = null,  // optional handler: called with index when a block is tapped
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
        const tintBg = hit === 'perfect'
          ? '#34A85388'
          : hit === 'miss'
            ? '#FF3B3088'
            : (isHi ? def.color : `${def.color}66`);
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
            className="flex flex-col items-center justify-center rounded-xl border-3 select-none overflow-hidden"
            style={{
              width: `${widthPct}%`,
              backgroundColor: tintBg,
              borderColor: 'var(--jma-dark)',
              boxShadow: isHi ? '0 4px 0 0 var(--jma-dark)' : '0 2px 0 0 var(--jma-dark)',
              color: 'var(--jma-dark)',
              transform: isHi ? 'translateY(-3px) scale(1.04)' : 'none',
              transition: 'transform 0.15s ease-out, background-color 0.15s, box-shadow 0.15s',
              cursor: onBlockTap ? 'pointer' : 'default',
              padding: 0,
              minWidth: `${Math.max(40, widthPct * 3)}px`,
            }}
          >
            {isRest ? (
              <img
                src={REST_IMG}
                alt="rest"
                draggable={false}
                className="object-contain select-none pointer-events-none"
                style={{ maxHeight: '70%', maxWidth: '70%' }}
              />
            ) : (
              <span
                className="text-[10px] sm:text-xs md:text-sm font-black font-display leading-tight px-1 text-center pointer-events-none"
                style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.5)' }}
              >
                {def.syllable}
              </span>
            )}
          </Tag>
        );
      })}
    </div>
  );
}
