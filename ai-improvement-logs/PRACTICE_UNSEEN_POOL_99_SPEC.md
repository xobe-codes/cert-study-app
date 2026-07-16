# Practice Unseen Pool — 99 Implementation Spec

**Slice C** · Smarter Practice / domain practice question rotation  
**Status:** SPEC DONE (no product code in this slice)  
**Related:** Spec 1 exposure contract (`buildExposureAwarePool`), Spec 2 `domainProgressBus`, Spec 3 miss clear

---

## 1. North star

Learners doing repeated Practice or Domain Pass sessions in the same domain should **burn through the bank** — unseen first, misses retried, stale recycled — while **questions they already answered correctly stop auto-recycling**. One shared exposure ledger (`ccna_domain_question_exposure_v1`) drives pool selection across Practice, Domain Pass, Mock Bank burn, and Domain sim; no parallel “correct ledger.” Correct outcomes extend the existing store; pool pickers gain a **success-weighted deprioritization** tier without breaking miss-retry priority.

---

## 2. Current state

| Area | Already there | Gap vs user ask |
|------|---------------|-----------------|
| **Exposure store** (`domainQuestionExposure.js`, key `ccna_domain_question_exposure_v1`) | Per-domain `questionId → lastSeenAt` (ms). `recordSeen`, `loadDomainQuestionExposure`, `getDomainSeenMap`, `getExposureStats`, `pickExposureTier` (unseen / stale / recent, 14-day stale window). | **No correct outcome field.** Correct and wrong both become “recent seen” with identical weight. |
| **Pool picker** (`buildExposureAwarePool.js`) | Spec 1 mix: 60% unseen · 25% stale · 15% miss-retry; soft floor (≥10 unseen → max 1 recent spill). Used by Practice (`pickQuizSessionSet`) and Mock (`bankBurnPool`). | Recent spill can still serve **recently-correct** questions when unseen pool is thin. No “correct-at-least-once” tier. |
| **Domain Pass pool** (`buildDomainPassPool.js` → `fillExposureRemainder`) | Parallel exposure-tier logic (same 60/25/15 + soft floor); carryover skips; weak-objective slot. | Duplicate implementation vs `buildExposureAwarePool`; same correct-blind tiering. |
| **Practice** (`QuizTab.jsx`) | Loads exposure + `buildExposureAwarePool` via `pickQuizSessionSet`; `missRetryIds` from **same-objective** misses; within-session wrong re-queue only; `recordSeen` at **session end** for all session IDs. | Per-answer exposure not wired; `recordGradedAnswer` unused. Correct answers never recorded to exposure at grade time. Domain-wide miss retry not used in Practice. |
| **Domain Pass** (`DomainPassSession.jsx`) | `exposureStats` into `buildDomainPassPool`; `recordSeen` at session end. | Same: no per-answer correct flag; correct ≡ seen. |
| **Mock Bank burn / Domain sim** (`MockExam.jsx`, `bankBurnPool.js`) | `buildBankBurnPool` → `buildExposureAwarePool`; `recordSeen` at done for all session questions; coverage delta UI on bank burn. | Full mock exam pool is blueprint-weighted (no exposure). Bank burn shares correct-blind tiers. |
| **Miss retry** (`missed` store, `missClearProgress`, `missDrillQueue`) | Wrong → `missed`; `missRetryIds` prioritized in pool; 2-correct clears miss; within-session re-queue on 2nd miss (Practice). | Works for **wrong** only. Correct deprioritization is not miss-clear — separate concern. |
| **Per-question SRS** (`quizBankStorage.recordQuizResult`) | Objective-scoped `attempts[]` + SRS in quiz bank. | Not read by domain exposure pool; objective-local only. |
| **`recordGradedAnswer`** (`domainProgressBus.js`) | Spec 2 writer: engagement + optional `recordSeen` per graded answer. | **Dead code** — zero call sites. Intended path never shipped. |

**Verdict:** Exposure-aware **unseen-first** rotation exists and is wired in Practice + Domain Pass + Bank burn. **Missing:** persisting **correct** into the exposure ledger and deprioritizing **recent-correct** below stale / unseen (while keeping miss-retry on top).

---

## 3. Target behavior

### Practice (objective-scoped session, domain exposure)

