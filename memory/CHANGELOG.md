# Changelog

## Feb 20, 2026 — Boom Garden v3 — Stew on drums + real notation + scrolling Tap Trail + fixed timing
Round 3 of user feedback:
- "Snare has both states showing at the same time" — visual bug.
- "When it's the student's turn to perform they need something to give them the timing... they can't just copy with perfect tempo, or whatever you currently have testing if its right or not" — timing detection broken + needs reference pulse.
- "Tap Trail to be reading in time. For more than a measure at a time. So have something scrolling or something?" — Tap Trail needs to be a real sight-reading exercise.
- "For rests lets keep my seahorse rest and put Shh under it. For all the others, accompany the rhythm words with these notes I've attached" — real musical notation per user-provided PNGs.
- Final v3: "Instead of the snare, lets have Stew perform the drums. I have given you two animations... For each hit have him alternate between those animations."

### What changed
- **Real musical notation in every strip**. Imported user's PNGs (whole/half/quarter/eighth + highlighted variants) to `/assets/notes/rhythm/`. `RhythmStrip` now renders a real note PNG above the Kodály syllable in each block. Rest blocks keep the seahorse asset and now show "Shh" underneath.
- **Stew the drum-major now performs every drum hit**. New `StewDrummer` component uses the 8 PNG frames the user provided (left-stick + right-stick × 4 each, shared neutral pose). Each hit (demo or kid tap) alternates between left/right animations. Direct-DOM `src` swap chain at 45 ms/frame keeps the animation in sync with the audio with no React re-renders. Preloads all 8 frames so the first hit doesn't stutter. `BigSnare` retired.
- **Tap Trail rewritten as a scrolling sight-reading reader**. New `ScrollingRhythmStrip` component shows notes scrolling right-to-left through a fixed gold "TAP HERE" strike line. Multi-measure patterns (8–12 beats Cadet, up to 16+ beats Master) via new `TRAIL_PATTERNS` data. The 4-beat count-in is now visually integrated — the strip starts 4 beats off-screen-right and scrolls into the strike line during the click count-in, so kids see the music approaching as they hear the pulse.
- **Timing detection rewritten with nearest-neighbour matching**. Old logic forced strictly sequential taps — a missed beat broke the whole round because beat-2's tap was compared against beat-1's expected time. New logic finds the closest UNCLAIMED non-rest note in time at each tap and scores against that, so kids can recover from a missed beat without the round desyncing.
- **Per-difficulty timing tolerance** in `TOLERANCE_MS`: Cadet ±400 ms (~53 % of a beat — very forgiving for 5-year-olds with a click reference), Pro ±275 ms, Master ±175 ms.
- **Round-pass threshold loosened** from "every note perfect" to "≥80 % of non-rest notes in window" — celebration is now achievable without being given away.
- **Copy Cat now has its own 4-beat count-in** between demo and input — kids hear the click for a full measure before they're expected to play, anchoring them to the tempo.
- **BigSnare double-state bug fixed**: pressed-frame `display` was being cleared to `''` on pointerUp (defaulting to `block`); explicitly set to `'none'` now. Component retired in favour of `StewDrummer` regardless.

### Verified
- Build clean. Copy Cat strip shows real quarter-note PNGs with "Ta" syllables; demo highlights the playhead block in bright yellow. Stew drum-major character renders below with "TAP STEW!" / "Listen..." / "1 · 2 · 3 · 4" hint badge per phase. Tap Trail scrolling strip shows notes parked to the right of the gold strike line during count-in, with "TAP HERE" gold badge labelling the strike line. Pro patterns visibly mix half / eighth-pair / quarter notes with proportional widths.


User feedback on the v1: "These games are SO lackluster... the ct and twins and trail crap is awful, not in line with our art at all... lets not do that... Instead of tap let's use my snare or something... When it's the student's turn to perform, have the beat in time... Also on twin beats, if it's rest-ta-ta-ta or ta-ta-ta-rest there is no way to tell the difference."

### What changed
- **Mode-picker artwork**: dropped the 🐱 👯 🛤️ emojis entirely. Each mode card now matches the LearnMenuPage tile recipe — background scene, chunky border, drop shadow, sign nameplate, character peeking from the bottom-right.
  - **Copy Cat** — recording-studio bg + Dr. Jellybone (the listening / demoing octopus)
  - **Twin Beats** — clubhouse bg + Llama Lou & Stew (the literal twins)
  - **Tap Trail** — graffiti-wall bg + Charlie RunDMC (the rhythm performer)
