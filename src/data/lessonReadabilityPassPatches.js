/** Targeted post-audit lesson prose fixes. Keep this small and audit-driven. */
export const LESSON_READABILITY_PASS_PATCHES = {
  '2.6': {
    reading: {
      tiers: {
        beginner: 'Autonomous APs work as standalone devices, so each AP holds its own WLAN configuration and switches traffic locally. Lightweight APs instead join a wireless LAN controller over CAPWAP. The controller centralizes WLAN policy, radio management, and client visibility. In Local mode, client traffic normally travels through the controller; FlexConnect can keep branch traffic local when that design is required.',
      },
    },
  },
  '2.8': {
    reading: {
      tiers: {
        beginner: 'A wireless client connects only when the WLAN name, security method, credentials, radio coverage, and VLAN path agree end to end. The AP advertises or responds for the SSID, then the client authenticates and associates. After that, DHCP and the wired switch path must place the client in the intended subnet. A failure at any step can look like a general wireless problem, so verify the sequence in order.',
      },
    },
  },
  '3.1': {
    reading: {
      keyPoints: [
        'Read each route as code, prefix, AD/metric, next hop, and exit interface.',
        'Longest prefix match decides forwarding before administrative distance is considered.',
        'Connected and local routes disappear when their interface is no longer operational.',
      ],
    },
  },
  '3.5': {
    reading: {
      tiers: {
        beginner: 'Hosts normally know only one default-gateway address. A first-hop redundancy protocol lets two or more routers present one shared virtual gateway, so the hosts do not need to change when a router fails. One router forwards as the active device while another waits to take over. HSRP is Cisco proprietary, VRRP is an open standard, and GLBP can also distribute forwarding work.',
      },
    },
  },
  '3.6': {
    reading: {
      tiers: {
        intermediate: 'Troubleshoot in layers so one symptom does not trigger random configuration changes. First verify interface state, addressing, VLAN reachability, and the directly connected next hop. Then confirm the expected prefix, route source, next hop, and exit interface in the routing table. For OSPF, check adjacency, area, timers, authentication, and passive-interface settings. Finally test the forward and return paths with sourced ping or traceroute, then inspect ACL and NAT behavior at the edge.',
      },
    },
  },
}
