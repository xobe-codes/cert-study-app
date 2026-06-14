# Improvement Execution Log

Branch: `cursor/promote-shelved-a-grade-coverage`  
Started: 2026-06-14

## Status Key
- [ ] pending
- [~] in progress
- [x] done
- [!] blocked

---

## Phase 1 — Curated reading (21 objectives) + 2.1/2.2 clean bank
- [x] Add reading supplements for 21 AI-dependent objectives (`curatedReadingSupplement2.js`)
- [x] Wire 2.1/2.2 into clean-bank (`buildCuratedCleanBank.mjs`, DOMAIN_META)
- [x] Commit: `feat(content): curated reading for remaining objectives`

## Phase 2 — Legacy clean-bank migration (3.6, 4.10, 5.4, 5.11)
- [ ] Migrate 4 legacy import objectives into clean bank
- [ ] Commit: `feat(kb): migrate legacy objectives to clean bank`

## Phase 3 — E2E smoke tests
- [ ] Add vitest integration smoke tests for critical flows
- [ ] Commit: `test: add E2E smoke coverage for core study flows`

## Phase 4 — KB extension (Domains 2, 5, 6)
- [ ] Extend buildKnowledgeBase + knowledgeStudy for D2/D5/D6
- [ ] Commit: `feat(kb): extend knowledge base to domains 2, 5, 6`

## Phase 5 — Curated Visual tab (top 10 objectives)
- [ ] Static visual specs for high-weight objectives
- [ ] Commit: `feat(content): curated visual aids for top objectives`

## Phase 6 — App.jsx modularization
- [ ] Extract HomeScreen, MockExam, Objective shell
- [ ] Commit: `refactor(ui): split study modes from App.jsx`

## Phase 7 — Exam traps + mock exam + onboarding polish
- [ ] Domain 3/5 exam trap drills
- [ ] Mock exam pool quality pass
- [ ] Empty states / Extra Study / onboarding copy
- [ ] Commit: `feat(ux): exam traps, mock quality, onboarding polish`

## Phase 8 — CI/docs, performance, accessibility
- [ ] Update CI (domain-1 validate, kb:full), PROJECT_PROFILE
- [ ] Lazy-load clean-questions chunk
- [ ] Accessibility improvements (quiz keyboard, aria)
- [ ] Commit: `chore: CI, perf, and accessibility improvements`

---

## Session notes
_(updated as work proceeds)_
