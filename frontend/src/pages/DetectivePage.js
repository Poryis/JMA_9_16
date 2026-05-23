// Detective Dr. Jellybone — Find the Wrong Note
// A familiar melody plays with exactly ONE wrong note. Kid identifies which
// beat sounded off. Three difficulty tiers, 3-strike lives, sticker rewards.

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, Volume2, Trophy, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import { FullscreenButton } from '../components/FullscreenButton';
import Confetti from '../components/Confetti';
import RoomCharacters from '../components/RoomCharacters';
import { BELLS } from '../components/JellyBells';
import { DETECTIVE_TUNES, SCALE_ORDER } from '../data/detectiveMelodies';
import useAudio from '../hooks/useAudio';
import { earnSticker } from '../hooks/useStickers';

const BELL_BY_NOTE = Object.fromEntries(BELLS.map(b => [b.note, b]));

const LEVELS = {
  easy:   { name: 'Rookie',    description: 'Big mistakes, short tunes', noteMs: 650, swapMin: 3, swapMax: 4, melodyLevel: 'easy',   sticker: 'detective_rookie' },
  medium: { name: 'Detective', description: 'Trickier, medium tunes',    noteMs: 520, swapMin: 2, swapMax: 3, melodyLevel: 'medium', sticker: 'detective_sleuth' },
  hard:   { name: 'Master',    description: 'Sneaky, long tunes',         noteMs: 420, swapMin: 1, swapMax: 2, melodyLevel: 'hard',   sticker: 'detective_master' },
};

