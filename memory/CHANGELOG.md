# Changelog

## Feb 2026

### Score Penalty Tuning
- **Who's Got the Rhythm** (`RhythmGamePage.js`): wrong-note penalty raised from -5 → -50 (half of correct +100). Score still clamps at 0.
- **Stu Kazoo Says** (`SimonSaysPage.js`): added wrong-answer penalty of `-5 * level` (half of correct `+10 * level`). Score clamps at 0.

### Stu Kazoo Says — Level Clear Celebration (in progress)
- Added `Confetti.js` component and `playFanfare()` arpeggio (Do-Mi-So-HighDo on kazoo).
- `celebrate()` helper exists in `SimonSaysPage.js` but is **not yet wired** to fire on level-up — pending user direction.
