import { DOMAINS, ALL_OBJECTIVES } from '../../data/ccnaDomains.js'
import { computeMastery } from '../../netUtils.js'
import { masteryBreakdown } from '../../lesson/masteryCriteria.js'

export const fmtPct = (n) => `${Math.round((n || 0) * 100)}%`
const rule = (t) => `${t}\n${'='.repeat(Math.max(t.length, 4))}`
function reportHeader(title) {
  return [rule(`CCNA 200-301 — ${title}`), `Generated: ${new Date().toLocaleString()}`, ''].join('\n')
}

function repStudentProgress(ctx) {
  const { progress, summary } = ctx
  const out = [reportHeader('Student Progress Report')]
  const overall = summary.perObjective.reduce((s, o) => s + o.mastery, 0) / summary.perObjective.length
  const mastered = summary.perObjective.filter(o => o.status === 'mastered').length
  out.push(`Overall mastery: ${fmtPct(overall)} · ${mastered}/${summary.perObjective.length} objectives mastered`, '')
  DOMAINS.forEach(d => {
    const ds = summary.domainStats.find(x => x.id === d.id)
    out.push(`${d.name} (${d.weight}% of exam) — ${fmtPct(ds.avg)} avg, ${ds.mastered}/${ds.total} mastered`)
    d.objectives.forEach(o => {
      const p = progress[o.id]
      const status = p?.status || 'unseen'
      const m = computeMastery(p).score
      let line = `  [${status === 'mastered' ? 'x' : ' '}] ${o.id} ${o.title} — ${status.replace('_', ' ')}`
      if (p?.quizScores?.length) line += ` · mastery ${fmtPct(m)} · ${p.quizScores.length} quiz session(s)`
      out.push(line)
    })
    out.push('')
  })
  return out.join('\n')
}

function repCertReadiness(ctx) {
  const { summary, cliStats } = ctx
  const rows = summary.perObjective
  const readiness = summary.domainStats.reduce((s, d) => s + (d.weight / 100) * d.avg, 0)
  const strong = rows.filter(o => o.mastery >= 0.85 || o.status === 'mastered')
  const needs = rows.filter(o => o.attempts > 0 && o.mastery < 0.7).sort((a, b) => a.mastery - b.mastery)
  const close = rows.filter(o => o.mastery >= 0.7 && o.mastery < 0.85 && o.status !== 'mastered')
  const unseen = rows.filter(o => o.status === 'unseen')
  const cliVals = Object.values(cliStats).map(s => s.bestScore || 0)
  const cliReady = cliVals.length ? Math.round(cliVals.reduce((a, b) => a + b, 0) / cliVals.length) : null

  const out = [reportHeader('Certification Readiness Report')]
  out.push(`Overall Readiness: ${fmtPct(readiness)}`, '')
  out.push('Quiz accuracy by domain:')
  summary.domainStats.forEach(d => out.push(`  - ${d.name}: ${fmtPct(d.avg)} (${d.mastered}/${d.total} mastered)`))
  out.push('', 'CLI readiness: ' + (cliReady != null ? `${cliReady}% across ${cliVals.length} lab(s)` : 'no CLI labs completed yet'))
  out.push('', 'Strong areas:')
  ;(strong.length ? strong : [{ id: '', title: 'none yet' }]).forEach(o => out.push(`  + ${o.id} ${o.title}`.trimEnd()))
  out.push('', 'Needs review (do NOT skip):')
  ;(needs.length ? needs : [{ id: '', title: 'none' }]).forEach(o => out.push(`  ! ${o.id} ${o.title}${o.mastery ? ` (${fmtPct(o.mastery)})` : ''}`.trimEnd()))
  out.push('', 'Close to mastery:')
  ;(close.length ? close : [{ id: '', title: 'none' }]).forEach(o => out.push(`  ~ ${o.id} ${o.title} (${fmtPct(o.mastery)})`.trimEnd()))
  if (unseen.length) { out.push('', `Not started (${unseen.length}):`); unseen.forEach(o => out.push(`  · ${o.id} ${o.title}`)) }
  out.push('', 'Final checklist:',
    `  [${readiness >= 0.85 ? 'x' : ' '}] Overall readiness >= 85%`,
    `  [${needs.length === 0 ? 'x' : ' '}] No topics below 70%`,
    `  [${unseen.length === 0 ? 'x' : ' '}] All objectives started`,
    `  [${cliReady != null && cliReady >= 70 ? 'x' : ' '}] CLI labs >= 70%`)
  return out.join('\n')
}

