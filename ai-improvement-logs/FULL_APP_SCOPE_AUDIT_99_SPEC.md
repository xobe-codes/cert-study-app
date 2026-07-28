# Full-App Scope Audit — 99+ Without a Rebuild

**Status:** RUN AFTER QUESTION V2/TRACKING STAGE A AND LESSON LOGIC

**Sequencing gate:** Begin only after the first two implementation plans publish
their implementation reports and pass their acceptance gates:

1. `WRONG_ANSWER_DEBRIEF_99_SPEC.md` including Metrics Stage A;
2. `LESSON_BANK_ALIGNMENT_99_SPEC.md` including lesson workflow/readability.

The audit is discovery and planning. It may write only its reports/matrices/queue
and project log. Feature fixes begin afterward in approved, bounded batches.

## 1. North star

Determine what prevents the existing CCNA app from meeting its complete product,
learning, engineering, and operational spec—then produce the smallest reuse-first
path to close those gaps without replacing the app, discarding learner history, or
creating parallel systems.

Guiding order:

```text
Verify what exists
-> identify broken/missing connections
-> extend shared foundations
-> consolidate duplicates
-> quarantine unsafe content
-> replace only when evidence proves extension is riskier
```

## 2. Audit principles

- Treat current runtime behavior and tests as evidence, not old “shipped” claims.
- Distinguish implementation gaps from stale documentation and generated artifacts.
- Reuse existing grading, question health, lesson, lab, navigation, storage, event,
  UI, and deployment paths.
- Preserve learner attempts, SRS, missed history, flags, lesson progress, Domain Pass,
  lab progress, settings, and offline data.
- Do not score the app from artifact counts alone; validate complete learner loops.
- Do not propose a rewrite because a subsystem is rough. Document why an existing
  foundation can or cannot safely be extended.
- Separate facts, assumptions, recommendations, and deferred decisions.

## 3. Full scope

### Product and learner workflows

- onboarding, placement/baseline, Study, Practice, Topic Focus, Review/SRS, Missed
  Retest, Trap Drill, Domain Pass, Mock, labs, commands, search, tutor, settings;
- navigation, deep links, Back/Resume, interruption recovery, empty/error states;
- teach → practice → feedback → exact remediation → retest → retention continuity;
- readiness, mastery, progress, recommendations, celebrations, and next actions.

### Content and curriculum

- all six domains, objectives, official sub-objectives, CKUs, questions, lessons,
  labs, commands, traps, flashcards, exhibits, references, and blueprint coverage;
- canonical ownership and cross-artifact links;
- factual accuracy, ambiguity, duplication, stale IOS/content, readability, and
  formatting;
- active, quarantined, generated, patched, and orphaned content sources.

### Assessment integrity

- grading for MC, multi-select, ordering, CLI, scenario/exhibit, labs/checkpoints;
- pool selection, blueprint balance, exposure/repetition, timers, skip/submit;
- immediate versus deferred feedback, shuffle mappings, corrected content versions;
- Domain Pass, Placement, Mock, focus, and retest result semantics.

### Labs and hands-on learning

- lab registry/IDs/domain/sub-objective ownership;
- readiness, instructions, terminal/simulator, checkpoints, hints, mistakes,
  validation, scoring, retry/resume, badges/progress, remediation links;
- interpret versus configure labeling and learner expectations;
- question/lesson/lab continuity and full metrics eligibility.

### Data, tracking, and compatibility

- canonical content identifiers and versions;
- event/storage writers and readers, duplicated calculations, idempotency/offline;
- local cache refresh, migrations/normalization, import/export, resume, backup;
- question, lesson, Domain Pass, lab, mastery, confidence, SRS, and content-health
  reconciliation;
- privacy, retention, deletion/export, and insufficient-data behavior.

### UI/UX and accessibility

- shared design language, hierarchy, density, cognitive load, consistency;
- mobile 320/390, tablet, desktop, portrait/landscape, 200% zoom;
- keyboard, focus, screen reader, non-color states, contrast, reduced motion;
- loading/empty/error/offline/resume and long-content layouts;
- major learner state matrix across light/dark themes.

### Reliability, performance, and offline

- startup/lazy loading, question-bank/domain chunk loading, long-session stability;
- Core Web Vitals or appropriate runtime performance signals;
- caching/service worker/PWA correctness, stale-content behavior, reconnect;
- error boundaries, failed API/storage calls, recovery and observability.

### Security and governance

- API input validation, abuse/rate controls, unauthenticated mutation surfaces;
- secrets/config boundaries, D1/API access, learner data minimization;
- content rights/source attribution, AI-generated-content provenance;
- accessibility/privacy/policy risks. Audit only; changes remain approval-gated.

### Engineering and operations

- architecture boundaries, duplicate logic, generated/source drift, patch sprawl;
- tests by behavior/risk, validators that incorrectly exit success, flaky coverage;
- CI/build/deploy gates, rollback, environments, docs/handoffs, scheduled routines;
- dependency/config health without upgrading or changing lockfiles during audit;
- stale specs, contradictory trackers, dead/orphaned files, and queue accuracy.

## 4. Evidence collection

Use targeted inspection and existing commands first. For each subsystem capture:

