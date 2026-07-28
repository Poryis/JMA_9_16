// Robot Boogie — the Incredibox-style mixer game under /create.
//
// Eight characters, each mapped to one or more audio stems. Click a
// character → the time machine "zaps" (short 8-frame anim + a lightning
// bolt appears over that character) → the character starts playing their
// part. Multi-stem characters (Chunk has 4 drum variants, Dr. Jellybone
// has 2 horn variants) cycle through their stems on each subsequent click,
// then toggle back to neutral on the final click.
//
// All 12 stems begin playback on the FIRST character tap (that user gesture
// is what iOS Safari needs to authorize audio). They loop in perfect sync
// forever thereafter — only their .muted flag ever changes. This is the
// mechanism that prevents "glitchy restart" the user asked us to avoid.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import useRobotBoogieAudio from '../hooks/useRobotBoogieAudio';

// ---- Character config ----
// Each character has:
//   - stems: ordered list of stem IDs (audio file basenames). Clicking
//     the character cycles through the list; length + 1 clicks returns
//     to neutral.
//   - frames: number of "playing" / "dancing" animation frames on disk.
//   - path pattern is 'assets/robot-boogie/{playingDir}-{NN}.png'.
//   - neutral is the single still shown when no stem of that character
//     is active.
//   - dance: true means "no instrument — pure dancer" (kids should read
//     it that way; UI-wise it's identical, we just label the frames
//     folder with -dancing rather than -playing).
const CHARACTERS = [
  {
    id: 'finn',
    name: 'Finn',
    role: 'Bass',
    stems: ['robot-bass'],
    frames: 8,
    playingBase: 'assets/robot-boogie/finn-playing/finn-playing',
    neutral: 'assets/robot-boogie/finn-neutral.png',
    color: '#4285F4',
    dance: false,
  },
  {
    id: 'chunk',
    name: 'Chunk',
    role: 'Drums',
    stems: ['robot-drum-1', 'robot-drum-1-1', 'robot-drum-2', 'robot-drum-3'],
    frames: 8,
    playingBase: 'assets/robot-boogie/chunk-playing/chunk-playing',
    neutral: 'assets/robot-boogie/chunk-neutral.png',
    color: '#FF9500',
    dance: false,
  },
  {
    id: 'charlie',
    name: 'Charlie',
    role: 'Guitar',
    stems: ['robot-gtr'],
    frames: 8,
    playingBase: 'assets/robot-boogie/charlie-playing/charlie-playing',
    neutral: 'assets/robot-boogie/charlie-neutral/charlie-neutral-01.png',
    color: '#E91E63',
    dance: false,
  },
  {
    id: 'jazzy',
    name: 'Jazzy',
    role: 'Horns',
    stems: ['robot-horns-1'],
    frames: 0, // single still swap only
    playingSingle: 'assets/robot-boogie/jazzy-playing.png',
    neutral: 'assets/robot-boogie/jazzy-neutral.png',
    color: '#FFCC00',
    dance: false,
  },
  {
    id: 'jellybone',
    name: 'Dr. Jellybone',
    role: 'Horns',
    stems: ['robot-horns-2', 'robot-horns-3'],
    frames: 8,
    playingBase: 'assets/robot-boogie/jellybone-playing/jellybone-playing',
    neutral: 'assets/robot-boogie/jellybone-neutral.png',
    color: '#9B6DE0',
    dance: false,
  },
  {
    id: 'lou',
    name: 'Lou',
    role: 'Synth',
    stems: ['robot-synth-1'],
    frames: 6,
    playingBase: 'assets/robot-boogie/lou-dancing/lou-dancing',
    neutral: 'assets/robot-boogie/lou-neutral.png',
    color: '#34A853',
    dance: true,
  },
  {
    id: 'robot1',
    name: 'Robo Red',
    role: 'Synth',
    stems: ['robot-synth-2'],
    frames: 8,
    playingBase: 'assets/robot-boogie/robot1-dancing/robot1-dancing',
    neutral: 'assets/robot-boogie/robot1-neutral/robot1-neutral-01.png',
    color: '#FF3B30',
    dance: true,
  },
  {
    id: 'robot2',
    name: 'Robo Blue',
    role: 'Synth',
    stems: ['robot-synth-3'],
    frames: 8,
    playingBase: 'assets/robot-boogie/robot2-dancing/robot2-dancing',
    neutral: 'assets/robot-boogie/robot2-neutral/robot2-neutral-01.png',
    color: '#0FA3B1',
    dance: true,
  },
];

