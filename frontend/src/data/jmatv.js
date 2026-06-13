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
      // Short pun bits — auto-numbered so the punchline stays a surprise.
      // The user's batch had Pun #3's URL repeated; deduped to 7 unique IDs.
      { vimeoId: '1200946368', title: 'Pun #1' },
      { vimeoId: '1200946258', title: 'Pun #2' },
      { vimeoId: '1200946257', title: 'Pun #3' },
      { vimeoId: '1200946256', title: 'Pun #4' },
      { vimeoId: '1200946167', title: 'Pun #5' },
      { vimeoId: '1200946168', title: 'Pun #6' },
      { vimeoId: '1200946169', title: 'Pun #7' },
    ],
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
      // Music videos use named titles (vs. the auto-numbered Fun Facts / Puns)
      // so kids can pick by song. Two batches in the user's drop — kept in
      // the order they were sent so the first 11 read like one album and the
      // last 7 read like a second.
      { vimeoId: '1200947216', title: 'Jelly Jamboree' },
      { vimeoId: '1200949215', title: 'Play One, Skip One' },
      { vimeoId: '1200949216', title: 'Lemonade Standoff' },
      { vimeoId: '1200949994', title: 'Seahorse Siesta' },
      { vimeoId: '1200949952', title: 'Epic Drum Battle' },
      { vimeoId: '1200949768', title: 'Peanut Butter Jellyfish Sandwich' },
      { vimeoId: '1200949757', title: 'Goody Bag' },
      { vimeoId: '1200949704', title: 'Cubs, Cubs, Cubs' },
      { vimeoId: '1200949703', title: 'Brand New Friend' },
      { vimeoId: '1200949702', title: 'A Shellfish Elf' },
      { vimeoId: '1200949701', title: 'A Llama’s Life for Me' },
      { vimeoId: '1200951610', title: 'Do is in Pizza' },
      { vimeoId: '1200951609', title: 'Faster as We Go' },
      { vimeoId: '1200951611', title: 'High and Low' },
      { vimeoId: '1200951612', title: 'Robot Boogie' },
      { vimeoId: '1200951769', title: 'We Groovin’ Freeze Dance' },
      { vimeoId: '1200951835', title: 'We Mosh Freeze Dance' },
      { vimeoId: '1200951872', title: 'Who’s Got the Rhythm' },
    ],
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
