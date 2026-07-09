/** Labs learning-flow spec — teach-first copy and quality minimums (99+ bar). */

export const LAB_QUALITY_MIN = {
  learningGoals: 4,
  commonMistakes: 4,
  tasks: 3,
  verificationChecks: 3,
  flowSteps: 4,
}

export const LAB_FLOW_STEP_MAX = 6

export const LAB_HOW_IT_WORKS = {
  title: 'HOW LABS WORK',
  steps: [
    {
      key: 'learn',
      label: 'Learn',
      text: 'Read the scenario, learning goals, topology, traffic flow, and exam traps before touching the terminal.',
    },
    {
      key: 'practice',
      label: 'Practice',
      text: 'Every lab is teach-first show-only — run verify commands in the Cisco IOS-style terminal (enable, then show …).',
    },
    {
      key: 'verify',
      label: 'Verify',
      text: 'Confirm output matches the lab success criteria; use show commands to prove each objective.',
    },
  ],
  hubNote:
    'Labs are grouped by CCNA exam domain. Badges reflect runtime mode — config labs open as show-only verify paths.',
}

/** Learner-facing tier badge from resolved lab metadata (post getLab()). */
export function labTierLabel(lab) {
  return lab?.interpretOnly ? 'SHOW ONLY' : 'LEARN → DO'
}
