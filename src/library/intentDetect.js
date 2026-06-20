/** Lightweight query intent for Study Lens ranking and answer shape. */

export function detectIntent(query = '') {
  const q = String(query).toLowerCase()
  if (/\b(vs\.?|versus|difference between|compare|compared to)\b/.test(q)) return 'compare'
  if (/\b(configure|setup|how to|steps to|implement|set up)\b/.test(q)) return 'configure'
  if (/\b(troubleshoot|not working|why doesn't|why doesn't|failed|issue|problem|169\.254|down)\b/.test(q)) return 'troubleshoot'
  if (/\b(trap|trick|exam|gotcha|common mistake)\b/.test(q)) return 'exam'
  return 'define'
}

export const INTENT_LABEL = {
  define: 'Define',
  compare: 'Compare',
  configure: 'Configure',
  troubleshoot: 'Troubleshoot',
  exam: 'Exam trap',
}

/** @type {Record<string, Record<string, number>>} */
export const INTENT_KIND_BOOST = {
  define: { term: 18, 'reading-section': 12, 'reading-tier': 8, concept: 6 },
  compare: { term: 15, 'reading-tier': 12, concept: 10, objective: 8 },
  configure: { command: 22, workflow: 18, 'engineer-view': 12 },
  troubleshoot: { 'engineer-view': 22, 'exam-trap': 15, command: 12, concept: 8 },
  exam: { 'exam-trap': 28, concept: 10, 'reading-section': 8 },
}
