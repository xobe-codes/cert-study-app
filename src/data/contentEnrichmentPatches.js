/** Additive content merges — traps, flashcards, engineerView, supplemental questions. */

const ENGINEER_21 = {
  title: 'Engineer view — VLAN verify',
  summary: 'When hosts “can’t talk,” verify VLAN membership before chasing routing.',
  verifyCommands: [
    { command: 'show vlan brief', purpose: 'Maps VLANs to access ports — first check for wrong VLAN assignment.' },
    { command: 'show interfaces trunk', purpose: 'Confirms trunk encapsulation, allowed VLANs, and native VLAN on uplinks.' },
  ],
  symptoms: [
    'PCs in the same IP subnet cannot ping — often different VLANs or missing trunk.',
    'New VLAN exists in config but ports show “inactive” — VLAN not created on switch.',
  ],
  trapCallout: {
    trap: 'Native VLAN mismatch on trunks',
    correction: 'Native VLAN must match both ends; mismatch merges untagged traffic and triggers CDP warning.',
  },
}

const ENGINEER_25 = {
  title: 'Engineer view — STP verify',
  summary: 'Loop symptoms (broadcast storm) or one-way traffic → check STP roles first.',
  verifyCommands: [
    { command: 'show spanning-tree vlan 1', purpose: 'Shows root bridge, root/designated/blocking ports, and path costs.' },
    { command: 'show spanning-tree interface gi0/1', purpose: 'Port-level role/state — confirms blocking vs forwarding.' },
  ],
  symptoms: [
    'Switch CPU at 100% with flapping MACs — classic L2 loop; find blocked/redundant links.',
    'Access port slow to forward — PortFast missing; BPDU received on PortFast port → err-disabled.',
  ],
  trapCallout: {
    trap: 'PortFast on switch-to-switch link',
    correction: 'PortFast only on host access ports; on trunks it risks instant loops if STP fails.',
  },
}

const ENGINEER_31 = {
  title: 'Engineer view — routing table interpret',
  summary: 'Read one line at a time: code → prefix → [AD/metric] → next-hop → interface.',
  verifyCommands: [
    { command: 'show ip route', purpose: 'Full table — check code (C/S/O/D), AD/metric, next-hop, exit interface.' },
    { command: 'show ip route 10.0.0.0', purpose: 'Longest-prefix lookup for a specific destination.' },
  ],
  symptoms: [
    'Host reaches local subnet but not internet — missing default route or wrong gateway of last resort.',
    'Route present but traffic black-holed — outgoing interface down; C/L routes disappear when intf fails.',
  ],
  trapCallout: {
    trap: '[metric/AD] bracket order',
    correction: 'Always [AD/metric] — e.g. [110/20] is AD 110 (OSPF), metric 20. Not reversed.',
  },
  interpretExample: {
    line: 'O 192.168.2.0/24 [110/20] via 10.1.1.1, 00:01:23, Gi0/0',
    parts: [
      'O = OSPF learned',
      '/24 = destination prefix',
      '[110/20] = AD 110, OSPF cost 20',
      'via 10.1.1.1 = next-hop',
      'Gi0/0 = exit interface',
    ],
  },
}

