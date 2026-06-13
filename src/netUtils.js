// Pure networking utility functions extracted for testability.
// Imported by App.jsx and by the Vitest smoke-test suite.

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function ipToOctets(ip) { return ip.split('.').map(Number) }
export function octetsToIp(o) { return o.join('.') }

export function maskFromCidr(cidr) {
  const bits = '1'.repeat(cidr) + '0'.repeat(32 - cidr)
  return [0, 8, 16, 24].map(i => parseInt(bits.slice(i, i + 8), 2))
}

export function cidrFromMask(mask) {
  return mask.reduce((acc, o) => acc + o.toString(2).split('1').length - 1, 0)
}

export function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Generates a random "given an IP and CIDR, find network/broadcast/range/etc" problem
export function generateSubnetProblem() {
  const cidr = randInt(2, 30)
  const octets = [randInt(1, 223), randInt(0, 255), randInt(0, 255), randInt(1, 254)]
  const ip = octetsToIp(octets)
  const mask = maskFromCidr(cidr)

  const networkOctets = octets.map((o, i) => o & mask[i])
  const wildcard = mask.map(m => 255 - m)
  const broadcastOctets = networkOctets.map((o, i) => o | wildcard[i])

  const hostBits = 32 - cidr
  const totalHosts = Math.pow(2, hostBits)
  const usableHosts = hostBits >= 1 ? Math.max(totalHosts - 2, 0) : 0

  const firstUsable = [...networkOctets]
  const lastUsable = [...broadcastOctets]
  if (hostBits >= 1) {
    firstUsable[3] += 1
    lastUsable[3] -= 1
  }

  let blockSizeOctetIndex = mask.findIndex(m => m !== 255 && m !== 0)
  if (blockSizeOctetIndex === -1) blockSizeOctetIndex = cidr === 32 ? 3 : 0
  const blockSize = 256 - mask[blockSizeOctetIndex]

  return {
    type: 'subnet',
    ip,
    cidr,
    mask: octetsToIp(mask),
    network: octetsToIp(networkOctets),
    broadcast: octetsToIp(broadcastOctets),
    firstUsable: hostBits >= 1 ? octetsToIp(firstUsable) : null,
    lastUsable: hostBits >= 1 ? octetsToIp(lastUsable) : null,
    usableHosts,
    totalHosts,
    blockSize,
    blockSizeOctetIndex,
    steps: [
      `Block size = 256 - ${mask[blockSizeOctetIndex]} (octet ${blockSizeOctetIndex + 1} of the mask) = ${blockSize}`,
      `Network address: round octet ${blockSizeOctetIndex + 1} of ${ip} down to the nearest multiple of ${blockSize} → ${octetsToIp(networkOctets)}`,
      `Broadcast address: add (block size - 1) = ${blockSize - 1} to octet ${blockSizeOctetIndex + 1} of the network address, set octets after it to 255 → ${octetsToIp(broadcastOctets)}`,
      hostBits >= 1
        ? `Usable host range: ${octetsToIp(firstUsable)} - ${octetsToIp(lastUsable)} (${usableHosts} usable hosts = 2^${hostBits} - 2)`
        : `/${cidr} has no usable hosts (point-to-point or host route).`,
    ],
  }
}

