import { ALL_OBJECTIVES } from '../../data/ccnaDomains.js'

const RESUME_KEY = 'ccna_placement_debrief_resume_v1'

/** Stash placement debrief so Study → Back returns to results, not a new session. */
export function stashPlacementDebriefResume(domainId, payload) {
  if (typeof window === 'undefined' || !domainId || !payload?.report) return
  try {
    window.sessionStorage.setItem(RESUME_KEY, JSON.stringify({
      domainId,
      savedAt: Date.now(),
      ...payload,
    }))
  } catch {
    /* quota / private mode */
  }
}

export function peekPlacementDebriefResume(domainId) {
  if (typeof window === 'undefined' || !domainId) return null
  try {
    const raw = window.sessionStorage.getItem(RESUME_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data?.domainId !== domainId) return null
    return data
  } catch {
    return null
  }
}

export function consumePlacementDebriefResume(domainId) {
  const data = peekPlacementDebriefResume(domainId)
  if (!data) return null
  try {
    window.sessionStorage.removeItem(RESUME_KEY)
  } catch {
    /* ignore */
  }
  return data
}

export function clearPlacementDebriefResume() {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(RESUME_KEY)
  } catch {
    /* ignore */
  }
}
