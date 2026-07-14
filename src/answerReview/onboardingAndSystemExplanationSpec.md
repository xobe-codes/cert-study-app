# 99-Implementation Spec: User Onboarding & System Explanation

## Current State (Problem)

Users launch app after update → see new unified system → confusion.

**What's different:**
- Mastery levels (not just "pass/fail")
- Spaced repetition (refresh schedules)
- Test-out mechanism (can graduate from baseline)
- Adaptive recommendations (system tells them what to do)
- Learning journey map (shows entire study plan)

**Result:** Power users understand it, new users get lost.

---

## Proposed Solution: Interactive Onboarding Tour

### **Tour 1: First Launch (2 minutes)**

```
SCREEN 1: Welcome
┌─────────────────────────────────────────┐
│ Welcome to CCNA Prep 2.0               │
│                                         │
│ Your study experience just got smarter. │
│                                         │
│ In 2 minutes, we'll show you what's    │
│ new.                                    │
│                                         │
│ [Start Tour] [Skip]                   │
└─────────────────────────────────────────┘

SCREEN 2: Your Study Plan
┌─────────────────────────────────────────┐
│ Here's your complete study plan:       │
│                                         │
│ ✓ D1: Mastered (refresh due Jan 13)   │
│ ✓ D2: Certified (refresh due Jan 10)  │
│ ⏱ D3: 80% → Ready for domain pass     │
│ ⭕ D4: Not started                    │
│ ⭕ D5: Not started                    │
│ ⭕ D6: Not started                    │
│                                         │
│ No more wondering "what next?"         │
│ We'll guide you.                        │
│                                         │
│ [Next] [Skip]                         │
└─────────────────────────────────────────┘

SCREEN 3: What's "Mastered"?
┌─────────────────────────────────────────┐
│ Mastery Level: MASTERED                │
│                                         │
│ This means:                             │
│ ✓ Passed baseline (90%+)               │
│ ✓ Passed domain pass (85%+)            │
│ ✓ You're certified in this domain      │
│                                         │
│ Don't keep studying it.                │
│ Move to the next domain.                │
│                                         │
│ [Next] [Skip]                         │
└─────────────────────────────────────────┘

SCREEN 4: Refresh Reminders
┌─────────────────────────────────────────┐
│ You'll get refresh reminders:          │
│                                         │
│ • 7 days after mastery                 │
│ • 30 days after mastery                │
│ • 60 days after mastery                │
│                                         │
│ Each reminder is a 5-minute quick      │
│ drill to keep knowledge fresh.         │
│                                         │
│ [Next] [Skip]                         │
└─────────────────────────────────────────┘

SCREEN 5: Recommendations
┌─────────────────────────────────────────┐
│ We'll recommend what's next:           │
│                                         │
│ "Ready for D3 domain pass"             │
│ "D4 behind schedule, start now"        │
│ "Take a break, you've studied 3hrs"   │
│                                         │
│ Follow recommendations for optimal     │
│ study path.                             │
│                                         │
│ [Next] [Skip]                         │
└─────────────────────────────────────────┘

SCREEN 6: Test-Out Mechanism
┌─────────────────────────────────────────┐
│ New feature: Test Out                  │
│                                         │
│ When you master weak areas:            │
│ "Test Out of Domain" button appears    │
│                                         │
│ Click it to graduate from this domain  │
│ and move forward.                       │
│                                         │
│ No need to keep retaking the same test│
│                                         │
│ [Next] [Skip]                         │
└─────────────────────────────────────────┘

SCREEN 7: You're Ready
┌─────────────────────────────────────────┐
│ Ready to study smarter?                │
│                                         │
│ Your next step:                        │
│ [Start D3 Domain Pass]                 │
│                                         │
│ Or explore your full study plan:       │
│ [View Learning Journey]                │
│                                         │
│ [Start] [Tour Again]                 │
└─────────────────────────────────────────┘
```

### **Contextual Help Tooltips**

Throughout app, on-hover tooltips explain features:

```
Mastery Level: ⓘ
→ "Complete a domain by passing baseline AND domain pass"

Refresh Reminder: ⓘ
→ "5-min quick drill to refresh your memory (spaced repetition)"

Test Out: ⓘ
→ "Mark domain as done. You're certified! Move to next."

Domain Pass Ready: ⓘ
→ "Your weak areas are now strong. Time to validate mastery."

Recommendation: ⓘ
→ "Based on your study history, this is your best next step"
```

### **Help Center Articles**

Create 5-min read articles:

1. **"Understanding Mastery Levels"**
   - Not started, Learning, Competent, Proficient, Mastered, Refresh Cycle
   - What each means
   - How to progress

2. **"What is Spaced Repetition?"**
   - Why it works
   - Our schedule (7/30/60 days)
   - How to use reminders

3. **"Test Out vs Retake"**
   - When you can test out
   - What happens after test-out
   - Can you go back?

4. **"How Recommendations Work"**
   - Where they come from
   - How to follow them
   - Can you ignore them?

5. **"Your Study Plan Explained"**
   - Critical path (must do)
   - Optional reinforcement
   - Maintenance (spaced rep)

---

## Video Intros (30-60 seconds each)

**Video 1: "Your New Study Plan"**
- Show dashboard, mastery levels, domains
- Show how recommendations guide you
- Show you don't have to think about "what next"

**Video 2: "Test Out & Move Forward"**
- Show weak areas identification
- Show test-out button appearing
- Show domain certification
- Show moving to next domain

**Video 3: "Spaced Repetition Works"**
- Show refresh reminder appearing
- Show 5-minute quick drill
- Show certificate extended for 30 more days

---

## In-Context Tutorial (First Time User)

When user does something for the first time:

```
First quiz attempt:
→ "Quiz Score Explained" tooltip
→ Show mastery level bar
→ Link to help article

First domain baseline:
→ "What is Baseline?" tooltip
→ Show weak areas identification
→ Show next steps

First domain pass:
→ "Domain Pass Explained" tooltip
→ Show certification path
→ Show what happens if you fail

First test-out:
→ "Test Out?" confirmation dialog
→ "This marks domain as mastered"
→ "You can come back for refresh drills"
→ [Confirm] [Learn more]
```

---

## Engagement Metrics

Track during/after onboarding:

- Tour completion rate (target: 70%+)
- Time to first quiz attempt (target: < 5 min)
- Users following recommendations (target: 60%+)
- Retention after 1 week (target: 85%+)
- User satisfaction with system (survey: target: 4.2/5)

---

## A/B Testing

- **Variant A:** 2-minute quick tour
- **Variant B:** 5-minute detailed tour
- **Variant C:** No tour (skip button always available)

Measure: Which variant has highest retention + satisfaction?

---

## Estimated Effort: 1-2 days

