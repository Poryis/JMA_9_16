// JMA Home — three big primary cards: PLAY · LEARN · CREATE
// All artwork is layered (no flattened backgrounds). Decorative doodles
// float around the cards via absolute positioning + framer-motion bobs.
// Cards stack vertically on mobile, 3-column on desktop.

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import RankBadge from '../components/RankBadge';
import StickerSpotlight from '../components/StickerSpotlight';

// Each card's palette + content + decorative cluster
const CARDS = [
  {
    id: 'play',
    title: 'PLAY',
    subtitle: 'Games',
    path: '/play',
    icon: 'assets/home/play/boombox.png',
    iconAlt: 'Boombox',
    bg: 'linear-gradient(135deg, #FFD23F 0%, #FFB300 100%)',
    accent: '#E94B3C',
    ring: '#FF8A33',
    // accents: each is { src, top%, left%, w%, anim, dur, delay }
    accents: [
      { src: 'assets/home/play/note cluster 1.png', top: -10, left: 70, w: 36, anim: 'bob',   dur: 2.8, delay: 0 },
      { src: 'assets/home/play/key cluster.png',     top: 62, left: -8, w: 30, anim: 'sway',  dur: 3.2, delay: 0.4 },
      { src: 'assets/home/play/stars.png',           top: -8, left: -10, w: 22, anim: 'twinkle', dur: 1.6, delay: 0.2 },
      { src: 'assets/home/play/drum.png',            top: 70, left: 78, w: 30, anim: 'bob',   dur: 2.4, delay: 0.5 },
    ],
  },
  {
    id: 'learn',
    title: 'LEARN',
    subtitle: 'Lessons',
    path: '/learn',
    icon: 'assets/home/learn/storybook no accents.png',
    iconAlt: 'Storybook',
    bg: 'linear-gradient(135deg, #4FC3F7 0%, #1E88E5 100%)',
    accent: '#0B3D91',
    ring: '#82B4FF',
    accents: [
      { src: 'assets/home/learn/staraccent.png',          top: -8,  left: -6, w: 22, anim: 'twinkle', dur: 1.8, delay: 0.1 },
      { src: 'assets/home/learn/noteaccent.png',          top: 60,  left: -10, w: 22, anim: 'sway', dur: 3.0, delay: 0.3 },
      { src: 'assets/home/learn/starandcircleaccent.png', top: -10, left: 76, w: 24, anim: 'bob',  dur: 2.6, delay: 0.5 },
      { src: 'assets/home/learn/noteaccent1.png',         top: 70,  left: 78, w: 26, anim: 'sway', dur: 3.4, delay: 0.2 },
    ],
  },
  {
    id: 'create',
    title: 'CREATE',
    subtitle: 'Home Studio',
    path: '/create',
    icon: 'assets/home/create/beat pad.png',
    iconAlt: 'Beat Pad',
    bg: 'linear-gradient(135deg, #FF6FB5 0%, #C2185B 100%)',
    accent: '#7B1FA2',
    ring: '#FFB6E0',
    accents: [
      { src: 'assets/home/create/note accent.png',  top: -8,  left: -8, w: 26, anim: 'sway', dur: 2.6, delay: 0.1 },
      { src: 'assets/home/create/heartbeat 1.png',  top: 64,  left: -10, w: 30, anim: 'pulse', dur: 1.4, delay: 0.2 },
      { src: 'assets/home/create/stars accent.png', top: -6,  left: 74, w: 24, anim: 'twinkle', dur: 1.8, delay: 0.3 },
      { src: 'assets/home/create/note accent 2.png', top: 70, left: 78, w: 22, anim: 'bob',   dur: 2.8, delay: 0.5 },
    ],
  },
];

const ANIMS = {
  bob:     { y: [0, -8, 0] },
  sway:    { rotate: [-6, 6, -6], y: [0, -4, 0] },
  twinkle: { scale: [1, 1.15, 1], opacity: [0.9, 1, 0.9] },
  pulse:   { scale: [1, 1.08, 1] },
};

function Accent({ a, cardId }) {
  return (
    <motion.img
      src={a.src}
      alt=""
      draggable={false}
      loading="lazy"
      className="absolute pointer-events-none select-none"
      style={{
        top: `${a.top}%`,
        left: `${a.left}%`,
        width: `${a.w}%`,
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.18))',
        zIndex: 1,
      }}
      animate={ANIMS[a.anim] || ANIMS.bob}
      transition={{
        duration: a.dur,
        delay: a.delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      data-testid={`home-accent-${cardId}`}
    />
  );
}

