# Question Prompt & Wrong-Answer Feedback — 99+ Spec

**Status:** V2 READY FOR IMPLEMENTATION (audit first; no source changes yet)

**Updated:** 2026-07-27

**North star:** Every question is unambiguous, keyed correctly, and followed by
feedback that teaches why the learner's choice fails *this stem* and why the
correct choice satisfies it.

**Related:** `QUESTION_DEBRIEF_99.md` (runtime contract),
`QUESTION_LOGIC_AND_TOPIC_QUIZ_99_SPEC.md` (question-flow inventory),
`explanationPattern99.md` (regen fields), `EXPLANATION_REGEN_PROGRESS.md`.

---

## 1. Why this V2 exists

The original P0–P2 debrief spec improved the reveal UI and explanation plumbing.
Those mechanics are now substantially shipped:

- regen explanations participate in the runtime precedence chain;
- correct and wrong choices show reveal marks;
- MC distractor rationales are visible;
- the objective reference footer exists;
- targeted feedback tests pass.

The remaining learner problem is broader and more important than screenshot
parity: some prompts are awkward or ambiguous, some keyed answers or per-choice
metadata drift after regeneration, and structurally valid feedback can still be
generic, circular, or attached to the wrong option.

Observed baseline on 2026-07-27:

- `validate:answer-reviews`: 914 questions, 0 fallback explanations, 0 generic
  exam tips, but 2,254 stored templates rebuilt at runtime;
- `validate:regen-coverage`: 914/914 questions and 2,707/2,712 distractors covered,
  but 10 schema errors across five question records;
- the regen validator correctly returns a failing process status for those errors;
  the earlier apparent success came from a chained diagnostic command whose later
  test process supplied the final shell status;
- examples include grammatical stems such as "Which command create a NAT pool..."
  and regen `incorrect[]` entries pointing at the keyed correct choice.

This V2 treats question quality and answer feedback as one contract.

---

## 2. Learner experience contract

### Before answering

A question must:

1. ask exactly one answerable thing;
2. include every fact/exhibit needed to answer it;
3. use valid Cisco terminology and IOS syntax;
4. avoid accidental clues, double negatives, grammatical ambiguity, and
   unsupported absolutes such as “always” or “only”;
5. have one defensible keyed answer for MC, the complete defensible set for
   multi-select, an explicit valid sequence for ordering, or normalized accepted
   forms for CLI;
6. show exhibits and code without malformed punctuation or lost delimiters;
7. remain answerable after choice shuffling.

### Immediately after answering

On a miss, the learner sees this order:

1. **Your answer** — the exact selected choice/command/order;
2. **Why it is wrong here** — cite the stem constraint it violates;
3. **What this choice actually means/does** — teach the nearby concept without
   falsely describing it as nonsense;
4. **Correct answer** — name it and explain the deciding rule;
5. **Other distractors** — choice-specific rationales;
6. **Exam trap / memory anchor** — only when specific and useful;
7. **Next action** — relevant reference, trap drill, lab, or missed retest.

On a correct answer, show the deciding rule and concise distractor contrasts
without implying the learner made those mistakes.

### Feedback language rules

Feedback must not:

- say only “does not fit the scenario,” “is incorrect,” or “review the topic”;
- restate the keyed answer without explaining the mechanism;
- use circular text such as “X is right because X satisfies what is tested”;
- claim a distractor is always false when it is valid in another context;
- mention an answer letter without the choice text (letters shuffle);
- contradict the question key, Cisco behavior, or another rationale;
- expose internal terms such as SADE, CKU IDs, regen, gold batch, or template;
- overwhelm the learner with repeated paragraphs.

### UI/UX contract

The question experience must feel like one coherent product across every surface:

- **Before answer:** objective/type context is secondary; stem/exhibit and choices
  form the dominant reading path; the primary action is obvious and disabled until
  the response is valid.
- **After answer:** selected response and correctness are immediately perceivable
  without relying on color; focus/scroll moves predictably to the first useful
  feedback block without disorienting the learner.
- **On a miss:** “Your answer” and “Why wrong here” appear before supplemental
  detail; the correct answer and deciding rule remain visible without an extra tap.
- **On a correct response:** confirmation stays concise; optional distractor detail
  does not punish the learner with an unnecessarily long page.
- **During exam-like sessions:** no correctness styling, rationale, answer-revealing
  focus movement, or assistive announcement appears until that surface's review
  phase. Practice/retest surfaces may reveal immediately.
- **Next step:** Continue/Next is visually distinct from remediation actions and
  cannot be confused with changing the submitted answer.
