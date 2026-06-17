/**
 * Stateful Cisco IOS command simulator for the lab CLI.
 *
 * Each device in a lab gets its own state object (interfaces, VLANs, DHCP
 * pools, ACLs, routing, etc). Commands mutate that state; `show` commands
 * and `ping` read it back, so output reflects what the learner actually
 * configured instead of a fixed canned string. Coverage is scoped to the
 * CCNA 200-301 command surface used across this app's labs — anything
 * outside that scope is reported as unmatched so the caller can fall back
 * to a generic syntax error, the same way real IOS rejects unknown input.
 */

const IFACE_ALIASES = [
  [/^(?:gigabitethernet|gig|gi)\s*/, 'gi'],
  [/^(?:fastethernet|fa)\s*/, 'fa'],
  [/^(?:tengigabitethernet|ten|te)\s*/, 'te'],
  [/^(?:port-channel|po)\s*/, 'po'],
  [/^(?:vlan)\s*/, 'vlan'],
  [/^(?:loopback|lo)\s*/, 'lo'],
]
const IFACE_DISPLAY = { gi: 'GigabitEthernet', fa: 'FastEthernet', te: 'TenGigabitEthernet', po: 'Port-channel', vlan: 'Vlan', lo: 'Loopback' }
const IFACE_SHORT = { gi: 'Gi', fa: 'Fa', te: 'Te', po: 'Po', vlan: 'Vlan', lo: 'Lo' }

export function canonIface(raw) {
  const s = String(raw || '').trim().toLowerCase().replace(/\s+/g, '')
  for (const [re, pfx] of IFACE_ALIASES) {
    if (re.test(s)) return s.replace(re, pfx)
  }
  return s
}

export function displayIface(canon) {
  const m = String(canon || '').match(/^([a-z]+)(.*)$/)
  if (!m) return canon
  return `${IFACE_DISPLAY[m[1]] || m[1]}${m[2]}`
}

/** Abbreviated form (Gi0/1, Fa0/5) used in IOS table columns like "Ports". */
function shortIface(canon) {
  const m = String(canon || '').match(/^([a-z]+)(.*)$/)
  if (!m) return canon
  return `${IFACE_SHORT[m[1]] || m[1]}${m[2]}`
}

export function createDeviceState(hostname) {
  return {
    hostname,
    enableSecret: null,
    domainName: null,
    sshEnabled: false,
    serviceEncryption: false,
    users: {},
    interfaces: {},
    vlans: {},
    dhcpPools: {},
    dhcpExcluded: [],
    dhcpSnoopingEnabled: false,
    dhcpSnoopingVlans: [],
    dhcpBindings: [],
    arpInspectionVlans: [],
    staticRoutes: [],
    ospf: null,
    acls: {},
    natOverloadIface: null,
    natOverloadAcl: null,
    natStaticMaps: [],
    aaaNewModel: false,
    ntpServer: null,
    loggingHost: null,
    cdpEnabled: true,
    lldpEnabled: false,
    spanningTreeMode: 'pvst',
    stpRootVlans: {},
    lines: {},
  }
}

function ensureIface(state, canon) {
  if (!state.interfaces[canon]) {
    state.interfaces[canon] = {
      name: canon, description: null, ip: null, mask: null, secondaryIps: [],
      adminUp: false, switchportMode: null, accessVlan: 1, trunkAllowedVlans: null, nativeVlan: 1,
      channelGroup: null, channelMode: null,
      ipNatInside: false, ipNatOutside: false,
      accessGroupIn: null, accessGroupOut: null,
      helperAddress: null, portSecurity: null,
      dhcpSnoopingTrust: false, arpInspectionTrust: false,
      spanningTreePortfast: false, bpduGuard: false,
      ipDhcpClient: false, standby: {},
    }
  }
  return state.interfaces[canon]
}

function ensureVlan(state, id) {
  if (!state.vlans[id]) state.vlans[id] = { id, name: `VLAN${String(id).padStart(4, '0')}` }
  return state.vlans[id]
}

function ipToInt(ip) {
  const p = String(ip).split('.').map(Number)
  if (p.length !== 4 || p.some(n => Number.isNaN(n))) return null
  return ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0
}

function sameSubnet(ipA, mask, ipB) {
  const a = ipToInt(ipA), b = ipToInt(ipB), m = ipToInt(mask)
  if (a == null || b == null || m == null) return false
  return (a & m) === (b & m)
}

/* -------------------------------------------------------------------------
   Command handler buckets, grouped by the IOS mode they run in.
   ------------------------------------------------------------------------- */

