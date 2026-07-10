import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
    // Several integration tests parse the full 47k-line clean question bank;
    // under parallel workers these exceed the 5s default. Bounded higher.
    testTimeout: 20000,
    hookTimeout: 20000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      exclude: [
        'src/__tests__/**',
        'src/data/**',
        'src/domain-packages/**',
        'scripts/**',
        'e2e/**',
      ],
      thresholds: {
        lines: 45,
        branches: 35,
        functions: 40,
        statements: 43,
      },
    },
  },
})