function repWeakAreas(ctx) {
  const { summary, progress } = ctx
  const rows = summary.perObjective.filter(o => o.attempts > 0)
  const weak = [...rows].filter(o => o.status !== 'mastered').sort((a, b) => a.mastery - b.mastery).slice(0, 12)
  const lowConf = rows.filter(o => o.hardCount >= 2)
  const hidden = rows.filter(o => { const b = masteryBreakdown(progress[o.id]); return b.has && b.acc < 0.7 && b.conf >= 0.6 })
  const missedTop = Object.entries(summary.missedByObj).sort((a, b) => b[1] - a[1])

  const out = [reportHeader('Weak Areas Report')]
  out.push('Lowest mastery (focus here first):')
  ;(weak.length ? weak : [{ id: '', title: 'none — great work' }]).forEach(o => out.push(`  - ${o.id} ${o.title}${o.mastery != null ? ` — ${fmtPct(o.mastery)}` : ''}`.trimEnd()))
  out.push('', 'Most-missed concepts:')
  ;(missedTop.length ? missedTop : [['', 0]]).forEach(([id, n]) => { const o = ALL_OBJECTIVES.find(x => x.id === id); out.push(`  - ${id} ${o ? o.title : ''}${n ? ` (missed ${n}x)` : ' none'}`.trimEnd()) })
  out.push('', 'Low confidence (rated Hard / Need practice):')
  ;(lowConf.length ? lowConf : [{ id: '', title: 'none' }]).forEach(o => out.push(`  - ${o.id} ${o.title}`.trimEnd()))
  out.push('', 'Hidden weakness (confident but inaccurate — priority):')
  ;(hidden.length ? hidden : [{ id: '', title: 'none' }]).forEach(o => out.push(`  - ${o.id} ${o.title}`.trimEnd()))
  return out.join('\n')
}

function repQuizPerformance(ctx) {
  const { progress, quizBank } = ctx
  const out = [reportHeader('Quiz Performance Report')]
  let any = false
  ALL_OBJECTIVES.forEach(o => {
    const p = progress[o.id]
    if (!p?.quizScores?.length) return
    any = true
    const first = p.quizScores[0], last = p.quizScores[p.quizScores.length - 1]
    const bestAcc = Math.max(...p.quizScores.map(s => s.score / Math.max(s.total, 1)))
    const bank = (quizBank[o.id] || []).length
    const ratings = p.confidenceRatings || []
    const conf = ratings.length ? `${ratings.filter(r => r === 'easy' || r === 'medium').length}/${ratings.length} confident` : 'no ratings'
    out.push(`${o.id} ${o.title}`)
    out.push(`  sessions: ${p.quizScores.length} · first ${first.score}/${first.total} -> last ${last.score}/${last.total} · best ${fmtPct(bestAcc)} · bank ${bank}Q · ${conf}`)
  })
  if (!any) out.push('No quizzes taken yet.')
  return out.join('\n')
}

function repCliLab(ctx) {
  const { cliStats } = ctx
  const out = [reportHeader('CLI Lab Report')]
  const entries = Object.entries(cliStats)
  if (entries.length === 0) { out.push('No CLI labs completed yet.'); return out.join('\n') }
  entries.sort((a, b) => (b[1].bestScore || 0) - (a[1].bestScore || 0)).forEach(([id, s]) => {
    const o = ALL_OBJECTIVES.find(x => x.id === id)
    out.push(`${id} ${o ? o.title : ''}`)
    out.push(`  best ${s.bestScore || 0}% · last ${s.lastScore || 0}% · runs ${s.runs || 0} · commands ${s.commandsEntered || 0} · syntax errors ${s.syntaxErrors || 0} · wrong-mode ${s.wrongModeErrors || 0} · hints ${s.hintsUsed || 0}`)
  })
  const tot = entries.reduce((t, [, s]) => ({ syntax: t.syntax + (s.syntaxErrors || 0), mode: t.mode + (s.wrongModeErrors || 0) }), { syntax: 0, mode: 0 })
  out.push('', `Totals: ${tot.syntax} syntax errors, ${tot.mode} wrong-mode errors across ${entries.length} lab(s).`)
  return out.join('\n')
}

