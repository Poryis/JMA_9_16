import SubMenuPage from '../components/SubMenuPage';

const LEARN_TILES = [
  {
    id: 'lessons',
    title: 'LESSONS 1–7',
    path: '/lessons',
    bg: 'assets/backgrounds/chalkboard.png',
    color: '#34A853',
    accent: '#0E7C3A',
    character: 'assets/characters/charlie-grad.png',
    charWidthPct: 32,
    sfx: 'assets/audio/sfx-page.mp3',
  },
  {
    id: 'fun-facts',
    title: 'FUN FACTS CLUBHOUSE',
    path: '/fun-facts',
    bg: 'assets/backgrounds/clubhouse.png',
    color: '#FFCC00',
    accent: '#F39C12',
    character: 'assets/characters/charlie-polliwog.png',
    charWidthPct: 28,
    sfx: 'assets/audio/sfx-twinkle.mp3',
  },
  {
    id: 'boom-garden',
    // Renamed from "Stew's Rhythm Academy" — this is now the primary
    // "Who's Got the Rhythm" home. The falling-notes game (previously
    // called "Who's Got the Rhythm?") is now "Jelly Jukebox" under Play.
    title: "WHO'S GOT THE RHYTHM",
    path: '/boom-garden',
    bg: 'assets/backgrounds/football-field.png',
    color: '#FF9500',
    accent: '#E67E22',
    character: 'assets/animations/stew-drum/left-1.png',
    charWidthPct: 34,
    sfx: 'assets/audio/Snare.mp3',
  },
  {
    id: 'ear-quest',
    title: 'EAR QUEST',
    path: '/ear-trainer',
    bg: 'assets/backgrounds/beach.png',
    color: '#FF9500',
    accent: '#E67E22',
    character: 'assets/characters/dr-jellybone.png',
    charWidthPct: 22,
    sfx: 'assets/audio/sfx-arpeggio.mp3',
  },
];

export default function LearnMenuPage() {
  return (
    <SubMenuPage
      testId="learn-menu-page"
      sectionTitle="LEARN"
      sectionSubtitle="Lessons & discoveries"
      sectionColor="#1E88E5"
      bgGradient="radial-gradient(circle at 20% 20%, #C7E9FF 0%, transparent 50%), radial-gradient(circle at 80% 80%, #B5D8F2 0%, transparent 55%), linear-gradient(180deg, #E6F4FF 0%, #BFE0F8 100%)"
      tiles={LEARN_TILES}
    />
  );
}
