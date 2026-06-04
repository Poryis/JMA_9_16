// Sight-Reading Sprint — kid reads a short solfege sequence shown on a
// colored staff, then plays it back on the bells before the timer runs out.
//
// 3 difficulties:
//   Cadet  → 3 notes, 20 s timer, low bells only (no High C)
//   Pro    → 4 notes, 18 s timer, low bells only
//   Master → 5 notes, 16 s timer, full 8-bell range
//
// Earns Music Scholar (theory) achievements — same domain as the video
// lessons, since this proves reading-the-notation skill.

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, RotateCcw, Trophy, Play, Sparkles, Volume2 } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import { FullscreenButton } from '../components/FullscreenButton';
import Confetti from '../components/Confetti';
import RoomCharacters from '../components/RoomCharacters';
import SolfegeStaff from '../components/SolfegeStaff';
import { BELLS, JellyBellsRow } from '../components/JellyBells';
import useAudio from '../hooks/useAudio';
import { earnAchievement, earnAchievementUpTo } from '../hooks/useStickers';

const LOW_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const ALL_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'High C'];

const LEVELS = {
  cadet:  { name: 'Cadet',  length: 3, secs: 20, pool: LOW_NOTES, description: '3 notes · 20s', tier: 'cadet' },
  pro:    { name: 'Pro',    length: 4, secs: 18, pool: LOW_NOTES, description: '4 notes · 18s', tier: 'pro' },
  master: { name: 'Master', length: 5, secs: 16, pool: ALL_NOTES, description: '5 notes · 16s', tier: 'master' },
};