- authoritative files and runtime consumers;
- current tests/validators and actual results;
- learner-visible route and state transitions;
- source/storage/event contracts;
- known flags, quarantines, reports, and unresolved handoffs;
- one representative happy path plus failure/resume/offline path;
- mobile/accessibility/performance evidence where applicable.

Do not run destructive compilation, remote mutation, deployment, dependency install,
or a command cautioned against by `ACTIVE_HANDOFF.md`. Request approval before API,
DB, auth, deploy, CI/build-config, or broad generated-corpus changes.

## 5. Finding format

Every finding includes:

| Field | Meaning |
|---|---|
| ID | Stable audit identifier |
| Severity | P0 wrong/unsafe · P1 blocked/misleading · P2 degraded · P3 polish |
| Confidence | Observed · reproduced · inferred |
| Surface/workflow | Learner and engineering location |
| Evidence | File, command, test, screenshot/state |
| Impact | Learning, data, UX, reliability, security, maintenance |
| Root cause | Earliest shared cause, not downstream symptom |
| Reuse path | Existing function/component/service to extend |
| Proposed fix | Smallest bounded correction |
| Files/approval | Expected diff and required gates |
| Validation | Test/metric proving closure |
| Dependencies | Which findings/phases must land first |

## 6. Required deliverables

- `ai-improvement-logs/FULL_APP_SCOPE_AUDIT_REPORT.md` — executive and domain-by-
  domain/workflow findings with evidence;
- `ai-improvement-logs/FULL_APP_SCOPE_MATRIX.json` — machine-readable subsystem,
  workflow, content, ID, status, finding, owner/dependency data;
- `ai-improvement-logs/FULL_APP_IMPLEMENTATION_ROADMAP.md` — phased reuse-first
  closure plan, exact gates, and no-rebuild justification;
- refreshed implementation queue containing only reproducible open work;
- contradiction ledger for specs/reports/queues that disagree;
- verification baseline with commands passed/failed/skipped and why;
- explicit “keep/extend/consolidate/replace/defer” decision for every major subsystem.

## 7. Audit phases

### A0 — Reconcile sources of truth

Pin the commit, read active handoff/protection files, list authoritative specs,
compare trackers/reports/queues/runtime, and publish contradictions before scoring.

### A1 — Canonical inventory and contracts

Map routes/workflows, content IDs/ownership, storage/events, shared UI, APIs, labs,
tests, build/offline, and operational dependencies.

### A2 — Learner-loop validation

Exercise representative flows in all six domains: Study, Practice, miss/remediate/
retest, Domain Pass, Mock review, lab, resume/offline, flagging, and progress.

### A3 — Cross-cutting quality audits

Run focused content, accessibility, responsive, performance, reliability, security/
privacy, and data-reconciliation checks.

### A4 — Root-cause clustering

Group symptoms under shared causes such as canonical-ID drift, stale cache, duplicate
grading, renderer divergence, invalid validator exits, or disconnected remediation.

### A5 — Roadmap and review

Sequence smallest safe batches. Put foundational producer fixes before downstream
consumers. Obtain fresh-context review for P0/P1 and high-risk recommendations.

## 8. No-rebuild decision rule

Default decision is **extend**. Replacement is permitted only when the audit proves:

1. the existing boundary cannot satisfy the required contract safely;
2. incremental correction would cost/risk more than contained replacement;
3. learner data compatibility and rollback are defined;
4. all consumers are identified;
5. the user approves the exact replacement scope.

No proposal may replace the entire app, navigation shell, content corpus, storage
model, or design system as one project.

## 9. Acceptance gates

- [ ] Every major route, workflow, content type, store, event family, API, and lab
      appears in the scope matrix.
- [ ] All six domains have representative learner-loop evidence.
- [ ] Runtime findings are separated from stale documentation claims.
- [ ] P0/P1 findings have reproduction, root cause, smallest reuse path, and test.
- [ ] Question, lesson, domain, lab, flag, and metric ownership contracts reconcile.
- [ ] Existing learner-data compatibility is addressed for every proposed change.
- [ ] UI/UX/accessibility, offline/resume, performance, security/privacy, testing,
      and operations are not omitted.
- [ ] Roadmap dependencies prevent downstream work from preceding foundational fixes.
- [ ] Every replacement recommendation passes the no-rebuild decision rule.
- [ ] Queue contains no duplicate, stale, non-reproducible, or already-shipped work.
- [ ] Reports are readable cold by a new session and identify the next approved batch.

## 10. Post-audit implementation sequence

The roadmap determines exact priority, but expected ordering is:

1. P0/P1 cross-app integrity/reliability defects;
2. shared data/identity/event/storage foundations;
3. broken learner loops and accessibility;
4. Domain Pass 99 and lab workflow gaps;
5. Metrics Stage B and reconciled dashboards;
6. performance/offline/maintainability polish.

Each batch remains small, extends existing systems, updates `PROJECT_LOG.md`, runs
the relevant validators/tests/build, and stops at normal approval gates.

## 11. Definition of done

The audit is complete when the app's full current scope is evidenced, contradictions
are reconciled, every material gap has a root cause and reuse-first disposition, and
the roadmap can take the existing app to full spec through bounded changes without
a complete rebuild.
