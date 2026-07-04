import { describe, it, expect } from 'vitest'
import { labsForObjective, getLab } from '../data/ccnaLabs.js'

const TS_LAB_IDS = [
  'LAB-TS-OSPF-AREA',
  'LAB-TS-NATIVE-VLAN',
  'LAB-TS-SHUTDOWN-IF',
  'LAB-TS-ACL-PLACEMENT',
  'LAB-TS-MISSING-ROUTE',
  'LAB-TS-DHCP-RELAY',
  'LAB-TS-HSRP-PRIORITY',
  'LAB-TS-WRONG-MASK',
  'LAB-TS-STATIC-NH',
  'LAB-TS-WLAN-VLAN',
]

describe('ts_labs_wave', () => {
  it('objective 3.6 has troubleshoot interpret-only labs', () => {
    const ids = labsForObjective('3.6').map(l => l.id)
    for (const labId of TS_LAB_IDS) {
      expect(ids).toContain(labId)
    }
  })

  for (const labId of TS_LAB_IDS) {
    it(`${labId} is interpret-only diagnose lab-lite`, () => {
      const lab = getLab(labId)?.lab
      expect(lab?.interpretOnly).toBe(true)
      expect(lab?.cliShowOutput).toBeTruthy()
      const configTasks = (lab?.tasks || []).flatMap(t => t.expectedCommands || [])
        .filter(c => !c.startsWith('show ') && c !== 'enable')
      expect(configTasks).toHaveLength(0)
    })
  }
})
