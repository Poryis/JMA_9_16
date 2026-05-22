// JMA Home — based on the partner's reference image.
// Hero: Finn (cello) - SHIELD - Charlie (guitar) on top, no extra wording.
// Body: three big tappable cards (PLAY · LEARN · CREATE), with the icon as
// the centerpiece and only minimal corner accents.
// Bottom: a single helper pill explaining each section.

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, PlayCircle, Drum, Star } from 'lucide-react';
import RankBadge from '../components/RankBadge';
import StickerSpotlight from '../components/StickerSpotlight';

// Floating music notes/stars in the sky strip behind the hero row.
const SKY_DOODLES = [
  { src: 'assets/home/play/note.png',         top: 22, left: 6,   w: 3.0, dur: 3.0, delay: 0.0 },
  { src: 'assets/home/learn/noteaccent.png',  top: 8,  left: 18,  w: 3.4, dur: 2.4, delay: 0.4 },
  { src: 'assets/home/create/note accent.png', top: 18, left: 30, w: 2.8, dur: 3.4, delay: 0.7 },
  { src: 'assets/home/play/note.png',         top: 12, left: 72,  w: 3.0, dur: 2.8, delay: 0.2 },
  { src: 'assets/home/learn/noteaccent1.png', top: 22, left: 82,  w: 3.4, dur: 3.2, delay: 0.5 },
  { src: 'assets/home/create/note accent 2.png', top: 9, left: 92, w: 2.8, dur: 2.6, delay: 0.3 },
];

const CARDS = [
  {
    id: 'play',
    title: 'PLAY',
    path: '/play',
    icon: 'assets/home/play/boombox.png',
    iconAlt: 'Boombox',
    bg: '#FFC83D',
    border: '#0A2540',
    shadow: '#F39C12',
    titleColor: '#0A2540',
    titleStroke: '#FFFFFF',
    // Only 2 tiny corner doodles (matching reference's minimalism)
    accents: [
      { src: 'assets/home/play/note.png',  top: 6,  left: 6,  w: 13, anim: 'bob',  dur: 2.6, delay: 0.0 },
      { src: 'assets/home/play/stars.png', top: 6,  left: 78, w: 15, anim: 'twinkle', dur: 1.8, delay: 0.2 },
    ],
    helper: { icon: Gamepad2, color: '#FF9500', text: 'Play games, instruments and jam!' },
  },
  {
    id: 'learn',
    title: 'LEARN',
    path: '/learn',
    icon: 'assets/home/learn/storybook no accents.png',
    iconAlt: 'Storybook',
    bg: '#C8A8F2',
    border: '#0A2540',
    shadow: '#9B6DE0',
    titleColor: '#0A2540',
    titleStroke: '#FFFFFF',
    accents: [
      { src: 'assets/home/learn/staraccent.png',  top: 6,  left: 6,  w: 12, anim: 'twinkle', dur: 1.8, delay: 0.1 },
      { src: 'assets/home/learn/noteaccent1.png', top: 6,  left: 78, w: 14, anim: 'sway', dur: 2.8, delay: 0.3 },
    ],
    helper: { icon: PlayCircle, color: '#9B6DE0', text: 'Watch videos, sing songs and go on adventures!' },
  },
  {
    id: 'create',
    title: 'CREATE',
    path: '/create',
    icon: 'assets/home/create/beat pad.png',
    iconAlt: 'Beat Pad',
    bg: '#7DD3C0',
    border: '#0A2540',
    shadow: '#3FA68B',
    titleColor: '#0A2540',
    titleStroke: '#FFFFFF',
    accents: [
      { src: 'assets/home/create/note accent.png',   top: 6, left: 8,  w: 13, anim: 'sway', dur: 2.6, delay: 0.2 },
      { src: 'assets/home/create/stars accent.png',  top: 6, left: 78, w: 14, anim: 'twinkle', dur: 1.8, delay: 0.4 },
      { src: 'assets/home/create/heartbeat 1.png',   top: 75, left: 68, w: 22, anim: 'pulse', dur: 1.4, delay: 0.1 },
    ],
    helper: { icon: Drum, color: '#3FA68B', text: 'Build beats, play instruments and record!' },
  },
];

const ANIMS = {
  bob:     { y: [0, -6, 0] },
  sway:    { rotate: [-5, 5, -5], y: [0, -3, 0] },
  twinkle: { scale: [1, 1.12, 1], opacity: [0.9, 1, 0.9] },
  pulse:   { scale: [1, 1.06, 1] },
};

