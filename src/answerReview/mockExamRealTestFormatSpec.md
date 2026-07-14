# 99-Implementation Spec: Mock Exam Real Test Format (60-80 Questions)

## Current State (Problem)

**User workflow:** Mock Exam → 30 questions → Results

**Missing feature:**
- Mock exam is too short (30Q vs real test 60-80Q)
- Doesn't simulate actual test length/difficulty
- Doesn't train test stamina or endurance
- Results don't reflect real exam pressure/timing
- User unprepared for actual 2-hour proctored exam

**Result:** Users pass practice exams but struggle on actual test due to unfamiliar length and pacing.

---

## Root Issue Analysis

| Gap | Impact | User Need |
|-----|--------|-----------|
| 30Q vs 60-80Q real test | Unrealistic practice | "Let me practice the real test length" |
| No stamina training | Can't handle 2-hour test | "I need to practice for 2 hours straight" |
| Incomplete coverage | Fewer questions per domain | "Test all domains thoroughly" |
| False confidence | 30Q mastery ≠ 60Q mastery | "Show me if I'm ready for the real thing" |
| Inaccurate timing | 30Q takes 30min, real is 2 hours | "Let me practice with real timing" |

**Result:** Practice mode doesn't match actual CCNA exam format (60-80 questions, 120 minutes).

---

## Proposed Solution: Real Test Format Mock Exam

### **The Real CCNA Exam**
- **Question count:** 60-80 questions
- **Time limit:** 120 minutes (2 hours)
- **Question mix:** All 6 domains represented
- **Question types:** MC, MQA, Drag & drop, Sim labs
- **Domain distribution:** Roughly proportional to actual exam weights
- **Pacing:** ~1.5-2 minutes per question average

### **Current Mock Exam (BROKEN)**
```
Mock Exam: 30 questions
├─ Time: 45 minutes
├─ Domains: Random mix (D1, D2, D3, D4, D5, D6)
├─ Per domain: ~5 questions each
└─ Result: Unrealistic to actual exam
```

### **Proposed: Real Format Mock Exam**
```
Full Mock Exam (60-80 questions) ← NEW
├─ Time: 120 minutes (2 hours)
├─ Domains: Proportional to real exam
│  ├─ D1: 10-12 questions (18%)
│  ├─ D2: 9-11 questions (15%)
│  ├─ D3: 10-12 questions (18%)
│  ├─ D4: 12-14 questions (21%)
│  ├─ D5: 9-11 questions (15%)
│  └─ D6: 8-10 questions (13%)
├─ Timer: 120 min with progress
├─ Pause: [Pause exam] button
└─ Result: Full score breakdown + domain analysis
```

---

## Feature 1: Session Size Selection

### **Workflow: User Chooses Exam Length**

```
Mock Exam Options

Choose your exam:

◉ Full Mock (60-80 questions)  ← NEW
  └─ 120 min, all domains, real test format

○ Quick Mock (30 questions)     ← Legacy option
  └─ 45 min, all domains, practice mode

[Start Exam] [Back]
```

### **Logic:**
```javascript
const mockExamConfigs = {
  full: {
    name: 'Full Mock Exam',
    questionCount: 70,  // 60-80 range, use 70 as middle
    timeLimit: 120,     // 120 minutes
    description: 'Real exam format - all domains',
    domainDistribution: {
      D1: 12,  // 17%
      D2: 11,  // 16%
      D3: 12,  // 17%
      D4: 14,  // 20%
      D5: 11,  // 16%
      D6: 10,  // 14%
    },
  },
  quick: {
    name: 'Quick Mock Exam',
    questionCount: 30,
    timeLimit: 45,
    description: 'Practice mode - all domains',
    domainDistribution: {
      D1: 5,
      D2: 5,
      D3: 5,
      D4: 5,
      D5: 5,
      D6: 5,
    },
  },
}
```

---

## Feature 2: Domain Distribution

### **Real CCNA Exam Weights** (from Cisco official)
```
Domain 1: 18% (11-14 questions out of 60-80)
Domain 2: 15% (9-12 questions)
Domain 3: 18% (11-14 questions)
Domain 4: 21% (13-16 questions)
Domain 5: 15% (9-12 questions)
Domain 6: 13% (8-10 questions)
```

