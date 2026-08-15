/** Per-topic `show ...` command output lookup tables, split from cliEngine.js for ≤900L maintainability. Consumers import these from cliEngine.js, which re-exports this module. */

/** R1 routing table for LAB-31-ROUTE-INTERPRET (objective 3.1). */
export const CLI_ROUTE_31_SHOW_OUTPUT = {
  'show ip route': `Codes: C - connected, L - local, S - static, O - OSPF
Gateway of last resort is 203.0.113.1 to network 0.0.0.0

      10.0.0.0/8 is variably subnetted, 4 subnets, 2 masks
C       10.0.1.0/24 is directly connected, GigabitEthernet0/0
L       10.0.1.1/32 is directly connected, GigabitEthernet0/0
O       10.0.2.0/24 [110/20] via 10.0.12.2, 00:05:12, GigabitEthernet0/1
S       10.10.10.0/24 [1/0] via 203.0.113.1
S*      0.0.0.0/0 [1/0] via 203.0.113.1`,
  'show ip route connected': `Codes: C - connected, L - local
C       10.0.1.0/24 is directly connected, GigabitEthernet0/0
L       10.0.1.1/32 is directly connected, GigabitEthernet0/0`,
  'show ip route ospf': `Codes: O - OSPF
O       10.0.2.0/24 [110/20] via 10.0.12.2, 00:05:12, GigabitEthernet0/1`,
  'show ip route 10.0.2.0': `Routing entry for 10.0.2.0/24
  Known via "ospf 1", distance 110, metric 20, type intra area
  Last update from 10.0.12.2 on GigabitEthernet0/1, 00:05:12 ago
  Routing Descriptor Blocks:
  * 10.0.12.2, from 2.2.2.2, 00:05:12 ago, via GigabitEthernet0/1
    Route metric is 20, traffic share count is 1`,
  'show ip route static': `Codes: S - static
S       10.10.10.0/24 [1/0] via 203.0.113.1
S*      0.0.0.0/0 [1/0] via 203.0.113.1`,
}

/** R1 routing table for LAB-ROUTE-FORWARD-32 (objective 3.2 — LPM / AD). */
export const CLI_ROUTE_32_SHOW_OUTPUT = {
  'show ip route': `Codes: C - connected, L - local, S - static, O - OSPF
Gateway of last resort is 10.0.0.1 to network 0.0.0.0

      10.0.0.0/8 is variably subnetted, 3 subnets, 3 masks
C       192.168.1.0/24 is directly connected, GigabitEthernet0/0
L       192.168.1.1/32 is directly connected, GigabitEthernet0/0
O       192.168.2.0/24 [110/20] via 10.0.0.2, 00:12:04, GigabitEthernet0/1
S       172.16.0.0/16 [1/0] via 10.0.0.2
S*      0.0.0.0/0 [1/0] via 10.0.0.1`,
  'show ip route 192.168.2.0': `Routing entry for 192.168.2.0/24
  Known via "ospf 1", distance 110, metric 20, type intra area
  Last update from 10.0.0.2 on GigabitEthernet0/1, 00:12:04 ago
  Routing Descriptor Blocks:
  * 10.0.0.2, from 2.2.2.2, 00:12:04 ago, via GigabitEthernet0/1
    Route metric is 20, traffic share count is 1`,
  'show ip route ospf': `Codes: O - OSPF
O       192.168.2.0/24 [110/20] via 10.0.0.2, 00:12:04, GigabitEthernet0/1`,
  'show ip route static': `Codes: S - static
S       172.16.0.0/16 [1/0] via 10.0.0.2
S*      0.0.0.0/0 [1/0] via 10.0.0.1`,
}

/** OSPF verify outputs for LAB-OSPF-VERIFY-34 (objective 3.4). */
export const CLI_OSPF_VERIFY_34_SHOW_OUTPUT = {
  'show ip ospf neighbor': `Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           1   FULL/  -        00:00:35    10.0.12.2       GigabitEthernet0/0`,
  'show ip route ospf': `Codes: O - OSPF
O       10.0.2.0/24 [110/20] via 10.0.12.2, 00:08:22, GigabitEthernet0/0`,
  'show ip protocols': `Routing Protocol is "ospf 1"
  Outgoing update filter list for all interfaces is not set
  Incoming update filter list for all interfaces is not set
  Router ID 1.1.1.1
  Number of areas in this router is 1. 1 normal 0 stub 0 nssa
  Routing for Networks:
    10.0.1.0 0.0.0.255 area 0
    10.0.12.0 0.0.0.3 area 0
  Passive Interface(s):
    GigabitEthernet0/1`,
  'show ip ospf interface brief': `Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0        1     0               10.0.12.1/30     2     BDR   1/1
Gi0/1        1     0               10.0.1.1/24      1     DR    0/0`,
}

