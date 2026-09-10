// Shared submenu page used by PlayMenuPage, LearnMenuPage, CreateMenuPage.
//
// Look: NES cartridge art. Header uses the same Finn · Shield · Charlie hero
// row as the home page (branding consistency) instead of a giant word.
// Each tile is dominated by:
//   - Full-bleed background scene
//   - Character hero at the bottom (BIG, centered) — never cropped
//   - Title band at the TOP, single line, auto-fit, centered
//
// No taglines, no sign nameplates, no speech bubbles — the title carries
// the tile.

import { motion } from 'framer-motion';
import { useState, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameHeader } from './GameUI';
import BlimpFlyby from './BlimpFlyby';

/**
 * Auto-shrinks its font-size so the (single-line, no-wrap) title fits
 * the available width. Uses ResizeObserver so responsive layouts
 * (grid → single-column) refit correctly on rotate/resize.
 */
function AutoFitTitle({ text, testId }) {
  const wrapRef = useRef(null);
  const textRef = useRef(null);

  useLayoutEffect(() => {
    let rafId = 0;
    const fit = () => {
      const wrap = wrapRef.current;
      const el = textRef.current;
      if (!wrap || !el) return;
      // Start large, shrink until it fits. Keep min for readability.
      const MAX = 44;
      const MIN = 14;
      let size = MAX;
      el.style.fontSize = size + 'px';
      el.style.WebkitTextStrokeWidth = Math.max(2, size * 0.09) + 'px';
      const target = wrap.clientWidth - 4;
      if (target <= 0) return;
      while (el.scrollWidth > target && size > MIN) {
        size -= 1;
        el.style.fontSize = size + 'px';
        el.style.WebkitTextStrokeWidth = Math.max(2, size * 0.09) + 'px';
      }
    };
    // Defer to next frame so we don't mutate layout during an in-flight
    // ResizeObserver dispatch (which triggers the browser's
    // "ResizeObserver loop completed with undelivered notifications"
    // benign-but-noisy overlay in the CRA dev error boundary).
    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        fit();
      });
    };
    schedule();
    const ro = new ResizeObserver(schedule);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [text]);

  return (
    <div ref={wrapRef} className="w-full text-center">
      <h2
        ref={textRef}
        data-testid={testId}
        className="font-black font-display uppercase whitespace-nowrap inline-block leading-none"
        style={{
          color: 'white',
          WebkitTextStroke: '3px var(--jma-dark)',
          paintOrder: 'stroke fill',
          textShadow:
            '0 3px 0 rgba(10,37,64,0.7), 0 6px 14px rgba(10,37,64,0.55)',
          letterSpacing: '0.01em',
        }}
      >
        {text}
      </h2>
    </div>
  );
}

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

  // Heroes are BIG now — bump the widthPct authored on each tile with a
  // uniform scale so we don't have to touch every menu file. Cap at 78%
  // so multi-character art (jelly-rap-trio at 52) doesn't run to the edges.
  const HERO_SCALE = 1.45;
  const heroWidthPct = Math.min((tile.charWidthPct || 34) * HERO_SCALE, 78);
  // Reserve the top ~22% for the title band so heroes don't overlap text.
  const heroHeightPct = tile.charHeightPct || 78;

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

      {/* Top shadow gradient keeps the title band legible on any scene. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: '38%',
          background:
            `linear-gradient(180deg, rgba(10,37,64,0.72) 0%, ${tile.accent || tile.color}55 60%, transparent 100%)`,
        }}
      />

      {/* Primary character — BIG, bottom-centered so it dominates the
          cartridge without covering the title band up top. Charlie's Song
          Studio has no character; we simply skip rendering.
          NOTE: the framer-motion `animate` on the <img> writes to the same
          `transform` property we'd use for `translateX(-50%)`, so centering
          MUST live on a non-motion wrapper — otherwise motion clobbers it
          and the sprite drifts off to the right (that was the Beat Lab
          "trio cropped in half" bug). */}
      {tile.character && (
        <div
          className="absolute bottom-0 left-1/2 pointer-events-none z-10"
          style={{
            width: `${heroWidthPct}%`,
            height: `${heroHeightPct}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <motion.img
            src={tile.character}
            alt=""
            draggable={false}
            loading="lazy"
            className="w-full h-full select-none"
            style={{
              objectFit: tile.charObjectFit || 'contain',
              objectPosition: tile.charObjectPosition || 'bottom center',
              filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.55))',
            }}
            animate={hovered ? { y: -8, rotate: -3 } : { y: [0, -6, 0], rotate: 0 }}
            transition={
              hovered
                ? { type: 'spring', stiffness: 240 }
                : { y: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' } }
            }
          />
        </div>
      )}

      {/* Title band — single line, centered, top of card. Auto-fits so the
          longest titles ("DETECTIVE DR. JELLYBONE", "WHO'S GOT THE RHYTHM")
          still fit on one line at any card width. */}
      <div className="absolute left-0 right-0 top-3 md:top-4 px-3 z-20">
        <AutoFitTitle text={tile.title} testId={`submenu-tile-title-${tile.id}`} />
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
 * Header hero row — Finn · Shield logo · Charlie. Mirrors the home page so
 * the sub-worlds feel like the same brand universe. Replaces the earlier
 * giant "PLAY / LEARN / CREATE" word treatment (the section subtitle pill
 * carries that context now).
 */
function HeaderHero({ subtitle }) {
  const navigate = useNavigate();
  return (
    <motion.div
      className="relative z-10 text-center mb-5 md:mb-7 w-full flex flex-col items-center"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 w-full">
        <motion.img
          src="assets/characters/finn-danger.png"
          alt="Finn"
          data-testid="submenu-hero-finn"
          className="object-contain drop-shadow-lg cursor-pointer"
          style={{ width: 'clamp(50px, 9vw, 110px)', height: 'auto' }}
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1, y: [0, -6, 0] }}
          transition={{
            x: { delay: 0.15, type: 'spring' },
            opacity: { delay: 0.15 },
            y: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' },
          }}
          whileHover={{ scale: 1.08, rotate: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/fun-facts')}
        />

        <motion.img
          src="assets/ui/logo.png"
          alt="Jelly of the Month Club Music Academy"
          data-testid="submenu-hero-logo"
          className="object-contain cursor-pointer"
          style={{
            width: 'clamp(110px, 20vw, 240px)',
            height: 'auto',
            filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.18))',
          }}
          initial={{ y: -20, opacity: 0, rotate: -4 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/')}
        />

        <motion.img
          src="assets/characters/charlie.png"
          alt="Charlie"
          data-testid="submenu-hero-charlie"
          className="object-contain drop-shadow-lg cursor-pointer"
          style={{ width: 'clamp(64px, 12vw, 140px)', height: 'auto' }}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1, y: [0, -6, 0] }}
          transition={{
            x: { delay: 0.2, type: 'spring' },
            opacity: { delay: 0.2 },
            y: { repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: 0.4 },
          }}
          whileHover={{ scale: 1.08, rotate: 4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/fun-facts')}
        />
      </div>

      {subtitle && (
        <p
          className="mt-3 text-sm md:text-base font-bold uppercase tracking-wider inline-block px-3 py-1 rounded-full"
          style={{
            color: 'white',
            backgroundColor: 'var(--jma-dark)',
            boxShadow: '0 3px 0 0 rgba(0,0,0,0.35)',
          }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

/**
 * <SubMenuPage
 *   sectionTitle="PLAY"          // kept for a11y; not rendered as giant text anymore
 *   sectionSubtitle="Pick a game!"
 *   bgGradient="..."
 *   tiles={[...]}
 * />
 */
export default function SubMenuPage({ sectionTitle, sectionSubtitle, bgGradient, tiles, testId }) {
  const navigate = useNavigate();
  return (
    <div
      data-testid={testId}
      className="min-h-screen flex flex-col items-center px-3 sm:px-6 pt-16 md:pt-20 pb-8 relative overflow-x-hidden"
      style={{ background: bgGradient }}
      aria-label={sectionTitle}
    >
      {/* Lou blimp — same drifting sky presence used on the home page so the
          three sub-worlds feel contiguous with the lobby. Sits behind
          everything else. */}
      <BlimpFlyby />

      <GameHeader showHomeButton={true} />

      <HeaderHero subtitle={sectionSubtitle} />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {tiles.map((tile, idx) => (
          <Tile key={tile.id} tile={tile} index={idx} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}