### **Full Mock Distribution (70 questions)**
```
D1: 12 questions (17%)
D2: 11 questions (16%)
D3: 12 questions (17%)
D4: 14 questions (20%)
D5: 11 questions (16%)
D6: 10 questions (14%)
────────────────────
Total: 70 questions (100%)
```

### **Implementation:**
```javascript
function generateFullMockExam() {
  const config = mockExamConfigs.full
  const questions = []
  
  // For each domain, get random questions matching count
  for (const [domainId, count] of Object.entries(config.domainDistribution)) {
    const domainQuestions = getQuestionsForDomain(domainId, count)
    questions.push(...domainQuestions)
  }
  
  // Shuffle all together
  return randomizeQuestionOrder(questions)
}
```

---

## Feature 3: Timer & Pacing

### **Real Exam Timing**
```
120 minutes for 70 questions = ~1.7 min per question average

But users can spend:
- 30 sec on easy questions
- 3-4 min on complex sims
- Review time at end
```

### **UI: Timer Display**

**Top of exam:**
```
┌──────────────────────────────┐
│ Full Mock Exam              │
│ Time: 120:00  Remaining     │ ← Countdown
│ Question 15 of 70           │
│ Progress: ████░░░░░░░ 21%  │
├──────────────────────────────┤
│ [Pause] [Flag] [Mark review]│
└──────────────────────────────┘
```

**When time runs out:**
```
⏰ Time's up!
Your answers have been submitted.
[View Results]
```

**Pause feature:**
```
[Pause] button available during exam
Pauses timer, hides question
Shows "Exam paused" card
[Resume] [Submit exam early]
```

### **Progress Indicators**
```javascript
// Show per-domain progress during exam
┌─────────────────────────┐
│ Domain Progress:        │
│ D1: ████░░░ 8/12       │
│ D2: ███░░░░ 6/11       │
│ D3: ██░░░░░░ 2/12      │
│ D4: ██░░░░░ 3/14       │
│ D5: ░░░░░░░░ 0/11      │
│ D6: ░░░░░░░░ 0/10      │
└─────────────────────────┘
```

---

## Feature 4: Results Breakdown

### **Current Results (30Q)**
```
Quick Mock: 24/30 (80%)

Domain Breakdown:
D1: 5/5 (100%)
D2: 5/5 (100%)
D3: 4/5 (80%)
D4: 5/5 (100%)
D5: 4/5 (80%)
D6: 1/5 (20%) ← WEAK
```

### **Proposed Results (70Q)**
```
Full Mock Exam: 56/70 (80%)

OVERALL SCORE
56/70 (80%) — PASS (need 65%)

SCORE TREND
Your score: 80%
CCNA pass threshold: 70%
You're above passing

DOMAIN BREAKDOWN
D1: 10/12 (83%) ████░
D2: 9/11 (82%) ████░
D3: 10/12 (83%) ████░
D4: 11/14 (79%) ███░░  ← Slightly weak
D5: 9/11 (82%) ████░
D6: 7/10 (70%) ███░░░ ← Weakest domain

WEAK AREAS (2+ misses)
D4 EIGRP (2 missed)
D6 IP Services (3 missed)
D1 Network Access (2 missed)

PACING ANALYSIS
Average time per question: 1.8 min
Fastest domain: D2 (1.2 min/Q)
Slowest domain: D4 (2.1 min/Q)
Estimated real exam time: 127 min (7 min over)

RECOMMENDATIONS
✓ Domain 1-3, 5: Ready
⚠ Domain 4: Review EIGRP
⚠ Domain 6: Study IP Services (weak)
→ Take another full mock in 3 days
→ Focus on D4 and D6 before real exam
```

---

## Feature 5: Exam History Integration

