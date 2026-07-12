# Lesson Mastery + Search + Domain Workspace 99+ (combined pass)

Three independent fixes, one implementation pass. No shared files between them — safe to build in parallel.

---

## 1. Mastery completion visibility (`src/lesson/masteryCriteria.js`, `src/components/MasteryChecklist.jsx`)

**Problem:** `computeMastery()` (`src/netUtils.js`) gates "mastered" on three conditions — accuracy ≥80%, confidence ≥0.5, at least one session with 3+ questions. The displayed percentage in the objective header is a *blended* score (`accuracy×0.7 + confidence×0.3`), not literally "push this to 100." Worse: `getMasteryChecklist()` shows rows for `read`, `practice`, optional `lab`/`sprint`, and the final `mastered` boolean — but **no row for the confidence gate**. A learner passing practice at 90% with low self-rated confidence sees "mastered: ○" with zero visible explanation.

**Fix:**
- Add a `confidence` row to `getMasteryChecklist()`'s output: `{ id: 'confidence', label: 'Rate answers confidently', met: conf >= 0.5, detail: ratings.length ? `${Math.round(conf*100)}%` : '—' }`, computed the same way `computeMastery` does (reuse, don't duplicate the formula — import `RATING_CONFIDENCE` from `netUtils.js`).
- Insert it into the `rows` array before the final `mastered` row, only when `scores.length > 0` (no confidence signal to show before any activity).
- No change to `computeMastery()` itself or the mastery gate thresholds — this is a visibility fix, not a scoring change.

**Acceptance:**
- [ ] Unit test: entry with `acc >= 0.8` but `conf < 0.5` → checklist shows practice met, confidence unmet, mastered unmet (all three visible, not silent)
- [ ] Unit test: entry with no scores yet → confidence row absent (matches existing "no empty circles before any activity" rule already applied to lab/sprint rows)
- [ ] Existing `MasteryChecklist.jsx` renders the new row with no layout changes needed (it already iterates `rows`)

---

## 2. Global search → `searchLibrary` (`src/features/search/GlobalSearchModal.jsx`)

**Problem:** `searchLibrary()` (`src/library/libraryIndex.js`) is a fully-built, already-proven search engine — indexes objectives, terms, exam-trap concepts, commands, workflows, and reading chunks, with relevance scoring, intent detection, and diverse-result mixing. It's used today only by the AI Tutor's RAG (`tutorRag.js`) and Study Lens (`StudyLensStudio.jsx`). The user-facing `GlobalSearchModal.jsx` runs its own narrow filter — `ALL_OBJECTIVES` id/title substring match only, nothing else.

**Fix:**
- Replace the `results` `useMemo` in `GlobalSearchModal.jsx` with a call to `searchLibrary(query, { limit: 15 })`.
- Keep the existing empty-query "recent objectives" behavior as-is (searchLibrary returns `{ hits: [] }` for an empty query per its own contract — the recent-objectives fallback stays local to the modal, unchanged).
- Result rows need a **kind badge** now that results aren't all objectives — reuse `kindLabel(chunk.kind)` (already exported from `libraryIndex.js`) rendered as a small pill next to each result, matching the existing `styles.pill` pattern already used for objective ids in this file.
- Each hit's `nav` field (already built into every chunk — see `navObjective()` calls in `buildLibraryIndex()`) tells you which objective to hand to `onSelectObjective` — use `hit.nav` instead of reconstructing the domain/objective lookup by hand.
- Keep `StatusDot` only for `kind === 'objective'` hits (other kinds have no per-objective progress status of their own).

**Acceptance:**
- [ ] Typing a term name (e.g. "administrative distance") surfaces a `term` result, not just objective title matches
- [ ] Typing a command fragment (e.g. "show ip route") surfaces a `command` result
- [ ] Every result row shows a kind badge (Term / Command / Objective / Concept / Reading / Workflow)
- [ ] Empty-query recent-objectives view is unchanged
- [ ] No live AI call — `searchLibrary` is pure local index lookup, already offline-safe

---

