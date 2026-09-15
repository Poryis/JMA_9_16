// MiniCRT — small wood-frame CRT TV, muted-loop preview inside.
//
// Used inside JMAtv channel tiles so each channel's card is literally a
// tiny television playing that channel's own content. Shares the visual
// language of the big <RetroTV /> on the homepage (wood body, rabbit
// ears, scanlines, glass glint) at ~1/3 the size.
//
// Props
//   vimeoId       — string. If provided, muted looping Vimeo iframe.
//   fallbackImg   — string. Rendered inside the screen when no vimeoId.
//   fallbackLabel — string. Overlay label for the fallback image (e.g.
//                   "LESSONS") — makes non-video tiles feel intentional.
//   showRabbitEars — bool. Default true.
//
// Presentation-only: click handling lives on the parent tile.

import { motion } from 'framer-motion';

export default function MiniCRT({
  vimeoId,
  fallbackImg = 'assets/ui/jmatv-logo-v2.png',
  fallbackLabel = null,
  showRabbitEars = true,
}) {
  const src = vimeoId
    ? `https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&muted=1&background=1&controls=0&app_id=122963&title=0&byline=0&portrait=0&dnt=1`
    : null;

  return (
    <motion.div
      data-testid="mini-crt"
      className="relative w-full"
      aria-hidden="true"
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220 }}
    >
      {/* Rabbit ear antennas (behind the body) */}
      {showRabbitEars && (
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            top: '-14%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '54%',
            height: '20%',
            zIndex: 0,
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: '18%',
            width: 4, height: '100%',
            background: '#6B7280',
            transform: 'rotate(-22deg)',
            transformOrigin: 'bottom center',
            borderRadius: 3,
            boxShadow: '2px 2px 0 rgba(0,0,0,0.25)',
          }} />
          <div style={{
            position: 'absolute', top: 0, right: '18%',
            width: 4, height: '100%',
            background: '#6B7280',
            transform: 'rotate(22deg)',
            transformOrigin: 'bottom center',
            borderRadius: 3,
            boxShadow: '2px 2px 0 rgba(0,0,0,0.25)',
          }} />
        </div>
      )}

      {/* Wood-grain TV body */}
      <div
        className="relative rounded-2xl"
        style={{
          background:
            'repeating-linear-gradient(90deg, #8B5A2B 0px, #8B5A2B 2px, #A0673A 2px, #A0673A 5px), linear-gradient(180deg, #A0673A, #6B4423)',
          backgroundBlendMode: 'multiply',
          border: '4px solid #000',
          boxShadow:
            '0 6px 0 0 #000, inset 0 0 0 2px #3F2A14, inset 0 0 0 4px rgba(255,255,255,0.08)',
          padding: '8px 8px 6px 8px',
          zIndex: 1,
        }}
      >
        {/* CRT bezel */}
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            background: '#0A0A0A',
            border: '2px solid #1F2937',
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
                width: '177.77%', // 16:9 inside 4:3
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
                style={{ width: '55%', filter: 'drop-shadow(0 0 10px rgba(255,204,0,0.45))' }}
              />
              {fallbackLabel && (
                <span
                  className="absolute bottom-1 left-1 right-1 text-center font-black font-display uppercase text-[9px] tracking-wider"
                  style={{ color: '#FFCC00', textShadow: '1px 1px 0 #000' }}
                >
                  {fallbackLabel}
                </span>
              )}
            </div>
          )}

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
          {/* JMAtv bug */}
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
        <div className="flex items-center justify-between mt-1.5 px-0.5">
          <div
            aria-hidden="true"
            style={{
              width: '72%', height: 10,
              borderRadius: 3,
              background:
                'repeating-linear-gradient(90deg, rgba(0,0,0,0.45) 0 2px, rgba(255,255,255,0.06) 2px 5px)',
              border: '1px solid #3F2A14',
            }}
          />
          <div className="flex items-center gap-1">
            {[0, 1].map((i) => (
              <div
                key={i}
                aria-hidden="true"
                style={{
                  width: 9, height: 9,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #E5C597, #5A3A1A)',
                  border: '1px solid #3F2A14',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
