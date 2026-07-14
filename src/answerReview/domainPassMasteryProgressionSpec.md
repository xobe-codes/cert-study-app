# 99-Implementation Spec: Domain Pass Mastery Progression

## Current State (Problem)

**User workflow:** Domain Pass → Get score → See weak areas → [Back to hub]

**Problems:**
- Domain pass is isolated assessment, not progression metric
- No prerequisite enforcement (can take domain pass before mastering baseline)
- No gating between baseline → domain pass → mock exam
- User can spam domain passes without strategic progression
- No "mastery certification" for completed domains
- No scheduled progression guidance
- Weak pass (70%) treated same as strong pass (95%)
- No adaptive difficulty based on performance

**Result:** Domain pass feels disconnected from learning journey. No clear path to mastery.

---

## Root Issue Analysis

| Problem | Impact | User Need |
|---------|--------|-----------|
| No prerequisites | Can test before ready | "Tell me if I should take domain pass yet" |
| Isolated assessments | No progression tracking | "Show me my domain mastery timeline" |
| No mastery marker | Never "done" with domain | "When am I certified in this domain?" |
| Same difficulty for all | No challenge progression | "Make it harder when I'm strong" |
| No scheduling | Chaotic retake pattern | "When should I retake this?" |
| No confidence scoring | Just pass/fail | "Did I barely pass or ace it?" |

**Result:** Domain pass becomes meaningless test rather than strategic progression milestone.

---

## Proposed Solution: Domain Pass Mastery Progression

### **The Ideal Workflow**

```
Phase 1: Baseline Mastery
├─ Take baseline (10Q)
├─ Weak areas identified
├─ Study & retake weak areas
└─ [Test out of domain] ✓

Phase 2: First Domain Pass (Readiness Check)
├─ "Ready for domain pass? Take it to find out"
├─ First attempt (20 questions)
├─ Score: 75% ← "Solid Pass" (needs 1 more attempt)
├─ Weak areas shown
└─ "Come back in 5 days for next attempt"

Phase 3: Strengthening
├─ User studies weak areas
├─ Does bank burn focused drills
├─ Waits 5 days (spaced progression)
└─ Returns for attempt 2

Phase 4: Second Domain Pass (Mastery Check)
├─ Second attempt (20 questions, slightly harder)
├─ Score: 88% ← "Strong Pass" (mastery achieved!)
├─ [✓ Certify Domain Mastery]
└─ Domain D3: MASTERED

Phase 5: Maintenance
├─ Domain mastered, can skip for now
├─ Optional refresh every 30 days
├─ Progress to next domain
└─ Domain stays "certified" unless stale
```

---

## Feature 1: Prerequisite Gating

### **Readiness Check Before Domain Pass**

```
Domain Pass: D3 Routing

Readiness Assessment:
├─ Baseline taken? ✓ (Dec 10: 60%)
├─ Weak areas fixed? ✓ (Retake: 100%)
├─ Tested out? ✓ (Dec 14)
└─ Ready: ✓ YES

Time since baseline: 4 days
Recommendation: ✓ Ready to test

[Take Domain Pass] [Not now] [Back]
```

### **If Not Ready:**

```
Domain Pass: D4 Services

Readiness Assessment:
├─ Baseline taken? ✗ NO
├─ Weak areas fixed? — (N/A)
├─ Tested out? — (N/A)
└─ Ready: ✗ NO

⚠ You're not ready yet:
  1. Take D4 Baseline first
  2. Fix weak areas
  3. Test out of baseline
  4. Then domain pass

[Take Baseline] [Back]
```

### **Readiness Scoring**

```javascript
function calculateDomainPassReadiness(baseline, domain) {
  let score = 0
  
  // Baseline completed
  if (baseline.status !== 'not_started') score += 40
  
  // Weak areas addressed (80%+ on retake)
  if (baseline.weakAreaBestScore >= 0.80 * baseline.weakAreaTotal) score += 30
  
  // Tested out
  if (baseline.status === 'tested_out') score += 30
  
  return score  // 0-100
}

// 0-40: "Take baseline first"
// 41-70: "Make progress on weak areas"
// 71-100: "Ready for domain pass"
```

