/**
 * Lab curriculum modules — the single source of lab ordering for the Labs Hub.
 *
 * Labs are organized into ordered modules that progress from foundation to
 * capstone (beginner → highest level). The six domain modules follow the CCNA
 * exam sequence (fundamentals → automation); a final Troubleshooting Capstone
 * collects every diagnose-and-repair scenario as the most advanced tier.
 *
 * Within each module, labs are sorted by difficulty (beginner → intermediate →
 * advanced), then interpret-first (read-only "show" labs before hands-on config
 * labs), then by objective number — so a learner always meets the gentlest lab
 * first and works upward.
 */
import { DOMAINS } from './ccnaDomains.js'
import { allLabs, getLab } from './ccnaLabs.js'

const DIFFICULTY_RANK = { beginner: 0, intermediate: 1, advanced: 2 }

/** Legacy/typo domain ids mapped to their canonical DOMAINS id. */
const DOMAIN_ALIAS = { ip_services: 'services' }
export const canonicalLabDomain = (id) => DOMAIN_ALIAS[id] || id

const DOMAIN_BLURB = {
  fundamentals: 'Cabling, IPv4/IPv6 addressing, subnetting, and switching basics.',
  access: 'VLANs, trunking, EtherChannel, discovery protocols, and wireless access.',
  connectivity: 'Routing tables, static routes, OSPF, and first-hop redundancy.',
  services: 'NAT, DHCP/DNS, NTP, SNMP, syslog, and remote access.',
  security: 'Device hardening, AAA, ACLs, Layer 2 protection, and wireless security.',
  automation: 'Controller-based networking, REST APIs, and JSON/config management.',
}

/**
 * Ordered module definitions. Domain modules resolve their title/accent from
 * DOMAINS; the capstone is defined inline. `level` is a learner-facing band.
 */
export const LAB_MODULE_DEFS = [
  { id: 'm1-fundamentals', domainId: 'fundamentals', level: 'Foundation' },
  { id: 'm2-access', domainId: 'access', level: 'Foundation' },
  { id: 'm3-connectivity', domainId: 'connectivity', level: 'Core' },
  { id: 'm4-services', domainId: 'services', level: 'Core' },
  { id: 'm5-security', domainId: 'security', level: 'Advanced' },
  { id: 'm6-automation', domainId: 'automation', level: 'Advanced' },
  {
    id: 'm7-troubleshooting',
    labType: 'troubleshooting',
    level: 'Capstone',
    title: 'Troubleshooting Capstone',
    accent: 'amber',
    blurb: 'Diagnose and repair broken configurations — the highest-level, exam-style scenarios.',
  },
]

/** Numeric difficulty rank; unknown difficulties sort as intermediate. */
export function difficultyRank(lab) {
  return DIFFICULTY_RANK[lab?.difficulty] ?? 1
}

/** Beginner → advanced, interpret-before-config, then objective order. */
export function compareLabs(a, b) {
  const byDifficulty = difficultyRank(a) - difficultyRank(b)
  if (byDifficulty !== 0) return byDifficulty
  const aInterpret = a.interpretOnly ? 0 : 1
  const bInterpret = b.interpretOnly ? 0 : 1
  if (aInterpret !== bInterpret) return aInterpret - bInterpret
  return String(a.objectiveId).localeCompare(String(b.objectiveId), undefined, { numeric: true })
}

/** Resolved lab metadata from getLab() — correct interpretOnly after config-lab-lite. */
export function resolvedLabs() {
  return allLabs().map(l => getLab(l.id)?.lab).filter(Boolean)
}

/**
 * Build the ordered lab modules with their sorted labs. Troubleshooting labs
 * are always routed to the capstone (regardless of domain). Empty modules are
 * dropped. Pass an explicit lab list for testing.
 */
export function buildLabModules(labs = resolvedLabs()) {
  const troubleshooting = labs.filter(l => l.labType === 'troubleshooting')
  const guided = labs.filter(l => l.labType !== 'troubleshooting')

  return LAB_MODULE_DEFS.map((def, index) => {
    const domain = def.domainId ? DOMAINS.find(d => d.id === def.domainId) : null
    const domainIndex = def.domainId ? DOMAINS.findIndex(d => d.id === def.domainId) : -1
    const moduleLabs = (def.labType === 'troubleshooting'
      ? [...troubleshooting]
      : guided.filter(l => canonicalLabDomain(l.domainId) === def.domainId)
    ).sort(compareLabs)

    return {
      id: def.id,
      order: index + 1,
      domainId: def.domainId || (def.labType === 'troubleshooting' ? 'capstone' : null),
      domainNumber: domainIndex >= 0 ? domainIndex + 1 : null,
      examWeight: domain?.weight ?? null,
      title: def.title || domain?.name || def.domainId,
      level: def.level,
      accent: def.accent || domain?.accent || 'silver',
      blurb: def.blurb || DOMAIN_BLURB[def.domainId] || '',
      labs: moduleLabs,
    }
  }).filter(module => module.labs.length > 0)
}

/** Filter hub modules by CCNA domain id, `capstone`, or `all`. */
export function filterLabModules(modules, domainFilter = 'all') {
  if (!domainFilter || domainFilter === 'all') return modules
  if (domainFilter === 'capstone') return modules.filter(m => m.domainId === 'capstone')
  return modules.filter(m => m.domainId === domainFilter)
}

/** Labs for one CCNA domain (guided only, sorted). */
export function labsForDomain(domainId, labs = resolvedLabs()) {
  const canon = canonicalLabDomain(domainId)
  return labs
    .filter(l => l.labType !== 'troubleshooting' && canonicalLabDomain(l.domainId) === canon)
    .sort(compareLabs)
}

/** Done/total counts for a domain filter chip. */
export function labDomainDoneCount(modules, doneIds, domainFilter) {
  const scoped = filterLabModules(modules, domainFilter)
  const total = scoped.reduce((n, m) => n + m.labs.length, 0)
  const doneSet = new Set(doneIds || [])
  const done = scoped.reduce((n, m) => n + m.labs.filter(l => doneSet.has(l.id)).length, 0)
  return { done, total }
}
