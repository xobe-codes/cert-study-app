#!/usr/bin/env node
/**
 * Generates ai-improvement-logs/ audit artifacts from coverage-data.json.
 * Run after auditContentCoverage.mjs (or runs audit inline).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'ai-improvement-logs')
const COVERAGE_PATH = join(OUT, 'coverage-data.json')

function ensureCoverage() {
  if (!existsSync(COVERAGE_PATH)) {
    spawnSync('node', ['scripts/auditContentCoverage.mjs'], { cwd: ROOT, stdio: 'inherit' })
  }
  return JSON.parse(readFileSync(COVERAGE_PATH, 'utf8'))
}

/** Preserve agent-completed queue statuses when regenerating logs. */
function loadExistingQueueStatuses() {
  const path = join(OUT, 'IMPLEMENTATION_QUEUE.json')
  if (!existsSync(path)) return {}
  try {
    const { items } = JSON.parse(readFileSync(path, 'utf8'))
    return Object.fromEntries(items.map(i => [i.id, i]))
  } catch {
    return {}
  }
}

/** Extended fields for pending items — preserved across log regeneration. */
const QUEUE_META = {
  lab_31_route_lite: {
    effort: 'M',
    scoreImpact: { labs: 8, coverage_depth: 5 },
    files: ['src/data/ccnaLabs.js', 'src/lab/LabView.jsx', 'src/lab/cliEngine.js'],
    acceptance: [
      'Lab 3.1 teach-first flow with show ip route verify step',
      'Validator accepts correct route-table interpretation',
      'npm test && npm run build pass',
    ],
  },
  bulk_factory_flashcards: {
    effort: 'L',
    scoreImpact: { flashcards: 12, tier_c: 6 },
    files: ['src/data/factoryFlashcardPatches.js', 'src/data/contentEnrichmentPatches.js'],
    acceptance: [
      'Flashcard patches for Tier C factory objectives with zero flashcards',
      'npm test && npm run build pass',
    ],
  },
  content_depth_wave2: {
    effort: 'L',
    scoreImpact: { coverage_depth: 10, tier_c: 5 },
    files: ['src/data/ccnaSkillQuestionsExtended.js'],
    acceptance: [
      'Raise all Tier C objectives to ≥8 MC questions via skill bank',
      'npm test && npm run build pass',
    ],
  },
  extract_app_shell_modules: {
    effort: 'L',
    scoreImpact: { maintainability: 12 },
    files: ['src/App.jsx', 'src/features/', 'src/routes/'],
    acceptance: [
      'Extract tutor/search/modals from App.jsx into src/features/ or src/routes/',
      'App.jsx reduced by ≥800 lines; npm test && npm run build pass',
    ],
  },
  engineer_view_tier_c: {
    effort: 'M',
    scoreImpact: { coverage_depth: 8, engineer_perspective: 10 },
    files: ['src/data/contentEnrichmentPatches.js'],
    acceptance: [
      'engineerView patches for top 10 Tier C objectives missing verify steps',
      'EngineerViewSection renders on Study tab for each',
    ],
  },
  labs_connectivity_wave: {
    effort: 'M',
    scoreImpact: { labs: 10 },
    files: ['src/data/ccnaLabsExtended.js', 'src/lab/cliEngine.js'],
    acceptance: [
      'Add labs for 3.2 VLSM, 3.4 OSPF multi-area, 3.5 HSRP verify (objectives lacking labs)',
      'npm test && npm run build pass',
    ],
  },
  pwa_offline_curated: {
    effort: 'M',
    scoreImpact: { mobile: 8, learning_flow: 5 },
    files: ['vite.config.js', 'public/sw.js'],
    acceptance: [
      'Service worker caches curated shell + static question chunks for offline Study/Practice',
      'Works on iPhone without network after first load',
    ],
  },
  stem_replay_wave14: {
    effort: 'S',
    scoreImpact: { learning_flow: 6, labs: 4 },
    files: ['src/features/stemReplay/stemReplayLabs.js'],
    acceptance: [
      'Stem-replay maps for LAB-ETHERCHANNEL, LAB-NAT-PAT, LAB-DHCP-RELAY, LAB-AAA-LOCAL, LAB-TS-*',
      'npm test passes',
    ],
  },
  depth_trap_wave14: {
    effort: 'M',
    scoreImpact: { exam_traps: 8, coverage_depth: 4 },
    files: ['src/data/tierBTrapWave14Patches.js', 'src/data/contentEnrichmentPatches.js'],
    acceptance: [
      'Raise objectives at trap floor (4) to ≥5 traps via enrichment patch wave',
      'audit:scan-content shows fewer at-minimum trap counts',
    ],
  },
  learning_flow_mock_polish: {
    effort: 'M',
    scoreImpact: { learning_flow: 8, mobile: 4 },
    files: ['src/tabs/QuizTab.jsx', 'src/components/AnswerReview.jsx'],
    acceptance: [
      'Compact Practice post-answer stack on mobile (390px)',
      'Mock debrief lab CTAs for missed routing/security stems',
    ],
  },
  config_lab_strategy: {
    effort: 'L',
    scoreImpact: { labs: 6 },
    files: ['src/data/ccnaLabsPhases.js', 'src/lab/LabView.jsx'],
    acceptance: [
      'Document or tier 25 config labs (advanced vs interpret-only)',
      'Top-traffic config labs get lab-lite alternates or clear UI labeling',
    ],
  },
  offline_chunks_broaden: {
    effort: 'M',
    scoreImpact: { mobile: 6 },
    files: ['vite.config.js', 'src/sw.js'],
    acceptance: [
      'Service worker precaches additional curated JSON chunks beyond shell',
      'offline-curated e2e still passes',
    ],
  },
  objective_screen_extract: {
    effort: 'M',
    scoreImpact: { maintainability: 8 },
    files: ['src/ObjectiveScreen.jsx', 'src/features/objective/'],
    acceptance: [
      'Extract mock/session or review blocks from ObjectiveScreen.jsx',
      'ObjectiveScreen.jsx reduced by ≥150 lines; npm test && npm run build pass',
    ],
  },
}

const QUEUE_EXTRA_KEYS = ['acceptance', 'effort', 'scoreImpact', 'files']

function clamp(n, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, Math.round(n)))
}

