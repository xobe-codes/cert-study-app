import { logEvent } from '../eventLog.js'

export const LAB_EVENT_SCHEMA_VERSION = 2

export function labMarkers(lab, {
  surface = 'labs',
  questionId,
  ckuId,
  trapId,
  checkpointId,
} = {}) {
  const ckuIds = [...new Set((lab?.ckuIds || []).filter(Boolean))]
  return {
    schemaVersion: LAB_EVENT_SCHEMA_VERSION,
    surface,
    domainId: lab?.domainId,
    objectiveId: lab?.objectiveId,
    labId: lab?.id,
    ckuIds,
    ckuId: ckuId || ckuIds[0],
    questionId,
    trapId,
    checkpointId,
  }
}

export function labTaskProgress(tasks = [], taskCmdDone = {}) {
  const checkpoints = []
  for (const task of tasks || []) {
    const expected = task.expectedCommands || []
    const flags = taskCmdDone[task.id] || []
    expected.forEach((_, commandIndex) => {
      checkpoints.push({
        checkpointId: task.id,
        commandIndex,
        done: flags[commandIndex] === true,
      })
    })
  }
  const done = checkpoints.filter(item => item.done)
  return {
    done,
    checkpoints,
    checkpointIds: [...new Set(done.map(item => item.checkpointId))],
    total: checkpoints.length,
    complete: checkpoints.length > 0 && done.length === checkpoints.length,
  }
}

export function recordLabOutcome(type, lab, detail = {}) {
  const payload = {
    ...labMarkers(lab, detail),
    ...detail,
  }
  logEvent(type, payload)
  return payload
}