/** HSRP verify outputs for LAB-HSRP-VERIFY-35 (objective 3.5). */
export const CLI_HSRP_VERIFY_35_SHOW_OUTPUT = {
  'show standby brief': `                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0       1    150 P Active  local           192.168.1.3     192.168.1.1`,
  'show standby': `GigabitEthernet0/0 - Group 1
  State is Active
  5 state changes, last state change 00:12:30
  Virtual IP address is 192.168.1.1
  Active virtual MAC address is 0000.0c07.ac01
  Local virtual MAC address is 0000.0c07.ac01 (bia 0000.0c07.ac01)
  Hello time 3 sec, hold time 10 sec
  Next hello sent in 1.892 secs
  Preemption enabled
  Active router is local
  Standby router is 192.168.1.3, priority 100
  Priority 150 (configured 150)
  Group name is "hsrp-Gi0/0-1" (default)`,
  'show ip interface brief': `Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     192.168.1.2     YES manual up                    up
GigabitEthernet0/1     unassigned      YES unset  administratively down down`,
}

/** OSPF passive-interface outputs for LAB-OSPF-ADJ-34 (objective 3.4). */
export const CLI_OSPF_ADJ_34_SHOW_OUTPUT = {
  'show ip protocols': `Routing Protocol is "ospf 1"
  Outgoing update filter list for all interfaces is not set
  Incoming update filter list for all interfaces is not set
  Router ID 1.1.1.1
  Number of areas in this router is 1. 1 normal 0 stub 0 nssa
  Routing for Networks:
    10.0.1.0 0.0.0.255 area 0
    10.0.12.0 0.0.0.3 area 0
  Passive Interface(s):
    GigabitEthernet0/1`,
  'show ip ospf interface brief': `Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0        1     0               10.0.12.1/30     2     BDR   1/1
Gi0/1        1     0               10.0.1.1/24      1     DR    0/0`,
  'show ip ospf neighbor': `Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           1   FULL/  -        00:00:35    10.0.12.2       GigabitEthernet0/0`,
  'show ip route ospf': `Codes: O - OSPF
O       10.0.2.0/24 [110/20] via 10.0.12.2, 00:08:22, GigabitEthernet0/0`,
}

/** HSRP gateway config read for LAB-HSRP-GATEWAY (objective 3.5). */
export const CLI_HSRP_GATEWAY_35_SHOW_OUTPUT = {
  'show running-config | section interface gi0/0': `interface GigabitEthernet0/0
 ip address 192.168.1.2 255.255.255.0
 standby 1 ip 192.168.1.1
 standby 1 priority 150
 standby 1 preempt`,
  'show standby brief': `                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0       1    150 P Active  local           192.168.1.3     192.168.1.1`,
  'show standby': `GigabitEthernet0/0 - Group 1
  State is Active
  5 state changes, last state change 00:12:30
  Virtual IP address is 192.168.1.1
  Active virtual MAC address is 0000.0c07.ac01
  Local virtual MAC address is 0000.0c07.ac01 (bia 0000.0c07.ac01)
  Hello time 3 sec, hold time 10 sec
  Preemption enabled
  Active router is local
  Standby router is 192.168.1.3, priority 100
  Priority 150 (configured 150)
  Group name is "hsrp-Gi0/0-1" (default)`,
}

/** Extended ACL verify for LAB-ACL-CONFIG-55 (objective 5.5). */
export const CLI_ACL_CONFIG_55_SHOW_OUTPUT = {
  'show running-config | section access-list': `ip access-list extended SALES_TO_SRV
 permit tcp 192.168.10.0 0.0.0.255 10.1.1.0 0.0.0.255 eq 80
 deny ip 192.168.10.0 0.0.0.255 10.1.1.0 0.0.0.255`,
  'show access-lists': `Extended IP access list SALES_TO_SRV
    10 permit tcp 192.168.10.0 0.0.0.255 10.1.1.0 0.0.0.255 eq www
    20 deny ip 192.168.10.0 0.0.0.255 10.1.1.0 0.0.0.255 (42 matches)`,
  'show ip interface gi0/0': `GigabitEthernet0/0 is up, line protocol is up
  Internet address is 192.168.10.1/24
  Inbound  access list is SALES_TO_SRV
  Outgoing access list is not set`,
}

