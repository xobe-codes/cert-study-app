import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('offline chunk precache', () => {
  it('vite PWA precaches curated study chunks (not index shell)', () => {
    const config = readFileSync(resolve(process.cwd(), 'vite.config.js'), 'utf8')
    expect(config).toMatch(/assets\/clean-questions\*\.js/)
    expect(config).toMatch(/assets\/mock-exam\*\.js/)
    expect(config).toMatch(/assets\/study-modes\*\.js/)
    expect(config).toMatch(/globIgnores.*index/)
  })
})
