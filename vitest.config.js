import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
    // Several integration tests parse the full 47k-line clean question bank;
    // under parallel workers these exceed the 5s default. Bounded higher.
    testTimeout: 20000,
    hookTimeout: 20000,
  },
})
