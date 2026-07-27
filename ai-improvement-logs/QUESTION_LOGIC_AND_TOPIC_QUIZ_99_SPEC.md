# Question Logic & Quiz-by-Topic Feature Spec

Status: DRAFT — research complete, no code changed yet.
Scope: (1) document how the app currently treats questions and wrong answers, (2) inventory what already exists that a "create quiz by topic(s)" feature can reuse, (3) identify the gap between what exists and what's being asked for.

---

## 1. Question data model

Runtime shape is enforced structurally, not by a single TypeScript interface. Source of truth: `src/questionUtils.js`.

- Core fields: `id`, `question`, `explanation`, `type`, `difficulty`, `concept`, `skill`, `ckuIds` (concept-knowledge-unit tags), `attempts[]` (`{correct, at}`), `ratings[]` (`{value, at}`), `srs` (scheduling state), `answerReview` (trap/distractor metadata).
- `type` enum used across the app (broader than the AI-generation schema): `definition | scenario | application | true-false | troubleshooting | ordering | cli | multi | select-all`.
- Answer-shape fields vary by type: `choices` + `correctIndex` (single-choice), `correctIndexes` (multi-select), `orderItems`/`orderAccept` (ordering), `answers`/`answer`/`accept`/`hint` (CLI type).
- `objectiveId` (e.g. `"3.2"`) is **not** stored on the bare question — it's implied by which bank key or curated-objective bucket the question lives in, and gets attached ad hoc (`{...q, objectiveId: oid}`) when questions are pulled across objectives.
- Type detection/grading helpers: `isOrderingQuestion`, `isCliQuestion`, `isMultiQuestion`, `isMcQuestion`, `isChoiceQuestion`, `inferSkill(q)`, `gradeQuestion(q, answer)` (the canonical grader), `normalizeQuestionForBank(q, objectiveId, counter)`, `buildMissedEntry(objectiveId, q, extra)`.

AI-generation contract (narrower, used only when curated content is missing): `QUIZ_SCHEMA` in `src/ai/claudeClient.js` — requires `question, choices (2-4), correctIndex, explanation, type (5-value enum), difficulty, concept`. Sibling schemas: `MOCK_SCHEMA`, `TERMS_SCHEMA`, `VISUAL_SCHEMA`.

## 2. Where questions come from, and storage

Hybrid model, curated-first / AI-fallback, both land in the same localStorage bank.

- **Curated (authoritative) source**: `src/data/ccnaCurated.js` — `getCuratedQuestions(objectiveId)` merges hand-curated questions, "clean bank" imports (`src/data/cleanQuestionAdapter.js`), and skill questions (`src/data/skillQuestionsRegistry.js`), then filters out quarantined/unhealthy questions (`src/data/questionHealth.js`).
- **AI-generated fallback**: `askClaudeJSON({schema: QUIZ_SCHEMA, ...})` in `src/ai/claudeClient.js`, invoked from `QuizTab.startQuiz()` only when curated coverage is thin (`needsAiGeneration`, `QUIZ_BANK_MIN = 5`).
- **Bank storage**: `src/quiz/quizBankStorage.js`, localStorage key `ccna_quiz_bank_v1` (`src/storageKeys.js`). Shape: `{ [objectiveId]: Question[] }`.
  - `loadQuizBank()` / `saveQuizBank(bank)`
  - `mergeIntoBank(bank, objectiveId, questions)` — dedupes by normalized question text
  - `recordQuizResult(objectiveId, questionId, {correct, rating, schedule})` — appends attempt/rating, updates `srs`

## 3. Quiz session flow (how a question is asked and graded)

Main runner: `src/tabs/QuizTab.jsx` (`QuizTab`), always scoped to **one objective** passed in as a prop.

1. `startQuiz(forceNew)` — loads bank → seeds curated questions in → optionally tops up via AI → builds an "exposure pool" (`practiceExposure.js`, tracks what the user has already seen) → calls `pickQuizSessionSet(...)` (`src/tabs/pickQuizSessionSet.js`) to select the actual session's question set → sets session state to `'active'`.
2. `selectAnswer(idx)` grades via `gradeQuestion(current, idx)`, then fires off a cluster of recorders: `recordQuizResult` (bank), `recordQuestionHealthSignal`, `recordAnswerOutcome`, `recordPracticeExposure`, `recordEngagement`.
3. Non-MC types have dedicated submit handlers: `toggleMultiChoice`/`submitMulti`, `submitOrder`, `submitCli`.
4. After grading, `rate(value)` captures a self-reported confidence rating that feeds into SRS scheduling.
5. Other session runners reuse the exact same grading/recording primitives rather than reimplementing them: `TopicFocusSession.jsx`, `ReviewSession.jsx` (SRS due-review), `MissedRetestSession.jsx`, `DomainPassSession.jsx`, `DomainPlacementSession.jsx`, `MockExam.jsx`.

## 4. What happens when the user gets a question wrong

This is the "wrong answer" pipeline in full:

