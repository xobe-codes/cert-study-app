#!/usr/bin/env node
/**
 * Copy private source-mapped validation JSON into data/source-question-bank/.
 * Reads from ~/Downloads/ as import source; does not modify originals.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DOMAIN_4_SOURCE_FILES } from './lib/cleanBankUtils.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'data', 'source-question-bank')
const DL = join(homedir(), 'Downloads')

function copyFile(relPath) {
  const src = join(DL, relPath)
  const dest = join(OUT, relPath)
  if (!existsSync(src)) {
    console.warn(`  skip (missing): ${relPath}`)
    return false
  }
  mkdirSync(dirname(dest), { recursive: true })
  cpSync(src, dest)
  console.log(`  copied: ${relPath}`)
  return true
}

function copyDomainFolder() {
  const folder = 'domain4-ip-services-validation'
  const srcDir = join(DL, folder)
  const destDir = join(OUT, folder)
  if (!existsSync(srcDir)) {
    console.warn(`  skip folder (missing): ${folder}`)
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
  console.log('Importing Domain 4 source bank into data/source-question-bank/ …')
  let copied = copyDomainFolder()

  if (copied === 0) {
    console.log('Falling back to per-file copy …')
    for (const entry of DOMAIN_4_SOURCE_FILES) {
      if (copyFile(entry.file)) copied++
    }
  }

  if (copied === 0) {
    console.error('✗ No source files copied. Run from a machine with ~/Downloads/domain4-ip-services-validation/')
    process.exit(1)
  }
  console.log(`✓ Imported ${copied} file(s). Source files in ~/Downloads/ were not modified.`)
}

main()