// Utility to build the frame image URL for a given character + frame index
function frameUrl(cfg, i /* 1-based */) {
  return `${cfg.playingBase}-${String(i).padStart(2, '0')}.png`;
}

// ============================================================
// Time machine — persistent center-top element that plays its
// 8-frame animation once whenever ANY character is toggled.
// ============================================================
function TimeMachine({ zapKey }) {
  // frame ranges 0..7 while animating; -1 = idle (show idle png)
  const [frame, setFrame] = useState(-1);
  const timerRef = useRef(null);

  useEffect(() => {
    if (zapKey === 0) return; // initial render, no zap yet
    // Reset & play the 8-frame anim over ~800ms
    setFrame(0);
    let i = 0;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      i += 1;
      if (i >= 8) {
        clearInterval(timerRef.current);
        setFrame(-1);
      } else {
        setFrame(i);
      }
    }, 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [zapKey]);

  return (
    <div
      data-testid="robot-boogie-time-machine"
      className="absolute pointer-events-none select-none"
      style={{
        left: '50%',
        top: 'clamp(70px, 12vh, 130px)',
        transform: 'translateX(-50%)',
        width: 'clamp(160px, 22vw, 280px)',
        zIndex: 15,
      }}
    >
      {frame === -1 ? (
        <img
          src="assets/robot-boogie/time-machine-idle.png"
          alt=""
          draggable={false}
          className="w-full h-auto"
          style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.55))' }}
        />
      ) : (
        <img
          src={`assets/robot-boogie/time-machine/time-machine-${String(frame + 1).padStart(2, '0')}.png`}
          alt=""
          draggable={false}
          className="w-full h-auto"
          style={{ filter: 'drop-shadow(0 0 24px rgba(255,220,120,0.9))' }}
        />
      )}
    </div>
  );
}

// ============================================================
// Lightning bolt burst — 4-frame lightning + optional electrocute
// overlay shown briefly above the clicked character during a zap.
// ============================================================
function LightningBolt() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      if (i >= 4) clearInterval(id);
      else setFrame(i);
    }, 90);
    return () => clearInterval(id);
  }, []);
  return (
    <img
      src={`assets/robot-boogie/lightning/lightning-${String(frame + 1).padStart(2, '0')}.png`}
      alt=""
      draggable={false}
      className="absolute pointer-events-none select-none"
      style={{
        left: '50%',
        top: '-30%',
        transform: 'translateX(-50%)',
        width: '80%',
        height: 'auto',
        zIndex: 25,
        filter: 'drop-shadow(0 0 8px rgba(255,255,120,0.9))',
      }}
    />
  );
}

