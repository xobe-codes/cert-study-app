import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { COLORS, styles } from '../ui/appTheme.js'

export default function BankBurnSessionPicker({
  onStartSession = () => {},
  defaultQuestionCount = 10,
}) {
  const [selectedQuestions, setSelectedQuestions] = useState(defaultQuestionCount)
  const [customQuestions, setCustomQuestions] = useState('')
  const [isShuffled, setIsShuffled] = useState(true)
  const [isTimerEnabled, setIsTimerEnabled] = useState(true)
  const [hardOnly, setHardOnly] = useState(false)

  const questionOptions = [5, 10, 20, 50]

  const estimatedTime = useMemo(() => {
    const questions = selectedQuestions || parseInt(customQuestions) || 10
    const minTime = Math.ceil(questions * 1.2)
    const maxTime = Math.ceil(questions * 1.8)
    return { min: minTime, max: maxTime }
  }, [selectedQuestions, customQuestions])

  const finalQuestionCount = selectedQuestions || (customQuestions ? parseInt(customQuestions) : 10)
  const isCustom = !questionOptions.includes(selectedQuestions)

  const handleStartSession = () => {
    onStartSession({
      questionCount: finalQuestionCount,
      shuffle: isShuffled,
      timer: isTimerEnabled,
      hardOnly,
    })
  }

  return (
    <div style={styles.card}>
      <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 16, color: COLORS.silver }}>
        🔥 Bank Burn Session
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, marginBottom: 10, color: COLORS.silverMid, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Questions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
          {questionOptions.map(count => (
            <button
              key={count}
              onClick={() => {
                setSelectedQuestions(count)
                setCustomQuestions('')
              }}
              style={{
                ...styles.tabBtn(selectedQuestions === count && !isCustom),
                padding: '10px 8px',
                minHeight: 44,
                fontSize: 'var(--ccna-type-sm)',
                fontWeight: 600,
              }}
            >
              {count}Q
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="number"
            value={customQuestions}
            onChange={(e) => {
              const val = e.target.value
              setCustomQuestions(val)
              setSelectedQuestions(null)
            }}
            placeholder="Custom"
            style={{
              ...styles.input,
              flex: 1,
              minHeight: 40,
              padding: '8px 12px',
              fontSize: 'var(--ccna-type-xs)',
            }}
          />
          <div
            style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              fontSize: 'var(--ccna-type-xs)',
              color: COLORS.silverMid,
              minWidth: 60,
              justifyContent: 'center',
              fontWeight: 600,
            }}
          >
            Max 100
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, marginBottom: 10, color: COLORS.silverMid, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Options
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minHeight: 44, padding: '8px 0' }}>
            <input
              type="checkbox"
              checked={isShuffled}
              onChange={(e) => setIsShuffled(e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer', flexShrink: 0 }}
            />
            <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silver }}>
              Shuffle Questions
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minHeight: 44, padding: '8px 0' }}>
            <input
              type="checkbox"
              checked={isTimerEnabled}
              onChange={(e) => setIsTimerEnabled(e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer', flexShrink: 0 }}
            />
            <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silver }}>
              Enable Timer
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minHeight: 44, padding: '8px 0' }}>
            <input
              type="checkbox"
              checked={hardOnly}
              onChange={(e) => setHardOnly(e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer', flexShrink: 0 }}
            />
            <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silver }}>
              Hard Questions Only
            </span>
          </label>
        </div>
      </div>

      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 12, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 2 }}>
            Session Size
          </div>
          <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 700, color: COLORS.silver }}>
            {finalQuestionCount} questions
          </div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 2 }}>
            Estimated Time
          </div>
          <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 700, color: COLORS.silver }}>
            {estimatedTime.min}-{estimatedTime.max} min
          </div>
        </div>
      </div>

      <button
        onClick={handleStartSession}
        style={{
          ...styles.primaryBtn,
          background: `linear-gradient(135deg, ${COLORS.brand}, ${COLORS.brandM})`,
        }}
      >
        Start Bank Burn Session
      </button>

      <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginTop: 12, textAlign: 'center', lineHeight: 1.5 }}>
        💡 High-intensity question drills to reinforce weak areas.
      </div>
    </div>
  )
}

BankBurnSessionPicker.propTypes = {
  onStartSession: PropTypes.func,
  defaultQuestionCount: PropTypes.number,
}
