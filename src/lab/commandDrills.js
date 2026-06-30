/** CLI config drills for 14 config-heavy objectives.
 *  Each step: { prompt, answer, hint }. answer may be an array of acceptable
 *  strings (case-insensitive, whitespace-normalized match). */
export const COMMAND_DRILLS = {
  '1.6': [
    { prompt: 'Enter interface configuration mode for GigabitEthernet0/1', answer: ['interface gigabitethernet0/1', 'interface gi0/1', 'int g0/1'], hint: "Use 'interface' followed by the interface name." },
    { prompt: 'Assign the IP address 192.168.10.1 with subnet mask 255.255.255.0', answer: ['ip address 192.168.10.1 255.255.255.0'], hint: "ip address <address> <mask>" },
    { prompt: 'Enable the interface (bring it up)', answer: ['no shutdown', 'no shut'], hint: 'Interfaces are shut down by default.' },
  ],
  '1.8': [
    { prompt: 'Enable IPv6 routing on the device', answer: ['ipv6 unicast-routing'], hint: 'Global config command, required to forward IPv6.' },
    { prompt: 'On interface Gi0/1, configure IPv6 address 2001:db8:acad:1::1/64', answer: ['ipv6 address 2001:db8:acad:1::1/64'], hint: 'ipv6 address <address>/<prefix-length>' },
    { prompt: 'Enable the interface to use a link-local address automatically generated via EUI-64, in addition to the global address', answer: ['ipv6 enable'], hint: 'This command alone generates only a link-local address.' },
  ],
  '2.1': [
    { prompt: 'Create VLAN 20', answer: ['vlan 20'], hint: 'Global config command.' },
    { prompt: 'Name VLAN 20 "SALES"', answer: ['name sales', 'name SALES'], hint: 'Entered while inside VLAN config mode.' },
    { prompt: 'On interface Fa0/5, set it as an access port', answer: ['switchport mode access'], hint: 'switchport mode <mode>' },
    { prompt: 'Assign Fa0/5 to VLAN 20', answer: ['switchport access vlan 20'], hint: 'switchport access vlan <id>' },
  ],
  '2.2': [
    { prompt: 'Set interface Gi0/1 to trunk mode', answer: ['switchport mode trunk'], hint: 'switchport mode <mode>' },
    { prompt: 'Set the native VLAN on this trunk to 99', answer: ['switchport trunk native vlan 99'], hint: 'switchport trunk native vlan <id>' },
    { prompt: 'Restrict the trunk to allow only VLANs 10, 20, and 99', answer: ['switchport trunk allowed vlan 10,20,99', 'switchport trunk allowed vlan 10, 20, 99'], hint: 'switchport trunk allowed vlan <list> (comma separated, no spaces needed)' },
  ],
  '2.3': [
    { prompt: 'Globally disable CDP on the device', answer: ['no cdp run'], hint: 'CDP is enabled by default; this is a global config command.' },
    { prompt: 'Re-enable CDP globally', answer: ['cdp run'], hint: 'Opposite of the previous command.' },
    { prompt: 'On a single interface, disable CDP only on that port', answer: ['no cdp enable'], hint: 'Interface-level command (note: different keyword than the global one).' },
    { prompt: 'Globally enable LLDP', answer: ['lldp run'], hint: 'LLDP is disabled by default, unlike CDP.' },
  ],
  '2.4': [
    { prompt: 'On interface Gi0/1, add it to EtherChannel group 1 using LACP active mode', answer: ['channel-group 1 mode active'], hint: 'channel-group <number> mode <active|passive|desirable|auto>' },
    { prompt: 'On interface Gi0/2, add it to the same EtherChannel group 1 using LACP active mode', answer: ['channel-group 1 mode active'], hint: 'Same command on the second member interface.' },
    { prompt: 'Verify the EtherChannel status and member ports', answer: ['show etherchannel summary'], hint: 'show etherchannel <option>' },
  ],
  '3.3': [
    { prompt: 'Configure a static route to network 192.168.30.0/24 via next-hop 10.0.0.2', answer: ['ip route 192.168.30.0 255.255.255.0 10.0.0.2'], hint: 'ip route <network> <mask> <next-hop>' },
    { prompt: 'Configure a default static route pointing to next-hop 203.0.113.1', answer: ['ip route 0.0.0.0 0.0.0.0 203.0.113.1'], hint: 'A default route matches all destinations.' },
    { prompt: 'Configure a static IPv6 route to 2001:db8:acad:2::/64 via next-hop 2001:db8:acad:1::2', answer: ['ipv6 route 2001:db8:acad:2::/64 2001:db8:acad:1::2'], hint: 'ipv6 route <prefix>/<length> <next-hop>' },
  ],
  '3.4': [
    { prompt: 'Enter OSPF process 1 configuration mode', answer: ['router ospf 1'], hint: 'Global config command, process ID is locally significant.' },
    { prompt: 'Advertise network 10.0.0.0/24 into OSPF area 0 using a wildcard mask', answer: ['network 10.0.0.0 0.0.0.255 area 0'], hint: 'network <address> <wildcard-mask> area <area-id>' },
    { prompt: 'Set the router ID to 1.1.1.1', answer: ['router-id 1.1.1.1'], hint: 'Entered inside router ospf config mode.' },
    { prompt: 'Verify OSPF neighbor adjacencies', answer: ['show ip ospf neighbor'], hint: 'show ip ospf <option>' },
  ],
  '3.5': [
    { prompt: 'On interface Gi0/1, enable HSRP group 1 with virtual IP 192.168.1.1', answer: ['standby 1 ip 192.168.1.1'], hint: 'standby <group> ip <virtual-ip>' },
    { prompt: 'Set this router\'s HSRP priority to 150 for group 1', answer: ['standby 1 priority 150'], hint: 'standby <group> priority <value> (default is 100)' },
    { prompt: 'Enable preemption for HSRP group 1', answer: ['standby 1 preempt'], hint: 'standby <group> preempt' },
  ],
  '4.1': [
    { prompt: 'Mark interface Gi0/0 as the inside NAT interface', answer: ['ip nat inside'], hint: 'Applied on the private/LAN-facing interface.' },
    { prompt: 'Mark interface Gi0/1 as the outside NAT interface', answer: ['ip nat outside'], hint: 'Applied on the public/WAN-facing interface.' },
    { prompt: 'Configure PAT overload on Gi0/1 for ACL 1', answer: ['ip nat inside source list 1 interface gigabitethernet0/1 overload', 'ip nat inside source list 1 interface gi0/1 overload'], hint: 'ip nat inside source list <acl> interface <if> overload' },
    { prompt: 'Show active NAT translations', answer: ['show ip nat translations'], hint: 'Verify NAT mappings in privileged EXEC.' },
  ],
  '4.6': [
    { prompt: 'Create a DHCP pool named LAN_POOL', answer: ['ip dhcp pool LAN_POOL', 'ip dhcp pool lan_pool'], hint: 'Global config command.' },
    { prompt: 'Set the pool network to 192.168.1.0/24', answer: ['network 192.168.1.0 255.255.255.0'], hint: 'network <network> <mask>, entered inside the DHCP pool.' },
    { prompt: 'Set the default gateway for clients to 192.168.1.1', answer: ['default-router 192.168.1.1'], hint: 'default-router <ip>' },
    { prompt: 'On the router interface facing remote clients, relay DHCP requests to server 10.0.0.5', answer: ['ip helper-address 10.0.0.5'], hint: 'Interface-level command.' },
  ],
  '4.8': [
    { prompt: 'Set the domain name to ccna.local (required before generating SSH keys)', answer: ['ip domain-name ccna.local'], hint: 'Global config command.' },
    { prompt: 'Generate RSA keys with a modulus of 2048 bits', answer: ['crypto key generate rsa modulus 2048', 'crypto key generate rsa'], hint: 'crypto key generate rsa modulus <bits>' },
    { prompt: 'On the vty lines, allow only SSH for incoming connections', answer: ['transport input ssh'], hint: 'Entered inside line vty configuration.' },
    { prompt: 'Configure the vty lines to authenticate using the local user database', answer: ['login local'], hint: 'login local' },
  ],
  '5.3': [
    { prompt: 'Set the enable secret password to "ciscoenable"', answer: ['enable secret ciscoenable'], hint: 'enable secret <password> (encrypted, preferred over enable password)' },
    { prompt: 'Create a local user "admin" with privilege level 15 and secret "adminpass"', answer: ['username admin privilege 15 secret adminpass'], hint: 'username <name> privilege <level> secret <password>' },
    { prompt: 'On the console line, require login using the local user database', answer: ['login local'], hint: 'Entered inside line con 0 configuration.' },
  ],
  '5.5': [
    { prompt: 'Create a named extended ACL called "BLOCK_TELNET"', answer: ['ip access-list extended BLOCK_TELNET', 'ip access-list extended block_telnet'], hint: 'ip access-list extended <name>' },
    { prompt: 'Add a line denying TCP traffic from any source to any destination on port 23 (Telnet)', answer: ['deny tcp any any eq 23', 'deny tcp any any eq telnet'], hint: 'deny tcp <source> <destination> eq <port>' },
    { prompt: 'Add a line permitting all other IP traffic', answer: ['permit ip any any'], hint: 'There is an implicit deny at the end, so this is needed to allow everything else.' },
    { prompt: 'Apply this ACL inbound on interface Gi0/0', answer: ['ip access-group BLOCK_TELNET in', 'ip access-group block_telnet in'], hint: 'ip access-group <name> in|out, entered on the interface.' },
  ],
  '5.6': [
    { prompt: 'On an access port, enable port security', answer: ['switchport port-security'], hint: 'Interface must already be in access mode.' },
    { prompt: 'Set the maximum number of secure MAC addresses to 2', answer: ['switchport port-security maximum 2'], hint: 'switchport port-security maximum <number>' },
    { prompt: 'Configure sticky learning of MAC addresses', answer: ['switchport port-security mac-address sticky'], hint: 'switchport port-security mac-address sticky' },
    { prompt: 'Set the violation action to shutdown the port', answer: ['switchport port-security violation shutdown'], hint: 'switchport port-security violation <protect|restrict|shutdown> (shutdown is default)' },
  ],
}
