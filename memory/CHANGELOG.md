# Changelog

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
