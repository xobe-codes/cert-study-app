# Question & Lab Metrics — 99+ Follow-on Spec

**Status:** STAGE A STARTS WITH QUESTION V2 · STAGE B IS AUDIT-SEQUENCED

**Sequencing:** Stage A begins in the initial Question V2 implementation and covers
inventory, canonical identifiers, event definitions, idempotency, compatibility, and
reconciliation tests. After Question V2 and Lesson Logic, the full-app audit confirms
Stage B dependencies and priority; Stage B completes lesson/Domain Pass/lab rollups
and UI after their source workflows stabilize. This document does not authorize
analytics schema, database, API, or deployment changes.

## 1. North star

Every active question and lab produces trustworthy, explainable learning metrics
that answer:

- What did the learner attempt?
- Was it correct/completed, and on which attempt?
- Which objective, sub-objective, CKU, skill, and misconception did it exercise?
- How long did meaningful work take?
- Did lesson remediation improve the next attempt?
- Is the learner improving, retaining, or repeatedly guessing?
- Is a weak score caused by learner mastery, bad content, or missing data?

## 2. Coverage contract

Track all supported question types and surfaces using stable IDs:

- MC, multi-select, ordering, CLI, scenario/exhibit questions;
- Practice, Topic Focus, Review/SRS, Missed Retest, Placement, Domain Pass, Mock,
  and Trap Drill;
- every active lab, checkpoint, hint, retry, validation result, completion, score,
  and abandonment/resume;
- lesson remediation entry, exact anchor viewed, return to question/lab, and next
  outcome.

Quarantined/invalid content is excluded from mastery calculations but remains
visible in content-health metrics.

## 3. Canonical event contract

Reuse the existing event/storage systems before adding fields. Define one versioned
event envelope with:

- event ID and schema version;
- learner-local/pseudonymous identity appropriate to current privacy rules;
- session, surface, content ID, content version, and timestamp;
- canonical primary domain from the shared objective registry plus explicitly
  related domains where applicable—never a file/prefix/array-position inference;
- objective, official sub-objective, CKU/concept, skill, and difficulty;
- attempt number, response type, correctness/result, duration, confidence, and hint
  usage where applicable;
- question selected canonical index/set or normalized CLI outcome without storing
  unnecessary sensitive/free-form data;
- lab ID, checkpoint ID, validation category, retry/hint state, and completion;
- remediation source/target anchor and return outcome;
- offline/idempotency metadata so reconnect does not double-count.

## 4. Metric definitions

Before building dashboards, define numerator, denominator, exclusions, and freshness
for every metric. Minimum set:

- question exposure, attempt, first-try accuracy, eventual accuracy, repeat-miss,
  response time, confidence calibration, missed-retest clearance, and retention;
- mastery by question → CKU → sub-objective → objective → domain;
- lab start, checkpoint success, error category, hint depth, retries, completion,
  score, time-on-task, resume, and abandonment;
- lesson-to-question and lesson-to-lab remediation lift;
- content-health escape/flag rate separated from learner performance.

Never treat unanswered, skipped, malformed, quarantined, duplicated, or offline-
unsynced events as ordinary wrong answers.

## 5. Accuracy and safety gates

- exactly-once/idempotent ingestion across online/offline retry;
- stable content versions so changed questions do not corrupt historical trends;
- automated reconciliation from raw events to displayed aggregates;
- fixtures for every question type, surface, lab checkpoint result, resume, and
  remediation loop;
- clear “insufficient data” states instead of fabricated percentages;
- local/export/delete behavior consistent with existing privacy expectations;
- no new D1/API/auth/deployment work without explicit file/schema approval;
- dashboards come last, after event correctness and backfill/compatibility tests.

## 6. Phased implementation

### Stage A — Initial implementation pass

1. Inventory existing events, storage, progress calculations, and lab tracking.
2. Publish a canonical content-ID/domain/sub-objective/version dictionary.
3. Publish versioned question event schemas and offline/idempotency behavior.
4. Reconcile raw fixtures to current question totals across every type/surface.
5. Inventory canonical lab/checkpoint IDs and missing/duplicate tracking points.
6. Preserve existing history through compatibility normalization.

Stage A does not change final mastery formulas or add dashboards.

### Stage B — After lessons and Domain Pass stabilize

1. Add remaining lesson, Domain Pass, and lab instrumentation behind tests.
2. Finalize metric numerators, denominators, exclusions, and mastery formulas.
3. Reconcile offline, resume, duplicate, and content-version behavior end to end.
4. Build trustworthy learner and content-health rollups.
5. Add UI only after displayed totals reconcile with source events.

## 7. Definition of done

Stage A is done when question tracking inputs are canonical, versioned, idempotent,
compatible, and reconciled, with every lab/checkpoint inventoried. Full completion
occurs when every active question and lab is covered by the versioned contract; raw
events reconcile to displayed totals; mastery excludes invalid content; lesson
remediation impact is measurable; offline/resume does not duplicate attempts; and
remaining gaps are listed by exact content ID and surface.
