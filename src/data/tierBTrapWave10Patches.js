/** Tier B trap wave 10 — weakest CKU objectives (3.5 HSRP, 6.3 SDN, 6.4 DNA). */

export const TIER_B_TRAP_WAVE10_PATCHES = {
  '3.5': {
    examTraps: [
      {
        id: '3.5-w10-t1',
        trap: 'HSRP virtual IP must be configured on a physical interface IP.',
        correction: 'Virtual IP is **standby on the group** — routers use their real interface IPs plus the shared virtual IP; hosts use **only the virtual IP** as default gateway.',
        ckuIds: ['CKU-HSRP'],
      },
    ],
    flashcards: [
      {
        id: '3.5-w10-f1',
        ckuId: 'CKU-HSRP',
        front: 'HSRP hello/hold timers (default)?',
        back: 'Hello **3s**, hold **10s** — missed hellos → standby takes over.',
      },
    ],
  },
  '6.3': {
    examTraps: [
      {
        id: '6.3-w10-t1',
        trap: 'Southbound APIs are used by orchestration apps above the controller.',
        correction: '**Southbound** = controller → devices (OpenFlow, NETCONF). **Northbound** = apps → controller (REST APIs).',
        ckuIds: ['CKU-SDN'],
      },
    ],
    flashcards: [
      {
        id: '6.3-w10-f1',
        ckuId: 'CKU-SDN',
        front: 'OpenFlow role?',
        back: 'Southbound protocol — controller installs flow entries on switches (match/action).',
      },
    ],
  },
  '6.4': {
    examTraps: [
      {
        id: '6.4-w10-t1',
        trap: 'DNA Center Assurance only monitors wireless clients.',
        correction: 'Assurance collects **wired + wireless** telemetry — health scores, trends, and proactive issue detection campus-wide.',
        ckuIds: ['CKU-DNA'],
      },
    ],
    flashcards: [
      {
        id: '6.4-w10-f1',
        ckuId: 'CKU-DNA',
        front: 'DNA Center three pillars?',
        back: '**Design** (templates) | **Provision** (deploy) | **Assurance** (monitor/troubleshoot).',
      },
    ],
  },
}