function repMissedPacket(ctx) {
  const { missed } = ctx
  const out = [reportHeader('Missed-Question Review Packet')]
  if (!missed.length) { out.push('No missed questions — nothing to cram!'); return out.join('\n') }
  out.push(`${missed.length} question(s) to review. Cover the answers and quiz yourself.`, '')
  missed.forEach((m, i) => {
    const o = ALL_OBJECTIVES.find(x => x.id === m.objectiveId)
    out.push(`Q${i + 1}. [${m.objectiveId} ${o ? o.title : ''}]`)
    out.push(`  ${m.question}`)
    m.choices.forEach((c, ci) => out.push(`    ${String.fromCharCode(65 + ci)}. ${c}`))
    out.push(`  Answer: ${String.fromCharCode(65 + m.correctIndex)}. ${m.choices[m.correctIndex]}`)
    if (m.explanation) out.push(`  Why: ${m.explanation}`)
    out.push('')
  })
  return out.join('\n')
}

function repOfflineSummary(ctx) {
  const { offlineDetail } = ctx
  const out = [reportHeader('Offline Module Summary')]
  const ready = ALL_OBJECTIVES.filter(o => offlineDetail[o.id]?.ready)
  const partial = ALL_OBJECTIVES.filter(o => { const d = offlineDetail[o.id]; return d && d.count > 0 && !d.ready })
  out.push(`Offline-ready modules: ${ready.length}/${ALL_OBJECTIVES.length}`, '')
  out.push('Ready (works fully offline):')
  ;(ready.length ? ready : [{ id: '', title: 'none yet' }]).forEach(o => out.push(`  ⤓ ${o.id} ${o.title}`.trimEnd()))
  out.push('', 'In progress:')
  ;(partial.length ? partial : [{ id: '', title: 'none' }]).forEach(o => { const d = offlineDetail[o.id]; out.push(`  ${o.id} ${o.title} — ${d ? d.count : 0}/4 assets`.trimEnd()) })
  return out.join('\n')
}

function repOfflineStudyPacket(ctx) {
  const { offlineDetail, explainCache, termsCache, visualCache, quizBank } = ctx
  const out = [reportHeader('Offline Study Packet')]
  const ready = ALL_OBJECTIVES.filter(o => offlineDetail[o.id]?.ready)
  if (!ready.length) { out.push('No fully offline-ready modules yet. Master a topic (or tap "Make available offline") to build a packet.'); return out.join('\n') }
  ready.forEach(o => {
    out.push(rule(`${o.id} ${o.title}`))
    const ex = explainCache[o.id]
    if (ex && typeof ex === 'object') {
      if (ex.definition) out.push('', ex.definition)
      if (ex.keyPoints?.length) { out.push('', 'Key points:'); ex.keyPoints.forEach(p => out.push(`  • ${p}`)) }
      if (ex.commonMistakes?.length) { out.push('', 'Common mistakes:'); ex.commonMistakes.forEach(p => out.push(`  • ${p}`)) }
    } else if (ex) {
      out.push('', ex)
    }
    const terms = termsCache[o.id]
    if (terms?.length) { out.push('', 'Key terms:'); terms.forEach(t => out.push(`  • ${t.term}: ${t.detail}`)) }
    const v = visualCache[o.id]
    if (v) { out.push('', `Visual (${v.type}): ${v.title}`); (v.steps || v.layers || []).forEach((s, i) => out.push(`  ${i + 1}. ${typeof s === 'string' ? s : s.label}`)) }
    const bank = quizBank[o.id] || []
    if (bank.length) { out.push('', 'Practice questions:'); bank.forEach((q, i) => { out.push(`  ${i + 1}. ${q.question}`); out.push(`     Answer: ${q.choices[q.correctIndex]}`) }) }
    out.push('')
  })
  return out.join('\n')
}

