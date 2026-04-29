import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { X, Sparkles } from 'lucide-react';
import { getRandomFact } from '../data/musicFacts';
import { earnSticker, noteFactSeen } from '../hooks/useStickers';
import { GameHeader } from '../components/GameUI';

// Characters placed IN the clubhouse scene at specific spots.
// Coordinates are % of the 16:9 scene container (origin top-left).
// Idle animation per location:
//   - Chunk on the swing → swings side to side
//   - Finn near the ladder → climbing bob
//   - Dr. Jellybone in the window → peeks up & down
//   - Charlie / Lou&Stew / Jazzy on the floor → standing bob
const SCENE_CHARS = [
  { name: 'Chunk',         image: 'assets/characters/chunk.png',           stickerId: 'char_chunk',
    leftPct: 30, topPct: 20, widthPct: 13, anim: 'swing' },
  { name: 'Finn',          image: 'assets/characters/finn-danger.png',     stickerId: 'char_finn',
    leftPct: 8, topPct: 35, widthPct: 11, anim: 'bob' },
  { name: 'Dr. Jellybone', image: 'assets/characters/dr-jellybone.png',    stickerId: 'char_doctor',
    leftPct: 65, topPct: 27, widthPct: 9.9, anim: 'peek' },
  { name: 'Jazzy',         image: 'assets/characters/jazzy.png',           stickerId: 'char_jazzy',
    leftPct: 22, topPct: 63, widthPct: 8, anim: 'bob' },
  { name: 'Charlie',       image: 'assets/characters/charlie-polliwog.png', stickerId: 'char_charlie',
    leftPct: 50, topPct: 70, widthPct: 15.8, anim: 'bob' },
  { name: 'Lou & Stew',    image: 'assets/characters/llama-lou-stew.png',  stickerId: 'char_loustew',
    leftPct: 78, topPct: 65, widthPct: 12, anim: 'bob' },
];

const ANIM_VARIANTS = {
  bob:   { y: [0, -6, 0] },
  swing: { rotate: [-4, 4, -4], y: [0, -2, 0] },
  peek:  { y: [0, -8, 0] },
};

function FunFactsPage() {
  const [activeFact, setActiveFact] = useState(null);

  const showFact = useCallback((characterName) => {
    const fact = getRandomFact(characterName);
    if (!fact) return;
    setActiveFact({ character: characterName, ...fact });
    const charObj = SCENE_CHARS.find(c => c.name === characterName);
    if (charObj?.stickerId) earnSticker(charObj.stickerId);
    noteFactSeen();
  }, []);

  const closeFact = useCallback(() => setActiveFact(null), []);

  return (
    <div
      className="min-h-screen flex flex-col"
      data-testid="fun-facts-page"
      style={{ backgroundColor: '#3D2E1F' }}
    >
      <GameHeader title="Fun Facts" showHomeButton={true} />

      <main className="flex-1 pt-24 pb-6 px-3 flex flex-col items-center justify-center">
        <motion.p
          className="text-base md:text-lg font-display mb-4 px-4 py-2 rounded-full"
          style={{ color: 'white', backgroundColor: 'rgba(10,37,64,0.85)' }}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Sparkles className="inline w-4 h-4 mr-1" /> Tap a friend for a music fact!
        </motion.p>

        {/* The clubhouse scene - 16:9 aspect ratio, characters placed at fixed % positions */}
        <div
          className="relative w-full max-w-[1200px] rounded-2xl overflow-hidden border-4 border-[var(--jma-dark)] shadow-[0_8px_0_0_var(--jma-dark)]"
          style={{
            aspectRatio: '16 / 9',
            backgroundImage: 'url(assets/backgrounds/clubhouse.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {SCENE_CHARS.map((char, i) => (
            <motion.button
              key={char.name}
              data-testid={`funfacts-character-${char.name.replace(/[^a-z0-9]/gi, '').toLowerCase()}`}
              type="button"
              onClick={() => showFact(char.name)}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.08, type: 'spring', stiffness: 220 }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              className="absolute bg-transparent border-0 p-0 cursor-pointer flex flex-col items-center"
              style={{
                left: `${char.leftPct}%`,
                top: `${char.topPct}%`,
                width: `${char.widthPct}%`,
                transform: 'translate(-50%, -50%)',
                filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.45))',
              }}
              aria-label={`Tap ${char.name} for a music fact`}
            >
              <motion.img
                src={char.image}
                alt={char.name}
                className="w-full h-auto object-contain"
                draggable={false}
                animate={ANIM_VARIANTS[char.anim] || ANIM_VARIANTS.bob}
                transition={{ duration: 2 + i * 0.25, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
              />
              {/* Tiny name tag - only visible on hover for a clean scene */}
              <span
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'white', backgroundColor: 'var(--jma-dark)' }}
              >
                {char.name}
              </span>
            </motion.button>
          ))}
        </div>

        <p className="mt-3 text-xs md:text-sm font-bold opacity-80" style={{ color: '#FFE9C4' }}>
          {SCENE_CHARS.length} friends in the clubhouse - find them all!
        </p>
      </main>

      <AnimatePresence>
        {activeFact && (
          <motion.div
            data-testid="funfacts-modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeFact}
          >
            <motion.div
              data-testid="funfacts-modal"
              className="relative bg-white rounded-3xl border-4 max-w-md w-full p-6 md:p-8 shadow-2xl"
              style={{ borderColor: activeFact.color, boxShadow: `0 10px 0 0 ${activeFact.color}` }}
              initial={{ scale: 0.7, y: 40, opacity: 0, rotate: -3 }}
              animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.7, y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                data-testid="funfacts-modal-close"
                onClick={closeFact}
                className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white border-3 border-[var(--jma-dark)] flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                aria-label="Close"
              >
                <X className="w-4 h-4" style={{ color: 'var(--jma-dark)' }} />
              </button>
              <div className="flex items-start gap-4">
                <motion.img
                  src={SCENE_CHARS.find(c => c.name === activeFact.character)?.image}
                  alt={activeFact.character}
                  className="w-20 h-24 md:w-24 md:h-28 object-contain flex-shrink-0"
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.6 }}
                />
                <div className="flex-1 pt-1">
                  <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: activeFact.color }}>
                    {activeFact.character} says:
                  </p>
                  <p className="text-base md:text-lg font-bold leading-snug" style={{ color: 'var(--jma-dark)' }}>
                    {activeFact.text}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-5 pt-4 border-t-2 border-dashed border-gray-200">
                <button
                  data-testid="funfacts-modal-another"
                  onClick={() => showFact(activeFact.character)}
                  className="chunky-btn text-white px-4 py-1.5 text-sm font-bold"
                  style={{ backgroundColor: activeFact.color }}
                >
                  Tell me another!
                </button>
                <button
                  data-testid="funfacts-modal-got-it"
                  onClick={closeFact}
                  className="chunky-btn bg-white px-4 py-1.5 text-sm font-bold border-[var(--jma-dark)]"
                  style={{ color: 'var(--jma-dark)' }}
                >
                  Cool!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FunFactsPage;
