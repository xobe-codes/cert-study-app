#!/usr/bin/env node
/** Phase 1 — parse OneNote markdown → normalized JSON. */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { TOPIC_MAP } from './lib/onenoteTopicMap.mjs'
import {
  ROOT,
  ONENOTE_NORMALIZED,
  loadJson,
  parseOneNoteMarkdown,
  extractExamTopics,
  resolveImportDir,
} from './lib/onenoteUtils.mjs'

const CROSSWALK_PATH = join(ROOT, 'data', 'onenote', 'objective-crosswalk.json')
const REPORT_PATH = join(ROOT, 'data', 'onenote', 'import-report.json')

function main() {
  const src = resolveImportDir()
  if (!existsSync(src)) {
    console.error('✗ No OneNote markdown found. Run: npm run onenote:sync')
    process.exit(1)
  }

  const crosswalk = loadJson(CROSSWALK_PATH, {})
  mkdirSync(ONENOTE_NORMALIZED, { recursive: true })

  const files = readdirSync(src).filter(f => f.endsWith('.md') && !f.startsWith('00 -'))
  const imported = []
  const errors = []
  let warningCount = 0

  for (const filename of files.sort()) {
    const map = TOPIC_MAP[filename]
    if (!map) {
      errors.push(`missing topic-map entry: ${filename}`)
      continue
    }

    const raw = readFileSync(join(src, filename), 'utf8')
    const parsed = parseOneNoteMarkdown(raw, filename)
    const inlineTopics = extractExamTopics(raw, crosswalk)
    const objectiveIds = map.objectiveIds?.length ? map.objectiveIds : inlineTopics

    if (!objectiveIds.length) {
      errors.push(`${filename}: no objectiveIds (map or inline)`)
      continue
    }

    if (inlineTopics.length && map.objectiveIds?.length) {
      const conflict = inlineTopics.find(id => !map.objectiveIds.includes(id))
      if (conflict) {
        parsed.mapOverrideNote = `inline ${conflict} overridden by topic-map`
      }
    }

    warningCount += parsed.warnings.length
    const record = {
      ...parsed,
      objectiveIds,
      ckuIds: map.ckuIds || [],
      mergeGroup: map.mergeGroup || null,
      part: map.part || null,
      supplemental: !!map.supplemental,
      chapter: !!map.chapter,
      confidence: parsed.warnings.length ? 'draft' : 'reviewed',
      source: 'onenote',
    }

    writeFileSync(join(ONENOTE_NORMALIZED, `${parsed.slug}.json`), JSON.stringify(record, null, 2))
    imported.push({ filename, slug: parsed.slug, objectiveIds, warnings: parsed.warnings.length })
  }

  writeFileSync(REPORT_PATH, JSON.stringify({ imported, errors, warningCount, sourceDir: src }, null, 2))

  if (errors.length) {
    console.error(`✗ importOneNote failed (${errors.length} issues):`)
    errors.slice(0, 20).forEach(e => console.error('  -', e))
    process.exit(1)
  }

  console.log(`✓ Imported ${imported.length} OneNote lessons from ${src}`)
  console.log(`  OCR warnings flagged: ${warningCount} (draft until reviewed)`)
}

main()
