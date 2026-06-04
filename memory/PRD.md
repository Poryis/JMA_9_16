# Jelly of the Month Club Music Academy (JMA) — PRD

## Original Problem Statement
Build a frontend-only rhythm/music education app for young children that feels like a **living musical academy**, not a menu of disconnected mini-games. Use the user's custom artwork (Jellybells, drum kit, xylophone, piano, turntable, kazoos, character cast, original songs).

The experience should evoke PBS Kids / Nintendo / Rhythm Heaven warmth — playful, exploratory, toy-like, personality-driven, with strong mobile responsiveness and progression that feels welcoming, not competitive.

## App Identity
- **Full name**: Jelly of the Month Club Music Academy
- **Short name**: JMA
- **Tagline**: "Where music friends play together"
- **HTML title**: `Jelly of the Month Club Music Academy (JMA)`

## Six Academy Destinations (rooms)
Replacing the legacy "6 mode tiles" grid with rich room-card destinations on the home page:

| Room | Path (kept for sticker compat) | Background | Character vibe |
|------|-------------------------------|------------|----------------|
| Jam Hall | `/free-play` | river.png | Drum Major Charlie + Finn |
| Rhythm Arcade | `/rhythm-game` | stage.png | Punk Charlie + Jazzy |
| Stew Kazoo Says (Kazoo Room) | `/simon-says` | underwater.png | Stew + Lou & Stew |
| Ear Quest | `/ear-trainer` | beach.png | Dr. Jellybone + Snorkel Sharky |
| Beat Lab | `/loop-studio` | circus.png | Disco Chunk + DMC Charlie |
| Fun Facts Clubhouse | `/fun-facts` | clubhouse.png | Jazzy + Charlie |

Each destination card features a faux academy "sign" nameplate, character peeks, background sliver, and an "Enter →" hover affordance.

## Academy Rank System (Polliwog → Maestro)
Driven by total stickers earned. Warm, non-competitive.

| Rank | Min Stickers | Icon |
|------|-------------|------|
| Polliwog | 0 | charlie-polliwog |
| Tadpole | 5 | finn-danger |
| Apprentice | 12 | dr-jellybone |
| Soloist | 20 | jazzy |
| Conductor | 30 | charlie-drum-major |
| Maestro | 45 | charlie-grad |

- `useRank({ withCelebration })` derives current rank from sticker count.
- `RankBadge` shows on Home + Sticker Book.
- `RankUpCelebration` overlay (with confetti + fanfare-style animation) fires once when crossing a tier; persisted via `localStorage.jma_rank_seen_v1`.

## Character Personality Layer
- `RoomCharacters` component drops 3-4 friendly characters into each game page corners. Tapping any character:
  - Cycles through the character's available outfit assets (10 looks for Charlie, 4 for Sharky, 3 for Chunk, 2 for Jazzy/Lou/Stew).
  - Pops a contextual speech bubble that auto-dismisses.
- Fun Facts mobile: scene wider than viewport (`minWidth: 720px`) so kids horizontally pan/swipe to discover characters. Desktop stays 16:9 capped at 1200px.
- Stew added as a 7th Fun Facts character (kazoo/birds-themed facts).

## Implemented (Feb 14, 2026 — Phase 1-4 cohesion pass)
### Renames
- HTML title now `Jelly of the Month Club Music Academy (JMA)`.
- `Stu Kazoo` → `Stew Kazoo` everywhere (page title, instructions, sticker hints).
- `Loop Studio` → `Beat Lab` (page header, sticker hints).
- `Free Play` → `Jam Hall` (page header, sticker hints).
- `Rhythm Game / Who's Got Rhythm` → `Rhythm Arcade` (menu title).
- `Ear Trainer` → `Ear Quest` (menu title).
- `Fun Facts` → `Fun Facts Clubhouse` (page header).

### New components & data
- `components/HarpIcon.js` — SVG harp (placeholder until user uploads custom artwork).
- `components/RoomCharacters.js` — per-page ambient cast with outfit cycling + speech bubbles.
- `components/RankBadge.js` — current rank pill + progress to next.
- `components/RankUpCelebration.js` — rank-up overlay (mounted in `App.js`).
- `hooks/useRank.js` — rank derivation + opt-in celebration tracking.
- `data/ranks.js` — Polliwog→Maestro ladder.
- `data/musicFacts.js` — added `Stew` entry with 10 kazoo/birds facts.

