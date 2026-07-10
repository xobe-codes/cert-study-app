/**
 * Content Health Process — manual push: flush flags, summarize, quarantine candidates, optional AI drafts.
 * Never auto-publishes to the clean bank.
 */
import { STORAGE_KEYS } from '../storageKeys.js'
import { LEARNER_QUARANTINE_THRESHOLD, FLAG_REASONS } from '../data/questionHealthConstants.js'
import { flushQuestionFlagQueue } from './questionHealthClient.js'
import { listNeedsFixEntries, setLocalQuarantineIds } from '../data/questionHealth.js'
import { PREMIUM_FEATURES, logPremiumBlocked } from '../premium/premiumFeatures.js'

const API = '/api/question-health'

async function loadLocalFlags() {
  return (await window.storage.getItem(STORAGE_KEYS.questionHealthFlags)) || []
}

export async function loadContentHealthAiEnabled() {
  try {
    return !!(await window.storage.getItem(STORAGE_KEYS.contentHealthAiEnabled))
  } catch {
    return false
  }
}

export async function saveContentHealthAiEnabled(on) {
  await window.storage.setItem(STORAGE_KEYS.contentHealthAiEnabled, on || null)
  return !!on
}

export async function loadContentHealthLastProcess() {
  return (await window.storage.getItem(STORAGE_KEYS.contentHealthLastProcess)) || null
}

export async function loadLocalQuarantineIds() {
  const raw = (await window.storage.getItem(STORAGE_KEYS.contentHealthLocalQuarantine)) || []
  return Array.isArray(raw) ? raw : []
}

export async function saveLocalQuarantineIds(ids) {
  const unique = [...new Set((ids || []).filter(Boolean))]
  await window.storage.setItem(STORAGE_KEYS.contentHealthLocalQuarantine, unique)
  setLocalQuarantineIds(unique)
  return unique
}

/** Hydrate soft-quarantine Set from storage (call on bootstrap). */
export async function hydrateLocalQuarantine() {
  const ids = await loadLocalQuarantineIds()
  setLocalQuarantineIds(ids)
  return ids
}

/** Home / Settings strip counts. */
export async function getContentHealthStatus() {
  const localFlags = await loadLocalFlags()
  const last = await loadContentHealthLastProcess()
  const localQuarantine = await loadLocalQuarantineIds()
  const registryNeedsFix = listNeedsFixEntries().length

  let remotePending = 0
  let remoteCounts = {}
  try {
    const res = await fetch(`${API}?summary=1`)
    if (res.ok) {
      const data = await res.json()
      remoteCounts = data.counts || {}
      remotePending = Object.keys(remoteCounts).length
    }
  } catch {
    // offline — local only
  }

  const quarantineReady = Object.entries(remoteCounts)
    .filter(([, n]) => n >= LEARNER_QUARANTINE_THRESHOLD)
    .map(([id, n]) => ({ questionId: id, flagCount: n }))

  // Also count local duplicates toward "ready"
  const localByQ = {}
  for (const f of localFlags) {
    if (!f?.questionId) continue
    localByQ[f.questionId] = (localByQ[f.questionId] || 0) + 1
  }
  for (const [id, n] of Object.entries(localByQ)) {
    if (n >= LEARNER_QUARANTINE_THRESHOLD && !quarantineReady.some(x => x.questionId === id)) {
      quarantineReady.push({ questionId: id, flagCount: n, source: 'local' })
    }
  }

  return {
    localPending: localFlags.length,
    remoteFlaggedQuestions: remotePending,
    readyToProcess: quarantineReady.length,
    quarantineReady,
    localQuarantineCount: localQuarantine.length,
    registryNeedsFix,
    lastProcess: last,
  }
}

function reasonLabel(id) {
  return FLAG_REASONS.find(r => r.id === id)?.label || id
}

function buildTemplateDraft(questionId, reasons, flagCount) {
  const reasonText = reasons.map(reasonLabel).join('; ')
  return {
    questionId,
    flagCount,
    reasons,
    status: 'draft',
    summary: `Learner flags (${flagCount}): ${reasonText}. Review stem/key/distractors before un-quarantine.`,
    suggestedActions: reasons.includes('wrong_key')
      ? ['Verify correctIndex against explanation', 'Re-check distractors']
      : reasons.includes('bad_display')
        ? ['Fix formatting / exhibit layout', 'Re-test on mobile']
        : ['Skim stem for ambiguity', 'Strengthen answerReview traps'],
    source: 'template',
  }
}