/** Port security verify for LAB-PORTSEC-56 (objective 5.6). */
export const CLI_PORTSEC_56_SHOW_OUTPUT = {
  'show running-config interface gi0/1': `interface GigabitEthernet0/1
 switchport mode access
 switchport port-security
 switchport port-security maximum 1
 switchport port-security violation shutdown`,
  'show port-security interface gi0/1': `Port Security              : Enabled
 Port Status                : Secure-up
 Violation Mode             : Shutdown
 Aging Time                 : 0 mins
 Aging Type                 : Absolute
 SecureStatic Address Aging : Disabled
 Maximum MAC Addresses      : 1
 Total MAC Addresses        : 1
 Configured MAC Addresses   : 0
 Sticky MAC Addresses       : 0
 Last Source Address:Vlan   : aabb.cc00.0101:10
 Security Violation Count   : 0`,
  'show port-security': `Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action
                (Count)       (Count)          (Count)
---------------------------------------------------------------------------
  Gi0/1              1             1                  0         Shutdown
---------------------------------------------------------------------------
Total Addresses in System (excluding one mac per port)     : 0
Max Addresses limit in System (excluding one mac per port) : 8192`,
}

/** NTP client verify for LAB-NTP-CLIENT (objective 4.2). */
export const CLI_NTP_42_SHOW_OUTPUT = {
  'show running-config | include ntp': 'ntp server 203.0.113.1',
  'show ntp status': `Clock is synchronized, stratum 2, reference is 203.0.113.1
nominal freq is 250.0000 Hz, actual freq is 249.9987 Hz, precision is 2**18
reference time is E7A5B2C3.12345678 (12:34:56.123 UTC Mon Mar 1 2025)
clock offset is 0.1234 msec, root delay is 12.34 msec
root dispersion is 1.23 msec, peer dispersion is 0.45 msec`,
  'show ntp associations': `      address         ref clock   st   when   poll reach  delay     offset    disp
*~203.0.113.1     .GPS.           1    34    64   377  12.3   -0.45     0.8
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured`,
}

/** DHCP pool verify for LAB-DHCP-POOL-43 (objective 4.3). */
export const CLI_DHCP_POOL_43_SHOW_OUTPUT = {
  'show running-config | section dhcp': `ip dhcp excluded-address 192.168.10.1 192.168.10.10
!
ip dhcp pool LAN10
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1
 dns-server 8.8.8.8`,
  'show ip dhcp pool': `Pool LAN10 :
 Utilization mark (high/low)    : 100 / 0
 Subnet size (first/next)       : 0 / 0
 Total addresses                : 244
 Leased addresses               : 1
 Pending event                  : none
 1 subnet is currently in the pool
 Current index        IP address range                    Leased addresses
 192.168.10.0         192.168.10.11    - 192.168.10.254     1

Pool LAN10 domain name: (not set)
 DNS server 8.8.8.8
 Default router 192.168.10.1
 NetBIOS name server: (not set)`,
  'show ip dhcp binding': `Bindings from all pools not associated with VRF:
IP address       Client-ID/Hardware address/   Lease expiration        Type
                 User name
192.168.10.11    0063.0000.0000.01               Mar 01 2025 08:00 AM    Automatic`,
}

/** SNMP verify for LAB-SNMP-CONFIG-44 (objective 4.4). */
export const CLI_SNMP_44_SHOW_OUTPUT = {
  'show running-config | include snmp': `snmp-server community CCNAro RO
snmp-server location DC1-Rack12
snmp-server contact NetOps Team`,
  'show snmp community': `Community name: CCNAro
Community Index: internal00000001
Community SecurityName: CCNAro
storage-type: nonvolatile active
access-list: SNMP-READ`,
  'show snmp': `Chassis: CISCO2911/K9
Contact: NetOps Team
Location: DC1-Rack12
0 SNMP packets input
0 SNMP packets output`,
}

/** Syslog verify for LAB-SYSLOG-REMOTE (objective 4.5). */
export const CLI_SYSLOG_45_SHOW_OUTPUT = {
  'show running-config | include logging': `service timestamps log datetime msec
logging host 192.168.1.100
logging trap informational`,
  'show logging': `Syslog logging: enabled (0 messages dropped, 0 flushes, 0 overruns)
    Console logging: level debugging, 12 messages logged
    Monitor logging: level debugging, 0 messages logged
    Buffer logging:  level debugging, 12 messages logged
    Logging to 192.168.1.100  (udp port 514,  audit disabled,
              authentication disabled, encryption disabled, link up),
              8 message lines logged`,
  'show ip route 192.168.1.100': `Routing entry for 192.168.1.0/24
  Known via "connected", distance 0, metric 0
  Routing Descriptor Blocks:
  * directly connected, via GigabitEthernet0/1`,
}

/** TFTP backup verify for LAB-TFTP-CONFIG-49 (objective 4.9). */
export const CLI_TFTP_49_SHOW_OUTPUT = {
  'ping 192.168.1.50': `Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.1.50, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms`,
  'show archive': `The maximum archive configurations allowed is 10
There are currently 1 archive configurations saved
The next archive file will be named flash:archive-2
 Archive #1 saved at 12:34:56 UTC Mon Mar 1 2025`,
  'dir tftp:': `Directory of tftp://192.168.1.50/
  1  -rw-     4521  r1-backup.cfg`,
}

