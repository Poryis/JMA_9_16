import SubMenuPage from '../components/SubMenuPage';

const LEARN_TILES = [
  {
    id: 'lessons',
    title: 'Lessons 1–7',
    tagline: 'Charlie\'s music class is in session!',
    path: '/lessons',
    bg: 'assets/backgrounds/chalkboard.png',
    color: '#34A853',
    accent: '#0E7C3A',
    sign: 'LESSONS',
    character: 'assets/characters/charlie-grad.png',
    charWidthPct: 30,
    sfx: 'assets/audio/sfx-page.mp3',
  },
  {
    id: 'fun-facts',
    title: 'Fun Facts Clubhouse',
    tagline: 'Find the band and learn music secrets!',
    path: '/fun-facts',
    bg: 'assets/backgrounds/clubhouse.png',
    color: '#FFCC00',
    accent: '#F39C12',
    sign: 'CLUBHOUSE',
    character: 'assets/characters/charlie-polliwog.png',
    charWidthPct: 26,
    sfx: 'assets/audio/sfx-twinkle.mp3',
  },
  {
    id: 'boom-garden',
    title: "Stew's Rhythm Academy",
    tagline: 'Echo Stew, find the beat, run the rhythm!',
    path: '/boom-garden',
    bg: 'assets/backgrounds/football-field.png',
    color: '#FF9500',
    accent: '#E67E22',
    sign: "STEW'S RHYTHM ACADEMY",
    character: 'assets/animations/stew-drum/left-1.png',
    charWidthPct: 32,
    sfx: 'assets/audio/Snare.mp3',
  },
  {
    id: 'ear-quest',
    title: 'Ear Quest',
    tagline: 'The ultimate ear training game. You got what it takes?',
    path: '/ear-trainer',
    bg: 'assets/backgrounds/beach.png',
    color: '#FF9500',
    accent: '#E67E22',
    sign: 'EAR QUEST',
    character: 'assets/characters/dr-jellybone.png',
    charWidthPct: 20,
    sfx: 'assets/audio/sfx-arpeggio.mp3',
  },
];

export default function LearnMenuPage() {
  return (
    <SubMenuPage
      testId="learn-menu-page"
      sectionTitle="LEARN"
      sectionSubtitle="Lessons & discoveries!"
      sectionColor="#1E88E5"
      bgGradient="radial-gradient(circle at 20% 20%, #C7E9FF 0%, transparent 50%), radial-gradient(circle at 80% 80%, #B5D8F2 0%, transparent 55%), linear-gradient(180deg, #E6F4FF 0%, #BFE0F8 100%)"
      tiles={LEARN_TILES}
    />
  );
}
