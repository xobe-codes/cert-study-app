# 99-Implementation Spec: Routing Table Decoder Challenge Mode

## Current State (Problem)

**User experience:** Open routing table decoder → Hints already visible → Just follow hints → No real challenge

**Problems:**
- Hints displayed before answer attempt
- Removes cognitive challenge
- User doesn't engage with decoder logic
- Feels like guided walkthrough, not practice
- Weak learning outcome (hints != understanding)

**Result:** User doesn't actually learn routing table interpretation, just follows visible steps.

---

## Root Issue Analysis

| Problem | Impact | User Need |
|---------|--------|-----------|
| Hints shown upfront | No challenge | "Let me figure this out first" |
| No attempt required | Can skip thinking | "Show hints only after I try" |
| All hints visible | Overwhelms learner | "Show hints gradually" |
| No difficulty progression | Too easy | "Make it harder once I've mastered basics" |
| No performance tracking | No learning metrics | "Track my accuracy without hints" |

**Result:** Routing table decoder is practice tool, not assessment tool. User can "pass" without understanding.

---

## Proposed Solution: Challenge Mode with Progressive Hints

### **The Ideal Workflow**

```
BEFORE (Current)
├─ User opens decoder
├─ Hints already visible
├─ User reads hints
└─ User "figures out" answer
   └─ No actual thinking

AFTER (Proposed)
├─ User opens decoder
├─ Question shows, NO HINTS
├─ User analyzes routing table
├─ User submits answer
├─ If correct → ✓ Great!
├─ If wrong → Show Hint 1
├─ User re-analyzes
├─ If still wrong → Show Hint 2
├─ User re-tries
├─ If still wrong → Show Hint 3 (full explanation)
└─ User learns from mistake
```

---

## Feature 1: Challenge Mode (No Upfront Hints)

### **Question Display - Challenge Mode**

**BEFORE (current - hints visible):**
```
┌─────────────────────────────────────┐
│ Routing Table Decoder               │
│                                     │
│ Routing Table:                      │
│ ┌─────────────────────────────────┐ │
│ │ Dest    Next Hop  Metric  Route │ │
│ │ 10.0/24 192.1.1.1   10    OSPF  │ │
│ │ 10.1/24 192.1.1.2   20    BGP   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Question: Which prefix is used?    │
│                                     │
│ HINTS (ALWAYS VISIBLE):             │ ← PROBLEM
│ • Check destination column          │
│ • Look for smallest subnet          │
│ • Compare: 10.0/24 vs 10.1/24      │
│                                     │
│ Answer options:                     │
│ ○ 10.0/24                          │
│ ○ 10.1/24                          │
│ ○ 192.1.1.1                        │
│ ○ 192.1.1.2                        │
│                                     │
│ [Submit]                           │
└─────────────────────────────────────┘
```

**AFTER (proposed - no upfront hints):**
```
┌─────────────────────────────────────┐
│ Routing Table Decoder               │
│                                     │
│ Routing Table:                      │
│ ┌─────────────────────────────────┐ │
│ │ Dest    Next Hop  Metric  Route │ │
│ │ 10.0/24 192.1.1.1   10    OSPF  │ │
│ │ 10.1/24 192.1.1.2   20    BGP   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Question: Which prefix is used?    │
│                                     │
│ [Hint] button instead of showing   │ ← CHANGE
│                                     │
│ Answer options:                     │
│ ○ 10.0/24                          │
│ ○ 10.1/24                          │
│ ○ 192.1.1.1                        │
│ ○ 192.1.1.2                        │
│                                     │
│ [Submit]                           │
└─────────────────────────────────────┘
```

---

## Feature 2: Progressive Hints System

### **Hint Levels (Revealed on Demand)**

**Hint 1: Nudge** (mild hint)
```
[Hint 1/3: Nudge]

"Think about which column you should focus on 
to answer this question."

[Next hint] or [Try again]
```

**Hint 2: Guidance** (medium hint)
```
[Hint 2/3: Guidance]

"Look at the destination column. You need to 
identify which prefix matches the traffic."

[Next hint] or [Try again]
```