- **Recovery:** loading, empty, malformed-question, missing-exhibit, and persistence
  failures provide a safe path forward and a Report Question action; the UI never
  renders a blank card or silently scores an invalid item.

---

## 3. Scope

### In scope

**Question integrity**

- grammar, clarity, exhibits, command syntax, answerability, duplicate choices;
- key correctness and multi-select completeness;
- objective/concept alignment and difficulty labeling;
- canonical-index versus shuffled-display-index safety;
- duplicate source/runtime IDs that can drift independently.

**Canonical domain ownership**

- every active question has one canonical `objectiveId` and `domainId` resolved
  from the official `DOMAINS`/`ALL_OBJECTIVES` registry at normalization time;
- domain membership is not inferred from file location, question-ID prefix, array
  position, or a fallback such as `1.1` when metadata is missing;
- a stored `domainId` must agree with the registry owner of `objectiveId`; mismatch,
  missing owner, or unknown objective is a blocking validation defect;
- integrative questions may declare related domains/sub-objectives, but retain one
  explicit primary owner for scoring, pool selection, progress, and metrics;
- the same canonical ownership follows the question through Practice, missed/SRS,
  lessons, Domain Pass, Mock, flags, exposure, local cache, and metrics;
- moving a question between objectives/domains creates a versioned mapping change
  with compatibility handling for saved attempts—never silent history reassignment.

**Question display consistency**

- one shared stem renderer across all quiz surfaces;
- reliable separation of question prose from routing tables, IOS output,
  configurations, JSON/YAML/XML, and other preformatted exhibits;
- preservation of meaningful line breaks, indentation, delimiters, and command
  prompts without displaying raw Markdown fences or escaped newline text;
- source-level removal of duplicated exhibits and answer-revealing comments;
- readable choice formatting for long commands, addresses, and structured text;
- safe horizontal scrolling for genuinely fixed-width exhibits, while ordinary
  prose wraps normally on mobile;
- accessible exhibit labels and reading order.

**Feedback integrity**

- `answerReview.correct` matches the current key and choice text;
- `incorrect[]` contains every and only wrong canonical index;
- each rationale matches its actual distractor;
- precedence across gold → regen → clean-bank → runtime fallback is deterministic;
- stale generated metadata cannot survive a key or choice-order change;
- correct explanation, `whyWrongHere`, `whatItDoes`, misconception family,
  memory anchor, and exam tip agree.

**Question types**

- single-choice MC and true/false;
- multi-select/select-all, including missing-correct and extra-wrong feedback;
- ordering, including first divergence and why sequence matters;
- CLI, including normalization, accepted abbreviations, mode/context, and why the
  submitted command fails;
- exhibit/scenario questions, including preservation of whitespace and syntax.

**Learner surfaces**

- lesson Practice (`QuizTab`);
- Topic Focus and Missed Retest;
- Review/SRS;
- Domain Placement and Domain Pass;
- Mock Exam review;
- Trap Drill and other consumers of `AnswerReview`.

**UI/UX quality**

- visual hierarchy, spacing, readable line length, and restrained feedback density;
- stable layout before/after reveal with no unexpected page jump;
- intentional focus management and scroll restoration;
- full keyboard operation with visible focus indicators;
- screen-reader names, roles, selected/correct/incorrect states, and polite result
  announcements;
- non-color correctness cues, adequate contrast, reduced-motion support, and text
  zoom up to 200%;
- minimum 44px touch targets and no horizontal page overflow at 320px;
- portrait/landscape phone, tablet, desktop, light/dark theme, and offline behavior;
- consistent loading, disabled, submitted, retry, flagged, and unavailable states;
- protection against double-submit, accidental answer changes after reveal, and
  losing the current question on refresh/resume.

**Quality operations**

- a reproducible audit with question IDs, source paths, defect category,
  severity, and proposed disposition;
- blocking validators and regression fixtures;
- question-flag feedback loop and post-release sampling;
- documentation of generated versus authoritative sources so fixes survive a
  rebuild.

**Flagging and remediation loop**

- learner-facing reasons map directly to this spec's defect taxonomy, including
  wrong key, unclear/missing context, multiple valid answers, wrong or unhelpful
  feedback, outdated IOS/fact, and broken display/exhibit;
- a flag captures question ID/objective, surface, question version/content hash,
  selected canonical choice (plus choice-text snapshot), reason, and timestamp;
- offline delivery is exactly-once from the client queue: a successful immediate
  POST is removed/acknowledged and is not counted again on reconnect;
