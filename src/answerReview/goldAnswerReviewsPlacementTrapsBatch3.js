/** Gold debrief polish — placement v2 trap stems (full objective coverage additions). */
export const PLACEMENT_TRAP_GOLD_BATCH3 = {
  '1.9-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: '**2000::/3** is the IPv6 global unicast range — publicly routable addresses.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '**FE80::/10** is link-local — not globally routable public unicast.', misconceptionTested: 'Confusing link-local with global unicast' },
      { choiceIndex: 2, explanation: '**FC00::/7** is unique local (ULA) — private-like, not global public unicast.', misconceptionTested: 'Mixing ULA with global unicast' },
      { choiceIndex: 3, explanation: '**FF00::/8** is multicast — not unicast public addressing.', misconceptionTested: 'Selecting multicast range for unicast question' },
    ],
    examTip: 'Global unicast = **2000::/3**. Link-local = **FE80::/10**. ULA = **FC00::/7**.',
  },
  '1.10-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: '**`ipconfig /all`** on Windows shows IP address, subnet mask, default gateway, and DNS servers.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '**`netstat`** shows connections and listening ports — not full IP configuration.', misconceptionTested: 'Using netstat for IP config dump' },
      { choiceIndex: 2, explanation: '**`arp -a`** shows MAC/IP bindings — not mask, gateway, or DNS.', misconceptionTested: 'Checking ARP table for DHCP parameters' },
      { choiceIndex: 3, explanation: '**`route print`** shows routing table — combine with ipconfig for full host troubleshooting.', misconceptionTested: 'Relying on route print alone for IP config' },
    ],
    examTip: 'Windows host IP check → **`ipconfig /all`**. Linux → **`ip addr`**.',
  },
  '1.11-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'In 2.4 GHz, channels **1, 6, and 11** are non-overlapping in common 20 MHz planning.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'Channels 1, 2, 3 overlap — only **1, 6, 11** avoid overlap in typical US planning.', misconceptionTested: 'Using adjacent overlapping channels' },
      { choiceIndex: 2, explanation: '6, 7, 8 overlap each other — not the standard non-overlapping set.', misconceptionTested: 'Picking overlapping mid-band channels' },
      { choiceIndex: 3, explanation: 'Channel 13 is region-dependent — exam default non-overlapping set is **1, 6, 11**.', misconceptionTested: 'Region-specific channels on generic exam question' },
    ],
    examTip: '2.4 GHz non-overlapping (exam default): **1, 6, 11**.',
  },
  '1.12-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: '**VMware ESXi** runs directly on bare metal — a Type 1 hypervisor.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'Workstation runs on top of Windows — Type 2 (hosted) hypervisor, not bare-metal Type 1.', misconceptionTested: 'Classifying hosted hypervisor as Type 1' },
      { choiceIndex: 2, explanation: 'Docker Desktop is container tooling on a host OS — not a bare-metal hypervisor.', misconceptionTested: 'Equating containers with Type 1 hypervisor' },
      { choiceIndex: 3, explanation: 'A physical router forwards packets — it is not a hypervisor.', misconceptionTested: 'Confusing network hardware with virtualization' },
    ],
    examTip: 'Type 1 = **bare metal** (ESXi, Hyper-V on hardware). Type 2 = **runs on OS** (Workstation).',
  },
  'obj-4.9-source-q001': {
    correct: {
      choiceIndex: 2,
      explanation: '**`copy tftp: running-config`** restores a saved config from TFTP directly into **running-config**.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '**`archive tftp:`** manages configuration archives — standard restore uses **`copy tftp: running-config`**.', misconceptionTested: 'archive tftp for config restore' },
      { choiceIndex: 1, explanation: '**`restore tftp://...`** is not valid IOS — use interactive **`copy tftp: running-config`**.', misconceptionTested: 'restore tftp URL command' },
      { choiceIndex: 3, explanation: '**`copy server:`** is not the TFTP syntax — source is **`tftp:`** (or **`ftp:`**, **`scp:`**).', misconceptionTested: 'copy server keyword for TFTP' },
    ],
    examTip: 'Config restore: **`copy tftp: running-config`** (immediate) | **`copy tftp: startup-config`** (+ reload for boot).',
  },
  '4.10-legacy-q001': {
    correct: {
      choiceIndex: 1,
      explanation: '**Cloud-managed** gear phones home to a **vendor-hosted dashboard** over the internet — config and telemetry centralize off-box.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'On-prem devices **can** be managed remotely via SNMP/SSH — the difference is **where the controller lives**.', misconceptionTested: 'On-prem as no remote management' },
      { choiceIndex: 2, explanation: 'Cloud platforms **support VLANs** — architecture differs in controller placement, not L2 features.', misconceptionTested: 'Cloud-managed without VLANs' },
      { choiceIndex: 3, explanation: 'On-prem networks commonly use **SNMP** — cloud adds a hosted orchestration layer.', misconceptionTested: 'On-prem cannot use SNMP' },
    ],
    examTip: 'Cloud-managed = devices → **vendor cloud dashboard**; on-prem = local NMS/controller.',
  },
}
