#!/usr/bin/env node
/** Generate tierBTrapWave20Patches.js — +1 trap per objective (avg 10→11). */
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ALL_OBJECTIVES } from '../src/data/ccnaDomains.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const W20 = [
  ['Access-layer switches never run any form of routing on CCNA designs.', '**Layer 3 access** / SVIs appear in modern designs — know when **routing** leaves the core.'],
  ['A spine-leaf fabric requires Spanning Tree to block half the links.', '**Spine-leaf** is **ECMP L3** — STP is not the primary loop control.'],
  ['Multimode fiber uses a single mode of light for 40 km WAN links.', '**MMF** is for **short** reach; **SMF** for long distance.'],
  ['Input errors always mean the local cable is fine and the peer is dead.', '**Input errors** implicate **local interface**, cable, or duplex — start with **show interfaces**.'],
  ['When a MAC ages out, the switch permanently blackholes that destination.', 'Aged MAC → next frame is **unknown unicast flood** until relearned.'],
  ['A /30 point-to-point link provides 30 usable host addresses.', '**/30** = **2 usable** hosts (4 addresses − network − broadcast).'],
  ['Private addresses can be advertised to the Internet if reverse DNS exists.', '**RFC 1918** stays private — **NAT** or public addressing required externally.'],
  ['IPv6 requires NAT to connect two enterprise sites with unique locals.', '**ULA** can be routed privately; Internet still needs **global unicast** or **NAT66** design choices.'],
  ['Solicited-node multicast replaces Neighbor Discovery entirely.', '**Solicited-node** is part of **ND** — not a replacement for Neighbor Discovery.'],
  ['DNS resolution failure never affects ICMP reachability to a known IP.', 'Ping by IP bypasses DNS — but apps using names still fail; separate **DNS vs IP** faults.'],
  ['2.4 GHz channels never overlap in a dense office deployment.', 'Adjacent **2.4 GHz** channels (1/6/11) — wrong spacing causes **co-channel** interference.'],
  ['Live migration of VMs never requires coordinated storage and network fabrics.', '**vMotion**-class moves need **reachable networks** and shared/reachable storage.'],
  ['VLAN pruning removes VLANs from the switch VLAN database permanently.', '**Pruning** limits **trunk allowed lists** — VLANs remain in the **database**.'],
  ['DTP auto/auto always forms a trunk on Cisco switches.', '**auto/auto** may stay **access** — use **desirable/on** or **static trunk** for certainty.'],
  ['CDP works only across routed Layer 3 hops.', '**CDP/LLDP** are **L2** neighbor discovery on the **same link**.'],
  ['An EtherChannel hash guarantees perfect load balance for every single flow.', 'Hash is **flow-level** — one elephant flow can still pin to one link.'],
  ['PortFast is required on every uplink trunk between distribution switches.', '**PortFast** is for **edge/access** ports — trunks participate in STP properly.'],
  ['Lightweight APs store the full WLAN SSID list offline forever without CAPWAP.', 'Without **WLC/CAPWAP**, lightweight APs lose centralized **SSID/policy** control.'],
  ['Beacon frames leave WPA2 group keys in cleartext on open management frames.', 'Know **802.11 management** vs **encrypted data** — exams test **WPA2 handshake** concepts.'],
  ['Admin distance of OSPF is always lower than EIGRP on Cisco routers.', 'Default **AD**: EIGRP **90**, OSPF **110** — EIGRP preferred if both present.'],
  ['Equal-cost multipath ignores interface bandwidth differences entirely.', 'ECMP requires **equal metric** — unequal bandwidths may not load-share without design.'],
  ['OSPF areas must all use the same process ID everywhere in the AS.', '**Process ID** is **local** — **area ID** must match for adjacency.'],
  ['A discard/null0 route means the packet is punted to CPU for NAT.', '**Null0** is **blackhole** — intentional drop for loop prevention/summaries.'],
  ['Floating static with AD 1 replaces a linked OSPF route while OSPF is up.', 'Floating backup needs **higher AD** than the primary active route.'],
  ['Preemption in HSRP always causes outage lasting several minutes.', 'Well-tuned **timers/preempt delay** limits disruption — understand **failover window**.'],
  ['show ip route missing next-hop always means the interface is up/up.', 'Missing routes can be **admin distance**, **filter**, or **WPAN** recursion failure.'],
  ['ip nat inside source static requires PAT overload keywords.', '**Static NAT** is 1:1 without overload — **overload** is for **PAT**.'],
  ['Clearing NAT translations never affects established TCP sessions exam scenarios.', 'Clearing **translations** can **reset** sessions mid-flow — know operational impact.'],
  ['An NTP client with stratum 16 is tightly synced to GPS.', '**Stratum 16** = **unsynchronized**.'],
  ['DHCP snooping rate-limit is unused once Option 82 is disabled.', '**Rate-limit** still protects untrusted ports from **DHCP flood**.'],
  ['SNMPv3 noAuthNoPriv is recommended for Internet-facing devices.', 'Prefer **authPriv** — noAuthNoPriv is weak for production.'],
  ['Syslog severity debugging should be permanent on WAN edge devices.', '**Debug** floods links/CPU — use **informational/notifications** for ops.'],
  ['ip helper-address is only for BootP — DHCP uses a separate Cisco feature.', '**ip helper-address** relays **DHCP** (and other UDP) broadcasts.'],
  ['Traffic marked AF41 never needs policing at congestion points.', '**AF** classes still need **queue/policer** design under congestion.'],
  ['SSH version 1 is preferred because it supports stronger ciphers on CCNA gear.', 'Use **SSH v2** — v1 is obsolete/insecure.'],
  ['FTP always encrypts credentials in transit by default.', 'Plain **FTP** is cleartext — **FTPS/SFTP** provide protection.'],
  ['On-prem controller management and cloud management use identical failure modes.', 'Cloud reachability vs local controller — different **outage domains**.'],
  ['Availability is not part of the CIA triad discussed on CCNA.', '**CIA** = Confidentiality, Integrity, **Availability**.'],
  ['Acceptable-use policy replaces the need for password complexity.', '**AUP** is policy — still implement **technical** password controls.'],
  ['aaa new-model is optional when using local VTY login only.', 'Many AAA features require **aaa new-model** — know exam prerequisites.'],
  ['RADIUS Accounting never logs command authorization results.', 'Know **AAA** facets: authN, authZ, **accounting** — mapping differs by protocol.'],
  ['Standard ACL placed closest to destination is the extended-ACL rule of thumb.', '**Extended** near **source**; **standard** near **destination** — classic placement.'],
  ['Named ACL sequence numbers cannot be resequenced on IOS.', 'IOS supports **resequence** for named ACLs — know edit workflows.'],
  ['Dynamic ARP Inspection validates DHCP packets only, never ARP.', '**DAI** inspects **ARP** using DHCP snooping/static bindings.'],
  ['Port security sticky MAC learns never survive a reload without saving.', 'Sticky entries need **running→startup** save to persist across reload.'],
  ['Site-to-site VPN and remote-access VPN use identical client software always.', '**Site-to-site**/gateway vs **remote-access**/client — different deployment models.'],
  ['Segmentation only applies at Layer 3 — VLANs are not segmentation.', '**VLANs** provide **L2** segmentation; VRFs/ACLs add more layers.'],
  ['Ansible cannot configure Cisco IOS devices without a local agent.', '**Ansible** is **agentless** (SSH/API) — common for **network** gear.'],
  ['Underlay and overlay are identical terms for campus fabric routing.', '**Underlay** = physical IP fabric; **overlay** = virtual networks (VXLAN etc.).'],
  ['REST DELETE is safe and never changes device state.', '**DELETE** mutates state — **GET** is the safe read method.'],
  ['DNA Assurance only stores syslog — never client issue insights.', '**Assurance** correlates **client/network** health beyond raw syslog dumps.'],
  ['Terraform is required to run any Ansible playbook against switches.', '**Ansible** and **Terraform** are independent tools — exam compares use cases.'],
  ['JSON null, false, and empty string are always identical in API payloads.', 'Know JSON **types**: null ≠ false ≠ "" — parsing matters for APIs.'],
]

function buildPatch(waveNum, pool) {
  const lines = [`/** Trap wave ${waveNum} — +1 trap per objective (53 at avg ${waveNum - 9} post-wave20 ≈11). */`, '', `export const TIER_B_TRAP_WAVE${waveNum}_PATCHES = {`]
  ALL_OBJECTIVES.forEach((obj, i) => {
    const [trap, fix] = pool[i % pool.length]
    const id = obj.id
    const cku = `CKU-${id.replace('.', '-')}`
    lines.push(`  '${id}': { examTraps: [{ id: '${id}-w${waveNum}-t1', trap: '${trap.replace(/'/g, "\\'")}', correction: '**${id}:** ${fix.replace(/'/g, "\\'")}', ckuIds: ["${cku}"] }] },`)
  })
  lines.push('}', '')
  return lines.join('\n')
}

if (W20.length !== 53) {
  console.error(`Expected 53 traps, got ${W20.length}`)
  process.exit(1)
}

writeFileSync(join(ROOT, 'src/data/tierBTrapWave20Patches.js'), buildPatch(20, W20))
console.log('✓ wrote tierBTrapWave20Patches.js')
