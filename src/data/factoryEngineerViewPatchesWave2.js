/** Engineer-view verify layers — wave 2 (remaining objectives without engineerView). */

export const FACTORY_ENGINEER_VIEW_PATCHES_WAVE2 = {
  '1.1': {
    engineerView: {
      title: 'Engineer view — network components',
      summary: 'Know which device owns L2 vs L3 before blaming the wrong box in a path.',
      verifyCommands: [
        { command: 'show ip interface brief', purpose: 'Router/switch L3 interfaces — confirms where routing terminates.' },
        { command: 'show mac address-table', purpose: 'Switch L2 forwarding table — who is on which port/VLAN.' },
      ],
      symptoms: [
        'Hosts on same subnet cannot talk — switch vs router boundary misunderstood.',
        'Traffic hairpins through router — flat L2 design expected but L3 gateway required.',
      ],
      trapCallout: {
        trap: 'Using a router where a switch suffices (or vice versa)',
        correction: 'Switches forward frames within a broadcast domain; routers break domains and route between subnets.',
      },
    },
  },
  '1.2': {
    engineerView: {
      title: 'Engineer view — topology architecture',
      summary: 'Three-tier vs collapsed core changes where redundancy and default gateway live.',
      verifyCommands: [
        { command: 'show cdp neighbors', purpose: 'Physical adjacency — confirms access/distribution/core layering on Cisco gear.' },
        { command: 'show ip route', purpose: 'Where default gateway and inter-VLAN routing are implemented.' },
      ],
      symptoms: [
        'Single uplink failure takes down site — access layer not dual-homed to distribution.',
        'Inter-VLAN traffic slow — routing on access instead of distribution/core.',
      ],
      trapCallout: {
        trap: 'Collapsed core means no distribution layer exists',
        correction: 'Collapsed core merges distribution + core — still know where L3 and FHRP live.',
      },
    },
  },
  '1.3': {
    engineerView: {
      title: 'Engineer view — cabling and interfaces',
      summary: 'Wrong cable or SFP type fails before any protocol — verify physical layer first.',
      verifyCommands: [
        { command: 'show interfaces status', purpose: 'Speed/duplex, VLAN, and err-disabled state on access ports.' },
        { command: 'show interfaces GigabitEthernet0/1', purpose: 'Detailed counters — input errors, CRC, late collisions.' },
      ],
      symptoms: [
        'Link up but high CRC errors — bad cable, wrong SFP, or duplex mismatch.',
        'Port err-disabled — BPDU guard, security violation, or loop protection.',
      ],
      trapCallout: {
        trap: 'Straight-through cable between two switches',
        correction: 'Switch-to-switch needs crossover or auto-MDIX; modern gear often auto-negotiates — verify with show interfaces.',
      },
    },
  },
  '1.4': {
    engineerView: {
      title: 'Engineer view — interface and cable issues',
      summary: 'Input errors and err-disabled ports point to L1/L2 before routing or ACLs.',
      verifyCommands: [
        { command: 'show interfaces counters errors', purpose: 'CRC, runts, giants — isolates bad cable vs config.' },
        { command: 'show interfaces status err-disabled', purpose: 'Why port shut down — security, BPDU guard, link-flap.' },
      ],
      symptoms: [
        'Intermittent connectivity — flapping link or duplex mismatch on one end.',
        'Port down (err-disabled) — sticky MAC violation or BPDU received on access port.',
      ],
      trapCallout: {
        trap: 'Chasing routing when interface shows input errors',
        correction: 'Fix physical/errors first — no routing protocol survives a bad L1/L2 link.',
      },
    },
  },
  '1.5': {
    engineerView: {
      title: 'Engineer view — switching concepts',
      summary: 'MAC learning and frame forwarding — unknown unicast floods until MAC is learned.',
      verifyCommands: [
        { command: 'show mac address-table dynamic', purpose: 'Which MAC learned on which port — confirms forwarding path.' },
        { command: 'show spanning-tree interface Gi0/1', purpose: 'Port role/state — blocking port explains one-way traffic.' },
      ],
      symptoms: [
        'Unicast floods entire VLAN — CAM table full or unknown destination.',
        'One-way communication — asymmetric STP blocking or unidirectional link.',
      ],
      trapCallout: {
        trap: 'Assuming switch always knows destination MAC immediately',
        correction: 'First frame to unknown MAC floods; learning happens after reply — normal until table populated.',
      },
    },
  },
  '1.6': {
    engineerView: {
      title: 'Engineer view — IPv4 addressing and subnetting',
      summary: 'Host mask wrong = wrong subnet — verify network/broadcast before blaming routing.',
      verifyCommands: [
        { command: 'show ip interface brief', purpose: 'Interface IP and mask on device — compare to host config.' },
        { command: 'ping 192.168.1.1', purpose: 'Gateway reachability — confirms host is on correct subnet.' },
      ],
      symptoms: [
        'Host cannot reach gateway — mask too short/long puts gateway outside host subnet.',
        'Works on /24 lab but fails in production — VLSM boundary crossed without route.',
      ],
      trapCallout: {
        trap: 'Same IP address different masks on adjacent hosts',
        correction: 'Hosts must agree on network boundary; /24 host cannot talk to /25 gateway without routing.',
      },
    },
  },
  '1.7': {
    engineerView: {
      title: 'Engineer view — private IPv4 addressing',
      summary: 'RFC 1918 space is not routable on the public Internet — NAT or proxy required.',
      verifyCommands: [
        { command: 'show ip nat translations', purpose: 'Active inside/outside mappings — confirms NAT working.' },
        { command: 'show ip route', purpose: 'Default route to ISP — private hosts need translation at edge.' },
      ],
      symptoms: [
        'Internal hosts cannot reach Internet — missing NAT overload or wrong inside/outside interfaces.',
        'Overlapping 10.x with VPN peer — routing conflict until NAT or renumber.',
      ],
      trapCallout: {
        trap: 'Advertising 192.168.0.0/16 to ISP',
        correction: 'Private ranges must not leak to public BGP — use NAT at boundary.',
      },
    },
  },
  '1.8': {
    engineerView: {
      title: 'Engineer view — IPv6 addressing',
      summary: 'Link-local (fe80::) is per-segment; global unicast needs correct prefix length.',
      verifyCommands: [
        { command: 'show ipv6 interface brief', purpose: 'Global and link-local addresses per interface.' },
        { command: 'show ipv6 route', purpose: 'Installed IPv6 prefixes and default route.' },
      ],
      symptoms: [
        'Neighbor discovery fails — interface down or IPv6 disabled on link.',
        'Global address missing — SLAAC/DHCPv6 not providing prefix or RA filtered.',
      ],
      trapCallout: {
        trap: 'Ping global from wrong source without route',
        correction: 'IPv6 requires correct source selection; link-local ping stays on segment only.',
      },
    },
  },
  '1.9': {
    engineerView: {
      title: 'Engineer view — IPv6 address types',
      summary: 'Global unicast vs link-local vs multicast — each has different scope and use.',
      verifyCommands: [
        { command: 'show ipv6 interface', purpose: 'Address types on interface — global, link-local, anycast.' },
        { command: 'show ipv6 neighbors', purpose: 'NDP table — maps IPv6 to MAC on local link.' },
      ],
      symptoms: [
        'Cannot reach remote IPv6 — using link-local as gateway.',
        'Multicast storm — IGMP/MLD snooping misconfigured on VLAN.',
      ],
      trapCallout: {
        trap: 'Using fe80:: as next-hop across routers',
        correction: 'Link-local is segment-scoped; routing uses global unicast or explicitly scoped link-local per RFC.',
      },
    },
  },
  '1.10': {
    engineerView: {
      title: 'Engineer view — client IP parameters',
      summary: 'APIPA 169.254.x.x means no DHCP — verify lease, gateway, and DNS on the host.',
      verifyCommands: [
        { command: 'show ip dhcp binding', purpose: 'Server-side lease — confirms offer was made to client MAC.' },
        { command: 'show ip dhcp pool', purpose: 'Default-router and DNS options in pool — must match design.' },
      ],
      symptoms: [
        'Windows shows 169.254.x.x — no DHCP server or relay on VLAN.',
        'Internet works by IP not name — DNS option 6 missing from DHCP scope.',
      ],
      trapCallout: {
        trap: 'Static IP on client with wrong default gateway',
        correction: 'Gateway must be on same subnet as host; verify with ipconfig/ifconfig vs show ip route on router.',
      },
    },
  },
  '1.11': {
    engineerView: {
      title: 'Engineer view — wireless principles',
      summary: 'RF coverage ≠ throughput — channel overlap and power affect association and data rates.',
      verifyCommands: [
        { command: 'show dot11 associations', purpose: 'Autonomous AP — associated clients, RSSI, and data rate.' },
        { command: 'show wlan summary', purpose: 'WLC — SSID policy, band, and security per WLAN.' },
      ],
      symptoms: [
        'Slow Wi-Fi in dense area — co-channel interference from overlapping AP channels.',
        'Client roams poorly — same SSID different security or 2.4 vs 5 GHz imbalance.',
      ],
      trapCallout: {
        trap: 'Max TX power always improves coverage',
        correction: 'Too high power increases overlap and roaming stickiness — tune for cell edges, not max dBm.',
      },
    },
  },
  '1.12': {
    engineerView: {
      title: 'Engineer view — virtualization fundamentals',
      summary: 'vSwitch and port groups mirror physical VLANs — wrong port group = wrong segment.',
      verifyCommands: [
        { command: 'show vlan brief', purpose: 'Physical VLAN IDs map to hypervisor port groups / VM networks.' },
        { command: 'show interfaces trunk', purpose: 'Trunk carries multiple VLANs to host — native VLAN must match.' },
      ],
      symptoms: [
        'VM cannot reach gateway — port group VLAN ID mismatch with upstream switch.',
        'Micro-segmentation bypass — VM on wrong vSwitch bridged to production VLAN.',
      ],
      trapCallout: {
        trap: 'Assuming VM networking is isolated from physical VLANs',
        correction: 'Hypervisor uplinks are real switch ports — VLAN tagging rules apply end-to-end.',
      },
    },
  },
  '3.3': {
    engineerView: {
      title: 'Engineer view — static routing verify',
      summary: 'Static routes need reachable next-hop or exit interface — verify both directions.',
      verifyCommands: [
        { command: 'show ip route static', purpose: 'Installed statics — prefix, AD, next-hop or exit interface.' },
        { command: 'show ip route 10.1.1.0', purpose: 'Longest-match lookup for specific prefix.' },
      ],
      symptoms: [
        'One-way ping — static on A to B but missing return route on B.',
        'Static points to unreachable next-hop — route in table but inactive.',
      ],
      trapCallout: {
        trap: 'Static route with exit interface on multi-access network without explicit next-hop',
        correction: 'On Ethernet, prefer next-hop IP; interface-only static can ARP-flood or black-hole.',
      },
    },
  },
  '4.5': {
    engineerView: {
      title: 'Engineer view — syslog verify',
      summary: 'Logs without NTP timestamps are unreliable — sync time before trusting sequence.',
      verifyCommands: [
        { command: 'show logging', purpose: 'Syslog host, severity level, and buffer/console settings.' },
        { command: 'show clock', purpose: 'System time — must match NTP before correlating remote syslog.' },
      ],
      symptoms: [
        'No remote logs — ACL blocking UDP 514 or wrong syslog server IP.',
        'Duplicate or missing messages — buffer full or severity filter too high.',
      ],
      trapCallout: {
        trap: 'Console logging left at debug in production',
        correction: 'High severity to console can lock device under load — use buffered logging and appropriate level.',
      },
    },
  },
  '4.7': {
    engineerView: {
      title: 'Engineer view — QoS PHB verify',
      summary: 'Marking without queuing policy does nothing — verify trust boundary and queue map.',
      verifyCommands: [
        { command: 'show policy-map interface Gi0/1', purpose: 'Applied QoS policy — classification and queue actions.' },
        { command: 'show mls qos maps', purpose: 'CoS/DSCP-to-queue mapping on switch — trust boundary check.' },
      ],
      symptoms: [
        'Voice quality poor — EF traffic in default queue without priority treatment.',
        'Marking stripped — untrusted port re-marks all frames to best-effort.',
      ],
      trapCallout: {
        trap: 'Setting DSCP on host without trust on switch port',
        correction: 'Enable trust cos/dscp on ingress or re-mark explicitly in policy-map.',
      },
    },
  },
  '4.9': {
    engineerView: {
      title: 'Engineer view — TFTP/FTP verify',
      summary: 'Copy failures are often path, ACL, or vrf — test reachability before blaming image.',
      verifyCommands: [
        { command: 'copy flash: tftp:', purpose: 'Interactive copy — reveals timeout vs permission vs space errors.' },
        { command: 'show flash:', purpose: 'Free space — image copy fails if filesystem full.' },
      ],
      symptoms: [
        'TFTP timeout — server unreachable, UDP 69 blocked, or wrong source interface.',
        'FTP auth failure — username/password or passive mode through NAT.',
      ],
      trapCallout: {
        trap: 'TFTP and FTP use same port assumptions',
        correction: 'TFTP is UDP 69; FTP is TCP 21 (+ passive data ports) — ACLs must differ.',
      },
    },
  },
  '4.10': {
    engineerView: {
      title: 'Engineer view — device management',
      summary: 'Cloud controller vs local CLI — know where running config actually lives.',
      verifyCommands: [
        { command: 'show running-config', purpose: 'Active config on device — baseline for local management.' },
        { command: 'show inventory', purpose: 'Platform and serial — needed for Smart Licensing / support.' },
      ],
      symptoms: [
        'Config change reverts — edited running but never `copy run start` or controller overwrite.',
        'DNA Center out of sync — device unreachable from controller management VLAN.',
      ],
      trapCallout: {
        trap: 'Thinking cloud dashboard change applied without device sync',
        correction: 'Verify on device with show run — controller push can fail silently if reachability lost.',
      },
    },
  },
  '5.1': {
    engineerView: {
      title: 'Engineer view — security concepts',
      summary: 'Confidentiality, integrity, availability — map controls to the CIA triad when triaging.',
      verifyCommands: [
        { command: 'show ip access-lists', purpose: 'Permit/deny enforcement — availability vs confidentiality tradeoffs.' },
        { command: 'show archive configuration', purpose: 'Config integrity — rollback if unauthorized change detected.' },
      ],
      symptoms: [
        'Outage after “security hardening” — ACL blocked required management or routing.',
        'Data leak — overly permissive ACL on sensitive VLAN.',
      ],
      trapCallout: {
        trap: 'Security means deny everything by default without exception plan',
        correction: 'Document required flows first — blanket deny breaks availability (CIA balance).',
      },
    },
  },
  '5.2': {
    engineerView: {
      title: 'Engineer view — security program elements',
      summary: 'Policy drives technical controls — verify implementation matches documented standard.',
      verifyCommands: [
        { command: 'show running-config | include password', purpose: 'Password encryption and login classes — baseline hardening.' },
        { command: 'show aaa servers', purpose: 'Central auth configured per security policy.' },
      ],
      symptoms: [
        'Audit finding — local-only accounts when policy requires TACACS+.',
        'Inconsistent VLAN ACLs — site drift from golden template.',
      ],
      trapCallout: {
        trap: 'Technical control without documented policy owner',
        correction: 'Exam tests program elements (governance, risk, compliance) alongside device config.',
      },
    },
  },
  '5.3': {
    engineerView: {
      title: 'Engineer view — device access control',
      summary: 'VTY and console lines need login + transport restrictions — telnet is exam trap.',
      verifyCommands: [
        { command: 'show line vty 0 4', purpose: 'Login method, transport (SSH), and exec-timeout on VTY.' },
        { command: 'show ip ssh', purpose: 'SSH version and key status — required for secure remote access.' },
      ],
      symptoms: [
        'Cannot SSH — crypto key not generated or only telnet enabled on line vty.',
        'Idle sessions never disconnect — missing exec-timeout on console/VTY.',
      ],
      trapCallout: {
        trap: 'login local without username in local database',
        correction: 'Define username secret and apply login local on line vty — password-only deprecated.',
      },
    },
  },
  '5.4': {
    engineerView: {
      title: 'Engineer view — AAA verify',
      summary: 'Authentication order matters — local fallback only when policy allows.',
      verifyCommands: [
        { command: 'show aaa servers', purpose: 'RADIUS/TACACS+ reachability and dead server state.' },
        { command: 'test aaa group tacacs+ user pass legacy', purpose: 'Live auth test against AAA server (where supported).' },
      ],
      symptoms: [
        'Login works locally but not via TACACS — wrong shared key or server unreachable.',
        'Priv level wrong — TACACS+ authorization profile not mapping to enable 15.',
      ],
      trapCallout: {
        trap: 'RADIUS for device admin when exam expects TACACS+ for command authorization',
        correction: 'RADIUS common for network access (802.1X); TACACS+ separates authZ per command on devices.',
      },
    },
  },
  '5.6': {
    engineerView: {
      title: 'Engineer view — Layer 2 security',
      summary: 'Port security, DHCP snooping, DAI — deploy in order with trust boundaries.',
      verifyCommands: [
        { command: 'show port-security interface Gi0/1', purpose: 'Max MACs, violation mode, sticky learned addresses.' },
        { command: 'show ip dhcp snooping binding', purpose: 'Trusted vs untrusted ports — rogue DHCP detection.' },
      ],
      symptoms: [
        'Port err-disabled — port-security violation (MAC overflow or sticky mismatch).',
        'Legitimate DHCP blocked — uplink not configured as trusted in DHCP snooping.',
      ],
      trapCallout: {
        trap: 'DAI enabled without DHCP snooping bindings',
        correction: 'DAI uses snooping table — enable DHCP snooping and trust uplinks first.',
      },
    },
  },
  '5.7': {
    engineerView: {
      title: 'Engineer view — AAA framework',
      summary: 'Authentication ≠ authorization ≠ accounting — each can fail independently.',
      verifyCommands: [
        { command: 'show aaa user all', purpose: 'Current AAA session method in use for this login.' },
        { command: 'show accounting', purpose: 'Accounting records enabled — command logging to server.' },
      ],
      symptoms: [
        'User authenticates but cannot enter enable — authorization profile missing priv level.',
        'No audit trail — accounting not configured on line vty.',
      ],
      trapCallout: {
        trap: 'Single A in AAA covers all three functions',
        correction: 'Configure aaa authentication, authorization, and accounting separately as required.',
      },
    },
  },
  '5.8': {
    engineerView: {
      title: 'Engineer view — wireless security',
      summary: 'WPA2-PSK vs WPA2-Enterprise — verify 802.1X and cipher suite on WLAN profile.',
      verifyCommands: [
        { command: 'show wlan security 1', purpose: 'WLC — WPA mode, AES/CCMP, and 802.1X settings.' },
        { command: 'show dot11 associations', purpose: 'Client auth state and encryption in use.' },
      ],
      symptoms: [
        'Clients associate but no data — WPA3-SAE mismatch or wrong PSK.',
        'Enterprise auth fails — RADIUS unreachable from WLC or wrong NAS-IP.',
      ],
      trapCallout: {
        trap: 'WEP or TKIP acceptable for new deployments',
        correction: 'CCNA expects WPA2-AES (CCMP) minimum; WEP/TKIP are legacy/insecure.',
      },
    },
  },
  '5.10': {
    engineerView: {
      title: 'Engineer view — VPN concepts',
      summary: 'Site-to-site vs remote-access — different encapsulation and head-end roles.',
      verifyCommands: [
        { command: 'show crypto isakmp sa', purpose: 'Phase 1 IKE security associations — tunnel negotiation status.' },
        { command: 'show crypto ipsec sa', purpose: 'Phase 2 IPsec SAs — interesting traffic and transform set.' },
      ],
      symptoms: [
        'Tunnel up but no traffic — ACL mismatch on crypto map interesting traffic.',
        'IKE fails — pre-shared key mismatch or peer address unreachable.',
      ],
      trapCallout: {
        trap: 'GRE and IPsec are the same thing',
        correction: 'GRE is tunnel encapsulation; IPsec provides encryption — often combined but distinct.',
      },
    },
  },
  '5.11': {
    engineerView: {
      title: 'Engineer view — network segmentation',
      summary: 'VLANs + ACLs + firewalls enforce segments — routing between them is controlled.',
      verifyCommands: [
        { command: 'show vlan brief', purpose: 'Broadcast domain boundaries — segment by VLAN ID.' },
        { command: 'show ip access-lists', purpose: 'Inter-VLAN permit/deny — micro-segmentation at router/firewall.' },
      ],
      symptoms: [
        'PCI zone reachable from guest VLAN — missing ACL on SVI or firewall rule.',
        'Segmentation bypass — router connected to both zones without policy.',
      ],
      trapCallout: {
        trap: 'VLAN alone equals security isolation',
        correction: 'VLANs are logical separation; enforce with ACLs/firewall and no unauthorized trunk paths.',
      },
    },
  },
  '6.1': {
    engineerView: {
      title: 'Engineer view — automation impact',
      summary: 'Automation changes how configs deploy — verify drift detection and rollback path.',
      verifyCommands: [
        { command: 'show archive configuration differences', purpose: 'Compare last committed config to current — drift check.' },
        { command: 'show running-config', purpose: 'Ground truth on device after automated push.' },
      ],
      symptoms: [
        'Bulk change outage — template variable wrong across fleet.',
        'Partial apply — some devices unreachable during controller deployment.',
      ],
      trapCallout: {
        trap: 'Automation eliminates need for show commands',
        correction: 'Automation scales deployment; verification commands remain essential for validate/rollback.',
      },
    },
  },
  '6.2': {
    engineerView: {
      title: 'Engineer view — traditional vs controller-based',
      summary: 'Southbound vs northbound — know where data plane config originates.',
      verifyCommands: [
        { command: 'show sdwan control connections', purpose: 'Controller reachability in SD-WAN fabric (conceptual verify).' },
        { command: 'show running-config', purpose: 'On traditional IOS, config is local; compare to controller intent if hybrid.' },
      ],
      symptoms: [
        'Device ignores CLI change — managed by controller that overwrites local config.',
        'Split brain — device registered to wrong controller cluster.',
      ],
      trapCallout: {
        trap: 'Controller-based means no CLI on devices',
        correction: 'Underlay still uses IOS/XE; controller programs overlay/intent — both models coexist.',
      },
    },
  },
  '6.3': {
    engineerView: {
      title: 'Engineer view — SDN architecture',
      summary: 'Control plane centralized; data plane forwards — separation is the exam focus.',
      verifyCommands: [
        { command: 'show ip route', purpose: 'Data plane forwarding table — installed by control plane protocol/app.' },
        { command: 'show controllers', purpose: 'Physical port status — data plane hardware independent of SDN app.' },
      ],
      symptoms: [
        'Flows not installed — southbound API disconnect between controller and switch.',
        'Policy works in lab app but not production — wrong device group or version mismatch.',
      ],
      trapCallout: {
        trap: 'SDN removes need for routing protocols everywhere',
        correction: 'Underlay often still runs OSPF/BGP; SDN may program overlay or policy centrally.',
      },
    },
  },
  '6.4': {
    engineerView: {
      title: 'Engineer view — Cisco DNA Center',
      summary: 'Intent-based campus — design maps VLANs, IP pools, and templates to sites.',
      verifyCommands: [
        { command: 'show cdp neighbors', purpose: 'Physical discovery before DNA inventory and topology map.' },
        { command: 'show version', purpose: 'IOS-XE version — DNA features require compatible image.' },
      ],
      symptoms: [
        'Device stuck in provisioning — PnP trust failed or DHCP option 43 missing.',
        'Template deployment failed — variable undefined for site hierarchy.',
      ],
      trapCallout: {
        trap: 'DNA Center replaces ISE for all security policy',
        correction: 'DNA handles campus automation/orchestration; ISE focuses on identity/policy — complementary.',
      },
    },
  },
  '6.5': {
    engineerView: {
      title: 'Engineer view — REST API basics',
      summary: 'HTTP verbs map to CRUD — GET read, PUT replace, PATCH update, POST create, DELETE remove.',
      verifyCommands: [
        { command: 'curl -k -u user:pass https://device/restconf/data/ietf-interfaces:interfaces', purpose: 'RESTCONF GET — returns structured YANG data (lab/controller context).' },
        { command: 'show ip http server status', purpose: 'Legacy HTTP/REST API enabled on device — security check before exposure.' },
      ],
      symptoms: [
        '401 on API call — missing token or wrong Content-Type for JSON body.',
        '405 Method Not Allowed — POST used where resource expects GET only.',
      ],
      trapCallout: {
        trap: 'REST always uses SOAP envelopes',
        correction: 'REST uses HTTP with JSON/XML representations; SOAP is a different web-service style.',
      },
    },
  },
  '6.6': {
    engineerView: {
      title: 'Engineer view — JSON and config management',
      summary: 'Parse JSON fields for automation — idempotent playbooks avoid config drift.',
      verifyCommands: [
        { command: 'show running-config | json', purpose: 'IOS-XE structured output — feeds automation parsers (where supported).' },
        { command: 'more bootflash:pipeline.json', purpose: 'Example artifact from automation tool — validate schema before apply.' },
      ],
      symptoms: [
        'Playbook fails — JSON key renamed between API versions.',
        'Partial config merge — expected full replace but tool sent PATCH semantics.',
      ],
      trapCallout: {
        trap: 'JSON array order always meaningful for network config',
        correction: 'Validate schema; some fields are unordered sets — use keys/IDs not array position.',
      },
    },
  },
}
