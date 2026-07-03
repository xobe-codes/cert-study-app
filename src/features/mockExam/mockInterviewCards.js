import { buildLearnerSummary } from '../../home/learnerHome.js'
import { ALL_OBJECTIVES } from '../../data/ccnaDomains.js'

/** Curated verbal prompts — free tier, no live AI required. */
export const MOCK_INTERVIEW_PROMPTS = {
  '3.4': [
    {
      id: 'mi-3.4-1',
      prompt: 'Two routers on the same subnet show OSPF neighbors stuck in INIT. What do you check first?',
      coachingPoints: [
        'Confirm interfaces share subnet/mask and are not passive on the link.',
        'Verify hello/dead timers and area ID match on both sides.',
        'Check ACLs blocking OSPF multicast 224.0.0.5.',
      ],
    },
  ],
  '3.2': [
    {
      id: 'mi-3.2-1',
      prompt: 'Explain how a router picks the forwarding path when two routes exist for 10.0.0.0/8 and 10.1.0.0/16.',
      coachingPoints: [
        'Longest prefix match wins at forward time — /16 beats /8 for 10.1.x.x.',
        'Administrative distance only breaks ties when installing the same prefix.',
      ],
    },
  ],
  '5.5': [
    {
      id: 'mi-5.5-1',
      prompt: 'An extended ACL is applied outbound on the WAN but traffic is still blocked. What is a common placement mistake?',
      coachingPoints: [
        'Extended ACLs should sit close to the source so unwanted traffic is filtered early.',
        'Confirm direction (in vs out) and interface — implicit deny at bottom.',
      ],
    },
  ],
  '5.8': [
    {
      id: 'mi-5.8-1',
      prompt: 'Compare WPA2-Personal and WPA2-Enterprise for a corporate WLAN.',
      coachingPoints: [
        'Personal: shared PSK passphrase; Enterprise: 802.1X/EAP with per-user creds via RADIUS.',
        'Both use AES-CCMP — difference is authentication, not encryption algorithm.',
        'Never WEP or open WLANs for production.',
      ],
    },
    {
      id: 'mi-5.8-2',
      prompt: 'Why is WPA3-Personal considered stronger than WPA2-PSK?',
      coachingPoints: [
        'SAE (Simultaneous Authentication of Equals) improves key exchange vs 4-way PSK handshake.',
        'PMF (Protected Management Frames) is mandatory in WPA3.',
      ],
    },
  ],
  '5.9': [
    {
      id: 'mi-5.9-1',
      prompt: 'Walk through configuring a WPA2-PSK WLAN on a WLC — what three settings matter most?',
      coachingPoints: [
        'SSID/WLAN enabled with WPA2 + AES + PSK (Authentication Key Management = PSK).',
        'Passphrase 8–63 characters; shared passphrase derives unique per-session keys via 4-way handshake.',
        'Map WLAN to correct VLAN/dynamic interface for client IP scope.',
      ],
    },
    {
      id: 'mi-5.9-2',
      prompt: 'Clients associate to CORP_WIFI but get 192.168.10.x instead of 192.168.20.x. First fix?',
      coachingPoints: [
        'WLAN-to-VLAN/interface mapping on WLC — not PSK or SSID rename.',
        'Verify dynamic interface IP and DHCP scope for VLAN 20.',
      ],
    },
  ],
  '2.5': [
    {
      id: 'mi-2.5-1',
      prompt: 'A switch CPU spikes and MACs flap everywhere. What Layer 2 mechanism do you suspect?',
      coachingPoints: [
        'Broadcast storm / loop — check STP roles and blocked ports.',
        'PortFast on switch-to-switch links risks instant loops if BPDUs are missed.',
      ],
    },
  ],
  '2.1': [
    {
      id: 'mi-2.1-1',
      prompt: 'Hosts in VLAN 10 cannot reach hosts in VLAN 20 on the same switch. What is missing?',
      coachingPoints: [
        'Inter-VLAN routing — SVI or router-on-a-stick with subinterfaces.',
        'Verify `show vlan brief` — both VLANs exist and access ports are assigned correctly.',
        'Trunk must carry both VLANs if routing is on another device.',
      ],
    },
  ],
  '3.1': [
    {
      id: 'mi-3.1-1',
      prompt: 'Walk through reading one line of `show ip route` — code, prefix, bracket, next-hop.',
      coachingPoints: [
        'Code first: C=connected, S=static, O=OSPF, D=EIGRP, * = candidate default.',
        '[AD/metric] — AD breaks ties when installing; metric picks best path within protocol.',
        'Longest match forwards — not administrative distance at forward time.',
      ],
    },
  ],
  '4.2': [
    {
      id: 'mi-4.2-1',
      prompt: 'A router clock is wrong and logs show inconsistent timestamps. How do you fix NTP on IOS?',
      coachingPoints: [
        '`ntp server <ip>` on the client — verify with `show ntp status` (synchronized).',
        'Stratum 16 = unsynchronized — check reachability to server UDP/123.',
        'Accurate time matters for syslog correlation and certificate validation.',
      ],
    },
  ],
  '4.3': [
    {
      id: 'mi-4.3-1',
      prompt: 'Clients get IP addresses but no default gateway. Which DHCP pool command fixes it?',
      coachingPoints: [
        '`default-router <ip>` sets option 3 — gateway for DHCP clients.',
        '`dns-server` is option 6 — separate from gateway.',
        'On the server: `ip dhcp pool` + `network` — not `ip helper-address` (that is relay).',
      ],
    },
    {
      id: 'mi-4.3-2',
      prompt: 'You need to reserve 192.168.10.1–10 for static devices in a DHCP pool. What command?',
      coachingPoints: [
        '`ip dhcp excluded-address 192.168.10.1 192.168.10.10` before or after pool config.',
        'Without exclusions, the server may lease the gateway IP to a client.',
        'Verify bindings: `show ip dhcp binding`.',
      ],
    },
  ],
  '4.4': [
    {
      id: 'mi-4.4-1',
      prompt: 'An NMS polls a router but gets authentication errors. What SNMPv2c setting is required?',
      coachingPoints: [
        '`snmp-server community <string> RO` for read-only polling.',
        'Community string is like a password — RW only when writes/traps need it.',
        'Traps are agent→NMS push; GET polling uses UDP/161 with community.',
      ],
    },
    {
      id: 'mi-4.4-2',
      prompt: 'Difference between SNMP trap and SNMP inform?',
      coachingPoints: [
        'Trap: unsolicited UDP alert — no delivery guarantee.',
        'Inform: acknowledged trap — receiver sends response.',
        'Both require `snmp-server host` / trap receiver config on the agent.',
      ],
    },
  ],
  '4.5': [
    {
      id: 'mi-4.5-1',
      prompt: 'Logs stay on the console only — nothing reaches the SIEM. What two commands send remote syslog?',
      coachingPoints: [
        '`logging host <ip>` — destination syslog server (UDP/514).',
        '`logging trap informational` (or appropriate level) — filters what is sent.',
        '`service timestamps log datetime msec` helps correlate events.',
      ],
    },
  ],
  '4.9': [
    {
      id: 'mi-4.9-1',
      prompt: 'Backup running-config to TFTP — state the IOS copy command and direction.',
      coachingPoints: [
        '`copy running-config tftp:` — running-config is source, TFTP is destination.',
        'Reversed (`copy tftp: running-config`) restores/downloads — not a backup.',
        'TFTP uses UDP/69, no authentication — trusted LAN only.',
      ],
    },
    {
      id: 'mi-4.9-2',
      prompt: 'When would you choose FTP over TFTP for IOS file transfer?',
      coachingPoints: [
        'FTP supports username/password (TCP/21) — TFTP has no auth.',
        'Both are unencrypted — SCP/SFTP for secure transfer.',
        'TFTP is simpler for LAN image copy labs; FTP when server requires login.',
      ],
    },
  ],
  '6.1': [
    {
      id: 'mi-6.1-1',
      prompt: 'Explain Ansible agentless automation vs Puppet/Chef agent model.',
      coachingPoints: [
        'Ansible pushes tasks over SSH from control node — no agent on devices.',
        'Puppet/Chef often run agents that pull from a master.',
        'Playbooks are YAML ordered task lists applied to inventory hosts.',
      ],
    },
  ],
  '6.2': [
    {
      id: 'mi-6.2-1',
      prompt: 'In SDN, what is the difference between control plane and data plane?',
      coachingPoints: [
        'Control plane: routing decisions, policy — controller or distributed protocols.',
        'Data plane: actual packet forwarding using FIB/ASIC tables.',
        'Southbound API = controller to devices; northbound = apps to controller.',
      ],
    },
  ],
  '6.5': [
    {
      id: 'mi-6.5-1',
      prompt: 'A REST API returns HTTP 404 for GET /devices/interfaces. What does that mean?',
      coachingPoints: [
        '404 Not Found — URI/resource missing; server may still be up.',
        'GET is read-only; POST/PUT/PATCH modify state.',
        '401/403 = auth; 5xx = server error — different troubleshooting paths.',
      ],
    },
  ],
}

