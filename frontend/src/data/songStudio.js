// Charlie's Song Studio — data definitions.
// 15-key piano keyboard (C4 → C6, white keys only) plus mood configs.

// Solfège + color per pitch class (matches the JellyBells palette).
const PITCH = {
  C: { solfege: 'Do', color: '#FF3B30' },
  D: { solfege: 'Re', color: '#FF9500' },
  E: { solfege: 'Mi', color: '#FFCC00' },
  F: { solfege: 'Fa', color: '#4CD964' },
  G: { solfege: 'So', color: '#4285F4' },
  A: { solfege: 'La', color: '#AF52DE' },
  B: { solfege: 'Ti', color: '#FF2D92' },
};

// 15 white keys from C4 → C6.
const PIANO_NOTES = ['C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','G5','A5','B5','C6'];

export const PIANO_KEYS = PIANO_NOTES.map((n) => {
  const pitch = n[0]; // 'C', 'D', etc.
  const octave = parseInt(n.slice(1), 10);
  return {
    id: n,
    file: `assets/audio/${n}.mp3`,
    pitch,
    octave,
    solfege: PITCH[pitch].solfege,
    color: PITCH[pitch].color,
    // Octave indicator dot tint
    octaveBand: octave === 4 ? 'low' : octave === 5 ? 'mid' : 'high',
  };
});

// Three moods. Each defines:
//  - tonic: which pitch class is the "home"
//  - scaleNotes: which pitch classes are IN the mood's scale (so the kid sees them highlighted)
//  - drumLoop: backing track during playback (null = no drums)
//  - bpm: melody playback tempo
//  - charlie: Charlie outfit to display
//  - color: theme color for the mood card
export const MOODS = {
  happy: {
    id: 'happy',
    name: 'Happy',
    emoji: '😊',
    description: 'Bright & bouncy (C major)',
    tonic: 'C',
    scaleNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    drumLoop: 'assets/audio/songs/jam_drums_pocket.mp3',
    bpm: 100,
    charlie: 'assets/characters/charlie.png',
    color: '#FFCC00',
    accent: '#FF9500',
  },
  sad: {
    id: 'sad',
    name: 'Sad',
    emoji: '😢',
    description: 'Slow & thoughtful (A minor)',
    tonic: 'A',
    scaleNotes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], // same pitch classes but tonic is A
    drumLoop: null,
    bpm: 70,
    charlie: 'assets/characters/charlie-zoot.png',
    color: '#4285F4',
    accent: '#2A5DB0',
  },
  mysterious: {
    id: 'mysterious',
    name: 'Mysterious',
    emoji: '👻',
    description: 'Spooky & wandering (D Dorian)',
    tonic: 'D',
    scaleNotes: ['D', 'E', 'F', 'G', 'A', 'B', 'C'], // tonic is D
    drumLoop: 'assets/audio/songs/jam_drums_boogie.mp3',
    bpm: 120,
    charlie: 'assets/characters/charlie-steampunk.png',
    color: '#9B6DE0',
    accent: '#5E2D8C',
  },
};

export const TOTAL_SLOTS = 16; // 4 measures × 4 beats
export const SLOTS_PER_ROW = 4;