/** STP root verify for LAB-STP-ROOT (objective 2.5). */
export const CLI_STP_25_SHOW_OUTPUT = {
  'show running-config | include spanning-tree': 'spanning-tree vlan 1 root primary',
  'show spanning-tree vlan 1': `VLAN0001
  Spanning tree enabled protocol ieee
  Root ID    Priority    24577
             Address     aabb.cc00.0100
             This bridge is the root
             Hello Time  2 sec  Max Age 20 sec  Forward Delay 15 sec
  Bridge ID  Priority    24577  (priority 24576 sys-id-ext 1)
             Address     aabb.cc00.0100`,
  'show spanning-tree root': `                                        Root    Hello Max Fwd
Vlan                   Root ID          Cost    Time Age Dly  Root Port
---------------- -------------------- --------- ----- --- ---  ----------
VLAN0001         aabb.cc00.0100       0         2     20  15`,
}

/** Device access verify for LAB-DEVICE-ACCESS (objective 5.3). */
export const CLI_ACCESS_53_SHOW_OUTPUT = {
  'show running-config | section username': `username admin privilege 15 secret 5 $1$mERr$hx5PtPdXFCZepYLX4qzPn.`,
  'show running-config | section line con': `line con 0
 login local`,
  'show running-config | include enable': 'enable secret 5 $1$mERr$hx5PtPdXFCZepYLX4qzPn.',
}

/** SSH VTY verify for LAB-SSH-VTY (objective 5.3 / 4.8). */
export const CLI_SSH_53_SHOW_OUTPUT = {
  'show running-config | section line vty': `line vty 0 4
 transport input ssh
 login local`,
  'show ip ssh': `SSH Enabled - version 2.0
Authentication timeout: 120 secs; Authentication retries: 3
Minimum expected Diffie Hellman key size : 1024 bits
IOS Keys in SECSH format(ssh-rsa, base64 encoded):
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC...`,
  'show users': `    Line       User       Host(s)              Idle       Location
*  1 vty 0    admin      idle                 00:00:00    192.168.1.100`,
}

/** VLAN/trunk verify for LAB-VLAN-TRUNK (objective 2.1). */
export const CLI_VLAN_TRUNK_21_SHOW_OUTPUT = {
  'show vlan brief': `VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/3
10   Sales                            active    Gi0/1
20   Engineering                      active    Gi0/2`,
  'show interfaces trunk': `Port        Mode         Encapsulation  Status        Native vlan
Gi0/3       on           802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/3       10,20

Port        Vlans allowed and active in management domain
Gi0/3       10,20`,
  'show interfaces gi0/3 switchport': `Name: Gi0/3
Switchport: Enabled
Administrative Mode: trunk
Operational Mode: trunk
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: dot1q
Negotiation of Trunking: On
Access Mode VLAN: 1 (default)
Trunking Native Mode VLAN: 1 (default)
Trunking VLANs Enabled: 10,20`,
  'show interfaces gi0/1 switchport': `Name: Gi0/1
Switchport: Enabled
Administrative Mode: trunk
Operational Mode: trunk
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: dot1q
Negotiation of Trunking: Off
Access Mode VLAN: 1 (default)
Trunking Native Mode VLAN: 99 (Inactive)
Trunking VLANs Enabled: 10,20`,
}

/** EtherChannel verify for LAB-ETHERCHANNEL (objective 2.4). */
export const CLI_EC_24_SHOW_OUTPUT = {
  'show running-config | section interface': `interface GigabitEthernet0/1
 switchport mode trunk
 channel-group 1 mode active
interface GigabitEthernet0/2
 switchport mode trunk
 channel-group 1 mode active`,
  'show etherchannel summary': `Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      f - failed to allocate aggregator

Group Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(SU)       LACP        Gi0/1(P)    Gi0/2(P)`,
  'show interfaces port-channel 1': `Port-channel1 is up, line protocol is up
  Hardware is EtherChannel, address is aabb.cc00.0100
  MTU 1500 bytes, BW 2000000 Kbit/sec`,
  'show etherchannel port-channel': `Port-channels in the group:
------------------------
Port-channel: Po2
------------
Age of the Port-channel   = 00d:01h:12m:33s
Protocol =   PAgP
Ports in the Port-channel:
Index   Load   Port     EC state        No of bits
------+------+------+------------------+-----------
  0     00     Gi0/1    Desirable-Sl       0
  1     00     Gi0/2    Desirable-Sl       0`,
}