const GLOBAL_HANDLERS = [
  { re: /^hostname (\S+)$/, run: (s, m) => { s.hostname = m[1]; return [] } },
  { re: /^enable (?:secret|password) (\S+)$/, run: (s, m) => { s.enableSecret = m[1]; return [] } },
  { re: /^service password-encryption$/, run: s => { s.serviceEncryption = true; return [] } },
  { re: /^ip domain-name (\S+)$/, run: (s, m) => { s.domainName = m[1]; return [] } },
  { re: /^crypto key generate rsa\b.*$/, run: s => {
    if (!s.domainName) return ['% Please define a domain-name first.']
    s.sshEnabled = true
    return ['The name for the keys will be: ' + s.hostname + '.' + s.domainName, '% The key modulus size is 1024 bits', '[OK]']
  } },
  { re: /^ip ssh version 2$/, run: s => { s.sshVersion = 2; return [] } },
  { re: /^username (\S+)(?: privilege (\d+))? (?:password|secret) (\S+)$/, run: (s, m) => { s.users[m[1]] = { privilege: m[2] ? Number(m[2]) : 1, secret: m[3] }; return [] } },
  { re: /^aaa new-model$/, run: s => { s.aaaNewModel = true; return [] } },
  { re: /^ip routing$/, run: s => { s.ipRouting = true; return [] } },
  { re: /^ipv6 unicast-routing$/, run: s => { s.ipv6Routing = true; return [] } },
  { re: /^no ip domain-lookup$/, run: s => { s.domainLookup = false; return [] } },
  { re: /^logging host (\S+)$/, run: (s, m) => { s.loggingHost = m[1]; return [] } },
  { re: /^service timestamps log datetime.*$/, run: s => { s.logTimestamps = true; return [] } },
  { re: /^ntp server (\S+)$/, run: (s, m) => { s.ntpServer = m[1]; return [] } },
  { re: /^(no )?cdp run$/, run: (s, m) => { s.cdpEnabled = !m[1]; return [] } },
  { re: /^lldp run$/, run: s => { s.lldpEnabled = true; return [] } },
  { re: /^spanning-tree mode (\S+)$/, run: (s, m) => { s.spanningTreeMode = m[1]; return [] } },
  { re: /^spanning-tree vlan (\d+) root (primary|secondary)$/, run: (s, m) => { ensureVlan(s, m[1]); s.stpRootVlans[m[1]] = m[2] === 'primary' ? 'primary' : 'secondary'; return [] } },
  { re: /^spanning-tree vlan (\d+) priority (\d+)$/, run: (s, m) => { ensureVlan(s, m[1]); if (Number(m[2]) < 32768) s.stpRootVlans[m[1]] = 'primary'; return [] } },
  { re: /^ip dhcp excluded-address (\S+) (\S+)$/, run: (s, m) => { s.dhcpExcluded.push([m[1], m[2]]); return [] } },
  { re: /^ip dhcp snooping$/, run: s => { s.dhcpSnoopingEnabled = true; return [] } },
  { re: /^ip dhcp snooping vlan ([\d,-]+)$/, run: (s, m) => { s.dhcpSnoopingVlans.push(m[1]); return [] } },
  { re: /^ip arp inspection vlan ([\d,-]+)$/, run: (s, m) => { s.arpInspectionVlans.push(m[1]); return [] } },
  { re: /^access-list (\d+) (permit|deny) (.+)$/, run: (s, m) => {
    const name = m[1]
    s.acls[name] ||= { type: Number(name) < 100 ? 'standard' : 'extended', rules: [] }
    s.acls[name].rules.push(`${m[2]} ${m[3]}`)
    return []
  } },
  { re: /^ip nat inside source list (\S+) interface (\S+) overload$/, run: (s, m) => { s.natOverloadAcl = m[1]; s.natOverloadIface = canonIface(m[2]); return [] } },
  { re: /^ip nat inside source list (\S+) pool (\S+) overload$/, run: (s, m) => { s.natOverloadAcl = m[1]; s.natOverloadPool = m[2]; return [] } },
  { re: /^ip nat inside source static (\S+) (\S+)$/, run: (s, m) => { s.natStaticMaps.push({ inside: m[1], outside: m[2] }); return [] } },
  { re: /^ip route (\d+\.\d+\.\d+\.\d+) (\d+\.\d+\.\d+\.\d+) (\S+)(?: (\d+))?$/, run: (s, m) => {
    s.staticRoutes.push({ network: m[1], mask: m[2], nextHop: m[3], ad: m[4] ? Number(m[4]) : 1 })
    return []
  } },
  { re: /^ipv6 route (\S+) (\S+)$/, run: (s, m) => { s.ipv6Routes ||= []; s.ipv6Routes.push({ network: m[1], nextHop: m[2] }); return [] } },
  { re: /^logging trap (\S+)$/, run: (s, m) => { s.loggingTrap = m[1]; return [] } },
  { re: /^aaa authentication login (\S+) (.+)$/, run: (s, m) => { s.aaaAuth ||= {}; s.aaaAuth[m[1]] = m[2]; return [] } },
  { re: /^snmp-server community (\S+) (ro|rw)$/, run: (s, m) => { s.snmpCommunities ||= []; s.snmpCommunities.push({ name: m[1], mode: m[2] }); return [] } },
  { re: /^snmp-server contact (.+)$/, run: (s, m) => { s.snmpContact = m[1]; return [] } },
  { re: /^snmp-server location (.+)$/, run: (s, m) => { s.snmpLocation = m[1]; return [] } },
  { re: /^snmp-server host (\S+) version (\S+) (\S+)$/, run: (s, m) => { s.snmpHosts ||= []; s.snmpHosts.push({ host: m[1], version: m[2], community: m[3] }); return [] } },
]

