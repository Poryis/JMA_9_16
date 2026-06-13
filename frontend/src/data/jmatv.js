// JMAtv — the in-app TV channel.
//
// Three "channels" (categories) of Vimeo-hosted videos:
//   - Fun Facts            — short fact bites, kept unlabelled by NUMBER on
//                            purpose so we don't spoil the surprise.
//   - Puns with Finn Danger — short comedy bits with Finn. Placeholder until
//                            episodes are uploaded.
//   - JMA Music Videos     — longer-form music videos from Jelly of the Month
//                            Club. Placeholder until episodes are uploaded.
//
// Each channel ID is the URL slug (/jmatv/:channelId). Episodes are ordered
// in the array they're listed in; that order shows up in the channel page.
// Title / subtitle are kid-facing — keep them snack-sized.

export const JMATV_CHANNELS = [
  {
    id: 'fun-facts',
    title: 'Fun Facts',
    tagline: 'Quick brain-bites about music & weird stuff',
    color: '#FF9500',
    accent: '#C26200',
    icon: 'assets/characters/charlie-grad.png',
    badgeBg: '#FFE7C2',
    episodes: [
      // Auto-numbered #1-9 so the fact stays a surprise. Reorder freely.
      { vimeoId: '1200919220', title: 'Fun Fact #1' },
      { vimeoId: '1200919210', title: 'Fun Fact #2' },
      { vimeoId: '1200919169', title: 'Fun Fact #3' },
      { vimeoId: '1200919209', title: 'Fun Fact #4' },
      { vimeoId: '1200919203', title: 'Fun Fact #5' },
      { vimeoId: '1200919170', title: 'Fun Fact #6' },
      { vimeoId: '1200919168', title: 'Fun Fact #7' },
      { vimeoId: '1200919167', title: 'Fun Fact #8' },
      // The 9th video URL in the user's batch repeats 1200919169 — keeping
      // only a single entry for that ID. If a 9th unique video lands later,
      // append it here as Fun Fact #9 and the page will auto-pick it up.
    ],
  },
  {
    id: 'puns-finn-danger',
    title: 'Puns with Finn Danger',
    tagline: 'Groan-worthy zingers from your favorite cellist',
    color: '#4285F4',
    accent: '#1A4FAB',
    icon: 'assets/characters/finn-danger.png',
    badgeBg: '#D7E4FF',
    episodes: [
      // Placeholder — gets populated when the user uploads Pun videos. Keeps
      // the channel tile visible so kids see "Coming Soon" instead of a
      // suddenly-appearing channel later (less jarring).
    ],
    comingSoon: true,
  },
  {
    id: 'jma-music-videos',
    title: 'JMA Music Videos',
    tagline: 'Full-length jams from Jelly of the Month Club',
    color: '#FF3B30',
    accent: '#B82A20',
    icon: 'assets/characters/llama-lou-stew.png',
    badgeBg: '#FFD9D6',
    episodes: [
      // Placeholder until music video Vimeo IDs land.
    ],
    comingSoon: true,
  },
];

export function getChannel(channelId) {
  return JMATV_CHANNELS.find((c) => c.id === channelId) || null;
}

export function getEpisode(channelId, episodeIndex) {
  const ch = getChannel(channelId);
  if (!ch) return null;
  const idx = Number(episodeIndex);
  if (!Number.isInteger(idx) || idx < 0 || idx >= ch.episodes.length) return null;
  return { ...ch.episodes[idx], index: idx, channelId };
}

// Used by RetroTV on the homepage to pick a "now playing" preview from any
// channel that has episodes. Stable per-session so the TV doesn't flicker
// between picks on every render.
export function pickFeaturedEpisode() {
  const playable = JMATV_CHANNELS.filter((c) => c.episodes.length > 0);
  if (playable.length === 0) return null;
  const ch = playable[Math.floor(Math.random() * playable.length)];
  const idx = Math.floor(Math.random() * ch.episodes.length);
  return { ...ch.episodes[idx], channelId: ch.id, index: idx };
}
