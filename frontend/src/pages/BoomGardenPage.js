// Boom Garden — a rhythm-reading room with three modes:
//   - Copy Cat   (echo): Doc claps a rhythm; kid hits the snare to copy it.
//   - Twin Beats (match): Three patterns shown; kid picks the one they hear.
//   - Tap Trail  (read): Pattern is shown; kid reads + plays it in time.
//
// All three modes share a steady hi-hat click track so the kid always has a
// beat to lock into — and so audio-identical-without-metronome patterns like
// [rest, ta, ta, ta] vs [ta, ta, ta, rest] become audibly distinguishable
// (the click on the rest beat is no longer masked by a snare).
//
// Notation syllables match Lesson 4 exactly:
//   Whole = Toe-ee--O-ee · Half = Toe-ee · Quarter = Ta · Eighth = Ti

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, RotateCcw, Sparkles } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import { FullscreenButton } from '../components/FullscreenButton';
import Confetti from '../components/Confetti';
import RhythmStrip from '../components/RhythmStrip';
import ScrollingRhythmStrip from '../components/ScrollingRhythmStrip';
import StewDrummer from '../components/StewDrummer';
import BeatPulse from '../components/BeatPulse';
import useAudio from '../hooks/useAudio';
import { earnAchievement, earnAchievementUpTo } from '../hooks/useStickers';
import {
  PATTERNS, TRAIL_PATTERNS, DIFFICULTIES, BEAT_MS, TOLERANCE_MS,
  patternBeats, noteStartTimes,
} from '../data/rhythms';

// Per-mode card config — each tile mirrors the LearnMenuPage tile aesthetic
// (chunky border + sign nameplate + character peeking + tagline).
const MODES = [
  {
    id: 'copy',
    label: 'Copy Cat',
    blurb: 'Doc claps. You copy it back on the snare.',
    sign: 'COPY CAT',
    color: '#4285F4',
    accent: '#1A4FAB',
    bg: 'assets/backgrounds/recording-studio.jpg',
    character: 'assets/characters/dr-jellybone.png',
    charWidthPct: 36,
  },
  {
    id: 'match',
    label: 'Twin Beats',
    blurb: 'Hear the rhythm. Pick the matching beat.',
    sign: 'TWIN BEATS',
    color: '#34A853',
    accent: '#1F7A38',
    bg: 'assets/backgrounds/clubhouse.png',
    character: 'assets/characters/llama-lou-stew.png',
    charWidthPct: 40,
  },
  {
    id: 'trail',
    label: 'Tap Trail',
    blurb: 'Read the rhythm. Play it in time.',
    sign: 'TAP TRAIL',
    color: '#FF9500',
    accent: '#C26200',
    bg: 'assets/backgrounds/graffiti-wall.jpg',
    character: 'assets/characters/charlie-rundmc.png',
    charWidthPct: 32,
  },
];

const MODE_MAP = Object.fromEntries(MODES.map((m) => [m.id, m]));

