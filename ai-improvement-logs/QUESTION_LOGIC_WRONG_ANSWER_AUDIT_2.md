# Question Logic / Wrong-Answer Treatment — Independent Second Audit

**Date:** 2026-08-13
**Method:** static read of the grading + answer-review path, plus a scripted pass that runs the
app's own runtime helpers (`gradeQuestion`, `applyAnswerReviewToQuestion`, `resolveIncorrectItem`,
`buildWrongChoiceItem`, and the `answerReviewQuality` detectors) over every shipped question and
reproduces the exact branch `AnswerReview.jsx` takes at render time.
**Compares against:** `QUESTION_LOGIC_WRONG_ANSWER_AUDIT.md` (2026-07-27).

## 0. Headline

The prior audit is correct about **structure** and silent about **content**. Every claim it makes
about the code — single grading dispatcher, single missed-entry builder, precedence chain wired,
multi/ordering as first-class types — reproduces exactly. Grading integrity is genuinely clean.

But the prior audit verified that the wrong-answer pipeline *exists*; it never measured what that
pipeline *emits*. Running it over the shipped bank:

- **45.0% of wrong-answer debriefs (1,207 of 2,682) are silently downgraded at render time.** The
  learner gets a single line instead of the structured "Why it is wrong here / What this choice
  implies" breakdown, because the app's own generic-content detector rejects its own generated text.
- **The degradation is domain-shaped, not random**: 0% in Domain 1, 77.7% in Domain 6.
- **310 debriefs contain spliced text from an unrelated topic** — an OSPF sentence on a QoS
  question, NAT/PAT boilerplate on an administrative-distance question.
- **Multi-select debriefs are structurally broken**: 34 of 73 render `Therefore **** fits the tested
  condition` — an empty correct-answer slot.

The prior audit's verdict "already substantially implemented and shipped" is true of the plumbing
and false of the experience. That gap is the whole finding.

## 1. Where this audit agrees with the 2026-07-27 audit

Re-verified, no correction needed:

| Prior claim | Result |
|---|---|
| `gradeQuestion` is the single grading dispatcher | Confirmed — `src/questionUtils.js:84-102`, all sessions route through it |
| `buildMissedEntry` is the single missed-entry shape | Confirmed — `src/questionUtils.js:120-148` |
| Precedence gold → regen → clean-bank → SADE is wired | Confirmed — `resolveWrongChoiceForReview`, `src/answerReviewLogic.js:125-188` |
| `regenIncorrectFor` is imported and used | Confirmed — `answerReviewLogic.js:18`, used at line 138 |
| Multi-select separates `extraWrong` / `missedCorrect` | Confirmed — `AnswerReview.jsx:308-309` |
| `true-false` is a display label, graded as MC | Confirmed — 15 such questions, all valid MC. Not a defect |
| CLI grading is pass/fail only, no error classification | Confirmed — `gradeCliAnswerList`, `src/lab/cliGrading.js:6-17` |

**Grading integrity, independently checked across all 1,161 shipped questions** — every category
came back zero:

| Check | Result |
|---|---|
| Answer graded correct on an empty/undefined submission | 0 |
| Questions falling through every type guard to the MC fallback | 0 |
| `correctIndex` out of range | 0 |
| `correctIndexes` out of range on multi | 0 |
| Duplicate choice text (two identical options, one keyed) | 0 |
| Review item keyed to the correct choice | 0 |
| Wrong choices with no review entry at all | 0 |

The grader is not the problem. If wrong answers feel wrong in this app, it is not because the app is
mis-marking them.

## 2. What this audit found that the prior audit did not

### F1 — 45% of wrong-answer debriefs silently degrade at render time (P1)

`WrongChoiceReview` (`src/components/AnswerReview.jsx:152-161`) computes:

```js
const generic = resolved.genericDebrief
  || isTemplateWhyWrongHere(resolved.whyWrongHere)
  || isFallbackExplanation(resolved.whatItDoes)
  || isGenericStructuredFeedback(resolved.whyWrongHere)
  || isGenericStructuredFeedback(resolved.whatItDoes)
const hasStructured = Boolean(resolved.whatItDoes && resolved.whyWrongHere && !generic)
```

Running the real chain over the runtime bank (`src/data/cleanQuestions/domain-{1..6}.js`,
904 questions, 2,682 wrong-choice items):

