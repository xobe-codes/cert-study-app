import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { COLORS, styles } from '../ui/appTheme.js'

export default function RoutingDecoderChallenge({
  question = null,
  hints = [],
  difficulty = 'medium',
  onSubmitAnswer = () => {},
  onRequestHint = () => {},
}) {
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [usedHints, setUsedHints] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [accuracyScore, setAccuracyScore] = useState(null)

  const challengeData = useMemo(() => {
    if (!question) {
      return {
        title: 'No Question',
        description: 'Loading...',
        options: [],
        difficultyDisplay: { icon: '📊', label: 'Medium', color: 'sky' },
        hintAvailable: false,
      }
    }

    const difficultyDisplay = {
      easy: { icon: '🟢', label: 'Easy', color: 'mint' },
      medium: { icon: '🔵', label: 'Medium', color: 'sky' },
      hard: { icon: '🔴', label: 'Hard', color: 'rose' },
      expert: { icon: '⚫', label: 'Expert', color: 'amber' },
    }[difficulty] || { icon: '🔵', label: 'Medium', color: 'sky' }

    return {
      title: question.title || 'Routing Decoder Challenge',
      description: question.description || question.stem,
      options: question.options || [],
      difficultyDisplay,
      hintAvailable: usedHints < hints.length,
      remainingHints: Math.max(0, hints.length - usedHints),
      totalHints: hints.length,
    }
  }, [question, difficulty, hints.length, usedHints])

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return
    const accuracy = 100 - (usedHints / Math.max(1, challengeData.totalHints)) * 15
    setAccuracyScore(accuracy)
    setShowAnswer(true)

    onSubmitAnswer({
      selectedOption: selectedAnswer,
      accuracy,
      hintsUsed: usedHints,
      question: question.id,
    })
  }

  const handleRequestHint = () => {
    if (usedHints < hints.length) {
      setUsedHints(usedHints + 1)
      onRequestHint({
        hintNumber: usedHints + 1,
        question: question.id,
      })
    }
  }

  const currentHint = usedHints > 0 && usedHints <= hints.length ? hints[usedHints - 1] : null

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, color: COLORS.silver, marginBottom: 4 }}>
            {challengeData.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '14px' }}>{challengeData.difficultyDisplay.icon}</span>
            <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>
              {challengeData.difficultyDisplay.label} Difficulty
            </span>
          </div>
        </div>
        {showAnswer && accuracyScore !== null && (
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 2 }}>
              Accuracy Score
            </div>
            <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 700, color: accuracyScore >= 85 ? COLORS.mint : accuracyScore >= 70 ? COLORS.sky : COLORS.rose }}>
              {Math.round(accuracyScore)}%
            </div>
          </div>
        )}
      </div>

      {challengeData.description && (
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 'var(--ccna-type-xs)', color: COLORS.silver, lineHeight: 1.6 }}>
          {challengeData.description}
        </div>
      )}

      {currentHint && (
        <div style={{ background: COLORS.skyDim, border: `1px solid ${COLORS.skyBorder}`, borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: '16px', marginTop: 2, flexShrink: 0 }}>💡</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, color: COLORS.sky, marginBottom: 4 }}>
                Hint {usedHints}
              </div>
              <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.sky, lineHeight: 1.5 }}>
                {currentHint.text || currentHint}
              </div>
            </div>
          </div>
        </div>
      )}

      {!showAnswer && challengeData.options.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, color: COLORS.silverMid, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Select Your Answer
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {challengeData.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedAnswer(idx)}
                  style={{
                    background: isSelected ? COLORS.brandDim : COLORS.surface,
                    border: `2px solid ${isSelected ? COLORS.borderGlow : COLORS.border}`,
                    borderRadius: 10,
                    padding: 12,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 'var(--ccna-type-xs)',
                    color: isSelected ? COLORS.brand : COLORS.silver,
                    fontWeight: isSelected ? 600 : 500,
                    minHeight: 44,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? COLORS.brand : COLORS.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      background: isSelected ? COLORS.brand : 'transparent',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {isSelected ? '✓' : String.fromCharCode(65 + idx)}
                  </div>
                  <span style={{ flex: 1 }}>{option.text || option}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {showAnswer && (
        <div style={{ background: COLORS.mintDim, border: `1px solid ${COLORS.mintBorder}`, borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, color: COLORS.mint, marginBottom: 4 }}>
            ✓ Correct Answer
          </div>
          <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.mint }}>
            {challengeData.options[selectedAnswer]?.text || challengeData.options[selectedAnswer]}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {!showAnswer ? (
          <>
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              style={{
                ...styles.primaryBtn,
                opacity: selectedAnswer !== null ? 1 : 0.6,
                cursor: selectedAnswer !== null ? 'pointer' : 'not-allowed',
              }}
            >
              Submit Answer
            </button>

            {challengeData.hintAvailable && (
              <button
                onClick={handleRequestHint}
                style={{
                  ...styles.secondaryBtn,
                  padding: '10px 14px',
                  minHeight: 40,
                  fontSize: 'var(--ccna-type-xs)',
                }}
              >
                💡 Hint {usedHints + 1}/{challengeData.totalHints}
              </button>
            )}
          </>
        ) : (
          <button
            onClick={() => {
              setSelectedAnswer(null)
              setShowAnswer(false)
              setUsedHints(0)
              setAccuracyScore(null)
            }}
            style={{
              ...styles.primaryBtn,
              background: `linear-gradient(135deg, ${COLORS.brand}, ${COLORS.brandM})`,
            }}
          >
            Next Challenge
          </button>
        )}
      </div>
    </div>
  )
}

RoutingDecoderChallenge.propTypes = {
  question: PropTypes.object,
  hints: PropTypes.array,
  difficulty: PropTypes.oneOf(['easy', 'medium', 'hard', 'expert']),
  onSubmitAnswer: PropTypes.func,
  onRequestHint: PropTypes.func,
}
