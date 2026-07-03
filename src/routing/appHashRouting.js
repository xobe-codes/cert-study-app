import { DOMAINS, ALL_OBJECTIVES } from '../data/ccnaDomains.js'

export function parseAppHash() {
  const raw = window.location.hash.replace(/^#/, '')
  if (!raw) return null
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
  const simple = raw.replace(/^\//, '')
  // topicfocussession needs live config (topicFocusConfig) — restore picker on refresh instead.
  if (simple === 'topicfocussession') return { view: 'topicfocus' }
  if ([
    'mock', 'mockinterview', 'metrics', 'stats', 'review', 'missed', 'labs', 'focus', 'tutor',
    'topicfocus', 'commandhub', 'studylens', 'examtraps', 'trapdrill', 'subnet', 'routing', 'extrastudy',
    'domainpass',
  ].includes(simple)) {
    return { view: simple }
  }
  return null
}

export function syncAppHash(view, objective) {
  if (typeof window === 'undefined') return
  const base = window.location.pathname + window.location.search
  let next = ''
  if (view === 'objective' && objective) {
    const tab = objective.__initialTab
    next = tab ? `#/objective/${objective.id}/${encodeURIComponent(tab)}` : `#/objective/${objective.id}`
  } else if (view !== 'home' && view !== 'onboarding' && view !== 'lab') {
    next = `#/${view}`
  }
  const target = next ? base + next : base
  if (window.location.pathname + window.location.search + window.location.hash !== target && (next || window.location.hash)) {
    window.history.replaceState(null, '', target)
  }
}
