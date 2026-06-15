import { DOMAINS, ALL_OBJECTIVES } from '../data/ccnaDomains.js'

const RATING_CONFIDENCE = { easy: 1, medium: 0.6, hard: 0.3, practice: 0.1 }
const MS_DAY = 86400000

export const STATS_RANGES = {
  '7d': { id: '7d', label: '7d', days: 7 },
  '30d': { id: '30d', label: '30d', days: 30 },
  '90d': { id: '90d', label: '90d', days: 90 },
  all: { id: 'all', label: 'All', days: null },
}

function dayKey(ts) {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function endOfDay(ts) {
  const d = new Date(ts)
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

function computeMastery(entry) {
  if (!entry) return { score: 0, mastered: false }
  const scores = entry.quizScores || []
  if (scores.length === 0) return { score: 0, mastered: false }
  const recent = scores.slice(-3)
  const acc = recent.reduce((s, r) => s + (r.score / Math.max(r.total, 1)), 0) / recent.length
  const ratings = entry.confidenceRatings || []
  const conf = ratings.length
    ? ratings.reduce((s, r) => s + (RATING_CONFIDENCE[r] ?? 0.6), 0) / ratings.length
    : 0.6
  const score = acc * 0.7 + conf * 0.3
  const mastered = acc >= 0.8 && conf >= 0.5 && recent.some(r => r.total >= 3)
  return { score, mastered }
}

export function computeReadinessPct(progress) {
  const weighted = DOMAINS.reduce((sum, d) => {
    const objs = d.objectives
    const avg = objs.reduce((s, o) => s + computeMastery(progress[o.id]).score, 0) / Math.max(objs.length, 1)
    return sum + (d.weight / 100) * avg
  }, 0)
  return Math.round(weighted * 100)
}

function progressAsOf(progress, endTs) {
  const out = {}
  for (const [id, entry] of Object.entries(progress || {})) {
    if (!entry) continue
    const scores = (entry.quizScores || []).filter(s => s.date <= endTs)
    const ratings = (entry.confidenceRatings || []).slice(0, scores.length)
    if (scores.length === 0 && entry.status !== 'mastered') continue
    out[id] = { ...entry, quizScores: scores, confidenceRatings: ratings }
  }
  return out
}

function rangeStart(rangeId, earliestTs) {
  const cfg = STATS_RANGES[rangeId] || STATS_RANGES['30d']
  if (!cfg.days) return earliestTs
  const start = Date.now() - cfg.days * MS_DAY
  return earliestTs ? Math.max(start, earliestTs) : start
}

function enumerateDays(startMs, endMs) {
  const days = []
  const d = new Date(startMs)
  d.setHours(0, 0, 0, 0)
  const end = new Date(endMs)
  end.setHours(0, 0, 0, 0)
  while (d.getTime() <= end.getTime()) {
    days.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return days
}

function collectQuizSessions(progress) {
  const sessions = []
  for (const [objectiveId, entry] of Object.entries(progress || {})) {
    for (const s of entry?.quizScores || []) {
      if (!s?.date) continue
      sessions.push({
        date: s.date,
        day: dayKey(s.date),
        total: s.total || 0,
        score: s.score || 0,
        objectiveId,
      })
    }
  }
  return sessions
}

/** Combined bar (questions/day) + line (readiness %) + optional mock dots. */
export function buildComboStatsSeries({ progress, events = [], mockHistory = [], rangeId = '30d' }) {
  const sessions = collectQuizSessions(progress)
  const answered = events.filter(e => e.type === 'user_answered_question' && e.at)
  const allTs = [
    ...sessions.map(s => s.date),
    ...answered.map(e => e.at),
    ...mockHistory.map(m => m.date),
  ].filter(Boolean)

  const earliest = allTs.length ? Math.min(...allTs) : Date.now() - 30 * MS_DAY
  const startMs = rangeStart(rangeId, earliest)
  const endMs = Date.now()
  const days = enumerateDays(startMs, endMs)

  const questionsByDay = {}
  answered.forEach(e => {
    const k = dayKey(e.at)
    questionsByDay[k] = (questionsByDay[k] || 0) + 1
  })
  sessions.forEach(s => {
    if (s.date < startMs) return
    questionsByDay[s.day] = (questionsByDay[s.day] || 0) + Math.max(1, s.total)
  })

  const quizAccByDay = {}
  const quizBuckets = {}
  sessions.forEach(s => {
    if (s.date < startMs) return
    if (!quizBuckets[s.day]) quizBuckets[s.day] = { correct: 0, total: 0 }
    quizBuckets[s.day].correct += s.score
    quizBuckets[s.day].total += Math.max(1, s.total)
  })
  Object.entries(quizBuckets).forEach(([k, b]) => {
    quizAccByDay[k] = Math.round((b.correct / Math.max(1, b.total)) * 100)
  })

  const mockByDay = {}
  mockHistory.forEach(m => {
    if (!m?.date || m.date < startMs) return
    mockByDay[dayKey(m.date)] = m.pct
  })

  let lastReadiness = null
  const points = days.map(day => {
    const endTs = endOfDay(new Date(day).getTime())
    const hasActivity = (questionsByDay[day] || 0) > 0 || mockByDay[day] != null
    let line = null
    if (hasActivity || sessions.some(s => s.date <= endTs)) {
      const pct = computeReadinessPct(progressAsOf(progress, endTs))
      line = pct
      lastReadiness = pct
    } else if (lastReadiness != null) {
      line = lastReadiness
    }
    return {
      day,
      bar: questionsByDay[day] || 0,
      line,
      quizAcc: quizAccByDay[day] ?? null,
      mock: mockByDay[day] ?? null,
    }
  })

  const activePoints = points.filter(p => p.bar > 0 || p.line != null || p.mock != null)
  const displayPoints = activePoints.length > 14
    ? activePoints.slice(-14)
    : points.slice(-Math.max(14, days.length))

  const barMax = Math.max(5, ...displayPoints.map(p => p.bar), 1)
  const lineMax = 100

  const firstLine = displayPoints.find(p => p.line != null)?.line
  const lastLine = [...displayPoints].reverse().find(p => p.line != null)?.line
  const trend = firstLine != null && lastLine != null ? lastLine - firstLine : null

  const totalQuestions = displayPoints.reduce((s, p) => s + p.bar, 0)
  const quizDays = displayPoints.filter(p => p.quizAcc != null)
  const avgQuizAcc = quizDays.length
    ? Math.round(quizDays.reduce((s, p) => s + p.quizAcc, 0) / quizDays.length)
    : null
  const mockInRange = mockHistory.filter(m => m.date >= startMs)
  const avgMock = mockInRange.length
    ? Math.round(mockInRange.reduce((s, m) => s + m.pct, 0) / mockInRange.length)
    : null

  const mastered = ALL_OBJECTIVES.filter(o => progress[o.id]?.status === 'mastered').length

  return {
    points: displayPoints,
    barMax,
    lineMax,
    trend,
    summary: {
      readiness: computeReadinessPct(progress),
      mastered,
      total: ALL_OBJECTIVES.length,
      totalQuestions,
      avgQuizAcc,
      avgMock,
      mockAttempts: mockInRange.length,
    },
  }
}
