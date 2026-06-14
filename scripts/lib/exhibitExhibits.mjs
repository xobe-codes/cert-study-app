/**
 * Inline exhibit text keyed by source question ID.
 * Crafted from answer keys so shelved exhibit-dependent questions become self-contained.
 */

export const EXHIBIT_BY_ID = {
  'obj-2.3-source-q013': `CDP neighbor detail (SwitchB):
Device ID: SwitchB
Entry address(es): IP 192.168.1.2
Platform: cisco WS-C2960, Capabilities: Switch
Interface: GigabitEthernet0/2, Port ID (outgoing port): GigabitEthernet0/1
Holdtime: 162 sec`,

  'obj-2.9-source-q010': `WLC WLAN summary — MaintDept:
Profile Name: MaintDept
Status: Disabled
Radio Policy: All
Multicast VLAN: Disabled
Broadcast SSID: Disabled`,

  'obj-2.9-source-q011': `WLC WLAN security — CorpWLAN:
Security Policy: WPA2
Authentication Key Mgmt: PSK
Encryption: AES-CCMP (WPA2 Personal)`,

  'obj-3.1-source-q006': `Routing table excerpt:
Gateway of last resort is not set
      10.0.0.0/8 is variably subnetted, 3 subnets, 2 masks
O        10.1.0.0/16 [110/20] via 10.0.0.1, 00:05:00, Gi0/0
O        10.2.0.0/16 [110/30] via 10.0.0.2, 00:05:00, Gi0/1
O        10.3.0.0/16 [110/25] via 10.0.0.3, 00:05:00, Gi0/2`,

  'obj-3.3-source-q019': `Topology:
- Router A: Gi0/0 192.168.1.1/24 (Network A), Gi0/1 192.168.2.1/24 (link to Router B)
- Router B: Gi0/0 192.168.2.2/24 (link to A), Gi0/1 192.168.3.1/24 (Network B)
Goal: Router A must reach 192.168.3.0/24`,

  'obj-3.3-source-q028': `Router routing table:
C    192.168.0.0/16 is directly connected, Vlan1
C    192.168.4.0/24 is directly connected, Gi0/1
S    172.30.0.0/16 [1/0] via 10.1.1.1
S    192.168.128.0/24 [1/0] via 10.1.1.2 (unreachable next-hop)`,

  'obj-3.3-source-q029': `Topology:
- Network A: 198.44.4.0/24 behind Router A
- Router B: S0/0 198.55.4.9/30 (to A), S0/1 198.55.4.10/30 (toward Network A path)
Router B needs a route to Network A 198.44.4.0/24`,

  'obj-3.3-source-q033': `Router B routing table:
C    192.168.4.0/24 is directly connected, Gi0/0
S    192.168.5.0/24 [1/0] via 192.168.4.2
S    192.168.5.0/24 [1/0] via 192.168.4.5
Packet destination: 192.168.5.6`,

  'obj-3.3-source-q041': `Topology:
- Network B (hosts) behind Router B Gi0/2
- Router B Gi0/3 S0/3/0 connects to ISP for Internet
- IPv6 autoconfig needed on LAN toward hosts`,

  'obj-3.4-source-q009': `OSPF hierarchy:
- Router A sits between OSPF Area 0 and external networks (ASBR role)
- Areas 1 and 2 connect through ABRs B and C`,

  'obj-3.4-source-q011': `OSPF multi-area layout:
- Area 0 (backbone) contains Routers A and B
- Routers C, D, E each connect Area 0 to non-zero areas (ABR role)`,

  'obj-3.4-source-q039': `Router OSPF config goal:
Advertise 128.24.0.0/14 into both Area 0 and Area 1`,

  'obj-3.4-source-q044': `OSPF neighbors on broadcast segment (Area 0):
Router A: FULL/DROTHER  192.168.1.1
Router B: FULL/DR       192.168.1.2
Router C: FULL/BDR      192.168.1.3`,

  'obj-3.4-source-q045': `OSPF hierarchy:
- Router B connects Area 0 to Area 1 (ABR)
- Router A in Area 0, Router C in Area 1`,

  'obj-3.4-source-q047': `Router A OSPF: hello 10, dead 40
Router B OSPF: hello 10, dead 40
(Note: timers shown mismatched in running-config — A hello 5 dead 20)`,

  'obj-3.4-source-q049': `show ip ospf neighbor:
Neighbor ID  Pri  State           Dead Time  Address      Interface
192.168.2.2   1   FULL/DR         00:00:35   10.0.0.2     Gi0/0`,

  'obj-3.4-source-q051': `show ip ospf neighbor (non-DR router on multi-access):
Neighbor ID  Pri  State           Dead Time  Address      Interface
192.168.2.2   1   FULL/DROTHER    00:00:35   10.0.0.2     Gi0/0`,

  'obj-3.4-source-q052': `OSPF broadcast segment — current DR is Router C (priority 1):
Router D Gi0/0: 192.168.5.2/24, OSPF priority default 1`,

  'obj-3.4-source-q054': `Router A: network 10.0.0.0 0.0.0.255 area 0
Router B: network 10.0.0.0 0.0.0.255 area 1`,

  'obj-3.4-source-q055': `Single OSPF area 0; Router A has default route via Serial0/0 to ISP.
Need to inject default into OSPF for all area routers.`,

  'obj-3.5-source-q026': `HSRP topology:
Router A (active) and Router B (standby) share VIP 192.168.1.254
Both track upstream ISP link on serial 0/0/1 for failover`,

  'obj-5.3-source-q015': `Switch# show users
    Line       User       Host(s)              Idle       Location
*  0 con 0                idle                 0          local
   1 vty 0     admin      192.168.1.50         0          local
   2 vty 1                idle                 5          local`,

  'obj-5.5-source-q004': `Router A tunnel config:
interface Tunnel0
 ip address 192.168.2.1 255.255.255.0
 tunnel source Serial0/0/0
 tunnel destination 203.0.113.2
! No ip route to remote tunnel endpoint network`,

  'obj-5.5-source-q005': `GRE topology:
Router A: LAN 192.168.2.0/24, Tunnel0 192.168.2.1, peer Router B LAN 192.168.3.0/24
Serial link: 203.0.113.0/30 (A=203.0.113.1, B=203.0.113.2)`,

  'obj-5.5-source-q008': `GRE tunnel carries traffic directly between tunnel endpoints:
Router A ping/traceroute to 192.168.3.50 crosses one GRE hop (tunnel encapsulation).`,

  'obj-5.5-source-q009': `Router A Tunnel0 up/up but missing route to 192.168.3.0/24 via tunnel.
Cannot ping remote tunnel endpoint LAN 192.168.3.1`,

  'obj-5.5-source-q011': `Serial link between routers:
Router A S0/0/0: encapsulation ppp
Router B S0/0/0: encapsulation hdlc`,

  'obj-5.6-source-q019': `Network layout:
Host 192.168.2.6 on user VLAN
HR web server 192.168.1.3 port 80
Other servers and Internet should remain reachable`,

  'obj-5.6-source-q022': `ACL requirement:
Block host network → HR web app (TCP/80) while permitting intranet web server access
Needs protocol/port matching → extended ACL`,

  'obj-5.6-source-q025': `Topology:
Gi0/0: user network (hosts)
Gi0/2: HR network (to be blocked from host network)
ACL 2: deny host network, permit other traffic — apply outbound on HR-facing interface`,

  'obj-5.6-source-q026': `Switch# show ip access-list named_list
Extended IP access list named_list
    10 deny tcp host 192.168.2.6 host 192.168.1.3 eq www
    20 permit ip any any`,

  'obj-5.7-source-q023': `Switch# show port-security interface Gi0/1
Port Security              : Enabled
Port Status                : Secure-shutdown
Violation Mode             : Shutdown
Total MAC Addresses        : 1 (max 1)
Security Violation Count   : 1`,

  'obj-5.7-source-q025': `Switch# show port-security interface Gi0/2
Port Status                : Secure-shutdown (violation)
Violation Mode             : Shutdown`,

  'obj-5.7-source-q027': `Switch# show port-security
Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action
Gi0/1        1              1            0                  Shutdown
Gi0/2        2              2            1                  Shutdown`,

  'obj-6.7-source-q007': `{ "interface": "Fa0/1", "bandwidth": "100mb", "status": "up", "address": { "ipaddress": "192.168.1.5", "subnetmask": "255.255.255.0", "default gateway": "192.168.1.1", }`,

  'obj-6.7-source-q010': `{ "ipaddress": "192.168.1.2", "subnet_mask": "255.255.255.0", "defaultgw": "192.168.1.1", "routes": [ { "route": "10.0.0.0/8 via 192.168.1.10" "route": "0.0.0.0/0 via 192.168.1.1" } ] }`,

  'obj-6.7-source-q011': `{ "ipaddress": [ "192.168.1.2", [ "192.168.1.4" ] ], "subnet_mask": "255.255.255.0", "defaultgw": "192.168.1.1" }`,

  'obj-6.7-source-q012': `{ "interface": { "ipaddress": [ "192.168.1.2", [ "192.168.1.4" ] "subnet_mask": [ "255.255.255.0", [ "255.255.255.0" ] ], "defaultgw": "192.168.1.1" }`,
}

export function exhibitForQuestion(q) {
  const text = EXHIBIT_BY_ID[q.id]
  if (!text) return null
  const stem = (q.question || '')
    .replace(/Using the referenced source exhibit,?\s*/gi, '')
    .replace(/Using the following exhibit,?\s*/gi, '')
    .replace(/in the following exhibit/gi, 'below')
    .replace(/shown in the exhibit below/gi, 'shown below')
    .replace(/The following exhibit shows/gi, 'The following output shows')
    .trim()
  const hasInlineJson = stem.includes('{ "') || stem.includes('{"')
  if (hasInlineJson) return { ...q, question: stem, exhibitConverted: true }
  return { ...q, question: `${text}\n\n${stem}`, exhibitConverted: true }
}
