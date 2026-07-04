import { describe, it, expect } from 'vitest'
import { labsForObjective, getLab } from '../data/ccnaLabs.js'

const LAB_LITE_IDS = [
  ['2.1', 'LAB-VLAN-TRUNK'],
  ['2.5', 'LAB-STP-ROOT'],
  ['3.1', 'LAB-ROUTE-TABLE-31'],
  ['4.2', 'LAB-NTP-CLIENT'],
  ['4.3', 'LAB-DHCP-POOL-43'],
  ['4.4', 'LAB-SNMP-CONFIG-44'],
  ['4.5', 'LAB-SYSLOG-REMOTE'],
  ['4.9', 'LAB-TFTP-CONFIG-49'],
  ['5.3', 'LAB-DEVICE-ACCESS'],
  ['5.3', 'LAB-SSH-VTY'],
]

describe('services_labs_wave', () => {
  for (const [objId, labId] of LAB_LITE_IDS) {
    it(`${labId} is interpret-only lab-lite for ${objId}`, () => {
      const ids = labsForObjective(objId).map(l => l.id)
      expect(ids).toContain(labId)
      const lab = getLab(labId)?.lab
      expect(lab?.objectiveId).toBe(objId)
      expect(lab?.interpretOnly).toBe(true)
      expect(lab?.cliShowOutput).toBeTruthy()
    })
  }
})
