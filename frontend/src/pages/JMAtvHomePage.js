// JMAtv home — the channel guide.
//
// Feb 2026 overhaul: outer-space themed backdrop, drifting cartoon
// satellite (blimp-style behavior), and every channel tile now embeds
// its OWN mini CRT playing that channel's first episode on mute+loop.
// The character-host hero art and the tagline text are gone — the TV
// preview carries the tile now. An additional non-channel tile links
// to LESSONS so kids can jump into Music 101 from the same guide.

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tv, Lock, GraduationCap } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import MiniCRT from '../components/MiniCRT';
import SatelliteFlyby from '../components/SatelliteFlyby';
import { JMATV_CHANNELS } from '../data/jmatv';

// Pure-CSS starfield — 3 layers of tiny "stars" at different offsets so
// the sky feels textured without shipping a bitmap. Sits inside the
// page's absolute background layer.
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

// Distant nebula glow — two soft radial washes in on-brand accent tones
// so the dark sky doesn't feel flat.
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

// Distant tumbling planet — one small ringed body on the far edge for
// extra depth. Pure CSS, no asset.
function DistantPlanet() {
  return (
    <div
      aria-hidden="true"
      className="absolute pointer-events-none"
      style={{
        right: '4%',
        top: '10%',
        width: 'clamp(56px, 8vw, 120px)',
        aspectRatio: '1 / 1',
        zIndex: 0,
        opacity: 0.85,
      }}
    >
      <div
        style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 32% 30%, #FFE0A8 0%, #FF9500 45%, #B94E00 90%)',
          boxShadow: '0 0 24px rgba(255,149,0,0.4), inset -8px -8px 0 rgba(0,0,0,0.25)',
          border: '2px solid #0A2540',
        }}
      />
      {/* ring */}
      <div
        style={{
          position: 'absolute',
          left: '-18%', right: '-18%',
          top: '46%',
          height: '18%',
          borderRadius: '50%',
          border: '3px solid #FFE7C2',
          transform: 'rotate(-14deg)',
          opacity: 0.75,
        }}
      />
    </div>
  );
}

function ChannelTile({ channel, index, onClick }) {
  const epCount = channel.episodes.length;
  const isLocked = channel.comingSoon || epCount === 0;
  // Stable per-mount preview pick so the CRT doesn't reshuffle on re-render.
  const previewId = !isLocked ? channel.episodes[0].vimeoId : null;

  return (
    <motion.button
      type="button"
      data-testid={`jmatv-channel-${channel.id}`}
      onClick={onClick}
      disabled={isLocked}
      initial={{ y: 30, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 * index, type: 'spring', stiffness: 220 }}
      whileHover={isLocked ? undefined : { y: -4, scale: 1.02 }}
      whileTap={isLocked ? undefined : { scale: 0.97 }}
      className={`relative rounded-3xl text-left w-full bg-transparent border-0 p-0 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div
        className="relative rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: channel.color,
          border: '5px solid #0A2540',
          boxShadow: `0 10px 0 0 ${channel.accent}, 0 13px 0 0 #0A2540`,
          minHeight: 220,
          padding: 'clamp(14px, 2.6vw, 22px)',
          color: 'white',
          opacity: isLocked ? 0.7 : 1,
        }}
      >
        {/* Brand bug top-left */}
        <div className="flex items-center gap-2">
          <Tv className="w-5 h-5" style={{ opacity: 0.9 }} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ opacity: 0.85 }}>
            JMAtv
          </span>
        </div>

        <div className="flex-1 flex items-stretch relative mt-3 gap-3">
          {/* Text column */}
          <div className="relative flex-1 min-w-0 flex flex-col justify-end">
            <h2
              className="font-black font-display leading-[0.95]"
              style={{
                fontSize: 'clamp(18px, 2.4vw, 26px)',
                color: 'white',
                textShadow: `2px 2px 0 ${channel.accent}, 4px 4px 0 #0A2540`,
              }}
            >
              {channel.title}
            </h2>
            <div className="flex items-center gap-2 mt-3">
              {isLocked ? (
                <span
                  data-testid={`jmatv-channel-coming-soon-${channel.id}`}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
                  style={{ backgroundColor: 'rgba(10,37,64,0.65)', color: 'white' }}
                >
                  <Lock className="w-3 h-3" /> Coming Soon
                </span>
              ) : (
                <span
                  className="inline-block rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
                  style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: channel.accent }}
                >
                  {epCount} episode{epCount === 1 ? '' : 's'}
                </span>
              )}
            </div>
          </div>

          {/* Mini CRT preview — replaces the character-host art. Plays
              the channel's first episode muted + looped. Locked channels
              get a JMAtv logo screen so they still feel like a TV. */}
          <div className="relative flex-shrink-0" style={{ width: '40%' }}>
            <div className="absolute inset-0 flex items-end justify-end">
              <div style={{ width: '100%' }}>
                <MiniCRT
                  vimeoId={previewId}
                  fallbackLabel={isLocked ? 'Off Air' : null}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// A non-channel tile that jumps to /lessons. Same shape language as