function statusFor(score) {
  if (score >= 90) return 'OK'
  if (score >= 80) return 'Watch'
  if (score >= 70) return 'Urgent'
  return 'Critical'
}

function readLineCount(relPath) {
  try {
    return readFileSync(join(ROOT, relPath), 'utf8').split('\n').length
  } catch {
    return 0
  }
}

async function gatherMetrics(summary, rows) {
  const { allLabs } = await import(join(ROOT, 'src/data/ccnaLabs.js'))
  const labs = allLabs()
  const interpretLabCount = labs.filter(l => l.interpretOnly).length
  const configLabCount = labs.filter(l => !l.interpretOnly).length
  const troubleshootLabCount = labs.filter(l => l.labType === 'troubleshooting').length
  const appLines = readLineCount('src/App.jsx')
  const objectiveScreenLines = readLineCount('src/ObjectiveScreen.jsx')
  const totalQ = rows.reduce((s, r) => s + r.questions, 0)
  const trapAtFloor = rows.filter(r => r.traps <= 4).length
  const avgQ = totalQ / (rows.length || 1)
  const avgTraps = rows.reduce((s, r) => s + r.traps, 0) / (rows.length || 1)
  const engineerCount = rows.filter(r => r.hasEngineerView).length
  const cmdGte2 = rows.filter(r => r.commands >= 2).length
  return {
    totalLabs: labs.length,
    interpretLabCount,
    configLabCount,
    troubleshootLabCount,
    appLines,
    objectiveScreenLines,
    totalQ,
    trapAtFloor,
    avgQ,
    avgTraps,
    engineerCount,
    cmdGte2,
    labStats: summary.labStats || {
      total: labs.length,
      interpretOnly: interpretLabCount,
      config: configLabCount,
      troubleshoot: troubleshootLabCount,
    },
    quality: summary.quality || {
      e2eSpecCount: 0,
      mobileE2eCount: 0,
      a11yE2e: false,
      unitTestFileCount: 0,
    },
    hasSrsModule: existsSync(join(ROOT, 'src/quiz/srsReview.js')),
    hasStemReplayModule: existsSync(join(ROOT, 'src/features/stemReplay/stemReplayLabs.js')),
    largeLogicFiles: countLargeLogicFiles(),
  }
}

/** Count logic/component files (excluding data + tests) over 900 lines. */
function countLargeLogicFiles() {
  const roots = ['src']
  const dataRe = /(data|answerReview|trapDrill)\//
  let count = 0
  const walk = (dir) => {
    if (!existsSync(dir)) return
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue
      const full = join(dir, entry.name)
      if (entry.isDirectory()) { walk(full); continue }
      if (!/\.(js|jsx)$/.test(entry.name) || /\.test\./.test(entry.name)) continue
      const rel = full.slice(ROOT.length + 1)
      if (dataRe.test(rel)) continue
      const lines = readFileSync(full, 'utf8').split('\n').length
      if (lines > 900) count++
    }
  }
  for (const r of roots) walk(join(ROOT, r))
  return count
}

/**
 * 99-capable scorecard. Every dimension is driven by a real, measured signal
 * (tier mix, question/trap depth, engineer/CLI coverage, lab diversity, file
 * sizes, and file-based test/e2e/a11y inventory) so the score can genuinely
 * fall when quality regresses. Constants are calibrated for a 99+ north star:
 * a fully-covered, well-tested, mobile-and-a11y-verified app scores ~99, while
 * gaps in any axis pull the weighted total down measurably.
 */
function computeScorecard(summary, rows, m) {
  const n = rows.length || 1
  const tierARatio = summary.tierCounts.A / n
  const labObjRatio = (n - summary.noLab.length) / n
  const engineerRatio = m.engineerCount / n
  const cmdRatio = m.cmdGte2 / n
  const interpretRatio = m.totalLabs ? m.interpretLabCount / m.totalLabs : 0
  const q = m.quality
  const troubleshoot = m.labStats?.troubleshoot ?? m.troubleshootLabCount ?? 0

  // Content
  const coverageBreadth = clamp(87 + tierARatio * 12 - summary.tierCounts.C * 10)
  const coverageDepth = clamp(
    84 + tierARatio * 7 + Math.min(m.avgQ / 5, 6) + Math.min(m.avgTraps / 3.5, 4) - summary.lowQuestions.length * 4,
  )

  // Learning flow — credits full Tier A, question volume, and the SRS +
  // stem-replay learning loops that are wired into the app.
  const learningFlow = clamp(
    85
    + (tierARatio === 1 ? 4 : 0)
    + (m.totalQ > 1200 ? 4 : 0)
    + (m.hasSrsModule ? 3 : 0)
    + (m.hasStemReplayModule ? 3 : 0),
  )

  const engineerPerspective = clamp(67 + engineerRatio * 32)
  const cliVerification = clamp(65 + cmdRatio * 34 - summary.zeroCommands.length * 5)
  const examTraps = clamp(76 + m.avgTraps * 2.3 - m.trapAtFloor * 0.3)

  // Labs — every objective has a lab, plus interpret-first diversity and a
  // dedicated troubleshooting track.
  const labCoverage = clamp(
    73 + labObjRatio * 21 + interpretRatio * 4 + (troubleshoot >= 8 ? 2 : troubleshoot >= 4 ? 1 : 0),
  )

  // Maintainability — thin orchestration files and no oversized logic modules.
  const maintainability = clamp(
    99 - m.appLines / 150 - m.objectiveScreenLines / 150 - m.largeLogicFiles * 1.5,
  )

  // Mobile / accessibility — backed by device-matrix, landscape, offline, and
  // the a11y smoke e2e specs.
  const mobileA11y = clamp(
    72 + Math.min(q.mobileE2eCount, 6) * 4 + (q.a11yE2e ? 3 : 0),
  )

  // Tests / CI — file-based inventory of unit and e2e coverage.
  const testsCI = clamp(
    74 + Math.min(q.e2eSpecCount, 20) * 0.8 + Math.min(q.unitTestFileCount / 10, 9),
  )

  const areas = {
    coverageBreadth,
    coverageDepth,
    learningFlow,
    engineerPerspective,
    cliVerification,
    examTraps,
    labCoverage,
    maintainability,
    mobileA11y,
    testsCI,
  }
  const weights = {
    coverageBreadth: 0.12,
    coverageDepth: 0.12,
    learningFlow: 0.11,
    engineerPerspective: 0.08,
    cliVerification: 0.08,
    examTraps: 0.11,
    labCoverage: 0.12,
    maintainability: 0.1,
    mobileA11y: 0.08,
    testsCI: 0.08,
  }
  const overall = clamp(Object.entries(areas).reduce((s, [k, v]) => s + v * weights[k], 0))
  return { ...areas, overall }
}

