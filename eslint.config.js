import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

const browserGlobals = {
  window: 'readonly', document: 'readonly', console: 'readonly',
  setTimeout: 'readonly', clearTimeout: 'readonly',
  setInterval: 'readonly', clearInterval: 'readonly',
  requestAnimationFrame: 'readonly', cancelAnimationFrame: 'readonly',
  fetch: 'readonly', URL: 'readonly', URLSearchParams: 'readonly',
  Blob: 'readonly', File: 'readonly', FileReader: 'readonly',
  navigator: 'readonly', localStorage: 'readonly', sessionStorage: 'readonly',
  Promise: 'readonly', BigInt: 'readonly', Math: 'readonly',
  Date: 'readonly', JSON: 'readonly', Array: 'readonly',
  Object: 'readonly', String: 'readonly', Number: 'readonly',
  Boolean: 'readonly', RegExp: 'readonly', Error: 'readonly',
  TypeError: 'readonly', TextDecoder: 'readonly', TextEncoder: 'readonly',
  AbortController: 'readonly', ReadableStream: 'readonly',
  Response: 'readonly', Request: 'readonly', Headers: 'readonly',
  EventSource: 'readonly', MutationObserver: 'readonly',
  ResizeObserver: 'readonly', IntersectionObserver: 'readonly',
  performance: 'readonly', crypto: 'readonly',
  Symbol: 'readonly', Map: 'readonly', Set: 'readonly', WeakMap: 'readonly',
  WeakSet: 'readonly', Proxy: 'readonly', Reflect: 'readonly',
  structuredClone: 'readonly', queueMicrotask: 'readonly',
  CustomEvent: 'readonly', requestIdleCallback: 'readonly', cancelIdleCallback: 'readonly',
  caches: 'readonly', SpeechSynthesisUtterance: 'readonly',
}

export default [
  js.configs.recommended,
  // Plain JS files (utilities, tests) — no React plugin
  {
    files: ['src/**/*.js'],
    ignores: [
      'src/**/*.test.js',
      // Custom hooks written as .js (no JSX) — covered by the hooks block below
      // so rules-of-hooks / exhaustive-deps actually apply to them.
      'src/hooks/**/*.js',
      'src/ui/use*.js',
      'src/ui/visualViewportInset.js',
      'src/features/**/use*.js',
      'src/ai/claudeClient.js',
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: browserGlobals,
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
  // JSX files, and plain-.js custom hooks — full React + hooks rules.
  // A hook doesn't stop being a hook for being written without JSX: these
  // files call useEffect/useState/etc and need rules-of-hooks/exhaustive-deps
  // checked same as any component, but were previously invisible to this
  // config (matched only by the no-React block above), which is why an
  // `eslint-disable-line react-hooks/exhaustive-deps` in one of them
  // (useAppBootstrap.js) errored with "rule not found" — no plugin providing
  // that rule was ever registered for the file.
  {
    files: [
      'src/**/*.jsx',
      'src/hooks/**/*.js',
      'src/ui/use*.js',
      'src/ui/visualViewportInset.js',
      'src/features/**/use*.js',
      'src/ai/claudeClient.js',
    ],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: browserGlobals,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: '18.2.0' },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'off',
      // Apostrophes in JSX text are harmless in this SPA; escaping them would
      // require touching 16+ lines of user-facing copy — out of scope.
      'react/no-unescaped-entities': 'off',
      // Existing codebase uses synchronous setState in effects as a reset
      // pattern (e.g. setCards(null); fetchTerms()) — this is intentional.
      'react-hooks/set-state-in-effect': 'off',
      // react-hooks/purity flags Date.now() inside event handlers as "impure
      // during render" — false positive; these are all in event callbacks, not
      // the render path.
      'react-hooks/purity': 'off',
      // ESLint 10 rule: requires { cause } when throwing after a catch.
      // The app's catch-then-throw patterns are intentional swallow+signal.
      'preserve-caught-error': 'off',
    },
  },
  // Test files
  {
    files: ['src/**/*.test.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...browserGlobals,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
        // vitest runs under Node — a handful of file-size-guard tests read
        // source files via process.cwd().
        process: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'scripts/**'],
  },
]
