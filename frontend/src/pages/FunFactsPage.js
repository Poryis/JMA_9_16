import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useEffect } from 'react';
import { X, Sparkles, Search } from 'lucide-react';
import { getRandomFact } from '../data/musicFacts';
import { earnSticker, noteFactSeen } from '../hooks/useStickers';
import { GameHeader } from '../components/GameUI';

// Characters placed IN the clubhouse scene at specific spots.
// Stew removed in Feb 2026 because Lou's image already has Stew on his shoulder
// (was producing two visible Stews in the same scene).
const SCENE_CHARS = [
  { name: 'Chunk',         image: 'assets/characters/chunk.png',           stickerId: 'char_chunk',
    leftPct: 32, topPct: 20, widthPct: 13, anim: 'swing' },
  { name: 'Finn',          image: 'assets/characters/finn-danger.png',     stickerId: 'char_finn',
    leftPct: 8, topPct: 35, widthPct: 11, anim: 'bob' },
  { name: 'Dr. Jellybone', image: 'assets/characters/dr-jellybone.png',    stickerId: 'char_doctor',
    leftPct: 65, topPct: 27, widthPct: 8.9, anim: 'peek' },
  { name: 'Jazzy',         image: 'assets/characters/jazzy.png',           stickerId: 'char_jazzy',
    leftPct: 22, topPct: 63, widthPct: 8, anim: 'bob' },
  { name: 'Charlie',       image: 'assets/characters/charlie-polliwog.png', stickerId: 'char_charlie',
    leftPct: 50, topPct: 65, widthPct: 19, anim: 'bob' },
  { name: 'Lou & Stew',    image: 'assets/characters/llama-lou-stew.png',  stickerId: 'char_loustew',
    leftPct: 78, topPct: 65, widthPct: 12, anim: 'bob' },
];

const ANIM_VARIANTS = {
  bob:   { y: [0, -6, 0] },
  swing: { rotate: [-4, 4, -4], y: [0, -2, 0] },
  peek:  { y: [0, -3, 0], rotate: [-3, 3, -3] },
};

const FOUND_KEY = 'jma_funfacts_found_v1';

