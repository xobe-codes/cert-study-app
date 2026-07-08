/** CLI type-in skill questions — sourced from COMMAND_DRILLS with shorthand-aware grading. */
import { COMMAND_DRILLS } from '../lab/commandDrills.js'

function slug(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24)
}

function drillToCliQuestion(objectiveId, drill, index) {
  const answers = Array.isArray(drill.answer) ? drill.answer : [drill.answer]
  return {
    id: `${objectiveId}-cli-${index}-${slug(drill.prompt)}`,
    type: 'cli',
    skill: 'implement',
    difficulty: 'medium',
    concept: 'IOS syntax recall',
    question: drill.prompt,
    answers,
    hint: drill.hint,
    explanation: drill.hint || `Accepted forms include ${answers[0]}.`,
  }
}

/** One CLI recall question per objective that has command drills. */
export function buildCliSkillQuestions() {
  const out = {}
  for (const [objectiveId, drills] of Object.entries(COMMAND_DRILLS)) {
    if (!drills?.length) continue
    out[objectiveId] = [drillToCliQuestion(objectiveId, drills[0], 0)]
  }
  return out
}

export const CLI_SKILL_QUESTIONS = buildCliSkillQuestions()