- **Big snare drum** replaces the generic red TAP button. New `BigSnare` component uses `assets/drums/Snare 1.png` and `Snare 2.png` with direct-DOM frame swap on press. Exposes an imperative `flash()` ref so the demo can pulse the snare in time with each scheduled snare-hit. Floating "HIT IT!" / "Listen..." / "1 · 2 · 3 · 4" hint badge under the drum.
- **Click track during every input phase** — Copy Cat and Tap Trail now run a steady hi-hat tick on every beat while the kid is performing, so they have an audible pulse to lock onto. Tap Trail also plays a 1-measure (4-beat) count-in before the pattern starts.
- **Twin Beats audio-ambiguity fixed** — the hi-hat click track now runs UNDERNEATH the demo snare hits too, so leading-rest vs trailing-rest mirror patterns are audibly distinguishable: kids hear all 4 clicks and can tell which beat was "covered" by a snare vs which was silent. No need to filter pattern pairs.
- Hit window tightened slightly from ±300 ms → ±275 ms now that the kid has a click reference to follow.

### Verified
- Build clean. Mode picker shows three JMA-style cards with character art and matching backgrounds. Copy Cat shows full big-snare with active red state. Twin Beats shows three distinct strips with proportional block widths (half = 2× wide, eighth = ½ wide). Tap Trail count-in banner + snare are visible.


## Feb 19, 2026 — Mobile playability boost in Who's Got the Rhythm
Two compounding fixes for the "I don't know when to tap, and I want to tap the bell, not a button" mobile pain:

### Beat Lab — direct-tap on drum kit and turntable
- Kids can now jam on Beat Lab WITHOUT touching the sequencer grid. Each individual drum piece (kick, snare, hi-hat, crash, ride, tom, low-tom) is tappable and fires its sound + visual flash. Same `playDrumSound` audio path as the loop sequencer — zero new audio plumbing.
- Turntable records are tappable too: left record → `scratchPull`, right record → `scratchPush`. The record briefly halts spinning via the existing `activeHits` mechanism so the kid sees the scratch land.
- `DrumKitVisual` now takes an `onHit(drumId)` prop and exposes the shared `flashDrum` routine via the existing imperative ref (so the sequencer's flash trigger stays identical).
- `TurntableVisual` takes an `onScratch(scratchId)` prop.
- Both visuals: `cursor-pointer`, `touchAction: 'none'`, pointer capture to prevent mid-tap interruption. Toms-base decoration explicitly `pointer-events: none` so it never intercepts a tom tap.

### Beat Lab + Ear Trainer composition cleanup
- User flagged Beat Lab as a "compositional nightmare" — two Charlies and two Chunks at the bottom-right, plus Chunk blocking the top-left of the beat lab area.
- **Root cause**: two character systems stacked on the same page. `PageCharacters` (older, fixed bottom-3 corners, picked Charlie + Chunk for both Beat Lab and Ear Trainer) was rendering on top of `RoomCharacters` (newer per-room cast with outfit cycling and speech bubbles). Result: duplicates at the bottom corners.
- **Fix**: removed `PageCharacters` import + render from `LoopStudioPage.js` and `EarTrainerPage.js`. The superior `RoomCharacters` system stays.
- Beat Lab is intentionally left with an empty room-cast (`'beat-lab': []`) because the scene already has the drum kit, turntable, JMA-branded pulsing speakers, sequencer grid, and controls bar — adding floating characters made it cluttered instead of charming. `RoomCharacters` now early-returns null when the cast is empty.
- Other rooms (Jam Hall, Rhythm Arcade, Kazoo Room, Ear Quest, Note Match, Detective) keep their RoomCharacters casts.

### Round 3 — Threw out the time math, switched to position-based hit detection
- User feedback: "I'm a professional musician and didn't get one perfect... very unintuitive now" + "can't have the target be that low on the screen visually, at least on the phone."
- **Root cause**: my `IDEAL_PROGRESS` constant was a guess that depended on screen size, bell heights, breakpoints, etc. — fragile by design. A pro can FEEL when bells visually meet, so if the algorithm disagrees, the algorithm is wrong.
- **Fix**: `FallingBellNote` now forwards its motion.div ref to the parent via `registerFallingRef`. At tap time, `handlePlayNote` measures the actual `getBoundingClientRect()` of the falling bell AND the static target, computes the vertical distance between centers, and awards:
  - PERFECT (100) — distance ≤ 40 % of target-bell height (the bells visually overlap)
  - GREAT (75) — distance ≤ 90 % (one bell-radius away)
  - GOOD (50) — any other on-screen hit (forgiving fallback)
- No magic constants. What you see is what you score. Works on any screen, any speed.
- **Static target bell raised on mobile**: `bottom-24` (96 px) on mobile, `md:bottom-5` (20 px) on desktop. Bells now sit ~75 % down the screen instead of jammed at the bottom edge. Lane-target dashed band moved to `bottom: 100 px` on mobile to keep the bells inside the visual catch zone.
- Halo timing widened to 55 %–95 % of fall (40 % duration) so kids get a long warning glow regardless of how the now-screen-relative target sits.

### Round 2 follow-up — PERFECT now lands at the visual overlap, with a lock-in flash
- User feedback: "it goes too low on the screen before it's perfect... maybe we time it so when its over the bell you play they lock together."
- Recomputed the geometry: the falling bell PNG visually overlaps the static target around progress 0.78–0.80, not 0.85. Lowered `IDEAL_PROGRESS` from 0.85 → **0.78** so PERFECT lands the instant the bells visually meet.
- Tightened the PERFECT window from ±7 % → ±5 % (now genuinely earned). GREAT tightened from ±18 % → ±14 %.
- Shifted the gold tap-now halo from the 0.78–0.95 range to **0.68–0.88** so it peaks right at the new ideal moment.
- New `bell-lock-in` flash: on a PERFECT hit, an expanding gold ring + bell pop animation fires on the static target bell (320 ms). Kids feel the falling bell "click" onto the target. Implementation is class-toggle via ref (zero React render), with a reflow trick so rapid successive PERFECTs all animate.

### "Tap-now!" halo on the falling bell
- New CSS keyframe `bell-tap-now` + `.bell-tap-now-halo` class. Each falling bell now renders a hidden gold radial halo BEHIND the PNG that animates in at 78 % of the fall and out at 95 %, with the duration scaled to the fall speed via `--glow-delay` / `--glow-duration` CSS variables set per-note from React.
- Result: the bell visibly glows gold right as it enters the hit window — kids see "now!" without reading a single word.
- Zero-JS per frame; pure CSS animation with delay → no perf cost.

### Mobile big-finger lanes
- New invisible `md:hidden` button covering the full lane on small screens, `data-testid="game-lane-{note}"`, sharing the same `doDown`/`doUp` handlers as the static bell.
- Falling bells now have `pointer-events: none` so a tap anywhere in the column lands on the lane button below — kids tap "where the bell is" and score, no precision required.
- Lower z-index (z-0) than the static target bell (z-10), so taps directly on the bell still go to the bell.

## Feb 19, 2026 — Audio stop + Jam Session declutter + Rhythm graduated feedback

### Charlie's Song Studio — Stop now actually stops the melody (P0)
- **Root cause**: `playPianoNote` scheduled future Web Audio sources but didn't return them, so when Stop was pressed only the drum loop and visual timers got cancelled — melody + chord sources kept firing.
- **Fix**: `usePianoAudio.playPianoNote` now returns the `AudioBufferSourceNode`. `SongStudioPage.playSong` pushes every scheduled chord triad and melody source into `scheduledSourcesRef`. `stopPlayback` iterates and calls `.stop()` on each, including future-scheduled ones (Web Audio honours this).

### Jam Session — Jelly Bells decluttered (P1)
- Removed solfège labels (Do/Re/Mi…) under each bell — they're already on the bell PNG.
- Removed letter-note `(C)/(D)/…` labels under each bell.
- Keyboard-hint badges (1–8) are now `hidden md:flex` — invisible on mobile/tablet, where touch is the primary input.
- On desktop, each badge moved from outside top-right to bottom-center, which lands it INSIDE the bell circle (every bell's top points outward, so its bottom faces the center medallion). Counter-rotated by `-rotation` so the digit stays upright. Fixes the "1" overlapping the Jam Along button at the 12 o'clock position.

### Who's Got the Rhythm — graduated timing feedback
- Previously every successful hit said "PERFECT" and awarded 100 pts regardless of timing.
- Now the tap's elapsed time is compared to the ideal hit moment (`0.85 × fallSpeed` ms after spawn — the moment the note visually meets the bell at the bottom).
- Three tiers, scaled to fall speed so Chill kids and Turbo kids get the same relative leniency:
  - **PERFECT!** (100 pts) — within ±7 % of fallSpeed (~245 ms Chill / ~105 ms Turbo)
  - **GREAT!** (75 pts) — within ±18 %
  - **GOOD!** (50 pts) — any other on-screen hit (way early or way late)
- Wrong-note penalty unchanged (−50 pts, floor at 0). `gameStats.perfect` counter still increments for any hit so existing sticker/achievement thresholds keep working.


## Feb 18, 2026 — Polish round (visual + immersion fixes)
Direct user feedback drove these:

1. **Sight-Reading staff is now pixel-correct**. Rebuilt `SolfegeStaff.js` around the user's custom quarter-note PNGs (`assets/notes/{do,re,mi,fa,so,la,ti,do-hi}.png`). Each note positions itself by anchoring its HEAD (at known % of the image height) to the proper treble-clef staff Y. Middle C now sits on its own visible ledger line BELOW the staff — not in Re's space. Re sits in the space between the bottom line and the ledger. Verified pixel-level: every head lands within ~1% (<3px on a 300px staff) of its musical-theory position.
2. **Bells make sound in Sight-Reading**. `handleBellTap` was only running game logic — it never called `playBellNote()`. Added it as the first line so every tap fires audio regardless of state.
3. **Renamed "Rest Quiz" → "Sneaky Note"** and made the gameplay actually about rests. `pickTune(level, {requireRest:true})` filters to tunes that contain a rest, then `buildRound` REPLACES that rest with a note (instead of inserting an extra note at a random spot). Phase label now reads *"Which note covered up the silence?"* and reveal text says *"Slot N (Solfege) covered up a silence — that spot should have been a REST!"* — kids actually learn that silences are part of music.
4. **Renamed "Tempo Quiz" → "Snail or Cheetah?"** to match the magical-world tone. Choice buttons are CHEETAH 🐆 and SNAIL 🐌. Win modal reads "Race Over!"
5. **Custom note artwork** — User uploaded 8 hand-drawn PNGs (per-note color + solfège label inside the head, stem-up for low notes, stem-down for high notes). Wired into the new staff renderer.

Tested via testing_agent_v3_fork iter_7 → 100% pass with pixel-level staff verification.

## Feb 17, 2026 — Phase 3: Four educational wins
Locked in 4 new features explicitly designed to boost music-learning ROI for teachers/parents while staying playful for kids:

### 1. Practice Buddy (daily-return streak)
- **NEW: `hooks/usePracticeStreak.js`** — Tracks `{count, lastDate}` in `jma_practice_streak_v1`. Same-day → no change; previous-day → +1; gaps → reset to 1. Awards `practice_buddy_3/7/14` stickers at the corresponding crossings.
- **NEW: `components/PracticeStreakChip.js`** — Hot-flame chip on the Home page; hidden when streak < 2 so day-1 kids don't see "1-day streak" (which would feel like pressure). Tier-colored: bronze (2) → orange (3) → red (7) → gold (14).
- **`data/stickers.js`** — Added 3 new collection stickers under Fun Milestones. Pure flair — these don't gate rank, the achievement ladder still does.

### 2. Sight-Reading Sprint
- **NEW: `pages/SightReadingPage.js`** + route `/sight-reading` + tile on Play menu.
- **NEW: `components/SolfegeStaff.js`** — 3-line staff with solfege circles colored by pitch (low notes sit lower, high notes higher). Currently-aimed-at note pulses gold; completed slots flip green; wrong taps flash red briefly.
- 3 tiers: Cadet (3 notes / 20 s / 7-bell pool), Pro (4 notes / 18 s / 7-bell pool), Master (5 notes / 16 s / full 8-bell + High C). Flow: hear-demo → tap-in-order → timer → win modal w/ time bonus.
- Earns **Music Scholar** achievement ladder (same domain as lessons — proves notation-reading skill).

### 3. Rest Quiz — new Detective Dr. Jellybone mode
- 4th difficulty `restquiz` in `pages/DetectivePage.js`: the suspect tune has an EXTRA note inserted (vs the wrong-pitch corruption in the other modes).
- 30-second `detective-timer` pill counts down during guess phase. Timeout → auto-reveal as miss + life lost.
- Build logic forks at `buildRound()` — extra-note mode splices a random in-scale note after a random existing note, builds a separate `corruptedSlotMap` to align with the longer corrupted sequence, and renders the chip row from `round.corrupted` so the extra chip actually appears.
- Reveal text: *"Slot N (Mi) was the EXTRA note!"*

### 4. Tempo Quiz — new Ear Quest sub-mode
- **NEW: `components/TempoListeningGame.js`** + `tempo` gameState in `pages/EarTrainerPage.js`.
- Plays two short clips of the same recognizable tune (Twinkle / Mary / Hot Cross Buns / Row Row Row), each at a different BPM. Kid picks **Faster** or **Slower**.
- 10 rounds per run. Progressive difficulty: rounds 1-3 use ±40 BPM (very obvious), 4-7 use ±20, 8-10 use ±10 (subtle).
- Earns **Rhythm Reader** achievement ladder: Cadet at 5+ correct, Pro at 8+, Master at 10/10.

### Verified
- Frontend testing agent: 100% pass (6/6 acceptance criteria), zero pageerror exceptions, all 13 routes clean.
- `CI=true yarn build` → Compiled successfully (263.25 KB gz, +8 KB for Phase 3).

## Feb 16, 2026 — Achievement-driven progression system (Phase 1 + 2)
Major redesign — ranks are no longer earned by **collecting** stickers, they're earned by **demonstrating skills**.

### Data model
- **NEW: `data/achievements.js`** — 6 skill domains × 3 tiers = **18 achievement stickers** (Rhythm Reader, Note Detective, Keyboard Scout, Beat Builder, Song Creator, Music Scholar — each in Cadet/Pro/Master).
- **`data/stickers.js`** split into `COLLECTION_STICKERS` (pure flair) and `ACHIEVEMENT_STICKERS` (the rank-gating set).
- **`data/ranks.js`** rebuilt: 7 ranks (Polliwog · Tadpole · Apprentice · Soloist · Performer · Conductor · Maestro), each gated by domain breadth × tier depth (e.g. Maestro = 3 Master badges across different domains).

### Gating rules (the "no Cadet→Maestro speedrun" enforcement)
- **Tier prerequisite**: within a domain, Pro requires Cadet, Master requires Pro. `earnAchievement()` silently no-ops if the prereq is missing.
- **Cross-domain breadth**: top ranks require Pro/Master across **3 different domains** — so kids must demonstrate variety, not just depth in one game.
- Together: reaching Maestro requires **9 separate skill proofs** (3 domains × 3 tiers).

### Engine + hooks
- **NEW: `earnAchievement(domain, tier)`** and **`earnAchievementUpTo(domain, tier)`** helpers in `useStickers`.
- **One-time legacy migration**: kids who already earned legacy stickers (`match_easy`, `ach_simon_5`, `lesson_graduate`, etc.) get retro-credited with the equivalent achievements. Tracked via `jma_stickers_migrated_v2` key so it runs exactly once.
- **`useRank`** rebuilt to derive rank from the achievement subset, not raw count. Exposes `currentRank`, `nextRank`, `progress`, `achievementCount`.

### Call-site rewires (game → achievement)
- **Rhythm Arcade**: 20 perfect hits → Cadet; 90% accuracy → Pro; Turbo completion → Master; streak ≥15 also → Pro
- **Detective Dr. Jellybone**: Easy/Medium/Hard completion → Cadet/Pro/Master (Ear domain)
- **Note Match**: Easy/Medium/Hard → Cadet/Pro/Master (Ear domain — shares ladder with Detective)
- **Stew Kazoo Says**: level 1 → Cadet, level 4 → Pro, level 8 → Master (Keyboard domain)
- **Beat Lab**: any loop → Cadet, 3+ active tracks → Pro, 4+ tracks at 140+ BPM → Master
- **Song Studio**: save → Cadet, save in 3 moods → Pro, fully-filled song → Master
- **Lessons**: lesson 1 → Cadet, lessons 1–4 → Pro, all 7 → Master
- **Jam Hall**: play all 8 bells (any tab) → Keyboard Cadet
- **Ear Quest**: score 5 → Note Detective Cadet (+ Master bonus path)

### Visual treatment (Phase 2)
- **NEW: `<AchievementBadge />`** — octagonal shield silhouette + bronze/silver/gold metallic frame + radial enamel + domain portrait + chunky tier ribbon ("CADET" / "PRO" / "MASTER"). Locked badges desaturate + show a lock icon. Three sizes (`sm`/`md`/`lg`). Visually distinct from round collection stickers.
- **`StickerBookPage`** rebuilt as 3 sections:
  1. 🏅 **Achievement Badges** (top) — one row per domain, 3 badges across, RankBadge with progress meter sits on top
  2. 🎭 **Meet the Band**, 👕 **Outfit Collection**, 🎺 **Instruments**, 🔔 **Jellybells**, 🏆 **Song Champion**, 📖 **Lessons**, ⭐ **Fun Milestones** — all collection stickers, original round-card style
- **`RankBadge`** now shows the next-rank **requirement label** ("Next: Earn Pro badges in 3 different domains") instead of a vague sticker count, plus a `x/3` progress meter.

### Verified
- `CI=true yarn build` → Compiled successfully.
- Live test: seeded 5 achievements (Rhythm Cadet+Pro, Ear Cadet, Beat Cadet, Scholar Cadet) → correctly placed kid at **Soloist** rank (1 Pro earned), with progress showing "1/3 toward Performer".

## Feb 16, 2026 — Card hero sizing (correct one this time)
- Reverted the homepage Finn/Charlie/Shield sizes back to original — those were never the issue.
- **The actual fix**: per-card `iconWidthPct` controlling the **boombox / storybook / beat pad** heroes inside the PLAY/LEARN/CREATE cards.
  - Boombox: 118% → **95%** (smaller, more breathing room above the title)
  - Beat Pad: 118% → **95%**
  - Storybook: 118% → **118%** kept big *(it's the same number, but with no `iconWidthPct` previously the storybook was using the same 118% as the others — what made it look small was its `y: -10` upward translate). Now it sits naturally centered.*
  - Storybook `iconShift.y`: `-10` → **`0`**. The storybook art has more padding around the subject, so the upward shift was making it look stuck high and small. Removing it lets the artwork center optically.
- **Cards even more square**: aspect `1 / 1.15` → **`1 / 1.05`**. Min-height also reduced 360 → 340.
- All three card heroes now read at visually equal size and sit in the same vertical position on the card.

## Feb 16, 2026 — Rhythm picker iPhone fix + library tidy-up + home page squared
### Rhythm Game menu
- **Category cleanup**:
  - Dropped the **"All"** filter chip
  - Removed the entire **"Game"** category and all 3 of its tracks (Super Jump Theme, Block Drop, Hero's Lullaby)
  - Renamed **"Original"** → **"Mini Jams"** (the 4 short bonus tracks) — no longer confusable with "JMA Originals"
  - Default chip is now **JMA Originals** so kids land on the most-played category right away
  - Cleaner palette: only 3 categories, each color-coded (yellow/purple/pink)
- **iPhone song-card layout fix**: the previous narrow-card layout was squashing the title text on narrow phones. Reworked:
  - `min-height: 78 px` so cards never go pancake-thin
  - Title allowed to **wrap to 2 lines** (via `-webkit-line-clamp: 2`) instead of `truncate`
  - Mobile padding tightened on the icon column
  - Category badge gets its own `truncate` so it never bleeds past the column
  - All four content blocks now have proper vertical centering inside the card.

### Home page
- **Cards squared up**: `aspect-ratio` `4 / 5.6` → **`1 / 1.15`** (nearly square). Min-height also reduced from 460 → 360 px. Less negative space, more impact.
- **Heroes shrunk ~20%** to balance the smaller cards:
  - Finn: `clamp(61, 11vw, 131)` → `clamp(48, 9vw, 105)`
  - Shield: `clamp(120, 22vw, 280)` → `clamp(96, 17.5vw, 220)`
  - Charlie: `clamp(80, 14vw, 170)` → `clamp(64, 11vw, 136)`
- Card padding also dialed down slightly to match the squarer canvas.

## Feb 16, 2026 — Song picker bg → calm sky gradient
- The rotating-sunburst page background was the real noise source behind the cards. Replaced with the **same calm sky gradient the homepage uses** (`#BCE5F2 → #E5F2F8 → #FFEEC5` top-to-bottom). Now the cards float on a clean blue→cream sky and every element reads on its own.
- Brand consistency win: same gradient as `HomePage`, so the song picker and home now feel like the same world.

## Feb 16, 2026 — Song picker cards calmed
- **Song tile backgrounds → solid white** (was a tinted-to-white gradient). 17 cards in different tints was creating a rainbow soup. The color cue is now carried entirely by the **left stripe + circular icon button**, which keeps the category encoding clear without a busy backdrop. Drum songs still distinct via purple stripe + drum icon.
- Drop shadow lightened (`rgba(10,37,64,0.12)` → `0.10`) to match the calmer surface.

## Feb 16, 2026 — Rhythm song picker polished + pulse one more notch gentler
- **Pulse another notch gentler** (per user "tiny bit gentler please"):
  - `scale 1.045 → 1.03`
  - `rotate ±0.6° → ±0.4°`
  - `brightness +4% → +2.5%`
  - Halo overlay peak `0.22 → 0.15`
- **`Who's Got the Rhythm?` song selection screen — full polish pass**:
  - New helper config `CATEGORY_STYLE` maps each category (`JMA Originals`, `Classic`, `Game`, `Original`) to an icon + tint + accent. Drum songs override with purple to stay visually distinct.
  - **Speed pills**: replaced flat row of `chunky-btn`s with rounded-full pills carrying proper icons (Leaf / Music2 / Flame) + a "SPEED" label, with the selected pill rising 2 px with a deeper drop shadow.
  - **Category chips**: each now uses its category icon + theme tint for the active state (yellow JMA, purple Classic, green Game, pink Original) with chunky borders.
  - **Song cards** rebuilt as 4-section flex tiles:
    1. Left **color stripe** in the category's tint (or purple for drum tracks)
    2. **Big circular icon button** in the category accent color (Play/Drum icon)
    3. **Title + meta** column — category badge with icon, big chunky-display song name, `X hits · BPM` line
    4. Right slot — **Trophy + high-score pill** if played, else a small white circular play arrow
  - Subtle category-tint → white gradient background, chunky drop shadow, hover lift.
  - Verified live: 17 cards render, chips/pills look great, drum songs are clearly distinguishable.

## Feb 16, 2026 — Rhythm BG pulse dialed WAY down (kid-safe)
Previous pulse was too intense. Reduced all four channels ~3–4× so the sunburst feels "alive" instead of "rave":
- `scale`: `1.0 → 1.18` → **`1.0 → 1.045`**
- `rotate`: `±1.5°` → **`±0.6°`**
- `brightness`: `+18%` → **`+4%`**
- Radial halo overlay peak opacity: `0.7` → **`0.22`** (and base color from `rgba(255,255,255,0.55)` → `0.32`)

The brightness delta is now small enough to be well under photo-sensitivity thresholds even at the fastest song (152 BPM = 2.5 pulses/sec → 4% brightness swing is below WCAG's 10% large-area threshold). The motion still tracks the BPM, so the background reads as "breathing with the song" without being distracting.

## Feb 16, 2026 — Rhythm BG actually pulses + Surprise Me in Song Studio
- **Rhythm Game background — visibly pulsing now**: pure scale-only animation was invisible because a uniform radial sunburst has no fixed reference point. Rebuilt as a compound animation:
  - `scale: 1.00 → 1.18 → 1.00`
  - `rotate: -1.5° → 1.5° → -1.5°` (makes the rays clearly twist instead of just zooming)
  - `filter: brightness(1) → brightness(1.18) → brightness(1)` (light pulse)
  - Plus a separate radial-glow overlay (`screen` blend mode) pulsing opacity `0.15 → 0.7 → 0.15` for an extra "stadium light" punch
  - Verified live: across 4 samples in one beat the transform matrix and brightness clearly cycled — `1.016 → 1.168 → 1.007 → 1.174`, brightness `1.009 → 1.120 → 1.005 → 1.138`. Big visible throb.
- **Song Studio — Surprise Me! button**: new pill (mood-accent colored, with `Dices` icon) sits next to Clear. On tap:
  - Picks a random number of seahorse rests in **[6, 11]** (guaranteed)
  - Fills the remaining slots with random notes from the active mood's scale (high-octave keys only)
  - Fisher-Yates shuffles so rests are scattered, not clumped
  - Verified live: 5 consecutive clicks produced rest counts of `8, 10, 8, 11, 8` — all in range, all 16 slots filled, zero empties.

## Feb 16, 2026 — Rhythm Arcade pulsing background
- **`Who's Got the Rhythm?` playing screen** — the cool-blue sunburst background now **pulses with the song's BPM**. Subtle scale wobble (`1.0 → 1.06 → 1.0`) on an `easeInOut` curve, period = `60 / bpm` seconds. Verified live: 7 sequential `getComputedStyle(...).transform` samples across 660 ms showed 7 distinct scales (`1.02778 → 1.00000 → 1.03073 → 1.05942 → 1.04915 → 1.00646 → 1.00593`).
- Implementation: a separate `motion.div` overlay carries the `sunburst-cool` class and the `scale` animation, sitting at `z-index: 0` behind a `relative z-10` main game area so the lanes/notes don't scale. Outer wrapper also gets `overflow-hidden` to clip the breathing layer at the edges.

## Feb 16, 2026 — Speakers pulse on beat + softer card SFX
- **PulsingSpeakers locked to BPM**: the speakers now accept a `bpm` prop and pulse once per eighth-note while playing (`intervalMs = 60_000 / bpm / 2`, clamped to a 70 ms floor). Beat Lab passes its live `bpm` so the amps actually pump with the loop. When playback stops they drift back to the idle 400 ms cycle.
- **Softer card-click SFX everywhere except DJ Scratch**:
  - Home cards (PLAY · LEARN · CREATE): `0.85` → `0.42` volume.
  - Submenu tiles: `0.85` → `0.42`, *except* `sfx-dj-scratch.mp3` on Beat Lab which keeps the signature `0.85` punch.
  - Same delay/transition behaviour preserved; only volume tuned down.
- Both touches verified via `CI=true yarn build` → **Compiled successfully**, no lint regressions.

## Feb 16, 2026 — Cleanup + Beat Lab speakers + GH Pages build verified
- **Orphan asset cleanup**: removed `assets/characters/catfish.png` (118 KB) and `assets/backgrounds/BG.png` (260 KB) — both genuinely unreferenced. Total ~376 KB shaved off the GH Pages payload.
- **Pulsing speakers in Beat Lab**: new reusable `<PulsingSpeakers />` component (3-frame cycle, accelerates from 400 ms → 120 ms when `playing` is true). Dropped at both bottom corners of the Beat Lab page; the right one mirrors via `scaleX(-1)`. Verified live: cycling frames at the correct interval, present on both sides. Component is reusable — can drop into Stew Kazoo Says or other pages later.
- **GH Pages build verified end-to-end**:
  - `HashRouter` ✓
  - No absolute `/assets/...` or `url(/...)` in source ✓
  - `public/index.html` clean ✓
  - `package.json`: `"homepage": "."`, `predeploy` + `deploy` scripts ✓
  - `CI=true yarn build` → **`Compiled successfully`**, 250 KB JS gz / 13.8 KB CSS gz
  - Built `index.html` serves `./static/...` references (all relative) ✓
  - Static server smoke test: `HTTP 200` for `/index.html`, `/static/js/main.*.js`, and a sample asset (`/assets/animations/jelly-rocks-blimp-1.png`) ✓
- **SimonSays useCallback dep fix**: added `celebrate` to the dependency array of the play-handling callback (it was a missing dep flagged by `react-hooks/exhaustive-deps` in CI). `celebrate` is itself a `useCallback`, so this doesn't cause re-renders.

## Feb 16, 2026 — Detective copy, blimp v3, Song Studio bubble fix
- **Detective Dr. Jellybone**: copy fixes
  - "How to play" → *"Tap the wrong note as you hear it..."* (was "beat")
  - Guess-phase hint → *"Tap the note that sounded wrong"* (was "beat")
- **Blimp v3 — actually diagonal + size variation**:
  - Re-extracted to a `makeLap()` factory that *guarantees* a minimum |endY − startY| delta of 6 vh (capped at 14 vh) so the y-trajectory is never accidentally flat. Verified live: blimp Y drifted 77→109 px (32 px diagonal) across 10 s — confirmed via DOM measurements at 5 sample times.
  - Each lap also picks a random scale in `0.4 – 0.9` of base width — so the blimp can drift small-and-far one lap, big-and-close the next.
  - Duration still random 22–34 s; direction still alternates each lap with `scaleX(-direction)` flip so it never flies backwards.
- **CREATE menu — Song Studio card**: dropped the `"Make a hit!"` bubble that was landing on Charlie's face (Charlie is already in the bg scene with his own context).

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