// VLSM: given a base network and a list of required host counts, allocate
// subnets in descending order of size (largest-first allocation).
export function generateVLSMProblem() {
  const baseCidr = 24
  const octets = [randInt(1, 223), randInt(0, 255), randInt(0, 255), 0]
  const baseNetwork = octetsToIp(octets)

  const numReqs = randInt(3, 4)
  const reqs = []
  let remaining = 200
  for (let i = 0; i < numReqs; i++) {
    const maxForThis = Math.floor(remaining / (numReqs - i)) || 2
    const hosts = randInt(2, Math.max(2, Math.min(maxForThis, 60)))
    reqs.push({ name: `Subnet ${String.fromCharCode(65 + i)}`, hostsNeeded: hosts })
    remaining -= hosts
  }
  const sorted = [...reqs].sort((a, b) => b.hostsNeeded - a.hostsNeeded)

  let cursor = ipToOctets(baseNetwork)
  const allocations = sorted.map(req => {
    let hostBits = 1
    while (Math.pow(2, hostBits) - 2 < req.hostsNeeded) hostBits++
    const cidr = 32 - hostBits
    const blockSize = Math.pow(2, hostBits)
    const mask = maskFromCidr(cidr)

    const network = [...cursor]
    const broadcastOctets = network.map((o, i) => o | (255 - mask[i]))
    const firstUsable = [...network]; firstUsable[3] += 1
    const lastUsable = [...broadcastOctets]; lastUsable[3] -= 1

    const allocation = {
      name: req.name,
      hostsNeeded: req.hostsNeeded,
      cidr,
      mask: octetsToIp(mask),
      network: octetsToIp(network),
      broadcast: octetsToIp(broadcastOctets),
      firstUsable: octetsToIp(firstUsable),
      lastUsable: octetsToIp(lastUsable),
      usableHosts: blockSize - 2,
      blockSize,
    }

    let val = cursor[0] * 16777216 + cursor[1] * 65536 + cursor[2] * 256 + cursor[3]
    val += blockSize
    cursor = [
      (val >>> 24) & 255,
      (val >>> 16) & 255,
      (val >>> 8) & 255,
      val & 255,
    ]

    return allocation
  })

  return {
    type: 'vlsm',
    baseNetwork: `${baseNetwork}/${baseCidr}`,
    requirements: reqs,
    allocations,
  }
}

// Mastery computation (weights recent quiz sessions 70% + confidence 30%).
export const RATING_CONFIDENCE = { easy: 1, medium: 0.6, hard: 0.3, practice: 0.1 }

export function computeMastery(entry) {
  if (!entry) return { score: 0, mastered: false }
  const scores = entry.quizScores || []
  if (scores.length === 0) return { score: 0, mastered: false }
  const recent = scores.slice(-3)
  const acc = recent.reduce((s, r) => s + (r.score / Math.max(r.total, 1)), 0) / recent.length
  const ratings = entry.confidenceRatings || []
  const conf = ratings.length
    ? ratings.reduce((s, r) => s + (RATING_CONFIDENCE[r] ?? 0.6), 0) / ratings.length
    : 0.6
  const score = acc * 0.7 + conf * 0.3
  const mastered = acc >= 0.8 && conf >= 0.5 && recent.some(r => r.total >= 3)
  return { score, mastered }
}

// IPv6 address expansion and compression.
export function expandIPv6(addr) {
  let full = addr.trim()
  if (full.includes('::')) {
    const [left, right] = full.split('::')
    const leftGroups = left ? left.split(':') : []
    const rightGroups = right ? right.split(':') : []
    const missing = 8 - leftGroups.length - rightGroups.length
    const mid = Array(missing).fill('0000')
    full = [...leftGroups, ...mid, ...rightGroups].join(':')
  }
  return full.split(':').map(g => g.padStart(4, '0')).join(':')
}

export function compressIPv6(expanded) {
  const groups = expanded.split(':').map(g => g.replace(/^0+/, '') || '0')
  const str = groups.join(':')
  let best = '', bestLen = 0, cur = '', curLen = 0
  for (let i = 0; i < groups.length; i++) {
    if (groups[i] === '0') { cur += (cur ? ':' : '') + '0'; curLen++; if (curLen > bestLen) { best = cur; bestLen = curLen } }
    else { cur = ''; curLen = 0 }
  }
  if (bestLen >= 2) {
    const rx = new RegExp('(^|:)' + best.replace(/:/g, ':') + '($|:)')
    return str.replace(rx, '::').replace(/:{3,}/, '::')
  }
  return str
}
