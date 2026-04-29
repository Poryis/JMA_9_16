import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Drum, Brain, Layers, Ear, Sparkles, BookOpen } from 'lucide-react';
import StickerSpotlight from '../components/StickerSpotlight';

// SVG cartoony music notes - colorful, thick-stroked, fun
const NOTES = [
  // Top edges
  { type: 'quarter', color: '#FF3B30', x: '3%', y: '5%', size: 28, delay: 0, dur: 4.2 },
  { type: 'eighth', color: '#FF9500', x: '92%', y: '8%', size: 32, delay: 0.3, dur: 3.5 },
  { type: 'quarter', color: '#FFCC00', x: '10%', y: '25%', size: 24, delay: 0.7, dur: 3.8 },
  { type: 'eighth', color: '#4CD964', x: '88%', y: '30%', size: 30, delay: 1.1, dur: 4.0 },
  { type: 'quarter', color: '#4285F4', x: '5%', y: '50%', size: 26, delay: 0.5, dur: 3.2 },
  { type: 'eighth', color: '#AF52DE', x: '95%', y: '55%', size: 28, delay: 0.9, dur: 4.5 },
  { type: 'quarter', color: '#FF2D55', x: '8%', y: '72%', size: 22, delay: 1.3, dur: 3.6 },
  { type: 'eighth', color: '#34A853', x: '90%', y: '75%', size: 34, delay: 0.2, dur: 3.9 },
  { type: 'quarter', color: '#FF9500', x: '15%', y: '88%', size: 26, delay: 0.8, dur: 4.1 },
  { type: 'eighth', color: '#4285F4', x: '85%', y: '90%', size: 24, delay: 1.5, dur: 3.3 },
  // Inner sides
  { type: 'quarter', color: '#FFCC00', x: '20%', y: '12%', size: 20, delay: 1.0, dur: 3.7 },
  { type: 'eighth', color: '#FF3B30', x: '78%', y: '15%', size: 22, delay: 0.4, dur: 4.3 },
  { type: 'quarter', color: '#AF52DE', x: '18%', y: '42%', size: 18, delay: 1.2, dur: 3.4 },
  { type: 'eighth', color: '#4CD964', x: '82%', y: '48%', size: 20, delay: 0.6, dur: 3.9 },
  { type: 'quarter', color: '#FF2D55', x: '22%', y: '65%', size: 22, delay: 0.1, dur: 4.0 },
  { type: 'eighth', color: '#34A853', x: '76%', y: '68%', size: 24, delay: 1.4, dur: 3.6 },
  // Bottom center cluster - denser
  { type: 'quarter', color: '#FF3B30', x: '35%', y: '82%', size: 22, delay: 0.2, dur: 3.3 },
  { type: 'eighth', color: '#FFCC00', x: '42%', y: '88%', size: 26, delay: 0.7, dur: 4.1 },
  { type: 'quarter', color: '#4285F4', x: '50%', y: '85%', size: 20, delay: 1.1, dur: 3.7 },
  { type: 'eighth', color: '#4CD964', x: '58%', y: '90%', size: 24, delay: 0.4, dur: 3.9 },
  { type: 'quarter', color: '#AF52DE', x: '65%', y: '83%', size: 22, delay: 0.9, dur: 4.3 },
  { type: 'eighth', color: '#FF9500', x: '45%', y: '93%', size: 28, delay: 1.3, dur: 3.5 },
  { type: 'quarter', color: '#FF2D55', x: '55%', y: '95%', size: 20, delay: 0.6, dur: 3.8 },
  { type: 'eighth', color: '#34A853', x: '38%', y: '92%', size: 18, delay: 1.0, dur: 4.0 },
  { type: 'quarter', color: '#FF3B30', x: '62%', y: '92%', size: 24, delay: 0.3, dur: 3.4 },
  { type: 'eighth', color: '#4285F4', x: '48%', y: '78%', size: 18, delay: 0.8, dur: 4.2 },
  { type: 'quarter', color: '#FFCC00', x: '30%', y: '76%', size: 16, delay: 1.5, dur: 3.6 },
  { type: 'eighth', color: '#AF52DE', x: '68%', y: '78%', size: 16, delay: 0.5, dur: 3.2 },
];

