# 99-Implementation Spec: Domain Baseline with Test-Out & Spaced Repetition

## Current State (Problem)

**User workflow:** Domain Baseline → Get score → Practice weak areas → Get stuck in loop

**Problems:**
- User must retake FULL domain baseline repeatedly
- Wastes time re-testing mastered content
- No "graduation" or completion marker
- No spaced repetition for retention after mastery
- User confusion: "Do I need to retake baseline or just practice weak areas?"

**Result:** Inefficient progression. Users drill the same baseline repeatedly even after mastery.

---

## Root Issue Analysis

| Problem | Impact | User Need |
|---------|--------|-----------|
| Full retake required | 60+ min wasted re-testing mastered Q's | "Don't make me answer questions I already know" |
| No test-out option | Can't mark domain as done | "Let me move on once I've mastered this" |
| No spaced repetition | Knowledge decays without refresh | "Check my memory periodically, not constantly" |
| Binary pass/fail | Can't see improvement trajectory | "Show me how I'm progressing" |
| No domain completion | No sense of progress | "I should know when I'm done with a domain" |

**Result:** Inefficient, demotivating learning path. Users burn out on repeated baselining.

---

## Proposed Solution: Baseline with Test-Out & Spaced Repetition

### **The Ideal Workflow**

```
DAY 1: Initial Baseline
├─ Take domain baseline (10 questions)
├─ Score: 60% (6/10)
├─ Weak areas identified: Topics 3.1, 3.5
└─ → Study weak areas

DAY 5: Mastery Check (Test-Out)
├─ Retake weak area questions only (5 questions)
├─ Score: 100% (5/5) ← Mastery achieved!
├─ [Test Out of Domain D3] ← NEW option
└─ Domain D3: ✓ MASTERED

DAY 30: Spaced Repetition Reminder
├─ "Time to refresh Domain D3?"
├─ Quick 5-question refresh drill
├─ Score: 95% (5/5)
└─ Refreshed ✓ (expires in 30 days)

DAY 60: Optional Reminder
└─ "Domain D3 refresh due" ← User can skip or do it
```

---

## Feature 1: Progressive Baseline Attempts

### **Attempt 1: Full Baseline**
```
Domain Baseline: D3 Routing Protocols

10 core questions covering:
├─ OSPF fundamentals
├─ BGP basics
├─ Route types
├─ Metrics
└─ Configuration basics

Time: ~12 minutes (1.2 min/Q)
Result: 6/10 (60%)
Weak: 3.1, 3.5
```

### **Attempt 2: Focused Weak-Area Retake** (If <80%)
```
Domain Weak-Area Focus: D3

Re-test ONLY the weak areas (5 questions):
├─ 3.1: OSPF configuration (was wrong)
├─ 3.5: BGP attributes (was wrong)
└─ 2 other concepts from first attempt

Time: ~6 minutes (1.2 min/Q)
Result: 4/5 (80%) ← Improvement!
Weak: 3.5 still needs work
```

### **Attempt 3: Final Mastery Check** (If 80%+)
```
Domain Mastery Check: D3

Re-test remaining weak areas (2-3 questions):
├─ 3.5: BGP attributes (focused drill)
└─ Confirm mastery on other weak topics

Time: ~3 minutes
Result: 3/3 (100%) ← MASTERY!

[✓ Test Out of Domain D3]  ← Button appears
```

---

## Feature 2: Test-Out Mechanism

### **Test-Out Button**
```
After mastering weak areas (80%+ on retake):

┌────────────────────────────────┐
│ D3 Routing Protocols           │
│                                │
│ Baseline: 60% (6/10)           │
│ Latest attempt: 100% (3/3)     │
│                                │
│ You've mastered the weak areas!│
│                                │
│ [✓ Test Out of Domain]         │ ← NEW
│ [Take Full Baseline Again]     │
│ [Continue Practice]            │
└────────────────────────────────┘
```

### **Test-Out Result**
```
┌────────────────────────────────┐
│ ✓ Domain Mastered!            │
│                                │
│ D3: Routing Protocols          │
│ Status: TESTED OUT             │
│                                │
│ Baseline Score: 60%            │
│ Best Score: 100%               │
│ Tested Out: Dec 14, 2026       │
│                                │
│ Next refresh due: Jan 13, 2027 │
│ (30 days from test-out)        │
│                                │
│ [Move to Next Domain]          │
│ [Do More Practice]             │
│ [View Domain Summary]          │
└────────────────────────────────┘
```