function Accent({ a }) {
  return (
    <motion.img
      src={a.src} alt="" draggable={false} loading="lazy"
      className="absolute pointer-events-none select-none"
      style={{
        top: `${a.top}%`, left: `${a.left}%`, width: `${a.w}%`,
        filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.18))',
        zIndex: 1,
      }}
      animate={ANIMS[a.anim] || ANIMS.bob}
      transition={{ duration: a.dur, delay: a.delay, repeat: Infinity, ease: 'easeInOut' }}
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
      className="relative rounded-[26px] cursor-pointer w-full bg-transparent border-0 p-0"
      initial={{ y: 50, opacity: 0, scale: 0.92 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 0.18 + index * 0.1, type: 'spring', stiffness: 220 }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
    >
      <div
        className="relative rounded-[26px] flex flex-col items-center justify-end overflow-hidden"
        style={{
          background: card.bg,
          border: `5px solid ${card.border}`,
          boxShadow: `0 10px 0 0 ${card.shadow}, 0 13px 0 0 ${card.border}`,
          aspectRatio: '4 / 5',
          minHeight: 320,
          padding: 'clamp(16px, 3vw, 28px)',
        }}
      >
        {/* Subtle inner radial highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 35%, rgba(255,255,255,0.35) 0%, transparent 55%)' }}
        />

        {card.accents.map((a, i) => <Accent key={i} a={a} />)}

        {/* HUGE primary icon */}
        <motion.img
          src={card.icon}
          alt={card.iconAlt}
          draggable={false}
          loading="eager"
          className="relative object-contain select-none z-10"
          style={{
            width: 'min(82%, 280px)',
            height: 'auto',
            maxHeight: '62%',
            marginBottom: 'clamp(8px, 2vw, 18px)',
            filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.22))',
          }}
          animate={hovered ? { scale: 1.06, y: -6, rotate: -2 } : { y: [0, -6, 0], rotate: 0 }}
          transition={
            hovered
              ? { type: 'spring', stiffness: 240 }
              : { y: { repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: index * 0.2 } }
          }
        />

        {/* Title */}
        <h2
          className="relative z-10 font-black font-display leading-none text-center"
          style={{
            fontSize: 'clamp(32px, 6vw, 64px)',
            color: card.titleColor,
            WebkitTextStroke: `clamp(2px, 0.4vw, 4px) ${card.titleStroke}`,
            paintOrder: 'stroke fill',
            letterSpacing: '0.02em',
          }}
        >
          {card.title}
        </h2>
      </div>
    </motion.button>
  );
}

function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      data-testid="home-page"
      className="min-h-screen w-full flex flex-col items-center px-3 sm:px-6 pt-4 pb-6 relative overflow-x-hidden"
      style={{
        background:
          'linear-gradient(180deg, #BCE5F2 0%, #E5F2F8 55%, #FFEEC5 100%)',
      }}
    >
      {/* Sky doodles — float behind the hero */}
      {SKY_DOODLES.map((d, i) => (
        <motion.img
          key={i}
          src={d.src} alt="" draggable={false} loading="lazy"
          className="absolute pointer-events-none select-none opacity-75"
          style={{ top: `${d.top}%`, left: `${d.left}%`, width: `${d.w}%`, zIndex: 0 }}
          animate={{ y: [0, -12, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* HERO ROW — Finn · Shield · Charlie */}
      <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-4 md:gap-8 mt-2 mb-2 w-full">
        <motion.img
          src="assets/characters/finn-danger.png"
          alt="Finn"
          data-testid="home-finn"
          className="object-contain drop-shadow-lg cursor-pointer"
          style={{ width: 'clamp(80px, 14vw, 170px)', height: 'auto' }}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1, y: [0, -8, 0] }}
          transition={{
            x: { delay: 0.2, type: 'spring' },
            opacity: { delay: 0.2 },
            y: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' },
          }}
          whileHover={{ scale: 1.08, rotate: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/fun-facts')}
        />

        <motion.img
          src="assets/ui/logo.png"
          alt="Jelly of the Month Club Music Academy"
          data-testid="jma-logo"
          className="object-contain"
          style={{
            width: 'clamp(120px, 22vw, 280px)',
            height: 'auto',
            filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.18))',
          }}
          initial={{ y: -30, opacity: 0, rotate: -4 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
        />

        <motion.img
          src="assets/characters/charlie-drum-major.png"
          alt="Charlie"
          data-testid="home-charlie"
          className="object-contain drop-shadow-lg cursor-pointer"
          style={{ width: 'clamp(80px, 14vw, 170px)', height: 'auto' }}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1, y: [0, -8, 0] }}
          transition={{
            x: { delay: 0.3, type: 'spring' },
            opacity: { delay: 0.3 },
            y: { repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: 0.4 },
          }}
          whileHover={{ scale: 1.08, rotate: 4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/fun-facts')}
        />
      </div>

      {/* Rank + Sticker spotlight */}
      <div className="relative z-10 mb-4 md:mb-5 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-center gap-3">
        <RankBadge />
        <StickerSpotlight />
      </div>

      {/* THREE PRIMARY CARDS */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 px-1">
        {CARDS.map((card, idx) => (
          <PrimaryCard key={card.id} card={card} index={idx} navigate={navigate} />
        ))}
      </div>

      {/* Bottom helper pill: TAP A SECTION TO EXPLORE MORE → 3 section reminders */}
      <motion.div
        data-testid="home-helper-pill"
        className="relative z-10 mt-5 mb-2 w-full max-w-5xl px-3 py-2 md:px-5 md:py-3 rounded-[28px] border-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-5"
        style={{
          backgroundColor: '#FFF9EE',
          borderColor: '#0A2540',
          boxShadow: '0 6px 0 0 #0A2540',
        }}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring' }}
      >
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <Star className="w-6 h-6 md:w-7 md:h-7 flex-shrink-0" style={{ color: '#FFCC00', fill: '#FFCC00' }} />
          <span className="text-[11px] md:text-sm font-black uppercase tracking-wide leading-tight" style={{ color: '#0A2540' }}>
            Tap a section to<br className="hidden md:block" /> explore more!
          </span>
          <span className="text-2xl md:text-3xl" style={{ color: '#0A2540' }} aria-hidden="true">→</span>
        </div>
        <div className="grid grid-cols-3 gap-2 md:gap-4 flex-1">
          {CARDS.map((c) => {
            const Icon = c.helper.icon;
            return (
              <div key={c.id} className="flex items-start gap-2 md:gap-3">
                <div
                  className="flex-shrink-0 w-9 h-9 md:w-11 md:h-11 rounded-full border-2 flex items-center justify-center"
                  style={{ backgroundColor: c.helper.color, borderColor: '#0A2540' }}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <p className="text-[10px] md:text-[11px] font-bold leading-tight" style={{ color: '#0A2540' }}>
                  {c.helper.text}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

export default HomePage;