---

## Feature 2: Domain Pass Difficulty Progression

### **First Attempt: Foundation Check**

```
D3 Domain Pass: Attempt 1
20 questions
Standard difficulty
No timer pressure

Tests: All core topics
Format: Multiple choice + multi-answer
Time: ~25 minutes
```

### **Second Attempt: Mastery Validation** (If 70-85% first time)

```
D3 Domain Pass: Attempt 2
20 questions
SLIGHTLY HARDER (adaptive difficulty)
No timer pressure

Changes:
├─ Questions focus on weak areas from attempt 1
├─ Answer options more similar (harder discrimination)
├─ Sim/drag-drop questions more complex
└─ Tests deeper understanding
```

### **Difficulty Logic**

```javascript
function selectDomainPassQuestions(domain, attemptNumber, previousScore) {
  const basePool = getQuestionsForDomain(domain)
  
  if (attemptNumber === 1) {
    // First attempt: mix of easy/medium/hard
    return selectMixedDifficulty(basePool, [0.3, 0.5, 0.2])
      .slice(0, 20)
  }
  
  if (previousScore >= 85) {
    // Very strong: all hard questions
    return selectByDifficulty(basePool, 'hard').slice(0, 20)
  } else if (previousScore >= 70) {
    // Solid: medium + hard, focus on weak areas
    const weak = identifyWeakTopics(previousScore)
    return selectHardQuestionsFromTopics(basePool, weak)
      .slice(0, 20)
  } else {
    // Below threshold: can't take attempt 2 yet
    return null  // Requires more study
  }
}
```

---

## Feature 3: Mastery Certification

### **Mastery Levels**

```
Based on domain pass attempts:

ATTEMPT 1 SCORE    ATTEMPT 2 NEEDED?    MASTERY LEVEL
─────────────────────────────────────────────────────
95%+               None needed          ✓ MASTERED (1 attempt)
85-94%             Optional             ✓ CERTIFIED (1 strong attempt)
70-84%             Required             ⏱ SOLID (need attempt 2)
60-69%             Required             ⚠ WEAK (study more)
<60%               Must retake          ✗ FAILED (restart)
```

### **Single-Attempt Mastery**

```
D3 Domain Pass: Attempt 1

Score: 96% (19/20)

✓ MASTERED!
Certified after single attempt

[✓ Certify Domain Mastery]
[Skip certification, practice more]
```

### **Two-Attempt Mastery**

```
D3 Domain Pass: Attempt 1 (75%)
└─ Weak areas: 3.1, 3.5

[Study 3.1 & 3.5]

D3 Domain Pass: Attempt 2 (88%)
└─ Improved: 3.1 ✓, 3.5 ✓

✓ MASTERED!
Certified after 2 attempts

[✓ Certify Domain Mastery]
```

### **Mastery Certificate**

```
┌────────────────────────────────┐
│ ✓ Domain Mastery Certified     │
│                                │
│ D3: Routing Protocols          │
│                                │
│ Achievement:                   │
│ ✓ Baseline mastered (100%)     │
│ ✓ Domain pass 1: 75%           │
│ ✓ Domain pass 2: 88%           │
│ ✓ Certified: Dec 15, 2026      │
│                                │
│ Ready for:                     │
│ • Mock exams with D3           │
│ • Move to next domain          │
│ • Optional refresh drills      │
│                                │
│ Expires: Jan 15, 2027 (30d)    │
│ Refresh: [Refresh] [Reset]     │
└────────────────────────────────┘
```

---

## Feature 4: Strategic Progression Scheduling

### **Suggest Next Domain Pass Timing**

