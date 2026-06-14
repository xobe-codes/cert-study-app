/* CCNA 200-301 exam domains and objectives */

/* =========================================================================
   DOMAINS — 6 domains, 53 objectives, with official exam weights
   ========================================================================= */
export const DOMAINS = [
  {
    id: 'fundamentals', name: 'Network Fundamentals', accent: 'mint', weight: 20,
    objectives: [
      { id: '1.1', title: 'Network components (routers, switches, firewalls, APs, controllers)' },
      { id: '1.2', title: 'Network topology architectures' },
      { id: '1.3', title: 'Physical interface and cabling types' },
      { id: '1.4', title: 'Identify interface and cable issues' },
      { id: '1.5', title: 'Switching concepts (MAC table, frame forwarding)' },
      { id: '1.6', title: 'Configure and verify IPv4 addressing and subnetting' },
      { id: '1.7', title: 'Describe private IPv4 addressing' },
      { id: '1.8', title: 'Configure and verify IPv6 addressing and prefix' },
      { id: '1.9', title: 'Compare IPv6 address types' },
      { id: '1.10', title: 'Verify IP parameters for client OS' },
      { id: '1.11', title: 'Describe wireless principles' },
      { id: '1.12', title: 'Explain virtualization fundamentals' },
    ],
  },
  {
    id: 'access', name: 'Network Access', accent: 'purple', weight: 20,
    objectives: [
      { id: '2.1', title: 'Configure and verify VLANs' },
      { id: '2.2', title: 'Configure and verify interswitch connectivity (trunking)' },
      { id: '2.3', title: 'Configure and verify Layer 2 discovery protocols (CDP/LLDP)' },
      { id: '2.4', title: 'Configure and verify EtherChannel (LACP)' },
      { id: '2.5', title: 'Describe Spanning Tree Protocol concepts' },
      { id: '2.6', title: 'Compare Cisco wireless architectures and AP modes' },
      { id: '2.7', title: 'Describe physical infrastructure connections of WLAN components' },
      { id: '2.8', title: 'Configure WLAN components for client connectivity' },
    ],
  },
  {
    id: 'connectivity', name: 'IP Connectivity', accent: 'blush', weight: 25,
    objectives: [
      { id: '3.1', title: 'Interpret the components of a routing table' },
      { id: '3.2', title: 'Determine how a router makes a forwarding decision by default' },
      { id: '3.3', title: 'Configure and verify IPv4 and IPv6 static routing' },
      { id: '3.4', title: 'Configure and verify single area OSPFv2' },
      { id: '3.5', title: 'Describe and configure first hop redundancy protocols (HSRP)' },
      { id: '3.6', title: 'Troubleshoot routing issues' },
    ],
  },
  {
    id: 'services', name: 'IP Services', accent: 'sky', weight: 10,
    objectives: [
      { id: '4.1', title: 'Configure and verify inside source NAT' },
      { id: '4.2', title: 'Configure and verify NTP' },
      { id: '4.3', title: 'Explain the role of DHCP and DNS' },
      { id: '4.4', title: 'Explain the function of SNMP' },
      { id: '4.5', title: 'Describe the use of syslog features' },
      { id: '4.6', title: 'Configure and verify DHCP client and relay' },
      { id: '4.7', title: 'Explain QoS forwarding per-hop behavior' },
      { id: '4.8', title: 'Configure network devices for remote access using SSH' },
      { id: '4.9', title: 'Describe TFTP and FTP capabilities' },
      { id: '4.10', title: 'Compare local and cloud-based device management' },
    ],
  },
  {
    id: 'security', name: 'Security Fundamentals', accent: 'rose', weight: 15,
    objectives: [
      { id: '5.1', title: 'Define key security concepts' },
      { id: '5.2', title: 'Describe security program elements' },
      { id: '5.3', title: 'Configure and verify device access control' },
      { id: '5.4', title: 'Configure and verify AAA with TACACS+/RADIUS' },
      { id: '5.5', title: 'Configure and verify access control lists' },
      { id: '5.6', title: 'Configure Layer 2 security features' },
      { id: '5.7', title: 'Compare authentication, authorization, accounting' },
      { id: '5.8', title: 'Describe wireless security protocols' },
      { id: '5.9', title: 'Configure WLAN using WPA2 PSK' },
      { id: '5.10', title: 'Differentiate types of VPN and security concepts' },
      { id: '5.11', title: 'Describe security concepts of network segmentation' },
    ],
  },
  {
    id: 'automation', name: 'Automation & Programmability', accent: 'silver', weight: 10,
    objectives: [
      { id: '6.1', title: 'Explain how automation impacts network management' },
      { id: '6.2', title: 'Compare traditional networks with controller-based networking' },
      { id: '6.3', title: 'Describe controller-based and software defined architectures' },
      { id: '6.4', title: 'Compare traditional campus management with Cisco DNA Center' },
      { id: '6.5', title: 'Describe characteristics of REST-based APIs' },
      { id: '6.6', title: 'Interpret JSON data and configuration management tools' },
    ],
  },
]

export const ALL_OBJECTIVES = DOMAINS.flatMap(d => d.objectives.map(o => ({ ...o, domainId: d.id, domainName: d.name, accent: d.accent })))