const IFACE_HANDLERS = [
  { re: /^description (.+)$/, run: (s, m, t) => { ensureIface(s, t.name).description = m[1]; return [] } },
  { re: /^ip address (\d+\.\d+\.\d+\.\d+) (\d+\.\d+\.\d+\.\d+)( secondary)?$/, run: (s, m, t) => {
    const i = ensureIface(s, t.name)
    if (m[3]) i.secondaryIps.push({ ip: m[1], mask: m[2] })
    else { i.ip = m[1]; i.mask = m[2] }
    return []
  } },
  { re: /^ip address dhcp$/, run: (s, m, t) => { ensureIface(s, t.name).ipDhcpClient = true; return [] } },
  { re: /^no ip address$/, run: (s, m, t) => { const i = ensureIface(s, t.name); i.ip = null; i.mask = null; return [] } },
  { re: /^(no )?shutdown$/, run: (s, m, t) => {
    const i = ensureIface(s, t.name)
    i.adminUp = !!m[1]
    const disp = displayIface(t.name)
    if (i.adminUp) return [`%LINK-3-UPDOWN: Interface ${disp}, changed state to up`, `%LINEPROTO-5-UPDOWN: Line protocol on Interface ${disp}, changed state to up`]
    return [`%LINK-3-UPDOWN: Interface ${disp}, changed state to down`]
  } },
  { re: /^switchport mode (access|trunk)$/, run: (s, m, t) => { ensureIface(s, t.name).switchportMode = m[1]; return [] } },
  { re: /^switchport access vlan (\d+)$/, run: (s, m, t) => { ensureVlan(s, m[1]); ensureIface(s, t.name).accessVlan = Number(m[1]); return [] } },
  { re: /^switchport trunk allowed vlan (\S+)$/, run: (s, m, t) => { ensureIface(s, t.name).trunkAllowedVlans = m[1].split(','); return [] } },
  { re: /^switchport trunk native vlan (\d+)$/, run: (s, m, t) => { ensureIface(s, t.name).nativeVlan = Number(m[1]); return [] } },
  { re: /^channel-group (\d+) mode (active|passive|on|auto|desirable)$/, run: (s, m, t) => { const i = ensureIface(s, t.name); i.channelGroup = Number(m[1]); i.channelMode = m[2]; return [] } },
  { re: /^ip helper-address (\S+)$/, run: (s, m, t) => { ensureIface(s, t.name).helperAddress = m[1]; return [] } },
  { re: /^ip nat (inside|outside)$/, run: (s, m, t) => { const i = ensureIface(s, t.name); i[m[1] === 'inside' ? 'ipNatInside' : 'ipNatOutside'] = true; return [] } },
  { re: /^ip access-group (\S+) (in|out)$/, run: (s, m, t) => { const i = ensureIface(s, t.name); i[m[2] === 'in' ? 'accessGroupIn' : 'accessGroupOut'] = m[1]; return [] } },
  { re: /^switchport port-security$/, run: (s, m, t) => { const i = ensureIface(s, t.name); i.portSecurity ||= { maxMac: 1, violation: 'shutdown', sticky: false }; return [] } },
  { re: /^switchport port-security maximum (\d+)$/, run: (s, m, t) => { const i = ensureIface(s, t.name); i.portSecurity ||= { maxMac: 1, violation: 'shutdown', sticky: false }; i.portSecurity.maxMac = Number(m[1]); return [] } },
  { re: /^switchport port-security mac-address sticky$/, run: (s, m, t) => { const i = ensureIface(s, t.name); i.portSecurity ||= { maxMac: 1, violation: 'shutdown', sticky: false }; i.portSecurity.sticky = true; return [] } },
  { re: /^switchport port-security violation (shutdown|restrict|protect)$/, run: (s, m, t) => { const i = ensureIface(s, t.name); i.portSecurity ||= { maxMac: 1, violation: 'shutdown', sticky: false }; i.portSecurity.violation = m[1]; return [] } },
  { re: /^spanning-tree portfast$/, run: (s, m, t) => { ensureIface(s, t.name).spanningTreePortfast = true; return [] } },
  { re: /^spanning-tree bpduguard enable$/, run: (s, m, t) => { ensureIface(s, t.name).bpduGuard = true; return [] } },
  { re: /^ip dhcp snooping trust$/, run: (s, m, t) => { ensureIface(s, t.name).dhcpSnoopingTrust = true; return [] } },
  { re: /^ip arp inspection trust$/, run: (s, m, t) => { ensureIface(s, t.name).arpInspectionTrust = true; return [] } },
  { re: /^no cdp enable$/, run: (s, m, t) => { ensureIface(s, t.name).cdpEnabled = false; return [] } },
  { re: /^encapsulation dot1q (\d+)$/, run: (s, m, t) => { ensureIface(s, t.name).dot1q = Number(m[1]); return [] } },
  { re: /^standby (\d+) ip (\S+)$/, run: (s, m, t) => { const i = ensureIface(s, t.name); i.standby[m[1]] ||= {}; i.standby[m[1]].ip = m[2]; return [] } },
  { re: /^standby (\d+) priority (\d+)$/, run: (s, m, t) => { const i = ensureIface(s, t.name); i.standby[m[1]] ||= {}; i.standby[m[1]].priority = Number(m[2]); return [] } },
  { re: /^standby (\d+) preempt$/, run: (s, m, t) => { const i = ensureIface(s, t.name); i.standby[m[1]] ||= {}; i.standby[m[1]].preempt = true; return [] } },
  { re: /^ipv6 address (\S+)$/, run: (s, m, t) => { ensureIface(s, t.name).ipv6 = m[1]; return [] } },
  { re: /^(?:duplex|speed) (.+)$/, run: () => [] },
  { re: /^no switchport$/, run: (s, m, t) => { ensureIface(s, t.name).switchportMode = null; return [] } },
  { re: /^switchport trunk encapsulation dot1q$/, run: (s, m, t) => { ensureIface(s, t.name).trunkEncap = 'dot1q'; return [] } },
]

