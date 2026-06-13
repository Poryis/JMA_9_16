// Retro CRT TV widget for the homepage.
//
// Renders a small cartoon TV (wooden frame, knobs, rabbit ears, red "ON AIR"
// dot) with a muted, looping Vimeo episode playing on its screen. Tapping
// the TV navigates to /jmatv.
//
// Per the partner's feedback this lives BELOW the 3 main category cards so
// kids see PLAY / LEARN / CREATE first and don't get pulled into passive
// video before exploring the interactive features.

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { pickFeaturedEpisode } from '../data/jmatv';

export default function RetroTV() {
  const navigate = useNavigate();
  // Stable per-mount pick so the preview doesn't reshuffle between re-renders.
  const featured = useMemo(() => pickFeaturedEpisode(), []);

  // Muted autoplay + loop. Hidden controls so the kid can't poke the player —
  // it's just ambient. Tapping the TV (not the iframe) handles navigation.
  const previewSrc = featured
    ? `https://player.vimeo.com/video/${featured.vimeoId}?autoplay=1&loop=1&muted=1&background=1&controls=0&app_id=122963&title=0&byline=0&portrait=0&dnt=1`
    : null;

  return (
    <motion.div
      data-testid="home-retro-tv"
      // pt-16 reserves vertical space for the rabbit ears, which extend
      // ~58px above the TV body via negative top positioning. Without this
      // padding, on the homepage the ears were poking up into the bottom of
      // the PLAY/LEARN/CREATE card grid above.
      className="relative z-10 mt-12 md:mt-16 mb-2 pt-12 flex flex-col items-center"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
    >
      {/* "Now on JMAtv" header — small, low-key — sells the click without
          screaming for attention. */}
      <div className="flex items-center gap-2 mb-2">
        <span
          aria-hidden="true"
          className="inline-block rounded-full"
          style={{
            width: 10, height: 10,
            backgroundColor: '#FF3B30',
            boxShadow: '0 0 8px rgba(255,59,48,0.7)',
            animation: 'jma-pulse 1.4s ease-in-out infinite',
          }}
        />
        <span
          className="text-[10px] md:text-xs font-black uppercase tracking-widest"
          style={{ color: 'var(--jma-dark)', opacity: 0.75 }}
        >
          Now on JMAtv
        </span>
      </div>

      {/* The TV itself — wood-grain frame, sloped sides, rabbit ears on top.
          Whole thing is one big button. */}
      <motion.button
        type="button"
        data-testid="home-retro-tv-btn"
        onClick={() => navigate('/jmatv')}
        whileHover={{ y: -3, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="relative rounded-3xl border-0 p-0 bg-transparent cursor-pointer"
        aria-label="Open JMAtv"
        style={{ width: 'clamp(220px, 32vw, 320px)' }}
      >
        {/* Rabbit ears — purely decorative. Sit BEHIND the TV body via z-index
            so the ear bases tuck under the wood frame. */}
        <div
          aria-hidden="true"
          className="absolute"
          style={{
            top: '-26%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '32%',
            zIndex: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0, left: '18%',
              width: 6, height: '100%',
              background: 'linear-gradient(#9CA3AF, #4B5563)',
              transform: 'rotate(-22deg)',
              transformOrigin: 'bottom center',
              borderRadius: 4,
              boxShadow: '2px 2px 0 rgba(0,0,0,0.25)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0, right: '18%',
              width: 6, height: '100%',
              background: 'linear-gradient(#9CA3AF, #4B5563)',
              transform: 'rotate(22deg)',
              transformOrigin: 'bottom center',
              borderRadius: 4,
              boxShadow: '2px 2px 0 rgba(0,0,0,0.25)',
            }}
          />
          {/* Ear tips */}
          <div style={{ position: 'absolute', top: '-4%', left: '8%', width: 12, height: 12, borderRadius: '50%', background: '#4B5563' }} />
          <div style={{ position: 'absolute', top: '-4%', right: '8%', width: 12, height: 12, borderRadius: '50%', background: '#4B5563' }} />
        </div>

        {/* Wood-grain TV body — uses CSS gradients for "wood grain" without
            shipping an extra texture asset. Outer JMA-dark stroke matches
            the chunky black outline on every other cartoon element in
            this universe. */}
        <div
          className="relative rounded-3xl"
          style={{
            background:
              'repeating-linear-gradient(90deg, #8B5A2B 0px, #8B5A2B 2px, #A0673A 2px, #A0673A 5px), linear-gradient(180deg, #A0673A, #6B4423)',
            backgroundBlendMode: 'multiply',
            border: '5px solid #000',
            boxShadow:
              '0 10px 0 0 #000, inset 0 0 0 3px #3F2A14, inset 0 0 0 5px rgba(255,255,255,0.08)',
            padding: '14px 14px 10px 14px',
            zIndex: 1,
          }}
        >
          {/* CRT bezel — black inner frame around the screen */}
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              background: '#0A0A0A',
              border: '3px solid #1F2937',
              boxShadow: 'inset 0 0 12px rgba(0,0,0,0.8)',
              aspectRatio: '4 / 3',
            }}
          >
            {/* The actual video. Wrapped so we can render an overlay above it
                without losing pointer events on the surrounding TV button. */}
            {previewSrc ? (
              <iframe
                key={featured.vimeoId}
                title="JMAtv preview"
                src={previewSrc}
                allow="autoplay; fullscreen; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  width: '177.77%',   // 16:9 video inside a 4:3 frame, scaled
                  height: '100%',
                  transform: 'translate(-50%, -50%)',
                  border: 0,
                  pointerEvents: 'none',
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src="assets/ui/jmatv-logo.png"
                  alt="JMAtv"
                  className="object-contain"
                  style={{ width: '60%', filter: 'drop-shadow(0 0 12px rgba(255,200,0,0.5))' }}
                  draggable={false}
                />
              </div>
            )}

            {/* CRT scanlines overlay — subtle horizontal banding for vintage
                texture. Pure CSS, no asset. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'repeating-linear-gradient(180deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)',
                mixBlendMode: 'multiply',
              }}
            />

            {/* Curved glass reflection — light glint top-left */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none rounded-xl"
              style={{
                background: 'radial-gradient(ellipse at 28% 18%, rgba(255,255,255,0.18) 0%, transparent 40%)',
              }}
            />

            {/* JMAtv logo bug — tiny brand mark in bottom-right of screen so
                kids learn the channel name even before tapping in. */}
            <img
              src="assets/ui/jmatv-logo.png"
              alt=""
              aria-hidden="true"
              draggable={false}
              className="absolute pointer-events-none"
              style={{
                bottom: 6, right: 6,
                width: '22%',
                opacity: 0.92,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
              }}
            />
          </div>

          {/* TV controls strip below the screen — speaker grille + knobs +
              "JMAtv" channel label. */}
          <div className="flex items-center justify-between mt-2 px-1">
            {/* Speaker grille */}
            <div
              aria-hidden="true"
              style={{
                width: '52%',
                height: 18,
                borderRadius: 4,
                background:
                  'repeating-linear-gradient(90deg, rgba(0,0,0,0.45) 0 2px, rgba(255,255,255,0.06) 2px 5px)',
                border: '1.5px solid #3F2A14',
              }}
            />
            {/* Channel label */}
            <span
              className="text-[10px] font-black tracking-[0.18em] uppercase"
              style={{
                color: '#FFE7C2',
                textShadow: '1px 1px 0 #3F2A14',
              }}
            >
              JMAtv
            </span>
            {/* Knobs */}
            <div className="flex items-center gap-1.5">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  style={{
                    width: 14, height: 14,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 35%, #E5C597, #5A3A1A)',
                    border: '1.5px solid #3F2A14',
                    boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.08)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.button>

      <style>{`
        @keyframes jma-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.3); opacity: 0.7; }
        }
      `}</style>
    </motion.div>
  );
}
