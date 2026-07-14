# 99-Implementation Spec: Notification & Reminder System

## Current State (Problem)

Spaced rep + recommendations only work if users see them.

**Problems:**
- No reminders for refresh drills
- No notifications when domain pass is ready
- No alerts for recommendations
- Users forget to come back
- System guides them but they don't see it

**Result:** Amazing features silently fail to engage users.

---

## Proposed Solution: Smart Notification System

### **Notification Types**

**Type 1: Refresh Due**
```
"D1 refresh available — 5 min quick drill"
→ User has mastered D1, needs periodic refresh (7, 30, 60 days)
→ Notify once per day max, then let user take action
```

**Type 2: Next Step Ready**
```
"Ready for D3 domain pass — you've mastered weak areas"
→ User completed weak-area retakes with 80%+
→ Notify immediately, once only
```

**Type 3: Warning/Behind**
```
"D4 behind schedule — start baseline this week"
→ User hasn't started domain after expected date
→ Notify once per day, escalate if ignored > 3 days
```

**Type 4: Achievement**
```
"✓ D3 Mastered! Next: D4 Baseline"
→ User achieved domain certification
→ Celebrate + guide next step
```

**Type 5: Recommendation**
```
"Try D3 domain pass instead of more drills"
→ User doing repetitive practice on already-strong area
→ Suggest better use of time
```

### **Notification Preferences**

User can choose delivery method:
```
Refresh Reminders:
  ☑ Notify daily (morning reminder)
  ☑ Notify weekly (Sunday)
  ☐ Skip reminders, I'll remember
  
Next Step Alerts:
  ☑ Notify immediately (instant alert)
  ☑ Daily digest (batch with others)
  ☐ Don't notify
  
Achievements:
  ☑ Celebrate (popup + sound)
  ☑ Silent (badge only)
  ☐ Don't notify
  
Warnings:
  ☑ Notify when behind (urgent)
  ☑ Notify weekly
  ☐ Don't notify
```

### **Smart Timing Rules**

- Don't send same notification 2x in 24 hours
- Max 1 notification per session (don't spam)
- Critical notifications (exam readiness) override quiet hours
- Batch routine reminders into daily digest (8 AM)
- Urgent warnings (exam in 1 week, not ready) send immediately

### **Notification Center**

In-app history of all notifications:
```
Today (2)
  ✓ D3 domain pass ready (dismissed)
  ⏳ D1 refresh available (pending)

This Week (5)
  ✓ D2 mastered (12:30 PM)
  ✓ Quiz passed 85% (9:15 AM)
  ... 2 more

Settings: [Preferences] [Clear all]
```

---

## Database Schema

```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  userId TEXT,
  type ENUM('refresh_due', 'next_step', 'warning', 'achievement', 'recommendation'),
  title TEXT,
  message TEXT,
  
  targetId TEXT,  -- domain ID, objective ID, etc.
  targetType TEXT,  -- 'domain', 'objective', 'exam', etc.
  
  priority ENUM('low', 'medium', 'high', 'critical'),
  
  sentAt DATETIME,
  readAt DATETIME,
  dismissedAt DATETIME,
  actionTaken BOOLEAN,  -- did user click through?
  
  deliveryMethod ENUM('in_app', 'push', 'email', 'digest'),
  
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE user_notification_preferences (
  userId TEXT PRIMARY KEY,
  refreshReminders ENUM('daily', 'weekly', 'skip'),
  nextStepAlerts ENUM('immediate', 'digest', 'skip'),
  achievements ENUM('celebrate', 'silent', 'skip'),
  warningAlerts ENUM('urgent', 'weekly', 'skip'),
  quietHoursStart TIME,  -- e.g., 22:00
  quietHoursEnd TIME,    -- e.g., 08:00
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

---

## Implementation Estimate: 2-3 days

