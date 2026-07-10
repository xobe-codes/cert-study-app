import React, { useEffect } from 'react'
import { getCurated } from '../data/ccnaCurated.js'
import { TYPE_LABEL, SKILL_LABEL, computeBankMix } from '../questionUtils.js'
import { computeMastery } from '../netUtils.js'
import { COLORS, styles } from '../ui/appTheme.js'
import { applyAnswerReviewToQuestion, inferTrapForChoice } from '../answerReviewLogic.js'
import { isActionableMissedTrap } from '../missed/missedTrapGroups.js'

/** Resolve trap-drill prefill from a missed MC/multi question. */
export function resolveQuizTrapDrillPrefill(question, objective, selected) {
  const enriched = applyAnswerReviewToQuestion(question)
  const wrongItem = (enriched.answerReview?.incorrect || []).find(i => i.choiceIndex === selected)
  let trap = wrongItem?.misconceptionTested
    || inferTrapForChoice(enriched, selected)
  let ckuId = question.ckuIds?.[0] || enriched.ckuIds?.[0]

  if (!trap || !isActionableMissedTrap(trap)) {
    const examTraps = getCurated(objective.id)?.examTraps || []
    const match = examTraps.find(t => t.ckuIds?.some(id => id === ckuId)) || examTraps[0]
    if (match?.trap) {
      trap = match.trap
      ckuId = ckuId || match.ckuIds?.[0]
    }
  }

  if (!trap) return null
  return { trapLabel: trap, objectiveId: objective.id, ckuId }
}

export const QUIZ_PROMPT_SYSTEM = `You are a CCNA 200-301 quiz generator. Use the provided reference notes as your primary source; where the notes don't cover a detail needed for a good question, you may draw on accurate broader CCNA 200-301 knowledge consistent with the notes. Write questions at genuine CCNA exam difficulty.

Mix the question types across the set:
- definition/recall (2): test knowing a fact or term
- scenario-based (2-3): a short situation the learner must reason about
- application (1-2): apply a concept to solve something
- true-false on a common misconception (1): give exactly two choices ["True","False"]
- troubleshooting (2-3): a realistic fault scenario where the learner diagnoses the MOST LIKELY cause

Tag each question with skill: design (planning/architecture), implement (configuration/deployment), or troubleshoot (diagnosis). AI-generated questions are multiple-choice only — ordering/drag-drop questions come from the curated skill bank.

For troubleshooting questions, write them the way a network engineer actually troubleshoots: describe a concrete symptom (e.g. "Hosts on VLAN 20 can't reach their gateway"), include a short relevant config or "show" snippet inline using backticks for commands/output, then ask for the most likely cause. Use specific but VARIED surface details (interface names, IPs, VLAN IDs, subnet masks) so regenerated questions test the same underlying principle without being memorizable by pattern. The correct answer must be deducible from the snippet + reference notes; the distractors should be plausible real mistakes.

Spread difficulty from easy to hard. Tag each question with its type, difficulty (easy/medium/hard), skill (design/implement/troubleshoot), and the short sub-concept it tests. Each question's explanation should be 1-2 sentences on why the correct answer is right. Most questions have 4 choices; true-false questions have exactly 2.`

