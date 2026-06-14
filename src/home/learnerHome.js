import { DOMAINS, ALL_OBJECTIVES } from '../data/ccnaDomains.js'
import { STORAGE_KEYS } from '../storageKeys.js'

const REVIEW_SESSION_CAP = 20

async function loadQuizBank() {
  return (await window.storage.getItem(STORAGE_KEYS.quizBank)) || {}
}

const RATING_CONFIDENCE = { easy: 1, medium: 0.6, hard: 0.3, practice: 0.1 }
// Returns { score: 0..1, mastered: boolean } from a progress entry.
function computeMastery(entry) {
  if (!entry) return { score: 0, mastered: false }
  const scores = entry.quizScores || []
  if (scores.length === 0) return { score: 0, mastered: false }
  // accuracy: weight recent sessions more (last 3)
  const recent = scores.slice(-3)
  const acc = recent.reduce((s, r) => s + (r.score / Math.max(r.total, 1)), 0) / recent.length
  // confidence: average of stored confidence ratings, default neutral 0.6
  const ratings = entry.confidenceRatings || []
  const conf = ratings.length
    ? ratings.reduce((s, r) => s + (RATING_CONFIDENCE[r] ?? 0.6), 0) / ratings.length
    : 0.6
  const score = acc * 0.7 + conf * 0.3
  // mastered requires strong accuracy, decent confidence, and at least one full session
  const mastered = acc >= 0.8 && conf >= 0.5 && recent.some(r => r.total >= 3)
  return { score, mastered }
}
// Per-domain mastery average, weighted by official exam domain percentages.
function computeDomainStats(progress) {
  return DOMAINS.map(d => {
    const objs = d.objectives
    const avg = objs.reduce((s, o) => s + computeMastery(progress[o.id]).score, 0) / Math.max(objs.length, 1)
    const mastered = objs.filter(o => progress[o.id]?.status === 'mastered').length
    return { id: d.id, name: d.name, accent: d.accent, weight: d.weight, mastered, total: objs.length, avg }
  })
}

// Exam Readiness Score: domain-weighted mastery, lightly adjusted by retention
// health (sections in the "weak"/STUDY state pull the score down a bit).
// Returns a 0-1 score plus the domain breakdown used to compute it.
export function computeReadinessScore(progress, retention) {
  const domainStats = computeDomainStats(progress)
  const masteryReadiness = domainStats.reduce((s, d) => s + (d.weight / 100) * d.avg, 0)
  if (!retention || retention.length === 0) return { score: masteryReadiness, domainStats }
  const strong = retention.filter(r => r.state === 'strong').length
  const retentionFactor = strong / retention.length
  return { score: masteryReadiness * 0.85 + retentionFactor * 0.15, domainStats }
}
/* ---- Retention health: per-section state derived from each question's
   spaced-repetition schedule + lapses. Strong (all items in long intervals) /
   Fading (due soon or lightly lapsed) / Study (multiple lapses → revisit the
   Explain page). Weak deliberately maps to the blue "study" color, never red. */
function sectionRetention(list) {
  const scheduled = (list || []).filter(q => q.srs && (q.attempts?.length || 0) > 0)
  if (scheduled.length === 0) return null
  const now = Date.now()
  const dueNow = scheduled.filter(q => (q.srs.due ?? 0) <= now).length
  const heavyLapse = scheduled.filter(q => (q.srs.lapses || 0) >= 2).length
  const inLong = scheduled.filter(q => (q.srs.intervalIndex || 0) >= 2).length
  let state
  if (heavyLapse >= 2 || heavyLapse / scheduled.length >= 0.34) state = 'weak'
  else if (inLong === scheduled.length && dueNow === 0) state = 'strong'
  else state = 'fading'
  return { count: scheduled.length, dueNow, heavyLapse, inLong, state }
}
export async function loadRetentionHealth() {
  const bank = await loadQuizBank()
  const rows = []
  for (const objectiveId of Object.keys(bank)) {
    const r = sectionRetention(bank[objectiveId])
    if (!r) continue
    const o = ALL_OBJECTIVES.find(x => x.id === objectiveId)
    if (!o) continue
    rows.push({ ...r, id: objectiveId, title: o.title, objective: o })
  }
  // Surface the most at-risk sections first: weak, then fading, then strong.
  const order = { weak: 0, fading: 1, strong: 2 }
  return rows.sort((a, b) => order[a.state] - order[b.state] || b.dueNow - a.dueNow)
}
function daysSinceTs(ts) {
  return ts ? Math.floor((Date.now() - ts) / 86400000) : null
}
export async function buildLearnerSummary(progress, missed = []) {
  const events = (await window.storage.getItem(STORAGE_KEYS.events)) || []

  const perObjective = ALL_OBJECTIVES.map(o => {
    const p = progress[o.id]
    const status = p?.status || 'unseen'
    const { score } = computeMastery(p)
    const ratings = (p?.confidenceRatings || []).slice(-4)
    const hardCount = ratings.filter(r => r === 'hard' || r === 'practice').length
    return {
      ...o,
      status,
      mastery: score,
      hardCount,
      attempts: (p?.quizScores || []).length,
      daysSince: daysSinceTs(p?.lastSeen),
    }
  })

  const missedByObj = {}
  missed.forEach(m => { missedByObj[m.objectiveId] = (missedByObj[m.objectiveId] || 0) + 1 })

  const domainStats = DOMAINS.map(d => {
    const objs = perObjective.filter(o => o.domainId === d.id)
    const mastered = objs.filter(o => o.status === 'mastered').length
    const avg = objs.reduce((s, o) => s + o.mastery, 0) / Math.max(objs.length, 1)
    return { id: d.id, name: d.name, weight: d.weight, mastered, total: objs.length, avg }
  })

  const recentTopics = [...new Set(
    events.filter(e => e.type === 'user_viewed_topic').slice(-10).map(e => e.objectiveId).reverse()
  )].slice(0, 4)

  return { perObjective, missedByObj, domainStats, recentTopics }
}

