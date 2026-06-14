export const READING_TIER_KEYS = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  examReady: 'examReady',
}

export const READING_TIERS = [
  { key: READING_TIER_KEYS.beginner, label: 'Beginner' },
  { key: READING_TIER_KEYS.intermediate, label: 'Intermediate' },
  { key: READING_TIER_KEYS.examReady, label: 'Exam-ready' },
]

const VALID_KEYS = new Set(READING_TIERS.map(t => t.key))

/** Default depth from test-out / pre-assessment signals (no manual override). */
export function computeDefaultReadingTier(entry = {}) {
  if (entry.testedOut) return READING_TIER_KEYS.examReady
  if (typeof entry.preAssessPct === 'number') {
    if (entry.preAssessPct >= 0.85) return READING_TIER_KEYS.intermediate
    if (entry.preAssessPct >= 0.6) return READING_TIER_KEYS.intermediate
    return READING_TIER_KEYS.beginner
  }
  return READING_TIER_KEYS.intermediate
}

/** Resolved tier: saved preference when valid, otherwise computed default. */
export function getReadingTier(entry = {}) {
  if (entry.readingTier && VALID_KEYS.has(entry.readingTier)) return entry.readingTier
  return computeDefaultReadingTier(entry)
}

/** Banner copy when depth was auto-matched to pre-assessment / test-out. */
export function readingTierHint(entry, tier) {
  if (!entry) return null
  if (entry.testedOut && tier === READING_TIER_KEYS.examReady) {
    return {
      type: 'testedOut',
      message: 'Tested out — showing exam-ready depth.',
      showFullWalkthrough: true,
      showReferenceLink: true,
    }
  }
  if (typeof entry.preAssessPct === 'number' && !entry.testedOut) {
    if (entry.preAssessPct < 0.6 && tier === READING_TIER_KEYS.beginner) {
      return {
        type: 'weakPreassess',
        message: 'Beginner depth based on your pre-assessment — switch anytime below.',
        showFullWalkthrough: false,
        showReferenceLink: false,
      }
    }
    return {
      type: 'preassess',
      message: 'Depth matched to your pre-assessment — switch anytime below.',
      showFullWalkthrough: false,
      showReferenceLink: false,
    }
  }
  return null
}

/** Progress fields to persist when entering the lesson from pre-assessment. */
export function studyMetaToProgress(meta = {}) {
  const updates = {}
  if (meta.direct) updates.studyPath = 'direct'
  if (typeof meta.preAssessPct === 'number') {
    updates.preAssessPct = meta.preAssessPct
    updates.studyPath = 'preassess'
  }
  if (meta.reviewAnyway) updates.reviewAnyway = true
  return updates
}
