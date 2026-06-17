/**
 * Learner-facing labels for curated / bundled content.
 * Prefer what's included (lesson, quiz, offline) over delivery jargon.
 */
export const STATIC_COPY = {
  badge: 'curated pack',
  quickRefPill: 'CURATED · OFFLINE',
  bankReview: 'from your saved bank — instant review',
  curatedQuizPool: 'curated pool — starts instantly',
  preassessPool: 'bundled check — instant start',
  lab: 'instant feedback · works offline',
  examTraps: 'bundled traps · instant',
  routingDrill: 'bundled drill — instant',
  mockStaticLine: 'instant · no wait',
  mockStaticOnly: 'Static bank only — instant start',
  reports: 'generated on your device — works offline',
  metrics: 'computed locally from your activity',
  sessionBank: (count) => `From your saved bank of ${count} — instant review`,
}
