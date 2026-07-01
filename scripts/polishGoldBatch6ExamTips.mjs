/**
 * Polish batch 6 — per-question examTip overrides (replaces domain boilerplate).
 * Run: node scripts/polishGoldBatch6ExamTips.mjs
 */
import { writeFileSync } from 'fs'
import { BATCH6_GOLD } from '../src/answerReview/goldAnswerReviewsBatch6.js'

const EXAM_TIP = {
  'obj-2.6-depth-q2': '**FlexConnect** = branch APs switch locally when WAN to WLC fails.',
  'obj-2.7-depth-q3': 'AP uplink to switch = **802.1Q trunk** for mgmt + client VLANs.',
  'obj-2.8-depth-q2': 'Clients associate but no IP → check **WLAN VLAN map + DHCP/DNS**.',
  'obj-3.6-depth-q2': 'Static route missing → verify **next-hop reachable** and interface up.',
  'obj-3.6-depth-q3': 'Valid route table ≠ ping success — **ACLs** can block ICMP.',
  'obj-3.6-depth-q4': 'Flapping + CRC → **Layer 1/2** before blaming routing protocol.',
  'obj-3.6-depth-q5': 'Local ping OK, remote fails → **default route / gateway** first.',
  'obj-3.6-depth-q6': 'OSPF neighbors up, no routes → **area / network statement / passive**.',
  'obj-3.6-depth-q7': 'No route install → fix **interface up/up** on egress path first.',
  'obj-4.10-depth-q3': 'Always keep **local/out-of-band** access when cloud is down.',
  'obj-4.10-depth-q5': 'Templates at scale beat **one-off CLI** on every box.',
  'obj-4.10-depth-q7': 'Outage playbook: **console/local CLI** still works.',
  'obj-4.2-depth-q4': 'Cross-device log correlation needs **NTP-synced clocks**.',
  'obj-4.3-depth-q3': 'Name fails, IP works → **DNS server IP** from DHCP/static.',
  'obj-4.4-depth-q7': 'SNMP polling = manager-initiated **GET** on UDP 161.',
  'obj-4.5-depth-q2': 'Wrong event order in logs → **NTP not synchronized**.',
  'obj-4.5-depth-q5': 'Centralized syslog = audit + **faster MTTR**.',
  'obj-4.5-depth-q7': 'Clock stuck at 1993 → set **NTP** or manual clock.',
  'obj-4.6-depth-q3': 'No DHCP offer → **relay, pool, server reachability** — in that order.',
  'obj-4.6-depth-q6': 'Each routed client SVI needing DHCP needs its own **ip helper-address**.',
  'obj-4.6-depth-q7': '**ip helper-address** goes on the **client-facing router/SVI**, not the server.',
  'obj-4.8-depth-q4': 'Local login: **username + login local** on **line vty**.',
  'obj-4.8-depth-q6': 'SSH keys need **`ip domain-name`** before `crypto key generate rsa`.',
  'obj-5.10-depth-q6': 'Untrusted path traffic → **encrypt** (VPN/IPsec class).',
  'obj-5.11-depth-q3': '**DMZ** = exposed services with controlled inbound from Internet.',
  'obj-5.11-depth-q6': 'Same VLAN = same **broadcast domain** — no L3 boundary.',
  'obj-5.2-depth-q3': 'Security program = **people + process + technology**.',
  'obj-5.3-depth-q3': '**login local** does not encrypt — use **SSH** on vty.',
  'obj-5.3-depth-q7': 'Enable SSH only after **crypto key** exists.',
  'obj-5.4-depth-q5': 'Central creds/policy → **TACACS+/RADIUS** (AAA servers).',
  'obj-5.6-depth-q5': 'Rogue DHCP → **DHCP snooping** on access ports.',
  'obj-5.8-depth-q7': 'Guest WLAN → **isolated VLAN**, not corporate flat.',
  'obj-6.1-depth-q2': 'Automation shifts work to **templates/code + verification**.',
  'obj-6.2-depth-q4': 'Traditional = **per-device CLI** control plane.',
  'obj-6.2-depth-q7': 'Real networks mix **controller intent + box verification**.',
  'obj-6.3-depth-q5': 'Apps/orchestration talk **northbound** to the controller.',
  'obj-6.4-depth-q4': 'DNA Center augments — does not remove **local CLI troubleshooting**.',
  'obj-6.4-depth-q6': 'Traditional ops pain = **repetitive CLI** at scale.',
  'obj-6.6-depth-q7': 'Repeatable config → **Ansible/playbooks** (desired state).',
  '3.6-legacy-q001': 'Same prefix, multiple sources → lowest **AD** wins.',
  '3.6-legacy-q006': '**Floating static** = higher AD backup when primary fails.',
  '4.1-q9': 'NAT ACL must match **inside local** addresses permitted to translate.',
  '4.10-legacy-q002': 'Fleet-wide template push → **cloud controller** (DNA Center class).',
  '4.10-legacy-q010': 'Cloud dashboard unreachable → fall back to **local CLI/console**.',
  '4.9-en-q2': 'Sensitive IOS copy → **SCP/SFTP**, not cleartext TFTP.',
  '5.11-legacy-q005': 'Flat LAN → malware **lateral movement** with no segmentation.',
  '5.11-legacy-q008': 'Guest users → **dedicated VLAN/subnet + policy**, not corp flat.',
  '5.11-legacy-q010': 'Device admin → **out-of-band mgmt** network isolated from users.',
  '5.4-legacy-q009': '**Accounting** logs what the user did after authZ.',
  '5.9-en-q3': 'Wrong client subnet after join → **SSID → VLAN interface** mapping.',
}

const entries = { ...BATCH6_GOLD }
let updated = 0
for (const [id, tip] of Object.entries(EXAM_TIP)) {
  if (!entries[id]) {
    console.error('missing id', id)
    continue
  }
  entries[id] = { ...entries[id], examTip: tip }
  updated++
}

const lines = [
  '/** Gold reviews — Batch 6: ordering/scenario/troubleshooting domains 2–6 (polished exam tips). */',
  'export const BATCH6_GOLD = {',
]
for (const [id, rev] of Object.entries(entries)) {
  lines.push(`  '${id}': ${JSON.stringify(rev, null, 2).replace(/\n/g, '\n  ')},`)
}
lines.push('}', '')

writeFileSync('src/answerReview/goldAnswerReviewsBatch6.js', lines.join('\n'))
console.error(`Polished examTip on ${updated}/${Object.keys(entries).length} entries`)