function CartoonNote({ note }) {
  // Quarter note SVG
  const quarterNote = (
    <svg width={note.size} height={note.size * 1.8} viewBox="0 0 24 44" fill="none">
      <ellipse cx="10" cy="38" rx="9" ry="6" fill={note.color} stroke="#0A2540" strokeWidth="2.5" />
      <line x1="19" y1="38" x2="19" y2="4" stroke="#0A2540" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
  // Eighth note SVG (with flag)
  const eighthNote = (
    <svg width={note.size} height={note.size * 1.8} viewBox="0 0 28 44" fill="none">
      <ellipse cx="10" cy="38" rx="9" ry="6" fill={note.color} stroke="#0A2540" strokeWidth="2.5" />
      <line x1="19" y1="38" x2="19" y2="4" stroke="#0A2540" strokeWidth="3" strokeLinecap="round" />
      <path d="M19 4 C19 4 26 10 26 18" stroke="#0A2540" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );

  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: note.x, top: note.y, opacity: 0.4 }}
      animate={{
        y: [0, -12, 0],
        rotate: [0, 8, -8, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{ repeat: Infinity, duration: note.dur, delay: note.delay, ease: 'easeInOut' }}
    >
      {note.type === 'quarter' ? quarterNote : eighthNote}
    </motion.div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [shieldSpins, setShieldSpins] = useState(0);

  const gameModes = [
    { id: 'free-play',   title: 'Jam Time',          description: 'Tap any instrument!',  icon: Music,  color: '#4CD964', path: '/free-play' },
    { id: 'rhythm-game', title: "Who's Got Rhythm",  description: 'Hit notes as they fall!', icon: Drum,   color: '#FF3B30', path: '/rhythm-game' },
    { id: 'simon-says',  title: 'Simon Says',        description: 'Watch, listen, repeat!',  icon: Brain,  color: '#4285F4', path: '/simon-says' },
    { id: 'ear-trainer', title: 'Ear Trainer',       description: 'Name that note!',          icon: Ear,    color: '#FF9500', path: '/ear-trainer' },
    { id: 'loop-studio', title: 'Loop Studio',       description: 'Build beats & layers!',    icon: Layers, color: '#AF52DE', path: '/loop-studio' },
    { id: 'fun-facts',   title: 'Fun Facts',         description: 'Music facts for kids!',    icon: BookOpen, color: '#FFCC00', path: '/fun-facts' },
  ];

  // Only Finn (left) and Charlie (right) on the home page
  const finn    = { name: 'Finn',    image: 'assets/characters/finn-danger.png' };
  const charlie = { name: 'Charlie', image: 'assets/characters/charlie-polliwog.png' };

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-6 md:py-8 relative overflow-hidden"
      style={{ backgroundColor: '#87CEEB' }}
    >
      {/* Cartoony floating music notes */}
      {NOTES.map((note, i) => (
        <CartoonNote key={i} note={note} />
      ))}

      {/* Hero row: Finn — Shield — Charlie */}
      <motion.div
        className="flex items-center justify-center gap-3 md:gap-6 mb-1 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.img
          src={finn.image}
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
          src={charlie.image}
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

      {/* Title - ALL CAPS */}
      <motion.h1
        className="text-4xl md:text-6xl font-black text-center font-display mb-0 z-10 tracking-wide"
        style={{ color: 'var(--jma-dark)', textShadow: '3px 3px 0 #FFD54F, 5px 5px 0 rgba(10,37,64,0.15)' }}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.15, stiffness: 200 }}
        data-testid="game-title"
      >
        JELLY JAM BOX
      </motion.h1>
      <motion.p className="text-sm md:text-base font-bold mb-3 z-10" style={{ color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        Music is FUN!
      </motion.p>

      {/* Sticker Spotlight */}
      <div className="relative z-10 mb-4 md:mb-6 w-full flex justify-center px-4">
        <StickerSpotlight />
      </div>

      {/* Game Mode Cards - 6 modes in 3-col grid */}
      <div className="w-full max-w-3xl z-10">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {gameModes.map((mode, index) => (
            <GameModeCard key={mode.id} mode={mode} index={index} navigate={navigate} />
          ))}
        </div>
      </div>

      {/* Sticker Book button */}
      <motion.button
        data-testid="sticker-book-btn"
        onClick={() => navigate('/sticker-book')}
        className="mt-4 z-10 chunky-btn bg-gradient-to-r from-[#FFCC00] via-[#FF9500] to-[#FF3B30] text-white px-6 py-2.5 flex items-center gap-2 text-base font-bold rounded-full border-4 border-[var(--jma-dark)] shadow-[0_6px_0_0_var(--jma-dark)]"
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

function GameModeCard({ mode, index, navigate }) {
  return (
    <motion.button
      data-testid={`mode-${mode.id}`}
      className="flex flex-col items-center text-center p-4 md:p-5 rounded-3xl border-4 cursor-pointer"
      style={{ backgroundColor: 'white', borderColor: mode.color, boxShadow: `0 6px 0 0 ${mode.color}` }}
      onClick={() => navigate(mode.path)}
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 + index * 0.07, type: 'spring', stiffness: 300 }}
      whileHover={{ y: -6, boxShadow: `0 10px 0 0 ${mode.color}`, scale: 1.03 }}
      whileTap={{ y: 3, boxShadow: `0 3px 0 0 ${mode.color}`, scale: 0.98 }}
    >
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-2 border-3"
        style={{ backgroundColor: mode.color, borderColor: 'var(--jma-dark)' }}>
        <mode.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
      </div>
      <h2 className="text-sm md:text-base font-bold font-display" style={{ color: 'var(--jma-dark)' }}>{mode.title}</h2>
      <p className="text-[10px] md:text-xs mt-0.5 hidden sm:block" style={{ color: '#8899AA' }}>{mode.description}</p>
    </motion.button>
  );
}

export default HomePage;