function repProgressTimeline(ctx) {
  const { progress, streak } = ctx
  const out = [reportHeader('Progress Timeline')]
  out.push(`Current streak: ${streak?.count || 0} day(s)`, '')
  const items = []
  ALL_OBJECTIVES.forEach(o => {
    const p = progress[o.id]
    if (!p?.quizScores?.length) return
    const first = p.quizScores[0], last = p.quizScores[p.quizScores.length - 1]
    items.push({ o, first, last, delta: (last.score / Math.max(last.total, 1)) - (first.score / Math.max(first.total, 1)), date: first.date })
  })
  if (!items.length) { out.push('No timeline yet — take some quizzes to track growth.'); return out.join('\n') }
  items.sort((a, b) => a.date - b.date).forEach(it => {
    const d = new Date(it.first.date).toLocaleDateString()
    const arrow = it.delta > 0.01 ? `▲ +${fmtPct(it.delta)}` : it.delta < -0.01 ? `▼ ${fmtPct(it.delta)}` : '–'
    out.push(`${d}  ${it.o.id} ${it.o.title}: ${it.first.score}/${it.first.total} -> ${it.last.score}/${it.last.total}  ${arrow}`)
  })
  return out.join('\n')
}

function repInstructor(ctx) {
  const { summary, events } = ctx
  const out = [reportHeader('Instructor / Coach Report')]
  const overall = summary.perObjective.reduce((s, o) => s + o.mastery, 0) / summary.perObjective.length
  const mastered = summary.perObjective.filter(o => o.status === 'mastered').length
  const quizDone = events.filter(e => e.type === 'user_completed_quiz').length
  const cliDone = events.filter(e => e.type === 'user_completed_cli_lab').length
  out.push(`Overall mastery: ${fmtPct(overall)} · ${mastered}/${summary.perObjective.length} mastered`)
  out.push(`Engagement: ${quizDone} quiz session(s), ${cliDone} CLI lab(s) completed`, '')
  out.push('Per-domain:')
  summary.domainStats.forEach(d => out.push(`  - ${d.name}: ${fmtPct(d.avg)} (${d.mastered}/${d.total})`))
  const weak = [...summary.perObjective].filter(o => o.status !== 'mastered' && o.attempts > 0).sort((a, b) => a.mastery - b.mastery).slice(0, 6)
  out.push('', 'Recommended focus for next session:')
  ;(weak.length ? weak : [{ id: '', title: 'student is on track' }]).forEach(o => out.push(`  - ${o.id} ${o.title}`.trimEnd()))
  return out.join('\n')
}

function repFullPortfolio(ctx) {
  return [repStudentProgress(ctx), '', repCertReadiness(ctx), '', repWeakAreas(ctx), '', repCliLab(ctx), '', repProgressTimeline(ctx)].join('\n\n')
}

function repRawData(ctx) {
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    progress: ctx.progress,
    missed: ctx.missed,
    quizBank: ctx.quizBank,
    cliStats: ctx.cliStats,
    streak: ctx.streak,
    events: ctx.events,
  }, null, 2)
}

export const REPORTS = [
  { key: 'progress', label: 'Student Progress', desc: 'Per-domain mastery checklist', ext: 'txt', build: repStudentProgress },
  { key: 'cert', label: 'Certification Readiness', desc: 'Are you exam-ready?', ext: 'txt', build: repCertReadiness },
  { key: 'weak', label: 'Weak Areas', desc: 'Focused improvement map', ext: 'txt', build: repWeakAreas },
  { key: 'quiz', label: 'Quiz Performance', desc: 'Accuracy & growth per topic', ext: 'txt', build: repQuizPerformance },
  { key: 'cli', label: 'CLI Lab Report', desc: 'Command skills & error trends', ext: 'txt', build: repCliLab },
  { key: 'missed', label: 'Missed-Question Packet', desc: 'Auto cram sheet', ext: 'txt', build: repMissedPacket },
  { key: 'offlineSum', label: 'Offline Module Summary', desc: 'What works offline', ext: 'txt', build: repOfflineSummary },
  { key: 'offlinePacket', label: 'Offline Study Packet', desc: 'Full self-contained notes', ext: 'txt', build: repOfflineStudyPacket },
  { key: 'timeline', label: 'Progress Timeline', desc: 'Growth over time', ext: 'txt', build: repProgressTimeline },
  { key: 'instructor', label: 'Instructor / Coach', desc: 'Summary for a mentor', ext: 'txt', build: repInstructor },
  { key: 'portfolio', label: 'Full Portfolio', desc: 'Everything combined', ext: 'txt', build: repFullPortfolio },
  { key: 'raw', label: 'Raw Data (JSON)', desc: 'Backup / transfer', ext: 'json', build: repRawData },
]