function readFound() {
  try {
    const raw = localStorage.getItem(FOUND_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (_) { return new Set(); }
}

function writeFound(set) {
  try { localStorage.setItem(FOUND_KEY, JSON.stringify([...set])); } catch (_) {}
}

function FunFactsPage() {
  const [activeFact, setActiveFact] = useState(null);
  const [found, setFound] = useState(() => readFound());
  const [poppingName, setPoppingName] = useState(null); // for first-find animation

  // Mark a character as found (persists). Returns true if this was a FIRST find.
  const markFound = useCallback((name) => {
    let firstFind = false;
    setFound((prev) => {
      if (prev.has(name)) return prev;
      const next = new Set(prev);
      next.add(name);
      writeFound(next);
      firstFind = true;
      return next;
    });
    return firstFind;
  }, []);

  const showFact = useCallback((characterName) => {
    const fact = getRandomFact(characterName);
    if (!fact) return;
    // If this is a first-time find, fire a brief "pop" animation BEFORE the modal.
    const isFirst = !found.has(characterName);
    markFound(characterName);
    if (isFirst) {
      setPoppingName(characterName);
      setTimeout(() => setPoppingName(null), 650);
      // Open modal slightly after the pop so the kid notices the reveal.
      setTimeout(() => {
        setActiveFact({ character: characterName, ...fact });
        const charObj = SCENE_CHARS.find(c => c.name === characterName);
        if (charObj?.stickerId) earnSticker(charObj.stickerId);
        noteFactSeen();
      }, 350);
    } else {
      setActiveFact({ character: characterName, ...fact });
      noteFactSeen();
    }
  }, [found, markFound]);

  const closeFact = useCallback(() => setActiveFact(null), []);

  const totalFound = found.size;
  const totalChars = SCENE_CHARS.length;
  const allFound = totalFound === totalChars;

  // One-time celebration when the kid finds them all.
  const [allFoundCelebrated, setAllFoundCelebrated] = useState(false);
  useEffect(() => {
    if (allFound && !allFoundCelebrated && totalFound > 0) {
      setAllFoundCelebrated(true);
      earnSticker('ach_fact_finder');
    }
  }, [allFound, allFoundCelebrated, totalFound]);

  return (
    <div
      className="min-h-screen flex flex-col"
      data-testid="fun-facts-page"
      style={{ backgroundColor: '#3D2E1F' }}
    >
      <GameHeader title="Fun Facts Clubhouse" showHomeButton={true} />

      <main className="flex-1 pt-24 pb-6 px-2 sm:px-3 flex flex-col items-center justify-center">
        {/* Progress / "find-them-all" prompt */}
        <motion.div
          className="mb-3 flex flex-col sm:flex-row items-center gap-2"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div
            className="px-4 py-2 rounded-full text-sm md:text-base font-bold flex items-center gap-2"
            style={{ color: 'white', backgroundColor: 'rgba(10,37,64,0.85)' }}
          >
            <Search className="inline w-4 h-4" />
            <span className="hidden sm:inline">Find all the music friends!</span>
            <span className="sm:hidden">Swipe & tap the shadows!</span>
          </div>
          <div
            data-testid="funfacts-progress"
            className="px-3 py-1.5 rounded-full text-xs md:text-sm font-black border-2"
            style={{
              backgroundColor: allFound ? '#4CD964' : 'white',
              color: allFound ? 'white' : 'var(--jma-dark)',
              borderColor: 'var(--jma-dark)',
            }}
          >
            {allFound ? '★ ALL FOUND! ★' : `${totalFound} / ${totalChars} friends found`}
          </div>
        </motion.div>

        {/* The clubhouse scene.
            Desktop: locked 16:9 inside max-w-[1200px].
            Mobile: minWidth: 1100px so kids must pan to discover everyone. */}
        <div
          className="w-full max-w-[1200px] overflow-x-auto md:overflow-x-visible md:overflow-y-visible rounded-2xl border-4 border-[var(--jma-dark)] shadow-[0_8px_0_0_var(--jma-dark)]"
          style={{ WebkitOverflowScrolling: 'touch' }}
          data-testid="funfacts-scene-scroller"
        >
          <div
            className="relative mx-auto"
            style={{
              minWidth: '1100px',
              width: '100%',
              aspectRatio: '16 / 9',
              backgroundImage: 'url(assets/backgrounds/clubhouse.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {SCENE_CHARS.map((char, i) => {
              const isFound = found.has(char.name);
              const isPopping = poppingName === char.name;
              return (
                <motion.button
                  key={char.name}
                  data-testid={`funfacts-character-${char.name.replace(/[^a-z0-9]/gi, '').toLowerCase()}`}
                  data-found={isFound ? 'true' : 'false'}
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
                    filter: isFound
                      ? 'drop-shadow(0 6px 8px rgba(0,0,0,0.45))'
                      // Silhouette mode: dark + slight glow halo to hint location
                      : 'brightness(0.18) drop-shadow(0 0 12px rgba(255,221,87,0.55)) drop-shadow(0 0 4px rgba(255,221,87,0.8))',
                    transition: 'filter 0.4s ease-out',
                  }}
                  aria-label={isFound ? `Tap ${char.name} for a music fact` : 'A hidden friend - tap to reveal!'}
                >
                  <motion.img
                    src={char.image}
                    alt={isFound ? char.name : 'Hidden friend'}
                    className="w-full h-auto object-contain"
                    draggable={false}
                    animate={
                      isPopping
                        ? { scale: [1, 1.5, 1.2, 1], rotate: [0, -10, 10, 0] }
                        : (ANIM_VARIANTS[char.anim] || ANIM_VARIANTS.bob)
                    }
                    transition={
                      isPopping
                        ? { duration: 0.6, ease: 'easeOut' }
                        : { duration: 2 + i * 0.25, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }
                    }
                  />
                  {/* Sparkle pop on first reveal */}
                  {isPopping && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      initial={{ opacity: 1, scale: 0.4 }}
                      animate={{ opacity: 0, scale: 2.2 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Sparkles className="w-10 h-10" style={{ color: '#FFDD57' }} />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        <p className="mt-3 text-xs md:text-sm font-bold opacity-85 text-center px-3" style={{ color: '#FFE9C4' }}>
          <span className="block sm:hidden mt-1 italic">← swipe to explore the clubhouse →</span>
          <span className="hidden sm:block">Each glowing shadow is a friend hiding. Tap to reveal them!</span>
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