export function BankMixDisplay({ questions }) {
  const mix = computeBankMix(questions)
  if (!mix.total) return null
  const typeLine = Object.entries(mix.types).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${TYPE_LABEL[t] || t} ${n}`).join(' · ')
  const skillLine = Object.entries(mix.skills).sort((a, b) => b[1] - a[1]).map(([s, n]) => `${SKILL_LABEL[s] || s} ${n}`).join(' · ')
  return (
    <div style={{ marginTop: 8, marginBottom: 8, padding: '8px 10px', borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
      <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.45 }}>{typeLine}</div>
      {skillLine && <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverDim, lineHeight: 1.45, marginTop: 2 }}>{skillLine}</div>}
    </div>
  )
}

export const CONFIDENCE_OPTIONS = [
  { value: 'easy', label: 'Easy', accent: COLORS.mint, dim: COLORS.mintDim, border: COLORS.mintBorder },
  { value: 'medium', label: 'Medium', accent: COLORS.sky, dim: COLORS.skyDim, border: COLORS.skyBorder },
  { value: 'hard', label: 'Hard', accent: COLORS.purpleGlow, dim: COLORS.purpleDim, border: COLORS.borderGlow },
  { value: 'practice', label: 'Need practice', accent: COLORS.rose, dim: COLORS.roseDim, border: COLORS.roseBorder },
]

const FOCUSABLE_SELECTOR = 'a[href],button:not([disabled]),textarea,input:not([type="hidden"]),select,[tabindex]:not([tabindex="-1"])'

export function useFocusTrap(containerRef) {
  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    const previous = document.activeElement

    function focusables() {
      return [...root.querySelectorAll(FOCUSABLE_SELECTOR)].filter(el => !el.hasAttribute('disabled'))
    }

    const nodes = focusables()
    if (nodes.length) nodes[0].focus()
    else {
      root.tabIndex = -1
      root.focus()
    }

    function onKeyDown(e) {
      if (e.key !== 'Tab') return
      const list = focusables()
      if (!list.length) {
        e.preventDefault()
        return
      }
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    root.addEventListener('keydown', onKeyDown)
    return () => {
      root.removeEventListener('keydown', onKeyDown)
      if (previous?.focus) previous.focus()
    }
  }, [containerRef])
}

export const quizFeedbackA11y = { role: 'status', 'aria-live': 'polite', 'aria-atomic': true }

export function QuizCompleteCard({
  title = 'Quiz complete',
  stats,
  objectiveId,
  progress,
  nextObjective,
  missedCountGlobal = 0,
  onReviewAgain,
  onGenerateNew,
  onOpenMissed,
  onSelectObjective,
  onSwitchTab,
  footnote,
  premiumUnlocked = false,
}) {
  const pct = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0
  const mastery = computeMastery(progress?.[objectiveId] || {})
  const sessionMissed = stats.missedCount || 0
  const scoreColor = pct >= 80 ? COLORS.mint : pct >= 60 ? COLORS.sky : COLORS.rose

  let primaryLabel
  let primaryAction
  if (sessionMissed > 0) {
    primaryLabel = missedCountGlobal > 0 ? `Review missed questions (${missedCountGlobal})` : 'Review missed questions'
    primaryAction = onOpenMissed
  } else if (nextObjective) {
    primaryLabel = `Next objective: ${nextObjective.id}`
    primaryAction = () => onSelectObjective?.({ ...nextObjective, __initialTab: 'Practice' })
  } else {
    primaryLabel = 'Review again from bank'
    primaryAction = onReviewAgain
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.h2}>{title}</h2>
      <p style={{ fontSize: 'var(--ccna-type-2xl)', fontWeight: 700, color: scoreColor, margin: '4px 0' }}>{stats.correct} / {stats.total}</p>
      <p style={{ ...styles.small, marginBottom: 4 }}>
        {pct}% this session · Topic mastery {Math.round(mastery.score * 100)}%
        {mastery.mastered ? ' · Mastered ✓' : ''}
      </p>
      {sessionMissed > 0 && (
        <p style={{ ...styles.small, marginBottom: 10, color: COLORS.rose }}>
          {sessionMissed} answer{sessionMissed === 1 ? '' : 's'} missed this session — saved to your review bank.
        </p>
      )}
      {footnote && <p style={{ ...styles.small, marginBottom: 10 }}>{footnote}</p>}
      <button style={{ ...styles.primaryBtn, marginTop: 4 }} onClick={primaryAction}>{primaryLabel}</button>
      {sessionMissed > 0 && nextObjective && (
        <button
          style={{ ...styles.secondaryBtn, marginTop: 8 }}
          onClick={() => onSelectObjective?.({ ...nextObjective, __initialTab: 'Practice' })}
        >
          Continue to {nextObjective.id} instead
        </button>
      )}
      <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={() => onSwitchTab?.('Study')}>
        Read explanation
      </button>
      {primaryAction !== onReviewAgain && (
        <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={onReviewAgain}>Review again from bank</button>
      )}
      {premiumUnlocked && (
        <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={onGenerateNew}>Generate new questions</button>
      )}
    </div>
  )
}
