import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { COLORS, styles } from '../ui/appTheme.js'

export default function OnboardingTour({
  isOpen = false,
  onComplete = () => {},
  onSkip = () => {},
  currentUserData = null,
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [hasShown, setHasShown] = useState(() => {
    try {
      return localStorage.getItem('onboarding-tour-completed') === 'true'
    } catch (e) {
      return false
    }
  })

  useEffect(() => {
    if (hasShown && isOpen) {
      onSkip()
    }
  }, [hasShown, isOpen, onSkip])

  const tourSteps = [
    { id: 'welcome', title: 'Welcome to CCNA Prep 2.0', icon: '👋', content: 'Your study experience just got smarter. Let me show you what\'s new in 2 minutes.', color: 'purple' },
    { id: 'study-plan', title: 'Here\'s Your Complete Study Plan', icon: '📚', content: 'You\'ll master 6 domains in a strategic order. No more wondering "what\'s next?"', color: 'sky', details: ['✓ D1: Mastered', '✓ D2: Certified', '⏱ D3: In Progress', '⭕ D4: Not Started'] },
    { id: 'mastery-levels', title: 'What is "Mastered"?', icon: '🏆', content: 'You\'ve completed both baseline and domain pass exams at required levels.', color: 'mint', details: ['✓ Passed baseline (90%+)', '✓ Passed domain pass (85%+)', '✓ You\'re certified in this domain'] },
    { id: 'refresh-reminders', title: 'You\'ll Get Refresh Reminders', icon: '🔄', content: 'After mastery, we\'ll remind you to review material at strategic intervals.', color: 'amber', details: ['• 7 days after mastery', '• 30 days after mastery', '• 60 days after mastery'] },
    { id: 'recommendations', title: 'Smart Recommendations', icon: '💡', content: 'The system analyzes your progress and suggests your optimal next steps.', color: 'sky' },
    { id: 'test-out', title: 'Test Out & Move Forward', icon: '🎯', content: 'When you master weak areas, you can "test out" to graduate from this domain.', color: 'mint' },
    { id: 'ready', title: 'Ready to Study Smarter?', icon: '🚀', content: 'You now understand the system. Let\'s get started on your learning journey!', color: 'mint' },
  ]

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const handleSkip = () => {
    completeOnboarding()
    onSkip()
  }

  const completeOnboarding = () => {
    try {
      localStorage.setItem('onboarding-tour-completed', 'true')
    } catch (e) {
      console.error('Error saving onboarding state:', e)
    }
    setHasShown(true)
    onComplete()
  }

  const step = tourSteps[currentStep]
  const colorMap = {
    purple: { bg: COLORS.purpleDim, border: COLORS.purpleDim, text: COLORS.purpleGlow },
    sky: { bg: COLORS.skyDim, border: COLORS.skyBorder, text: COLORS.sky },
    mint: { bg: COLORS.mintDim, border: COLORS.mintBorder, text: COLORS.mint },
    amber: { bg: COLORS.amberDim, border: COLORS.amberBorder, text: COLORS.amber },
  }
  const colors = colorMap[step.color]

  const progressPercentage = ((currentStep + 1) / tourSteps.length) * 100

  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
      <div style={{ ...styles.card, width: '100%', maxWidth: 480, borderRadius: 20, padding: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ height: 4, background: COLORS.surface, borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${progressPercentage}%`, background: `linear-gradient(90deg, ${COLORS.brand}, ${COLORS.brandM})`, transition: 'width 0.3s ease', borderRadius: 999 }} />
          </div>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, textAlign: 'right' }}>
            {currentStep + 1}/{tourSteps.length}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '48px', marginBottom: 12, opacity: 0.9 }}>
            {step.icon}
          </div>
          <h2 style={{ fontSize: 'var(--ccna-type-lg)', fontWeight: 700, color: COLORS.silver, margin: '0 0 12px' }}>
            {step.title}
          </h2>
          <p style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, margin: 0, lineHeight: 1.6 }}>
            {step.content}
          </p>
        </div>

        {step.details && (
          <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16, marginBottom: 24 }}>
            {step.details.map((detail, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: 'var(--ccna-type-xs)',
                  color: colors.text,
                  marginBottom: idx < step.details.length - 1 ? 8 : 0,
                  lineHeight: 1.5,
                }}
              >
                {detail}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
          <button
            onClick={handleNext}
            style={{
              ...styles.primaryBtn,
              background: `linear-gradient(135deg, ${COLORS.brand}, ${COLORS.brandM})`,
            }}
          >
            {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
          </button>

          <button
            onClick={handleSkip}
            style={{
              ...styles.secondaryBtn,
              padding: '10px 14px',
              minHeight: 40,
              fontSize: 'var(--ccna-type-xs)',
            }}
          >
            {currentStep === tourSteps.length - 1 ? 'Back to App' : 'Skip Tour'}
          </button>
        </div>

        {currentStep === 0 && (
          <div style={{ marginTop: 12, textAlign: 'center', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>
            ⏱ Estimated time: 2 minutes
          </div>
        )}
      </div>
    </div>
  )
}

OnboardingTour.propTypes = {
  isOpen: PropTypes.bool,
  onComplete: PropTypes.func,
  onSkip: PropTypes.func,
  currentUserData: PropTypes.object,
}