```
After Domain Pass Attempt 1 (Score: 75%):

⏱ Optimal timing for next attempt:

├─ Day 1: Just took domain pass
├─ Day 3: "Early option - quick refresh" [Try now]
├─ Day 5: "Recommended - enough study time" ← HIGHLIGHT
├─ Day 7: "Still good"
├─ Day 14+: "Momentum lost, recommend retake"
└─ Day 30+: "Start over, re-baseline"

Current day: Dec 14 (Day 0)
Recommended next attempt: Dec 19 (Day 5)
```

### **Progression Logic**

```javascript
function suggestNextDomainPassDate(lastAttemptDate, score) {
  if (score >= 85) {
    // Strong pass - can attempt next domain
    return { nextDate: now + 5 days, message: "Ready for next domain" }
  }
  
  if (score >= 70) {
    // Solid pass - retake in 5 days
    return { nextDate: now + 5 days, message: "Study weak areas, retake in 5 days" }
  }
  
  if (score >= 60) {
    // Weak pass - study more, retake in 7 days
    return { nextDate: now + 7 days, message: "Focus study, retake in 7 days" }
  }
  
  // Below threshold - restart pathway
  return { nextDate: now + 14 days, message: "Re-baseline first, domain pass in 14 days" }
}
```

---

## Feature 5: Domain Mastery Dashboard

### **Domains Progress View**

```
Domains Mastery Progress

✓ D1: Network Fundamentals
  └─ MASTERED (Dec 8)
  └─ Baseline: 90% | Pass 1: 92% | Pass 2: 95%
  └─ Next refresh: Jan 7
  └─ [Refresh] [Re-baseline]

✓ D2: Switching  
  └─ MASTERED (Dec 11)
  └─ Baseline: 85% | Pass 1: 88% | Pass 2: 91%
  └─ Next refresh: Jan 10
  └─ [Refresh] [Re-baseline]

⏱ D3: Routing (In Progress)
  └─ CERTIFIED (Dec 15)
  └─ Baseline: 100% | Pass 1: 75% | Pass 2: 88%
  └─ Certified but can refresh
  └─ [Refresh pass] [Re-baseline]

⏱ D4: Services (Next Up)
  └─ Baseline: 60% (Dec 10) → Working on weak areas
  └─ Suggested next: Domain pass Dec 19
  └─ Progress: 50% through weak areas
  └─ [Continue studying] [Take domain pass]

⭕ D5: Security
  └─ Not started
  └─ [Start baseline]

⭕ D6: Automation
  └─ Not started
  └─ [Start baseline]

Mastery Summary: 2 full mastered, 1 certified, 3 to go
Readiness for mock exam: 50% (need 4+ domains certified)
```

---

## Feature 6: Mastery Maintenance & Refreshers

### **Certification Expiry & Refresh**

```
D1 Mastery Certificate
Certified: Dec 8, 2026
Expires: Jan 7, 2027 (30 days)

Refresh options:
├─ [Quick refresh] (5Q, 5 min) — Refresh certificate for 30d
├─ [Take domain pass] (20Q, 25 min) — Full validation
└─ [Re-baseline] (10Q, 12 min) — Full reset

Why refresh?
• Keeps certification active
• Maintains mastery status
• Prepares for mock exam
```

### **Stale Certification**

```
D1 Mastery Certificate
Certified: Oct 15, 2026
⚠ EXPIRED: Dec 14, 2026

Your mastery certificate expired 30 days ago.

Options:
[Quick refresh] (5 questions, get back in 5 min)
[Retake domain pass] (full validation)
[Re-baseline] (reset and start over)

Note: Mock exam questions from D1 will be harder 
if your certification is expired.
```

---

## Database Schema

### **Domain Pass Sessions**

