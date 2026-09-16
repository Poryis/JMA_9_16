// MiniCRT — themable retro CRT TV for JMAtv channel tiles.
//
// Each JMAtv channel has its own personality, so every TV can look
// different: wooden Fun-Facts cabinet, chrome Puns-with-Finn tv,
// black-and-red music-video amp, sparkly purple Variety-Show set,
// green schoolroom Lessons TV. The screen plays a muted-loop Vimeo
// preview so the tile *is* the show.
//
// Props
//   vimeoId       — string. Muted looping Vimeo iframe when provided.
//   fallbackLabel — small LCD label on the screen when no vimeoId
//                   (e.g. "Off Air", "Class in Session").
//   theme         — { frame: 'wood' | 'metal' | 'painted-red' |
//                            'purple-sparkle' | 'chalkboard',
//                     accent: '#hex' — bezel trim + label chip,
//                     knobColor: '#hex' (optional) }
//   antenna       — 'rabbit-ears' | 'coathanger' | 'curly' |
//                   'star-tips' | 'ball-tips' | 'apple' | 'none'
//   staticNoise   — bool. CRT "no signal" overlay on top of the screen
//                   (used for coming-soon channels).
//
// Every stroke uses JMA-dark at 6px (body) / 3px (bezel + antennas) so
// the TVs match the thick outline aesthetic of the rest of the JMA
// world. Presentation-only: click handling lives on the parent.

import { motion } from 'framer-motion';

const JMA_DARK = '#0A2540';

