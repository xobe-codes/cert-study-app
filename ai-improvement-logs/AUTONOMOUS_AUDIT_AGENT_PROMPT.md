# Autonomous CCNA App Audit — Agent Prompt

Copy everything inside the **PROMPT** block below into a new Cursor agent (or automation) session. The agent should run this procedure end-to-end without editing this file unless regenerating logs.

---

## PROMPT (copy from here)

You are auditing the **CCNA Study Tool** — a React/Vite PWA for CCNA 200-301 exam prep. Your job is to **scan the codebase and app**, produce or refresh audit artifacts, fix **one** high-value queue item, and verify with tests + build.

### Hard constraints (never violate)

Read `ai-improvement-logs/DO_NOT_TOUCH.md` first. In short:

- Do **not** edit `.env*`, secrets, deployment credentials
- Do **not** change theme tokens in `src/ui/appTheme.js` (colors, typography CSS vars, global layout chrome)
- Do **not** refactor hash routing / view state in `src/App.jsx`
- Do **not** delete components or routes
- Do **not** add live AI calls on page load (curated-first; AI on user action only)
- Smallest safe diff; no drive-by refactors

Safe edit targets: `ai-improvement-logs/SAFE_FILES_TO_EDIT.md`

### Phase 1 — Inventory (read-only)

1. Read existing logs if present:
   - `ai-improvement-logs/APP_AUDIT_SUMMARY.md`
   - `ai-improvement-logs/IMPLEMENTATION_QUEUE.json`
   - `ai-improvement-logs/COMPLETED_CHANGES.md`
   - `ai-improvement-logs/AGENT_NEXT_STEPS.md`
2. Scan key source areas:
   - `src/data/ccnaCurated.js`, `contentEnrichmentPatches.js`, `ccnaDomains.js`
   - `src/tabs/`, `src/components/`, `src/lesson/`
   - `src/HomeScreen.jsx`, `src/home/`
   - `scripts/auditContentCoverage.mjs`, `scripts/generateImprovementLogs.mjs`
3. Run coverage scanner:
   ```bash
   npm run audit:coverage
   npm run generate:improvement-logs
   ```
4. Optionally open the built app (`npm run dev`) or production URL and spot-check Home, Study, Practice, Labs on a **narrow viewport** (≤390px).

### Phase 2 — Regenerate / update logs

Ensure `ai-improvement-logs/` contains (create or refresh as needed):

| Artifact | Purpose |
|----------|---------|
| `APP_AUDIT_SUMMARY.md` | Executive score + top gaps |
| `CCNA_OBJECTIVE_COVERAGE_MATRIX.md` | Per-objective tier table |
| `IMPLEMENTATION_QUEUE.json` | Prioritized fix queue |
| `GAP_TO_IMPLEMENTATION_QUEUE.json` | Content gap → implementation mapping |
| `COMPLETED_CHANGES.md` | Running changelog for agent work |
| `coverage-data.json` | Machine-readable coverage (from scanner) |
| Domain reports (`EXAM_TRAP_COVERAGE_REPORT.md`, `LAB_AUDIT_REPORT.md`, etc.) | Deep dives |

**Queue item schema** (`IMPLEMENTATION_QUEUE.json`):

```json
{
  "id": "snake_case_id",
  "priority": "high|medium|low",
  "status": "pending|in_progress|done",
  "area": "content|learning_flow|analytics|ui|infra",
  "objectiveNumber": "2.1|all|…",
  "problem": "one sentence",
  "recommendedImprovement": "one sentence",
  "riskLevel": "low|medium|high",
  "confidenceScore": 0
}
```

When completing work: set `status: "done"`, append to `COMPLETED_CHANGES.md`, update `AGENT_NEXT_STEPS.md`.

### Phase 3 — UI uniformity audit (Home + mobile)

Run this **in addition** to the learning-content audit whenever the user reports visual inconsistency or after major UI changes.

**Target files:** `src/HomeScreen.jsx`, `src/home/*.jsx`, `src/home/homeUi.js`

**Check for:**

| Pattern | Standard (use `src/home/homeUi.js`) |
|---------|--------------------------------------|
| Section headers | `homeSectionLabel()` — xs, bold, letter-spacing 0.5 |
| Semantic chips (STUDY NEXT, streak, domain weight, FOR YOU) | `homePill(accent)` — xs |
| Numeric badges (trap counts, 3×) | `homePillCount(accent)` — micro |
| Cards / blocks | `homeCard()` — radius 14, padding 14, `marginBottom: 12` |
| Accent CTA strips | `homeAccentStrip(accent)` |
| Body copy in cards | `homeBodySm` |
| Header links | `homeLinkBtn(color)` — 44px touch target |
| Dismiss buttons | `homeDismissBtn` |

**Mobile (≤390px) checks:**

- Header title + streak row uses `flexWrap: 'wrap'` — no fixed `marginRight` pushing content off-screen
- Domain title + weight pill wraps (`flexWrap: 'wrap'`)
- Study mode grid: `minmax(0, 1fr)` columns, buttons `minWidth: 0` (not 120px)
- Consistent vertical rhythm: `HOME_SECTION_GAP` (12px) between major blocks
- No mixed border-radius (10 vs 12 vs 14) on same screen without reason

**Deliverable:** fix inconsistencies in code; optionally add `UI_UNIFORMITY_REPORT.md` under `ai-improvement-logs/` listing what was wrong and what was standardized.

**Do not** change global theme — only consolidate inline styles into `homeUi.js` or local shared helpers.

### Phase 4 — Implement one queue item

1. Pick the **single highest-priority `pending`** item from `IMPLEMENTATION_QUEUE.json` (or a user-specified item).
2. Implement the smallest change that fully addresses it.
3. Prefer additive patterns: enrichment patches, new components, build-time scripts — not rewrites.

### Phase 5 — Verify

```bash
npm test
npm run build
```

Fix failures before finishing. Do not commit unless the user asks.

### Phase 6 — Report back

Summarize for the user:

- What you scanned and which logs were refreshed
- UI uniformity findings (if any) and files touched
- Queue item completed (id + one-line outcome) or why blocked
- Test/build status
- Recommended next queue item

---

## END PROMPT

---

## Quick-start commands

```bash
# Refresh machine-readable coverage + all log artifacts
npm run audit:coverage
npm run generate:improvement-logs

# Verify after any implementation
npm test && npm run build
```

## Related docs

- `DO_NOT_TOUCH.md` — forbidden edits
- `SAFE_FILES_TO_EDIT.md` — preferred targets
- `AGENT_NEXT_STEPS.md` — short post-audit checklist
- `IMPLEMENTATION_PHASE_PLAN.md` — phased roadmap
- `src/home/homeUi.js` — home screen style tokens (UI uniformity)

## Automation tip

Save the PROMPT block as a Cursor **Rule** (`.cursor/rules/ccna-audit.mdc`) or **Automation** trigger (e.g. weekly) that runs Phase 1–2 read-only, then asks before implementing. For full autonomous runs, include: *"Proceed through Phase 4 without asking unless blocked."*
