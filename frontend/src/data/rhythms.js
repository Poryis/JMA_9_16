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
  whole:   { beats: 4,   syllable: 'Toe-ee--O-ee', color: '#4285F4', label: 'Whole',
             img: 'assets/notes/rhythm/whole.png',     imgHi: 'assets/notes/rhythm/whole-hi.png' },
  half:    { beats: 2,   syllable: 'Toe-ee',       color: '#34A853', label: 'Half',
             img: 'assets/notes/rhythm/half.png',      imgHi: 'assets/notes/rhythm/half-hi.png' },
  quarter: { beats: 1,   syllable: 'Ta',           color: '#FFCC00', label: 'Quarter',
             img: 'assets/notes/rhythm/quarter.png',   imgHi: 'assets/notes/rhythm/quarter-hi.png' },
  eighth:  { beats: 0.5, syllable: 'Ti',           color: '#FF9500', label: 'Eighth',
             img: 'assets/notes/rhythm/eighth.png',    imgHi: 'assets/notes/rhythm/eighth-hi.png' },
  rest:    { beats: 1,   syllable: 'Shh',          color: '#B0B0B0', label: 'Rest',
             img: 'assets/ui/seahorse-rest.png',       imgHi: 'assets/ui/seahorse-rest.png' },
};

// Tempo for demo + read-along playback. 80 BPM @ quarter = 750 ms per beat —
// slow enough for 5-year-olds to track yet fast enough to feel musical.
export const BEAT_MS = 750;

// Per-difficulty tap-timing tolerance windows (± ms from the expected beat).
// Cadet is extra forgiving — a 5-year-old's "in time" is naturally loose.
export const TOLERANCE_MS = {
  cadet:  400,
  pro:    275,
  master: 175,
};

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

// Tap Trail (scrolling reader) uses multi-measure patterns so kids practice
// reading + playing rhythm over a longer arc, not just one bar at a time.
export const TRAIL_PATTERNS = {
  cadet: [
    ['quarter','quarter','quarter','quarter', 'quarter','quarter','rest','quarter'],
    ['quarter','rest','quarter','quarter',     'quarter','quarter','quarter','rest'],
    ['quarter','quarter','quarter','rest',     'quarter','rest','quarter','quarter'],
    ['rest','quarter','quarter','quarter',     'quarter','quarter','rest','quarter'],
  ],
  pro: [
    ['quarter','eighth','eighth','quarter','quarter',  'half','quarter','quarter'],
    ['half','eighth','eighth','quarter',               'quarter','quarter','eighth','eighth','quarter'],
    ['quarter','quarter','half',                       'eighth','eighth','eighth','eighth','quarter','quarter'],
    ['eighth','eighth','quarter','quarter','quarter',  'quarter','eighth','eighth','half'],
  ],
  master: [
    ['whole',                                          'half','half',                                'quarter','quarter','half'],
    ['half','quarter','quarter',                       'eighth','eighth','eighth','eighth','half',   'quarter','quarter','half'],
    ['quarter','eighth','eighth','quarter','quarter',  'half','quarter','quarter',                   'whole'],
    ['eighth','eighth','eighth','eighth','quarter','quarter',  'half','half',                       'quarter','quarter','quarter','quarter'],
  ],
};

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