const VLAN_HANDLERS = [
  { re: /^name (\S+)$/, run: (s, m, t) => { ensureVlan(s, t.name).name = m[1]; return [] } },
]

const ROUTER_HANDLERS = [
  { re: /^network (\S+) (\S+) area (\S+)$/, run: (s, m, t) => { s.ospf ||= { pid: t.name, networks: [], passive: [] }; s.ospf.networks.push({ network: m[1], wildcard: m[2], area: m[3] }); return [] } },
  { re: /^router-id (\S+)$/, run: (s, m, t) => { s.ospf ||= { pid: t.name, networks: [], passive: [] }; s.ospf.routerId = m[1]; return [] } },
  { re: /^passive-interface (.+)$/, run: (s, m, t) => { s.ospf ||= { pid: t.name, networks: [], passive: [] }; s.ospf.passive.push(canonIface(m[1])); return [] } },
  { re: /^default-information originate$/, run: (s, m, t) => { s.ospf ||= { pid: t.name, networks: [], passive: [] }; s.ospf.defaultOriginate = true; return [] } },
]

const DHCP_HANDLERS = [
  { re: /^network (\S+) (\S+)$/, run: (s, m, t) => { (s.dhcpPools[t.name] ||= {}).network = m[1]; s.dhcpPools[t.name].mask = m[2]; return [] } },
  { re: /^default-router (\S+)$/, run: (s, m, t) => { (s.dhcpPools[t.name] ||= {}).defaultRouter = m[1]; return [] } },
  { re: /^dns-server (\S+)$/, run: (s, m, t) => { (s.dhcpPools[t.name] ||= {}).dnsServer = m[1]; return [] } },
  { re: /^domain-name (\S+)$/, run: (s, m, t) => { (s.dhcpPools[t.name] ||= {}).domainName = m[1]; return [] } },
  { re: /^lease (\d+)(?: (\d+))?(?: (\d+))?$/, run: (s, m, t) => { (s.dhcpPools[t.name] ||= {}).lease = [m[1], m[2], m[3]].filter(Boolean).join(' '); return [] } },
]

const LINE_HANDLERS = [
  { re: /^password (\S+)$/, run: (s, m, t) => { (s.lines[t.name] ||= {}).password = m[1]; return [] } },
  { re: /^login$/, run: (s, m, t) => { (s.lines[t.name] ||= {}).login = 'password'; return [] } },
  { re: /^login local$/, run: (s, m, t) => { (s.lines[t.name] ||= {}).login = 'local'; return [] } },
  { re: /^login authentication (\S+)$/, run: (s, m, t) => { (s.lines[t.name] ||= {}).loginAuthentication = m[1]; return [] } },
  { re: /^transport input (\S+)$/, run: (s, m, t) => { (s.lines[t.name] ||= {}).transportInput = m[1]; return [] } },
  { re: /^exec-timeout (\d+) (\d+)$/, run: () => [] },
  { re: /^access-class (\S+) in$/, run: (s, m, t) => { (s.lines[t.name] ||= {}).accessClassIn = m[1]; return [] } },
]

const ACL_HANDLERS = [
  { re: /^(permit|deny) (.+)$/, run: (s, m, t) => { (s.acls[t.name] ||= { type: 'extended', rules: [] }).rules.push(`${m[1]} ${m[2]}`); return [] } },
]