- remote summaries retain reason counts, last-seen time, affected choice, question
  version, and recurrence after the last resolution—not only a lifetime total;
- quarantine decisions combine defect severity and independent evidence; repeated
  taps/retries from one client cannot alone simulate multiple learners;
- validator-detected P0/P1 defects can quarantine immediately, while learner-only
  reports use a conservative threshold and remain reviewable;
- resolution records link the finding to the source fix, commit/diff, validations,
  and resolved question version so genuine recurrence reopens cleanly;
- automation may prepare a fix candidate, tests, and report, but never silently
  publish factual, answer-key, or broad corpus changes.

**Initial app-tracking foundation**

- inventory every existing question, lesson, Domain Pass, lab, exposure, missed,
  SRS, confidence, progress, and event write/read path before changing tracking;
- define the canonical question/content/domain/sub-objective identifiers and content
  version carried by events during this initial pass;
- define versioned event names and required fields for question exposure, submit,
  result, skip, flag, feedback reveal, remediation open/return, and resume;
- make online/offline event writes idempotent and distinguish attempted wrong from
  skipped, invalid, quarantined, or unsynced content;
- add reconciliation fixtures proving raw initial-pass events reproduce displayed
  question attempts/misses without double counting;
- preserve existing learner history through compatibility normalization; do not
  clear local tracking stores;
- begin lab tracking inventory and canonical lab/checkpoint ID validation now, while
  deferring final lab mastery rollups until the lab workflow is audited;
- dashboards and final mastery formulas remain later work; foundational tracking and
  correctness tests are part of this initial implementation.

**Delivery to existing learners**

- repaired curated questions must replace stale copies already stored in
  `ccna_quiz_bank_v1` without erasing attempts, ratings, SRS state, or missed-review
  history;
- historical missed entries must remain understandable if a stem, choice text, or
  answer index changes;
- AI-fallback questions must pass the same minimum integrity/display checks before
  entering the local bank; invalid generated questions are rejected, not cached.

### Out of scope

- a new parallel debrief engine;
- live AI calls on page load or automatic LLM feedback on every reveal;
- changing theme tokens or `App.jsx` hash routing;
- replacing missed-question storage, SRS, or session architecture;
- mass hand-editing compiled `ccnaCleanQuestions.js` without fixing its source;
- changing CCNA curriculum facts without source verification;
- deployment, database/schema changes, or authentication work in this slice.

---

## 4. Source-of-truth and reuse rules

Reuse before adding:

- grading: `questionUtils.js` / `gradeQuestion`;
- feedback generation: `answerReviewLogic.js`;
- runtime UI: `components/AnswerReview.jsx` and choice components;
- quality checks: `answerReview/answerReviewQuality.js`;
- regen mapping: `features/explanationIntegration.js`;
- curated overrides: `answerReview/goldAnswerReviews*.js`;
- health/flags: `quiz/questionHealthClient.js` and
  `quiz/contentHealthProcess.js`;
- missed/retest: existing `missed/` and session modules.

Fix the earliest authoritative source that owns a defect. Generated/compiled
files may be refreshed only through the existing scripts. Do not patch a compiled
artifact alone if the next rebuild would restore the defect.

For each question, derive one canonical contract:

```text
id + objective + type + stem/exhibit + choices + canonical key
  -> correct rationale
  -> exact wrong-index set
  -> one rationale per wrong index
  -> runtime shuffled display mapping
```

Any change to stem, choices, key, or ordering must invalidate/revalidate the
dependent feedback fields.

---

## 5. Defect taxonomy and severity

| Severity | Category | Examples | Ship rule |
|---|---|---|---|
| P0 | Wrong learning outcome | wrong key; two correct MC choices; rationale teaches false Cisco behavior; correct option labeled wrong | zero allowed |
| P1 | Unanswerable/misleading | missing exhibit; malformed JSON/CLI; ambiguous stem; multi-select omits a valid answer; stale choice-index mapping | zero allowed |
| P2 | Weak teaching | generic/circular explanation; distractor rationale describes another choice; no deciding rule; retry action unrelated | bounded backlog with IDs |
| P3 | Polish | grammar, capitalization, repetition, overly long copy, minor label inconsistency | tracked; fix in batches |

Audit tags should include: `wrong_key`, `multiple_valid`, `missing_valid`,
`bad_stem`, `missing_context`, `malformed_exhibit`, `invalid_cli`,
`wrong_choice_index`, `rationale_mismatch`, `generic_feedback`,
`circular_feedback`, `fact_conflict`, `shuffle_mismatch`, `surface_parity`, and
`source_drift`.

