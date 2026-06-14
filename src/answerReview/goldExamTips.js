/**
 * Hand-authored exam tips for high-traffic questions and objectives.
 * Overrides generator tips when a gold entry exists.
 */

export const GOLD_EXAM_TIPS_BY_ID = {
  '1.5-c-q3': 'Unknown unicast → **flood** within the VLAN (except ingress). Known unicast → **one port**.',
  '1.1-c-q3': 'Need inter-VLAN routing at speed? **Layer 3 switch** — never a hub for broadcast segmentation.',
  '3.2-c-q1': 'Forwarding order: **longest prefix match** first, then **lowest AD**, then **best metric**.',
  '3.4-c-q1': 'OSPF won\'t go FULL without matching **area, hello/dead, subnet, and auth** on the link.',
  '4.1-c-q1': 'NAT fails silently without **inside/outside** — label interfaces before reading address types.',
  '5.5-c-q1': 'Extended ACLs go **near the source**; standard ACLs **near the destination** — placement is the trap.',
}

/** One gold tip per high-weight objective (used when no question-specific tip). */
export const GOLD_OBJECTIVE_EXAM_TIPS = {
  '1.1': 'Device-selection stems: match **role to layer** — hub (L1), switch (L2), router/L3 switch (L3).',
  '1.5': 'Switch stems: **learn source MAC**, **forward on destination MAC** — never swap them.',
  '1.6': 'Subnet stems: find the **interesting octet** and **block size** — not always the 4th octet.',
  '1.8': 'IPv6 shortening: **one :: per address**, drop leading zeros per group, preserve compression rules.',
  '2.1': 'Access port = **one VLAN**; voice/data VLANs are separate access assignments.',
  '2.2': 'Trunk stems: **802.1Q tags** cross links; **native VLAN must match** on both ends.',
  '2.5': 'STP: **blocking** prevents loops — it is not “drop all user traffic” on a forwarding port.',
  '3.1': 'Route table: **C/L = AD 0**; compare **AD between sources**, **metric within** one protocol.',
  '3.2': 'Longest prefix beats everything else — then **lowest AD**, then **best metric**.',
  '3.3': 'Static route: **next-hop** needs recursive lookup; **exit-interface** common on point-to-point.',
  '3.4': 'OSPF: neighbor **area + timers + subnet + auth** must match — DR/BDR only on multi-access.',
  '3.5': 'HSRP: hosts use **virtual IP/MAC**; know **Active vs Standby** and preempt/priority.',
  '4.1': 'NAT: **inside/outside first** — then inside local/global vs outside local/global.',
  '4.2': 'NTP: lower **stratum** = closer to reference; client stratum = server + 1.',
  '4.3': 'DHCP **DORA** — identify which message the stem describes before picking.',
  '4.6': 'DHCP relay = **ip helper-address** on the **client VLAN interface** toward the server.',
  '5.2': 'Security program stems: **people + process + technology** — training is not optional fluff.',
  '5.3': 'AAA order: **Authentication → Authorization → Accounting** — match the stem verb.',
  '5.5': 'ACL: **first match wins**, implicit deny at end; **wildcard 0 = must match**.',
  '5.6': 'Port security / DHCP snooping: **trusted vs untrusted** port role is the setup trap.',
  '5.9': 'Wireless: **WPA2/WPA3** for real security — WEP is always wrong on modern stems.',
  '6.1': 'Automation: **southbound API** programs devices; **northbound** is what apps use on controller.',
  '6.3': 'JSON/YAML configs: mind **structure and hierarchy** — one wrong indent breaks intent.',
}

export function goldExamTipFor(q) {
  if (!q) return null
  if (q.id && GOLD_EXAM_TIPS_BY_ID[q.id]) return GOLD_EXAM_TIPS_BY_ID[q.id]
  if (q.objectiveId && GOLD_OBJECTIVE_EXAM_TIPS[q.objectiveId]) return GOLD_OBJECTIVE_EXAM_TIPS[q.objectiveId]
  return null
}
