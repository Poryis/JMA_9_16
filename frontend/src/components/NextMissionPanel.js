// NextMissionPanel — big "do this next" banner on the homepage.
//
// Reads the current best mission from useNextMission and renders a banner
// styled in the mission's DOMAIN color. Clicking it routes to the relevant
// game page. Hidden when the kid has earned every achievement.
//
// Visual: thick chunky banner with the domain character on the left, the
// instruction in the middle, and a big GO button on the right. On mobile
// the whole thing becomes tappable so kids can hit anywhere.

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Target, ChevronRight, PartyPopper } from 'lucide-react';
import useNextMission from '../hooks/useNextMission';

export default function NextMissionPanel() {
  const navigate = useNavigate();
  const { mission, complete } = useNextMission();

  if (complete) {
    return (
      <motion.div
        data-testid="next-mission-complete"
        className="w-full max-w-3xl mx-auto rounded-2xl border-4 px-4 py-3 flex items-center gap-3"
        style={{
          borderColor: 'var(--jma-dark)',
          background: 'linear-gradient(135deg, #FFE07A 0%, #FFCC00 100%)',
          boxShadow: '0 6px 0 0 var(--jma-dark)',
        }}
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: 'spring' }}
      >
        <PartyPopper className="w-7 h-7" style={{ color: 'var(--jma-dark)' }} />
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wide font-black opacity-70" style={{ color: 'var(--jma-dark)' }}>
            ✨ All Missions Complete
          </div>
          <div className="text-base md:text-lg font-black font-display" style={{ color: 'var(--jma-dark)' }}>
            You&apos;re a true Maestro! Keep jamming.
          </div>
        </div>
      </motion.div>
    );
  }

  if (!mission) return null;

  const { domain, tier, instruction, cta, achievementName, route } = mission;

  return (
    <motion.button
      data-testid="next-mission-panel"
      onClick={() => navigate(route)}
      className="w-full max-w-3xl mx-auto rounded-2xl border-4 px-3 py-2 md:px-4 md:py-3 flex items-center gap-3 text-left group cursor-pointer touch-manipulation"
      style={{
        borderColor: 'var(--jma-dark)',
        background: `linear-gradient(135deg, ${domain.color}25 0%, ${domain.color}55 100%)`,
        boxShadow: '0 6px 0 0 var(--jma-dark)',
      }}
      initial={{ scale: 0.95, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ delay: 0.6, type: 'spring' }}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ y: 2, scale: 0.99 }}
    >
      {/* Domain character avatar — colorful badge framing */}
      <div
        className="flex-shrink-0 rounded-2xl border-3 flex items-center justify-center overflow-hidden"
        style={{
          width: 'clamp(48px, 10vw, 72px)',
          height: 'clamp(48px, 10vw, 72px)',
          backgroundColor: 'white',
          borderColor: domain.color,
          boxShadow: '0 3px 0 0 var(--jma-dark)',
        }}
      >
        <img src={domain.icon} alt={domain.label} className="w-full h-full object-contain" draggable={false} />
      </div>

      {/* Middle column — mission text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Target className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" style={{ color: domain.color }} />
          <span
            className="text-[10px] md:text-xs uppercase tracking-wide font-black"
            style={{ color: domain.color }}
          >
            Next Mission
          </span>
          <span
            className="text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded-full ml-auto md:ml-0 flex-shrink-0"
            style={{
              backgroundColor: tier.frame,
              color: tier.ribbonBg,
              border: `2px solid ${tier.ribbonBg}`,
            }}
            data-testid="next-mission-tier"
          >
            {tier.ribbon}
          </span>
        </div>
        <div
          className="text-sm md:text-lg font-black font-display leading-tight"
          style={{ color: 'var(--jma-dark)' }}
          data-testid="next-mission-instruction"
        >
          {instruction}
        </div>
        <div
          className="text-[10px] md:text-xs font-bold mt-0.5 truncate"
          style={{ color: 'var(--jma-dark)', opacity: 0.7 }}
        >
          Earns: <span style={{ color: domain.color }}>{achievementName}</span>
        </div>
      </div>

      {/* Right column — GO button */}
      <div
        className="flex-shrink-0 chunky-btn flex items-center gap-1 text-xs md:text-sm font-black px-3 py-1.5 md:px-4 md:py-2"
        style={{
          backgroundColor: domain.color,
          color: 'white',
        }}
        data-testid="next-mission-go"
      >
        <span className="hidden sm:inline">{cta}</span>
        <span className="sm:hidden">GO</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </motion.button>
  );
}
