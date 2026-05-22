import SubMenuPage from '../components/SubMenuPage';

const PLAY_TILES = [
  {
    id: 'whos-got-rhythm',
    title: "Who's Got the Rhythm?",
    tagline: 'Catch the falling notes!',
    path: '/rhythm-game',
    bg: 'assets/backgrounds/football-field.png',
    color: '#FF3B30',
    accent: '#C0392B',
    sign: 'GAME',
    character: 'assets/characters/jazzy-marching.png',
    charWidthPct: 28,
  },
  {
    id: 'stew-kazoo',
    title: 'Stew Kazoo Says',
    tagline: 'Watch, listen, then play it back!',
    path: '/simon-says',
    bg: 'assets/backgrounds/underwater.png',
    color: '#4285F4',
    accent: '#1ABC9C',
    sign: 'GAME',
    bubble: 'Repeat after me!',
    character: 'assets/characters/stew.png',
    charWidthPct: 26,
  },
  {
    id: 'new-game',
    title: 'New Game',
    tagline: "Something fresh is on the way…",
    path: '/play',
    color: '#9B59B6',
    accent: '#7B1FA2',
    sign: 'COMING SOON',
    disabled: true,
  },
];

export default function PlayMenuPage() {
  return (
    <SubMenuPage
      testId="play-menu-page"
      sectionTitle="PLAY"
      sectionSubtitle="Pick a game!"
      sectionColor="#E94B3C"
      bgGradient="radial-gradient(circle at 20% 20%, #FFE5A6 0%, transparent 50%), radial-gradient(circle at 80% 80%, #FFD9B0 0%, transparent 55%), linear-gradient(180deg, #FFF5DC 0%, #FFD89E 100%)"
      tiles={PLAY_TILES}
    />
  );
}
