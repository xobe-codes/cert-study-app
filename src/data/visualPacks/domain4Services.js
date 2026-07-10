import { topo, compare, stack, flow } from './packHelpers.js'

export const DIAGRAMS = {
  '4.1': topo('DIAG-4.1-nat', 'Inside source NAT/PAT', [
    { id: 'pc', label: 'Inside local', type: 'pc', x: 12, y: 50 },
    { id: 'r', label: 'NAT router', type: 'router', x: 45, y: 50, status: 'highlighted' },
    { id: 'web', label: 'Outside global', type: 'server', x: 80, y: 50 },
    { id: 'pool', label: 'PAT overload', type: 'process', x: 45, y: 25 },
  ], [
    { id: 'l1', source: 'pc', target: 'r', label: 'private' },
    { id: 'l2', source: 'r', target: 'web', label: 'translated' },
    { id: 'l3', source: 'pool', target: 'r', label: '' },
  ], ['Inside local → inside global (often PAT)', 'Trap: ACL defines what is translated — wrong ACL = no NAT']),

  '4.2': topo('DIAG-4.2-ntp', 'NTP hierarchy', [
    { id: 's1', label: 'Stratum 1', type: 'server', x: 50, y: 15, status: 'highlighted' },
    { id: 'r', label: 'Router client', type: 'router', x: 50, y: 50 },
    { id: 'sw', label: 'Switch client', type: 'switch', x: 25, y: 80 },
    { id: 'pc', label: 'Host', type: 'pc', x: 75, y: 80 },
  ], [
    { id: 'l1', source: 's1', target: 'r', label: 'NTP' },
    { id: 'l2', source: 'r', target: 'sw', label: 'serve' },
    { id: 'l3', source: 'r', target: 'pc', label: '' },
  ], ['Lower stratum = closer to reference clock', 'Trap: auth and ACL can block NTP silently']),

  '4.3': topo('DIAG-4.3-dhcp-dns', 'DHCP + DNS roles', [
    { id: 'cli', label: 'Client', type: 'pc', x: 15, y: 50 },
    { id: 'dhcp', label: 'DHCP', type: 'server', x: 45, y: 30, status: 'highlighted' },
    { id: 'dns', label: 'DNS', type: 'server', x: 45, y: 70, status: 'highlighted' },
    { id: 'web', label: 'www', type: 'cloud', x: 80, y: 50 },
  ], [
    { id: 'l1', source: 'cli', target: 'dhcp', label: 'DORA' },
    { id: 'l2', source: 'cli', target: 'dns', label: 'resolve' },
    { id: 'l3', source: 'dns', target: 'web', label: 'A/AAAA' },
  ], ['DHCP assigns IP params; DNS maps names→IP', 'Trap: DNS fail looks like “Internet down”']),

  '4.4': topo('DIAG-4.4-snmp', 'SNMP manage', [
    { id: 'nms', label: 'NMS', type: 'server', x: 20, y: 50, status: 'highlighted' },
    { id: 'agent', label: 'Device agent', type: 'router', x: 55, y: 50 },
    { id: 'trap', label: 'Traps/informs', type: 'process', x: 85, y: 35 },
    { id: 'poll', label: 'Get/Walk', type: 'process', x: 85, y: 65 },
  ], [
    { id: 'l1', source: 'nms', target: 'agent', label: 'poll' },
    { id: 'l2', source: 'agent', target: 'trap', label: 'event' },
    { id: 'l3', source: 'nms', target: 'poll', label: '' },
  ], ['NMS polls agents; agents send traps', 'Trap: SNMPv2c community vs v3 authPriv']),

  '4.5': topo('DIAG-4.5-syslog', 'Syslog severity path', [
    { id: 'dev', label: 'Device', type: 'router', x: 20, y: 50 },
    { id: 'buf', label: 'Logging buffer', type: 'process', x: 45, y: 30 },
    { id: 'srv', label: 'Syslog server', type: 'server', x: 75, y: 50, status: 'highlighted' },
    { id: 'con', label: 'Console', type: 'pc', x: 45, y: 70 },
  ], [
    { id: 'l1', source: 'dev', target: 'buf', label: 'local' },
    { id: 'l2', source: 'dev', target: 'srv', label: 'UDP 514' },
    { id: 'l3', source: 'dev', target: 'con', label: 'severity 0–7' },
  ], ['Severity 0–7; lower number = more severe', 'Trap: timestamps/NTP needed for useful logs']),

  '4.6': topo('DIAG-4.6-relay', 'DHCP relay', [
    { id: 'cli', label: 'Client', type: 'pc', x: 12, y: 55 },
    { id: 'r', label: 'Relay (ip helper)', type: 'router', x: 45, y: 55, status: 'highlighted' },
    { id: 'dhcp', label: 'DHCP server', type: 'server', x: 80, y: 55 },
    { id: 'vlan', label: 'Other subnet', type: 'subnet', x: 45, y: 25 },
  ], [
    { id: 'l1', source: 'cli', target: 'r', label: 'broadcast' },
    { id: 'l2', source: 'r', target: 'dhcp', label: 'unicast relay' },
    { id: 'l3', source: 'vlan', target: 'r', label: '' },
  ], ['Relay forwards DHCP across subnets', 'Trap: helper-address on wrong interface = no lease']),

  '4.7': topo('DIAG-4.7-qos', 'QoS PHB idea', [
    { id: 'in', label: 'Traffic in', type: 'process', x: 15, y: 50 },
    { id: 'class', label: 'Classify/mark', type: 'highlight', x: 40, y: 50, status: 'highlighted' },
    { id: 'queue', label: 'Queue/schedule', type: 'process', x: 65, y: 50 },
    { id: 'out', label: 'Egress', type: 'router', x: 88, y: 50 },
  ], [
    { id: 'l1', source: 'in', target: 'class', label: 'DSCP/CoS' },
    { id: 'l2', source: 'class', target: 'queue', label: 'PHB' },
    { id: 'l3', source: 'queue', target: 'out', label: 'priority/BW' },
  ], ['Per-hop behavior: classify → queue → drop/schedule', 'Trap: marking without trust boundary is messy']),

  '4.8': topo('DIAG-4.8-ssh', 'SSH management', [
    { id: 'admin', label: 'Admin', type: 'pc', x: 15, y: 50 },
    { id: 'r', label: 'VTY SSH', type: 'router', x: 50, y: 50, status: 'highlighted' },
    { id: 'tel', label: 'Telnet', type: 'pc', x: 85, y: 30, status: 'dropped' },
    { id: 'key', label: 'RSA/key', type: 'process', x: 50, y: 25 },
  ], [
    { id: 'l1', source: 'admin', target: 'r', label: 'TCP 22' },
    { id: 'l2', source: 'tel', target: 'r', label: 'insecure', status: 'dropped' },
    { id: 'l3', source: 'key', target: 'r', label: '' },
  ], ['SSH encrypts management; prefer over Telnet', 'Trap: need domain/key + VTY transport ssh']),

  '4.9': topo('DIAG-4.9-tftp-ftp', 'TFTP vs FTP', [
    { id: 'dev', label: 'Device', type: 'router', x: 20, y: 50 },
    { id: 'tftp', label: 'TFTP UDP', type: 'server', x: 55, y: 30, status: 'highlighted' },
    { id: 'ftp', label: 'FTP TCP', type: 'server', x: 55, y: 70 },
    { id: 'img', label: 'IOS/config', type: 'process', x: 85, y: 50 },
  ], [
    { id: 'l1', source: 'dev', target: 'tftp', label: 'simple' },
    { id: 'l2', source: 'dev', target: 'ftp', label: 'auth/files' },
    { id: 'l3', source: 'tftp', target: 'img', label: '' },
  ], ['TFTP simple/UDP; FTP richer/TCP + auth', 'Trap: TFTP often blocked — know when exam expects it']),

  '4.10': topo('DIAG-4.10-cloud-mgmt', 'Local vs cloud mgmt', [
    { id: 'local', label: 'On-box / NMS', type: 'pc', x: 20, y: 40 },
    { id: 'dev', label: 'Devices', type: 'switch', x: 50, y: 55 },
    { id: 'cloud', label: 'Cloud controller', type: 'cloud', x: 80, y: 40, status: 'highlighted' },
    { id: 'out', label: 'Internet path', type: 'process', x: 80, y: 75, status: 'dropped' },
  ], [
    { id: 'l1', source: 'local', target: 'dev', label: 'CLI/SNMP' },
    { id: 'l2', source: 'cloud', target: 'dev', label: 'API/tunnel' },
    { id: 'l3', source: 'out', target: 'cloud', label: 'if cloud down', status: 'dropped' },
  ], ['Cloud adds central ops; local access still needed for outages', 'Trap: cloud mgmt ≠ no console/SSH forever']),
}