const EXEC_HANDLERS = [
  { re: /^copy (?:running-config|run) (?:startup-config|start)$/, run: () => ['Building configuration...', '[OK]'] },
  { re: /^write(?: memory)?$/, run: () => ['Building configuration...', '[OK]'] },
]

const BUCKETS = {
  global: { modes: ['config'], handlers: GLOBAL_HANDLERS, label: "global config — type 'configure terminal'" },
  interface: { modes: ['config-if'], handlers: IFACE_HANDLERS, label: "interface config — e.g. 'interface gi0/1'" },
  vlan: { modes: ['config-vlan'], handlers: VLAN_HANDLERS, label: "VLAN config — e.g. 'vlan 20'" },
  router: { modes: ['config-router'], handlers: ROUTER_HANDLERS, label: "router config — e.g. 'router ospf 1'" },
  dhcp: { modes: ['config-dhcp'], handlers: DHCP_HANDLERS, label: "DHCP pool config — e.g. 'ip dhcp pool LAN'" },
  line: { modes: ['config-line'], handlers: LINE_HANDLERS, label: "line config — e.g. 'line vty 0 4'" },
  acl: { modes: ['config-acl'], handlers: ACL_HANDLERS, label: "named ACL config — e.g. 'ip access-list extended NAME'" },
  exec: { modes: ['user', 'priv'], handlers: EXEC_HANDLERS, label: 'privileged EXEC' },
}

/**
 * Try to apply `norm` as a recognized IOS command for the current mode.
 * Returns { matched:false } when nothing in our command surface recognizes
 * it — the caller should fall back to its own generic syntax-error path.
 */
export function applyConfigCommand({ state, norm, mode, target }) {
  const currentEntry = Object.entries(BUCKETS).find(([, b]) => b.modes.includes(mode))
  if (currentEntry) {
    const [, bucket] = currentEntry
    for (const h of bucket.handlers) {
      const m = norm.match(h.re)
      if (m) return { matched: true, modeOk: true, lines: h.run(state, m, target) || [] }
    }
  }
  for (const [key, bucket] of Object.entries(BUCKETS)) {
    if (bucket.modes.includes(mode)) continue
    for (const h of bucket.handlers) {
      if (h.re.test(norm)) return { matched: true, modeOk: false, label: bucket.label, key }
    }
  }
  return { matched: false }
}

/* -------------------------------------------------------------------------
   Dynamic `show` rendering — built from device state, not canned strings.
   ------------------------------------------------------------------------- */

function fmtVlanList(iface) {
  if (!iface.trunkAllowedVlans) return 'ALL'
  return iface.trunkAllowedVlans.join(',')
}

