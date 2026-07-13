# 99-Implementation Spec: Clean Domain Entry Point

## Current State (Problem)

**User workflow:** Study → Practice Questions → Assess Understanding

**Current interface clutter:**
- FocusedLessonBank (needed)
- CompactLessonsList (redundant with FocusedLessonBank)
- Traps section (secondary tools, not part of main flow)
- More tools section (study modes already exist elsewhere)

**Result:** Domain view is a dumping ground for every tool, not a focused entry point.

---

## Root Issue Analysis

**Why these sections don't fit:**

| Section | Current Location | Problem | User Has Better Alternative |
|---------|-----------------|---------|---------------------------|
| CompactLessonsList | Domain view | Shows lessons you already see in FocusedLessonBank | FocusedLessonBank + other study modes |
| Traps | Domain view | Trap drills are secondary/optional tools | Trap Drill mode in main menu |
| More tools | Domain view | Study modes, domain pass, mock exams | Main menu study modes |

**Insight:** These aren't "domain-specific" tools—they're global study tools that happen to be displayed in a domain context. Domain view should be clean: **"Start studying this domain"** not **"Access every study tool from here."**

---

## Proposed Solution: Clean Domain Entry Point

### **The Goal**
Domain view = Fast entry to your workflow (Study → Practice → Assess)

### **What Changes**

**Remove from domain view:**
- ❌ CompactLessonsList (redundant)
- ❌ Traps section (secondary)
- ❌ More tools section (duplicates main menu)

**Keep in domain view:**
- ✅ FocusedLessonBank (your quick launcher)

**Result:**
```
┌─ DOMAIN PASS: 1/6 (50%) ──────┐
├─ Domain header + progress bar ─┤
├─ FocusedLessonBank ────────────┤
│ 📌 Your next: 4.3, 4.1, 4.2    │
│ [Study] [5Q] [Lab] [Terms]     │
└────────────────────────────────┘
```

**Space saved:** 400px+  
**Cognitive load:** Reduced 70%  
**Focus:** Pure Study → Practice → Assess

---

## Three Implementation Approaches

### **OPTION A: Clean Removal (Simplest)**

**What to do:**
- Delete CompactLessonsList from domain view
- Delete Traps section from domain view
- Delete More tools section from domain view
- Keep FocusedLessonBank only

**Pros:**
- Simplest implementation (1 commit)
- Cleanest user experience
- No confusion about where tools are
- Forces intentional tool discovery (via main menu)

**Cons:**
- If user frequently needs traps/tools from domain context, they'll need to navigate back to main menu
- Might feel sparse if domain view is too minimal

**When to use:** If you rarely need secondary tools during domain study.

---

### **OPTION B: Post-Practice Secondary Tools (Contextual)**

**What to do:**
1. Remove all three sections from domain view (same as Option A)
2. **New:** After user completes a practice session → Show "Want more?" section with:
   - Trap Drill (for this domain's traps)
   - Domain Pass (prove mastery)
   - Mock Exam (full assessment)

**Workflow:**
```
Domain Entry:
  ↓ [Study] button clicked
  ↓ [Practice Questions] loaded
  ↓ User finishes practice session
  ↓ [Want more practice? Trap Drill | Domain Pass | Mock Exam]
```

**Pros:**
- Tools appear when actually useful (after you know what to work on)
- Keeps domain view clean
- Better UX (contextual, not anticipatory)
- Matches user's assess-then-strengthen workflow

**Cons:**
- Requires changes to practice session UI (not just domain view)
- More complex implementation

**When to use:** If you want tools available but only when contextually relevant.

---

### **OPTION C: Collapsible "Strengthen Weak Areas" Section (Discoverable)**

**What to do:**
1. Remove CompactLessonsList and Traps section
2. Keep More tools but rename to "Strengthen Areas"
3. Make it collapsed by default: `▶ Strengthen Weak Areas`
4. When expanded, shows:
   - Traps drills (ranked by frequency of misses)
   - Domain Pass (prove mastery)
   - Mock Exam (full assessment)

**Workflow:**
```
Domain Entry:
  ↓ FocusedLessonBank (Study → Practice → Assess)
  ▶ Strengthen Weak Areas (collapsed, not distracting)
    ↓ [If needed] Click to expand and access tools
```

**Pros:**
- Tools still accessible from domain view (no navigation back to main menu)
- Collapsed by default (clean interface)
- Discoverable (▶ affordance shows it's expandable)
- Contextual (appears after you've practiced)

**Cons:**
- Still takes some real estate (the collapsed header)
- Slightly more complex than Option A

**When to use:** If you want tools close by but out of the way.

---

## My Recommendation

**Option B (Post-Practice Secondary Tools)** feels most aligned with your workflow:

**Why:**
1. **Matches your flow:** Study → Practice → [Then] Assess + Strengthen
2. **Psychological fit:** Tools appear when you need them (after practicing, when you know gaps)
3. **Keeps domain view sacred:** Entry point stays focused on your main workflow
4. **No distraction:** No collapsible headers or secondary sections cluttering the view
5. **Better UX:** Contextual > anticipatory

**The tradeoff:** Requires modifying the practice session completion screen (extra work, but worth it).

---

## Comparison: All Three Options

| Aspect | Option A (Clean) | Option B (Post-Practice) | Option C (Collapsible) |
|--------|-----------------|------------------------|----------------------|
| **Domain view complexity** | Minimal | Minimal | Minimal + 1 header |
| **Tool accessibility** | Main menu only | After practice session | Domain view (collapsed) |
| **Matches your workflow** | ✅ Study entry only | ✅✅ Study → Practice → Tools | ✅ All in one place |
| **Cognitive load** | Lowest | Low | Low + 1 decision |
| **Implementation effort** | Easy (1 commit) | Medium (2 UIs) | Easy (1 commit) |
| **Discovery** | User must know to look | Obvious (UI shows after practice) | User must click ▶ |

---

## Quality Checklist (For Whichever Option You Choose)

- [ ] CompactLessonsList removed from domain view
- [ ] Traps section removed from domain view
- [ ] FocusedLessonBank remains (your quick launcher)
- [ ] Domain view is focused on Study → Practice → Assess
- [ ] Secondary tools are accessible but not intrusive
- [ ] User can still access all study modes (just maybe from different location)
- [ ] No redundant UI (no duplicate lesson lists)

---

## Decision Framework

**Choose OPTION A if:**
- You rarely access secondary tools from domain view
- You prefer absolute simplicity
- Main menu access is sufficient

**Choose OPTION B if:**
- You want tools available contextually (after you've practiced)
- You're willing to improve practice session UI
- You want the cleanest domain view + logical workflow

**Choose OPTION C if:**
- You want quick access but not distracting
- Collapsed headers feel right to you
- You want a single screen for domain work

---

## Next Steps

**Once you choose an option, I will:**
1. Remove CompactLessonsList, Traps, More tools from domain view
2. Implement your chosen option's additions
3. Test and deploy
4. All in one commit

Which approach feels right for your study workflow?