// ---------- Antenna presets --------------------------------------------
function Antenna({ style }) {
  if (style === 'none') return null;

  const wrap = {
    position: 'absolute',
    top: '-18%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '58%',
    height: '22%',
    zIndex: 0,
    pointerEvents: 'none',
  };

  const rod = (rotate, side) => ({
    position: 'absolute',
    top: 0,
    [side]: '18%',
    width: 6,
    height: '100%',
    background: JMA_DARK,
    transform: `rotate(${rotate}deg)`,
    transformOrigin: 'bottom center',
    borderRadius: 3,
  });

  if (style === 'rabbit-ears' || style === 'ball-tips' || style === 'star-tips') {
    return (
      <div aria-hidden="true" style={wrap}>
        <div style={rod(-22, 'left')} />
        <div style={rod(22, 'right')} />
        {style === 'ball-tips' && (
          <>
            <div style={{ position: 'absolute', top: '-6%', left: '4%',  width: 16, height: 16, borderRadius: '50%', background: '#FFCC00', border: `3px solid ${JMA_DARK}` }} />
            <div style={{ position: 'absolute', top: '-6%', right: '4%', width: 16, height: 16, borderRadius: '50%', background: '#FFCC00', border: `3px solid ${JMA_DARK}` }} />
          </>
        )}
        {style === 'star-tips' && (
          <>
            <StarTip x="2%" flip={-1} />
            <StarTip x="2%" flip={1} right />
          </>
        )}
      </div>
    );
  }

  if (style === 'coathanger') {
    return (
      <div aria-hidden="true" style={wrap}>
        <svg viewBox="0 0 100 60" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <polyline
            points="14,58 50,4 86,58"
            fill="none"
            stroke={JMA_DARK}
            strokeWidth="6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx="50" cy="4" r="5" fill="#FF3B30" stroke={JMA_DARK} strokeWidth="3" />
        </svg>
      </div>
    );
  }

  if (style === 'curly') {
    return (
      <div aria-hidden="true" style={wrap}>
        <svg viewBox="0 0 100 60" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <path
            d="M 50 58 C 50 50, 42 46, 42 40 C 42 34, 58 34, 58 28 C 58 22, 42 22, 42 16 C 42 10, 58 10, 58 4"
            fill="none"
            stroke={JMA_DARK}
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <circle cx="58" cy="4" r="5" fill="#FFCC00" stroke={JMA_DARK} strokeWidth="3" />
        </svg>
      </div>
    );
  }

  if (style === 'lightning') {
    // Single tall rod topped with a chunky lightning bolt — rock-channel
    // energy without shouting.
    return (
      <div aria-hidden="true" style={{ ...wrap, height: '30%', top: '-26%' }}>
        <svg viewBox="0 0 100 80" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <line x1="50" y1="80" x2="50" y2="36" stroke={JMA_DARK} strokeWidth="6" strokeLinecap="round" />
          <polygon
            points="52,4 42,36 50,36 44,60 62,26 54,26 60,4"
            fill="#FFCC00"
            stroke={JMA_DARK}
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  if (style === 'confetti') {
    // Three rods fanning out with jelly-bean bulbs at each tip in the
    // brand's on-air colors — reads like a variety-show sign-off.
    return (
      <div aria-hidden="true" style={{ ...wrap, height: '26%', top: '-22%' }}>
        <svg viewBox="0 0 100 70" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <line x1="50" y1="68" x2="26" y2="16" stroke={JMA_DARK} strokeWidth="5" strokeLinecap="round" />
          <line x1="50" y1="68" x2="50" y2="8"  stroke={JMA_DARK} strokeWidth="5" strokeLinecap="round" />
          <line x1="50" y1="68" x2="74" y2="16" stroke={JMA_DARK} strokeWidth="5" strokeLinecap="round" />
          <circle cx="26" cy="16" r="6" fill="#FF3B30" stroke={JMA_DARK} strokeWidth="3" />
          <circle cx="50" cy="8"  r="6" fill="#FFCC00" stroke={JMA_DARK} strokeWidth="3" />
          <circle cx="74" cy="16" r="6" fill="#00A8E8" stroke={JMA_DARK} strokeWidth="3" />
          {/* Tiny spark dots around the bulbs */}
          <circle cx="18" cy="6"  r="2" fill="#FFCC00" />
          <circle cx="82" cy="6"  r="2" fill="#AF52DE" />
          <circle cx="50" cy="30" r="2" fill="#00A8E8" />
        </svg>
      </div>
    );
  }

  if (style === 'pencil') {
    // Fat yellow pencil sticking straight up out of the TV — graphite
    // tip up top, pink eraser at the base, matches the schoolroom vibe.
    return (
      <div aria-hidden="true" style={{ ...wrap, height: '32%', top: '-28%' }}>
        <svg viewBox="0 0 100 90" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {/* eraser (bottom) */}
          <rect x="42" y="76" width="16" height="10" rx="2" fill="#FF7BB4" stroke={JMA_DARK} strokeWidth="3" />
          {/* metal ferrule band */}
          <rect x="42" y="70" width="16" height="8"  fill="#C0C0C0" stroke={JMA_DARK} strokeWidth="3" />
          {/* pencil body */}
          <rect x="42" y="20" width="16" height="52" fill="#FFCC00" stroke={JMA_DARK} strokeWidth="3.5" />
          {/* wood cone */}
          <polygon points="42,20 58,20 50,6" fill="#E9B84F" stroke={JMA_DARK} strokeWidth="3.5" strokeLinejoin="round" />
          {/* graphite tip */}
          <polygon points="46,10 54,10 50,2" fill="#0A2540" stroke={JMA_DARK} strokeWidth="2" strokeLinejoin="round" />
          {/* body highlight */}
          <line x1="46" y1="24" x2="46" y2="68" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />
        </svg>
      </div>
    );
  }

  return null;
}

function StarTip({ x, flip, right }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '-10%',
        [right ? 'right' : 'left']: x,
        transform: `translateX(${flip * -8}px) rotate(${flip * 18}deg)`,
        width: 24, height: 24,
      }}
    >
      <svg viewBox="0 0 24 24" width="24" height="24">
        <polygon
          points="12,1 15,9 23,9 16.5,14 19,22 12,17 5,22 7.5,14 1,9 9,9"
          fill="#FFCC00"
          stroke={JMA_DARK}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// ---------- Frame presets ----------------------------------------------
const FRAMES = {
  wood: {
    background:
      'repeating-linear-gradient(90deg, #8B5A2B 0px, #8B5A2B 2px, #A0673A 2px, #A0673A 5px), linear-gradient(180deg, #A0673A, #6B4423)',
    backgroundBlendMode: 'multiply',
    innerShadow: 'inset 0 0 0 2px #3F2A14, inset 0 0 0 4px rgba(255,255,255,0.08)',
  },
  metal: {
    background:
      'linear-gradient(180deg, #E5E7EB 0%, #9CA3AF 55%, #6B7280 100%)',
    innerShadow: 'inset 0 0 0 2px #4B5563, inset 0 0 0 4px rgba(255,255,255,0.25)',
  },
  'painted-red': {
    background:
      'linear-gradient(180deg, #7A0A0A 0%, #2A0303 100%)',
    innerShadow: 'inset 0 0 0 2px #FF3B30, inset 0 0 0 4px rgba(0,0,0,0.5)',
  },
  'purple-sparkle': {
    background:
      'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35) 0%, transparent 12%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.30) 0%, transparent 10%), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.28) 0%, transparent 8%), linear-gradient(180deg, #7B2FB8, #4A1A75)',
    innerShadow: 'inset 0 0 0 2px #AF52DE, inset 0 0 0 4px rgba(0,0,0,0.4)',
  },
  chalkboard: {
    background:
      'linear-gradient(180deg, #1F3A1F 0%, #0F2A0F 100%)',
    innerShadow: 'inset 0 0 0 3px #8B5A2B, inset 0 0 0 6px #3F2A14',
  },
};

function StaticNoise() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'repeating-radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0px, rgba(0,0,0,0.15) 1px, rgba(255,255,255,0.10) 2px, rgba(0,0,0,0.10) 3px)',
        mixBlendMode: 'screen',
        opacity: 0.55,
        animation: 'jma-pulse 0.35s steps(2) infinite',
      }}
    />
  );
}

