import { describe, it, expect } from 'vitest'
import AppErrorBoundary from '../components/AppErrorBoundary.jsx'

describe('AppErrorBoundary', () => {
  it('getDerivedStateFromError captures the error', () => {
    const err = new Error('test failure')
    expect(AppErrorBoundary.getDerivedStateFromError(err)).toEqual({
      hasError: true,
      error: err,
    })
  })
})