---

## Feature 3: Domain Status Tracking

### **Domain Progress View** (Hub)
```
Domains Progress

✓ D1: Network Fundamentals
  └─ Tested out Dec 10
  └─ Next refresh: Jan 9
  └─ [Refresh now] [Take baseline]

✓ D2: Switching
  └─ Tested out Dec 11
  └─ Next refresh: Jan 10
  └─ [Refresh now] [Take baseline]

⏱ D3: Routing (In Progress)
  └─ Baseline: 60% (Dec 14)
  └─ Latest: 80% (weak area retake)
  └─ [Continue] [Test out] [Full baseline]

⭕ D4: Services
  └─ Not started
  └─ [Start baseline]

⭕ D5: Security
  └─ Not started
  └─ [Start baseline]

⭕ D6: Automation
  └─ Not started
  └─ [Start baseline]

Progress: 2 mastered, 1 in progress, 3 not started
```

---

## Feature 4: Spaced Repetition Schedule

### **Refresh Schedule (After Test-Out)**
```
Test-Out Date: Dec 14

Refresh Schedule:
├─ Day 1: Mastered ✓
├─ Day 7: Refresh option (7% decay)
├─ Day 14: Refresh recommended (14% decay)
├─ Day 30: Refresh due (30% decay)
├─ Day 60: Re-baseline suggested (60% decay)
└─ Day 90+: Knowledge stale (full re-baseline needed)
```

### **Spaced Repetition Drill** (5 questions only)
```
D3 Refresh Drill (5 questions)

"Let's refresh your D3 knowledge (5 min)"

Question 1 of 5

[Random selection from domain pool]
[No timer pressure, not graded pass/fail]
[Just quick practice]

Result: 5/5 ✓
Refreshed until: Jan 13, 2027
```

### **Reminder Notifications**
```
Day 7:
"D3 Refresh available - Quick 5-min drill"
[Do it now] [Later] [Dismiss]

Day 14:
"D3 Refresh recommended - Light review"
[Do it now] [Skip]

Day 30:
"D3 Refresh due - 5-min refresh drill"
[Do it now] [Snooze 3 days]

Day 60:
"D3 knowledge may be stale - Consider re-baseline"
[Take baseline] [Refresh drill] [Skip]
```

---

## Feature 5: Domain Progression States

### **State Machine**
```
NOT_STARTED
    ↓
BASELINE_PENDING (after initial baseline taken)
    ├─ Score < 80% → WEAK_AREA_FOCUS
    └─ Score ≥ 80% → READY_TO_TEST_OUT
    
WEAK_AREA_FOCUS
    ├─ Retake weak areas
    ├─ Score < 80% → WEAK_AREA_FOCUS (loop)
    └─ Score ≥ 80% → READY_TO_TEST_OUT
    
READY_TO_TEST_OUT
    ├─ Optional weak area retake
    └─ [Test Out] → TESTED_OUT
    
TESTED_OUT
    ├─ Next refresh: 7 days
    ├─ Refresh available after 7 days
    └─ [Refresh drill] → REFRESHED (7 day loop)
    
REFRESHED
    ├─ Knowledge fresh for 30 days
    ├─ User does optional refresh drill
    └─ Extends to next 30-day cycle
    
STALE (60+ days)
    └─ [Re-baseline recommended]
```

### **UI Badges**
```
✓ Tested Out — Domain mastered, in refresh cycle
🔄 Refreshing — Just did refresh drill
⏱ In Progress — Working on weak areas
⭕ Not Started — Haven't taken baseline
⚠ Stale — 60+ days, re-baseline suggested
```

---

## Feature 6: Smart Weak-Area Retakes

### **After Initial Baseline**
```
If score < 80%:

"You got 6/10. Let's focus on these areas:"

Weak Topics:
□ 3.1: OSPF Configuration (1 miss)
□ 3.5: BGP Attributes (3 misses)

[Retake weak areas] (5 questions, ~5 min)
[Keep practicing] (full bank burn)
[Retake full baseline] (10 questions, ~12 min)
```

### **Smart Question Selection**
```javascript
// After baseline, retake only missed questions + similar ones
const missedTopics = [3.1, 3.5]
const weakAreaQuestions = getQuestionsForTopics(missedTopics)
  .concat(getSimilarQuestions(missedTopics))  // Related concepts
  .slice(0, 5)  // Just 5 questions

// This provides focused practice without full repetition
```

