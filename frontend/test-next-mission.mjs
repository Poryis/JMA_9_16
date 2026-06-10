// Quick CLI test of the Next Mission recommendation engine.
// Run with: cd /app/frontend && node test-next-mission.mjs
//
// We can't import the React module directly (uses hooks), so we manually
// replicate the relevant logic and exercise it against known earn-states.

// In-memory copies of the relevant data structures to avoid TS/JSX parsing.
const ACHIEVEMENT_DOMAINS = [
  { id: 'rhythm' },
  { id: 'ear' },
  { id: 'keyboard' },
  { id: 'beat' },
  { id: 'song' },
  { id: 'scholar' },
];

const RANKS = [
  { id: 'polliwog', requirement: { kind: 'start' } },
  { id: 'tadpole',  requirement: { kind: 'minDomainsAtTier', tier: 'cadet',  count: 1 } },
  { id: 'apprentice', requirement: { kind: 'minDomainsAtTier', tier: 'cadet', count: 3 } },
  { id: 'soloist', requirement: { kind: 'minDomainsAtTier', tier: 'pro', count: 1 } },
  { id: 'performer', requirement: { kind: 'minDomainsAtTier', tier: 'pro', count: 3 } },
  { id: 'conductor', requirement: { kind: 'minDomainsAtTier', tier: 'master', count: 1 } },
  { id: 'maestro', requirement: { kind: 'minDomainsAtTier', tier: 'master', count: 3 } },
];

const CADET_PREFERENCE = ['ear', 'keyboard', 'rhythm', 'beat', 'song', 'scholar'];
const FIRST_TIME_PICK = 'ach_ear_cadet';

function achievementId(domain, tier) { return `ach_${domain}_${tier}`; }

function summarize(earnedSet) {
  const perDomain = {};
  for (const d of ACHIEVEMENT_DOMAINS) perDomain[d.id] = { highestTier: 0 };
  for (const d of ACHIEVEMENT_DOMAINS) {
    for (const t of ['cadet', 'pro', 'master']) {
      if (earnedSet.has(achievementId(d.id, t))) {
        const rank = { cadet: 1, pro: 2, master: 3 }[t];
        if (rank > perDomain[d.id].highestTier) perDomain[d.id].highestTier = rank;
      }
    }
  }
  const at = (min) => Object.values(perDomain).filter(d => d.highestTier >= min).length;
  return { domainsWithCadet: at(1), domainsWithPro: at(2), domainsWithMaster: at(3) };
}

function currentRank(earnedSet) {
  const s = summarize(earnedSet);
  for (let i = RANKS.length - 1; i >= 0; i--) {
    const req = RANKS[i].requirement;
    if (req.kind === 'start') return RANKS[i];
    const c = { cadet: s.domainsWithCadet, pro: s.domainsWithPro, master: s.domainsWithMaster }[req.tier];
    if ((c || 0) >= req.count) return RANKS[i];
  }
  return RANKS[0];
}

function nextRank(curId) {
  const i = RANKS.findIndex(r => r.id === curId);
  if (i < 0 || i >= RANKS.length - 1) return null;
  return RANKS[i + 1];
}

function pick(earnedSet) {
  const anyEarned = ACHIEVEMENT_DOMAINS.some(d =>
    ['cadet', 'pro', 'master'].some(t => earnedSet.has(achievementId(d.id, t))));
  if (!anyEarned) return FIRST_TIME_PICK;
  const cur = currentRank(earnedSet);
  const next = nextRank(cur.id);
  if (!next) return null;
  const req = next.requirement;
  if (req.kind !== 'minDomainsAtTier') return null;
  const targetTier = req.tier;
  const eligible = ACHIEVEMENT_DOMAINS.filter(d => {
    const id = achievementId(d.id, targetTier);
    if (earnedSet.has(id)) return false;
    if (targetTier === 'pro' && !earnedSet.has(achievementId(d.id, 'cadet'))) return false;
    if (targetTier === 'master' && !earnedSet.has(achievementId(d.id, 'pro'))) return false;
    return true;
  });
  if (eligible.length > 0) {
    eligible.sort((a, b) => CADET_PREFERENCE.indexOf(a.id) - CADET_PREFERENCE.indexOf(b.id));
    return achievementId(eligible[0].id, targetTier);
  }
  return null;
}

// Test cases
const cases = [
  { name: 'New user (no achievements)',           earned: [],                                            expected: 'ach_ear_cadet' },
  { name: '1 Cadet (Detective)',                  earned: ['ach_ear_cadet'],                             expected: 'ach_keyboard_cadet' },
  { name: '2 Cadets (Detective + Rhythm)',        earned: ['ach_ear_cadet', 'ach_rhythm_cadet'],         expected: 'ach_keyboard_cadet' },
  { name: '3 Cadets — chase 1st Pro',             earned: ['ach_ear_cadet', 'ach_rhythm_cadet', 'ach_keyboard_cadet'], expected: 'ach_ear_pro' },
  { name: '1 Pro + many cadets — chase 3 Pros',   earned: ['ach_ear_cadet','ach_ear_pro','ach_rhythm_cadet','ach_keyboard_cadet'], expected: 'ach_rhythm_pro' },
  { name: '3 Pros — chase 1st Master',            earned: ['ach_ear_cadet','ach_ear_pro','ach_rhythm_cadet','ach_rhythm_pro','ach_keyboard_cadet','ach_keyboard_pro'], expected: 'ach_ear_master' },
];

let passed = 0;
for (const c of cases) {
  const earnedSet = new Set(c.earned);
  const got = pick(earnedSet);
  const ok = got === c.expected;
  if (ok) passed += 1;
  console.log(`${ok ? '✓' : '✗'} ${c.name}: expected=${c.expected} got=${got}`);
}
console.log(`\n${passed}/${cases.length} cases passed`);
process.exit(passed === cases.length ? 0 : 1);
