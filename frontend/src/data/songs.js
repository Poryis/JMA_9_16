// Song library for rhythm game - fun, engaging, NOT kiddy nursery rhymes
// Each song has notes, a display name, and a category
// Speed is controlled by difficulty setting, not note count

export const SONG_LIBRARY = [
  // JMA Originals - the user's own songs, pitch-shifted to C or G to fit the 8-bell scale
  {
    id: 'jma_play_one_skip_one',
    name: 'Play One, Skip One',
    category: 'JMA Originals',
    audioUrl: 'assets/audio/songs/play_one_skip_one.mp3',
    bpm: 76,
    mode: 'C-major',
    originalKey: 'C major',
    shift: 0,
    // 40 notes over ~60s of backing @ 76bpm half-note cadence.
    // Simple C-major scale patterns perfect for first-time players.
    notes: ['C','D','E','F','G','F','E','D','C','E','G','E','C','E','G','E',
            'G','F','E','D','C','D','E','F','G','A','G','F','E','D','C','C',
            'C','E','G','High C','G','E','C','D']
  },
  {
    id: 'jma_magic_in_music',
    name: 'The Magic Is in the Music',
    category: 'JMA Originals',
    audioUrl: 'assets/audio/songs/magic_in_music.mp3',
    bpm: 152,
    mode: 'A-minor',
    originalKey: 'A minor',
    shift: 0,
    // A minor natural = all white keys, so every bell is in play.
    // Pentatonic-leaning mysterious minor vibe. 76 notes.
    notes: ['A','C','E','A','G','E','C','A','A','C','E','A','G','E','C','A',
            'E','G','A','E','D','C','A','G','E','G','A','E','D','C','B','A',
            'A','E','A','E','C','E','C','E','A','E','A','G','E','D','C','A',
            'A','C','E','A','G','E','C','A','A','G','E','D','C','E','G','A',
            'A','E','G','A','E','D','C','A','A','C','E','A']
  },
  {
    id: 'jma_brand_new_friend',
    name: 'Brand New Friend',
    category: 'JMA Originals',
    audioUrl: 'assets/audio/songs/brand_new_friend.mp3',
    bpm: 136,
    mode: 'G-mixolydian',
    originalKey: 'F# major',
    shift: 1,
    // G-mixolydian (G-A-B-C-D-E-F) melody. 68 notes, catchy pop vibe.
    notes: ['G','A','B','G','D','E','D','B','G','A','B','G','D','E','D','B',
            'A','B','G','A','D','E','D','C','A','B','G','A','D','E','D','C',
            'G','B','D','G','E','D','B','G','A','B','D','E','D','B','G','D',
            'G','A','B','D','E','D','B','A','G','A','B','G','D','C','B','G',
            'G','B','D','G']
  },
  {
    id: 'jma_faster_as_we_go',
    name: 'Faster As We Go',
    category: 'JMA Originals',
    audioUrl: 'assets/audio/songs/faster_as_we_go.mp3',
    bpm: 103,
    mode: 'G-mixolydian',
    originalKey: 'F# minor',
    shift: 1,
    // G-mode, emphasizing pentatonic (G-A-D-E-HiG style) with occasional passing Bs/Fs. 52 notes.
    notes: ['G','A','D','G','F','D','A','G','G','A','D','F','D','A','G','G',
            'D','F','A','D','C','A','D','F','D','A','D','G','D','A','G','G',
            'A','G','A','D','F','E','D','C','G','A','B','D','E','D','B','G',
            'G','D','F','A']
  },
  {
    id: 'jma_goody_bag',
    name: 'Goody Bag',
    category: 'JMA Originals',
    audioUrl: 'assets/audio/songs/goody_bag.mp3',
    bpm: 123,
    mode: 'G-mixolydian',
    originalKey: 'A major',
    shift: -2,
    // G-mixolydian, bouncy upbeat pop. 62 notes.
    notes: ['G','A','B','G','B','A','G','E','G','A','B','D','B','A','G','E',
            'A','B','D','B','G','E','D','C','A','B','D','B','G','E','D','C',
            'G','B','D','G','E','D','B','G','A','B','D','E','D','B','G','D',
            'G','A','B','G','E','D','B','G','A','B','G','B','D','E']
  },
  // Classic & Fun
  {
    id: 'ode_to_joy',
    name: 'Ode to Joy',
    category: 'Classic',
    notes: ['E','E','F','G','G','F','E','D','C','C','D','E','E','D','D',
            'E','E','F','G','G','F','E','D','C','C','D','E','D','C','C']
  },
  {
    id: 'when_saints',
    name: 'When the Saints',
    category: 'Classic',
    notes: ['C','E','F','G','C','E','F','G','C','E','F','G','E','C','E','D',
            'E','E','D','C','C','E','G','G','F','E','F','G','E','C','D','C']
  },
  {
    id: 'amazing_grace',
    name: 'Amazing Grace',
    category: 'Classic',
    // 3/4 time: | - - do | fa - la fa | la - so | fa - re | do - do |
    //           | fa - la fa | la - so | HiDo - - | - - la |
    //           | HiDo - la so | fa - re | re - fa | do - do |
    //           | fa - la fa | la - so | fa |
    notes: ['C',
            'F','A','F',
            'A','G',
            'F','D',
            'C','C',
            'F','A','F',
            'A','G',
            'High C',
            'A',
            'High C','A','G',
            'F','D',
            'D','F',
            'C','C',
            'F','A','F',
            'A','G',
            'F']
  },
  // Video Game Vibes
  {
    id: 'mario_theme',
    name: 'Super Jump Theme',
    category: 'Game',
    notes: ['E','E','E','C','E','G','G','C','G','E','A','B','A',
            'G','E','G','A','F','G','E','C','D','B']
  },
  {
    id: 'tetris_theme',
    name: 'Block Drop',
    category: 'Game',
    notes: ['E','B','C','D','C','B','A','A','C','E','D','C','B',
            'C','D','E','C','A','A','D','F','A','G','F','E','C','E','D','C','B']
  },
  {
    id: 'zelda_lullaby',
    name: 'Hero\'s Lullaby',
    category: 'Game',
    notes: ['B','D','A','B','D','A','B','D','A','G','A','B','D','A','G','E','D']
  },
  // Original Grooves
  {
    id: 'jelly_groove',
    name: 'Jelly Groove',
    category: 'Original',
    notes: ['C','E','G','E','C','D','F','A','F','D','E','G','B','G','E',
            'G','E','C','F','D','B','D','F','A','G','E','C']
  },
  {
    id: 'ocean_wave',
    name: 'Ocean Wave',
    category: 'Original',
    notes: ['C','D','E','F','G','A','G','F','E','D','C','D','E','F','G',
            'High C','G','F','E','D','C','E','G','E','C']
  },
  {
    id: 'bell_bounce',
    name: 'Bell Bounce',
    category: 'Original',
    notes: ['C','G','E','G','C','A','F','A','C','B','G','B','C',
            'G','E','C','F','A','F','D','G','B','G','E','High C']
  },
  {
    id: 'funky_fish',
    name: 'Funky Fish',
    category: 'Original',
    notes: ['G','G','A','G','F','E','G','G','A','G','F','E','C','D','E','F',
            'G','A','G','F','E','D','C','D','E','D','C']
  }
];

// Speed settings (ms per note) - lower = faster
export const SPEED_SETTINGS = {
  chill: { label: 'Chill', ms: 900, fallSpeed: 3500, color: '#4CD964' },
  normal: { label: 'Normal', ms: 600, fallSpeed: 2500, color: '#FFCC00' },
  turbo: { label: 'Turbo', ms: 350, fallSpeed: 1500, color: '#FF3B30' }
};

// Group songs by category
export function getSongsByCategory() {
  const categories = {};
  SONG_LIBRARY.forEach(song => {
    if (!categories[song.category]) {
      categories[song.category] = [];
    }
    categories[song.category].push(song);
  });
  return categories;
}
