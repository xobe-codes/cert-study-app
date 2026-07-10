#!/usr/bin/env node
/**
 * Fail if any CCNA objective lacks a full curated visual pack
 * (diagram + compare + trap callouts + process flow).
 */
import { getAllDomainVisualCoverage, getDomain6VisualCoverage, ALL_VISUAL_OBJECTIVES } from '../src/data/visualDiagramSupplement.js'
import { getCurated } from '../src/data/ccnaCurated.js'

const coverage = getAllDomainVisualCoverage()
if (!coverage.ok) {
  console.error('✗ Domain visual packs incomplete:')
  for (const m of coverage.missing) {
    console.error(`  ${m.id}: missing ${m.gaps.join(', ')}`)
  }
  process.exit(1)
}

const d6 = getDomain6VisualCoverage()
if (!d6.ok) {
  console.error('✗ Domain 6 regression:')
  d6.missing.forEach(m => console.error(`  ${m.id}: ${m.gaps.join(', ')}`))
  process.exit(1)
}

const runtimeGaps = []
for (const id of ALL_VISUAL_OBJECTIVES) {
  const c = getCurated(id)
  if (!c?.diagram?.nodes?.length) runtimeGaps.push(`${id}: no diagram on getCurated`)
  if (!c?.visualCompare) runtimeGaps.push(`${id}: no visualCompare on getCurated`)
  if (!c?.visualTraps?.length) runtimeGaps.push(`${id}: no visualTraps on getCurated`)
  if (!c?.packetFlow?.steps?.length) runtimeGaps.push(`${id}: no packetFlow on getCurated`)
}

if (runtimeGaps.length) {
  console.error('✗ getCurated visual merge gaps:')
  runtimeGaps.slice(0, 40).forEach(g => console.error(`  ${g}`))
  if (runtimeGaps.length > 40) console.error(`  … +${runtimeGaps.length - 40} more`)
  process.exit(1)
}

console.log(`✓ Domain visuals — ${coverage.covered}/${coverage.total} objectives with diagram + compare + traps + flow`)
