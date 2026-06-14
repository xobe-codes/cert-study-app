#!/usr/bin/env node
/**
 * Copy all validation packages into data/source-question-bank/.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SOURCE_BANK_FOLDERS } from './lib/sourceBankConfig.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'data', 'source-question-bank')
const DL = join(homedir(), 'Downloads')

function copyFolder(folder) {
  const srcDir = join(DL, folder)
  const destDir = join(OUT, folder)
  if (!existsSync(srcDir)) {
    console.warn(`  skip (missing): ${folder}`)
    return 0
  }
  mkdirSync(destDir, { recursive: true })
  let n = 0
  for (const name of readdirSync(srcDir)) {
    const src = join(srcDir, name)
    if (!statSync(src).isFile()) continue
    cpSync(src, join(destDir, name))
    console.log(`  copied: ${folder}/${name}`)
    n++
  }
  return n
}

function main() {
  mkdirSync(OUT, { recursive: true })
  console.log('Importing source question banks …')
  let total = 0
  for (const folder of SOURCE_BANK_FOLDERS) total += copyFolder(folder)
  if (total === 0) {
    console.error('✗ No source files copied.')
    process.exit(1)
  }
  console.log(`✓ Imported ${total} file(s).`)
}

main()
