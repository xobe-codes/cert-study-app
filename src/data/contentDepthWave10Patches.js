/** Content depth wave 10 — Tier B flashcard boost for objectives still at 4 FC. */

export const CONTENT_DEPTH_WAVE10_PATCHES = {
  '3.5': {
    flashcards: [{
      id: '3.5-w10-f1', ckuId: 'CKU-HSRP',
      front: 'HSRP virtual MAC format?',
      back: '**0000.0c07.acXX** — XX = group number in hex (group 1 → ac01).',
    }],
  },
  '4.2': {
    flashcards: [{
      id: '4.2-w10-f1', ckuId: 'CKU-NTP',
      front: 'NTP stratum 16 means?',
      back: '**Unsynchronized** — no valid reference clock; fix server reachability or config.',
    }],
  },
  '4.3': {
    flashcards: [{
      id: '4.3-w10-f1', ckuId: 'CKU-DHCP',
      front: 'DHCP pool default-router option?',
      back: 'Sets the client **default gateway** — without it, hosts get IP but cannot route off-segment.',
    }],
  },
  '4.6': {
    flashcards: [{
      id: '4.6-w10-f1', ckuId: 'CKU-DHCP',
      front: 'ip helper-address does what?',
      back: 'Forwards **DHCP broadcasts** (UDP 67/68) to a **remote DHCP server** — relay, not a pool.',
    }],
  },
  '5.6': {
    flashcards: [{
      id: '5.6-w10-f1', ckuId: 'CKU-PORT-SECURITY',
      front: 'Recover err-disabled port-security port?',
      back: '`shutdown` then `no shutdown` on the interface — violation mode shutdown err-disables the port.',
    }],
  },
  '5.8': {
    flashcards: [{
      id: '5.8-w10-f1', ckuId: 'CKU-WLAN-SECURITY',
      front: 'WPA2-PSK vs WPA3?',
      back: '**WPA2-PSK** = CCNA baseline shared key; **WPA3** adds SAE for stronger PSK handshake.',
    }],
  },
}
