# 99-Implementation Spec: Focused Lesson Bank

## Current State (Problem)
The "Now" section wastes vertical space with redundant info already in Lessons below, creating cognitive load and visual clutter for learners trying to study quickly.

---

## Proposed Solution: **Focused Lesson Bank** (Efficient Use of Space)

### **What Goes There**
Replace the "Now" section with a **compact, context-aware lesson picker** that shows:

```
┌─ LESSON FOCUS ────────────────────────────┐
│ 📌 Your next: 4.3, 4.1, 4.2              │
│                                           │
│ [Study] [Quick Check] [Lab] [Terms]      │
│ ← Fast-jump buttons for NEXT objective    │
└───────────────────────────────────────────┘
```

### **Why This Is Better**

| Current "Now" | New "Focused Lesson Bank" |
|---|---|
| Shows stats (0% seen, no baseline) | Only shows actionable buttons |
| Duplicates lessons below | One-click jump to next topic |
| Takes 4+ lines | Takes 2-3 lines |
| Confuses new learners | Clear CTAs (Study, Quick Check, Lab) |
| Generic info | Contextual (shows YOUR next objectives) |

---

## Implementation Details

### **Field 1: miniObjectiveDisplay**
**What it shows:**
```
📌 Your next: 4.3, 4.1, 4.2
```
- Max 3 objectives (from `suggestDomainPassNextAction`)
- Icon = "current focus" signal
- Uses objective IDs only (compact)

**Why this works:**
- Learners see what's queued (no guessing)
- Matches the `Next:` value they care about
- Takes <1 line

---

### **Field 2: fastJumpButtons** 
**Structure:**
```
[Study] [Quick Check (5Q)] [Lab] [Terms]
```

**Button specs:**
- Study: Routes to curated Study mode for next objective
- Quick Check: 5-question spot check
- Lab: CLI labs for next objective (if available)
- Terms: Flashcard review for next objective

**Why this works:**
- 4 most common entry points from one place
- Removes need to scroll to Lessons for common actions
- Each button has clear intent

---

### **Field 3: compactMetrics** (Optional)
If space remains, show a one-liner summary (collapsible):

```
─ Details: 0% seen · No baseline · 0/14 labs
```

- Click to expand/collapse
- Only shown if user has explored the domain
- Doesn't clutter first-time learners' view

---

## Expected UX Flow

### **Before (Current)**
1. User lands on Domain Pass Hub
2. Reads "Now" section (takes 3 seconds to parse)
3. Sees confusing stats
4. Scrolls down to Lessons
5. Picks an objective
6. Picks Study/Quick Check/Lab
= **5+ actions to start studying**

### **After (Focused Lesson Bank)**
1. User lands on Domain Pass Hub
2. Sees "Your next: 4.3, 4.1, 4.2"
3. Clicks [Study] button
4. Launches Study mode for 4.3
= **2 actions to start studying** ⚡

---

## Code Architecture

### **Component: FocusedLessonBank.jsx**

```javascript
export default function FocusedLessonBank({
  nextObjectives = [],        // From suggestDomainPassNextAction()
  onStudy,                     // Route to Study mode
  onQuickCheck,                // 5Q quiz
  onOpenLab,                   // CLI Lab
  onOpenTerms,                 // Flashcard review
  showDetailedMetrics = false, // Collapsible
  exposure = {},               // Stats for optional details
}) {
  // Shows: 📌 Your next: 4.3, 4.1, 4.2
  // Then: [Study] [Quick Check (5Q)] [Lab] [Terms]
  // Then: ─ Details: 0% seen · No baseline (if showDetailedMetrics)
}
```

### **Size Savings**
- Old "Now" section: 240px height
- New "Focused Lesson Bank": 80px height
- **Space saved: 160px (~2 lesson cards worth)**

---

## Placement

**Before:**
```
┌─ DOMAIN PASS: 0/6 ──────────────────┐
├─ NOW (wastes space) ─────────────────┤
├─ LESSONS ───────────────────────────┤
│ 4.1 · Unseen                        │
│ 4.10 · Unseen                       │
│ 4.2 · Unseen                        │
└─────────────────────────────────────┘
```

**After:**
```
┌─ DOMAIN PASS: 0/6 ──────────────────┐
├─ FOCUSED LESSON BANK (compact) ─────┤
├─ LESSONS ───────────────────────────┤
│ 4.1 · Unseen                        │
│ 4.10 · Unseen                       │
│ 4.2 · Unseen                        │
│ 4.3 · Unseen                        │  ← Room for one more!
└─────────────────────────────────────┘
```

---

## Quality Checklist

- [ ] Shows only actionable next objectives (not all stats)
- [ ] Four fast-jump buttons are clearly labeled
- [ ] Compact height (≤80px)
- [ ] Reduces scroll-to-study distance
- [ ] Optional metrics don't clutter first-time view
- [ ] Mobile-responsive (buttons stack if needed)
- [ ] One-click access to Study/Quick Check/Lab/Terms
- [ ] Clear visual hierarchy vs. Lessons below

---

## Success Metric

**Before:** User needs 5+ actions to start studying  
**After:** User needs 2 actions to start studying  
**Result:** 60% fewer interactions to reach study mode ✅

---

## Comparison Table

| Metric | Now Section | Focused Lesson Bank |
|--------|-------------|-------------------|
| Space used | 240px | 80px |
| Cognitive load | High (stats + buttons) | Low (action-focused) |
| Time to study | 5+ actions | 2 actions |
| Clarity | Confusing | Clear |
| Mobile fit | Cuts off | Fits perfectly |
| Power user value | Low | High |
