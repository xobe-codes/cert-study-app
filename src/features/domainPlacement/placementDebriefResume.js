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

function readResumeRaw() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(RESUME_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function peekPlacementDebriefResume(domainId) {
  if (!domainId) return null
  const data = readResumeRaw()
  if (data?.domainId !== domainId) return null
  return data
}

/** Peek stashed debrief without domain filter — used when restoring placement after Topic Focus. */
export function peekAnyPlacementDebriefResume() {
  return readResumeRaw()
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