| Trigger | Pool behavior |
|---------|---------------|
| Start Practice (any session size) | Prefer unseen → stale → miss-retry (domain misses for that objective, then expand to domain-wide in P1) → **recent-wrong / recent-seen-only** → **recent-correct last** (spill only when bank exhausted). |
| Answer correct | Record `lastCorrectAt` (+ bump `correctCount`) in exposure ledger **at grade time** (not only session end). Still record `seenAt`. |
| Answer wrong | Existing miss path unchanged; question stays in miss-retry tier. |
| Same session | No change: wrong may re-queue; correct never re-queued in queue. |
| Next session, same objective/domain | Correct questions excluded from auto pool unless unseen + stale + miss-retry cannot fill session (hard spill cap: 0 recent-correct when ≥1 unseen exists; same soft floor as today for plain recent). |
| Fallback (`pickReviewSet`) | When exposure pool empty, keep confidence/CKU picker but **exclude recent-correct ids** when building candidate set. |

### Domain Pass

| Trigger | Pool behavior |
|---------|---------------|
| Start pass / focus pass | Same tier order as Practice; reuse shared `bucketByExposure` contract (consolidate `fillExposureRemainder` onto shared helper in P0/P1). |
| Grade answer | Wire `recordGradedAnswer` (or thin wrapper) with `correct` flag. |
| Session end | Keep batch `recordSeen` as safety net (idempotent with per-answer writes). |

### Mock (if cheap — P2)

| Surface | Behavior |
|---------|----------|
| Bank burn / Domain sim | Inherit correct-tier from shared picker automatically. |
| Full mock exam | **No change** (blueprint-weighted; exposure-agnostic). |

---

## 4. Minimal scope

### In

- Extend **in-place** `ccna_domain_question_exposure_v1` schema (backward compatible).
- `recordExposureOutcome(domainId, questionId, { seen?, correct? })` — single write API.
- Extend `pickExposureTier` / `bucketByExposure` / `buildExposureAwarePool` with **CORRECT_RECENT** (or equivalent) bucket below stale, above spill.
- Wire grade paths: `QuizTab`, `DomainPassSession`, `MockExam` (study/bank surfaces).
- Activate `recordGradedAnswer` **or** fold its contract into the exposure write (prefer one path).
- Vitest: tier classification, pool mix with correct entries, migration from legacy number timestamps.
- Optional P2: session-local `suppressCorrectIds` ref passed into pool builder; hub toggle “New questions only.”

### Out

- New storage key / parallel ledger.
- Full mock exam pool rewrite.
- AI question generation changes.
- Replacing `missed` store or `missClearProgress`.
- Per-objective SRS driving domain pool (stay separate).
- `App.jsx` routing / theme tokens.

---

## 5. Phased plan

### Schema (extend v1 in place)

**Legacy:** `store[domainId][questionId] = 1730000000000` (number = `seenAt`)

**v1.1 entry (normalized):**

```js
{
  seenAt: number,           // required after normalize
  lastCorrectAt?: number,   // set when graded correct
  correctCount?: number,    // monotonic; default 1 on first correct
}
```

**Normalize on read:** `number → { seenAt: number }`.  
**Write:** always persist object form for new writes; readers use `normalizeExposureEntry()`.

**Do not add** a second key in `storageKeys.js`.

---

### P0 — Wire & upgrade existing exposure path (~1 session)

**Goal:** Correct-blind spill stops without waiting on full persistence rollout.

1. **`domainQuestionExposure.js`**
   - Add `normalizeExposureEntry`, `getDomainExposureMap` (returns normalized entries).
   - Extend `pickExposureTier(entry, now)` → tiers: `unseen | stale | recent | correctRecent`.
     - `correctRecent`: `lastCorrectAt` within `STALE_DAYS_MS` (14d), same window as “recent seen.”
   - Add `recordExposureOutcome(domainId, questionId, { correct?, seen? })`.
   - Keep `recordSeen` as `seen: true` shim.

2. **`buildExposureAwarePool.js`**
   - `bucketByExposure`: split `recent` → `recentWrong` (seen, no recent correct) + `correctRecent`.
   - Mix targets unchanged for unseen/stale/miss-retry; **correctRecent spill budget = 0** when `unseenCount >= UNSEEN_SOFT_FLOOR`; else ≤1 (match current recent cap).
   - Spill order: `unseen → stale → missRetry → recentWrong → correctRecent`.

3. **`buildDomainPassPool.js`**
   - Route `fillExposureRemainder` through shared `bucketByExposure` + take logic (delete duplicate tier split) **or** mirror correctRecent split minimally — prefer single helper.

4. **Grade wiring (read correct from grade, write exposure)**
   - `QuizTab`: on each graded reveal, `recordExposureOutcome(domainId, q.id, { seen: true, correct })`.
   - `DomainPassSession`: same on grade / IDK.
   - Keep session-end `recordSeen` batch (idempotent).

5. **Tests**
   - Extend `domainQuestionExposure.test.js`, `specs1to7.test.js`, `bankBurnPool.test.js` for correctRecent tier.

