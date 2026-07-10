import { DOMAINS, ALL_OBJECTIVES } from '../data/ccnaDomains.js'

export function parseAppHash() {
  const raw = window.location.hash.replace(/^#/, '')
  if (!raw) return null
  // Alias: #/study/3.2 → objective Study tab
  const studyMatch = raw.match(/^\/study\/([^/]+)$/)
  if (studyMatch) {
    const id = decodeURIComponent(studyMatch[1])
    const obj = ALL_OBJECTIVES.find(o => o.id === id)
    if (!obj) return null
    const domain = DOMAINS.find(d => d.objectives.some(o => o.id === id))
    if (!domain) return null
    return {
      view: 'objective',
      objective: {
        ...obj,
        domainId: domain.id,
        domainName: domain.name,
        accent: domain.accent,
        __initialTab: 'Study',
      },
    }
  }
  const objMatch = raw.match(/^\/objective\/([^/]+)(?:\/(.+))?$/)
  if (objMatch) {
    const id = decodeURIComponent(objMatch[1])
    const tab = objMatch[2] ? decodeURIComponent(objMatch[2]) : null
    const obj = ALL_OBJECTIVES.find(o => o.id === id)
    if (!obj) return null
    const domain = DOMAINS.find(d => d.objectives.some(o => o.id === id))
    if (!domain) return null
    return {
      view: 'objective',
      objective: {
        ...obj,
        domainId: domain.id,
        domainName: domain.name,
        accent: domain.accent,
        ...(tab ? { __initialTab: tab } : {}),
      },
    }
  }
  const labsMatch = raw.match(/^\/labs(?:\/([^/]+))?$/)
  if (labsMatch) {
    const segment = labsMatch[1] ? decodeURIComponent(labsMatch[1]) : null
    const validDomain = segment && (
      segment === 'capstone' || DOMAINS.some(d => d.id === segment)
    )
    return { view: 'labs', labsDomainId: validDomain ? segment : null }
  }
  const simple = raw.replace(/^\//, '')
  // topicfocussession needs live config (topicFocusConfig) — restore picker on refresh instead.
  if (simple === 'topicfocussession') return { view: 'topicfocus' }
  if ([
    'mock', 'mockinterview', 'metrics', 'stats', 'review', 'missed', 'labs', 'focus', 'tutor',
    'topicfocus', 'commandhub', 'studylens', 'examtraps', 'trapdrill', 'subnet', 'routing', 'extrastudy',
    'domainpass', 'domainplacement',
  ].includes(simple)) {
    return { view: simple }
  }
  return null
}

export function syncAppHash(view, objective, labsDomainId = null) {
  if (typeof window === 'undefined') return
  const base = window.location.pathname + window.location.search
  let next = ''
  if (view === 'objective' && objective) {
    const tab = objective.__initialTab
    next = tab ? `#/objective/${objective.id}/${encodeURIComponent(tab)}` : `#/objective/${objective.id}`
  } else if (view === 'labs' && labsDomainId) {
    next = `#/labs/${encodeURIComponent(labsDomainId)}`
  } else if (view !== 'home' && view !== 'onboarding' && view !== 'lab') {
    next = `#/${view}`
  }
  const target = next ? base + next : base
  if (window.location.pathname + window.location.search + window.location.hash !== target && (next || window.location.hash)) {
    window.history.replaceState(null, '', target)
  }
}
