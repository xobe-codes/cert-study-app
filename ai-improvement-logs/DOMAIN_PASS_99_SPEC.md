# Domain Pass — 99+ Current Implementation Spec

**Status:** EXPECTED POST-AUDIT IMPLEMENTATION PHASE

**Sequencing gate:** Question V2 and Lesson Logic must be complete, then
`FULL_APP_SCOPE_AUDIT_99_SPEC.md` confirms priority/dependencies. This spec replaces
the outdated fragmented progression/results proposals as the active Domain Pass
contract.

Tracking Stage A is already active by this phase. Domain Pass extends the canonical
event contract with attempt manifests, mode, coverage, skip/timer/result, remediation,
and resume semantics; final aggregates/dashboard remain Metrics Stage B.

**Reuse:** `features/domainPass/`, `buildDomainPassPool.js`,
`domainPassConfig.js`, `domainQuestionExposure.js`, `domainPassStorage.js`, shared
grading/feedback, question health, and lesson-remediation handoffs.

## 1. North star

Domain Pass is the trusted “prove this domain” assessment and remediation loop:

```text
Readiness guidance
-> healthy blueprint-aligned assessment
-> deferred scoring/review
-> exact weak sub-objectives and misconceptions
-> lesson/lab/missed remediation
-> return to focused or full retest
-> durable, explainable domain status
```

It must never test the wrong domain, recycle invalid content, leak answers during
assessment, confuse focus practice with a full pass, or produce mastery from
insufficient/misaligned questions.

## 2. Canonical domain contract

One registry owns the mapping:

```text
domain ID/slug
-> official objective IDs
-> official sub-objectives
-> eligible question IDs
-> lesson anchors, lab IDs, and metric dimensions
```

Rules:

- every eligible question has a stable ID, content version, canonical `objectiveId`,
  canonical `domainId`, official sub-objective reference, and CKU/concept;
- `domainId` is resolved from the objective registry—not `objectiveId.split`,
  domain array index, file location, or question-ID naming;
- unknown/mismatched/unmapped questions are excluded and reported, never defaulted
  into Domain 1;
- integrative questions have one primary scoring domain plus explicit related
  domains; they count once in a full Domain Pass;
- question movement between domains is versioned and does not rewrite historical
  attempts silently;
- the pool manifest and lesson/lab/metric ownership use the same resolver.

## 3. Eligibility and pool integrity

Eligible questions must:

- pass Question V2 key, feedback, formatting, ownership, and health gates;
- not be quarantined or unresolved P0/P1;
- support the assessment question type and deferred-review contract;
- map to the selected domain and an official sub-objective;
- have a stable learner-visible content version;
- retain complete exhibits/assets and shuffle-safe grading.

Pool validation reports, per domain:

- eligible/blocked counts and exact IDs/reasons;
- coverage by objective, sub-objective, CKU, skill, difficulty, and question type;
- duplicate/near-duplicate families;
- unseen/stale/recent availability;
- shortage or over-concentration risk.

No assessment starts when the validated pool cannot meet its declared coverage.
Offer a clear unavailable/focus-practice path instead of lowering the contract
silently.

## 4. Assessment blueprint

Keep the current 80% pass threshold until evidence supports changing it. The full
pass size remains blueprint-weighted using current configuration, but the selection
contract must ensure:

- every official objective receives representation when the healthy pool allows;
- high-weight/large objectives receive proportionate coverage without starving
  smaller objectives;
- sub-objective coverage is explicit, not accidental random sampling;
- one objective cannot dominate because it has more generated questions;
- difficulty and skill mix are declared and tested;
- carryover skipped questions remain eligible only if still healthy/version-valid;
- unseen → stale → recent-wrong is preferred; recently correct questions are
  spillover only while healthy unseen questions remain;
- deterministic seed/session manifest allows a disputed attempt to be reproduced.

Focus Pass is remediation practice, not a substitute for a full Domain Pass. Store,
label, score, and display it separately; it cannot set the full-domain passed flag.

## 5. Assessment behavior

- readiness is honest guidance based on available baseline/study/practice evidence;
  it does not fabricate prerequisites or trap the learner behind stale data;
- timer settings, question count, coverage, and pass threshold are stated before
  start;
- one canonical grader handles MC, multi-select, ordering, CLI, and supported types;
- submission is idempotent and answers lock at the appropriate time;
- no correctness colors, rationale, focus announcement, or answer-revealing CTA
  appears until submit/review;
- unanswered/skipped is reported separately from an attempted wrong answer, while
  scoring rules remain explicit;
- timer expiry and early submit preserve the exact manifest/responses;
- invalid/missing content discovered mid-session is removed from the denominator or
  the attempt is marked invalid according to a documented rule—never silently wrong;
- refresh/offline/resume restores the same attempt without duplicate scoring.

## 6. Results and remediation UX

Results use one clear hierarchy:

1. score, pass/fail, correct/attempted/skipped, and assessment validity;
2. coverage confidence—whether enough healthy questions supported the result;
3. top weak sub-objectives/misconceptions with evidence counts;
4. one primary next action;
5. optional detailed review and secondary tools.

On fail or weak pass:

- learner-selected wrong choice appears with Question V2 feedback;
- “Review this” opens the exact lesson sub-objective anchor;
- relevant lab CTA targets the same sub-objective/CKU;
- return restores the Domain Pass debrief and offers focused retest;
- remediation success updates weakness evidence but does not rewrite the completed
  full-pass score.

On pass:

- preserve weak-but-passed evidence; do not claim perfect mastery;
- recommend the next domain, maintenance, or Mock based on transparent rules;
- keep detailed tools available without overwhelming the primary next action.

## 7. Persistence and compatibility

Version the Domain Pass record with:

- attempt/session ID, domain, assessment mode, manifest and question versions;
- started/submitted timestamps and timer state;
- canonical responses, correct/attempted/skipped counts, score, and validity;
- objective/sub-objective/CKU coverage;
- weak evidence and remediation handoff state;
- content/blueprint version used.

Preserve existing local records through normalization. Historical records lacking
new fields remain visible as legacy/limited-confidence; do not invent coverage or
silently recalculate them against changed keys.

If a post-attempt content correction invalidates a question, mark affected attempt
confidence and offer a fair retest. Do not silently change a stored score.

## 8. Flagging, health, and automation

- Question Flag is available in debrief with domain/session/content-version context.
- Confirmed P0/P1 content is removed from new pools immediately.
- Pool manifests are revalidated when health, key, owner, or content version changes.
- Automation may rebuild manifests, identify coverage holes, and propose replacement
  questions/tests; it may not auto-publish factual/key changes or pass a learner.
- Mass-removal safety brake stops a registry/pool build that unexpectedly excludes a
  large portion of a domain.

## 9. UI/UX and accessibility bar

- hub shows six domains with consistent readiness/status meanings;
- Full Pass versus Focus Pass is unmistakable;
- question UI meets the Question V2 mobile/keyboard/screen-reader/zoom contract;
- assessment and review timing never leak answers;
- progress/timer does not cause layout shift or rely on color alone;
- results expose one primary action, top three weaknesses, and progressive detail;
- 320px, landscape, 200% zoom, light/dark, reduced motion, offline/resume pass;
- empty/shortage/invalid states are recoverable and never blank.

## 10. Phased implementation

### P0 — Reconcile current implementation

Inventory current hub, full/focus sessions, config, pool, exposure, storage, results,
readiness, handoffs, and tests against this spec. Publish exact gaps; do not rebuild.

### P1 — Canonical ownership and pool gate

Use the shared registry resolver, validate every eligible ID, publish domain pool
manifests, block mismatches/unmapped/invalid content, and add mass-removal safety.

### P2 — Blueprint selection and assessment integrity

Make objective/sub-objective coverage deterministic and testable; preserve exposure,
carryover, supported types, manifests, timer, skip, resume, and deferred review.

### P3 — Results/remediation fluidity

Align results with exact lesson/lab anchors, preserve debrief return state, separate
Focus from Full status, and simplify next actions.

### P4 — Persistence, regression, and metrics handoff

Version attempts/content, normalize legacy records, cover corrected-content behavior,
run full UX/accessibility/e2e validation, and emit the metrics contract handoff.

## 11. Acceptance gates

- [ ] Every eligible question resolves to exactly one canonical primary domain and
      an official sub-objective; zero silent fallbacks.
- [ ] Each domain manifest contains only healthy, versioned, correctly owned IDs.
- [ ] Declared objective/sub-objective/type/difficulty coverage matches the actual
      assessment manifest.
- [ ] Full and Focus attempts cannot overwrite or masquerade as each other.
- [ ] Grading, shuffle mapping, skipped handling, timer expiry, and resume are tested
      for every supported question type.
- [ ] Assessment mode never reveals answers before review.
- [ ] Weak evidence maps to exact lesson/lab remediation and returns to debrief/retest.
- [ ] Existing records survive normalization without invented historical detail.
- [ ] Content correction/quarantine cannot silently alter an old score.
- [ ] Pool shortage/mass removal fails safely with exact IDs and reasons.
- [ ] UI/UX/accessibility state matrix and `verify:ship` pass.
- [ ] Implementation report hands stable attempt/domain/question dimensions to
      `METRICS_TRACKING_99_SPEC.md`.

## 12. Definition of done

All six Domain Pass pools are healthy, reproducible, blueprint-aligned, and use the
same canonical ownership as questions, lessons, labs, flags, exposure, and metrics;
assessment behavior is fair and resumable; results drive exact remediation; Full
versus Focus status is trustworthy; and all remaining exceptions are listed by ID.