| Outcome | Count | Share |
|---|---|---|
| Structured debrief renders | 1,475 | 55.0% |
| **Falls back to a single explanation line** | **1,207** | **45.0%** |
| Triggered by `isGenericStructuredFeedback(whyWrongHere)` | 1,207 | 45.0% |

The rejected text is the SADE generator's own output — the fixed skeleton
`For "<concept>", <correct> matches the required behavior — <wrong> answers a different mechanism or
constraint than the stem asks.` The generator emits it, the quality detector at
`answerReviewQuality.js:39` flags it as filler, and the UI drops the structured block. Both halves
are behaving as written; nothing logs, nothing fails a test, and the learner just gets less.

Per-domain, this is a content cliff, not noise:

| Domain | Degraded / items | Rate |
|---|---|---|
| 1 — Network Fundamentals | 0 / 296 | 0.0% |
| 2 — Network Access | 23 / 388 | 5.9% |
| 3 — IP Connectivity | 331 / 745 | 44.4% |
| 4 — IP Services | 223 / 388 | 57.5% |
| 5 — Security Fundamentals | 397 / 565 | 70.3% |
| 6 — Automation & Programmability | 233 / 300 | 77.7% |

Domains 1–2 were hand-passed; 3–6 were left to the generator. Any audit that samples early
objectives sees a healthy system.

### F2 — 310 debriefs splice in text from an unrelated topic (P1)

The generated `whatItDoes` / `whyWrongHere` fields concatenate a choice string with a topic template
selected by substring match, with no topic check. Real shipped examples:

- `obj-3.1-source-q011` (administrative distance):
  `"ADs are programmed by the administrator for path selection. implies many-inside-to-few-outside PAT/overload translation."`
- `obj-2.9-source-q005` (QoS trust boundary):
  `"A trust boundary is where the QoS markings are stripped at the router. applies another routing protocol's behavior instead of OSPF-specific rules."`
- Domain 2 STP questions: `"Link cost is the calculation of all the ports in the path to the root bridge. implies many-inside-to-few-outside PAT/overload translation."`
  — matched on the substring `pat` inside `path`.

Detection: 310 fields matching `/\.\s+(implies|matches|gives|points|is the|applies)\b/`, i.e. a
lowercase template verb spliced after a sentence-ending period. This text is **not** caught by the
generic-content detectors, so unlike F1 it renders to the learner as confident, specific, wrong
teaching. This is the most corrosive class found: a learner who trusts it learns a false fact about
a topic they weren't even being tested on.

### F3 — Multi-select debriefs render an empty correct-answer slot (P1)

37 multi-select questions ship (20 via `multiSelectQuestionPatches.js`, 17 via
`practiceExamPatches.js`, merged through `contentEnrichmentPatches.js:557-561`). None carry authored
`whatItDoes` / `whyWrongHere` — the multi branch of `generateAnswerReview`
(`answerReviewLogic.js:270-300`) never calls `resolveWrongChoiceForReview`, so all 73 wrong-choice
items arrive at the UI with both structured fields undefined.

`WrongChoiceReview` then rebuilds via `buildWrongChoiceItem` (`AnswerReview.jsx:141-148`), which
reads `q.choices?.[q.correctIndex]` — and multi questions have **no** `correctIndex`, only
`correctIndexes`. The correct answer resolves to `undefined` and renders as an empty bold span:

```
The explanation establishes: **…IPv6 has no broadcast, and Class D is an IPv4 concept.**
Therefore **** fits the tested condition, while **Class D multicast** would …

Inter-VLAN routing (vlans and svi): **** provides L3 between VLANs — **SVIs only work if the
switch is in transparent VTP mode** leaves traffic unrouted …
```

Measured across all 37: 73 wrong-choice items → 34 render the structured block with the empty
`****`, 39 fall back to explanation-only. So **every** multi-select debrief is either broken or
degraded; none render correctly. The prior audit listed multi-select as CONFIRMED shipped because it
checked the grading and selection-diff paths, which do work — the defect is one layer down, in the
rebuild fallback.

### F4 — The quality gate cannot see F1 or F3 (P2)

`validateQuestionAnswerReview` (`answerReviewQuality.js:110-145`) checks
`isTemplateWhyWrongHere`, `isGenericTrap`, and `stemAnchorScore` — but **not**
`isGenericStructuredFeedback`, the one detector that fires on 45% of shipped content. It also runs
only over authored bank fields via `scripts/validateAnswerReviews.mjs`, never over the
post-resolution output the learner actually sees, and multi questions skip the structured checks
entirely. The result is a green validator over a bank where nearly half the debriefs are being
rejected by a sibling detector at render time.

