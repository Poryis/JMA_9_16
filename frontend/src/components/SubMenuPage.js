// Shared submenu page used by PlayMenuPage, LearnMenuPage, CreateMenuPage.
// Renders a hero title + a grid of "destination" tiles. Each tile shows:
//   - A background scene
//   - A character peeking
//   - A title + tagline
// Layout: 1 column on mobile, 2 columns on tablet+ desktop.

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameHeader } from './GameUI';

function Tile({ tile, index, navigate }) {
  const [hovered, setHovered] = useState(false);
  const disabled = tile.disabled;

  return (
    <motion.button
      type="button"
      data-testid={`submenu-tile-${tile.id}`}
      onClick={() => !disabled && navigate(tile.path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative w-full text-left rounded-3xl border-4 overflow-hidden ${disabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
      style={{
        borderColor: 'var(--jma-dark)',
        boxShadow: `0 8px 0 0 var(--jma-dark)`,
        background: tile.color,
        minHeight: '200px',
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
      {/* Color tint for legibility - lighter so the artwork shines through */}
      <div
        className="absolute inset-0"
        style={{
          background: tile.bg
            ? `linear-gradient(135deg, ${tile.color}77 0%, ${tile.accent || tile.color}22 55%, transparent 100%)`
            : tile.color,
        }}
      />

      {/* Nameplate */}
      <div className="absolute top-3 left-3 z-10">
        <div
          className="px-3 py-1 rounded-full border-3 inline-block"
          style={{
            backgroundColor: 'white',
            borderColor: 'var(--jma-dark)',
            boxShadow: '0 3px 0 0 var(--jma-dark)',
          }}
        >
          <span
            className="text-[10px] md:text-xs font-black uppercase tracking-widest"
            style={{ color: tile.accent || tile.color }}
          >
            {tile.sign || tile.title}
          </span>
        </div>
      </div>

      {/* Speech bubble (optional) */}
      {tile.bubble && (
        <motion.div
          className="absolute z-20 px-2.5 py-1 rounded-2xl border-3 max-w-[130px]"
          style={{
            top: '38%',
            right: 'clamp(34%, calc(28% + 30px), 42%)',
            backgroundColor: 'white',
            borderColor: 'var(--jma-dark)',
            boxShadow: '0 3px 0 0 var(--jma-dark)',
          }}
          initial={{ scale: 0, x: 12 }}
          animate={{ scale: 1, x: 0 }}
          transition={{ delay: 0.45 + index * 0.08, type: 'spring' }}
        >
          <span className="text-[10px] md:text-xs font-black leading-tight block text-center" style={{ color: 'var(--jma-dark)' }}>
            {tile.bubble}
          </span>
        </motion.div>
      )}

      {/* Title + tagline */}
      <div className="absolute left-4 md:left-5 bottom-3 md:bottom-4 right-[40%] z-10">
        <h2
          className="text-xl md:text-2xl font-black font-display leading-tight mb-1"
          style={{
            color: 'white',
            textShadow: '2px 2px 0 rgba(10,37,64,0.85), 4px 4px 0 rgba(10,37,64,0.35)',
          }}
        >
          {tile.title}
        </h2>
        <p
          className="text-xs md:text-sm font-bold leading-snug"
          style={{
            color: 'white',
            textShadow: '1px 1px 0 rgba(10,37,64,0.7)',
          }}
        >
          {tile.tagline}
        </p>
        {disabled && (
          <p
            className="mt-1 text-[10px] md:text-xs font-black uppercase tracking-wide inline-block px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'white', color: 'var(--jma-dark)' }}
          >
            Coming Soon
          </p>
        )}
      </div>

      {/* Primary character */}
      {tile.character && (
        <motion.img
          src={tile.character}
          alt=""
          draggable={false}
          loading="lazy"
          className="absolute right-2 bottom-0 pointer-events-none select-none z-10"
          style={{
            width: `${tile.charWidthPct || 32}%`,
            height: '92%',
            objectFit: 'contain',
            objectPosition: 'bottom right',
            filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.45))',
          }}
          animate={hovered ? { y: -8, rotate: -3 } : { y: [0, -6, 0], rotate: 0 }}
          transition={
            hovered
              ? { type: 'spring', stiffness: 240 }
              : { y: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' } }
          }
        />
      )}

      {/* Enter chip */}
      {!disabled && (
        <motion.div
          className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full border-2 z-10 hidden md:flex items-center gap-1"
          style={{ backgroundColor: 'white', borderColor: 'var(--jma-dark)' }}
          animate={hovered ? { x: 0, opacity: 1 } : { x: 20, opacity: 0 }}
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
      className="min-h-screen flex flex-col items-center px-3 sm:px-6 pt-16 md:pt-20 pb-8 relative"
      style={{ background: bgGradient }}
    >
      <GameHeader showHomeButton={true} />

      <motion.div
        className="relative z-10 text-center mb-5 md:mb-7"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1
          className="text-4xl md:text-6xl font-black font-display leading-none"
          style={{
            color: 'white',
            textShadow: `3px 3px 0 var(--jma-dark), 5px 5px 0 ${sectionColor || '#0A2540'}`,
            letterSpacing: '0.02em',
          }}
        >
          {sectionTitle}
        </h1>
        {sectionSubtitle && (
          <p
            className="mt-2 text-sm md:text-base font-bold"
            style={{ color: 'white', textShadow: '1px 1px 0 rgba(10,37,64,0.6)' }}
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
