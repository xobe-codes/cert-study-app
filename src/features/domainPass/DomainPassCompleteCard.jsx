import React, { useState, useEffect, useCallback } from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import SvgConfetti from '../../components/SvgConfetti.jsx'
import {
  homeCard,
  homeSectionLabel,
  homePill,
  homeBodySm,
  HOME_SECTION_GAP,
} from '../../home/homeUi.js'
import { DOMAIN_PASS_TOTAL_DOMAINS } from './domainPassConfig.js'
import { loadDomainPassCelebrated, saveDomainPassCelebrated } from './domainPassStorage.js'
import { loadExamDate } from '../../settings/settingsActions.js'

const SHARE_URL = 'https://master.ccna-study-tool.pages.dev'

function daysUntilExam(isoDate) {
  if (!isoDate) return null
  const exam = new Date(isoDate)
  if (Number.isNaN(exam.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  exam.setHours(0, 0, 0, 0)
  return Math.ceil((exam - today) / 86400000)
}

function buildShareText() {
  const date = new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
  return [
    'CCNA 200-301 — Domain Pass complete!',
    `All ${DOMAIN_PASS_TOTAL_DOMAINS}/${DOMAIN_PASS_TOTAL_DOMAINS} blueprint domains passed at 80%+.`,
    `Completed ${date}`,
    SHARE_URL,
  ].join('\n')
}

/**
 * Celebration + share card when all blueprint domains are passed.
 */
export default function DomainPassCompleteCard({ onStartMockExam, compact = false }) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [copied, setCopied] = useState(false)
  const [examDays, setExamDays] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [celebrated, examIso] = await Promise.all([loadDomainPassCelebrated(), loadExamDate()])
      if (cancelled) return
      setExamDays(daysUntilExam(examIso))
      if (!celebrated) {
        setShowConfetti(true)
        await saveDomainPassCelebrated(true)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const copyShare = useCallback(async () => {
    const text = buildShareText()
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }, [])

  if (compact) {
    return (
      <div style={{ ...homePill('mint'), marginBottom: 8, display: 'inline-block' }}>
        Blueprint complete ✓
      </div>
    )
  }

  return (
    <>
      {showConfetti && <SvgConfetti active onComplete={() => setShowConfetti(false)} />}
      <div
        style={homeCard({
          marginBottom: HOME_SECTION_GAP,
          border: `1px solid ${COLORS.mintBorder}`,
          background: COLORS.mintDim,
        })}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          <div style={homeSectionLabel(COLORS.mint)}>BLUEPRINT COMPLETE</div>
          <span style={{ ...homePill('mint'), fontSize: 'var(--ccna-type-xs)' }}>
            {DOMAIN_PASS_TOTAL_DOMAINS}/{DOMAIN_PASS_TOTAL_DOMAINS} domains
          </span>
        </div>
        <h2 style={{ fontSize: 'var(--ccna-type-xl)', fontWeight: 700, color: COLORS.mint, margin: '0 0 8px', lineHeight: 1.3 }}>
          You passed every domain
        </h2>
        <p style={{ ...homeBodySm, margin: '0 0 12px' }}>
          All six CCNA blueprint domains cleared at 80%+. You are exam-ready on domain mastery
          {examDays != null && examDays >= 0 && (
            <> — <strong style={{ color: COLORS.mint }}>{examDays === 0 ? 'exam day' : `${examDays} day${examDays === 1 ? '' : 's'} to exam`}</strong></>
          )}
          . Run a full timed mock to pressure-test pacing.
        </p>
        <div
          style={{
            ...homeCard({ marginBottom: 12, background: COLORS.surface, border: `1px solid ${COLORS.mintBorder}` }),
            fontFamily: 'ui-monospace, monospace',
            fontSize: 'var(--ccna-type-xs)',
            color: COLORS.silverMid,
            whiteSpace: 'pre-wrap',
            lineHeight: 1.5,
          }}
        >
          {buildShareText()}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {onStartMockExam && (
            <button type="button" style={styles.primaryBtn} onClick={onStartMockExam}>
              {examDays != null && examDays <= 14 ? 'Start timed mock →' : 'Full mock exam →'}
            </button>
          )}
          <button type="button" style={onStartMockExam ? styles.secondaryBtn : styles.primaryBtn} onClick={copyShare}>
            {copied ? 'Copied!' : 'Copy share text'}
          </button>
        </div>
      </div>
    </>
  )
}
