# 99-Implementation Spec: Adaptive Retake + Exam History

## Current State (Problem)

**User workflow:** Mock Exam → Results → Back to main menu

**Missing features:**
- No immediate adaptive retake of missed questions
- No historical record of exams taken
- Can't review past exam performance
- Can't see weak areas across multiple attempts
- Manual navigation to retake specific questions

**Result:** Broken learning loop. User can't quickly solidify mistakes while they're fresh in memory.

---

## Root Issue Analysis

| Gap | Impact | User Need |
|-----|--------|-----------|
| No adaptive retake | Must manually select trap drill or domain pass | "Let me immediately retake just the questions I missed" |
| No exam history | Can't track progress over time | "Show me my exam performance history" |
| No weak area trends | Can't identify patterns | "Where are my consistent weak spots?" |
| No comparison view | Can't see improvement | "Did I get better since last time?" |

---

## Proposed Solution: Adaptive Retake + Exam History

### **Feature 1: Adaptive Retake (Immediately After Exam)**

**Workflow:**
```
Mock Exam (12/20)
  ↓
Results Page
├─ Score card (60%)
├─ Breakdown (correct/wrong/skipped)
└─ [Retake Missed Questions] ← NEW
    ↓
  Adaptive Session (8 questions - just the missed ones)
    ↓
  Retake Results
    └─ Score improvement tracked
```

**Key features:**
- Same 8 questions user missed
- Same answer options (to test real understanding)
- Fast mode (no deep study, just drill)
- Tracks improvement on retake
- Shows which questions improved vs still weak

**Result:**
- Immediate practice = better retention
- User stays in learning flow
- Tests real comprehension (not random luck)

---

### **Feature 2: Exam History (New Hub Page)**

**Workflows:**

**View 1: Exam List**
```
Exams You've Taken (12 total)

Dec 14 · Full Domain Pass (D4) · 18/20 (90%)
  └─ Weak: 4.2, 4.5
  
Dec 14 · Adaptive Retake of D4 · 19/20 (95%) ✓
  └─ Improvement: +5%
  
Dec 13 · Mock Exam (All Domains) · 42/60 (70%)
  └─ Domains: D1: 95%, D2: 78%, D3: 55%, D4: 75%, D5: 62%, D6: 80%

Dec 10 · Adaptive Retake (D3 missed) · 12/14 (86%)
  └─ Improvement: +8%
```

**View 2: Exam Detail**
```
Mock Exam · December 14 · 18/20 (90%)

Domain Breakdown:
  D1: 4/4 (100%)
  D2: 3/4 (75%) ← Weak
  D3: 4/4 (100%)
  D4: 5/7 (71%) ← Weak
  D5: 2/1 (100%)

Missed Questions:
  □ 2.1: DNS zones (0/1)
  □ 4.3: Routing protocols (0/1)

Previous Attempts at This:
  Dec 13: 42/60 (70%) ← First attempt
  Dec 14: 18/20 (90%) ← This attempt
  
Improvement Trend: +20% over 1 day
```

**Key data:**
- Date taken
- Score (raw + %)
- Domain breakdown
- Questions missed (with topic)
- Comparison to previous attempts
- Retake available (if adaptive retake done)

---

## Implementation: Adaptive Retake Flow

### **Section 1: Results Page - New CTA**

**Current:**
```
[Results card]
[Weak topics section]
[Next action buttons]
```

**Proposed:**
```
[Results card]
[Weak topics section]
├─ [Next action buttons]
└─ [NEW] Adaptive Retake CTA (if wrong > 0)
   "Retake the 4 questions you missed"
   [Retake Now] [Skip]
```

**Styling:**
- Mint/sky border (success-focused, not failure)
- "Retake Now" as primary button
- Appears only if 1+ questions missed
- Disappears after user completes retake

---

### **Section 2: Adaptive Retake Session**

**New component: `AdaptiveRetakeSession.jsx`**

```
Retake: 4 Missed Questions

Question 1 of 4

[Same question user missed]
[Same answer options, re-shuffled]

← Previous answer was incorrect
```

**Differences from normal exam:**
- Same questions (tests real learning)
- Options re-shuffled (prevents memorization of positions)
- No timer (focused practice, not timed)
- Shows previous answer (for reference)
- Simpler results (just score, no detailed breakdown)

**Results:**
```
Retake Complete: 3/4 (75%)

You improved:
  ✓ 2.1 DNS zones (was wrong, now right)
  ✓ 4.3 Routing (was wrong, now right)
  ✗ 4.8 OSPF (still wrong)
  
Recommendation:
  Study 4.8 more before next attempt
  [View lesson] [Read explanation]
```

---

## Implementation: Exam History

### **Section 1: New Hub Page**

**Route:** `/exams` or tab in home screen

**Layout:**
```
Exams You've Taken (12)

Filters: [All] [Full exams] [Adaptive retakes]
Sort: [Newest first] [Best score] [Weakest domain]

[Exam card 1] [Exam card 2] [Exam card 3]
```

**Exam card:**
```
┌─────────────────────────────────┐
│ Full Mock Exam                  │
│ Dec 14 · 12:34 PM              │
│ 42/60 (70%)                    │
│                                 │
│ Domains:                        │
│ D1: 95% | D2: 78% | D3: 55%    │
│ D4: 75% | D5: 62% | D6: 80%    │
│                                 │
│ [View Details] [Retake]        │
└─────────────────────────────────┘
```

