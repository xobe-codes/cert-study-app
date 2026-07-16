# 99-Implementation Spec: Commands in Domain Practice Tests

## Current State (Problem)

Commands are studied separately in "Command Hub" or isolated drills. When users do domain practice tests (Domain Pass), they answer only questions — they never practice commands in domain context. This creates a gap:

- Question practice: ✓ Done in Domain Pass
- Command practice: ✗ Separate in Command Hub (siloed)
- Result: Users don't see commands IN domain context

**Why it matters:** On the real exam, commands appear within domain topics. Practicing them separately loses that context.

---

## Proposed Solution: Weave Commands Into Domain Practice Tests

### User Flow

```
User: "Start Domain Practice for Routing (Domain 3)"
  ↓
Domain Practice Test now shows:
  - Multiple choice questions (existing)
  - Command validation questions (NEW)
  - Scenario: "Verify OSPF neighbors. What command?"
  
User selects: "show ip ospf neighbor"
App validates against device state
Shows: ✓ Correct! (or contextual feedback)
  ↓
Domain Pass Progress includes:
  - Questions answered: 12/15
  - Commands executed: 5/7
  - Overall domain mastery: 72%
```

---

## Core Features

### Feature 1: Command Questions in Domain Tests

Embed command validation questions within domain practice:

```
Domain: Routing (3.0)

Question 1: Multiple choice - OSPF areas
Question 2: Multiple choice - route summarization
Question 3: [COMMAND] Verify OSPF neighbors
  → Shows prompt: "Router#"
  → User types: show ip ospf neighbor
  → Validates against expected output
  → Shows feedback

Question 4: Multiple choice - AD values
Question 5: [COMMAND] Show routing table
  → Router# show ip route
  → Validates output parsing
```

### Feature 2: Configurable Command Density

Admin/settings control:
- None: 0% commands (traditional)
- Light: 20% commands (3 of 15 questions)
- Medium: 33% commands (5 of 15 questions) ← **default**
- Heavy: 50% commands (7+ of 15 questions)

### Feature 3: Command-to-Domain Mapping

Map each command to relevant domains:

```javascript
const commandDomainMapping = {
  "show ip ospf neighbor": ["3.1", "3.2", "3.3"],
  "show ip ospf database": ["3.1", "3.2"],
  "show ip route ospf": ["3.1", "3.2"],
  "show vlan brief": ["2.2", "2.3"],
  "show interfaces trunk": ["2.2", "2.3"],
  "show spanning-tree": ["2.4", "2.5"]
}
```

### Feature 4: Mixed Question Type Scoring

Overall domain score factors both:

```
Domain Score = (Questions Correct / Total Questions) × 0.6
             + (Commands Correct / Total Commands) × 0.4

Example:
- Answered 12/15 questions correctly = 80%
- Executed 5/7 commands correctly = 71%
- Domain Score = (80% × 0.6) + (71% × 0.4) = 48% + 28.4% = 76.4%
```

### Feature 5: Command Practice Still Available Separately

Users who ONLY want to drill commands can still:
- Open "Command Hub" → focus on commands only
- Open "Command Drill" → practice specific command groups
- NOT changed/removed — just optional now instead of required

### Feature 6: Progress Tracking

Dashboard shows breakdown:

```
Domain 3.0: Routing
  Overall: 72% (improving)
  
Breakdown:
  Questions: 12/15 (80%)
  Commands: 5/7 (71%)
  
Commands practiced in this domain:
  ✓ show ip ospf neighbor (3 times)
  ✓ show ip ospf database (1 time)
  ✗ show ip route ospf (0 times - needs work)
```

---

## Data Model Changes

### DomainPracticeQuestion Type Update

```typescript
interface DomainPracticeQuestion {
  id: string
  domainId: string
  type: 'multiple-choice' | 'command-validation'  // NEW
  
  // Existing fields for multiple-choice
  stem?: string
  choices?: string[]
  correctChoice?: number
  
  // NEW: for command-validation questions
  commandPrompt?: string        // "Verify OSPF neighbors"
  expectedCommand?: string      // "show ip ospf neighbor"
  deviceState?: DeviceState     // simulated router state
  outputValidator?: (output: string) => boolean
  hints?: string[]
  mistakePatterns?: string[]
}
```

### DomainPracticeSession Update

```typescript
interface DomainPracticeSession {
  userId: string
  domainId: string
  questions: DomainPracticeQuestion[]
  userAnswers: Answer[]  // both MC + command answers
  
  stats: {
    questionsAnswered: number
    questionsCorrect: number
    commandsExecuted: number
    commandsCorrect: number
    overallScore: number  // combined score
    timePerQuestion: number[]
    timePerCommand: number[]
  }
}
```

