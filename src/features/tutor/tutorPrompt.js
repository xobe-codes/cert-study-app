import { buildLearnerSummary } from '../../home/learnerHome.js'
import { ALL_OBJECTIVES } from '../../data/ccnaDomains.js'
import { formatTutorRagPromptSection } from './tutorRag.js'

export function summarizeForTutor(summary) {
  const { perObjective, domainStats, missedByObj, recentTopics } = summary
  const weak = [...perObjective]
    .filter(o => o.status !== 'mastered' && o.attempts > 0)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 5)
    .map(o => `${o.id} ${o.title} (${Math.round(o.mastery * 100)}%${o.hardCount >= 2 ? ', low confidence' : ''})`)
  const masteredCount = perObjective.filter(o => o.status === 'mastered').length
  const domains = domainStats
    .map(d => `${d.name}: ${Math.round(d.avg * 100)}% avg, ${d.mastered}/${d.total} mastered`)
    .join('; ')
  const missedConcepts = Object.entries(missedByObj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id, n]) => {
      const o = ALL_OBJECTIVES.find(x => x.id === id)
      return `${id} ${o ? o.title : ''} (missed ${n})`
    })
  const recent = recentTopics
    .map(id => { const o = ALL_OBJECTIVES.find(x => x.id === id); return o ? `${id} ${o.title}` : id })

  return [
    `Objectives mastered so far: ${masteredCount} of ${ALL_OBJECTIVES.length}.`,
    `Per-domain mastery — ${domains}.`,
    `Weakest active objectives: ${weak.length ? weak.join('; ') : 'none yet'}.`,
    `Most frequently missed: ${missedConcepts.length ? missedConcepts.join('; ') : 'none recorded'}.`,
    `Recently studied: ${recent.length ? recent.join('; ') : 'nothing yet this session'}.`,
  ].join('\n')
}

export async function buildTutorSystemPrompt(progress, missed, ragContextBlock = null) {
  const summary = await buildLearnerSummary(progress, missed || [])
  const behaviour = summarizeForTutor(summary)
  const ragSection = ragContextBlock ? formatTutorRagPromptSection(ragContextBlock) : ''

  return `You are a friendly, encouraging CCNA 200-301 tutor and study partner. The student originally failed the exam, weakest in Network Access and IP Connectivity, so keep those a priority when relevant.

Here is the student's CURRENT activity, computed from their actual study data:
${behaviour}

Use this to give specific, contextual advice — reference their weak objectives, recurring misses, and what they studied recently by name. When they ask "what should I study?", recommend from the weakest objectives and explain why. Keep answers conversational, encouraging, and focused on CCNA exam content. Ground technical explanations in standard CCNA 200-301 material. Keep responses reasonably concise (a few short paragraphs or a short list) unless the student asks for depth.
${ragSection}

When you discuss a specific exam concept, end that part of your answer with the matching CCNA 200-301 exam topic number(s) in parentheses, e.g. "(exam topic 1.1)", so the student can open that objective's Explain tab and verify against the cited cert guide — don't invent numbers, only cite ones you're confident map to the official blueprint.`
}
