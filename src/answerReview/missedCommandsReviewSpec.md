# 99-Implementation Spec: Missed Commands Review System

## Current State (Problem)

When studying commands (bank burn, drills, quizzes), users accumulate a "missed" list. But reviewing missed commands is painful:
- Have to scroll through all 900+ commands to find the 5 you missed
- No dedicated view to focus on weak areas
- Missed command list grows indefinitely
- Hard to track which commands you've actually learned since missing them
- No way to prioritize review by frequency of mistakes

**Result:** Users skip command review entirely or review entire command bank instead of just problem commands.

---

## Proposed Solution: Missed Commands Review Mode

### User Flow

```
User: "I want to review commands I've been missing"
  ↓
App shows: List of 47 commands you've missed (sorted by recency/frequency)
  ↓
User clicks: "show ip ospf neighbor" (a missed command)
  ↓
Shows:
  - Full command explanation
  - When/why you missed it (3 times, last 2 days ago)
  - Real-world use case
  - Related commands
  - "Mark as learned" button
  ↓
User: "Mark as learned"
  ↓
Command moved to "Completed" list, marked with ✓ badge
```

---

## Part 1: Data Model

### MissedCommand Type
```typescript
interface MissedCommand {
  commandId: string              // unique identifier
  commandText: string            // "show ip ospf neighbor"
  category: string               // "routing", "switching", "security"
  missedCount: number            // times user got it wrong
  lastMissedDate: Date           // when they last got it wrong
  firstMissedDate: Date          // when they first got it wrong
  contextLabels: string[]        // where missed: ["bank-burn", "domain-pass", "mock-exam"]
  status: 'active' | 'learned'   // is user still actively missing this?
  reviewedCount: number          // how many times user has reviewed since missing
  learnedDate?: Date             // when marked as learned
  learningProgress: number       // 0-100: how close to mastery
}

interface MissedCommandSession {
  userId: string
  sessionId: string
  startDate: Date
  commandsReviewed: string[]     // commandIds reviewed in this session
  commandsLearned: string[]      // commandIds marked as learned
  sessionDuration: number        // minutes
  focusAreas: string[]           // domains/categories studied
}
```

---

## Part 2: Core Features

### Feature 2A: Missed Commands Dashboard

