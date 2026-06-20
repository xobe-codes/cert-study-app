import { curatedObjectiveIds, getCurated } from '../data/ccnaCurated.js'
import { ALL_OBJECTIVES } from '../data/ccnaDomains.js'
import { CLI_SHOW_OUTPUT, normalizeCmd } from '../lab/cliEngine.js'
import { CCNA_COMMAND_REGISTRY } from './ccnaCommandRegistry.js'
import { COMMAND_WORKFLOWS } from './commandWorkflows.js'

let _cache = null

function normKey(command) {
  return normalizeCmd(String(command || '').replace(/<[^>]+>/g, '').trim())
}

function inferCategory(command, mode) {
  const c = command.toLowerCase()
  if (mode?.includes('Windows') || mode?.includes('Linux') || mode?.includes('device cli')) return 'host'
  if (c.startsWith('show ') || c.startsWith('show')) return 'verify'
  if (c.startsWith('clear ')) return 'clear'
  if (c.startsWith('debug ')) return 'debug'
  return 'config'
}

function inferDevice(command, mode) {
  if (mode?.includes('Windows') || mode?.includes('Linux')) return 'host'
  if (mode?.includes('WLC') || mode?.includes('AP/WLC')) return 'wlc'
  if (/switchport|vlan |spanning-tree|mac address-table|port-security|etherchannel/i.test(command)) return 'switch'
  if (/router ospf|router-id|network .* area|standby |ip route|ipv6 route|ip nat|access-list|aaa /i.test(command)) return 'router'
  return 'any'
}

function inferExamWeight(category, command) {
  if (category === 'host') return 'reference'
  if (category === 'verify') return 'must-verify'
  if (/show /i.test(command)) return 'must-verify'
  return 'must-config'
}

function autoAliases(command) {
  const aliases = []
  const c = command.toLowerCase()
  if (c.startsWith('show ')) aliases.push(c.replace(/^show /, 'sh '))
  if (c.includes('interface ')) aliases.push(c.replace(/interface /g, 'int '))
  if (c.includes('gigabitethernet')) aliases.push(c.replace(/gigabitethernet/g, 'gi'))
  if (c === 'configure terminal') aliases.push('conf t', 'config t')
  return aliases
}

function findSampleOutput(command) {
  const base = normKey(command.split('<')[0].trim())
  const exact = CLI_SHOW_OUTPUT[command.toLowerCase()]
  if (exact) return exact
  const key = Object.keys(CLI_SHOW_OUTPUT).find(k => {
    const nk = normKey(k)
    return base === nk || base.startsWith(`${nk} `) || nk.startsWith(`${base} `)
  })
  return key ? CLI_SHOW_OUTPUT[key] : null
}

function buildSearchText(entry) {
  return [
    entry.command,
    ...(entry.aliases || []),
    entry.purpose,
    entry.example,
    entry.mode,
    entry.category,
    entry.device,
    ...(entry.tags || []),
    ...(entry.objectiveIds || []),
    entry.syntaxNotes,
    entry.note,
  ].filter(Boolean).join(' ').toLowerCase()
}

function toEntry(raw, source) {
  const category = raw.category || inferCategory(raw.command, raw.mode)
  const entry = {
    id: raw.id,
    command: raw.command,
    aliases: [...new Set([...(raw.aliases || []), ...autoAliases(raw.command)])],
    mode: raw.mode || 'privileged EXEC',
    category,
    device: raw.device || inferDevice(raw.command, raw.mode),
    purpose: raw.purpose || '',
    example: raw.example || '',
    syntaxNotes: raw.syntaxNotes || '',
    note: raw.note || '',
    sampleOutput: raw.sampleOutput || findSampleOutput(raw.command) || null,
    objectiveIds: [...new Set(raw.objectiveIds || (raw.objectiveId ? [raw.objectiveId] : []))],
    ckuIds: raw.ckuIds || [],
    tags: raw.tags || [],
    examWeight: raw.examWeight || inferExamWeight(category, raw.command),
    source,
    relatedCommandIds: [],
    workflowIds: [],
    searchText: '',
  }
  entry.searchText = buildSearchText(entry)
  return entry
}

function linkRelatedCommands(commands) {
  const byId = new Map(commands.map(c => [c.id, c]))

  for (const c of commands) {
    const related = new Set(c.relatedCommandIds)
    if (c.category === 'config') {
      for (const other of commands) {
        if (other.category !== 'verify') continue
        if (other.objectiveIds.some(o => c.objectiveIds.includes(o))) {
          const shareTag = (c.tags || []).some(t => (other.tags || []).includes(t))
          if (shareTag) related.add(other.id)
        }
      }
    }
    c.relatedCommandIds = [...related].slice(0, 8)
  }

  for (const wf of COMMAND_WORKFLOWS) {
    for (const step of wf.steps) {
      if (!step.commandMatch) continue
      const match = commands.find(c => normKey(c.command).includes(normKey(step.commandMatch))
        || normKey(step.commandText).includes(normKey(c.command)))
      if (match && !match.workflowIds.includes(wf.id)) match.workflowIds.push(wf.id)
    }
  }

  return { commands, commandById: byId }
}

export function buildCommandIndex() {
  const byNorm = new Map()
  const commands = []

  for (const objectiveId of curatedObjectiveIds) {
    const pack = getCurated(objectiveId)
    if (!pack) continue
    for (const raw of pack.commands || []) {
      const key = normKey(raw.command)
      if (byNorm.has(key)) {
        const existing = byNorm.get(key)
        if (!existing.objectiveIds.includes(objectiveId)) existing.objectiveIds.push(objectiveId)
        for (const k of raw.ckuIds || []) {
          if (!existing.ckuIds.includes(k)) existing.ckuIds.push(k)
        }
        existing.searchText = buildSearchText(existing)
        continue
      }
      const entry = toEntry({ ...raw, objectiveIds: [objectiveId] }, 'curated')
      byNorm.set(key, entry)
      commands.push(entry)
    }
  }

  for (const raw of CCNA_COMMAND_REGISTRY) {
    const key = normKey(raw.command)
    if (byNorm.has(key)) {
      const existing = byNorm.get(key)
      for (const oid of raw.objectiveIds || []) {
        if (!existing.objectiveIds.includes(oid)) existing.objectiveIds.push(oid)
      }
      for (const a of raw.aliases || []) {
        if (!existing.aliases.includes(a)) existing.aliases.push(a)
      }
      if (!existing.syntaxNotes && raw.syntaxNotes) existing.syntaxNotes = raw.syntaxNotes
      if (!existing.note && raw.note) existing.note = raw.note
      if (!existing.sampleOutput) existing.sampleOutput = findSampleOutput(raw.command)
      existing.searchText = buildSearchText(existing)
      continue
    }
    const entry = toEntry(raw, 'registry')
    byNorm.set(key, entry)
    commands.push(entry)
  }

  const objectives = ALL_OBJECTIVES.map(o => ({
    id: o.id,
    title: o.title,
    domainId: o.domainId,
    accent: o.accent,
  }))

  return {
    objectives,
    workflows: COMMAND_WORKFLOWS,
    ...linkRelatedCommands(commands),
  }
}

export function getCommandIndex() {
  if (!_cache) _cache = buildCommandIndex()
  return _cache
}

export function getCommandById(id, index = getCommandIndex()) {
  return index.commandById.get(id) || null
}
