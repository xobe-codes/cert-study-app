import { normalizeCmd } from './cliEngine.js'

/**
 * Canonicalize Cisco IOS CLI for matching — interface shorthand (Gi0/1),
 * int/interface, conf t, no shut, etc.
 */
export function normalizeIosCli(cmd) {
  let s = normalizeCmd(cmd)
  if (!s) return s

  s = s.replace(/^int /, 'interface ')
  s = normalizeInterfaceTokens(s)
  s = canonicalizeIosPhrases(s)
  return s
}

function normalizeInterfaceTokens(s) {
  let out = s
  const replacements = [
    [/\bgigabitethernet(?=\d)/gi, 'gi'],
    [/\bgigabit(?=\d)/gi, 'gi'],
    [/\bgig(?=\d)/gi, 'gi'],
    [/\bg(?=\d+\/)/gi, 'gi'],
    [/\bfastethernet(?=\d)/gi, 'fa'],
    [/\bfast(?=\d)/gi, 'fa'],
    [/\bf(?=\d+\/)/gi, 'fa'],
    [/\btengigabitethernet(?=\d)/gi, 'te'],
    [/\bten(?=\d)/gi, 'te'],
    [/\bport-channel(?=\d)/gi, 'po'],
    [/\bportchannel(?=\d)/gi, 'po'],
    [/\bloopback(?=\d)/gi, 'lo'],
    [/\bserial(?=\d)/gi, 'se'],
  ]
  for (const [re, rep] of replacements) out = out.replace(re, rep)
  return out
}

function canonicalizeIosPhrases(s) {
  if (/^(configure terminal|config t|configure t|conf terminal)$/.test(s)) return 'conf t'
  if (/^(no shutdown|no shut)$/.test(s)) return 'no shutdown'
  return s
}

const showMapCache = new WeakMap()

function normalizedShowMap(showOutput) {
  if (!showOutput || typeof showOutput !== 'object') return new Map()
  if (showMapCache.has(showOutput)) return showMapCache.get(showOutput)
  const map = new Map()
  for (const [key, value] of Object.entries(showOutput)) {
    map.set(normalizeIosCli(key), value)
    if (showOutput[key] !== undefined) map.set(key, value)
  }
  showMapCache.set(showOutput, map)
  return map
}

/** Resolve simulated show output — accepts Gi0/1 vs GigabitEthernet0/1 keys. */
export function resolveShowOutput(norm, showOutput) {
  if (!showOutput) return null
  const canon = normalizeIosCli(norm)
  if (showOutput[canon] != null) return showOutput[canon]
  const map = normalizedShowMap(showOutput)
  if (map.has(canon)) return map.get(canon)
  if (showOutput[norm] != null) return showOutput[norm]
  return null
}

/** Accept routing-decoder / free-text answers with interface shorthand. */
export function interfaceAnswerVariants(answer) {
  const base = String(answer || '').trim()
  if (!base) return []
  const variants = new Set([base, base.toLowerCase()])
  const canon = normalizeIosCli(base)
  variants.add(canon)
  if (/gigabitethernet|gi|gig|fastethernet|fa/i.test(base)) {
    const m = base.match(/(\d+\/\d+(?:\.\d+)?)/i)
    if (m) {
      variants.add(`gi${m[1]}`.toLowerCase())
      variants.add(`gigabitethernet${m[1]}`.toLowerCase())
      variants.add(`GigabitEthernet${m[1]}`)
      variants.add(`Gi${m[1]}`)
    }
  }
  return [...variants]
}

export function answersMatchShorthand(input, expected, extraAccept = []) {
  const got = normalizeIosCli(input)
  if (!got) return false
  const accepted = new Set([
    ...interfaceAnswerVariants(expected),
    ...extraAccept.flatMap(a => interfaceAnswerVariants(a)),
  ].map(a => normalizeIosCli(a)))
  return accepted.has(got) || [...accepted].some(a => a && got.includes(a))
}
