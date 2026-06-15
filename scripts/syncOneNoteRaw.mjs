#!/usr/bin/env node
/** Copy OneNote export into data/onenote/raw when available. */
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { ONENOTE_RAW, resolveOneNoteDir } from './lib/onenoteUtils.mjs'

function main() {
  const src = resolveOneNoteDir()
  if (src.endsWith('fixtures')) {
    console.log('ℹ Using fixtures only — set ONENOTE_EXPORT_DIR or run from ~/Documents/markdown')
    return
  }
  if (src === ONENOTE_RAW) {
    console.log('ℹ No external OneNote export found; using data/onenote/raw or fixtures')
    return
  }
  mkdirSync(ONENOTE_RAW, { recursive: true })
  let n = 0
  for (const name of readdirSync(src)) {
    if (!name.endsWith('.md')) continue
    const from = join(src, name)
    if (!statSync(from).isFile()) continue
    cpSync(from, join(ONENOTE_RAW, name))
    n++
  }
  console.log(`✓ Synced ${n} markdown file(s) → data/onenote/raw`)
}

main()
