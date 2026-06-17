import { describe, it, expect } from 'vitest'
import {
  createDeviceState,
  applyConfigCommand,
  renderShow,
  resolveDhcpClient,
  simulatePing,
  canonIface,
  displayIface,
} from '../lab/iosSim.js'

function apply(state, mode, ctxName, raw) {
  return applyConfigCommand({ state, norm: raw, mode, target: { name: ctxName } })
}

describe('iosSim', () => {
  it('canonicalizes and displays interface names', () => {
    expect(canonIface('GigabitEthernet0/1')).toBe('gi0/1')
    expect(canonIface('gi 0/1')).toBe('gi0/1')
    expect(canonIface('vlan 20')).toBe('vlan20')
    expect(displayIface('gi0/1')).toBe('GigabitEthernet0/1')
  })

  it('tracks interface IP/admin state and reflects it in show ip interface brief', () => {
    const s = createDeviceState('R1')
    apply(s, 'config-if', 'gi0/0', 'ip address 10.0.0.1 255.255.255.0')
    const downResult = apply(s, 'config-if', 'gi0/0', 'shutdown')
    expect(downResult.matched).toBe(true)
    expect(downResult.modeOk).toBe(true)

    let rows = renderShow('show ip interface brief', { state: s })
    expect(rows.find(r => r.includes('10.0.0.1'))).toMatch(/administratively down/)

    const upResult = apply(s, 'config-if', 'gi0/0', 'no shutdown')
    expect(upResult.lines.some(l => l.includes('%LINK-3-UPDOWN') && l.includes('up'))).toBe(true)

    rows = renderShow('show ip interface brief', { state: s })
    const row = rows.find(r => r.includes('10.0.0.1'))
    expect(row).toMatch(/\bup\b/)
    expect(row).not.toMatch(/administratively down/)
  })

  it('reports a recognized command issued from the wrong mode', () => {
    const s = createDeviceState('R1')
    const result = apply(s, 'config', null, 'switchport mode access')
    expect(result.matched).toBe(true)
    expect(result.modeOk).toBe(false)
    expect(result.label).toMatch(/interface config/)
  })

  it('reports unmatched/unsupported commands gracefully', () => {
    const s = createDeviceState('R1')
    const result = apply(s, 'config', null, 'wlan CORP_WIFI')
    expect(result).toEqual({ matched: false })
  })

  it('models VLAN and trunk config in show vlan brief / show interfaces trunk', () => {
    const s = createDeviceState('SW1')
    apply(s, 'config-vlan', '10', 'name Sales')
    apply(s, 'config-if', 'gi0/1', 'switchport mode access')
    apply(s, 'config-if', 'gi0/1', 'switchport access vlan 10')
    apply(s, 'config-if', 'gi0/3', 'switchport mode trunk')
    apply(s, 'config-if', 'gi0/3', 'switchport trunk allowed vlan 10,20')

    const vlanRows = renderShow('show vlan brief', { state: s })
    expect(vlanRows.some(r => r.includes('10') && r.includes('Sales') && r.includes('Gi0/1'))).toBe(true)

    const trunkRows = renderShow('show interfaces trunk', { state: s })
    expect(trunkRows.some(r => r.includes('Gi0/3'))).toBe(true)
  })

  it('resolves a DHCP lease from another device pool and records the binding', () => {
    const states = { SW1: createDeviceState('SW1'), PC1: createDeviceState('PC1') }
    apply(states.SW1, 'config-dhcp', 'mypool', 'network 192.168.10.0 255.255.255.0')
    apply(states.SW1, 'config-dhcp', 'mypool', 'default-router 192.168.10.1')
    apply(states.PC1, 'config-if', 'gi0/1', 'ip address dhcp')

    const leased = resolveDhcpClient(states, 'PC1', 'gi0/1')
    expect(leased).toBe('192.168.10.10')

    const bindingRows = renderShow('show ip dhcp binding', { state: states.SW1 })
    expect(bindingRows.some(r => r.includes('192.168.10.10'))).toBe(true)

    const pcRows = renderShow('show ip interface brief', { state: states.PC1 })
    expect(pcRows.some(r => r.includes('192.168.10.10'))).toBe(true)
  })

  it('computes generic L3 ping reachability across devices', () => {
    const states = { R1: createDeviceState('R1'), R2: createDeviceState('R2') }
    apply(states.R1, 'config-if', 'gi0/0', 'ip address 10.0.12.1 255.255.255.252')
    apply(states.R1, 'config-if', 'gi0/0', 'no shutdown')
    apply(states.R2, 'config-if', 'gi0/0', 'ip address 10.0.12.2 255.255.255.252')
    apply(states.R2, 'config-if', 'gi0/0', 'no shutdown')

    const ok = simulatePing({ target: '10.0.12.2', deviceKey: 'R1', allStates: states, labId: 'LAB-OSPF-SINGLE-AREA' })
    expect(ok.join(' ')).toMatch(/100 percent/)

    const fail = simulatePing({ target: '8.8.8.8', deviceKey: 'R1', allStates: states, labId: 'LAB-OSPF-SINGLE-AREA' })
    expect(fail.join(' ')).toMatch(/0 percent/)
  })

  it('lets an unconfigured given endpoint ping out once NAT overload is fully configured on the router', () => {
    const states = { R1: createDeviceState('R1'), PC1: createDeviceState('PC1') }
    apply(states.R1, 'config-if', 'gi0/1', 'ip address 192.168.1.1 255.255.255.0')
    apply(states.R1, 'config-if', 'gi0/1', 'ip nat inside')
    apply(states.R1, 'config-if', 'gi0/0', 'ip address 203.0.113.1 255.255.255.252')
    apply(states.R1, 'config-if', 'gi0/0', 'ip nat outside')
    apply(states.R1, 'config', null, 'access-list 1 permit 192.168.1.0 0.0.0.255')

    const beforeOverload = simulatePing({ target: '198.51.100.1', deviceKey: 'PC1', allStates: states, labId: 'LAB-NAT-PAT' })
    expect(beforeOverload.join(' ')).toMatch(/0 percent/)

    apply(states.R1, 'config', null, 'ip nat inside source list 1 interface gi0/0 overload')
    const afterOverload = simulatePing({ target: '198.51.100.1', deviceKey: 'PC1', allStates: states, labId: 'LAB-NAT-PAT' })
    expect(afterOverload.join(' ')).toMatch(/100 percent/)
  })

  it('forces the DAI lab attacker ping to fail once ARP inspection is enabled, regardless of subnet', () => {
    const states = { SW1: createDeviceState('SW1'), Attacker: createDeviceState('Attacker'), R1: createDeviceState('R1') }
    apply(states.Attacker, 'config-if', 'gi0/2', 'ip address 192.168.10.99 255.255.255.0')
    apply(states.Attacker, 'config-if', 'gi0/2', 'no shutdown')
    apply(states.R1, 'config-if', 'gi0/0', 'ip address 192.168.10.254 255.255.255.0')
    apply(states.R1, 'config-if', 'gi0/0', 'no shutdown')
    apply(states.SW1, 'config', null, 'ip arp inspection vlan 1')

    const result = simulatePing({ target: '192.168.10.254', deviceKey: 'Attacker', allStates: states, labId: 'LAB-DAI-DHCP-SNOOPING' })
    expect(result.join(' ')).toMatch(/0 percent/)
  })

  it('renders running-config and section filters from device state', () => {
    const s = createDeviceState('R1')
    apply(s, 'config-if', 'gi0/1', 'ip address 192.168.1.1 255.255.255.0')
    apply(s, 'config-router', '1', 'router-id 1.1.1.1')

    const full = renderShow('show running-config', { state: s })
    expect(full.some(l => l.includes('192.168.1.1'))).toBe(true)

    const section = renderShow('show running-config | section router ospf', { state: s })
    expect(section.some(l => l.includes('router-id'))).toBe(true)
  })

  it('returns null for show commands it does not model', () => {
    const s = createDeviceState('R1')
    expect(renderShow('show wlan summary', { state: s })).toBeNull()
  })
})
