import { describe, it, expect } from 'vitest'
import { buildCommandIndex, getCommandById } from '../commands/commandIndex.js'
import { CCNA_COMMAND_REGISTRY } from '../commands/ccnaCommandRegistry.js'
import { searchCommandsGlobal, filterCommands } from '../commands/commandSearch.js'
import { COMMAND_WORKFLOWS } from '../commands/commandWorkflows.js'

describe('command hub', () => {
  it('builds a unified index from curated packs and registry', () => {
    const index = buildCommandIndex()
    expect(index.commands.length).toBeGreaterThan(59)
    expect(index.commands.length).toBeGreaterThanOrEqual(CCNA_COMMAND_REGISTRY.length)
    expect(index.workflows.length).toBe(COMMAND_WORKFLOWS.length)
    expect(index.commandById.size).toBe(index.commands.length)
  })

  it('finds show ip route via global search', () => {
    const index = buildCommandIndex()
    const results = searchCommandsGlobal(index, 'show ip route')
    expect(results.commands.some(x => x.command.command.includes('show ip route'))).toBe(true)
  })

  it('finds commands via IOS abbreviations', () => {
    const index = buildCommandIndex()
    const results = searchCommandsGlobal(index, 'sh vlan brief')
    expect(results.commands.some(x => x.command.command.includes('show vlan brief'))).toBe(true)
  })

  it('attaches sample output for show commands when available', () => {
    const index = buildCommandIndex()
    const route = index.commands.find(c => norm(c.command) === 'show ip route')
    expect(route).toBeTruthy()
    expect(route.sampleOutput).toMatch(/OSPF|EIGRP|Gateway of last resort/i)
  })

  it('filters verify-only commands', () => {
    const index = buildCommandIndex()
    const verify = filterCommands(index, { categoryFilter: 'verify' })
    expect(verify.length).toBeGreaterThan(15)
    expect(verify.every(c => c.category === 'verify')).toBe(true)
  })

  it('registry supplements commands not in curated packs', () => {
    const index = buildCommandIndex()
    const ntp = index.commands.find(c => c.command === 'show ntp status')
    expect(ntp).toBeTruthy()
    expect(ntp.source).toBe('registry')
    expect(getCommandById(ntp.id, index)).toBe(ntp)
  })

  it('links workflows to command index', () => {
    const index = buildCommandIndex()
    const ospfWf = index.workflows.find(w => w.id === 'wf-ospf-single-area')
    expect(ospfWf).toBeTruthy()
    expect(ospfWf.steps.length).toBeGreaterThanOrEqual(5)
  })
})

function norm(s) {
  return String(s || '').toLowerCase().trim()
}
