/** Engineer-view verify layers for Tier C factory objectives (show commands + traps). */

export const FACTORY_ENGINEER_VIEW_PATCHES = {
  '2.3': {
    engineerView: {
      title: 'Engineer view — CDP/LLDP verify',
      summary: 'Layer 2 neighbor discovery — confirm link, platform, and capabilities before trusting topology diagrams.',
      verifyCommands: [
        { command: 'show cdp neighbors', purpose: 'Cisco-proprietary L2 neighbors on directly connected links.' },
        { command: 'show lldp neighbors', purpose: 'IEEE multivendor neighbor table — use when CDP is disabled or mixed vendors.' },
      ],
      symptoms: [
        'Missing neighbor on trunk — CDP disabled globally or on interface (`no cdp enable`).',
        'Wrong VLAN on trunk — neighbor visible but traffic fails on expected VLAN.',
      ],
      trapCallout: {
        trap: 'Expecting CDP through a router',
        correction: 'CDP/LLDP are L2-only — they do not discover beyond a routed hop.',
      },
    },
  },
  '2.4': {
    engineerView: {
      title: 'Engineer view — EtherChannel verify',
      summary: 'Port-channel must be up with matching protocol/mode on all member links.',
      verifyCommands: [
        { command: 'show etherchannel summary', purpose: 'Bundle status (SU/P), protocol (LACP/PAgP), and member ports in use.' },
        { command: 'show interfaces port-channel 1', purpose: 'Logical interface up/up — IP/VLAN config lives here, not on members.' },
      ],
      symptoms: [
        'One link in bundle — mismatched channel-group mode or speed/duplex on a member.',
        'Port-channel down — no compatible neighbors or mixed LACP/PAgP sides.',
      ],
      trapCallout: {
        trap: 'IP address on physical member interface',
        correction: 'Configure IP/VLAN on Port-channel — members carry only channel-group settings.',
      },
    },
  },
  '2.6': {
    engineerView: {
      title: 'Engineer view — WLAN architecture verify',
      summary: 'Know whether APs are lightweight (WLC) or autonomous before troubleshooting join issues.',
      verifyCommands: [
        { command: 'show ap summary', purpose: 'WLC view — AP name, model, IP, and Joined state.' },
        { command: 'show capwap detail', purpose: 'CAPWAP tunnel state between lightweight AP and WLC.' },
      ],
      symptoms: [
        'AP stuck Downloading — image or CAPWAP path blocked by ACL/firewall.',
        'Clients cannot associate — SSID/WLAN policy on WLC, not just AP radio power.',
      ],
      trapCallout: {
        trap: 'Treating autonomous AP like lightweight',
        correction: 'Autonomous APs run full IOS locally; lightweight APs need WLC for SSID and security policy.',
      },
    },
  },
  '2.7': {
    engineerView: {
      title: 'Engineer view — AP physical connectivity',
      summary: 'AP uplink needs correct VLAN/trunk and PoE before RF tuning matters.',
      verifyCommands: [
        { command: 'show interfaces status', purpose: 'Access/trunk mode and VLAN on AP uplink switch port.' },
        { command: 'show power inline', purpose: 'PoE budget and wattage delivered to AP — underpowered AP may boot-loop.' },
      ],
      symptoms: [
        'AP offline — switch port err-disabled or PoE class insufficient.',
        'Management reachable but no SSID — WLAN VLAN not trunked to controller path.',
      ],
      trapCallout: {
        trap: 'Access port with native VLAN mismatch to AP management VLAN',
        correction: 'Match native/allowed VLANs on AP uplink to design — untagged management vs tagged client VLANs.',
      },
    },
  },
  '2.8': {
    engineerView: {
      title: 'Engineer view — WLAN client verify',
      summary: 'Association is only step one — check security, VLAN, and DHCP after join.',
      verifyCommands: [
        { command: 'show wireless client summary', purpose: 'Associated clients, SSID, VLAN, and protocol.' },
        { command: 'show wlan summary', purpose: 'SSID enabled, security policy, and VLAN interface mapping.' },
      ],
      symptoms: [
        'Associated but no IP — wrong WLAN VLAN or DHCP scope missing on that VLAN.',
        'Repeated deauth — PSK mismatch or WPA2-AES not enabled on WLAN profile.',
      ],
      trapCallout: {
        trap: 'Strong RSSI but no data path',
        correction: 'Check VLAN mapping and upstream gateway/DHCP — RF can look fine while L3 is broken.',
      },
    },
  },
  '3.5': {
    engineerView: {
      title: 'Engineer view — HSRP verify',
      summary: 'Confirm Active/Standby roles and virtual IP before chasing host gateway issues.',
      verifyCommands: [
        { command: 'show standby brief', purpose: 'Active/Standby state, priority, preempt flag, and virtual IP per group.' },
        { command: 'show standby', purpose: 'Detailed HSRP timers, virtual MAC, and tracked objects.' },
      ],
      symptoms: [
        'Both routers Active — mismatched group number or virtual IP on the LAN.',
        'Flapping default gateway — missing preempt on higher-priority router or interface tracking down.',
      ],
      trapCallout: {
        trap: 'Different standby group numbers on peers',
        correction: 'Group ID and virtual IP must match on all routers sharing the LAN segment.',
      },
    },
  },
  '3.6': {
    engineerView: {
      title: 'Engineer view — connectivity troubleshoot',
      summary: 'Bottom-up: interface → ARP → routing → ACL — do not skip layers.',
      verifyCommands: [
        { command: 'show ip interface brief', purpose: 'Admin/oper status and IP on every interface — first hop for “cannot ping”.' },
        { command: 'show ip route', purpose: 'Confirm prefix installed, next-hop reachable, and gateway of last resort.' },
      ],
      symptoms: [
        'Ping fails with interface up — ACL, wrong VLAN, or missing route to return path.',
        'Intermittent loss — duplex mismatch, STP blocking, or flapping interface.',
      ],
      trapCallout: {
        trap: 'Adding static route when interface is administratively down',
        correction: 'Fix L1/L2 first — routes do not forward through down interfaces even if configured.',
      },
    },
  },
  '4.2': {
    engineerView: {
      title: 'Engineer view — NTP verify',
      summary: 'Logs and certificates depend on accurate time — verify sync before trusting timestamps.',
      verifyCommands: [
        { command: 'show clock', purpose: 'Current system time and timezone — compare to expected NTP source.' },
        { command: 'show ntp associations', purpose: 'Synced server, stratum, and reachability (* = selected).',
        },
      ],
      symptoms: [
        'Clock drift — no NTP server reachable or ACL blocking UDP 123.',
        'Stratum 16 — unsynchronized; manual `clock set` lost on reload unless saved and still not authoritative.',
      ],
      trapCallout: {
        trap: 'Manual clock set equals NTP sync',
        correction: 'NTP continuously adjusts from authoritative servers; manual set is one-time and drifts.',
      },
    },
  },
  '4.3': {
    engineerView: {
      title: 'Engineer view — DHCP/DNS verify',
      summary: 'Client “no internet” often means no lease or wrong DNS — verify DORA and bindings.',
      verifyCommands: [
        { command: 'show ip dhcp binding', purpose: 'Active leases — confirms server offered address to client MAC.' },
        { command: 'show ip dhcp pool', purpose: 'Pool network, default-router, and DNS options configured.' },
      ],
      symptoms: [
        'APIPA 169.254.x.x — no DHCP Offer (server down, wrong VLAN, or relay missing).',
        'Lease OK but names fail — option 6 DNS missing or wrong DNS server in pool.',
      ],
      trapCallout: {
        trap: 'Helper-address on server-facing interface',
        correction: 'ip helper-address belongs on the client-facing interface where broadcasts arrive.',
      },
    },
  },
  '4.4': {
    engineerView: {
      title: 'Engineer view — DNS verify',
      summary: 'Name resolution fails even when routing works — test with IP first, then DNS.',
      verifyCommands: [
        { command: 'show hosts', purpose: 'Static host table and DNS server configured on router.' },
        { command: 'ping server.example.com', purpose: 'Tests DNS resolution plus end-to-end reachability to resolved IP.' },
      ],
      symptoms: [
        'Ping by IP works, by name fails — DNS server unreachable or wrong resolver configured.',
        'Intermittent resolution — primary DNS down with no secondary configured.',
      ],
      trapCallout: {
        trap: 'Assuming DNS problem when ICMP is filtered',
        correction: 'Confirm IP connectivity first; some servers block ping but still resolve and serve HTTP.',
      },
    },
  },
}