### F5 — Answer-key position bias in the bank (P3, currently masked)

MC key distribution across the 904-question clean bank: A 190 / **B 351** / C 229 / D 134. B is
38.8% against an expected ~25%; D is 14.8%. Choice shuffling is on by default everywhere
(`McChoiceShuffleProvider` in all 13 session surfaces, `shuffleChoices` defaults true, no surface
passes `false`), so **this is not currently learner-visible**. Logged because it is latent: it
becomes a real "guess B" shortcut the moment shuffle is disabled anywhere, and it indicates the
generators were not balancing keys.

### F6 — Canonical letters baked into prose (P3)

9 questions carry text naming a fixed letter (`"Configuring 203.80.53.22/19 installs a connected
(C) route…"`, `"B) "`), plus two generators emit canonical letters into strings —
`answerReviewLogic.js:231-236` (`the scored answer is choice ${letter}`) and `:288`
(`Correct selections: A, C`). `AnswerReview` maps its own headers through `displayLetter`, but
generated prose is not remapped, so under shuffle a named letter can point at a different option.
Low incidence, and most of the 9 hits are notation (`C` = connected route code) rather than choice
letters — but the two generators are a genuine mismatch waiting on the right question shape.

## 3. Compare and contrast

| | 2026-07-27 audit | This audit |
|---|---|---|
| Unit of analysis | Code paths and call sites | Rendered output over all 1,161 shipped questions |
| Method | grep + read + test counts | Executes the runtime chain, reproduces the UI branch |
| Verdict on the debrief system | "Already substantially implemented and shipped" | Plumbing shipped; **45% of its output is rejected by the app's own detector** |
| Multi-select | CONFIRMED shipped | Grading works; **all 73 debriefs broken or degraded** |
| Quality signal used | Test count (1,730 passing), lint parity | Content metrics — none of which any test asserts |
| Scope discipline | Deliberately narrow; one resolver added | Diagnostic only, no code changed |

**Where the prior audit was right and I'd defend it:** the scope discipline. It refused to rebuild a
working system, found a real duplicate-missed-entry bug, and fixed it minimally. Its §8 warning
about detached-HEAD commits is the kind of thing most audits never write down. The grading core it
signed off on is, independently, clean.

**Where its method structurally couldn't reach the user's complaint:** it treated "the code path
exists and tests pass" as the finish line. Every finding above sits *past* that line — the code path
exists, executes, passes its tests, and emits content the app itself classifies as filler. A
grep-and-read audit cannot see that; only running the chain over real content can. The prior audit's
own diagnosis resolver (`diagnoseWrongAnswer.js`) inherits the problem: it reads
`item.misconceptionTested || item.whyWrongHere` for its label, so on the 45% it labels
misconceptions from text the UI already refuses to show.

**Net:** the two audits do not contradict each other. The first says the machine is assembled
correctly. This one says the machine is assembled correctly and running on bad fuel in four of six
domains.

## 4. Recommended order of work

1. **F3** — smallest, highest-severity, fully contained. Make `buildWrongChoiceItem` resolve the
   correct answer via `multiCorrectIndexes` when `correctIndex` is absent. Fixes 34 visibly broken
   debriefs; no grading change.
2. **F2** — 310 contaminated fields. Fix the splice at generation, add a topic-consistency check to
   the validator, then regenerate. This is the one that actively teaches falsehoods.
3. **F4** — add `isGenericStructuredFeedback` to `validateQuestionAnswerReview` and run the
   validator over post-resolution output, not authored fields. Without this, F1's regression comes
   back silently.
4. **F1** — the 1,207-item content backlog. Largest effort; Domains 5 and 6 first (70.3% / 77.7%).
   Gate on the F4 validator so progress is measurable.
5. **F5 / F6** — hygiene. Balance keys on next regeneration; route generated letter references
   through `displayLetter`.

## 5. Reproduction

No source file was modified by this audit. The scripted pass imports the app's own modules and
reproduces `WrongChoiceReview`'s exact branch conditions; counts above are from that run against
`src/data/cleanQuestions/domain-{1..6}.js`, `multiSelectQuestionPatches.js`,
`practiceExamPatches.js`, and the skill banks (220 questions: 97 CLI, 33 ordering, 90 MC).
