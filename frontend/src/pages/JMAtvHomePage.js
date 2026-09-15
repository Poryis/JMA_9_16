// JMAtv home — the channel guide.
//
// Feb 2026 v2: every channel tile IS a fully-rendered retro CRT TV
// (no colored card wrapper). Each set is unique — different frame
// material, antenna, corner sticker, and knob color — so kids can
// tell shows apart at a glance the same way you spot a rack of
// arcade cabinets. A brass nameplate hangs under each TV with the
// channel title + episode chip.
//
// Space backdrop: nebula wash, twinkling starfield, a slowly rotating
// ringed planet with an orbiting moon, and a drifting cartoon
// satellite (blimp-style behavior). All pure CSS/SVG with the JMA
// world's thick-black-stroke aesthetic.

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, Smile, Music, Sparkles, GraduationCap } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import MiniCRT from '../components/MiniCRT';
import SatelliteFlyby from '../components/SatelliteFlyby';
import { JMATV_CHANNELS } from '../data/jmatv';

const JMA_DARK = '#0A2540';

// -------- Space backdrop --------------------------------------------
function Starfield() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: [
          'radial-gradient(1.5px 1.5px at 12% 18%, #FFFFFF 60%, transparent 61%)',
          'radial-gradient(1px   1px   at 28% 42%, #FFE7C2 60%, transparent 61%)',
          'radial-gradient(2px   2px   at 46% 12%, #FFFFFF 60%, transparent 61%)',
          'radial-gradient(1px   1px   at 58% 68%, #FFFFFF 60%, transparent 61%)',
          'radial-gradient(1.5px 1.5px at 72% 24%, #FFCC00 60%, transparent 61%)',
          'radial-gradient(1px   1px   at 84% 54%, #FFFFFF 60%, transparent 61%)',
          'radial-gradient(2px   2px   at 92% 82%, #FFFFFF 60%, transparent 61%)',
          'radial-gradient(1px   1px   at 6%  74%, #FFE7C2 60%, transparent 61%)',
          'radial-gradient(1.5px 1.5px at 22% 88%, #FFFFFF 60%, transparent 61%)',
          'radial-gradient(1px   1px   at 38% 32%, #FFFFFF 60%, transparent 61%)',
          'radial-gradient(1px   1px   at 66% 92%, #FFFFFF 60%, transparent 61%)',
          'radial-gradient(1.5px 1.5px at 80% 8%,  #FFCC00 60%, transparent 61%)',
        ].join(', '),
        animation: 'jma-pulse 3.8s ease-in-out infinite',
        opacity: 0.9,
      }}
    />
  );
}

function Nebula() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        background: [
          'radial-gradient(ellipse 60% 40% at 22% 30%, rgba(175,82,222,0.35) 0%, transparent 60%)',
          'radial-gradient(ellipse 55% 35% at 78% 70%, rgba(0,168,232,0.30)  0%, transparent 60%)',
          'radial-gradient(ellipse 40% 30% at 50% 15%, rgba(255,204,0,0.10)  0%, transparent 60%)',
        ].join(', '),
      }}
    />
  );
}