**Hint 3: Explanation** (full explanation)
```
[Hint 3/3: Full Explanation]

"The destination column shows prefixes:
• 10.0/24 (first route)
• 10.1/24 (second route)

For this traffic pattern, the router would select 
10.0/24 because it matches the destination."

[Back to answer]
```

### **Hint Workflow**

```
User opens question
    ↓
[Question] [Hint button]
    ↓
User attempts answer
    ↓
┌─────────────────────────────────┐
│ ✗ Not quite right               │
│                                 │
│ [Show Hint] to help you think   │
└─────────────────────────────────┘
    ↓
[Hint 1 revealed]
    ↓
User re-attempts
    ↓
┌─────────────────────────────────┐
│ ✗ Still not right               │
│                                 │
│ [Show next hint] for more help  │
└─────────────────────────────────┘
    ↓
[Hint 2 revealed]
    ↓
User re-attempts
    ↓
┌─────────────────────────────────┐
│ ✗ One more hint available       │
│                                 │
│ [Show full explanation]         │
└─────────────────────────────────┘
    ↓
[Hint 3 revealed - full explanation]
```

---

## Feature 3: Difficulty Levels

### **Difficulty Setting**

```
Routing Table Decoder

Difficulty: [Easy] [Standard] [Hard]

├─ Easy: Basic routing table, few routes
│  └─ 2-3 routes, simple matching
│  └─ Hints available from first attempt
│
├─ Standard: ← DEFAULT
│  └─ 3-4 routes, multiple protocols
│  └─ Hints after first wrong answer
│
└─ Hard: Challenge mode
   └─ 4-5 routes, complex scenarios
   └─ Hints available but encourages solving
```

### **Difficulty Progression**

```javascript
const difficultyConfigs = {
  easy: {
    routeCount: 2,
    complexity: 'simple',
    hintPolicy: 'always_available',
    showHintOnWrong: true,
    hintDelay: 0,
  },
  standard: {
    routeCount: 3,
    complexity: 'medium',
    hintPolicy: 'after_one_wrong',
    showHintOnWrong: true,
    hintDelay: 2000,  // Show after 2 sec
  },
  hard: {
    routeCount: 4,
    complexity: 'complex',
    hintPolicy: 'on_demand_only',
    showHintOnWrong: false,  // User must ask
    hintDelay: 0,
  },
}
```

---

## Feature 4: Challenge Scoring

### **Accuracy Without Hints**

```
After submitting answer:

┌─────────────────────────────────┐
│ ✓ Correct!                      │
│                                 │
│ Performance:                    │
│ • Correct on attempt 1 (no hints)
│ • Accuracy score: 100%          │
│ • Confidence: Very High          │
│                                 │
│ Rating: ⭐⭐⭐⭐⭐              │
└─────────────────────────────────┘
```

```
After showing Hint 1 + wrong, then correct:

┌─────────────────────────────────┐
│ ✓ Correct!                      │
│                                 │
│ Performance:                    │
│ • Correct after hint 1          │
│ • Accuracy score: 80%           │
│ • Confidence: Good              │
│                                 │
│ Rating: ⭐⭐⭐⭐               │
└─────────────────────────────────┘
```

```
After showing all 3 hints, then correct:

┌─────────────────────────────────┐
│ ✓ Correct!                      │
│                                 │
│ Performance:                    │
│ • Needed full explanation       │
│ • Accuracy score: 60%           │
│ • Confidence: Learning          │
│                                 │
│ Rating: ⭐⭐⭐                 │
│                                 │
│ [Review full explanation]       │
│ [Practice similar questions]    │
└─────────────────────────────────┘
```

### **Scoring Formula**

```javascript
function calculateAccuracyScore(attempts, hintsShown, correct) {
  if (!correct) return 0
  
  // Perfect: no hints, first try
  if (attempts === 1 && hintsShown === 0) return 100
  
  // Good: no hints, multiple tries
  if (hintsShown === 0) return 80 + (10 - attempts * 2)
  
  // Fair: hint 1
  if (hintsShown === 1) return 70 + (5 - attempts)
  
  // Learning: hint 2
  if (hintsShown === 2) return 60 + (3 - attempts)
  
  // Full explanation shown
  if (hintsShown === 3) return 50
  
  return Math.max(0, score)
}
```

