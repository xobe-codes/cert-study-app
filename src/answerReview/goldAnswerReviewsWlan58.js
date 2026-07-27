/** Gold reviews — objective 5.8 WLAN wireless security (remaining bank IDs). */
export const WLAN_58_GOLD = {
  'obj-5.9-source-q001': {
    correct: {
      choiceIndex: 0,
      explanation: 'Enable WPA2 (PSK with a passphrase on SOHO) authenticates joining clients and encrypts traffic — that is the practical assurance that only her devices can join.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'MAC filtering is weak — MAC addresses are easily spoofed, so it does not assure only her devices join.',
        misconceptionTested: 'Treating MAC filtering as stronger than WPA2',
      },
      {
        choiceIndex: 2,
        explanation: 'Port security is a switch access-port feature — not wireless client admission on a SOHO AP.',
        misconceptionTested: 'Applying switch port security to WLAN admission',
      },
      {
        choiceIndex: 3,
        explanation: 'Hiding the SSID does not stop unauthorized clients who know the name — it is obfuscation, not authentication.',
        misconceptionTested: 'Treating hidden SSID as access control',
      },
    ],
    examTip: 'SOHO join assurance → WPA2/WPA3 with passphrase. MAC filter is spoofable — never prefer it over WPA2.',
  },
  'obj-5.9-source-q002': {
    correct: {
      choiceIndex: 1,
      explanation: 'WPA2-Enterprise requires 802.1X with a RADIUS/EAP infrastructure for per-user authentication — not a shared PSK. Certificates are used by some EAP types, but RADIUS/EAP is the CCNA key idea.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'PSK is for WPA2-Personal — Enterprise mode uses per-user credentials via RADIUS/EAP.',
        misconceptionTested: 'Applying personal WPA2 (PSK) to enterprise',
      },
      {
        choiceIndex: 2,
        explanation: '192-bit security is a WPA3-Enterprise option — not the baseline requirement for WPA2-Enterprise.',
        misconceptionTested: 'Mixing WPA3-192 requirements into WPA2-Enterprise',
      },
      {
        choiceIndex: 3,
        explanation: '802.11ac is a Wi-Fi generation/PHY standard — unrelated to enterprise authentication requirements.',
        misconceptionTested: 'Confusing radio standard with AAA requirements',
      },
    ],
    examTip: 'WPA2-Enterprise → 802.1X + RADIUS/EAP. Personal → PSK. Certs = some EAP methods, not the whole answer.',
  },
  'obj-5.9-source-q003': {
    correct: {
      choiceIndex: 1,
      explanation: 'MIC (Message Integrity Check) in WPA detects tampering and replay of data frames.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'TKIP is the encryption/key mixing protocol — MIC is the integrity piece that catches altered/replayed frames.',
        misconceptionTested: 'Equating TKIP encryption with integrity checking',
      },
      {
        choiceIndex: 2,
        explanation: 'AES encrypts frame payload in WPA2 — the WPA-era integrity mechanism tested here is MIC.',
        misconceptionTested: 'Naming encryption when integrity is asked',
      },
      {
        choiceIndex: 3,
        explanation: 'CRC is a basic error check on wired Ethernet — not the WPA anti-replay/integrity control.',
        misconceptionTested: 'Using Ethernet CRC thinking for WPA integrity',
      },
    ],
    examTip: 'WPA integrity/replay → MIC. WPA2 confidentiality → AES-CCMP.',
  },
  'obj-5.9-source-q004': {
    correct: {
      choiceIndex: 2,
      explanation: 'WPA3-Enterprise optional 192-bit security mode (GCMP-256) is the highest strength option in the blueprint.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '64-bit strength is far below WPA3-Enterprise high-security modes — not the exam answer for strongest WPA3-Enterprise.',
        misconceptionTested: 'Understating WPA3 key strength options',
      },
      {
        choiceIndex: 1,
        explanation: '128-bit is common for WPA2-AES — WPA3-Enterprise highest mode is 192-bit in CCNA stems.',
        misconceptionTested: 'Stopping at WPA2-era 128-bit for WPA3-Enterprise',
      },
      {
        choiceIndex: 3,
        explanation: '256-bit is not the named WPA3-Enterprise high-security mode in Cisco CCNA material — 192-bit is keyed.',
        misconceptionTested: 'Guessing 256-bit without matching WPA3-Enterprise options',
      },
    ],
    examTip: 'WPA3-Enterprise strongest common exam answer → 192-bit (GCMP-256 suite).',
  },
  'obj-5.9-source-q005': {
    correct: {
      choiceIndex: 2,
      explanation: 'WPA was introduced to replace WEP because WEP encryption was broken — not for coverage or rebranding alone.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'WEP predates WPA — WPA came later as an interim fix before WPA2/802.11i.',
        misconceptionTested: 'Thinking WPA and WEP shipped together',
      },
      {
        choiceIndex: 1,
        explanation: 'WPA addresses cryptographic weakness — RF coverage is a physical/placement issue, not what WPA fixed.',
        misconceptionTested: 'Confusing RF coverage with encryption upgrades',
      },
      {
        choiceIndex: 3,
        explanation: 'WPA introduced TKIP/MIC improvements — it was a security fix, not a simple WEP rebrand.',
        misconceptionTested: 'Dismissing WPA as marketing-only',
      },
    ],
    examTip: 'History trap: WEP broken → WPA (TKIP/MIC) → WPA2 (AES-CCMP) → WPA3 (SAE).',
  },
  'obj-5.9-source-q006': {
    correct: {
      choiceIndex: 1,
      explanation: '802.11i (WPA2) standardizes robust frame-level encryption — AES-CCMP protecting data frames.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Certificates support enterprise 802.1X — 802.11i’s core addition to WPA2 is strong frame encryption (AES-CCMP).',
        misconceptionTested: 'Naming AAA certs instead of 802.11i encryption',
      },
      {
        choiceIndex: 2,
        explanation: 'PSKs existed in WPA Personal before 802.11i — the standard’s big leap is AES-based frame encryption.',
        misconceptionTested: 'Crediting PSK to 802.11i',
      },
      {
        choiceIndex: 3,
        explanation: 'CRC checking is not the 802.11i security upgrade — CCMP/AES replaces WEP/TKIP weaknesses.',
        misconceptionTested: 'Choosing legacy integrity instead of AES-CCMP',
      },
    ],
    examTip: '802.11i = WPA2 → AES-CCMP frame encryption.',
  },
  'obj-5.9-source-q007': {
    correct: {
      choiceIndex: 2,
      explanation: 'WPA2 (802.11i) uses AES-CCMP for confidentiality — replacing WEP/TKIP ciphers.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'RC4 underpinned WEP/TKIP — WPA2 moved to AES-CCMP, not RC4.',
        misconceptionTested: 'Selecting legacy RC4 for WPA2',
      },
      {
        choiceIndex: 1,
        explanation: 'MD5 is a hash used in other contexts — WPA2 data-plane encryption is AES-CCMP.',
        misconceptionTested: 'Confusing hash algorithms with WLAN cipher',
      },
      {
        choiceIndex: 3,
        explanation: 'SHA1 appears in handshake/auth contexts — the WPA2 encryption mode tested is AES-CCMP.',
        misconceptionTested: 'Naming SHA1 instead of AES-CCMP',
      },
    ],
    examTip: 'WPA2 cipher → AES-CCMP. TKIP/RC4 = legacy/WPA1 era.',
  },
  'obj-5.9-source-q008': {
    correct: {
      choiceIndex: 2,
      explanation: 'WPA3-Personal replaces WPA2 PSK with SAE (Simultaneous Authentication of Equals) — stronger against offline guessing.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Certificate-based auth is enterprise 802.1X — WPA3-Personal’s headline upgrade is SAE for PSK networks.',
        misconceptionTested: 'Applying enterprise certs to WPA3-Personal',
      },
      {
        choiceIndex: 1,
        explanation: 'Frame encryption existed in WPA2 — SAE is the WPA3 authentication upgrade for personal networks.',
        misconceptionTested: 'Crediting generic encryption instead of SAE',
      },
      {
        choiceIndex: 3,
        explanation: 'TKIP is legacy — WPA3 moves forward with SAE + stronger ciphers, not TKIP.',
        misconceptionTested: 'Selecting TKIP on a WPA3 question',
      },
    ],
    examTip: 'WPA3-Personal headline → SAE. WPA3-Enterprise → optional 192-bit modes.',
  },
  'obj-5.9-source-q011': {
    correct: {
      choiceIndex: 0,
      explanation: 'WPA2-Personal uses a Pre-Shared Key — one symmetric passphrase shared by all clients on the SSID.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'AES-CCMP is the encryption cipher — authentication with a shared passphrase is PSK mode.',
        misconceptionTested: 'Naming the cipher instead of the PSK auth mode',
      },
      {
        choiceIndex: 2,
        explanation: 'Certificates are used in WPA2-Enterprise 802.1X — not the symmetric-key personal mode.',
        misconceptionTested: 'Mixing enterprise cert auth with PSK personal',
      },
      {
        choiceIndex: 3,
        explanation: 'TKIP is a legacy cipher option — symmetric-key authentication in WPA2-Personal is PSK.',
        misconceptionTested: 'Selecting TKIP when auth mechanism is asked',
      },
    ],
    examTip: 'Symmetric shared key on WPA2 → PSK (Personal). Per-user → Enterprise + RADIUS.',
  },
}
