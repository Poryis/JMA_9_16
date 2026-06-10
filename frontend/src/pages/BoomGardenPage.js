// Boom Garden — a rhythm-reading playground with three modes:
//   - Copy Cat   (echo): Doc claps a rhythm; kid taps it back.
//   - Twin Beats (match): Three patterns shown; kid picks the one they hear.
//   - Tap Trail  (read): A pattern is shown; kid reads it & taps in time.
//
// All modes use the same NOTE_DEFS + PATTERNS data, and the same Kodály
// counting syllables taught in Lesson 4 (Ta / Ti / Toe-ee / Toe-ee--O-ee).
//
// Audio: a snare hit on every tap and every demo note — kids hear identical
// percussion when watching the demo and when echoing it back.

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, RotateCcw, Sparkles } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import { FullscreenButton } from '../components/FullscreenButton';
import Confetti from '../components/Confetti';
import RhythmStrip from '../components/RhythmStrip';
import useAudio from '../hooks/useAudio';
import { earnAchievement, earnAchievementUpTo } from '../hooks/useStickers';
import {
  PATTERNS, DIFFICULTIES, NOTE_DEFS, BEAT_MS, patternBeats, noteStartTimes,
} from '../data/rhythms';

const MODES = [
  { id: 'copy',  label: 'Copy Cat',    blurb: 'Doc claps — you echo it back',     emoji: '🐱',  color: '#4285F4' },
  { id: 'match', label: 'Twin Beats',  blurb: 'Hear it. Pick the matching beat.', emoji: '👯',  color: '#34A853' },
  { id: 'trail', label: 'Tap Trail',   blurb: 'Read the rhythm. Tap it in time.', emoji: '🛤️', color: '#FF9500' },
];