// ============================================================
// Character slot — animation loop when active, static when neutral,
// lightning bolt during the ~500ms after a click.
// ============================================================
function CharacterSlot({ cfg, activeStemIndex, onClick, zapping }) {
  const isActive = activeStemIndex >= 0;

  // Animation frame index — advance 10 fps while active
  const [animFrame, setAnimFrame] = useState(1);
  useEffect(() => {
    if (!isActive || cfg.frames <= 1) return;
    const id = setInterval(() => {
      setAnimFrame((p) => (p % cfg.frames) + 1);
    }, 100);
    return () => clearInterval(id);
  }, [isActive, cfg.frames]);

  // Which image to render
  let src;
  if (!isActive) {
    src = cfg.neutral;
  } else if (cfg.frames === 0 && cfg.playingSingle) {
    src = cfg.playingSingle;
  } else {
    src = frameUrl(cfg, animFrame);
  }

  return (
    <motion.button
      type="button"
      data-testid={`robot-boogie-char-${cfg.id}`}
      data-active={isActive ? 'true' : 'false'}
      onClick={() => onClick(cfg.id)}
      className="relative flex flex-col items-center justify-end cursor-pointer bg-transparent border-0 p-0 select-none flex-shrink-0"
      style={{
        // width + height tuned so 8 characters fit a 1280 px viewport in
        // one row; on narrow mobiles they wrap 4x2 via the flex-wrap
        // container.
        width: 'clamp(78px, 9.5vw, 135px)',
        height: 'clamp(150px, 22vh, 240px)',
        touchAction: 'manipulation',
      }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.94 }}
    >
      {/* Character image */}
      <div className="relative w-full h-full flex items-end justify-center">
        <motion.img
          src={src}
          alt={cfg.name}
          draggable={false}
          loading="lazy"
          className="w-full h-full object-contain object-bottom pointer-events-none"
          style={{
            filter: isActive
              ? `drop-shadow(0 0 18px ${cfg.color}bb)`
              : 'drop-shadow(0 6px 10px rgba(0,0,0,0.55)) saturate(0.55) brightness(0.75)',
          }}
          animate={isActive && cfg.frames === 0 ? { rotate: [0, -3, 3, 0] } : {}}
          transition={isActive && cfg.frames === 0
            ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
            : {}}
        />
        {/* Lightning bolt overlay when zapping */}
        <AnimatePresence>
          {zapping && (
            <motion.div
              key="bolt"
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LightningBolt />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Name plate */}
      <div
        className="absolute left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full border-2 text-[10px] font-black uppercase tracking-wide"
        style={{
          bottom: -14,
          backgroundColor: isActive ? cfg.color : 'rgba(0,0,0,0.6)',
          color: 'white',
          borderColor: 'var(--jma-dark)',
          textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
          whiteSpace: 'nowrap',
        }}
      >
        {cfg.name}
      </div>
    </motion.button>
  );
}

