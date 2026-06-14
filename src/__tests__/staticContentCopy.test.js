import { describe, it, expect } from 'vitest'
import { STATIC_COPY } from '../ui/staticContentCopy.js'

describe('staticContentCopy', () => {
  it('uses informational curated/offline wording, not "no API"', () => {
    expect(STATIC_COPY.badge).toMatch(/curated|offline/i)
    expect(STATIC_COPY.badge).not.toMatch(/no api/i)
    expect(STATIC_COPY.sessionBank(12)).toContain('instant')
  })
})
