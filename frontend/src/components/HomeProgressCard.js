// HomeProgressCard — single wide card that combines the kid's Academy
// rank + their newest sticker into one row. Replaces the earlier trio of
// separate chips (RankBadge + PracticeStreakChip + StickerSpotlight) so
// the Home page reads calmer for early elementary kids. Both halves tap
// through to the Sticker Book. PracticeStreakChip still renders above
// this card when active — it's a badge earned via return visits, not a
// permanent piece of chrome.

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
  const go = () => navigate('/sticker-book');

  return (
    <motion.button
      type="button"
      data-testid="home-progress-card"
      onClick={go}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, type: 'spring' }}
      whileHover={{ y: -3, scale: 1.005 }}
      whileTap={{ y: 2, scale: 0.99 }}
      className="relative w-full flex items-stretch rounded-3xl bg-white border-4 overflow-hidden cursor-pointer touch-manipulation"
      style={{
        borderColor: 'var(--jma-dark)',
        boxShadow: '0 6px 0 0 var(--jma-dark)',
      }}
      aria-label={`${currentRank.title} · ${newest ? `Newest sticker ${newest.name}` : 'Play to earn stickers'} · open Sticker Book`}
    >
      {/* Left half — Academy Rank */}
      <div
        className="flex-1 flex items-center gap-3 md:gap-4 px-3 md:px-5 py-3 min-w-0"
        style={{ backgroundColor: currentRank.badgeBg }}
        data-testid="home-progress-rank"
      >
        <div
          className="w-12 h-12 md:w-14 md:h-14 rounded-full border-3 flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ backgroundColor: '#fff', borderColor: currentRank.color, borderWidth: 3 }}
        >
          <img
            src={currentRank.icon}
            alt={currentRank.title}
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>
        <div className="flex flex-col leading-tight flex-1 min-w-0 text-left">
          <span
            className="text-[10px] md:text-xs uppercase tracking-wide font-black"
            style={{ color: currentRank.color }}
          >
            Academy Rank
          </span>
          <span
            className="text-base md:text-xl font-black font-display truncate"
            style={{ color: 'var(--jma-dark)' }}
            data-testid="rank-title"
          >
            {currentRank.title}
          </span>
          {nextRank ? (
            <div className="mt-1 flex items-center gap-2">
              <div className="w-full h-2 rounded-full bg-white/70 overflow-hidden max-w-[140px] md:max-w-[180px]">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${progress.pct}%`,
                    backgroundColor: currentRank.color,
                  }}
                />
              </div>
              <span
                className="text-[10px] md:text-xs font-black font-display flex-shrink-0"
                style={{ color: currentRank.color }}
              >
                {progress.current}/{progress.target}
              </span>
            </div>
          ) : (
            <span
              className="text-[10px] md:text-xs font-black uppercase tracking-wide"
              style={{ color: currentRank.color }}
            >
              🏆 Maestro · {achievementCount} badges
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div
        aria-hidden="true"
        className="w-1 flex-shrink-0"
        style={{ backgroundColor: 'var(--jma-dark)' }}
      />

      {/* Right half — Newest Sticker (or empty-state nudge) */}
      <div
        className="flex-1 flex items-center gap-3 md:gap-4 px-3 md:px-5 py-3 min-w-0"
        style={{
          background: 'linear-gradient(135deg, #FFF9E6 0%, #FFE4F0 100%)',
        }}
        data-testid="home-progress-sticker"
      >
        {newest ? (
          <>
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="relative rounded-full p-1 border-3 flex-shrink-0"
              style={{
                backgroundColor: newest.color || '#fff',
                borderColor: 'var(--jma-dark)',
                borderWidth: 3,
                width: 56,
                height: 56,
                boxShadow: '0 3px 0 0 var(--jma-dark)',
              }}
            >
              <img
                src={newest.icon}
                alt={newest.name}
                className="w-full h-full object-contain"
                draggable={false}
              />
            </motion.div>
            <div className="flex flex-col leading-tight flex-1 min-w-0 text-left">
              <div className="flex items-center gap-1">
                <Sparkles
                  className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0"
                  style={{ color: '#F39C12' }}
                />
                <span
                  className="text-[10px] md:text-xs uppercase tracking-wide font-black"
                  style={{ color: 'var(--jma-dark)' }}
                >
                  Newest Sticker
                </span>
              </div>
              <span
                className="text-base md:text-xl font-black font-display truncate"
                style={{ color: 'var(--jma-dark)' }}
              >
                {newest.name}
              </span>
              <span className="text-[10px] md:text-xs font-bold text-gray-600">
                {totalEarned} collected →
              </span>
            </div>
          </>
        ) : (
          <>
            <div
              className="rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                width: 56,
                height: 56,
                backgroundColor: '#FFF3B0',
                border: '3px dashed var(--jma-dark)',
              }}
            >
              <Sparkles className="w-7 h-7" style={{ color: '#F39C12' }} />
            </div>
            <div className="flex flex-col leading-tight flex-1 min-w-0 text-left">
              <span
                className="text-[10px] md:text-xs uppercase tracking-wide font-black"
                style={{ color: 'var(--jma-dark)' }}
              >
                Stickers
              </span>
              <span
                className="text-sm md:text-base font-black font-display leading-tight"
                style={{ color: 'var(--jma-dark)' }}
              >
                Play a game to earn your first sticker!
              </span>
            </div>
          </>
        )}
      </div>
    </motion.button>
  );
}