/** PortFast / BPDU Guard verify for LAB-STP-PORTFAST (objective 2.5). */
export const CLI_STP_PORTFAST_25_SHOW_OUTPUT = {
  'show spanning-tree interface fa0/1 portfast': 'PortFast is enabled',
  'show running-config | include portfast': `spanning-tree portfast
spanning-tree bpduguard enable`,
  'show spanning-tree interface fa0/1': `Vlan1
  PortFast is enabled
  BPDU guard is enabled`,
}

/** Floating static verify for LAB-STATIC-FLOATING (objective 3.3). */
export const CLI_FLOATING_STATIC_33_SHOW_OUTPUT = {
  'show ip route static': `Codes: S - static
S     10.0.2.0/24 [1/0] via 10.0.12.2`,
  'show running-config | include ip route': `ip route 10.0.2.0 255.255.255.0 10.0.12.2
ip route 10.0.2.0 255.255.255.0 10.0.13.2 5`,
  'show ip route 10.0.2.0': `Routing entry for 10.0.2.0/24
  Known via "static", distance 1, metric 0
  Routing Descriptor Blocks:
  * 10.0.12.2
    Route metric is 0, traffic share count is 1`,
}

/** LLDP verify for LAB-LLDP (objective 2.3). */
export const CLI_LLDP_23_SHOW_OUTPUT = {
  'show lldp neighbors': `Device ID        Local Intf     Hold-time  Capability      Port ID
SW2              Gi0/1          120        B,R             Gi0/1`,
  'show running-config | include cdp': 'no cdp run',
  'show running-config | include lldp': 'lldp run',
  'show lldp neighbors detail': `Local Intf: Gi0/1
Chassis id: SW2
Port id: Gi0/1
System Name: SW2
Capabilities: Bridge, Router
Management Addresses: 192.168.1.2`,
}

/** DAI + DHCP snooping verify for LAB-DAI-DHCP-SNOOPING (objective 5.6). */
export const CLI_DAI_56_SHOW_OUTPUT = {
  'show ip dhcp snooping': `Switch DHCP snooping is enabled
DHCP snooping is configured on following VLANs:
1
DHCP snooping is operational on following VLANs:
1`,
  'show ip dhcp snooping binding': `MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  ----------
aabb.cc00.0201        192.168.10.50     86400      dhcp-snooping   1     Gi0/1`,
  'show ip arp inspection vlan 1': `Vlan   Configuration    Operation   ACL Name   Static ACL
----   -------------    ---------   --------   ----------
1      Enabled          Active`,
}

/** AAA local verify for LAB-AAA-LOCAL (objective 5.4). */
export const CLI_AAA_54_SHOW_OUTPUT = {
  'show running-config | section aaa': `aaa new-model
aaa authentication login default local
aaa authorization exec default local`,
  'show running-config | section line vty': `line vty 0 4
 login authentication default
 transport input ssh`,
  'show aaa user all': `                    Username                    Unique_ID
 netadmin                            0x00000001`,
}

/** DHCP relay verify for LAB-DHCP-RELAY (objective 4.6). */
export const CLI_DHCP_RELAY_46_SHOW_OUTPUT = {
  'show running-config | section dhcp': `ip dhcp pool REMOTE_LAN
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1`,
  'show running-config interface gi0/1': `interface GigabitEthernet0/1
 ip address 192.168.10.1 255.255.255.0
 ip helper-address 10.0.0.1`,
  'show ip dhcp binding': `IP address       Client-ID/Hardware address/   Lease expiration        Type
192.168.10.50    0063.0000.0000.0a               Mar 02 2025 10:00 AM    Automatic`,
}

/** Single-area OSPF verify for LAB-OSPF-SINGLE-AREA (objective 3.4). */
export const CLI_OSPF_SINGLE_34_SHOW_OUTPUT = {
  'show ip ospf neighbor': `Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           1   FULL/  -        00:00:35    10.0.12.2       GigabitEthernet0/0`,
  'show ip route ospf': `Codes: O - OSPF
O       10.0.2.0/24 [110/2] via 10.0.12.2, 00:05:00, GigabitEthernet0/0`,
  'show ip protocols': `Routing Protocol is "ospf 1"
  Router ID 1.1.1.1
  Routing for Networks:
    10.0.1.0 0.0.0.255 area 0
    10.0.12.0 0.0.0.3 area 0`,
}

/** NAT PAT verify for LAB-NAT-PAT (objective 4.1). */
export const CLI_NAT_41_SHOW_OUTPUT = {
  'show running-config | include nat': `ip nat inside source list 1 interface GigabitEthernet0/0 overload
interface GigabitEthernet0/0
 ip nat outside
interface GigabitEthernet0/1
 ip nat inside`,
  'show ip nat translations': `Pro Inside global      Inside local       Outside local      Outside global
icmp 203.0.113.1:1024   192.168.1.10:1024  198.51.100.1:1024  198.51.100.1:1024`,
  'show ip nat statistics': `Total active translations: 1 (0 static, 1 dynamic; 0 extended)
Outside interfaces:
  GigabitEthernet0/0
Inside interfaces:
  GigabitEthernet0/1
Hits: 12  Misses: 0`,
}

