/** Cisco IOS CLI simulator — shared by CLI Drill tab and Lab runner. */

export function normalizeCmd(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

export const CLI_MODE_PROMPT = {
  user: '>',
  priv: '#',
  config: '(config)#',
  'config-if': '(config-if)#',
  'config-vlan': '(config-vlan)#',
  'config-line': '(config-line)#',
  'config-router': '(config-router)#',
  'config-dhcp': '(dhcp-config)#',
  'config-acl': '(config-ext-nacl)#',
}

export const CLI_MODE_HINT = {
  priv: "privileged EXEC mode — type 'enable'",
  config: "global config — type 'configure terminal'",
  'config-if': "interface config — e.g. 'interface gi0/1'",
  'config-vlan': "VLAN config — e.g. 'vlan 20'",
  'config-line': "line config — e.g. 'line vty 0 4'",
  'config-router': "router config — e.g. 'router ospf 1'",
  'config-dhcp': "DHCP pool config — e.g. 'ip dhcp pool LAN'",
  'config-acl': "named ACL config — e.g. 'ip access-list extended NAME'",
}

export const CLI_SHOW_OUTPUT = {
  'show etherchannel summary': `Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
Number of channel-groups in use: 1
Number of aggregators:           1

Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------
1      Po1(SU)         LACP      Gi0/1(P)   Gi0/2(P)`,
  'show ip ospf neighbor': `Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           1   FULL/DR         00:00:38    10.0.0.2        GigabitEthernet0/0`,
  'show vlan brief': `VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/2, Gi0/3
20   SALES                            active    Fa0/5`,
  'show ip interface brief': `Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/1     192.168.10.1    YES manual up                    up`,
  'show spanning-tree vlan 1': `VLAN0001
  Spanning tree enabled protocol ieee
  Root ID    Priority    32769
             Address     0019.e86a.6e80
             Cost        19
             Port        1 (GigabitEthernet0/1)
  Bridge ID  Priority    32769
             Address     0019.e86a.6e80`,
  'show cdp neighbors': `Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
SW2              Gig 0/1           152             R S I    WS-C2960  Gig 0/1`,
  'show lldp neighbors': `Device ID        Local Intf     Hold-time  Capability      Port ID
SW2              Gi0/1          120        B,R             Gi0/1`,
  'show ip route': `Codes: L - local, C - connected, S - static, R - RIP, O - OSPF, D - EIGRP
       * - candidate default
Gateway of last resort is 10.0.0.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 10.0.0.1
      10.0.0.0/30 is subnetted, 1 subnets
C       10.0.0.0/30 is directly connected, GigabitEthernet0/1
L       10.0.0.1/32 is directly connected, GigabitEthernet0/1
      192.168.1.0/24 is variably subnetted, 2 subnets, 2 masks
C       192.168.1.0/24 is directly connected, GigabitEthernet0/0
L       192.168.1.1/32 is directly connected, GigabitEthernet0/0
O     192.168.2.0/24 [110/20] via 10.0.0.2, 00:01:23, GigabitEthernet0/1
S     172.16.0.0/16 [1/0] via 10.0.0.2`,
  'show ip route ospf': `Codes: O - OSPF
O     192.168.2.0/24 [110/20] via 10.0.0.2, 00:01:23, GigabitEthernet0/1`,
  'show ip route connected': `Codes: C - connected, L - local
      10.0.0.0/30 is subnetted, 1 subnets
C       10.0.0.0/30 is directly connected, GigabitEthernet0/1
L       10.0.0.1/32 is directly connected, GigabitEthernet0/1
      192.168.1.0/24 is variably subnetted, 2 subnets, 2 masks
C       192.168.1.0/24 is directly connected, GigabitEthernet0/0
L       192.168.1.1/32 is directly connected, GigabitEthernet0/0`,
  'show ip route static': `Codes: S - static
S*    0.0.0.0/0 [1/0] via 10.0.0.1
S     172.16.0.0/16 [1/0] via 10.0.0.2`,
  'show ip route 192.168.2.0': `Routing entry for 192.168.2.0/24
  Known via "ospf 1", distance 110, metric 20, type intra area
  Last update from 10.0.0.2 on GigabitEthernet0/1, 00:01:23 ago
  Routing Descriptor Blocks:
  * 10.0.0.2, from 10.0.0.2, 00:01:23 ago, via GigabitEthernet0/1
      Route metric is 20, traffic share count is 1`,
  'show standby brief': `                     P indicates configured to preempt.
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0       1    150 P Active  local           192.168.1.3     192.168.1.1`,
  'show standby': `GigabitEthernet0/0 - Group 1
  State is Active
  2 state changes, last state change 00:01:05
  Virtual IP address is 192.168.1.1
  Active virtual MAC address is 0000.0c07.ac01
  Local virtual MAC address is 0000.0c07.ac01 (bia 0000.0c07.ac01)
  Priority 150 (configured 150)
  Preemption enabled
  Active router is local
  Standby router is 192.168.1.3, priority 100`,
  'show ip protocols': `Routing Protocol is "ospf 1"
  Outgoing update filter list for all interfaces is not set
  Incoming update filter list for all interfaces is not set
  Router ID 1.1.1.1
  Number of areas in this router is 1. 1 normal, 0 stub, 0 nssa
  Maximum path: 4
  Routing for Networks:
    10.0.1.0 0.0.0.255 area 0
    10.0.12.0 0.0.0.3 area 0
  Routing Information Sources:
    Gateway         Last updated
    10.0.12.2                00:05:00
  Distance: (default is 110)`,
  'show interfaces trunk': `Port        Mode         Encapsulation  Status        Native vlan
Gi0/1       on           802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/1       1-4094

Port        Vlans allowed and active in management domain
Gi0/1       1,20`,
  'show ap summary': `AP Summary

Number of APs: 3

AP Name              Slots  AP Model      Ethernet MAC    Location      Country  IP Address   State
-------------------  -----  ------------  --------------  ------------  -------  -----------  ------
AP-Floor1            2      AIR-CAP2702I  00a3.8e10.0001  Floor 1       US       10.1.1.11    Joined
AP-Floor2            2      AIR-CAP2702I  00a3.8e10.0002  Floor 2       US       10.1.1.12    Joined
AP-Conf              2      AIR-CAP3702I  00a3.8e10.0003  Conference    US       10.1.1.13    Joined`,
  'show wireless client summary': `Number of Local Clients: 2

MAC Address     AP Name       WLAN ID  State        Protocol
-----------     ---------     -------  -----        --------
0c6e.d489.0001  AP-Floor1     1        Associated   802.11n
0c6e.d489.0002  AP-Floor2     1        Associated   802.11ac`,
  'show capwap detail': `CAPWAP Tunnel Detail

AP Name      IP Address    Control(UDP)  Data(UDP)  State
-----------  ------------  ------------  ---------  ------
AP-Floor1    10.1.1.11     5246          5247       UP
AP-Floor2    10.1.1.12     5246          5247       UP
AP-Conf      10.1.1.13     5246          5247       UP

Control messages: DTLS-encrypted. Data: optional encryption per WLAN policy.`,
  'show ip dhcp binding': `Bindings from all pools not associated with VRF:
IP address       Client-ID / Hardware address    Lease expiration          Type
192.168.1.10     0100.1122.3344.5566             Jun 18 2026 08:00 AM      Automatic
192.168.1.11     0100.aabb.ccdd.eeff             Jun 18 2026 09:15 AM      Automatic`,
  'show ip dhcp pool': `Pool LAN :
 Utilization mark (high/low)    : 100 / 0
 Subnet size (first/next)       : 0 / 0
 Total addresses                : 253
 Leased addresses               : 2
 Pending event                  : none
 1 subnet is currently in the pool :
 Current index        IP address range                Leased addresses
 192.168.1.12         192.168.1.1   - 192.168.1.254    2
 Network: 192.168.1.0/24
 Default router: 192.168.1.1
 DNS server: 8.8.8.8
 Lease length: 1 days`,
  'show hosts': `Default domain is ccna.lab
Name/address lookup uses domain service
Name servers are 8.8.8.8

Codes: UN - unknown, EX - expired, OK - OK, ?? - revalidate
       temp - temporary, perm - permanent

Host                   Port  Flags       Age Type   Address(es)
gateway.ccna.lab       None  (perm, OK)  0   IP     192.168.1.1
server.ccna.lab        None  (perm, OK)  0   IP     10.0.0.10`,
  'show ip ssh': `SSH Enabled - version 2.0
Authentication timeout: 120 secs; Authentication retries: 3
Minimum expected Diffie Hellman key size : 1024 bits
IOS Keys in SECSH format(ssh-rsa, base64 encoded):
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB...truncated... R1.ccna.lab`,
  'show users': `    Line       User       Host(s)              Idle       Location
*  1 vty 0    admin      idle                 00:00:00    192.168.1.100

  Interface    User               Mode         Idle     Peer Address`,
}

export {
  CLI_ROUTE_31_SHOW_OUTPUT, CLI_ROUTE_32_SHOW_OUTPUT, CLI_OSPF_VERIFY_34_SHOW_OUTPUT,
  CLI_HSRP_VERIFY_35_SHOW_OUTPUT, CLI_OSPF_ADJ_34_SHOW_OUTPUT, CLI_HSRP_GATEWAY_35_SHOW_OUTPUT,
  CLI_ACL_CONFIG_55_SHOW_OUTPUT, CLI_PORTSEC_56_SHOW_OUTPUT, CLI_NTP_42_SHOW_OUTPUT,
  CLI_DHCP_POOL_43_SHOW_OUTPUT, CLI_SNMP_44_SHOW_OUTPUT, CLI_SYSLOG_45_SHOW_OUTPUT,
  CLI_TFTP_49_SHOW_OUTPUT, CLI_STP_25_SHOW_OUTPUT, CLI_ACCESS_53_SHOW_OUTPUT,
  CLI_SSH_53_SHOW_OUTPUT, CLI_VLAN_TRUNK_21_SHOW_OUTPUT, CLI_EC_24_SHOW_OUTPUT,
  CLI_STP_PORTFAST_25_SHOW_OUTPUT, CLI_FLOATING_STATIC_33_SHOW_OUTPUT, CLI_LLDP_23_SHOW_OUTPUT,
  CLI_DAI_56_SHOW_OUTPUT, CLI_AAA_54_SHOW_OUTPUT, CLI_DHCP_RELAY_46_SHOW_OUTPUT,
  CLI_OSPF_SINGLE_34_SHOW_OUTPUT, CLI_NAT_41_SHOW_OUTPUT, CLI_SUBNET_16_SHOW_OUTPUT,
  CLI_DHCP_SNOOP_27_SHOW_OUTPUT, CLI_WIRELESS_ARCH_26_SHOW_OUTPUT, CLI_IPV6_STATIC_33_SHOW_OUTPUT,
  CLI_WLAN_SSID_28_SHOW_OUTPUT, CLI_MAC_FORWARD_15_SHOW_OUTPUT, CLI_WPA2_PSK_59_SHOW_OUTPUT,
  CLI_L3_EC_24_SHOW_OUTPUT, CLI_IPV6_ADDR_18_SHOW_OUTPUT, CLI_TFTP_BACKUP_49_SHOW_OUTPUT,
  CLI_TS_SHOW_OUTPUT,
} from './cliShowOutputExtras.js'

export { cliNavTarget, cliExitTarget, cliRequiredMode, commandVariants, commandMatches, commandMatchesAbbrev, cliHostnameForObjective, deviceHostname, processCliLine } from './cliProcess.js'
export { normalizeIosCli, resolveShowOutput, interfaceAnswerVariants } from './iosShorthand.js'
export { resolveIosAbbreviation, getTabCompletion, resolveIosAbbreviationForGrading } from './iosAbbrev.js'
export { gradeCliAnswerList, answersMatchShorthand, cliStringsEquivalent } from './cliGrading.js'