function PrimaryCard({ card, index, navigate }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      type="button"
      data-testid={`home-card-${card.id}`}
      onClick={() => navigate(card.path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-[28px] cursor-pointer w-full overflow-visible group bg-transparent border-0 p-0"
      initial={{ y: 60, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 0.18 + index * 0.12, type: 'spring', stiffness: 220 }}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* The card body (rounded box) */}
      <div
        className="relative rounded-[28px] border-[5px] flex flex-col items-center justify-center"
        style={{
          background: card.bg,
          borderColor: 'var(--jma-dark)',
          boxShadow: `0 10px 0 0 var(--jma-dark)`,
          padding: 'clamp(18px, 4vw, 36px) clamp(14px, 3vw, 28px)',
          aspectRatio: '4 / 5',
          minHeight: 280,
          transition: 'box-shadow 0.18s ease-out',
        }}
      >
        {/* Decorative doodles (clipped to card edges via overflow on a sibling wrapper)
            We let them peek slightly outside, with rounded clipping. */}
        <div
          className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          {/* Subtle radial highlight for "stage light" feel */}
          <div
            className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[140%] h-[80%] rounded-full opacity-30"
            style={{ background: `radial-gradient(circle, ${card.ring} 0%, transparent 65%)` }}
          />
          {card.accents.map((a, i) => (
            <Accent key={i} a={a} cardId={card.id} />
          ))}
        </div>

        {/* Primary icon (clickable visual focus) */}
        <motion.img
          src={card.icon}
          alt={card.iconAlt}
          draggable={false}
          loading="eager"
          className="relative object-contain select-none drop-shadow-xl z-10"
          style={{
            width: 'min(72%, 230px)',
            height: 'auto',
            maxHeight: '55%',
          }}
          animate={hovered ? { scale: 1.06, y: -6, rotate: -2 } : { y: [0, -6, 0], rotate: 0 }}
          transition={
            hovered
              ? { type: 'spring', stiffness: 240 }
              : { y: { repeat: Infinity, duration: 2.4, ease: 'easeInOut', delay: index * 0.2 } }
          }
        />

        {/* Title + Subtitle */}
        <div className="relative z-10 text-center mt-2 md:mt-3">
          <h2
            className="font-black font-display leading-none"
            style={{
              color: 'white',
              fontSize: 'clamp(28px, 5vw, 48px)',
              textShadow: '3px 3px 0 var(--jma-dark), 5px 5px 0 rgba(10,37,64,0.25)',
              letterSpacing: '0.02em',
            }}
          >
            {card.title}
          </h2>
          <p
            className="font-bold tracking-wide uppercase mt-1"
            style={{
              color: 'white',
              fontSize: 'clamp(10px, 1.4vw, 14px)',
              opacity: 0.95,
              textShadow: '1px 1px 0 rgba(10,37,64,0.6)',
            }}
          >
            {card.subtitle}
          </p>
        </div>

        {/* Hover "Enter" chip */}
        <motion.div
          className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full border-2 hidden md:flex items-center gap-1 z-10"
          style={{ backgroundColor: 'white', borderColor: 'var(--jma-dark)' }}
          animate={hovered ? { x: 0, opacity: 1 } : { x: 20, opacity: 0 }}
          transition={{ type: 'spring' }}
        >
          <span className="text-[10px] font-black uppercase tracking-wide" style={{ color: 'var(--jma-dark)' }}>
            Enter →
          </span>
        </motion.div>
      </div>
    </motion.button>
  );
}

// Floating ambient doodles across the whole page (very subtle).
const PAGE_DOODLES = [
  { src: 'assets/home/play/star.png',          top: 8,  left: 6,  w: 4, dur: 3.2, delay: 0.0 },
  { src: 'assets/home/learn/staraccent.png',   top: 12, left: 92, w: 5, dur: 2.4, delay: 0.6 },
  { src: 'assets/home/create/stars accent.png', top: 70, left: 4, w: 5, dur: 3.6, delay: 0.3 },
  { src: 'assets/home/play/note.png',          top: 80, left: 90, w: 4, dur: 2.8, delay: 0.5 },
];

function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      data-testid="home-page"
      className="min-h-screen w-full flex flex-col items-center px-3 sm:px-6 pt-4 pb-8 relative overflow-x-hidden"
      style={{
        background:
          'radial-gradient(circle at 20% 10%, #FFE5A6 0%, transparent 45%),' +
          'radial-gradient(circle at 80% 18%, #C7E9FF 0%, transparent 45%),' +
          'radial-gradient(circle at 50% 95%, #FFD9EB 0%, transparent 50%),' +
          'linear-gradient(180deg, #FFF6E4 0%, #FFEAD3 100%)',
      }}
    >
      {/* Page-level ambient doodles */}
      {PAGE_DOODLES.map((d, i) => (
        <motion.img
          key={i}
          src={d.src}
          alt=""
          draggable={false}
          loading="lazy"
          className="absolute pointer-events-none select-none opacity-70 hidden sm:block"
          style={{ top: `${d.top}%`, left: `${d.left}%`, width: `${d.w}%`, zIndex: 0 }}
          animate={{ y: [0, -14, 0], rotate: [-6, 6, -6] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Stylized JMA logo (uses the new artwork) */}
      <motion.img
        src="assets/ui/jma-stylized-logo.png"
        alt="Jelly of the Month Club Music Academy"
        data-testid="jma-logo"
        className="relative z-10 mx-auto object-contain"
        style={{
          width: 'min(78vw, 540px)',
          height: 'auto',
          maxHeight: '34vh',
          filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.18))',
        }}
        initial={{ y: -40, opacity: 0, scale: 0.92 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      />

      <motion.p
        className="relative z-10 text-xs md:text-sm font-bold italic mb-4 md:mb-6 mt-1"
        style={{ color: 'var(--jma-dark)', opacity: 0.7 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 0.3 }}
      >
        Music is FUN
      </motion.p>

      {/* Rank + Sticker spotlight */}
      <div className="relative z-10 mb-5 md:mb-7 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-center gap-3">
        <RankBadge />
        <StickerSpotlight />
      </div>

      {/* THREE PRIMARY CARDS */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7 px-1">
        {CARDS.map((card, idx) => (
          <PrimaryCard key={card.id} card={card} index={idx} navigate={navigate} />
        ))}
      </div>

      {/* Sticker Book button */}
      <motion.button
        data-testid="sticker-book-btn"
        onClick={() => navigate('/sticker-book')}
        className="relative z-10 mt-7 mb-2 chunky-btn bg-gradient-to-r from-[#FFCC00] via-[#FF9500] to-[#FF3B30] text-white px-6 py-2.5 flex items-center gap-2 text-base font-bold rounded-full border-4 border-[var(--jma-dark)] shadow-[0_6px_0_0_var(--jma-dark)]"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, type: 'spring', stiffness: 260 }}
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
