/** Static import contracts — catches missing imports after tab/route extractions. */
export const APP_IMPORTS = [
  { symbol: 'AppShell', from: './features/shell/AppShell.jsx' },
  { symbol: 'AppShellStyles', from: './features/shell/AppShellStyles.jsx' },
  { symbol: 'CoreStudyRoutes', from: './features/shell/CoreStudyRoutes.jsx' },
  { symbol: 'StudyModeRoutes', from: './features/study/StudyModeRoutes.jsx' },
  { symbol: 'AppChromeOverlays', from: './features/shell/AppChromeOverlays.jsx' },
  { symbol: 'PracticeRoutes', from: './features/practice/PracticeRoutes.jsx' },
  { symbol: 'useAppSync', from: './features/sync/useAppSync.js' },
  { symbol: 'useAppOnboarding', from: './features/onboarding/useAppOnboarding.js' },
]

export const STUDY_QUIZ_TAB_IMPORTS = [
  { symbol: 'MAX_QUIZ_SESSION_SIZE', from: '../quizSessionConfig.js' },
  { symbol: 'loadQuizSessionSize', from: '../quizSessionConfig.js' },
  { symbol: 'saveQuizSessionSize', from: '../quizSessionConfig.js' },
  { symbol: 'preloadCleanBank', from: '../data/cleanQuestionAdapter.js' },
  { symbol: 'masteryBreakdown', from: '../lesson/masteryCriteria.js' },
  { symbol: 'computeMastery', from: '../netUtils.js' },
  { symbol: 'parseRichTextSegments', from: '../lesson/richTextParse.js' },
]

export const APP_SRS_IMPORTS = [
  { symbol: 'loadDueQuestions', from: './quiz/srsReview.js' },
  { symbol: 'countDueQuestions', from: './quiz/srsReview.js' },
]

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** True when `source` lazy-imports `symbol` from `from`. */
export function hasLazyImport(source, symbol, from) {
  const fromRe = escapeRe(from)
  return new RegExp(
    `(?:const|let)\\s+${symbol}\\s*=\\s*lazy\\(\\s*\\(\\)\\s*=>\\s*import\\(['"]${fromRe}['"]\\)`
  ).test(source)
}

/** True when `source` imports `symbol` from `from` (named, default, or lazy). */
export function hasNamedImport(source, symbol, from) {
  if (hasLazyImport(source, symbol, from)) return true
  const fromRe = escapeRe(from)
  const patterns = [
    new RegExp(`import\\s+\\{[^}]*\\b${symbol}\\b[^}]*\\}\\s+from\\s+['"]${fromRe}['"]`),
    new RegExp(`import\\s+${symbol}\\s+from\\s+['"]${fromRe}['"]`),
  ]
  return patterns.some(p => p.test(source))
}

/** True when JSX or expression references the symbol (not a string literal). */
export function usesSymbol(source, symbol) {
  const re = new RegExp(
    `(?<![\\w$])${symbol}(?![\\w$])`
  )
  if (!re.test(source)) return false
  const importOnly = new RegExp(`^import\\s+.*\\b${symbol}\\b`, 'm')
  const lines = source.split('\n').filter(line => re.test(line) && !importOnly.test(line.trim()))
  return lines.length > 0
}
