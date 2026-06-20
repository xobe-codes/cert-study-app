/** Canonical CCNA vocabulary for Topic Focus dictionary and global search. */
export const CCNA_TERM_REGISTRY = [
  {
    id: 'term-eigrp',
    term: 'EIGRP',
    aliases: ['Enhanced Interior Gateway Routing Protocol', 'D route code', 'AD 90', 'EIGRP feasible successor'],
    definition:
      'Enhanced Interior Gateway Routing Protocol is a Cisco proprietary advanced distance-vector protocol that uses DUAL for loop-free convergence. On CCNA, recognize EIGRP routes in the table (code D, AD 90) and understand feasible successor vs successor concepts. EIGRP is not a configure-and-verify objective on CCNA 200-301.',
    tags: ['routing'],
    objectiveIds: ['3.1', '3.2'],
    note: 'Reference only on exam — not a configure objective.',
  },
  {
    id: 'term-ospf',
    term: 'OSPF',
    aliases: ['Open Shortest Path First', 'O route code', 'link-state routing'],
    definition:
      'Open Shortest Path First is a link-state interior gateway protocol that builds a topology database and runs SPF (Dijkstra) to compute shortest paths. OSPF uses cost as its metric, forms adjacencies on shared segments, and advertises LSAs within areas. CCNA focuses on single-area OSPFv2 configuration and verification.',
    tags: ['routing'],
    objectiveIds: ['3.1', '3.4'],
  },
  {
    id: 'term-ospfv2',
    term: 'OSPFv2',
    aliases: ['OSPF version 2', 'OSPF for IPv4', 'router ospf'],
    definition:
      'OSPFv2 is the IPv4 version of OSPF, identified by IP protocol 89 and multicast addresses 224.0.0.5 (AllSPFRouters) and 224.0.0.6 (AllDRouters). CCNA 200-301 requires configuring and verifying single-area OSPFv2, including router IDs, network statements or interface commands, and passive interfaces.',
    tags: ['routing'],
    objectiveIds: ['3.4'],
  },
  {
    id: 'term-rip',
    term: 'RIP',
    aliases: ['Routing Information Protocol', 'R route code', 'AD 120', 'RIP v2'],
    definition:
      'Routing Information Protocol is a distance-vector IGP that uses hop count as its metric, with a maximum of 15 hops. RIPv2 supports VLSM and sends updates to multicast 224.0.0.9. On CCNA, recognize RIP routes (code R, AD 120) and understand its limitations; RIP is not a configure objective on 200-301.',
    tags: ['routing'],
    objectiveIds: ['3.1'],
    note: 'Reference only on exam — not a configure objective.',
  },
  {
    id: 'term-bgp',
    term: 'BGP',
    aliases: ['Border Gateway Protocol', 'B route code', 'AD 20', 'AD 200', 'path vector'],
    definition:
      'Border Gateway Protocol is the path-vector exterior gateway protocol used between autonomous systems on the Internet. eBGP routes show AD 20; iBGP routes show AD 200. CCNA expects you to recognize BGP in routing tables and understand its role; full BGP configuration is beyond CCNA scope.',
    tags: ['routing'],
    objectiveIds: ['3.1'],
    note: 'Reference only on exam — not a configure objective.',
  },
  {
    id: 'term-static-route',
    term: 'Static route',
    aliases: ['ip route', 'S route code', 'AD 1', 'manually configured route'],
    definition:
      'A static route is manually entered into the routing table with the ip route command, showing code S and AD 1. It is used when traffic should always follow a defined path, for stub networks, or as a backup. CCNA requires configuring and verifying IPv4 and IPv6 static routes, including next-hop and exit-interface forms.',
    tags: ['routing'],
    objectiveIds: ['3.1', '3.3'],
  },
  {
    id: 'term-default-route',
    term: 'Default route',
    aliases: ['0.0.0.0/0', '::/0', 'gateway of last resort', 'ip route 0.0.0.0'],
    definition:
      'A default route matches all destinations not covered by more specific entries (0.0.0.0/0 for IPv4, ::/0 for IPv6). It is installed as a gateway of last resort and often points toward an ISP or core router. CCNA tests static default route configuration and how routers use it when no longer-prefix match exists.',
    tags: ['routing'],
    objectiveIds: ['3.2', '3.3'],
  },
  {
    id: 'term-floating-static',
    term: 'Floating static route',
    aliases: ['backup static route', 'administrative distance override', 'ip route AD'],
    definition:
      'A floating static route is a backup static route configured with a higher administrative distance than the primary route, so it stays inactive until the preferred route is removed. For example, a floating static with AD 250 backs up an OSPF route (AD 110). CCNA tests the concept as part of static routing design.',
    tags: ['routing'],
    objectiveIds: ['3.2', '3.3'],
  },
  {
    id: 'term-administrative-distance',
    term: 'Administrative distance',
    aliases: ['AD', 'route preference', 'trustworthiness of route source'],
    definition:
      'Administrative distance is a Cisco-specific value (0–255) that ranks routing sources when multiple protocols offer the same prefix; lower AD wins. Connected is 0, static is 1, eBGP 20, OSPF 110, RIP 120, iBGP 200. AD is local to the router and is not propagated in routing updates.',
    tags: ['routing'],
    objectiveIds: ['3.1', '3.2'],
  },
  {
    id: 'term-metric',
    term: 'Metric',
    aliases: ['routing metric', 'cost', 'hop count', 'best path calculation'],
    definition:
      'A metric is the measure of desirability used within a single routing protocol to choose among multiple paths to the same destination. OSPF uses cumulative interface cost, RIP uses hop count, and EIGRP uses a composite metric. Metrics are compared only within the same protocol, not across protocols.',
    tags: ['routing'],
    objectiveIds: ['3.1', '3.2'],
  },
  {
    id: 'term-longest-prefix-match',
    term: 'Longest prefix match',
    aliases: ['LPM', 'most specific route wins', 'prefix length tiebreaker'],
    definition:
      'Longest prefix match is the forwarding rule a router applies after filtering valid routes: the entry with the longest matching subnet mask is chosen. A /28 route beats a /24 for the same address range. If multiple equal-length matches exist, the router load-balances; AD is used only when comparing routes from different sources.',
    tags: ['routing'],
    objectiveIds: ['3.2'],
  },
  {
    id: 'term-gateway-of-last-resort',
    term: 'Gateway of last resort',
    aliases: ['GOLR', 'default gateway route', 'ip default-gateway vs ip default-network'],
    definition:
      'Gateway of last resort is the next hop used when no specific route matches the destination. It appears in show ip route as 0.0.0.0/0 or is flagged with an asterisk (*). Configured via a static default route or learned from a dynamic protocol; distinct from ip default-gateway, which applies to the router itself when IP routing is disabled.',
    tags: ['routing'],
    objectiveIds: ['3.2'],
  },
  {
    id: 'term-route-summarization',
    term: 'Route summarization',
    aliases: ['route aggregation', 'supernet', 'summary route', 'manual summarization'],
    definition:
      'Route summarization advertises a single aggregate prefix instead of many smaller subnets, reducing routing table size and update traffic. It requires contiguous address blocks aligned on bit boundaries. CCNA covers the concept in routing table interpretation; OSPF inter-area summarization details are primarily descriptive at this level.',
    tags: ['routing'],
    objectiveIds: ['3.1', '3.4'],
  },
  {
    id: 'term-vlan',
    term: 'VLAN',
    aliases: ['Virtual LAN', '802.1Q VLAN', 'broadcast domain', 'VLAN ID'],
    definition:
      'A VLAN is a logical Layer 2 broadcast domain identified by a VLAN ID (1–4094). Devices in the same VLAN can communicate at Layer 2 without a router; different VLANs require Layer 3 routing. CCNA requires creating, assigning access ports, and verifying VLAN membership with show vlan brief.',
    tags: ['switching'],
    objectiveIds: ['2.1'],
  },
  {
    id: 'term-trunk',
    term: 'Trunk',
    aliases: ['802.1Q trunk', 'trunk link', 'tagged frame', 'inter-switch link'],
    definition:
      'A trunk is a switch port that carries traffic for multiple VLANs using 802.1Q tagging. Each frame gets a VLAN ID in the tag so receiving switches forward to the correct VLAN. Trunks connect switches to each other or to routers performing router-on-a-stick.',
    tags: ['switching'],
    objectiveIds: ['2.2'],
  },
  {
    id: 'term-native-vlan',
    term: 'Native VLAN',
    aliases: ['untagged VLAN', 'VLAN 1 default native', 'native VLAN mismatch'],
    definition:
      'The native VLAN is the one VLAN on an 802.1Q trunk sent untagged; defaults to VLAN 1 on Cisco switches. Both ends of a trunk must agree on the native VLAN or a mismatch error occurs. Native VLAN traffic is still a security concern because untagged frames can be exploited.',
    tags: ['switching'],
    objectiveIds: ['2.2'],
  },
  {
    id: 'term-stp',
    term: 'STP',
    aliases: ['Spanning Tree Protocol', '802.1D', 'spanning-tree', 'loop prevention'],
    definition:
      'Spanning Tree Protocol prevents Layer 2 loops by electing a root bridge and placing redundant ports in blocking state. STP uses BPDUs, port roles (root, designated, alternate), and states (blocking, listening, learning, forwarding). CCNA focuses on concepts, root bridge election, and port roles rather than advanced tuning.',
    tags: ['switching'],
    objectiveIds: ['2.5'],
  },
  {
    id: 'term-rstp',
    term: 'RSTP',
    aliases: ['Rapid Spanning Tree Protocol', '802.1w', 'rapid PVST+', 'fast convergence STP'],
    definition:
      'Rapid Spanning Tree Protocol (802.1w) is an evolution of STP that converges in seconds by using proposal/agreement handshakes and fewer port states. Port roles align with STP but alternate and backup ports transition faster. Cisco implements RSTP as part of Rapid PVST+.',
    tags: ['switching'],
    objectiveIds: ['2.5'],
  },
  {
    id: 'term-portfast',
    term: 'PortFast',
    aliases: ['spanning-tree portfast', 'edge port', 'immediate forwarding'],
    definition:
      'PortFast immediately transitions an access port to forwarding, skipping STP listening and learning delays. It should only be used on ports connected to end hosts, never on trunk or inter-switch links. Often paired with BPDU Guard on access ports to protect against rogue switches.',
    tags: ['switching'],
    objectiveIds: ['2.5', '5.6'],
  },
  {
    id: 'term-bpdu-guard',
    term: 'BPDU Guard',
    aliases: ['spanning-tree bpduguard', 'BPDU received shutdown', 'PortFast protection'],
    definition:
      'BPDU Guard disables a PortFast-enabled port if it receives a BPDU, indicating an unauthorized switch or loop risk. The port enters err-disabled state and must be re-enabled. CCNA treats BPDU Guard as a Layer 2 security feature used with PortFast on access ports.',
    tags: ['switching', 'security'],
    objectiveIds: ['2.5', '5.6'],
  },
  {
    id: 'term-etherchannel',
    term: 'EtherChannel',
    aliases: ['port channel', 'link aggregation', 'Po', 'bundled links'],
    definition:
      'EtherChannel bundles multiple physical links into one logical port channel for increased bandwidth and redundancy. The switch distributes frames across member links; STP treats the bundle as a single link. CCNA requires configuring and verifying LACP-based EtherChannel between switches.',
    tags: ['switching'],
    objectiveIds: ['2.4'],
  },
  {
    id: 'term-lacp',
    term: 'LACP',
    aliases: ['Link Aggregation Control Protocol', '802.3ad', 'channel-group mode active', 'channel-group mode passive'],
    definition:
      'LACP (802.3ad) is an open standard protocol that negotiates EtherChannel formation by exchanging LACP PDUs. Mode active initiates negotiation; passive responds only. CCNA 200-301 emphasizes LACP as the configure-and-verify EtherChannel protocol.',
    tags: ['switching'],
    objectiveIds: ['2.4'],
  },
  {
    id: 'term-pagp',
    term: 'PAgP',
    aliases: ['Port Aggregation Protocol', 'Cisco proprietary EtherChannel', 'channel-group desirable', 'channel-group auto'],
    definition:
      'Port Aggregation Protocol is a Cisco-proprietary EtherChannel negotiation protocol using modes desirable and auto. It is functionally similar to LACP but is not the primary CCNA configure objective. Know that PAgP and LACP cannot be mixed on the same channel group.',
    tags: ['switching'],
    objectiveIds: ['2.4'],
    note: 'Describe and compare — LACP is the primary configure protocol on CCNA.',
  },
  {
    id: 'term-cdp',
    term: 'CDP',
    aliases: ['Cisco Discovery Protocol', 'show cdp neighbors', 'Layer 2 discovery'],
    definition:
      'Cisco Discovery Protocol is a Cisco-proprietary Layer 2 protocol that advertises device ID, IP address, platform, and connected port to directly connected Cisco neighbors. Enabled by default on Cisco devices. Use show cdp neighbors detail for troubleshooting physical topology.',
    tags: ['switching'],
    objectiveIds: ['2.3'],
  },
  {
    id: 'term-lldp',
    term: 'LLDP',
    aliases: ['Link Layer Discovery Protocol', '802.1AB', 'show lldp neighbors', 'vendor-neutral discovery'],
    definition:
      'Link Layer Discovery Protocol is an IEEE 802.1AB vendor-neutral neighbor discovery protocol that advertises chassis ID, port ID, and system capabilities. It must be enabled on Cisco devices (lldp run). CCNA tests comparing CDP and LLDP and reading neighbor output.',
    tags: ['switching'],
    objectiveIds: ['2.3'],
  },
  {
    id: 'term-dtp',
    term: 'DTP',
    aliases: ['Dynamic Trunking Protocol', 'switchport mode dynamic', 'trunk negotiation'],
    definition:
      'Dynamic Trunking Protocol is a Cisco-proprietary protocol that negotiates trunk formation between switches. Modes include switchport mode trunk, access, dynamic desirable, and dynamic auto. CCNA expects you to understand DTP behavior and that best practice is to hard-code trunk or access mode on ports.',
    tags: ['switching'],
    objectiveIds: ['2.2'],
  },
  {
    id: 'term-nat',
    term: 'NAT',
    aliases: ['Network Address Translation', 'inside source NAT', 'address translation'],
    definition:
      'Network Address Translation modifies IP addresses in packet headers so private inside addresses can reach public outside networks. CCNA 200-301 focuses on inside source NAT using static and dynamic (PAT) methods. NAT is typically applied on a router interface facing the outside network.',
    tags: ['nat', 'services'],
    objectiveIds: ['4.1'],
  },
  {
    id: 'term-pat',
    term: 'PAT',
    aliases: ['Port Address Translation', 'NAT overload', 'ip nat inside source list overload', 'many-to-one NAT'],
    definition:
      'Port Address Translation (NAT overload) maps many inside private addresses to a single public IP by using unique source port numbers. It is the most common home and enterprise edge NAT method. Configured with overload on the ip nat inside source statement in CCNA labs.',
    tags: ['nat'],
    objectiveIds: ['4.1'],
  },
  {
    id: 'term-inside-local-global',
    term: 'Inside local / inside global',
    aliases: ['NAT terminology', 'local vs global address', 'outside local', 'outside global'],
    definition:
      'Inside local is the IP address of an inside host as known on the inside network (usually private). Inside global is the translated address as seen on the outside network. Outside local and outside global describe the remote destination from each perspective. CCNA exam questions often test these four terms in scenario form.',
    tags: ['nat'],
    objectiveIds: ['4.1'],
  },
  {
    id: 'term-static-nat',
    term: 'Static NAT',
    aliases: ['one-to-one NAT', 'ip nat inside source static', 'permanent NAT mapping'],
    definition:
      'Static NAT creates a permanent one-to-one mapping between an inside local and an inside global address. It is used when an internal server must be reachable from the outside with a fixed public IP. Configured with ip nat inside source static on Cisco routers.',
    tags: ['nat'],
    objectiveIds: ['4.1'],
  },
  {
    id: 'term-acl',
    term: 'ACL',
    aliases: ['Access Control List', 'access-list', 'traffic filter', 'packet filter'],
    definition:
      'An Access Control List is an ordered set of permit and deny statements that classify traffic by source, destination, protocol, or port. Standard ACLs filter on source only; extended ACLs filter on multiple criteria. ACLs are applied to interfaces in a direction (in or out) and use an implicit deny at the end.',
    tags: ['security'],
    objectiveIds: ['5.5'],
  },
  {
    id: 'term-extended-acl',
    term: 'Extended ACL',
    aliases: ['access-list extended', 'numbered ACL 100-199', 'named extended ACL'],
    definition:
      'An extended ACL can filter on source and destination IP, protocol, and port numbers (e.g., permit tcp any any eq 80). Place extended ACLs close to the source to filter unwanted traffic early. CCNA requires configuring numbered (100–199, 2000–2699) or named extended ACLs and applying them to interfaces.',
    tags: ['security'],
    objectiveIds: ['5.5'],
  },
  {
    id: 'term-wildcard-mask',
    term: 'Wildcard mask',
    aliases: ['inverse mask', 'ACL wildcard', 'OSPF wildcard mask', '0.0.0.255'],
    definition:
      'A wildcard mask tells the router which bits of an address to match: 0 means must match, 1 means ignore. In ACLs, 0.0.0.255 matches all hosts in a /24. OSPF uses wildcard masks in network or area statements. Wildcard masks are the inverse of subnet masks.',
    tags: ['security', 'routing'],
    objectiveIds: ['5.5', '3.4'],
  },
  {
    id: 'term-wpa2',
    term: 'WPA2',
    aliases: ['Wi-Fi Protected Access 2', '802.11i', 'AES encryption', 'CCMP'],
    definition:
      'WPA2 implements 802.11i security using AES-CCMP for strong encryption and replaces the weaker WEP and WPA (TKIP). Enterprise mode uses 802.1X with a RADIUS server; personal mode uses a pre-shared key. CCNA expects comparison of wireless security protocols and recognition of WPA2 as current best practice.',
    tags: ['security', 'wireless'],
    objectiveIds: ['5.8'],
  },
  {
    id: 'term-wpa2-psk',
    term: 'WPA2-PSK',
    aliases: ['WPA2 Personal', 'pre-shared key', 'WPA2-PSK AES', 'WLAN PSK'],
    definition:
      'WPA2-PSK (Personal) authenticates clients with a shared passphrase and encrypts traffic with AES. It is common in SOHO and small office WLANs without a RADIUS server. CCNA 200-301 includes configuring a WLAN with WPA2 PSK on a wireless controller or autonomous AP.',
    tags: ['security', 'wireless'],
    objectiveIds: ['5.9', '2.8'],
  },
  {
    id: 'term-ssh',
    term: 'SSH',
    aliases: ['Secure Shell', 'SSH v2', 'crypto key generate rsa', 'remote management'],
    definition:
      'SSH provides encrypted remote CLI access to network devices, replacing insecure Telnet. Requires an RSA key pair, domain name, and transport input ssh on vty lines. CCNA requires configuring SSH version 2 for remote device management and verifying connectivity.',
    tags: ['security', 'services'],
    objectiveIds: ['4.8', '5.3'],
  },
  {
    id: 'term-aaa',
    term: 'AAA',
    aliases: ['Authentication Authorization Accounting', 'aaa new-model', 'security framework'],
    definition:
      'AAA is the framework for controlling who can access a device (authentication), what they can do (authorization), and recording what they did (accounting). It centralizes policy on TACACS+ or RADIUS servers. CCNA covers AAA concepts and basic configuration with server-based authentication.',
    tags: ['security'],
    objectiveIds: ['5.4', '5.7'],
  },
  {
    id: 'term-tacacs-plus',
    term: 'TACACS+',
    aliases: ['TACACS+', 'Cisco AAA protocol', 'TCP port 49', 'device administration'],
    definition:
      'TACACS+ is a Cisco protocol (TCP 49) that separates authentication, authorization, and accounting into distinct functions. It encrypts the entire packet body and is preferred for device administration AAA. CCNA tests TACACS+ vs RADIUS differences and AAA server configuration.',
    tags: ['security'],
    objectiveIds: ['5.4'],
  },
  {
    id: 'term-radius',
    term: 'RADIUS',
    aliases: ['Remote Authentication Dial-In User Service', 'UDP 1812', '802.1X authentication'],
    definition:
      'RADIUS is an open-standard AAA protocol (UDP 1812/1813) commonly used for network access control and 802.1X wireless authentication. It combines authentication and authorization and encrypts only the password. CCNA compares RADIUS with TACACS+ and configures AAA using either server type.',
    tags: ['security', 'wireless'],
    objectiveIds: ['5.4', '5.8'],
  },
  {
    id: 'term-dhcp',
    term: 'DHCP',
    aliases: ['Dynamic Host Configuration Protocol', 'IP address assignment', 'DORA process', 'DHCP relay'],
    definition:
      'DHCP automatically assigns IP addresses, masks, gateways, and DNS servers to clients using Discover, Offer, Request, Acknowledge (DORA). Routers can act as DHCP servers or DHCP relay agents (ip helper-address) forwarding broadcasts to a remote server. CCNA covers DHCP role, relay, and client verification.',
    tags: ['services'],
    objectiveIds: ['4.3', '4.6'],
  },
  {
    id: 'term-dns',
    term: 'DNS',
    aliases: ['Domain Name System', 'name resolution', 'FQDN to IP', 'A record'],
    definition:
      'DNS resolves human-readable hostnames to IP addresses using a hierarchical distributed database. Clients query recursive resolvers; servers cache responses to reduce load. CCNA expects you to explain DNS role in IP networks and verify that clients receive correct DNS server addresses via DHCP.',
    tags: ['services'],
    objectiveIds: ['4.3'],
  },
  {
    id: 'term-ntp',
    term: 'NTP',
    aliases: ['Network Time Protocol', 'clock synchronization', 'stratum', 'ntp server'],
    definition:
      'NTP synchronizes clocks across network devices using a stratum hierarchy anchored to authoritative time sources. Consistent timestamps are critical for syslog correlation, certificate validation, and troubleshooting. CCNA requires configuring and verifying NTP client or server associations.',
    tags: ['services'],
    objectiveIds: ['4.2'],
  },
  {
    id: 'term-snmp',
    term: 'SNMP',
    aliases: ['Simple Network Management Protocol', 'MIB', 'SNMPv2c', 'network monitoring'],
    definition:
      'SNMP allows management stations to poll or trap network devices for operational data defined in MIBs. SNMPv2c uses community strings (read-only or read-write). CCNA covers SNMP purpose, basic components (manager, agent, MIB), and security limitations of community-based access.',
    tags: ['services'],
    objectiveIds: ['4.4'],
  },
  {
    id: 'term-syslog',
    term: 'Syslog',
    aliases: ['system logging', 'logging trap', 'syslog severity', 'centralized logging'],
    definition:
      'Syslog collects and forwards device event messages to a central server for monitoring and troubleshooting. Messages are ranked by severity (0 emergency through 7 debug). CCNA tests syslog facility, severity levels, and configuring logging to a remote syslog host.',
    tags: ['services'],
    objectiveIds: ['4.5'],
  },
  {
    id: 'term-ssid',
    term: 'SSID',
    aliases: ['Service Set Identifier', 'wireless network name', 'WLAN name'],
    definition:
      'An SSID is the human-readable name broadcast (or hidden) by an access point to identify a wireless network. Clients associate to an SSID and must match its security settings (e.g., WPA2-PSK). Multiple SSIDs can exist on one AP, each mapped to a VLAN on the controller.',
    tags: ['wireless'],
    objectiveIds: ['2.6', '2.8'],
  },
  {
    id: 'term-wlc',
    term: 'WLC',
    aliases: ['Wireless LAN Controller', 'Cisco WLC', 'centralized wireless', 'CAPWAP'],
    definition:
      'A Wireless LAN Controller centralizes management of lightweight access points using CAPWAP tunnels for control and data. It handles SSID policies, security, RF management, and client roaming. CCNA compares split-MAC (lightweight + WLC) with autonomous AP architectures.',
    tags: ['wireless'],
    objectiveIds: ['2.6', '2.7'],
  },
  {
    id: 'term-ap-modes',
    term: 'AP modes',
    aliases: ['lightweight AP', 'autonomous AP', 'FlexConnect', 'local mode', 'monitor mode'],
    definition:
      'Cisco AP modes define how an access point operates: local (tunnel to WLC), FlexConnect (local switching at branch), autonomous (standalone), monitor (IDS), sniffer, or rogue detector. CCNA requires comparing Cisco wireless architectures and describing when each AP mode applies.',
    tags: ['wireless'],
    objectiveIds: ['2.6'],
  },
  {
    id: 'term-rest-api',
    term: 'REST API',
    aliases: ['RESTful API', 'HTTP methods', 'GET POST PUT DELETE', 'northbound API'],
    definition:
      'A REST API exposes network device or controller functions over HTTP using standard methods: GET (read), POST (create), PUT (update), DELETE (remove). It uses stateless requests and returns data in JSON or XML. CCNA covers REST characteristics as the primary automation interface for modern controllers.',
    tags: ['automation'],
    objectiveIds: ['6.5'],
  },
  {
    id: 'term-json',
    term: 'JSON',
    aliases: ['JavaScript Object Notation', 'key-value pairs', 'API data format', 'configuration payload'],
    definition:
      'JSON is a lightweight text format using key-value pairs and arrays to represent structured data. Controllers and REST APIs exchange configuration and operational state in JSON. CCNA requires reading and interpreting simple JSON payloads returned by network APIs and automation tools.',
    tags: ['automation'],
    objectiveIds: ['6.6'],
  },
  {
    id: 'term-sdn',
    term: 'SDN',
    aliases: ['Software-Defined Networking', 'control plane separation', 'controller-based networking', 'southbound northbound'],
    definition:
      'Software-Defined Networking separates the control plane (centralized controller) from the data plane (forwarding devices), enabling programmatic network-wide policy. Southbound APIs (e.g., OpenFlow) program devices; northbound APIs serve applications. CCNA treats SDN as a conceptual contrast to traditional distributed control.',
    tags: ['automation'],
    objectiveIds: ['6.2', '6.3'],
    note: 'Conceptual — no full SDN lab configuration on CCNA.',
  },
]
