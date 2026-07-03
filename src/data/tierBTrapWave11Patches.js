/** Tier B trap wave 11 — CDP, EtherChannel, STP, WLC/WLAN (2.3–2.8) to 4+ traps each. */

export const TIER_B_TRAP_WAVE11_PATCHES = {
  '2.3': {
    examTraps: [
      {
        id: '2.3-w11-t1',
        trap: 'CDP and LLDP discover neighbors using TCP sessions.',
        correction: 'Both use **Layer 2 multicast** frames — CDP to `01:00:0c:cc:cc:cc`, LLDP to `01:80:c2:00:00:0e` — no TCP handshake.',
        ckuIds: ['CKU-CDP'],
      },
    ],
    flashcards: [
      {
        id: '2.3-w11-f1',
        ckuId: 'CKU-CDP',
        front: 'Verify CDP neighbors?',
        back: '`show cdp neighbors` / `detail` — device ID, platform, local/remote port, capabilities.',
      },
    ],
  },
  '2.4': {
    examTraps: [
      {
        id: '2.4-w11-t1',
        trap: 'LACP passive on both ends still forms a working EtherChannel.',
        correction: '**One active, one passive** — if **both passive**, negotiation never completes and the bundle stays down.',
        ckuIds: ['CKU-LACP'],
      },
    ],
    flashcards: [
      {
        id: '2.4-w11-f1',
        ckuId: 'CKU-LACP',
        front: 'LACP modes (CCNA)?',
        back: '**active** negotiates | **passive** waits — pair active/passive or active/active; `on` = no PAgP/LACP.',
      },
    ],
  },
  '2.5': {
    examTraps: [
      {
        id: '2.5-w11-t1',
        trap: 'BPDU Guard and Root Guard both prevent loops on access ports the same way.',
        correction: '**BPDU Guard** err-disables a port that receives BPDUs (access/PortFast). **Root Guard** blocks superior BPDUs on designated ports to stop root hijack.',
        ckuIds: ['CKU-STP'],
      },
    ],
    flashcards: [
      {
        id: '2.5-w11-f1',
        ckuId: 'CKU-STP',
        front: 'Root bridge tie-break?',
        back: 'Lowest **bridge priority** wins; tie → lowest **MAC address**.',
      },
    ],
  },
  '2.6': {
    examTraps: [
      {
        id: '2.6-w11-t1',
        trap: 'CAPWAP tunnels use TCP ports 5246 and 5247.',
        correction: 'CAPWAP is **UDP** — **5246** control, **5247** data — between lightweight AP and WLC.',
        ckuIds: ['CKU-WLAN-ARCH'],
      },
    ],
    flashcards: [
      {
        id: '2.6-w11-f1',
        ckuId: 'CKU-WLAN-ARCH',
        front: 'Local vs FlexConnect AP mode?',
        back: '**Local** = client traffic tunneled to WLC | **FlexConnect** = can switch locally at AP (WAN-down survivability).',
      },
    ],
  },
  '2.7': {
    examTraps: [
      {
        id: '2.7-w11-t1',
        trap: 'Lightweight APs discover the WLC only via manually configured IP.',
        correction: 'Discovery uses **DHCP option 43**, **DNS**, or **static** primary controller — option 43 is common in campus DHCP scopes.',
        ckuIds: ['CKU-WLAN-PHYS'],
      },
    ],
    flashcards: [
      {
        id: '2.7-w11-f1',
        ckuId: 'CKU-WLAN-PHYS',
        front: 'AP uplink VLAN design?',
        back: 'Trunk with **management VLAN** + **client SSID VLANs** — AP is infrastructure, not an access port for users.',
      },
    ],
  },
  '2.8': {
    examTraps: [
      {
        id: '2.8-w11-t1',
        trap: 'WLAN RSSI −70 dBm is stronger than −50 dBm.',
        correction: 'Closer to **zero is stronger** — **−50 dBm** beats **−70 dBm** (more negative = weaker signal).',
        ckuIds: ['CKU-WLAN-CLIENT'],
      },
    ],
    flashcards: [
      {
        id: '2.8-w11-f1',
        ckuId: 'CKU-WLAN-CLIENT',
        front: 'Client stuck on authenticating?',
        back: 'Check **WPA2-AES PSK**, VLAN/DHCP reachability, and **RADIUS** if 802.1X enterprise.',
      },
    ],
  },
}