## 3. Domain Workspace revamp (`src/features/domainPass/DomainWorkspacePanel.jsx`)

**Problem (grounded in the actual component + a live screenshot):**
- Four separate one-line status strings stack before any visual hierarchy: `batch.label` ("Batch 1 of 4 · 1.5, 1.4, 1.6"), `readinessLine` ("No baseline · No pass · Labs 0/12"), `coverageLine` ("Bank coverage 0/235 · 0 new this week"), `healthLine` ("Coverage 0% · repeat 0% · top recycled: —"). The last two are **the same ratio rendered twice** — `formatBankCoverageMeter` computes `seenCount/bankCount` as a fraction, `buildDomainStudyHealth`'s `coveragePct` computes the identical ratio as a rounded percentage. `repeatRate7d` and `topRecycledIds` are internal telemetry with no learner-facing meaning.
- "Batch 1 of 4" is engineering vocabulary (`WEAK_BATCH_SIZE` internal batching), not something a learner should ever read literally.
- Terms/Commands/Lab pills target `batch.objectiveIds[0] || continueLesson?.id` silently — nothing on-screen shows which objective they're about to open.
- "5Q prove" (`openProve5`) has no explanation of what it does (a 5-question practice check) versus plain "Study."
- "More tools" hides 10 flat, undifferentiated buttons: Full Domain Pass, Pass Focus flood, Trap Drill, Terms Hub, Commands, Command Sprint, Practice domain, Burn bank in Mock, Fix misses, Domain labs — several of which are different framings of "practice more questions" with no grouping to tell them apart.

**Fix:**
- **Collapse the four status lines into one snapshot**, in plain language, e.g.: `"{coveragePct}% of the bank seen ({seenCount}/{bankCount}) · {readinessLine}"` — drop `repeatRate7d`/`topRecycledIds`/the raw fraction entirely from the always-visible surface (they can stay computed in `domainStudyHealth.js` for later use, just not rendered here). One line, not four.
- **Rename `batch.label`** at render time (not in `weakBatch.js` — keep the internal label for logging/handoff, just don't render it literally) to something like `"Next: {objectiveIds.join(', ')}"` — drop "Batch N of M" from user-facing text.
- **Show the target objective inline** on the Terms/Commands/Lab pills: `"Terms · 1.5"` instead of bare `"Terms"`.
- **Rename "5Q prove"** to `"Quick check (5Q)"` for clarity that it's a short practice quiz, not a formal pass attempt.
- **Group "More tools" into three labeled clusters** instead of one flat list:
  - *Prove mastery*: Full Domain Pass, Pass Focus flood
  - *Fix weak spots*: Fix misses, Trap Drill, Burn bank in Mock
  - *Reference*: Terms Hub, Commands, Command Sprint, Practice domain, Domain labs
  Use a small section label (matching the existing `homeBodySm` + bold pattern already used for "Now"/"Lessons"/"Traps" headers in this file) above each cluster.
- **"Own" button on traps**: add a one-line caption under the Traps section header the first time it renders (or permanently, it's cheap) — `"Own = you've got this, stop surfacing it as a priority."` — a single sentence, not a tooltip system.

**Acceptance:**
- [ ] Exactly one status line above the primary CTA, not four
- [ ] No raw internal metric names (`repeat`, `recycled`, `Batch N of M`) visible in rendered output — grep-able
- [ ] Terms/Commands/Lab pills show the target objective id
- [ ] "More tools" renders three labeled groups, not one flat list
- [ ] All existing `onClick` handlers and their `handlers`/`activeBeat`/`batch` wiring are unchanged — this is a presentation-layer pass, not a logic rewrite
- [ ] `npm test` + build clean, e2e nav smoke for the domain accordion still passes

---

## Out of scope (this pass)

Changing `computeMastery()`'s actual thresholds or weighting · rewriting `buildWeakBatch`/`domainStudyHealth` internals (only their *rendering* changes) · theme tokens · hash routing in `App.jsx` · adding a new AI-powered search mode (this wires the *existing* local index, not a new retrieval system)