### Modified
- `pages/HomePage.js` — complete redesign as Academy Campus. 6 destination room-cards, banner, rank badge, sticker spotlight, sticker book button.
- `pages/StickerBookPage.js` — Home button now uses harp icon; RankBadge displayed.
- `pages/FunFactsPage.js` — title renamed; scene now horizontally pannable on mobile; 7 characters.
- `pages/SimonSaysPage.js` — name + RoomCharacters.
- `pages/LoopStudioPage.js`, `FreePlayPage.js`, `RhythmGamePage.js`, `EarTrainerPage.js` — names + RoomCharacters.
- `components/GameUI.js` — Home button replaced with harp + "Home" label.
- `App.js` — RankUpCelebration overlay mounted globally.

## Backlog
- **P1**: Replace `HarpIcon.js` SVG with user's custom harp artwork once uploaded → `assets/ui/harp.png`.
- **P2**: Score multiplier (×2) for streaks of 5+ in Rhythm Arcade.
- **P2**: README.md with GitHub Pages deploy instructions.
- **P2**: Verify MP3 recording on real mobile devices.
- **P3**: Confetti celebration on Who's Got Rhythm / Ear Quest milestones.
- **P3**: "Maestro's Map" board-game journey using existing minigames as tiles (idea stage).

## Implemented (Feb 17, 2026 — Phase 3 Educational Wins)
Four new mini-features designed to boost real music learning while keeping it fun:

### 1. Practice Buddy (daily-return streak)
- `hooks/usePracticeStreak.js` tracks `{count, lastDate}` in `localStorage.jma_practice_streak_v1`. Same-day visits don't bump; previous-day visits +1; gaps reset to 1.
- Crossing 3 / 7 / 14 days unlocks **3 new collection stickers**: Practice Buddy / Weekly Wonder / Two-Week Trooper (under Fun Milestones — pure flair, doesn't gate rank).
- `components/PracticeStreakChip.js` shows on the Home page once streak ≥ 2 (hidden day 1 to avoid pressure).

### 2. Sight-Reading Sprint (new game in PLAY)
- New page `pages/SightReadingPage.js` + reusable `components/SolfegeStaff.js`.
- 3 difficulty tiers: Cadet (3 notes / 20 s / low bells), Pro (4 / 18 s / low bells), Master (5 / 16 s / full 8-bell range).
- Flow: demo plays the sequence once → kid taps bells in order → time bonus on completion → win modal.
- Earns **Music Scholar** achievement ladder (same domain as video lessons — proves reading-the-notation skill).
- Tile added to Play menu (`/play`) and route `/sight-reading` wired in `App.js`.

### 3. Rest Quiz (new Detective Dr. Jellybone mode)
- 4th difficulty in `pages/DetectivePage.js`: instead of swapping one note to a wrong pitch, the suspect tune has an **EXTRA** note inserted.
- 30-second countdown timer (`detective-timer`) starts when guess phase opens; timeout costs a life and reveals.
- The chip row renders the corrupted sequence (one extra chip vs original).
- Reveal text: *"Slot N (SOLFEGE) was the EXTRA note!"*

### 4. Tempo Quiz (new Ear Quest sub-mode)
- New component `components/TempoListeningGame.js`, accessible via the `ear-tempo-quiz-btn` on Ear Quest menu.
- Plays two short clips of the same tune at different BPMs. Kid picks **Faster** or **Slower**.
- 10 rounds per run with progressively narrower BPM deltas: ±40 → ±20 → ±10 BPM.
- Earns **Rhythm Reader** achievement ladder: Cadet at 5+ correct, Pro at 8+, Master at 10/10.

### Verified
- Frontend testing agent: **100% pass (6/6 acceptance criteria)**, zero pageerror exceptions, all 13 routes navigate cleanly.
- `CI=true yarn build` → Compiled successfully (263.25 KB gz, +8 KB for Phase 3).

## Testing Credentials
N/A — frontend-only, no auth.