// ============================================================
// Main page
// ============================================================
export default function RobotBoogiePage() {
  const { activeStems, setStemActive, muteAll } = useRobotBoogieAudio();

  // Per-character active stem index. null = neutral, otherwise 0..stems.length-1.
  const [charState, setCharState] = useState(() => {
    const s = {};
    CHARACTERS.forEach((c) => { s[c.id] = null; });
    return s;
  });

  // Zap key increments on every character toggle so <TimeMachine> replays.
  const [zapKey, setZapKey] = useState(0);
  const [zappingId, setZappingId] = useState(null); // which character is currently showing lightning

  const handleCharacterClick = useCallback((charId) => {
    const cfg = CHARACTERS.find((c) => c.id === charId);
    if (!cfg) return;

    const current = charState[charId];
    let nextIndex; // null OR 0..stems.length-1

    if (current === null) {
      nextIndex = 0; // first stem
    } else if (current + 1 < cfg.stems.length) {
      nextIndex = current + 1; // cycle to next stem
    } else {
      nextIndex = null; // final click — turn off
    }

    // Sync audio: mute current, unmute new (if any)
    if (current !== null) {
      setStemActive(cfg.stems[current], false);
    }
    if (nextIndex !== null) {
      setStemActive(cfg.stems[nextIndex], true);
    }

    setCharState((prev) => ({ ...prev, [charId]: nextIndex }));
    setZapKey((k) => k + 1);
    setZappingId(charId);
    setTimeout(() => setZappingId(null), 420);
  }, [charState, setStemActive]);

  const handleReset = useCallback(() => {
    muteAll();
    setCharState(() => {
      const s = {};
      CHARACTERS.forEach((c) => { s[c.id] = null; });
      return s;
    });
    setZapKey((k) => k + 1);
  }, [muteAll]);

  // Live count of active characters (for the header stat)
  const activeCount = useMemo(
    () => Object.values(charState).filter((v) => v !== null).length,
    [charState]
  );

  return (
    <div
      data-testid="robot-boogie-page"
      className="min-h-screen relative overflow-x-hidden flex flex-col"
      style={{
        backgroundImage: 'url(assets/backgrounds/robot-boogie-scene.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Purple tint so lighter foreground elements read against the bg */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(27,17,64,0.4) 0%, transparent 40%, rgba(20,10,45,0.55) 100%)',
        }}
      />

      <GameHeader title="Robot Boogie" showHomeButton={true} />

      {/* Time machine — center top */}
      <TimeMachine zapKey={zapKey} />

      {/* Title + subtitle */}
      <div className="relative z-10 text-center pt-24 md:pt-28 px-4">
        <motion.h1
          className="font-black font-display leading-none uppercase inline-block"
          style={{
            fontSize: 'clamp(30px, 5vw, 54px)',
            color: '#FFF3A6',
            WebkitTextStroke: 'clamp(2px, 0.4vw, 4px) var(--jma-dark)',
            paintOrder: 'stroke fill',
            textShadow:
              '3px 3px 0 #FF3B9A, 5px 5px 0 #4285F4, 7px 7px 0 #FFCC00',
            letterSpacing: '0.02em',
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Robot Boogie
        </motion.h1>
        <p
          className="mt-2 text-xs md:text-sm font-black uppercase tracking-widest inline-block px-3 py-1 rounded-full"
          style={{
            color: '#FFF3A6',
            backgroundColor: 'rgba(0,0,0,0.5)',
            border: '2px solid #FF6BAA',
          }}
        >
          Zap each pal to add their part
        </p>
      </div>

      {/* Reset chip + active count */}
      <div className="relative z-10 flex items-center justify-center gap-3 mt-4">
        <div
          data-testid="robot-boogie-active-count"
          className="px-3 py-1 rounded-full font-black text-xs uppercase tracking-wider"
          style={{
            backgroundColor: 'rgba(255,243,166,0.95)',
            color: 'var(--jma-dark)',
            border: '2px solid var(--jma-dark)',
            boxShadow: '0 3px 0 0 var(--jma-dark)',
          }}
        >
          {activeCount} / {CHARACTERS.length} playing
        </div>
        <button
          type="button"
          data-testid="robot-boogie-reset"
          onClick={handleReset}
          className="px-3 py-1.5 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border-2 cursor-pointer"
          style={{
            backgroundColor: '#FF3B30',
            color: 'white',
            borderColor: 'var(--jma-dark)',
            boxShadow: '0 3px 0 0 var(--jma-dark)',
          }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Character stage — flex row that wraps to 4x2 on mobile */}
      <div className="relative z-10 flex-1 flex items-end justify-center pb-6 md:pb-10 pt-6">
        <div className="flex flex-row flex-wrap items-end justify-center gap-x-2 md:gap-x-2 gap-y-8 max-w-7xl w-full px-2">
          {CHARACTERS.map((cfg) => (
            <CharacterSlot
              key={cfg.id}
              cfg={cfg}
              activeStemIndex={charState[cfg.id] ?? -1}
              onClick={handleCharacterClick}
              zapping={zappingId === cfg.id}
            />
          ))}
        </div>
      </div>

      {/* Hint (only visible before anything is playing) */}
      {activeCount === 0 && (
        <motion.div
          className="absolute z-10 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs md:text-sm font-black uppercase tracking-wider pointer-events-none"
          style={{
            bottom: 'clamp(24px, 4vh, 44px)',
            backgroundColor: 'rgba(0,0,0,0.72)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.35)',
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Tap a friend to bring them to life →
        </motion.div>
      )}

      {/* Preload sparse indicator using activeStems length as a hint */}
      <div className="hidden" data-active-stems={activeStems.size} />
    </div>
  );
}
