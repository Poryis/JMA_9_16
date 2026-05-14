// RankBadge: small pill showing the kid's current Academy rank + progress to next.
// Tap to see celebration. Used on the home page.

import { motion } from 'framer-motion';
import useRank from '../hooks/useRank';

export default function RankBadge({ compact = false }) {
  const { currentRank, nextRank, progress, totalStickers } = useRank();

  return (
    <motion.div
      data-testid="rank-badge"
      className="flex items-center gap-3 rounded-full bg-white border-4 px-3 py-1.5 md:px-4 md:py-2 shadow-[0_4px_0_0_var(--jma-dark)]"
      style={{ borderColor: currentRank.color }}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, type: 'spring' }}
    >
      <div
        className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ backgroundColor: currentRank.badgeBg, borderColor: currentRank.color }}
      >
        <img
          src={currentRank.icon}
          alt={currentRank.title}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>
      <div className="flex flex-col leading-tight">
        <span
          className="text-[10px] uppercase tracking-wide font-bold"
          style={{ color: currentRank.color }}
        >
          Academy Rank
        </span>
        <span
          className="text-sm md:text-base font-black font-display"
          style={{ color: 'var(--jma-dark)' }}
          data-testid="rank-title"
        >
          {currentRank.title}
        </span>
        {!compact && (
          <span className="text-[10px] md:text-xs font-bold text-gray-500">
            {nextRank
              ? `${progress.current}/${progress.target} → ${nextRank.title}`
              : `★ ${totalStickers} stickers - Maestro!`}
          </span>
        )}
      </div>
      {!compact && nextRank && (
        <div className="hidden md:block w-20 h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full transition-all"
            style={{ width: `${progress.pct}%`, backgroundColor: currentRank.color }}
          />
        </div>
      )}
    </motion.div>
  );
}
