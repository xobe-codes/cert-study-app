# 99-Implementation Spec: Compact Lessons List

## Current State (Problem)
The Lessons section wastes vertical space with:
- Large card containers for each lesson (4+ lines per objective)
- Repetitive 3-button layout on every card
- Poor mobile fit (forces extensive scrolling)
- Unclear visual hierarchy (all lessons treated equally)
- Status info buried in card header

---

## Proposed Solution: **Compact Lessons List** (Efficient Learning)

### **What It Looks Like**

```
┌─ LESSONS (4) ───────────────────────────┐
│ 4.1 · Unseen      [Study] [5Q] [Lab]   │
│ 4.10 · Unseen     [Study] [5Q] [Lab]   │
│ 4.2 · Unseen      [Study] [5Q] [Lab]   │
│ 4.3 · Unseen      [Study] [5Q] [Lab]   │
└─────────────────────────────────────────┘
```

### **Why This Is Better**

| Current Design | Compact Lessons List |
|---|---|
| 4+ lines per lesson | 1 line per lesson |
| Large card containers | Inline buttons |
| All lessons same size | Visual priority (next objective highlighted) |
| Status hard to scan | Status inline, easy to scan |
| Takes 8+ lesson slots | Can show 8-10 lessons per screen |
| Mobile: forces scrolling | Mobile: all lessons visible |

---

## Implementation Details

### **Field 1: lessonHeader**
**Display:**
```
LESSONS (4)
```
- Shows total count (helps learner understand scope)
- All caps for clarity
- Compact 1 line

---

### **Field 2: lessonList**
**Row structure (each lesson):**
```
4.1 · Unseen    [Study] [5Q] [Lab]
```

**Components:**
- **Objective ID** (e.g., "4.1")
- **Status badge** (Unseen, In Progress, Mastered, Weak)
- **Button cluster** (right-aligned):
  - [Study] - Full lesson
  - [5Q] - Quick check (5 questions)
  - [Lab] - CLI lab (if available)

**Styling:**
```css
display: flex;
justify-content: space-between;
align-items: center;
padding: 8px 12px;
border-bottom: 1px solid border;
height: 44px;  /* Single line, touch-friendly */
```

**Status badge colors:**
- ⚪ Unseen = silver
- 🟡 In Progress = amber
- 🟢 Mastered = mint
- 🔴 Weak = rose

---

### **Field 3: statusIndicator**
**Inline status display:**
```
4.1 · Unseen        4.2 · In Progress    4.3 · Mastered
```

**Why inline:**
- Scans instantly (no need to open cards)
- Shows objective progress at a glance
- Helps learners prioritize (weak/in-progress first)

---

### **Field 4: buttonCluster**
**Compact button layout:**

```html
<div style="display: flex; gap: 4px;">
  <button>[Study]</button>
  <button>[5Q]</button>
  <button>[Lab]</button>
</div>
```

**Button specs:**
- Small text: `var(--ccna-type-micro)`
- Minimal padding: 6px 10px
- No label text (icons + abbreviations only)
- Touch-friendly: 32px min height
- Gap: 4px between buttons

**Why compact:**
- No redundant text (already showed on card)
- Fast scanning
- Fits mobile screens
- More lessons visible per screen

---

## Expected UX Flow

### **Before (Current)**
```
Screen 1: Lessons 4.1, 4.10, 4.2
Screen 2: Lessons 4.3 (+ scroll to Traps)
```
= **Multiple screens to see all lessons**

### **After (Compact Lessons List)**
```
Screen 1: All 4 lessons + Traps visible
```
= **Single screen shows complete study plan** ⚡

---

## Visual Hierarchy

**Priority levels:**
1. **Next Objective** (from FocusedLessonBank) - Highlighted in color
2. **Weak/In Progress** - Amber/Rose badges
3. **Unseen** - Gray (default)
4. **Mastered** - Mint (complete, low priority)

---

## Code Architecture

### **Component: CompactLessonsList.jsx**

