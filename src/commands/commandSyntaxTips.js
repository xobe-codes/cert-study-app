/** Mnemonics and syntax memory aids for Command Hub Syntax Coach. */

export const SYNTAX_TIP_CATEGORIES = [
  { id: 'modes', label: 'IOS modes', accent: 'purple' },
  { id: 'navigation', label: 'Navigation', accent: 'sky' },
  { id: 'verify', label: 'Show / verify', accent: 'mint' },
  { id: 'switching', label: 'VLAN & trunk', accent: 'amber' },
  { id: 'routing', label: 'Routing', accent: 'sky' },
  { id: 'services', label: 'NAT & DHCP', accent: 'mint' },
  { id: 'security', label: 'Security & ACL', accent: 'rose' },
]

export const SYNTAX_TIP_GROUPS = [
  {
    id: 'mode-ladder',
    category: 'modes',
    title: 'Mode ladder — climb down, exit up',
    mnemonic: 'USER → ENABLE → CONF T → sub-mode → exit/end',
    bullets: [
      'Privileged EXEC ends in # — run show commands here.',
      'Global config ends in (config)# — router, vlan, line commands start here.',
      'Sub-modes: (config-if)#, (config-router)#, (config-vlan)# — one level deeper.',
      'exit steps up one level; end jumps straight back to privileged EXEC from any config mode.',
    ],
    examples: ['Router> enable', 'Router# configure terminal', 'Router(config)# interface gi0/1', 'Router(config-if)# exit'],
  },
  {
    id: 'conf-t-int',
    category: 'navigation',
    title: 'conf t + int — the config entry pair',
    mnemonic: 'CONF T gets you in; INT gets you on the wire',
    bullets: [
      'configure terminal (conf t) is always from privileged EXEC (#).',
      'interface <name> (int gi0/1) is from global config — opens interface sub-mode.',
      'vlan <id> and line vty 0 15 open their own sub-modes the same way.',
      'Forgot which mode you are in? Read the prompt suffix: (config-if)# vs (config)#.',
    ],
    examples: ['conf t', 'int gi0/1', 'vlan 20', 'line vty 0 15'],
  },
  {
    id: 'show-shorthand',
    category: 'verify',
    title: 'show = verify — learn the big four first',
    mnemonic: 'Brief · Route · Neighbor · Running-config',
    bullets: [
      'show ip interface brief — L3 up/down at a glance (exam favorite).',
      'show ip route — codes C, S, O, D; always note admin distance in [brackets].',
      'show ip ospf neighbor — FULL/DR/BDR state before blaming routing.',
      'show running-config — what is actually active (startup-config may differ).',
      'IOS accepts sh as shorthand for show on most platforms.',
    ],
    examples: ['show ip interface brief', 'sh ip route', 'show ip ospf neighbor', 'show run | section router ospf'],
  },
  {
    id: 'interface-names',
    category: 'navigation',
    title: 'Interface shorthand — Gi, Fa, Po',
    mnemonic: 'Gigabit = Gi · Fast = Fa · Port-channel = Po',
    bullets: [
      'Exam simulators accept Gi0/1 as well as GigabitEthernet0/1.',
      'Port-channel interfaces use Po1, Po2 — configure members first with channel-group.',
      'Loopback and Serial: lo0, se0/0/0 — same interface <name> syntax.',
      'Range config: interface range gi0/1 - 2 saves repetition on switches.',
    ],
    examples: ['interface gi0/1', 'int fa0/5', 'interface port-channel 1', 'interface range gi0/1 - 2'],
  },
  {
    id: 'no-shut',
    category: 'modes',
    title: 'no shutdown — the silent killer',
    mnemonic: 'New interface? NO SHUT or it stays down',
    bullets: [
      'Interfaces default to administratively down after creation.',
      'no shutdown (no shut) is entered in interface config — not global.',
      'If show ip int brief shows administratively down, this is the first fix.',
      'Pair with ip address or switchport commands before expecting traffic.',
    ],
    examples: ['interface gi0/0', 'ip address 10.1.1.1 255.255.255.252', 'no shutdown'],
  },
  {
    id: 'vlan-trunk',
    category: 'switching',
    title: 'VLAN access vs trunk — two different verbs',
    mnemonic: 'ACCESS = one VLAN · TRUNK = tagged list + native',
    bullets: [
      'Access: switchport mode access → switchport access vlan <id>.',
      'Trunk: switchport mode trunk → native VLAN → allowed VLAN list.',
      'Native VLAN must match on both ends — mismatch = CDP warning + leakage risk.',
      'switchport nonegotiate disables DTP — static trunk only.',
    ],
    examples: ['switchport mode access', 'switchport access vlan 20', 'switchport mode trunk', 'switchport trunk allowed vlan 10,20,99'],
  },
  {
    id: 'static-ospf',
    category: 'routing',
    title: 'Static route vs OSPF network',
    mnemonic: 'Static: net mask next-hop · OSPF: net wildcard area',
    bullets: [
      'Static: ip route <network> <mask> <next-hop|exit-intf>.',
      'Default route: ip route 0.0.0.0 0.0.0.0 <next-hop>.',
      'OSPF: router ospf <pid> then network <addr> <wildcard> area <id>.',
      'Wildcard is inverse of mask: /24 → 0.0.0.255. Area 0 is backbone.',
    ],
    examples: ['ip route 192.168.30.0 255.255.255.0 10.0.0.2', 'router ospf 1', 'network 10.0.0.0 0.0.0.255 area 0'],
  },
  {
    id: 'nat-order',
    category: 'services',
    title: 'NAT inside/outside before overload',
    mnemonic: 'Mark INSIDE on LAN · OUTSIDE on WAN · then overload',
    bullets: [
      'ip nat inside / ip nat outside are interface commands — mark both first.',
      'PAT overload: ip nat inside source list <acl> interface <outside-if> overload.',
      'Verify with show ip nat translations — inside global/local columns.',
      'ACL number in list must permit traffic you intend to translate.',
    ],
    examples: ['ip nat inside', 'ip nat outside', 'ip nat inside source list 1 interface gi0/0 overload'],
  },
  {
    id: 'dhcp-pool',
    category: 'services',
    title: 'DHCP pool vs helper-address',
    mnemonic: 'POOL serves · HELPER relays',
    bullets: [
      'Server: ip dhcp pool <name> → network → default-router → dns-server.',
      'Relay: ip helper-address <server-ip> on the client-facing interface.',
      'Helper converts broadcast DHCP to unicast toward the server.',
      'Verify bindings: show ip dhcp binding; pool config: show run | section dhcp.',
    ],
    examples: ['ip dhcp pool LAN', 'network 192.168.1.0 255.255.255.0', 'default-router 192.168.1.1', 'ip helper-address 10.0.0.5'],
  },
  {
    id: 'acl-apply',
    category: 'security',
    title: 'Extended ACL — define then apply',
    mnemonic: 'NAME the ACL · PERMIT/DENY · access-group IN or OUT',
    bullets: [
      'ip access-list extended <NAME> — enter ACL sub-mode.',
      'Order matters: first match wins; implicit deny all at end.',
      'Apply on interface: ip access-group <NAME> in|out — direction is from router perspective.',
      'Standard ACL = source only; extended = protocol, source, destination, ports.',
    ],
    examples: ['ip access-list extended BLOCK_TELNET', 'deny tcp any any eq 23', 'permit ip any any', 'ip access-group BLOCK_TELNET in'],
  },
  {
    id: 'ssh-stack',
    category: 'security',
    title: 'SSH enable stack — order matters',
    mnemonic: 'Domain → Keys → User → VTY → transport ssh',
    bullets: [
      'ip domain-name <name> — required before crypto key generate rsa.',
      'crypto key generate rsa modulus 2048 — enables SSH server.',
      'username <name> privilege 15 secret <pass> — local database.',
      'line vty 0 15 → transport input ssh → login local.',
    ],
    examples: ['ip domain-name ccna.local', 'crypto key generate rsa modulus 2048', 'username admin secret Cisco123!', 'transport input ssh'],
  },
  {
    id: 'hsrp-standby',
    category: 'routing',
    title: 'HSRP — standby group ip',
    mnemonic: 'standby <grp> ip · priority · preempt',
    bullets: [
      'standby <group> ip <virtual-ip> — on every participating interface.',
      'priority above 100 + preempt makes a router prefer Active role.',
      'Verify: show standby brief — Active/Standby state and virtual MAC.',
      'Virtual IP must be unused on any physical interface.',
    ],
    examples: ['standby 1 ip 192.168.1.1', 'standby 1 priority 150', 'standby 1 preempt', 'show standby brief'],
  },
  {
    id: 'port-security',
    category: 'security',
    title: 'Port security — access port only',
    mnemonic: 'ACCESS mode → port-security → max → violation',
    bullets: [
      'switchport port-security requires switchport mode access first.',
      'maximum <n> limits learned MACs; sticky learns and retains.',
      'violation shutdown err-disables port — show interfaces status err-disabled.',
      'Recover: shut/no shut after fixing violation cause.',
    ],
    examples: ['switchport mode access', 'switchport port-security', 'switchport port-security maximum 2', 'switchport port-security violation shutdown'],
  },
]

export function filterSyntaxTips(categoryId = 'all') {
  if (!categoryId || categoryId === 'all') return SYNTAX_TIP_GROUPS
  return SYNTAX_TIP_GROUPS.filter(t => t.category === categoryId)
}
