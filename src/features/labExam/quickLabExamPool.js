export const QUICK_LAB_EXAM_STATIONS = [
  'LAB-31-ROUTE-INTERPRET',
  'LAB-OSPF-VERIFY-34',
  'LAB-VLAN-TRUNK',
  'LAB-NAT-PAT',
  'LAB-ACL-CONFIG-55',
  'LAB-SYSLOG-REMOTE',
]

export const QUICK_LAB_EXAM_MINUTES = 25
export const LAB_EXAM_PASS_PCT = 70

/** @returns {Array<{ labId: string, objectiveId: string, title: string, domainId: string }>} */
export function buildQuickLabExamStations(getLabFn) {
  return QUICK_LAB_EXAM_STATIONS.flatMap((labId) => {
    const bundle = getLabFn(labId)
    if (!bundle?.lab) return []
    const { lab } = bundle
    return [{
      labId,
      objectiveId: lab.objectiveId,
      title: lab.title,
      domainId: lab.domainId,
    }]
  })
}

/** @param {{ done: unknown[], total: number, complete: boolean }} labProgressResult */
export function scoreLabStation(labProgressResult) {
  const { done = [], total = 0, complete = false } = labProgressResult || {}
  if (complete) return 100
  if (!total) return 0
  return Math.round((done.length / total) * 100)
}

/** @param {number[]} stationScores */
export function aggregateLabExamScore(stationScores) {
  const scores = (stationScores || []).filter(n => typeof n === 'number' && !Number.isNaN(n))
  if (!scores.length) {
    return { pct: 0, pass: false, stationScores: [] }
  }
  const pct = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  return {
    pct,
    pass: pct >= LAB_EXAM_PASS_PCT,
    stationScores: scores,
  }
}