---

## 6. Phased implementation plan

### Phase 0 — Freeze a reproducible baseline

Deliver `ai-improvement-logs/QUESTION_LOGIC_WRONG_ANSWER_AUDIT.md` containing:

- exact commit and commands used;
- corpus counts by domain, objective, type, and source;
- validator/test results, including non-zero defect counts;
- the five already-known regen-index defects;
- a ranked defect table with IDs and authoritative source paths;
- a representative manual sample across all six domains and all question types.

Sampling floor: at least 10 questions per domain, all P0/P1 validator hits, every
non-MC type, and the most frequently missed/flagged questions when local or server
data is available. Clearly label unavailable telemetry rather than inventing it.

### Phase 1 — Make invalid content impossible to ship

1. Preserve `validate:regen-coverage` non-zero failure for schema errors or
   incomplete wrong-index sets, and add domain-scoped reporting for bounded passes.
2. Add/extend validators for:
   - correct index in range;
   - exact wrong-index set;
   - gold/regen/bank key agreement;
   - duplicate normalized choices;
   - MC with multiple semantically identical valid choices (flag for review);
   - empty/malformed stems and exhibits;
   - generic/circular banned language after runtime resolution;
   - every runtime question ID unique within its objective/source contract.
   - every question's objective/domain pair resolving to one registry owner and
     agreeing across authoritative source, compiled corpus, runtime pool, and cache;
   - referenced exhibit/diagram assets present and accessible;
   - AI-fallback output meeting the same key, choice, and formatting contract
     before `mergeIntoBank` persists it.
3. Emit machine-readable JSON plus a concise human summary.
4. Add known-bad fixtures proving each validator fails, and known-good fixtures
   proving legitimate edge cases pass.

Gate: P0/P1 errors produce a failing process status and identify the owning source.

### Phase 1B — Close the flag-to-fix loop

Keep one simple lifecycle:

```text
Flag/validator finding -> dedupe + classify -> quarantine if warranted
-> locate authoritative source -> propose smallest fix + real-ID test
-> run validators/tests/build -> human review when factual/key-sensitive
-> mark resolved at new question version -> watch for recurrence
```

1. Align the compact learner reason list with the V2 defect taxonomy. Keep labels
   understandable; internal P0/P1/tags are derived after submission.
2. Fix client acknowledgement so an online flag is not retained and resent from
   the offline queue. Give each event an idempotency key.
3. Restrict API reason/source values, validate indexes/objectives, bound payloads,
   and add abuse/rate controls appropriate to an unauthenticated learner endpoint.
4. Return a triage summary by question *and reason*, including recent versus
   resolved counts and enough selected-choice/version context to reproduce it.
5. Replace lifetime-count-only quarantine with severity-aware rules:
   - validator-confirmed wrong key/invalid mapping/missing exhibit: quarantine now;
   - credible independent wrong-key/two-valid reports: urgent review/quarantine;
   - display, grammar, or weak-feedback reports: batch by recurrence/impact;
   - never let one client or duplicate offline delivery satisfy the threshold.
6. Add a registry-build safety brake: abort if a run would newly quarantine an
   unexpected absolute number or percentage of the corpus, and print the exact IDs.
7. Unify the local resolution ledger with the triage lifecycle conceptually:
   `open -> proposed -> validated -> resolved -> reopened`. A resolved version is
   not repeatedly reprocessed unless new evidence or a changed content hash appears.

Any API/D1 schema, authentication, rate-limit, or deployment change is separately
approval-gated. The implementation pass must preview those files and migration/
compatibility behavior before editing.

### Phase 1C — Safe automated fix proposals

Automation should improve throughput without becoming an auto-publisher:

1. Read new open findings and merge validator evidence with learner flags.
2. Resolve each question ID to its authoritative source—not a compiled output.
3. Build a complete repair packet containing stem/exhibit, choices/key, current
   feedback, selected-choice evidence, flag reasons, source path, and dependent
   generated artifacts.
4. Choose the smallest action:
   - deterministic mechanical fix (exact duplicate block, escaped newline,
     stale wrong-index set) may be auto-patched in a reviewable batch;
   - grammar/feedback fix gets a proposed diff;
   - factual, ambiguous, two-valid, or answer-key issue requires human approval;
   - insufficient evidence is quarantined/deferred, never guessed.
5. Generate a real-ID regression test with the fix.
6. Run the focused validators/tests, regenerate only the affected domain, then run
   the production build; reject the proposal on any new defect or broad diff.
