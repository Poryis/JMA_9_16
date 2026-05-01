import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Eye, RotateCcw } from 'lucide-react';
import { KazoosRow, KAZOOS } from '../components/Kazoos';
import { GameHeader, FeedbackPopup, ProgressBar } from '../components/GameUI';
import { FullscreenButton } from '../components/FullscreenButton';
import useAudio from '../hooks/useAudio';
import { earnSticker } from '../hooks/useStickers';

// Patterns for Stu Kazoo Says (progressively harder)
const PATTERNS = {
  1: ['C', 'E', 'G'],
  2: ['C', 'D', 'E', 'F'],
  3: ['G', 'E', 'C', 'E', 'G'],
  4: ['C', 'E', 'G', 'High C', 'G', 'E'],
  5: ['D', 'E', 'F', 'G', 'A', 'G', 'F'],
  6: ['C', 'D', 'E', 'F', 'G', 'F', 'E', 'D'],
  7: ['E', 'E', 'F', 'G', 'G', 'F', 'E', 'D', 'C'],
  8: ['C', 'C', 'G', 'G', 'A', 'A', 'G', 'F', 'F', 'E']
};

// Stew animation frames - cycles through 0,1,2,3,0 quickly on each note play
const STEW_FRAMES = [
  'assets/stew/stew-neutral.png',
  'assets/stew/stew-plays-1.png',
  'assets/stew/stew-plays-2.png',
  'assets/stew/stew-plays-3.png',
];

