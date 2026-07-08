import { DOMAINS } from '../data/ccnaDomains.js'

/** CCNA exam domain numbers 1–6 mapped to home-grid domain metadata. */
export const TRAP_DOMAIN_NUMBERS = ['1', '2', '3', '4', '5', '6']

export function trapDomainMeta(domainNumber) {
  const n = Number(domainNumber)
  const domain = DOMAINS[n - 1]
  if (!domain) return { id: String(domainNumber), number: n, label: `Domain ${n}`, short: `D${n}`, accent: 'silver' }
  const short = {
    fundamentals: 'Fundamentals',
    access: 'Access',
    connectivity: 'Connectivity',
    services: 'Services',
    security: 'Security',
    automation: 'Automation',
  }[domain.id] || domain.name
  return {
    id: String(domainNumber),
    number: n,
    domainId: domain.id,
    label: domain.name,
    short,
    chip: `D${n} ${short}`,
    accent: domain.accent,
    weight: domain.weight,
  }
}

export function objectiveDomainNumber(objectiveId) {
  return String(objectiveId || '').split('.')[0] || ''
}
