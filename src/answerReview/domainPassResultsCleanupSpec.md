# 99-Implementation Spec: Clean Domain Pass Results Page

## Current State (Problem)

**User's workflow:** Domain Pass → Results → [Choose next action]

**Current screen clutter:**
- Results card (score + breakdown)
- "Fix next" section (for FAIL only, shows 2-3 buttons)
- "Weak topics — Study first" section (shows EVERY weak objective as individual button)
  - Can expand to 8+ buttons for weak areas
  - Duplicates the "Study first" button for top weak
  - Overwhelming when 5+ weak topics
- MockExamDebriefActions component (hidden but contextual analysis)
- "This domain" section (trap drill, labs, commands, subnetting)
- Focus session buttons (if focus session)

**Result:** Too many options, unclear what to do next, weak areas section overwhelms the page.

---

## Root Issue Analysis

| Problem | Impact | User Need |
|---------|--------|-----------|
| Weak topics list shows ALL weak areas as buttons | Page is 50% buttons, hard to scan | "Show me the top weak areas, not every one" |
| Multiple "study first" variants (top weak, all weak buttons) | Confusing which to click | "One clear next action for weak areas" |
| "This domain" section always visible | Takes space, not always needed after FAIL | "Hide secondary tools when I've already failed" |
| No clear prioritization | "Fix next" and "Weak topics" compete | "Obvious path: FAIL → Fix misses → Retake" |
| MockExamDebriefActions unclear | Buried under other content | "Show recommendations only when relevant" |

---

## Proposed Solution: Focused Results Flow

### **Design Principles**

1. **PASS path** (score ≥ 80%):
   - Show victory → domain mastered
   - Offer: Next domain, prove again, related tools
   
2. **FAIL path** (score < 80%):
   - Show gap → clear next action
   - Offer: Fix weak areas, retake, understand misses

3. **Compact weak areas** (max 3 visible):
   - Show top 3 by miss frequency
   - "See all weak areas" link for full list
   - Don't show individual study buttons for each

4. **Collapsible secondary tools**:
   - Hide "This domain" tools by default
   - Expand on demand for advanced learners

---

## Implementation: Clean Results Card

### **Section 1: Score + Verdict (Always)**
```
100%
[PASS badge]
9/9 correct

Next: You've mastered this domain ✓
```

**Compact:**
- Large score number (99 design)
- Single verdict (PASS/FAIL)
- Summary line only (correct/total)
- "Next:" label with clear guidance

---

### **Section 2: Weak Areas (Conditional - FAIL only)**

**Current:** 
```
Weak topics — Study first
□ 4.1 [Study] [5Q] [Lab]
□ 4.2 [Study] [5Q] [Lab]
□ 4.3 [Study] [5Q] [Lab]
□ 4.5 [Study] [5Q] [Lab]
□ 4.8 [Study] [5Q] [Lab]
[Study 4.1 first →]
```

**Proposed:**
```
Weak areas (3 of 5)
• 4.1 — Network devices (2 misses)
• 4.2 — Addressing (1 miss)
• 4.3 — Protocols (1 miss)

[Study top weak areas] [See all 5 weak areas]
```

**Changes:**
- Top 3 weak areas ranked by miss frequency
- Compact line format, no duplicate study buttons
- Miss count shows why it's weak
- Two action buttons instead of 5+ buttons
- "See all" link for comprehensive review

---

### **Section 3: Next Action (Context-aware)**

**If PASS:**
```
Ready for next domain
[Practice D5] [Review this domain] [More options ▼]
```

**If FAIL:**
```
Fix and retake
[Study weak areas] [Retake this domain] [More options ▼]
```

**Structure:**
- One clear primary action (button)
- One alternative (if applicable)
- "More options ▼" collapsible for advanced paths

---

### **Section 4: More Options (Collapsible)**

**Hidden by default, expands on click:**
```
▼ More options

Fix weak spots:
  [Trap drill — domain]
  [Fix misses only — mock exam]

Reference:
  [Terms hub]
  [Command hub]
  [Labs for this domain (2)]

Retake options:
  [Full domain pass]
  [Focus on weak areas]
```

**Grouped** by purpose instead of flat list.
**Only relevant buttons shown** (no clutter).

---

## Visual Hierarchy

