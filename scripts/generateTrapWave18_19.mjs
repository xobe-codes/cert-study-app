#!/usr/bin/env node
/** Generate tierBTrapWave18/19Patches.js — +1 trap per objective at 8→9 and 9→10. */
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ALL_OBJECTIVES } from '../src/data/ccnaDomains.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const W18 = [
  ['Half-duplex is only a fiber problem — copper auto-negotiation never fails.', 'Duplex mismatch on **copper** causes collisions and input errors — check **both** ends.'],
  ['A /27 always provides 32 usable host addresses.', '**/27** = 32 addresses minus network/broadcast = **30 usable** hosts.'],
  ['Straight-through cable is correct for all switch-to-router links without exception.', 'Modern NICs use **auto-MDIX** — but exam items may still test **crossover vs straight-through** pairs.'],
  ['CRC errors on an interface always mean the remote device is defective.', 'Local **bad cable**, **duplex**, or **NIC** cause CRC — troubleshoot locally first.'],
  ['Unknown unicast frames are dropped when the MAC table is empty.', 'Empty table → **flood** unknown unicast in the VLAN (except ingress port).'],
  ['VLSM requires all subnets in a design to be the same size.', '**VLSM** uses **variable** mask lengths within one major network.'],
  ['RFC 1918 addresses are routable on the public Internet without NAT.', '**10/8, 172.16/12, 192.168/16** are **private** — NAT required for Internet.'],
  ['IPv6 link-local addresses are assigned only by manual configuration.', 'Hosts auto-configure **fe80::/10** link-local without DHCP.'],
  ['IPv6 global unicast and unique local (fc00::/7) are interchangeable on exams.', '**Global unicast** is Internet-routable; **ULA** is private like RFC1918.'],
  ['ipconfig /release fixes a wrong static IP mask on Windows.', '**Static** misconfig needs manual fix — release/renew applies to **DHCP** clients.'],
  ['Higher Wi-Fi MCS always means better range through concrete walls.', '**MCS/rate** trades range for throughput — lower bands penetrate better.'],
  ['Hypervisor virtual switches remove the need for VLAN tagging on physical uplinks.', 'VM traffic still maps to **VLANs** on the **physical uplink/trunk**.'],
  ['switchport access vlan and voice vlan cannot coexist on one port.', '**Voice VLAN** (auxiliary) can overlay **data VLAN** on access ports with phones.'],
  ['Native VLAN must be VLAN 1 on every trunk.', 'Native VLAN is **configurable** — mismatch between peers breaks untagged traffic.'],
  ['CDP shows Layer 3 routes learned from neighbors.', '**CDP/LLDP** advertise **L2** neighbor info — not routing tables.'],
  ['LACP passive on one side and active on the other never forms a channel.', '**Active/passive** LACP can form a channel — both passive will **not**.'],
  ['Lightweight APs run full IOS image locally like autonomous APs.', '**Lightweight** APs use **CAPWAP** to WLC — config is centralized.'],
  ['Controller-based WLAN means clients associate to the WLC directly.', 'Clients associate to the **AP**; AP tunnels/control to **WLC**.'],
  ['WPA2-Enterprise uses a single shared PSK for all users.', '**Enterprise** uses **802.1X + RADIUS** per-user credentials.'],
  ['Administrative distance is compared before longest-prefix match.', '**Longest prefix match** first — then **AD**, then **metric** within protocol.'],
  ['EIGRP and OSPF metrics are directly comparable numerically.', 'Metrics are **protocol-specific** — compare via **AD** and prefix length.'],
  ['OSPF network statement uses subnet mask like classful RIPv1.', 'OSPF uses **wildcard mask** in network statements — not subnet mask.'],
  ['A /32 route in the table always means a summary route.', '**L** local and **/32** host routes are normal — read **route codes**.'],
  ['Floating static backup routes use AD lower than the primary.', '**Floating static** has **higher AD** — backup only when primary gone.'],
  ['HSRP standby router forwards traffic while active is healthy.', 'Only **Active** forwards — **Standby** listens until failover.'],
  ['Traceroute hop timeout always means the packet died at that router.', 'Intermediate routers may **rate-limit ICMP** — timeout ≠ black hole.'],
  ['Inside global and outside local are the same address in NAT terminology.', '**Inside local** = LAN view; **inside global** = Internet view after NAT.'],
  ['PAT requires one inside global for every inside local host.', '**PAT/overload** maps many inside locals to **one** public IP with ports.'],
  ['NTP client stratum 1 means it is unsynchronized.', 'Low stratum (1–15) = synced; **16** = **unsynchronized**.'],
  ['DHCP snooping trusted ports should face end-user laptops.', '**Trusted** toward **legitimate DHCP server**; access ports are **untrusted**.'],
  ['SNMPv2c community "public" is secure enough for production.', 'Communities are **cleartext** — prefer **SNMPv3** auth/priv.'],
  ['Syslog facility local7 is the only valid destination for Cisco logs.', 'Multiple **facilities/hosts** exist — match exam scenario to **severity** filter.'],
  ['ip helper-address converts DHCP unicast to broadcast on the server VLAN.', '**Helper** relays **client broadcasts** from local subnet toward **remote** DHCP.'],
  ['QoS classification happens only on WAN edge routers.', 'Mark/trust at **access** — congestion happens on **campus uplinks** too.'],
  ['crypto key generate rsa is optional for SSH v2 on modern IOS.', '**SSH v2** requires **RSA keys** (or equivalent) for server authentication.'],
  ['copy startup-config tftp: overwrites RAM without confirmation.', 'Know **copy run start** vs **copy to remote** — prompts and direction matter.'],
  ['Cloud-managed switches never need local console for recovery.', 'Keep **console/out-of-band** access — cloud reachability can fail.'],
  ['Confidentiality and integrity are the same security goal.', '**CIA**: confidentiality (secrecy) vs **integrity** (unchanged data).'],
  ['Security policy documents replace technical controls like ACLs.', '**Policy** defines requirements — **ACLs/AAA** implement controls.'],
  ['login local eliminates the need for encrypted enable passwords.', '**enable secret** still protects **privilege mode** — separate from line login.'],
  ['RADIUS encrypts the entire packet including authorization attributes like TACACS+.', '**RADIUS** encrypts **password** only; **TACACS+** encrypts more of the session.'],
  ['Standard ACL 99 can deny TCP port 443 from a subnet.', '**Extended ACLs** match **L4 ports** — standard matches **source IP** only.'],
  ['Placing extended ACL outbound on the destination is always best practice.', 'Extended ACLs belong **near source** to filter before crossing the network.'],
  ['Port-security protect mode shuts down the interface on violation.', '**Protect** drops traffic; **shutdown** err-disables — know **violation modes**.'],
  ['Dynamic ARP Inspection works without DHCP snooping bindings.', '**DAI** uses **DHCP snooping table** (or static ARP) for IP→MAC validation.'],
  ['Site-to-site IPsec always uses AH instead of ESP for encryption.', '**ESP** provides **encryption + integrity** — common for VPN data.'],
  ['Zero-trust means no authentication inside the corporate LAN.', '**Zero-trust** verifies **every** access — no implicit LAN trust.'],
  ['Python scripts on a router replace the need for NETCONF for all changes.', '**NETCONF/RESTCONF** are structured **southbound** APIs — scripts may call them.'],
  ['OpenFlow replaces all IOS CLI on every access switch.', '**SDN** centralizes **control** — switches still **forward** locally.'],
  ['REST GET requests are idempotent and safe for reading device state.', '**GET** reads state without side effects — use for **show-like** API calls.'],
  ['DNA Center Design module replaces IP addressing planning spreadsheets only.', '**Design** includes **hierarchy, addressing, services** — not just diagrams.'],
  ['Chef and Puppet are agentless like Ansible on network devices.', '**Chef/Puppet** use **agents** on nodes — **Ansible** is agentless SSH.'],
  ['YAML playbooks cannot include variables or loops.', '**Ansible** uses **vars, loops, handlers** in YAML playbooks.'],
]