const SHOW_HANDLERS = [
  { re: /^show (?:running-config|run)$/, run: s => {
    const lines = [`hostname ${s.hostname}`]
    if (s.enableSecret) lines.push(`enable secret ${s.enableSecret}`)
    for (const [name, u] of Object.entries(s.users)) lines.push(`username ${name} privilege ${u.privilege} secret ${u.secret}`)
    for (const [name, i] of Object.entries(s.interfaces)) {
      lines.push(`!`, `interface ${displayIface(name)}`)
      if (i.description) lines.push(` description ${i.description}`)
      if (i.switchportMode) lines.push(` switchport mode ${i.switchportMode}`)
      if (i.switchportMode === 'access') lines.push(` switchport access vlan ${i.accessVlan}`)
      if (i.switchportMode === 'trunk') lines.push(` switchport trunk allowed vlan ${fmtVlanList(i)}`)
      if (i.ip) lines.push(` ip address ${i.ip} ${i.mask}`)
      if (i.ipNatInside) lines.push(' ip nat inside')
      if (i.ipNatOutside) lines.push(' ip nat outside')
      lines.push(i.adminUp ? ' no shutdown' : ' shutdown')
    }
    for (const [id, v] of Object.entries(s.vlans)) lines.push('!', `vlan ${id}`, ` name ${v.name}`)
    if (s.ospf) {
      lines.push('!', `router ospf ${s.ospf.pid}`)
      if (s.ospf.routerId) lines.push(` router-id ${s.ospf.routerId}`)
      s.ospf.networks.forEach(n => lines.push(` network ${n.network} ${n.wildcard} area ${n.area}`))
    }
    for (const r of s.staticRoutes) lines.push(`ip route ${r.network} ${r.mask} ${r.nextHop}`)
    lines.push('end')
    return lines
  } },
  { re: /^show ip interface brief$/, run: s => {
    const rows = ['Interface              IP-Address      OK? Method Status                Protocol']
    for (const [name, i] of Object.entries(s.interfaces)) {
      const ip = i.ip || 'unassigned'
      const status = i.adminUp ? (i.ip || i.switchportMode ? 'up' : 'up') : 'administratively down'
      const proto = i.adminUp ? 'up' : 'down'
      rows.push(`${displayIface(name).padEnd(23)}${ip.padEnd(16)}YES manual ${status.padEnd(22)}${proto}`)
    }
    return rows
  } },
  { re: /^show vlan brief$/, run: s => {
    const rows = ['VLAN Name                             Status    Ports', '---- -------------------------------- --------- -------------------------------']
    const byVlan = {}
    for (const [name, i] of Object.entries(s.interfaces)) {
      if (i.switchportMode !== 'trunk' && (i.switchportMode === 'access' || i.accessVlan !== 1)) (byVlan[i.accessVlan] ||= []).push(shortIface(name))
    }
    const ids = new Set([1, ...Object.keys(s.vlans).map(Number), ...Object.keys(byVlan).map(Number)])
    for (const id of [...ids].sort((a, b) => a - b)) {
      const v = s.vlans[id] || { name: id === 1 ? 'default' : `VLAN${String(id).padStart(4, '0')}` }
      rows.push(`${String(id).padEnd(5)}${v.name.padEnd(33)}active    ${(byVlan[id] || []).join(', ')}`)
    }
    return rows
  } },
  { re: /^show interfaces trunk$/, run: s => {
    const rows = ['Port        Mode             Encapsulation  Status        Native vlan']
    for (const [name, i] of Object.entries(s.interfaces)) {
      if (i.switchportMode !== 'trunk') continue
      rows.push(`${shortIface(name).padEnd(12)}on               802.1q         trunking      ${i.nativeVlan}`)
    }
    if (rows.length === 1) rows.push('(no trunk ports configured)')
    return rows
  } },
  { re: /^show etherchannel summary$/, run: s => {
    const groups = {}
    for (const [name, i] of Object.entries(s.interfaces)) {
      if (i.channelGroup == null) continue
      (groups[i.channelGroup] ||= []).push(shortIface(name))
    }
    if (!Object.keys(groups).length) return ['(no channel groups configured)']
    const rows = ['Group  Port-channel  Protocol    Ports', '------+-------------+-----------+-----------------------------']
    for (const [g, ports] of Object.entries(groups)) rows.push(`${g}      Po${g}(SU)         LACP      ${ports.map(p => `${p}(P)`).join('   ')}`)
    return rows
  } },
  { re: /^show ip route(?: (static|ospf))?$/, run: (s, m) => {
    const filter = m[1]
    const rows = ['Codes: L - local, C - connected, S - static, O - OSPF', 'Gateway of last resort is not set', '']
    if (!filter) {
      for (const i of Object.values(s.interfaces)) {
        if (i.ip && i.adminUp) rows.push(`C       ${i.ip}/${maskToCidr(i.mask)} is directly connected, ${displayIface(i.name)}`)
      }
    }
    if (!filter || filter === 'static') {
      for (const r of s.staticRoutes) rows.push(`S       ${r.network} [${r.ad ?? 1}/0] via ${r.nextHop}`)
    }
    if (filter === 'ospf' && !s.ospf) rows.push('(no OSPF routes learned yet)')
    return rows
  } },
  { re: /^show ip interface (\S+)$/, run: (s, m) => {
    const i = s.interfaces[canonIface(m[1])]
    if (!i) return [`${displayIface(canonIface(m[1]))} is administratively down, line protocol is down`, '  Internet protocol processing disabled']
    const rows = [`${displayIface(i.name)} is ${i.adminUp ? 'up' : 'administratively down'}, line protocol is ${i.adminUp ? 'up' : 'down'}`]
    rows.push(`  Internet address is ${i.ip ? `${i.ip}/${maskToCidr(i.mask)}` : 'unassigned'}`)
    if (i.accessGroupIn) rows.push(`  Outgoing access list is not set`, `  Inbound  access list is ${i.accessGroupIn}`)
    else rows.push('  Outgoing access list is not set', '  Inbound  access list is not set')
    if (i.helperAddress) rows.push(`  Helper address is ${i.helperAddress}`)
    return rows
  } },
  { re: /^show running-config interface (\S+)$/, run: (s, m) => {
    const i = s.interfaces[canonIface(m[1])]
    if (!i) return [`% interface ${displayIface(canonIface(m[1]))} not configured`]
    const rows = [`interface ${displayIface(i.name)}`]
    if (i.description) rows.push(` description ${i.description}`)
    if (i.switchportMode) rows.push(` switchport mode ${i.switchportMode}`)
    if (i.switchportMode === 'access') rows.push(` switchport access vlan ${i.accessVlan}`)
    if (i.ip) rows.push(` ip address ${i.ip} ${i.mask}`)
    if (i.accessGroupIn) rows.push(` ip access-group ${i.accessGroupIn} in`)
    if (i.accessGroupOut) rows.push(` ip access-group ${i.accessGroupOut} out`)
    rows.push(i.adminUp ? ' no shutdown' : ' shutdown')
    rows.push('end')
    return rows
  } },
  { re: /^show running-config \| section (.+)$/, run: (s, m) => {
    const full = SHOW_HANDLERS[0].run(s)
    const needle = m[1].toLowerCase()
    const startIdx = full.findIndex(l => l.toLowerCase().includes(needle))
    if (startIdx === -1) return [`(no running-config lines match "${m[1]}")`]
    const out = [full[startIdx]]
    for (let i = startIdx + 1; i < full.length && full[i].startsWith(' '); i++) out.push(full[i])
    return out
  } },
  { re: /^show ip dhcp binding$/, run: s => {
    if (!s.dhcpBindings.length) return ['(no bindings)']
    return ['IP address       Client-ID/Hardware address       Lease expiration        Type', ...s.dhcpBindings.map(b => `${b.ip.padEnd(18)}${b.client.padEnd(33)}Automatic`)]
  } },
  { re: /^show ip dhcp snooping binding$/, run: s => {
    const bound = s.dhcpBindings.filter(b => s.dhcpSnoopingEnabled)
    if (!bound.length) return ['MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface', '(no bindings — enable DHCP snooping and let a client lease an address)']
    return ['MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface', ...bound.map(b => `${b.client.padEnd(20)}${b.ip.padEnd(17)}86400       dhcp-snooping  1     ${b.iface || ''}`)]
  } },
  { re: /^show ip arp inspection$/, run: s => {
    if (!s.arpInspectionVlans.length) return ['Source Mac Validation      : Disabled', 'Destination Mac Validation : Disabled', 'IP Address Validation      : Disabled', '', 'Vlan     Configuration Mode     Operation State', '----     -------------------    ---------------', '(DAI not enabled on any VLAN)']
    const rows = ['Vlan     Configuration Mode     Operation State', '----     -------------------    ---------------']
    s.arpInspectionVlans.forEach(v => rows.push(`${v.padEnd(9)}Enabled                 Active`))
    return rows
  } },
  { re: /^show ip arp inspection interfaces$/, run: s => {
    const rows = ['Interface        Trust State     Rate (pps)']
    for (const [name, i] of Object.entries(s.interfaces)) rows.push(`${displayIface(name).padEnd(17)}${i.arpInspectionTrust ? 'Trusted' : 'Untrusted'.padEnd(16)}unlimited`)
    return rows
  } },
  { re: /^show access-lists?(?: (\S+))?$/, run: (s, m) => {
    const only = m[1]
    const entries = Object.entries(s.acls).filter(([name]) => !only || name === only)
    if (!entries.length) return ['(no access lists configured)']
    const rows = []
    for (const [name, acl] of entries) {
      rows.push(`${acl.type === 'standard' ? 'Standard' : 'Extended'} IP access list ${name}`)
      acl.rules.forEach((r, i) => rows.push(`    ${i + 1} ${r}`))
    }
    return rows
  } },
  { re: /^show port-security(?: interface (\S+))?$/, run: (s, m) => {
    const target = m[1] ? canonIface(m[1]) : null
    const rows = ['Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action']
    for (const [name, i] of Object.entries(s.interfaces)) {
      if (!i.portSecurity) continue
      if (target && name !== target) continue
      rows.push(`${shortIface(name).padEnd(13)}${String(i.portSecurity.maxMac).padEnd(15)}${String(i.portSecurity.sticky ? 1 : 0).padEnd(13)}0                  ${i.portSecurity.violation}`)
    }
    if (rows.length === 1) rows.push('(port-security not enabled on any interface)')
    return rows
  } },
  { re: /^show spanning-tree(?: vlan (\d+))?$/, run: (s, m) => {
    const vlan = m[1] || '1'
    ensureVlan(s, vlan)
    const role = s.stpRootVlans[vlan]
    const rows = [`VLAN${String(vlan).padStart(4, '0')}`, '  Spanning tree enabled protocol ' + (s.spanningTreeMode === 'rapid-pvst' ? 'rstp' : 'ieee')]
    if (role) rows.push('  Root ID    Priority    ' + (role === 'primary' ? '24576 (this bridge is the root)' : '28672'))
    else rows.push('  Root ID    Priority    32768 (root not claimed by this bridge)')
    return rows
  } },
  { re: /^show spanning-tree root$/, run: s => {
    const rows = ['Vlan                 Root ID     Cost    Hello Max Fwd Dly  Root Port']
    const ids = new Set([1, ...Object.keys(s.vlans).map(Number)])
    for (const id of [...ids].sort((a, b) => a - b)) {
      const role = s.stpRootVlans[id]
      rows.push(`VLAN${String(id).padStart(4, '0')}       ${role ? '(this bridge)' : '32768'.padEnd(13)}    19      2    20  15        ${role ? '-' : 'Gi0/1'}`)
    }
    return rows
  } },
  { re: /^show spanning-tree interface (\S+) portfast$/, run: (s, m) => {
    const i = s.interfaces[canonIface(m[1])]
    if (!i) return [`% interface ${displayIface(canonIface(m[1]))} not configured`]
    return [`${displayIface(i.name)} Portfast: ${i.spanningTreePortfast ? 'enabled' : 'disabled'} (default)`]
  } },
  { re: /^show standby brief$/, run: s => {
    const rows = ['Interface   Grp  Pri P State   Active          Standby         Virtual IP']
    for (const [name, i] of Object.entries(s.interfaces)) {
      for (const [g, st] of Object.entries(i.standby || {})) {
        rows.push(`${shortIface(name).padEnd(12)}${g.padEnd(5)}${String(st.priority ?? 100).padEnd(4)}${st.preempt ? 'P' : ' '} ${(st.priority ?? 100) >= 150 ? 'Active' : 'Standby'}         local           local           ${st.ip || ''}`)
      }
    }
    if (rows.length === 1) rows.push('(no HSRP groups configured)')
    return rows
  } },
  { re: /^show ip nat translations$/, run: s => {
    if (!s.natOverloadIface && !s.natStaticMaps.length) return ['(no translations — configure NAT overload or a static map, then ping through it)']
    const rows = ['Pro Inside global      Inside local       Outside local      Outside global']
    s.natStaticMaps.forEach(m => rows.push(`--- ${m.outside.padEnd(18)}${m.inside.padEnd(19)}${m.inside.padEnd(19)}${m.outside}`))
    if (s.natOverloadIface) rows.push(`tcp ${(s.interfaces[s.natOverloadIface]?.ip || 'outside-ip')}:1024   inside-host:1024   dest:80            dest:80`)
    return rows
  } },
]

