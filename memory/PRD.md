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

### JMA Originals (Feb 2026)
- 5 of the user's own songs (Brand New Friend, The Magic Is in the Music, Faster As We Go, Play One Skip One, Goody Bag) pitch-shifted to either C or G (whichever was closer within ±3 semitones) using ffmpeg's rubberband filter.
- Each song trimmed to ~60s with 2s fade-in and 3s fade-out; 128kbps MP3 output.
- Stored in `/app/frontend/public/assets/audio/songs/` (relative URLs for GH Pages compatibility).
- Rhythm Game now plays the backing track during gameplay, with note-spawn interval derived from each song's BPM:
  - chill = 3 beats per note, normal = 2 beats per note, turbo = 1 beat per note
- Audio is delayed by `fallSpeed` ms so the first falling note hits the target line as beat 1 plays.
- "G Mode" / "A Minor" hint badge shown at top of playing screen for non-C-major originals.

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
