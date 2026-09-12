// HomeProgressCard — slim horizontal strip that combines the kid's
// Academy rank + newest sticker into one row. Deliberately compact
// (~60px tall) so the Home page reads calm for early-elementary kids.
// Both halves tap through to the Sticker Book.

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import useRank from '../hooks/useRank';
import useStickers from '../hooks/useStickers';
import { STICKER_MAP } from '../data/stickers';

export default function HomeProgressCard() {
  const navigate = useNavigate();
  const { currentRank, nextRank, progress, achievementCount } = useRank();
  const { earned } = useStickers();

  const newest = useMemo(() => {
    const ids = Object.keys(earned);
    if (ids.length === 0) return null;
    ids.sort((a, b) => {
      const at = new Date(earned[a].earnedAt || 0).getTime();
      const bt = new Date(earned[b].earnedAt || 0).getTime();
      return bt - at;
    });
    return STICKER_MAP[ids[0]];
  }, [earned]);

  const totalEarned = Object.keys(earned).length;

  return (
    <motion.button
      type="button"
      data-testid="home-progress-card"
      onClick={() => navigate('/sticker-book')}
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, type: 'spring' }}
      whileHover={{ y: -2, scale: 1.005 }}
      whileTap={{ y: 1, scale: 0.995 }}
      className="relative w-full flex items-stretch rounded-full bg-white border-3 overflow-hidden cursor-pointer touch-manipulation"
      style={{
        borderColor: 'var(--jma-dark)',
        borderWidth: 3,
        boxShadow: '0 4px 0 0 var(--jma-dark)',
        height: 56,
      }}
      aria-label={`${currentRank.title} · ${newest ? `Newest sticker ${newest.name}` : 'Play to earn stickers'} · open Sticker Book`}
    >
      {/* Left — Academy Rank */}
      <div
        className="flex-1 flex items-center gap-2.5 px-3 md:px-4 min-w-0"
        style={{ backgroundColor: currentRank.badgeBg }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-white border-2"
          style={{ borderColor: currentRank.color }}
        >
          <img
            src={currentRank.icon}
            alt=""
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>
        <div className="flex flex-col leading-tight flex-1 min-w-0 text-left">
          <span
            className="text-[9px] md:text-[10px] uppercase tracking-wide font-black"
            style={{ color: currentRank.color }}
          >
            Rank
          </span>
          <span
            className="text-sm md:text-base font-black font-display truncate"
            style={{ color: 'var(--jma-dark)' }}
            data-testid="rank-title"
          >
            {currentRank.title}
          </span>
        </div>
        {nextRank ? (
          <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
            <span
              className="text-[10px] font-black font-display"
              style={{ color: currentRank.color }}
            >
              {progress.current}/{progress.target}
            </span>
            <div className="w-20 h-1.5 rounded-full bg-white/70 overflow-hidden">
              <div
                className="h-full transition-all"
                style={{
                  width: `${progress.pct}%`,
                  backgroundColor: currentRank.color,
                }}
              />
            </div>
          </div>
        ) : (
          <span
            className="hidden sm:inline text-[10px] font-black uppercase tracking-wide flex-shrink-0"
            style={{ color: currentRank.color }}
          >
            {achievementCount} 🏆
          </span>
        )}
      </div>

      {/* Divider */}
      <div
        aria-hidden="true"
        className="w-[3px] flex-shrink-0"
        style={{ backgroundColor: 'var(--jma-dark)' }}
      />

      {/* Right — Newest Sticker (or empty-state nudge) */}
      <div
        className="flex-1 flex items-center gap-2.5 px-3 md:px-4 min-w-0"
        style={{
          background: 'linear-gradient(135deg, #FFF9E6 0%, #FFE4F0 100%)',
        }}
      >
        {newest ? (
          <>
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-full p-0.5 flex-shrink-0 border-2"
              style={{
                backgroundColor: newest.color || '#fff',
                borderColor: 'var(--jma-dark)',
                width: 38,
                height: 38,
              }}
            >
              <img
                src={newest.icon}
                alt=""
                className="w-full h-full object-contain"
                draggable={false}
              />
            </motion.div>
            <div className="flex flex-col leading-tight flex-1 min-w-0 text-left">
              <span
                className="text-[9px] md:text-[10px] uppercase tracking-wide font-black flex items-center gap-1"
                style={{ color: 'var(--jma-dark)' }}
              >
                <Sparkles className="w-3 h-3" style={{ color: '#F39C12' }} />
                Newest
              </span>
              <span
                className="text-sm md:text-base font-black font-display truncate"
                style={{ color: 'var(--jma-dark)' }}
              >
                {newest.name}
              </span>
            </div>
            <span
              className="hidden sm:inline text-[10px] font-black uppercase tracking-wide flex-shrink-0"
              style={{ color: 'var(--jma-dark)', opacity: 0.6 }}
            >
              {totalEarned} →
            </span>
          </>
        ) : (
          <>
            <div
              className="rounded-full flex items-center justify-center flex-shrink-0 border-2 border-dashed"
              style={{
                width: 38,
                height: 38,
                backgroundColor: '#FFF3B0',
                borderColor: 'var(--jma-dark)',
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: '#F39C12' }} />
            </div>
            <span
              className="text-xs md:text-sm font-black font-display leading-tight text-left flex-1"
              style={{ color: 'var(--jma-dark)' }}
            >
              Play to earn your first sticker!
            </span>
          </>
        )}
      </div>
    </motion.button>
  );
}
