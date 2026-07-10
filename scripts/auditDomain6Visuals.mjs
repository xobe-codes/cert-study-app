#!/usr/bin/env node
/**
 * Fail if any Domain 6 objective lacks a full curated visual pack
 * (diagram + compare + trap callouts + process flow).
 */
import { getDomain6VisualCoverage, DOMAIN6_VISUAL_OBJECTIVES } from '../src/data/visualDiagramSupplement.js'
import { getCurated } from '../src/data/ccnaCurated.js'

const coverage = getDomain6VisualCoverage()
if (!coverage.ok) {
  console.error('✗ Domain 6 visual pack incomplete:')
  for (const m of coverage.missing) {
    console.error(`  ${m.id}: missing ${m.gaps.join(', ')}`)
  }
  process.exit(1)
}

const runtimeGaps = []
for (const id of DOMAIN6_VISUAL_OBJECTIVES) {
  const c = getCurated(id)
  if (!c?.diagram?.nodes?.length) runtimeGaps.push(`${id}: no diagram on getCurated`)
  if (!c?.visualCompare) runtimeGaps.push(`${id}: no visualCompare on getCurated`)
  if (!c?.visualTraps?.length) runtimeGaps.push(`${id}: no visualTraps on getCurated`)
  if (!c?.packetFlow?.steps?.length) runtimeGaps.push(`${id}: no packetFlow on getCurated`)
}

if (runtimeGaps.length) {
  console.error('✗ Domain 6 getCurated merge gaps:')
  runtimeGaps.forEach(g => console.error(`  ${g}`))
  process.exit(1)
}

console.log(`✓ Domain 6 visuals — ${coverage.covered}/${coverage.total} objectives with diagram + compare + traps + flow`)
