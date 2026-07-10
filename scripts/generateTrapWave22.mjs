#!/usr/bin/env node
/** Generate tierBTrapWave22Patches.js — +1 trap per objective (avg 12→13). */
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ALL_OBJECTIVES } from '../src/data/ccnaDomains.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const W22 = [
  ['Access switches never need uplinks to more than one distribution switch.', '**Dual-homed access** is common for redundancy — know STP/EtherChannel roles on uplinks.'],
  ['Three-tier campus always requires a separate firewall at every access port.', '**Access** connects endpoints; **policy** usually sits at **distribution/edge**, not every port.'],
  ['Multimode fiber always outranges single-mode for campus backbones.', '**SMF** reaches farther; **MMF** is for shorter runs — match fiber to distance.'],
  ['Late collisions only happen on full-duplex Gigabit Ethernet.', '**Late collisions** scream **duplex mismatch** (often half vs full) — check both ends.'],
  ['A switch never floods a frame once any MAC is learned on any VLAN.', 'Flooding is **per-VLAN** — unknown unicast still floods within that VLAN.'],
  ['/29 always provides 30 usable hosts on every exam question.', '**/29** → **6** usable hosts; **/27** → **30**. Memorize block sizes.'],
  ['RFC 1918 private addresses are globally unique on the public Internet.', 'Private space is **not** Internet-routable — use **NAT/PAT** or public addressing.'],
  ['IPv6 requires NAT66 for every host to reach the Internet.', 'IPv6 often uses **global unicast** end-to-end — NAT66 is not mandatory like IPv4 NAT.'],
  ['Anycast and multicast are identical one-to-many delivery models.', '**Multicast** = many receivers; **anycast** = nearest of identical addresses.'],
  ['arp -a on Windows shows DNS server addresses.', '**arp -a** shows IP→MAC cache — use **`ipconfig /all`** for DNS.'],
  ['2.4 GHz channels 1, 2, and 3 are the non-overlapping set.', 'Non-overlapping (exam default) is **1, 6, 11** — adjacent channels overlap.'],
  ['Containers always include a full guest OS kernel like VMs.', '**Containers** share the **host kernel**; **VMs** run separate guest OS copies.'],
  ['Access ports must carry multiple VLANs tagged with 802.1Q.', '**Access** = one untagged VLAN; **trunk** carries multiple (tagged) VLANs.'],
  ['Native VLAN frames are always tagged with VLAN 1 on trunks.', '**Native VLAN** frames are **untagged** — mismatch causes VLAN hopping risk.'],
  ['CDP and LLDP use the same IEEE standard number.', '**CDP** is Cisco-proprietary; **LLDP** is **IEEE 802.1AB**.'],
  ['EtherChannel members can mix speeds if LACP is enabled.', 'Members need **same speed/duplex** and compatible VLAN/trunk settings.'],
  ['Root Guard and BPDU Guard are interchangeable on every edge port.', '**BPDU Guard** err-disables on BPDU; **Root Guard** prevents superior BPDUs becoming root.'],
  ['CAPWAP always switches client data locally at the AP.', '**Local mode** tunnels to WLC; **FlexConnect** can switch locally — know the mode.'],
  ['WPA3-Personal still uses a static WEP key shared in beacons.', '**WPA3** uses SAE — not WEP; beacons advertise SSID/security, not the PSK itself.'],
  ['Wireless controllers never need a management IP reachable from APs.', 'APs must reach the **WLC** (CAPWAP) — management reachability is required.'],
  ['Connected routes always lose to static routes with AD 1.', '**Connected AD 0** beats static **AD 1** — connected wins when both exist.'],
  ['Longest prefix match is ignored when administrative distances differ.', '**LPM first**, then AD, then metric — more specific prefix wins regardless of AD.'],
  ['Floating static routes use a lower AD than the primary path.', 'Floating backup uses a **higher AD** so it only installs when primary fails.'],
  ['OSPF areas must all use the same process ID on every router.', '**Process ID** is local; **area ID** must match for adjacency within the area.'],
  ['HSRP active router is always the one with the lowest priority.', 'Highest **priority** (and preempt rules) wins active — not lowest.'],
  ['show ip ospf neighbor Full always means the route is in the RIB.', '**Full** = adjacency; routes still need **LSA/SPF** and may be filtered by AD/ACL.'],
  ['Inside global is the private LAN address before NAT.', '**Inside local** = private; **inside global** = public after translation.'],
  ['NTP stratum 16 means the clock is a primary reference.', '**Stratum 16** = **unsynchronized**; low stratum (1–2) is better.'],
  ['DHCP clients must unicast Discover to the server IP first.', '**Discover** is broadcast; relay/`ip helper-address` forwards to the server.'],
  ['SNMPv3 authNoPriv encrypts the full payload like authPriv.', '**authNoPriv** authenticates only; **authPriv** adds encryption.'],
  ['Syslog severity 7 is more critical than severity 0.', '**0 = emergencies** (most severe); **7 = debugging** (least).'],
  ['ip helper-address is configured on the DHCP server interface.', 'Helper goes on the **client-facing** (relay) interface, not the server.'],
  ['EF DSCP marking alone creates LLQ queues on every hop.', 'Marking needs **policy-maps/queuing** configured where congestion occurs.'],
  ['SSH and Telnet both encrypt device management sessions.', '**SSH** encrypts; **Telnet** is cleartext — prefer SSH v2.'],
  ['copy tftp flash always verifies the image MD5 automatically.', 'Verify with **`verify /md5`** (or platform equivalent) after copy.'],
  ['Controller-based management removes the need for device reachability.', 'Controllers still need **reachability** and credentials to managed devices.'],
  ['Availability is optional in the CIA triad for CCNA.', '**CIA** = Confidentiality, Integrity, **Availability** — all three matter.'],
  ['Password complexity policies replace the need for AAA accounting.', '**AAA accounting** logs who did what — policy ≠ audit trail.'],
  ['Local username database cannot be used with VTY login local.', '**`login local`** uses the local user database — common CCNA pattern.'],
  ['RADIUS uses TCP 49 exclusively for authentication.', '**RADIUS** = **UDP 1812/1813**; **TACACS+** = **TCP 49**.'],
  ['Standard ACLs match on destination IP by default.', '**Standard** ACLs match **source** only — place near destination.'],
  ['Named ACLs cannot use sequence numbers for inserts.', '**Named** ACLs support **sequence numbers** / resequence for edits.'],
  ['Port security sticky MACs are always dynamic-only and never saved.', 'Sticky MACs can be written to running-config — **save** to survive reload.'],
  ['Dynamic ARP Inspection trusts all access ports by default.', '**Untrusted** access ports are inspected; mark **uplinks** trusted carefully.'],
  ['Site-to-site VPN requires a software client on every PC.', '**Site-to-site** is gateway-to-gateway; **remote-access** uses clients.'],
  ['VRFs only exist on wireless controllers, not routers/switches.', '**VRF** separates L3 tables on routers/L3 switches — common segmentation tool.'],
  ['Ansible requires an agent on every managed network device.', '**Ansible** is typically **agentless** (SSH/API) — contrast Puppet/Chef agents.'],
  ['Underlay and overlay are the same network in VXLAN designs.', '**Underlay** = L3 transport; **overlay** = VXLAN tunnels carrying L2 segments.'],
  ['REST GET requests commonly create new resources on the server.', '**GET** reads; **POST/PUT/PATCH** create/update — know safe methods.'],
  ['DNA Center Assurance replaces the need for SNMP entirely.', 'Assurance **adds** correlation — SNMP/telemetry may still feed monitoring.'],
  ['Terraform apply never needs a prior plan in team workflows.', '**plan** then **apply** is the safe workflow — review changes before apply.'],
  ['YAML indentation is optional if keys are unique.', '**YAML** is indentation-sensitive — bad indent breaks playbooks/configs.'],
  ['Northbound APIs only talk device-to-device, never to apps.', '**Northbound** = controller↔apps; **southbound** = controller↔devices.'],
]

function buildPatch(waveNum, pool) {
  const lines = [`/** Trap wave ${waveNum} — +1 trap per objective (post-wave21 avg ≈12 → ≈13). */`, '', `export const TIER_B_TRAP_WAVE${waveNum}_PATCHES = {`]
  ALL_OBJECTIVES.forEach((obj, i) => {
    const [trap, fix] = pool[i % pool.length]
    const id = obj.id
    const cku = `CKU-${id.replace('.', '-')}`
    lines.push(`  '${id}': { examTraps: [{ id: '${id}-w${waveNum}-t1', trap: '${trap.replace(/'/g, "\\'")}', correction: '**${id}:** ${fix.replace(/'/g, "\\'")}', ckuIds: ["${cku}"] }] },`)
  })
  lines.push('}', '')
  return lines.join('\n')
}

if (W22.length !== 53) {
  console.error(`Expected 53 traps, got ${W22.length}`)
  process.exit(1)
}

writeFileSync(join(ROOT, 'src/data/tierBTrapWave22Patches.js'), buildPatch(22, W22))
console.log('✓ wrote tierBTrapWave22Patches.js')
