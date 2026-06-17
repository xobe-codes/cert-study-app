import { describe, it, expect } from 'vitest'
import {
  normalizeCmd,
  commandMatches,
  commandVariants,
  cliNavTarget,
  cliExitTarget,
  cliRequiredMode,
  processCliLine,
  cliHostnameForObjective,
  deviceHostname,
  CLI_SHOW_OUTPUT,
  CLI_ROUTE_31_SHOW_OUTPUT,
} from '../lab/cliEngine.js'
import { labProgress } from '../data/ccnaLabs.js'

describe('cliEngine', () => {
  describe('normalizeCmd', () => {
    it('trims leading and trailing whitespace', () => {
      expect(normalizeCmd('  enable  ')).toBe('enable')
    })

    it('lowercases the input', () => {
      expect(normalizeCmd('ENABLE')).toBe('enable')
      expect(normalizeCmd('Show IP Route')).toBe('show ip route')
    })

    it('collapses multiple internal spaces to one', () => {
      expect(normalizeCmd('conf   t')).toBe('conf t')
      expect(normalizeCmd('  Conf   T  ')).toBe('conf t')
    })

    it('handles empty / null input gracefully', () => {
      expect(normalizeCmd('')).toBe('')
      expect(normalizeCmd(null)).toBe('')
    })
  })

  describe('commandMatches', () => {
    it('exact match returns true', () => {
      expect(commandMatches('interface gi0/1', 'interface gi0/1')).toBe(true)
    })

    it('abbreviation int matches interface', () => {
      expect(commandMatches('int gi0/0', 'interface gi0/0')).toBe(true)
    })

    it('conf t matches configure terminal', () => {
      expect(commandMatches('conf t', 'configure terminal')).toBe(true)
    })

    it('no shut matches no shutdown', () => {
      expect(commandMatches('no shut', 'no shutdown')).toBe(true)
    })

    it('unrelated command returns false', () => {
      expect(commandMatches('show version', 'interface gi0/1')).toBe(false)
    })

    it('show ip route ospf includes show ip route as substring → true', () => {
      // commandMatches uses inputNorm.includes(variant), so longer input can contain shorter expected
      expect(commandMatches('show ip route ospf', 'show ip route')).toBe(true)
    })

    it('commandVariants produces the base plus abbreviations', () => {
      const v = commandVariants('interface gi0/1')
      expect(v).toContain('interface gi0/1')
      expect(v).toContain('int gi0/1')
    })
  })

  describe('cliNavTarget', () => {
    it('enable → priv from user/priv', () => {
      const t = cliNavTarget('enable')
      expect(t?.to).toBe('priv')
      expect(t?.from).toContain('user')
    })

    it('configure terminal → config', () => {
      const t = cliNavTarget('configure terminal')
      expect(t?.to).toBe('config')
    })

    it('conf t → same config target as configure terminal', () => {
      expect(cliNavTarget('conf t')?.to).toBe('config')
    })

    it('interface gi0/0 → config-if', () => {
      expect(cliNavTarget('interface gi0/0')?.to).toBe('config-if')
    })

    it('int gi0/0 → config-if via int abbreviation pattern', () => {
      expect(cliNavTarget('int gi0/0')?.to).toBe('config-if')
    })

    it('vlan 10 → config-vlan', () => {
      const t = cliNavTarget('vlan 10')
      expect(t?.to).toBe('config-vlan')
    })

    it('unknown command → null', () => {
      expect(cliNavTarget('show ip route')).toBeNull()
      expect(cliNavTarget('no shutdown')).toBeNull()
    })
  })

  describe('cliExitTarget', () => {
    it('exit from config-if goes to config', () => {
      expect(cliExitTarget('exit', 'config-if')).toBe('config')
    })

    it('end from config-if goes to priv', () => {
      expect(cliExitTarget('end', 'config-if')).toBe('priv')
    })

    it('exit from config goes to priv', () => {
      expect(cliExitTarget('exit', 'config')).toBe('priv')
    })

    it('exit from priv goes to user', () => {
      expect(cliExitTarget('exit', 'priv')).toBe('user')
    })
  })

  describe('cliRequiredMode', () => {
    it('show commands require priv', () => {
      expect(cliRequiredMode('show ip route')).toBe('priv')
    })

    it('enable requires user mode', () => {
      expect(cliRequiredMode('enable')).toBe('user')
    })

    it('configure terminal requires priv', () => {
      expect(cliRequiredMode('configure terminal')).toBe('priv')
    })

    it('no shutdown requires config-if', () => {
      expect(cliRequiredMode('no shutdown')).toBe('config-if')
    })
  })

  describe('processCliLine — mode navigation', () => {
    it('enable from user → newMode priv', () => {
      const r = processCliLine({ raw: 'enable', mode: 'user', host: 'Router', objectives: [], completed: [] })
      expect(r.newMode).toBe('priv')
    })

    it('configure terminal from priv → newMode config', () => {
      const r = processCliLine({ raw: 'configure terminal', mode: 'priv', host: 'Router', objectives: [], completed: [] })
      expect(r.newMode).toBe('config')
    })

    it('conf t from priv → newMode config (abbreviation)', () => {
      const r = processCliLine({ raw: 'conf t', mode: 'priv', host: 'Router', objectives: [], completed: [] })
      expect(r.newMode).toBe('config')
    })

    it('exit from config → newMode priv', () => {
      const r = processCliLine({ raw: 'exit', mode: 'config', host: 'Router', objectives: [], completed: [] })
      expect(r.newMode).toBe('priv')
    })

    it('end from config → newMode priv', () => {
      const r = processCliLine({ raw: 'end', mode: 'config', host: 'Router', objectives: [], completed: [] })
      expect(r.newMode).toBe('priv')
    })
  })

  describe('processCliLine — show commands', () => {
    it('show ip route in priv mode → lines contain route table text', () => {
      const r = processCliLine({ raw: 'show ip route', mode: 'priv', host: 'Router', objectives: [], completed: [] })
      const text = r.lines.map(l => l.text).join('\n')
      expect(text).toMatch(/Gateway of last resort/)
    })

    it('show ip route in priv mode → lines contain Codes header', () => {
      const r = processCliLine({ raw: 'show ip route', mode: 'priv', host: 'Router', objectives: [], completed: [] })
      const text = r.lines.map(l => l.text).join('\n')
      expect(text).toMatch(/Codes:/)
    })

    it('show ip route ospf in priv mode → lines contain OSPF route if key exists in showOutput', () => {
      const r = processCliLine({ raw: 'show ip route ospf', mode: 'priv', host: 'Router', objectives: [], completed: [] })
      const text = r.lines.map(l => l.text).join('\n')
      // Either shows the OSPF route table or emits the not-simulated fallback
      expect(text).toMatch(/O - OSPF|not simulated/)
    })

    it('unknown show command → emits not-simulated info line', () => {
      const r = processCliLine({ raw: 'show ip bgp summary', mode: 'priv', host: 'Router', objectives: [], completed: [] })
      const text = r.lines.map(l => l.text).join('\n')
      expect(text).toMatch(/not simulated/)
    })

    it('show command from user mode → warns to enable first', () => {
      const r = processCliLine({ raw: 'show ip route', mode: 'user', host: 'Router', objectives: [], completed: [] })
      const text = r.lines.map(l => l.text).join('\n')
      expect(text).toMatch(/enable/)
    })
  })

  describe('processCliLine — objective completion', () => {
    it('vlan 10 in config mode → newlyCompleted includes 0', () => {
      const r = processCliLine({
        raw: 'vlan 10',
        mode: 'config',
        host: 'Switch',
        objectives: [{ answer: ['vlan 10'], label: 'vlan 10' }],
        completed: [false],
      })
      expect(r.newlyCompleted).toContain(0)
    })

    it('vlan 10 in user mode (wrong mode) → NOT completed, warning emitted', () => {
      const r = processCliLine({
        raw: 'vlan 10',
        mode: 'user',
        host: 'Switch',
        objectives: [{ answer: ['vlan 10'], label: 'vlan 10' }],
        completed: [false],
      })
      expect(r.newlyCompleted).toHaveLength(0)
      expect(r.counters.wrongModeErrors).toBe(1)
    })

    it('already completed objective is skipped even if command matches', () => {
      const r = processCliLine({
        raw: 'vlan 10',
        mode: 'config',
        host: 'Switch',
        objectives: [{ answer: ['vlan 10'], label: 'vlan 10' }],
        completed: [true],
      })
      expect(r.newlyCompleted).toHaveLength(0)
    })

    it('interface gi0/1 objective in config mode → completed', () => {
      const r = processCliLine({
        raw: 'interface gi0/1',
        mode: 'config',
        host: 'Router',
        objectives: [{ answer: ['interface gi0/1'], label: 'interface gi0/1' }],
        completed: [false],
      })
      expect(r.newlyCompleted).toContain(0)
      expect(r.newMode).toBe('config-if')
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
  })

  describe('processCliLine — show command completes objective', () => {
    it('show ip route in priv mode → newlyCompleted includes the objective index', () => {
      const r = processCliLine({
        raw: 'show ip route',
        mode: 'priv',
        host: 'Router',
        objectives: [{ answer: ['show ip route'], label: 'show ip route' }],
        completed: [false],
      })
      expect(r.newlyCompleted).toContain(0)
    })

    it('show ip route completing objective → emits OK line', () => {
      const r = processCliLine({
        raw: 'show ip route',
        mode: 'priv',
        host: 'Router',
        objectives: [{ answer: ['show ip route'], label: 'show ip route' }],
        completed: [false],
      })
      const text = r.lines.map(l => l.text).join('\n')
      expect(text).toMatch(/OK/)
    })
  })

  describe('processCliLine — hint command', () => {
    it('hint with a hint field → lines contain Hint:', () => {
      const r = processCliLine({
        raw: 'hint',
        mode: 'config',
        host: 'Router',
        objectives: [{ answer: ['vlan 10'], label: 'vlan 10', hint: 'Use vlan 10 command' }],
        completed: [false],
      })
      const text = r.lines.map(l => l.text).join('\n')
      expect(text).toMatch(/Hint:/)
    })

    it('hint without a hint field → lines contain Next:', () => {
      const r = processCliLine({
        raw: 'hint',
        mode: 'config',
        host: 'Router',
        objectives: [{ answer: ['vlan 10'], label: 'vlan 10' }],
        completed: [false],
      })
      const text = r.lines.map(l => l.text).join('\n')
      expect(text).toMatch(/Next:/)
    })
  })

  describe('full navigation chain', () => {
    it('navigates enable and configure terminal via conf t', () => {
      let mode = 'user'
      const r1 = processCliLine({ raw: 'enable', mode, host: 'Router', objectives: [], completed: [] })
      expect(r1.newMode).toBe('priv')
      mode = r1.newMode
      const r2 = processCliLine({ raw: 'conf t', mode, host: 'Router', objectives: [], completed: [] })
      expect(r2.newMode).toBe('config')
    })

    it('completes objectives reached in correct mode', () => {
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
  })

  describe('cliHostnameForObjective / deviceHostname', () => {
    it('objective 2.1 maps to Switch', () => {
      expect(cliHostnameForObjective('2.1')).toBe('Switch')
    })

    it('objective 3.1 maps to Router', () => {
      expect(cliHostnameForObjective('3.1')).toBe('Router')
    })

    it('deviceHostname preserves SW prefix uppercased', () => {
      expect(deviceHostname('SW1')).toBe('SW1')
    })

    it('deviceHostname returns device string when not a switch', () => {
      expect(deviceHostname('R1')).toBe('R1')
    })
  })

  describe('CLI_SHOW_OUTPUT', () => {
    it('show ip route key exists and contains Codes line', () => {
      expect(CLI_SHOW_OUTPUT['show ip route']).toMatch(/Codes:/)
    })

    it('show ip route key contains Gateway of last resort', () => {
      expect(CLI_SHOW_OUTPUT['show ip route']).toMatch(/Gateway of last resort/)
    })

    it('show vlan brief key exists', () => {
      expect(CLI_SHOW_OUTPUT['show vlan brief']).toMatch(/VLAN/)
    })
  })

  it('completes show-command objectives with exact match and prints output', () => {
    const r = processCliLine({
      raw: 'show ip route ospf',
      mode: 'priv',
      host: 'R1',
      objectives: [{ answer: ['show ip route ospf'], label: 'OSPF routes' }],
      completed: [false],
      showOutput: CLI_ROUTE_31_SHOW_OUTPUT,
    })
    expect(r.newlyCompleted).toEqual([0])
    expect(r.lines.some(l => l.text.includes('10.0.2.0/24'))).toBe(true)
  })

  it('does not match show ip route when objective is show ip route ospf', () => {
    const r = processCliLine({
      raw: 'show ip route',
      mode: 'priv',
      host: 'R1',
      objectives: [{ answer: ['show ip route ospf'] }],
      completed: [false],
      showOutput: CLI_ROUTE_31_SHOW_OUTPUT,
    })
    expect(r.newlyCompleted).toHaveLength(0)
  })

  it('lab_31_route_lite progress completes after all verify commands', () => {
    const entered = ['enable', 'show ip route', 'show ip route connected', 'show ip route ospf', 'show ip route 10.0.2.0', 'show ip route static']
    const prog = labProgress('LAB-31-ROUTE-INTERPRET', entered)
    expect(prog.complete).toBe(true)
    expect(prog.done.length).toBe(6)
  })
})
