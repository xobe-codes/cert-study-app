import { describe, it, expect } from 'vitest'
import {
  retrieveTutorContext,
  isVectorRagEligible,
  VECTOR_RAG_STATIC_DEPTH_GATE,
  CURRENT_STATIC_DEPTH_SCORE,
} from '../features/tutor/tutorRagPipeline.js'

describe('tutorRagPipeline', () => {
  it('uses static curated RAG while vector gate is closed', async () => {
    expect(isVectorRagEligible()).toBe(false)
    const rag = await retrieveTutorContext('OSPF neighbor states')
    expect(rag.selected.length).toBeGreaterThan(0)
    expect(rag.contextBlock).toMatch(/ospf/i)
  })

  it('depth gate documents Vectorize threshold', () => {
    expect(CURRENT_STATIC_DEPTH_SCORE).toBeLessThan(VECTOR_RAG_STATIC_DEPTH_GATE)
  })

  it('returns empty context for blank query', async () => {
    const rag = await retrieveTutorContext('   ')
    expect(rag.selected).toEqual([])
    expect(rag.contextBlock).toBeNull()
  })
})
