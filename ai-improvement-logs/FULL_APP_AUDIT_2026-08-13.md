# Full Application Audit — 2026-08-13

**Scope:** whole app — build/CI health, assessment integrity, spaced repetition, mastery scoring,
wrong-answer treatment, content pipeline, bundle/offline, engineering hygiene, and the audit
infrastructure itself.
**Method:** read every prior audit in the repo, then re-derived findings from the running system —
`npm ci` on a clean tree, `npm test`, `npm run build`, `npm run lint`, `npm run validate:pipeline`,
GitHub Actions history, and scripted passes that execute the app's own runtime modules over all
shipped content.
**Rule applied:** runtime behavior is evidence; "shipped" claims in docs are not. (This is the
principle `FULL_APP_SCOPE_AUDIT_99_SPEC.md` §2 sets out and no prior audit actually applied.)

---

## 0. Headline

Three things are true at once, and the third is the reason the first two survived:

1. **The gate is red and has been for two weeks.** CI on `master` has failed every run since
   2026-07-28. `npm test` fails on a clean clone. Both `ci.yml` and `deploy.yml` run `npm test`.
2. **The learning core has real defects** — spaced repetition schedules a wrong answer exactly like
   a right one, mastery can be earned without answering questions, and 45% of wrong-answer debriefs
   silently degrade before the learner sees them.
3. **Every measurement system in the repo reports success.** `validate:pipeline` passes all 12
   stages. `DISTRACTOR_QUALITY_AUDIT.json` reports 0 questions below threshold. `APP_AUDIT_SUMMARY.md`
   reports ~99/100. The measurements are real; they measure the wrong things, and the gaps between
   them are exactly where the defects live.

---

## 1. Prior audits — read and assessed

| Audit | Date | Verdict on re-check |
|---|---|---|
| `FUNCTIONALITY_AUDIT_REPORT.md` | 2026-06-29 | **Sound.** 7 P0 crashes found by actually clicking through the app. Its recommended import-regression guard exists (`appShellExtract.test.js`). Its P2 thin-bank finding is closed — objective 3.5 is now 30 questions, not 1. Best-method audit in the repo. |
| `APP_AUDIT_SUMMARY.md` | 2026-07-09 (generated) | **Unsafe as a quality signal.** Scores ~99/100 from artifact counts (objectives with questions, labs, traps). Counts are accurate; none measure whether the artifacts work. |
| `DISTRACTOR_QUALITY_AUDIT.json` / `sade-health-audit.json` | 2026-07-10 | **Rubric is miscalibrated.** Reports 0/914 below threshold, avg 3.84/5, `totalFallbackSlots: 0` over content the app's own render-time detector rejects 45% of. See §4.1. |
| `SOFTWARE_ENGINEERING_AUDIT.md` | 2026-07-12 | **Stale but harmless.** 3 bullets. `computeMastery` is now a single export in `netUtils.js` consumed by 18 modules — the duplication it flagged is resolved. |
| `LEARNING_EXPERIENCE_AUDIT.md` | 2026-07-12 | **One finding still open and worse than stated.** "Confidence rating skippable — mastery score can be inflated" is confirmed and quantified in §3.3. |
| `DIAGRAM_AND_VISUAL_AID_AUDIT.md` | 2026-07-12 | **Confirmed.** `audit:domain-visuals` passes 53/53. |
| `questionValidationAudit.md` (routine) | 2026-07-14 | Routine definition, not a result. |
| `QUESTION_LOGIC_WRONG_ANSWER_AUDIT.md` | 2026-07-27 | **Structurally correct, content-blind.** Assessed in detail in `QUESTION_LOGIC_WRONG_ANSWER_AUDIT_2.md`. |
| `LAB_AUDIT_REPORT.md` | 2026-07-28 | **Findings sound; validation claim false.** Claims "Full unit gate: 192 files / 1,759 tests passed." The commit it documents (`03fe436`) is the commit that broke the suite — see §2.1. |
| `FULL_APP_SCOPE_AUDIT_99_SPEC.md` | — | **Never run.** Status is still "RUN AFTER…". Its §2 principles are the correct ones and would have caught most of this report. |
| `AUDIT_SHORTCUTS.md` / `AUTONOMOUS_AUDIT_AGENT_PROMPT.md` | — | Tooling and prompts, not results. |