function SimonSaysPage({ score, setScore, gameStats, setGameStats, resetGame }) {
  const navigate = useNavigate();
  const { playKazooNote, playFeedbackSound, initAudioContext } = useAudio();

  const [gameState, setGameState] = useState('ready');
  const [level, setLevel] = useState(1);
  const [showingIndex, setShowingIndex] = useState(-1);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [highlightedNote, setHighlightedNote] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [message, setMessage] = useState('Watch and listen!');

  const timeoutRef = useRef(null);
  const bellsRowRef = useRef(null); // Imperative handle to flash kazoos instantly
  const stewFrameRefs = useRef([null, null, null, null]); // 4 stew frame <img> elements
  const stewTimerRef = useRef(null);
  const currentPattern = PATTERNS[level] || PATTERNS[8];

  // Cycles Stew through frames 1→2→3→0(neutral) using direct DOM swaps so it
  // works even when fired rapidly during Stu's demo phase. All 4 frames are
  // mounted simultaneously; we just toggle which one is `display: block`.
  const showStewFrame = useCallback((i) => {
    stewFrameRefs.current.forEach((el, idx) => {
      if (el) el.style.display = idx === i ? 'block' : 'none';
    });
  }, []);

  const cycleStew = useCallback(() => {
    if (stewTimerRef.current) {
      clearTimeout(stewTimerRef.current);
      stewTimerRef.current = null;
    }
    showStewFrame(1);
    stewTimerRef.current = setTimeout(() => {
      showStewFrame(2);
      stewTimerRef.current = setTimeout(() => {
        showStewFrame(3);
        stewTimerRef.current = setTimeout(() => {
          showStewFrame(0); // back to neutral
          stewTimerRef.current = null;
        }, 110);
      }, 110);
    }, 110);
  }, [showStewFrame]);

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (stewTimerRef.current) clearTimeout(stewTimerRef.current);
    };
  }, []);

  // Start the game
  const startGame = useCallback(() => {
    initAudioContext();
    resetGame();
    setLevel(1);
    setGameState('showing');
    setMessage('Watch and listen!');
    setShowingIndex(0);
  }, [initAudioContext, resetGame]);

  // Show pattern to player
  useEffect(() => {
    if (gameState !== 'showing') return;

    if (showingIndex >= currentPattern.length) {
      // Done showing, player's turn
      setGameState('playing');
      setMessage('Your turn! Repeat the pattern!');
      setPlayerIndex(0);
      setHighlightedNote(null);
      return;
    }

    const note = currentPattern[showingIndex];
    setHighlightedNote(note);
    playKazooNote(note);
    cycleStew();
    // Imperative visual swap for Stu's demo - bypasses React state delay
    if (bellsRowRef.current) bellsRowRef.current.flashNote(note, 500);

    timeoutRef.current = setTimeout(() => {
      setHighlightedNote(null);
      timeoutRef.current = setTimeout(() => {
        setShowingIndex(prev => prev + 1);
      }, 300);
    }, 500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [gameState, showingIndex, currentPattern, playKazooNote, cycleStew]);

  // Handle player input
  const handlePlayNote = useCallback((note) => {
    if (gameState !== 'playing') return;

    playKazooNote(note);
    cycleStew();
    setHighlightedNote(note);
    setTimeout(() => setHighlightedNote(null), 200);

    const expectedNote = currentPattern[playerIndex];

    if (note === expectedNote) {
      // Correct!
      const newIndex = playerIndex + 1;
      setPlayerIndex(newIndex);
      setScore(prev => prev + 10 * level);

      if (newIndex >= currentPattern.length) {
        // Level complete!
        setGameStats(prev => ({
          ...prev,
          perfect: prev.perfect + 1,
          streak: prev.streak + 1,
          maxStreak: Math.max(prev.maxStreak, prev.streak + 1)
        }));
        
        setFeedback('perfect');
        playFeedbackSound('perfect');
        setMessage('Great job!');
        setGameState('success');

        // Move to next level or finish
        timeoutRef.current = setTimeout(() => {
          // Sticker: completed a level — level 5+ earns Super Ear
          if (level >= 5) earnSticker('ach_simon_5');
          if (level >= 8) {
            earnSticker('fit_charlie_grad');
            setGameState('finished');
            navigate('/results');
          } else {
            setLevel(prev => prev + 1);
            setShowingIndex(0);
            setGameState('showing');
            setMessage('Watch and listen!');
          }
          setFeedback(null);
        }, 1500);
      }
    } else {
      // Wrong!
      setGameStats(prev => ({
        ...prev,
        miss: prev.miss + 1,
        streak: 0
      }));
      
      setFeedback('miss');
      playFeedbackSound('miss');
      setMessage('Oops! Try again!');
      setGameState('fail');

      // Retry same level
      timeoutRef.current = setTimeout(() => {
        setShowingIndex(0);
        setGameState('showing');
        setMessage('Watch and listen!');
        setFeedback(null);
      }, 1500);
    }
  }, [gameState, playerIndex, currentPattern, level, playKazooNote, cycleStew, playFeedbackSound, setScore, setGameStats, navigate]);

  // NOTE: Keyboard is handled inside <JellyBellsRow> itself (with imperative
  // visual swap + dedup of key-repeat). Adding another keydown listener here
  // would fire handlePlayNote twice per key, which broke the swap and scoring.

  // Ready screen
  if (gameState === 'ready') {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4" 
        data-testid="simon-says-menu"
        style={{
          backgroundImage: 'url(assets/backgrounds/underwater.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <GameHeader showHomeButton={true} />
        <FullscreenButton />

        <motion.h1
          className="text-3xl md:text-5xl font-black mb-4 text-center"
          style={{ color: 'var(--jma-dark)', fontFamily: "'Fredoka', cursive" }}
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Stu Kazoo Says
        </motion.h1>

        <motion.div
          className="game-card p-6 mb-8 max-w-md text-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Eye className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--jma-blue)' }} />
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Fredoka', cursive" }}>
            How to Play
          </h2>
          <p className="text-base" style={{ color: 'var(--jma-dark)' }}>
            1. Watch Stu play his kazoos<br />
            2. Listen to the melody<br />
            3. Play it back yourself!
          </p>
        </motion.div>

        <motion.button
          data-testid="start-simon-button"
          className="chunky-btn bg-[var(--jma-blue)] text-white px-8 py-4 flex items-center gap-3"
          onClick={startGame}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Play className="w-6 h-6" />
          <span className="text-xl font-bold">START!</span>
        </motion.button>

        {/* Stew on the menu - waving */}
        <motion.img
          src="assets/stew/stew-neutral.png"
          alt="Stew"
          className="mt-8 w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-xl"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: [0, -10, 0], opacity: 1 }}
          transition={{ y: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' }, opacity: { delay: 0.5 } }}
        />
      </div>
    );
  }

  // Game screen
  return (
    <div 
      className="min-h-screen flex flex-col" 
      data-testid="simon-says-playing"
      style={{
        backgroundImage: 'url(assets/backgrounds/underwater.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <GameHeader 
        title={`Level ${level}`}
        score={score}
        streak={gameStats.streak}
        showHomeButton={true}
      />

      {/* Progress */}
      <div className="fixed top-16 left-0 right-0 px-4 py-2 z-40">
        <ProgressBar 
          current={level} 
          total={8}
          color="var(--jma-purple)"
        />
      </div>

      {/* Feedback popup */}
      <AnimatePresence>
        {feedback && (
          <FeedbackPopup feedback={feedback} onComplete={() => setFeedback(null)} />
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-8 px-4">
        {/* Message */}
        <motion.div
          key={message}
          className="game-card px-6 py-4 mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <p 
            className="text-xl md:text-2xl font-bold text-center"
            style={{ color: 'var(--jma-dark)', fontFamily: "'Fredoka', cursive" }}
          >
            {message}
          </p>
        </motion.div>

        {/* Pattern progress (during playing) */}
        {gameState === 'playing' && (
          <div className="flex gap-2 mb-6">
            {currentPattern.map((note, idx) => {
              const kazoo = KAZOOS.find(k => k.note === note);
              const isCompleted = idx < playerIndex;
              const isCurrent = idx === playerIndex;
              
              return (
                <motion.div
                  key={idx}
                  className={`w-8 h-8 rounded-full border-3 border-[var(--jma-dark)] ${
                    isCompleted ? '' : 'opacity-30'
                  } ${isCurrent ? 'ring-4 ring-[var(--jma-yellow)]' : ''}`}
                  style={{ backgroundColor: kazoo?.color }}
                  animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                />
              );
            })}
          </div>
        )}

        {/* Stew - cycles through frames each time a kazoo plays.
            All 4 frames are mounted at once; we toggle `display` directly via
            refs so swaps fire instantly without React render delay. */}
        <div
          data-testid="stew-mascot"
          className="relative w-32 h-32 md:w-44 md:h-44 mb-2"
        >
          {STEW_FRAMES.map((src, idx) => (
            <img
              key={idx}
              ref={(el) => { stewFrameRefs.current[idx] = el; }}
              src={src}
              alt={idx === 0 ? 'Stew' : ''}
              draggable={false}
              className="absolute inset-0 w-full h-full object-contain drop-shadow-xl pointer-events-none"
              style={{ display: idx === 0 ? 'block' : 'none' }}
            />
          ))}
        </div>
        <motion.div
          className="game-board p-4 md:p-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <KazoosRow 
            ref={bellsRowRef}
            onPlayNote={handlePlayNote}
            onNoteUp={() => {}}
            highlightedNote={highlightedNote}
          />
        </motion.div>

        {/* Hint for showing phase */}
        {gameState === 'showing' && (
          <motion.p
            className="mt-6 text-lg font-bold opacity-70"
            style={{ color: 'var(--jma-dark)' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            Stu is playing note {showingIndex + 1} of {currentPattern.length}...
          </motion.p>
        )}
      </main>
    </div>
  );
}

export default SimonSaysPage;
