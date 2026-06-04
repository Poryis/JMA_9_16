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
import { earnSticker, earnAchievement, earnAchievementUpTo } from '../hooks/useStickers';

const BELL_BY_NOTE = Object.fromEntries(BELLS.map(b => [b.note, b]));

const LEVELS = {
  easy:   { name: 'Rookie',    description: 'Big mistakes, short tunes', noteMs: 600, swapMin: 3, swapMax: 4, melodyLevel: 'easy',   sticker: 'detective_rookie' },
  medium: { name: 'Detective', description: 'Trickier, medium tunes',    noteMs: 500, swapMin: 2, swapMax: 3, melodyLevel: 'medium', sticker: 'detective_sleuth' },
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
  const candidates = SCALE_ORDER
    .map((n, i) => ({ n, d: Math.abs(i - idx) }))
    .filter(c => c.n !== original && c.d >= swapMin && c.d <= swapMax)
    .map(c => c.n);
  if (!candidates.length) return SCALE_ORDER.filter(n => n !== original)[0];
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function pickTune(level) {
  const pool = DETECTIVE_TUNES.filter(t => t.level === level);
  return pool[Math.floor(Math.random() * pool.length)];
}

// Build a round. `notes` may contain `null` rests — those preserve rhythm but
// are NOT corruptable and don't get clickable slots. Slots are indexed only
// across the non-rest entries.
function buildRound(levelKey) {
  const lvl = LEVELS[levelKey];
  const tune = pickTune(lvl.melodyLevel);

  // Map each note index to its slot number (or -1 for rests).
  const slotMap = [];
  let s = 0;
  tune.notes.forEach((n) => {
    if (n == null) { slotMap.push(-1); }
    else { slotMap.push(s); s += 1; }
  });

  // Non-rest indices into tune.notes
  const noteIndices = tune.notes.map((n, i) => (n == null ? -1 : i)).filter(i => i >= 0);
  // Avoid the very first note as the wrong one so kids have a reference.
  const corruptable = noteIndices.slice(1);
  const corruptIdx = corruptable[Math.floor(Math.random() * corruptable.length)];

  const original = tune.notes[corruptIdx];
  const wrong = pickWrongNote(original, lvl.swapMin, lvl.swapMax);
  const corrupted = tune.notes.map((n, i) => (i === corruptIdx ? wrong : n));

  return {
    tune,
    corruptIdx,        // index into tune.notes (with rests)
    correctSlot: slotMap[corruptIdx], // index into the slot row (without rests)
    original,
    wrong,
    corrupted,
    slotMap,
    totalSlots: s,
  };
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

  const [playbackIdx, setPlaybackIdx] = useState(-1); // index of currently-lit slot (or -1)
  const [phase, setPhase] = useState('listen_original'); // listen_original | gap | listen_corrupted | guess | reveal
  const [guessSlot, setGuessSlot] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const playbackTimerRef = useRef(null);
  const cancelPlaybackRef = useRef(false);

  // ------- Cleanup playback on unmount -------
  useEffect(() => () => {
    cancelPlaybackRef.current = true;
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
  }, []);

  // ------- Playback driver. `mode` = 'original' | 'corrupted' -------
  // Plays each note of the sequence at `noteMs` intervals, lighting up the
  // corresponding slot. `null` entries are rests (silent, slot-less).
  const playSequence = useCallback((roundData, mode, onDone) => {
    if (!roundData) return;
    const seq = mode === 'corrupted' ? roundData.corrupted : roundData.tune.notes;
    const lvl = LEVELS[difficulty];
    const noteMs = lvl.noteMs;

    cancelPlaybackRef.current = false;
    setPlaybackIdx(-1);

    let i = 0;
    const tick = () => {
      if (cancelPlaybackRef.current) return;
      if (i >= seq.length) {
        setPlaybackIdx(-1);
        if (onDone) onDone();
        return;
      }
      const note = seq[i];
      const slotIdx = roundData.slotMap[i];
      if (note != null) {
        setPlaybackIdx(slotIdx);
        playBellNote(note);
      } else {
        // Rest — clear the lit slot during silence
        setPlaybackIdx(-1);
      }
      i += 1;
      playbackTimerRef.current = setTimeout(tick, noteMs);
    };
    tick();
  }, [difficulty, playBellNote]);

  // Two-pass playback: original → gap → corrupted → guess phase
  const playRound = useCallback((roundData) => {
    if (!roundData) return;
    setPhase('listen_original');
    playSequence(roundData, 'original', () => {
      // Brief pause between original and corrupted versions
      setPhase('gap');
      playbackTimerRef.current = setTimeout(() => {
        setPhase('listen_corrupted');
        playSequence(roundData, 'corrupted', () => {
          setPhase('guess');
        });
      }, 700);
    });
  }, [playSequence]);

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
    setGuessSlot(null);
    setIsCorrect(null);
    const r = buildRound(diff);
    setRound(r);
    setGameState('playing');
    setTimeout(() => playRound(r), 350);
  }, [initAudioContext, difficulty, playRound]);

  const handleGuess = useCallback((slotNum) => {
    if (round == null || guessSlot != null) return;
    // Allow guess during the corrupted playback — but only for the currently-lit slot.
    // Tapping the lit chip immediately ends playback and submits the guess.
    if (phase === 'listen_corrupted') {
      if (slotNum !== playbackIdx) return;
      cancelPlaybackRef.current = true;
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    } else if (phase !== 'guess') {
      return;
    }
    const correct = slotNum === round.correctSlot;
    setGuessSlot(slotNum);
    setIsCorrect(correct);
    setPhase('reveal');

    if (correct) {
      const bonus = 20 + Math.max(0, (round.totalSlots - 5)) * 2;
      const newStreak = streak + 1;
      const streakBonus = newStreak >= 3 ? 10 : 0;
      const total = bonus + streakBonus;
      setScore((s) => s + total);
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      try { earnSticker('fit_doctor_detective'); } catch { /* ignore */ }
      // 🎧 Note Detective achievement — Cadet on first correct guess ever
      try { earnAchievement('ear', 'cadet'); } catch { /* ignore */ }
      playFeedbackSound('perfect');
    } else {
      setLives((l) => l - 1);
      setStreak(0);
      playFeedbackSound('error');
    }
  }, [phase, round, guessSlot, streak, playFeedbackSound, playbackIdx]);

  // Auto-advance from reveal to next round (or game over)
  const advance = useCallback(() => {
    if (lives <= 0) {
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
      const lvl = LEVELS[difficulty];
      const prev = bestRecords[difficulty] || { score: 0, streak: 0 };
      const next = { ...bestRecords, [difficulty]: { score: Math.max(prev.score, score), streak: Math.max(prev.streak, bestStreak) } };
      saveBest(next);
      setBestRecords(next);
      try { earnSticker(lvl.sticker); } catch { /* ignore */ }
      // 🎧 Note Detective achievement — completing the run on each difficulty
      // proves a tier of pitch-reading skill.
      try {
        if (difficulty === 'easy')   earnAchievement('ear', 'cadet');
        if (difficulty === 'medium') earnAchievementUpTo('ear', 'pro');
        if (difficulty === 'hard')   earnAchievementUpTo('ear', 'master');
      } catch { /* ignore */ }
      if (bestStreak >= ROUNDS_PER_RUN) {
        try { earnSticker('detective_perfect'); } catch { /* ignore */ }
      }
      setGameState('win');
      return;
    }
    const r = buildRound(difficulty);
    setRound(r);
    setRoundNum((n) => n + 1);
    setGuessSlot(null);
    setIsCorrect(null);
    setTimeout(() => playRound(r), 350);
  }, [lives, roundNum, difficulty, bestRecords, score, bestStreak, playRound]);

  // Re-listen handlers during guess phase
  const replayOriginal = useCallback(() => {
    if (!round || phase === 'listen_original' || phase === 'listen_corrupted') return;
    cancelPlaybackRef.current = true;
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    setPhase('listen_original');
    playSequence(round, 'original', () => setPhase('guess'));
  }, [round, phase, playSequence]);

  const replayCorrupted = useCallback(() => {
    if (!round || phase === 'listen_original' || phase === 'listen_corrupted') return;
    cancelPlaybackRef.current = true;
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    setPhase('listen_corrupted');
    playSequence(round, 'corrupted', () => setPhase('guess'));
  }, [round, phase, playSequence]);

  // ===== MENU =====
  if (gameState === 'menu') {
    return (
      <div
        data-testid="detective-menu"
        className="min-h-screen flex flex-col items-center justify-center p-4 relative"
        style={{
          backgroundImage: 'url(assets/backgrounds/detective-room.jpg)',
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
          {/* Detective Dr. Jellybone illustration */}
          <motion.img
            src="assets/characters/dr-jellybone-detective.png"
            alt="Detective Dr. Jellybone"
            className="absolute -top-12 -right-6 md:-top-16 md:-right-10 pointer-events-none select-none z-10"
            style={{ width: 'clamp(80px, 16vw, 130px)', filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.4))' }}
            animate={{ y: [0, -5, 0], rotate: [-3, 3, -3] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            draggable={false}
          />

          <Sparkles className="w-9 h-9 mx-auto mb-1" style={{ color: 'var(--jma-purple)' }} />
          <h2 className="text-xl font-bold mb-2 font-display">How to Play</h2>
          <p className="text-sm md:text-base" style={{ color: 'var(--jma-dark)' }}>
            1. Listen to the <span className="font-black text-[var(--jma-green)]">ORIGINAL</span> tune<br />
            2. Then hear the <span className="font-black text-[var(--jma-red)]">SUSPECT</span> — one note is off!<br />
            3. Tap the wrong note as you hear it, or wait until the end<br />
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
  return (
    <div
      data-testid="detective-playing"
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: 'url(assets/backgrounds/detective-room.jpg)',
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
          {/* Detective Dr. Jellybone peeks at the case file */}
          <motion.img
            src="assets/characters/dr-jellybone-detective.png"
            alt="Detective Dr. Jellybone"
            className="absolute -top-16 -left-2 md:-top-20 md:-left-6 pointer-events-none select-none"
            style={{ width: 'clamp(70px, 14vw, 130px)', filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.4))' }}
            animate={{ y: [0, -4, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            draggable={false}
          />

          <div className="text-xs uppercase font-black opacity-60" style={{ color: 'var(--jma-dark)' }}>
            Case file
          </div>
          <h2 className="text-xl md:text-2xl font-black font-display mb-1" style={{ color: 'var(--jma-dark)' }}>
            {tune?.name || '...'}
          </h2>

          {/* Phase label */}
          <div
            data-testid="detective-phase-label"
            className="inline-block px-3 py-1 rounded-full text-xs md:text-sm font-black border-2 mt-1"
            style={{
              backgroundColor:
                phase === 'listen_original' ? '#34A853' :
                phase === 'gap' ? 'rgba(255,255,255,0.85)' :
                phase === 'listen_corrupted' ? '#FF3B30' :
                phase === 'guess' ? 'var(--jma-yellow)' :
                'rgba(255,255,255,0.85)',
              color:
                phase === 'listen_original' || phase === 'listen_corrupted' ? 'white' : 'var(--jma-dark)',
              borderColor: 'var(--jma-dark)',
            }}
          >
            {phase === 'listen_original' && '🎵 Listen to the ORIGINAL tune'}
            {phase === 'gap' && '🤔 Now find what changed...'}
            {phase === 'listen_corrupted' && '🔍 Tap the wrong note the moment you hear it!'}
            {phase === 'guess' && '👇 Tap the note that sounded wrong'}
            {phase === 'reveal' && (isCorrect ? '🔍 Case solved!' : '😅 Try the next case!')}
          </div>

          {/* Beat slots — rests are skipped, slots are numbered only across real notes */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-2.5 mt-3">
            {round && tune?.notes.map((note, i) => {
              if (note == null) {
                // Rest — show a subtle dash, not a clickable slot
                return (
                  <div
                    key={`rest-${i}`}
                    className="flex items-center justify-center"
                    style={{
                      width: 'clamp(20px, 4vw, 28px)',
                      height: 'clamp(60px, 12vw, 86px)',
                      color: 'rgba(10,37,64,0.4)',
                      fontWeight: 900,
                      fontSize: '1.2rem',
                    }}
                    aria-hidden="true"
                  >
                    •
                  </div>
                );
              }
              const slotNum = round.slotMap[i];
              const bell = BELL_BY_NOTE[note];
              const isLit = playbackIdx === slotNum;
              const isGuessed = guessSlot === slotNum;
              const isAnswer = phase === 'reveal' && slotNum === round.correctSlot;
              const showAnswer = phase === 'reveal';
              const isWrongGuess = isGuessed && !isCorrect;
              const isCorrectAnswer = isAnswer && isCorrect && isGuessed;
              // A chip is tappable when:
              //   - It's the guess phase (any chip), OR
              //   - It's the corrupted playback phase AND this is the currently-lit chip
              //     (kids can buzz in the instant they hear the wrong note)
              const isTappable =
                phase === 'guess' || (phase === 'listen_corrupted' && isLit);
              // State-driven palette: lit (during playback) glows in the bell's color,
              // reveal-state goes hard green/red. Rest of the time the chip sits as a
              // cream "evidence card" pinned to the corkboard.
              const fillColor = isCorrectAnswer
                ? '#34A853'
                : isAnswer
                  ? '#FF3B30'
                  : isWrongGuess
                    ? '#FF3B30'
                    : isLit
                      ? (bell ? bell.color : '#FFCC00')
                      : '#FFF7E1';
              const labelColor = isCorrectAnswer || isAnswer || isWrongGuess || isLit
                ? 'white'
                : 'var(--jma-dark)';
              // Slight hand-pinned rotation per slot (deterministic, not random per render)
              const tilt = ((slotNum * 37) % 7) - 3; // -3..+3 deg

              return (
                <motion.button
                  key={`slot-${i}`}
                  data-testid={`detective-slot-${slotNum}`}
                  onClick={() => handleGuess(slotNum)}
                  disabled={!isTappable}
                  className="relative rounded-lg border-3 flex flex-col items-center justify-between overflow-hidden"
                  style={{
                    width: 'clamp(46px, 9vw, 64px)',
                    height: 'clamp(60px, 12vw, 86px)',
                    borderColor: 'var(--jma-dark)',
                    background: `linear-gradient(180deg, ${fillColor} 0%, ${fillColor} 55%, rgba(0,0,0,0.06) 100%)`,
                    boxShadow: isLit
                      ? `0 0 0 3px ${bell ? bell.color : '#FFCC00'}66, 0 6px 0 0 var(--jma-dark), 0 14px 22px rgba(0,0,0,0.28)`
                      : '0 4px 0 0 var(--jma-dark), 0 8px 14px rgba(0,0,0,0.18)',
                    cursor: isTappable ? 'pointer' : 'default',
                    transform: `rotate(${tilt}deg) scale(${isLit ? 1.14 : 1})`,
                    transformOrigin: 'center',
                    transition: 'transform 0.14s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.18s, box-shadow 0.18s',
                  }}
                  whileHover={isTappable ? { y: -4, scale: isLit ? 1.18 : 1.05, rotate: 0 } : {}}
                  whileTap={isTappable ? { y: 1, scale: isLit ? 1.08 : 0.98 } : {}}
                >
                  {/* Top tape strip — pinned-to-corkboard feel */}
                  <div
                    className="absolute top-0 left-0 right-0 flex items-center justify-center"
                    style={{
                      height: '14px',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 100%)',
                      borderBottom: '1px dashed rgba(10,37,64,0.18)',
                    }}
                  />
                  {/* Numbered evidence-tag badge */}
                  <span
                    className="mt-1.5 inline-flex items-center justify-center rounded-full border-2 text-[10px] md:text-xs font-black font-display leading-none"
                    style={{
                      width: '18px',
                      height: '18px',
                      backgroundColor: 'rgba(255,255,255,0.92)',
                      borderColor: 'var(--jma-dark)',
                      color: 'var(--jma-dark)',
                    }}
                  >
                    {slotNum + 1}
                  </span>
                  {/* Centered eighth-note glyph (or solfege when revealing the answer) */}
                  <div className="flex-1 flex items-center justify-center w-full">
                    {showAnswer && isAnswer && bell ? (
                      <span
                        className="text-xs md:text-sm font-black font-display"
                        style={{ color: labelColor, textShadow: '1px 1px 0 rgba(0,0,0,0.18)' }}
                      >
                        {bell.solfege}{note === 'High C' ? '↑' : ''}
                      </span>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke={labelColor}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ opacity: isLit || isAnswer || isWrongGuess ? 1 : 0.6 }}
                        aria-hidden="true"
                      >
                        <circle cx="6" cy="18" r="3" />
                        <path d="M9 18V4l10-1v13" />
                        <circle cx="16" cy="17" r="3" />
                      </svg>
                    )}
                  </div>
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
                  ? `🔍 Beat ${round.correctSlot + 1} was the wrong one — should be ${BELL_BY_NOTE[round.original]?.solfege || round.original}`
                  : `Beat ${round.correctSlot + 1} was off! Should be ${BELL_BY_NOTE[round.original]?.solfege || round.original}`
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

          {/* Replay buttons during guess phase */}
          {phase === 'guess' && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <button
                data-testid="detective-replay-original-btn"
                onClick={replayOriginal}
                className="chunky-btn bg-[var(--jma-green)] text-white px-3 py-1.5 text-sm flex items-center gap-1.5"
              >
                <Volume2 className="w-4 h-4" /> Hear Original
              </button>
              <button
                data-testid="detective-replay-suspect-btn"
                onClick={replayCorrupted}
                className="chunky-btn bg-[var(--jma-red)] text-white px-3 py-1.5 text-sm flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" /> Hear Suspect
              </button>
            </div>
          )}

          {(phase === 'listen_original' || phase === 'listen_corrupted' || phase === 'gap') && (
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
