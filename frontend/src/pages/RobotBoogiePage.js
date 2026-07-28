// Robot Boogie — the Incredibox-style mixer game.
//
// Layout goals (v4, Feb 28 2026 pm — user redesign brief):
//   • **Time Machine is the visual centerpiece** — it lives dead-center
//     between the active band and the character lineup, and it's the
//     device that "zaps" a character into Robot Boogie World.
//   • **All 8 characters ALWAYS visible** in a compact lineup at the
//     bottom of the screen (no pagination, no hidden menus).
//   • **Active performers appear at the top** as significantly larger
//     versions of themselves — they resize dynamically so 1 solo star
//     feels HUGE and a full band of 8 still fits.
//   • Layout is fully responsive. Character positions are *not*
//     anchored to background artwork — the background is decoration
//     only. Flexbox rows + auto-sizing so the exact same hierarchy
//     works on phone, tablet, desktop.
//
// Visual flow: Tap compact character below  →  Time Machine flashes
//              →  a big version of that character joins the top band.
//
// Team pairing (unchanged from v3):
//   Stems are grouped by INSTRUMENT into 6 "teams" — bass (Finn), drum
//   (Chunk), guitar (Charlie), lou (Lou plays drum-1 solo), horns (Jazzy
//   + Jellybone paired), synth (Robot 1 + Robot 2 paired). Paired teams
//   share ONE audible stem at a time but both members dance together
//   when both are toggled on. See TEAMS + TEAM_STEMS + CHAR_TO_TEAM.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import useRobotBoogieAudio from '../hooks/useRobotBoogieAudio';

// ============================================================
// Character config
//
// TEAM PAIRING RULES (per user, Feb 28 2026 — v2):
//   • Bass   → Finn only
//   • Drums  → Chunk only (drum-1-1, drum-2, drum-3)
//   • Guitar → Charlie only
//   • Lou    → **solo team**, plays drum-1 (can play WITH Chunk)
//   • Horns  → Jazzy + Dr Jellybone (shared sound slot; both dance)
//   • Synth  → Robot 1 + Robot 2      (shared sound slot; both dance)
//
// Paired teams (`horns`, `synth`) share ONE audible stem at a time.
// Tapping any team member either (a) starts the team if it was off,
// (b) advances to the next stem in the team's cycle if the team was
// already playing, or (c) turns THAT character off — but if the other
// member is still dancing, the sound keeps playing. Both members
// dance together whenever both are toggled on.
//
// `playingSingle` — used for characters whose only extra "playing" pose
// is a single still (Jazzy). Since her source `jazzy-playing.png` was
// drawn as a torso-up crop with no feet, we reuse her neutral image
// here so her legs remain visible while playing; the wobble animation
// applied by <CharacterSlot> still communicates "she's grooving."
// ============================================================
const CHARACTERS = [
  {
    id: 'finn',
    stems: ['robot-bass'],
    frames: 8,
    playingBase: 'assets/robot-boogie/finn-playing/finn-playing',
    neutral: 'assets/robot-boogie/finn-neutral.png',
    color: '#4285F4',
  },
  {
    id: 'chunk',
    // Chunk reduced to a single stem (robot-drum-3) per user; Lou keeps
    // drum-1. `robot-drum-1-1` and `robot-drum-2` are temporarily
    // orphaned — the audio hook still loads them, they just stay muted
    // until we assign them to a character later.
    stems: ['robot-drum-3'],
    frames: 8,
    playingBase: 'assets/robot-boogie/chunk-playing/chunk-playing',
    neutral: 'assets/robot-boogie/chunk-neutral.png',
    color: '#FF9500',
  },
  {
    id: 'charlie',
    stems: ['robot-gtr'],
    frames: 8,
    playingBase: 'assets/robot-boogie/charlie-playing/charlie-playing',
    neutral: 'assets/robot-boogie/charlie-neutral/charlie-neutral-01.png',
    color: '#E91E63',
  },
  {
    id: 'jazzy',
    stems: ['robot-horns-1'],
    frames: 0,
    // Reuse neutral for the "playing" still so Jazzy's legs stay visible.
    // The wobble motion on <CharacterSlot> conveys "she's playing."
    playingSingle: 'assets/robot-boogie/jazzy-neutral.png',
    neutral: 'assets/robot-boogie/jazzy-neutral.png',
    color: '#FFCC00',
  },
  {
    id: 'jellybone',
    stems: ['robot-horns-2', 'robot-horns-3'],
    frames: 8,
    playingBase: 'assets/robot-boogie/jellybone-playing/jellybone-playing',
    neutral: 'assets/robot-boogie/jellybone-neutral.png',
    color: '#9B6DE0',
  },
  {
    id: 'lou',
    // Lou moved out of the synth team; he's now the drum-1 solo. He
    // can play at the same time as Chunk — different teams, different
    // stems. robot-synth-1 is temporarily orphaned (no one plays it).
    stems: ['robot-drum-1'],
    frames: 6,
    playingBase: 'assets/robot-boogie/lou-dancing/lou-dancing',
    neutral: 'assets/robot-boogie/lou-neutral.png',
    color: '#34A853',
  },
  {
    id: 'robot1',
    stems: ['robot-synth-2'],
    frames: 8,
    playingBase: 'assets/robot-boogie/robot1-dancing/robot1-dancing',
    neutral: 'assets/robot-boogie/robot1-neutral/robot1-neutral-01.png',
    color: '#FF3B30',
  },
  {
    id: 'robot2',
    stems: ['robot-synth-3'],
    frames: 8,
    playingBase: 'assets/robot-boogie/robot2-dancing/robot2-dancing',
    neutral: 'assets/robot-boogie/robot2-neutral/robot2-neutral-01.png',
    color: '#0FA3B1',
  },
];

