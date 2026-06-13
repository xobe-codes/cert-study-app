# CCNA App — Combined Enhancement Priority Outline

Context: This is the CCNA 200-301 study app at `/Users/zycooks/Documents/Apps/CCNA App` (single-file `src/App.jsx`, React/Vite, no new deps, inline styles, `window.storage`/localStorage, deployed at https://ccna-study-tool.pages.dev). It already has: SM-2-style ladder SRS (`SRS_LADDER=[2,7,14,30,60]`), mastery gate (70%), retention health dashboard (Strong/Fading/Study), curated content system (`ccnaCurated.js`, 11/53 objectives done), Lab Engine v2 (4 labs), AI tutor with streaming + persistent chat, model tiering (Haiku for terms/visual, Sonnet for quiz/explain/tutor), prompt caching, personalized quiz generation, explain-my-mistake, confidence-vs-accuracy quadrant, and an SVG diagram/packet-flow renderer used in only 2 places.

Goal: enhance learning effectiveness AND the AI experience, in priority order. Work in phases — discovery before implementation, validate via preview before moving to the next item. Reuse existing patterns (generate-once-cache, deterministic local logic, COLORS/theme tokens, ProgressBar/ProgressRing) — do not re-architect.

---

## MASTER SEQUENCE (merged, dependency-ordered — current single source of truth)

1. ~~Import question bank — Domain 4 first (proves converter pipeline)~~ — **done** (4.1 pilot, 8→20 questions; see PROJECT_LOG.md item 9. 4.2-4.9 deferred until item 9 curation or item 3 fallback work)
2. ~~Resolve `_V1` file naming (housekeeping, low risk — do anytime, doesn't block anything)~~ — **done**, renamed back to PROJECT_PROFILE.md/COMMANDS.md/RISKY_AREAS.md (no other doc used a version suffix)
3. ~~Per-content-type hybrid fallback in App.jsx (static questions usable even with AI-only reading)~~ — **done**, see PROJECT_LOG.md item 10
4. ~~Onboarding + diagnostic placement test~~ — **done**, see PROJECT_LOG.md item 11
5. ~~Exam Readiness Score hero metric on Home~~ — **done**, see PROJECT_LOG.md item 12
6. ~~Domain 5 ID crosswalk decision~~ — **done**, see PROJECT_LOG.md item 13 (QB 5.8 → app 5.7 confirmed)
7. Import remaining clean domains (2, 3, 6)
8. Decide orphaned question sets (QB 2.9, QB 5.4, excluded 3.4 OSPF cluster)
9. Curate Domain 1 content (8/12 objectives — includes 1.6 subnetting, 1.8/1.9 IPv6)
10. Add test/lint/typecheck tooling (before larger AI features land)
11. IPv6 subnetting calculator (1.8) + ACL wildcard-mask calculator (5.5/5.6)
12. AI-for-learning umbrella (now unblocked — real question pool exists from 1/7):
    - Socratic tutor mode toggle
    - Progressive hint system in quizzes
    - Session recap on return to Home
    - Personalized mnemonics for missed concepts
    - "Explain it differently" style switcher
    - Confidence-calibration coaching
    - Overconfidence surfacing into Daily Review
13. Diagram/visual coverage sprint (12-15 topics, includes Domain 6 comparison diagrams)
14. Expand hands-on labs beyond current 6 (47/53 objectives have none)
15. Global search / Cmd+K nav
16. Domain weight overlay on progress bars
17. CLI lab AI feedback on failed validation
18. Subnetting drill mode with instant binary-breakdown feedback
19. Exam date countdown + adaptive daily plan
20. "Focus Mode" weak-area-only review
21. Lapse → immediate same-session re-queue
22. "Exam trap of the day" widget on Home
23. Pre-generation/background pre-caching for uncurated objectives
24. Mock exam history trend chart
25. Troubleshooting-type question weighting near exam date
26. Adaptive question pacing within a session
27. Auto cross-device sync or setup nudge
28. Voice/audio mode for tutor (TTS)
29. AI-generated "exam day" mock interview
30. API cost/reliability hardening
31. Deployment checkpoint (`npm run build && npx wrangler pages deploy dist` — anytime at a good stopping point)

---

## ACTIVE ROADMAP (in progress, started in main thread — superseded by Master Sequence above)

This is the currently-running track, working item-by-item with PROJECT_LOG.md updated after each milestone. Cross-references to the P0-P3 list below noted in brackets.

1. **Import question bank — Domain 4 first** — clean 1:1 ID mapping, proves the converter pipeline end-to-end. *(feeds into P0-3 and P1-7/8 by growing the real question pool)*
2. ~~**Resolve `_V1` file naming**~~ — **done**, see MASTER SEQUENCE item 2 above.
3. ~~**Per-content-type hybrid fallback in App.jsx**~~ — **done**, see MASTER SEQUENCE item 3 above.
4. **Domain 5 ID crosswalk decision** — question-bank numbering vs. app's DOMAINS numbering mismatch (documented in PROJECT_LOG.md). Resolve before importing Domain 5.
5. **Import remaining clean domains (2, 3, 6)** using the proven pipeline from item 1.
6. **Decide orphaned question sets** — QB 2.9 (WLAN operational params), QB 5.4 (password policies), excluded 3.4 multi-area-OSPF cluster (14 Qs).
7. **Curate Domain 1 content** — 8/12 objectives still AI-only, no question-bank source; original authoring like the 1.5 fix. *(this is P0-3's Domain 1 slice — 1.6 subnetting and 1.8/1.9 IPv6 live here)*
8. **Add test/lint/typecheck tooling** — currently none configured. (Recommend before larger AI-experience features in P0/P1 land, to catch regressions.)
9. **IPv6 subnetting calculator (1.8) + ACL wildcard-mask calculator (5.5/5.6)** — match existing subnetting calculator pattern. *(same as P1-7, generalized to two calculators)*
10. **AI-for-learning features** — explain-this-answer, adaptive/SRS review, personalized quizzes from the static question pool. Depends on items 1-5 (real question volume). *(this is the umbrella for P0-4/5/6, P1-11/12/13, P2-15/17/18 — sequence those AFTER items 1-5)*
11. **Expand hands-on labs beyond current 6** — 47/53 objectives have none. *(extends P3 lab-related items)*
12. **Comparison diagrams for "describe/compare" objectives** (e.g. 6.2-6.4). *(part of P1-8 diagram sprint, Domain 6 slice)*
13. **Deployment checkpoint** — `npm run build && npx wrangler pages deploy dist` — independent, run anytime at a good stopping point.

**Sequencing implication for the P0-P3 list below:** the AI-experience items (Socratic tutor, hints, mnemonics, recap, calibration coaching — P0-4/5/6, P1-11/12/13, P2-17/18) are now gated on Active Roadmap items 1-5 (real question bank import) per item 10's stated dependency. Diagnostic test (P0-1) and Exam Readiness Score (P0-2) are NOT blocked and can proceed in parallel if a checkpoint opens up.

---

## P0 — Do First (structural gaps + cheap AI wins)

1. **Onboarding + diagnostic placement test** — 15-20 Q across all 6 domains on first visit, seeds initial `computeMastery` estimates, generates a personalized study order. Fixes "no entry point" for new users.
2. **Exam Readiness Score (hero metric on Home)** — single 0-100% number combining existing mastery + retention health + mock-test scores (all already tracked). Show per-domain breakdown.
3. **Curate the "MVP 12" objectives** — 1.6 subnetting, 1.8/1.9 IPv6, 2.1/2.2 VLAN/trunk, 2.5 STP, 3.4 OSPF, 4.1 NAT, 5.5 ACL (3.4/4.1 and labs for 2.1/3.4/4.1/5.6 already done — fill remaining gaps). Follow Phase 19 pattern in `ccnaCurated.js`.
4. **Socratic mode toggle for tutor** — toggle between "just tell me" (direct answer) and "help me think it through" (guiding questions before reveal). Prompt-only change + UI toggle on existing tutor chat.
5. **Progressive hint system in quizzes** — "Hint" button gives a 1-sentence AI nudge before committing an answer, small mastery penalty if used. Reuse `explainMistake()` cache pattern + Haiku tier.
6. **Session recap on return to Home** — "Last time you struggled with X (3/8). Today: review queue + 10-min focus." Built from existing `ccna_events_v1` + `buildLearnerSummary` — mostly data already collected, one new prompt.

## P1 — High Leverage Next

7. **Subnetting drill mode with instant binary-breakdown feedback** — reuse the CLI-drill validator pattern for deterministic local checking.
8. **Diagram/visual coverage sprint (12-15 topics)** — extend existing zero-dep SVG renderer to: subnetting binary breakdown, VLAN/trunk, OSPF DR/BDR, NAT pools, STP states, OSI/TCP-IP stack, ACL flow.
9. **Global search / Cmd+K nav** (Phase 14, deferred) — jump to any objective/lab/term across the flat 53-item structure.
10. **Domain weight overlay on progress bars** — anchor per-domain ProgressBars to real exam weight (e.g., Domain 4 = 25%), not equal splits.
11. **CLI lab AI feedback on failed validation** — explain *why* a command/config was wrong in context (e.g., ACL ordering logic), not just pass/fail. Haiku tier.
12. **Personalized mnemonics for missed concepts** — when retention health flags a "weak" concept (2+ lapses), generate a custom mnemonic/analogy tied to that specific confusion.
13. **"Explain it differently" style switcher** — extend existing `AdjustExplanation` constraints with quick-pick styles: analogy-based, step-by-step technical, real-world job scenario.

## P2 — Polish the Retention Loop (mostly low-effort, data already exists)

14. **Exam date countdown + adaptive daily plan** — "14 days left, 62% ready — here's today's 25-min plan." Ties together readiness score (P0-2) + SRS queue + weak domains.
15. **"Focus Mode"** — filtered Daily Review pulling 100% from the retention-health "weak" bucket until cleared.
16. **Lapse → immediate same-session re-queue** — currently a 2nd consecutive miss only lengthens the future interval; add immediate re-test within the session.
17. **Overconfidence surfacing into Daily Review** — auto-weight items from the "overconfident" confidence-vs-accuracy quadrant into review.
18. **Confidence-calibration coaching** — AI proactively flags overconfidence in plain language ("You rated 5/5 on NAT but missed 2 of 3 — quick recheck?").
19. **"Exam trap of the day" widget on Home** — surface from existing `commonMistakes`/exam-traps data.
20. **Pre-generation/background pre-caching** — for uncurated objectives, pre-generate+cache the *next* objective in the study path while learner is on the current one.

## P3 — Valuable but Lower Urgency

21. **Mock exam history trend chart** (Phase 15, deferred) — score-over-time per domain.
22. **Troubleshooting-type question weighting near exam date** — skew QUIZ_SCHEMA mix toward `troubleshooting` type as exam date approaches.
23. **Adaptive question pacing within a session** — shift remaining questions harder/easier live based on streak.
24. **Auto cross-device sync or setup nudge** — `functions/api/sync.js` exists but requires manual D1 provisioning; most users won't do this.
25. **Voice/audio mode for tutor (TTS)** — browser-native `speechSynthesis`, zero-dep.
26. **AI-generated "exam day" mock interview** — timed conversational rapid-fire scenario mode.
27. **API cost/reliability hardening** — Turnstile/Access on the public proxy as content coverage reduces AI dependency; admin token-usage dashboard.

## Working Agreement
- Discovery → plan → implement → validate per item, smallest viable change first.
- Verify visually via preview MCP before considering an item done.
- Commit per completed item/phase (per existing project convention).
- Update this file's checkboxes or strike through items as they're completed.
