// MiniCRT — themable retro CRT TV for JMAtv channel tiles.
//
// Each JMAtv channel has its own personality, so every TV can look
// different: wooden Fun-Facts cabinet, chrome Puns-with-Finn tv,
// black-and-red music-video amp, sparkly purple Variety-Show set,
// green schoolroom Lessons TV. The screen still plays a muted-loop
// Vimeo preview so the tile *is* the show.
//
// Props
//   vimeoId       — string. Muted looping Vimeo iframe when provided.
//   fallbackLabel — small yellow LCD label rendered on the screen when
//                   no vimeoId (e.g. "Off Air", "Class in Session").
//   theme         — object describing the frame:
//                     { frame: 'wood' | 'metal' | 'painted-red' |
//                              'purple-sparkle' | 'chalkboard',
//                       accent: '#hex' — colored trim inside the
//                                        bezel + label chip,
//                       knobColor: '#hex' (optional) }
//   antenna       — 'rabbit-ears' | 'coathanger' | 'curly' |
//                   'star-tips' | 'ball-tips' | 'apple' | 'none'
//   sticker       — { icon: <ReactNode>, bg: '#hex' } | null.
//                   Small round sticker slapped on the frame's
//                   top-right corner — every TV gets its own.
//   staticNoise   — bool. Renders CRT static "no signal" overlay on
//                   top of the screen (used for coming-soon channels).
//
// Presentation-only: click handling lives on the parent.

import { motion } from 'framer-motion';

const JMA_DARK = '#0A2540';

// ---------- Antenna presets --------------------------------------------
function Antenna({ style }) {
  if (style === 'none') return null;

  // Wrapper — sits behind the TV body via z-index so the bases tuck under.
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

  // Chunky JMA-dark stroke matches the rest of the world's outline weight.
  const rod = (rotate, side) => ({
    position: 'absolute',
    top: 0,
    [side]: '18%',
    width: 5,
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
            <div style={{ position: 'absolute', top: '-6%', left: '4%', width: 14, height: 14, borderRadius: '50%', background: '#FFCC00', border: `2.5px solid ${JMA_DARK}` }} />
            <div style={{ position: 'absolute', top: '-6%', right: '4%', width: 14, height: 14, borderRadius: '50%', background: '#FFCC00', border: `2.5px solid ${JMA_DARK}` }} />
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
            strokeWidth="5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx="50" cy="4" r="4" fill="#FF3B30" stroke={JMA_DARK} strokeWidth="2.5" />
        </svg>
      </div>
    );
  }

  if (style === 'curly') {
    // Curly-wire antenna — one springy spiral rising from the center.
    return (
      <div aria-hidden="true" style={wrap}>
        <svg viewBox="0 0 100 60" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <path
            d="M 50 58 C 50 50, 42 46, 42 40 C 42 34, 58 34, 58 28 C 58 22, 42 22, 42 16 C 42 10, 58 10, 58 4"
            fill="none"
            stroke={JMA_DARK}
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle cx="58" cy="4" r="4" fill="#FFCC00" stroke={JMA_DARK} strokeWidth="2.5" />
        </svg>
      </div>
    );
  }

  if (style === 'apple') {
    return (
      <div aria-hidden="true" style={{ ...wrap, height: '26%', top: '-22%' }}>
        <svg viewBox="0 0 100 70" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {/* stem */}
          <path d="M 50 34 Q 50 20 44 12" fill="none" stroke={JMA_DARK} strokeWidth="4" strokeLinecap="round" />
          {/* leaf */}
          <path
            d="M 44 12 Q 60 8 62 22 Q 50 22 44 12 Z"
            fill="#34A853"
            stroke={JMA_DARK}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* apple */}
          <circle cx="50" cy="52" r="16" fill="#FF3B30" stroke={JMA_DARK} strokeWidth="4" />
          <path d="M 40 46 Q 44 42 48 46" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
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
        width: 22, height: 22,
      }}
    >
      <svg viewBox="0 0 24 24" width="22" height="22">
        <polygon
          points="12,1 15,9 23,9 16.5,14 19,22 12,17 5,22 7.5,14 1,9 9,9"
          fill="#FFCC00"
          stroke={JMA_DARK}
          strokeWidth="2"
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

// ---------- Static-noise overlay --------------------------------------
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
  sticker = null,
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

      {/* TV body */}
      <div
        className="relative rounded-2xl"
        style={{
          background: frame.background,
          backgroundBlendMode: frame.backgroundBlendMode,
          border: `4px solid ${JMA_DARK}`,
          boxShadow: `0 6px 0 0 ${JMA_DARK}, ${frame.innerShadow}`,
          padding: '10px 10px 8px 10px',
          zIndex: 1,
        }}
      >
        {/* Bezel */}
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            background: '#0A0A0A',
            border: `2px solid ${accent}`,
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)',
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
              border: `1.5px solid ${JMA_DARK}`,
            }}
          />
          <div className="flex items-center gap-1.5">
            {[0, 1].map((i) => (
              <div
                key={i}
                aria-hidden="true"
                style={{
                  width: 11, height: 11,
                  borderRadius: '50%',
                  background: knobColor
                    ? `radial-gradient(circle at 35% 35%, ${knobColor}FF, ${knobColor}66)`
                    : 'radial-gradient(circle at 35% 35%, #E5C597, #5A3A1A)',
                  border: `1.5px solid ${JMA_DARK}`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Corner sticker — slapped on the top-right of the frame,
          rotated slightly for a hand-stuck feel. */}
      {sticker && (
        <motion.div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            top: -10,
            right: -12,
            width: 44, height: 44,
            zIndex: 3,
          }}
          animate={{ rotate: [-10, -6, -10] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center"
            style={{
              background: sticker.bg || '#FFCC00',
              border: `3px solid ${JMA_DARK}`,
              boxShadow: '2px 3px 0 rgba(0,0,0,0.35)',
              color: JMA_DARK,
            }}
          >
            {sticker.icon}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