const STARTING_LIVES = 3;
const ROUNDS_PER_RUN = 5;
const BEST_KEY = 'jma_detective_best_v1';
const loadBest = () => { try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}'); } catch { return {}; } };
const saveBest = (b) => { try { localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch { /* ignore */ } };

// Pick a random "wrong" note that is `swapSteps` away in the scale from `original`.
function pickWrongNote(original, swapMin, swapMax) {
  const idx = SCALE_ORDER.indexOf(original);
  if (idx < 0) return original;
  // Candidate notes whose scale-distance from original is within [swapMin, swapMax].
  const candidates = SCALE_ORDER
    .map((n, i) => ({ n, d: Math.abs(i - idx) }))
    .filter(c => c.n !== original && c.d >= swapMin && c.d <= swapMax)
    .map(c => c.n);
  if (!candidates.length) {
    // Fallback: any other note
    return SCALE_ORDER.filter(n => n !== original)[0];
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function pickTune(level) {
  const pool = DETECTIVE_TUNES.filter(t => t.level === level);
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildRound(levelKey) {
  const lvl = LEVELS[levelKey];
  const tune = pickTune(lvl.melodyLevel);
  // Pick a random index to corrupt (avoid the very first note so kids have a reference).
  const wrongIndex = 1 + Math.floor(Math.random() * (tune.notes.length - 1));
  const original = tune.notes[wrongIndex];
  const wrong = pickWrongNote(original, lvl.swapMin, lvl.swapMax);
  const corrupted = tune.notes.map((n, i) => (i === wrongIndex ? wrong : n));
  return { tune, wrongIndex, original, wrong, corrupted };
}

export default function DetectivePage() {
  const navigate = useNavigate();
  const { playBellNote, initAudioContext, playFeedbackSound } = useAudio();

  const [gameState, setGameState] = useState('menu'); // menu | playing | gameover | win
  const [difficulty, setDifficulty] = useState('easy');
  const [round, setRound] = useState(null);          // current round data
  const [roundNum, setRoundNum] = useState(1);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [bestRecords, setBestRecords] = useState(loadBest);

  const [playbackIdx, setPlaybackIdx] = useState(-1); // which note is "lit" during playback
  const [phase, setPhase] = useState('listen');        // listen | guess | reveal
  const [guessIdx, setGuessIdx] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const playbackTimerRef = useRef(null);
  const cancelPlaybackRef = useRef(false);

  // ------- Cleanup playback on unmount or state change -------
  useEffect(() => () => {
    cancelPlaybackRef.current = true;
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
  }, []);

  // ------- Playback driver -------
  const playMelody = useCallback((roundData) => {
    if (!roundData) return;
    cancelPlaybackRef.current = false;
    setPhase('listen');
    setPlaybackIdx(-1);

    const lvl = LEVELS[difficulty];
    const noteMs = lvl.noteMs;
    let i = 0;

    const tick = () => {
      if (cancelPlaybackRef.current) return;
      if (i >= roundData.corrupted.length) {
        setPlaybackIdx(-1);
        setPhase('guess');
        return;
      }
      const note = roundData.corrupted[i];
      setPlaybackIdx(i);
      playBellNote(note);
      i += 1;
      playbackTimerRef.current = setTimeout(tick, noteMs);
    };

    tick();
  }, [difficulty, playBellNote]);

  // ------- Round / game lifecycle -------
  const startGame = useCallback((diffOverride) => {
    initAudioContext();
    cancelPlaybackRef.current = true;
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    const diff = typeof diffOverride === 'string' ? diffOverride : difficulty;
    setDifficulty(diff);
    setLives(STARTING_LIVES);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setRoundNum(1);
    setGuessIdx(null);
    setIsCorrect(null);
    const r = buildRound(diff);
    setRound(r);
    setGameState('playing');
    // Tiny delay so the page renders before audio
    setTimeout(() => playMelody(r), 350);
  }, [initAudioContext, difficulty, playMelody]);

  const handleGuess = useCallback((idx) => {
    if (phase !== 'guess' || round == null || guessIdx != null) return;
    const correct = idx === round.wrongIndex;
    setGuessIdx(idx);
    setIsCorrect(correct);
    setPhase('reveal');

    if (correct) {
      const bonus = 20 + Math.max(0, (round.tune.notes.length - 5)) * 2;
      const newStreak = streak + 1;
      const streakBonus = newStreak >= 3 ? 10 : 0;
      const total = bonus + streakBonus;
      setScore((s) => s + total);
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      playFeedbackSound('perfect');
    } else {
      setLives((l) => l - 1);
      setStreak(0);
      playFeedbackSound('error');
    }
  }, [phase, round, guessIdx, streak, playFeedbackSound]);

  // Auto-advance from reveal to next round (or game over)
  const advance = useCallback(() => {
    if (lives <= 0) {
      // Save best + sticker + transition to game over
      const lvl = LEVELS[difficulty];
      const prev = bestRecords[difficulty] || { score: 0, streak: 0 };
      const next = { ...bestRecords, [difficulty]: { score: Math.max(prev.score, score), streak: Math.max(prev.streak, bestStreak) } };
      saveBest(next);
      setBestRecords(next);
      if (score > 0) {
        try { earnSticker(lvl.sticker); } catch { /* ignore */ }
      }
      setGameState('gameover');
      return;
    }
    if (roundNum >= ROUNDS_PER_RUN) {
      // Run cleared!
      const lvl = LEVELS[difficulty];
      const prev = bestRecords[difficulty] || { score: 0, streak: 0 };
      const next = { ...bestRecords, [difficulty]: { score: Math.max(prev.score, score), streak: Math.max(prev.streak, bestStreak) } };
      saveBest(next);
      setBestRecords(next);
      try { earnSticker(lvl.sticker); } catch { /* ignore */ }
      if (bestStreak >= ROUNDS_PER_RUN) {
        try { earnSticker('detective_perfect'); } catch { /* ignore */ }
      }
      setGameState('win');
      return;
    }
    // Next round
    const r = buildRound(difficulty);
    setRound(r);
    setRoundNum((n) => n + 1);
    setGuessIdx(null);
    setIsCorrect(null);
    setTimeout(() => playMelody(r), 350);
  }, [lives, roundNum, difficulty, bestRecords, score, bestStreak, playMelody]);

  const replay = useCallback(() => {
    if (round && phase !== 'listen') playMelody(round);
  }, [round, phase, playMelody]);

  // ===== MENU =====
  if (gameState === 'menu') {
    return (
      <div
        data-testid="detective-menu"
        className="min-h-screen flex flex-col items-center justify-center p-4 relative"
        style={{
          backgroundImage: 'url(assets/backgrounds/clubhouse.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <GameHeader showHomeButton={true} />
        <FullscreenButton />
        <RoomCharacters room="detective" />

        <motion.div className="text-center mb-3" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1
            className="text-3xl md:text-5xl font-black font-display"
            style={{ color: 'white', textShadow: '3px 3px 0 var(--jma-dark), 5px 5px 0 rgba(0,0,0,0.5)' }}
          >
            Detective<br className="md:hidden" /> Dr. Jellybone
          </h1>
          <p className="text-sm md:text-base font-bold mt-1" style={{ color: '#FFE9C4', textShadow: '1px 1px 0 rgba(0,0,0,0.6)' }}>
            Find the wrong note!
          </p>
        </motion.div>

        <motion.div
          className="game-card p-5 mb-4 max-w-md text-center relative overflow-visible"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          {/* Animated magnifying glass icon */}
          <motion.div
            className="absolute -top-6 -right-4 z-10"
            animate={{ rotate: [-10, 10, -10], y: [0, -3, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              className="w-14 h-14 rounded-full border-3 flex items-center justify-center"
              style={{ backgroundColor: '#FFCC00', borderColor: 'var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)' }}
            >
              <Search className="w-7 h-7" style={{ color: 'var(--jma-dark)' }} />
            </div>
          </motion.div>

          <Sparkles className="w-9 h-9 mx-auto mb-1" style={{ color: 'var(--jma-purple)' }} />
          <h2 className="text-xl font-bold mb-2 font-display">How to Play</h2>
          <p className="text-sm md:text-base" style={{ color: 'var(--jma-dark)' }}>
            1. Listen carefully — a familiar tune plays<br />
            2. One note will sound <span className="font-black text-[var(--jma-red)]">off</span><br />
            3. Tap the beat where you heard the mistake<br />
            4. Three strikes and the case closes!
          </p>
        </motion.div>

        <div className="grid gap-2 w-full max-w-md">
          {Object.entries(LEVELS).map(([key, lvl], idx) => {
            const best = bestRecords[key];
            return (
              <motion.button
                key={key}
                data-testid={`detective-difficulty-${key}`}
                className={`level-card p-3 text-left flex items-center justify-between ${difficulty === key ? 'ring-4 ring-[var(--jma-purple)]' : ''}`}
                onClick={() => startGame(key)}
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.08 * idx }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div>
                  <h3 className="text-lg font-bold font-display">{lvl.name}</h3>
                  <p className="text-xs opacity-60">{lvl.description}</p>
                </div>
                {best && best.score > 0 && (
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold opacity-60">Best</div>
                    <div className="text-sm font-black" style={{ color: 'var(--jma-orange)' }}>
                      {best.score} pts
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // ===== PLAYING / WIN / GAMEOVER =====
  const tune = round?.tune;
  const corrupted = round?.corrupted || [];
  return (
    <div
      data-testid="detective-playing"
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: 'url(assets/backgrounds/clubhouse.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <GameHeader title={`Detective · ${LEVELS[difficulty].name}`} showHomeButton={true} />
      <RoomCharacters room="detective" />

      <main className="flex-1 flex flex-col items-center pt-16 md:pt-20 pb-6 px-3">
        {/* HUD */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <div
            data-testid="detective-round"
            className="px-3 py-1 rounded-full font-black text-sm border-2"
            style={{ backgroundColor: 'white', color: 'var(--jma-dark)', borderColor: 'var(--jma-dark)' }}
          >
            Case {roundNum} / {ROUNDS_PER_RUN}
          </div>
          <div
            data-testid="detective-score"
            className="px-3 py-1 rounded-full font-black text-sm border-2"
            style={{ backgroundColor: 'var(--jma-yellow)', color: 'var(--jma-dark)', borderColor: 'var(--jma-dark)' }}
          >
            {score} pts
          </div>
          {streak >= 2 && (
            <div
              data-testid="detective-streak"
              className="px-3 py-1 rounded-full font-black text-sm border-2 flex items-center gap-1"
              style={{ backgroundColor: 'var(--jma-orange)', color: 'white', borderColor: 'var(--jma-dark)' }}
            >
              🔥 {streak}
            </div>
          )}
          <div data-testid="detective-lives" className="flex items-center gap-1">
            {Array.from({ length: STARTING_LIVES }).map((_, i) => (
              <Heart
                key={i}
                className="w-6 h-6"
                style={{
                  color: i < lives ? '#FF3B30' : 'rgba(255,255,255,0.35)',
                  fill: i < lives ? '#FF3B30' : 'transparent',
                  strokeWidth: 2.5,
                }}
              />
            ))}
          </div>
        </div>

        {/* Tune card */}
        <motion.div
          key={tune?.id + String(roundNum)}
          className="game-card p-4 md:p-5 mb-4 max-w-2xl w-full text-center relative"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="text-xs uppercase font-black opacity-60" style={{ color: 'var(--jma-dark)' }}>
            Case file
          </div>
          <h2 className="text-xl md:text-2xl font-black font-display mb-2" style={{ color: 'var(--jma-dark)' }}>
            {tune?.name || '...'}
          </h2>

          {/* Beat slots */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 mt-3">
            {corrupted.map((note, i) => {
              const bell = BELL_BY_NOTE[note];
              const isLit = playbackIdx === i;
              const isGuessed = guessIdx === i;
              const isAnswer = phase === 'reveal' && i === round.wrongIndex;
              const showAnswer = phase === 'reveal';
              const slotColor = isAnswer
                ? (isCorrect && isGuessed ? '#34A853' : '#FF3B30')
                : (isGuessed && !isCorrect ? '#FF3B30' : 'white');

              return (
                <motion.button
                  key={i}
                  data-testid={`detective-slot-${i}`}
                  onClick={() => handleGuess(i)}
                  disabled={phase !== 'guess'}
                  className="relative rounded-xl border-3 flex flex-col items-center justify-center"
                  style={{
                    width: 'clamp(38px, 8vw, 56px)',
                    height: 'clamp(48px, 10vw, 70px)',
                    borderColor: 'var(--jma-dark)',
                    boxShadow: '0 3px 0 0 var(--jma-dark)',
                    backgroundColor: slotColor,
                    cursor: phase === 'guess' ? 'pointer' : 'default',
                    transform: isLit ? 'scale(1.18)' : 'scale(1)',
                    transition: 'transform 0.12s, background-color 0.2s',
                  }}
                  whileHover={phase === 'guess' ? { y: -3, boxShadow: '0 6px 0 0 var(--jma-dark)' } : {}}
                  whileTap={phase === 'guess' ? { y: 1 } : {}}
                  animate={isLit ? { backgroundColor: bell ? bell.color : '#FFCC00' } : {}}
                >
                  <span
                    className="text-xs md:text-sm font-black font-display leading-none"
                    style={{ color: isAnswer || (isGuessed && !isCorrect) ? 'white' : 'var(--jma-dark)' }}
                  >
                    {i + 1}
                  </span>
                  {showAnswer && isAnswer && bell && (
                    <span className="text-[8px] md:text-[10px] font-black mt-0.5" style={{ color: 'white' }}>
                      {bell.solfege}{note === 'High C' ? '↑' : ''}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Reveal info */}
          {phase === 'reveal' && round && (
            <motion.div
              data-testid="detective-reveal"
              className="mt-3"
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div
                className="inline-block px-3 py-1.5 rounded-full font-black text-xs md:text-sm border-2"
                style={{
                  backgroundColor: isCorrect ? '#34A853' : '#FF3B30',
                  color: 'white',
                  borderColor: 'var(--jma-dark)',
                  boxShadow: '0 3px 0 0 var(--jma-dark)',
                }}
              >
                {isCorrect
                  ? `🔍 Case solved! Beat ${round.wrongIndex + 1} should be ${BELL_BY_NOTE[round.original]?.solfege || round.original}`
                  : `Beat ${round.wrongIndex + 1} was off! Should be ${BELL_BY_NOTE[round.original]?.solfege || round.original}`
                }
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <button
                  data-testid="detective-next-btn"
                  onClick={advance}
                  className="chunky-btn bg-[var(--jma-yellow)] text-[var(--jma-dark)] px-4 py-2 flex items-center gap-2"
                >
                  {lives <= 0 || roundNum >= ROUNDS_PER_RUN ? 'See Results' : 'Next Case'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Replay during guess phase */}
          {phase === 'guess' && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <button
                data-testid="detective-replay-btn"
                onClick={replay}
                className="chunky-btn bg-[var(--jma-purple)] text-white px-4 py-2 flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" /> Play Again
              </button>
              <span className="text-xs font-bold opacity-60" style={{ color: 'var(--jma-dark)' }}>
                Tap the beat that sounded off
              </span>
            </div>
          )}

          {phase === 'listen' && (
            <p className="mt-3 text-sm font-bold opacity-70" style={{ color: 'var(--jma-dark)' }}>
              🎧 Listen carefully...
            </p>
          )}
        </motion.div>

        {/* Bottom controls */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            data-testid="detective-back-btn"
            onClick={() => setGameState('menu')}
            className="chunky-btn bg-white text-[var(--jma-dark)] px-3 py-1.5 text-sm"
          >
            Change Level
          </button>
        </div>

        {/* GAME OVER / WIN modal */}
        <AnimatePresence>
          {(gameState === 'gameover' || gameState === 'win') && (
            <motion.div
              data-testid={gameState === 'win' ? 'detective-win' : 'detective-gameover'}
              className="fixed inset-0 z-40 flex items-center justify-center p-4"
              style={{ backgroundColor: 'rgba(10,37,64,0.55)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              {gameState === 'win' && <Confetti count={48} size={420} mega={bestStreak >= ROUNDS_PER_RUN} />}
              <motion.div
                className="bg-white rounded-3xl border-4 p-6 max-w-md w-full text-center"
                style={{ borderColor: 'var(--jma-dark)', boxShadow: '0 10px 0 0 var(--jma-dark)' }}
                initial={{ scale: 0.6, y: 30 }} animate={{ scale: 1, y: 0 }}
              >
                <div className="text-5xl mb-2">{gameState === 'win' ? '🏆' : '🔍'}</div>
                <h2 className="text-2xl md:text-3xl font-black font-display mb-1" style={{ color: 'var(--jma-dark)' }}>
                  {gameState === 'win' ? 'Case File Closed!' : 'Case Re-opened'}
                </h2>
                <p className="font-bold mb-3" style={{ color: 'var(--jma-dark)' }}>
                  {gameState === 'win'
                    ? `You solved all ${ROUNDS_PER_RUN} cases!`
                    : 'Three strikes — the wrong notes got away!'}
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="bg-[var(--jma-yellow)] rounded-xl border-3 p-2" style={{ borderColor: 'var(--jma-dark)' }}>
                    <div className="text-[10px] uppercase font-black opacity-70">Score</div>
                    <div className="text-xl font-black">{score}</div>
                  </div>
                  <div className="bg-[var(--jma-orange)] rounded-xl border-3 p-2" style={{ borderColor: 'var(--jma-dark)', color: 'white' }}>
                    <div className="text-[10px] uppercase font-black opacity-80">Best Streak</div>
                    <div className="text-xl font-black">🔥 {bestStreak}</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Trophy className="w-5 h-5" style={{ color: '#FFCC00' }} />
                  <span className="text-sm font-black uppercase" style={{ color: 'var(--jma-dark)' }}>
                    Best Score: {(bestRecords[difficulty]?.score) || score}
                  </span>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    data-testid="detective-modal-again"
                    onClick={() => startGame(difficulty)}
                    className="chunky-btn bg-[var(--jma-green)] text-white px-4 py-2 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" /> Play Again
                  </button>
                  <button
                    data-testid="detective-modal-menu"
                    onClick={() => setGameState('menu')}
                    className="chunky-btn bg-[var(--jma-yellow)] text-[var(--jma-dark)] px-4 py-2"
                  >
                    Change Level
                  </button>
                  <button
                    data-testid="detective-modal-home"
                    onClick={() => navigate('/')}
                    className="chunky-btn bg-white text-[var(--jma-dark)] px-4 py-2"
                  >
                    Home
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
