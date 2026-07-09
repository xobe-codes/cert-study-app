# Syntax vs Command Questions — 99+ Spec (v1)

**Status:** Shipped · **Updated:** 2026-07-08

## North star

Learners always know **where** to practice **syntax structure** vs **command recall**, with curated-first content and IOS-faithful grading.

---

## Question taxonomy

| Type | `type` field | Belongs in | Tests |
|------|-------------|------------|-------|
| **Syntax — mode** | `pick_mode` | Command Hub → Syntax coach → Syntax quiz | Which IOS config mode is required |
| **Syntax — order** | `order_steps` | Command Hub → Syntax coach → Syntax quiz | Correct IOS step sequence (drag/tap order) |
| **Command — type-in** | `type_command` | Command Hub → Command drills | Faithful IOS strings; abbrev via `cliGrading` |
| **Command — CLI skill** | `cli` | Objective Practice · Daily Review · Focus | One drill per objective from `COMMAND_DRILLS` |
| **Command — ordering** | `ordering` (IOS steps) | Objective Practice skill bank | Same IOS steps as syntax order; also in syntax coach pool |
| **Concept MC** (incl. invalid-syntax traps) | `definition` / `scenario` / … | Objective Practice · Domain Pass (MC-only) | Recognition, not typing |

**Not syntax coach:** full CLI lab simulation, `type_command` typing sprints, verify-command recall.

**Not command drills:** mode picking, step ordering, mnemonic tips.

---

## Surfaces & navigation

| Surface | Route / entry | Syntax | Command |
|---------|---------------|--------|---------|
| Command Hub | `/#/commandhub` | **Syntax coach** tab → Tips + Syntax quiz | **Command drills** tab → 10-Q type-in sprint |
| Objective Practice | Objective → Practice | Ordering skill Qs (shared pool) | CLI skill Q (`cliSkillQuestions`) |
| Daily Review / Focus | `/#/review` | — | CLI cards from SRS bank |
| Domain Pass / Mock | MC-only surfaces | Excluded | Excluded |
| Labs | Lab view | — | Full `cliEngine` simulation |

**Mobile:** `ccna-h-scroll` filter pills, `dvh` shell, safe-area padding on Command Hub tabs; coarse-pointer ↑↓ on ordering.

---

## Content rules

- **Curated-first:** `COMMAND_DRILLS`, `CCNA_COMMAND_REGISTRY`, `ccnaSkillQuestions` ordering pool — no live AI on load.
- **Patches over inline giants:** new syntax/command items via `commandDrillQuiz.js` / skill patches, not `ccnaCleanQuestions.js` bulk edits.
- **Grading:** `gradeCliAnswerList` + `cliStringsEquivalent` for commands; `normalizeMode` for modes; per-step CLI equiv for ordering.
- **Dedup:** syntax sessions dedupe by command stem; drill sessions dedupe by accepted answer primary.

---

## Tests (verify:ship)

| Layer | File | Asserts |
|-------|------|---------|
| Unit | `commandSyntaxQuiz.test.js` | Syntax session = modes + order only; no `type_command` |
| Unit | `commandDrillQuiz.test.js` | Drill + verify pool; abbrev grading |
| Unit | `questionPlacement.test.js` | Placement matrix; IOS order filter |
| E2E | `command-hub-syntax-smoke.spec.js` | Syntax coach → mode or order quiz |
| E2E | `command-hub-drills-smoke.spec.js` | Command drills tab → type-in + check |
| E2E | `cli-skill-smoke.spec.js` | Review CLI grading (unchanged) |

---

## Out of scope (v1)

- Migrating MC “invalid syntax” stems out of clean bank into syntax coach
- Per-objective syntax/command analytics export
- AI-generated syntax or command questions
- Command drills inside Objective Practice (stays Hub + CLI skill)
- Rewriting `commandDrills.js` drill corpus

---

## 99+ signal

| Dimension | This spec closes |
|-----------|------------------|
| Learning flow | Clear Syntax coach vs Command drills split in Hub |
| CLI verification | Drills + CLI skill stay IOS-faithful with abbrev |
| Content depth | Ordering + modes + full drill pool in Hub |
| Tests / CI | Placement unit tests + dual Hub e2e smokes |
