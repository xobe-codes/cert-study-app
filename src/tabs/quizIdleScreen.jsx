import React from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { STATIC_COPY } from '../ui/staticContentCopy.js'
import { MAX_QUIZ_SESSION_SIZE, effectiveSessionSize, isSessionSizeDraftSubmittable } from '../quizSessionConfig.js'
import { PREMIUM_COMING_SOON_LABEL } from '../premium/premiumFeatures.js'
import { AiBudgetWarning, QUIZ_BANK_MIN } from './tabRuntimeDeps.js'
import { BankMixDisplay } from './quizTabChrome.jsx'

/** The `phase === 'idle'` start screen for QuizTab.jsx — extracted for ≤900L maintainability. */
export function QuizIdleScreen({
  objective,
  bankSize,
  curatedPoolSize,
  sessionSizeDraft,
  sessionSize,
  premiumUnlocked,
  onSwitchTab,
  bankQuestions,
  onSessionSizeInput,
  onSessionSizeBlur,
  startPracticeSession,
}) {
  const hasBank = bankSize >= QUIZ_BANK_MIN
  const poolMax = hasBank ? bankSize : (curatedPoolSize > 0 ? curatedPoolSize : MAX_QUIZ_SESSION_SIZE)
  const sessionMax = hasBank ? bankSize : MAX_QUIZ_SESSION_SIZE
  const pendingSize = effectiveSessionSize(sessionSizeDraft, sessionSize, { max: sessionMax })
  const reviewCount = hasBank ? Math.min(pendingSize, bankSize) : pendingSize
  const canStartSession = isSessionSizeDraftSubmittable(sessionSizeDraft, { max: sessionMax })
  const emptyPool = !hasBank && curatedPoolSize === 0
  return (
    <div className={`ccna-quiz-idle${hasBank ? ' ccna-quiz-idle--slim' : ''}`}>
      <p className="ccna-quiz-idle__lead" style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, color: COLORS.silver, margin: '0 0 4px', lineHeight: 1.35 }}>
        {emptyPool ? 'Ready to practice?' : hasBank ? 'Practice from your bank' : 'How many questions do you want?'}
      </p>
      <p style={{ ...styles.small, marginBottom: 10, color: COLORS.silverMid }}>
        {hasBank ? (
          <>
            <strong style={{ color: COLORS.silver }}>{bankSize}</strong> question{bankSize === 1 ? '' : 's'} available in your bank — {STATIC_COPY.bankReview}.
          </>
        ) : curatedPoolSize > 0 ? (
          <>
            <strong style={{ color: COLORS.silver }}>{curatedPoolSize}</strong> curated question{curatedPoolSize === 1 ? '' : 's'} for this topic — {STATIC_COPY.curatedQuizPool}.
          </>
        ) : (
          <>No questions yet — read the Study tab first{premiumUnlocked ? ', or generate a custom set' : ''}.</>
        )}
      </p>
      {emptyPool && onSwitchTab && (
        <button type="button" style={{ ...styles.secondaryBtn, marginBottom: 8 }} onClick={() => onSwitchTab('Study')}>
          ← Back to Study
        </button>
      )}
      {hasBank && <BankMixDisplay questions={bankQuestions} />}
      {!hasBank && curatedPoolSize === 0 && premiumUnlocked && <AiBudgetWarning />}
      {!hasBank && curatedPoolSize === 0 && !premiumUnlocked && (
        <div style={{ ...styles.card, border: `1px solid ${COLORS.border}`, marginBottom: 8, padding: '10px 12px' }}>
          <p style={{ ...styles.small, margin: 0, lineHeight: 1.45 }}>
            {PREMIUM_COMING_SOON_LABEL} — AI practice sets unlock with supporter access. Curated topics include free questions automatically.
          </p>
        </div>
      )}
      <div style={{ marginBottom: 4 }}>
        <label htmlFor={`quiz-session-size-${objective.id}`} style={{ display: 'block', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 6 }}>This session</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <input
            id={`quiz-session-size-${objective.id}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={sessionSizeDraft}
            onChange={onSessionSizeInput}
            onBlur={onSessionSizeBlur}
            aria-label={`How many questions this session, up to ${poolMax} available`}
            style={{
              ...styles.input,
              width: 56,
              padding: '4px 8px',
              fontSize: 'var(--ccna-type-sm)',
              textAlign: 'center',
            }}
          />
          <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>
            of {poolMax} available
          </span>
        </div>
      </div>
      {emptyPool && !premiumUnlocked ? (
        <button type="button" style={{ ...styles.secondaryBtn, marginTop: 12 }} onClick={() => onSwitchTab?.('Study')}>
          ← Study this topic first
        </button>
      ) : (
        <button style={{ ...styles.primaryBtn, marginTop: 12 }} disabled={!canStartSession} onClick={() => startPracticeSession(false)}>
          {hasBank ? `Practice ${reviewCount} question${reviewCount === 1 ? '' : 's'}` : emptyPool ? 'Generate practice set' : 'Start practice'}
        </button>
      )}
      {hasBank && premiumUnlocked && (
        <button style={{ ...styles.secondaryBtn, marginTop: 8 }} disabled={!canStartSession} onClick={() => startPracticeSession(true)}>Generate new questions</button>
      )}
    </div>
  )
}
