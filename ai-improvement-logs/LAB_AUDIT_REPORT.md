# Lab System Audit — Canonical Identity Pass

**Date:** 2026-07-28
**Status:** IMPLEMENTED AND VALIDATED

## Baseline

- 82 lab bundles with validators.
- 53/53 CCNA objectives have at least one lab.
- 57 interpret-only, 25 configuration, and 10 troubleshooting labs.
- Existing focused lab gate: 16 test files / 436 tests passing.
- Existing structural validator reports zero errors.

## Canonical marker contract

The lab pass reuses the Domain Question Pass identity chain:

`schemaVersion → surface → domainId → objectiveId → questionId → ckuIds/trapId → labId → checkpointId`

Lab remediation and completion must preserve these identifiers instead of
creating a parallel objective/domain mapping.

## Confirmed gaps

### P1 — Runtime progress diverges from the displayed task list

`LabView` renders the quality-enriched task list returned by `getLab()`, but
`labProgress()` grades the raw validator registry. Runtime-added tasks can remain
visibly incomplete after the lab has already recorded completion. Completion
must derive from the displayed task/checkpoint state.

### P1 — Stem-replay mappings are not identity checked

The static replay table contains 167 mappings. Against the current runtime bank:

- 28 mappings cross canonical objective boundaries.
- 12 mappings reference questions that are no longer learner-visible.
- 52 current mappings have no direct question/lab CKU overlap.

The resolver currently prefers an interpret-only alternate without checking the
question's current objective or CKUs. Remediation selection must score the raw
target, its alternate, and objective-owned labs using canonical markers.

### P1 — Lab outcomes omit the question-pass markers

The active lab UI stores a completed lab ID and records an objective engagement,
but completion/command events do not include schema version, domain, CKUs,
checkpoint, remediation question, trap, or source surface. A shared lab event
builder is required so future metrics can join questions and labs reliably.

### P2 — Four labs disagree with canonical domain ownership

`LAB-TS-ACL-PLACEMENT`, `LAB-TS-DHCP-RELAY`, `LAB-TS-WRONG-MASK`, and
`LAB-TS-WLAN-VLAN` are Objective 3.6 labs but use topical domain labels from
other domains. Their canonical domain marker is `connectivity`; topical CKUs and
titles retain the scenario context.

### P2 — Task navigation misses the interaction-size floor

The task carousel buttons use 7px-high hit targets. They must retain compact dot
visuals inside at least 44×44px buttons, and the Verify disclosure must meet the
same floor.

## Shared implementation boundary

1. Add one canonical lab-marker/event helper.
2. Grade completion from displayed task/checkpoint state.
3. Make stem replay objective/CKU aware while preserving existing mappings as
   candidate hints.
4. Correct the four Objective 3.6 domain markers.
5. Add exhaustive identity/progress/remediation tests and live responsive lab
   checks before any lab-specific content rewrite.

## Delivered result

- Added one shared lab marker/event contract using the same schema, surface,
  domain, objective, question, CKU, trap, lab, and checkpoint identifiers as
  the Question V2 pass.
- Lab completion now derives from every checkpoint displayed to the learner,
  including runtime-enriched tasks.
- Stem replay now ranks remediation labs by canonical objective, domain, and
  CKU overlap instead of blindly accepting a stale static target.
- Corrected the four Objective 3.6 domain markers and removed those labs from
  unrelated per-domain quick-exam pools.
- Strengthened `validateLabs()` to enforce lab ID shape, objective/domain
  ownership, CKU shape, unique task and verification checkpoint IDs, and
  validator ownership.
- Raised task navigation and Verify controls to the 44px interaction floor.

## Validation

- Focused lab gate: 18 files / 509 tests passed.
- Full unit gate: 192 files / 1,759 tests passed.
- Content validation pipeline passed, including all 904 clean questions and
  all 53 objective visual audits.
- Production build passed. Existing large-bundle and circular-chunk warnings
  remain unchanged.
- Lab browser smoke gate: 12/12 passed, including 320px, 768px, 1440px,
  iPhone landscape terminal, 44px task controls, horizontal overflow, lab
  completion/exit, lab exam, domain filtering, deep links, and automation-lab
  presence.
- `git diff --check` passed.