Also present: ~30 `*_REPORT.md` pass reports (regen, coverage, UI uniformity, cognitive load,
topology accuracy). These are generated pass logs, not independent audits; I read their headlines and
treat their claims as unverified by construction.

---

## 2. P0 — Ship gate

### 2.1 CI has failed on `master` since 2026-07-28

| Run | Commit | Result |
|---|---|---|
| 2026-08-09 | `9c68783` agents/quality-target fix | **failure** |
| 2026-07-28 09:34 | `03fe436` lab lessons + learning metrics pass | **failure** |
| 2026-07-28 08:34 | `bcf7944` domain question feedback pass | success (last green) |

Reproduced locally at HEAD after a clean `npm ci`:

```
Test Files  1 failed | 194 passed (195)
     Tests  2 failed | 1766 passed (1768)

FAIL src/__tests__/lessonRemediation.test.js
ReferenceError: sessionStorage is not defined
```

Cause: `vitest.config.js` sets `environment: 'node'`. `src/__tests__/lessonRemediation.test.js:10`
calls `sessionStorage.clear()` with no stub. Sibling tests that touch the same API
(`placementDebriefResume.test.js:15`, `domainDebriefResume.test.js`) define their own
`sessionStorage` stub; this file, added in `03fe436`, does not.

Two compounding facts:

- The test was added by the same commit whose `LAB_AUDIT_REPORT.md` reports a fully green unit gate.
  The report was written from a run that did not include the file it was adding.
- `deploy.yml` also runs `npm test`, so this is not a cosmetic badge — it sits on the deploy path.

**Fix is one line** (stub `sessionStorage` in the test, or move the file to a jsdom environment).
The severity is not the bug; it is that a red gate survived two weeks and one further commit without
anyone or anything noticing.

`npm run build` passes. `npm run lint` reports 133 problems (25 errors / 108 warnings) — consistent
with the documented baseline of 137, so **no lint regression**; but see §5.1 for what is inside that
accepted baseline.

---

## 3. P1 — Learning core

### 3.1 Spaced repetition schedules a wrong answer identically to a right one

`nextSrsFromCorrect` (`src/quiz/confidenceScheduler.js:11-20`) computes the next interval purely from
consecutive-correct count:

```js
if (correct) reps += 1
else { reps = 0; lapses += 1 }
const intervalIndex = Math.min(Math.max(reps - 1, 0), SRS_LADDER.length - 1)  // → 0 when reps is 0 or 1
```

`Math.max(reps - 1, 0)` floors both `reps = 0` (just missed) and `reps = 1` (just learned) to ladder
index 0. Measured directly:

| Event | Next review |
|---|---|
| First attempt, **wrong** | **2 days** |
| First attempt, **right** | **2 days** |
| Mature 60-day item, wrong | 2 days |
| Item missed 10 times, wrong again | 2 days |

`SRS_LADDER = [2, 7, 14, 30, 60]` has no relearning step below 2 days, so there is nowhere for a
lapse to go. `lapses` is incremented and persisted on every miss and **never read by any scheduling
code** — only by `confidenceDuePriority` / `shouldForceReview` for ordering, and only in combination
with an explicit "easy" rating. A question you have missed ten times is scheduled exactly like one
you have just learned.

This is the same complaint as the debrief findings, one layer down: the system records that you were
wrong and then does nothing differently with it.

**Fix:** add a sub-ladder relearning step (e.g. same-day / 1-day) for `reps === 0`, and let `lapses`
compress the ladder — standard SM-2 behavior, no schema change (`lapses` is already persisted).

### 3.2 The questions you are worst at never enter Daily Review

Every session gates scheduling on `reviewEligible`:

```js
recordQuizResult(objective.id, current.id, { correct, schedule: !!progress?.[objective.id]?.reviewEligible })
```
— `src/tabs/QuizTab.jsx:357, 414, 461, 508, 540` (and the same in the other sessions)

`reviewEligible` is set only when a session scores at or above `MASTERY_GATE = 0.7`
(`useObjectiveQuizProgress.js:38`). With `schedule: false`, `recordQuizResult` appends the attempt but
never creates `q.srs` — and both `countDueQuestions` and `loadDueQuestions` skip any question without
`q.srs` (`srsReview.js:23, 54`).

