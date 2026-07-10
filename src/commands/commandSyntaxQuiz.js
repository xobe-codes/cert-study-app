import { cliStringsEquivalent } from '../lab/cliGrading.js'
import { allSkillQuestionsLazy as allSkillQuestions } from '../data/skillQuestionsRegistry.js'
import { isIosOrderingQuestion } from './questionPlacement.js'
import { MODE_LABEL } from './commandWorkflows.js'

const MODE_OPTIONS = Object.keys(MODE_LABEL)

function mulberry32(seed) {
  let t = seed >>> 0
  return () => {
    t += 0x6D2B79F5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle(arr, rng = Math.random) {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function normalizeMode(mode) {
  const m = String(mode || '').trim()
  if (MODE_LABEL[m]) return m
  const hit = Object.keys(MODE_LABEL).find(k => MODE_LABEL[k] === m)
  return hit || m
}

function modeDistractors(correct) {
  const canon = normalizeMode(correct)
  const pool = MODE_OPTIONS.filter(m => m !== canon)
  return shuffle(pool).slice(0, 3)
}

function inferOrderCategory(q) {
  const text = `${q.question} ${(q.orderItems || []).join(' ')}`.toLowerCase()
  if (/vlan|trunk|switchport|spanning|etherchannel/.test(text)) return 'switching'
  if (/ospf|route|hsrp|standby|eigrp/.test(text)) return 'routing'
  if (/nat|dhcp|helper/.test(text)) return 'services'
  if (/acl|ssh|username|enable|aaa/.test(text)) return 'security'
  return 'navigation'
}

export function buildSyntaxOrderItems() {
  return allSkillQuestions()
    .filter(isIosOrderingQuestion)
    .map(q => ({
      id: `order-${q.id}`,
      type: 'order_steps',
      category: inferOrderCategory(q),
      objectiveId: q.objectiveId,
      prompt: q.question,
      orderItems: [...q.orderItems],
      orderAccept: q.orderAccept,
      hint: q.explanation,
      displayAnswer: q.orderItems.join(' → '),
    }))
}

export function buildModeQuizItems(commands, { limit = 16 } = {}) {
  const pool = commands.filter(c =>
    c.category === 'config'
    && c.mode
    && !c.command.includes('<')
    && c.command.length < 64,
  )
  return shuffle(pool).slice(0, limit).map(cmd => {
    const answer = normalizeMode(cmd.mode)
    const options = shuffle([answer, ...modeDistractors(answer)])
    return {
      id: `mode-${cmd.id}`,
      type: 'pick_mode',
      category: 'modes',
      objectiveId: cmd.objectiveIds?.[0] || null,
      prompt: 'Which IOS mode is required for this command?',
      command: cmd.command,
      options,
      answer,
      hint: cmd.purpose ? String(cmd.purpose).split(/[.!?]/)[0] : undefined,
      displayAnswer: answer,
    }
  })
}

export function buildSyntaxQuizSession(index, {
  count = 10,
  category = 'all',
  seed = Date.now(),
} = {}) {
  const rng = mulberry32(typeof seed === 'number' ? seed : 42)
  const order = buildSyntaxOrderItems()
  const mode = buildModeQuizItems(index.commands, { limit: 30 })
  let pool = shuffle([...order, ...mode], rng)

  if (category && category !== 'all') {
    const filtered = pool.filter(q => q.category === category)
    pool = filtered.length >= Math.min(count, 5) ? filtered : pool
  }

  const picked = []
  const seen = new Set()
  for (const q of pool) {
    if (picked.length >= count) break
    const key = q.type === 'pick_mode' ? q.command : q.id
    if (seen.has(key)) continue
    seen.add(key)
    picked.push(q)
  }

  return picked.slice(0, count)
}

export function gradeSyntaxQuestion(question, rawAnswer) {
  if (!question) return false

  if (question.type === 'pick_mode') {
    const answer = String(rawAnswer || '').trim()
    return normalizeMode(answer) === normalizeMode(question.answer)
  }

  if (question.type === 'order_steps') {
    const given = Array.isArray(rawAnswer) ? rawAnswer : []
    const expected = question.orderItems || []
    if (given.length !== expected.length) return false
    const alts = question.orderAccept || []
    return given.every((item, i) => cliStringsEquivalent(item, expected[i], alts[i]))
  }

  return false
}

export function syntaxSessionSummary(results) {
  const total = results.length
  const correct = results.filter(r => r.correct).length
  return {
    total,
    correct,
    pct: total ? Math.round((correct / total) * 100) : 0,
  }
}

// Re-export for tests that assert drill pool size lives in command drills module.
export { buildDrillQuizItems } from './commandDrillQuiz.js'
