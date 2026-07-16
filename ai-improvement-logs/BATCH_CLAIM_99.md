# 99-Spec Batch Claim Protocol

## Definition

A **99-spec batch claim** is the coordination contract that lets multiple regeneration
runs (morning/afternoon/evening scheduled agents, or any manually-triggered run) share
the same question pool — `src/data/ccnaCleanQuestions.js` — **without two runs ever
generating explanations for the same question range at the same time.**

This exists because that exact failure happened twice: the 2026-07-13 afternoon run and
the 2026-07-14 evening run both read `regeneratedExplanations.json` at 66/914, both
independently generated explanations for `1.8-c-q3`–`1.12-c-q1`, and only one survived
the merge (see `EXPLANATION_REGEN_PROGRESS.md`, "2026-07-13 AFTERNOON" note). The root
cause: each run only checked staging-file state *once, at the start*, with no signal
telling it another run had already claimed that range.

## Required Behavior

### Before generating anything, a run MUST claim its batch
- Compute the full question-ID list in file order from `CLEAN_QUESTIONS`
  (`src/data/ccnaCleanQuestions.js`), flattened in object-key then array order.
- Exclude IDs already present in `src/answerReview/regeneratedExplanations.json`
  (**done** — never reclaimed).
- Exclude IDs held by any other run's **active, unexpired** claim (**in progress
  elsewhere** — skip, do not wait, do not duplicate).
- Take the next `batchSize` IDs (default 33) from what remains, in file order.
- Record the claim in `ai-improvement-logs/batch_claims.json` keyed by `runId`,
  **before** any generation work starts.

### Claims MUST expire
- Every claim carries `claimedAt` and `ttlMinutes` (default 90). A claim past its TTL is
  **stale** — treated as an abandoned/crashed run and silently excluded from "active"
  the next time any run reads the claims file. Stale claims are pruned opportunistically
  (every read-modify-write), not by a background process.
- This makes the protocol self-healing: a crashed agent never permanently locks out a
  question range.

### Claims MUST be released on completion (or failure)
- After a successful merge into `regeneratedExplanations.json`, the run calls
  `complete` to remove its claim immediately — freeing the lock file before TTL expiry
  is the fast path; TTL is only the fallback for a run that never got to call `complete`.
- A run that errors out before merging should call `release` in a `finally` block so its
  reserved range becomes available again right away instead of waiting out the TTL.

### Claim-file writes MUST be mutually exclusive
- Every read-modify-write of `batch_claims.json` (claim, complete, release) is guarded by
  an exclusive lock file (`ai-improvement-logs/.batch_claims.lock`, created with `wx` —
  fails if it already exists). A holder that dies mid-write leaves a lock file older than
  `LOCK_STALE_MS` (30s); the next acquirer detects the age and force-clears it rather than
  waiting forever.
- This is a single-machine, same-filesystem lock (no distributed consensus) — sufficient
  because all scheduled runs execute against the same local repo checkout.

## Claims File Schema

`ai-improvement-logs/batch_claims.json`:

```json
{
  "morning-2026-07-15T08:00:00Z": {
    "ids": ["obj-2.5-source-q006", "obj-2.5-source-q007", "..."],
    "claimedAt": "2026-07-15T08:00:03.120Z",
    "ttlMinutes": 90,
    "status": "in_progress"
  }
}
```

- `ids` — exact ordered list of question IDs reserved by this run.
- `claimedAt` — ISO timestamp set at claim time; TTL is measured from here.
- `ttlMinutes` — this claim's own TTL (allows a slow run to be claimed with a longer TTL
  via `--ttl-minutes` without affecting other runs' defaults).
- `status` — always `"in_progress"` while present in the file; a completed or released
  claim is deleted from the file entirely rather than marked `"done"`, since
  `regeneratedExplanations.json` is the single source of truth for completion.

## Algorithm

```
claim(runId, batchSize, ttlMinutes):
  lock()
  try:
    claims = readJson(CLAIMS_PATH) or {}
    prune expired claims (now - claimedAt > ttlMinutes)
    if claims[runId] exists (idempotent re-claim, e.g. retry after crash):
      return claims[runId].ids
    allIds = flatten(CLEAN_QUESTIONS in file order)
    completedIds = Object.keys(readJson(STAGING_PATH))
    activeClaimedIds = union of claims[*].ids for all OTHER runIds
    available = allIds - completedIds - activeClaimedIds
    taken = available.slice(0, batchSize)
    claims[runId] = { ids: taken, claimedAt: now(), ttlMinutes, status: "in_progress" }
    writeJson(CLAIMS_PATH, claims)
    return taken
  finally:
    unlock()

complete(runId):
  lock(); claims = readJson(...); delete claims[runId]; writeJson(...); unlock()

release(runId):
  same as complete — releasing and completing both just drop the claim;
  the caller's own success/failure branch decides which one to call.
```

## Quality Checklist

- [ ] A run calls `claim` **before** generating any explanation, never after.
- [ ] A run calls `complete` **only after** the merge into `regeneratedExplanations.json`
      has succeeded — never before, or a crash between claim and merge would falsely
      free IDs that were actually still in flight for a few seconds.
- [ ] A run wraps generation + merge in try/finally and calls `release` on any thrown
      error, so failures don't hold a range hostage for the full TTL.
- [ ] `batchSize` defaults to 33 (matches the scheduled task's regular-batch size) but is
      a CLI flag, not hardcoded, so ad hoc runs can request a different size.
- [ ] `ttlMinutes` defaults to 90 — long enough for a full 33-question 99-spec generation
      pass, short enough that a crashed run doesn't block same-day re-runs for hours.
- [ ] The claims file and lock file live in `ai-improvement-logs/`, are `.gitignore`-able
      scratch state (not meant to be committed), and are never confused with
      `flagged_questions_resolved.json` (a different, permanent ledger).

## CLI Usage

```bash
# Claim the next batch (prints JSON: { runId, claimedIds, claimedAt })
node scripts/claimQuestionBatch.mjs claim --run-id=morning-2026-07-15 --batch-size=33

# After merging results into regeneratedExplanations.json:
node scripts/claimQuestionBatch.mjs complete --run-id=morning-2026-07-15

# On error, before exiting:
node scripts/claimQuestionBatch.mjs release --run-id=morning-2026-07-15

# Inspect current claims + pool coverage:
node scripts/claimQuestionBatch.mjs status
```

## Failure Modes & Recovery

| Scenario | What happens |
|---|---|
| Two runs call `claim` at the same instant | Lock file serializes them; second waits (≤15s default timeout), then sees the first run's claim and gets the *next* unclaimed range instead — no overlap. |
| A run crashes after claiming, before generating | Claim sits in the file until `ttlMinutes` elapses, then is pruned on the next `claim`/`status` call and its IDs become available again. |
| A run crashes mid-write to `batch_claims.json` | Lock file is left behind; next acquirer sees it's older than 30s and force-clears it before retrying. |
| A run's claim expires while it's still legitimately working (slow generation) | It should pass a larger `--ttl-minutes`; if it finishes and calls `complete` after expiry, `complete` is a no-op if the claim was already pruned (safe — the merge into `regeneratedExplanations.json` is what actually matters, not the claim). |
| Same `runId` calls `claim` twice (retry) | Idempotent — returns the same `ids` list already on record rather than claiming a second, different batch. |