export const CONTENT_ENRICHMENT_PATCHES = {
  '2.1': { engineerView: ENGINEER_21 },
  '2.5': { engineerView: ENGINEER_25 },
  '3.1': { engineerView: ENGINEER_31 },
  '5.9': {
    examTraps: [
      { id: '5.9-t1', trap: 'Using WPA2-TKIP as best practice.', correction: 'CCNA expects WPA2-AES (CCMP) with PSK for personal WLANs.', ckuIds: ['CKU-WPA2-PSK'] },
      { id: '5.9-t2', trap: 'PSK shared = same encryption key for all sessions.', correction: '4-way handshake derives unique per-session keys (PTK) from the passphrase.', ckuIds: ['CKU-WPA2-PSK'] },
      { id: '5.9-t3', trap: 'Forgetting WLAN-to-VLAN mapping.', correction: 'SSID must map to a VLAN interface so clients get correct IP scope.', ckuIds: ['CKU-WPA2-PSK'] },
    ],
    flashcards: [
      { id: '5.9-f1', ckuId: 'CKU-WPA2-PSK', front: 'WPA2-Personal encryption?', back: 'WPA2 with AES (CCMP) and PSK passphrase.' },
      { id: '5.9-f2', ckuId: 'CKU-WPA2-PSK', front: 'PSK length requirement?', back: '8–63 characters.' },
      { id: '5.9-f3', ckuId: 'CKU-WPA2-PSK', front: 'What does the 4-way handshake do?', back: 'Derives unique per-session keys from the shared passphrase.' },
      { id: '5.9-f4', ckuId: 'CKU-WPA2-PSK', front: 'WLAN Layer 2 security setting for PSK?', back: 'WPA2 + AES + PSK (Authentication Key Management = PSK).' },
    ],
    questions: [
      { id: '5.9-en-q1', concept: 'wpa2 aes', type: 'definition', difficulty: 'easy', question: 'Which encryption is expected for WPA2-PSK on CCNA?', choices: ['WEP', 'TKIP only', 'AES (CCMP)', 'RC4'], correctIndex: 2, explanation: 'WPA2-Personal uses AES/CCMP with a PSK.', ckuIds: ['CKU-WPA2-PSK'] },
      { id: '5.9-en-q2', concept: 'psk length', type: 'definition', difficulty: 'easy', question: 'Valid WPA2-PSK passphrase length?', choices: ['1–7 chars', '8–63 chars', 'Exactly 64 hex', 'No minimum'], correctIndex: 1, explanation: 'PSK passphrases are 8–63 characters.', ckuIds: ['CKU-WPA2-PSK'] },
      { id: '5.9-en-q3', concept: 'vlan map', type: 'scenario', difficulty: 'medium', question: 'Clients associate to SSID but get wrong subnet. First check?', choices: ['Change PSK', 'WLAN VLAN/interface mapping', 'Disable 5 GHz', 'Increase beacon interval'], correctIndex: 1, explanation: 'SSID must map to the correct VLAN interface for DHCP scope.', ckuIds: ['CKU-WPA2-PSK'] },
    ],
  },
  '6.1': {
    examTraps: [
      { id: '6.1-t1', trap: 'Automation eliminates need for networking knowledge.', correction: 'Automation scales expert knowledge — you still need correct design and troubleshooting skills.', ckuIds: ['CKU-AUTOMATION'] },
      { id: '6.1-t2', trap: 'Scripts guarantee zero outages.', correction: 'Automation reduces human error; change windows and validation still required.', ckuIds: ['CKU-AUTOMATION'] },
    ],
    flashcards: [
      { id: '6.1-f1', ckuId: 'CKU-AUTOMATION', front: 'Top ops benefit of network automation?', back: 'Faster, repeatable changes with fewer manual CLI errors.' },
      { id: '6.1-f2', ckuId: 'CKU-AUTOMATION', front: 'Infrastructure as Code means?', back: 'Device config defined in versioned templates/playbooks, not one-off CLI.' },
    ],
  },
  '6.2': {
    examTraps: [
      { id: '6.2-t1', trap: 'SDN removes the data plane from switches.', correction: 'Data plane stays distributed on devices; control plane centralizes on controller.', ckuIds: ['CKU-SDN-TRAD'] },
    ],
    flashcards: [
      { id: '6.2-f1', ckuId: 'CKU-SDN-TRAD', front: 'Traditional vs controller-based control plane?', back: 'Traditional: per-device. SDN: centralized controller pushes policy.' },
      { id: '6.2-f2', ckuId: 'CKU-SDN-TRAD', front: 'Main benefit of centralized control?', back: 'Consistent policy, visibility, and API-driven changes at scale.' },
    ],
  },
  '6.3': {
    examTraps: [
      { id: '6.3-t1', trap: 'OpenFlow is the only southbound API.', correction: 'Southbound includes NETCONF, CLI, SNMP — OpenFlow is one option.', ckuIds: ['CKU-SDN-ARCH'] },
    ],
    flashcards: [
      { id: '6.3-f1', ckuId: 'CKU-SDN-ARCH', front: 'Northbound vs southbound API?', back: 'Northbound: apps to controller. Southbound: controller to devices.' },
      { id: '6.3-f2', ckuId: 'CKU-SDN-ARCH', front: 'SDN separates which planes?', back: 'Control plane (controller) from data plane (forwarding on devices).' },
    ],
  },
  '6.4': {
    examTraps: [
      { id: '6.4-t1', trap: 'DNA Center replaces all CLI troubleshooting.', correction: 'DNA adds assurance and automation; engineers still verify with CLI/show commands.', ckuIds: ['CKU-DNA'] },
    ],
    flashcards: [
      { id: '6.4-f1', ckuId: 'CKU-DNA', front: 'DNA Center over box-by-box CLI?', back: 'Centralized design, provisioning, assurance, and image management.' },
      { id: '6.4-f2', ckuId: 'CKU-DNA', front: 'Intent-based networking?', back: 'Declare desired outcome; controller translates to device config.' },
    ],
  },
  '6.5': {
    examTraps: [
      { id: '6.5-t1', trap: 'REST maintains server session state between requests.', correction: 'REST is stateless — each HTTP request carries complete context.', ckuIds: ['CKU-REST'] },
      { id: '6.5-t2', trap: 'POST is always idempotent.', correction: 'GET/PUT/DELETE are idempotent; POST creates and may have side effects.', ckuIds: ['CKU-REST'] },
    ],
    flashcards: [
      { id: '6.5-f1', ckuId: 'CKU-REST', front: 'REST HTTP methods for CRUD?', back: 'GET read, POST create, PUT/PATCH update, DELETE remove.' },
      { id: '6.5-f2', ckuId: 'CKU-REST', front: 'Common success/error codes?', back: '200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found.' },
    ],
  },
  '6.6': {
    examTraps: [
      { id: '6.6-t1', trap: 'JSON allows comments like JavaScript.', correction: 'JSON has no comments — only key-value pairs, arrays, strings, numbers, booleans, null.', ckuIds: ['CKU-JSON-ANSIBLE'] },
      { id: '6.6-t2', trap: 'Ansible requires agents on network devices.', correction: 'Ansible is agentless — uses SSH/NETCONF from control node.', ckuIds: ['CKU-JSON-ANSIBLE'] },
    ],
    flashcards: [
      { id: '6.6-f1', ckuId: 'CKU-JSON-ANSIBLE', front: 'JSON structure basics?', back: 'Objects {key:value}, arrays [], strings, numbers, booleans, null.' },
      { id: '6.6-f2', ckuId: 'CKU-JSON-ANSIBLE', front: 'Ansible vs Puppet/Chef model?', back: 'Ansible: agentless push via SSH. Puppet/Chef: often agent pull to master.' },
    ],
  },
}

/** Merge enrichment patch into a curated objective object. */
export function applyContentEnrichment(base, objectiveId) {
  const patch = CONTENT_ENRICHMENT_PATCHES[objectiveId]
  if (!patch || !base) return base
  const mergeList = (a, b) => (b?.length ? [...(a || []), ...b] : a)
  return {
    ...base,
    ...(patch.engineerView ? { engineerView: patch.engineerView } : {}),
    examTraps: mergeList(base.examTraps, patch.examTraps),
    flashcards: mergeList(base.flashcards, patch.flashcards),
    questions: mergeList(base.questions, patch.questions),
  }
}