// the channel tiles so it feels like part of the guide, but visually
// tagged with a graduation cap + "LESSONS" chip instead of "JMAtv".
function LessonsTile({ index, onClick }) {
  return (
    <motion.button
      type="button"
      data-testid="jmatv-channel-lessons"
      onClick={onClick}
      initial={{ y: 30, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 * index, type: 'spring', stiffness: 220 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="relative rounded-3xl text-left w-full bg-transparent border-0 p-0 cursor-pointer"
    >
      <div
        className="relative rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: '#34A853',
          border: '5px solid #0A2540',
          boxShadow: '0 10px 0 0 #1F7A36, 0 13px 0 0 #0A2540',
          minHeight: 220,
          padding: 'clamp(14px, 2.6vw, 22px)',
          color: 'white',
        }}
      >
        {/* Brand bug — swapped for a "Class" mark so it reads as different */}
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" style={{ opacity: 0.95 }} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ opacity: 0.9 }}>
            Music 101
          </span>
        </div>

        <div className="flex-1 flex items-stretch relative mt-3 gap-3">
          <div className="relative flex-1 min-w-0 flex flex-col justify-end">
            <h2
              className="font-black font-display leading-[0.95]"
              style={{
                fontSize: 'clamp(18px, 2.4vw, 26px)',
                color: 'white',
                textShadow: '2px 2px 0 #1F7A36, 4px 4px 0 #0A2540',
              }}
            >
              LESSONS
            </h2>
            <div className="flex items-center gap-2 mt-3">
              <span
                className="inline-block rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
                style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: '#1F7A36' }}
              >
                Start learning
              </span>
            </div>
          </div>

          <div className="relative flex-shrink-0" style={{ width: '40%' }}>
            <div className="absolute inset-0 flex items-end justify-end">
              <div style={{ width: '100%' }}>
                <MiniCRT vimeoId={null} fallbackLabel="Class in Session" />
              </div>
            </div>
          </div>
        </div>
      </div>
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
        // Deep-space gradient — dark navy at the top fading to almost
        // black at the horizon, sitting flush against the rest of the
        // JMA world's palette (uses the same jma-dark navy family).
        background:
          'radial-gradient(ellipse at 50% 0%, #1B2554 0%, #0A1030 55%, #050816 100%)',
      }}
    >
      {/* Space backdrop layers */}
      <Nebula />
      <Starfield />
      <DistantPlanet />
      <SatelliteFlyby />

      <GameHeader showHomeButton={true} backTo="/" />

      {/* Big JMAtv brand mark — same two-layer color-cycle mark used on
          the homepage RetroTV panel. */}
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

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {JMATV_CHANNELS.map((ch, i) => (
          <ChannelTile
            key={ch.id}
            channel={ch}
            index={i}
            onClick={() => navigate(`/jmatv/${ch.id}`)}
          />
        ))}
        {/* Lessons shortcut — lives with the channels but jumps out of
            JMAtv into the Music 101 lesson series. */}
        <LessonsTile
          index={JMATV_CHANNELS.length}
          onClick={() => navigate('/lessons')}
        />
      </div>
    </div>
  );
}
