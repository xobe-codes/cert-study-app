import { describe, it, expect } from 'vitest'
import {
  buildWeakBatch,
  formatBatchLabel,
  resolveNextBeat,
  suggestFollowingBeat,
  buildProgressGlance,
  WEAK_BATCH_SIZE,
} from '../weakBatch.js'

const domain = {
  id: 'access',
  objectives: [
    { id: '2.1', title: 'VLANs' },
    { id: '2.2', title: 'Trunks' },
    { id: '2.3', title: 'CDP' },
    { id: '2.4', title: 'EtherChannel' },
    { id: '2.5', title: 'STP' },
  ],
}

describe('WB-3 weakBatch', () => {
  it('chunks into batches of 3 and ranks misses/traps/baseline first', () => {
    const batch = buildWeakBatch({
      domain,
      baselineSummary: { weakObjectives: ['2.5', '2.2'] },
      missed: [
        { objectiveId: '2.1' },
        { objectiveId: '2.1' },
        { objectiveId: '2.4' },
      ],
      progress: {
        '2.3': { status: 'mastered', masteryScore: 95 },
      },
      rankedTraps: [
        { id: 't1', objectiveId: '2.5', owned: false },
        { id: 't2', objectiveId: '2.2', owned: true },
      ],
    })
    expect(batch.objectiveIds).toHaveLength(WEAK_BATCH_SIZE)
    expect(batch.objectiveIds).toContain('2.1')
    expect(batch.objectiveIds).not.toContain('2.3')
    expect(batch.batchCount).toBeGreaterThanOrEqual(1)
    expect(batch.label).toMatch(/Batch/)
  })

  it('formats batch label', () => {
    expect(formatBatchLabel(0, 2, ['2.1', '2.2'])).toBe('Batch 1 of 2 · 2.1, 2.2')
  })
})

describe('WB-0 nextBeat', () => {
  it('prioritizes baseline and miss fix', () => {
    expect(resolveNextBeat({ hasBaseline: false }).beat).toBe('baseline')
    expect(resolveNextBeat({
      hasBaseline: true,
      missCount: 5,
      batch: { objectiveIds: ['2.1'] },
    }).beat).toBe('fix_misses')
  })

  it('starts batch at review then follows prove → traps → flood', () => {
    const batch = { objectiveIds: ['2.1', '2.2'], openTrapCount: 2, batchIndex: 0, batchCount: 1 }
    expect(resolveNextBeat({ batch, hasBaseline: true }).beat).toBe('review')
    expect(suggestFollowingBeat('review', batch).beat).toBe('prove')
    expect(suggestFollowingBeat('prove', batch).beat).toBe('traps')
    expect(suggestFollowingBeat('traps', batch).beat).toBe('flood')
  })

  it('skips traps beat when none open', () => {
    const batch = { objectiveIds: ['2.1'], openTrapCount: 0, batchIndex: 0, batchCount: 1 }
    expect(suggestFollowingBeat('prove', batch).beat).toBe('flood')
  })
})

describe('progress glance', () => {
  it('builds Now · Pulse · Aim', () => {
    const g = buildProgressGlance({
      batch: { label: 'Batch · 2.1, 2.2', objectiveIds: ['2.1', '2.2'] },
      nextBeat: { label: 'Study · 2.1' },
      stickyMissCount: 2,
      openTrapCount: 1,
      domainPassPassed: 2,
      weakestDomainName: 'Network Access',
    })
    expect(g.now).toMatch(/Study/)
    expect(g.pulse).toMatch(/sticky/)
    expect(g.aim).toMatch(/Pass 2\/6/)
  })
})
