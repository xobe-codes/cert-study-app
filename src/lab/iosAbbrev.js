import { COMMAND_DRILLS } from './commandDrills.js'
import { CCNA_COMMAND_REGISTRY } from '../commands/ccnaCommandRegistry.js'
import { normalizeIosCli } from './iosShorthand.js'

function normalizeCmd(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Wildcard slot — interface names, VLAN IDs, IPs, ACL names, etc. */
const PARAM = '*'

const REGISTRY_MODE_MAP = {
  'user EXEC': 'user',
  'privileged EXEC': 'priv',
  'global config': 'config',
  'interface config': 'config-if',
  'VLAN config': 'config-vlan',
  'line config': 'config-line',
  'router config': 'config-router',
  'DHCP pool config': 'config-dhcp',
  'named ACL config': 'config-acl',
}

const NAV_PATTERNS = [
  { mode: 'user', tokens: ['enable'] },
  { mode: 'user', tokens: ['en'] },
  { mode: 'priv', tokens: ['disable'] },
  { mode: 'priv', tokens: ['exit'] },
  { mode: 'priv', tokens: ['end'] },
  { mode: 'priv', tokens: ['configure', 'terminal'] },
  { mode: 'priv', tokens: ['conf', 't'] },
  { mode: 'priv', tokens: ['config', 't'] },
  { mode: 'priv', tokens: ['configure', 't'] },
  { mode: 'priv', tokens: ['conf', 'terminal'] },
  { mode: 'config', tokens: ['exit'] },
  { mode: 'config', tokens: ['end'] },
  { mode: 'config', tokens: ['interface', PARAM] },
  { mode: 'config', tokens: ['int', PARAM] },
  { mode: 'config', tokens: ['vlan', PARAM] },
  { mode: 'config', tokens: ['line', PARAM, PARAM, PARAM] },
  { mode: 'config', tokens: ['router', PARAM, PARAM] },
  { mode: 'config', tokens: ['ip', 'dhcp', 'pool', PARAM] },
  { mode: 'config', tokens: ['ip', 'access-list', PARAM, PARAM] },
]

function tokenizeLine(line) {
  const s = normalizeCmd(line).replace(/^sh\b/, 'show')
  return s.split(' ').filter(Boolean)
}

function isParamSlot(tok) {
  return tok === PARAM
}

function isLiteralParam(tok) {
  if (!tok) return false
  if (/^\d+$/.test(tok)) return true
  if (/^\d+\.\d+\.\d+\.\d+/.test(tok)) return true
  if (/^[\da-f:]+(?:\/\d+)?$/i.test(tok)) return true
  if (/^(gi|fa|te|po|lo|se)\d/i.test(tok)) return true
  if (/^gigabitethernet/i.test(tok)) return true
  if (/^fastethernet/i.test(tok)) return true
  return false
}

function isValidTokenPrefix(inputTok, patternTok) {
  if (patternTok === inputTok) return true
  if (!patternTok.startsWith(inputTok)) return false
  if (inputTok === 'ip' && patternTok.startsWith('ipv6')) return false
  return true
}

function tokenMatchesPattern(inputTok, patternTok) {
  if (isParamSlot(patternTok)) return isLiteralParam(inputTok) || inputTok.length > 0
  return isValidTokenPrefix(inputTok, patternTok)
}

function inferDrillMode(tokens) {
  const [a, b, c] = tokens
  if (a === 'show') return 'priv'
  if (a === 'name') return 'config-vlan'
  if (a === 'network' || a === 'router-id') return 'config-router'
  if (a === 'default-router') return 'config-dhcp'
  if (a === 'permit' || a === 'deny') return 'config-acl'
  if (a === 'transport' || a === 'login') return 'config-line'
  if (['switchport', 'channel-group', 'standby', 'ipv6'].includes(a)) return 'config-if'
  if (a === 'ip' && ['address', 'nat', 'helper-address', 'access-group'].includes(b)) return 'config-if'
  if (a === 'no' && b === 'shutdown') return 'config-if'
  if (a === 'no' && b === 'cdp' && c === 'enable') return 'config-if'
  if (a === 'no' && b === 'cdp') return 'config'
  if (a === 'spanning-tree' && b === 'portfast') return 'config-if'
  if (a === 'spanning-tree' && b === 'bpduguard') return 'config-if'
  if (a === 'spanning-tree') return 'config'
  if (['interface', 'int', 'vlan', 'line', 'router', 'hostname', 'cdp', 'lldp'].includes(a)) return 'config'
  if (a === 'ipv6' && b === 'unicast-routing') return 'config'
  if (a === 'ip' && b === 'route') return 'config'
  if (a === 'ip' && b === 'dhcp') return 'config'
  if (a === 'ip' && b === 'access-list') return 'config'
  if (a === 'ip' && b === 'nat') return 'config-if'
  return 'config'
}

function toPatternTokens(tokens) {
  const out = []
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    const prev = out[i - 1]
    if (isLiteralParam(t)) {
      out.push(PARAM)
      continue
    }
    if (prev === 'name' || prev === 'pool' || prev === 'area' || prev === 'ospf') {
      out.push(PARAM)
      continue
    }
    if (prev === 'router' && t !== 'ospf' && t !== 'rip' && t !== 'eigrp') {
      out.push(PARAM)
      continue
    }
    if (prev === 'standby' || prev === 'channel-group') {
      out.push(PARAM)
      continue
    }
    out.push(t)
  }
  return out
}

