import { retrieveTutorRag } from './tutorRag.js'

/** Enable Cloudflare Vectorize / pgvector only after static content depth reaches this bar. */
export const VECTOR_RAG_STATIC_DEPTH_GATE = 85

/** Living estimate — bump when audit depth score moves (see SCORE_95_TARGET.md). */
export const CURRENT_STATIC_DEPTH_SCORE = 82

/** Flip when Worker + Vectorize index is wired; still gated by depth score. */
export const VECTOR_RAG_FEATURE_FLAG = false

export function isVectorRagEligible() {
  return VECTOR_RAG_FEATURE_FLAG && CURRENT_STATIC_DEPTH_SCORE >= VECTOR_RAG_STATIC_DEPTH_GATE
}

/**
 * Future Vectorize retrieval — returns null until Worker endpoint ships.
 */
export async function fetchVectorRagChunks(_query) {
  if (!isVectorRagEligible()) return null
  // POST /api/tutor-rag — Cloudflare Vectorize hybrid with curated library fallback
  return null
}

/**
 * Hybrid tutor retrieval: vector when eligible + available, else curated static RAG.
 */
export async function retrieveTutorContext(query) {
  const trimmed = (query || '').trim()
  if (!trimmed) return retrieveTutorRag(query)

  if (isVectorRagEligible()) {
    const vector = await fetchVectorRagChunks(trimmed)
    if (vector?.selected?.length) return vector
  }

  return retrieveTutorRag(query)
}

export { formatTutorRagPromptSection } from './tutorRag.js'
