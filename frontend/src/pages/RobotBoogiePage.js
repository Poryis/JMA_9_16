// Robot Boogie — the Incredibox-style mixer game.
//
// Layout goals (v2, per user feedback):
//   • Characters BIG enough to actually enjoy playing with (~180-220 px
//     per slot on desktop).
//   • Time machine relocated so it doesn't cover the disco ball on the bg.
//   • No name plates — the characters carry themselves.
//   • Animation frames PRELOADED into the DOM (stacked <img> with
//     display: none/block toggling) so the loop cycles instantly instead
//     of flickering while each frame's PNG loads from the network.
//   • Audio sync handled sample-accurately by the Web-Audio version of
//     useRobotBoogieAudio — see that file for details.
//
// Team pairing (v3, Feb 28 2026):
//   Stems are grouped by INSTRUMENT into 5 "teams" — bass, drum, guitar,
//   horns (Jazzy + Jellybone), synth (Lou + Robot 1 + Robot 2). A team
//   only ever plays ONE stem at a time. Tapping any team member swaps
//   the team's active member; tapping the same member cycles through
//   their stems then turns the team off. This caps the mix at 5 layers
//   even if every character is toggled on. See TEAMS + CHAR_TO_TEAM.
//
// Grid: 4 columns × 2 rows on desktop, 2 × 4 on mobile.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import useRobotBoogieAudio from '../hooks/useRobotBoogieAudio';

// ============================================================
// Character config
//
// TEAM PAIRING RULES (per user, Feb 28 2026):
//   • Bass  → Finn only
//   • Drums → Chunk only
//   • Guitar → Charlie only
//   • Horns → Jazzy + Dr Jellybone (shared slot)
//   • Synth → Lou + Robot 1 + Robot 2 (shared slot; Lou temporarily
//             lives here until we decide his final home)
//
// A "team" only ever plays ONE stem at a time. Tapping ANY team member
// activates that member with their first stem. Tapping the same member
// again cycles through their stems, then turns the team off. Tapping a
// DIFFERENT member of an already-active team swaps to that member's
// first stem — so if every character is toggled on you still only hear
// 1 bass + 1 drum + 1 guitar + 1 horns + 1 synth = 5 layers total.
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
    stems: ['robot-drum-1', 'robot-drum-1-1', 'robot-drum-2', 'robot-drum-3'],
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
    stems: ['robot-synth-1'],
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

// Team → member ids. Order matters only for reset ordering; the actual
// team routing uses CHAR_TO_TEAM below.
const TEAMS = {
  bass:   ['finn'],
  drum:   ['chunk'],
  guitar: ['charlie'],
  horns:  ['jazzy', 'jellybone'],
  synth:  ['lou', 'robot1', 'robot2'],
};
const CHAR_TO_TEAM = Object.entries(TEAMS).reduce((acc, [teamId, members]) => {
  members.forEach((id) => { acc[id] = teamId; });
  return acc;
}, {});

// ============================================================
// Time machine — small chip that lives in the top-RIGHT corner so it
// doesn't overlap the disco ball at the top-center of the background.
//
// Reel behavior:
//   • Idle when nothing is playing (single time-machine-idle.png).
//   • Loops the 8-frame reel CONTINUOUSLY while any character is active.
//   • A tap plays a fun Shield-style flourish animation (cycles through a
//     set of variants) — same easter-egg vibe as the home page logo.
// ============================================================
const TIME_MACHINE_ANIMS = [
  { keyframes: { rotate: [0, -14, 12, -8, 6, 0],  scale: [1, 1.08, 1.10, 1.04, 1.02, 1] }, duration: 0.9 },
  { keyframes: { rotate: [0, 360],                scale: [1, 1.10, 1],                     y: [0, -10, 0] }, duration: 0.95 },
  { keyframes: { rotate: [0, 0],                  scale: [1, 1.35, 0.92, 1.12, 1],         y: [0, -14, 0, -6, 0] }, duration: 0.85 },
  { keyframes: { rotateY: [0, 360],               scale: [1, 1.06, 1],                     y: [0, -8, 0] }, duration: 0.95 },
  { keyframes: { x: [0, -10, 10, -7, 7, -4, 4, 0], rotate: [0, -4, 4, -2, 2, 0, 0, 0],     scale: [1, 1.04, 1.04, 1.04, 1.04, 1.02, 1.02, 1] }, duration: 0.95 },
];

