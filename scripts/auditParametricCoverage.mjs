#!/usr/bin/env node
/**
 * Parametric coverage matrix — objectives × families × CKUs.
 * Writes ai-improvement-logs/PARAMETRIC_COVERAGE_MATRIX.json (+ .md summary).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ALL_OBJECTIVES } from '../src/data/ccnaDomains.js'
import { CLEAN_BANK_COUNTS } from '../src/data/ccnaCleanBankMeta.js'
import { getCuratedQuestions } from '../src/data/ccnaCurated.js'
import { ALL_PARAMETRIC_FAMILIES, FACTORY_PARAMETRIC_WAVE1_QUESTIONS } from '../src/data/factoryParametricWave1Questions.js'
import { countExpandedQuestions } from '../src/data/parametric/parametricEngine.js'
import { countObjectiveQuestions } from '../src/data/questionBankCount.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'ai-improvement-logs')

function buildMatrix() {
  const familyByObj = {}
  for (const f of ALL_PARAMETRIC_FAMILIES) {
    ;(familyByObj[f.objectiveId] ||= []).push({
      id: f.id,
      kind: f.kind || (f.parameters ? 'parametric' : 'clone'),
      concept: f.concept,
      ckuIds: f.ckuIds || [],
      variants: (f.parameters || f.clones || []).length,
    })
  }

  const ckuFromParam = new Map()
  for (const list of Object.values(FACTORY_PARAMETRIC_WAVE1_QUESTIONS)) {
    for (const q of list) {
      for (const c of q.ckuIds || []) {
        ckuFromParam.set(c, (ckuFromParam.get(c) || 0) + 1)
      }
    }
  }

  const objectives = ALL_OBJECTIVES.map(o => {
    const paramQs = FACTORY_PARAMETRIC_WAVE1_QUESTIONS[o.id] || []
    const bankN = countObjectiveQuestions(o.id)
    const cleanN = CLEAN_BANK_COUNTS[o.id] || 0
    const curated = getCuratedQuestions(o.id) || []
    const bankCkus = new Set(curated.flatMap(q => q.ckuIds || []))
    const paramCkus = new Set(paramQs.flatMap(q => q.ckuIds || []))
    const families = familyByObj[o.id] || []
    return {
      objectiveId: o.id,
      title: o.title,
      cleanQuestions: cleanN,
      bankQuestions: bankN,
      parametricQuestions: paramQs.length,
      families: families.length,
      familyIds: families.map(f => f.id),
      thin: cleanN > 0 && cleanN <= 12,
      hasParametric: paramQs.length > 0,
      bankCkuCount: bankCkus.size,
      parametricCkuCount: paramCkus.size,
      parametricCkus: [...paramCkus].sort(),
    }
  })

  const thinMissing = objectives.filter(r => r.thin && !r.hasParametric)
  const zeroParam = objectives.filter(r => !r.hasParametric)

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      families: ALL_PARAMETRIC_FAMILIES.length,
      parametricQuestions: countExpandedQuestions(FACTORY_PARAMETRIC_WAVE1_QUESTIONS),
      objectivesWithParametric: objectives.filter(r => r.hasParametric).length,
      objectivesTotal: objectives.length,
      thinObjectives: objectives.filter(r => r.thin).length,
      thinMissingParametric: thinMissing.length,
      ckusTouchedByParametric: ckuFromParam.size,
    },
    thinMissingParametric: thinMissing.map(r => r.objectiveId),
    zeroParametricObjectives: zeroParam.map(r => r.objectiveId),
    ckuParametricCounts: Object.fromEntries([...ckuFromParam.entries()].sort((a, b) => b[1] - a[1])),
    objectives,
    families: ALL_PARAMETRIC_FAMILIES.map(f => ({
      id: f.id,
      objectiveId: f.objectiveId,
      kind: f.kind || (f.parameters ? 'parametric' : 'clone'),
      concept: f.concept,
      ckuIds: f.ckuIds || [],
      variants: (f.parameters || f.clones || []).length,
    })),
  }
}

function toMarkdown(matrix) {
  const lines = [
    '# Parametric coverage matrix',
    '',
    `Generated: ${matrix.generatedAt}`,
    '',
    '## Totals',
    '',
    `| Metric | Value |`,
    `| --- | ---: |`,
    `| Families | ${matrix.totals.families} |`,
    `| Parametric questions | ${matrix.totals.parametricQuestions} |`,
    `| Objectives with parametric | ${matrix.totals.objectivesWithParametric} / ${matrix.totals.objectivesTotal} |`,
    `| Thin objectives (≤12 clean) | ${matrix.totals.thinObjectives} |`,
    `| Thin still missing parametric | ${matrix.totals.thinMissingParametric} |`,
    `| CKUs touched | ${matrix.totals.ckusTouchedByParametric} |`,
    '',
    '## Thin objectives missing parametric',
    '',
  ]
  if (!matrix.thinMissingParametric.length) {
    lines.push('_None — all thin objectives have at least one parametric/clone family._', '')
  } else {
    lines.push(matrix.thinMissingParametric.map(id => `- ${id}`).join('\n'), '')
  }
  lines.push('## Per-objective snapshot', '', '| Obj | Clean | Bank | Param | Families | Thin |', '| --- | ---: | ---: | ---: | ---: | --- |')
  for (const r of matrix.objectives) {
    lines.push(`| ${r.objectiveId} | ${r.cleanQuestions} | ${r.bankQuestions} | ${r.parametricQuestions} | ${r.families} | ${r.thin ? 'yes' : ''} |`)
  }
  lines.push('')
  return lines.join('\n')
}

const matrix = buildMatrix()
mkdirSync(OUT_DIR, { recursive: true })
const jsonPath = join(OUT_DIR, 'PARAMETRIC_COVERAGE_MATRIX.json')
const mdPath = join(OUT_DIR, 'PARAMETRIC_COVERAGE_MATRIX.md')
writeFileSync(jsonPath, JSON.stringify(matrix, null, 2))
writeFileSync(mdPath, toMarkdown(matrix))

console.log(`✓ Parametric coverage matrix — ${matrix.totals.parametricQuestions} Qs · ${matrix.totals.families} families · thin missing ${matrix.totals.thinMissingParametric}`)
console.log(`  ${jsonPath}`)
console.log(`  ${mdPath}`)

if (matrix.totals.thinMissingParametric > 0) {
  console.error('Thin objectives still missing parametric:', matrix.thinMissingParametric.join(', '))
  process.exitCode = 1
}

export { buildMatrix }
