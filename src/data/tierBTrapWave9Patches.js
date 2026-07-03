/** Tier B trap wave 9 — final objectives not covered in waves 4–8. */

export const TIER_B_TRAP_WAVE9_PATCHES = {
  '1.2': {
    examTraps: [
      { id: '1.2-w9-t1', trap: 'Spine-leaf is the same as classic three-tier with a renamed core.', correction: 'Spine-leaf uses **every spine ↔ every leaf** (Clos) for east-west scale; three-tier is access→distribution→core hierarchy.', ckuIds: ['CKU-TOPOLOGY'] },
    ],
    flashcards: [
      { id: '1.2-w9-f1', ckuId: 'CKU-TOPOLOGY', front: 'Three-tier vs spine-leaf?', back: 'Three-tier = access/dist/core | Spine-leaf = leaf hosts + spine switching fabric (data center scale).' },
    ],
  },
  '1.3': {
    examTraps: [
      { id: '1.3-w9-t1', trap: 'Single-mode fiber uses a wider core than multimode for longer runs.', correction: '**Single-mode** has a **narrower** core (one light path, long distance); **multimode** has wider core for shorter campus runs.', ckuIds: ['CKU-CABLING'] },
    ],
    flashcards: [
      { id: '1.3-w9-f1', ckuId: 'CKU-CABLING', front: 'SMF vs MMF core?', back: 'SMF = narrow core, laser, long haul | MMF = wider core, LED/VCSEL, campus/DC short links.' },
    ],
  },
  '1.4': {
    examTraps: [
      { id: '1.4-w9-t1', trap: 'Speed mismatch always shows as interface down/down.', correction: 'Duplex/speed **mismatch** often stays **up/up** with **late collisions, FCS errors, and slow throughput** — check `show interfaces` counters.', ckuIds: ['CKU-CABLE-ISSUES'] },
    ],
    flashcards: [
      { id: '1.4-w9-f1', ckuId: 'CKU-CABLE-ISSUES', front: 'Speed/duplex mismatch symptom?', back: 'Up/up but errors, collisions, poor performance — fix both ends to match (auto or hard-set).' },
    ],
  },
  '1.11': {
    examTraps: [
      { id: '1.11-w9-t1', trap: '2.4 GHz has more non-overlapping channels than 5 GHz in most regions.', correction: '**2.4 GHz** has **3** non-overlapping 20 MHz channels (1, 6, 11); **5 GHz** offers many more — plan for co-channel interference on 2.4.', ckuIds: ['CKU-WLAN-PRINCIPLES'] },
    ],
    flashcards: [
      { id: '1.11-w9-f1', ckuId: 'CKU-WLAN-PRINCIPLES', front: 'Non-overlap 2.4 GHz channels?', back: 'Use **1, 6, 11** (20 MHz) — wider channels reduce usable non-overlap set.' },
    ],
  },
  '1.12': {
    examTraps: [
      { id: '1.12-w9-t1', trap: 'Containers include a full guest OS like a Type 2 hypervisor VM.', correction: 'Containers share the **host OS kernel** — lighter than VMs; hypervisor runs **multiple isolated guest OS instances**.', ckuIds: ['CKU-VIRTUALIZATION'] },
    ],
    flashcards: [
      { id: '1.12-w9-f1', ckuId: 'CKU-VIRTUALIZATION', front: 'VM vs container?', back: 'VM = full guest OS on hypervisor | Container = app + libs, shared kernel (Docker-style).' },
    ],
  },
  '4.10': {
    examTraps: [
      { id: '4.10-w9-t1', trap: 'Cloud management always eliminates the need for local CLI on switches.', correction: 'Cloud controllers (DNA Center, Meraki dashboard) **centralize** policy — devices still need **local management fallback** (console/SSH) when cloud is unreachable.', ckuIds: ['CKU-CLOUD-MGMT'] },
    ],
    flashcards: [
      { id: '4.10-w9-f1', ckuId: 'CKU-CLOUD-MGMT', front: 'Local vs cloud management?', back: 'Local = CLI/SSH on box | Cloud = centralized dashboard/API — often both for resilience.' },
    ],
  },
  '5.9': {
    examTraps: [
      { id: '5.9-w9-t1', trap: 'WPA2-PSK and WPA3-Enterprise use the same authentication model.', correction: '**PSK** = shared passphrase for all clients; **Enterprise (802.1X)** = per-user credentials via RADIUS — CCNA WPA2 PSK is **personal** mode.', ckuIds: ['CKU-WPA2-PSK'] },
    ],
    flashcards: [
      { id: '5.9-w9-f1', ckuId: 'CKU-WPA2-PSK', front: 'WPA2 Personal vs Enterprise?', back: 'Personal = **PSK** (pre-shared key) | Enterprise = **802.1X + RADIUS** per user/device.' },
    ],
  },
}
