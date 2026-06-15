#!/usr/bin/env node
/**
 * CCNA Study Tool — phased audit orchestrator.
 *
 * Usage:
 *   node scripts/runAudit.mjs --phase scan-content
 *   node scripts/runAudit.mjs --phase scan-content,check-home-ui,test-and-build
 *   node scripts/runAudit.mjs --all
 *   node scripts/runAudit.mjs --list
 *
 * npm: see `npm run audit:help`
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'ai-improvement-logs')

const PHASES = {
  'scan-content': {
    id: 'scan-content',
    npm: 'audit:scan-content',
    name: 'Scan content coverage',
    auto: true,
    desc: 'Scan all 53 objectives → coverage-data.json (tiers, zero-trap counts)',
    run: () => runNode('scripts/auditContentCoverage.mjs'),
  },
  'refresh-logs': {
    id: 'refresh-logs',
    npm: 'audit:refresh-logs',
    name: 'Refresh audit logs',
    auto: true,
    desc: 'Regenerate ai-improvement-logs/ from coverage (keeps queue done-status)',
    run: () => runNode('scripts/generateImprovementLogs.mjs'),
  },
  'check-home-ui': {
    id: 'check-home-ui',
    npm: 'audit:check-home-ui',
    name: 'Check Home UI uniformity',
    auto: true,
    desc: 'Static Home/mobile pattern checks → UI_UNIFORMITY_REPORT.md',
    run: () => runNode('scripts/auditUiUniformity.mjs'),
  },
  'show-next-task': {
    id: 'show-next-task',
    npm: 'audit:show-next-task',
    name: 'Show next fix task',
    auto: false,
    desc: 'Print highest-priority pending IMPLEMENTATION_QUEUE item (agent implements)',
    run: () => printQueueItem(),
  },
  'test-and-build': {
    id: 'test-and-build',
    npm: 'audit:test-and-build',
    name: 'Test and build',
    auto: true,
    desc: 'Run npm test && npm run build',
    run: () => {
      const test = spawnSync('npm', ['test'], { cwd: ROOT, stdio: 'inherit', shell: true })
      if (test.status !== 0) return test.status ?? 1
      const build = spawnSync('npm', ['run', 'build'], { cwd: ROOT, stdio: 'inherit', shell: true })
      return build.status ?? 1
    },
  },
  'print-summary': {
    id: 'print-summary',
    npm: 'audit:print-summary',
    name: 'Print audit summary',
    auto: true,
    desc: 'Print executive summary from latest logs (terminal only)',
    run: () => printReport(),
  },
}

/** Legacy numeric + shorthand aliases → canonical phase id */
const ALIASES = {
  1: 'scan-content', coverage: 'scan-content', scan: 'scan-content',
  2: 'refresh-logs', logs: 'refresh-logs', regenerate: 'refresh-logs',
  3: 'check-home-ui', ui: 'check-home-ui',
  4: 'show-next-task', queue: 'show-next-task', 'next-task': 'show-next-task',
  5: 'test-and-build', verify: 'test-and-build', test: 'test-and-build', build: 'test-and-build',
  6: 'print-summary', summary: 'print-summary', report: 'print-summary',
}

const FULL_RUN = ['scan-content', 'refresh-logs', 'check-home-ui', 'test-and-build', 'print-summary']

function runNode(script) {
  const r = spawnSync('node', [script], { cwd: ROOT, stdio: 'inherit' })
  return r.status ?? 1
}

function resolvePhase(token) {
  const key = token.trim().toLowerCase()
  if (PHASES[key]) return key
  if (ALIASES[key] !== undefined) return ALIASES[key]
  const num = Number(key)
  if (Number.isInteger(num) && ALIASES[num]) return ALIASES[num]
  return null
}

function parseArgs(argv) {
  if (argv.includes('--list') || argv.includes('-l') || argv.includes('--help') || argv.includes('-h')) {
    return { list: true, phases: [] }
  }
  if (argv.includes('--all') || argv.includes('-a')) return { list: false, phases: FULL_RUN }
  const phaseArg = argv.find(a => a.startsWith('--phase='))?.slice(8)
    ?? (argv.includes('--phase') ? argv[argv.indexOf('--phase') + 1] : null)
  if (!phaseArg) return { list: false, phases: null }
  const phases = []
  for (const part of phaseArg.split(',')) {
    const id = resolvePhase(part)
    if (id && !phases.includes(id)) phases.push(id)
    else if (!id) console.warn(`⚠ Unknown phase: "${part.trim()}" — run npm run audit:help`)
  }
  return { list: false, phases }
}

