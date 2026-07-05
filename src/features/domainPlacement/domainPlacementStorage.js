import { DOMAINS } from '../../data/ccnaDomains.js'
import { STORAGE_KEYS, PLACEMENT_BASELINE_REFRESH_EVENT } from '../../storageKeys.js'
import { computeWeakObjectivesFromPlacement } from './placementAdaptiveRetake.js'
import { buildDomainBaselineSummary, countTestedOutDomains } from './domainBaselineProfile.js'

const KEY = STORAGE_KEYS.domainPlacement

function enrichRecord(domainId, record) {
  if (!record?.lastAttempt) return record
  const last = record.lastAttempt
  if (last.objectiveProfiles && last.domainStatus != null && last.testedOut != null) {
    return record
  }
  const domain = DOMAINS.find(d => d.id === domainId)
  if (!domain) return record
  const summary = buildDomainBaselineSummary({ domain, lastAttempt: last })
  return {
    ...record,
    lastAttempt: {
      ...last,
      weakObjectives: last.weakObjectives || computeWeakObjectivesFromPlacement(last.byObjective),
      objectiveProfiles: summary.objectiveProfiles,
      domainStatus: summary.domainStatus,
      testedOut: summary.testedOut,
      strongObjectives: summary.strongObjectives,
    },
  }
}

function enrichStore(store) {
  const next = { ...store }
  let changed = false
  for (const domainId of Object.keys(next)) {
    const enriched = enrichRecord(domainId, next[domainId])
    if (enriched !== next[domainId]) {
      next[domainId] = enriched
      changed = true
    }
  }
  return { store: next, changed }
}

async function loadStore() {
  try {
    const raw = await window.storage.getItem(KEY)
    return raw && typeof raw === 'object' ? raw : {}
  } catch {
    return {}
  }
}

async function saveStore(store) {
  await window.storage.setItem(KEY, store)
}

export async function loadPlacementRecord(domainId) {
  const store = await loadStore()
  const enriched = enrichRecord(domainId, store[domainId] || null)
  return enriched
}

export async function loadAllPlacementRecords() {
  const store = await loadStore()
  const { store: enriched, changed } = enrichStore(store)
  if (changed) await saveStore(enriched)
  return enriched
}

function attachBaselineFields(domainId, attempt) {
  const domain = DOMAINS.find(d => d.id === domainId)
  const weakObjectives = computeWeakObjectivesFromPlacement(attempt.byObjective)
  const enriched = { ...attempt, weakObjectives }
  if (!domain) return enriched
  const summary = buildDomainBaselineSummary({ domain, lastAttempt: enriched })
  return {
    ...enriched,
    objectiveProfiles: summary.objectiveProfiles,
    domainStatus: summary.domainStatus,
    testedOut: summary.testedOut,
    strongObjectives: summary.strongObjectives,
  }
}

export async function savePlacementAttempt(domainId, attempt) {
  const store = await loadStore()
  const prev = store[domainId]?.lastAttempt || null
  const history = store[domainId]?.history || []
  const nextHistory = prev ? [...history, prev].slice(-5) : history

  const record = {
    lastAttempt: attachBaselineFields(domainId, attempt),
    previousAttempt: prev,
    history: nextHistory,
    attempts: (store[domainId]?.attempts || 0) + 1,
  }

  store[domainId] = record
  await saveStore(store)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PLACEMENT_BASELINE_REFRESH_EVENT))
  }
  return record
}

export function countPlacementBaselines(records, domainIds) {
  if (!records || !domainIds?.length) return 0
  return domainIds.filter(id => records[id]?.lastAttempt).length
}

export { countTestedOutDomains }

export function shouldSuggestPlacement(record, now = Date.now()) {
  if (!record?.lastAttempt) return true
  const age = now - (record.lastAttempt.at || 0)
  if (age > 14 * 24 * 60 * 60 * 1000) return true
  return record.lastAttempt.pct < 70
}
