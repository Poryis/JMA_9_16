import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { X, Sparkles } from 'lucide-react';
import { getRandomFact } from '../data/musicFacts';
import { earnSticker, noteFactSeen } from '../hooks/useStickers';
import { GameHeader } from '../components/GameUI';

const characters = [
  { name: 'Finn',         image: 'assets/characters/finn-danger.png',     stickerId: 'char_finn' },
  { name: 'Charlie',      image: 'assets/characters/charlie-polliwog.png', stickerId: 'char_charlie' },
  { name: 'Chunk',        image: 'assets/characters/chunk.png',           stickerId: 'char_chunk' },
  { name: 'Jazzy',        image: 'assets/characters/jazzy.png',           stickerId: 'char_jazzy' },
  { name: 'Dr. Jellybone', image: 'assets/characters/dr-jellybone.png',   stickerId: 'char_doctor' },
  { name: 'Lou & Stew',   image: 'assets/characters/llama-lou-stew.png',  stickerId: 'char_loustew' },
];

function FunFactsPage() {
  const [activeFact, setActiveFact] = useState(null);

  const showFact = useCallback((characterName) => {
    const fact = getRandomFact(characterName);
    if (!fact) return;
    setActiveFact({ character: characterName, ...fact });
    const charObj = characters.find(c => c.name === characterName);
    if (charObj?.stickerId) earnSticker(charObj.stickerId);
    noteFactSeen();
  }, []);

  const closeFact = useCallback(() => setActiveFact(null), []);

  return (
    <div
      className="min-h-screen flex flex-col"
      data-testid="fun-facts-page"
      style={{
        backgroundImage: 'url(assets/backgrounds/clubhouse.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <GameHeader title="Fun Facts" showHomeButton={true} />

      <main className="flex-1 pt-24 pb-8 px-4 flex flex-col items-center">
        <motion.p
          className="text-base md:text-lg font-display mb-6 px-4 py-2 rounded-full"
          style={{ color: 'white', backgroundColor: 'rgba(10,37,64,0.85)' }}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Sparkles className="inline w-4 h-4 mr-1" /> Tap a friend for a music fact!
        </motion.p>

        <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
          {characters.map((char, i) => (
            <motion.button
              key={char.name}
              data-testid={`funfacts-character-${char.name.replace(/[^a-z0-9]/gi, '').toLowerCase()}`}
              type="button"
              onClick={() => showFact(char.name)}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.06, type: 'spring', stiffness: 250 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="game-card flex flex-col items-center p-3 md:p-4 cursor-pointer bg-white/85 backdrop-blur-sm"
            >
              <motion.img
                src={char.image}
                alt={char.name}
                className="w-20 h-24 md:w-28 md:h-32 object-contain drop-shadow-lg"
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 1.8 + i * 0.25, ease: 'easeInOut', delay: i * 0.12 }}
              />
              <span
                className="text-xs md:text-sm font-bold mt-2 px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ color: 'white', backgroundColor: 'var(--jma-dark)' }}
              >
                {char.name}
              </span>
            </motion.button>
          ))}
        </div>
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
                  src={characters.find(c => c.name === activeFact.character)?.image}
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