// Team → member ids. Order matters for the shared-stem cycle: tapping
// advances through TEAM_STEMS[teamId] which is derived by concatenating
// each listed member's stems array (in this order).
const TEAMS = {
  bass:   ['finn'],
  drum:   ['chunk'],
  guitar: ['charlie'],
  lou:    ['lou'],
  horns:  ['jazzy', 'jellybone'],
  synth:  ['robot1', 'robot2'],
};

// Aggregated stem cycle per team. Each tap on ANY team member advances
// the team's index into its cycle. Derived so per-character stem edits
// stay the single source of truth.
const TEAM_STEMS = Object.entries(TEAMS).reduce((acc, [teamId, members]) => {
  acc[teamId] = members.flatMap(
    (memberId) => CHARACTERS.find((c) => c.id === memberId).stems
  );
  return acc;
}, {});

const CHAR_TO_TEAM = Object.entries(TEAMS).reduce((acc, [teamId, members]) => {
  members.forEach((id) => { acc[id] = teamId; });
  return acc;
}, {});

// ============================================================
// Time machine — the visual CENTERPIECE of the page. Sits between the
// active band (top) and the character lineup (bottom). Kids see it as
// the device that zaps a character up into Robot Boogie World.
//
// Reel behavior:
//   • Idle when nothing is playing (single time-machine-idle.png).
//   • Loops the 8-frame reel CONTINUOUSLY while any character is active.
//   • Briefly turbo-flashes when a character is toggled (`flashKey`
//     ticks up on every tap, kicking off a short faster-reel burst).
//   • A tap plays a fun Shield-style flourish animation.
// ============================================================
const TIME_MACHINE_ANIMS = [
  { keyframes: { rotate: [0, -14, 12, -8, 6, 0],  scale: [1, 1.08, 1.10, 1.04, 1.02, 1] }, duration: 0.9 },
  { keyframes: { rotate: [0, 360],                scale: [1, 1.10, 1],                     y: [0, -10, 0] }, duration: 0.95 },
  { keyframes: { rotate: [0, 0],                  scale: [1, 1.35, 0.92, 1.12, 1],         y: [0, -14, 0, -6, 0] }, duration: 0.85 },
  { keyframes: { rotateY: [0, 360],               scale: [1, 1.06, 1],                     y: [0, -8, 0] }, duration: 0.95 },
  { keyframes: { x: [0, -10, 10, -7, 7, -4, 4, 0], rotate: [0, -4, 4, -2, 2, 0, 0, 0],     scale: [1, 1.04, 1.04, 1.04, 1.04, 1.02, 1.02, 1] }, duration: 0.95 },
];

