#!/usr/bin/env node
/**
 * 99-spec batch claim protocol — see ai-improvement-logs/BATCH_CLAIM_99.md.
 * Lets concurrent regeneration runs (morning/afternoon/evening scheduled agents)
 * share the question pool in src/data/ccnaCleanQuestions.js without two runs ever
 * claiming the same question range at once.
 */
import { existsSync, closeSync, openSync, readFileSync, unlinkSync, writeFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CLAIMS_PATH = join(ROOT, 'ai-improvement-logs', 'batch_claims.json')
const LOCK_PATH = join(ROOT, 'ai-improvement-logs', '.batch_claims.lock')
const STAGING_PATH = join(ROOT, 'src', 'answerReview', 'regeneratedExplanations.json')
const QUESTIONS_PATH = join(ROOT, 'src', 'data', 'ccnaCleanQuestions.js')

const DEFAULT_BATCH_SIZE = 33
const DEFAULT_TTL_MINUTES = 90
const LOCK_STALE_MS = 30_000
const LOCK_TIMEOUT_MS = 15_000
const LOCK_RETRY_MS = 150

// ---------- sync lock (single-machine, same-filesystem mutual exclusion) ----------

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

function acquireLock() {
  const deadline = Date.now() + LOCK_TIMEOUT_MS
  while (true) {
    try {
      const fd = openSync(LOCK_PATH, 'wx')
      writeFileSync(fd, String(process.pid))
      closeSync(fd)
      return
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
      // Stale-lock recovery: a holder that died mid-write leaves this behind forever
      // otherwise. Age it out rather than deadlocking every future run.
      try {
        if (Date.now() - statSync(LOCK_PATH).mtimeMs > LOCK_STALE_MS) {
          unlinkSync(LOCK_PATH)
          continue
        }
      } catch {
        continue // lock disappeared between the check and the stat — retry immediately
      }
      if (Date.now() > deadline) {
        throw new Error(`Timed out waiting for ${LOCK_PATH} (held by another run)`)
      }
      sleepSync(LOCK_RETRY_MS)
    }
  }
}

function releaseLock() {
  try {
    unlinkSync(LOCK_PATH)
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
}

function withLock(fn) {
  acquireLock()
  try {
    return fn()
  } finally {
    releaseLock()
  }
}

// ---------- data access ----------

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function writeJsonAtomic(path, data) {
  const tmp = `${path}.tmp-${process.pid}`
  writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n')
  // rename is atomic on the same filesystem — never leaves a half-written claims file
  writeFileSync(path, readFileSync(tmp))
  unlinkSync(tmp)
}

async function getAllQuestionIdsInOrder() {
  // Dynamic import needs a proper file:// URL, not a raw filesystem path — a raw path
  // breaks on any repo checked out under a directory with a space (e.g. "CCNA App").
  const mod = await import(`${pathToFileURL(QUESTIONS_PATH).href}?t=${Date.now()}`)
  const ids = []
  for (const questions of Object.values(mod.CLEAN_QUESTIONS)) {
    for (const q of questions) ids.push(q.id)
  }
  return ids
}

function pruneExpired(claims, now = Date.now()) {
  for (const [runId, claim] of Object.entries(claims)) {
    const ttlMs = (claim.ttlMinutes ?? DEFAULT_TTL_MINUTES) * 60_000
    if (now - Date.parse(claim.claimedAt) > ttlMs) {
      delete claims[runId]
    }
  }
  return claims
}

// ---------- public API ----------

/**
 * Claim the next unclaimed batch of question IDs for `runId`.
 * Idempotent: re-calling with the same runId before it completes/releases
 * returns the same IDs rather than claiming a new, different batch.
 */
export async function claimNextBatch({
  runId,
  batchSize = DEFAULT_BATCH_SIZE,
  ttlMinutes = DEFAULT_TTL_MINUTES,
} = {}) {
  if (!runId) throw new Error('claimNextBatch requires a runId')

  const allIds = await getAllQuestionIdsInOrder()

  return withLock(() => {
    const claims = pruneExpired(readJson(CLAIMS_PATH, {}))

    if (claims[runId]) {
      // Already holds a claim (retry after a blip) — return it, don't claim a second one.
      return { runId, claimedIds: claims[runId].ids, claimedAt: claims[runId].claimedAt, resumed: true }
    }

    const completedIds = new Set(Object.keys(readJson(STAGING_PATH, {})))
    const activeClaimedIds = new Set(Object.values(claims).flatMap((c) => c.ids))

    const available = allIds.filter((id) => !completedIds.has(id) && !activeClaimedIds.has(id))
    const taken = available.slice(0, batchSize)

    const claimedAt = new Date().toISOString()
    if (taken.length > 0) {
      claims[runId] = { ids: taken, claimedAt, ttlMinutes, status: 'in_progress' }
      writeJsonAtomic(CLAIMS_PATH, claims)
    } else {
      // Nothing left to claim — still prune-and-persist so expired claims don't linger.
      writeJsonAtomic(CLAIMS_PATH, claims)
    }

    return { runId, claimedIds: taken, claimedAt, resumed: false }
  })
}

/** Drop `runId`'s claim after a successful merge into the staging file. */
export function completeBatch({ runId }) {
  if (!runId) throw new Error('completeBatch requires a runId')
  return withLock(() => {
    const claims = pruneExpired(readJson(CLAIMS_PATH, {}))
    const existed = Boolean(claims[runId])
    delete claims[runId]
    writeJsonAtomic(CLAIMS_PATH, claims)
    return { runId, released: existed }
  })
}

/** Drop `runId`'s claim after a failure, before any merge happened. Same effect as
 * completeBatch — kept as a separate name so call sites read as intent, e.g.
 * `try { ... } catch { await releaseClaim({ runId }) }`. */
export function releaseClaim({ runId }) {
  return completeBatch({ runId })
}

/** Snapshot of current claims plus overall pool coverage, for `status`. */
export async function getStatus() {
  const allIds = await getAllQuestionIdsInOrder()
  const claims = pruneExpired(readJson(CLAIMS_PATH, {}))
  const completedIds = new Set(Object.keys(readJson(STAGING_PATH, {})))
  const activeClaimedIds = new Set(Object.values(claims).flatMap((c) => c.ids))
  const available = allIds.filter((id) => !completedIds.has(id) && !activeClaimedIds.has(id))

  return {
    totalQuestions: allIds.length,
    completed: completedIds.size,
    activeClaims: Object.fromEntries(
      Object.entries(claims).map(([runId, c]) => [runId, { count: c.ids.length, claimedAt: c.claimedAt, ttlMinutes: c.ttlMinutes }])
    ),
    availableForClaim: available.length,
    nextInLine: available.slice(0, 5),
  }
}

// ---------- CLI ----------

function parseArgs(argv) {
  const args = {}
  for (const arg of argv) {
    const match = arg.match(/^--([^=]+)=(.*)$/)
    if (match) args[match[1]] = match[2]
  }
  return args
}

async function main() {
  const [, , command, ...rest] = process.argv
  const args = parseArgs(rest)

  if (command === 'claim') {
    const result = await claimNextBatch({
      runId: args['run-id'],
      batchSize: args['batch-size'] ? Number(args['batch-size']) : undefined,
      ttlMinutes: args['ttl-minutes'] ? Number(args['ttl-minutes']) : undefined,
    })
    console.log(JSON.stringify(result, null, 2))
  } else if (command === 'complete') {
    console.log(JSON.stringify(completeBatch({ runId: args['run-id'] }), null, 2))
  } else if (command === 'release') {
    console.log(JSON.stringify(releaseClaim({ runId: args['run-id'] }), null, 2))
  } else if (command === 'status') {
    console.log(JSON.stringify(await getStatus(), null, 2))
  } else {
    console.error(`Usage:
  node scripts/claimQuestionBatch.mjs claim --run-id=<id> [--batch-size=33] [--ttl-minutes=90]
  node scripts/claimQuestionBatch.mjs complete --run-id=<id>
  node scripts/claimQuestionBatch.mjs release --run-id=<id>
  node scripts/claimQuestionBatch.mjs status`)
    process.exit(1)
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
