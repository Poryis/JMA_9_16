// Shared submenu page used by PlayMenuPage, LearnMenuPage, CreateMenuPage.
//
// Look: NES cartridge art. Each tile is dominated by:
//   - Full-bleed background scene
//   - Character peeking (right side)
//   - MASSIVE all-caps title stretched across the bottom with chunky
//     stroke + drop-shadow for readability against any scene
//
// No taglines, no sign nameplates, no speech bubbles — the title carries
// the tile.

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameHeader } from './GameUI';
import BlimpFlyby from './BlimpFlyby';

function Tile({ tile, index, navigate }) {
  const [hovered, setHovered] = useState(false);
  const disabled = tile.disabled;

  const handleClick = () => {
    if (disabled) return;
    if (tile.sfx) {
      try {
        const audio = new Audio(tile.sfx);
        audio.volume = tile.sfx.includes('sfx-dj-scratch') ? 0.85 : 0.42;
        audio.play().catch(() => { /* autoplay rejected — proceed without SFX */ });
        // Cap the preview to ~500 ms so long-form SFX (like an 8-second
        // Robot Boogie synth loop) don't keep playing after the user
        // has navigated away — that was the "audio doesn't stop after
        // leaving the page" bug. Short quick fade-out prevents a click.
        const CAP_MS = 500;
        setTimeout(() => {
          try {
            audio.volume = 0;
            audio.pause();
            audio.removeAttribute('src'); // avoid empty-string src browser warning
            audio.load();
          } catch { /* ignore */ }
        }, CAP_MS);
      } catch { /* ignore */ }
    }
    const delay = tile.sfx ? 220 : 0;
    setTimeout(() => navigate(tile.path), delay);
  };

  return (
    <motion.button
      type="button"
      data-testid={`submenu-tile-${tile.id}`}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative w-full text-left rounded-3xl border-4 overflow-hidden ${disabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
      style={{
        borderColor: 'var(--jma-dark)',
        boxShadow: `0 8px 0 0 var(--jma-dark)`,
        background: tile.color,
        aspectRatio: '4 / 3',
        minHeight: 220,
      }}
      initial={{ y: 40, opacity: 0, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={{ delay: 0.15 + index * 0.08, type: 'spring', stiffness: 220 }}
      whileHover={disabled ? {} : { y: -6, boxShadow: '0 14px 0 0 var(--jma-dark)', scale: 1.012 }}
      whileTap={disabled ? {} : { y: 3, boxShadow: '0 4px 0 0 var(--jma-dark)', scale: 0.985 }}
    >
      {/* Background scene */}
      {tile.bg && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${tile.bg})`,
            backgroundSize: 'cover',
            backgroundPosition: tile.bgPosition || 'center',
          }}
        />
      )}

      {/* Top shadow gradient so the huge title stays legible on any scene */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: '55%',
          background:
            `linear-gradient(0deg, transparent 0%, ${tile.accent || tile.color}55 40%, rgba(10,37,64,0.72) 100%)`,
        }}
      />

      {/* Primary character (right side, prominent) */}
      {tile.character && (
        <motion.img
          src={tile.character}
          alt=""
          draggable={false}
          loading="lazy"
          className="absolute right-2 bottom-0 pointer-events-none select-none z-10"
          style={{
            width: `${tile.charWidthPct || 34}%`,
            height: `${tile.charHeightPct || 88}%`,
            objectFit: tile.charObjectFit || 'contain',
            objectPosition: tile.charObjectPosition || 'bottom right',
            filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.55))',
          }}
          animate={hovered ? { y: -8, rotate: -3 } : { y: [0, -6, 0], rotate: 0 }}
          transition={
            hovered
              ? { type: 'spring', stiffness: 240 }
              : { y: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' } }
          }
        />
      )}

      {/* NES cartridge title — huge, all-caps, chunky stroke. Lives in the
          TOP-LEFT and is capped to the column left of the hero so the
          character art is never hidden behind text on tablets. */}
      <div
        className="absolute left-3 top-3 md:top-4 z-20"
        style={{ width: `calc(${100 - (tile.charWidthPct || 34)}% + 6%)` }}
      >
        <h2
          className="font-black font-display leading-[0.85] uppercase"
          style={{
            fontSize: 'clamp(24px, 4.6vw, 48px)',
            color: 'white',
            WebkitTextStroke: 'clamp(2px, 0.5vw, 4px) var(--jma-dark)',
            paintOrder: 'stroke fill',
            textShadow:
              '0 3px 0 rgba(10,37,64,0.7), 0 6px 14px rgba(10,37,64,0.55)',
            letterSpacing: '0.01em',
            wordBreak: 'break-word',
          }}
        >
          {tile.title}
        </h2>
        {disabled && (
          <p
            className="mt-1 text-[10px] md:text-xs font-black uppercase tracking-wide inline-block px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'white', color: 'var(--jma-dark)' }}
          >
            Coming Soon
          </p>
        )}
      </div>

      {/* Enter chip (hover-reveal, desktop only) */}
      {!disabled && (
        <motion.div
          className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full border-2 z-20 hidden md:flex items-center gap-1"
          style={{ backgroundColor: 'white', borderColor: 'var(--jma-dark)' }}
          animate={hovered ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
          transition={{ type: 'spring' }}
        >
          <span className="text-[10px] font-black uppercase tracking-wide" style={{ color: 'var(--jma-dark)' }}>
            Enter →
          </span>
        </motion.div>
      )}
    </motion.button>
  );
}

/**
 * <SubMenuPage
 *   sectionTitle="PLAY"
 *   sectionSubtitle="Pick a game!"
 *   bgGradient="..."
 *   tiles={[...]}
 * />
 */
export default function SubMenuPage({ sectionTitle, sectionSubtitle, sectionColor, bgGradient, tiles, testId }) {
  const navigate = useNavigate();
  return (
    <div
      data-testid={testId}
      className="min-h-screen flex flex-col items-center px-3 sm:px-6 pt-16 md:pt-20 pb-8 relative overflow-x-hidden"
      style={{ background: bgGradient }}
    >
      {/* Lou blimp — same drifting sky presence used on the home page so the
          three sub-worlds feel contiguous with the lobby. Sits behind
          everything else. */}
      <BlimpFlyby />

      <GameHeader showHomeButton={true} />

      <motion.div
        className="relative z-10 text-center mb-5 md:mb-7"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1
          className="text-5xl md:text-7xl font-black font-display leading-none uppercase"
          style={{
            color: 'white',
            WebkitTextStroke: 'clamp(3px, 0.6vw, 6px) var(--jma-dark)',
            paintOrder: 'stroke fill',
            textShadow: `4px 4px 0 var(--jma-dark), 7px 7px 0 ${sectionColor || '#0A2540'}, 10px 10px 24px rgba(10,37,64,0.35)`,
            letterSpacing: '0.02em',
          }}
        >
          {sectionTitle}
        </h1>
        {sectionSubtitle && (
          <p
            className="mt-2 text-sm md:text-base font-bold uppercase tracking-wider inline-block px-3 py-1 rounded-full"
            style={{
              color: 'white',
              backgroundColor: 'var(--jma-dark)',
              boxShadow: '0 3px 0 0 rgba(0,0,0,0.35)',
            }}
          >
            {sectionSubtitle}
          </p>
        )}
      </motion.div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {tiles.map((tile, idx) => (
          <Tile key={tile.id} tile={tile} index={idx} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}
