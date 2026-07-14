import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { COLORS, styles } from '../ui/appTheme.js'

export default function MockExamSelector({ onSelectFormat = () => {} }) {
  const [selectedFormat, setSelectedFormat] = useState(null)

  const formats = [
    {
      id: 'full',
      title: 'Full Mock Exam',
      icon: '🎓',
      questionCount: 70,
      timeMinutes: 120,
      difficulty: 'Real Exam Level',
      color: 'mint',
      description: 'Complete practice exam matching CCNA test format',
      highlights: ['All 6 domains', 'Full exam simulation', 'Detailed performance report'],
      recommended: true,
    },
    {
      id: 'quick',
      title: 'Quick Mock',
      icon: '⚡',
      questionCount: 30,
      timeMinutes: 45,
      difficulty: 'Comprehensive',
      color: 'sky',
      description: 'Focused practice for rapid skill assessment',
      highlights: ['30 questions', 'Mixed difficulty', 'Quick feedback'],
      recommended: false,
    },
  ]

  const handleSelectFormat = (format) => {
    setSelectedFormat(format.id)
    onSelectFormat(format)
  }

  return (
    <div style={{ padding: '16px 0', width: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, color: COLORS.silver, marginBottom: 4 }}>
          Select Mock Exam Format
        </div>
        <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>
          Choose the exam format that fits your study needs
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {formats.map(format => {
          const isSelected = selectedFormat === format.id
          const colorMap = {
            mint: { bg: COLORS.mintDim, border: COLORS.mintBorder, text: COLORS.mint },
            sky: { bg: COLORS.skyDim, border: COLORS.skyBorder, text: COLORS.sky },
          }
          const colors = colorMap[format.color]

          return (
            <button
              key={format.id}
              onClick={() => handleSelectFormat(format)}
              style={{
                ...styles.card,
                background: isSelected ? colors.bg : COLORS.card,
                border: `2px solid ${isSelected ? colors.border : COLORS.border}`,
                padding: 16,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                position: 'relative',
              }}
            >
              {format.recommended && (
                <div style={{ position: 'absolute', top: 12, right: 12, background: colors.text, color: COLORS.bg, fontSize: 'var(--ccna-type-xs)', fontWeight: 600, padding: '4px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Recommended
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: '32px' }}>{format.icon}</div>
                <div>
                  <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 700, color: COLORS.silver }}>
                    {format.title}
                  </div>
                  <div style={{ fontSize: 'var(--ccna-type-xs)', color: colors.text, fontWeight: 600, marginTop: 2 }}>
                    {format.difficulty}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 12, lineHeight: 1.5 }}>
                {format.description}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 12, background: COLORS.surface, borderRadius: 10, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 2 }}>Questions</div>
                  <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 700, color: COLORS.silver }}>{format.questionCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 2 }}>Time Limit</div>
                  <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 700, color: COLORS.silver }}>{format.timeMinutes} min</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                {format.highlights.map((highlight, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors.text, flexShrink: 0 }} />
                    <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>
                      {highlight}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', borderTop: `1px solid ${COLORS.border}`, marginTop: 12, color: isSelected ? colors.text : COLORS.silverMid, fontSize: 'var(--ccna-type-xs)', fontWeight: 600 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${isSelected ? colors.text : COLORS.border}`, background: isSelected ? colors.text : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? COLORS.bg : 'transparent', fontSize: '12px', fontWeight: 700 }}>
                  {isSelected ? '✓' : ''}
                </div>
                <span>{isSelected ? 'Selected' : 'Select this format'}</span>
              </div>
            </button>
          )
        })}
      </div>

      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.6 }}>
          <strong style={{ color: COLORS.silver }}>💡 Tip:</strong> Start with Full Mock to identify weak areas. Use Quick Mocks for targeted practice.
        </div>
      </div>

      {selectedFormat && (
        <button style={{ ...styles.primaryBtn, background: `linear-gradient(135deg, ${COLORS.brand}, ${COLORS.brandM})` }}>
          Start {formats.find(f => f.id === selectedFormat)?.title}
        </button>
      )}
    </div>
  )
}

MockExamSelector.propTypes = {
  onSelectFormat: PropTypes.func,
}
