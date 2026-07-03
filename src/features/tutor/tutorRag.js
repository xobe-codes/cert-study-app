import { searchLibrary, chunksForSynthesis } from '../../library/libraryIndex.js'

export const TUTOR_RAG_CHUNK_LIMIT = 6

/**
 * Client-side curated RAG — retrieve library chunks for a tutor turn (no vector DB).
 */
export function retrieveTutorRag(query) {
  const trimmed = (query || '').trim()
  if (!trimmed) {
    return { hits: [], selected: [], intent: null, cluster: null, contextBlock: null }
  }

  const { hits, intent, cluster } = searchLibrary(trimmed, { limit: 12 })
  const selected = chunksForSynthesis(hits, TUTOR_RAG_CHUNK_LIMIT, cluster)
  const contextBlock = selected.length
    ? selected.map(h => `[${h.id}] ${h.title}: ${h.body}`).join('\n\n')
    : null

  return { hits, selected, intent, cluster, contextBlock }
}

export function formatTutorRagPromptSection(contextBlock) {
  if (!contextBlock) return ''
  return `

CURATED LIBRARY REFERENCES — ground technical claims here first; prefer these over general knowledge:
${contextBlock}

When you rely on a reference, name the objective ID (e.g. "3.4") so the student can open that lesson. Do not invent facts beyond these references and standard CCNA 200-301 material.`
}
