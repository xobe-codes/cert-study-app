import { describe, it, expect } from 'vitest'
import {
  retrieveTutorRag,
  formatTutorRagPromptSection,
  TUTOR_RAG_CHUNK_LIMIT,
} from '../features/tutor/tutorRag.js'

describe('tutorRag', () => {
  it('returns empty context for blank query', () => {
    const rag = retrieveTutorRag('   ')
    expect(rag.selected).toEqual([])
    expect(rag.contextBlock).toBeNull()
  })

  it('retrieves OSPF library chunks for tutor grounding', () => {
    const rag = retrieveTutorRag('OSPF neighbor states')
    expect(rag.selected.length).toBeGreaterThan(0)
    expect(rag.selected.length).toBeLessThanOrEqual(TUTOR_RAG_CHUNK_LIMIT)
    expect(rag.contextBlock).toMatch(/ospf/i)
    expect(rag.contextBlock).toMatch(/\[[\w:-]+\]/)
  })

  it('formats prompt section only when context exists', () => {
    expect(formatTutorRagPromptSection(null)).toBe('')
    expect(formatTutorRagPromptSection('[term:ospf] OSPF: link-state protocol')).toMatch(/CURATED LIBRARY/)
  })
})
