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
    character: 'assets/characters/charlie-drum-major.png',
    charWidthPct: 30,
  },
  {
    id: 'beat-lab',
    title: 'Beat Lab',
    tagline: 'Stack loops and build your own beat!',
    path: '/loop-studio',
    bg: 'assets/backgrounds/circus.png',
    color: '#AF52DE',
    accent: '#8E44AD',
    sign: 'LOOP STATION',
    character: 'assets/characters/chunk-disco.png',
    charWidthPct: 28,
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