---

### **Section 2: Exam Detail View**

**Full screen view when clicking exam card:**

```
Mock Exam · December 14, 2026 · 4:23 PM

RESULTS
┌─────────────────────────┐
│ 42/60 (70%)            │
│ 18 correct, 22 missed  │
│ 20 skipped             │
└─────────────────────────┘

DOMAIN BREAKDOWN
D1: 4/4 (100%) ━━━━━━━
D2: 3/4 (75%)  ━━━━░
D3: 4/5 (80%)  ━━━░░
D4: 5/7 (71%)  ━━━░░
D5: 3/5 (60%)  ━━░░░
D6: 23/35 (66%) ━━░░░

WEAK AREAS (3+ misses)
□ D6: Subnetting — 5 missed
□ D3: Routing — 3 missed
□ D5: Security — 2 missed

MISSED QUESTIONS (22 total)
□ 1.2: OSPF timers
□ 3.4: BGP attributes
□ 5.1: ACL rules
... (show top 5, link to see all)

ADAPTIVE RETAKE
[Retake the 22 missed questions]

HISTORICAL COMPARISON
Previous attempts at "Full Mock Exam":
Dec 10: 38/60 (63%) ← First
Dec 14: 42/60 (70%) ← Current
Improvement: +7% in 4 days

[Compare with another exam] [Export results]
```

---

## Database Schema

### **New table: `exam_sessions`**
```sql
CREATE TABLE exam_sessions (
  id TEXT PRIMARY KEY,
  userId TEXT,
  examType ENUM('full_mock', 'domain_pass', 'adaptive_retake'),
  domainId TEXT,  -- null for full exams
  score INT,
  total INT,
  questions JSON,  -- IDs of questions asked
  responses JSON,  -- User responses
  missedQuestionIds JSON,
  timestamp DATETIME,
  relatedAdaptiveRetakeId TEXT,  -- If exam has retake
  relatedPreviousExamId TEXT,    -- If retake, link to original exam
  FOREIGN KEY (relatedAdaptiveRetakeId) REFERENCES exam_sessions(id),
  FOREIGN KEY (relatedPreviousExamId) REFERENCES exam_sessions(id)
)

CREATE INDEX exam_sessions_userId ON exam_sessions(userId);
CREATE INDEX exam_sessions_type ON exam_sessions(examType);
CREATE INDEX exam_sessions_timestamp ON exam_sessions(timestamp);
```

---

## Workflow Scenarios

### **Scenario 1: Immediate Retake**

1. User completes mock exam: 12/20
2. Results page shows "Retake 8 Missed Questions"
3. User clicks [Retake Now]
4. Adaptive session starts with same 8 questions
5. User scores 6/8
6. Results show: "+2 questions fixed from original attempt"
7. User returns to exam history view

### **Scenario 2: Review Past Exam**

1. User clicks Exams tab
2. Sees all 15 exams they've taken
3. Clicks Dec 10 exam (worst performance)
4. Views detail: 38/60 (63%)
5. Sees D5 had only 2/7 (29%)
6. Clicks D5 to see which questions missed
7. Decides to study D5 more

### **Scenario 3: Track Improvement**

1. User looks at Exam History
2. Sorts by "Best score"
3. Sees progression: 63% → 65% → 68% → 70%
4. Identifies that each full exam attempt improves
5. Notices D5 improves slowly (still weak)
6. Focuses effort on D5 next

---

## Key Features

**Adaptive Retake:**
- ✅ Same questions (tests real learning, not luck)
- ✅ Shuffled options (prevents position memorization)
- ✅ No timer (focused practice)
- ✅ Quick UI (in-flow, not separate session)
- ✅ Improvement tracked (vs original attempt)
- ✅ Link original to retake (data relationship)

**Exam History:**
- ✅ List view (chronological, filterable)
- ✅ Detail view (domain breakdown, weak areas)
- ✅ Trend analysis (improvement over time)
- ✅ Comparison (vs previous attempts)
- ✅ Export option (for review)
- ✅ Search/filter (by date, score, type)

---

## Success Metrics

- [ ] User retakes missed questions immediately after exam
- [ ] 70%+ of users engage with adaptive retake
- [ ] Exam history accessed by 50%+ of users
- [ ] Users identify weak areas from history
- [ ] Improvement visible over 3+ exams
- [ ] No performance regression (retakes run fast)

---

## Implementation Phases

**Phase 1: Adaptive Retake (2-3 days)**
1. Create AdaptiveRetakeSession component
2. Add retake CTA to results page
3. Track retake vs original exam
4. Simple retake results screen

**Phase 2: Exam History (3-4 days)**
1. Create exam_sessions table
2. Persist exam data after each exam
3. Build exam list view
4. Build exam detail view
5. Add trends/comparison logic

**Phase 3: Polish (1-2 days)**
1. Export functionality
2. Filtering/sorting
3. Performance optimization
4. Mobile responsive

---

## Why This Works

✅ **Keeps user in flow** — no navigation away from results  
✅ **Solidifies learning** — immediate practice on misses  
✅ **Tracks progress** — shows improvement over time  
✅ **Identifies patterns** — weak areas across attempts  
✅ **Motivates** — sees score improvement  
✅ **Completes loop** — Study → Practice → Assess → Strengthen → Retake