1. **Reveal** — `revealed` flips true; `AnswerReview` component renders the explanation plus trap/distractor analysis (`answerReview` field, backed by `src/answerReviewLogic.js` and the CKU trap library). Exam-tip callouts can also queue (`collectDeferredTip`).
2. **Missed tracking** — `buildMissedEntry(objectiveId, question, {selectedIndex})` writes a record into the `ccna_missed_v1` store. Grouping/display: `src/missed/missedDisplay.js`, `src/missed/missedTrapGroups.js` (groups missed questions by which trap/distractor caught the user).
3. **In-session retry** — a `missedOnce` Set requeues the question later in the same session (once → pushed to end of queue; twice → pushed to front).
4. **Cross-session retest** — `MissedRetestSession.jsx` + `missedRetestPool.js` (`dedupeMissedByQuestionId`, caps: `MISSED_RETEST_CLEAR_CAP=15`, `MISSED_RETEST_PROVE_UNLOCK_MAX=30`) drive a dedicated "clear your missed questions" mode. `recordMissClearAttempt` / `removeMissedByQuestionId` track when a previously-missed question is answered correctly again and retire it from the missed bank.
5. **SRS penalty** — `src/quiz/confidenceScheduler.js`: `SRS_LADDER = [2, 7, 14, 30, 60]` days. A miss resets `reps=0` and increments `lapses`; `applyConfidenceToSrs` further nudges the interval based on the post-answer confidence rating (e.g. answering "easy" right after a miss flags `confidencePin: 'overconfident'` and keeps the interval short).
6. **Content-quality flagging** (separate from personal mistake-tracking — this is "this question itself may be broken", not "I got it wrong"): `src/quiz/questionHealthClient.js` (`submitQuestionFlag`, `flushQuestionFlagQueue`) + `src/quiz/contentHealthProcess.js` (quarantine, `processFlaggedQuestions`) + UI (`QuestionFlagPanel`, `QuestionUnderReviewBanner`, admin dashboard). Server-side log in Cloudflare D1 (`question_health_flags` table via `functions/api/question-health.js`).
7. **Gap found during this research**: there is no dedicated "explain my mistake" AI call (e.g. `explainMistake()`) currently wired to a wrong answer. The closest existing pieces are `src/features/explanationIntegration.js` (static per-choice explanation lookup/regeneration) and the general-purpose `TutorChat.jsx` RAG chat — neither is a one-click "why did I pick that" flow off a wrong answer today, despite being referenced as done in a prior memory note. **Needs verification before being treated as shipped.**

## 5. Topic / domain / objective structure (the tagging axes)

Three nested tagging axes exist, from coarse to fine:

- **Domain** (`src/data/ccnaDomains.js`): `DOMAINS` — 6 domains (`fundamentals`, `access`, `connectivity`, `services`, `security`, `automation`), each `{id, name, accent, weight, objectives: [{id, title}]}`. `ALL_OBJECTIVES` is the flattened list.
- **Objective** (e.g. `"3.2"`): the unit questions are actually banked/curated under. `objectiveId.split('.')[0]` maps back to its domain.
- **Concept / CKU** (`src/topic/topicIndex.js`): finer-than-objective tags (`ckuIds` on questions) linking into the trap library and a searchable topic index (`buildTopicIndex()`, `getTopicIndex()`). `TOPIC_PRESETS` are curated multi-objective bundles, e.g. `{id: 'preset-routing', label: 'Routing & forwarding', objectiveIds: ['3.1','3.2','3.3','3.4','3.6']}`.

## 6. What already exists for "quiz by topic" — reuse this, don't rebuild

**A near-complete version of the requested feature is already shipped**, just under the name "Topic Focus" rather than being domain-checkbox-driven:

- **Picker UI**: `src/topic/TopicFocusStudio.jsx` — multi-select of objectives and/or concepts, live question-count estimate as selections change (`estimateTopicFocusQuestions`), named saved topic sets (`topicFocusStorage.js`: `saveFocusSet`/`loadFocusSets`/`deleteFocusSet`), a start gate (`canStart = selectionCount > 0 && questionEstimate > 0`).
- **Pool builder**: `src/topic/topicFocusQuiz.js` — `buildTopicFocusQueue({objectiveIds, conceptIds}, {cap, bank})` merges curated + banked questions across every selected objective/concept, dedupes, and filters via `questionMatches()`. This function is already generic over an arbitrary objective/concept selection.
- **Session runner**: `TopicFocusSession.jsx` consumes the built queue and reuses the same grading/recording primitives as `QuizTab`.
- **Wiring**: `StudyModeRoutes.jsx` (view `'topicfocus'` → `TopicFocusStudio` → `onStart` stores config → view `'topicfocussession'` → `TopicFocusSession`). Entry point: `onOpenTopicFocus` in `CoreStudyRoutes.jsx`.

**Adjacent but not a topic picker**: `src/components/MockExamSelector.jsx` only offers full (70Q) vs quick (30Q) format, always spans all 6 domains via `buildMockExamDomainCounts`/`buildBlueprintWeightedPool` (`src/mockExamConfig.js`) — a domain-weighted sampler that could be reused if the new feature wants weighted-by-domain distribution instead of flat pooling.

**What's genuinely missing, if the ask is specifically "pick one or more whole domains" rather than "pick objectives/concepts":**
1. No domain-level checkbox layer sits on top of `TopicFocusStudio` today — the picker works in objective/concept space. Adding a "select entire domain" shortcut that expands to that domain's `objectiveIds` would close this without touching the pool builder or session runner at all.
2. No difficulty/type filter is exposed in any quiz-configuration UI (`QuizTab` only exposes session **size**).
3. No "explain my mistake" one-click AI action confirmed wired to wrong answers (§4.7) — worth confirming with the user before assuming it's a gap vs. just unwired.

---

## Recommended next step (not yet approved — for discussion)

Given the reuse inventory above, the cheapest path to a "create quiz by topic" feature is very likely: **extend `TopicFocusStudio.jsx` with a domain-select shortcut** (expand a chosen domain into its objective ids, feed the existing `buildTopicFocusQueue`), rather than building a new picker, pool builder, or session runner. This would touch ~1-2 files instead of introducing a parallel system — consistent with "extend before replacing."