export function renderShow(norm, { state }) {
  for (const h of SHOW_HANDLERS) {
    const m = norm.match(h.re)
    if (m) return h.run(state, m)
  }
  return null
}

function maskToCidr(mask) {
  const n = ipToInt(mask)
  if (n == null) return '24'
  return String(n.toString(2).split('1').length - 1)
}

/* -------------------------------------------------------------------------
   Cross-device effects: DHCP lease resolution and ping reachability.
   ------------------------------------------------------------------------- */

export function resolveDhcpClient(allStates, clientKey, ifaceCanon) {
  for (const [ownerKey, owner] of Object.entries(allStates)) {
    if (ownerKey === clientKey) continue
    const pool = Object.values(owner.dhcpPools)[0]
    if (!pool?.network) continue
    const base = ipToInt(pool.network)
    const leased = `${(base + 10) >>> 24 & 255}.${(base + 10) >>> 16 & 255}.${(base + 10) >>> 8 & 255}.${(base + 10) & 255}`
    const client = ensureIface(allStates[clientKey], ifaceCanon)
    client.ip = leased
    client.mask = pool.mask
    owner.dhcpBindings.push({ ip: leased, client: `${clientKey}-${ifaceCanon}`, iface: displayIface(ifaceCanon) })
    return leased
  }
  return null
}