function TimeMachine({ anyActive, flashKey }) {
  const [frame, setFrame] = useState(-1);
  const timerRef = useRef(null);
  const flashTimerRef = useRef(null);
  const tmControls = useAnimationControls();
  const hitsRef = useRef(0);

  // Continuous reel while any team plays; idle when silent.
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (anyActive) {
      let i = 0;
      setFrame(0);
      timerRef.current = setInterval(() => {
        i = (i + 1) % 8;
        setFrame(i);
      }, 100);
    } else {
      setFrame(-1);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [anyActive]);

  // Turbo flash on every character toggle — a quick burst of animated
  // scale + brightness so kids visually connect their tap with the
  // Time Machine "zapping" the character into the band.
  useEffect(() => {
    if (flashKey === 0) return;
    tmControls.start({
      scale: [1, 1.18, 1],
      transition: { duration: 0.4, ease: 'easeOut' },
    });
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    // Nothing to clean up beyond the animation controls — the reel
    // interval keeps humming.
  }, [flashKey, tmControls]);

  // Shield-style easter-egg flourish on tap.
  const handleTap = () => {
    const anim = TIME_MACHINE_ANIMS[hitsRef.current % TIME_MACHINE_ANIMS.length];
    hitsRef.current += 1;
    tmControls.start({
      ...anim.keyframes,
      transition: { duration: anim.duration, ease: 'easeInOut' },
    });
  };

  return (
    <motion.button
      type="button"
      data-testid="robot-boogie-time-machine"
      aria-label="Time machine"
      onClick={handleTap}
      className="relative select-none bg-transparent border-0 p-0 cursor-pointer flex-shrink-0"
      style={{
        // Size scales with the viewport so the Time Machine reads as the
        // centerpiece on phone AND desktop.
        width: 'clamp(170px, 26vw, 320px)',
        touchAction: 'manipulation',
        // Soft under-glow ring so it feels alive even at idle.
        filter: anyActive
          ? 'drop-shadow(0 0 32px rgba(255,220,120,0.95))'
          : 'drop-shadow(0 8px 18px rgba(0,0,0,0.55))',
        transition: 'filter 220ms ease-out',
      }}
      animate={tmControls}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
    >
      <img
        src="assets/robot-boogie/time-machine-idle.png"
        alt=""
        draggable={false}
        className="w-full h-auto pointer-events-none"
        style={{
          // Always keep the idle image in normal flow so it establishes
          // the button's height — the animation frames are absolutely
          // positioned overlays that would otherwise leave the button
          // at zero height. Just hide its pixels while a frame plays.
          visibility: frame === -1 ? 'visible' : 'hidden',
        }}
      />
      {Array.from({ length: 8 }, (_, i) => (
        <img
          key={i}
          src={`assets/robot-boogie/time-machine/time-machine-${String(i + 1).padStart(2, '0')}.png`}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-auto pointer-events-none"
          style={{ display: frame === i ? 'block' : 'none' }}
        />
      ))}
    </motion.button>
  );
}

