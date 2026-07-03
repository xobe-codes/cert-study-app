import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import { WLAN_ENRICHMENT_WAVE5_PATCHES } from '../data/wlanEnrichmentWave5.js'
import { applyContentEnrichment, getEnrichmentPatchQuestions } from '../data/contentEnrichmentPatches.js'
import { buildMockInterviewCards } from '../features/mockExam/mockInterviewCards.js'
import { buildMockInterviewSystemPrompt } from '../features/mockExam/mockInterviewPrompt.js'
import MockInterview from '../features/mockExam/MockInterview.jsx'

describe('wlanEnrichmentWave5', () => {
  for (const objectiveId of ['5.8', '5.9']) {
    it(`objective ${objectiveId} has +2 traps, +2 flashcards, +1 MC`, () => {
      const patch = WLAN_ENRICHMENT_WAVE5_PATCHES[objectiveId]
      expect(patch.examTraps).toHaveLength(2)
      expect(patch.flashcards).toHaveLength(2)
      expect(patch.questions).toHaveLength(1)
      expect(patch.questions[0].choices).toHaveLength(4)
    })
  }

  it('merges via applyContentEnrichment', () => {
    const enriched = applyContentEnrichment({ examTraps: [], flashcards: [], questions: [] }, '5.8')
    expect(enriched.examTraps.some(t => t.id === '5.8-w5-t1')).toBe(true)
    expect(enriched.flashcards.some(f => f.id === '5.8-w5-f1')).toBe(true)
    expect(enriched.questions.some(q => q.id === '5.8-w5-q1')).toBe(true)
  })

  it('merges questions via getEnrichmentPatchQuestions', () => {
    const qs = getEnrichmentPatchQuestions('5.9')
    expect(qs.some(q => q.id === '5.9-w5-q1')).toBe(true)
  })
})

describe('mockInterview', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      storage: {
        getItem: vi.fn().mockResolvedValue(null),
        setItem: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('buildMockInterviewCards returns curated prompts with fallbacks', async () => {
    const cards = await buildMockInterviewCards({}, [])
    expect(cards.length).toBeGreaterThanOrEqual(2)
    expect(cards[0].prompt).toBeTruthy()
    expect(cards[0].coachingPoints?.length).toBeGreaterThan(0)
    expect(cards[0].objectiveId).toBeTruthy()
  })

  it('buildMockInterviewSystemPrompt includes exam-day examiner tone', async () => {
    const prompt = await buildMockInterviewSystemPrompt({}, [])
    expect(prompt).toMatch(/exam day interview/i)
    expect(prompt).toMatch(/CCNA 200-301/)
  })

  it('MockInterview renders free-tier curated shell', async () => {
    const html = renderToStaticMarkup(
      React.createElement(MockInterview, {
        progress: {},
        missed: [],
        premiumUnlocked: false,
        onBack: () => {},
        onPremiumBlocked: () => {},
      }),
    )
    expect(html).toContain('Exam day interview')
    expect(html).toContain('Curated prompts')
  })
})
