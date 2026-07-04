import { describe, it, expect } from 'vitest'
import { getLab } from '../data/ccnaLabs.js'
import { CONFIG_LAB_LITE_IDS } from '../data/configLabLiteWave.js'
import { CONFIG_LAB_IDS } from '../data/labTierStrategy.js'

describe('configLabLiteWave', () => {
  it('converts 15 high-traffic config labs to interpret-only', () => {
    expect(CONFIG_LAB_LITE_IDS.size).toBe(15)
    for (const id of CONFIG_LAB_LITE_IDS) {
      const lab = getLab(id)?.lab
      expect(lab?.interpretOnly, id).toBe(true)
      expect(lab?.tasks?.every(t => (t.expectedCommands || []).every(c => /^show /i.test(c))), id).toBe(true)
    }
  })

  it('leaves 10 advanced config labs tiered', () => {
    expect(CONFIG_LAB_IDS.size).toBe(10)
    for (const id of CONFIG_LAB_LITE_IDS) {
      expect(CONFIG_LAB_IDS.has(id)).toBe(false)
    }
  })
})