export const COMPARE = {
  '4.1': compare('NAT terms', 'Inside local', ['Private host IP', 'Before NAT'], 'Inside global', ['Public/translated', 'After NAT']),
  '4.2': compare('NTP roles', 'Server/peer', ['Provide time', 'Stratum'], 'Client', ['Sync clock', 'Logs/certs']),
  '4.3': compare('DHCP vs DNS', 'DHCP', ['Offers IP/GW/DNS', 'Lease'], 'DNS', ['Name → IP', 'Recursive/query']),
  '4.4': compare('SNMP versions', 'v2c', ['Community string', 'Weaker'], 'v3', ['Auth/Priv', 'Preferred']),
  '4.5': stack('Syslog severity', [
    { label: '0–2', note: 'Emergencies / critical' },
    { label: '3–4', note: 'Errors / warnings' },
    { label: '5–7', note: 'Notice / info / debug' },
  ]),
  '4.6': compare('Same subnet vs relay', 'Local DHCP', ['Broadcast works', 'Server on LAN'], 'Relay', ['ip helper-address', 'Server remote']),
  '4.7': compare('QoS tools', 'Marking', ['DSCP/CoS', 'Trust boundary'], 'Queuing', ['Priority/BW', 'Congestion drop']),
  '4.8': compare('Remote access', 'SSH', ['Encrypted', 'Keys + VTY'], 'Telnet', ['Cleartext', 'Avoid']),
  '4.9': compare('File transfer', 'TFTP', ['UDP, simple', 'No auth really'], 'FTP', ['TCP, accounts', 'More features']),
  '4.10': compare('Mgmt plane', 'Local', ['Works offline', 'Per-box'], 'Cloud', ['Scale/visibility', 'Needs reachability']),
}