```sql
CREATE TABLE domain_pass_sessions (
  id TEXT PRIMARY KEY,
  userId TEXT,
  domainId TEXT,
  attemptNumber INT,
  score INT,
  total INT,
  
  -- Attempt details
  attemptDate DATETIME,
  timeSpent INT,
  questionsIds JSON,
  responses JSON,
  
  -- Mastery tracking
  masteredDate DATETIME,  -- When user certified
  masteryLevel ENUM('single_attempt', 'two_attempt', 'provisional'),
  
  -- Difficulty
  difficulty ENUM('standard', 'hard'),
  
  -- Weak areas
  weakTopicIds JSON,
  
  -- Certification
  certificationExpiryDate DATETIME,
  refreshedDate DATETIME,
  
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (domainId) REFERENCES domains(id)
);

CREATE INDEX domain_pass_sessions_userId_domainId 
ON domain_pass_sessions(userId, domainId);

CREATE INDEX domain_pass_sessions_attempNumber 
ON domain_pass_sessions(userId, domainId, attemptNumber);

CREATE INDEX domain_pass_sessions_masteryDate 
ON domain_pass_sessions(userId, masteredDate);
```

### **Mastery Certifications**

```sql
CREATE TABLE domain_mastery_certs (
  id TEXT PRIMARY KEY,
  userId TEXT,
  domainId TEXT,
  
  -- Attempt history
  firstAttemptScore INT,
  firstAttemptDate DATETIME,
  secondAttemptScore INT,
  secondAttemptDate DATETIME,
  
  -- Certification
  certifiedDate DATETIME,
  masteryLevel ENUM('single', 'dual'),
  
  -- Maintenance
  certificationExpiryDate DATETIME,
  lastRefreshDate DATETIME,
  refreshCount INT,
  
  -- Status
  status ENUM('active', 'expired', 'revoked'),
  
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (domainId) REFERENCES domains(id)
);

CREATE INDEX mastery_certs_userId_status 
ON domain_mastery_certs(userId, status);

CREATE INDEX mastery_certs_expiryDate 
ON domain_mastery_certs(userId, certificationExpiryDate);
```

---

## Complete User Journey

### **Week 1: D3 Baseline → First Domain Pass**

```
Dec 10 (Day 0):
├─ Take D3 Baseline: 60%
└─ Weak areas: 3.1, 3.5

Dec 12 (Day 2):
├─ Study + retake weak areas
├─ Weak area score: 100%
└─ Test out of baseline ✓

Dec 14 (Day 4):
├─ "Ready for domain pass? You've mastered baseline"
├─ Take D3 Domain Pass: 75% (Solid Pass)
├─ Weak areas: 3.5 (partial), some config topics
└─ Suggested next: Dec 19 (in 5 days)

Dec 14-18:
├─ Study weak areas
├─ Bank burn focused drills
└─ Prepare for attempt 2
```

### **Week 2: Mastery Achieved**

```
Dec 19 (Day 5):
├─ D3 Domain Pass Attempt 2: 88% (Strong Pass)
├─ Improved on 3.5 ✓
├─ No major weak areas remain
└─ [✓ Certify Domain Mastery]

Certification issued:
├─ D3: Routing Protocols - MASTERED
├─ Baseline: 60% → 100% (improved 40%)
├─ Pass 1: 75%
├─ Pass 2: 88%
└─ Expires: Jan 18, 2027

Next steps:
├─ D4 Services (start baseline)
├─ Optional D3 refresh (Dec 24)
└─ Ready for mock exam with D3 ✓
```

### **Month 1: Maintenance**

```
Dec 24:
├─ Optional refresh drill for D3
├─ 5 questions, all correct
└─ Certificate refreshed to Jan 23

Jan 10:
├─ D1, D2 both expiring
├─ Quick refreshes done
└─ Certificates extended

Jan 15:
├─ D3 expiring soon
├─ Optional refresh to extend
└─ Or retake full domain pass

Jan 19:
├─ D3 certification expired
├─ Can still do mock, but with extra difficulty
├─ Quick refresh recommended
```

---