/** IPv4 subnetting verify for LAB-IPV4-SUBNETTING (objective 1.6). */
export const CLI_SUBNET_16_SHOW_OUTPUT = {
  'show ip route': `Codes: C - connected, S - static
Gateway of last resort is not set

C    192.168.10.0/26 is directly connected, GigabitEthernet0/0.10
C    192.168.10.64/27 is directly connected, GigabitEthernet0/0.20`,
  'show ip interface brief': `Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0.10  192.168.10.1    YES manual up                    up
GigabitEthernet0/0.20  192.168.10.65   YES manual up                    up`,
  'show interfaces trunk': `Port        Mode         Encapsulation  Status        Native vlan
Gi0/0       on           802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/0       10,20`,
}

/** DHCP snooping verify for LAB-DHCP-SNOOP-27 (objective 2.7). */
export const CLI_DHCP_SNOOP_27_SHOW_OUTPUT = {
  'show ip dhcp snooping': `Switch DHCP snooping is enabled
Switch DHCP snooping is configured on following VLANs:
1
DHCP snooping is operational on following VLANs:
1
DHCP snooping is configured on the following L3 Interfaces:

Interface                  Trusted
-------------------        -------
GigabitEthernet0/1         yes`,
  'show ip dhcp snooping binding': `MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  ----------
aabb.cc00.0101      192.168.1.50     86400       dhcp-snooping  1     FastEthernet0/5`,
  'show running-config | include ip dhcp snooping': `ip dhcp snooping
ip dhcp snooping vlan 1
interface GigabitEthernet0/1
 ip dhcp snooping trust`,
}

/** WLC lightweight AP verify for LAB-WIRELESS-ARCH (objective 2.6). */
export const CLI_WIRELESS_ARCH_26_SHOW_OUTPUT = {
  'show ap summary': `Number of APs............................ 3
Global AP User Name...................... admin

AP Name             Slots  AP Model  Ethernet MAC    Location
------------------  -----  --------  --------------    --------
AP-Floor1-01        2      AIR-CAP   aabb.cc00.0101    default
AP-Floor1-02        2      AIR-CAP   aabb.cc00.0102    default
AP-Floor2-01        2      AIR-CAP   aabb.cc00.0103    default

State: All APs Joined — Lightweight mode (CAPWAP-managed)`,
  'show wireless client summary': `Number of Clients...................... 4

MAC Address       AP Name          WLAN  VLAN  Protocol
----------------  ---------------  ----  ----  --------
aabb.cc00.c001    AP-Floor1-01     1     20    802.11ax
aabb.cc00.c002    AP-Floor1-02     1     20    802.11ax`,
  'show capwap detail': `AP Name: AP-Floor1-01
  CAPWAP Control Channel: UP (UDP 5246, DTLS)
  CAPWAP Data Channel:    UP (UDP 5247)
AP Name: AP-Floor1-02
  CAPWAP Control Channel: UP (UDP 5246, DTLS)
  CAPWAP Data Channel:    UP (UDP 5247)`,
}

/** IPv6 static route verify for LAB-IPV6-STATIC (objective 3.3). */
export const CLI_IPV6_STATIC_33_SHOW_OUTPUT = {
  'show ipv6 route static': `IPv6 Routing Table - default - 3 entries
Codes: C - Connected, S - Static
S   2001:DB8:20::/64 [1/0]
     via 2001:DB8:12::2`,
  'show ipv6 interface brief': `Interface              IPv6-Address                              Status
GigabitEthernet0/0     2001:DB8:12::1/64                         [up/up]`,
  'show ipv6 route': `IPv6 Routing Table - default - 3 entries
Codes: C - Connected, L - Local, S - Static
C   2001:DB8:12::/64 [0/0]
     via GigabitEthernet0/0, directly connected
S   2001:DB8:20::/64 [1/0]
     via 2001:DB8:12::2`,
}

/** WLAN SSID verify for LAB-WLAN-SSID (objective 2.8). */
export const CLI_WLAN_SSID_28_SHOW_OUTPUT = {
  'show wlan summary': `Number of WLANs: 1

WLAN ID  SSID         Status   Security
-------  -----------  -------  -----------------
1        CORP_WIFI    Enabled  WPA2 PSK + AES-CCMP`,
  'show ap summary': `Number of APs............................ 2
AP Name             State
------------------  ------
AP-01               Joined
AP-02               Joined`,
  'show wlan CORP_WIFI': `WLAN Identifier.................................. 1
Network Name (SSID)................................ CORP_WIFI
Status........................................... Enabled
Security.......................................... WPA2 PSK, AES-CCMP
Interface.......................................... VLAN10`,
}