export const TRAPS = {
  '4.1': ['Static NAT vs PAT overload — know both.', 'Outside source NAT is rare on CCNA — focus inside source.'],
  '4.2': ['Devices with wrong time break certs/logs.', 'ntp master is for lab stratum — not “better than public”.'],
  '4.3': ['DHCP Discover is broadcast — routers need relay.', 'DNS cache poisoning is security depth — know basic resolve path.'],
  '4.4': ['Read-only vs read-write community risk.', 'Traps are async — polling is pull.'],
  '4.5': ['Debugging to console can overwhelm the box.', 'logging synchronous helps console readability.'],
  '4.6': ['Relay adds giaddr so server knows subnet.', 'Helper forwards more than DHCP by default — know exam focus is DHCP.'],
  '4.7': ['Voice often EF/priority — data is not.', 'QoS does not create bandwidth — it manages scarcity.'],
  '4.8': ['login local + transport input ssh common recipe.', 'ACL on VTY is management plane protection.'],
  '4.9': ['copy tftp flash classic IOS workflow.', 'FTP passive/active is deep — know TFTP vs FTP purpose.'],
  '4.10': ['Out-of-band mgmt still matters.', 'Cloud controller unreachable ≠ data plane always down.'],
}

export const FLOWS = {
  '4.1': flow('FLOW-4.1-nat', 'PAT session', ['CKU-NAT'], [['Match ACL', 'Interesting traffic.'], ['Translate', 'Port overload.'], ['Return map', 'Undo on reply.']]),
  '4.2': flow('FLOW-4.2-ntp', 'Sync time', ['CKU-NTP'], [['Point to server', 'ntp server.'], ['Associate', 'Stratum update.'], ['Verify', 'show ntp status.']]),
  '4.3': flow('FLOW-4.3-dora', 'DHCP DORA', ['CKU-DHCP'], [['Discover', 'Broadcast.'], ['Offer', 'Server proposes.'], ['Request/Ack', 'Lease bound.']]),
  '4.4': flow('FLOW-4.4-snmp', 'Monitor device', ['CKU-SNMP'], [['Configure agent', 'Community/v3.'], ['NMS polls', 'OID get.'], ['Trap on event', 'Alert ops.']]),
  '4.5': flow('FLOW-4.5-log', 'Send syslog', ['CKU-SYSLOG'], [['Set severity', 'Per destination.'], ['Send to server', 'Host logging.'], ['Read events', 'Correlate with NTP.']]),
  '4.6': flow('FLOW-4.6-relay', 'Cross-subnet DHCP', ['CKU-RELAY'], [['Client broadcasts', 'On its VLAN.'], ['Relay unicasts', 'To helper IP.'], ['Lease returns', 'Via relay.']]),
  '4.7': flow('FLOW-4.7-phb', 'Apply PHB', ['CKU-QOS'], [['Classify', 'Match traffic.'], ['Mark', 'DSCP/CoS.'], ['Queue egress', 'Schedule/drop.']]),
  '4.8': flow('FLOW-4.8-ssh', 'Enable SSH', ['CKU-SSH'], [['Keys + domain', 'crypto/hostname.'], ['VTY SSH', 'transport input.'], ['Login', 'User/AAA.']]),
  '4.9': flow('FLOW-4.9-xfer', 'Copy image', ['CKU-TFTP'], [['Reach server', 'IP connectivity.'], ['copy command', 'tftp/ftp.'], ['Verify flash', 'boot system.']]),
  '4.10': flow('FLOW-4.10-mgmt', 'Choose mgmt model', ['CKU-CLOUD'], [['Local access', 'Console/SSH.'], ['Optional cloud', 'Onboard device.'], ['Keep break-glass', 'Outage path.']]),
}
