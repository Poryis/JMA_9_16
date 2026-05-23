// Detective Dr. Jellybone — melody library.
// All tunes are in C-diatonic so they work with our bell set.
// Each tune is a short, recognizable phrase so kids can spot the wrong note.

export const DETECTIVE_TUNES = [
  // ===== Beginner: very familiar nursery tunes, 5-8 notes =====
  {
    id: 'twinkle',
    name: 'Twinkle Twinkle Little Star',
    level: 'easy',
    notes: ['C', 'C', 'G', 'G', 'A', 'A', 'G'],
  },
  {
    id: 'mary_lamb',
    name: 'Mary Had a Little Lamb',
    level: 'easy',
    notes: ['E', 'D', 'C', 'D', 'E', 'E', 'E'],
  },
  {
    id: 'hot_cross',
    name: 'Hot Cross Buns',
    level: 'easy',
    notes: ['E', 'D', 'C', 'E', 'D', 'C'],
  },
  {
    id: 'row_boat',
    name: 'Row Row Row Your Boat',
    level: 'easy',
    notes: ['C', 'C', 'C', 'D', 'E', 'E', 'D', 'E', 'F', 'G'],
  },

  // ===== Intermediate: 8-12 notes, less ubiquitous =====
  {
    id: 'frere_jacques',
    name: 'Frère Jacques',
    level: 'medium',
    notes: ['C', 'D', 'E', 'C', 'C', 'D', 'E', 'C', 'E', 'F', 'G'],
  },
  {
    id: 'london_bridge',
    name: 'London Bridge',
    level: 'medium',
    notes: ['G', 'A', 'G', 'F', 'E', 'F', 'G', 'D', 'E', 'F'],
  },
  {
    id: 'old_macdonald',
    name: 'Old MacDonald',
    level: 'medium',
    notes: ['G', 'G', 'G', 'D', 'E', 'E', 'D', 'B', 'B', 'A', 'A', 'G'],
  },
  {
    id: 'when_saints_short',
    name: 'When the Saints (Verse)',
    level: 'medium',
    notes: ['C', 'E', 'F', 'G', 'C', 'E', 'F', 'G', 'C', 'E', 'F', 'G', 'E', 'C', 'E', 'D'],
  },

  // ===== Master: 12-16 notes, may be less familiar =====
  {
    id: 'ode_to_joy',
    name: 'Ode to Joy',
    level: 'hard',
    notes: ['E', 'E', 'F', 'G', 'G', 'F', 'E', 'D', 'C', 'C', 'D', 'E', 'E', 'D', 'D'],
  },
  {
    id: 'jingle_bells',
    name: 'Jingle Bells',
    level: 'hard',
    notes: ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'G', 'C', 'D', 'E', 'F', 'F', 'F', 'F', 'F', 'E', 'E', 'E', 'E', 'D', 'D', 'E', 'D', 'G'],
  },
  {
    id: 'happy_birthday',
    name: 'Birthday Tune',
    level: 'hard',
    notes: ['C', 'C', 'D', 'C', 'F', 'E', 'C', 'C', 'D', 'C', 'G', 'F'],
  },
];

// All 8 diatonic bells in scale-order. Used for "swap by N scale steps" logic.
export const SCALE_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'High C'];
