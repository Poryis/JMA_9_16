import SubMenuPage from '../components/SubMenuPage';

const CREATE_TILES = [
  {
    id: 'jam-session',
    title: 'Jam Session',
    tagline: 'Pick up any instrument and jam!',
    path: '/free-play',
    bg: 'assets/backgrounds/jelly-stage.png',
    color: '#4CD964',
    accent: '#34A853',
    sign: 'STUDIO',
    character: 'assets/characters/charlie-punk.png',
    charWidthPct: 30,
    sfx: 'assets/audio/sfx-drum-fill.mp3',
  },
  {
    id: 'beat-lab',
    title: 'Beat Lab',
    tagline: 'Stack loops and build your own beat!',
    path: '/loop-studio',
    bg: 'assets/backgrounds/graffiti-wall.jpg',
    color: '#AF52DE',
    accent: '#8E44AD',
    sign: 'LOOP STATION',
    character: 'assets/characters/jelly-rap-trio.png',
    charWidthPct: 50,
    sfx: 'assets/audio/sfx-dj-scratch.mp3',
  },
  {
    id: 'song-studio',
    title: "Charlie's Song Studio",
    tagline: 'Pick a mood and compose your own song!',
    path: '/song-studio',
    bg: 'assets/backgrounds/jelly-stage.png',
    color: '#FFCC00',
    accent: '#F39C12',
    sign: 'COMPOSE',
    bubble: 'Make a hit!',
    character: 'assets/characters/charlie-grad.png',
    charWidthPct: 28,
    sfx: 'assets/audio/sfx-piano-flourish.mp3',
  },
];

export default function CreateMenuPage() {
  return (
    <SubMenuPage
      testId="create-menu-page"
      sectionTitle="CREATE"
      sectionSubtitle="Make some music!"
      sectionColor="#C2185B"
      bgGradient="radial-gradient(circle at 20% 20%, #FFE0EF 0%, transparent 50%), radial-gradient(circle at 80% 80%, #F2C7E2 0%, transparent 55%), linear-gradient(180deg, #FFEBF5 0%, #F9CDE3 100%)"
      tiles={CREATE_TILES}
    />
  );
}