// Ringed planet drawn as inline SVG so it can carry the same thick
// JMA-dark outline as the rest of the world. Ring rotates slowly, a
// small moon orbits around it.
function DistantPlanet() {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute pointer-events-none"
      style={{
        right: '3%',
        top: '9%',
        width: 'clamp(84px, 11vw, 160px)',
        aspectRatio: '1 / 1',
        zIndex: 0,
        filter: 'drop-shadow(0 0 24px rgba(255,149,0,0.35))',
      }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <radialGradient id="planetShade" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFE0A8" />
            <stop offset="45%" stopColor="#FF9500" />
            <stop offset="100%" stopColor="#8A2B00" />
          </radialGradient>
        </defs>

        {/* Rotating ring — behind the body */}
        <g>
          <motion.ellipse
            cx="100" cy="100" rx="94" ry="26"
            fill="none"
            stroke="#FFE7C2"
            strokeWidth="10"
            transform="rotate(-14 100 100)"
            animate={{ rotate: [-14, -8, -14] }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          />
          <ellipse cx="100" cy="100" rx="94" ry="26" fill="none" stroke={JMA_DARK} strokeWidth="4" transform="rotate(-14 100 100)" />
        </g>

        {/* Planet body */}
        <circle cx="100" cy="100" r="58" fill="url(#planetShade)" stroke={JMA_DARK} strokeWidth="5" />
        {/* Terminator shading */}
        <path
          d="M 100 42 A 58 58 0 0 1 100 158 A 44 58 0 0 0 100 42 Z"
          fill="rgba(0,0,0,0.28)"
        />
        {/* Cratery bands */}
        <path d="M 62 92 Q 100 82 138 92" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="3" />
        <path d="M 66 110 Q 100 118 134 110" fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="3" />

        {/* Ring in FRONT of the body — completes the wrap illusion */}
        <path
          d="M 6 100 A 94 26 0 0 0 194 100"
          fill="none"
          stroke="#FFE7C2"
          strokeWidth="10"
          transform="rotate(-14 100 100)"
        />
        <path
          d="M 6 100 A 94 26 0 0 0 194 100"
          fill="none"
          stroke={JMA_DARK}
          strokeWidth="4"
          transform="rotate(-14 100 100)"
        />
      </svg>

      {/* Orbiting moon — separate element so it can rotate cleanly
          around the planet's center at its own cadence. */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '50% 50%',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      >
        <div
          style={{
            position: 'absolute',
            left: '92%',
            top: '46%',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #C0C0C0 60%, #808080 100%)',
            border: `3px solid ${JMA_DARK}`,
            boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// -------- Per-channel CRT theming ----------------------------------
// Each channel tile gets its own frame, antenna, sticker, knob color.
// Keyed off the channel id in data/jmatv.js. Missing entries fall back
// to a default wooden set.
const CRT_STYLES = {
  'fun-facts': {
    frame: 'wood',
    accent: '#FFCC00',
    knobColor: '#FF9500',
    antenna: 'curly',
    sticker: { icon: <HelpCircle className="w-6 h-6" strokeWidth={3} />, bg: '#FFCC00' },
  },
  'puns-finn-danger': {
    frame: 'metal',
    accent: '#00A8E8',
    knobColor: '#4285F4',
    antenna: 'ball-tips',
    sticker: { icon: <Smile className="w-6 h-6" strokeWidth={3} />, bg: '#4285F4' },
  },
  'jma-music-videos': {
    frame: 'painted-red',
    accent: '#FF3B30',
    knobColor: '#FFCC00',
    antenna: 'coathanger',
    sticker: { icon: <Music className="w-6 h-6" strokeWidth={3} />, bg: '#FF3B30' },
  },
  'variety-show': {
    frame: 'purple-sparkle',
    accent: '#AF52DE',
    knobColor: '#FFCC00',
    antenna: 'star-tips',
    sticker: { icon: <Sparkles className="w-6 h-6" strokeWidth={3} />, bg: '#AF52DE' },
    staticNoise: true,
  },
};

const LESSONS_STYLE = {
  frame: 'chalkboard',
  accent: '#FFE7C2',
  knobColor: '#8B5A2B',
  antenna: 'apple',
  sticker: { icon: <GraduationCap className="w-6 h-6" strokeWidth={3} />, bg: '#34A853' },
};

// -------- Nameplate --------------------------------------------------
// Small "brass" plaque that hangs under each TV. Channel accent tint
// on the label chip so different shows still feel color-coded.
function Nameplate({ title, chip, chipColor }) {
  return (
    <div
      className="relative w-full mt-3 flex flex-col items-center text-center"
      style={{ zIndex: 2 }}
    >
      <div
        className="relative rounded-xl px-3 py-2 w-full max-w-[260px]"
        style={{
          background: 'linear-gradient(180deg, #FFE7A8 0%, #E9B84F 100%)',
          border: `3px solid ${JMA_DARK}`,
          boxShadow: `0 4px 0 0 ${JMA_DARK}`,
        }}
      >
        <h2
          className="font-black font-display uppercase leading-[0.95]"
          style={{
            fontSize: 'clamp(15px, 2vw, 20px)',
            color: JMA_DARK,
            letterSpacing: '0.02em',
          }}
        >
          {title}
        </h2>
        {chip && (
          <span
            className="inline-block mt-1.5 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
            style={{
              backgroundColor: chipColor,
              color: '#FFFFFF',
              border: `2px solid ${JMA_DARK}`,
            }}
          >
            {chip}
          </span>
        )}
      </div>
    </div>
  );
}

// -------- Channel tile -----------------------------------------------
function ChannelTile({ channel, index, onClick }) {
  const epCount = channel.episodes.length;
  const isLocked = channel.comingSoon || epCount === 0;
  const previewId = !isLocked ? channel.episodes[0].vimeoId : null;
  const style = CRT_STYLES[channel.id] || { frame: 'wood', accent: '#FFCC00', antenna: 'rabbit-ears' };

  return (
    <motion.button
      type="button"
      data-testid={`jmatv-channel-${channel.id}`}
      onClick={onClick}
      disabled={isLocked}
      initial={{ y: 30, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 * index, type: 'spring', stiffness: 220 }}
      whileHover={isLocked ? undefined : { y: -6, scale: 1.03 }}
      whileTap={isLocked ? undefined : { scale: 0.97 }}
      className={`relative bg-transparent border-0 p-0 w-full flex flex-col items-center ${isLocked ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
    >
      <div className="w-full max-w-[280px] mx-auto pt-6">
        <MiniCRT
          vimeoId={previewId}
          fallbackLabel={isLocked ? 'Off Air' : null}
          theme={{ frame: style.frame, accent: style.accent, knobColor: style.knobColor }}
          antenna={style.antenna}
          sticker={style.sticker}
          staticNoise={style.staticNoise && !previewId}
        />
      </div>
      <Nameplate
        title={channel.title}
        chip={isLocked ? 'Coming Soon' : `${epCount} episode${epCount === 1 ? '' : 's'}`}
        chipColor={isLocked ? '#6B7280' : style.accent}
      />
    </motion.button>
  );
}

// The Lessons shortcut — same visual language, chalkboard TV theme,
// jumps out of JMAtv into Music 101 lessons.
function LessonsTile({ index, onClick }) {
  return (
    <motion.button
      type="button"
      data-testid="jmatv-channel-lessons"
      onClick={onClick}
      initial={{ y: 30, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 * index, type: 'spring', stiffness: 220 }}
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="relative bg-transparent border-0 p-0 w-full flex flex-col items-center cursor-pointer"
    >
      <div className="w-full max-w-[280px] mx-auto pt-6">
        <MiniCRT
          vimeoId={null}
          fallbackLabel="Class in Session"
          theme={{ frame: LESSONS_STYLE.frame, accent: LESSONS_STYLE.accent, knobColor: LESSONS_STYLE.knobColor }}
          antenna={LESSONS_STYLE.antenna}
          sticker={LESSONS_STYLE.sticker}
        />
      </div>
      <Nameplate title="LESSONS" chip="Music 101" chipColor="#34A853" />
    </motion.button>
  );
}

export default function JMAtvHomePage() {
  const navigate = useNavigate();
  return (
    <div
      data-testid="jmatv-home"
      className="min-h-screen flex flex-col items-center px-3 sm:px-6 pt-16 md:pt-20 pb-10 relative overflow-x-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, #1B2554 0%, #0A1030 55%, #050816 100%)',
      }}
    >
      <Nebula />
      <Starfield />
      <DistantPlanet />
      <SatelliteFlyby />

      <GameHeader showHomeButton={true} backTo="/" />

      <motion.div
        className="relative z-10 mt-2 mb-6 md:mb-8 text-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div
          className="relative mx-auto"
          style={{ width: 'clamp(160px, 24vw, 280px)', aspectRatio: '1361 / 1156' }}
        >
          <img
            src="assets/ui/jmatv-logo-v2-frame.png"
            alt="JMAtv"
            draggable={false}
            className="absolute inset-0 w-full h-full object-contain jmatv-color-cycle"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 jmatv-letters-mask"
            style={{
              WebkitMaskImage: `url(${process.env.PUBLIC_URL || ''}/assets/ui/jmatv-logo-v2-letters.png)`,
              maskImage: `url(${process.env.PUBLIC_URL || ''}/assets/ui/jmatv-logo-v2-letters.png)`,
            }}
          />
        </div>
        <p className="text-sm md:text-base font-bold mt-2" style={{ color: '#FFE7C2' }}>
          Pick something. Hit play. Hang out.
        </p>
      </motion.div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {JMATV_CHANNELS.map((ch, i) => (
          <ChannelTile
            key={ch.id}
            channel={ch}
            index={i}
            onClick={() => navigate(`/jmatv/${ch.id}`)}
          />
        ))}
        <LessonsTile index={JMATV_CHANNELS.length} onClick={() => navigate('/lessons')} />
      </div>
    </div>
  );
}