### **History view shows both formats:**
```
Exams You've Taken

Full Mock Exam (70Q) · Dec 14 · 56/70 (80%)
  └─ Real test format, 127 min taken
     D1: 83%, D2: 82%, D3: 83%, D4: 79%, D5: 82%, D6: 70%

Quick Mock (30Q) · Dec 13 · 23/30 (77%)
  └─ Practice format, 38 min taken
     D1: 100%, D2: 100%, D3: 80%, D4: 80%, D5: 80%, D6: 60%

Quick Mock (30Q) · Dec 10 · 21/30 (70%)
  └─ Practice format, 35 min taken
```

### **Comparison Logic:**
```javascript
// Normalize scores for comparison
const quickScore = (23/30) * 100 = 77%
const fullScore = (56/70) * 100 = 80%

// Show improvement
"Your full mock (80%) is 3% higher than quick mock (77%)"

// But also show domain differences
"D6 stays weak in both (60% → 70%)"
```

---

## Feature 6: Readiness Assessment

### **After Full Mock:**
```
Based on your full mock performance:

✓ READY FOR EXAM
  • Overall score: 80% (above 70% threshold)
  • Consistent across all domains
  • Paced within time limit

⚠ REVIEW BEFORE EXAM
  • Domain 6 below 75% (currently 70%)
  • Would benefit from 2-3 more practice days
  • Focus: IP Services section

[Review D6] [Take another full mock] [Schedule exam]
```

---

## UI Changes

### **Mock Exam Hub (Modified)**
```
┌──────────────────────────┐
│ Mock Exam                │
├──────────────────────────┤
│                          │
│ Full Mock Exam ← NEW     │
│ 60-80 questions, 2 hours │
│ Real test format         │
│ [Start]                  │
│                          │
│ Quick Mock ← OLD/renamed │
│ 30 questions, 45 min     │
│ Practice format          │
│ [Start]                  │
│                          │
│ Previous Exams (History) │
│ [View all]               │
└──────────────────────────┘
```

### **Question Display (Same)**
```
Question 15 of 70

[Question text]

[Answer options]

[Previous] [Next] [Flag] [Review]
```

### **Post-Exam (Enhanced)**
```
Full Mock Complete

Score: 56/70 (80%)
Time taken: 127 minutes

[View Results] [Retake Missed (14)] [View History]
```

---

## Implementation Details

### **Component Changes**

**New: `MockExamSelector.jsx`**
```jsx
export default function MockExamSelector({ onSelectExam, onBack }) {
  return (
    <div>
      <div className="exam-card" onClick={() => onSelectExam('full')}>
        <h3>Full Mock Exam</h3>
        <p>60-80 questions, 120 minutes</p>
        <p>Real CCNA format - all domains</p>
        <button>Start</button>
      </div>
      
      <div className="exam-card" onClick={() => onSelectExam('quick')}>
        <h3>Quick Mock</h3>
        <p>30 questions, 45 minutes</p>
        <p>Practice mode - good for review</p>
        <button>Start</button>
      </div>
    </div>
  )
}
```

**Modify: `MockExamSession.jsx`**
```jsx
export default function MockExamSession({ 
  examType = 'full',  // or 'quick'
  onComplete,
}) {
  const config = mockExamConfigs[examType]
  const [questions, setQuestions] = useState([])
  const [timeLeft, setTimeLeft] = useState(config.timeLimit * 60)
  
  useEffect(() => {
    const questions = generateFullMockExam(examType)
    setQuestions(questions)
  }, [examType])
  
  // Timer counts down
  // Results include domain breakdown + pacing
}
```

### **Question Generation**
```javascript
function generateFullMockExam(examType) {
  const config = mockExamConfigs[examType]
  const questions = []
  
  for (const [domainId, count] of Object.entries(config.domainDistribution)) {
    const pool = getQuestionsForDomain(domainId)
    const selected = selectRandom(pool, count)
    questions.push(...selected)
  }
  
  return randomizeQuestionOrder(questions)
}
```

---

## Database Schema