```javascript
export default function CompactLessonsList({
  lessons = [],           // Array of {id, status, hasCLILab}
  nextObjectiveId = null, // Highlight this one
  onStudy,                // (objectiveId) => startStudy
  onQuickCheck,           // (objectiveId) => start5Q
  onOpenLab,              // (objectiveId) => openCLILab
}) {
  // Shows: LESSONS (4)
  // Then: 4.1 · Unseen    [Study] [5Q] [Lab]
  //       4.10 · Unseen   [Study] [5Q] [Lab]
  //       etc.
}
```

### **Size Savings**

| Metric | Current | Compact | Saved |
|--------|---------|---------|-------|
| Per lesson | 80px | 44px | 36px |
| 4 lessons | 320px | 176px | 144px |
| With header/gaps | 350px | 200px | 150px |

**Result:** 150px saved = 1-2 additional lesson cards OR move Traps higher

---

## Status Badge System

```javascript
const statusColors = {
  unseen: { bg: COLORS.cardBg, text: COLORS.silverMid },
  in_progress: { bg: COLORS.amberDim, text: COLORS.amber },
  weak: { bg: COLORS.roseDim, text: COLORS.rose },
  mastered: { bg: COLORS.mintDim, text: COLORS.mint },
}
```

**Display:**
```
4.1 · Unseen       ← Shows at a glance what to focus on
4.2 · Mastered
4.3 · In Progress
```

---

## Mobile Responsiveness

**Desktop (>640px):**
```
4.1 · Unseen    [Study] [5Q] [Lab]
```

**Mobile (<640px):**
```
4.1 · Unseen
[Study] [5Q] [Lab]  ← Buttons stack below
```

```css
@media (max-width: 640px) {
  display: flex;
  flex-direction: column;
  gap: 6px;
  
  .buttons {
    display: flex;
    justify-content: flex-start;
  }
}
```

---

## Quality Checklist

- [ ] Shows all lessons on single screen (no scroll required)
- [ ] Status badges are color-coded and scannable
- [ ] Buttons are compact but touch-friendly (32px min)
- [ ] Next objective is visually highlighted
- [ ] Mobile layout: buttons stack when needed
- [ ] 150px vertical space freed
- [ ] One-click access to Study/5Q/Lab
- [ ] Lesson count shown in header
- [ ] Weak/In Progress lessons prioritized visually
- [ ] All 4 lessons + Traps visible in viewport

---

## Comparison: Current vs Proposed

```
CURRENT:                    PROPOSED:
┌─ Lessons ──────┐         ┌─ LESSONS (4) ──┐
│ 4.1 · Unseen   │         │ 4.1 · Unseen   │
│ [Study]        │    ===> │ [Study][5Q][Lab]
│ [5Q]           │         │ 4.10 · Unseen  │
│ [Lab]          │         │ [Study][5Q][Lab]
├────────────────┤         │ 4.2 · Unseen   │
│ 4.10 · Unseen  │         │ [Study][5Q][Lab]
│ [Study]        │         │ 4.3 · Unseen   │
│ [5Q]           │         │ [Study][5Q][Lab]
│ [Lab]          │         └────────────────┘
├────────────────┤
│ 4.2 · Unseen   │
│ [Study]        │
│ [5Q]           │
│ [Lab]          │
├────────────────┤
│ 4.3 · Unseen   │
│ [Study]        │
│ [5Q]           │
│ [Lab]          │
└────────────────┘
(need to scroll)
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Space saved | 150px+ |
| Lines per lesson | 1 (was 4+) |
| Lessons visible | 4-8 (was 1-2) |
| Traps visibility | Higher on screen |
| Mobile scroll | Minimal |
| Status scanability | Instant |

---

## Implementation Priority

1. **Phase 1:** Compact list layout (1 line per lesson)
2. **Phase 2:** Status badges (color-coded)
3. **Phase 3:** Highlight next objective
4. **Phase 4:** Mobile responsive buttons

---

## Related Components

- **FocusedLessonBank** - Shows next 3 objectives + 4 buttons (replaces "Now")
- **CompactLessonsList** - Shows all lessons in compact form (replaces large cards)
- **Traps section** - Now more visible with freed space

Together = **Reduced scrolling, faster study starts, better mobile UX** ⚡