---

## Feature 5: Question Variations

### **Question Types**

**Type 1: Prefix Match**
```
"Which prefix matches 192.168.1.5?"
- Requires understanding CIDR notation
- No upfront hints about how to match
```

**Type 2: Route Selection (Longest Match)**
```
"Which route would be selected?"
Routing table:
├─ 10.0.0.0/8 via 1.1.1.1
├─ 10.1.0.0/16 via 2.2.2.2
├─ 10.1.2.0/24 via 3.3.3.3

Traffic to: 10.1.2.5
Answer options: Shows all 3 routes
- No hint about "longest match"
```

**Type 3: Metric Comparison**
```
"Which route is preferred?"
├─ Route A: metric 100 (OSPF)
├─ Route B: metric 50 (BGP)
- No hint about comparing metrics
```

**Type 4: Protocol Priority**
```
"If both routes exist, which wins?"
├─ Static route (AD 1)
├─ OSPF route (AD 110)
- No hint about administrative distance
```

---

## Feature 6: Performance Tracking

### **Session Stats**

```
Routing Table Decoder - Session Summary

Questions: 10
Correct: 8
Accuracy: 80%

Breakdown by performance:
├─ Perfect (no hints): 5 questions ⭐⭐⭐⭐⭐
├─ Good (no hints, 2+ tries): 2 questions ⭐⭐⭐⭐
├─ Fair (hint 1): 1 question ⭐⭐⭐
└─ Learning (hint 3): 2 questions ⭐⭐

Topics mastered:
✓ Longest prefix match
✓ CIDR notation

Topics to review:
⚠ Administrative distance
⚠ Protocol priority

[Practice weak areas] [Do more decoder]
```

### **Progress View**

```
Your Routing Table Decoder Progress

Trend (last 7 days):
Accuracy: 72% → 76% → 80% → 82% → 85%
                                    ↗ (improving)

Total questions: 47
Total correct: 40
Accuracy: 85%

By difficulty:
├─ Easy: 15/15 (100%) ⭐ Mastered
├─ Standard: 20/22 (91%) ⭐ Strong
└─ Hard: 5/10 (50%) ⏱ Learning

Recommendation:
Focus on Hard mode to improve weak areas
```

---

## UI Components

### **Challenge Mode Header**

```
┌─────────────────────────────────────┐
│ Routing Table Decoder               │
│ Difficulty: Standard ↓              │
│ Accuracy: 85% | Streak: 4           │
├─────────────────────────────────────┤
│ Question 5 of 10                    │
│ ★★★☆☆ (3 stars - medium)          │
└─────────────────────────────────────┘
```

### **Question Card**

```
┌─────────────────────────────────────┐
│ Routing Table:                      │
│ [Routing table display]             │
│                                     │
│ Question: [Question text only]      │
│                                     │
│ [Answer options]                    │
│                                     │
│ [Submit] [Skip]                     │
│ [Hint - click for help]             │ ← On demand
└─────────────────────────────────────┘
```

### **Hint Reveal**

```
After wrong answer:

┌─────────────────────────────────────┐
│ ✗ Not quite                         │
│                                     │
│ [Show Hint 1/3]                     │ ← Button
│                                     │
│ [Try again]                         │
└─────────────────────────────────────┘
```

```
After hint shown:

┌─────────────────────────────────────┐
│ 💡 Hint 1 of 3                      │
│                                     │
│ "Think about which column..."       │
│                                     │
│ [Next hint] [Try again]             │
└─────────────────────────────────────┘
```

---

## Database Schema

### **Decoder Session Tracking**