function randomPattern(level, source = PATTERNS) {
  const pool = source[level] || source.cadet;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Pick 3 distinct patterns at the same difficulty for Twin Beats. With the
// shared click track running, even leading-vs-trailing-rest mirror patterns
// are audibly distinguishable, so we don't need to filter mirror pairs.
function threeDistinctPatterns(level) {
  const pool = [...(PATTERNS[level] || PATTERNS.cadet)];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}

// JMA-style mode-picker tile, modelled on SubMenuPage but triggers local
// state instead of navigating.
function ModeTile({ mode, index, onPick }) {
  return (
    <motion.button
      type="button"
      data-testid={`boom-mode-${mode.id}`}
      onClick={() => onPick(mode.id)}
      className="relative w-full text-left rounded-3xl border-4 overflow-hidden cursor-pointer"
      style={{
        borderColor: 'var(--jma-dark)',
        boxShadow: '0 8px 0 0 var(--jma-dark)',
        background: mode.color,
        minHeight: 'clamp(220px, 36vw, 280px)',
      }}
      initial={{ y: 40, opacity: 0, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={{ delay: 0.12 + index * 0.08, type: 'spring', stiffness: 220 }}
      whileHover={{ y: -6, boxShadow: '0 14px 0 0 var(--jma-dark)', scale: 1.01 }}
      whileTap={{ y: 3, boxShadow: '0 4px 0 0 var(--jma-dark)', scale: 0.985 }}
    >
      {/* Background scene */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${mode.bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Tint for legibility */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${mode.color}77 0%, ${mode.accent}33 55%, transparent 100%)`,
        }}
      />
      {/* Sign nameplate */}
      <div className="absolute top-3 left-3 z-10">
        <div
          className="px-3 py-1 rounded-full border-3 inline-block"
          style={{
            backgroundColor: 'white',
            borderColor: 'var(--jma-dark)',
            boxShadow: '0 3px 0 0 var(--jma-dark)',
          }}
        >
          <span
            className="text-[10px] md:text-xs font-black uppercase tracking-widest"
            style={{ color: mode.accent }}
          >
            {mode.sign}
          </span>
        </div>
      </div>
      {/* Title + tagline */}
      <div className="absolute left-4 md:left-5 bottom-3 md:bottom-4 right-[42%] z-10">
        <h2
          className="text-xl md:text-2xl font-black font-display leading-tight mb-1"
          style={{
            color: 'white',
            textShadow: '2px 2px 0 rgba(10,37,64,0.85), 4px 4px 0 rgba(10,37,64,0.35)',
          }}
        >
          {mode.label}
        </h2>
        <p
          className="text-xs md:text-sm font-bold leading-snug"
          style={{ color: 'white', textShadow: '1px 1px 0 rgba(10,37,64,0.7)' }}
        >
          {mode.blurb}
        </p>
      </div>
      {/* Character */}
      <motion.img
        src={mode.character}
        alt=""
        draggable={false}
        loading="lazy"
        className="absolute right-2 bottom-0 pointer-events-none select-none z-10"
        style={{
          width: `${mode.charWidthPct}%`,
          height: '92%',
          objectFit: 'contain',
          objectPosition: 'bottom right',
          filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.45))',
        }}
        animate={{ y: [0, -6, 0], rotate: 0 }}
        transition={{ y: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' } }}
      />
    </motion.button>
  );
}

export default function BoomGardenPage() {
  const { playDrumSound, initAudioContext } = useAudio();

  const [mode, setMode] = useState(null);
  const [level, setLevel] = useState('cadet');
  const [pattern, setPattern] = useState(null);
  const [matchOptions, setMatchOptions] = useState([]);
  const [matchAnswer, setMatchAnswer] = useState(-1);
  const [phase, setPhase] = useState('idle');       // idle | demo | input | reveal
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [hitStates, setHitStates] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Refs.
  const timeoutsRef = useRef([]);
  const inputStartRef = useRef(0);
  const expectedStartsRef = useRef([]);
  const patternRef = useRef(null);
  const claimedNotesRef = useRef(new Set());     // indices of notes a tap has been matched to
  const tapResultsRef = useRef({});               // index → 'perfect' | 'miss'
  const snareRef = useRef(null);
  // Wall-clock Date.now() of beat-0 of the click track currently running.
  // Drives the BeatPulse visual metronome so it stays in lock-step with the
  // hi-hat without any drift.
  const [metronomeStartMs, setMetronomeStartMs] = useState(0);
  const [metronomeRunning, setMetronomeRunning] = useState(false);
  // Round summary shown during reveal.
  const [roundSummary, setRoundSummary] = useState(null); // { correct, total }

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => clearTimeouts, [clearTimeouts]);

  // Schedule a steady hi-hat click on every beat for `beatCount` beats,
  // starting at `startDelayMs` from now. Also flips on the visual BeatPulse
  // metronome so the kid can SEE the tempo in addition to hearing it.
  const scheduleMetronome = useCallback((beatCount, startDelayMs = 0) => {
    initAudioContext();
    const startWall = Date.now() + startDelayMs;
    setMetronomeStartMs(startWall);
    setMetronomeRunning(true);
    for (let b = 0; b < beatCount; b++) {
      const t = setTimeout(() => playDrumSound('hihat'), startDelayMs + b * BEAT_MS);
      timeoutsRef.current.push(t);
    }
    // Stop the visual pulse a beat after the last audio click so the last
    // beat's flash doesn't get cut off.
    const stopT = setTimeout(() => setMetronomeRunning(false), startDelayMs + (beatCount + 0.5) * BEAT_MS);
    timeoutsRef.current.push(stopT);
    return beatCount * BEAT_MS;
  }, [initAudioContext, playDrumSound]);

  // Schedule a snare hit (with visual flash) on each non-rest note of the
  // pattern, optionally highlighting the corresponding strip block.
  const schedulePatternAudio = useCallback((pat, opts = {}) => {
    const { withHighlight = true, startDelayMs = 0 } = opts;
    const starts = noteStartTimes(pat, BEAT_MS);
    pat.forEach((key, i) => {
      const t = setTimeout(() => {
        if (withHighlight) setHighlightIndex(i);
        if (key !== 'rest') {
          playDrumSound('snare');
          // Flash the big snare drum if it's visible (Copy Cat / Tap Trail).
          snareRef.current?.flash(120);
        }
      }, startDelayMs + starts[i]);
      timeoutsRef.current.push(t);
    });
  }, [playDrumSound]);

  // ---- COPY CAT ----
  const finishCopyRound = useCallback(() => {
    clearTimeouts();
    const pat = patternRef.current || [];
    const results = tapResultsRef.current;
    const hits = pat.map((k, i) => {
      if (k === 'rest') return undefined;
      return results[i] || 'miss';
    });
    const expectedNonRest = pat.map((k, i) => (k === 'rest' ? null : i)).filter((x) => x !== null);
    const correct = expectedNonRest.filter((i) => results[i] === 'perfect').length;
    const total = expectedNonRest.length;
    setHitStates(hits);
    setHighlightIndex(-1);
    setMetronomeRunning(false);
    setPhase('reveal');
    setRoundSummary({ correct, total });
    const allHit = correct >= Math.max(1, Math.ceil(total * 0.8));
    if (allHit) {
      setScore((s) => s + 100);
      setStreak((s) => s + 1);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
      setFeedback({ tone: 'great', text: 'Nice rhythm!' });
      try {
        earnAchievement('rhythm', 'cadet');
        if (level === 'pro')    earnAchievementUpTo('rhythm', 'pro');
        if (level === 'master') earnAchievementUpTo('rhythm', 'master');
      } catch (_) { /* ignore */ }
    } else {
      setStreak(0);
      setFeedback({ tone: 'miss', text: 'Almost! Try again.' });
    }
    // Auto-advance after a longer reveal so the kid actually sees the
    // result. The "Play Again" button in the round-summary card lets them
    // skip ahead if they want to move faster.
    const next = setTimeout(() => {
      setFeedback(null);
      setRoundSummary(null);
      if (mode === 'copy')  startCopy();
      if (mode === 'trail') startTrail();
    }, 3000);
    timeoutsRef.current.push(next);
  }, [clearTimeouts, level, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const startCopy = useCallback(() => {
    const pat = randomPattern(level, PATTERNS);
    setPattern(pat);
    patternRef.current = pat;
    setHitStates([]);
    setHighlightIndex(-1);
    tapResultsRef.current = {};
    claimedNotesRef.current = new Set();
    setPhase('demo');
    initAudioContext();
    clearTimeouts();
    const totalBeats = patternBeats(pat);
    // Demo: click track + snare hits + visual playhead.
    scheduleMetronome(totalBeats, 0);
    schedulePatternAudio(pat, { withHighlight: true, startDelayMs: 0 });
    const demoMs = totalBeats * BEAT_MS;
    // 4-beat count-in BEFORE the kid's input opens — gives them a steady
    // pulse to anchor to so they're not guessing at the tempo cold.
    const countInDelay = demoMs + 600;
    const countInMs = 4 * BEAT_MS;
    const countIn = setTimeout(() => {
      setPhase('countin');
      setHighlightIndex(-1);
      scheduleMetronome(4, 0);
    }, countInDelay);
    timeoutsRef.current.push(countIn);
    // Input opens right after the count-in.
    const handoff = setTimeout(() => {
      setPhase('input');
      inputStartRef.current = Date.now();
      expectedStartsRef.current = noteStartTimes(pat, BEAT_MS);
      // Click continues UNDERNEATH the kid's tapping.
      scheduleMetronome(totalBeats, 0);
      const failsafe = setTimeout(finishCopyRound, totalBeats * BEAT_MS + 1200);
      timeoutsRef.current.push(failsafe);
    }, countInDelay + countInMs);
    timeoutsRef.current.push(handoff);
  }, [level, initAudioContext, clearTimeouts, scheduleMetronome, schedulePatternAudio, finishCopyRound]);

  // Unified tap handler used by both Copy Cat and Tap Trail. Forward-walking
  // sequential matching: a tap is scored against the FIRST unclaimed non-rest
  // note whose expected time is roughly "now or later" (current beat). Any
  // earlier unclaimed beats are auto-marked as MISS (the kid walked past
  // them). This is how a real teacher judges timing — you mark missed beats
  // and the next note is still the next note, regardless of which beat the
  // kid is on.
  const handleSnareTap = useCallback(() => {
    if (phase !== 'input') return;
    playDrumSound('snare');
    snareRef.current?.flash(100);
    const tapTime = Date.now() - inputStartRef.current;
    const pat = patternRef.current || [];
    const expectedStarts = expectedStartsRef.current;
    const claimed = claimedNotesRef.current;
    const tol = TOLERANCE_MS[level] ?? TOLERANCE_MS.cadet;
    // Forward walk: scan unclaimed notes in order; auto-miss any whose
    // expected time has already passed by more than `tol`, then score this
    // tap against the first beat that's still "current or upcoming".
    let targetIdx = -1;
    for (let i = 0; i < pat.length; i++) {
      if (pat[i] === 'rest' || claimed.has(i)) continue;
      if (expectedStarts[i] >= tapTime - tol) {
        targetIdx = i;
        break;
      }
      // Kid skipped past this beat.
      claimed.add(i);
      tapResultsRef.current[i] = 'miss';
    }
    if (targetIdx === -1) {
      // All notes have already passed — spurious tail tap. Ignore so we
      // don't double-claim or stutter the round.
      return;
    }
    const diff = Math.abs(tapTime - expectedStarts[targetIdx]);
    claimed.add(targetIdx);
    tapResultsRef.current[targetIdx] = diff <= tol ? 'perfect' : 'miss';
    setHighlightIndex(targetIdx);
    const allNonRest = pat.map((k, i) => (k === 'rest' ? null : i)).filter((x) => x !== null);
    if (allNonRest.every((i) => claimed.has(i))) {
      const fin = setTimeout(finishCopyRound, 280);
      timeoutsRef.current.push(fin);
    }
  }, [phase, level, playDrumSound, finishCopyRound]);

  // ---- TWIN BEATS ----
  const startMatch = useCallback(() => {
    const opts = threeDistinctPatterns(level);
    const answerIdx = Math.floor(Math.random() * opts.length);
    setMatchOptions(opts);
    setMatchAnswer(answerIdx);
    setHitStates([]);
    setHighlightIndex(-1);
    setRoundSummary(null);
    setPhase('demo');
    initAudioContext();
    clearTimeouts();
    const pat = opts[answerIdx];
    const totalBeats = patternBeats(pat);
    // Click track + Stew animating along + snare hits (no visual highlight
    // on the strips themselves — kid uses ears).
    scheduleMetronome(totalBeats, 0);
    schedulePatternAudio(pat, { withHighlight: false, startDelayMs: 0 });
    const handoff = setTimeout(() => setPhase('input'), totalBeats * BEAT_MS + 500);
    timeoutsRef.current.push(handoff);
  }, [level, initAudioContext, clearTimeouts, scheduleMetronome, schedulePatternAudio]);

  const handleMatchPick = useCallback((idx) => {
    if (phase !== 'input') return;
    playDrumSound('snare');
    snareRef.current?.flash(100);
    const correct = idx === matchAnswer;
    setPhase('reveal');
    setRoundSummary({ correct: correct ? 1 : 0, total: 1 });
    if (correct) {
      setScore((s) => s + 100);
      setStreak((s) => s + 1);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1800);
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
      setRoundSummary(null);
      startMatch();
    }, 3000);
    timeoutsRef.current.push(next);
  }, [phase, playDrumSound, matchAnswer, level, startMatch]);

  const replayMatch = useCallback(() => {
    if (phase !== 'input') return;
    initAudioContext();
    const pat = matchOptions[matchAnswer] || [];
    clearTimeouts();
    const totalBeats = patternBeats(pat);
    scheduleMetronome(totalBeats, 0);
    schedulePatternAudio(pat, { withHighlight: false, startDelayMs: 0 });
  }, [phase, matchOptions, matchAnswer, initAudioContext, clearTimeouts, scheduleMetronome, schedulePatternAudio]);

  // ---- TAP TRAIL ----
  // Scrolling multi-measure reader. The scrolling visual is handled by
  // <ScrollingRhythmStrip/>; here we just sync the click track + input
  // window so the strike line and the audio downbeat agree.
  const startTrail = useCallback(() => {
    const pat = randomPattern(level, TRAIL_PATTERNS);
    setPattern(pat);
    patternRef.current = pat;
    setHitStates([]);
    setHighlightIndex(-1);
    tapResultsRef.current = {};
    claimedNotesRef.current = new Set();
    initAudioContext();
    clearTimeouts();
    const COUNT_IN_BEATS = 4;
    const totalBeats = patternBeats(pat);
    // Count-in: 4 hi-hat ticks while strip scrolls TO the strike line.
    setPhase('countin');
    scheduleMetronome(COUNT_IN_BEATS, 0);
    const trailStart = setTimeout(() => {
      setPhase('input');
      inputStartRef.current = Date.now();
      expectedStartsRef.current = noteStartTimes(pat, BEAT_MS);
      scheduleMetronome(totalBeats, 0);
      const fin = setTimeout(() => {
        setHighlightIndex(-1);
        finishCopyRound();
      }, totalBeats * BEAT_MS + 600);
      timeoutsRef.current.push(fin);
    }, COUNT_IN_BEATS * BEAT_MS);
    timeoutsRef.current.push(trailStart);
  }, [level, initAudioContext, clearTimeouts, scheduleMetronome, finishCopyRound]);

  // ---- LIFECYCLE ----
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

  useEffect(() => {
    if (!mode) return;
    startCurrentRound();
  }, [mode, level]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- RENDER ----

  const modeConfig = useMemo(() => (mode ? MODE_MAP[mode] : null), [mode]);

  // Mode picker.
  if (!mode) {
    return (
      <div
        data-testid="boom-garden-page"
        className="min-h-screen flex flex-col relative"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, #FFE0B2 0%, transparent 55%), ' +
            'radial-gradient(circle at 80% 70%, #C9F0E0 0%, transparent 60%), ' +
            'linear-gradient(180deg, #FFF7E5 0%, #FFE5C9 100%)',
        }}
      >
        <GameHeader title="Boom Garden" showHomeButton={true} />
        <FullscreenButton />
        <main className="flex-1 pt-16 md:pt-20 pb-6 px-3 md:px-6 max-w-6xl mx-auto w-full flex flex-col">
          <div className="text-center mb-4 md:mb-6">
            <p className="text-sm md:text-base font-bold opacity-80" style={{ color: 'var(--jma-dark)' }}>
              Three rhythm games. Pick your jam.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 flex-1">
            {MODES.map((m, i) => (
              <ModeTile key={m.id} mode={m} index={i} onPick={enterMode} />
            ))}
          </div>
          {/* Difficulty selector */}
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

  // Play screen.
  return (
    <div
      data-testid={`boom-mode-page-${mode}`}
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: 'url(assets/backgrounds/football-field.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Soft tint over the football field so foreground UI stays legible. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${modeConfig.color}22 0%, rgba(255,255,255,0.55) 60%, ${modeConfig.color}33 100%)`,
        }}
      />
      <div className="relative z-10 flex flex-col flex-1">
      <GameHeader title={`Boom Garden · ${modeConfig.label}`} showHomeButton={true} score={score} streak={streak} />
      <FullscreenButton />
      <main className="flex-1 pt-20 md:pt-24 pb-4 px-3 md:px-6 max-w-4xl mx-auto w-full flex flex-col">
        {/* Back + level row */}
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
            {mode === 'copy'  && phase === 'demo'    && 'Listen carefully...'}
            {mode === 'copy'  && phase === 'countin' && 'Count in... 1 · 2 · 3 · 4'}
            {mode === 'copy'  && phase === 'input'   && 'Your turn — play it on the snare!'}
            {mode === 'copy'  && phase === 'reveal'  && 'Round complete'}
            {mode === 'match' && phase === 'demo'    && 'Listen to this rhythm...'}
            {mode === 'match' && phase === 'input'   && 'Pick the strip that matches'}
            {mode === 'match' && phase === 'reveal'  && 'Round complete'}
            {mode === 'trail' && phase === 'countin' && 'Count in... 1 · 2 · 3 · 4'}
            {mode === 'trail' && phase === 'input'   && 'Read & play as each note hits the line'}
            {mode === 'trail' && phase === 'reveal'  && 'Round complete'}
          </div>
        </div>

        {/* Strip(s) */}
        <div className="flex flex-col items-stretch justify-center gap-3 md:gap-4 mb-4">
          {mode === 'copy' && pattern && (
            <RhythmStrip
              pattern={pattern}
              highlightIndex={highlightIndex}
              hitStates={hitStates}
              height={120}
            />
          )}
          {mode === 'trail' && pattern && (
            <ScrollingRhythmStrip
              pattern={pattern}
              kickOff={phase === 'countin' || phase === 'input' || phase === 'reveal'}
              height={170}
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
                  highlightIndex={-1}
                  hitStates={
                    phase === 'reveal'
                      ? p.map(() => (idx === matchAnswer ? 'perfect' : undefined))
                      : null
                  }
                  height={80}
                  testIdPrefix={`match-${idx}-block`}
                  onBlockTap={phase === 'input' ? () => handleMatchPick(idx) : null}
                />
              ))}
            </>
          )}
        </div>

        {/* Visual metronome — bright dot pulses on each beat so kids can SEE
            the tempo, not just hear the click underneath. Active during
            count-in, demo, AND the kid's input window. */}
        {(phase === 'countin' || phase === 'demo' || phase === 'input') && (
          <div className="flex justify-center mb-2">
            <BeatPulse
              running={metronomeRunning}
              startAtMs={metronomeStartMs}
              beatsPerMeasure={4}
              size={18}
            />
          </div>
        )}

        {/* Stew the llama — performs every drum hit (demo + kid's input).
            On Twin Beats he animates during the demo (and stays disabled in
            input since the kid picks a strip, not plays the snare). */}
        <div className="flex justify-center items-center py-3">
          <StewDrummer
            ref={snareRef}
            onTap={handleSnareTap}
            disabled={phase !== 'input' || mode === 'match'}
            hint={
              mode === 'match' && phase === 'demo'    ? 'Listen...' :
              mode === 'match' && phase === 'input'   ? 'Pick a strip ↑' :
              mode === 'match' && phase === 'reveal'  ? 'Round complete' :
              phase === 'input'   ? 'TAP STEW!' :
              phase === 'demo'    ? 'Listen...' :
              phase === 'countin' ? '1 · 2 · 3 · 4' :
              'Wait'
            }
          />
        </div>

        {/* Round-summary card during reveal — actually CELEBRATES the result
            instead of silently restarting. */}
        <AnimatePresence>
          {phase === 'reveal' && roundSummary && (
            <motion.div
              key="round-summary"
              data-testid="boom-round-summary"
              initial={{ y: 30, opacity: 0, scale: 0.92 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="fixed left-1/2 -translate-x-1/2 top-24 md:top-28 z-30 rounded-3xl border-4 px-5 py-3 md:px-7 md:py-4 flex flex-col items-center gap-1.5 max-w-[92%]"
              style={{
                borderColor: 'var(--jma-dark)',
                backgroundColor: roundSummary.correct >= Math.ceil(roundSummary.total * 0.8) ? '#34A853' : '#FFCC00',
                color: roundSummary.correct >= Math.ceil(roundSummary.total * 0.8) ? 'white' : 'var(--jma-dark)',
                boxShadow: '0 8px 0 0 var(--jma-dark)',
              }}
            >
              <div className="text-xs md:text-sm uppercase font-black tracking-widest opacity-80">
                Round complete
              </div>
              <div className="text-2xl md:text-3xl font-black font-display leading-none">
                {roundSummary.correct} of {roundSummary.total} on time!
              </div>
              <button
                data-testid="boom-play-again"
                type="button"
                onClick={() => {
                  clearTimeouts();
                  setFeedback(null);
                  setRoundSummary(null);
                  if (mode === 'copy')  startCopy();
                  if (mode === 'trail') startTrail();
                  if (mode === 'match') startMatch();
                }}
                className="mt-1 rounded-full border-3 bg-white px-4 py-1 font-black font-display text-sm"
                style={{ borderColor: 'var(--jma-dark)', color: 'var(--jma-dark)', boxShadow: '0 3px 0 0 var(--jma-dark)' }}
              >
                Play another →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback toast */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              key={feedback.text}
              data-testid="boom-feedback"
              initial={{ y: 30, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
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
    </div>
  );
}
