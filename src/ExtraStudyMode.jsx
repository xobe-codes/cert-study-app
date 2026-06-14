import { useMemo, useState } from 'react'
import { gradeQuestion, isMcQuestion, randomizeQuestionOrder } from './questionUtils.js'
import { getShelvedPool, getShelvedStats, getPromoteHint } from './data/shelvedStudy.js'

/**
 * Extra Study — shelved / work-in-progress questions (not counted in main quiz bank).
 * Props: styles, COLORS, accentColors, AnswerReview, QuestionMeta, McChoices, RichText, back handler
 */
export default function ExtraStudyMode({
  styles, COLORS, accentColors, AnswerReview, QuestionMeta, McChoices, onBack,
}) {
  const stats = getShelvedStats()
  const [filter, setFilter] = useState('all')
  const pool = useMemo(() => {
    const p = getShelvedPool(filter).filter(q => isMcQuestion(q))
    const base = p.length ? p : getShelvedPool(filter)
    return randomizeQuestionOrder(base)
  }, [filter])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const q = pool[idx]
  const reasonAccent = q?.reason === 'exhibit-dependent' ? 'amber' : 'rose'

  function next() {
    setIdx(i => (i + 1) % Math.max(pool.length, 1))
    setSelected(null)
    setRevealed(false)
  }

  if (!pool.length) {
    return (
      <div>
        <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <h1 style={styles.h1}>Extra Study</h1>
        <div style={{ ...styles.card, marginTop: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: COLORS.mint }}>All clear — 0 shelved questions</div>
          <div style={{ fontSize: 13, lineHeight: 1.55 }}>
            Every question in the work-in-progress bank has been promoted into the main clean bank.
            Use domain quizzes and Mock Exam for scored practice.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <h1 style={styles.h1}>Extra Study</h1>
      <div style={{ ...styles.small, marginBottom: 10 }}>
        Work-in-progress bank — {stats.total} shelved ({stats.exhibitDependent} exhibit · {stats.outOfScope} out-of-scope). Not used in scored quizzes.
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {[['all', 'All'], ['exhibit', 'Exhibit'], ['out-of-scope', 'Out-of-scope']].map(([key, label]) => (
          <button key={key} type="button" onClick={() => { setFilter(key); setIdx(0); setRevealed(false); setSelected(null) }}
            style={{ ...styles.pill(filter === key ? 'sky' : 'silver'), cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>
            {label}
          </button>
        ))}
      </div>

      {q && (
        <div style={styles.card}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ ...styles.pill(reasonAccent), fontSize: 10 }}>{q.reason === 'exhibit-dependent' ? 'EXHIBIT' : 'OUT OF SCOPE'}</span>
            <span style={{ ...styles.pill('silver'), fontSize: 10 }}>{q.objectiveId}</span>
            <span style={{ fontSize: 11, color: COLORS.silverMid }}>{idx + 1} / {pool.length}</span>
          </div>

          <QuestionMeta q={q} />
          <div style={{ fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap', marginBottom: 12 }}>{q.question}</div>

          {isMcQuestion(q) ? (
            <McChoices q={q} selected={selected} revealed={revealed} onSelect={(i) => {
              if (revealed) return
              setSelected(i)
              setRevealed(true)
            }} />
          ) : (
            <div style={styles.small}>This question type is not yet supported in Extra Study.</div>
          )}

          {revealed && isMcQuestion(q) && (
            <div style={{ marginTop: 10, padding: 12, borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontWeight: 700, color: gradeQuestion(q, selected) ? COLORS.mint : COLORS.rose, marginBottom: 6, fontSize: 13 }}>
                {gradeQuestion(q, selected) ? 'Correct' : 'Incorrect'}
              </div>
              <AnswerReview q={q} selected={selected} />
              <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: accentColors('amber').dim, border: `1px solid ${accentColors('amber').border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: accentColors('amber').text, marginBottom: 4 }}>HOW TO PROMOTE TO MAIN BANK</div>
                <div style={{ fontSize: 12, lineHeight: 1.45, color: COLORS.silver }}>{getPromoteHint(q)}</div>
                {q.notes && <div style={{ fontSize: 11, color: COLORS.silverMid, marginTop: 4 }}>Note: {q.notes}</div>}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button type="button" style={styles.secondaryBtn} disabled={idx === 0} onClick={() => { setIdx(i => i - 1); setRevealed(false); setSelected(null) }}>Previous</button>
        <button type="button" style={styles.primaryBtn} onClick={next}>Next</button>
      </div>
    </div>
  )
}