7. Produce one compact review bundle: finding, evidence, before/after, files,
   validations, confidence, and rollback. Apply/commit/deploy only under the normal
   user approval gates.

Batch safety: one domain and a small ID cap per run; use the existing claim protocol
to prevent collisions. Scheduled automation may audit and prepare proposals, but it
must not push directly to `master` or deploy.

### Phase 1D — Initial tracking foundation

Start `METRICS_TRACKING_99_SPEC.md` Stage A during this implementation:

1. publish the tracking inventory and duplicate/conflicting-calculation map;
2. define canonical content IDs, domain/sub-objective ownership, and content version;
3. publish the versioned question-event dictionary and compatibility rules;
4. add idempotency and offline/retry semantics;
5. add raw-event-to-current-total reconciliation fixtures for every question type
   and major question surface;
6. inventory lab/lab-checkpoint identifiers and existing writes, flagging collisions
   or missing IDs without redesigning lab scoring yet;
7. emit a Stage A report listing covered and missing event points by exact surface.

Gate: Stage A cannot change learner-facing mastery formulas or ship dashboards. It
establishes trustworthy inputs while the content/workflow phases stabilize.

### Phase 2 — Repair known integrity defects at source

For every P0/P1 item:

1. verify the Cisco fact/command against authoritative project references;
2. correct the earliest source file;
3. regenerate only the affected domain/artifact through supported scripts;
4. confirm key, choices, gold, regen, clean-bank, and runtime result agree;
5. add a regression assertion using the real question ID;
6. record before/after text and why the correction is defensible.

When changing choices, prefer preserving their order. If reordering or replacing a
choice is necessary, verify saved `selectedIndex`/missed-review records cannot point
to a different meaning. Preserve a choice-text snapshot or apply the existing
storage normalization path rather than clearing learner history.

Start with the currently detected records:

- `4.1-q8`;
- `obj-4.1-source-q008`;
- `obj-4.9-source-q003`;
- `obj-5.9-source-q001`;
- `obj-6.7-source-q010`.

These are starting points, not the completion boundary.

### Phase 3 — Prompt-quality pass

Apply a deterministic lint/audit for mechanical problems, followed by human
review for meaning:

- repair grammar and capitalization without changing the tested fact;
- rewrite negative and double-negative stems into direct language where possible;
- state selection count for multi-select;
- preserve valid CLI/JSON/config formatting;
- ensure exhibits name interfaces, states, or outputs consistently;
- remove irrelevant story text and accidental hints;
- quarantine rather than guess when the intended answer is uncertain.

Every rewrite must retain the objective/CKU and pass the key/rationale contract.

### Phase 4 — Display-normalization pass

Extend the existing `QuizQuestionChrome` / `quizStemExhibit` path; do not create a
second renderer.

1. Inventory stem shapes in the runtime corpus and classify them as:
   - plain prose;
   - routing table or `show` output;
   - IOS configuration/command transcript;
   - JSON/YAML/XML or API payload;
   - compact table/list;
   - malformed or uncertain (quarantine/manual review).
2. Normalize line endings and remove only exact duplicated exhibit blocks. Never
   collapse meaningful repeated command/output lines.
3. Split exhibits from the actual question using explicit labels/structure first
   and conservative detection second. If uncertain, preserve the full stem as
   readable preformatted content instead of silently dropping text.
4. Render preformatted blocks in monospace with preserved indentation and bounded
   horizontal scrolling; render prose with normal wrapping.
5. Keep choices and feedback on the same formatting rules for inline commands,
   addresses, masks, JSON fragments, and long URLs.
   This includes choice buttons: the stem may render correctly while a choice still
   exposes literal backticks, escaped newlines, or collapsed indentation.
6. Verify the existing major consumers continue to use the shared renderer:
   Practice, Topic Focus, Focus, Review, Missed Review/Retest, Placement, Domain
   Pass, Mock, and onboarding practice.
7. Add real-ID fixtures for known `bad_display` cases plus synthetic fixtures for
   each supported exhibit class and mobile widths.
8. Verify questions that reference a separate diagram/image/SVG retain the asset,
   alt text, caption, and question association; do not assume every exhibit is
   embedded in the `question` string.

Known historical evidence to include in the audit:

- `obj-3.1-source-q004` and `obj-3.4-source-q041` contained duplicated exhibit
  text in their question fields;