// Pull a random pattern from the chosen difficulty bucket.
function randomPattern(level) {
  const pool = PATTERNS[level] || PATTERNS.cadet;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Pick 3 distinct patterns at the same difficulty for Twin Beats.
function threeDistinctPatterns(level) {
  const pool = [...(PATTERNS[level] || PATTERNS.cadet)];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}

// Big round tap button — the kid's single drum input.
function DrumTapButton({ onTap, disabled, label = 'TAP' }) {
  return (
    <motion.button
      data-testid="boom-tap-btn"
      type="button"
      onPointerDown={(e) => {
        if (disabled) return;
        e.preventDefault();
        try { e.target.setPointerCapture(e.pointerId); } catch (_) { /* noop */ }
        onTap();
      }}
      disabled={disabled}
      className="rounded-full border-4 select-none flex items-center justify-center font-black font-display"
      style={{
        width: 'clamp(110px, 28vw, 180px)',
        height: 'clamp(110px, 28vw, 180px)',
        backgroundColor: disabled ? '#9CA3AF' : '#FF3B30',
        borderColor: 'var(--jma-dark)',
        color: 'white',
        boxShadow: '0 8px 0 0 var(--jma-dark)',
        textShadow: '1px 1px 0 rgba(0,0,0,0.3)',
        fontSize: 'clamp(20px, 5vw, 32px)',
        touchAction: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
      }}
      whileTap={!disabled ? { y: 6, boxShadow: '0 2px 0 0 var(--jma-dark)' } : undefined}
    >
      {label}
    </motion.button>
  );
}

export default function BoomGardenPage() {
  const navigate = useNavigate();
  const { playDrumSound, initAudioContext } = useAudio();

  const [mode, setMode] = useState(null);              // null | 'copy' | 'match' | 'trail'
  const [level, setLevel] = useState('cadet');
  const [pattern, setPattern] = useState(null);        // current pattern (Copy Cat / Tap Trail)
  const [matchOptions, setMatchOptions] = useState([]); // 3 patterns for Twin Beats
  const [matchAnswer, setMatchAnswer] = useState(-1);   // index of correct answer
  const [phase, setPhase] = useState('idle');           // idle | demo | input | reveal | done
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [hitStates, setHitStates] = useState([]);       // per-note 'perfect' | 'miss' | undefined
  const [tapCount, setTapCount] = useState(0);          // for Copy Cat input
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Refs for scheduled timeouts so we can cancel cleanly.
  const timeoutsRef = useRef([]);
  const inputStartRef = useRef(0); // wall-clock ms when "your turn" began
  const expectedStartsRef = useRef([]);
  const patternRef = useRef(null);
  const tapResultsRef = useRef([]);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  // Cleanup on unmount.
  useEffect(() => clearTimeouts, [clearTimeouts]);

  const tapSound = useCallback(() => {
    initAudioContext();
    playDrumSound('snare');
  }, [initAudioContext, playDrumSound]);

  // Schedule a demo playback of the given pattern. For each non-rest note we
  // play a snare and highlight its block; rests just advance the playhead.
  // Returns total ms of the playback.
  const playPatternDemo = useCallback((pat) => {
    initAudioContext();
    clearTimeouts();
    const starts = noteStartTimes(pat, BEAT_MS);
    pat.forEach((key, i) => {
      const t = setTimeout(() => {
        setHighlightIndex(i);
        if (key !== 'rest') playDrumSound('snare');
      }, starts[i]);
      timeoutsRef.current.push(t);
    });
    const totalMs = patternBeats(pat) * BEAT_MS;
    const endT = setTimeout(() => setHighlightIndex(-1), totalMs);
    timeoutsRef.current.push(endT);
    return totalMs;
  }, [initAudioContext, clearTimeouts, playDrumSound]);

  // ---- COPY CAT MODE ----
  const startCopy = useCallback(() => {
    const pat = randomPattern(level);
    setPattern(pat);
    patternRef.current = pat;
    setHitStates([]);
    setHighlightIndex(-1);
    setTapCount(0);
    tapResultsRef.current = [];
    setPhase('demo');
    const demoMs = playPatternDemo(pat);
    // After demo + a 600ms pause, hand over to the kid.
    const handoff = setTimeout(() => {
      setPhase('input');
      inputStartRef.current = Date.now();
      expectedStartsRef.current = noteStartTimes(pat, BEAT_MS);
      // Auto-finish if kid doesn't finish in time (3x patternMs).
      const failsafe = setTimeout(() => {
        finishCopyRound();
      }, patternBeats(pat) * BEAT_MS * 3 + 2000);
      timeoutsRef.current.push(failsafe);
    }, demoMs + 600);
    timeoutsRef.current.push(handoff);
  }, [level, playPatternDemo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Finalize a Copy Cat round — assemble hit states from tapResultsRef and
  // award score / achievements.
  const finishCopyRound = useCallback(() => {
    clearTimeouts();
    const pat = patternRef.current || [];
    const results = tapResultsRef.current;
    // Non-rest notes are the ones we expect a tap on.
    const expectedTapIndices = pat.map((k, i) => (k === 'rest' ? null : i)).filter((x) => x !== null);
    const hits = pat.map((k) => (k === 'rest' ? undefined : 'miss'));
    let correct = 0;
    expectedTapIndices.forEach((idx, ord) => {
      const r = results[ord];
      if (r && r === 'perfect') {
        hits[idx] = 'perfect';
        correct += 1;
      }
    });
    setHitStates(hits);
    setHighlightIndex(-1);
    setPhase('reveal');
    const allHit = correct === expectedTapIndices.length;
    if (allHit) {
      setScore((s) => s + 100);
      setStreak((s) => s + 1);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1400);
      setFeedback({ tone: 'great', text: 'Nice copy!' });
      try {
        earnAchievement('rhythm', 'cadet');
        if (level === 'pro')    earnAchievementUpTo('rhythm', 'pro');
        if (level === 'master') earnAchievementUpTo('rhythm', 'master');
      } catch (_) { /* ignore */ }
    } else {
      setStreak(0);
      setFeedback({ tone: 'miss', text: 'Almost! Try again.' });
    }
    const next = setTimeout(() => {
      setFeedback(null);
      startCopy();
    }, 1800);
    timeoutsRef.current.push(next);
  }, [clearTimeouts, level, startCopy]);

  const handleCopyTap = useCallback(() => {
    if (phase !== 'input') return;
    tapSound();
    const tapTime = Date.now() - inputStartRef.current;
    const pat = patternRef.current || [];
    const expectedStarts = expectedStartsRef.current;
    const nonRestExpected = pat
      .map((k, i) => (k === 'rest' ? null : { i, time: expectedStarts[i] }))
      .filter((x) => x !== null);
    const ord = tapResultsRef.current.length;
    const target = nonRestExpected[ord];
    if (!target) return;
    const diff = Math.abs(tapTime - target.time);
    // Generous ±300 ms window for 5-year-olds. BEAT_MS is 750 ms so this is
    // ~40 % of a beat — forgiving but still requires sense of timing.
    const isPerfect = diff <= 300;
    tapResultsRef.current.push(isPerfect ? 'perfect' : 'miss');
    setTapCount((c) => c + 1);
    setHighlightIndex(target.i);
    if (tapResultsRef.current.length >= nonRestExpected.length) {
      // Small delay so the last highlight registers visually.
      const fin = setTimeout(finishCopyRound, 250);
      timeoutsRef.current.push(fin);
    }
  }, [phase, tapSound, finishCopyRound]);

  // ---- TWIN BEATS MODE ----
  const startMatch = useCallback(() => {
    const opts = threeDistinctPatterns(level);
    const answerIdx = Math.floor(Math.random() * opts.length);
    setMatchOptions(opts);
    setMatchAnswer(answerIdx);
    setHitStates([]);
    setHighlightIndex(-1);
    setPhase('demo');
    // Play the correct pattern's audio WITHOUT visual highlight on any strip
    // (so the kid has to use their ears).
    initAudioContext();
    clearTimeouts();
    const pat = opts[answerIdx];
    const starts = noteStartTimes(pat, BEAT_MS);
    pat.forEach((key, i) => {
      const t = setTimeout(() => {
        if (key !== 'rest') playDrumSound('snare');
      }, starts[i]);
      timeoutsRef.current.push(t);
    });
    const totalMs = patternBeats(pat) * BEAT_MS;
    const handoff = setTimeout(() => setPhase('input'), totalMs + 400);
    timeoutsRef.current.push(handoff);
  }, [level, initAudioContext, clearTimeouts, playDrumSound]);

  const handleMatchPick = useCallback((idx) => {
    if (phase !== 'input') return;
    tapSound();
    const correct = idx === matchAnswer;
    setPhase('reveal');
    if (correct) {
      setScore((s) => s + 100);
      setStreak((s) => s + 1);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1400);
      setFeedback({ tone: 'great', text: 'Sharp ears!' });
      try {
        earnAchievement('rhythm', 'cadet');
        if (level !== 'cadet') earnAchievementUpTo('rhythm', 'pro');
      } catch (_) { /* ignore */ }
    } else {
      setStreak(0);
      setFeedback({ tone: 'miss', text: `Not quite — option ${matchAnswer + 1} was right!` });
    }
    const next = setTimeout(() => {
      setFeedback(null);
      startMatch();
    }, 1900);
    timeoutsRef.current.push(next);
  }, [phase, tapSound, matchAnswer, level, startMatch]);

  // Replay the demo audio for Twin Beats (kid wants to hear it again).
  const replayMatch = useCallback(() => {
    if (phase !== 'input') return;
    initAudioContext();
    const pat = matchOptions[matchAnswer] || [];
    clearTimeouts();
    const starts = noteStartTimes(pat, BEAT_MS);
    pat.forEach((key, i) => {
      const t = setTimeout(() => {
        if (key !== 'rest') playDrumSound('snare');
      }, starts[i]);
      timeoutsRef.current.push(t);
    });
  }, [phase, matchOptions, matchAnswer, initAudioContext, clearTimeouts, playDrumSound]);

  // ---- TAP TRAIL MODE ----
  // Same scoring shape as Copy Cat, but NO demo — the kid has to read the
  // pattern and tap on the metronome beats. A click-track plays so they have
  // a steady pulse to follow.
  const startTrail = useCallback(() => {
    const pat = randomPattern(level);
    setPattern(pat);
    patternRef.current = pat;
    setHitStates([]);
    setHighlightIndex(-1);
    tapResultsRef.current = [];
    setPhase('input');
    inputStartRef.current = Date.now();
    expectedStartsRef.current = noteStartTimes(pat, BEAT_MS);
    initAudioContext();
    clearTimeouts();
    // Soft "tick" on every beat so the kid stays in tempo (low-volume hi-hat).
    const totalBeats = patternBeats(pat);
    for (let b = 0; b < totalBeats; b++) {
      const t = setTimeout(() => playDrumSound('hihat'), b * BEAT_MS);
      timeoutsRef.current.push(t);
    }
    // Visual playhead — light up each block as we pass through it.
    pat.forEach((key, i) => {
      const t = setTimeout(() => setHighlightIndex(i), expectedStartsRef.current[i]);
      timeoutsRef.current.push(t);
    });
    // After the pattern + a 700ms grace, finish.
    const fin = setTimeout(() => {
      setHighlightIndex(-1);
      finishCopyRound(); // reuse the same scoring logic
    }, totalBeats * BEAT_MS + 700);
    timeoutsRef.current.push(fin);
  }, [level, initAudioContext, clearTimeouts, playDrumSound, finishCopyRound]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tap handler for Tap Trail (same scoring as Copy Cat).
  const handleTrailTap = handleCopyTap;

  // Reset state when switching mode or level.
  const enterMode = useCallback((m) => {
    clearTimeouts();
    setMode(m);
    setScore(0);
    setStreak(0);
    setHitStates([]);
    setHighlightIndex(-1);
    setPhase('idle');
    setFeedback(null);
  }, [clearTimeouts]);

  const exitMode = useCallback(() => {
    clearTimeouts();
    setMode(null);
    setPhase('idle');
    setHighlightIndex(-1);
    setFeedback(null);
  }, [clearTimeouts]);

  const startCurrentRound = useCallback(() => {
    clearTimeouts();
    setHitStates([]);
    setHighlightIndex(-1);
    setFeedback(null);
    if (mode === 'copy')  startCopy();
    if (mode === 'match') startMatch();
    if (mode === 'trail') startTrail();
  }, [mode, startCopy, startMatch, startTrail, clearTimeouts]);

  // Auto-start the first round when a mode is selected.
  useEffect(() => {
    if (!mode) return;
    startCurrentRound();
  }, [mode, level]); // eslint-disable-line react-hooks/exhaustive-deps

  // -------------- RENDER --------------

  const modeConfig = useMemo(() => MODES.find((m) => m.id === mode), [mode]);

  // Mode picker screen.
  if (!mode) {
    return (
      <div
        data-testid="boom-garden-page"
        className="min-h-screen flex flex-col relative"
        style={{
          background: 'radial-gradient(circle at 20% 20%, #FFE0F0 0%, transparent 55%), radial-gradient(circle at 80% 70%, #C9F0E0 0%, transparent 60%), linear-gradient(180deg, #FFF7E5 0%, #FFE5C9 100%)',
        }}
      >
        <GameHeader title="Boom Garden" showHomeButton={true} />
        <FullscreenButton />
        <main className="flex-1 pt-20 md:pt-24 pb-6 px-4 max-w-5xl mx-auto w-full flex flex-col">
          <div className="text-center mb-4 md:mb-6">
            <p className="text-sm md:text-base font-bold opacity-80" style={{ color: 'var(--jma-dark)' }}>
              Three rhythm games. Pick your jam.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 flex-1">
            {MODES.map((m) => (
              <motion.button
                key={m.id}
                data-testid={`boom-mode-${m.id}`}
                type="button"
                onClick={() => enterMode(m.id)}
                className="rounded-3xl border-4 p-4 md:p-6 text-left flex flex-col gap-2 md:gap-3"
                style={{
                  backgroundColor: m.color,
                  borderColor: 'var(--jma-dark)',
                  color: 'white',
                  boxShadow: '0 8px 0 0 var(--jma-dark)',
                }}
                whileHover={{ y: -4, boxShadow: '0 12px 0 0 var(--jma-dark)' }}
                whileTap={{ y: 6, boxShadow: '0 2px 0 0 var(--jma-dark)' }}
              >
                <div className="text-4xl md:text-5xl leading-none">{m.emoji}</div>
                <div className="text-xl md:text-2xl font-black font-display leading-tight">{m.label}</div>
                <div className="text-xs md:text-sm font-bold opacity-95 leading-snug">{m.blurb}</div>
              </motion.button>
            ))}
          </div>
          {/* Difficulty selector — shared across all three modes. */}
          <div className="mt-5 md:mt-7">
            <div className="text-center text-[10px] md:text-xs uppercase font-black opacity-60 mb-2" style={{ color: 'var(--jma-dark)' }}>
              Difficulty
            </div>
            <div className="flex justify-center gap-2 md:gap-3 flex-wrap">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  data-testid={`boom-level-${d.id}`}
                  type="button"
                  onClick={() => setLevel(d.id)}
                  className="rounded-2xl border-3 px-3 md:px-4 py-2 font-black font-display text-sm md:text-base"
                  style={{
                    backgroundColor: level === d.id ? d.color : 'white',
                    color: level === d.id ? 'white' : 'var(--jma-dark)',
                    borderColor: 'var(--jma-dark)',
                    boxShadow: level === d.id ? '0 4px 0 0 var(--jma-dark)' : '0 2px 0 0 var(--jma-dark)',
                    transform: level === d.id ? 'translateY(-2px)' : 'none',
                    transition: 'transform 0.15s, background-color 0.15s, box-shadow 0.15s',
                  }}
                >
                  {d.label}
                  <div className="text-[9px] md:text-[10px] font-bold opacity-80 mt-0.5">{d.description}</div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Mode play screen.
  return (
    <div
      data-testid={`boom-mode-page-${mode}`}
      className="min-h-screen flex flex-col relative"
      style={{
        background: `radial-gradient(circle at 30% 20%, ${modeConfig.color}22 0%, transparent 55%), linear-gradient(180deg, #FFF7E5 0%, #FFE5C9 100%)`,
      }}
    >
      <GameHeader title={`Boom Garden · ${modeConfig.label}`} showHomeButton={true} score={score} streak={streak} />
      <FullscreenButton />
      <main className="flex-1 pt-20 md:pt-24 pb-4 px-3 md:px-6 max-w-4xl mx-auto w-full flex flex-col">
        {/* Back + replay row */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <button
            data-testid="boom-back-modes"
            type="button"
            onClick={exitMode}
            className="rounded-full border-3 px-3 py-1.5 flex items-center gap-1.5 bg-white text-sm font-black font-display"
            style={{ borderColor: 'var(--jma-dark)', color: 'var(--jma-dark)' }}
          >
            <ArrowLeft className="w-4 h-4" /> Modes
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] md:text-xs uppercase font-black opacity-60" style={{ color: 'var(--jma-dark)' }}>
              Level
            </span>
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                data-testid={`boom-play-level-${d.id}`}
                type="button"
                onClick={() => setLevel(d.id)}
                className="rounded-full border-2 px-2.5 py-1 text-xs font-black font-display"
                style={{
                  backgroundColor: level === d.id ? d.color : 'white',
                  color: level === d.id ? 'white' : 'var(--jma-dark)',
                  borderColor: 'var(--jma-dark)',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Phase banner */}
        <div className="text-center mb-3 md:mb-4">
          <div
            className="inline-block rounded-full border-3 px-4 py-1.5 font-black font-display text-sm md:text-base"
            style={{
              borderColor: 'var(--jma-dark)',
              backgroundColor: 'white',
              color: 'var(--jma-dark)',
              boxShadow: '0 3px 0 0 var(--jma-dark)',
            }}
            data-testid="boom-phase-banner"
          >
            {mode === 'copy'  && phase === 'demo'   && '👂 Listen carefully...'}
            {mode === 'copy'  && phase === 'input'  && '🥁 Your turn — copy it!'}
            {mode === 'copy'  && phase === 'reveal' && '✨ Round complete'}
            {mode === 'match' && phase === 'demo'   && '👂 Listen to this rhythm'}
            {mode === 'match' && phase === 'input'  && '🎯 Pick the match'}
            {mode === 'match' && phase === 'reveal' && '✨ Round complete'}
            {mode === 'trail' && phase === 'input'  && '📖 Read & tap the beats'}
            {mode === 'trail' && phase === 'reveal' && '✨ Round complete'}
          </div>
        </div>

        {/* Strip(s) */}
        <div className="flex flex-col items-stretch justify-center gap-3 md:gap-4 mb-3">
          {(mode === 'copy' || mode === 'trail') && pattern && (
            <RhythmStrip
              pattern={pattern}
              highlightIndex={highlightIndex}
              hitStates={hitStates}
              height={110}
            />
          )}
          {mode === 'match' && matchOptions.length === 3 && (
            <>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Volume2 className="w-4 h-4" style={{ color: 'var(--jma-dark)' }} />
                <span className="text-xs md:text-sm font-bold" style={{ color: 'var(--jma-dark)' }}>
                  {phase === 'demo' ? 'Listening...' : 'Tap the strip that matches what you heard'}
                </span>
                <button
                  data-testid="boom-match-replay"
                  type="button"
                  onClick={replayMatch}
                  disabled={phase !== 'input'}
                  className="ml-2 rounded-full border-2 px-2.5 py-0.5 text-[11px] font-black font-display flex items-center gap-1 disabled:opacity-40"
                  style={{ borderColor: 'var(--jma-dark)', color: 'var(--jma-dark)', backgroundColor: 'white' }}
                >
                  <RotateCcw className="w-3 h-3" /> Replay
                </button>
              </div>
              {matchOptions.map((p, idx) => (
                <RhythmStrip
                  key={idx}
                  pattern={p}
                  highlightIndex={phase === 'reveal' && idx === matchAnswer ? -2 : -1}
                  hitStates={
                    phase === 'reveal'
                      ? p.map(() => (idx === matchAnswer ? 'perfect' : undefined))
                      : null
                  }
                  height={72}
                  testIdPrefix={`match-${idx}-block`}
                  onBlockTap={phase === 'input' ? () => handleMatchPick(idx) : null}
                />
              ))}
            </>
          )}
        </div>

        {/* Drum tap button (Copy Cat + Tap Trail only) */}
        {(mode === 'copy' || mode === 'trail') && (
          <div className="flex justify-center items-center py-2">
            <DrumTapButton
              onTap={mode === 'copy' ? handleCopyTap : handleTrailTap}
              disabled={phase !== 'input'}
              label={phase === 'input' ? 'TAP!' : phase === 'demo' ? '...' : 'WAIT'}
            />
          </div>
        )}

        {/* Feedback toast */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              key={feedback.text}
              data-testid="boom-feedback"
              initial={{ y: 30, opacity: 0, scale: 0.8 }}
              animate={{ y: 0,  opacity: 1, scale: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="fixed left-1/2 -translate-x-1/2 bottom-6 rounded-2xl border-4 px-4 py-2 font-black font-display z-30"
              style={{
                borderColor: 'var(--jma-dark)',
                backgroundColor: feedback.tone === 'great' ? '#34A853' : '#FF3B30',
                color: 'white',
                boxShadow: '0 6px 0 0 var(--jma-dark)',
              }}
            >
              <div className="flex items-center gap-2">
                {feedback.tone === 'great' && <Sparkles className="w-5 h-5" />}
                <span>{feedback.text}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCelebration && (
            <motion.div
              className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <Confetti count={28} size={360} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
