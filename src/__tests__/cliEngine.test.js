import { describe, it, expect } from 'vitest'
import {
  normalizeCmd,
  commandMatches,
  cliNavTarget,
  cliExitTarget,
  cliRequiredMode,
  processCliLine,
  cliHostnameForObjective,
  deviceHostname,
} from '../lab/cliEngine.js'

describe('cliEngine', () => {
  it('normalizes IOS abbreviations', () => {
    expect(normalizeCmd('  Conf   T  ')).toBe('conf t')
  })

  it('matches command variants', () => {
    expect(commandMatches('conf t', 'configure terminal')).toBe(true)
    expect(commandMatches('int gi0/1', 'interface gi0/1')).toBe(true)
    expect(commandMatches('no shut', 'no shutdown')).toBe(true)
  })

  it('navigates enable and configure terminal', () => {
    let mode = 'user'
    const r1 = processCliLine({ raw: 'enable', mode, host: 'Router', objectives: [], completed: [] })
    expect(r1.newMode).toBe('priv')
    mode = r1.newMode
    const r2 = processCliLine({ raw: 'conf t', mode, host: 'Router', objectives: [], completed: [] })
    expect(r2.newMode).toBe('config')
  })

  it('rejects config commands from user EXEC', () => {
    const r = processCliLine({
      raw: 'interface gi0/1',
      mode: 'user',
      host: 'Router',
      objectives: [{ answer: ['interface gi0/1'] }],
      completed: [false],
    })
    expect(r.newlyCompleted).toHaveLength(0)
    expect(r.counters.wrongModeErrors).toBe(1)
  })

  it('completes objectives in correct mode', () => {
    let mode = 'user'
    for (const cmd of ['enable', 'conf t', 'interface gi0/1']) {
      const r = processCliLine({
        raw: cmd,
        mode,
        host: 'Router',
        objectives: [{ answer: ['interface gi0/1'] }],
        completed: [false],
      })
      mode = r.newMode
      if (r.newlyCompleted.length) break
    }
    expect(mode).toBe('config-if')
  })

  it('handles exit from config submode', () => {
    expect(cliExitTarget('exit', 'config-if')).toBe('config')
    expect(cliExitTarget('end', 'config-if')).toBe('priv')
  })

  it('maps nav targets', () => {
    expect(cliNavTarget('enable')?.to).toBe('priv')
    expect(cliNavTarget('vlan 20')?.to).toBe('config-vlan')
  })

  it('picks hostname by objective and device', () => {
    expect(cliHostnameForObjective('2.1')).toBe('Switch')
    expect(cliHostnameForObjective('3.1')).toBe('Router')
    expect(deviceHostname('SW1')).toBe('SW1')
    expect(deviceHostname('R1')).toBe('R1')
  })

  it('preserves multi-word nav args (vlan interfaces, port-channels)', () => {
    expect(cliNavTarget('interface vlan 10')?.arg).toBe('vlan 10')
    expect(cliNavTarget('interface port-channel 1')?.arg).toBe('port-channel 1')
  })

  it('requires priv mode for ping and ssh, not config', () => {
    expect(cliRequiredMode('ping 10.0.0.1')).toBe('priv')
    expect(cliRequiredMode('ssh -l admin 10.0.0.1')).toBe('priv')
  })

  it('requires config-if mode for interface-level NAT, security, and STP commands', () => {
    expect(cliRequiredMode('ip nat inside')).toBe('config-if')
    expect(cliRequiredMode('ip nat outside')).toBe('config-if')
    expect(cliRequiredMode('ip arp inspection trust')).toBe('config-if')
    expect(cliRequiredMode('ip dhcp snooping trust')).toBe('config-if')
    expect(cliRequiredMode('no switchport')).toBe('config-if')
    expect(cliRequiredMode('encapsulation dot1q 10')).toBe('config-if')
    expect(cliRequiredMode('shutdown')).toBe('config-if')
    expect(cliRequiredMode('spanning-tree portfast')).toBe('config-if')
    expect(cliRequiredMode('spanning-tree bpduguard enable')).toBe('config-if')
  })

  it('requires the right submode for router and line commands outside their main keyword', () => {
    expect(cliRequiredMode('default-information originate')).toBe('config-router')
    expect(cliRequiredMode('login authentication default')).toBe('config-line')
  })

  it('still treats global ip dhcp snooping and ip arp inspection vlan commands as global config', () => {
    expect(cliRequiredMode('ip dhcp snooping')).toBe('config')
    expect(cliRequiredMode('ip dhcp snooping vlan 1')).toBe('config')
    expect(cliRequiredMode('ip arp inspection vlan 1')).toBe('config')
  })
})
