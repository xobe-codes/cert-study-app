/** Static import contracts — catches missing imports after tab/route extractions. */
export const APP_IMPORTS = [
  { symbol: 'AppShell', from: './features/shell/AppShell.jsx' },
  { symbol: 'AppShellStyles', from: './features/shell/AppShellStyles.jsx' },
  { symbol: 'AppLoadedShell', from: './features/shell/AppLoadedShell.jsx' },
  { symbol: 'useAppSync', from: './features/sync/useAppSync.js' },
  { symbol: 'useAppOnboarding', from: './features/onboarding/useAppOnboarding.js' },
  { symbol: 'useAppBootstrap', from: './features/bootstrap/useAppBootstrap.js' },
  { symbol: 'useAppSettings', from: './features/settings/useAppSettings.js' },
  { symbol: 'useAppNavigation', from: './features/navigation/useAppNavigation.js' },
  { symbol: 'AppNavigationLifecycle', from: './features/navigation/useAppNavigation.js' },
  { symbol: 'useAppPremium', from: './features/premium/useAppPremium.js' },
  { symbol: 'useAppProgress', from: './features/progress/useAppProgress.js' },
  { symbol: 'useAppChrome', from: './features/shell/useAppChrome.js' },
  { symbol: 'useAppStudyBlock', from: './features/study/useAppStudyBlock.js' },
]

export const APP_LOADED_SHELL_IMPORTS = [
  { symbol: 'CoreStudyRoutes', from: './CoreStudyRoutes.jsx' },
  { symbol: 'StudyModeRoutes', from: '../study/StudyModeRoutes.jsx' },
  { symbol: 'AppChromeOverlays', from: './AppChromeOverlays.jsx' },
  { symbol: 'PracticeRoutes', from: '../practice/PracticeRoutes.jsx' },
]

/** Imports that formerly lived in the monolithic studyQuizTabs.jsx (now QuizTab / shared). */
export const STUDY_QUIZ_TAB_IMPORTS = [
  { symbol: 'MAX_QUIZ_SESSION_SIZE', from: '../quizSessionConfig.js', file: 'tabs/QuizTab.jsx' },
  { symbol: 'loadQuizSessionSize', from: '../quizSessionConfig.js', file: 'tabs/QuizTab.jsx' },
  { symbol: 'saveQuizSessionSize', from: '../quizSessionConfig.js', file: 'tabs/QuizTab.jsx' },
  { symbol: 'preloadCleanBankForObjective', from: '../data/cleanQuestionAdapter.js', file: 'tabs/QuizTab.jsx' },
  { symbol: 'masteryBreakdown', from: '../lesson/masteryCriteria.js', file: 'tabs/QuizTab.jsx' },
  { symbol: 'computeMastery', from: '../netUtils.js', file: 'tabs/quizTabChrome.jsx' },
  { symbol: 'parseRichTextSegments', from: '../lesson/richTextParse.js', file: 'tabs/studyQuizShared.jsx' },
]

export const APP_SRS_IMPORTS = [
  { symbol: 'countDueQuestions', from: '../../quiz/srsReview.js', file: 'features/bootstrap/useAppBootstrap.js' },
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
