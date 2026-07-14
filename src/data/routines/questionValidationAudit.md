# Routine: Question Validation & Quality Audit

## Metadata
- **Name:** Question Validation & Quality Audit
- **Description:** Weekly audit of all questions for data integrity, completeness, and playability. Identifies broken multi-selects, missing answers, bad indexes, and flagging issues.
- **Schedule:** Every Monday at ~09:00 AM
- **Status:** Active
- **Folder:** /Users/zycooks/Documents/Apps/CCNA App
- **Always Allowed:** Yes (no approval gate needed)

---

## Objective

Automatically audit all CCNA questions across all data sources to ensure:
- No broken multi-select questions (missing choices, correctIndexes, blank stems)
- No missing or malformed answer data
- All questions have proper objectiveId mapping (required for flagging)
- Question shape matches intended type (MC vs multi vs CLI vs ordering)
- No questions slip through with data integrity issues into quiz sessions

Generate a detailed quality report. Flag any broken questions before they reach users.

---

## Instructions

### STEP 1: LOAD ALL QUESTIONS

From these data sources:
- `src/data/ccnaCurated.js` (curated questions by objective)
- `src/data/practiceExamPatches.js` (practice exam questions)
- `src/data/multiSelectQuestionPatches.js` (multi-select questions)
- `src/data/ccnaSkillQuestions.js` (skill-based questions)
- Any other question files in `src/data/`

Combine into a master list with source tracking:
```
{
  id: "1.1-pe-q1",
  source: "practice_exam_patches",
  type: "multi",
  objectiveId: "1.1",
  // ... rest of question data
}
```

Total expected: ~600-800 questions across 53 objectives

### STEP 2: RUN AUDIT CHECKS

For **every question**, check:

**A) Basic Structure:**
- ✅ `id` exists and is non-empty
- ✅ `type` is one of: `definition`, `application`, `troubleshooting`, `scenario`, `multi`, `ordering`, `cli`, `true-false`
- ✅ `question` (stem) exists and is not blank
- ✅ `objectiveId` exists and matches a valid CCNA objective (1.1 through 6.8)
- ✅ `difficulty` is one of: `easy`, `medium`, `hard`

**B) Choices (MC & Multi):**
- ✅ `choices` array exists
- ✅ `choices.length >= 2` for MC, `>= 3` for multi
- ✅ No blank/empty choices (empty string or only whitespace)
- ✅ Each choice is a string, not null/undefined

**C) Correct Answers (MC):**
- ✅ `correctIndex` exists
- ✅ `correctIndex >= 0 && correctIndex < choices.length`
- ✅ Only one correct index (not array)

**D) Correct Answers (Multi):**
- ✅ `correctIndexes` exists and is an array
- ✅ `correctIndexes.length >= 2` (multi must have 2+ correct)
- ✅ All indexes valid: `0 <= index < choices.length`
- ✅ No duplicate indexes in correctIndexes

**E) Ordering Questions:**
- ✅ `orderItems` array exists
- ✅ `orderItems.length >= 3`
- ✅ No blank items

**F) CLI Questions:**
- ✅ `cliAnswers` exists and is array
- ✅ At least one valid answer
- ✅ No empty/blank answers

**G) Answer Review Quality:**
- ✅ For multi-select: `answerReview` exists with correct/incorrect breakdown
- ✅ For multi-select: incorrect items reference actual choice indexes
- ✅ Explanations are substantive (not empty, not "null", not "TBD")

**H) Flagging Capability:**
- ✅ `objectiveId` present (required for flag button to render)
- ✅ Question ID is unique (no duplicates)

### STEP 3: CATEGORIZE ISSUES

Group findings by severity:

**CRITICAL (blocks playability):**
- Missing choices array
- Missing/malformed correctIndex or correctIndexes
- Out-of-range correct indexes
- Empty question stem
- Missing objectiveId (breaks flagging)
- Duplicate question IDs

**HIGH (degraded experience):**
- Blank choice text (confuses users)
- Multi with < 2 correct answers
- Missing answer explanations
- Broken answerReview structure

**MEDIUM (quality issues):**
- Generic/template explanations
- No exam tips for tricky questions
- Missing answerReview for wrong choices

**LOW (metadata):**
- Missing concept field
- Inconsistent difficulty assignment
- Missing ckuIds for trap questions

### STEP 4: GENERATE REPORT

Create `src/data/routines/questionAuditReport.json` with:

```json
{
  "auditDate": "2026-07-14T09:00:00Z",
  "totalQuestionsAudited": 687,
  "summaryBySource": {
    "ccnaCurated": { "total": 320, "broken": 0, "issues": 0 },
    "practiceExamPatches": { "total": 17, "broken": 0, "issues": 2 },
    "multiSelectPatches": { "total": 20, "broken": 0, "issues": 0 },
    "ccnaSkillQuestions": { "total": 330, "broken": 5, "issues": 12 }
  },
  "issues": [
    {
      "severity": "CRITICAL",
      "count": 5,
      "issues": [
        {
          "questionId": "3.2-skill-q45",
          "source": "ccnaSkillQuestions",
          "type": "missing-correctIndex",
          "description": "MC question has no correctIndex property",
          "impact": "Question unplayable"
        },
        {
          "questionId": "2.1-pe-q8",
          "source": "practiceExamPatches",
          "type": "no-objectiveId",
          "description": "Question missing objectiveId mapping",
          "impact": "Flag button won't render"
        }
      ]
    },
    {
      "severity": "HIGH",
      "count": 12,
      "issues": [
        {
          "questionId": "1.5-multi-bum",
          "type": "blank-choice",
          "choiceIndex": 2,
          "description": "Choice index 2 is blank/whitespace",
          "impact": "Confusing empty option in quiz"
        }
      ]
    },
    {
      "severity": "MEDIUM",
      "count": 8,
      "issues": [
        {
          "questionId": "4.3-skill-q12",
          "type": "generic-explanation",
          "description": "Explanation is template: 'This is correct because...'",
          "impact": "Poor learning value"
        }
      ]
    }
  ],
  "brokenQuestions": [
    {
      "id": "3.2-skill-q45",
      "stem": "What is EIGRP...",
      "issue": "missing-correctIndex",
      "recommendation": "Add correctIndex property OR mark as draft/disabled"
    }
  ],
  "recommendations": [
    "Fix 5 critical questions before next quiz release",
    "Review 12 high-severity issues (blank choices, etc.)",
    "Consider template explanations for 8 questions",
    "Add exam tips to 15 common-error questions"
  ],
  "qualityScore": 98.2,  // (total - issues) / total * 100
  "passesPlayability": true,  // all questions can be rendered
  "blockerIssues": 0,
  "nextAuditDate": "2026-07-21T09:00:00Z"
}
```

### STEP 5: WRITE RESULTS TO STAGING

Save report to: `src/data/routines/questionAuditReport.json`

This allows manual review before any fixes are merged.

Also generate a human-readable summary:
```
src/data/routines/QUESTION_AUDIT_SUMMARY.md
```

Format:
```markdown
# Question Audit Report — 2026-07-14

## Summary
✅ 687 questions audited
✅ 98.2% quality score
✅ 0 blocker issues (all questions playable)
⚠️ 5 critical issues (need fixing)
⚠️ 12 high-severity issues (degraded UX)

## Critical Issues (Must Fix)
- 3.2-skill-q45: missing correctIndex
- 2.1-pe-q8: no objectiveId
- ...

## High Issues (Fix Soon)
- 1.5-multi-bum: blank choice 2
- ...

## Recommendations
1. Fix critical issues before next release
2. Review generic explanations
3. Add exam tips to gap areas
```

---

## Validation Gates

This routine should **BLOCK** the following if issues are found:

❌ **Don't allow deploying** quiz pools with:
- Any CRITICAL severity issues
- Questions with missing objectiveId (breaks flagging)
- Malformed correctIndex/correctIndexes
- Duplicate question IDs

⚠️ **Warn before deploying** if:
- HIGH severity issues > 20
- MEDIUM issues > 50
- Quality score < 95%

---

## Success Criteria

✅ All questions loadable without errors  
✅ No blank choices  
✅ All questions have objectiveId  
✅ No broken correctIndex/correctIndexes  
✅ Quality score > 97%  
✅ Report generated and readable  
✅ No manual data inspection needed (fully automated)  

---

## Integration

Add this routine to your schedule:

**Where:** Your routine management system (Cron, CI/CD, scheduled agent)  
**When:** Every Monday 09:00 AM  
**Inputs:** Question data files  
**Outputs:** `questionAuditReport.json`, `QUESTION_AUDIT_SUMMARY.md`  
**On Failure:** Send alert, don't auto-deploy changes  

---

## Related Routines

- **Regenerate Question Explanations** — Improves existing answer quality
- **Batch Question Imports** — Adds new questions (should run validation after)
- **Quiz Pool Deployment** — Can reference audit report to gate releases

---

## Notes

This routine **prevents the exact issue you reported**: broken multi-select questions with missing answers and no flag area. By running weekly, it catches problems before they reach users.

