# Jellybones Music Academy - Rhythm Game PRD

## Original Problem Statement
Build a rhythm game for a music education platform using the user's custom artwork (Jellybells desk bells with faces, drum kit, xylophone, piano, turntable, characters) and proprietary audio files, for young children.

## Product Requirements
- 5 game modes: Free Play, Rhythm Game (falling notes), Simon Says, Ear Trainer, Loop Studio
- Custom assets: Jellybells, Drum kit, Xylophone, Piano, Turntable, characters
- Local score tracking (localStorage)
- Multiple difficulty levels and speeds
- Mouse, touch, and keyboard support
- Polyphonic audio
- Fullscreen / ultrawide CSS support
- **Critical**: Instantaneous visual swap states on press/release (no animation, no delay) for ALL instruments

## Implemented (as of Feb 18, 2026)

### Instant swap states (rock solid - finally!)
- Two frames (idle + pressed) pre-rendered into DOM; toggled via imperative refs
- `opacity: 0` on idle (preserves layout so mouse doesn't spuriously "leave" after press)
- `setPointerCapture` on pointerdown locks pointer events to the bell even on layout shift
- `transform: scale(0.95)` on pressed frame for extra visual feedback
- Inline `style.display`/`.opacity`/`.transform` applied in event handlers BEFORE React setState
- No JSX `style` props for display (so React reconciliation can't clobber imperative writes)
- Playwright-verified: mouse + keyboard + simultaneous multi-bell all work

### Free Play
- Bells arranged in true CIRCLE (square container, equidistant, each bell rotated to point outward from center)
- JMA logo medallion in center
- Big instrument sizes (bells ~160px, xylophone ~300px tall)
- Drums: kit scaled 1.6x, crash/ride both +10%, snare -10%, all drum frames swap correctly
- Drums: toms sit tightly on top of kick drum (TOMS_DY=+25), whole kit shifted 30px left via translateX
- 4-tab selector (Bells, Xylophone, Piano, Drums) with keyboard mappings (1-8 for bells, Q W E A S D X for drums)
- Record + Playback, Guided "Learn a Song" mode
- Fun multi-color radial gradient game-board background (replaces white)
- **Mobile responsive (Feb 2026)**: removed the `.game-board` bounding box; gradient applied directly to the page bg. Bells shrink on narrow viewports (`w-20 sm:w-28 md:w-40 lg:w-48`). Drum kit and xylo/piano wrapped in a `ResponsiveScaler` that JS-measures available width and scales uniformly (never up-scales past 1 — desktop stays full-size).

### Sticker Book (Feb 2026)
- **59 unlockable stickers** across 6 categories: Meet the Band (6), **Outfit Collection (17)**, Instruments, Jellybells, Song Champion, Achievements
- **Outfit stickers** unlock via specific gameplay milestones:
  - Zoot Charlie = play xylophone, Punk Charlie = 15 streak, Ragu Charlie = turbo win, Surf Charlie = 3 loops, Grad Charlie = Simon Says lvl 8, DMC Charlie = 3+ drum tracks in loop, Disco Charlie = 140+ BPM loop, Drum Major Charlie = play drums, Steampunk Charlie = all 5 JMA Originals, Zoot Sharky = play piano, Hip-Hop Sharky = 1000 pts, Snorkel Sharky = 10 ear trainer sessions, Disco Chunk = 30s loop play, Steampunk Chunk = playback 10+ notes, Disco Jazzy = 10 songs completed, Disco Lou = Goody Bag, Swing Stew = Faster As We Go
- Backed by `localStorage`; `useStickers.js` tracks earned timestamps so Sticker Spotlight can identify newest earn

### Sticker Spotlight (Feb 2026)
- New widget on home page (`/app/frontend/src/components/StickerSpotlight.js`)
- Shows kid's most recently earned sticker with "NEWEST STICKER" label, count, and gentle bouncing animation
- Tapping opens the Sticker Book
- Empty state: encourages first-sticker play with "Play any game to earn your first sticker!"

### JMA Originals (Feb 2026)
- 5 of the user's own songs (Brand New Friend, The Magic Is in the Music, Faster As We Go, Play One Skip One, Goody Bag) pitch-shifted to either C or G (whichever was closer within ±3 semitones) using ffmpeg's rubberband filter.
- Each song trimmed to ~60s with 2s fade-in and 3s fade-out; 128kbps MP3 output.
- Stored in `/app/frontend/public/assets/audio/songs/` (relative URLs for GH Pages compatibility).
- Rhythm Game now plays the backing track during gameplay. Audio starts immediately (fading in); note spawning is delayed by 2000ms so the first note lands AFTER fade-in. Last note lands ~3s before fade-out begins (verified per-song buffer +2.4s to +6.5s).
- Melodies **follow the chord progression** of each song (per user direction Feb 2026):
  - Play One Skip One: Cmaj / Dmin arpeggios, 2 bars each
  - Magic Is in Music: La (1 bar) / Do (1 bar) / Re (2 bars) — stay on each chord root
  - Brand New Friend: I-V-vi-IV chord tones (G-D-Em-C) with rhythmic variance via rests
  - Faster As We Go: G-Em-C-D chord tones
  - Goody Bag: G-C-G-D (boogie prog) chord tones
- **Rests supported** via `null` in notes arrays (spawn effect skips null entries). This is what gives songs rhythmic variance instead of 1-note-per-beat monotony.
- `beatsPerNote` per-song field controls base spawn rate. Difficulty scales it: chill=2x, normal=1x, turbo=0.5x.
- "G Mode - Start on So (5)" / "A Minor - Start on La (6)" hint badge shown at top of play screen for non-C-major songs.

### Rhythm Game
- Bells live AT the target line; falling notes land directly on matching bell
- Long runway (~788px) for generous reaction time
- Click a song to start (no separate Start button)
- Removed Smoke on the Water, Iron Man, Seven Nation Army (required notes outside 8-bell range)
- Swap states work on bells via pointer + keyboard
- **Scoring: SUPER forgiving** — any un-hit note of the correct pitch on screen counts as a hit (Feb 2026: reverted an accidental 45%-min-travel gate that made scoring feel impossible)

### Sticker Book (Feb 2026)
- 41 unlockable stickers tracked via `localStorage` (`useStickers.js`)
- Awarded on game-mode completion milestones (song clears >=70% accuracy, streak 10/25, etc.)

### Home Page
- 6 characters each with 10-11 age-appropriate music facts
  - Finn = rhythm, Chunk = drums, Dr. Jellybone = theory, Charlie = singing, Jazzy = jazz, Lou & Stew = world music
- Click character → cartoon speech bubble modal → "Tell me another!" or "Cool!" button
- Facts hardcoded in `/app/frontend/src/data/musicFacts.js` (no LLM calls, no credit usage)

### Deployment
- **GitHub Pages ready (Feb 2026)**:
  - `HashRouter` replaces `BrowserRouter` — no server-side routing tricks needed, URLs become `/#/free-play` etc.
  - All asset paths made relative (`/assets/...` → `assets/...`) across all JS files (115 replacements) so the app works under any GitHub Pages sub-path.
  - `package.json` has `"homepage": "."` (relative bundle paths) and `predeploy` + `deploy` scripts wired to the `gh-pages` package.
  - To deploy: `cd frontend && yarn deploy` (pushes to a `gh-pages` branch on origin).
  - Live URL pattern: `https://USERNAME.github.io/REPO-NAME/`

### Home Page Restructure (Feb 2026 - partner feedback)
- Title is now ALL CAPS: **JELLY JAM BOX**
- Only Finn (left) and Charlie (right) flank the central shield logo. Shield spins on click for playful feedback.
- Replaced character lineup with new **Fun Facts** mode tile (yellow, BookOpen icon).
- 6 mode tiles in a clean 3×2 grid: Jam Time / Who's Got Rhythm / Simon Says / Ear Trainer / Loop Studio / Fun Facts.

### Fun Facts Page (Feb 2026)
- New `/fun-facts` route with clubhouse background.
- All 6 characters as cards in a 2-col (mobile) / 3-col (desktop) grid; tap opens fact modal.
- `noteFactSeen()` trigger moved here from HomePage; "fact_finder" sticker now unlocks via the Fun Facts page.
- Finn's facts rewritten to properly distinguish BEAT (steady pulse), TEMPO (how fast/slow), and RHYTHM (pattern of long/short sounds).

### Renames (Feb 2026)
- **"Free Play"** → **"Jam Time"** (in title, home tile; route stays `/free-play`)
- **"Rhythm Game"** → **"Who's Got the Rhythm"** (menu screen title; home tile reads "Who's Got Rhythm")

### Shield as Home Button
- `GameHeader` replaced lucide `Home` icon with the JMA shield logo (`assets/ui/logo.png`) on every page; tapping returns to home.

### Loop Studio (Feb 2026)
- **Mobile layout**: drums + turntable now stack vertically below the loop grid (`flex-col` on mobile, `flex-row` on `md+`). Eliminates horizontal scroll issues.
- **Spacebar** = play/stop toggle, ignored when typing in inputs.

### Jam-Along (Feb 2026 - Jam Time / Free Play)
- New "Jam Along" dropdown lets kids pick any of the 5 JMA Originals as a backing track to jam to with any instrument.
- Audio volume reduced to 0.55 so the kid's playing is clearly audible above the track.
- Auto-stops when leaving the page.

### Drums-Only Rhythm Songs (Feb 2026)
- 2 new entries in the rhythm game with `instrumentMode: 'drums'`, reusing the existing JMA Originals audio:
  - 🥁 **Play One, Skip One (Drums)** — basic kick/snare/hihat backbeat
  - 🥁 **Goody Bag (Drums)** — bouncy boogie pattern with crash accents
- Drum mode swaps the 8 bell lanes for 4 drum lanes (kick/snare/hihat/crash), keyboard maps to Z/X/C/V.
- Falling notes show drum images. `playDrumSound` triggered on hit instead of `playBellNote`.

### Bell Sizing (Feb 2026)
- Mobile bell instrument size reduced from `w-20 h-20` (80px) to `w-14 h-14` (56px) so 8 bells fit nicely around the circle on a 390px phone without overflow.

## Tech Stack
- React, Tailwind CSS, Framer Motion, React Router
- HTML5 AudioContext (custom `useAudio.js`)
- localStorage for scores
- Frontend-only, no backend

## Files of Note
- `/app/frontend/src/pages/FreePlayPage.js` - BellCircle layout, Playable{Bell,DrumPiece}, imperative swap
- `/app/frontend/src/pages/RhythmGamePage.js` - falling notes, bell-at-target-line layout
- `/app/frontend/src/pages/HomePage.js` - character click → music fact modal
- `/app/frontend/src/pages/LoopStudioPage.js` - 16-step sequencer with imperative flash API
- `/app/frontend/src/components/Instruments.js` - Xylophone, Piano, DrumKitVisual, BellsVisual (all imperative via forwardRef)
- `/app/frontend/src/components/JellyBells.js` - Shared bells row for Simon Says / Ear Trainer
- `/app/frontend/src/data/musicFacts.js` - Character fact database
- `/app/frontend/src/data/songs.js` - Rhythm game song library
- `/app/frontend/src/index.css` - `.instrument-frame-pressed { display: none }` baseline
- `/app/frontend/src/App.css` - `.game-board` with fun gradient background

## Backlog / Roadmap
- **P2**: Add user's proprietary original song sequences to songs.js (awaiting BPM + note lists)
- **P3**: Celebration moment when a kid completes a guided song in Free Play

## Testing Credentials
N/A (no auth)
