import { todayStr } from './sessionUtils.js'

/** Today / Yesterday label for streak row; null when older or missing. */
export function streakLastLabel(lastStudyDate) {
  if (!lastStudyDate) return null
  const today = todayStr()
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (lastStudyDate === today) return 'Today'
  if (lastStudyDate === yesterday) return 'Yesterday'
  return null
}

/** Single-line streak copy — no cheer text. */
export function formatStreakLine(streak) {
  if (!streak?.count || streak.count <= 0) return null
  const count = streak.count
  const base = `🔥 ${count}-day streak`
  const last = streakLastLabel(streak.lastStudyDate)
  return last ? `${base} · Last: ${last}` : base
}

/** Compact progress chip labels from objective totals. */
export function buildProgressChipLabels(totals, offlineReadySize = 0) {
  const notStarted = totals.total - totals.mastered - totals.inProgress
  const chips = [
    { label: `${totals.mastered} mastered`, accent: 'mint' },
    { label: `${totals.inProgress} in progress`, accent: 'sky' },
    { label: `${notStarted} not started`, accent: 'silver' },
  ]
  if (offlineReadySize > 0) {
    chips.push({ label: `⤓ ${offlineReadySize} offline`, accent: 'purple' })
  }
  return chips
}