// Suggestion-card descriptors. Each card is fully actionable and distinct from
// normal content (reference: contextual recommendation cards).
export function generateLocalSuggestions(summary, commandDrills = {}) {
  const { perObjective, missedByObj } = summary
  const cards = []
  const used = new Set()
  const add = (card) => {
    const id = card.objective?.id
    if (id && used.has(id)) return
    if (id) used.add(id)
    cards.push(card)
  }
  const inProgress = perObjective.filter(o => o.status === 'in_progress' && o.attempts > 0)

  // 1. Weakest active topic
  const weakest = [...inProgress].sort((a, b) => a.mastery - b.mastery)[0]
  if (weakest && weakest.mastery < 0.6) {
    add({
      key: 'weak', chip: 'WEAK SPOT', accent: 'rose', objective: weakest, tab: 'Explain',
      title: `${weakest.id} ${weakest.title}`,
      body: `Your weakest active topic at ${Math.round(weakest.mastery * 100)}% mastery. A focused review will move the needle most.`,
    })
  }

  // 2. Low confidence on a topic that has a hands-on CLI lab
  const cliStruggle = [...inProgress]
    .filter(o => o.hardCount >= 2 && commandDrills[o.id])
    .sort((a, b) => b.hardCount - a.hardCount)[0]
  if (cliStruggle) {
    add({
      key: 'cli', chip: 'HANDS-ON', accent: 'sky', objective: cliStruggle, tab: 'CLI Drill',
      title: `${cliStruggle.id} ${cliStruggle.title}`,
      body: `You rated several questions here tough. Reinforce it with the CLI drill — muscle memory beats re-reading.`,
    })
  }

  // 3. A topic that's close to mastered — worth locking in
  const near = [...inProgress]
    .filter(o => o.mastery >= 0.6 && o.mastery < 0.85)
    .sort((a, b) => b.mastery - a.mastery)[0]
  if (near) {
    add({
      key: 'near', chip: 'ALMOST THERE', accent: 'mint', objective: near, tab: 'Quiz',
      title: `${near.id} ${near.title}`,
      body: `Nearly mastered at ${Math.round(near.mastery * 100)}%. One more quiz set from your bank could lock it in.`,
    })
  }

  // 4. A concept you keep missing
  const missedTop = Object.entries(missedByObj).sort((a, b) => b[1] - a[1])[0]
  if (missedTop && missedTop[1] >= 2) {
    const o = perObjective.find(x => x.id === missedTop[0])
    if (o) {
      add({
        key: 'missed', chip: 'RECURRING MISS', accent: 'rose', objective: o, tab: 'Quiz',
        title: `${o.id} ${o.title}`,
        body: `You've missed ${missedTop[1]} questions here. Re-quiz from the bank — wrong answers come back first.`,
      })
    }
  }

  // 5. Spaced repetition — a mastered topic going stale
  const stale = perObjective
    .filter(o => o.status === 'mastered' && o.daysSince != null && o.daysSince >= 7)
    .sort((a, b) => b.daysSince - a.daysSince)[0]
  if (stale) {
    add({
      key: 'stale', chip: 'REVIEW', accent: 'purple', objective: stale, tab: 'Quiz',
      title: `${stale.id} ${stale.title}`,
      body: `Mastered but not reviewed in ${stale.daysSince} days. A quick pass keeps retention from slipping.`,
    })
  }

  // Fallback for a brand-new learner — open Quiz so they baseline quickly, then use Explain for gaps
  if (cards.length === 0) {
    const first = perObjective.find(o => o.status === 'unseen') || perObjective[0]
    if (first) {
      add({
        key: 'start', chip: 'START HERE', accent: 'purple', objective: first, tab: 'Quiz',
        title: `${first.id} ${first.title}`,
        body: `New here? Take a short quiz to baseline this topic, then read the explanation for anything you miss.`,
      })
    }
  }

  return cards.slice(0, 3)
}

// Top study action from the same local rules as Metrics / For You (no API).
export function pickStudyNext(summary, dueCount) {
  if (dueCount > 0) {
    const ready = Math.min(dueCount, REVIEW_SESSION_CAP)
    return {
      kind: 'review',
      accent: 'purple',
      shortTitle: `Today's Review — ${ready} due · ~${Math.max(1, Math.round(ready * 0.5))} min`,
    }
  }
  if (!summary) return null
  const top = generateLocalSuggestions(summary)[0]
  if (!top) return null
  return {
    kind: 'objective',
    accent: top.accent,
    shortTitle: top.title,
    objective: top.objective,
    tab: top.tab,
  }
}