const BEST_KEY = 'jma_sight_reading_best_v1';
const loadBest = () => { try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}'); } catch { return {}; } };
const saveBest = (b) => { try { localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch { /* ignore */ } };

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function buildSequence(level) {
  // Pick `length` notes — avoid back-to-back duplicates so the kid sees motion
  const out = [];
  while (out.length < level.length) {
    const n = rand(level.pool);
    if (out.length > 0 && out[out.length - 1] === n) continue;
    out.push(n);
  }
  return out;
}

export default function SightReadingPage() {
  const navigate = useNavigate();
  const { playBellNote, playFeedbackSound, initAudioContext } = useAudio();
  const bellsRowRef = useRef(null);

  const [gameState, setGameState] = useState('menu'); // menu | demo | playing | win | timeout
  const [difficulty, setDifficulty] = useState('cadet');
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrongAt, setWrongAt] = useState(-1);
  const [doneIndices, setDoneIndices] = useState(new Set());
  const [secsLeft, setSecsLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [bestRecords, setBestRecords] = useState(loadBest);
  const [isNewBest, setIsNewBest] = useState(false);

  const tickRef = useRef(null);
  const demoTimerRef = useRef(null);

  const level = LEVELS[difficulty];

  // Cleanup any timers on unmount
  useEffect(() => () => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
  }, []);

  const stopTimers = useCallback(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    if (demoTimerRef.current) { clearTimeout(demoTimerRef.current); demoTimerRef.current = null; }
  }, []);

  // Auto-play the sequence so kids hear what they're aiming for once
  const playDemo = useCallback((seq) => {
    let i = 0;
    const tick = () => {
      if (i >= seq.length) {
        // Demo done — start the timer
        setGameState('playing');
        setSecsLeft(LEVELS[difficulty].secs);
        tickRef.current = setInterval(() => {
          setSecsLeft((s) => {
            if (s <= 1) {
              clearInterval(tickRef.current);
              tickRef.current = null;
              setGameState('timeout');
              try { playFeedbackSound('miss'); } catch { /* ignore */ }
              return 0;
            }
            return s - 1;
          });
        }, 1000);
        return;
      }
      const note = seq[i];
      try { bellsRowRef.current?.flashNote(note, 380); } catch { /* ignore */ }
      try { playBellNote(note); } catch { /* ignore */ }
      i += 1;
      demoTimerRef.current = setTimeout(tick, 520);
    };
    tick();
  }, [playBellNote, playFeedbackSound, difficulty]);

  const startGame = useCallback((diffOverride) => {
    initAudioContext();
    stopTimers();
    const diff = typeof diffOverride === 'string' ? diffOverride : difficulty;
    const lvl = LEVELS[diff];
    const seq = buildSequence(lvl);
    setDifficulty(diff);
    setSequence(seq);
    setCurrentIndex(0);
    setWrongAt(-1);
    setDoneIndices(new Set());
    setScore(0);
    setIsNewBest(false);
    setSecsLeft(lvl.secs);
    setGameState('demo');
    // Demo runs ~520ms per note, then transitions to "playing"
    demoTimerRef.current = setTimeout(() => playDemo(seq), 500);
  }, [initAudioContext, stopTimers, difficulty, playDemo]);

  const handleBellTap = useCallback((note) => {
    // Always play the bell sound when tapped — kids should hear feedback even
    // if their tap was wrong, and the audio reinforces which bell they hit.
    try { playBellNote(note); } catch { /* ignore */ }
    if (gameState !== 'playing') return;
    if (currentIndex >= sequence.length) return;
    const target = sequence[currentIndex];
    if (note === target) {
      // Correct
      const nextIndex = currentIndex + 1;
      setDoneIndices((prev) => {
        const n = new Set(prev);
        n.add(currentIndex);
        return n;
      });
      setCurrentIndex(nextIndex);
      setScore((s) => s + 10);
      if (nextIndex >= sequence.length) {
        // Win!
        stopTimers();
        const remainingSecs = secsLeft;
        const timeBonus = remainingSecs * 5;
        setScore((s) => s + timeBonus + 30); // +30 completion bonus
        const finalScore = score + 10 + timeBonus + 30;
        const prev = bestRecords[difficulty] || 0;
        if (finalScore > prev) {
          const next = { ...bestRecords, [difficulty]: finalScore };
          saveBest(next);
          setBestRecords(next);
          setIsNewBest(true);
        }
        // 📖 Music Scholar achievement
        try {
          if (difficulty === 'cadet')  earnAchievement('scholar', 'cadet');
          if (difficulty === 'pro')    earnAchievementUpTo('scholar', 'pro');
          if (difficulty === 'master') earnAchievementUpTo('scholar', 'master');
        } catch { /* ignore */ }
        try { playFeedbackSound('perfect'); } catch { /* ignore */ }
        setGameState('win');
      }
    } else {
      // Wrong — small flash, deduct, no penalty advance
      setWrongAt(currentIndex);
      try { playFeedbackSound('miss'); } catch { /* ignore */ }
      setScore((s) => Math.max(0, s - 5));
      setTimeout(() => setWrongAt(-1), 500);
    }
  }, [gameState, currentIndex, sequence, secsLeft, score, bestRecords, difficulty, playBellNote, playFeedbackSound, stopTimers]);

  // Replay the demo from anywhere in playing state (kids can hear it again)
  const replayDemo = useCallback(() => {
    if (gameState !== 'playing') return;
    // Pause the timer for the duration of the demo (rough — keep simple)
    stopTimers();
    setGameState('demo');
    setCurrentIndex(0);
    setDoneIndices(new Set());
    demoTimerRef.current = setTimeout(() => playDemo(sequence), 250);
  }, [gameState, stopTimers, playDemo, sequence]);

  // ===== MENU =====
  if (gameState === 'menu') {
    return (
      <div
        data-testid="sight-reading-menu"
        className="min-h-screen flex flex-col items-center justify-center p-4 relative"
        style={{
          backgroundImage: 'url(assets/backgrounds/clubhouse.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <GameHeader showHomeButton={true} />
        <FullscreenButton />
        <RoomCharacters room="sight-reading" />

        <motion.h1
          className="text-3xl md:text-5xl font-black mb-2 text-center font-display"
          style={{ color: 'white', textShadow: '3px 3px 0 var(--jma-dark), 5px 5px 0 rgba(0,0,0,0.5)' }}
          initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        >
          Sight-Reading Sprint
        </motion.h1>
        <motion.p
          className="text-base md:text-lg font-bold mb-4 text-center"
          style={{ color: '#FFE9C4', textShadow: '1px 1px 0 rgba(0,0,0,0.55)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        >
          Read the staff. Play it back fast!
        </motion.p>

        <motion.div className="game-card p-5 mb-4 max-w-md text-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
          <BookOpen className="w-10 h-10 mx-auto mb-2" style={{ color: '#34A853' }} />
          <h2 className="text-xl font-bold mb-2 font-display">How to Play</h2>
          <p className="text-sm md:text-base" style={{ color: 'var(--jma-dark)' }}>
            1. The staff shows 3–5 solfège notes<br />
            2. You'll hear them once<br />
            3. Tap the bells in order before the timer runs out!<br />
            4. Faster finish = more points 🚀
          </p>
        </motion.div>

        <div className="grid gap-2 w-full max-w-md mb-2">
          {Object.entries(LEVELS).map(([key, lvl], idx) => (
            <motion.button
              key={key}
              data-testid={`sight-reading-difficulty-${key}`}
              className={`level-card p-3 text-left flex items-center justify-between ${difficulty === key ? 'ring-4 ring-[#34A853]' : ''}`}
              onClick={() => startGame(key)}
              initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            >
              <div>
                <h3 className="text-lg font-bold font-display">{lvl.name}</h3>
                <p className="text-xs opacity-60">{lvl.description}</p>
              </div>
              {bestRecords[key] != null && (
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold opacity-60">Best</div>
                  <div className="text-sm font-black" style={{ color: 'var(--jma-orange)' }}>
                    {bestRecords[key]} pts
                  </div>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // ===== DEMO / PLAYING / WIN / TIMEOUT =====
  return (
    <div
      data-testid="sight-reading-playing"
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: 'url(assets/backgrounds/clubhouse.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <GameHeader title={`Sight-Read · ${level.name}`} showHomeButton={true} />
      <RoomCharacters room="sight-reading" />

      <main className="flex-1 flex flex-col items-center pt-16 md:pt-20 pb-6 px-3">
        {/* HUD */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <div
            data-testid="sight-reading-time"
            className="px-3 py-1 rounded-full font-black text-sm border-2 flex items-center gap-1.5"
            style={{
              backgroundColor: gameState === 'playing' && secsLeft <= 5 ? '#FF3B30' : 'white',
              color: gameState === 'playing' && secsLeft <= 5 ? 'white' : 'var(--jma-dark)',
              borderColor: 'var(--jma-dark)',
            }}
          >
            <Clock className="w-4 h-4" /> {secsLeft}s
          </div>
          <div
            data-testid="sight-reading-score"
            className="px-3 py-1 rounded-full font-black text-sm border-2"
            style={{ backgroundColor: 'var(--jma-yellow)', color: 'var(--jma-dark)', borderColor: 'var(--jma-dark)' }}
          >
            {score} pts
          </div>
          <div
            data-testid="sight-reading-progress"
            className="px-3 py-1 rounded-full font-black text-sm border-2"
            style={{
              backgroundColor: doneIndices.size === sequence.length ? '#4CD964' : 'white',
              color: 'var(--jma-dark)',
              borderColor: 'var(--jma-dark)',
            }}
          >
            {doneIndices.size} / {sequence.length}
          </div>
        </div>

        {/* Phase banner */}
        <div
          data-testid="sight-reading-phase"
          className="inline-block px-3 py-1 rounded-full text-xs md:text-sm font-black border-2 mb-3"
          style={{
            backgroundColor: gameState === 'demo' ? '#34A853' : 'var(--jma-yellow)',
            color: gameState === 'demo' ? 'white' : 'var(--jma-dark)',
            borderColor: 'var(--jma-dark)',
          }}
        >
          {gameState === 'demo' && '🎧 Listen — the staff is playing for you'}
          {gameState === 'playing' && '🎹 Now you! Tap the bells in order'}
          {gameState === 'win' && '🎉 Perfect read!'}
          {gameState === 'timeout' && '⏰ Time! Try again — you got this'}
        </div>

        {/* Staff */}
        <SolfegeStaff
          sequence={sequence}
          currentIndex={gameState === 'playing' ? currentIndex : -1}
          wrongAt={wrongAt}
          doneIndices={doneIndices}
        />

        {/* Replay button during playing */}
        {gameState === 'playing' && (
          <button
            data-testid="sight-reading-replay-btn"
            onClick={replayDemo}
            className="mt-3 chunky-btn bg-[var(--jma-blue)] text-white px-3 py-1.5 text-sm flex items-center gap-1.5"
          >
            <Volume2 className="w-4 h-4" /> Hear Again
          </button>
        )}

        {/* Bells — wrapped in a light "music desk" panel so the colorful bells
            stand out against the dark wood background */}
        <div
          className="mt-5 w-full max-w-3xl rounded-2xl border-4 px-3 py-2"
          style={{
            borderColor: 'var(--jma-dark)',
            background: 'linear-gradient(180deg, rgba(255,251,238,0.92) 0%, rgba(255,244,214,0.92) 100%)',
            backdropFilter: 'blur(6px)',
            boxShadow: '0 6px 0 0 var(--jma-dark)',
          }}
        >
          <JellyBellsRow
            ref={bellsRowRef}
            onPlayNote={handleBellTap}
            onNoteUp={() => {}}
            showNotation={false}
            enableKeyboard={false}
          />
        </div>

        {/* Bottom controls */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <button
            data-testid="sight-reading-restart-btn"
            onClick={() => startGame(difficulty)}
            className="chunky-btn bg-[var(--jma-yellow)] text-[var(--jma-dark)] px-4 py-2 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Restart
          </button>
          <button
            data-testid="sight-reading-back-btn"
            onClick={() => { stopTimers(); setGameState('menu'); }}
            className="chunky-btn bg-white text-[var(--jma-dark)] px-4 py-2"
          >
            Change Level
          </button>
        </div>

        {/* WIN / TIMEOUT OVERLAY */}
        <AnimatePresence>
          {(gameState === 'win' || gameState === 'timeout') && (
            <motion.div
              data-testid={gameState === 'win' ? 'sight-reading-win' : 'sight-reading-timeout'}
              className="fixed inset-0 z-40 flex items-center justify-center p-4"
              style={{ backgroundColor: 'rgba(10,37,64,0.55)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              {gameState === 'win' && <Confetti count={48} size={420} mega={isNewBest} />}
              <motion.div
                className="bg-white rounded-3xl border-4 p-6 max-w-md w-full text-center"
                style={{ borderColor: 'var(--jma-dark)', boxShadow: '0 10px 0 0 var(--jma-dark)' }}
                initial={{ scale: 0.6, y: 30 }} animate={{ scale: 1, y: 0 }}
              >
                <div className="text-5xl mb-2">{gameState === 'win' ? (isNewBest ? '🏆' : '🎉') : '⏰'}</div>
                <h2 className="text-2xl md:text-3xl font-black font-display mb-1" style={{ color: 'var(--jma-dark)' }}>
                  {gameState === 'win' ? (isNewBest ? 'NEW BEST!' : 'Perfect Read!') : 'Time\'s Up!'}
                </h2>
                <p className="font-bold mb-3" style={{ color: 'var(--jma-dark)' }}>
                  {gameState === 'win'
                    ? `${score} points · ${sequence.length} notes nailed`
                    : `You got ${doneIndices.size} of ${sequence.length} notes — keep going!`}
                </p>
                {gameState === 'win' && (
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Trophy className="w-5 h-5" style={{ color: '#FFCC00' }} />
                    <span className="text-sm font-black uppercase" style={{ color: 'var(--jma-dark)' }}>
                      Best: {bestRecords[difficulty] || score} pts
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  <button
                    data-testid="sight-reading-win-again"
                    onClick={() => startGame(difficulty)}
                    className="chunky-btn bg-[var(--jma-green)] text-white px-4 py-2 flex items-center gap-1.5"
                  >
                    <Play className="w-4 h-4" /> Play Again
                  </button>
                  <button
                    data-testid="sight-reading-win-menu"
                    onClick={() => setGameState('menu')}
                    className="chunky-btn bg-[var(--jma-yellow)] text-[var(--jma-dark)] px-4 py-2"
                  >
                    Change Level
                  </button>
                  <button
                    data-testid="sight-reading-win-home"
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