- `obj-3.1-source-q008` contained an answer-revealing inline comment;
- `obj-3.1-source-q005` was flagged `bad_display` despite appearing to be plain
  text, indicating that not every display defect is an exhibit-data problem;
- commit `40e0bd2` introduced the routing-table renderer and display flag but did
  not establish a bank-wide multi-format display contract.

Gate: every audited stem is either rendered correctly by the shared path or
explicitly quarantined with an ID and reason; no silent text loss is allowed.

### Phase 5 — Feedback-quality pass

For each distractor, enforce this compact model:

```text
Why tempting -> what it actually does -> stem constraint it violates
-> correct deciding rule -> optional memory anchor/action
```

Prioritize P2 work using learner impact:

1. frequently missed or flagged questions;
2. Domain Pass and Mock Exam questions;
3. high-weight blueprint objectives;
4. runtime-generated fallback/template rebuilds;
5. remaining corpus.

Do not treat 100% field coverage as 100% teaching quality. Measure distinct,
choice-specific, stem-grounded output after runtime precedence is applied.

### Phase 6 — Surface parity and cognitive-load QA

Verify identical question/result semantics across every surface while permitting
appropriate display differences:

- learner-selected wrong choice always appears first on a miss;
- canonical choices map to the correct shuffled display letters;
- no rationale is hidden behind an unexpected extra interaction;
- correct attempts do not receive “your misconception” language;
- mobile layout does not bury the deciding rule under repeated blocks;
- keyboard/screen-reader state announces selected, correct, and incorrect status;
- “Report question” retains question ID, selected answer, and surface context.

Use a compact UI state matrix rather than one-off screenshots:

| State | Required checks |
|---|---|
| Loading | stable skeleton/progress; no false empty state |
| Ready | stem/exhibit first; valid choice semantics; submit gating |
| Submitted correct | concise confirmation; no misconception language |
| Submitted wrong | learner answer → why wrong → correct rule → optional depth |
| Deferred exam | selection retained; no answer leakage before review |
| Invalid content | skip/quarantine safely; report path; never auto-score |
| Resume/offline | same question and response restored without duplication |

For each state, test keyboard-only, screen reader semantics, 320px/390px mobile,
tablet, desktop, 200% text zoom, light/dark theme, and reduced motion. Use existing
design tokens and shared components; do not create surface-specific variants unless
the interaction contract truly differs.

UX review must include real long-form cases: a dense routing exhibit, a long CLI
choice, multi-select, ordering, and the longest wrong-answer feedback. Synthetic
short questions alone cannot establish layout quality.

Use one shared fixture matrix in unit/component tests plus focused Playwright smoke
coverage for Practice, Domain Pass, and Mock review.

### Phase 7 — Measure, release, and prevent recurrence

Produce `ai-improvement-logs/QUESTION_LOGIC_WRONG_ANSWER_IMPLEMENTATION_REPORT.md`
with:

- defects found/fixed/deferred by severity and domain;
- files and generated artifacts changed;
- validator, unit, build, and e2e results;
- remaining quarantine/backlog IDs;
- before/after learner examples;
- rollback notes and next sampling date.

Roll out only after `npm run verify:ship` passes. Commit/deploy remains separately
gated by the user’s explicit ship instruction.

Before release, exercise the local-bank refresh path with a pre-fix saved question:
the learner should receive corrected content while attempts, ratings, SRS, and
missed history remain intact. Also exercise one rejected AI-fallback payload so bad
generated formatting or keys cannot bypass the curated-bank validators.

---

## 7. Acceptance gates

### Corpus integrity

- [ ] 0 P0/P1 defects in the runtime-applied 914-question corpus.
- [ ] Every MC wrong-index set equals all choices except `correctIndex`.
- [ ] Every multi-select explanation agrees with the complete correct set.
- [ ] Gold, regen, bank, and runtime correct-answer metadata agree.
- [ ] Validators exit non-zero when seeded with each known-bad fixture.
- [ ] Generated artifacts reproduce cleanly from authoritative sources.
- [ ] Existing local-bank users receive repaired question content without losing
      attempts, ratings, SRS, or missed-review history.
- [ ] AI-fallback questions are validated before persistence and invalid payloads
      never enter the learner's question bank.

### Display integrity

- [ ] All major quiz surfaces render the same question ID through the shared stem
      renderer with equivalent visible content.
- [ ] Plain prose, routing/IOS output, configuration, JSON/YAML/XML, and compact
      table fixtures retain all meaningful text and formatting.
- [ ] Exact duplicated exhibits are removed at source or safely deduplicated once;
      legitimate repeated lines remain.
