import { COMMAND_DRILLS } from '../lab/commandDrills.js'
import { gradeCliAnswerList } from '../lab/cliGrading.js'

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

function firstSentence(text) {
  const s = String(text || '').trim()
  const m = s.match(/^[^.!?]+[.!?]?/)
  return (m ? m[0] : s).slice(0, 140)
}

function inferDrillCategory(prompt, answer) {
  const p = `${prompt} ${answer}`.toLowerCase()
  if (/vlan|trunk|switchport|spanning|etherchannel|port-security/.test(p)) return 'switching'
  if (/ospf|route|hsrp|standby|eigrp/.test(p)) return 'routing'
  if (/nat|dhcp|helper/.test(p)) return 'services'
  if (/acl|ssh|username|enable secret|access-list|login/.test(p)) return 'security'
  if (/^show |^sh /.test(answer)) return 'verify'
  return 'config'
}

export function buildDrillQuizItems() {
  const items = []
  for (const [objectiveId, drills] of Object.entries(COMMAND_DRILLS)) {
    drills.forEach((d, i) => {
      const answers = Array.isArray(d.answer) ? d.answer : [d.answer]
      items.push({
        id: `drill-${objectiveId}-${i}`,
        type: 'type_command',
        category: inferDrillCategory(d.prompt, answers[0]),
        objectiveId,
        prompt: d.prompt,
        answers,
        hint: d.hint,
        displayAnswer: answers[0],
      })
    })
  }
  return items
}

export function buildVerifyQuizItems(commands, { limit = 24 } = {}) {
  const verify = commands.filter(c => c.category === 'verify' && c.purpose && c.command.length < 80)
  return shuffle(verify).slice(0, limit).map(cmd => ({
    id: `verify-${cmd.id}`,
    type: 'type_command',
    category: 'verify',
    objectiveId: cmd.objectiveIds?.[0] || null,
    prompt: `Type the verify command: ${firstSentence(cmd.purpose)}`,
    answers: [cmd.command, ...(cmd.aliases || [])].filter(Boolean),
    hint: cmd.syntaxNotes || `Mode: ${cmd.mode}`,
    displayAnswer: cmd.command,
  }))
}

export function buildCommandDrillSession(index, {
  count = 10,
  category = 'all',
  seed = Date.now(),
} = {}) {
  const rng = mulberry32(typeof seed === 'number' ? seed : 42)
  const drill = buildDrillQuizItems()
  const verify = buildVerifyQuizItems(index.commands, { limit: 40 })
  let pool = shuffle([...drill, ...verify], rng)

  if (category && category !== 'all') {
    const filtered = pool.filter(q => q.category === category)
    pool = filtered.length >= Math.min(count, 5) ? filtered : pool
  }

  const picked = []
  const seen = new Set()
  for (const q of pool) {
    if (picked.length >= count) break
    const key = q.displayAnswer
    if (seen.has(key)) continue
    seen.add(key)
    picked.push(q)
  }

  return picked.slice(0, count)
}

export function gradeCommandDrillQuestion(question, rawAnswer) {
  if (!question || question.type !== 'type_command') return false
  const answer = String(rawAnswer || '').trim()
  if (!answer) return false
  const accepted = question.answers || [question.displayAnswer]
  return gradeCliAnswerList(answer, accepted)
}

export function drillSessionSummary(results) {
  const total = results.length
  const correct = results.filter(r => r.correct).length
  return {
    total,
    correct,
    pct: total ? Math.round((correct / total) * 100) : 0,
  }
}
