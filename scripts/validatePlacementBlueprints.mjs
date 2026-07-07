#!/usr/bin/env node
/** CI gate — every placement blueprint must sample all domain objectives. */
import { validateAllPlacementBlueprintCoverage } from '../src/features/domainPlacement/placementBlueprintCoverage.js'

const failures = validateAllPlacementBlueprintCoverage()
if (failures.length) {
  console.error('✗ validate:placement-blueprints failed:')
  for (const f of failures) {
    console.error(`  ${f.domainId}: ${f.errors.join('; ')}`)
  }
  process.exit(1)
}
console.log('✓ validate:placement-blueprints OK — all domains full subsection coverage')
