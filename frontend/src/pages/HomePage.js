// JMA Home — the Academy Campus.
// Six destination rooms, each a fat hero-card with a background sliver,
// a character peeking in, an academy-signage title, and warm copy.
// On mobile: cards stack vertically with comfortable thumb taps.
// On desktop: 2 columns of tall, magazine-style room cards.

import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import StickerSpotlight from '../components/StickerSpotlight';
import RankBadge from '../components/RankBadge';

// Cartoon notes raining lightly in the sky strip
const SKY_NOTES = Array.from({ length: 14 }).map((_, i) => ({
  id: i,
  x: 4 + ((i * 7) % 92),
  y: 4 + ((i * 13) % 30),
  size: 18 + (i % 4) * 4,
  delay: (i % 5) * 0.3,
  dur: 3.4 + (i % 4) * 0.4,
  color: ['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#4285F4', '#AF52DE', '#FF2D55'][i % 7],
}));

const DESTINATIONS = [
  {
    id: 'jam-hall',
    title: 'Jam Hall',
    tagline: 'Pick up any instrument and jam!',
    path: '/free-play',
    bg: 'assets/backgrounds/river.png',
    character: 'assets/characters/charlie-drum-major.png',
    charWidthPct: 30,
    character2: 'assets/characters/finn-danger.png',
    char2WidthPct: 18,
    color: '#4CD964',
    accent: '#34A853',
    sign: 'JAM HALL',
  },
  {
    id: 'rhythm-arcade',
    title: 'Rhythm Arcade',
    tagline: 'Catch the notes as they fall!',
    path: '/rhythm-game',
    // No bg image — uses an arcade-vibe gradient (set on card directly)
    bg: null,
    character: 'assets/characters/charlie-punk.png',
    charWidthPct: 30,
    character2: 'assets/characters/jazzy.png',
    char2WidthPct: 13,
    color: '#FF3B30',
    accent: '#C0392B',
    sign: 'RHYTHM ARCADE',
  },
  {
    id: 'kazoo-room',
    title: 'Stew Kazoo Says',
    tagline: 'Watch, listen, then play it back!',
    path: '/simon-says',
    bg: 'assets/backgrounds/underwater.png',
    character: 'assets/characters/stew.png',
    charWidthPct: 20,
    character2: 'assets/characters/llama-lou-stew.png',
    char2WidthPct: 18,
    color: '#4285F4',
    accent: '#1ABC9C',
    sign: 'KAZOO ROOM',
  },
  {
    id: 'ear-quest',
    title: 'Ear Quest',
    tagline: 'Use your golden ears — name that note!',
    path: '/ear-trainer',
    bg: 'assets/backgrounds/beach.png',
    character: 'assets/characters/dr-jellybone.png',
    charWidthPct: 18,
    character2: 'assets/characters/sharky-snorkel.png',
    char2WidthPct: 17,
    color: '#FF9500',
    accent: '#E67E22',
    sign: 'EAR QUEST',
  },
  {
    id: 'beat-lab',
    title: 'Beat Lab',
    tagline: 'Stack loops and build your own beat!',
    path: '/loop-studio',
    bg: 'assets/backgrounds/circus.png',
    character: 'assets/characters/chunk-disco.png',
    charWidthPct: 26,
    character2: 'assets/characters/charlie-rundmc.png',
    char2WidthPct: 19,
    color: '#AF52DE',
    accent: '#8E44AD',
    sign: 'BEAT LAB',
  },
  {
    id: 'fun-facts-clubhouse',
    title: 'Fun Facts Clubhouse',
    tagline: 'Tap the band to learn music secrets!',
    path: '/fun-facts',
    bg: 'assets/backgrounds/clubhouse.png',
    character: 'assets/characters/jazzy.png',
    charWidthPct: 16,
    character2: 'assets/characters/charlie-polliwog.png',
    char2WidthPct: 22,
    color: '#FFCC00',
    accent: '#F39C12',
    sign: 'FUN FACTS',
  },
];

function SkyNote({ note }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: `${note.x}%`, top: `${note.y}%`, opacity: 0.55 }}
      animate={{ y: [0, -14, 0], rotate: [0, 10, -10, 0] }}
      transition={{ repeat: Infinity, duration: note.dur, delay: note.delay, ease: 'easeInOut' }}
    >
      <svg width={note.size} height={note.size * 1.6} viewBox="0 0 24 40">
        <ellipse cx="9" cy="34" rx="8" ry="5.5" fill={note.color} stroke="#0A2540" strokeWidth="2.2" />
        <line x1="17" y1="34" x2="17" y2="4" stroke="#0A2540" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}

