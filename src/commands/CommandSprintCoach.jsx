import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { CliAnswerInput } from '../components/QuizQuestionChrome.jsx'
import {
  buildSprintSession,
  gradeSprintQuestion,
  sprintSessionSummary,
  sprintPackAvailability,
} from './commandSprintQuiz.js'
import { labIdForSprintPack } from './commandSprintPacks.js'

/**
 * Command Sprint — curated type-in packs without full lab chrome.
 * Props: domainFilter, onOpenLab, initialPackId (optional auto-start).
 */
export default function CommandSprintCoach({
  domainFilter = 'all',
  onOpenLab,
  initialPackId = null,
}) {
  const packs = useMemo(
    () => sprintPackAvailability(domainFilter === 'all' ? null : domainFilter),
    [domainFilter],
  )

  const [pack, setPack] = useState(null)
  const [session, setSession] = useState(null)
  const [qIdx, setQIdx] = useState(0)
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState([])
  const [autoStarted, setAutoStarted] = useState(false)

  const current = session?.[qIdx]
  const lastResult = results[results.length - 1]
  const isCorrect = checked && lastResult?.correct
  const finished = session && qIdx >= session.length && results.length === session.length
  const summary = finished ? sprintSessionSummary(results) : null
  const labId = pack ? labIdForSprintPack(pack.id) : null

  const startPack = useCallback((nextPack) => {
    const deck = buildSprintSession(nextPack)
    if (!deck.length) return
    setPack(nextPack)
    setSession(deck)
    setQIdx(0)
    setAnswer('')
    setChecked(false)
    setResults([])
  }, [])

  useEffect(() => {
    if (autoStarted || !initialPackId || !packs.length) return
    const match = packs.find(p => p.id === initialPackId)
    if (match) {
      setAutoStarted(true)
      startPack(match)
    }
  }, [autoStarted, initialPackId, packs, startPack])

  function checkAnswer() {
    if (!current || checked) return
    const correct = gradeSprintQuestion(current, answer)
    setResults(r => [...r, { id: current.id, correct, objectiveId: current.objectiveId }])
    setChecked(true)
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
  }

  function resetToPacks() {
    setPack(null)
    setSession(null)
    setQIdx(0)
    setResults([])
    setAnswer('')
    setChecked(false)
  }

  // Map type_command → CliAnswerInput shape
  const cliQuestion = current
    ? {
        ...current,
        type: 'cli',
        question: current.prompt,
        answers: current.answers,
        hint: current.hint,
      }
    : null

  return (
    <div className="command-sprint-coach" data-command-sprint="true">
      <p style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid, margin: '0 0 10px', lineHeight: 1.5 }}>
        Learn IOS commands in a short sprint — mode-aware type-in, no full lab required.
        Shorthand like <code style={{ color: COLORS.sky }}>conf t</code> and <code style={{ color: COLORS.sky }}>sh ip route</code> counts.
      </p>

      {!session && (
        <>
          {packs.length === 0 ? (
            <div style={{ ...styles.card, padding: '12px 14px' }}>
              <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid }}>
                No sprint packs for this domain filter. Choose All or another domain.
              </div>
            </div>
          ) : (
            <div className="command-sprint-packs">
              {packs.map(p => (
                <div key={p.id} style={{ ...styles.card, marginBottom: 8, padding: '12px 14px' }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--ccna-type-md)', marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.45, marginBottom: 8 }}>
                    {p.blurb}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {p.objectiveIds.map(oid => (
                      <span key={oid} style={{ ...styles.pill('sky'), fontSize: 'var(--ccna-type-micro)' }}>{oid}</span>
                    ))}
                    <span style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)' }}>
                      {Math.min(p.count, p.availableCount)} commands
                    </span>
                    {p.labId && (
                      <span style={{ ...styles.pill('mint'), fontSize: 'var(--ccna-type-micro)' }}>lab optional</span>
                    )}
                  </div>
                  <button
                    type="button"
                    style={{ ...styles.primaryBtn, width: '100%' }}
                    onClick={() => startPack(p)}
                    data-sprint-pack={p.id}
                  >
                    Start sprint
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {session && !finished && current && cliQuestion && (
        <div style={{ ...styles.card, padding: '12px 14px' }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 8 }}>
            {pack?.title} · {qIdx + 1}/{session.length}
            {current.objectiveId && <span> · Obj {current.objectiveId}</span>}
          </div>
          <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 10, lineHeight: 1.45 }}>
            {current.prompt}
          </div>

          <CliAnswerInput
            value={answer}
            onChange={setAnswer}
            onSubmit={checkAnswer}
            revealed={checked}
            question={cliQuestion}
          />

          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {!checked && (
              <button type="button" style={styles.primaryBtn} onClick={checkAnswer} disabled={!answer.trim()}>
                Check
              </button>
            )}
            {checked && (
              <>
                <div
                  style={{
                    width: '100%',
                    fontSize: 'var(--ccna-type-sm)',
                    color: isCorrect ? COLORS.mint : COLORS.rose,
                    marginBottom: 4,
                    lineHeight: 1.45,
                  }}
                  role="status"
                >
                  {isCorrect
                    ? '✓ Correct'
                    : `✗ Expected: ${current.displayAnswer}`}
                  {!isCorrect && current.hint ? (
                    <div style={{ marginTop: 4, color: COLORS.amber, fontSize: 'var(--ccna-type-xs)' }}>
                      Tip: {current.hint}
                    </div>
                  ) : null}
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
          <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid, marginBottom: 14, lineHeight: 1.45 }}>
            {summary.pct >= 80
              ? 'Strong CLI recall — open the full lab only if you want topology practice.'
              : 'Retry this sprint, then use Command drills for mixed practice.'}
          </div>
          <button type="button" style={{ ...styles.primaryBtn, width: '100%', marginBottom: 8 }} onClick={() => startPack(pack)}>
            Again
          </button>
          <button type="button" style={{ ...styles.secondaryBtn, width: '100%', marginBottom: 8 }} onClick={resetToPacks}>
            Next family
          </button>
          {labId && onOpenLab && (
            <button
              type="button"
              style={{ ...styles.secondaryBtn, width: '100%' }}
              onClick={() => onOpenLab(labId)}
            >
              Full lab →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
