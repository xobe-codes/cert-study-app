import { DOMAINS } from '../data/ccnaDomains.js'

/** Objective id prefix → exam domain number (1–6). */
export function objectiveDomainNumber(objectiveId) {
  const n = parseInt(String(objectiveId || '').split('.')[0], 10)
  return Number.isFinite(n) ? n : 99
}

/** Lowest domain number among objective ids (multi-domain items → earliest domain). */
export function lowestDomainNumber(objectiveIds = []) {
  if (!objectiveIds?.length) return 99
  return Math.min(...objectiveIds.map(objectiveDomainNumber))
}

function domainSectionMeta(domainNumber) {
  const domain = DOMAINS[domainNumber - 1]
  return {
    domainNumber,
    domainId: domain?.id ?? null,
    title: domain ? `Domain ${domainNumber} — ${domain.name}` : `Domain ${domainNumber}`,
    accent: domain?.accent ?? 'silver',
  }
}

function sortAlpha(items, key = 'command') {
  return [...items].sort((a, b) => String(a[key] || '').localeCompare(String(b[key] || '')))
}

/** Group commands into D1→D6 sections; within each section sort alphabetically. */
export function groupCommandsByDomain(commands = []) {
  const byDomain = new Map()
  for (const cmd of commands) {
    const d = lowestDomainNumber(cmd.objectiveIds)
    if (!byDomain.has(d)) byDomain.set(d, [])
    byDomain.get(d).push(cmd)
  }
  const sections = []
  for (let n = 1; n <= 6; n += 1) {
    const list = byDomain.get(n)
    if (!list?.length) continue
    sections.push({
      ...domainSectionMeta(n),
      commands: sortAlpha(list, 'command'),
    })
  }
  return sections
}

/** Group workflows into D1→D6 sections; within each section sort by title. */
export function groupWorkflowsByDomain(workflows = []) {
  const byDomain = new Map()
  for (const wf of workflows) {
    const d = lowestDomainNumber(wf.objectiveIds)
    if (!byDomain.has(d)) byDomain.set(d, [])
    byDomain.get(d).push(wf)
  }
  const sections = []
  for (let n = 1; n <= 6; n += 1) {
    const list = byDomain.get(n)
    if (!list?.length) continue
    sections.push({
      ...domainSectionMeta(n),
      workflows: sortAlpha(list, 'title'),
    })
  }
  return sections
}
