// JMAtv home — the channel guide. Lists every channel as a TV-flavoured
// tile. Each tile previews via the JMAtv brand mark + tagline + episode
// count. Tapping drops the kid into the channel's episode list.

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tv, Lock } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import { JMATV_CHANNELS } from '../data/jmatv';

function ChannelTile({ channel, index, onClick }) {
  const epCount = channel.episodes.length;
  const isLocked = channel.comingSoon || epCount === 0;
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
          // Removed rigid 5/3 aspect-ratio — at 3-column desktop widths the
          // cards were too short and the tagline + episode chip clipped off
          // the bottom. Using a min-height instead lets each card grow to
          // fit its content while still feeling like a chunky TV tile.
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
          {/* Text column — given a fixed share so the character art never
              squeezes the title / tagline. */}
          <div className="relative flex-1 min-w-0 flex flex-col justify-end">
            <h2
              className="font-black font-display leading-none"
              style={{
                fontSize: 'clamp(22px, 3.2vw, 34px)',
                color: 'white',
                textShadow: `2px 2px 0 ${channel.accent}, 4px 4px 0 #0A2540`,
              }}
            >
              {channel.title}
            </h2>
            <p className="text-xs md:text-sm font-bold mt-2 opacity-90 leading-snug">
              {channel.tagline}
            </p>
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

          {/* Character "host" art — fixed-width column on the right so it
              never overlaps the text or escapes the card. drop-shadow gives
              it pop against the channel color. */}
          {channel.icon && (
            <div className="relative flex-shrink-0" style={{ width: '38%' }}>
              <img
                src={channel.icon}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="absolute object-contain pointer-events-none select-none"
                style={{
                  right: 'clamp(-12px, -1vw, -6px)',
                  bottom: -8,
                  width: '120%',
                  maxHeight: '130%',
                  filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.28))',
                }}
              />
            </div>
          )}
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
      className="min-h-screen flex flex-col items-center px-3 sm:px-6 pt-16 md:pt-20 pb-10 relative"
      style={{
        // Channel-guide dark background — sells "you're watching TV now".
        background:
          'radial-gradient(ellipse at top, #1E293B 0%, #0F172A 60%, #050816 100%)',
      }}
    >
      <GameHeader showHomeButton={true} />

      {/* Big JMAtv brand mark + tagline */}
      <motion.div
        className="relative z-10 mt-2 mb-6 md:mb-8 text-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <img
          src="assets/ui/jmatv-logo-v2.png"
          alt="JMAtv"
          draggable={false}
          className="mx-auto object-contain jmatv-color-cycle"
          style={{
            width: 'clamp(160px, 24vw, 280px)',
          }}
        />
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
      </div>
    </div>
  );
}