### **PASS Result:**
```
┌────────────────────────────────┐
│ 94%                            │
│ [PASS badge]                   │
│ 9/10 correct                   │
│ Next: Almost there! 1 fix needed│
├────────────────────────────────┤
│ Weak areas (1 of 1)            │
│ • 4.5 — Protocols (1 miss)     │
│                                │
│ [Study weak areas] [See all ▶] │
├────────────────────────────────┤
│ [Practice next domain]         │
│ [Review this domain]           │
│ [More options ▼]               │
└────────────────────────────────┘
```

### **FAIL Result:**
```
┌────────────────────────────────┐
│ 42%                            │
│ [FAIL badge]                   │
│ 5/12 correct                   │
│ Next: Study weak areas, retake │
├────────────────────────────────┤
│ Weak areas (3 of 6)            │
│ • 4.1 — Devices (4 misses)     │
│ • 4.2 — Addressing (3 misses)  │
│ • 4.3 — Protocols (2 misses)   │
│                                │
│ [Study weak areas] [See all ▶] │
├────────────────────────────────┤
│ [Retake this domain]           │
│ [Review this domain]           │
│ [More options ▼]               │
└────────────────────────────────┘
```

---

## Space Savings

| Section | Current | Proposed | Saved |
|---------|---------|----------|-------|
| Weak topics list | 6-8 buttons (240px) | 1 line list + 2 buttons (80px) | 160px |
| "This domain" section | Always visible (200px) | Collapsed (20px header) | 180px |
| Duplicate study buttons | 5+ buttons | Consolidated to 1 | 100px+ |
| **Total** | ~600px | ~250px | ~350px ✅ |

---

## Implementation Plan

### **Phase 1: Consolidate Weak Areas**
1. Show only top 3 weak objectives by miss frequency
2. Add "See all weak areas" link that expands full list OR navigates to detail page
3. Display miss count for each
4. Remove individual [Study] buttons for each weak area

### **Phase 2: Smart Next Actions**
1. Change "Weak topics — Study first" to conditional "Next" guidance
2. If PASS: "Ready for next domain" vs if FAIL: "Fix and retake"
3. Primary button changes based on pass/fail status
4. Add "More options ▼" collapsible section

### **Phase 3: Collapse Secondary Tools**
1. Move "This domain" (trap drill, labs, commands) into collapsed section
2. Show header only by default: "More options ▼"
3. Expand on click to show grouped buttons by category
4. Keep logic but hide until needed

### **Phase 4: Update Focus Session Logic**
1. When user completes focus session with 100% on weak areas:
   - Clear the weak areas list from results
   - Show "Weak areas addressed ✓" instead
   - Don't show weak areas section if all were mastered
2. Full domain pass still shows weak areas as normal

---

## Code Changes Required

**File:** `src/features/domainPass/DomainPassSession.jsx`

1. Extract weak topics rendering → new component `WeakAreasCompact.jsx`
2. Extract next action logic → new component `ResultsNextAction.jsx`
3. Extract secondary tools → collapsible section in main return
4. Update state management to track expanded/collapsed state
5. Add logic to clear weak areas after focus session success

---

## Success Metrics

- [ ] Weak topics section max height: 120px (was 240px)
- [ ] "This domain" section hidden by default (save 200px)
- [ ] One clear primary action visible (not confused by 5+ buttons)
- [ ] Focus session results show "Addressed ✓" not weak areas
- [ ] Mobile viewport shows results without excessive scrolling

---

## Quality Checklist

- [ ] PASS path clear: "Next domain" or "Prove again"
- [ ] FAIL path clear: "Study weak areas" then "Retake"
- [ ] Weak areas limited to top 3 with counts
- [ ] Secondary tools hidden by default
- [ ] More options section easy to expand
- [ ] Focus session properly clears weak areas when 100%
- [ ] No duplicate "study first" buttons
- [ ] Mobile friendly (not 10+ buttons visible)

---

## Why This Works

✅ **PASS result users** see: victory → next action (one clear path)
✅ **FAIL result users** see: gap → how to fix → retry
✅ **Weak areas** are ranked, not overwhelming (top 3 only)
✅ **Advanced tools** available but not taking real estate
✅ **Focus sessions** properly resolve weak areas in UI
✅ **Mobile** won't need excessive scrolling through options