- [ ] No learner-facing stem contains raw escape sequences, broken Markdown fences,
      clipped commands, answer-revealing comments, or unintended duplicated blocks.
- [ ] At 320px width, prose wraps and fixed-width exhibits remain readable through
      contained horizontal scrolling without moving the whole page.
- [ ] Exhibits have accessible labels and precede the question in reading order.
- [ ] Choice text uses the same inline-code/newline rules as stems and feedback.
- [ ] Separate diagram/image/SVG exhibits remain associated, available, and
      accessible after normalization.

### Teaching quality

- [ ] 100% of runtime distractors have a choice-specific rationale.
- [ ] 0 banned generic/circular phrases after runtime resolution.
- [ ] Manual six-domain sample has 100% factual/key agreement.
- [ ] At least 95% of the sample passes the rubric without rewrite; failures are
      quarantined or logged with owner and severity.
- [ ] A learner can identify the deciding rule from the first two feedback blocks
      without opening another screen.

### Surface and regression safety

- [ ] Practice, Topic Focus, Review, Missed Retest, Placement, Domain Pass, Mock,
      and Trap Drill use the same canonical grading/feedback result.
- [ ] MC shuffle tests prove displayed letters and rationales stay aligned.
- [ ] CLI, ordering, and multi-select fixtures cover both correct and incorrect paths.
- [ ] Targeted unit/component tests, production build, and ship e2e pass.
- [ ] No theme-token, hash-routing, auth, DB/schema, or deployment-config changes.

### UI/UX release bar

- [ ] The UI state matrix passes on every major learning surface.
- [ ] Immediate-feedback and deferred-exam surfaces never leak or delay answers at
      the wrong time.
- [ ] Keyboard users can select, submit, read feedback, report, and continue with a
      logical focus order and visible focus.
- [ ] Screen readers announce the question, selection requirements, submission
      result, and feedback once—without reading hidden answers early.
- [ ] Correctness is communicated by icon/text/state as well as color.
- [ ] No page-level horizontal overflow at 320px; fixed-width exhibits scroll only
      within their container; touch targets are at least 44px.
- [ ] Layout remains usable at 200% text zoom, in portrait/landscape, and with
      reduced motion.
- [ ] Long stems, commands, exhibits, choices, and feedback do not overlap, clip,
      or push the primary next action into an ambiguous location.
- [ ] Submit is idempotent, answers lock at the correct time, and refresh/resume
      preserves the current state.
- [ ] Missing/malformed content shows a recoverable state and is not silently scored.
- [ ] Light/dark theme and offline/resume smoke checks pass using existing tokens.
- [ ] A manual usability pass confirms the deciding rule is findable within five
      seconds on a miss and the next action is unambiguous.

### Flagging and automation release bar

- [ ] Learners can flag wrong key, unclear/missing context, multiple valid answers,
      bad feedback, outdated content, and display/exhibit issues from applicable
      review surfaces.
- [ ] One flag event is counted once across online submit, offline queue, retry, and
      reconnect.
- [ ] Server/API rejects unknown reasons, invalid indexes, oversized payloads, and
      unsupported sources.
- [ ] Triage preserves reason, affected choice, surface, content version, recency,
      and independent-evidence count.
- [ ] Validator-confirmed P0/P1 defects quarantine immediately; learner thresholds
      cannot be reached by duplicate events from one client.
- [ ] Registry generation aborts safely on an unexpected mass-quarantine delta.
- [ ] Resolved questions remain closed until new evidence or a new content version
      warrants reopening.
- [ ] Every automated proposal identifies the authoritative source, includes a
      real-ID regression, and passes focused validation before review.
- [ ] Factual/key changes, broad diffs, commits, pushes, and deployments are never
      automatic.
- [ ] A dry run against the known historical flags produces useful repair packets
      without changing the clean bank.

### Initial tracking release bar

- [ ] Existing tracking/storage/event paths are inventoried by surface and content ID.
- [ ] Canonical question/domain/sub-objective/content-version fields are defined once
      and reused by new events.
- [ ] Exposure, attempt, skip, result, flag, feedback, remediation, and resume events
      have versioned schemas and idempotency behavior.
- [ ] Online/offline retry cannot double-count one question outcome.
- [ ] Skipped, invalid, quarantined, and unsynced items are not counted as ordinary
      wrong answers.
- [ ] Raw-event fixtures reconcile to expected totals for all question types and
      major question surfaces.
- [ ] Existing learner history survives normalization.
- [ ] Every lab and checkpoint has a stable canonical ID or appears in the Stage A
      gap report; no final lab mastery claim is made yet.

