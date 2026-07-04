/** Reading-tab CLI blocks — wave 2 closes remaining zero-command objectives. */

const cmd = (id, command, mode, purpose, example, ckuIds) =>
  ({ id, command, mode, purpose, example, ckuIds })

export const READING_COMMANDS_WAVE2_PATCHES = {
  '2.3': {
    commands: [
      cmd('2.3-cmd1', 'show cdp neighbors', 'privileged EXEC', 'List directly connected Cisco devices — ID, platform, port.', 'SW1# show cdp neighbors', ['CKU-CDP']),
    ],
  },
  '2.4': {
    commands: [
      cmd('2.4-cmd1', 'channel-group <n> mode active', 'interface config', 'Add interface to LACP EtherChannel — active negotiates.', 'SW1(config-if)# channel-group 1 mode active', ['CKU-ETHERCHANNEL']),
      cmd('2.4-cmd2', 'show etherchannel summary', 'privileged EXEC', 'Po status (SU) and member ports.', 'SW1# show etherchannel summary', ['CKU-ETHERCHANNEL']),
    ],
  },
  '2.6': {
    commands: [
      cmd('2.6-cmd1', 'show wlan summary', 'privileged EXEC', 'WLAN/SSID policies on WLC.', 'WLC# show wlan summary', ['CKU-WLAN']),
      cmd('2.6-cmd2', 'show ap summary', 'privileged EXEC', 'Joined AP count and models.', 'WLC# show ap summary', ['CKU-WLAN']),
    ],
  },
  '2.7': {
    commands: [
      cmd('2.7-cmd1', 'show vlan brief', 'privileged EXEC', 'AP management vs client VLAN on uplink.', 'SW1# show vlan brief', ['CKU-WLAN-PHYS']),
      cmd('2.7-cmd2', 'show interfaces trunk', 'privileged EXEC', 'Trunk allowed VLANs to AP.', 'SW1# show interfaces trunk', ['CKU-WLAN-PHYS']),
    ],
  },
  '2.8': {
    commands: [
      cmd('2.8-cmd1', 'show wlan summary', 'privileged EXEC', 'SSID name, security policy, VLAN mapping.', 'WLC# show wlan summary', ['CKU-WLAN-SSID']),
      cmd('2.8-cmd2', 'show client summary', 'privileged EXEC', 'Associated clients and VLAN.', 'WLC# show client summary', ['CKU-WLAN-SSID']),
    ],
  },
  '4.6': {
    commands: [
      cmd('4.6-cmd1', 'ip helper-address <ip>', 'interface config', 'Relay DHCP broadcasts to remote server.', 'R2(config-if)# ip helper-address 10.0.0.1', ['CKU-DHCP']),
      cmd('4.6-cmd2', 'show ip dhcp binding', 'privileged EXEC', 'Active leases on DHCP server.', 'R1# show ip dhcp binding', ['CKU-DHCP']),
    ],
  },
  '4.7': {
    commands: [
      cmd('4.7-cmd1', 'show policy-map interface', 'privileged EXEC', 'QoS policy applied per interface.', 'R1# show policy-map interface gi0/0', ['CKU-QOS']),
      cmd('4.7-cmd2', 'show queueing interface', 'privileged EXEC', 'Hardware queue drops and depth.', 'R1# show queueing interface gi0/0', ['CKU-QOS']),
    ],
  },
  '4.9': {
    commands: [
      cmd('4.9-cmd1', 'copy running-config tftp:', 'privileged EXEC', 'Backup running-config to TFTP (source → destination).', 'R1# copy running-config tftp:', ['CKU-TFTP-FTP']),
      cmd('4.9-cmd2', 'copy tftp: running-config', 'privileged EXEC', 'Restore config from TFTP (destination ← source).', 'R1# copy tftp: running-config', ['CKU-TFTP-FTP']),
    ],
  },
  '4.10': {
    commands: [
      cmd('4.10-cmd1', 'show license status', 'privileged EXEC', 'Smart licensing / DNA entitlement state.', 'R1# show license status', ['CKU-CLOUD-MGMT']),
      cmd('4.10-cmd2', 'show inventory', 'privileged EXEC', 'PID/serial for cloud inventory sync.', 'R1# show inventory', ['CKU-CLOUD-MGMT']),
    ],
  },
  '5.1': {
    commands: [
      cmd('5.1-cmd1', 'show crypto key mypubkey rsa', 'privileged EXEC', 'Verify RSA public key for SSH/HTTPS.', 'R1# show crypto key mypubkey rsa', ['CKU-SECURITY-CONCEPTS']),
      cmd('5.1-cmd2', 'show running-config | include password', 'privileged EXEC', 'Audit cleartext vs encrypted credentials.', 'R1# show running-config | include password', ['CKU-SECURITY-CONCEPTS']),
    ],
  },
  '5.2': {
    commands: [
      cmd('5.2-cmd1', 'show archive log config all', 'privileged EXEC', 'Configuration change audit trail.', 'R1# show archive log config all', ['CKU-SECURITY-PROGRAM']),
      cmd('5.2-cmd2', 'show logging', 'privileged EXEC', 'Security events forwarded to syslog.', 'R1# show logging', ['CKU-SECURITY-PROGRAM']),
    ],
  },
  '5.4': {
    commands: [
      cmd('5.4-cmd1', 'aaa new-model', 'global config', 'Enable AAA framework.', 'R1(config)# aaa new-model', ['CKU-AAA']),
      cmd('5.4-cmd2', 'show run | section aaa', 'privileged EXEC', 'Verify authentication method lists.', 'R1# show run | section aaa', ['CKU-AAA']),
    ],
  },
  '5.6': {
    commands: [
      cmd('5.6-cmd1', 'show port-security interface <int>', 'privileged EXEC', 'Max MACs, violation mode, secure count.', 'SW1# show port-security interface gi0/1', ['CKU-PORT-SECURITY']),
      cmd('5.6-cmd2', 'show ip dhcp snooping binding', 'privileged EXEC', 'DHCP snooping table for DAI.', 'SW1# show ip dhcp snooping binding', ['CKU-DHCP-SNOOPING']),
    ],
  },
  '5.7': {
    commands: [
      cmd('5.7-cmd1', 'aaa authentication login default local', 'global config', 'Local database authentication method list.', 'R1(config)# aaa authentication login default local', ['CKU-AAA']),
      cmd('5.7-cmd2', 'aaa authorization exec default local', 'global config', 'Authorize privileged EXEC via local DB.', 'R1(config)# aaa authorization exec default local', ['CKU-AAA']),
    ],
  },
  '5.8': {
    commands: [
      cmd('5.8-cmd1', 'show wlan security', 'privileged EXEC', 'WPA2/WPA3 policy on WLAN.', 'WLC# show wlan security', ['CKU-WLAN-SECURITY']),
      cmd('5.8-cmd2', 'show dot11 associations all-client', 'privileged EXEC', 'Client encryption and auth state.', 'AP# show dot11 associations all-client', ['CKU-WLAN-SECURITY']),
    ],
  },
  '5.9': {
    commands: [
      cmd('5.9-cmd1', 'show wlan summary', 'privileged EXEC', 'WPA2 PSK WLAN profile.', 'WLC# show wlan summary', ['CKU-WPA2-PSK']),
      cmd('5.9-cmd2', 'show client summary', 'privileged EXEC', 'Clients on secured SSID.', 'WLC# show client summary', ['CKU-WPA2-PSK']),
    ],
  },
  '5.10': {
    commands: [
      cmd('5.10-cmd1', 'show crypto isakmp sa', 'privileged EXEC', 'IPsec IKE phase-1 security associations.', 'R1# show crypto isakmp sa', ['CKU-VPN']),
      cmd('5.10-cmd2', 'show crypto ipsec sa', 'privileged EXEC', 'IPsec phase-2 tunnels and transforms.', 'R1# show crypto ipsec sa', ['CKU-VPN']),
    ],
  },
  '5.11': {
    commands: [
      cmd('5.11-cmd1', 'show zone security', 'privileged EXEC', 'ZBFW zones and member interfaces.', 'R1# show zone security', ['CKU-ZBFW']),
      cmd('5.11-cmd2', 'show zone-pair security', 'privileged EXEC', 'Inter-zone policy inspect/pass/drop.', 'R1# show zone-pair security', ['CKU-ZBFW']),
    ],
  },
  '6.1': {
    commands: [
      cmd('6.1-cmd1', 'show version', 'privileged EXEC', 'Platform, IOS version for automation inventory.', 'R1# show version', ['CKU-AUTOMATION']),
      cmd('6.1-cmd2', 'show inventory', 'privileged EXEC', 'Serial/PID for asset management APIs.', 'R1# show inventory', ['CKU-AUTOMATION']),
    ],
  },
  '6.2': {
    commands: [
      cmd('6.2-cmd1', 'show controllers', 'privileged EXEC', 'Hardware abstraction vs controller plane.', 'R1# show controllers', ['CKU-SDN']),
      cmd('6.2-cmd2', 'show ip interface brief', 'privileged EXEC', 'Traditional distributed control data plane.', 'R1# show ip interface brief', ['CKU-SDN']),
    ],
  },
  '6.3': {
    commands: [
      cmd('6.3-cmd1', 'show running-config', 'privileged EXEC', 'Southbound device config before SDN overlay.', 'R1# show running-config', ['CKU-CONTROLLER']),
      cmd('6.3-cmd2', 'show license feature', 'privileged EXEC', 'DNA / controller licensing.', 'R1# show license feature', ['CKU-CONTROLLER']),
    ],
  },
  '6.4': {
    commands: [
      cmd('6.4-cmd1', 'show cdp neighbors', 'privileged EXEC', 'Campus neighbor discovery for assurance.', 'SW1# show cdp neighbors', ['CKU-DNA']),
      cmd('6.4-cmd2', 'show ip ospf neighbor', 'privileged EXEC', 'Routing health in DNA assurance context.', 'R1# show ip ospf neighbor', ['CKU-DNA']),
    ],
  },
  '6.5': {
    commands: [
      cmd('6.5-cmd1', 'show restconf', 'privileged EXEC', 'RESTCONF/YANG availability on device.', 'R1# show restconf', ['CKU-REST-API']),
      cmd('6.5-cmd2', 'show running-config | section interface', 'privileged EXEC', 'Config target for REST PATCH/PUT.', 'R1# show running-config | section interface', ['CKU-REST-API']),
    ],
  },
  '6.6': {
    commands: [
      cmd('6.6-cmd1', 'show archive config differences nvram:startup-config system:running-config', 'privileged EXEC', 'Compare configs — JSON models mirror this intent.', 'R1# show archive config differences nvram:startup-config system:running-config', ['CKU-JSON']),
      cmd('6.6-cmd2', 'more flash:json-config.txt', 'privileged EXEC', 'Review structured JSON config payload.', 'R1# more flash:json-config.txt', ['CKU-JSON']),
    ],
  },
}