**P0 does not require** backfill of historical corrects from quiz bank — only forward writes.

---

### P1 — Persist correct outcomes in exposure ledger (~1 session)

**Goal:** Cross-session “I got this right” sticks in the shared ledger.

1. Ensure every graded surface writes `lastCorrectAt` on correct (P0 paths + `recordGradedAnswer` activation).
2. **Practice `missRetryIds`:** widen from objective-only to **domain-scoped** misses (`collectDomainMisses` / `collectMissRetryIds` pattern from `bankBurnPool.js`) so domain practice honors wrongs from sibling objectives.
3. **`pickQuizSessionSet` fallback:** filter `recent-correct` ids out of `pickReviewSet` candidates when exposure map available.
4. **Hub meters:** `getExposureStats` optional counts: `correctRecentCount`, `unseenCount` (display only; no new UI required for ship).
5. **`recordGradedAnswer`:** wire from Domain Pass + Practice as the canonical graded writer (engagement + exposure); deprecate duplicate direct `recordSeen` on grade once wired.

---

### P2 — Optional polish

1. **Session-local suppress:** `sessionCorrectIdsRef` — ids answered correct **this session** passed into `buildExposureAwarePool` as hard exclude (even if not yet flushed to storage).
2. **“New questions only” filter:** Domain Pass hub / Practice idle chip — sets `poolMode: 'unseenOnly'` → pool built exclusively from unseen (+ miss-retry if `missOnly`), zero stale/correct spill unless bank cannot fill `sessionSize`.
3. **Mock full exam:** no work unless product asks for exposure-aware blueprint (out of scope).

---

## 6. Acceptance checklist

- [ ] Legacy exposure store (number timestamps) still loads; no migration script required.
- [ ] After answering a question **correct** in Practice, next Practice session in that domain **does not** auto-include that id unless bank cannot fill session size.
- [ ] After answering **wrong**, question remains eligible via miss-retry tier (not buried behind correct-recent).
- [ ] Domain Pass second attempt same day prefers unseen over questions correct on prior pass.
- [ ] Bank burn / Domain sim inherit behavior without separate pool code.
- [ ] Within-session: correct never re-queued (unchanged); wrong re-queue unchanged.
- [ ] `npm test` — tier + pool tests pass; `buildExposureAwarePool` correctRecent spill capped.
- [ ] No new storage key; `getDomainSeenMap` consumers still work via normalize shim.

---

## 7. Non-goals

- Spaced-repetition scheduling changes (`confidenceScheduler`, quiz bank SRS).
- Clearing `missed` on single correct (keep 2-correct rule).
- Premium AI batch generation bias.
- Exposure sync across devices (local storage only).
- Rebuilding `fillLegacyRemainder` / weak-objective adaptive math.

---

## 8. File map

| File | Role in slice |
|------|----------------|
| `src/features/domainPass/domainQuestionExposure.js` | Schema normalize, `recordExposureOutcome`, tier enum |
| `src/features/domainPass/buildExposureAwarePool.js` | `correctRecent` bucket + spill caps |
| `src/features/domainPass/buildDomainPassPool.js` | Consolidate remainder fill onto shared bucket helper |
| `src/features/domainPass/domainProgressBus.js` | Activate `recordGradedAnswer` as graded write bus |
| `src/tabs/pickQuizSessionSet.js` | Domain miss retry + fallback exclude correct |
| `src/tabs/QuizTab.jsx` | Per-answer exposure write on grade |
| `src/features/domainPass/DomainPassSession.jsx` | Per-answer exposure write on grade |
| `src/MockExam.jsx` | Session-end exposure (already); optional per-answer in study mode |
| `src/features/mockExam/bankBurnPool.js` | Unchanged call site; inherits pool behavior |
| `src/storageKeys.js` | Reference only — **no new key** |
| `src/__tests__/domainQuestionExposure.test.js` | Tier + normalize tests |
| `src/features/domainPass/__tests__/specs1to7.test.js` | Pool mix with correctRecent |
| `src/features/mockExam/__tests__/bankBurnPool.test.js` | Bank burn correct deprioritization |

---

## Cheapest first move (P0 entry)

1. Add `normalizeExposureEntry` + `correctRecent` tier in `domainQuestionExposure.js`.
2. Split `bucketByExposure` in `buildExposureAwarePool.js` (correctRecent spill = 0 when unseen floor met).
3. One line per grade path in `QuizTab.jsx`: `recordExposureOutcome(..., { seen: true, correct })`.

No new ledger. No App.jsx. Tests lock the contract before Domain Pass consolidation.