function DestinationRoom({ dest, index, navigate }) {
  const [hovered, setHovered] = useState(false);

  // Arcade gets a vibrant solid gradient (no scenic image).
  const cardBg = dest.bg
    ? undefined
    : `radial-gradient(circle at 30% 30%, ${dest.color} 0%, ${dest.accent} 60%, #0A2540 130%)`;

  return (
    <motion.button
      data-testid={`room-${dest.id}`}
      type="button"
      onClick={() => navigate(dest.path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-full text-left rounded-3xl border-4 cursor-pointer overflow-hidden group"
      style={{
        borderColor: 'var(--jma-dark)',
        boxShadow: `0 8px 0 0 var(--jma-dark)`,
        background: cardBg || dest.color,
        minHeight: '180px',
      }}
      initial={{ y: 50, opacity: 0, rotate: index % 2 === 0 ? -2 : 2 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={{ delay: 0.35 + index * 0.08, type: 'spring', stiffness: 220 }}
      whileHover={{ y: -6, boxShadow: '0 14px 0 0 var(--jma-dark)', scale: 1.015 }}
      whileTap={{ y: 4, boxShadow: '0 4px 0 0 var(--jma-dark)', scale: 0.985 }}
    >
      {/* Background scene (when present) */}
      {dest.bg && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${dest.bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      {/* Arcade pattern: subtle diagonal stripes for "stage lights" feel */}
      {!dest.bg && (
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(255,255,255,0.4) 0 14px, transparent 14px 32px)',
          }}
        />
      )}
      {/* Color tint gradient for legibility */}
      {dest.bg && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${dest.color}D9 0%, ${dest.accent}66 55%, transparent 100%)`,
          }}
        />
      )}

      {/* "Sign" / nameplate */}
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
            style={{ color: dest.accent }}
          >
            {dest.sign}
          </span>
        </div>
      </div>

      {/* Title + tagline */}
      <div className="absolute left-4 md:left-5 bottom-3 md:bottom-4 right-[42%] z-10">
        <h2
          className="text-2xl md:text-3xl font-black font-display leading-tight mb-1"
          style={{
            color: 'white',
            textShadow: '2px 2px 0 rgba(10,37,64,0.85), 4px 4px 0 rgba(10,37,64,0.35)',
          }}
        >
          {dest.title}
        </h2>
        <p
          className="text-xs md:text-sm font-bold leading-snug"
          style={{
            color: 'white',
            textShadow: '1px 1px 0 rgba(10,37,64,0.7)',
          }}
        >
          {dest.tagline}
        </p>
      </div>

      {/* Primary character (rendered with per-destination size cap) */}
      <motion.img
        src={dest.character}
        alt=""
        draggable={false}
        loading="lazy"
        className="absolute right-2 bottom-2 object-contain pointer-events-none select-none z-10"
        style={{
          width: `${dest.charWidthPct || 28}%`,
          maxHeight: '78%',
          filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.45))',
        }}
        animate={hovered ? { y: -10, rotate: -4 } : { y: [0, -6, 0], rotate: 0 }}
        transition={
          hovered
            ? { type: 'spring', stiffness: 240 }
            : { y: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' } }
        }
      />
      {/* Secondary character (desktop-only, smaller) */}
      <motion.img
        src={dest.character2}
        alt=""
        draggable={false}
        loading="lazy"
        className="absolute -bottom-2 object-contain pointer-events-none select-none z-[9] hidden md:block"
        style={{
          right: `${(dest.charWidthPct || 28) + 10}%`,
          width: `${dest.char2WidthPct || 16}%`,
          maxHeight: '60%',
          filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.4))',
        }}
        animate={{ y: [0, -4, 0], rotate: [-3, 3, -3] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: 0.3 }}
      />

      {/* Hover "Enter" hint */}
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
    </motion.button>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [shieldSpins, setShieldSpins] = useState(0);
  const notes = useMemo(() => SKY_NOTES, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center px-3 sm:px-4 py-4 md:py-6 relative overflow-x-hidden"
      style={{
        background:
          'linear-gradient(180deg, #87CEEB 0%, #B5E0F2 35%, #FFE5C4 75%, #FFC987 100%)',
      }}
      data-testid="home-page"
    >
      {/* Sky cartoon notes */}
      <div className="absolute inset-x-0 top-0 h-72 pointer-events-none">
        {notes.map((n) => <SkyNote key={n.id} note={n} />)}
      </div>

      {/* Top app-name banner */}
      <motion.div
        className="z-10 mt-1 mb-2 flex items-center justify-center gap-2"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div
          className="px-3 py-1 rounded-full border-3 shadow-[0_3px_0_0_var(--jma-dark)]"
          style={{ borderColor: 'var(--jma-dark)', backgroundColor: 'white' }}
        >
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em]" style={{ color: 'var(--jma-dark)' }}>
            Jelly of the Month Club · Music Academy
          </span>
        </div>
      </motion.div>

      {/* Hero row: Finn — Shield — Charlie */}
      <motion.div
        className="flex items-center justify-center gap-3 md:gap-6 mb-1 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.img
          src="assets/characters/finn-danger.png"
          alt="Finn"
          data-testid="home-finn"
          className="w-20 h-24 md:w-32 md:h-36 object-contain drop-shadow-lg cursor-pointer"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1, y: [0, -8, 0] }}
          transition={{ x: { delay: 0.2, type: 'spring' }, opacity: { delay: 0.2 }, y: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' } }}
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/fun-facts')}
        />

        <motion.button
          data-testid="jma-logo"
          aria-label="JMA Shield - tap me!"
          onClick={() => setShieldSpins((n) => n + 1)}
          className="bg-transparent border-0 p-0 cursor-pointer"
          initial={{ y: -40, opacity: 0, rotate: -5 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <motion.img
            src="assets/ui/logo.png"
            alt="JMA"
            className="w-24 h-24 md:w-36 md:h-36 object-contain"
            animate={{ rotate: shieldSpins * 360 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </motion.button>

        <motion.img
          src="assets/characters/charlie-polliwog.png"
          alt="Charlie"
          data-testid="home-charlie"
          className="w-20 h-24 md:w-32 md:h-36 object-contain drop-shadow-lg cursor-pointer"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1, y: [0, -8, 0] }}
          transition={{ x: { delay: 0.3, type: 'spring' }, opacity: { delay: 0.3 }, y: { repeat: Infinity, duration: 2.4, ease: 'easeInOut', delay: 0.4 } }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/fun-facts')}
        />
      </motion.div>

      {/* Title - academy signage */}
      <motion.h1
        className="text-3xl sm:text-4xl md:text-6xl font-black text-center font-display mt-1 mb-0 z-10 tracking-wide leading-none"
        style={{ color: 'var(--jma-dark)', textShadow: '3px 3px 0 #FFD54F, 5px 5px 0 rgba(10,37,64,0.18)' }}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.15, stiffness: 200 }}
        data-testid="game-title"
      >
        JMA
      </motion.h1>
      <motion.p
        className="text-xs md:text-sm font-bold mb-3 z-10 italic"
        style={{ color: 'var(--jma-dark)', opacity: 0.75 }}
        initial={{ opacity: 0 }} animate={{ opacity: 0.75 }} transition={{ delay: 0.3 }}
      >
        Where music friends play together
      </motion.p>

      {/* Rank badge + Sticker spotlight side-by-side */}
      <div className="relative z-10 mb-3 md:mb-5 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-center gap-3">
        <RankBadge />
        <StickerSpotlight />
      </div>

      {/* Campus map - destination rooms */}
      <div className="w-full max-w-5xl z-10 px-1">
        <motion.div
          className="flex items-center justify-center gap-2 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <span className="block w-8 h-0.5 rounded-full" style={{ backgroundColor: 'var(--jma-dark)' }} />
          <span className="text-xs md:text-sm font-black uppercase tracking-[0.3em]" style={{ color: 'var(--jma-dark)' }}>
            Where to today?
          </span>
          <span className="block w-8 h-0.5 rounded-full" style={{ backgroundColor: 'var(--jma-dark)' }} />
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          {DESTINATIONS.map((dest, index) => (
            <DestinationRoom key={dest.id} dest={dest} index={index} navigate={navigate} />
          ))}
        </div>
      </div>

      {/* Sticker Book button */}
      <motion.button
        data-testid="sticker-book-btn"
        onClick={() => navigate('/sticker-book')}
        className="mt-5 mb-3 z-10 chunky-btn bg-gradient-to-r from-[#FFCC00] via-[#FF9500] to-[#FF3B30] text-white px-6 py-2.5 flex items-center gap-2 text-base font-bold rounded-full border-4 border-[var(--jma-dark)] shadow-[0_6px_0_0_var(--jma-dark)]"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.0, type: 'spring', stiffness: 260 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.96, y: 2 }}
      >
        <Sparkles className="w-5 h-5" />
        Sticker Book
      </motion.button>
    </div>
  );
}

export default HomePage;
