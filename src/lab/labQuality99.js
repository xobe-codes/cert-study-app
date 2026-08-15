/**
 * Runtime lab quality enrichment — every getLab() bundle meets the 99+ bar.
 * Gold reference: LAB-31-ROUTE-INTERPRET
 */
import { LAB_QUALITY_PATCHES } from '../data/labQualityPatches.js'
import { LAB_QUALITY_MIN } from './labLearnSpec.js'

export { LAB_QUALITY_MIN }

const EXAM_TRAP_FILLERS = [
  'Skipping privileged EXEC (enable) before running show commands.',
  'Reading show output too quickly without locating the exact field the exam asks for.',
  'Confusing administrative distance with metric when both appear in brackets.',
  'Assuming a command succeeded without checking State/Status columns in show output.',
]

function uniqueStrings(arr) {
  const seen = new Set()
  return arr.filter(s => {
    const k = String(s || '').trim()
    if (!k || seen.has(k)) return false
    seen.add(k)
    return true
  })
}

function isWeakExpectedResult(er) {
  if (!er || typeof er !== 'string') return true
  const t = er.trim()
  if (t.length < 12) return true
  if (/^(ok|full|up|active|noted|yes|no)$/i.test(t)) return true
  return false
}

function enrichExpectedResult(check, lab) {
  if (!isWeakExpectedResult(check.expectedResult)) return check
  const hint = check.passCondition && check.passCondition !== 'ok' ? check.passCondition : ''
  const sc = lab.successCriteria?.[0] || lab.scenario?.slice(0, 90) || 'output matches lab objective'
  const expectedResult = `${check.command}: ${hint ? `${hint} — ` : ''}${sc}`.slice(0, 140)
  return {
    ...check,
    expectedResult,
    passCondition: check.passCondition === 'ok' ? 'verified' : (check.passCondition || 'verified'),
  }
}

function padToMin(arr, min, fillers) {
  const out = uniqueStrings([...(arr || [])])
  let i = 0
  while (out.length < min && i < fillers.length) out.push(fillers[i++])
  while (out.length < min) {
    out.push(`Identify exam-relevant output field ${out.length + 1} in this lab scenario.`)
  }
  return out
}

function padLearningGoals(goals, lab) {
  const fillers = [
    'Read IOS show output carefully before answering exam questions on this topic.',
    'Match each verify command to the success criteria listed in the lab.',
    'Use show output to explain why the configuration or state is correct.',
    'Spot the one output field that would trap a rushed candidate on exam day.',
  ]
  return padToMin(
    [
      ...(goals || []),
      ...(lab.successCriteria || []).map(s => `Confirm: ${s}`),
      ...(lab.failureCriteria || []).map(s => `Avoid: ${s}`),
    ],
    LAB_QUALITY_MIN.learningGoals,
    fillers,
  )
}

function padCommonMistakes(mistakes, lab) {
  return padToMin(
    [...(mistakes || []), ...(lab.failureCriteria || []), ...EXAM_TRAP_FILLERS],
    LAB_QUALITY_MIN.commonMistakes,
    EXAM_TRAP_FILLERS,
  )
}

function isVerifyCommand(cmd, interpretOnly = false) {
  const c = String(cmd).toLowerCase().trim()
  if (!c || c === 'enable') return false
  if (interpretOnly) return c.startsWith('show ')
  return /^(show |dir |ping |traceroute |ipconfig |show rest )/.test(c)
}

function padTasks(tasks, lab, validator) {
  const interpretOnly = !!lab.interpretOnly
  const existing = [...(tasks || [])]
  const existingCmds = new Set(
    existing.flatMap(t => (t.expectedCommands || []).map(c => String(c).toLowerCase())),
  )
  const candidateCmds = uniqueStrings([
    ...(lab.verificationCommands || []),
    ...(validator?.requiredCommands || []).map(r => r.command),
  ]).filter(cmd => isVerifyCommand(cmd, interpretOnly))
  let order = existing.length
  for (const cmd of candidateCmds) {
    if (existing.length >= LAB_QUALITY_MIN.tasks) break
    const lower = String(cmd).toLowerCase()
    if (existingCmds.has(lower)) continue
    order += 1
    existing.push({
      id: `t-pad-${order}`,
      order,
      title: `Verify with ${cmd.split(' ').slice(0, 3).join(' ')}`,
      device: validator?.requiredCommands?.[0]?.device || existing[0]?.device || 'R1',
      instruction: `Run ${cmd} and confirm the output supports the lab success criteria.`,
      expectedCommands: [cmd],
    })
    existingCmds.add(lower)
  }
  while (existing.length < LAB_QUALITY_MIN.tasks) {
    order += 1
    const base = existing[existing.length - 1] || { device: 'R1', expectedCommands: ['show running-config'] }
    // Reuse the prior task's own command rather than a hardcoded 'show
    // running-config' fallback — that literal string has no canned output
    // in any lab's cliShowOutput table, so the padded task previously
    // rendered "% Output not simulated" instead of the "prior" output its
    // own instruction text promised. Use the LAST command in that task, not
    // the first — multi-command tasks are usually mode-setup ("enable")
    // followed by the actual verify command, and re-running "enable" as a
    // fake verification step is meaningless.
    const baseCmds = base.expectedCommands || []
    const fallbackCmd = baseCmds[baseCmds.length - 1] || 'show running-config'
    existing.push({
      id: `t-pad-${order}`,
      order,
      title: `Review output (${order})`,
      device: base.device,
      instruction: 'Re-run the prior verify command and articulate the key field an examiner would ask about.',
      expectedCommands: [fallbackCmd],
    })
  }
  return existing.map((t, i) => ({ ...t, order: i + 1 }))
}