### **Retake Result**
```
Weak Area Retake: 4/5 (80%)

Progress:
├─ 3.1 OSPF: Now correct ✓
├─ 3.5 BGP: Still struggling (2/3 correct)
└─ Other weak areas: Improved

Next:
[Retake weak area again] (focus on 3.5)
[Practice 3.5 in bank burn]
[Test out of domain]
```

---

## Feature 7: Domain Summary After Test-Out

### **Achievement View**
```
┌────────────────────────────────┐
│ ✓ D3 Mastered!                │
├────────────────────────────────┤
│                                │
│ Routing Protocols              │
│                                │
│ Progression:                   │
│ Dec 10: Baseline 60%           │
│ Dec 12: Weak areas 80%         │
│ Dec 14: Mastery check 100%     │
│                                │
│ Key Topics:                    │
│ ✓ OSPF fundamentals            │
│ ✓ BGP basics                   │
│ ✓ Route types & metrics        │
│ ✓ Protocol comparison          │
│                                │
│ Next Refresh: Jan 13, 2027     │
│                                │
│ [View detailed report]         │
│ [Export certificate]           │
│ [Move to next domain]          │
└────────────────────────────────┘
```

---

## Database Schema

### **Domain Baseline Sessions**
```sql
CREATE TABLE domain_baselines (
  id TEXT PRIMARY KEY,
  userId TEXT,
  domainId TEXT,
  status ENUM('not_started', 'baseline_pending', 'weak_focus', 
              'ready_for_test_out', 'tested_out', 'stale'),
  
  -- Initial baseline
  baselineScore INT,
  baselineTotal INT,
  baselineDate DATETIME,
  baselineQuestionIds JSON,
  
  -- Best attempt (could be baseline or retry)
  bestScore INT,
  bestTotal INT,
  bestDate DATETIME,
  
  -- Test-out info
  testedOutDate DATETIME,
  nextRefreshDate DATETIME,
  
  -- Spaced repetition
  refreshCount INT DEFAULT 0,
  lastRefreshDate DATETIME,
  lastRefreshScore INT,
  lastRefreshTotal INT,
  
  -- Weak areas
  weakTopicIds JSON,
  weakAreaAttempts INT DEFAULT 0,
  weakAreaBestScore INT,
  
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (domainId) REFERENCES domains(id)
);

CREATE INDEX domain_baselines_userId_domainId 
ON domain_baselines(userId, domainId);

CREATE INDEX domain_baselines_status 
ON domain_baselines(userId, status);

CREATE INDEX domain_baselines_refreshDue 
ON domain_baselines(userId, nextRefreshDate);
```

### **Example Record**
```json
{
  "id": "baseline_u123_d3",
  "userId": "u123",
  "domainId": "D3",
  "status": "tested_out",
  
  "baselineScore": 6,
  "baselineTotal": 10,
  "baselineDate": "2026-12-10T14:30:00Z",
  
  "bestScore": 10,
  "bestTotal": 10,
  "bestDate": "2026-12-14T16:45:00Z",
  
  "testedOutDate": "2026-12-14T16:45:00Z",
  "nextRefreshDate": "2027-01-13T00:00:00Z",
  
  "refreshCount": 1,
  "lastRefreshDate": "2026-12-21T10:00:00Z",
  "lastRefreshScore": 5,
  "lastRefreshTotal": 5,
  
  "weakTopicIds": ["3.1", "3.5"],
  "weakAreaAttempts": 2,
  "weakAreaBestScore": 5
}
```

---

## Complete User Journey

### **Week 1: Initial Baseline & Focus**
```
Mon Dec 10:
├─ Take D3 Baseline: 60% (6/10)
└─ Identified weak: 3.1, 3.5

Wed Dec 12:
├─ Study weak areas (lessons + bank burn)
├─ Retake weak areas: 80% (4/5)
└─ Still struggling with 3.5

Sat Dec 14:
├─ More practice on 3.5
├─ Retake weak areas: 100% (5/5)
├─ [Test Out] → Domain Mastered ✓
└─ Next refresh: Jan 13
```

### **Weeks 2-4: Move Forward**
```
Dec 15-31:
├─ Work on other domains (D4, D5, D6)
├─ Optional: D3 refresh drill (Dec 21)
│  └─ Quick 5-min drill, 5 questions
│  └─ Stays fresh
└─ No forced re-baseline needed
```

