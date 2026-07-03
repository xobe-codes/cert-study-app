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
 * @returns {Promise<Array<{ id, objectiveId, objectiveTitle, prompt, coachingPoints }>>}
 */
export async function buildMockInterviewCards(progress, missed = []) {
  const summary = await buildLearnerSummary(progress, missed)
  const weak = summary.perObjective
    .filter(o => o.attempts > 0)
    .sort((a, b) => a.mastery - b.mastery)

  const cards = []
  const seen = new Set()

  for (const obj of weak) {
    const prompts = MOCK_INTERVIEW_PROMPTS[obj.id]
    if (!prompts?.length) continue
    const pick = prompts[0]
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