// ---------- Component -------------------------------------------------
export default function MiniCRT({
  vimeoId,
  fallbackImg = 'assets/ui/jmatv-logo-v2.png',
  fallbackLabel = null,
  theme = { frame: 'wood', accent: '#FFCC00' },
  antenna = 'rabbit-ears',
  staticNoise = false,
}) {
  const frame = FRAMES[theme.frame] || FRAMES.wood;
  const accent = theme.accent || '#FFCC00';
  const knobColor = theme.knobColor || null;

  const src = vimeoId
    ? `https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&muted=1&background=1&controls=0&app_id=122963&title=0&byline=0&portrait=0&dnt=1`
    : null;

  return (
    <motion.div
      data-testid="mini-crt"
      className="relative w-full"
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220 }}
    >
      <Antenna style={antenna} />

      {/* TV body — chunky 6px JMA-dark stroke matches the world's outline weight */}
      <div
        className="relative rounded-2xl"
        style={{
          background: frame.background,
          backgroundBlendMode: frame.backgroundBlendMode,
          border: `6px solid ${JMA_DARK}`,
          boxShadow: `0 8px 0 0 ${JMA_DARK}, ${frame.innerShadow}`,
          padding: '10px 10px 8px 10px',
          zIndex: 1,
        }}
      >
        {/* Bezel */}
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            background: '#0A0A0A',
            border: `3px solid ${JMA_DARK}`,
            boxShadow: `inset 0 0 10px rgba(0,0,0,0.8), inset 0 0 0 2px ${accent}`,
            aspectRatio: '4 / 3',
          }}
        >
          {src ? (
            <iframe
              title="channel preview"
              src={src}
              allow="autoplay; fullscreen; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                width: '177.77%',
                height: '100%',
                transform: 'translate(-50%, -50%)',
                border: 0,
                pointerEvents: 'none',
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a2540] to-[#0A2540]">
              <img
                src={fallbackImg}
                alt=""
                draggable={false}
                className="object-contain"
                style={{ width: '55%', filter: `drop-shadow(0 0 10px ${accent}88)` }}
              />
              {fallbackLabel && (
                <span
                  className="absolute bottom-1 left-1 right-1 text-center font-black font-display uppercase text-[9px] tracking-wider"
                  style={{ color: accent, textShadow: '1px 1px 0 #000' }}
                >
                  {fallbackLabel}
                </span>
              )}
            </div>
          )}

          {staticNoise && <StaticNoise />}

          {/* Scanlines */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'repeating-linear-gradient(180deg, rgba(0,0,0,0.20) 0px, rgba(0,0,0,0.20) 1px, transparent 1px, transparent 3px)',
              mixBlendMode: 'multiply',
            }}
          />
          {/* Glass glint */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none rounded-lg"
            style={{
              background:
                'radial-gradient(ellipse at 28% 18%, rgba(255,255,255,0.18) 0%, transparent 40%)',
            }}
          />
          {/* JMAtv logo bug */}
          <img
            src="assets/ui/jmatv-logo-v2.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="absolute pointer-events-none"
            style={{
              bottom: 4, right: 4,
              width: '20%',
              opacity: 0.9,
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.65))',
            }}
          />
        </div>

        {/* Speaker grille + knobs */}
        <div className="flex items-center justify-between mt-2 px-0.5">
          <div
            aria-hidden="true"
            style={{
              width: '68%', height: 12,
              borderRadius: 3,
              background:
                'repeating-linear-gradient(90deg, rgba(0,0,0,0.55) 0 2px, rgba(255,255,255,0.08) 2px 5px)',
              border: `2px solid ${JMA_DARK}`,
            }}
          />
          <div className="flex items-center gap-1.5">
            {[0, 1].map((i) => (
              <div
                key={i}
                aria-hidden="true"
                style={{
                  width: 12, height: 12,
                  borderRadius: '50%',
                  background: knobColor
                    ? `radial-gradient(circle at 35% 35%, ${knobColor}FF, ${knobColor}66)`
                    : 'radial-gradient(circle at 35% 35%, #E5C597, #5A3A1A)',
                  border: `2px solid ${JMA_DARK}`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