**Display:**
- Total missed commands count
- Breakdown by category (Routing: 12, Switching: 8, Security: 4, etc.)
- Missed commands sorted by:
  - Most frequently missed (default)
  - Most recently missed
  - Oldest unanswered (haven't reviewed in weeks)
  - Random (challenge mode)

**Each command card shows:**
```
┌─────────────────────────────────────────┐
│ show ip ospf neighbor                   │
│ Routing | Missed 3 times | Last: 2 days │
│                                         │
│ [View Details] [Mark Learned] [Skip]    │
└─────────────────────────────────────────┘
```

### Feature 2B: Detailed Command Review

When user clicks command, show full details:

```
╔═══════════════════════════════════════════╗
║ show ip ospf neighbor                     ║
╠═══════════════════════════════════════════╣
║ Category: Routing                         ║
║ Missed: 3 times (last 2 days ago)        ║
║ Current mastery: 45% (progressing)       ║
║                                           ║
║ EXPLANATION:                              ║
║ Displays OSPF neighbors and their state  ║
║ States: DOWN, INIT, 2-WAY, EXSTART, etc │
║                                           ║
║ WHEN TO USE:                              ║
║ Verify OSPF adjacency established        ║
║ Check neighbor state transitions         ║
║ Troubleshoot neighbor issues             ║
║                                           ║
║ EXAMPLE OUTPUT:                           ║
║ Neighbor ID    Pri  State        Dead T  │
║ 10.0.0.2         1  FULL/BDR      36    │
║ 10.0.0.3         0  2WAY/DROTHER  38    │
║                                           ║
║ RELATED COMMANDS:                         ║
║ • show ip ospf interface                 │
║ • show ip ospf database                  │
║ • clear ip ospf process                  │
║                                           ║
║ MISTAKE CONTEXT:                          ║
║ 1. Mock Exam (60%) - forgot state names  │
║ 2. Bank Burn (50%) - confused with BDR  │
║ 3. Trap Drill (20%) - output misread     │
║                                           ║
║ [Mark as Learned] [Practice Mode] [Back] ║
╚═══════════════════════════════════════════╝
```

### Feature 2C: Progressive Learning Tracker

Track user progress on each missed command:

```
Command: show ip ospf neighbor
Status: Learning

Progress:
- Attempt 1 (7/14): Missed (40%)
- Review 1 (7/14): Reviewed explanation
- Attempt 2 (7/14): Partial (60%)
- Attempt 3 (7/15): Got it! (100%)

Next checkpoint: Review in 7 days (spaced rep)
```

### Feature 2D: Smart Recommendations

After user reviews a missed command, suggest:

```
"You just reviewed 'show ip ospf neighbor'"

Related commands you've also missed:
• show ip ospf interface (missed 2 times)
• show ip ospf database (missed 1 time)
• show ip ospf area (missed 0 times, but uses same concept)

Suggested next: show ip ospf interface (you need this for OSPF troubleshooting)
```

### Feature 2E: Session Tracking

Create "Missed Commands Review" sessions:

```
Session: Missed Commands Review
Duration: 15 minutes
Date: July 15, 2026

Reviewed: 8 commands
  ✓ Learned: 3 (show ip ospf neighbor, show vlan brief, show interfaces)
  → In progress: 5 (reviewing, not yet mastered)

Next session: Continue with remaining 44 missed commands
Recommended: 10 min/day for 5 days

Progress: 8/47 commands reviewed (17%)
```

### Feature 2F: Gamification Elements

Motivate command review:

- **Badge:** "Command Master" - reviewed all missed commands in category
- **Streak:** "7-day review streak" - reviewed commands 7 days in a row
- **Completion:** Show progress bar: "44 missed → 12 remaining"
- **Milestone:** "You've learned 15 commands this week! 🎉"

---

## Part 3: Data Management

### How Missed Commands Are Tracked

```typescript
// When user gets a command question wrong
recordMissedCommand({
  commandId: 'cmd_show_ip_ospf_neighbor',
  context: 'mock_exam',        // where it happened
  userScore: 45,                // how wrong were they?
  timestamp: now
})

// Automatically creates/updates MissedCommand record
// Updates user's learning analytics
// Triggers recommendation engine
```

### Viewing Missed Commands Over Time

```
Timeline of your missed commands:

July 15:
  - show ip ospf neighbor (3rd time missing)
  - show ip nat translations (1st time)
  
July 14:
  - show vlan brief (2nd time)
  - show interfaces trunk (1st time)
  
July 13:
  - show ip route ospf (5th time - needs priority!)
```

### Mark as Learned

When user clicks "Mark as Learned":

```javascript
markCommandAsLearned({
  commandId: 'cmd_show_ip_ospf_neighbor',
  timestamp: now,
  nextReviewDate: addDays(now, 7)  // spaced rep: review in 7 days
})

// Effects:
// 1. Move from "Active" to "Completed" list
// 2. Show ✓ badge on command
// 3. Schedule spaced rep review in 7 days
// 4. Update user's mastery score
// 5. Trigger celebration animation
```

---

## Part 4: UI Components

### Component 1: MissedCommandsList.jsx

```javascript
<MissedCommandsList
  userId={userId}
  sortBy="frequency"        // frequency | recent | oldest | random
  filter="active"           // active | learned | all
  categoryFilter={null}     // null | "routing" | "switching" etc
  onCommandSelect={handleSelect}
  onMarkLearned={handleMarkLearned}
/>
```

Shows:
- List of all missed commands
- Sort/filter options
- Command count per category
- Progress bar (learned/total)

### Component 2: MissedCommandDetail.jsx

```javascript
<MissedCommandDetail
  command={selectedCommand}
  missedData={{
    missedCount: 3,
    lastMissedDate: "2 days ago",
    progressPercentage: 45
  }}
  onMarkLearned={handleMarkLearned}
  onPractice={openPracticeMode}
  relatedCommands={[...]}
/>
```

Shows:
- Full command explanation
- Mistake context (when/where missed)
- Related commands
- Mark learned button
- Practice mode option

### Component 3: MissedCommandsProgress.jsx

```javascript
<MissedCommandsProgress
  sessionId={sessionId}
  totalMissed={47}
  reviewed={8}
  learned={3}
  inProgress={5}
/>
```

Shows:
- Session progress
- Time spent
- Commands reviewed/learned count
- Progress bar

### Component 4: MissedCommandsRecommendation.jsx

```javascript
<MissedCommandsRecommendation
  currentCommand="show ip ospf neighbor"
  relatedMissed={[...]}
  suggestedNext="show ip ospf interface"
  onSelectCommand={handleSelect}
/>
```

Shows:
- What to review next
- Related commands
- Reasoning ("you need this for troubleshooting")

---

## Part 5: Integration Points

### Where This Fits

**After Bank Burn Session:**
```
User completes bank burn with 3 missed commands

App: "Review the commands you missed?"
  ✓ Take me to missed commands
  ✗ Not now
  
→ Opens MissedCommandsList filtered to today's misses
```

**After Mock Exam:**
```
User finishes mock exam, sees results showing:
- 5 commands missed
- Top weak area: Routing commands

App: "Focus on your missed routing commands?"
  ✓ Review now
  ✗ Later

→ Opens MissedCommandsList sorted by recent, filtered to "routing"
```

**From Main Dashboard:**
```
Dashboard widget:
"You have 47 missed commands"
[Review Now] [Mark All Learned]
```

**Spaced Rep Integration:**
```
When spaced rep reminder triggers:

If command was marked as "learned":
  "Time to refresh: show ip ospf neighbor"
  [Review] [Skip] [Not Ready]
```

---

## Part 6: Analytics & Metrics

### Track for Each User

```
missedCommandsAnalytics = {
  totalMissedCommands: 47,
  activeMissed: 42,           // not yet learned
  learnedSinceMissing: 5,     // marked as learned
  
  byCategory: {
    routing: 18,
    switching: 12,
    security: 9,
    automation: 8
  },
  
  mostMissedCommand: {
    name: "show ip route ospf",
    missedCount: 7,
    category: "routing"
  },
  
  sessionStats: {
    sessionsCompleted: 12,
    avgCommandsPerSession: 6.3,
    avgTimePerCommand: 90 // seconds
  },
  
  masteryCurve: {
    commandsLearnedThisWeek: 14,
    estimatedCompletionDate: "2026-08-05"
  }
}
```

### Dashboards

**For learner:**
"You've learned 15 commands this week. 32 remaining. At current pace, you'll master all by Aug 5."

**For instructor (future):**
"Your students have 1,200 active missed commands. Top missed: show ip route (87 students). Recommend drill focus."

---

## Part 7: Features by Version

### MVP (Week 1)
- ✓ Display missed commands list
- ✓ Sort by frequency
- ✓ View command details
- ✓ Mark as learned
- ✓ Basic spaced rep scheduling

### Phase 2 (Week 2)
- ✓ Filter by category
- ✓ Related commands suggestions
- ✓ Mistake context display
- ✓ Session tracking
- ✓ Progress visualization

### Phase 3 (Week 3)
- ✓ Gamification (badges, streaks)
- ✓ Smart recommendations
- ✓ Practice mode integration
- ✓ Spaced rep reminders
- ✓ Analytics dashboard

### Phase 4+ (Future)
- Peer comparison (see what others miss)
- AI-generated practice scenarios
- Video explanations for missed commands
- Instructor feedback mode
- Export missed commands for study group

---

## Part 8: Success Metrics

### User Engagement
- 80% of users review missed commands at least once
- 60% of users mark commands as learned within 7 days
- 40% maintain 7-day review streaks

### Learning Outcomes
- Users learning 20+ missed commands per week
- Reduction in repeated misses (same command < 2 times)
- Improvement in exam scores (commands they reviewed)

### Session Metrics
- 15 minutes average session time
- 6 commands reviewed per session
- 3 commands marked as learned per session

---

## Part 9: Example Scenarios

### Scenario 1: New User with Many Misses

```
User: "I keep missing show commands"

App: "You have 23 show commands you've missed"

Shows:
- Sorted by frequency (most missed first)
- "show ip route" (missed 8 times) — Critical!
- "show ip ospf neighbor" (missed 5 times)
- "show interfaces" (missed 3 times)

User clicks "show ip route":
- Full explanation of routing table output
- Why they keep missing: "confused by route codes (C, O, E1, E2)"
- Related: "show ip route ospf" (also missed)

User: "Mark as learned"
App: "Great! Review this in 7 days to keep it fresh"
Moved to completed, scheduled for 7/22
```

### Scenario 2: Reviewing Before Exam

```
User: "I have an exam in 3 days, what should I focus on?"

App: "You have 15 active missed commands"

Shows:
- Top 3 most-missed (highest priority)
- Estimated time: 45 minutes to review all
- "Focus on these 5 for best exam prep:" (AI-suggested)

User starts session:
- Reviews 5 priority commands
- Spends 3 minutes on each
- Marks 4 as learned, 1 needs more work

App: "You've covered critical weak areas. Return tomorrow for spaced rep review."
```

### Scenario 3: Maintaining Mastery

```
User: "I learned this 3 weeks ago, is it still fresh?"

App: Shows spaced rep history for that command:
- Learned: 6/15 (100%)
- Reviewed: 6/18 (refreshed)
- Reviewed: 6/25 (refreshed)
- Next review: 7/22

User: "Re-test me on this"
App: Opens practice mode with that command
User: Answers correctly
App: "Mastery maintained! Next refresh in 7 days."
```

---

## Part 10: Technical Implementation

### Database Changes

```sql
-- Missed commands tracking
CREATE TABLE missed_commands (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  command_id UUID FOREIGN KEY,
  missed_count INT,
  last_missed_date DATETIME,
  first_missed_date DATETIME,
  status ENUM('active', 'learned'),
  learned_date DATETIME NULL,
  created_at DATETIME,
  updated_at DATETIME,
  INDEX(user_id, status),
  INDEX(last_missed_date)
);

-- Session tracking
CREATE TABLE missed_command_sessions (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  session_id STRING,
  commands_reviewed ARRAY<UUID>,
  commands_learned ARRAY<UUID>,
  session_duration INT,
  created_at DATETIME,
  INDEX(user_id, created_at)
);
```

### API Endpoints

```
GET /api/missed-commands
  ?userId=X
  &sortBy=frequency|recent|oldest|random
  &filter=active|learned|all
  &category=routing
  → Returns list of missed commands

GET /api/missed-commands/{commandId}
  ?userId=X
  → Returns detailed command info + mistake context

POST /api/missed-commands/{commandId}/learned
  ?userId=X
  → Mark command as learned, schedule spaced rep

GET /api/missed-commands/stats
  ?userId=X
  → Return analytics (total, by category, progress)

POST /api/missed-commands/sessions
  ?userId=X
  → Start new review session

PUT /api/missed-commands/sessions/{sessionId}
  → Update session with reviewed/learned commands
```

---

## Summary: 99+ Ideas Covered

**Core functionality (5 strategies):**
1. Missed commands dashboard with sorting
2. Detailed command review page
3. Mark as learned with spaced rep
4. Progress tracking per command
5. Related commands suggestions

**Data & tracking (3 strategies):**
6. MissedCommand data model
7. Session tracking
8. Analytics & metrics

**Gamification (4 strategies):**
9. Badges & achievements
10. Streaks & milestones
11. Completion progress
12. Leaderboards (future)

**Integration (3 strategies):**
13. After quiz/exam flows
14. Dashboard widget
15. Spaced rep integration

**UI Components (4 strategies):**
16. MissedCommandsList
17. MissedCommandDetail
18. MissedCommandsProgress
19. MissedCommandsRecommendation

**Analytics (3 strategies):**
20. User analytics
21. Instructor analytics (future)
22. Success metrics

**Example scenarios & technical details also included**

---

**Estimated Effort:** 2-3 weeks for MVP (core features + dashboard)

