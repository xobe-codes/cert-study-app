import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import AppShell from '../features/shell/AppShell.jsx'
import AppShellStyles from '../features/shell/AppShellStyles.jsx'
import { TIER_B_TRAP_WAVE8_PATCHES } from '../data/tierBTrapWave8Patches.js'
import { applyContentEnrichment } from '../data/contentEnrichmentPatches.js'

describe('AppShell', () => {
  it('renders app-shell with bottom nav modifier', () => {
    const html = renderToStaticMarkup(
      React.createElement(AppShell, { withBottomNav: true }, 'content'),
    )
    expect(html).toContain('app-shell')
    expect(html).toContain('app-shell--with-bottom-nav')
  })
})

describe('AppShellStyles', () => {
  it('includes theme CSS in minimal mode', () => {
    const html = renderToStaticMarkup(React.createElement(AppShellStyles, { minimal: true }))
    expect(html).toContain('<style')
    expect(html.length).toBeGreaterThan(100)
  })
})

describe('tierBTrapWave8', () => {
  it('has 10 trap wave objectives', () => {
    expect(Object.keys(TIER_B_TRAP_WAVE8_PATCHES).length).toBe(10)
  })

  it('merges traps for SNMP 4.4', () => {
    const enriched = applyContentEnrichment({ examTraps: [], flashcards: [] }, '4.4')
    expect(enriched.examTraps?.some(t => t.id === '4.4-w8-t1')).toBe(true)
  })
})