function printHelp() {
  console.log(`
CCNA audit — descriptive npm shortcuts

  npm run audit:scan-content       Scan objectives → coverage-data.json
  npm run audit:refresh-logs       Regenerate ai-improvement-logs/ reports
  npm run audit:check-home-ui      Home/mobile UI pattern check
  npm run audit:show-next-task     Print next queue item to implement
  npm run audit:test-and-build     npm test && npm run build
  npm run audit:print-summary      Print tier/gap/queue summary
  npm run audit:scan-and-refresh   Scan + refresh logs (common pair)
  npm run audit:full               All automated steps (skips show-next-task)
  npm run audit:mark-done          Mark queue item done + append COMPLETED_CHANGES
  npm run audit:help               This list

Combine phases:
  node scripts/runAudit.mjs --phase scan-content,check-home-ui,test-and-build

Legacy numbers still work: --phase 1,2,5  (= scan-content, refresh-logs, test-and-build)
`)
}

function printQueueItem() {
  const path = join(OUT, 'IMPLEMENTATION_QUEUE.json')
  if (!existsSync(path)) {
    console.log('⚠ No IMPLEMENTATION_QUEUE.json — run npm run audit:refresh-logs first')
    return 1
  }
  const { items } = JSON.parse(readFileSync(path, 'utf8'))
  const pending = items.filter(i => i.status === 'pending')
  if (!pending.length) {
    console.log('✓ Queue empty — all items done or none pending')
    return 0
  }
  const next = pending.sort((a, b) => {
    const p = { critical: 0, high: 1, medium: 2, low: 3 }
    return (p[a.priority] ?? 9) - (p[b.priority] ?? 9)
  })[0]
  console.log('\n── Next task (implement manually or with agent) ──')
  console.log(`  id:       ${next.id}`)
  console.log(`  priority: ${next.priority}`)
  console.log(`  area:     ${next.area}`)
  console.log(`  objective:${next.objectiveNumber}`)
  console.log(`  problem:  ${next.problem}`)
  console.log(`  fix:      ${next.recommendedImprovement}`)
  if (next.effort) console.log(`  effort:   ${next.effort}`)
  if (next.scoreImpact) console.log(`  impact:   ${JSON.stringify(next.scoreImpact)}`)
  if (next.files?.length) console.log(`  files:    ${next.files.join(', ')}`)
  if (next.acceptance?.length) {
    console.log('  acceptance:')
    next.acceptance.forEach(a => console.log(`    - ${a}`))
  }
  console.log('\nAfter implementing: npm run audit:test-and-build && npm run audit:mark-done -- <id> "summary"\n')
  return 0
}

function printReport() {
  const covPath = join(OUT, 'coverage-data.json')
  const queuePath = join(OUT, 'IMPLEMENTATION_QUEUE.json')
  if (!existsSync(covPath)) {
    console.log('⚠ No coverage-data.json — run npm run audit:scan-content first')
    return 1
  }
  const { summary, rows } = JSON.parse(readFileSync(covPath, 'utf8'))
  let pending = 0
  let done = 0
  if (existsSync(queuePath)) {
    const { items } = JSON.parse(readFileSync(queuePath, 'utf8'))
    pending = items.filter(i => i.status === 'pending').length
    done = items.filter(i => i.status === 'done').length
  }
  const totalQ = rows.reduce((s, r) => s + r.questions, 0)
  console.log('\n── Audit summary ──')
  console.log(`  Generated:    ${summary.generatedAt}`)
  console.log(`  Objectives:   ${summary.totalObjectives}`)
  console.log(`  Tiers:        A=${summary.tierCounts.A} · B=${summary.tierCounts.B} · C=${summary.tierCounts.C}`)
  console.log(`  Zero traps:   ${summary.zeroTraps.length}${summary.zeroTraps.length ? ` (${summary.zeroTraps.join(', ')})` : ''}`)
  console.log(`  Zero FC:      ${summary.zeroFlashcards.length}`)
  console.log(`  No lab:       ${summary.noLab.length}`)
  console.log(`  Questions:    ${totalQ} total`)
  console.log(`  Queue:        ${done} done · ${pending} pending`)
  console.log(`  Logs:         ai-improvement-logs/`)
  console.log('')
  return 0
}

function main() {
  const { list, phases } = parseArgs(process.argv.slice(2))

  if (list) {
    console.log('\nCCNA audit commands:\n')
    for (const p of Object.values(PHASES)) {
      console.log(`  npm run ${p.npm}`)
      console.log(`      ${p.name}${p.auto ? '' : ' (agent/manual)'}`)
      console.log(`      ${p.desc}\n`)
    }
    console.log('  npm run audit:scan-and-refresh')
    console.log('      Scan content + refresh logs (run together after content changes)\n')
    console.log('  npm run audit:full')
    console.log('      Full automated pass: scan → refresh → UI check → test/build → summary\n')
    return
  }

  if (!phases?.length) {
    printHelp()
    return
  }

  console.log(`\n▶ CCNA audit — ${phases.join(' → ')}\n`)
  let exitCode = 0

  for (const id of phases) {
    const phase = PHASES[id]
    if (!phase) continue
    console.log(`── ${phase.name} (${phase.npm}) ──`)
    const code = phase.run()
    if (code !== 0) {
      console.error(`✗ Failed: ${phase.npm} (exit ${code})`)
      exitCode = code
      break
    }
    console.log('')
  }

  if (exitCode === 0) console.log('✓ Audit run complete')
  process.exit(exitCode)
}

main()
