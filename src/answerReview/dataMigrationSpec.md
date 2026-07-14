# 99-Implementation Spec: Data Migration & Backward Compatibility

## Current State (Problem)

Existing users have quiz history, baseline scores, domain pass attempts.

**Problem:** New unified learning state doesn't know about old data.

**Risk:** Launch new system → users lose all progress history → user rage.

**Result:** MUST migrate all old data or existing users will churn.

---

## Proposed Solution: One-Time Migration Script

### **What Gets Migrated**

**Quiz Attempt History:**
```
Old: quizAttempts = [
  { objectiveId: "1.1", score: 70, date: "2026-07-01" },
  { objectiveId: "1.1", score: 75, date: "2026-07-05" },
  { objectiveId: "1.1", score: 85, date: "2026-07-10" },
]

New: domain_baselines[D1].objectives[1.1] = {
  status: "COMPETENT",
  performance: { best: 85, latest: 85, average: 76.7 },
  activities: [
    { type: "quiz", score: 70, date: "2026-07-01" },
    { type: "quiz", score: 75, date: "2026-07-05" },
    { type: "quiz", score: 85, date: "2026-07-10" },
  ]
}
```

**Domain Baseline Records:**
```
Old: baselineSessions = [
  { domainId: "D1", score: 88, date: "2026-06-28" },
]

New: domain_baselines[D1] = {
  baseline: { score: 88, takenDate: "2026-06-28" },
  status: "COMPETENT",  // because score 88 > 80%
}
```

**Domain Pass Records:**
```
Old: domainPassSessions = [
  { domainId: "D1", attemptNum: 1, score: 85, date: "2026-07-05" },
]

New: domain_baselines[D1].domainPass = [
  { attemptNumber: 1, score: 85, date: "2026-07-05", status: "passed" },
]
```

**Mock Exam History:**
```
Old: mockExamResults = [
  { examId: "mock_1", score: 42, total: 60, date: "2026-07-12" },
]

New: mockExamHistory = [
  { id: "mock_1", score: 42, total: 60, percentage: 70, date: "2026-07-12" },
]
```

**Lab Completions:**
```
Old: completedLabs = ["lab_1.1", "lab_1.2", "lab_2.1"]

New: domain_baselines[D1].labs = {
  total: 4,
  completed: 2,
  notStarted: 2,
}
```

---

## Migration Algorithm

### **Step 1: Calculate Mastery Level**

```javascript
function calculateMasteryLevel(quizScores, baselineScore, domainPassScores) {
  if (baselineScore >= 95 && domainPassScores.some(s => s >= 90)) {
    return "MASTERED"
  } else if (baselineScore >= 85 && domainPassScores.length > 0) {
    return "PROFICIENT"
  } else if (quizScores.length > 0) {
    const avg = average(quizScores)
    if (avg >= 85) return "PROFICIENT"
    if (avg >= 70) return "COMPETENT"
    if (avg >= 50) return "LEARNING"
  }
  return "NOT_STARTED"
}
```

### **Step 2: Set Spaced Rep Schedule**

```javascript
function setSpacedRepSchedule(masteredDate) {
  if (!masteredDate) return null
  
  const now = new Date()
  const daysSinceMastery = (now - masteredDate) / (1000 * 60 * 60 * 24)
  
  // If mastered recently, schedule refreshes
  if (daysSinceMastery < 7) {
    return { nextRefreshDate: masteredDate + 7 days }
  } else if (daysSinceMastery < 30) {
    return { nextRefreshDate: masteredDate + 30 days, needsRefreshNow: true }
  } else if (daysSinceMastery < 60) {
    return { nextRefreshDate: masteredDate + 60 days, needsRefreshNow: true, lastRefresh: null }
  } else if (daysSinceMastery >= 90) {
    return { status: "STALE", recommendRebaseline: true }
  }
}
```

### **Step 3: Preserve Activity Timeline**

Keep all quiz attempts, baseline attempts, domain pass attempts in `activities` array. Never delete history.

---

## Migration Execution

### **Phase 1: Backup**
```
1. Export all user data to backup file
2. Verify backup integrity
3. Store in S3 (immutable)
```

### **Phase 2: Test Migration (10% Sample)**
```
1. Pick 10% of users randomly
2. Run migration script on test database
3. Verify all data present
4. Check no data loss
5. Validate mastery levels look reasonable
6. Get approval before proceeding
```

### **Phase 3: Full Migration**
```
1. Run migration script on all remaining users
2. Track success rate (target: 99%+)
3. Log any errors
4. Rollback if > 1% failures
```

### **Phase 4: Verification**
```
1. Random spot-check: 50 users
   - Check old quiz history visible
   - Check mastery level calculated correctly
   - Check old exams in history
2. Check database integrity
3. Get final approval
```

### **Phase 5: Deploy**
```
1. Flip feature flag (unified system live)
2. Monitor for 24 hours
3. Watch error rates
4. Have rollback ready
```

---

## Rollback Plan

If migration fails > 1%:

```
1. Restore from backup (< 5 min)
2. Keep old system running
3. Fix issue
4. Retry on subset (1% again)
5. Gradually expand
```

Rollback SLA: Restore to last known good state within 15 minutes.

---

## Data Validation Checks

For each user post-migration:

✅ All old quiz attempts present  
✅ Quiz scores unchanged  
✅ Baseline scores unchanged  
✅ Domain pass records present  
✅ Mock exam history complete  
✅ Lab completions tracked  
✅ No duplicate activities  
✅ Mastery level calculated correctly  
✅ Spaced rep schedule sensible  
✅ No data corruption  

---

## Migration Report

Generate: `MIGRATION_REPORT.json`

```json
{
  "executedAt": "2026-07-15T02:00:00Z",
  "totalUsers": 1543,
  "successfulMigrations": 1541,
  "failedMigrations": 2,
  "successRate": 99.87,
  
  "failedUsers": [
    { userId: "user_234", reason: "quiz_data_corrupt" },
    { userId: "user_567", reason: "malformed_exam_record" }
  ],
  
  "stats": {
    "totalQuizAttempts": 28934,
    "totalBaselineAttempts": 3821,
    "totalDomainPassAttempts": 2104,
    "totalMockExams": 892,
    "usersMasteredDomains": 342,
    "usersInProgress": 1201
  },
  
  "recommendations": [
    "Contact 2 failed users, offer to re-migrate manually",
    "Check quiz_data_corrupt for data quality issues"
  ]
}
```

---

## Timeline

- **Day 1 (Planning):** Prepare migration script, test data
- **Day 2 (Test):** Run on 10% sample, validate, fix issues
- **Day 3 (Execute):** Run full migration, monitor, verify
- **Day 4 (Deploy):** Feature flag live, monitor 24h
- **Day 5 (Confirm):** All systems stable, finalize

**Estimated effort:** 2-3 days

