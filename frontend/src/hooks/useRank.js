// Rank tracking: derives current rank from sticker count.
// Rank-up detection is opt-in via `withCelebration: true` — only ONE component
// (RankUpCelebration in App.js) should request celebration tracking; everyone
// else just reads currentRank/progress.

import { useEffect, useMemo, useState, useCallback } from 'react';
import { RANKS, getRankForCount, getNextRank } from '../data/ranks';
import useStickers from './useStickers';

const LAST_SEEN_KEY = 'jma_rank_seen_v1';

function readLastSeen() {
  try { return localStorage.getItem(LAST_SEEN_KEY) || 'polliwog'; }
  catch (_) { return 'polliwog'; }
}

function writeLastSeen(id) {
  try { localStorage.setItem(LAST_SEEN_KEY, id); } catch (_) {}
}

export default function useRank({ withCelebration = false } = {}) {
  const { earnedCount } = useStickers();
  const [rankUp, setRankUp] = useState(null);
  const currentRank = useMemo(() => getRankForCount(earnedCount), [earnedCount]);
  const nextRank = useMemo(() => getNextRank(currentRank.id), [currentRank]);

  const progress = useMemo(() => {
    if (!nextRank) return { current: earnedCount, target: currentRank.minStickers, pct: 100 };
    const span = nextRank.minStickers - currentRank.minStickers;
    const done = earnedCount - currentRank.minStickers;
    return {
      current: earnedCount,
      target: nextRank.minStickers,
      pct: Math.max(0, Math.min(100, Math.round((done / span) * 100))),
    };
  }, [earnedCount, currentRank, nextRank]);

  useEffect(() => {
    if (!withCelebration) return;
    const last = readLastSeen();
    if (last !== currentRank.id) {
      const lastIdx = RANKS.findIndex(r => r.id === last);
      const curIdx = RANKS.findIndex(r => r.id === currentRank.id);
      if (curIdx > lastIdx) setRankUp(currentRank);
      writeLastSeen(currentRank.id);
    }
  }, [currentRank, withCelebration]);

  const dismissRankUp = useCallback(() => setRankUp(null), []);

  return { currentRank, nextRank, progress, rankUp, dismissRankUp, totalStickers: earnedCount };
}
