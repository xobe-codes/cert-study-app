import { describe, it, expect } from 'vitest'
import { getStemReplayLab, hasStemReplayLab, stemReplayMapSize } from '../features/stemReplay/stemReplayLabs.js'
import { getLab } from '../data/ccnaLabs.js'

describe('stemReplayLabs', () => {
  it('maps at least 30 high-traffic questions to real labs', () => {
    expect(stemReplayMapSize()).toBeGreaterThanOrEqual(30)
  })

  it('every new wave-2 mapping resolves via getLab', () => {
    const sampleIds = [
      '1.1-c-q1', '1.6-c-q1', 'obj-2.4-source-q001', '3.1-q1',
      'obj-3.5-source-q001', 'obj-4.3-source-q001', 'obj-4.6-source-q001',
    ]
    for (const qid of sampleIds) {
      const replay = getStemReplayLab(qid)
      expect(replay, qid).not.toBeNull()
      expect(getLab(replay.labId)?.lab.id).toBe(replay.labId)
    }
  })

  it('maps high-traffic ACL question to ACL lab', () => {
    const replay = getStemReplayLab('5.5-c-q1')
    expect(replay).not.toBeNull()
    expect(replay.labId).toBe('LAB-ACL-CONFIG')
    expect(replay.lab.title).toMatch(/ACL/i)
    expect(getLab(replay.labId)?.lab.id).toBe('LAB-ACL-CONFIG')
  })

  it('maps NAT/PAT, trunk, routing, and STP questions to real labs', () => {
    const cases = [
      ['4.1-c-q2', 'LAB-NAT-PAT'],
      ['2.2-c-q1', 'LAB-VLAN-TRUNK'],
      ['3.2-c-q1', 'LAB-31-ROUTE-INTERPRET'],
      ['2.5-c-q1', 'LAB-STP-ROOT'],
      ['2.1-c-q1', 'LAB-INTERVLAN-SVI'],
      ['3.4-c-q1', 'LAB-OSPF-DEFAULT'],
      ['1.5-c-q3', 'LAB-MAC-FORWARD-15'],
    ]
    for (const [qid, labId] of cases) {
      const replay = getStemReplayLab(qid)
      expect(replay?.labId, qid).toBe(labId)
      expect(getLab(labId)?.lab.id).toBe(labId)
    }
  })

  it('returns null for unmapped question ids', () => {
    expect(getStemReplayLab('not-a-real-id')).toBeNull()
    expect(hasStemReplayLab('not-a-real-id')).toBe(false)
  })

  it('hasStemReplayLab is true for mapped ids', () => {
    expect(hasStemReplayLab('5.5-c-q1')).toBe(true)
  })
})
