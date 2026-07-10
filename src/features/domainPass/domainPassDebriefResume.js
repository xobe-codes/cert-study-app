/** Stash Domain Pass results so Study/Lab → Back returns to debrief, not a new session. */
const RESUME_KEY = 'ccna_domain_pass_debrief_resume_v1'

export function stashDomainPassDebriefResume(domainId, payload) {
  if (typeof window === 'undefined' || !domainId || !payload?.report || !Array.isArray(payload.questions)) return
  try {
    window.sessionStorage.setItem(RESUME_KEY, JSON.stringify({
      domainId,
      savedAt: Date.now(),
      report: payload.report,
      questions: payload.questions,
      responses: payload.responses || {},
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

export function peekDomainPassDebriefResume(domainId) {
  if (!domainId) return null
  const data = readResumeRaw()
  if (data?.domainId !== domainId) return null
  return data
}

export function peekAnyDomainPassDebriefResume() {
  return readResumeRaw()
}

export function consumeDomainPassDebriefResume(domainId) {
  const data = peekDomainPassDebriefResume(domainId)
  if (!data) return null
  try {
    window.sessionStorage.removeItem(RESUME_KEY)
  } catch {
    /* ignore */
  }
  return data
}

export function clearDomainPassDebriefResume() {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(RESUME_KEY)
  } catch {
    /* ignore */
  }
}