const W19 = [
  ['A hub is a full-duplex Layer 2 device like a switch.', '**Hubs** are half-duplex **L1** repeaters — switches provide **L2** forwarding.'],
  ['Three-tier collapsed core means access connects directly to the Internet.', '**Collapsed core** merges core/distribution — still need **controlled** Internet edge.'],
  ['Single-mode fiber uses LED sources for long campus runs.', '**SMF** uses **laser** sources; **MMF** uses **LED/VCSEL** for shorter reach.'],
  ['Gi0/0 down/down always means cable unplugged — never admin shutdown.', '**admin down** shows **administratively down** — distinguish from **line protocol**.'],
  ['Broadcast frames are forwarded only to the port where the MAC was learned.', '**Broadcast** floods to **all ports** in VLAN except ingress.'],
  ['Borrowing bits from the host portion decreases the subnet mask length.', 'Borrowing host bits **increases** prefix length (e.g. /24 → /25).'],
  ['NAT is required for two hosts with public IPs on the same LAN.', '**Public IPs** on LAN communicate without NAT — NAT for **private→public**.'],
  ['IPv6 anycast is the same as multicast ff00::/8.', '**Anycast** = nearest **unicast** receiver; **multicast** = group.'],
  ['EUI-64 always embeds the full MAC in the lower 64 bits unchanged.', '**EUI-64** flips the **u/l bit** — know modified EUI-64 format.'],
  ['Default gateway on a host can be in a different subnet if DNS works.', 'Gateway must be **reachable on-link** — same subnet unless specific exceptions.'],
  ['802.11ax (Wi-Fi 6) eliminates the need for wired uplinks to APs.', 'APs still need **wired uplinks** — Wi-Fi 6 improves **wireless** efficiency.'],
  ['Containers share the host network namespace so VLANs never apply.', 'Container **veth** still connects through **host bridge** to **VLAN uplinks**.'],
  ['Creating VLAN 99 automatically deletes VLAN 1 from the switch.', '**VLAN 1** is default — create additional VLANs; do not assume VLAN 1 removal.'],
  ['802.1Q tag adds 8 bytes — native VLAN frames are always tagged.', '**Native VLAN** frames are **untagged** on trunk — tag size is 4 bytes.'],
  ['LLDP is disabled by default on all Cisco platforms forever.', '**CDP** default on Cisco; **LLDP** may need **lldp run** — know defaults.'],
  ['PAgP desirable/desirable always negotiates faster than static mode on.', '**Static on/on** avoids negotiation delay — PAgP/LACP still need **compatible modes**.'],
  ['Split-MAC means all 802.11 encryption terminates on the WLC only.', '**Local MAC** vs **Split MAC** — know where **encryption** terminates in lightweight WLAN.'],
  ['CAPWAP data tunnel carries only management — never client data.', '**CAPWAP** can tunnel **client data** depending on **flex/local** mode.'],
  ['Open SSID with MAC filtering is as strong as WPA3-Enterprise.', '**MAC filter** is weak spoofing target — use **802.1X/WPA3** for enterprise.'],
  ['A router always prefers a /16 over a /24 for the same destination.', '**Longest prefix** wins — **/24** beats **/16** when both match.'],
  ['BGP is the default IGP on CCNA exam routers.', 'CCNA focuses on **OSPF/EIGRP/static** — BGP is **EGP**, different use case.'],
  ['OSPF router-id must be the highest loopback IP always.', '**Router-id** is explicit or highest **loopback** then **physical** — can be set manually.'],
  ['Default route 0.0.0.0/0 cannot be learned via OSPF external Type 2.', '**O*E2** default is valid when ASBR injects **default-information originate**.'],
  ['Static route with only exit interface works without recursive lookup.', 'Interface-only static needs **on-link** subnet — otherwise use **next-hop**.'],
  ['VRRP and HSRP use the same virtual MAC format on all vendors.', '**HSRP** uses **0000.0c07.acxx** — VRRP differs — know **Cisco FHRP**.'],
  ['Extended ping failure means Layer 4 application is down.', '**Ping** is **ICMP L3** — app TCP ports can fail while ping works.'],
  ['Static NAT maps many inside addresses to one outside address.', '**Static NAT** is **1:1** — use **PAT** for many-to-one.'],
  ['NAT translations appear before any inside traffic is generated.', 'Translations populate **after traffic** — empty table until flows initiate.'],
  ['NTP master stratum 0 is best for clients.', '**Stratum 0** is reference clock on server; clients show **higher** stratum number.'],
  ['ip dhcp snooping information option breaks all DHCP clients.', '**Option 82** insertion depends on design — know **trusted/untrusted** impact.'],
  ['SNMP trap and inform are identical — no acknowledgment.', '**Inform** requires **acknowledgment**; **trap** is fire-and-forget.'],
  ['logging console debugging is fine for 24/7 production routers.', '**Console debug** is for **local** troubleshooting — filter remote syslog.'],
  ['DHCP relay and DHCP server can sit on the same VLAN without conflict.', 'Relay forwards to **remote server** — avoid duplicate servers on client VLAN.'],
  ['DSCP EF (46) is best-effort forwarding by default on all switches.', '**EF** needs **QoS policy** — default queuing may not honor DSCP.'],
  ['Transport input ssh telnet secures VTY lines.', 'Use **transport input ssh** only — **telnet** is cleartext management.'],
  ['archive config on IOS replaces copy run start permanently.', '**Archive** aids rollback — still know **copy run start** for NVRAM save.'],
  ['Meraki cloud management removes all on-device configuration.', 'Devices still hold **local config** — cloud pushes **policy/templates**.'],
  ['Non-repudiation is part of the confidentiality pillar.', '**Non-repudiation** supports **integrity/accountability** — not secrecy.'],
  ['Defense in depth means one strong firewall replaces VLAN segmentation.', '**Layered controls**: segmentation, ACLs, AAA, monitoring — not one box.'],
  ['service password-encryption makes enable secret reversible.', '**service password-encryption** affects **weak** passwords — **secret** uses hash.'],
  ['TACACS+ uses UDP 1812 for all AAA functions.', '**TACACS+ TCP/49** — do not confuse with **RADIUS UDP/1812**.'],
  ['ACL wildcard 0.0.0.255 means match only the last octet.', '**Wildcard 0** = must match; **1** = ignore — inverse of subnet mask.'],
  ['Named ACLs cannot be standard — only numbered 1-99.', '**Named ACLs** can be **standard or extended** — IOS supports both.'],
  ['BPDU Guard and Root Guard solve the same STP problem.', '**BPDU Guard** blocks rogue **switch**; **Root Guard** blocks **superior BPDU** on designated ports.'],
  ['IPsec transport mode encrypts the entire original IP packet including new header.', '**Transport** encrypts **payload**; **tunnel** wraps whole packet.'],
  ['Micro-segmentation requires removing all VLANs.', 'Micro-segmentation **within** VLANs/VRFs — finer than single flat ACL.'],
  ['Git version control replaces device running-config on routers.', '**Git** tracks **templates/playbooks** — device still has **active running-config**.'],
  ['Southbound API means from application to orchestrator.', '**Southbound** = controller → **devices**; **northbound** = apps → controller.'],
  ['JSON uses XML-style closing tags for objects.', '**JSON** uses **braces/brackets** — no closing tags like XML.'],
  ['DNA Provision only deploys wireless SSIDs — not wired switchports.', '**Provision** applies **policy** to **wired and wireless** fabric.'],
  ['Puppet manifests and Ansible playbooks are both Ruby-only.', '**Ansible** uses **YAML**; **Puppet** uses **Puppet DSL** — not Ruby-only.'],
  ['Inventory groups in Ansible cannot nest or use variables.', '**Inventory** supports **groups, vars, children** for targeting hosts.'],
]

function buildPatch(waveNum, pool) {
  const lines = [`/** Trap wave ${waveNum} — +1 trap per objective (53 at ${waveNum + 7} traps). */`, '', `export const TIER_B_TRAP_WAVE${waveNum}_PATCHES = {`]
  ALL_OBJECTIVES.forEach((obj, i) => {
    const [trap, fix] = pool[i % pool.length]
    const id = obj.id
    const cku = `CKU-${id.replace('.', '-')}`
    lines.push(`  '${id}': { examTraps: [{ id: '${id}-w${waveNum}-t1', trap: '${trap.replace(/'/g, "\\'")}', correction: '**${id}:** ${fix.replace(/'/g, "\\'")}', ckuIds: ["${cku}"] }] },`)
  })
  lines.push('}', '')
  return lines.join('\n')
}

writeFileSync(join(ROOT, 'src/data/tierBTrapWave18Patches.js'), buildPatch(18, W18))
writeFileSync(join(ROOT, 'src/data/tierBTrapWave19Patches.js'), buildPatch(19, W19))
console.log('✓ wrote tierBTrapWave18Patches.js and tierBTrapWave19Patches.js')
