/** Navigation hints shown after finish / fail / complete milestones. */

export const NAV_HINT_KEYS = {
  QUIZ_PASS: 'quiz_pass',
  QUIZ_FAIL: 'quiz_fail',
  QUIZ_MASTERED: 'quiz_mastered',
  PREASSESS_PASS: 'preassess_pass',
  PREASSESS_PARTIAL: 'preassess_partial',
  PREASSESS_FAIL: 'preassess_fail',
  REVIEW_DONE: 'review_done',
  FOCUS_DONE: 'focus_done',
  PLACEMENT_DONE: 'placement_done',
  MOCK_PASS: 'mock_pass',
  MOCK_FAIL: 'mock_fail',
  LAB_DONE: 'lab_done',
}

const HINTS = {
  [NAV_HINT_KEYS.QUIZ_PASS]: {
    icon: 'check',
    accent: 'mint',
    message: (p) => p.nextId
      ? `Strong session — open **Next objective (${p.nextId})** or head **Home** to pick another topic.`
      : 'Strong session — tap **Review again** or use **Explain** to lock in the reading.',
  },
  [NAV_HINT_KEYS.QUIZ_FAIL]: {
    icon: 'retry',
    accent: 'amber',
    message: () => 'Some misses saved — try **Missed Questions** or run the **Quiz** tab again before moving on.',
  },
  [NAV_HINT_KEYS.QUIZ_MASTERED]: {
    icon: 'check',
    accent: 'mint',
    message: (p) => p.nextId
      ? `Topic mastered — jump to **${p.nextId}** or return **Home** for your next domain.`
      : 'Topic mastered — return **Home** or open **Daily Review** while cards are fresh.',
  },
  [NAV_HINT_KEYS.PREASSESS_PASS]: {
    icon: 'next',
    accent: 'mint',
    message: () => 'You can **Skip section** or keep studying — **Next objective** is ready when you are.',
  },
  [NAV_HINT_KEYS.PREASSESS_PARTIAL]: {
    icon: 'retry',
    accent: 'sky',
    message: () => 'Partial pass — open **Explain** for weak spots, then retry the **Quiz** tab.',
  },
  [NAV_HINT_KEYS.PREASSESS_FAIL]: {
    icon: 'retry',
    accent: 'amber',
    message: () => 'Start with **Explain**, then come back to the pre-assessment or **Quiz** when ready.',
  },
  [NAV_HINT_KEYS.REVIEW_DONE]: {
    icon: 'check',
    accent: 'mint',
    message: () => 'Review batch done — **Home** for domains or check **Metrics** for what is due next.',
  },
  [NAV_HINT_KEYS.FOCUS_DONE]: {
    icon: 'check',
    accent: 'sky',
    message: () => 'Focus round complete — **Home** weak domains or run another **Focus** session tomorrow.',
  },
  [NAV_HINT_KEYS.PLACEMENT_DONE]: {
    icon: 'next',
    accent: 'purple',
    message: (p) => p.weakestId
      ? `Placement saved — start at **${p.weakestId}** from **Home**, or explore any domain.`
      : 'Placement saved — open **Home** and pick your first objective.',
  },
  [NAV_HINT_KEYS.MOCK_PASS]: {
    icon: 'check',
    accent: 'mint',
    message: () => 'Mock pass — drill weak domains from **Home** or schedule another **Mock Exam**.',
  },
  [NAV_HINT_KEYS.MOCK_FAIL]: {
    icon: 'retry',
    accent: 'rose',
    message: () => 'Mock below target — use **Focus Mode** on weak objectives, then retake the exam.',
  },
  [NAV_HINT_KEYS.LAB_DONE]: {
    icon: 'check',
    accent: 'mint',
    message: () => 'Lab complete — try the **Quiz** on this topic or pick the next **CLI Drill**.',
  },
}

export function resolveNavHint(key, params = {}) {
  const def = HINTS[key]
  if (!def) return null
  return {
    key,
    icon: def.icon,
    accent: def.accent,
    message: def.message(params),
  }
}

export function parseNavHintMessage(message) {
  if (!message) return []
  return String(message).split(/\*\*([^*]+)\*\*/g).map((part, i) => ({
    bold: i % 2 === 1,
    text: part,
  }))
}