```sql
CREATE TABLE decoder_sessions (
  id TEXT PRIMARY KEY,
  userId TEXT,
  sessionDate DATETIME,
  
  -- Performance
  totalQuestions INT,
  correctAnswers INT,
  accuracy FLOAT,
  
  -- Hints
  hintsUsed INT,
  perfectAnswers INT,  -- No hints, first try
  
  -- Difficulty
  difficulty ENUM('easy', 'standard', 'hard'),
  averageStarRating FLOAT,
  
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE decoder_attempts (
  id TEXT PRIMARY KEY,
  sessionId TEXT,
  questionId TEXT,
  
  -- Attempt
  attemptNumber INT,
  correct BOOLEAN,
  hintsShown INT,
  
  -- Scoring
  accuracyScore INT,  -- 0-100
  
  -- Timing
  timeSpent INT,  -- seconds
  
  FOREIGN KEY (sessionId) REFERENCES decoder_sessions(id)
);

CREATE INDEX decoder_attempts_session 
ON decoder_attempts(sessionId);

CREATE INDEX decoder_accuracy 
ON decoder_sessions(userId, accuracy);
```

---

## Implementation Phases

### **Phase 1: Hide Upfront Hints (1 day)**
1. Modify question display to hide hints by default
2. Add [Hint] button instead of visible hints
3. Implement hint reveal on click
4. Test visibility on all screen sizes

### **Phase 2: Progressive Hints (1-2 days)**
1. Define 3-level hint system
2. Create hint data structure for each question
3. Implement hint reveal logic
4. Show appropriate hint based on attempts

### **Phase 3: Difficulty Levels (1 day)**
1. Add difficulty selector
2. Adjust question complexity per level
3. Modify hint policy based on difficulty
4. Test difficulty progression

### **Phase 4: Challenge Scoring (1-2 days)**
1. Implement accuracy scoring formula
2. Track hints + attempts
3. Calculate performance rating
4. Show score feedback after each question

### **Phase 5: Performance Tracking (1-2 days)**
1. Store session stats
2. Track accuracy trend
3. Identify weak topics
4. Build progress dashboard

### **Phase 6: Polish (½-1 day)**
1. Mobile responsive design
2. Visual polish on hint reveals
3. Performance optimization
4. A/B test hint messaging

---

## Success Metrics

- [ ] 90%+ of users attempt answer before requesting hint
- [ ] Average accuracy without hints: >70%
- [ ] Hint usage decreases over time (learning curve)
- [ ] Hard mode completion rate: >60%
- [ ] User engagement time increases (more challenging)
- [ ] Accuracy on first attempt improves after 5+ sessions
- [ ] User satisfaction: >4.2/5

---

## Why This Works

✅ **True challenge** — No upfront answer hints  
✅ **Active learning** — Must engage with routing logic  
✅ **Progressive scaffolding** — Hints available when needed  
✅ **Performance visibility** — See accuracy without vs with hints  
✅ **Difficulty progression** — Easy → Standard → Hard  
✅ **Motivation** — Star ratings encourage improvement  
✅ **Learning tracking** — See improvement over time  
✅ **Flexible** — Users choose when to ask for help  

---

## Comparison: Before vs After

| Feature | Before | After |
|---------|--------|-------|
| Hints visibility | Always shown | Hidden, revealed on demand |
| Challenge level | Trivial (follow hints) | Actual challenge |
| Scoring | Pass/fail | 0-100 accuracy |
| Performance metric | None | Stars (1-5) |
| Difficulty options | None | Easy/Standard/Hard |
| Hint progression | All at once | Gradual (1→2→3) |
| Learning outcome | Surface-level | Deep understanding |
| User engagement | Low (guided) | High (challenge) |
| Mistake handling | Ignored | Hints guide learning |
| Progress tracking | No | Yes (trend + topics) |

---

## Implementation Notes

1. **Hint timing:** Don't auto-show hint on wrong answer at Hard mode—user must request
2. **Hint quality:** Hint 1 should nudge, not solve. Hint 3 should fully explain
3. **Question variety:** Mix prefix matching, route selection, metric comparison, protocol priority
4. **Difficulty scaling:** Hard mode should make user think harder, not just more questions
5. **Mobile:** Hints must be easy to access on small screens (prominent button)
6. **Streak system:** Show consecutive correct answers to maintain motivation