/** MAC learning verify for LAB-MAC-FORWARD-15 (objective 1.5). */
export const CLI_MAC_FORWARD_15_SHOW_OUTPUT = {
  'show mac address-table': `Mac Address Table
Vlan    Mac Address       Type        Ports
----    -----------       ----        -----
  10    aabb.cc00.0101    DYNAMIC     Fa0/2
  10    0011.2233.4455    STATIC      Fa0/1`,
  'show mac address-table dynamic': `Vlan    Mac Address       Type        Ports
----    -----------       ----        -----
  10    aabb.cc00.0101    DYNAMIC     Fa0/2`,
  'show mac address-table count': `Dynamic Address Count: 1
Static Address Count:  1
Total Mac Addresses:   2`,
}

/** WPA2-PSK WLAN verify for LAB-WPA2-PSK-59 (objective 5.9). */
export const CLI_WPA2_PSK_59_SHOW_OUTPUT = {
  'show wlan summary': `WLAN ID  SSID         Status   Security
1        GUEST_WIFI   Enabled  WPA2 PSK + AES-CCMP`,
  'show wlan GUEST_WIFI': `WLAN ID: 1
SSID: GUEST_WIFI
Status: Enabled
Security: WPA2 Personal (PSK)
Cipher: AES-CCMP
Interface: VLAN30 (192.168.30.0/24)`,
  'show client summary': `Number of Clients: 2
MAC Address       IP Address      AP Name           SSID
ccdd.ee00.0203    192.168.30.55   AP-Lobby          GUEST_WIFI`,
}

/** L3 EtherChannel verify for LAB-L3-ETHERCHANNEL (objective 2.4). */
export const CLI_L3_EC_24_SHOW_OUTPUT = {
  'show etherchannel summary': `Flags:  D - down        P - bundled in port-channel
        R - Layer3      U - in use

Group Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(RU)       LACP        Gi0/1(P)    Gi0/2(P)`,
  'show ip interface brief': `Interface              IP-Address      OK? Method Status                Protocol
Port-channel1          10.0.12.1       YES manual up                    up
GigabitEthernet0/1     unassigned      YES unset  up                    up
GigabitEthernet0/2     unassigned      YES unset  up                    up`,
  'show running-config interface port-channel 1': `interface Port-channel1
 no switchport
 ip address 10.0.12.1 255.255.255.252`,
}

/** IPv6 addressing verify for LAB-D11-18 (objective 1.8). */
export const CLI_IPV6_ADDR_18_SHOW_OUTPUT = {
  'show ipv6 interface brief': `Interface              IPv6-Address                              Status
GigabitEthernet0/0     2001:DB8:ACAD:1::1/64                     [up/up]
                       FE80::1:1FF:FE00:1                        [up/up]`,
  'show ipv6 interface gi0/0': `GigabitEthernet0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is FE80::1:1FF:FE00:1
  Global unicast address(es):
    2001:DB8:ACAD:1::1, subnet is 2001:DB8:ACAD:1::/64`,
  'show ipv6 route connected': `IPv6 Routing Table - default - 4 entries
C   2001:DB8:ACAD:1::/64 [0/0]
     via GigabitEthernet0/0, directly connected`,
}

/** TFTP/flash backup verify for LAB-D49-49 (objective 4.9). */
export const CLI_TFTP_BACKUP_49_SHOW_OUTPUT = {
  'show flash:': `-#- --length-- -----date/time------ path
1   125829120  Mar 01 2025 12:00:00 +00:00  c2960-lanbasek9-mz.152-7.E.bin
2      4521   Mar 01 2025 12:34:56 +00:00  vlan.dat`,
  'show file systems': `File Systems:

     Size(b)     Free(b)      Type  Flags  Prefixes
*   125829120    45000000     flash     rw   flash:
           -           -    opaque     rw   archive:`,
  'dir flash:': `Directory of flash:/

    1  -rw-   125829120  Mar 01 2025 12:00:00 +00:00  c2960-lanbasek9-mz.152-7.E.bin
    2  -rw-        4521  Mar 01 2025 12:34:56 +00:00  vlan.dat

125829120 bytes total (45000000 bytes free)`,
  'show version': `Cisco IOS Software, C2960 Software (C2960-LANBASEK9-M), Version 15.2(7)E
System image file is "flash:c2960-lanbasek9-mz.152-7.E.bin"
Uptime is 3 weeks, 2 days, 4 hours, 12 minutes`,
}

