import { describe, it, expect } from 'vitest'
import { getStemReplayLab, hasStemReplayLab, stemReplayMapSize } from '../features/stemReplay/stemReplayLabs.js'
import { getLab } from '../data/ccnaLabs.js'

describe('stemReplayLabs', () => {
  it('maps at least 119 high-traffic questions to real labs', () => {
    expect(stemReplayMapSize()).toBeGreaterThanOrEqual(119)
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
    expect(replay.labId).toBe('LAB-ACL-CONFIG-55')
    expect(replay.lab.title).toMatch(/ACL/i)
    expect(getLab(replay.labId)?.lab.id).toBe('LAB-ACL-CONFIG-55')
  })

  it('maps new config labs for OSPF adjacency, ACL, and port security', () => {
    expect(getStemReplayLab('obj-3.4-source-q008')?.labId).toBe('LAB-OSPF-ADJ-34')
    expect(getStemReplayLab('obj-5.5-source-q002')?.labId).toBe('LAB-ACL-CONFIG-55')
    expect(getStemReplayLab('obj-5.6-source-q010')?.labId).toBe('LAB-PORTSEC-56')
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

  it('maps domain 3 objectives 3.1–3.6 to connectivity labs', () => {
    const domain3Cases = [
      ['3.1-q2', 'LAB-ROUTE-TABLE-31'],
      ['3.2-c-q3', 'LAB-ROUTE-FORWARD-32'],
      ['3.3-q2', 'LAB-IPV6-STATIC'],
      ['3.4-c-q2', 'LAB-OSPF-ADJ-34'],
      ['obj-3.5-source-q002', 'LAB-HSRP-GATEWAY'],
      ['3.6-legacy-q008', 'LAB-ROUTE-FORWARD-32'],
    ]
    for (const [qid, labId] of domain3Cases) {
      const replay = getStemReplayLab(qid)
      expect(replay?.labId, qid).toBe(labId)
      expect(getLab(labId)?.lab.id).toBe(labId)
    }
  })

  it('maps domain 2 objectives to access labs', () => {
    const domain2Cases = [
      ['2.2-c-q5', 'LAB-D22-22'],
      ['2.5-c-q2', 'LAB-STP-ROOT'],
      ['2.5-c-q5', 'LAB-STP-PORTFAST'],
      ['obj-2.4-source-q004', 'LAB-ETHERCHANNEL'],
      ['obj-2.3-source-q009', 'LAB-LLDP'],
      ['obj-2.9-source-q011', 'LAB-WPA2-PSK-59'],
    ]
    for (const [qid, labId] of domain2Cases) {
      const replay = getStemReplayLab(qid)
      expect(replay?.labId, qid).toBe(labId)
      expect(getLab(labId)?.lab.id).toBe(labId)
    }
  })
})