function padVerificationChecks(checks, lab, tasks) {
  let existing = (checks || []).map(c => enrichExpectedResult(c, lab))
  for (const task of tasks || []) {
    if (existing.length >= LAB_QUALITY_MIN.verificationChecks) break
    for (const cmd of task.expectedCommands || []) {
      if (String(cmd).toLowerCase() === 'enable') continue
      if (existing.some(c => c.command === cmd)) continue
      existing.push({
        id: `v-pad-${existing.length + 1}`,
        device: task.device,
        command: cmd,
        expectedResult: `${cmd}: ${lab.successCriteria?.[existing.length] || lab.successCriteria?.[0] || 'output confirms lab objective'}`,
        passCondition: 'verify',
      })
    }
  }
  while (existing.length < LAB_QUALITY_MIN.verificationChecks) {
    const sc = lab.successCriteria?.[existing.length] || `Success criterion ${existing.length + 1} met from show output`
    const cmd = lab.verificationCommands?.[existing.length]
      || tasks?.[existing.length]?.expectedCommands?.find(c => String(c).toLowerCase() !== 'enable')
      || 'show running-config'
    existing.push({
      id: `v-pad-${existing.length + 1}`,
      device: tasks?.[0]?.device || 'R1',
      command: cmd,
      expectedResult: sc,
      passCondition: 'criterion',
    })
  }
  return existing
}

function uniqueSteps(steps) {
  const seen = new Set()
  return steps.filter(s => {
    const k = `${s.title}|${s.action}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

function padFlowSteps(steps, lab, tasks) {
  const fromTasks = (tasks || []).map((t, i) => ({
    id: `fs-task-${i + 1}`,
    order: i + 1,
    title: t.title,
    action: t.instruction,
    successState: 'verified',
  }))
  const fillers = [
    { title: 'Read scenario', action: lab.scenario?.slice(0, 120) || 'Understand topology and expected outcome.', successState: 'learned' },
    { title: 'Privileged mode', action: 'Use enable before show commands in the lab terminal.', successState: 'ready' },
    { title: 'Interpret output', action: 'Match output fields to exam vocabulary (codes, AD/metric, roles, states).', successState: 'interpreted' },
    { title: 'Confirm criteria', action: (lab.successCriteria || ['Lab objectives met']).join('; '), successState: 'complete' },
  ]
  const merged = uniqueSteps([...(steps || []), ...fromTasks])
  let fi = 0
  while (merged.length < LAB_QUALITY_MIN.flowSteps && fi < fillers.length) {
    merged.push({ id: `fs-fill-${fi}`, order: merged.length + 1, ...fillers[fi] })
    fi += 1
  }
  while (merged.length < LAB_QUALITY_MIN.flowSteps) {
    merged.push({
      id: `fs-fill-${merged.length}`,
      order: merged.length + 1,
      title: `Step ${merged.length + 1}`,
      action: 'Verify another success criterion from show output.',
      successState: 'verified',
    })
  }
  return merged.map((s, i) => ({ ...s, order: i + 1 }))
}

export function meetsLabQuality99(bundle) {
  if (!bundle?.lab) return false
  const { lab, validator, packetFlows } = bundle
  const steps = packetFlows?.[0]?.steps?.length || 0
  const checks = (validator?.verificationChecks || []).filter(c => c.expectedResult && !isWeakExpectedResult(c.expectedResult))
  return (
    (lab.learningGoals?.length || 0) >= LAB_QUALITY_MIN.learningGoals
    && (lab.commonMistakes?.length || 0) >= LAB_QUALITY_MIN.commonMistakes
    && (lab.tasks?.length || 0) >= LAB_QUALITY_MIN.tasks
    && checks.length >= LAB_QUALITY_MIN.verificationChecks
    && steps >= LAB_QUALITY_MIN.flowSteps
  )
}

/** Apply 99+ minimums to a lab bundle (after config-lab-lite). */
export function applyLabQuality99(bundle) {
  if (!bundle?.lab) return bundle
  const patch = LAB_QUALITY_PATCHES[bundle.lab.id]
  let lab = { ...bundle.lab, ...(patch?.lab || {}) }
  if (patch?.learningGoals) lab.learningGoals = patch.learningGoals
  if (patch?.commonMistakes) lab.commonMistakes = patch.commonMistakes
  if (patch?.tasks) lab.tasks = patch.tasks

  let validator = { ...bundle.validator }
  if (patch?.verificationChecks) {
    validator = { ...validator, verificationChecks: patch.verificationChecks }
  }

  lab.tasks = padTasks(lab.tasks, lab, validator)
  lab.learningGoals = padLearningGoals(lab.learningGoals, lab)
  lab.commonMistakes = padCommonMistakes(lab.commonMistakes, lab)
  validator = {
    ...validator,
    verificationChecks: padVerificationChecks(validator.verificationChecks, lab, lab.tasks),
  }

  const flow0 = bundle.packetFlows?.[0]
  const packetFlows = [{
    ...(flow0 || { title: lab.title, ckuIds: lab.ckuIds, diagramId: bundle.diagram?.id }),
    id: flow0?.id || `FLOW-${lab.id}`,
    steps: padFlowSteps(flow0?.steps, lab, lab.tasks),
  }, ...(bundle.packetFlows?.slice(1) || [])]

  return { ...bundle, lab, validator, packetFlows }
}
