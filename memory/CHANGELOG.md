# Changelog

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
