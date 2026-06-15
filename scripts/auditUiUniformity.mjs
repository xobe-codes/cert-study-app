#!/usr/bin/env node
/**
 * Phase 3 — Home UI uniformity scan (read-only).
 * Writes ai-improvement-logs/UI_UNIFORMITY_REPORT.md
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'ai-improvement-logs')

const TARGETS = [
  join(ROOT, 'src/HomeScreen.jsx'),
  join(ROOT, 'src/home/homeUi.js'),
  join(ROOT, 'src/home/StudyNextStrip.jsx'),
]

function checkFile(path, src) {
  const findings = []
  const rel = path.replace(ROOT + '/', '')

  if (rel.includes('HomeScreen')) {
    if (!src.includes("from './home/homeUi.js'") && !src.includes('from "./home/homeUi.js"')) {
      findings.push({ severity: 'high', issue: 'HomeScreen does not import homeUi.js helpers' })
    }
    if (!src.includes('flexWrap')) {
      findings.push({ severity: 'medium', issue: 'Missing flexWrap on header/domain rows (mobile wrap risk)' })
    }
    if (!src.includes('minmax(0, 1fr)')) {
      findings.push({ severity: 'medium', issue: 'Study modes grid missing minmax(0, 1fr) columns' })
    }
    if (/borderRadius:\s*10/.test(src) && /borderRadius:\s*14/.test(src)) {
      findings.push({ severity: 'low', issue: 'Mixed border-radius 10 vs 14 on same screen' })
    }
    if (/background:\s*c\.dim,\s*border:\s*`1px solid \$\{c\.border\}`/.test(src)) {
      findings.push({ severity: 'medium', issue: 'Inline accent strip styles — prefer homeAccentStrip()' })
    }
    if (!src.includes('homeAccentStrip')) {
      findings.push({ severity: 'low', issue: 'homeAccentStrip not used (Study Next / FOR YOU may be inconsistent)' })
    }
    if (!src.includes('HOME_SECTION_GAP')) {
      findings.push({ severity: 'low', issue: 'HOME_SECTION_GAP not used for vertical rhythm' })
    }
  }

  if (rel.includes('StudyNextStrip')) {
    if (!src.includes('homeAccentStrip')) {
      findings.push({ severity: 'high', issue: 'StudyNextStrip should use homeAccentStrip()' })
    }
  }

  return findings.map(f => ({ ...f, file: rel }))
}

function main() {
  mkdirSync(OUT, { recursive: true })
  const all = TARGETS.flatMap(p => {
    const src = readFileSync(p, 'utf8')
    return checkFile(p, src)
  })

  const pass = all.length === 0
  const lines = [
    '# Home UI Uniformity Report',
    '',
    `**Generated:** ${new Date().toISOString()}`,
    `**Status:** ${pass ? 'PASS — no issues detected' : `FAIL — ${all.length} issue(s)`}`,
    '',
    '## Scope',
    '- `src/HomeScreen.jsx`',
    '- `src/home/homeUi.js`',
    '- `src/home/StudyNextStrip.jsx`',
    '',
  ]

  if (pass) {
    lines.push('All automated checks passed. Spot-check ≤390px viewport manually if visuals changed.', '')
  } else {
    lines.push('## Findings', '')
    lines.push('| Severity | File | Issue |')
    lines.push('|----------|------|-------|')
    for (const f of all) {
      lines.push(`| ${f.severity} | \`${f.file}\` | ${f.issue} |`)
    }
    lines.push('')
    lines.push('## Standard (use `src/home/homeUi.js`)', '')
    lines.push('- Section headers → `homeSectionLabel()`')
    lines.push('- Semantic chips → `homePill(accent)`')
    lines.push('- Numeric badges → `homePillCount(accent)`')
    lines.push('- Cards → `homeCard()` (radius 14, gap 12)')
    lines.push('- Accent CTA strips → `homeAccentStrip(accent)`')
    lines.push('- Body on accent cards → `homeBodyOnAccent`')
    lines.push('')
  }

  writeFileSync(join(OUT, 'UI_UNIFORMITY_REPORT.md'), lines.join('\n'))
  console.log(pass ? '✓ audit:ui — PASS' : `✗ audit:ui — ${all.length} issue(s) → ai-improvement-logs/UI_UNIFORMITY_REPORT.md`)
  if (!pass) process.exitCode = 1
}

main()
