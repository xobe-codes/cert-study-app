import { describe, expect, it } from 'vitest'
import { useVisualViewportBottomInset } from '../ui/visualViewportInset.js'

describe('useVisualViewportBottomInset', () => {
  it('exports a hook function', () => {
    expect(typeof useVisualViewportBottomInset).toBe('function')
  })
})