### **Month 2: Refresh Schedule**
```
Jan 9 (Day 30):
├─ D3 refresh reminder
├─ User does 5-min drill
├─ Refreshed until Feb 8
└─ Continue other studies

Jan 31+:
├─ If stale (60+ days):
│  └─ "Recommend re-baseline for D3"
└─ If refreshed:
    └─ "D3 knowledge solid"
```

---

## Implementation Phases

### **Phase 1: Domain Status Tracking (1-2 days)**
1. Add domain_baselines table
2. Track baseline attempts and scores
3. Calculate "best" score from all attempts
4. Implement status state machine

### **Phase 2: Weak-Area Retakes (1-2 days)**
1. Identify weak topics from baseline
2. Build weak-area retake session (5 questions)
3. Show focused retake UI
4. Track improvement on retakes

### **Phase 3: Test-Out Mechanism (1 day)**
1. Add "Test Out" button when eligible (80%+)
2. Record test-out date
3. Calculate refresh schedule
4. Show mastery achievement screen

### **Phase 4: Spaced Repetition (1-2 days)**
1. Build refresh drill (5 questions, no timer)
2. Schedule reminders (7, 14, 30, 60 days)
3. Track refresh attempts
4. Update "stale" status after 60 days

### **Phase 5: Domain Progress Hub (1 day)**
1. Redesign domain list view
2. Show status badges (✓, ⏱, ⭕, ⚠)
3. Show next refresh dates
4. Show progression timeline

### **Phase 6: Polish (½-1 day)**
1. Mobile responsive layout
2. Notification system
3. Export domain certificates
4. Performance optimization

---

## Success Metrics

- [ ] Users test out of domains (vs. re-taking baselines forever)
- [ ] 80%+ completion rate on weak-area retakes
- [ ] 60%+ of users engage with refresh drills
- [ ] Average time on domain baseline reduced 40% (after test-out)
- [ ] Knowledge retention maintained (refresh drill scores stay high)
- [ ] User satisfaction on "test-out" feature (>4/5)
- [ ] No users stuck in baseline retry loop (>3 attempts)

---

## Why This Works

✅ **Efficient progression** — Master once, move forward  
✅ **No test fatigue** — Don't re-do full baseline repeatedly  
✅ **Focused practice** — Weak-area retakes target specific gaps  
✅ **Clear completion** — Test-out marks domain as done  
✅ **Retention support** — Spaced repetition keeps knowledge fresh  
✅ **Motivation** — Achievement badges for test-out  
✅ **Time savings** — 5-min refresh vs 12-min full baseline  
✅ **Gradual decay** — 30-day refresh cycle prevents stale knowledge  
✅ **Flexibility** — Users can refresh on schedule or delay  

---

## Comparison: Before vs After

| Action | Before | After |
|--------|--------|-------|
| Baseline score 60% | Retake full 10Q | Retake 5 weak Q's |
| Improve to 80% | Retake again | [Test Out] & done |
| After mastery | Forced to retake | Optional refresh 30d |
| 30 days later | Baseline assumed stale | Refresh drill maintains |
| Progress view | Just pass/fail | Progression timeline |
| Time spent | 12 min each attempt | 5 min smart retakes |
| Domain completion | Never clear | Clear "tested out" marker |

---

## Integration with Learning Loop

```
Complete Learning Loop + Domain Baselines:

Study Phase:
├─ [Take domain baseline]
├─ Score shows readiness
└─ Weak areas identified

Practice Phase:
├─ Study weak areas
├─ Bank burn (custom sizes)
├─ [Retake weak areas] ← Smart 5Q retake
└─ When 80%+ → [Test Out]

Maintain Phase:
├─ Domain tested out ✓
├─ Refresh drills (7, 30 days)
├─ Optional spaced repetition
└─ Stay fresh for mock exam

When Ready:
└─ Full mock exam → All domains tested out ✓
```

---

## Key Implementation Notes

1. **Smart weak-area selection:** Only re-test actual missed concepts + similar ones, not full domain
2. **Graduated retakes:** 10Q baseline → 5Q weak → 3Q mastery check (minimal wasted time)
3. **Optional refresh:** Users choose when to refresh (not forced)
4. **Stale detection:** After 60 days, suggest re-baseline (knowledge decay)
5. **Preserve progression:** Show baseline → best score trajectory (shows improvement)
6. **Mobile friendly:** Refresh drills must be <5 min for quick completion on mobile

