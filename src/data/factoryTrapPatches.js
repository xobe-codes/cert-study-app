/** Exam-trap enrichment for factory reading shells (Tier C zero-trap objectives). */

export const FACTORY_TRAP_PATCHES = {
  '2.3': {
    examTraps: [
      { id: '2.3-t1', trap: 'CDP discovers neighbors through a router.', correction: 'CDP is Layer 2 only — it sees directly connected neighbors on the same link, not beyond a router hop.', ckuIds: ['CKU-CDP'] },
      { id: '2.3-t2', trap: 'LLDP and CDP are interchangeable on Cisco-only links.', correction: 'CDP is Cisco-proprietary (default on); LLDP is IEEE 802.1AB — use LLDP for multivendor environments.', ckuIds: ['CKU-LLDP'] },
    ],
  },
  '2.4': {
    examTraps: [
      { id: '2.4-t1', trap: 'Assign IP addresses to EtherChannel member interfaces.', correction: 'Configure IP/VLANs on the Port-channel interface — member links carry only channel-group settings.', ckuIds: ['CKU-ETHERCHANNEL'] },
      { id: '2.4-t2', trap: 'Mix LACP active with PAgP desirable on the same channel.', correction: 'Both sides must use the same protocol and compatible mode — LACP (802.3ad) and PAgP do not interop.', ckuIds: ['CKU-LACP'] },
    ],
  },
  '2.6': {
    examTraps: [
      { id: '2.6-t1', trap: 'Autonomous APs require a WLC for basic client connectivity.', correction: 'Autonomous (standalone) APs run full IOS and serve clients without a controller; lightweight APs need a WLC.', ckuIds: ['CKU-WLAN-ARCH'] },
      { id: '2.6-t2', trap: 'FlexConnect and local mode are the same AP role.', correction: 'Local mode tunnels traffic to WLC; FlexConnect can switch locally at the AP when WAN to WLC fails.', ckuIds: ['CKU-WLAN-ARCH'] },
    ],
  },
  '2.7': {
    examTraps: [
      { id: '2.7-t1', trap: 'APs connect directly to end-user access ports without VLAN planning.', correction: 'AP uplinks typically need trunk or dedicated VLANs for management and client SSID traffic.', ckuIds: ['CKU-WLAN-PHYS'] },
      { id: '2.7-t2', trap: 'PoE is optional for all enterprise AP deployments.', correction: 'Most ceiling/wall APs expect PoE from the switch — without it the AP may not power on.', ckuIds: ['CKU-WLAN-PHYS'] },
    ],
  },
  '2.8': {
    examTraps: [
      { id: '2.8-t1', trap: 'SSID broadcast name alone guarantees client connectivity.', correction: 'Clients need correct security profile, VLAN mapping, and DHCP/DNS reachability — SSID is only the wireless identifier.', ckuIds: ['CKU-WLAN-CLIENT'] },
      { id: '2.8-t2', trap: '2.4 GHz and 5 GHz are the same SSID with identical range and speed.', correction: 'Dual-band SSIDs share a name but bands differ in coverage, interference, and throughput — clients pick one.', ckuIds: ['CKU-WLAN-CLIENT'] },
    ],
  },
  '3.6': {
    examTraps: [
      { id: '3.6-t1', trap: 'Ping failure always means a routing problem.', correction: 'Check L1–L3 in order: interface status, ARP, then routing table — ACLs and firewalls can block ICMP with valid routes.', ckuIds: ['CKU-ROUTE-TSHOOT'] },
      { id: '3.6-t2', trap: 'A static route in config always appears in the routing table.', correction: 'A static route is installed only if the next-hop is reachable and the exit interface is up.', ckuIds: ['CKU-ROUTE-TSHOOT'] },
    ],
  },
  '4.2': {
    examTraps: [
      { id: '4.2-t1', trap: 'Stratum 1 means the local router is the reference clock.', correction: 'Stratum 1 is one hop from the reference (atomic/GPS); client stratum = server stratum + 1.', ckuIds: ['CKU-NTP'] },
      { id: '4.2-t2', trap: '`clock set` and NTP sync are equivalent.', correction: '`clock set` is manual one-time; NTP continuously synchronizes to authoritative servers.', ckuIds: ['CKU-NTP'] },
    ],
  },
  '4.3': {
    examTraps: [
      { id: '4.3-t1', trap: 'DHCP Offer is sent by the client.', correction: 'DORA: client Discover → server Offer → client Request → server Acknowledge.', ckuIds: ['CKU-DHCP'] },
      { id: '4.3-t2', trap: 'DNS and DHCP are unrelated services.', correction: 'DHCP option 6 delivers DNS server addresses to clients — they work together for name resolution.', ckuIds: ['CKU-DNS'] },
    ],
  },
  '4.4': {
    examTraps: [
      { id: '4.4-t1', trap: 'SNMPv2c encrypts community strings in transit.', correction: 'SNMPv2c sends community strings in clear text — use SNMPv3 for auth and encryption.', ckuIds: ['CKU-SNMP'] },
      { id: '4.4-t2', trap: 'SNMP GET and TRAP are the same direction.', correction: 'GET/GET-NEXT are manager-initiated polls; TRAP/INFORM are agent-initiated alerts to the manager.', ckuIds: ['CKU-SNMP'] },
    ],
  },
  '4.5': {
    examTraps: [
      { id: '4.5-t1', trap: 'Syslog severity 7 (debug) is more critical than severity 0.', correction: 'Lower number = more critical: 0 emergency through 7 debug.', ckuIds: ['CKU-SYSLOG'] },
      { id: '4.5-t2', trap: 'Syslog timestamps are reliable without NTP.', correction: 'Unsynced clocks make cross-device log correlation useless — configure NTP first.', ckuIds: ['CKU-SYSLOG'] },
    ],
  },
  '4.6': {
    examTraps: [
      { id: '4.6-t1', trap: 'Configure `ip helper-address` on the DHCP server interface.', correction: 'Helper-address goes on the router interface facing the client subnet — not on the server.', ckuIds: ['CKU-DHCP-RELAY'] },
      { id: '4.6-t2', trap: 'DHCP relay works without IP connectivity to the server.', correction: 'The relay router must have a routable path to the remote DHCP server.', ckuIds: ['CKU-DHCP-RELAY'] },
    ],
  },
  '4.7': {
    examTraps: [
      { id: '4.7-t1', trap: 'QoS always increases bandwidth.', correction: 'QoS prioritizes and manages existing bandwidth — it does not create more capacity.', ckuIds: ['CKU-QOS-PHB'] },
      { id: '4.7-t2', trap: 'All traffic classes get equal treatment by default on congested links.', correction: 'Without QoS, best-effort FIFO applies; PHB (per-hop behavior) marks and queues traffic by class.', ckuIds: ['CKU-QOS-PHB'] },
    ],
  },
  '4.8': {
    examTraps: [
      { id: '4.8-t1', trap: '`transport input ssh` works without generating RSA keys.', correction: 'Run `crypto key generate rsa` (or equivalent) before restricting VTY to SSH.', ckuIds: ['CKU-SSH'] },
      { id: '4.8-t2', trap: 'Telnet and SSH are equally secure for management.', correction: 'Telnet sends credentials in clear text; SSH encrypts the session — CCNA expects SSH-only remote access.', ckuIds: ['CKU-SSH'] },
    ],
  },
  '4.9': {
    examTraps: [
      { id: '4.9-t1', trap: 'TFTP requires username and password authentication.', correction: 'TFTP is connectionless with no auth — simple for IOS image backup/restore; FTP can require credentials.', ckuIds: ['CKU-TFTP-FTP'] },
      { id: '4.9-t2', trap: 'FTP and TFTP use the same transport and port.', correction: 'TFTP uses UDP/69; FTP uses TCP/21 (control) with separate data connection.', ckuIds: ['CKU-TFTP-FTP'] },
    ],
  },
  '4.10': {
    examTraps: [
      { id: '4.10-t1', trap: 'Cloud management eliminates the need for local device access.', correction: 'Cloud controllers add visibility and automation; console/SSH local access remains for outages and bootstrap.', ckuIds: ['CKU-MGMT-CLOUD'] },
      { id: '4.10-t2', trap: 'On-box CLI and DNA Center are mutually exclusive.', correction: 'DNA Center orchestrates campus devices; IOS CLI still exists on each device for troubleshooting.', ckuIds: ['CKU-MGMT-CLOUD'] },
    ],
  },
  '5.2': {
    examTraps: [
      { id: '5.2-t1', trap: 'Deploying ACLs alone completes a security program.', correction: 'A program layers people (training), process (incident response), and technology — ACLs are one control.', ckuIds: ['CKU-SECURITY-PROGRAM'] },
      { id: '5.2-t2', trap: 'Physical security is outside network security scope.', correction: 'Physical access control is a core security program element — protect consoles, racks, and cabling.', ckuIds: ['CKU-SECURITY-PROGRAM'] },
    ],
  },
  '5.3': {
    examTraps: [
      { id: '5.3-t1', trap: 'Use `enable password` instead of `enable secret`.', correction: '`enable secret` stores a hashed password; `enable password` is reversible in config.', ckuIds: ['CKU-PRIVILEGE-LEVELS'] },
      { id: '5.3-t2', trap: 'Telnet is acceptable when `login local` is configured.', correction: 'Local auth secures who logs in, but Telnet still sends credentials in clear text — use `transport input ssh`.', ckuIds: ['CKU-CONSOLE-VTY'] },
    ],
  },
  '5.4': {
    examTraps: [
      { id: '5.4-t1', trap: 'TACACS+ and RADIUS use the same port and protocol.', correction: 'TACACS+ uses TCP/49 (Cisco, separates AAA); RADIUS uses UDP/1812 for authentication.', ckuIds: ['CKU-AAA-SERVERS'] },
      { id: '5.4-t2', trap: 'RADIUS is preferred for per-command authorization on Cisco devices.', correction: 'TACACS+ separates authentication, authorization, and accounting — better for granular CLI command auth.', ckuIds: ['CKU-AAA-SERVERS'] },
    ],
  },
  '5.7': {
    examTraps: [
      { id: '5.7-t1', trap: 'Authentication and authorization are the same AAA function.', correction: 'Authentication = who you are; authorization = what you may do; accounting = audit log of actions.', ckuIds: ['CKU-AAA-CONCEPTS'] },
      { id: '5.7-t2', trap: 'Accounting only tracks failed login attempts.', correction: 'Accounting logs session activity (commands, duration) for audit and compliance.', ckuIds: ['CKU-AAA-CONCEPTS'] },
    ],
  },
  '5.8': {
    examTraps: [
      { id: '5.8-t1', trap: 'WEP is acceptable for enterprise WLAN security.', correction: 'WEP is broken; CCNA expects WPA2-AES (or WPA3) — never WEP for production.', ckuIds: ['CKU-WLAN-SEC'] },
      { id: '5.8-t2', trap: 'WPA3-Personal removes the need for a strong passphrase.', correction: 'WPA3 improves key exchange (SAE) but still requires a strong PSK for personal networks.', ckuIds: ['CKU-WLAN-SEC'] },
    ],
  },
  '5.10': {
    examTraps: [
      { id: '5.10-t1', trap: 'Site-to-site VPN and remote-access VPN are identical.', correction: 'Site-to-site connects networks (gateway-to-gateway); remote-access connects individual users to a network.', ckuIds: ['CKU-VPN'] },
      { id: '5.10-t2', trap: 'IPsec only provides confidentiality, not integrity.', correction: 'IPsec AH/ESP provide authentication and integrity; ESP also encrypts payload.', ckuIds: ['CKU-VPN'] },
    ],
  },
  '5.11': {
    examTraps: [
      { id: '5.11-t1', trap: 'VLANs alone provide complete security isolation.', correction: 'VLANs are L2 boundaries — routing, ACLs, and firewalls still needed between segments.', ckuIds: ['CKU-SEGMENTATION'] },
      { id: '5.11-t2', trap: 'Micro-segmentation means one flat VLAN for all servers.', correction: 'Segmentation divides trust zones (VLANs, VRFs, firewalls) to limit lateral movement.', ckuIds: ['CKU-SEGMENTATION'] },
    ],
  },
}
