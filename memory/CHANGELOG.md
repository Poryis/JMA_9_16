# Changelog

## Feb 16, 2026 — Blimp: forward-flying + diagonal randomization + 80% size
- **Blimp size 80% of original**: `clamp(112px, 18vw, 256px)` (was the half-size version). Verified at 1280 viewport it renders ~236 px wide.
- **Flight orientation fixed**: the source PNG faces LEFT by default, so the previous `scaleX(direction)` had it always flying backwards. Inverted to `scaleX(-direction)` — now direction=1 → scaleX=-1 (faces RIGHT while moving right), direction=-1 → scaleX=1 (faces LEFT while moving left). Verified via inline transform check.
- **Random diagonal flight path**: each lap now generates fresh random parameters and re-mounts the motion node via `key=`:
  - `startY`: 2 – 18% of viewport height
  - `endY`:   2 – 18% of viewport height (independent → varied diagonal angle)
  - `durationSec`: 22 – 34 seconds (so timing varies too)
  - Direction alternates each lap
  - `x` eases linear (true travel feel), `y` eases easeInOut (gentle arc), `rotate` bobs ±3° every 6 s
- Result: no two laps look the same. Sometimes the blimp drifts gently down-and-right, sometimes climbs up-and-left, sometimes nearly level — like wind currents in the sky.

## Feb 16, 2026 — Blimp size + flip, longer Stew breathing room
- **Blimp half the size**: `clamp(140px, 22vw, 320px)` → `clamp(70px, 11vw, 160px)`. Verified at 1280 viewport it now renders ~145 px wide (was ~280 px).
- **Blimp never flies backwards**: rebuilt the drift as a two-phase animation. Each phase drifts the blimp linearly all the way across the screen (`-30vw → 110vw`) over 28 s. When it's off-screen we flip `scaleX` (via an inner wrapper so it doesn't fight motion's own transform) and the next phase drifts the now-mirrored blimp back the other way. Linear easing so the cross looks like real travel; rotate bob still oscillates ±3° on a 6 s loop.
- **Stew Says — more breathing room after level-clear**: bumped the post-fanfare delay from 900 ms → **1400 ms** so the celebration and the next round don't smush together.

## Feb 16, 2026 — Home flair + Stew round-start audio fix
- **Stew Kazoo Says — fanfare/pattern-start bug fixed**: on level-up, `celebrate()` was firing 4 fanfare kazoo notes (C-E-G-HighC at 0/90/180/270 ms) and the next-level `showing` phase started immediately afterward, so the fanfare notes piled onto the first pattern note(s) — sounded like a chord at round start. Added a **900 ms delay** between the fanfare and the next pattern's first note so the fanfare can fully decay first.
- **Finn another −10% on the homepage**: `clamp(68px, 12vw, 145px)` → `clamp(61px, 11vw, 131px)`. Verified: at 1280px viewport Finn now renders at exactly 131 px wide.
- **Jelly Rocks blimp drifting in the sky** (new `BlimpFlyby` component on `HomePage`): 3-frame loop cycling every 220 ms, slowly drifting `-25vw → 85vw → -25vw` across the sky strip over 56 s (rotation oscillates ±3° on a separate 14 s loop for a gentle bob). Placed at `z-index: 0` so it sits behind the hero, sky doodles, cards, and everything else.
- **Shield easter egg**: tapping the JMA shield logo cycles deterministically through **6 different animations** — `wobble`, `spin`, `pop`, `flipx`, `shimmy`, and `jelly` (squash/stretch). Each click animates the shield with `useAnimationControls`. Intro spring animation preserved.

## Feb 16, 2026 — Song Studio mobile pass + seahorse fix
- **Seahorse rest — restored the black quarter-rest body**: my earlier processing wiped out near-black pixels everywhere, which accidentally erased the seahorse's own black body (the part that forms the quarter-rest shape). The source PNG was already correctly transparent at the corners — no black-stripping needed. Re-exported as a straight trim + resize so the black quarter-rest tail is now visible inside slots and the Rest button.
- **Song Studio fits a phone screen with zero scroll** (390×800 → document height = 800px exact, no overflow):
  - Mood picker becomes a horizontal **emoji + name pill** on mobile (no descriptions, smaller emoji, gap-1.5).
  - Charlie hidden on `<sm` widths so the grid can stretch full-width.
  - Meta line gets `text-[9px]` + `truncate`; "Chords:" label collapses on the smallest widths.
  - Tip line shortened ("💡 Leave a beat empty, or tap the 🐠 for a rest!"), `py-0.5` on mobile.
  - Grid card padding `p-1.5 md:p-2`; chord-label cells `w-8 md:w-12`.
  - **Piano keys**: width `clamp(34px, 7.5vw, 64px)`, height `clamp(78px, 16vw, 170px)` (was 120 min) — keyboard now ~40% shorter on mobile.
  - Rest button matched to the same dimensions.
  - Toggles + control buttons: smaller padding, smaller icons (`w-3.5 h-3.5 md:w-4 md:h-4`), smaller text (`text-[11px] md:text-sm`), tighter gaps.
  - Console wrap: `p-2 md:p-4` (was `p-3 md:p-4`), shorter "My Songs" → "Songs" label on the gallery button.
