# CCNA App Implementation Roadmap

## Overview

Complete implementation plan for transforming CCNA App into a unified, adaptive learning system. This roadmap coordinates 8 core specs + 5 critical missing pieces to deliver a "perfect pass" system.

---

## What We've Built (8 Specs)

| Spec | Purpose | Status |
|------|---------|--------|
| Complete Learning Loop | Adaptive retake + exam history + lab nav + lab completion | Defined ✓ |
| Mock Exam Real Format | 60-80 questions, 120-min timer, real test mimic | Defined ✓ |
| Domain Baseline Optimization | Test-out mechanism + spaced rep + smart retakes | Defined ✓ |
| Domain Pass Mastery | Prerequisites + adaptive difficulty + certification | Defined ✓ |
| Routing Table Decoder | Challenge mode (hidden hints) + progressive reveals | Defined ✓ |
| Bank Burn Custom Sizes | User-selectable session sizes (5/10/20/50/custom Q) | Defined ✓ |
| Adaptive Learning System | **Unified core** — ties everything together | Defined ✓ |
| Question Validation Routine | Weekly audit + quality gates | Defined ✓ |

---

## CRITICAL MISSING PIECES (Add These For "Perfect Pass")

### 1. **Notification & Reminder System** (DO THIS FIRST)
**Why:** Spaced rep + recommendations only work if user knows about them.

