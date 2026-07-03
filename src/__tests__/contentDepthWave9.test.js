import { describe, it, expect } from 'vitest'
import { CONTENT_DEPTH_WAVE9_PATCHES } from '../data/contentDepthWave9Patches.js'
import { applyContentEnrichment } from '../data/contentEnrichmentPatches.js'
import { BATCH27_GOLD } from '../answerReview/goldAnswerReviewsBatch27.js'

describe('contentDepthWave9', () => {
  it('adds second supplemental MC for 30 single-question objectives', () => {
    expect(Object.keys(CONTENT_DEPTH_WAVE9_PATCHES).length).toBe(30)
    for (const patch of Object.values(CONTENT_DEPTH_WAVE9_PATCHES)) {
      expect(patch.questions?.length).toBe(1)
    }
  })

  it('merges wave 9 questions into enrichment', () => {
    const enriched = applyContentEnrichment({ questions: [] }, '3.2')
    expect(enriched.questions?.some(q => q.id === '3.2-w9-q1')).toBe(true)
  })
})

describe('goldAnswerReviewsBatch27', () => {
  it('has 50 hand-authored entries', () => {
    expect(Object.keys(BATCH27_GOLD).length).toBe(50)
  })
})