const FALLBACK_PROMPTS = [
  {
    id: 'mi-fallback-1',
    objectiveId: '3.1',
    objectiveTitle: 'Interpret routing table',
    prompt: 'What does the code "O" mean in `show ip route` and what is [110/20]?',
    coachingPoints: [
      'O = OSPF learned route.',
      '[110/20] = administrative distance 110, OSPF metric 20 — always AD first.',
    ],
  },
  {
    id: 'mi-fallback-2',
    objectiveId: '4.1',
    objectiveTitle: 'Configure NAT',
    prompt: 'NAT is configured but `show ip nat translations` is empty. What two interface markings are required?',
    coachingPoints: [
      '`ip nat inside` on the LAN-facing interface.',
      '`ip nat outside` on the WAN-facing interface — plus inside source rule/overload.',
    ],
  },
]

/**
 * Build curated interview prompt cards from weak objectives (free tier).
 * @param {object} [options]
 * @param {Array<{ weakObjectiveIds?: string[] }>} [options.mockHistory]
 * @returns {Promise<Array<{ id, objectiveId, objectiveTitle, prompt, coachingPoints }>>}
 */
export async function buildMockInterviewCards(progress, missed = [], options = {}) {
  const summary = await buildLearnerSummary(progress, missed)
  const weak = summary.perObjective
    .filter(o => o.attempts > 0)
    .sort((a, b) => a.mastery - b.mastery)

  const mockPriority = []
  const hist = options.mockHistory || []
  if (hist.length) {
    const last = hist[hist.length - 1]
    for (const oid of last.weakObjectiveIds || []) {
      if (!mockPriority.includes(oid)) mockPriority.push(oid)
    }
  }

  const orderedObjectives = [
    ...mockPriority.map(id => weak.find(o => o.id === id) || { id, mastery: 0, attempts: 1, title: id }),
    ...weak.filter(o => !mockPriority.includes(o.id)),
  ]

  const cards = []
  const seen = new Set()

  for (const obj of orderedObjectives) {
    const prompts = MOCK_INTERVIEW_PROMPTS[obj.id]
    if (!prompts?.length) continue
    const pickIdx = (obj.attempts || mockPriority.indexOf(obj.id) + 1) % prompts.length
    const pick = prompts[pickIdx]
    if (seen.has(pick.id)) continue
    seen.add(pick.id)
    const meta = ALL_OBJECTIVES.find(x => x.id === obj.id)
    cards.push({
      ...pick,
      objectiveId: obj.id,
      objectiveTitle: meta?.title || obj.title,
    })
    if (cards.length >= 8) break
  }

  for (const fallback of FALLBACK_PROMPTS) {
    if (cards.length >= 6) break
    if (seen.has(fallback.id)) continue
    seen.add(fallback.id)
    cards.push(fallback)
  }

  return cards
}