function TimeMachine({ anyActive }) {
  const [frame, setFrame] = useState(-1);
  const timerRef = useRef(null);
  const tmControls = useAnimationControls();
  const hitsRef = useRef(0);

  // Loop the reel while any stem is active; otherwise return to idle.
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

  // Shield-style easter-egg flourish on tap.
  const handleTap = () => {
    const anim = TIME_MACHINE_ANIMS[hitsRef.current % TIME_MACHINE_ANIMS.length];
    hitsRef.current += 1;
    tmControls.start({
      ...anim.keyframes,
      transition: { duration: anim.duration, ease: 'easeInOut' },
    });
  };

  // Preload all 8 frames + idle by rendering them stacked with display
  // toggling — no fetch delay when the reel plays. Position:fixed so its
  // location is anchored to the viewport (not the min-h-screen wrapper,
  // which can grow wider than the viewport briefly during layout).
  return (
    <motion.button
      type="button"
      data-testid="robot-boogie-time-machine"
      aria-label="Time machine"
      onClick={handleTap}
      className="fixed select-none bg-transparent border-0 p-0 cursor-pointer"
      style={{
        right: 'clamp(12px, 2vw, 32px)',
        top: 'clamp(80px, 12vh, 130px)',
        width: 'clamp(96px, 12vw, 160px)',
        zIndex: 15,
        touchAction: 'manipulation',
      }}
      animate={tmControls}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
    >
      <img
        src="assets/robot-boogie/time-machine-idle.png"
        alt=""
        draggable={false}
        className="w-full h-auto pointer-events-none"
        style={{
          display: frame === -1 ? 'block' : 'none',
          filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.55))',
        }}
      />
      {Array.from({ length: 8 }, (_, i) => (
        <img
          key={i}
          src={`assets/robot-boogie/time-machine/time-machine-${String(i + 1).padStart(2, '0')}.png`}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-auto pointer-events-none"
          style={{
            display: frame === i ? 'block' : 'none',
            filter: 'drop-shadow(0 0 24px rgba(255,220,120,0.9))',
          }}
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

        {/* Single "playing" still (Jazzy). Wobble + hop animation gives
            the illusion of "playing" without needing a distinct pose,
            since her legs-included neutral is reused here. */}
        {cfg.playingSingle && (
          <motion.img
            src={cfg.playingSingle}
            alt=""
            draggable={false}
            className="max-w-full max-h-full object-contain object-bottom pointer-events-none absolute inset-0 m-auto"
            style={{ display: isActive ? 'block' : 'none' }}
            animate={isActive ? { rotate: [-5, 5, -5], y: [0, -8, 0] } : {}}
            transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut' }}
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
// Main page
// ============================================================
const EMPTY_TEAM_STATE = Object.keys(TEAMS).reduce((acc, t) => {
  acc[t] = null;
  return acc;
}, {});

export default function RobotBoogiePage() {
  const { setStemActive, muteAll } = useRobotBoogieAudio();

  // Per-team state: null (nobody playing) OR { charId, stemIndex }.
  // A "team" is a shared instrument slot — see TEAMS above.
  const [teamState, setTeamState] = useState(() => ({ ...EMPTY_TEAM_STATE }));

  // Track which character was most recently zapped (for the LightningBolt
  // overlay on the character slot).
  const [zappingId, setZappingId] = useState(null);

  const handleCharacterClick = useCallback((charId) => {
    const cfg = CHARACTERS.find((c) => c.id === charId);
    if (!cfg) return;
    const teamId = CHAR_TO_TEAM[charId];
    const current = teamState[teamId]; // null OR { charId, stemIndex }

    setTeamState((prev) => {
      const cur = prev[teamId];

      // Team is off → activate this char with their first stem.
      if (cur === null) {
        setStemActive(cfg.stems[0], true);
        return { ...prev, [teamId]: { charId, stemIndex: 0 } };
      }

      // Same character tapped again → advance to their next stem OR
      // turn the team off if we've cycled through all of them.
      if (cur.charId === charId) {
        setStemActive(cfg.stems[cur.stemIndex], false);
        if (cur.stemIndex + 1 < cfg.stems.length) {
          setStemActive(cfg.stems[cur.stemIndex + 1], true);
          return { ...prev, [teamId]: { charId, stemIndex: cur.stemIndex + 1 } };
        }
        return { ...prev, [teamId]: null };
      }

      // A DIFFERENT team member tapped → swap. Mute the currently-active
      // member's stem, activate the new member's first stem. Only one
      // team member is ever visually + audibly active at a time.
      const prevCfg = CHARACTERS.find((c) => c.id === cur.charId);
      if (prevCfg) setStemActive(prevCfg.stems[cur.stemIndex], false);
      setStemActive(cfg.stems[0], true);
      return { ...prev, [teamId]: { charId, stemIndex: 0 } };
    });

    // Only flash the lightning bolt if this tap actually turns the
    // character ON (or swaps them in). Turning-off shouldn't zap.
    const willBeActive =
      current === null ||
      current.charId !== charId ||
      current.stemIndex + 1 < cfg.stems.length;
    if (willBeActive) {
      setZappingId(charId);
      setTimeout(() => setZappingId(null), 360);
    }
  }, [teamState, setStemActive]);

  const handleReset = useCallback(() => {
    muteAll();
    setTeamState({ ...EMPTY_TEAM_STATE });
  }, [muteAll]);

  const activeCount = useMemo(
    () => Object.values(teamState).filter((v) => v !== null).length,
    [teamState]
  );
  const totalTeams = Object.keys(TEAMS).length;

  // Helper: for a given character, what stem index (if any) is this
  // character currently playing? -1 means "not this character."
  const activeStemIndexFor = useCallback((charId) => {
    const teamId = CHAR_TO_TEAM[charId];
    const team = teamState[teamId];
    if (team && team.charId === charId) return team.stemIndex;
    return -1;
  }, [teamState]);

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
      {/* Purple wash at bottom for depth — kept OFF the top area so the
          disco ball on the bg stays visible. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '35%',
          background:
            'linear-gradient(180deg, transparent 0%, rgba(20,10,45,0.5) 100%)',
        }}
      />

      <GameHeader title="Robot Boogie" showHomeButton={true} />

      <TimeMachine anyActive={activeCount > 0} />

      {/* Header ribbon: active count + reset */}
      <div className="relative z-10 flex items-center justify-center gap-3 mt-16 md:mt-20 pt-3">
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

      {/* Character grid — 4×2 on desktop, 2×4 on mobile. No name plates
          per user feedback; kids identify their pals by outfit + song.
          `mx-auto` + explicit max-width centers reliably instead of
          relying on a flex-1 wrapper (which was letting content force
          horizontal overflow). */}
      <div className="relative z-10 mx-auto w-full px-3 md:px-6 pt-4 pb-6" style={{ maxWidth: '1160px' }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-5">
          {CHARACTERS.map((cfg) => (
            <div key={cfg.id} className="min-w-0">
              <CharacterSlot
                cfg={cfg}
                activeStemIndex={activeStemIndexFor(cfg.id)}
                onClick={handleCharacterClick}
                zapping={zappingId === cfg.id}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Hint (only before anything is playing) */}
      {activeCount === 0 && (
        <motion.div
          className="absolute z-10 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs md:text-sm font-black uppercase tracking-wider pointer-events-none"
          style={{
            bottom: 'clamp(16px, 3vh, 32px)',
            backgroundColor: 'rgba(0,0,0,0.72)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.35)',
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Tap a pal to bring them to life ⚡
        </motion.div>
      )}
    </div>
  );
}
