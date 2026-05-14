// Academy rank ladder for JMA. Driven by total stickers earned.
// Warm, non-competitive vibe - every kid eventually becomes a Maestro.
// Each rank uses an existing character image as the "vibe" reference so we
// don't need new artwork.

export const RANKS = [
  {
    id: 'polliwog',
    title: 'Polliwog',
    subtitle: 'Brand New Friend',
    minStickers: 0,
    color: '#4CD964',
    badgeBg: '#E8F8EE',
    blurb: 'Just hatched! Hop in and make some music.',
    icon: 'assets/characters/charlie-polliwog.png',
  },
  {
    id: 'tadpole',
    title: 'Tadpole',
    subtitle: 'Tapping Along',
    minStickers: 5,
    color: '#34A853',
    badgeBg: '#E8F8EE',
    blurb: 'Your tail is twitching with rhythm!',
    icon: 'assets/characters/finn-danger.png',
  },
  {
    id: 'apprentice',
    title: 'Apprentice',
    subtitle: 'Learning the Ropes',
    minStickers: 12,
    color: '#4285F4',
    badgeBg: '#E5F0FF',
    blurb: 'Stew is impressed. Keep exploring!',
    icon: 'assets/characters/dr-jellybone.png',
  },
  {
    id: 'soloist',
    title: 'Soloist',
    subtitle: 'In the Spotlight',
    minStickers: 20,
    color: '#FF9500',
    badgeBg: '#FFF1DC',
    blurb: 'You can really play. The band is listening!',
    icon: 'assets/characters/jazzy.png',
  },
  {
    id: 'conductor',
    title: 'Conductor',
    subtitle: 'Leading the Band',
    minStickers: 30,
    color: '#AF52DE',
    badgeBg: '#F2E7FA',
    blurb: 'You set the tempo around here.',
    icon: 'assets/characters/charlie-drum-major.png',
  },
  {
    id: 'maestro',
    title: 'Maestro',
    subtitle: 'Honorary JMA Faculty',
    minStickers: 45,
    color: '#FFCC00',
    badgeBg: '#FFF8D6',
    blurb: 'Maestro! You officially run this place.',
    icon: 'assets/characters/charlie-grad.png',
  },
];

export function getRankForCount(count) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (count >= r.minStickers) rank = r;
  }
  return rank;
}

export function getNextRank(currentRankId) {
  const idx = RANKS.findIndex(r => r.id === currentRankId);
  return idx >= 0 && idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}