---

## 8. Metrics that indicate actual impact

Track before/after where data is available:

- question-flag rate per 100 answers (`wrong key`, `unclear`, `bad explanation`);
- `bad_display` flag rate and recurrence by question ID/source shape;
- repeat-miss rate on the same question after seeing feedback;
- successful missed-retest rate within 7 days;
- feedback expansion/reference/drill action rate (diagnostic, not a vanity goal);
- generic/template rebuild rate after runtime resolution;
- validator defects introduced per content regeneration;
- P0/P1 escape count (target zero).
- question abandonment after reveal, accidental double-submit count, and report
  rate by surface/state where existing telemetry can provide them;
- time from submit to Continue/Next as a cognitive-load signal, interpreted with
  learner outcomes rather than optimized blindly.
- flag delivery duplication rate, time-to-triage, time-to-validated-fix, reopen
  rate, false-quarantine rate, and percentage of proposals accepted without major
  rewrite;

Privacy rule: use existing aggregate/local telemetry only; do not add personal data
collection in this scope.

---

## 9. Likely file surface

Audit determines the exact list. Expected areas:

- `scripts/validateRegenCoverage.mjs`, `scripts/validateAnswerReviews.mjs`, and
  focused validator helpers/tests;
- existing `src/components/QuizQuestionChrome.jsx`,
  `src/quiz/quizStemExhibit.js`, their focused tests, and existing shared display
  CSS only where the audit proves a rendering defect;
- `src/components/QuestionFlagPanel.jsx`, `src/quiz/questionHealthClient.js`,
  `src/quiz/contentHealthProcess.js`, `src/data/questionHealthConstants.js`, and
  question-health registry scripts for the client/local portion;
- `functions/api/question-health.js` and any D1 compatibility work only after the
  separate API/database approval gate;
- one source-aware triage/proposal script that reuses current validators, batch
  claims, and domain compilation rather than another regeneration system;
- authoritative question source files under `data/clean-question-bank/` or the
  owning curated/patch module;
- affected gold/regen inputs and generated domain chunks;
- `src/answerReviewLogic.js` or `AnswerReview.jsx` only if the audit proves a
  runtime/surface defect not already handled;
- focused tests under `src/__tests__/` and e2e wrong-answer smoke coverage;
- the two required audit/implementation reports.

Approval gate: if implementation expands beyond 5–8 files, touches generated
corpus files broadly, or reaches DB/auth/deploy/build configuration, stop and show
the exact file list before editing.

---

## 10. Definition of done

This work is not done because coverage says 100%, a UI screenshot looks polished,
or tests exercise only synthetic fixtures. It is done when the runtime corpus has
no known key/index integrity defects, validators prevent recurrence, a
representative cross-domain human review confirms factual and teaching quality,
all major learning surfaces agree, and the implementation report makes every
deferred issue explicit.

---

## 11. Required next phase — Lesson Logic & Study Workflow

Question V2 completion triggers, but does not absorb, the lesson follow-on defined
in `LESSON_BANK_ALIGNMENT_99_SPEC.md`.

Handoff sequence:

```text
Question V2 gates pass
-> freeze repaired runtime question/CKU contract
-> rerun lesson-bank alignment against that exact corpus
-> replace stale lesson queue with the fresh matrix
-> fix lesson logic/content by domain
-> validate Study -> Practice -> feedback -> exact lesson remediation -> retest
```

The question implementation report must provide the lesson phase with:

- final runtime question IDs, objective IDs, CKUs/concepts, keys, and quarantines;
- question IDs whose concepts/CKUs changed;
- distractor families that require a teach-first contrast in Study;
- questions whose remediation link needs an exact lesson anchor;
- unresolved factual/content exceptions that lessons must not teach around;
- a command to reproduce the final corpus and rerun `audit:lesson-bank`.

Do not claim the overall learning workflow complete when Question V2 ships. The
follow-on is complete only when the repaired bank is teachable from Study, wrong-
answer remediation lands at the relevant lesson section, the learner can return to
retest without losing context, and the refreshed lesson gates pass.

After the lesson follow-on passes, proceed to
`FULL_APP_SCOPE_AUDIT_99_SPEC.md`. That audit reconciles the rest of the app and
produces the final no-rebuild roadmap. `DOMAIN_PASS_99_SPEC.md` and Metrics Stage B
remain expected follow-ons, but their exact implementation priority is confirmed by
the full-app evidence rather than assumed in advance.