// ============================================================
// Lightning burst — positioned over the clicked character. Rendered via
// the parent's zapping flag; character slot places it.
// ============================================================
function LightningBolt() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      if (i >= 4) clearInterval(id);
      else setFrame(i);
    }, 80);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: '50%',
        top: '-15%',
        transform: 'translateX(-50%)',
        width: '90%',
        zIndex: 30,
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <img
          key={i}
          src={`assets/robot-boogie/lightning/lightning-${String(i + 1).padStart(2, '0')}.png`}
          alt=""
          draggable={false}
          className={i === 0 ? 'w-full h-auto block' : 'w-full h-auto absolute inset-0'}
          style={{
            display: frame === i ? 'block' : 'none',
            filter: 'drop-shadow(0 0 14px rgba(255,255,120,0.95))',
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// Character slot — preloads every animation frame at mount so cycling is
// instant, then toggles which frame is displayed via display:none/block.
// ============================================================
function CharacterSlot({ cfg, activeStemIndex, onClick, zapping }) {
  const isActive = activeStemIndex >= 0;

  const [animFrame, setAnimFrame] = useState(1);
  useEffect(() => {
    if (!isActive || cfg.frames <= 1) return;
    // 90 ms/frame = ~11 fps. Kid-friendly, matches source art cadence.
    const id = setInterval(() => {
      setAnimFrame((p) => (p % cfg.frames) + 1);
    }, 90);
    return () => clearInterval(id);
  }, [isActive, cfg.frames]);

  // Pre-computed list of every playing frame URL for this character.
  // Rendered once as stacked <img> so the browser caches them all up front
  // and cycling to a new frame is a pure display-property flip.
  const frameUrls = useMemo(() => {
    if (!cfg.playingBase || cfg.frames === 0) return [];
    return Array.from({ length: cfg.frames }, (_, i) =>
      `${cfg.playingBase}-${String(i + 1).padStart(2, '0')}.png`
    );
  }, [cfg.playingBase, cfg.frames]);

  return (
    <motion.button
      type="button"
      data-testid={`robot-boogie-char-${cfg.id}`}
      data-active={isActive ? 'true' : 'false'}
      onClick={() => onClick(cfg.id)}
      className="relative flex items-end justify-center cursor-pointer bg-transparent border-0 p-0 select-none"
      style={{
        width: '100%',
        aspectRatio: '3 / 4',
        touchAction: 'manipulation',
      }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.94 }}
    >
      <div
        className="relative w-full h-full flex items-end justify-center"
        style={{
          filter: isActive
            ? `drop-shadow(0 0 22px ${cfg.color}dd)`
            : 'drop-shadow(0 8px 12px rgba(0,0,0,0.55)) saturate(0.55) brightness(0.75)',
          transition: 'filter 200ms ease-out',
        }}
      >
        {/* Neutral image — shown when the character is off. Always in
            the DOM so the browser has it cached the moment we toggle. */}
        <img
          src={cfg.neutral}
          alt=""
          draggable={false}
          className="max-w-full max-h-full object-contain object-bottom pointer-events-none"
          style={{ display: isActive ? 'none' : 'block' }}
        />

        {/* Single "playing" still (Jazzy). CSS keyframe wobble + hop —
            using plain CSS animation instead of framer-motion because
            the `layout` prop on the AnimatePresence wrapper interferes
            with framer-motion's transform-based keyframe repeat. */}
        {cfg.playingSingle && (
          <img
            src={cfg.playingSingle}
            alt=""
            draggable={false}
            className="max-w-full max-h-full object-contain object-bottom pointer-events-none absolute inset-0 m-auto"
            style={{
              display: isActive ? 'block' : 'none',
              animation: isActive ? 'jazzyWobble 0.6s ease-in-out infinite' : 'none',
              transformOrigin: '50% 90%',
            }}
          />
        )}

        {/* All frame images stacked — only the current one is
            display:block. Browser caches them all at first render. */}
        {frameUrls.map((url, i) => (
          <img
            key={url}
            src={url}
            alt=""
            draggable={false}
            className="max-w-full max-h-full object-contain object-bottom pointer-events-none absolute inset-0 m-auto"
            style={{
              display: isActive && animFrame === i + 1 ? 'block' : 'none',
            }}
          />
        ))}

        {/* Lightning bolt overlay — appears directly over this character
            during the ~360 ms after they're zapped. */}
        <AnimatePresence>
          {zapping && (
            <motion.div
              key="bolt"
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.18 }}
            >
              <LightningBolt />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}

// ============================================================
// Compact character — the bottom-lineup tile. Small, always-visible,
// tappable. Shows the neutral sprite (never animates) plus a bright
// team-colored ring when this character is "selected" (dancing in the
// top band). This is the ONLY tap target on the page — everything else
// is decoration.
// ============================================================
function CompactChar({ cfg, selected, onClick, zapping }) {
  return (
    <motion.button
      type="button"
      data-testid={`robot-boogie-char-${cfg.id}`}
      data-active={selected ? 'true' : 'false'}
      onClick={() => onClick(cfg.id)}
      aria-label={cfg.id}
      className="relative flex items-end justify-center cursor-pointer bg-transparent border-0 p-0 select-none flex-shrink-0"
      style={{
        // Compact strip: 8 tiles fit on any width via clamp. Aspect
        // keeps their proportions consistent with the top performers.
        width: 'clamp(48px, 10vw, 96px)',
        aspectRatio: '3 / 4',
        touchAction: 'manipulation',
      }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.9 }}
    >
      {/* Selection ring / stage puck. Sits BEHIND the sprite so the
          character stands on top of it. */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none rounded-full"
        style={{
          bottom: '2%',
          left: '10%',
          right: '10%',
          height: '14%',
          background: selected
            ? `radial-gradient(closest-side, ${cfg.color}cc, ${cfg.color}00 70%)`
            : 'radial-gradient(closest-side, rgba(0,0,0,0.45), transparent 70%)',
          transition: 'background 200ms ease-out',
        }}
      />

      <img
        src={cfg.neutral}
        alt=""
        draggable={false}
        className="max-w-full max-h-full object-contain object-bottom pointer-events-none relative"
        style={{
          filter: selected
            ? `drop-shadow(0 0 12px ${cfg.color}dd)`
            : 'saturate(0.6) brightness(0.85) drop-shadow(0 4px 6px rgba(0,0,0,0.5))',
          transition: 'filter 200ms ease-out',
        }}
      />

      {/* Zap flash on tap — a quick colored bloom instead of the full
          lightning frames (those live on the LARGE performer). */}
      <AnimatePresence>
        {zapping && (
          <motion.div
            key="zap"
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              boxShadow: `0 0 22px 4px ${cfg.color}`,
              background: `radial-gradient(closest-side, ${cfg.color}66, transparent 70%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ============================================================
// Main page
// ============================================================
const EMPTY_DANCING = CHARACTERS.reduce((acc, c) => { acc[c.id] = false; return acc; }, {});
const EMPTY_TEAM_STEM = Object.keys(TEAMS).reduce((acc, t) => { acc[t] = null; return acc; }, {});

export default function RobotBoogiePage() {
  const { setStemActive, muteAll } = useRobotBoogieAudio();

  // Per-character: is this character currently DANCING? Dancing is
  // independent per character — both members of a paired team can dance
  // at the same time. See TEAM PAIRING RULES in the CHARACTERS comment.
  const [dancing, setDancing] = useState(() => ({ ...EMPTY_DANCING }));

  // Per-team: index into TEAM_STEMS[teamId] for the ONE stem the team
  // is currently playing (or null if the team is silent). Every tap on
  // ANY team member advances this index by one; when the last dancer
  // leaves the team, the index goes back to null.
  const [teamStemIndex, setTeamStemIndex] = useState(() => ({ ...EMPTY_TEAM_STEM }));

  // Track which character was most recently zapped (for the LightningBolt
  // overlay on the character slot).
  const [zappingId, setZappingId] = useState(null);

  // Ticks up every time a character is toggled — used by TimeMachine to
  // fire its "zap" burst animation without needing to know which char
  // was tapped.
  const [flashKey, setFlashKey] = useState(0);

  const handleCharacterClick = useCallback((charId) => {
    const teamId = CHAR_TO_TEAM[charId];
    const cycle = TEAM_STEMS[teamId];
    const wasDancing = dancing[charId];
    const curIdx = teamStemIndex[teamId];

    // Team members OTHER than the tapped one that are still dancing
    // AFTER this tap. Used to decide whether the sound keeps playing
    // when the tapped char turns off.
    const otherMembersStillDancing = TEAMS[teamId]
      .filter((id) => id !== charId)
      .some((id) => dancing[id]);

    if (!wasDancing) {
      // Turning THIS character ON.
      setDancing((prev) => ({ ...prev, [charId]: true }));

      // Advance the team's stem cycle. If nobody was playing, start at
      // index 0; otherwise advance by one (wrapping around).
      const nextIdx = curIdx === null ? 0 : (curIdx + 1) % cycle.length;
      if (curIdx !== null) setStemActive(cycle[curIdx], false);
      setStemActive(cycle[nextIdx], true);
      setTeamStemIndex((prev) => ({ ...prev, [teamId]: nextIdx }));

      setZappingId(charId);
      setTimeout(() => setZappingId(null), 360);
    } else {
      // Turning THIS character OFF.
      setDancing((prev) => ({ ...prev, [charId]: false }));

      if (!otherMembersStillDancing) {
        // Last dancer in the team just left → silence the team.
        if (curIdx !== null) setStemActive(cycle[curIdx], false);
        setTeamStemIndex((prev) => ({ ...prev, [teamId]: null }));
      }
      // Else: leave the current stem playing — the other dancer keeps
      // holding the groove.
    }

    // Every tap — on or off — kicks off the Time Machine's flash burst
    // so kids visually connect their action with the centerpiece.
    setFlashKey((k) => k + 1);
  }, [dancing, teamStemIndex, setStemActive]);

  const handleReset = useCallback(() => {
    muteAll();
    setDancing({ ...EMPTY_DANCING });
    setTeamStemIndex({ ...EMPTY_TEAM_STEM });
  }, [muteAll]);

  const activeCount = useMemo(
    () => Object.values(teamStemIndex).filter((v) => v !== null).length,
    [teamStemIndex]
  );
  const totalTeams = Object.keys(TEAMS).length;

  const activeChars = useMemo(
    () => CHARACTERS.filter((c) => dancing[c.id]),
    [dancing]
  );

  return (
    <div
      data-testid="robot-boogie-page"
      className="min-h-screen relative overflow-x-hidden flex flex-col"
      style={{
        // Background is decoration ONLY — no gameplay positioning
        // depends on it. Fallback gradient behind so the layout still
        // looks coherent if the PNG is missing or slow to load.
        background:
          'radial-gradient(circle at 50% 30%, #4a2b7a 0%, #2a1650 55%, #150a2b 100%)',
        backgroundImage:
          'url(assets/backgrounds/robot-boogie-scene.png), radial-gradient(circle at 50% 30%, #4a2b7a 0%, #2a1650 55%, #150a2b 100%)',
        backgroundSize: 'cover, auto',
        backgroundPosition: 'center, center',
      }}
    >
      {/* Vignette so the characters read against any background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      <GameHeader title="Robot Boogie" showHomeButton={true} />

      {/* Playing chip + Reset — sits just under the fixed header */}
      <div className="relative z-10 flex items-center justify-center gap-3 pt-14 md:pt-16 pb-0">
        <div
          data-testid="robot-boogie-active-count"
          className="px-3 py-1 rounded-full font-black text-xs uppercase tracking-wider"
          style={{
            backgroundColor: 'rgba(255,243,166,0.96)',
            color: 'var(--jma-dark)',
            border: '2px solid var(--jma-dark)',
            boxShadow: '0 3px 0 0 var(--jma-dark)',
          }}
        >
          {activeCount} / {totalTeams} playing
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

      {/* ==== MAIN STAGE ==== 
          Three vertically stacked zones — active band up top, Time
          Machine in the middle, tappable lineup at the bottom. All
          three sit inside a max-width column so the composition stays
          coherent on ultra-wide screens. */}
      <div className="relative z-10 flex-1 flex flex-col items-center w-full mx-auto px-2 md:px-4 pb-2"
           style={{ maxWidth: '1200px' }}>

        {/* ---- Active band (top) ----
            Flex-wrap so we get a second row automatically once there
            are 4+ dancers. `justify-center` keeps a partial row centered
            below the first (e.g. 5 dancers → row of 4 + row of 1). */}
        <div
          data-testid="robot-boogie-active-band"
          className="w-full flex-1 flex flex-wrap items-end justify-center content-end gap-x-1 gap-y-0 md:gap-x-2 pt-2 pb-0 overflow-hidden"
          style={{ minHeight: '180px' }}
        >
          {activeChars.length === 0 ? (
            <motion.div
              key="empty-hint"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center self-center pointer-events-none w-full"
              style={{ color: 'white' }}
            >
              <div
                className="font-black uppercase tracking-widest text-sm md:text-base"
                style={{ opacity: 0.85 }}
              >
                Tap a pal below
              </div>
              <div
                className="font-bold text-xs md:text-sm"
                style={{ opacity: 0.65, marginTop: '4px' }}
              >
                The Time Machine will zap them onto the stage ⚡
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              {activeChars.map((cfg) => {
                const n = activeChars.length;
                // Widths tuned so flex-wrap gives the row shape we want
                // on a ~1200 px stage:
                //   1 dancer  → huge solo
                //   2 dancers → row of 2
                //   3 dancers → row of 3
                //   4 dancers → 2 rows of 2 (per user brief)
                //   5-6       → 2 rows of 3 (max 3 per row)
                //   7-8       → 2 rows of 4
                let widthPct;
                let maxW;
                if (n === 1)      { widthPct = '55%'; maxW = '440px'; }
                else if (n === 2) { widthPct = '42%'; maxW = '360px'; }
                else if (n === 3) { widthPct = '30%'; maxW = '300px'; }
                else if (n === 4) { widthPct = '48%'; maxW = '420px'; } // → 2+2
                else if (n <= 6)  { widthPct = '34%'; maxW = '300px'; } // → 3-per-row max
                else               { widthPct = '23%'; maxW = '240px'; } // → 4-per-row max
                return (
                  <motion.div
                    key={cfg.id}
                    layout
                    initial={{ opacity: 0, y: 60, scale: 0.6 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.6 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    className="min-w-0 flex-shrink-0"
                    style={{
                      width: widthPct,
                      maxWidth: maxW,
                    }}
                  >
                    <CharacterSlot
                      cfg={cfg}
                      activeStemIndex={0}
                      onClick={handleCharacterClick}
                      zapping={zappingId === cfg.id}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* ---- Time Machine (centerpiece) ---- */}
        <div
          className="w-full flex justify-center items-center py-0 relative"
          data-testid="robot-boogie-time-machine-zone"
        >
          {/* Soft halo behind the machine so it reads as the anchor of
              the composition. Scales with the machine itself. */}
          <div
            aria-hidden="true"
            className="absolute pointer-events-none"
            style={{
              width: 'clamp(220px, 36vw, 440px)',
              aspectRatio: '2 / 1',
              background:
                'radial-gradient(ellipse at center, rgba(255,220,120,0.28) 0%, rgba(255,220,120,0.10) 40%, transparent 70%)',
              filter: 'blur(6px)',
            }}
          />
          <TimeMachine anyActive={activeCount > 0} flashKey={flashKey} />
        </div>

        {/* ---- Character lineup (bottom, always 8) ---- */}
        <div
          data-testid="robot-boogie-lineup"
          className="w-full flex justify-center items-end gap-1.5 md:gap-3 pt-0 pb-2"
        >
          {CHARACTERS.map((cfg) => (
            <CompactChar
              key={cfg.id}
              cfg={cfg}
              selected={!!dancing[cfg.id]}
              onClick={handleCharacterClick}
              zapping={zappingId === cfg.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
