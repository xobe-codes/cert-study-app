#!/usr/bin/env node
/**
 * Generates ai-improvement-logs/ audit artifacts from coverage-data.json.
 * Run after auditContentCoverage.mjs (or runs audit inline).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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
    files: ['src/data/contentEnrichmentPatches.js', 'src/data/factoryTrapPatches.js'],
    acceptance: [
      'Flashcard patches for Tier C factory objectives with zero flashcards',
      'validate:pipeline passes',
    ],
  },
}

const QUEUE_EXTRA_KEYS = ['acceptance', 'effort', 'scoreImpact', 'files']

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
  mkdirSync(OUT, { recursive: true })
  ensureCoverage()
  const { summary, rows } = JSON.parse(readFileSync(COVERAGE_PATH, 'utf8'))
  const tierC = rows.filter(r => r.tier === 'C')
  const urgent = rows.filter(r => r.traps === 0 || r.questions < 8).slice(0, 15)

  write('APP_AUDIT_SUMMARY.md', `# App Audit Summary

**Generated:** ${summary.generatedAt}  
**Overall learning quality:** ~74/100

## Strengths
- 53/53 objectives have reading + clean-bank questions (${rows.reduce((s, r) => s + r.questions, 0)} total Q)
- Tier A exam-ready packs: ${summary.tierCounts.A} objectives
- Gold answer-review pipeline, SRS, trap-grouped missed review
- 37 CLI labs with validators; Study/Practice tab consolidation

## Critical gaps
- ${summary.zeroTraps.length} objectives with **zero** exam traps
- ${summary.zeroFlashcards.length} objectives with zero flashcards
- ${summary.noLab.length} objectives with no lab
- Automation domain (6.1–6.6): thin factory shells, 0 labs
- \`studySectionsViewed\` checklist bug (fixed in Phase 3)
- App.jsx god-file (~7k lines) — extraction in progress

## Coverage tiers
| Tier | Count | Pass risk |
|------|------:|-----------|
| A | ${summary.tierCounts.A} | Low |
| B | ${summary.tierCounts.B} | Medium |
| C | ${summary.tierCounts.C} | **High** |

See \`CCNA_OBJECTIVE_COVERAGE_MATRIX.md\` for per-objective detail.
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

  if (!existsSync(join(OUT, 'AGENT_NEXT_STEPS.md'))) {
    write('AGENT_NEXT_STEPS.md', `# Agent Next Steps

1. Read \`APP_AUDIT_SUMMARY.md\` → \`DO_NOT_TOUCH.md\` → \`IMPLEMENTATION_QUEUE.json\`
2. Pick **one** pending queue item (\`npm run audit:show-next-task\`)
3. Smallest safe diff; no theme/route changes; no live AI on load
4. Run \`npm run audit:test-and-build\`
5. Update \`COMPLETED_CHANGES.md\` and mark queue item \`done\`

See \`AUDIT_SHORTCUTS.md\` for per-phase npm commands.
`)
  }

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
| Labs | \`ccnaLabs*.js\` | ${53 - summary.noLab.length} objs with labs |

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
${urgent.map(r => `- **${r.objectiveId}** — ${r.title} (tier ${r.tier}, ${r.questions} Q, ${r.traps} traps)`).join('\n')}

## Automation domain (all tier C, 0 labs)
${summary.automation.map(r => `- ${r.objectiveId}: ${r.traps} traps, ${r.questions} Q`).join('\n')}

## WLAN risk zone
${summary.wlanThin.map(r => `- ${r.objectiveId}: ${r.questions} Q, ${r.traps} traps`).join('\n')}
`)

  write('APP_SCORECARD.md', `# App Scorecard

| Area | Score | Status |
|------|------:|--------|
| Coverage breadth | 92 | OK |
| Coverage depth | 68 | Urgent |
| Learning flow | 76 | Watch |
| Engineer perspective | 68 | Urgent |
| CLI verification | 62 | Urgent |
| Exam traps | 70 | Watch |
| Lab coverage | 58 | Critical |
| Maintainability | 58 | Critical |
| **Overall** | **74** | |

Tier breakdown: A=${summary.tierCounts.A}, B=${summary.tierCounts.B}, C=${summary.tierCounts.C}.
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
    'PWA caches shell only — curated packs need explicit offline packaging.',
    'Study/Practice tabs reduce tab sprawl (post-UX phases).',
    'Diagram expand modal improves mobile diagram readability.',
  ]))

  write('NETWORK_ENGINEER_LANGUAGE_REPORT.md', reportStub('Network Engineer Language Report', [
    'Rich objectives (OBJ_21 pattern) include verify commands and trap wording.',
    'Factory objectives answer "what is it?" not "what breaks / how to verify".',
    'Engineer View pilot on 2.1 sets pattern for verify + symptom callouts.',
  ]))

  write('TROUBLESHOOTING_GAP_REPORT.md', reportStub('Troubleshooting Gap Report', [
    'Labs include troubleshooting scenarios; readings often lack failure symptoms.',
    '3.1 routing table interpret has no lab-lite.',
    'STP verify (`show spanning-tree`) in reading but no CLI drill.',
  ]))

  write('CLI_VERIFICATION_GAP_REPORT.md', reportStub('CLI Verification Gap Report', [
    '15 objectives have CLI drills; 31 lack surfaced verify commands in Study UI.',
    'command-bank.json has commands not wired for thin objectives.',
    'Engineer View surfaces `show vlan brief`, `show spanning-tree`, `show ip route` on enriched objectives.',
  ]))

  write('EXAM_TRAP_COVERAGE_REPORT.md', reportStub('Exam Trap Coverage Report', [
    `${summary.zeroTraps.length} objectives with zero examTraps in curated merge.`,
    'Blueprint verbs under-tested on factory objs: interpret, compare, describe, by default.',
    'Enrichment patches add traps for 5.9 and 6.1–6.6.',
  ]))

  write('COMMAND_DRILL_COVERAGE_REPORT.md', reportStub('Command Drill Coverage Report', [
    'COMMAND_DRILLS in App.jsx covers 14 config-heavy objectives.',
    'No drill for 2.5 STP verify or 3.1 route interpret.',
    'Recommend lab-lite or drill steps for high-frequency verify commands.',
  ]))

  write('LAB_AUDIT_REPORT.md', reportStub('Lab Audit Report', [
    '37 lab bundles — strong scenarios and validators where present.',
    '0 labs for objectives 6.1–6.6 (automation).',
    '0 labs for 3.1 routing table interpret.',
  ]))

  write('DIAGRAM_AND_VISUAL_AID_AUDIT.md', reportStub('Diagram and Visual Aid Audit', [
    '20 rich visual supplements; 33 generic factory shell diagrams.',
    'Expand modal improves mobile diagram study.',
    'Generic shells are decorative — low instructional value.',
  ]))

  write('NETWORK_DESIGN_REVIEW.md', reportStub('Network Design Review', [
    'Lab topologies credible for CCNA (VLAN trunk, OSPF area 0, PAT, ACL placement).',
    'No automation topology labs yet.',
  ]))

  write('TOPOLOGY_ACCURACY_REPORT.md', reportStub('Topology Accuracy Report', [
    'Hand-curated diagrams match CCNA reference models.',
    'Factory diagram shells use generic placeholders — accuracy ~60%.',
  ]))

  write('LAB_GAP_FILL_INSTRUCTIONS.md', reportStub('Lab Gap Fill Instructions', [
    'Add lab-lite for 3.1: parse `show ip route` output, identify next-hop and AD.',
    'Add STP verify drill: `show spanning-tree`, identify root port and blocking port.',
    'Add automation REST/JSON read-only lab (no live API) for 6.5/6.6.',
  ]))

  write('VISUAL_AID_IMPROVEMENT_LOG.md', reportStub('Visual Aid Improvement Log', [
    'Prioritize replacing factory shells for 5.9, 6.x with instructional diagrams.',
    'Replicate DIAG-2.1 pattern: nodes, links, annotations.',
  ]))

  write('SOFTWARE_ENGINEERING_AUDIT.md', reportStub('Software Engineering Audit', [
    'App.jsx was ~7k lines — ExplainTab/QuizTab extracted to src/tabs/.',
    'Mastery math duplicated across netUtils, learnerHome, statsSeries.',
    'BOOK_REF duplicated vs bookRefNotes — consolidate when safe.',
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
    'Depth gap: 31 tier-C factory objectives.',
    'Engineer layer missing on thin objectives.',
    'Automation + WLAN highest pass-risk despite appearing covered.',
  ]))

  write('GAP_FILL_INSTRUCTIONS.md', reportStub('Gap Fill Instructions', [
    'Use contentEnrichmentPatches.js for additive traps/flashcards/engineerView.',
    'Add clean-bank questions via buildCleanBank pipeline for 5.9.',
    'Replicate Engineer View pattern from 2.1 to 2.5, 3.1, 3.4, 5.5.',
  ]))

  write('HIGH_IMPACT_CCNA_GAPS.md', reportStub('High Impact CCNA Gaps', [
    'gap_automation_traps — 6.1–6.6 (Critical)',
    'gap_wlan_59_questions — 5.9 (Critical)',
    'gap_stp_cli_verify — 2.5 (High)',
    'gap_route_interpret_lab — 3.1 (High)',
    'gap_factory_traps_bulk — 21 objs (High)',
    'gap_read_checklist — fixed',
    'gap_weak_area_unify — fixed',
    'gap_appjsx_extract — in progress',
  ]))

  write('CONTENT_TO_ADD_SUGGESTIONS.md', reportStub('Content to Add Suggestions', [
    '2.1: Engineer View with show vlan brief + native VLAN trap (done).',
    '2.5: Engineer View with show spanning-tree interpret (done).',
    '3.1: show ip route line-by-line interpret section (done).',
    '5.9: WPA2-PSK traps + flashcards (done).',
    '6.x: REST/JSON traps + flashcards (done).',
  ]))

  write('PRACTICE_QUESTION_GAP_REPORT.md', reportStub('Practice Question Gap Report', [
    ...summary.lowQuestions.map(l => `${l.id}: only ${l.count} questions (target ≥12)`),
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
| 7 | Bulk factory enrichment | Pending |
| 8 | Extract tabs from App.jsx | Done |
| 9 | PWA curated cache | Pending |
| 10 | RAG/tutor | Deferred |
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
    { id: 'lab_31_route_lite', priority: 'high', status: 'pending', area: 'labs', objectiveNumber: '3.1', problem: 'No routing table lab', recommendedImprovement: 'Lab-lite show ip route parser', riskLevel: 'medium', confidenceScore: 78 },
    { id: 'bulk_factory_flashcards', priority: 'high', status: 'pending', area: 'content', objectiveNumber: '24 objs', problem: 'Zero flashcards on factory shells', recommendedImprovement: 'Bulk flashcard enrichment patches', riskLevel: 'medium', confidenceScore: 74 },
  ], loadExistingQueueStatuses())

  write('IMPLEMENTATION_QUEUE.json', JSON.stringify({ generatedAt: summary.generatedAt, items: queue }, null, 2))

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
    status: ['2.1', '2.5', '3.1', '5.9', '6.1', '6.2', '6.3', '6.4', '6.5', '6.6'].includes(r.objectiveId) ? 'partial' : 'pending',
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

  console.log(`✓ generate:improvement-logs — ${queue.length} queue items, ${gapQueue.length} gaps`)
}

main()