- Desktop layout unchanged — all the `md:` modifiers preserve the full-size experience.

## Feb 16, 2026 — Detective: buzz-in during the suspect playback
- Kids can now **tap the currently-lit chip during the SUSPECT/corrupted playback** to lock in their guess the moment they hear something off. Other chips stay locked until the playback finishes (so it's "buzz on the wrong note" — not random clicks).
- Tapping the lit chip cancels the remaining playback and snaps straight to the reveal phase.
- Phase hint reworded: `🔍 Tap the wrong note the moment you hear it!`
- "How to Play" updated: *"Tap the wrong beat as you hear it, or wait until the end."*
- Verified live via automated test: clicking the lit chip mid-corrupted-playback transitions phase to `reveal`, locks the guess, and shows the case result.

## Feb 16, 2026 — Polish round: calmer Song Studio, finished Detective chips, smaller Finn
- **Charlie's Song Studio — calmer hierarchy**:
  - Reduced the mood-color tint over the studio backdrop (from 55%→33% at top, transparent middle, soft white wash at bottom) so the studio reads as a single unified setting instead of fighting the controls.
  - Wrapped the entire control surface (mood picker + grid + keyboard + toggles + buttons) in a single frosted-glass "studio console" panel: `rgba(255,252,247,0.86)` + `backdropFilter: blur(14px)` + chunky 10px JMA-dark drop. Studio bg shows around the edges only; controls now sit on one cohesive surface.
- **Detective Dr. Jellybone — finished beat-chip aesthetic**: Replaced the plain white rounded rectangles with proper "evidence card" chips that match the corkboard theme:
  - Cream paper base (`#FFF7E1`) with a subtle inner gradient + double-shadow (3D button drop + ambient cast shadow)
  - Numbered badge (white circle, bordered) at the top instead of a bare number
  - Centered eighth-note SVG glyph at the body (swaps to solfege text on reveal)
  - Per-slot deterministic tilt (-3° to +3°) for a hand-pinned look
  - Lit playback state now uses the bell's color with a colored outer-ring glow + scale-up; reveal states still hard green/red
  - Larger touch target (46–64px wide × 60–86px tall)
- **Home page — Finn scaled 15% smaller**: `clamp(80px, 14vw, 170px)` → `clamp(68px, 12vw, 145px)`. Now visually balances Charlie and the JMA shield rather than overpowering them.

## Feb 16, 2026 — Lesson-world art landed in the app
Imported & optimized the 5-23 batch of lesson artwork for in-app use.

**New backgrounds (`assets/backgrounds/`):**
- `detective-room.jpg` (1600×900, 260 KB) — corkboard with detective notes. Drives the Detective Dr. Jellybone card on the PLAY menu AND the full-screen Detective game scene (menu + playing screens).
- `recording-studio.jpg` (1600×900, 100 KB) — JMA Recording Studio. Drives the full-screen Charlie's Song Studio scene; overlaid with a soft mood-color tint that crossfades when kids switch moods.
- `charlie-in-studio.jpg` (1280×720, 97 KB) — Charlie-in-the-Studio scene art used as the Song Studio card on the CREATE menu. Charlie's already in-scene, so no separate character overlay needed.

**New character (`assets/characters/`):**
- `charlie-studio.png` (663×700, 265 KB) — Studio Charlie cutout. Replaces the per-mood Charlie outfits (`charlie.png`, `charlie-zoot.png`, `charlie-steampunk.png`) in the Song Studio so the studio setting feels consistent across Happy/Sad/Mysterious.

**New animation frame sets (`assets/animations/`, ready for use):**
- `jelly-rocks-blimp-{1,2,3}.png` (800×450, 83-84 KB each) — 3-frame Jelly Rocks blimp animation.
- `speakers-stew-{1,2,3}.png` (600×600, 65-82 KB each) — 3-frame speaker pulse animation.

**Wired changes:**
- `pages/PlayMenuPage.js` — Detective tile bg → `detective-room.jpg`.
- `pages/CreateMenuPage.js` — Song Studio tile bg → `charlie-in-studio.jpg`, character overlay removed.
- `pages/DetectivePage.js` — menu + playing screens bg → `detective-room.jpg`.
- `pages/SongStudioPage.js` — page bg → fixed `recording-studio.jpg` with a per-mood color tint overlay (no longer the plain mood-color gradient). Content moved to `z-10` so it sits above the tint.
- `data/songStudio.js` — all three mood `charlie` fields → `charlie-studio.png`.

## Feb 16, 2026 — Song Studio: seahorse Rest button
- **New "Rest" key** sits at the right edge of the piano keyboard, sized to match the white keys. Uses the user-supplied seahorse artwork (`assets/ui/seahorse-rest.png`, ~22 KB, 183×320, black-bg removed + trimmed).
- Tapping the rest button drops a `REST` sentinel into the current slot, advances the auto-cursor, and plays no sound. The slot now displays the seahorse PNG (replacing the slot number) both during composition and during playback (the slot also gently lights pink when its beat plays).
- Counter updated: `"3 notes + 1 rest · 100 BPM · plays 2×"`. Gallery counts only musical notes (excludes rests).
- Existing saved songs still work — `REST` is a new value, never present in older saves; no migration needed.
- Tip text updated: *"💡 Tip: Leave a beat empty, or tap the 🐠 seahorse for a rest!"*

## Feb 16, 2026 — Song Studio: tight drum sync + slower mysterious
- **Drum-sync rebuild**: Replaced the HTMLAudioElement drum playback with Web Audio buffer playback. The drum loop AND every chord/melody note now start from a single `AudioContext.currentTime + 120ms` anchor, so they're sample-accurate-aligned no matter the OS audio latency. New helpers in `usePianoAudio`: `preloadLoop`, `playLoop`, `now`, and a `when` parameter on `playPianoNote`.
- **Mysterious mood slowed**: 120 BPM → **85 BPM** ("spooky & wandering" now actually wanders). Built a new custom drum loop at 85 BPM (`assets/audio/songs/jam_drums_mysterious.mp3`, ~45s) — sparse kick + low-tom hit on beat 1, soft snare on beat 3, and a low-tom flourish on the "&" of 4 every other measure for that off-kilter mystery feel.

## Feb 16, 2026 — Song Studio: low chord voicings + ballad backbeat tweak
- **Chord voicings dropped below the melody**: All chord triads now use 1st/2nd inversions chosen so every chord note sits ≤ **B4** — strictly below the kid's C5→C6 melody octave. No more harmonic muddiness.
  - Happy: C(C-E-G), G(D-G-B), Am(C-E-A), F(C-F-A)
  - Sad: Am(C-E-A), F(C-F-A), C(C-E-G), G(D-G-B)
  - Mysterious: Dm(D-F-A), G(D-G-B), Dm(D-F-A), C(C-E-G)
- **Sad drum loop — ballad backbeat**: Replaced the soft kick on beat 3 with a snare in every measure. Pattern is now: kick on beat 1, snare on beat 3, ride-bell sparkle on every beat. Classic slow-ballad feel.

## Feb 16, 2026 — Charlie's Song Studio: kid-friendly playability pass
- **Rests-are-OK hint**: Added a dashed callout above the 16-slot grid: *"💡 Tip: You don't have to fill every beat — leave some empty for rests!"* Counter changed from `0 / 16 beats placed` to `0 notes placed` so the empty grid no longer feels like an unfinished assignment.
- **High-octave melody keyboard**: Piano now shows only the **top octave (C5 → C6, 8 white keys)** instead of the full C4→C6 range. Kids' melody notes sit cleanly above the I-V-vi-IV chord triads (which live in C4→E5), so harmonies no longer clash. The audio hook still preloads the full C4→C6 set so the underlying chord triads still play with zero latency.
- **Drums + Chords toggles**: Two new pill buttons (`Chords ON/OFF`, `Drums ON/OFF`) sit between the keyboard and the play row. Kids can solo their melody, or hear it with just chords / just drums / both. Drums toggle is auto-disabled on moods with no drum loop.
- **Sad drum loop**: New custom-built ~55s loop at 70 BPM (`assets/audio/songs/jam_drums_sad.mp3`) — sparse ride-bell groove on every beat with a soft kick on 1 & 3 and a brushed snare on beat 3 of every other measure. Replaces the previous "no drums" Sad mood.

## Feb 14, 2026 — Clubhouse Find-and-Reveal + Custom Harp Artwork
- **Custom JMA harp Home button**: Saved user-uploaded artwork to `assets/ui/jma-harp.png`. Made the black background transparent + resized to 187×256 (8.8 KB). `HarpIcon.js` now renders the PNG instead of the SVG placeholder.
- **Removed duplicate Stew**: The standalone Stew character on the Fun Facts scene was creating two visible Stews (since Lou's image already has Stew on his shoulder). Now back to 6 characters total.
- **Fun Facts as a find-the-character game**:
  - Characters start as **dark silhouettes with a warm yellow glow halo** — kids must spot and tap each shadow to reveal them.
  - Tapping a hidden friend fires a sparkle "pop" animation, reveals the full-color character, then opens the fact modal.
  - **Mobile minWidth bumped to 1100px** so kids genuinely have to swipe/pan to discover everyone.
  - **Found state persists** in `localStorage.jma_funfacts_found_v1` so progress isn't lost between visits.
  - Live progress chip: "0 / 6 friends found" turns into "★ ALL FOUND! ★" when complete.
  - Auto-awards the `ach_fact_finder` sticker on first all-found.

## Feb 14, 2026 — Polish Round (post-partner feedback)
- **BUG FIX**: Stew Kazoo Says no longer goes to a blank page after beating level 8. Now triggers a mega confetti celebration + "YOU BEAT THE WHOLE GAME!" message, then auto-navigates home after 3.2s. Mid-game level clears also fire confetti (mega on level 5).
- **Backgrounds**: Deleted `public/assets/backgrounds/stage.png` (had the Snoopy "Legendary Concert" art). Rhythm Arcade card now uses a vibrant red diagonal-stripe arcade gradient instead.
- **Home card character sizing**: Added per-destination `charWidthPct` + `char2WidthPct` so Jazzy / Stew / Dr Jellybone / Chunk are no longer oversized relative to other characters.
- **Home card spacing**: Increased gap between primary + secondary characters (Jam Hall's Finn and Charlie no longer overlap).
- **RoomCharacters polish**:
  - Hidden on mobile (`hidden md:block`) so they no longer crowd the touch play area.
  - Added per-character scale map (Jazzy ×0.55, Stew ×0.6, Dr Jellybone ×0.7) so the ambient cast feels visually consistent.
  - Fixed-size square container + `object-contain` so tapping to cycle outfits no longer shifts the character's footprint.
- **Jam Hall duplicate Finn**: `CharacterReaction` mascot now only renders at streak ≥ 3 (previously the default low-streak Finn overlapped the room's Charlie at bottom-right).
- **Perf**: All home card character images now use `loading="lazy"` to help mobile load.

## Feb 14, 2026 — Academy Campus Evolution (Phases 1-4)
**Global rebrand to "Jelly of the Month Club Music Academy" (JMA).**
- HTML title + on-page banner updated.
- `Stu Kazoo → Stew Kazoo`, `Loop Studio → Beat Lab`, `Free Play → Jam Hall`, `Rhythm Game → Rhythm Arcade`, `Ear Trainer → Ear Quest`, `Fun Facts → Fun Facts Clubhouse` everywhere.

**Home page redesigned as Academy Campus.**
- 6 destination room-cards with background scenes, character peeks, and "sign" nameplates.
- Vertical-stack on mobile, 2-column grid on desktop.
- Sky cartoon-note backdrop + brand banner.

**Harp Home button.**
- Replaced JMA-shield Home button with a custom `<HarpIcon />` SVG + "Home" label across all pages and the Sticker Book.

**Character personality everywhere.**
- New `RoomCharacters` component drops 3-4 friendly characters onto Jam Hall, Rhythm Arcade, Stew Kazoo Says, Ear Quest, and Beat Lab.
- Tapping a character cycles through their outfit assets (uses existing artwork) and pops a transient speech bubble.

**Fun Facts mobile exploration.**
- Clubhouse scene now horizontally pannable on mobile (`minWidth: 720px`); desktop unchanged at 16:9 capped at 1200px.
- Added a 7th character (`Stew`) with its own kazoo/birds-themed fact bank.

**Academy Rank progression.**
- `Polliwog → Tadpole → Apprentice → Soloist → Conductor → Maestro` ladder driven by sticker count.
- `RankBadge` visible on Home + Sticker Book.
- `RankUpCelebration` overlay (confetti) fires once on tier crossings; persisted in `localStorage.jma_rank_seen_v1`.

**Testing**: 22/24 frontend acceptance criteria passed in iteration_3 testing. Two issues found and fixed:
1. Stew character in Fun Facts now opens fact modal (added `Stew` key to `musicFacts.js`).
2. Mobile Fun Facts scene now genuinely scrolls horizontally (`minWidth: 720px` instead of `min(720px, 95vw)`).

---

## Feb 2026 (prior)

### Score Penalty Tuning
- Who's Got the Rhythm: wrong-note penalty -50 (clamped at 0).
- Stu Kazoo Says: wrong-answer penalty -5*level (clamped at 0).

### Stu Kazoo Says — Level Clear Celebration (initial)
- Added `Confetti.js` + `playFanfare()` arpeggio.
