import React, { useCallback, useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import {
  buildCommandDrillSession,
  gradeCommandDrillQuestion,
  drillSessionSummary,
} from './commandDrillQuiz.js'
import { CliModeBanner } from '../components/QuizQuestionChrome.jsx'
import { useMasteryProgress } from '../features/progress/MasteryProgressContext.jsx'
import { ENGAGEMENT_KINDS } from '../features/progress/masteryEngagement.js'

const DRILL_FILTERS = [
  { id: 'all', label: 'Mixed' },
  { id: 'verify', label: 'Verify' },
  { id: 'config', label: 'Configure' },
  { id: 'switching', label: 'Switching' },
  { id: 'routing', label: 'Routing' },
  { id: 'security', label: 'Security' },
]

export default function CommandDrillCoach({ index }) {
  const { recordEngagement } = useMasteryProgress()
  const [quizFilter, setQuizFilter] = useState('all')
  const [session, setSession] = useState(null)
  const [qIdx, setQIdx] = useState(0)
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState([])
  const [showHint, setShowHint] = useState(false)

  const current = session?.[qIdx]
  const lastResult = results[results.length - 1]
  const isCorrect = checked && lastResult?.correct
  const finished = session && qIdx >= session.length && results.length === session.length
  const summary = finished ? drillSessionSummary(results) : null

  const startSession = useCallback(() => {
    const deck = buildCommandDrillSession(index, { count: 10, category: quizFilter })
    setSession(deck)
    setQIdx(0)
    setAnswer('')
    setChecked(false)
    setResults([])
    setShowHint(false)
  }, [index, quizFilter])

  function checkAnswer() {
    if (!current || checked) return
    const correct = gradeCommandDrillQuestion(current, answer)
    setResults(r => [...r, { id: current.id, correct }])
    setChecked(true)
    if (current.objectiveId) {
      recordEngagement?.(current.objectiveId, {
        kind: ENGAGEMENT_KINDS.COMMAND_DRILL,
        correct: correct ? 1 : 0,
        total: 1,
      })
    }
  }

  function nextQuestion() {
    if (!session) return
    if (qIdx + 1 >= session.length) {
      setQIdx(session.length)
      return
    }
    setQIdx(i => i + 1)
    setAnswer('')
    setChecked(false)
    setShowHint(false)
  }

  return (
    <div className="command-drill-coach">
      <p style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid, margin: '0 0 10px', lineHeight: 1.5 }}>
        Type faithful IOS commands from prompts — shorthand like <code style={{ color: COLORS.sky }}>gi0/1</code>, <code style={{ color: COLORS.sky }}>conf t</code>, and <code style={{ color: COLORS.sky }}>sh ip route</code> count.
      </p>

      {!session && (
        <>
          <div className="ccna-h-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 12, paddingBottom: 4 }}>
            {DRILL_FILTERS.map(f => (
              <button key={f.id} type="button" onClick={() => setQuizFilter(f.id)}
                style={{ ...styles.pill(quizFilter === f.id ? 'mint' : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0, fontSize: 'var(--ccna-type-xs)' }}>
                {f.label}
              </button>
            ))}
          </div>
          <button type="button" style={{ ...styles.primaryBtn, width: '100%' }} onClick={startSession}>
            Start 10-question command drill
          </button>
        </>
      )}

      {session && !finished && current && (
        <div style={{ ...styles.card, padding: '12px 14px' }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 8 }}>
            Question {qIdx + 1} / {session.length}
            {current.objectiveId && <span> · Obj {current.objectiveId}</span>}
          </div>
          <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 10, lineHeight: 1.45 }}>
            {current.prompt}
          </div>

          <CliModeBanner question={current} compact />

          <input
            type="text"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !checked) checkAnswer() }}
            placeholder="Type next IOS command…"
            disabled={checked}
            aria-label="IOS command answer"
            style={{ ...styles.input, width: '100%', boxSizing: 'border-box', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />

          {showHint && current.hint && (
            <div style={{ marginTop: 8, fontSize: 'var(--ccna-type-xs)', color: COLORS.amber, lineHeight: 1.45 }}>
              Hint: {current.hint}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {!checked && (
              <>
                <button type="button" style={styles.primaryBtn} onClick={checkAnswer} disabled={!answer.trim()}>
                  Check
                </button>
                {current.hint && (
                  <button type="button" style={styles.secondaryBtn} onClick={() => setShowHint(true)}>
                    Hint
                  </button>
                )}
              </>
            )}
            {checked && (
              <>
                <div style={{ width: '100%', fontSize: 'var(--ccna-type-sm)', color: isCorrect ? COLORS.mint : COLORS.rose, marginBottom: 4 }}>
                  {isCorrect ? '✓ Correct' : `✗ Expected: ${current.displayAnswer}`}
                </div>
                <button type="button" style={styles.primaryBtn} onClick={nextQuestion}>
                  {qIdx + 1 >= session.length ? 'See results' : 'Next'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {finished && summary && (
        <div style={{ ...styles.card, padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--ccna-type-lg)', fontWeight: 700, marginBottom: 6 }}>
            {summary.correct}/{summary.total} correct ({summary.pct}%)
          </div>
          <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid, marginBottom: 14 }}>
            {summary.pct >= 80 ? 'Strong command recall — pair with Syntax coach for mode/order.' : 'Retry weak categories, then review command reference cards.'}
          </div>
          <button type="button" style={{ ...styles.primaryBtn, width: '100%' }} onClick={() => { setSession(null); setQIdx(0); setResults([]) }}>
            New drill
          </button>
        </div>
      )}
    </div>
  )
}
