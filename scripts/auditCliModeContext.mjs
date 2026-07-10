#!/usr/bin/env node
/**
 * Fail if any COMMAND_DRILLS entry lacks explicit CLI mode context.
 */
import { COMMAND_DRILLS } from '../src/lab/commandDrills.js'
import { CLI_MODE_IDS, hasExplicitCliModeContext } from '../src/lab/cliModeContext.js'
import { CLI_SKILL_QUESTIONS } from '../src/data/cliSkillQuestions.js'
import { buildDrillQuizItems } from '../src/commands/commandDrillQuiz.js'

const missing = []
let total = 0
for (const [oid, drills] of Object.entries(COMMAND_DRILLS)) {
  drills.forEach((d, i) => {
    total += 1
    if (!hasExplicitCliModeContext(d)) {
      missing.push(`${oid}[${i}] ${d.prompt?.slice(0, 60)}`)
    } else if (!CLI_MODE_IDS.has(d.cliMode)) {
      missing.push(`${oid}[${i}] invalid mode ${d.cliMode}`)
    }
  })
}

const skillMissing = []
for (const [oid, list] of Object.entries(CLI_SKILL_QUESTIONS)) {
  for (const q of list) {
    if (!hasExplicitCliModeContext(q)) skillMissing.push(`${oid} ${q.id}`)
  }
}

const drillItems = buildDrillQuizItems()
const drillMissing = drillItems.filter(q => !q.cliPrompt || !q.cliMode)

console.log(`✓ CLI mode context — ${total} drills annotated`)
if (missing.length || skillMissing.length || drillMissing.length) {
  if (missing.length) {
    console.error('COMMAND_DRILLS missing mode context:')
    missing.forEach(m => console.error('  -', m))
  }
  if (skillMissing.length) {
    console.error('CLI_SKILL_QUESTIONS missing mode context:', skillMissing.length)
  }
  if (drillMissing.length) {
    console.error('buildDrillQuizItems missing mode context:', drillMissing.length)
  }
  process.exitCode = 1
} else {
  console.log(`  skill CLI questions: ${Object.values(CLI_SKILL_QUESTIONS).flat().length}`)
  console.log(`  command-hub drill items: ${drillItems.length}`)
}