### **Mock Exam Session Storage**
```sql
-- Update exam_sessions for full mock data
ALTER TABLE exam_sessions ADD COLUMN (
  examLength ENUM('quick', 'full'),  -- ← NEW
  timeLimit INT,                      -- 45 or 120 minutes
  actualTimeSpent INT,                -- Seconds taken
  domainScores JSON,                  -- {D1: 10/12, D2: 9/11, ...}
  pacePerQuestion FLOAT,              -- avg seconds per Q
);

-- Example data
{
  examType: 'full_mock',
  examLength: 'full',
  score: 56,
  total: 70,
  timeLimit: 120,
  actualTimeSpent: 7620,  // 127 minutes in seconds
  domainScores: {
    D1: {correct: 10, total: 12},
    D2: {correct: 9, total: 11},
    D3: {correct: 10, total: 12},
    D4: {correct: 11, total: 14},
    D5: {correct: 9, total: 11},
    D6: {correct: 7, total: 10},
  },
  pacePerQuestion: 109,  // seconds
}
```

---

## Success Metrics

- [ ] Full mock exam generates 60-80 questions
- [ ] Domain distribution matches real exam weights
- [ ] 90%+ of users attempt full mock before exam
- [ ] Time tracking accurate (±2 min)
- [ ] Users can pause/resume without losing progress
- [ ] Results show domain breakdown + pacing analysis
- [ ] Readiness assessment visible after exam
- [ ] No performance issues with 70-question sessions

---

## Implementation Phases

### **Phase 1: Exam Generator (1 day)**
1. Define mockExamConfigs for full and quick
2. Implement generateFullMockExam()
3. Add domain distribution logic
4. Test question selection and randomization

### **Phase 2: UI Selection (½ day)**
1. Create MockExamSelector component
2. Add to Mock Exam hub
3. Route selection to correct session type

### **Phase 3: Timer & Pacing (1 day)**
1. Implement 120-minute countdown timer
2. Add pause/resume functionality
3. Track per-question timing
4. Auto-submit on timeout

### **Phase 4: Results Analysis (1 day)**
1. Build enhanced results page
2. Add domain breakdown chart
3. Add pacing analysis
4. Add readiness assessment

### **Phase 5: History Integration (½ day)**
1. Store examLength in exam_sessions
2. Show format in history view
3. Add comparison between full/quick
4. Add trend analysis

### **Phase 6: Polish (½ day)**
1. Mobile responsive timer
2. Performance optimization
3. UX refinement
4. A/B test pacing messaging

---

## Workflow Integration with Complete Learning Loop

```
Study → Practice → Labs → Assess:

Before Exam:
└─ Full Mock Exam (70Q, 120 min)
   └─ Mimics real test
   └─ Shows domain strengths/weaknesses
   └─ Trains for 2-hour endurance
   └─ Provides readiness score

After Full Mock:
├─ [Option A] Adaptive Retake (missed 14)
├─ [Option B] Review Full Exam History
├─ [Option C] Study weak domain (D6)
└─ [Option D] Take quick mock for rapid feedback

Days before real exam:
├─ Quick mock (30Q) for daily practice
├─ Bank burn (60Q) for deep domain drills
└─ Compare to full mock baseline
```

---

## Why This Works

✅ **Real test simulation** — 60-80 questions matches actual CCNA  
✅ **Accurate pacing** — 120 minutes trains for real exam  
✅ **Domain coverage** — all 6 domains represented properly  
✅ **Confidence building** — pass practice = likely pass real exam  
✅ **Identifies weak spots** — domain breakdown shows focus areas  
✅ **Tracks readiness** — know when you're actually ready  
✅ **Complements other modes** — quick mock still available  
✅ **Stamina training** — 2-hour endurance test  

---

## Comparison: Before vs After

| Factor | Before (30Q) | After (70Q) |
|--------|------------|-----------|
| Question count | 30 | 70 |
| Time | 45 min | 120 min |
| Domain coverage | 5 per domain | 10-14 per domain |
| Realistic? | No (too short) | Yes (matches real test) |
| Pacing trained? | No | Yes |
| Stamina tested? | No | Yes |
| Confidence | False sense | Accurate |
| Pre-exam predictor | Weak | Strong |

---

## Notes

- Keep quick mock as legacy option for fast practice runs
- Full mock is the "true" readiness indicator
- Users should take ≥2 full mocks before real exam
- Domain distribution can be fine-tuned based on actual test stats
- Timer should be prominent but not stressful
- Results should celebrate passing, warn on weak domains