/** Troubleshoot lab show outputs (objective 3.6 TS labs). */
export const CLI_TS_SHOW_OUTPUT = {
  'show ip ospf neighbor': `Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           1   INIT/DROTHER    00:00:38    10.0.12.2       GigabitEthernet0/0`,
  'show running-config | section router ospf': `router ospf 1
 network 10.0.12.0 0.0.0.3 area 1`,
  'show cdp neighbors detail': `Device ID: SW2
IP address: 192.168.1.2
Platform: cisco WS-C2960,  Capabilities: Switch
Interface: GigabitEthernet0/1,  Port ID (outgoing port): GigabitEthernet0/1
Native VLAN mismatch discovered on GigabitEthernet0/1`,
  'show interfaces trunk': `Port        Mode         Encapsulation  Status        Native vlan
Gi0/1       on           802.1q         trunking      1`,
  'show ip interface brief': `Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     192.168.1.1     YES manual administratively down down`,
  'show access-lists': `Extended IP access list OFFICE_TO_SERVERS
    10 permit icmp 192.168.1.0 0.0.0.255 10.0.0.0 0.0.0.255 (5 matches)
    20 deny ip any any (42 matches)`,
  'show ip route': `Codes: C - connected, L - local, S - static, O - OSPF
Gateway of last resort is not set
      10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C       192.168.1.0/24 is directly connected, GigabitEthernet0/1`,
  'show ip dhcp binding': `Bindings from all pools not associated with VRF:`,
  'show running-config interface gi0/1': `interface GigabitEthernet0/1
 ip address 192.168.10.1 255.255.255.0`,
  'show standby brief': `Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0       1    100   Standby 192.168.1.3     local           192.168.1.1`,
  'show ip interface gi0/0': `GigabitEthernet0/0 is up, line protocol is up
  Internet address is 192.168.1.1/25
  Wrong subnet mask — should be /24 (255.255.255.0)`,
  'show ip route 172.16.50.0': `% Network not in table`,
  'show ip route static': `Codes: S - static`,
  'show running-config | include ip route': `ip route 172.16.50.0 255.255.255.0 10.0.12.99`,
  'show client summary': `Number of Clients: 3
MAC Address       IP Address      AP Name           SSID
aabb.cc00.0101    192.168.10.50   AP-Floor1         CORP_WIFI`,
  'show wlan summary': `WLAN ID  SSID        Status    Interface
1        CORP_WIFI   Enabled   VLAN10`,
  // Second, genuinely distinct piece of evidence for each "Root cause" task
  // below — confirms the diagnosis rather than re-running the prior command.
  'show ip ospf interface brief': `Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0        1     1               10.0.12.1/30       1     DOWN  0/0`,
  'show interfaces gi0/1 switchport': `Name: Gi0/1
Switchport: Enabled
Administrative Mode: trunk
Operational Mode: trunk
Trunking Native Mode VLAN: 99 (Inactive)`,
  'show interfaces gi0/0': `GigabitEthernet0/0 is administratively down, line protocol is down (disabled)
  Internet address is 192.168.1.1/24
  MTU 1500 bytes, BW 1000000 Kbit, DLY 10 usec`,
  'show ip interface gi0/1': `GigabitEthernet0/1 is up, line protocol is up
  Internet address is 10.0.0.1/24
  Inbound  access list is not set
  Outgoing access list is not set
  Helper address is not set`,
  'show ip route 0.0.0.0': `% Network not in table`,
  'show standby': `GigabitEthernet0/0 - Group 1
  State is Standby
  Virtual IP address is 192.168.1.1
  Active virtual MAC address is 0000.0c07.ac01
  Hello time 3 sec, hold time 10 sec
  Preemption disabled
  Priority 100 (default 100)`,
  'show running-config interface gi0/0': `interface GigabitEthernet0/0
 ip address 192.168.1.1 255.255.255.128`,
  'show arp': `Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  10.0.12.2               0   aabb.cc00.0210  ARPA   GigabitEthernet0/1`,
  'show wlan 1': `WLAN Identifier.................................. 1
Network Name (SSID)................................ CORP_WIFI
Status........................................... Enabled
Interface........................................ VLAN10`,
  // Third verify step for the labs that only had two real distinct commands,
  // so the 3-task quality floor is met with real content instead of an
  // auto-padded re-run of the command directly above.
  'show running-config | include shutdown': `interface GigabitEthernet0/0
 shutdown`,
  'show running-config | section access-list': `ip access-list extended OFFICE_TO_SERVERS
 permit icmp any any
 deny ip any any`,
  'show ip route summary': `IP routing table name is default (0x0)
Route Source    Networks    Subnets
connected       1           1
static          0           0
Total           1           1`,
  'show running-config | section standby': `interface GigabitEthernet0/0
 standby 1 ip 192.168.1.1`,
  'show running-config | include ip address': ` ip address 192.168.1.1 255.255.255.128`,
}