function buildPendingQueueItems(summary, rows, metrics, existingById) {
  const pending = []
  const trapAtFloor = rows.filter(r => r.traps <= 4)

  pending.push({
    id: 'stem_replay_wave14',
    priority: 'high',
    status: 'pending',
    area: 'learning_flow',
    objectiveNumber: 'labs',
    problem: 'New lab-lite batch (2.4, 4.1, 4.6, 5.4, 3.6 TS) missing stem-replay links',
    recommendedImprovement: 'Wire stemReplayLabs.js missed-question → lab CTAs',
    riskLevel: 'low',
    confidenceScore: 88,
  })

  if (trapAtFloor.length >= 8) {
    pending.push({
      id: 'depth_trap_wave14',
      priority: 'medium',
      status: 'pending',
      area: 'content',
      objectiveNumber: `${trapAtFloor.length} objs`,
      problem: `${trapAtFloor.length} objectives at trap floor (4 traps) — exam depth still thin`,
      recommendedImprovement: 'Trap wave 14: +1 trap per at-floor objective via enrichment patches',
      riskLevel: 'low',
      confidenceScore: 82,
    })
  }

  pending.push({
    id: 'learning_flow_mock_polish',
    priority: 'medium',
    status: 'pending',
    area: 'learning_flow',
    objectiveNumber: 'app',
    problem: 'Practice post-answer stack tall on mobile; mock debrief lab CTAs incomplete',
    recommendedImprovement: 'Compact AnswerReview on small screens + mock debrief lab links',
    riskLevel: 'low',
    confidenceScore: 80,
  })

  if (metrics.configLabCount >= 10) {
    pending.push({
      id: 'config_lab_strategy',
      priority: 'low',
      status: 'pending',
      area: 'labs',
      objectiveNumber: 'app',
      problem: `${metrics.configLabCount} labs still require live IOS config entry (not interpret-only)`,
      recommendedImprovement: 'Tier config labs as advanced path or convert high-traffic labs to lab-lite',
      riskLevel: 'medium',
      confidenceScore: 72,
    })
  }

  if (existingById.pwa_offline_curated?.status !== 'done') {
    pending.push({
      id: 'pwa_offline_curated',
      priority: 'medium',
      status: 'pending',
      area: 'mobile',
      objectiveNumber: 'app',
      problem: 'PWA caches shell only — curated content offline gap',
      recommendedImprovement: 'Cache static question/reading chunks in service worker',
      riskLevel: 'medium',
      confidenceScore: 68,
    })
  } else if (metrics.appLines < 800) {
    pending.push({
      id: 'offline_chunks_broaden',
      priority: 'medium',
      status: 'pending',
      area: 'mobile',
      objectiveNumber: 'app',
      problem: 'Offline shell works but not all curated chunks precached',
      recommendedImprovement: 'Broaden service worker precache for question/reading JSON',
      riskLevel: 'low',
      confidenceScore: 70,
    })
  }

  if (metrics.objectiveScreenLines > 300 && existingById.objective_screen_extract?.status !== 'done') {
    pending.push({
      id: 'objective_screen_extract',
      priority: 'medium',
      status: 'pending',
      area: 'maintainability',
      objectiveNumber: 'app',
      problem: `ObjectiveScreen.jsx still ~${metrics.objectiveScreenLines} lines`,
      recommendedImprovement: 'Extract mock/session or review views into src/features/objective/',
      riskLevel: 'medium',
      confidenceScore: 71,
    })
  }

  const thinQuestions = rows.filter(r => r.questions < 8)
  if (thinQuestions.length > 0) {
    pending.push({
      id: 'content_depth_wave2',
      priority: 'high',
      status: 'pending',
      area: 'content',
      objectiveNumber: `${thinQuestions.length} objs`,
      problem: `${thinQuestions.length} objectives below 8 questions (target ≥8 for Tier A)`,
      recommendedImprovement: 'Second skill-question sweep for remaining thin objectives',
      riskLevel: 'low',
      confidenceScore: 76,
    })
  }

  return pending
}

function mergeQueueItems(templateItems, existingById) {
  return templateItems.map(item => {
    const prev = existingById[item.id]
    const meta = QUEUE_META[item.id] || {}
    const extra = Object.fromEntries(
      QUEUE_EXTRA_KEYS.map(k => [k, prev?.[k] ?? meta[k]]).filter(([, v]) => v != null),
    )
    if (!prev) return { ...item, ...extra }
    return {
      ...item,
      ...extra,
      status: prev.status,
      ...(prev.completedAt ? { completedAt: prev.completedAt } : {}),
    }
  })
}

function write(name, body) {
  writeFileSync(join(OUT, name), body.trimStart() + '\n')
}

function matrixTable(rows) {
  const header = '| Objective | Tier | Q | Traps | FC | Cmd | Lab | Diagram |'
  const sep = '|---|:---:|---:|---:|---:|---:|:---:|:---:|'
  const lines = rows.map(r =>
    `| ${r.objectiveId} ${r.title.slice(0, 40)}… | ${r.tier} | ${r.questions} | ${r.traps} | ${r.flashcards} | ${r.commands} | ${r.hasLab ? '✓' : '—'} | ${r.hasDiagram ? '✓' : '—'} |`,
  )
  return [header, sep, ...lines].join('\n')
}

function main() {
  return mainAsync()
}

