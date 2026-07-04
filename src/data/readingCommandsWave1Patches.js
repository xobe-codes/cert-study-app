/** Reading-tab CLI reference blocks for objectives with zero commands in coverage scan. */

export const READING_COMMANDS_WAVE1_PATCHES = {
  '4.2': {
    commands: [
      { id: '4.2-cmd1', command: 'ntp server <ip>', mode: 'global config', purpose: 'Point the device at an NTP stratum source.', example: 'R2(config)# ntp server 203.0.113.1', ckuIds: ['CKU-NTP'] },
      { id: '4.2-cmd2', command: 'show ntp status', mode: 'privileged EXEC', purpose: 'Confirm Clock is synchronized and read stratum.', example: 'R2# show ntp status', ckuIds: ['CKU-NTP'] },
      { id: '4.2-cmd3', command: 'show ntp associations', mode: 'privileged EXEC', purpose: 'List peers; *~ marks the selected sys.peer.', example: 'R2# show ntp associations', ckuIds: ['CKU-NTP'] },
    ],
  },
  '4.3': {
    commands: [
      { id: '4.3-cmd1', command: 'ip dhcp pool <name>', mode: 'DHCP pool config', purpose: 'Define a named DHCP scope with network and options.', example: 'R1(config)# ip dhcp pool LAN10', ckuIds: ['CKU-DHCP'] },
      { id: '4.3-cmd2', command: 'ip dhcp excluded-address', mode: 'global config', purpose: 'Reserve addresses for static devices.', example: 'R1(config)# ip dhcp excluded-address 192.168.10.1 192.168.10.10', ckuIds: ['CKU-DHCP'] },
      { id: '4.3-cmd3', command: 'show ip dhcp pool', mode: 'privileged EXEC', purpose: 'Verify pool network, default-router, and dns-server.', example: 'R1# show ip dhcp pool', ckuIds: ['CKU-DHCP'] },
    ],
  },
  '4.4': {
    commands: [
      { id: '4.4-cmd1', command: 'snmp-server community <name> RO', mode: 'global config', purpose: 'Read-only SNMPv2c community for NMS polling.', example: 'R1(config)# snmp-server community CCNAro RO', ckuIds: ['CKU-SNMP'] },
      { id: '4.4-cmd2', command: 'show snmp community', mode: 'privileged EXEC', purpose: 'List configured communities and access.', example: 'R1# show snmp community', ckuIds: ['CKU-SNMP'] },
    ],
  },
  '4.5': {
    commands: [
      { id: '4.5-cmd1', command: 'logging host <ip>', mode: 'global config', purpose: 'Forward syslog traps to a remote collector (UDP/514).', example: 'R1(config)# logging host 192.168.1.100', ckuIds: ['CKU-SYSLOG'] },
      { id: '4.5-cmd2', command: 'show logging', mode: 'privileged EXEC', purpose: 'Confirm remote host and trap level.', example: 'R1# show logging', ckuIds: ['CKU-SYSLOG'] },
    ],
  },
  '4.8': {
    commands: [
      { id: '4.8-cmd1', command: 'transport input ssh', mode: 'line vty', purpose: 'Restrict VTY to SSH — disables Telnet.', example: 'R1(config-line)# transport input ssh', ckuIds: ['CKU-SSH'] },
      { id: '4.8-cmd2', command: 'show ip ssh', mode: 'privileged EXEC', purpose: 'Verify SSH version 2.0 is enabled.', example: 'R1# show ip ssh', ckuIds: ['CKU-SSH'] },
    ],
  },
  '5.3': {
    commands: [
      { id: '5.3-cmd1', command: 'enable secret <password>', mode: 'global config', purpose: 'Encrypted privileged-mode password (preferred over enable password).', example: 'R1(config)# enable secret ciscoenable', ckuIds: ['CKU-ENABLE-SECRET'] },
      { id: '5.3-cmd2', command: 'username <name> privilege 15 secret <pass>', mode: 'global config', purpose: 'Local admin user for login local.', example: 'R1(config)# username admin privilege 15 secret adminpass', ckuIds: ['CKU-LOCAL-AUTH'] },
      { id: '5.3-cmd3', command: 'login local', mode: 'line con / vty', purpose: 'Authenticate against the local username database.', example: 'R1(config-line)# login local', ckuIds: ['CKU-LOCAL-AUTH'] },
    ],
  },
  '3.5': {
    commands: [
      { id: '3.5-cmd1', command: 'standby <group> ip <vip>', mode: 'interface config', purpose: 'Virtual default gateway IP shared by HSRP group.', example: 'R1(config-if)# standby 1 ip 192.168.1.1', ckuIds: ['CKU-HSRP'] },
      { id: '3.5-cmd2', command: 'show standby brief', mode: 'privileged EXEC', purpose: 'Active/standby state, priorities, virtual IP.', example: 'R1# show standby brief', ckuIds: ['CKU-HSRP'] },
    ],
  },
  '3.6': {
    commands: [
      { id: '3.6-cmd1', command: 'show ip interface brief', mode: 'privileged EXEC', purpose: 'First L3 check — up/up, correct IP/mask.', example: 'R1# show ip interface brief', ckuIds: ['CKU-TROUBLESHOOTING'] },
      { id: '3.6-cmd2', command: 'show ip route', mode: 'privileged EXEC', purpose: 'Confirm expected prefix and next-hop installed.', example: 'R1# show ip route', ckuIds: ['CKU-TROUBLESHOOTING'] },
    ],
  },
}
