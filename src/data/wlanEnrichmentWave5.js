/** WLAN enrichment wave 5 — +2 traps, +2 flashcards, +1 MC for 5.8 and 5.9. */

export const WLAN_ENRICHMENT_WAVE5_PATCHES = {
  '5.8': {
    examTraps: [
      {
        id: '5.8-w5-t1',
        trap: 'WPA2 with TKIP is equivalent to WPA2-AES for CCNA.',
        correction: 'CCNA expects AES-CCMP (not TKIP) as the WPA2 encryption standard — TKIP is a legacy WPA-era cipher.',
        ckuIds: ['CKU-WLAN-SEC'],
      },
      {
        id: '5.8-w5-t2',
        trap: 'WPA2-Enterprise uses a shared PSK like Personal mode.',
        correction: 'Enterprise uses 802.1X/EAP with per-user credentials via RADIUS — Personal uses a shared PSK passphrase.',
        ckuIds: ['CKU-WLAN-SEC'],
      },
    ],
    flashcards: [
      {
        id: '5.8-w5-f1',
        ckuId: 'CKU-WLAN-SEC',
        front: 'WPA vs WPA2 encryption?',
        back: 'WPA used TKIP (legacy); WPA2 standardizes AES-CCMP — the CCNA minimum for production WLANs.',
      },
      {
        id: '5.8-w5-f2',
        ckuId: 'CKU-WLAN-SEC',
        front: 'WPA3 mandatory PMF benefit?',
        back: 'Protected Management Frames block deauthentication floods and some spoofed management attacks.',
      },
    ],
    questions: [
      {
        id: '5.8-w5-q1',
        concept: 'wpa2 aes',
        type: 'definition',
        difficulty: 'easy',
        question: 'Which cipher does CCNA expect for WPA2 WLAN encryption?',
        choices: ['WEP RC4', 'TKIP', 'AES-CCMP', '3DES'],
        correctIndex: 2,
        explanation: 'WPA2 uses AES-CCMP (CCMP) — not WEP or TKIP.',
        ckuIds: ['CKU-WLAN-SEC'],
      },
    ],
  },
  '5.9': {
    examTraps: [
      {
        id: '5.9-w5-t1',
        trap: 'A 64-character hex string is the only valid WPA2-PSK format.',
        correction: 'PSK passphrases are 8–63 printable characters; 64 hex is a raw PMK representation, not the usual WLC passphrase field.',
        ckuIds: ['CKU-WPA2-PSK'],
      },
      {
        id: '5.9-w5-t2',
        trap: 'Renaming the SSID fixes WPA2-PSK authentication failures.',
        correction: 'Auth failures are usually PSK mismatch or wrong security policy — verify WPA2-AES + PSK and the exact passphrase.',
        ckuIds: ['CKU-WPA2-PSK'],
      },
    ],
    flashcards: [
      {
        id: '5.9-w5-f1',
        ckuId: 'CKU-WPA2-PSK',
        front: 'WLC Layer 2 security for WPA2-PSK?',
        back: 'WPA2 + AES + Authentication Key Management = PSK (pre-shared key).',
      },
      {
        id: '5.9-w5-f2',
        ckuId: 'CKU-WPA2-PSK',
        front: 'Why map WLAN to a VLAN interface?',
        back: 'Clients need the correct DHCP scope — SSID maps to a dynamic interface/VLAN on the WLC.',
      },
    ],
    questions: [
      {
        id: '5.9-w5-q1',
        concept: 'wlan vlan map',
        type: 'scenario',
        difficulty: 'medium',
        question: 'On a WLC, where do you assign the VLAN/subnet for a WPA2-PSK WLAN?',
        choices: [
          'WLAN profile interface / dynamic interface mapping',
          'AP radio transmit power menu only',
          'RADIUS server shared secret field',
          'CAPWAP UDP port setting',
        ],
        correctIndex: 0,
        explanation: 'Bind the WLAN to the correct dynamic interface so clients receive addresses from the intended VLAN.',
        ckuIds: ['CKU-WPA2-PSK'],
      },
    ],
  },
}