## Success Metrics

- [ ] 90%+ of users pass prerequisite check before domain pass
- [ ] 75%+ achieve mastery certification (pass 1 or 2)
- [ ] Average time to mastery: <10 days per domain
- [ ] 80%+ of users follow suggested progression timing
- [ ] Certificate refresh rate: 60%+ within expiry window
- [ ] Mastery → Mock exam readiness: >90% correlation
- [ ] User satisfaction with structured progression: >4.2/5

---

## Implementation Phases

### **Phase 1: Prerequisite Gating (1 day)**
1. Calculate readiness score from baseline state
2. Show readiness check UI before domain pass
3. Block unready users with guidance
4. Implement enforcement logic

### **Phase 2: Difficulty Adaptation (1-2 days)**
1. Mark questions by difficulty level
2. Build adaptive selection for attempt 2
3. Ensure consistency of question pool
4. Test difficulty progression

### **Phase 3: Mastery Certification (1 day)**
1. Define mastery levels (single, dual)
2. Create certification logic
3. Build certificate UI
4. Implement expiry tracking

### **Phase 4: Progression Scheduling (1 day)**
1. Calculate suggested dates based on score
2. Show recommendations in UI
3. Add scheduling notifications
4. Track adherence to timeline

### **Phase 5: Mastery Dashboard (1-2 days)**
1. Build domain mastery view
2. Show progression timeline per domain
3. Show certification status + expiry
4. Add quick actions (refresh, retake, etc.)

### **Phase 6: Polish (½-1 day)**
1. Mobile responsive design
2. Notification system
3. Export certifications
4. Performance optimization

---

## Why This Works

✅ **Clear progression** — baseline → pass attempt 1 → pass attempt 2 → certified  
✅ **Prerequisite enforcement** — can't test unprepared  
✅ **Adaptive challenge** — harder on attempt 2 if you're strong  
✅ **Mastery marker** — "certified" vs just "took test"  
✅ **Strategic timing** — don't spam attempts, follow progression  
✅ **Maintenance** — keep certification fresh with optional refreshers  
✅ **Readiness validation** — know you're truly ready for mock exam  
✅ **Motivation** — achieve certifications, track progress  

---

## Comparison: Before vs After

| Action | Before | After |
|--------|--------|-------|
| Take domain pass | Any time | Only if ready (prerequisite check) |
| Multiple attempts | No guidance | Suggested 5-day gap |
| Passing score 70% | "Pass" | "Needs attempt 2" |
| Passing score 90% | "Pass" | "Mastered" (certified) |
| After mastery | Just results | Certificate (expires 30d) |
| Next domain | Manual decision | "Next: D4 on Dec 19" |
| Certification value | None | Clear mastery proof |
| Progression visibility | Scattered | Dashboard shows timeline |

---

## Integration with Complete Learning Loop

```
Complete Learning Loop + Domain Mastery Progression:

Baseline + Test-Out
  ↓
Domain Pass (with prerequisites)
  ├─ Attempt 1: Foundation check
  ├─ Wait 5 days
  └─ Attempt 2: Mastery validation (harder)
    ↓
  [✓ Certify Domain Mastery] (expires 30d)
    ↓
  Move to next domain (repeat)
    ↓
  When all domains certified:
  └─ Full Mock Exam (60-80Q)
     └─ All domains tested out + certified ✓
```

---

## Key Implementation Notes

1. **Prerequisite enforcement:** Check baseline status before showing domain pass CTA
2. **Adaptive difficulty:** Don't make attempt 2 impossible, just focus on weak areas + harder options
3. **Certification = confidence:** Publicly show certifications (export, share, display)
4. **Refresh is optional:** Users can choose to refresh or retake or just let expire
5. **Mastery ≠ perfection:** 70% with strategic improvement counts as "mastery"
6. **Timeline messaging:** Clear when to retake (5d, 7d) vs when it's too late (30d+)