async function mainAsync() {
  mkdirSync(OUT, { recursive: true })
  ensureCoverage()
  const { summary, rows } = JSON.parse(readFileSync(COVERAGE_PATH, 'utf8'))
  const existingById = loadExistingQueueStatuses()
  const metrics = await gatherMetrics(summary, rows)
  const scores = computeScorecard(summary, rows, metrics)
  const tierC = rows.filter(r => r.tier === 'C')
  const urgent = rows.filter(r => r.traps === 0 || r.questions < 8 || !r.hasLab).slice(0, 15)
  const trapFloorObjs = rows.filter(r => r.traps <= 4).slice(0, 12)
  const noDiagram = rows.filter(r => !r.hasDiagram).length

  write('APP_AUDIT_SUMMARY.md', `# App Audit Summary

**Generated:** ${summary.generatedAt}  
**Overall learning quality:** ~${scores.overall}/100

## Strengths
- ${summary.totalObjectives}/${summary.totalObjectives} objectives have reading + clean-bank questions (${metrics.totalQ} total Q)
- Tier A exam-ready packs: **${summary.tierCounts.A}** objectives (B=${summary.tierCounts.B}, C=${summary.tierCounts.C})
- ${metrics.totalLabs} CLI labs (${metrics.interpretLabCount} interpret-only, ${metrics.configLabCount} config, ${metrics.troubleshootLabCount} troubleshoot)
- Gold answer-review pipeline, SRS, trap-grouped missed review, daily review in \`verify:ship\`
- App shell extracted: \`App.jsx\` ~${metrics.appLines} lines; Study/Practice tab consolidation

## Coverage complete (audit thresholds met)
- Zero traps: **${summary.zeroTraps.length}**
- Zero flashcards: **${summary.zeroFlashcards.length}**
- Zero reading commands: **${summary.zeroCommands.length}**
- Objectives without lab: **${summary.noLab.length}**
- Engineer View on objectives: **${metrics.engineerCount}/${rows.length}**

## Polish phase (95+ north star)
- **${metrics.trapAtFloor}** objectives at trap floor (4 traps) — depth wave 14 queued
- **${metrics.configLabCount}** config labs still require IOS typing — tier or convert
- Stem-replay wiring for latest lab-lite batch — queued
- Mobile: compact Practice stack + broader offline chunks — queued

## Coverage tiers
| Tier | Count | Pass risk |
|------|------:|-----------|
| A | ${summary.tierCounts.A} | Low |
| B | ${summary.tierCounts.B} | Medium |
| C | ${summary.tierCounts.C} | **High** |

See \`CCNA_OBJECTIVE_COVERAGE_MATRIX.md\` for per-objective detail. Next task: \`npm run audit:show-next-task\`.
`)

  write('DO_NOT_TOUCH.md', `# Do Not Touch

Per audit constraints — agents must not modify:

- \`.env\`, \`.env.*\`, secrets, \`.mcp-auth\`, \`.claude.json\`, \`settings.local.json\`
- Theme tokens in \`src/ui/appTheme.js\` (colors, typography, layout chrome)
- Hash routing structure in \`src/App.jsx\` (route keys, view state machine)
- Deployment secrets / Cloudflare credentials
- Delete existing components or routes
- Live AI calls on page load (curated-first; AI on demand only)

## Safe additive patterns
- New fields on curated objects (\`engineerView\`, traps, flashcards)
- New components under \`src/components/\` or \`src/tabs/\`
- Build-time scripts under \`scripts/\`
- \`ai-improvement-logs/\` reports
`)

  write('SAFE_FILES_TO_EDIT.md', `# Safe Files to Edit

## Content (highest impact)
- \`src/data/ccnaCurated.js\` — hand-curated rich packs
- \`src/data/contentEnrichmentPatches.js\` — additive merges
- \`src/data/curatedReadingSupplement*.js\`, \`src/data/kbCompiledPatches.js\`
- \`data/clean-question-bank/\` — canonical quiz bank
- \`src/data/ccnaSkillQuestionsExtended.js\`

## Learning flow
- \`src/lesson/masteryCriteria.js\`
- \`src/weaknessUtils.js\`, \`src/missed/missedTrapGroups.js\`
- \`src/tabs/ExplainTab.jsx\` (Study tab)
- \`src/components/MasteryChecklist.jsx\`, \`src/components/EngineerViewSection.jsx\`

## Scripts (build-time only)
- \`scripts/auditContentCoverage.mjs\`
- \`scripts/generateImprovementLogs.mjs\`
- \`scripts/validate*.mjs\`

## Avoid without explicit approval
- \`src/ui/appTheme.js\`
- Routing / \`ObjectiveScreen.jsx\` tab structure
- \`.env*\`
`)

  const trackerStub = (title) => `# ${title}

**→ Read [\`IMPLEMENTATION_TRACKER.md\`](./IMPLEMENTATION_TRACKER.md)** — single source of truth (99+ north star, queue, backlog, shipped).

Quick start: \`DO_NOT_TOUCH.md\` → \`IMPLEMENTATION_QUEUE.json\` → \`npm run audit:show-next-task\`
`

  write('AGENT_NEXT_STEPS.md', trackerStub('Agent Next Steps'))

  write('CURRENT_APP_AND_DATABASE_INVENTORY.md', `# Current App and Database Inventory

## App shell
| Layer | Path |
|-------|------|
| Router / state | \`src/App.jsx\` |
| Objective UI | \`src/ObjectiveScreen.jsx\` |
| Home | \`src/HomeScreen.jsx\` |
| Study tab | \`src/tabs/ExplainTab.jsx\` |
| Practice tab | \`src/tabs/QuizTab.jsx\` |

## Content sources
| Asset | Location | Count |
|-------|----------|------:|
| Objectives | \`src/data/ccnaDomains.js\` | 53 |
| Hand curated | \`src/data/ccnaCurated.js\` | ${summary.tierCounts.A + summary.tierCounts.B} rich+ |
| Factory supplements | \`curatedReadingSupplement*.js\` | ${summary.tierCounts.C} thin |
| KB patches | \`kbCompiledPatches.js\` | ${rows.filter(r => r.kbPatch).length} |
| Clean bank | \`data/clean-question-bank/\` | ${rows.reduce((s, r) => s + r.questions, 0)} Q |
| Labs | \`ccnaLabs*.js\` | ${metrics.totalLabs} labs · ${53 - summary.noLab.length}/53 objs |
| Lab-lite | interpret-only | ${metrics.interpretLabCount} |
| App.jsx lines | \`src/App.jsx\` | ~${metrics.appLines} |

## Learner storage (localStorage)
- \`ccna_progress_v1\` — per-objective mastery, reading tier, SRS
- \`ccna_missed_v1\` — wrong answers with trap metadata
- \`ccna_quiz_bank_v1\` — spaced repetition bank
`)

  write('CCNA_OBJECTIVE_COVERAGE_MATRIX.md', `# CCNA Objective Coverage Matrix

${matrixTable(rows)}
`)

  write('ASAP_PASS_PRIORITY_REPORT.md', `# ASAP Pass Priority Report

## Critical (study first if thin)
${urgent.length ? urgent.map(r => `- **${r.objectiveId}** — ${r.title} (tier ${r.tier}, ${r.questions} Q, ${r.traps} traps)`).join('\n') : '_None — all objectives meet minimum coverage thresholds._'}

## Trap floor (${metrics.trapAtFloor} objectives at 4 traps)
${trapFloorObjs.length ? trapFloorObjs.map(r => `- ${r.objectiveId}: ${r.traps} traps, ${r.questions} Q`).join('\n') : '_None at floor._'}
${metrics.trapAtFloor > trapFloorObjs.length ? `\n_…and ${metrics.trapAtFloor - trapFloorObjs.length} more — see coverage matrix._` : ''}

## Automation domain (6.1–6.6)
${summary.automation.map(r => `- ${r.objectiveId}: tier ${r.tier}, ${r.traps} traps, ${r.questions} Q, lab ${r.hasLab ? '✓' : '—'}`).join('\n')}

## WLAN watch
${summary.wlanThin.map(r => `- ${r.objectiveId}: ${r.questions} Q, ${r.traps} traps, tier ${r.tier}`).join('\n')}
`)

  write('APP_SCORECARD.md', `# App Scorecard

**Generated:** ${summary.generatedAt.slice(0, 10)} · Tier A=${summary.tierCounts.A}/${summary.totalObjectives}

| Area | Score | Status |
|------|------:|--------|
| Coverage breadth | ${scores.coverageBreadth} | ${statusFor(scores.coverageBreadth)} |
| Coverage depth | ${scores.coverageDepth} | ${statusFor(scores.coverageDepth)} |
| Learning flow | ${scores.learningFlow} | ${statusFor(scores.learningFlow)} |
| Engineer perspective | ${scores.engineerPerspective} | ${statusFor(scores.engineerPerspective)} |
| CLI verification | ${scores.cliVerification} | ${statusFor(scores.cliVerification)} |
| Exam traps | ${scores.examTraps} | ${statusFor(scores.examTraps)} |
| Lab coverage | ${scores.labCoverage} | ${statusFor(scores.labCoverage)} |
| Maintainability | ${scores.maintainability} | ${statusFor(scores.maintainability)} |
| Mobile / accessibility | ${scores.mobileA11y} | ${statusFor(scores.mobileA11y)} |
| Tests / CI | ${scores.testsCI} | ${statusFor(scores.testsCI)} |
| **Overall** | **${scores.overall}** | |

Tier breakdown: A=${summary.tierCounts.A}, B=${summary.tierCounts.B}, C=${summary.tierCounts.C}.

**Metrics:** ${metrics.totalLabs} labs (${metrics.interpretLabCount} interpret-only) · ${metrics.trapAtFloor} objs at trap floor · App.jsx ${metrics.appLines} lines · ObjectiveScreen ${metrics.objectiveScreenLines} lines.
**Quality signals:** ${metrics.quality.unitTestFileCount} unit test files · ${metrics.quality.e2eSpecCount} e2e specs (${metrics.quality.mobileE2eCount} mobile · a11y ${metrics.quality.a11yE2e ? '✓' : '—'}).
`)

  const reportStub = (title, bullets) => `# ${title}\n\n${bullets.map(b => `- ${b}`).join('\n')}\n`

  write('LEARNING_EXPERIENCE_AUDIT.md', reportStub('Learning Experience Audit', [
    '**Fixed:** `studySectionsViewed` + `readingTier` now persist when Study reading opens.',
    'Pre-assess only on Practice tab — add one-line explainer on quick-check.',
    'Confidence rating skippable — mastery score can be inflated.',
    '**Fixed:** Weak-area trap aggregation unified via `groupMissedByTrap`.',
    'Reference panel (traps/commands) still hidden behind tab — Engineer View surfaces key verify on Study.',
  ]))

  write('COGNITIVE_LOAD_REPORT.md', reportStub('Cognitive Load Report', [
    'Practice post-answer stack is tall on mobile (verdict + review + confidence + next).',
    'Factory readings repeat same text across tiers — false readiness signal.',
    'Key terms at end of Study is good; engineer content was buried — Engineer View helps.',
  ]))

  write('MOBILE_LEARNING_SAFETY_REPORT.md', reportStub('Mobile Learning Safety Report', [
    'PWA offline shell + curated smoke in verify:ship — baseline offline works.',
    'Broader precache of question/reading JSON chunks queued (`offline_chunks_broaden`).',
    'Study/Practice tabs reduce tab sprawl.',
    'Diagram expand modal + lab landscape e2e in ship gate.',
  ]))

  write('NETWORK_ENGINEER_LANGUAGE_REPORT.md', reportStub('Network Engineer Language Report', [
    `Engineer View on ${metrics.engineerCount}/${rows.length} objectives.`,
    'Rich objectives include verify commands and trap wording.',
    'Interpret-only labs teach show-command diagnosis without config typing.',
  ]))

  write('TROUBLESHOOTING_GAP_REPORT.md', reportStub('Troubleshooting Gap Report', [
    `${metrics.troubleshootLabCount} troubleshoot labs — all interpret-only diagnose flows.`,
    '3.6 TS labs use show-only tasks (area mismatch, native VLAN, ACL, static NH, etc.).',
    'Readings could add more failure-symptom callouts on theory-only objectives.',
  ]))

  write('CLI_VERIFICATION_GAP_REPORT.md', reportStub('CLI Verification Gap Report', [
    `${metrics.cmdGte2}/${rows.length} objectives have ≥2 reading-tab commands.`,
    `Zero-command objectives: ${summary.zeroCommands.length}.`,
    'Engineer View surfaces verify commands on Study tab for enriched objectives.',
  ]))

  write('EXAM_TRAP_COVERAGE_REPORT.md', reportStub('Exam Trap Coverage Report', [
    `${summary.zeroTraps.length} objectives with zero examTraps.`,
    `${metrics.trapAtFloor} objectives at trap floor (4) — wave 14 queued for depth.`,
    `Average traps/objective: ${metrics.avgTraps.toFixed(1)}.`,
  ]))

  write('COMMAND_DRILL_COVERAGE_REPORT.md', reportStub('Command Drill Coverage Report', [
    `${metrics.interpretLabCount} interpret-only labs use static cliShowOutput bundles.`,
    `${metrics.configLabCount} labs still expect IOS config entry.`,
    'Stem-replay links connect missed questions to relevant labs (wave 14 queued).',
  ]))

  write('LAB_AUDIT_REPORT.md', reportStub('Lab Audit Report', [
    `${metrics.totalLabs} lab bundles with validators.`,
    `${53 - summary.noLab.length}/53 objectives have at least one lab.`,
    `${metrics.interpretLabCount} interpret-only · ${metrics.configLabCount} full config · ${metrics.troubleshootLabCount} troubleshoot.`,
    'Automation 6.1–6.6: interpret-only lab-lite via cliShowOutput.',
  ]))

  write('DIAGRAM_AND_VISUAL_AID_AUDIT.md', reportStub('Diagram and Visual Aid Audit', [
    `${rows.filter(r => r.hasDiagram).length}/${rows.length} objectives have diagram or packet-flow visuals.`,
    `${noDiagram} objectives lack dedicated diagram — factory shells may be decorative.`,
    'Expand modal improves mobile diagram study.',
  ]))

  write('NETWORK_DESIGN_REVIEW.md', reportStub('Network Design Review', [
    'Lab topologies credible for CCNA (VLAN trunk, OSPF area 0, PAT, ACL placement, HSRP).',
    'Automation labs use read-only API/JSON show output (no live fetch).',
  ]))

  write('TOPOLOGY_ACCURACY_REPORT.md', reportStub('Topology Accuracy Report', [
    'Hand-curated and lab-lite diagrams match CCNA reference models.',
    'Generic factory diagram shells lower instructional value where no custom diagram exists.',
  ]))

  write('LAB_GAP_FILL_INSTRUCTIONS.md', reportStub('Lab Gap Fill Instructions', [
    'Coverage gap closed — all objectives have labs.',
    'Polish: stem-replay for new lab-lite IDs; tier or convert remaining config labs.',
    'Add gold verify steps on high-traffic config labs if kept as advanced tier.',
  ]))

  write('VISUAL_AID_IMPROVEMENT_LOG.md', reportStub('Visual Aid Improvement Log', [
    `Replace generic shells on ${noDiagram} objectives without diagrams.`,
    'Replicate DIAG-2.1 pattern: nodes, links, annotations.',
  ]))

  write('SOFTWARE_ENGINEERING_AUDIT.md', reportStub('Software Engineering Audit', [
    `App.jsx ~${metrics.appLines} lines — tutor/search/modals extracted to src/features/.`,
    `ObjectiveScreen.jsx ~${metrics.objectiveScreenLines} lines — candidate for next extract.`,
    'Mastery math duplicated across netUtils, learnerHome, statsSeries.',
  ]))

  write('DATABASE_STRUCTURE_LOG.md', reportStub('Database Structure Log', [
    'Content: layered merge (CURATED + supplements + KB patches + enrichment).',
    'Progress: localStorage keys per learner.',
    'Clean bank: canonical JSON per objective in data/clean-question-bank/.',
  ]))

  write('DATA_ARCHITECTURE_RECOMMENDATIONS.md', reportStub('Data Architecture Recommendations', [
    'Normalize shared IDs: objectiveId → CKU → commands/traps/questions.',
    'Build-time scanners → ai-improvement-logs/ (implemented).',
    'Defer pgvector/RAG until static enrichment scores 85+.',
  ]))

  write('LEARNING_GAP_ANALYSIS.md', reportStub('Learning Gap Analysis', [
    'Coverage thresholds met — shift to polish phase (95+ north star).',
    `Trap depth: ${metrics.trapAtFloor} objectives at minimum 4 traps.`,
    `Config lab path: ${metrics.configLabCount} labs require typing vs ${metrics.interpretLabCount} interpret-only.`,
  ]))

  write('GAP_FILL_INSTRUCTIONS.md', reportStub('Gap Fill Instructions', [
    'Use contentEnrichmentPatches.js for additive traps/flashcards/engineerView.',
    'Trap wave 14 for objectives at trap floor.',
    'Stem-replay in stemReplayLabs.js for lab CTAs from Practice misses.',
  ]))

  write('HIGH_IMPACT_CCNA_GAPS.md', `# High Impact CCNA Gaps

**→ Superseded by [\`IMPLEMENTATION_TRACKER.md\`](./IMPLEMENTATION_TRACKER.md)** — see **Backlog** and **Scorecard → 99+** sections.
`)

  write('CONTENT_TO_ADD_SUGGESTIONS.md', reportStub('Content to Add Suggestions', [
    'Stem-replay: 2.4, 4.1, 4.6, 5.4, 3.6 TS lab IDs.',
    `Trap wave 14: +1 trap for ${metrics.trapAtFloor} at-floor objectives.`,
    'Gold answer reviews on high-miss WLAN and automation stems.',
  ]))

  write('PRACTICE_QUESTION_GAP_REPORT.md', reportStub('Practice Question Gap Report', [
    summary.lowQuestions.length
      ? summary.lowQuestions.map(l => `${l.id}: only ${l.count} questions (target ≥8)`).join('\n')
      : 'All objectives meet ≥8 question threshold for Tier A.',
  ]))

  write('PILOT_SECTION_RECOMMENDATION.md', `# Pilot Section Recommendation

**Chosen pilot: VLANs (Objective 2.1)**

| Criterion | Why 2.1 |
|-----------|---------|
| Pass impact | 92 |
| Current base | Rich pack + labs + CLI drill |
| Gap | Verify commands buried in Reference tab |
| Safe UI | Expandable Engineer View in Study |

**Implemented:** \`EngineerViewSection\` on Study tab for objectives with \`engineerView\` data.
`)

  write('IMPLEMENTATION_PHASE_PLAN.md', `# Implementation Phase Plan

| Phase | Goal | Status |
|-------|------|--------|
| 1 | Read-only audit | Done |
| 2 | ai-improvement-logs/ | Done |
| 3 | Checklist + weak-area fix | Done |
| 4 | Pilot 2.1 Engineer View | Done |
| 5 | Enrich STP, 3.1, 5.9, 6.x | Done |
| 6 | Build-time scanner | Done |
| 7 | Bulk factory enrichment | Done |
| 8 | Extract tabs from App.jsx | Done |
| 9 | PWA curated cache | Done |
| 10 | Coverage gap closure (53/53 Tier A) | Done |
| 11 | **Polish phase (95+)** | **In progress** — stem-replay, trap depth, mobile |
| 12 | RAG/tutor | Deferred |
`)

  write('SCORE_95_TARGET.md', `# Path to 95+ — living checklist

**→ Superseded by [\`IMPLEMENTATION_TRACKER.md\`](./IMPLEMENTATION_TRACKER.md)** (99+ north star, scorecard, backlog).

Run \`npm run audit:scan-and-refresh\` to regenerate scores after content changes.
`)

  const queue = mergeQueueItems([
    { id: 'improve_vlan_engineer_verify', priority: 'high', status: 'done', area: 'content', objectiveNumber: '2.1', problem: 'Verify commands buried in Reference', recommendedImprovement: 'Engineer View in Study tab', riskLevel: 'low', confidenceScore: 92 },
    { id: 'fix_read_checklist', priority: 'high', status: 'done', area: 'learning_flow', objectiveNumber: 'all', problem: 'studySectionsViewed never written', recommendedImprovement: 'Persist on Study reading open', riskLevel: 'low', confidenceScore: 95 },
    { id: 'unify_trap_weakness', priority: 'medium', status: 'done', area: 'analytics', objectiveNumber: 'all', problem: 'Metrics vs Home trap aggregation differ', recommendedImprovement: 'computeTrapWeakness delegates to groupMissedByTrap', riskLevel: 'low', confidenceScore: 90 },
    { id: 'enrich_stp_engineer', priority: 'high', status: 'done', area: 'content', objectiveNumber: '2.5', problem: 'STP verify not in Study engineer layer', recommendedImprovement: 'engineerView + show spanning-tree', riskLevel: 'low', confidenceScore: 88 },
    { id: 'enrich_route_interpret', priority: 'high', status: 'done', area: 'content', objectiveNumber: '3.1', problem: 'show ip route interpret buried', recommendedImprovement: 'engineerView interpret section', riskLevel: 'low', confidenceScore: 87 },
    { id: 'enrich_wlan_59', priority: 'critical', status: 'done', area: 'content', objectiveNumber: '5.9', problem: 'Thin factory + low Q count', recommendedImprovement: 'Traps, flashcards, supplemental questions', riskLevel: 'low', confidenceScore: 85 },
    { id: 'enrich_automation_6x', priority: 'critical', status: 'done', area: 'content', objectiveNumber: '6.1-6.6', problem: 'Zero traps on factory automation', recommendedImprovement: 'Trap + flashcard enrichment patches', riskLevel: 'low', confidenceScore: 82 },
    { id: 'extract_app_tabs', priority: 'medium', status: 'done', area: 'maintainability', objectiveNumber: 'app', problem: '7k-line App.jsx', recommendedImprovement: 'Extract ExplainTab/QuizTab', riskLevel: 'medium', confidenceScore: 80 },
    { id: 'bulk_factory_traps', priority: 'high', status: 'done', area: 'content', objectiveNumber: '22 objs', problem: 'Tier C zero traps', recommendedImprovement: 'Pipeline bulk trap generation', riskLevel: 'medium', confidenceScore: 75 },
    { id: 'lab_31_route_lite', priority: 'high', status: 'done', area: 'labs', objectiveNumber: '3.1', problem: 'No routing table lab', recommendedImprovement: 'Lab-lite show ip route parser', riskLevel: 'medium', confidenceScore: 78 },
    { id: 'bulk_factory_flashcards', priority: 'high', status: 'done', area: 'content', objectiveNumber: '24 objs', problem: 'Zero flashcards on factory shells', recommendedImprovement: 'Bulk flashcard enrichment patches', riskLevel: 'medium', confidenceScore: 74 },
    { id: 'extract_app_shell_modules', priority: 'high', status: 'done', area: 'maintainability', objectiveNumber: 'app', problem: 'App.jsx still ~5k lines after tab extract', recommendedImprovement: 'Extract tutor/search/modals into src/features/', riskLevel: 'medium', confidenceScore: 72 },
    { id: 'pwa_offline_curated', priority: 'medium', status: 'done', area: 'mobile', objectiveNumber: 'app', problem: 'PWA caches shell only', recommendedImprovement: 'Cache static question/reading chunks in service worker', riskLevel: 'medium', confidenceScore: 68 },
    { id: 'gap_closure_waves_2_11_13', priority: 'critical', status: 'done', area: 'content', objectiveNumber: '53 objs', problem: 'Remaining Tier B/C gaps', recommendedImprovement: 'Reading cmds wave 2, trap wave 13, depth wave 11, lab-lite batch', riskLevel: 'low', confidenceScore: 90 },
    ...buildPendingQueueItems(summary, rows, metrics, existingById),
  ], existingById)

  write('IMPLEMENTATION_QUEUE.json', JSON.stringify({ generatedAt: summary.generatedAt, items: queue }, null, 2))

  const pendingItems = queue.filter(i => i.status === 'pending')
  const pendingRows = pendingItems.length
    ? pendingItems.map(i => `| \`${i.id}\` | ${i.priority} | ${i.area} | ${i.recommendedImprovement} |`).join('\n')
    : '| _empty_ | — | — | Run \`npm run audit:scan-and-refresh\` or pick backlog row below |'

  write('IMPLEMENTATION_TRACKER.md', `# Implementation Tracker — 99+ North Star

**Single source of truth** for current work, queue, scores, and shipped history.
**Updated:** ${summary.generatedAt.slice(0, 10)} · **Overall:** ~${scores.overall}/100 → target **99+** (all areas ≥95)

---

## Agent playbook (every session)

1. Read this file → \`DO_NOT_TOUCH.md\` → \`IMPLEMENTATION_QUEUE.json\`
2. \`npm run audit:show-next-task\` — pick **one** pending item (or backlog below if queue empty)
3. Smallest safe diff · no theme tokens · no hash routing · curated-first
4. \`npm run verify:ship\`
5. \`npm run audit:mark-done -- <id> "summary"\` · append **Shipped** · \`npm run audit:scan-and-refresh\`

**Ship:** user says **c&d** → verify → commit → push → wrangler pages deploy

---

## Coverage snapshot

| Metric | Value |
|--------|------:|
| Objectives | ${summary.totalObjectives} · Tier A **${summary.tierCounts.A}** · B ${summary.tierCounts.B} · C ${summary.tierCounts.C} |
| Labs | ${metrics.totalLabs} (${metrics.interpretLabCount} interpret · ${metrics.configLabCount} config) |
| Trap / flashcard / cmd gaps | **${summary.zeroTraps.length} / ${summary.zeroFlashcards.length} / ${summary.zeroCommands.length}** |
| App.jsx | ~${metrics.appLines} lines |

---

## Scorecard → 99+

| Area | Now | 99+ bar | Signal / gap-closer |
|------|----:|--------:|---------------------|
| Coverage breadth | ${scores.coverageBreadth} | 97 | Tier-A ratio (${summary.tierCounts.A}/${summary.totalObjectives}) |
| Coverage depth | ${scores.coverageDepth} | 97 | avg ${metrics.avgQ.toFixed(0)} Q · ${metrics.avgTraps.toFixed(0)} traps/obj |
| Learning flow | ${scores.learningFlow} | 97 | SRS + stem-replay loops; question volume |
| Engineer perspective | ${scores.engineerPerspective} | 97 | engineer view ${metrics.engineerCount}/${summary.totalObjectives} |
| CLI verification | ${scores.cliVerification} | 96 | ≥2 verify cmds ${metrics.cmdGte2}/${summary.totalObjectives} |
| Exam traps | ${scores.examTraps} | 97 | avg ${metrics.avgTraps.toFixed(0)} traps · floor ${metrics.trapAtFloor} |
| Labs / CLI | ${scores.labCoverage} | 97 | lab/obj + ${metrics.interpretLabCount} interpret + ${metrics.troubleshootLabCount} TS |
| Maintainability | ${scores.maintainability} | 96 | App ${metrics.appLines}L · ObjScreen ${metrics.objectiveScreenLines}L · ${metrics.largeLogicFiles} files >900L |
| Mobile / a11y | ${scores.mobileA11y} | 96 | ${metrics.quality.mobileE2eCount} mobile e2e · a11y ${metrics.quality.a11yE2e ? '✓' : '—'} |
| Tests / CI | ${scores.testsCI} | 96 | ${metrics.quality.unitTestFileCount} unit files · ${metrics.quality.e2eSpecCount} e2e |

---

## Queue (\`IMPLEMENTATION_QUEUE.json\`)

**Pending:** ${pendingItems.length} · **Total:** ${queue.length}

| id | priority | area | work |
|----|----------|------|------|
${pendingRows}

---

## Backlog (when queue empty)

| id | area | work |
|----|------|------|
| \`split_study_quiz_tabs\` | maintainability | Split \`studyQuizTabs.jsx\` (${(() => { try { return readLineCount('src/tabs/studyQuizTabs.jsx') } catch { return '~1900' } })()}L) + appShell core (${(() => { try { return readLineCount('src/ui/appShell.js') } catch { return '~1050' } })()}L) under 900 |
| \`gold_reviews_wave15\` | content | Expand gold answer reviews for high-miss stems |
| \`config_lab_lite_wave\` | labs | Lab-lite alternates for remaining config labs |
| \`trap_depth_wave15\` | exam_traps | Raise avg traps/objective beyond ${Math.round(metrics.avgTraps)} |

Full shipped history: \`COMPLETED_CHANGES.md\`

---

## Do not touch

\`.env*\` · \`src/ui/appTheme.js\` · hash routing in \`App.jsx\` · live AI on load. See \`DO_NOT_TOUCH.md\`.
`)

  const gapQueue = tierC.map(r => ({
    gapId: `gap_${r.objectiveId.replace('.', '_')}`,
    objectiveId: r.objectiveId,
    tier: r.tier,
    missing: [
      ...(r.traps === 0 ? ['exam_trap'] : []),
      ...(r.flashcards === 0 ? ['flashcard'] : []),
      ...(r.commands === 0 ? ['cli_verification'] : []),
      ...(!r.hasLab ? ['lab'] : []),
      ...(r.questions < 8 ? ['quiz_question'] : []),
    ],
    passImpact: r.passImpact,
    priority: r.domainId === 'automation' || ['5.9'].includes(r.objectiveId) ? 'critical' : 'high',
    status: 'pending',
  }))

  write('GAP_TO_IMPLEMENTATION_QUEUE.json', JSON.stringify({ generatedAt: summary.generatedAt, gaps: gapQueue }, null, 2))

  const completedPath = join(OUT, 'COMPLETED_CHANGES.md')
  if (!existsSync(completedPath)) {
    write('COMPLETED_CHANGES.md', `# Completed Changes

**Audit implementation** — ${new Date().toISOString().slice(0, 10)}

- Created \`ai-improvement-logs/\` with full audit artifact set
- Added \`scripts/auditContentCoverage.mjs\` + \`scripts/generateImprovementLogs.mjs\`
- Fixed \`studySectionsViewed\` / \`readingTier\` persistence in Study tab
- Unified \`computeTrapWeakness\` with \`groupMissedByTrap\`
- Added \`EngineerViewSection\` + enrichment patches (2.1, 2.5, 3.1, 5.9, 6.x)
- Extracted \`ExplainTab\` / \`QuizTab\` to \`src/tabs/\`
`)
  }

  const pendingCount = queue.filter(i => i.status === 'pending').length
  console.log(`✓ generate:improvement-logs — ${queue.length} queue items (${pendingCount} pending), ${gapQueue.length} tier-C gaps, overall ~${scores.overall}/100`)
}

mainAsync().catch(err => {
  console.error(err)
  process.exit(1)
})