**Scope:**
- Push/in-app notifications for refresh due, domain pass ready, recommendations
- Smart timing (don't overwhelm, space out notifications)
- Notification preferences (daily digest vs instant)
- Notification history/center

**Estimated effort:** 2-3 days
**Blocks:** Everything that depends on user engagement

**Spec outline:**
- Notification types: Refresh due, Next step, Warning, Achievement
- Timing rules: Don't notify same thing twice in 24h
- User preferences: Daily digest, weekly summary, instant critical only
- Delivery: In-app badge + optional push

---

### 2. **User Onboarding & System Explanation** (DO THIS SECOND)
**Why:** Unified adaptive system is new; users need to understand it.

**Scope:**
- First-time user walkthrough (5 min)
- "Here's your study plan" interactive tour
- Explain mastery levels, spaced rep, recommendations
- Explain what "testing out" means
- Show dashboard layout

**Estimated effort:** 1-2 days
**Blocks:** User adoption, confusion about new system

**Spec outline:**
- Guided tour on first launch
- Help panels on each new feature
- "What does MASTERED mean?" tooltips
- Video intros (30-60 sec per feature)

---

### 3. **Analytics & Telemetry for Adaptive System** (DO EARLY)
**Why:** Adaptive recommendations only work if we track what actually happened.

**Scope:**
- Track all study activity (quiz attempts, lab completions, exam results)
- Aggregate data for recommendation engine
- Usage patterns (when users study, how long, what they drop)
- Weak area trends (consistent misconceptions across users)
- A/B testing recommendation effectiveness

**Estimated effort:** 2-3 days
**Blocks:** Adaptive system can't make smart recommendations without data

**Spec outline:**
- Event schema: question_attempted, quiz_completed, domain_mastered, etc.
- Store in database or logging service
- Real-time dashboard for monitoring
- Weekly batch analytics

---

### 4. **Data Migration & Backward Compatibility** (DO BEFORE LAUNCH)
**Why:** Existing users have study history; can't lose it.

**Scope:**
- Migrate existing quiz scores → new unified learning state
- Map old sessions to new mastery levels
- Preserve quiz history, domain pass records
- Backfill spaced rep schedules based on old mastery dates
- Handle users mid-way through a domain

**Estimated effort:** 2-3 days
**Blocks:** Can't launch to production without this

**Spec outline:**
- One-time migration script that runs on app startup
- Preserve all user data integrity
- Calculate equivalent mastery level from old data
- Set refresh schedules based on last quiz date

---

### 5. **Error Handling, Offline Mode & Fallbacks** (DO THROUGHOUT)
**Why:** Adaptive system has many moving parts; need graceful degradation.

**Scope:**
- Network error handling (when recommendation engine fails)
- Offline mode (quiz/labs work without internet)
- Fallback recommendations (if ML fails, use rule-based)
- Data sync conflicts (user offline, comes back online)
- Stale data detection

**Estimated effort:** 2-3 days (spread across phases)
**Blocks:** Production stability

**Spec outline:**
- When recommendation engine fails: show previous recs
- Quiz/lab always works offline
- Recommendations cached locally
- Graceful reconnect after offline period

---

## Implementation Phases

### **Phase 0: Foundation (Weeks 1-2)**
**Goal:** Build unified data model & analytics baseline

**Tasks:**
1. ✅ Create unified learning state schema (from Adaptive Learning System spec)
2. ✅ Implement analytics event capture
3. ✅ Create data migration script for existing users
4. ✅ Set up question validation routine
5. ✅ Create dashboard showing unified progress

**Deliverable:** Users see unified "here's your progress" dashboard

**Risk:** Data migration breaks existing user state → mitigate with backups, test extensively

---

### **Phase 1: Core Assessment (Weeks 3-4)**
**Goal:** Implement domain baseline optimization + mastery tracking

**Tasks:**
1. Add "test-out" mechanism to baselines (from spec)
2. Implement progressive weak-area retakes (5Q retakes)
3. Add baseline status tracking (not started → testing out → mastered)
4. Build spaced rep reminder system (from notification spec)
5. Create baseline progress view

**Deliverable:** Users can test out of domains, see refresh schedule

**Dependencies:** Phase 0 data model complete

---

### **Phase 2: Domain Pass (Weeks 5-6)**
**Goal:** Implement domain pass mastery progression

**Tasks:**
1. Add prerequisite checking (can't take domain pass without baseline mastery)
2. Implement adaptive difficulty for attempt 2 (harder if strong attempt 1)
3. Add mastery certification logic
4. Create domain mastery dashboard
5. Implement certification expiry + refresh

**Deliverable:** Users can achieve "certified" status on domains

**Dependencies:** Phase 1 baseline complete

---

### **Phase 3: Lab System (Week 7)**
**Goal:** Implement lab navigation + completion tracking

**Tasks:**
1. Fix lab completion tracking bug (show completion for all labs)
2. Add Previous/Next lab buttons
3. Add lab progress indicator
4. Track lab completion status in unified learning state
5. Show lab progress in domain view

**Deliverable:** Users can navigate between labs, see which are complete

**Dependencies:** Phase 0 data model

**Easy Win:** Highest ROI, relatively quick

---

### **Phase 4: Exams & Retakes (Weeks 8-9)**
**Goal:** Implement mock exam real format + adaptive retake

**Tasks:**
1. Change mock exam to 60-80 questions (from spec)
2. Implement 120-minute timer
3. Add domain distribution matching real test
4. Implement adaptive retake of missed questions
5. Add exam history tracking
6. Create exam comparison view

**Deliverable:** Mock exams match real test format; users can retake misses

**Dependencies:** Phase 0 analytics

---

### **Phase 5: Challenge Mode (Week 10)**
**Goal:** Implement routing decoder + bank burn improvements

**Tasks:**
1. Hide routing decoder hints until on-demand (from spec)
2. Implement progressive hint system
3. Add difficulty levels to decoder
4. Add bank burn custom session sizes (5/10/20/50/custom)
5. Show performance scoring

**Deliverable:** More challenging practice tools; better UX

**Dependencies:** None (independent)

**Easy Win:** Improves UX without blocking other features

---

### **Phase 6: Adaptive Recommendations (Weeks 11-12)**
**Goal:** Implement intelligent recommendation engine

**Tasks:**
1. Build recommendation rules engine (from Adaptive System spec)
2. Implement "don't re-study mastered" intercepts
3. Add contextual handoffs (lesson → quiz → domain pass flow)
4. Create learning journey map dashboard
5. Add exam readiness assessment

**Deliverable:** App guides users "what to study next" intelligently

**Dependencies:** Phase 0-2 complete

**Critical:** This is the "magic" that ties everything together

---

### **Phase 7: Polish & Launch (Weeks 13-14)**
**Goal:** Final refinements, testing, deployment

**Tasks:**
1. User onboarding tour (from missing spec)
2. Mobile responsive design across all new features
3. Accessibility audit (dark mode, font sizes, ARIA)
4. Performance optimization (lazy load recommendations)
5. QA testing: run through all user journeys
6. A/B test recommendation timing

**Deliverable:** Production-ready system

**Dependencies:** All prior phases

---

## Feature Dependencies Graph

```
Phase 0: Unified Data Model
├── Needed by: Everything
├── Phase 1: Baseline Optimization
│   ├── Phase 2: Domain Pass Mastery
│   │   └── Phase 6: Adaptive Recommendations
│   │       └── Phase 7: Polish & Launch
│   └── Phase 3: Lab System (parallel)
├── Phase 4: Exams & Retakes
│   └── Phase 6: Adaptive Recommendations
└── Phase 5: Challenge Mode (parallel)
```

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Data migration corrupts user state | 🔴 Critical | Backup all data before migration, test with 10% sample first |
| Recommendation engine goes down | 🟡 High | Fallback to rule-based, cache recommendations locally |
| Spaced rep reminds too much | 🟡 High | User preference for notification frequency, batch daily digest |
| Users confused by new system | 🟡 High | Onboarding tour, tooltips, help center article |
| Lab navigation breaks existing flow | 🟠 Medium | Feature flag, gradual rollout, user feedback |
| Performance degrades with unified tracking | 🟠 Medium | Profile before/after, optimize DB queries |
| Existing exam history incompatible | 🟠 Medium | Migration script handles conversion |

---

## Testing Strategy

### **Unit Tests (Per Feature)**
- Mastery level calculations
- Recommendation rule engine
- Spaced rep date calculations
- Data migration logic

### **Integration Tests (Cross-Feature)**
- Baseline → Domain Pass flow
- Quiz score affects recommendation
- Spaced rep triggers at right time
- Notification system fires correctly

### **User Journey Tests (End-to-End)**
- New user: lesson → quiz → baseline → domain pass → certified
- Returning user: refresh drill → next domain → mock exam
- Failed domain: retake weak areas → re-attempt
- Exam readiness: see progression to 70%+

### **Performance Tests**
- Dashboard loads in < 500ms (even with 600+ questions)
- Recommendation generation < 2s
- Quiz session start < 1s

### **Mobile Tests**
- All new features responsive (quiz, labs, dashboards)
- Notifications render correctly
- Dark mode works

---

## Rollout Strategy

### **Week 1: Soft Launch (5% of Users)**
- Internal team + beta testers
- Monitor for crashes, data issues
- Collect feedback on onboarding
- Fix critical bugs

### **Week 2: Expand (25% of Users)**
- Gradual rollout
- A/B test notification frequency
- Monitor for performance issues

### **Week 3: Full Launch (100% of Users)**
- All users get new system
- Data migration completes
- Monitor adoption metrics

### **Post-Launch Support**
- Daily metrics review (adoption, engagement, crashes)
- User feedback channel
- Hotfix any critical issues
- Plan improvements based on usage

---

## Success Criteria

✅ **Day 1:** All existing quiz data migrated, users see unified dashboard  
✅ **Week 1:** 80%+ of users complete onboarding tour  
✅ **Week 2:** Baseline test-out feature used by 40%+ of users  
✅ **Week 3:** 60%+ follow domain pass recommendations  
✅ **Week 4:** Mock exam 60-80Q deployed, no major issues  
✅ **Week 5:** Lab navigation used in 50%+ of lab sessions  
✅ **Week 6:** Adaptive recommendations seen as "helpful" by 70%+ (survey)  
✅ **Week 8:** User study time to exam readiness reduced by 20%  
✅ **Month 3:** CCNA pass rate up 15% (from improved prep)  

---

## Timeline Summary

| Phase | Duration | Start | End | Deliverable |
|-------|----------|-------|-----|-------------|
| 0: Foundation | 2 weeks | Wk1 | Wk2 | Unified data model |
| 1: Baseline | 2 weeks | Wk3 | Wk4 | Test-out + spaced rep |
| 2: Domain Pass | 2 weeks | Wk5 | Wk6 | Mastery certification |
| 3: Labs | 1 week | Wk7 | Wk7 | Lab navigation |
| 4: Exams | 2 weeks | Wk8 | Wk9 | Real format mocks |
| 5: Challenge | 1 week | Wk10 | Wk10 | Decoder + bank burn |
| 6: Recommendations | 2 weeks | Wk11 | Wk12 | Adaptive guidance |
| 7: Polish | 2 weeks | Wk13 | Wk14 | Production ready |

**Total: 14 weeks (~3.5 months)**

---

## Quick Reference: Spec Reading Order

**For implementation team:**
1. Read `adaptiveLearningSystemSpec.md` first (architecture overview)
2. Then read in phase order (0→1→2→3→4→5→6→7)
3. Reference individual specs as you implement each phase

**For stakeholders:**
1. Read this roadmap
2. Read `adaptiveLearningSystemSpec.md` (5 min overview)
3. Watch implementation progress against timeline

---

## Open Questions / Decisions Needed

1. **Notification Frequency:** How often should users be reminded? (daily, weekly, on-demand?)
2. **Spaced Rep Timing:** Keep 7/30/60-day schedule or adjust based on usage?
3. **Mock Exam Difficulty:** Should full mock (70Q) be required before real exam attempt, or optional?
4. **Backward Compatibility:** Should old quiz scores fully map to new system or start fresh?
5. **Analytics Privacy:** What user data should be collected for recommendations? (anonymize sensitive data?)

---

## Dependencies & Blockers

**No blockers at start.** All specs are ready to implement.

**External dependencies:**
- Question data must pass validation audit (Phase 0)
- Analytics infrastructure needed for recommendations (Phase 0)
- Backend database schema changes for unified state (Phase 0)

---

## Maintenance & Support Post-Launch

- **Weekly:** Monitor metrics, fix bugs
- **Monthly:** Review user feedback, plan improvements
- **Quarterly:** Major feature additions (export reports, social leaderboards, etc.)
- **Ongoing:** Question validation routine (runs every Monday)

