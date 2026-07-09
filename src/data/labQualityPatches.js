/**
 * Per-lab quality overrides merged in applyLabQuality99() after config-lab-lite.
 * Generic padding fills gaps; patches supply exam-faithful verify text where needed.
 */
export const LAB_QUALITY_PATCHES = {
  'LAB-OSPF-VERIFY-34': {
    verificationChecks: [
      { id: 'v1', device: 'R1', command: 'show ip ospf neighbor', expectedResult: 'Neighbor FULL on correct interface — adjacency up in area 0', passCondition: 'OSPF neighbor state' },
      { id: 'v2', device: 'R1', command: 'show ip route ospf', expectedResult: 'O routes learned with [110/metric] and correct next-hop', passCondition: 'OSPF routes in RIB' },
      { id: 'v3', device: 'R1', command: 'show ip protocols', expectedResult: 'OSPF process 1 active with router-id and network statements', passCondition: 'routing protocol summary' },
    ],
  },
  'LAB-OSPF-ADJ-34': {
    verificationChecks: [
      { id: 'v1', device: 'R1', command: 'show ip ospf neighbor', expectedResult: 'FULL adjacency only on point-to-point link — no neighbor on wrong subnet', passCondition: 'adjacency on link only' },
      { id: 'v2', device: 'R1', command: 'show ip ospf interface brief', expectedResult: 'OSPF enabled on intended interfaces with correct area', passCondition: 'interface participation' },
      { id: 'v3', device: 'R1', command: 'show ip ospf', expectedResult: 'Process ID, router ID, and area 0 membership confirmed', passCondition: 'OSPF process detail' },
    ],
  },
  'LAB-HSRP-VERIFY-35': {
    verificationChecks: [
      { id: 'v1', device: 'R1', command: 'show standby brief', expectedResult: 'R1 Active, R2 Standby, group 1 virtual IP 192.168.1.1', passCondition: 'HSRP roles' },
      { id: 'v2', device: 'R1', command: 'show standby', expectedResult: 'Priority 150 with preempt (P) — R1 reclaims Active when up', passCondition: 'preempt and priority' },
      { id: 'v3', device: 'R1', command: 'show ip interface brief', expectedResult: 'Physical Gi0/0 .2 vs virtual gateway .1 — hosts use VIP', passCondition: 'physical vs virtual IP' },
    ],
  },
  'LAB-WIRELESS-ARCH': {
    verificationChecks: [
      { id: 'v1', device: 'WLC1', command: 'show capwap detail', expectedResult: 'CAPWAP tunnel UP — AP registered to WLC', passCondition: 'CAPWAP control/data' },
      { id: 'v2', device: 'WLC1', command: 'show wlan summary', expectedResult: 'SSID enabled with correct security policy', passCondition: 'WLAN summary' },
      { id: 'v3', device: 'AP1', command: 'show capwap client rcb', expectedResult: 'AP in Run state joined to WLC management IP', passCondition: 'AP join state' },
    ],
  },
  'LAB-DHCP-POOL-43': {
    verificationChecks: [
      { id: 'v1', device: 'R1', command: 'show ip dhcp pool', expectedResult: 'Pool LAN10 with network, default-router, and DNS options', passCondition: 'DHCP pool definition' },
      { id: 'v2', device: 'R1', command: 'show ip dhcp binding', expectedResult: 'Active lease with client IP, MAC, and lease expiry', passCondition: 'DHCP bindings' },
      { id: 'v3', device: 'R1', command: 'show running-config | section dhcp', expectedResult: 'Excluded addresses and pool name match design', passCondition: 'pool config section' },
    ],
  },
  'LAB-SNMP-CONFIG-44': {
    verificationChecks: [
      { id: 'v1', device: 'R1', command: 'show snmp community', expectedResult: 'RO community CCNAro and RW CCNArw with ACL if applied', passCondition: 'SNMP communities' },
      { id: 'v2', device: 'R1', command: 'show snmp host', expectedResult: 'Trap host IP and version (v2c) configured', passCondition: 'trap destination' },
      { id: 'v3', device: 'R1', command: 'show snmp', expectedResult: 'SNMP engine enabled with correct contact/location', passCondition: 'SNMP agent status' },
    ],
  },
  'LAB-PORT-SECURITY': {
    verificationChecks: [
      { id: 'v1', device: 'SW1', command: 'show port-security interface fa0/5', expectedResult: 'Port Security Enabled, max 1 MAC, violation shutdown', passCondition: 'port-security status' },
      { id: 'v2', device: 'SW1', command: 'show port-security', expectedResult: 'Secure sticky MAC learned on Fa0/5', passCondition: 'secure addresses' },
      { id: 'v3', device: 'SW1', command: 'show interfaces fa0/5 status', expectedResult: 'Access port in correct VLAN with link up', passCondition: 'access port state' },
    ],
  },
  'LAB-EXTENDED-ACL-BUILD': {
    verificationChecks: [
      { id: 'v1', device: 'R1', command: 'show access-lists WEB_ONLY', expectedResult: 'Permit tcp 80/443, deny ip any any — implicit deny at end', passCondition: 'ACL entries' },
      { id: 'v2', device: 'R1', command: 'show ip interface gi0/0', expectedResult: 'WEB_ONLY applied inbound on office-facing interface', passCondition: 'ACL placement' },
      { id: 'v3', device: 'R1', command: 'show access-lists', expectedResult: 'Hit counters increment on permit/deny lines after traffic', passCondition: 'ACL hit counts' },
    ],
  },
  'LAB-AUTO-REST-65': {
    commonMistakes: [
      'Thinking REST requires SOAP/XML on CCNA — JSON is standard',
      'Assuming 401 means server down — it means authentication failure',
      'Confusing PUT (full replace) with PATCH (partial update)',
      'Ignoring Content-Type application/json when parsing responses',
    ],
  },
}