function buildPatternCatalog() {
  const catalog = [...NAV_PATTERNS]

  for (const drills of Object.values(COMMAND_DRILLS)) {
    for (const d of drills) {
      const answers = Array.isArray(d.answer) ? d.answer : [d.answer]
      for (const ans of answers) {
        const tokens = tokenizeLine(ans)
        catalog.push({ mode: inferDrillMode(tokens), tokens: toPatternTokens(tokens) })
      }
    }
  }

  for (const entry of CCNA_COMMAND_REGISTRY) {
    const mode = REGISTRY_MODE_MAP[entry.mode] || 'config'
    const cmds = [entry.command, ...(entry.aliases || [])]
    for (const cmd of cmds) {
      const tokens = tokenizeLine(cmd)
      catalog.push({ mode, tokens: toPatternTokens(tokens) })
    }
  }

  const SHOW_PREFIX_PATTERNS = [
    'show running-config',
    'show startup-config',
    'show version',
    'show clock',
    'show history',
    'show ip route',
    'show ip interface brief',
    'show interfaces status',
    'show vlan brief',
    'show mac address-table',
    'show cdp neighbors',
    'show spanning-tree',
    'show etherchannel summary',
    'show ip ospf neighbor',
    'show standby brief',
    'show access-lists',
    'show ip dhcp binding',
    'show power inline',
    'show wlan summary',
  ]
  for (const cmd of SHOW_PREFIX_PATTERNS) {
    catalog.push({ mode: 'priv', tokens: toPatternTokens(tokenizeLine(cmd)) })
  }

  return catalog
}

const PATTERN_CATALOG = buildPatternCatalog()

function getCatalog() {
  return PATTERN_CATALOG
}

function patternsForMode(mode) {
  return getCatalog().filter(p => p.mode === mode)
}

function patternsForAnyMode() {
  return getCatalog()
}

function resolveRootToken(inputTok, mode) {
  const roots = [...new Set(getCatalog().filter(p => p.mode === mode).map(p => p.tokens[0]).filter(Boolean))]
  const matches = roots.filter(r => !isParamSlot(r) && isValidTokenPrefix(inputTok, r))
  if (matches.includes(inputTok)) return { resolved: inputTok }
  if (matches.length === 1) return { resolved: matches[0] }
  if (matches.length > 1) return { error: 'ambiguous', token: inputTok, candidates: matches }
  return null
}

function viablePatterns(inputTokens, mode, { allowPrefix = false } = {}) {
  const pool = mode ? patternsForMode(mode) : patternsForAnyMode()
  return pool.filter(({ tokens }) => {
    if (allowPrefix) {
      if (inputTokens.length > tokens.length) return false
    } else if (inputTokens.length !== tokens.length) {
      return false
    }
    for (let i = 0; i < inputTokens.length; i++) {
      if (!tokenMatchesPattern(inputTokens[i], tokens[i])) return false
    }
    return true
  })
}

function countParamSlots(tokens) {
  return tokens.filter(isParamSlot).length
}

