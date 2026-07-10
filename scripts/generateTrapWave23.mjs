#!/usr/bin/env node
/** Generate tierBTrapWave23Patches.js — +1 trap per objective (avg 13→14). */
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ALL_OBJECTIVES } from '../src/data/ccnaDomains.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const W23 = [
  ['A default gateway is optional when hosts only talk inside one VLAN.', 'Same-VLAN L2 works without a gateway — **inter-VLAN/Internet** still needs L3 gateway/SVI.'],
  ['Collapsed core always removes the need for Spanning Tree entirely.', '**STP** still prevents L2 loops even in collapsed designs with redundant links.'],
  ['Auto-MDIX means crossover cables are required between all modern switches.', '**Auto-MDIX** usually lets straight-through work switch↔switch — crossover is legacy.'],
  ['CRC errors always mean the remote OSPF neighbor is down.', '**CRC** is physical/L2 integrity — check cable/duplex before blaming routing.'],
  ['Known unicast frames are always flooded to every VLAN on the switch.', 'Known unicast goes **out the learned port only** — flood is for unknown/broadcast/multicast.'],
  ['Host bits equal the prefix length on every subnetting question.', 'Host bits = **32 − prefix** — do not confuse prefix length with host-bit count.'],
  ['APIPA 169.254 addresses are part of RFC 1918 private space.', '**169.254/16** is APIPA/link-local — RFC 1918 is **10/8, 172.16/12, 192.168/16**.'],
  ['IPv6 addresses are 64 bits long like a MAC address.', 'IPv6 addresses are **128 bits** — MAC is 48 bits; EUI-64 builds a 64-bit IID.'],
  ['IPv6 broadcast replaces multicast for all-nodes delivery.', 'IPv6 has **no broadcast** — use **FF02::1** (all-nodes) multicast instead.'],
  ['route print on Windows shows DNS server settings.', '**route print** shows routes — use **`ipconfig /all`** for DNS/DHCP details.'],
  ['Wi-Fi 6 is the marketing name for 802.11ac.', '**802.11ac = Wi-Fi 5**; **802.11ax = Wi-Fi 6**.'],
  ['Type-2 hypervisors run directly on bare metal without a host OS.', '**Type-2** runs on a host OS (Workstation); **Type-1** is bare-metal (ESXi).'],
  ['show interfaces trunk lists every access port VLAN assignment.', '**`show vlan brief`** for access assignments; **`show interfaces trunk`** for trunks.'],
  ['DTP on/on always forms a trunk even if allowed VLANs are empty.', 'Trunk mode can form, but **allowed VLAN list** still controls which VLANs pass.'],
  ['LLDP and CDP cannot run on the same interface simultaneously.', 'Both can run — know which neighbors each protocol discovers.'],
  ['LACP active/passive never forms a channel — both must be active.', '**active/passive** can form; **passive/passive** will not.'],
  ['PortFast should be enabled on all trunk uplinks to the core.', '**PortFast** is for **edge/access** ports — trunks risk loops if PortFast is misused.'],
  ['An AP in Local mode always bridges client traffic onto the local VLAN.', '**Local mode** tunnels client data to the **WLC** via CAPWAP — not local bridging.'],
  ['WPA2-Personal uses 802.1X/EAP with a RADIUS server by default.', '**WPA2-Personal** uses a **PSK**; **Enterprise** uses **802.1X/RADIUS**.'],
  ['SSID is only configured on the client — APs never advertise it.', 'APs **beacon** the SSID (unless hidden) — clients discover/join that SSID.'],
  ['Static routes always beat OSPF because metric is compared first.', '**AD** is compared across protocols before metric — static AD 1 beats OSPF 110.'],
  ['Equal-cost OSPF routes never load-balance without extra config.', 'IOS can **ECMP** equal-cost OSPF routes by default (subject to max-paths).'],
  ['A floating static must use a lower AD than the primary dynamic route.', 'Floating backup uses a **higher AD** so it only installs when primary fails.'],
  ['OSPF hello timers can differ and still form Full adjacency.', '**Hello/dead** must match (with area, mask, auth, etc.) or neighbors fail.'],
  ['HSRP virtual IP must match a physical interface IP on the active router.', '**VIP** is virtual — physical interface IPs are different; hosts use the VIP as gateway.'],
  ['show ip ospf database proves the route is installed in the RIB.', 'LSDB shows LSAs — **`show ip route`** confirms RIB installation.'],
  ['PAT and static NAT are identical one-to-one mappings.', '**Static NAT** is 1:1; **PAT/overload** many-to-one using ports.'],
  ['NTP stratum 0 devices are common leaf switches on the LAN.', '**Stratum 0** are reference clocks; servers are stratum 1+ — clients higher.'],
  ['DHCP Discover messages are always unicast to the server.', '**Discover** is broadcast; relays forward to the server with helper-address.'],
  ['SNMPv2c authPriv encrypts payloads like SNMPv3.', '**SNMPv2c** is community/cleartext — **SNMPv3 authPriv** adds crypto.'],
  ['Syslog severity 0 is debugging and least important.', '**0 = emergencies** (most severe); **7 = debugging** (least).'],
  ['ip helper-address is configured on the DHCP server’s LAN interface.', 'Helper is on the **client VLAN/interface** acting as relay — not the server.'],
  ['Marking packets with DSCP EF guarantees priority without any QoS policy.', 'Marking needs **queuing/policing** configured at congestion points.'],
  ['Telnet encrypts usernames and passwords on the wire.', '**Telnet** is cleartext — use **SSH v2** for encrypted management.'],
  ['copy running-config startup-config copies the IOS image to flash.', 'That saves **config** to NVRAM — images use **`copy tftp flash`** (etc.).'],
  ['Controller-based networks never need southbound reachability to devices.', 'Controllers still need **southbound** reachability to push/pull device state.'],
  ['Confidentiality alone satisfies the full CIA triad.', '**CIA** needs Confidentiality, **Integrity**, and **Availability** together.'],
  ['Accounting is optional once authentication succeeds.', '**AAA accounting** records what users did — still required for auditability.'],
  ['login local cannot work unless a RADIUS server is reachable.', '**`login local`** uses the **local username** database — RADIUS is optional.'],
  ['RADIUS always uses TCP while TACACS+ always uses UDP.', 'Opposite: **RADIUS UDP 1812/1813**; **TACACS+ TCP 49**.'],
  ['Extended ACLs should be placed closest to the destination.', '**Extended → near source**; **standard → near destination**.'],
  ['Numbered ACLs are easier to resequence than named ACLs.', '**Named** ACLs support sequence numbers/resequence — numbered are harder to edit.'],
  ['Port-security violation protect shuts the interface down.', '**Shutdown** err-disables; **protect/restrict** drop frames (restrict also logs).'],
  ['DAI should trust all access ports facing end users.', 'Mark **uplinks** trusted; **access** ports are typically **untrusted** for DAI.'],
  ['Remote-access VPN and site-to-site VPN use identical client software.', '**Site-to-site** is gateway↔gateway; **remote-access** uses client software.'],
  ['VLANs alone provide Layer 3 path isolation between tenants.', 'VLANs are L2 — **VRFs/ACLs/firewalls** provide stronger L3 isolation.'],
  ['Puppet is agentless like Ansible on every managed node.', '**Ansible** is typically agentless; **Puppet/Chef** commonly use agents.'],
  ['VXLAN eliminates the need for an underlay IP network.', 'VXLAN is an **overlay** that rides on an **L3 underlay**.'],
  ['REST DELETE is a safe method with no side effects.', '**DELETE** mutates state — **GET** is the safe read method.'],
  ['DNA Assurance only stores raw syslog with no client context.', '**Assurance** correlates **client/onboarding/health**, not just raw syslog.'],
  ['Terraform state files should be deleted after every successful apply.', '**State** tracks resources — required for correct future plan/apply.'],
  ['JSON treats the number 10 and the string "10" as identical types.', 'Types matter — **`10` ≠ `"10"`** in strict API validation.'],
  ['Northbound APIs only configure devices, never expose data to apps.', '**Northbound** is controller↔apps (read/write); **southbound** is controller↔devices.'],
]

function buildPatch(waveNum, pool) {
  const lines = [`/** Trap wave ${waveNum} — +1 trap per objective (post-wave22 avg ≈13 → ≈14). */`, '', `export const TIER_B_TRAP_WAVE${waveNum}_PATCHES = {`]
  ALL_OBJECTIVES.forEach((obj, i) => {
    const [trap, fix] = pool[i % pool.length]
    const id = obj.id
    const cku = `CKU-${id.replace('.', '-')}`
    lines.push(`  '${id}': { examTraps: [{ id: '${id}-w${waveNum}-t1', trap: '${trap.replace(/'/g, "\\'")}', correction: '**${id}:** ${fix.replace(/'/g, "\\'")}', ckuIds: ["${cku}"] }] },`)
  })
  lines.push('}', '')
  return lines.join('\n')
}

if (W23.length !== 53) {
  console.error(`Expected 53 traps, got ${W23.length}`)
  process.exit(1)
}

writeFileSync(join(ROOT, 'src/data/tierBTrapWave23Patches.js'), buildPatch(23, W23))
console.log('✓ wrote tierBTrapWave23Patches.js')
