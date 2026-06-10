// Boom Garden — rhythm-reading data model.
//
// Note durations and Kodály-style counting syllables match exactly what the
// Jelly of the Month Club Music Academy teaches in Lesson 4:
//   Whole   = "Toe-ee--O-ee"  (4 beats, sustained)
//   Half    = "Toe-ee"         (2 beats, sustained)
//   Quarter = "Ta"             (1 beat)
//   Eighth  = "Ti"             (1/2 beat — say "Ti Ti" per beat)
//
// `beats` is the duration in quarter-note beats. Block width in the visual
// strip is proportional to this value.

export const NOTE_DEFS = {
  whole:   { beats: 4,   syllable: 'Toe-ee--O-ee', color: '#4285F4', label: 'Whole' },
  half:    { beats: 2,   syllable: 'Toe-ee',       color: '#34A853', label: 'Half' },
  quarter: { beats: 1,   syllable: 'Ta',           color: '#FFCC00', label: 'Quarter' },
  eighth:  { beats: 0.5, syllable: 'Ti',           color: '#FF9500', label: 'Eighth' },
  rest:    { beats: 1,   syllable: 'shh',          color: '#B0B0B0', label: 'Rest' },
};

// Tempo for demo + read-along playback. 80 BPM @ quarter = 750 ms per beat —
// slow enough for 5-year-olds to track yet fast enough to feel musical.
export const BEAT_MS = 750;

// Difficulty tiers — each pattern is an array of note keys from NOTE_DEFS.
// Cadet stays in 4/4 with quarters + rests only.
// Pro adds half notes and beamed-eighth pairs.
// Master adds whole notes and longer 8-beat patterns.
export const PATTERNS = {
  cadet: [
    ['quarter', 'quarter', 'quarter', 'quarter'],
    ['quarter', 'quarter', 'rest',    'quarter'],
    ['quarter', 'rest',    'quarter', 'quarter'],
    ['rest',    'quarter', 'quarter', 'quarter'],
    ['quarter', 'quarter', 'quarter', 'rest'],
    ['quarter', 'rest',    'rest',    'quarter'],
  ],
  pro: [
    ['half',    'quarter', 'quarter'],
    ['quarter', 'half',    'quarter'],
    ['quarter', 'quarter', 'half'],
    ['quarter', 'eighth',  'eighth',  'quarter', 'quarter'],
    ['half',    'eighth',  'eighth',  'quarter'],
    ['eighth',  'eighth',  'quarter', 'eighth',  'eighth',  'quarter'],
  ],
  master: [
    ['whole'],
    ['half', 'half'],
    ['quarter', 'quarter', 'half', 'quarter', 'quarter', 'half'],
    ['eighth',  'eighth',  'eighth', 'eighth', 'quarter', 'quarter', 'half'],
    ['half', 'quarter', 'eighth', 'eighth', 'quarter', 'quarter'],
    ['whole', 'half', 'half'],
  ],
};

export const DIFFICULTIES = [
  { id: 'cadet',  label: 'Cadet',  description: 'Quarters & rests',        color: '#FFCC00' },
  { id: 'pro',    label: 'Pro',    description: 'Halves & eighth pairs',   color: '#FF9500' },
  { id: 'master', label: 'Master', description: 'Whole notes & long runs', color: '#FF3B30' },
];

// Total beats in a pattern — helper.
export function patternBeats(pattern) {
  return pattern.reduce((s, k) => s + NOTE_DEFS[k].beats, 0);
}

// Returns the expected start time (ms from pattern start) for each note in
// the pattern, indexed by note position.
export function noteStartTimes(pattern, beatMs = BEAT_MS) {
  const starts = [];
  let acc = 0;
  for (const k of pattern) {
    starts.push(acc);
    acc += NOTE_DEFS[k].beats * beatMs;
  }
  return starts;
}
