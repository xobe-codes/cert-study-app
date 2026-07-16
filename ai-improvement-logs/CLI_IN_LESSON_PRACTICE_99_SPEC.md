# CLI inside Lesson Practice — 99 Spec (v1)

**Status:** Spec only · **Intent:** rearrange, don’t rebuild  
**Related:** `SYNTAX_COMMAND_99_SPEC.md` (taxonomy) · `src/answerReview/commandsInDomainPracticeSpec.md` (Domain Pass — **out of scope here**)

---

## North star

When you open a **lesson → Practice**, you sometimes type IOS commands in that same session — not only in a separate **CLI Drill** tool. If you want command-only study, **Command Hub** stays.

---

## Current state (why it feels split)

| Surface today | What it does |
|---------------|--------------|
| Lesson **Practice** | Mostly MC/skill; `CLI_SKILL_QUESTIONS` already merge into `SKILL_QUESTIONS` but density/visibility is weak |
| Lesson tool **CLI Drill** | Separate panel (`useObjectiveToolItems` → `CLIDrillTab`) — full terminal for that objective |
| **Command Hub** | Standalone syntax + type-in drills |

**Problem:** Commands feel like a different stop on the lesson plan, not part of practicing the objective.

**Constraint:** Do **not** invent a new CLI engine, question corpus, or Domain Pass format. Move / mix what already exists.

---

## Proposed (minimal rearrange)

### In scope

1. **Practice owns CLI recall for the lesson**  
   For objectives with `COMMAND_DRILLS` / `CLI_SKILL_QUESTIONS`, Practice sessions should **intentionally include** a few `type: 'cli'` items (existing `CliAnswerInput` + `gradeCliAnswerList`) mixed with the usual bank — same objective, one flow.

2. **Demote or remove CLI Drill from the lesson tool strip**  
   Stop presenting **CLI Drill** as a peer of Study/Practice for normal study. Options (pick one at implement time):
   - **A (preferred):** Drop `CLI Drill` from `useObjectiveToolItems` for the default path; Practice mix covers it.
   - **B:** Keep the panel only as a deep-link / advanced “terminal mode,” not primary lesson chrome.

3. **Command Hub stays separate**  
   Hub drills / syntax coach remain for “I only want to study commands.” No removal, no rename required.

### Explicitly out of scope (v1)

- Domain Pass / Mock command injection (see other spec)
- New simulated device state / output validators beyond today’s type-in grading
- New `COMMAND_DRILLS` corpus rewrite
- Forcing every Practice card to be CLI
- Touching `appTheme.js`, hash routing, or labs engine redesign

---

## User flow (target)

```
Lesson 3.4 → Practice
  Q1  MC concept
  Q2  type-in: show ip ospf neighbor   ← same existing CLI skill item
  Q3  MC
  Q4  type-in: …
  …

Want commands only? → Command Hub (unchanged)
Want full lab terminal? → Labs (unchanged)
```

---

## Implementation notes (reuse only)

| Piece | Reuse as-is |
|-------|-------------|
| Content | `COMMAND_DRILLS` → `cliSkillQuestions.js` → `SKILL_QUESTIONS` |
| UI | `CliAnswerInput` / existing Practice quiz chrome |
| Grading | `cliGrading` / abbrev rules already used in Review |
| Density | Session builder: e.g. light mix (~1 CLI per ~4–5 Qs) when drills exist; **0** when none |
| Navigation | `useObjectiveToolItems` — remove or hide CLI Drill; home chips that deep-link `tab: 'CLI Drill'` (`learnerHome.js`) retarget to Practice (or Hub) |

No new question `type`. Prefer a small pool-mixer change over new screens.

---

## Acceptance checks

- [ ] Objective with drills: Practice session can surface ≥1 `cli` question without opening CLI Drill
- [ ] Objective without drills: Practice unchanged (no empty CLI slots)
- [ ] Command Hub drills/syntax still reachable and graded
- [ ] Lesson chrome no longer pushes CLI Drill as a required third lane (unless option B deep-link kept)
- [ ] `npm run verify:ship` green; update e2e that assume CLI Drill region (`cli-abbrev-smoke`) to Practice or Hub

---

## 99+ signal

| Dimension | What this closes |
|-----------|------------------|
| Learning flow | Study → Practice includes command recall in-context |
| Labs / CLI | Terminal depth stays in Labs/Hub; Practice stays type-in |
| Maintainability | Move placement, don’t add a parallel lesson product |

**What this is not:** a reform of Domain Pass, scoring formulas, or the drill corpus — only **where** existing command questions show up in the lesson path.