async function maybeAiDrafts(candidates, { premiumUnlocked, aiEnabled }) {
  if (!aiEnabled) return []
  if (!premiumUnlocked) {
    await logPremiumBlocked(PREMIUM_FEATURES.content_health_ai, 'content_health_process')
    return []
  }
  // Manual push only — attempt live AI; fall back to templates on failure (curated bank untouched).
  try {
    const { askClaudeJSON } = await import('../ai/claudeClient.js')
    const payload = candidates.slice(0, 8).map(c => ({
      questionId: c.questionId,
      flagCount: c.flagCount,
      reasons: c.reasons,
    }))
    const result = await askClaudeJSON({
      feature: PREMIUM_FEATURES.content_health_ai,
      max_tokens: 1200,
      system: 'You help maintain a CCNA study question bank. Propose brief fix drafts only — never claim the live bank was updated.',
      messages: [{
        role: 'user',
        content: `For each flagged question, propose a short fix draft (1-2 sentences + 2 action bullets). Return JSON { drafts: [{ questionId, summary, suggestedActions: string[] }] }.\n${JSON.stringify(payload)}`,
      }],
      schema: {
        type: 'object',
        properties: {
          drafts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                questionId: { type: 'string' },
                summary: { type: 'string' },
                suggestedActions: { type: 'array', items: { type: 'string' } },
              },
              required: ['questionId', 'summary', 'suggestedActions'],
            },
          },
        },
        required: ['drafts'],
      },
      toolName: 'content_health_drafts',
    })
    const drafts = (result?.drafts || []).map(d => ({
      ...d,
      status: 'draft',
      source: 'ai',
    }))
    return drafts.length ? drafts : candidates.map(c => buildTemplateDraft(c.questionId, c.reasons, c.flagCount))
  } catch {
    return candidates.map(c => buildTemplateDraft(c.questionId, c.reasons, c.flagCount))
  }
}

/**
 * Manual Content Health process push.
 * @returns {{ ok, flushed, flaggedQuestions, quarantined, drafts, message }}
 */
export async function processFlaggedQuestions({
  premiumUnlocked = false,
  aiEnabled = false,
} = {}) {
  // Capture local queue before flush so we still know reasons/counts after sync.
  const localFlagsBefore = await loadLocalFlags()
  const flushed = await flushQuestionFlagQueue()
  const status = await getContentHealthStatus()

  const reasonMap = {}
  for (const f of localFlagsBefore) {
    if (!f?.questionId) continue
    const entry = reasonMap[f.questionId] || { questionId: f.questionId, flagCount: 0, reasons: new Set(), objectiveId: f.objectiveId }
    entry.flagCount += 1
    if (f.reason) entry.reasons.add(f.reason)
    reasonMap[f.questionId] = entry
  }
  for (const c of status.quarantineReady) {
    const entry = reasonMap[c.questionId] || { questionId: c.questionId, flagCount: c.flagCount, reasons: new Set(), objectiveId: null }
    entry.flagCount = Math.max(entry.flagCount, c.flagCount)
    reasonMap[c.questionId] = entry
  }

  const candidates = Object.values(reasonMap)
    .map(e => ({
      questionId: e.questionId,
      flagCount: e.flagCount,
      reasons: [...(e.reasons || [])],
      objectiveId: e.objectiveId,
    }))
    .filter(c => c.flagCount >= LEARNER_QUARANTINE_THRESHOLD || status.quarantineReady.some(q => q.questionId === c.questionId))

  const quarantineIds = candidates.map(c => c.questionId)
  const prev = await loadLocalQuarantineIds()
  const mergedQuarantine = await saveLocalQuarantineIds([...prev, ...quarantineIds])

  const drafts = candidates.length
    ? await maybeAiDrafts(candidates, { premiumUnlocked, aiEnabled })
    : []
  if (!drafts.length && candidates.length) {
    for (const c of candidates) drafts.push(buildTemplateDraft(c.questionId, c.reasons, c.flagCount))
  }

  const report = {
    at: Date.now(),
    flushed,
    flaggedQuestions: Object.keys(reasonMap).length,
    quarantined: quarantineIds.length,
    quarantineIds,
    localQuarantineTotal: mergedQuarantine.length,
    drafts,
    aiUsed: aiEnabled && premiumUnlocked && drafts.some(d => d.source === 'ai'),
    message: quarantineIds.length
      ? `Processed ${Object.keys(reasonMap).length} flagged question(s); ${quarantineIds.length} soft-quarantined locally (≥${LEARNER_QUARANTINE_THRESHOLD} flags). Drafts staged — clean bank unchanged.`
      : flushed
        ? `Flushed ${flushed} flag(s). No items reached the quarantine threshold yet.`
        : 'No pending flags to process.',
  }

  await window.storage.setItem(STORAGE_KEYS.contentHealthLastProcess, report)
  return { ok: true, ...report }
}