const LAB_PING_RULES = {
  'LAB-DAI-DHCP-SNOOPING': ({ deviceKey, allStates }) => {
    if (deviceKey !== 'Attacker') return null
    const sw = Object.values(allStates).find(s => Object.keys(s.arpInspectionVlans || {}).length || s.arpInspectionVlans?.length)
    return sw?.arpInspectionVlans?.length ? 'fail' : null
  },
  'LAB-NAT-PAT': ({ allStates }) => {
    const r1 = Object.values(allStates).find(s => s.natOverloadIface)
    if (!r1) return 'fail'
    const acl = r1.acls[r1.natOverloadAcl]
    const aclOk = acl?.rules.some(r => /^permit 192\.168\.1\.0 0\.0\.0\.255$/.test(r))
    const outsideIface = r1.interfaces[r1.natOverloadIface]
    const insideOk = Object.values(r1.interfaces).some(i => i.ipNatInside)
    return aclOk && outsideIface?.ipNatOutside && insideOk ? 'pass' : 'fail'
  },
}

export function simulatePing({ target, deviceKey, allStates, labId }) {
  const echo = [`Sending 5, 100-byte ICMP Echos to ${target}, timeout is 2 seconds:`]
  const override = LAB_PING_RULES[labId]?.({ deviceKey, allStates })
  if (override === 'fail') return [...echo, '.....', 'Success rate is 0 percent (0/5)']
  if (override === 'pass') return [...echo, '!!!!!', 'Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/4 ms']

  const srcState = allStates[deviceKey]
  const touched = Object.keys(srcState?.interfaces || {}).length > 0
  const srcUp = !touched || Object.values(srcState.interfaces).some(i => i.adminUp && i.ip)
  if (!srcUp) return ['% No valid source interface — configure an IP address and "no shutdown" first.']

  let reachable = false
  for (const st of Object.values(allStates)) {
    for (const i of Object.values(st.interfaces)) {
      if (!i.ip || !i.adminUp) continue
      if (i.ip === target || sameSubnet(i.ip, i.mask, target)) { reachable = true; break }
    }
    if (reachable) break
  }
  if (reachable) return [...echo, '!!!!!', 'Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/4 ms']
  return [...echo, '.....', 'Success rate is 0 percent (0/5)']
}