Net effect: **until you score 70% on an objective, nothing in it is ever scheduled for review.** The
weaker you are at a topic, the longer spaced repetition stays switched off for it. When you finally
clear the gate, `enableSectionReview` retro-schedules the backlog via
`nextSrs(undefined, lastAttempt.correct)` — which, per §3.1, gives every one of those old wrong
answers the same 2-day interval as the right ones.

The intent is defensible (don't schedule material not yet taught). The effect inverts the purpose of
an SRS.

### 3.3 Mastery can be earned without answering questions, and honesty lowers your score

`computeMastery` (`src/netUtils.js:300-313`):

```js
const scores = masteryScoreSessions(entry)      // quizScores AND engagementScores, merged
const recent = scores.slice(-3)
const acc  = mean(recent accuracy)
const conf = ratings.length ? mean(RATING_CONFIDENCE[r]) : 0.6
const score = acc * 0.7 + conf * 0.3
const mastered = acc >= 0.8 && conf >= 0.5 && recent.some(r => r.total >= 3)
```

Two defects:

**(a) Non-assessment activity counts as assessment.** `masteryScoreSessions` merges `engagementScores`
into the same list as `quizScores`, and engagement is written by labs, Terms Hub, CLI drills, and
Command Sprints as `{score, total}` (`masteryEngagement.js:42-45`, 15 kinds in `ENGAGEMENT_KINDS`).
Because mastery reads only the **last 3 sessions**, three engagement entries fully displace quiz
history from the window. An objective can reach `mastered` — which drives Home recommendations,
readiness, and the §3.2 SRS gate — on lab and drill activity with no recent quiz at all.

**(b) Skipping confidence ratings scores better than rating honestly.** With
`RATING_CONFIDENCE = { easy: 1, medium: 0.6, hard: 0.3, practice: 0.1 }`, never rating anything
defaults `conf` to **0.6** — identical to rating everything "medium", above the `conf >= 0.5` gate.
A learner who honestly marks material "hard" (0.3) drops *below* the gate and scores worse than one
who skips the control entirely. The 2026-07-12 audit flagged this as "skippable — can be inflated";
the sharper statement is that the app **penalizes accurate self-assessment**.

### 3.4 Wrong-answer feedback degrades before the learner sees it

Full detail and per-domain numbers in `QUESTION_LOGIC_WRONG_ANSWER_AUDIT_2.md`; summarized here for
completeness, with the root cause added.

- **45.0%** of wrong-choice debriefs (1,207 of 2,682) drop from the structured "Why it is wrong here
  / What this choice implies" block to a single line, because `WrongChoiceReview`
  (`AnswerReview.jsx:152-161`) rejects the generator's own output as filler.
- Per-domain: D1 0% · D2 5.9% · D3 44.4% · D4 57.5% · D5 70.3% · **D6 77.7%**.
- **310** debriefs splice in text from an unrelated topic (NAT/PAT boilerplate on an
  administrative-distance question, OSPF text on a QoS question). These are *not* caught by any
  detector and render as confident, specific, wrong teaching.
- **All 73** multi-select wrong-choice debriefs are broken or degraded; 34 render
  `Therefore **** fits the tested condition` because `buildWrongChoiceItem` reads `q.correctIndex`,
  which multi questions do not have.

**Root cause (new): three quality bars, ascending, with the strictest last and silent.**

| Stage | Detectors applied |
|---|---|
| Regen admission — `regenItemPassesQuality`, `explanationIntegration.js:26-30` | `isTemplateWhyWrongHere`, `isFallbackExplanation` |
| Content validator — `validateQuestionAnswerReview`, `answerReviewQuality.js:110-145` | `isTemplateWhyWrongHere`, `isGenericTrap`, `stemAnchorScore` |
| **UI render — `WrongChoiceReview`, `AnswerReview.jsx:152-161`** | **the above plus `isGenericStructuredFeedback` ×2** |

`isGenericStructuredFeedback` is the detector that fires on 45% of shipped content, and it is the one
missing from *both* upstream gates. Content is admitted twice, validated green, and then quietly
rejected at the last possible moment with no log, no test, and no counter.

Related: the **gold tier is nominal**. `GOLD_ANSWER_REVIEWS` holds 1,099 entries / 3,267 wrong-choice
items, but only **60 (1.8%)** carry explicit non-template fields that survive the precedence check in
`resolveWrongChoiceForReview`. Gold entry count is not gold coverage, and no report distinguishes
them.

---

## 4. P2 — Measurement, and everything the gates do not see

### 4.1 The content pipeline is green over the degraded content

`npm run validate:pipeline` passes all 12 stages, including `validate:answer-reviews`,
`validate:answer-voice OK — 904 questions`, and `validate:mechanism-language`. `audit:distractors`
scores the same corpus at avg 3.84/5 with `belowThreshold: 0`, `totalFallbackSlots: 0`,
`weakStemAnchor: 0`.

None of this is fraudulent — each script measures what it says. But every one of them validates
**authored bank fields**, and none validates **post-resolution rendered output**. The 45% is
invisible to all of them by construction. A study app's most important quality metric is what appears
on screen after a wrong answer, and nothing measures it.

### 4.2 Twelve test files are excluded from the gate

`vitest.config.js` excludes `src/__tests__/integration/**` (6 files), `src/__tests__/performance/**`
(1 file), and 5 named files, with the comment:

> *Unfinished Phase 1–4 lab-testing / integration stubs … Keep on disk for later; exclude so
> `verify:ship` stays green.*

The excluded set is precisely the integration and journey coverage — `completeUserJourney`,
`coreLearningFlow`, `dataFlowValidation`, `errorHandling`, `migrationAndCoreFlow`, `uiIntegration`.
Coverage thresholds are also set low (lines 45%, branches 35%, functions 40%, statements 43%). The
suite that remains is broad on units and empty on flows — which is consistent with §2.1 going
unnoticed and with the 2026-06-29 audit having found seven P0 crashes by hand that no test caught.

### 4.3 Bundle and offline cost

| Artifact | Size |
|---|---|
| `core-*.js` | 3.8 MB raw / **1,023 KB gzip** |
| `dist/` total | 8.3 MB |
| Service-worker precache | 19 entries / **8,151 KB** |

The 2026-06-29 audit recorded the main chunk at "~1.5 MB, gzip 416 KB" as a P3 with no functional
impact. It is now **2.5× that, gzipped**. Precaching is configured over
`assets/clean-questions*.js`, `mock-exam*`, `study-modes*`, `labs*` — so a first visit on a phone
installs ~8 MB before the app is reliably offline. For a mobile-first study app used on commutes,
this is closer to a product constraint than a build statistic. It deserves a budget assertion in CI
rather than a recurring note.

### 4.4 Storage has no quota or failure path

`src/main.jsx:9-22` installs the `window.storage` polyfill with an unguarded write:

```js
async setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}
```

No try/catch. A `QuotaExceededError` (Safari private browsing, or a full origin) throws into an async
call that most call sites do not await, producing a silent unhandled rejection and lost progress with
no user-visible error. The app persists a growing question bank, missed bank, SRS state, lab
progress, and event log to this store, so quota pressure is a realistic end-state, not a theoretical
one. Three components also write `localStorage` directly, bypassing the layer
(`QuestionUnderReviewBanner.jsx`, `OnboardingTour.jsx`, `main.jsx`).

---

## 5. P3 — Hygiene, with two real hazards inside it

### 5.1 Four genuine errors are grandfathered into the accepted lint baseline

The baseline is held *constant* (137 → 133 problems) rather than *clean*, so these ride along:

| File | Error | Why it matters |
|---|---|---|
| `features/domainPlacement/DomainBaselinePanel.jsx:130` | `useState` called conditionally — early return at line 103 (`if (!isPlacementDomain(domain.id)) return null`) | Hook-order violation. If this component instance flips between a placement and non-placement domain at the same tree position, React throws "Rendered fewer hooks than expected" — a white screen, not a warning. |
| `features/mockExam/MockInterview.jsx:139` | `useCardPrompt` called inside a callback | Same rule, same class of failure. |
| `tabs/QuizTab.jsx:744, 830` | Cannot access refs during render | Matches the ref-mutation-during-render in `useMcChoiceShuffle.js:15-17`; under concurrent rendering the choice permutation can differ between render and commit. |
| `features/navigation/useAppNavigation.js:327, 354` | Duplicate key `clearCommandHubLaunch` | Benign today (same value), but the returned nav object has drifted. |

Two of these are crash-class React violations sitting in a baseline described as "pre-existing and
unrelated."

### 5.2 Smaller items

- **Answer-key position bias.** MC keys across the 904-question clean bank: A 190 / **B 351** /
  C 229 / D 134. Choice shuffling is on in all 13 session surfaces and no surface disables it, so this
  is *not* currently learner-visible — but it is a latent "guess B" shortcut and a sign the generators
  never balanced keys.
- **Canonical letters in generated prose.** `answerReviewLogic.js:231-236` and `:288` emit "choice B"
  / "Correct selections: A, C" into text that `AnswerReview`'s `displayLetter` remapping never
  touches. 9 bank questions also carry fixed letters in prose.
- **Biased shuffle.** `srsReview.js:70` orders Daily Review queues with `.sort(() => Math.random() - 0.5)`
  — a non-transitive comparator, not a uniform shuffle. It decides which objectives win the 20-item
  session cap. `shuffleArrayCopy` (Fisher-Yates) already exists in `questionUtils.js`.
- **Accessibility surface is thin.** 30 explicit 44px touch targets and 8 `aria-live` regions across
  the app; the lab audit raised lab controls to the 44px floor but no equivalent sweep covers quiz
  and review surfaces.

---

## 6. Cross-cutting conclusion

Every finding above shares one shape: **a check exists, passes, and does not cover the thing that
matters.**

- Tests pass 1,766 assertions and miss a red suite, because integration flows are excluded.
- The content pipeline validates 904 questions and misses a 45% render-time drop, because it
  validates authored fields, not rendered output.
- The distractor rubric scores 3.84/5 on text the UI refuses to display, because it never asks the UI.
- The SRS records `lapses` faithfully and never uses them.
- Mastery is computed to three decimals from a window that non-assessment activity can fill.
- `APP_AUDIT_SUMMARY.md` reports 99/100 from counting artifacts that exist.

`FULL_APP_SCOPE_AUDIT_99_SPEC.md` §2 already names the fix: *"Treat current runtime behavior and
tests as evidence, not old 'shipped' claims"* and *"Do not score the app from artifact counts alone;
validate complete learner loops."* That audit was never run. Running it — or any check that asserts
on what a learner actually sees after getting a question wrong — is worth more than the next content
wave.

## 7. Recommended order

| # | Item | Severity | Effort |
|---|---|---|---|
| 1 | Fix `lessonRemediation.test.js` `sessionStorage` stub; get CI green (§2.1) | P0 | minutes |
| 2 | SRS relearning step for `reps === 0`; make `lapses` compress the ladder (§3.1) | P1 | small |
| 3 | Multi-select `buildWrongChoiceItem` correct-answer resolution — kills the `****` (§3.4) | P1 | small |
| 4 | Separate `engagementScores` from `quizScores` in mastery accuracy; make unrated confidence neutral rather than 0.6 (§3.3) | P1 | small |
| 5 | Add `isGenericStructuredFeedback` to the validator and the regen gate; validate post-resolution output (§3.4, §4.1) | P1 | medium |
| 6 | Fix the 310 spliced/cross-topic debriefs and add a topic-consistency check (§3.4) | P1 | medium |
| 7 | Revisit the `reviewEligible` gate so missed questions schedule immediately (§3.2) | P1 | medium |
| 8 | Fix the two hook-order errors before they crash (§5.1) | P2 | small |
| 9 | Guard `storage.setItem` against quota failure (§4.4) | P2 | small |
| 10 | Re-enable or delete the 12 excluded test files; add a bundle budget to CI (§4.2, §4.3) | P2 | medium |
| 11 | The 1,207-item debrief content backlog, D5/D6 first (§3.4) | P1 content | large |

## 8. Reproduction

No application source was modified by this audit. Commands run at HEAD (`105559c`) after a clean
`npm ci`: `npm test`, `npm run build`, `npm run lint`, `npm run validate:pipeline`. Content metrics
come from scripted passes importing `src/questionUtils.js`, `src/answerReviewLogic.js`,
`src/answerReview/answerReviewQuality.js`, `src/quiz/confidenceScheduler.js`, and
`src/answerReview/goldAnswerReviews.js` over `src/data/cleanQuestions/domain-{1..6}.js`,
`multiSelectQuestionPatches.js`, `practiceExamPatches.js`, and the skill banks. CI history via the
GitHub Actions API (184 runs; last green on `master` 2026-07-28T08:34Z).
