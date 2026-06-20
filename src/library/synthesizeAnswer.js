/** AI synthesis for Study Lens — cite-only answers from retrieved chunks. */

import { askClaudeStream, cachedSystem, MODELS } from '../ai/claudeClient.jsx'
import { chunksForSynthesis } from './libraryIndex.js'

const LIBRARY_QA_SYSTEM = `You are a CCNA 200-301 study librarian. Answer ONLY using the REFERENCE CHUNKS below.

Rules:
- Every factual claim must cite the supporting chunk as [chunk-id] immediately after the claim.
- If the chunks do not contain enough information, say: "I don't have enough in the provided references to answer that fully." Then briefly note what the closest chunks cover.
- Do not use outside knowledge beyond what the chunks state.
- Do not invent exam topic numbers unless they appear in a chunk.
- Keep answers exam-focused: 2–4 short paragraphs or a tight bullet list.
- For comparisons, use a clear side-by-side structure with citations on both sides.`

export async function synthesizeLibraryAnswer({
  query,
  hits,
  intent,
  cluster = null,
  onDelta,
}) {
  const selected = chunksForSynthesis(hits, 8, cluster)
  const chunkBlock = selected.map(h => `[${h.id}] ${h.body}`).join('\n\n')
  const model = (intent === 'compare' || intent === 'troubleshoot')
    ? MODELS.smart
    : MODELS.fast

  return askClaudeStream({
    system: cachedSystem(LIBRARY_QA_SYSTEM),
    messages: [{
      role: 'user',
      content: `INTENT: ${intent}\nQUESTION: ${query}\n\nREFERENCE CHUNKS:\n${chunkBlock}`,
    }],
    max_tokens: intent === 'compare' ? 900 : 650,
    model,
    feature: 'library_qa',
    onDelta,
  })
}

export function synthesisCacheKey(query, hits) {
  const ids = hits.slice(0, 8).map(h => h.id).sort().join(',')
  return `${query.trim().toLowerCase()}::${ids}`
}
