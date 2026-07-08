import React, { useCallback, useMemo, useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { SYNTAX_TIP_CATEGORIES, filterSyntaxTips } from './commandSyntaxTips.js'
import {
  buildSyntaxQuizSession,
  gradeSyntaxQuestion,
  syntaxSessionSummary,
} from './commandSyntaxQuiz.js'
import { MODE_LABEL } from './commandWorkflows.js'

const QUIZ_FILTERS = [
  { id: 'all', label: 'Mixed' },
  { id: 'modes', label: 'Modes' },
  { id: 'verify', label: 'Verify' },
  { id: 'switching', label: 'Switching' },
  { id: 'routing', label: 'Routing' },
  { id: 'security', label: 'Security' },
]

export default function CommandSyntaxCoach({ index }) {
  const [section, setSection] = useState('tips')
  const [tipCategory, setTipCategory] = useState('all')
  const [quizFilter, setQuizFilter] = useState('all')
  const [session, setSession] = useState(null)
  const [qIdx, setQIdx] = useState(0)
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState([])
  const [showHint, setShowHint] = useState(false)

  const tips = useMemo(() => filterSyntaxTips(tipCategory), [tipCategory])
  const current = session?.[qIdx]
  const lastResult = results[results.length - 1]
  const isCorrect = checked && lastResult?.correct
  const finished = session && qIdx >= session.length && results.length === session.length
  const summary = finished ? syntaxSessionSummary(results) : null

  const startSession = useCallback(() => {
    const deck = buildSyntaxQuizSession(index, { count: 10, category: quizFilter })
    setSession(deck)
    setQIdx(0)
    setAnswer('')
    setChecked(false)
    setResults([])
    setShowHint(false)
  }, [index, quizFilter])

  function checkAnswer() {
    if (!current || checked) return
    const correct = gradeSyntaxQuestion(current, answer)
    setResults(r => [...r, { id: current.id, correct }])
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
    setShowHint(false)
  }

  return (
    <div className="command-syntax-coach">
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {[
          { id: 'tips', label: 'Tips & mnemonics' },
          { id: 'practice', label: 'Syntax quiz' },
        ].map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSection(t.id)}
            style={{ ...styles.pill(section === t.id ? 'purple' : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {section === 'tips' && (
        <>
          <p style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid, margin: '0 0 10px', lineHeight: 1.5 }}>
            Memory hooks for IOS syntax — mode order, verify patterns, and config sequences exam items repeat.
          </p>
          <div className="ccna-h-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 12, paddingBottom: 4 }}>
            <button type="button" onClick={() => setTipCategory('all')}
              style={{ ...styles.pill(tipCategory === 'all' ? 'purple' : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
              All topics
            </button>
            {SYNTAX_TIP_CATEGORIES.map(c => (
              <button key={c.id} type="button" onClick={() => setTipCategory(c.id)}
                style={{ ...styles.pill(tipCategory === c.id ? c.accent : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0, fontSize: 'var(--ccna-type-xs)' }}>
                {c.label}
              </button>
            ))}
          </div>
          {tips.map(tip => (
            <div key={tip.id} style={{ ...styles.card, marginBottom: 10, padding: '12px 14px' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--ccna-type-md)', marginBottom: 6 }}>{tip.title}</div>
              <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.purple, fontWeight: 600, marginBottom: 8, lineHeight: 1.45 }}>
                {tip.mnemonic}
              </div>
              <ul style={{ margin: '0 0 10px', paddingLeft: 18, fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.55 }}>
                {tip.bullets.map(b => <li key={b} style={{ marginBottom: 4 }}>{b}</li>)}
              </ul>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {tip.examples.map(ex => (
                  <code key={ex} style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                    {ex}
                  </code>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {section === 'practice' && (
        <>
          <p style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid, margin: '0 0 10px', lineHeight: 1.5 }}>
            Type IOS commands or pick the correct mode — shorthand like <code style={{ color: COLORS.sky }}>gi0/1</code> and <code style={{ color: COLORS.sky }}>conf t</code> count.
          </p>

          {!session && (
            <>
              <div className="ccna-h-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 12, paddingBottom: 4 }}>
                {QUIZ_FILTERS.map(f => (
                  <button key={f.id} type="button" onClick={() => setQuizFilter(f.id)}
                    style={{ ...styles.pill(quizFilter === f.id ? 'mint' : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0, fontSize: 'var(--ccna-type-xs)' }}>
                    {f.label}
                  </button>
                ))}
              </div>
              <button type="button" style={{ ...styles.primaryBtn, width: '100%' }} onClick={startSession}>
                Start 10-question syntax sprint
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
              {current.command && (
                <code style={{ display: 'block', marginBottom: 10, padding: '8px 10px', borderRadius: 8, background: COLORS.surface, border: `1px solid ${COLORS.border}`, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 'var(--ccna-type-sm)', color: COLORS.sky }}>
                  {current.command}
                </code>
              )}

              {current.type === 'pick_mode' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} role="radiogroup" aria-label="IOS mode">
                  {current.options.map(opt => {
                    const selected = answer === opt
                    const showResult = checked && (opt === current.answer || selected)
                    return (
                      <button
                        key={opt}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={checked}
                        onClick={() => setAnswer(opt)}
                        style={{
                          ...styles.secondaryBtn,
                          textAlign: 'left',
                          border: selected ? `1px solid ${COLORS.purpleBorder}` : undefined,
                          color: showResult
                            ? (opt === current.answer ? COLORS.mint : (selected ? COLORS.rose : COLORS.silver))
                            : COLORS.silver,
                        }}
                      >
                        {MODE_LABEL[opt] || opt}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <input
                  type="text"
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !checked) checkAnswer() }}
                  placeholder="Type IOS command…"
                  disabled={checked}
                  style={{ ...styles.input, width: '100%', boxSizing: 'border-box', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
                  autoComplete="off"
                  spellCheck={false}
                />
              )}

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
                {summary.pct >= 80 ? 'Exam-ready syntax recall — keep the sprint habit.' : 'Review Tips & mnemonics, then retry weak categories.'}
              </div>
              <button type="button" style={{ ...styles.primaryBtn, width: '100%' }} onClick={() => { setSession(null); setQIdx(0); setResults([]) }}>
                New sprint
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