---

## Integration Points

### On Domain Pass Start

```javascript
// When user starts domain practice
const commandDensity = userSettings.commandDensity || 'medium'  // default

// Load questions for domain
const questions = loadDomainQuestions(domainId)

// Inject command questions based on density
const mixedQuestions = injectCommandQuestions(questions, domainId, commandDensity)

// Result: questions + embedded commands in domain context
```

### On Answer Submission

```javascript
// User answers question (MC or command)
if (question.type === 'multiple-choice') {
  validateMultipleChoice(userAnswer, question.correctChoice)
} else if (question.type === 'command-validation') {
  validateCommand(userAnswer, question.expectedCommand, question.deviceState)
}

// Update both question + command tracking
updateDomainProgress()
updateCommandMastery()  // also track command learning
```

### On Domain Pass Completion

```
Results page shows:
- Questions: 12/15 correct (80%)
- Commands: 5/7 correct (71%)
- Domain mastery: 76.4%

Next steps:
- Weak areas: "show ip route ospf" needs review
- Suggested: Practice routing commands in Command Hub
- Spaced rep: Return to Domain 3 in 7 days
```

---

## UI Components

### MixedDomainQuestion.jsx

```javascript
<MixedDomainQuestion
  question={domainQuestion}
  onAnswer={handleAnswer}
  showFeedback={submitted}
  questionNumber={currentNum}
  totalQuestions={totalNum}
/>
```

Renders either:
- MultipleChoiceQuestion (existing)
- CommandValidationQuestion (new)

### CommandValidationQuestion.jsx

```javascript
<CommandValidationQuestion
  prompt="Verify OSPF neighbors"
  expectedCommand="show ip ospf neighbor"
  deviceState={deviceState}
  onExecute={handleCommandExecute}
  hints={hints}
  mistakePatterns={mistakePatterns}
/>
```

Shows:
- Prompt text
- Terminal input field
- Expected output
- Validation feedback
- Mistake context

### DomainProgressWithCommands.jsx

Update existing component to show:
- Question progress bar
- Command progress bar
- Combined score
- Breakdown by question type

---

## Implementation Strategy

### Phase 1: Plumbing (Week 1)
- Add `type: 'command-validation'` to question model
- Create CommandValidationQuestion component
- Implement command injection into domain tests
- Update scoring logic to factor both types

### Phase 2: Content (Week 2)
- Map 100+ commands to their domains
- Write 50+ command validation questions (8-10 per domain)
- Create device state scenarios for each domain
- Test with one domain (e.g., Routing/3.0)

### Phase 3: Polish (Week 3)
- Settings: allow users to control command density
- Dashboard: show command breakdown in domain stats
- Spaced rep: track commands from domain practice
- Missed commands: link to Command Hub when needed

---

## Example Scenarios

### Scenario 1: Learning OSPF (Domain 3.1)

```
Domain Practice: Routing - OSPF (3.1)

Q1: Multiple choice - OSPF areas
Q2: [COMMAND] Verify neighbors - show ip ospf neighbor
Q3: Multiple choice - route summarization
Q4: [COMMAND] Check OSPF database - show ip ospf database
Q5: Multiple choice - AD values

User answers:
- Q1: ✓ Correct
- Q2: ✗ Wrong command → Feedback: "Try a show command for neighbors"
- Q3: ✓ Correct
- Q4: ✓ Correct
- Q5: ✓ Correct

Results:
- Questions: 4/5 (80%)
- Commands: 1/2 (50%)
- Domain: 68%

Recommendation: "Practice OSPF show commands in Command Hub"
```

### Scenario 2: No Command Practice Wanted

```
User: "I only want question practice"
Settings: Command Density = "None"

Domain Practice now shows:
- Only multiple-choice questions
- No command validation
- Works like before (backward compatible)
```

---

## Success Metrics

- 70% of users engage with command questions in domain tests
- Users who do command practice in domain score 15% higher on exams
- Command mastery tracked from both Command Hub AND Domain Practice
- Reduced "separate Command Hub" isolation complaint

---

## Dependencies & Compatibility

- Requires: CommandSimulator (Phase 2 lab system — already built)
- Requires: Device state model (Phase 2 lab system — already built)
- Backward compatible: Users can disable commands via settings
- No migration needed: Existing domain questions stay unchanged

---

**Estimated effort:** 2-3 weeks for full implementation

**Status:** Queued for implementation after Missed Commands Review

