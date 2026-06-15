#!/usr/bin/env node
/**
 * Mark an IMPLEMENTATION_QUEUE item done and append COMPLETED_CHANGES.md
 *
 * Usage:
 *   npm run audit:mark-done -- lab_31_route_lite "Added routing table lab-lite for 3.1"
 *   node scripts/markQueueDone.mjs lab_31_route_lite "summary line"
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'ai-improvement-logs')
const QUEUE_PATH = join(OUT, 'IMPLEMENTATION_QUEUE.json')
const COMPLETED_PATH = join(OUT, 'COMPLETED_CHANGES.md')

function main() {
  const args = process.argv.slice(2).filter(a => a !== '--')
  const id = args[0]
  const summary = args.slice(1).join(' ').trim()

  if (!id) {
    console.error('Usage: npm run audit:mark-done -- <queue-id> "summary line"')
    process.exit(1)
  }
  if (!existsSync(QUEUE_PATH)) {
    console.error('⚠ No IMPLEMENTATION_QUEUE.json — run npm run audit:refresh-logs')
    process.exit(1)
  }

  const queue = JSON.parse(readFileSync(QUEUE_PATH, 'utf8'))
  const idx = queue.items.findIndex(i => i.id === id)
  if (idx < 0) {
    console.error(`⚠ Queue item not found: ${id}`)
    process.exit(1)
  }

  const item = queue.items[idx]
  if (item.status === 'done') {
    console.log(`ℹ ${id} already marked done`)
  } else {
    queue.items[idx] = { ...item, status: 'done', completedAt: new Date().toISOString() }
    writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n')
    console.log(`✓ Marked done: ${id}`)
  }

  const date = new Date().toISOString().slice(0, 10)
  const line = summary
    ? `- **${date}** \`${id}\`: ${summary}`
    : `- **${date}** \`${id}\`: completed`

  let completed = existsSync(COMPLETED_PATH)
    ? readFileSync(COMPLETED_PATH, 'utf8')
    : '# Completed Changes\n'

  if (!completed.includes(line)) {
    completed = completed.trimEnd() + '\n' + line + '\n'
    writeFileSync(COMPLETED_PATH, completed)
    console.log(`✓ Appended COMPLETED_CHANGES.md`)
  }

  process.exit(0)
}

main()
