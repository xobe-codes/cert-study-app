#!/usr/bin/env node
/** Generate tierBTrapWave21Patches.js — +1 trap per objective (avg 11→12). */
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ALL_OBJECTIVES } from '../src/data/ccnaDomains.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const W21 = [
  ['Routers never perform any Layer 2 switching in CCNA topologies.', '**Router-on-a-stick** and **L3 gateways** still appear — know when routing vs switching happens.'],
  ['Collapsed core designs always eliminate the need for redundant links.', '**Redundancy** still matters — collapsed core simplifies tiers, not failure domains.'],
  ['Single-mode fiber is only for patch cables inside a rack.', '**SMF** is standard for **long-reach** campus/WAN — MMF for short patch.'],
  ['Giants and runts only appear when VLANs are misconfigured.', '**Giants/runts** often indicate **duplex mismatch** or bad cable — check physical first.'],
  ['A switch floods unknown unicast forever until you reboot.', 'Unknown unicast **floods once per frame** until MAC is relearned — not permanent blackhole.'],
  ['A /31 on a point-to-point link wastes two usable addresses.', '**/31** can be used on P2P links (RFC 3021) — know /30 vs /31 exam wording.'],
  ['NAT is required for two sites using unique local IPv6.', '**ULA** can route privately; global unicast or translation choices are design-dependent.'],
  ['IPv6 link-local addresses are globally routable on the Internet.', '**FE80::/10** is **link-local only** — not Internet-routable.'],
  ['Duplicate Address Detection means IPv6 never has address conflicts.', '**DAD** detects conflicts — operators still must resolve duplicate assignments.'],
  ['ipconfig /all on Windows never shows DNS servers.', '**ipconfig /all** lists DNS, DHCP, and interface details — client verify command.'],
  ['5 GHz always has longer range than 2.4 GHz in every building.', '**2.4 GHz** penetrates better; **5 GHz** offers more throughput — trade-offs matter.'],
  ['Type-1 hypervisors always run on top of a host OS like Windows.', '**Type-1 (bare-metal)** runs directly on hardware — Type-2 needs a host OS.'],
  ['Removing a VLAN from a trunk deletes it from every switch VLAN database.', '**Trunk pruning** limits **allowed VLANs** — VLAN can remain in the **database**.'],
  ['DTP desirable/auto on both sides guarantees an immediate trunk.', '**auto/auto** may stay access — use **on/desirable** when trunk certainty is required.'],
  ['LLDP is enabled by default on all Cisco IOS platforms like CDP.', '**LLDP** is often **disabled by default** — enable with **`lldp run`**.'],
  ['Port-channel load balancing always splits every TCP flow across all links.', '**Hash per flow** — one large flow may use **one member link**.'],
  ['BPDU Guard on an access port is optional when PortFast is disabled.', '**BPDU Guard** pairs with **PortFast edge** — unexpected BPDUs err-disable the port.'],
  ['FlexConnect APs tunnel all client traffic to the WLC by default.', '**FlexConnect** can **switch locally** — contrast with **Local mode** CAPWAP tunneling.'],
  ['Open SSID beacons expose the WPA2 group key to passive listeners.', '**Beacon/mgmt** frames differ from **encrypted data** — know WPA2 **4-way handshake** roles.'],
  ['OSPF external routes always beat intra-area routes when metrics tie.', '**Order**: intra-area → inter-area → external — **AD/metric** still decide.'],
  ['Static routes automatically redistribute into OSPF without configuration.', '**Redistribution** must be explicit — statics are not auto-injected into OSPF.'],
  ['All OSPF routers in an area must share the same router ID value.', '**Router ID** is **per-router unique** — area ID must match for adjacency.'],
  ['A summary route to Null0 can blackhole traffic unintentionally if misapplied.', '**Null0** is intentional discard — use for **summary/floating** designs carefully.'],
  ['HSRP preempt always causes minutes of outage on every failover.', 'Tuned **timers/preempt delay** limit disruption — understand **failover window**.'],
  ['Missing OSPF route means the interface is definitely administratively down.', 'Check **network statement**, **area**, **ACL**, and **AD** — not only link state.'],
  ['PAT overload is required for every static NAT mapping.', '**Static NAT** is 1:1 — **overload** keyword enables **PAT**.'],
  ['Clear ip nat translations never drops established TCP sessions.', 'Clearing **translations** can **reset** flows — know operational impact.'],
  ['Stratum 1 on an NTP client means it is unsynchronized.', '**Stratum 1** is excellent — **stratum 16** means **unsynchronized**.'],
  ['DHCP snooping is useless without Option 82 enabled.', '**Snooping** still builds bindings and blocks rogue servers without Option 82.'],
  ['SNMPv2c community strings are encrypted on the wire.', '**SNMPv2c** communities are **cleartext** — prefer **SNMPv3 authPriv**.'],
  ['Permanently logging at debugging on WAN edges is best practice.', '**Debugging** floods CPU/links — use **informational** for steady-state ops.'],
  ['ip helper-address only forwards DNS queries.', '**Helper** relays **DHCP** and other UDP broadcasts from client VLANs.'],
  ['DSCP EF marking alone guarantees end-to-end QoS without queuing.', 'Marking needs **queuing/policing** at congestion points — marking is not magic.'],
  ['Telnet is acceptable for production device management on CCNA exams.', 'Use **SSH v2** — **Telnet** is cleartext and obsolete for production.'],
  ['SCP and TFTP both provide identical security for IOS image copy.', '**TFTP** is simple/no auth; **SCP** adds **authentication/encryption**.'],
  ['Cloud management removes the need for local device credentials.', '**Credentials** and **reachability** still matter — cloud is another management plane.'],
  ['Integrity is not part of the CIA security triad.', '**CIA** = Confidentiality, **Integrity**, Availability.'],
  ['Security policy documents replace technical access controls.', '**Policy + technical controls** (AAA, ACLs) work together — not either/or.'],
  ['VTY login local works without aaa new-model on modern IOS.', 'Many **AAA** features require **`aaa new-model`** — know exam prerequisites.'],
  ['TACACS+ and RADIUS use identical UDP port numbers.', '**RADIUS UDP 1812/1813** vs **TACACS+ TCP 49** — protocol/port distinction.'],
  ['Extended ACLs should be placed closest to the destination always.', '**Extended** near **source**; **standard** near **destination** — classic placement.'],
  ['Numbered ACLs cannot be edited without deleting the whole list.', '**Named ACLs** support **resequence** — know edit workflows on IOS.'],
  ['DAI validates DHCP offers but never inspects ARP packets.', '**DAI** checks **ARP** against DHCP snooping/static bindings.'],
  ['Sticky port-security MACs persist across reload without saving config.', '**Sticky** learned MACs need **write mem** to survive reload.'],
  ['Remote-access VPN and site-to-site VPN are identical deployment models.', '**Site-to-site** gateways vs **remote-access** clients — different designs.'],
  ['Microsegmentation only applies at Layer 7 on CCNA.', '**VLANs/VRFs/ACLs** provide **L2/L3 segmentation** — foundation for microsegmentation.'],
  ['Puppet is agentless like Ansible on every node.', '**Puppet/Chef** use **agents** — **Ansible** is typically **agentless** SSH/API.'],
  ['VXLAN and VLAN are the same isolation mechanism.', '**VLAN** = L2 broadcast domain; **VXLAN** = **L2 overlay** on L3 underlay.'],
  ['REST PUT is always safe and idempotent with no side effects.', '**PUT** mutates state — **GET** is the safe read; know **idempotent** verbs.'],
  ['DNA Assurance only stores raw syslog with no client correlation.', '**Assurance** correlates **client/onboarding/health** beyond syslog dumps.'],
  ['Terraform state files are optional for production IaC workflows.', '**State** tracks managed resources — required for correct **plan/apply**.'],
  ['JSON numbers and strings are interchangeable in all API parsers.', '**Types matter** — `"10"` ≠ `10` in strict API validation.'],
  ['Southbound APIs on controllers only push config — never read operational state.', '**Southbound** interfaces both **configure and retrieve** device state on controllers.'],
]

function buildPatch(waveNum, pool) {
  const lines = [`/** Trap wave ${waveNum} — +1 trap per objective (post-wave21 avg ≈12). */`, '', `export const TIER_B_TRAP_WAVE${waveNum}_PATCHES = {`]
  ALL_OBJECTIVES.forEach((obj, i) => {
    const [trap, fix] = pool[i % pool.length]
    const id = obj.id
    const cku = `CKU-${id.replace('.', '-')}`
    lines.push(`  '${id}': { examTraps: [{ id: '${id}-w${waveNum}-t1', trap: '${trap.replace(/'/g, "\\'")}', correction: '**${id}:** ${fix.replace(/'/g, "\\'")}', ckuIds: ["${cku}"] }] },`)
  })
  lines.push('}', '')
  return lines.join('\n')
}

if (W21.length !== 53) {
  console.error(`Expected 53 traps, got ${W21.length}`)
  process.exit(1)
}

writeFileSync(join(ROOT, 'src/data/tierBTrapWave21Patches.js'), buildPatch(21, W21))
console.log('✓ wrote tierBTrapWave21Patches.js')