function expandPattern(inputTokens, patternTokens) {
  const expanded = patternTokens.map((t, i) => (isParamSlot(t) ? inputTokens[i] : t))
  return { resolved: normalizeIosCli(expanded.join(' ')) }
}

function patternScore(tokens) {
  return countParamSlots(tokens) * 1000 - tokens.length
}

function resolveFromMatches(inputTokens, matches) {
  if (!matches.length) return { error: 'invalid', token: inputTokens[0] }

  const ranked = [...matches].sort((a, b) => patternScore(a.tokens) - patternScore(b.tokens))
  const bestScore = patternScore(ranked[0].tokens)
  const tied = ranked.filter(m => patternScore(m.tokens) === bestScore)
  const canonical = [...new Set(tied.map(m => expandPattern(inputTokens, m.tokens).resolved))]
  if (canonical.length > 1) {
    const preferLonger = expandPattern(inputTokens, tied.find(m => m.tokens.includes('running-config'))?.tokens || tied[0].tokens)
    if (preferLonger.resolved) return preferLonger
  }
  return expandPattern(inputTokens, tied[0].tokens)
}

/**
 * Resolve IOS unique-prefix abbreviations for a line in the given CLI mode.
 * Returns { resolved } or { error: 'ambiguous'|'invalid', token, candidates? }.
 */
export function resolveIosAbbreviation(line, mode = 'priv') {
  const inputTokens = tokenizeLine(line)
  if (!inputTokens.length) return { resolved: '' }

  if (inputTokens.length === 1) {
    const root = resolveRootToken(inputTokens[0], mode)
    if (root) return root
  }

  const matches = viablePatterns(inputTokens, mode)
  if (!matches.length) {
    const anyMatches = viablePatterns(inputTokens, null)
    if (!anyMatches.length) return { error: 'invalid', token: inputTokens[0] }
    return resolveFromMatches(inputTokens, anyMatches)
  }
  return resolveFromMatches(inputTokens, matches)
}

/** Tab completion — expand current token to minimum unique prefix among viable commands. */
export function getTabCompletion(line, mode = 'priv') {
  const raw = String(line || '')
  const trimmed = raw.trimEnd()
  if (!trimmed) return null

  const parts = trimmed.split(' ')
  const endsWithSpace = raw.endsWith(' ')
  const prefixTokens = endsWithSpace ? parts : parts.slice(0, -1)
  const partial = endsWithSpace ? '' : (parts[parts.length - 1] || '')

  const viable = viablePatterns(
    endsWithSpace ? prefixTokens : [...prefixTokens, partial].filter((t, i) => i < prefixTokens.length + 1 && (i < prefixTokens.length || partial)),
    mode,
    { allowPrefix: true },
  )
  if (!viable.length) return null

  const tokenIndex = prefixTokens.length
  const opts = [...new Set(
    viable.map(m => m.tokens[tokenIndex]).filter(t => t && !isParamSlot(t) && isValidTokenPrefix(partial.toLowerCase(), t)),
  )]
  if (!opts.length) return null
  if (opts.length === 1) {
    const next = [...prefixTokens, opts[0]]
    return endsWithSpace ? `${next.join(' ')} ` : `${prefixTokens.join(' ')}${prefixTokens.length ? ' ' : ''}${opts[0]}`
  }
  const common = longestCommonPrefix(opts)
  if (common.length > partial.length) {
    return `${prefixTokens.join(' ')}${prefixTokens.length ? ' ' : ''}${common}`
  }
  return null
}

function longestCommonPrefix(words) {
  if (!words.length) return ''
  let prefix = words[0]
  for (let i = 1; i < words.length; i++) {
    while (!words[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1)
      if (!prefix) return ''
    }
  }
  return prefix
}

/** All modes to try when grading without a live terminal session. */
export const CLI_ABBREV_GRADE_MODES = [
  'user', 'priv', 'config', 'config-if', 'config-vlan', 'config-line', 'config-router', 'config-dhcp', 'config-acl',
]

export function resolveIosAbbreviationForGrading(line) {
  for (const mode of CLI_ABBREV_GRADE_MODES) {
    const result = resolveIosAbbreviation(line, mode)
    if (!result.error && result.resolved) return result
  }
  const fallback = resolveIosAbbreviation(line, null)
  if (!fallback.error) return fallback
  return { resolved: normalizeIosCli(line) }
}
