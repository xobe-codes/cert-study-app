import React, { useState, useEffect, useMemo } from 'react'
import { ALL_OBJECTIVES } from '../data/ccnaDomains.js'
import { COLORS, accentColors, styles } from '../ui/appTheme.js'
import { STORAGE_KEYS } from '../storageKeys.js'
import { getCurated } from '../data/ccnaCurated.js'
import ProgressRing from '../components/ProgressRing.jsx'
import { getSessionStudy, isRecapDismissed, dismissSessionRecap } from './sessionRecap.js'
import { QuizRichText } from '../components/QuizQuestionChrome.jsx'
import { computeTrapWeakness, trapWeakTap } from '../weaknessUtils.js'
import { buildStudyObjectiveHandoff } from '../study/studyObjectiveHandoff.js'
import OverflowMarquee from '../components/OverflowMarquee.jsx'
import {
  HOME_SECTION_GAP,
  homeCard,
  homeSectionLabel,
  homePill,
  homePillCount,
  homeLinkBtn,
  homeDismissBtn,
  homeBodySm,
  homeTitleSm,
} from './homeUi.js'

const ALL_EXAM_TRAPS = (() => {
  const traps = []
  ALL_OBJECTIVES.forEach(o => {
    const data = getCurated(o.id)
    if (data?.examTraps?.length) {
      data.examTraps.forEach(t => traps.push({ ...t, objectiveId: o.id, objectiveTitle: o.title, accent: o.accent }))
    }
  })
  return traps
})()

export function ContentTrustCard() {
  return (
    <div style={homeCard({ border: `1px solid ${COLORS.mintBorder}`, background: COLORS.mintDim })}>
      <div style={homeSectionLabel(COLORS.mint)}>BUILT-IN STUDY PACKS</div>
      <p style={{ ...homeBodySm, margin: '0 0 8px' }}>
        Most objectives ship with curated reading, practice questions, diagrams, and flashcards — ready instantly, no API wait.
      </p>
      <p style={{ ...homeBodySm, margin: 0 }}>
        AI-generated lessons and custom quizzes are optional extras for topics without a full pack or when you want a fresh angle.
      </p>
    </div>
  )
}

export function YourProgressCard({
  readiness,
  onOpenStats,
  glance = null,
  onNowClick = null,
}) {
  const [dismissed, setDismissed] = useState(isRecapDismissed())
  const data = useMemo(() => getSessionStudy(), [])
  const total = data.correct + data.incorrect

  function dismiss() { dismissSessionRecap(); setDismissed(true) }

  return (
    <div style={homeCard()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={homeSectionLabel()}>YOUR PROGRESS</div>
        <button type="button" onClick={onOpenStats} style={homeLinkBtn(COLORS.purpleGlow)}>
          Stats & trends →
        </button>
      </div>
      {glance && (
        <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 12, background: COLORS.skyDim, border: `1px solid ${COLORS.skyBorder}` }}>
          <div style={{ fontSize: 'var(--ccna-type-micro)', fontWeight: 700, color: COLORS.sky, letterSpacing: 0.4, marginBottom: 4 }}>NOW</div>
          {onNowClick ? (
            <button
              type="button"
              onClick={onNowClick}
              style={{
                display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none',
                padding: 0, cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: COLORS.silver, marginBottom: 8, lineHeight: 1.4,
              }}
            >
              {glance.now} →
            </button>
          ) : (
            <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: COLORS.silver, marginBottom: 8, lineHeight: 1.4 }}>
              {glance.now}
            </div>
          )}
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 4, lineHeight: 1.4 }}>
            <strong style={{ color: COLORS.purple }}>Pulse:</strong> {glance.pulse}
          </div>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.4 }}>
            <strong style={{ color: COLORS.mint }}>Aim:</strong> {glance.aim}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: !dismissed && total > 0 ? 12 : 0 }}>
        <ProgressRing value={readiness.score} size={68} accent="purple" caption="Exam readiness" />
        <div style={{ flex: 1, minWidth: 0 }}>
          {readiness.domainStats.slice(0, 3).map(d => {
            const c = accentColors(d.accent)
            return (
              <div key={d.id} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 2 }}>
                  <span>{d.name}</span>
                  <span>{Math.round(d.avg * 100)}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 999, background: COLORS.surface, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.round(d.avg * 100)}%`, borderRadius: 999, background: c.text }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {!dismissed && total > 0 && (
        <div style={{ ...homeBodySm, padding: '8px 10px', borderRadius: 14, background: COLORS.skyDim, border: `1px solid ${COLORS.skyBorder}`, marginBottom: 0, position: 'relative' }}>
          <button type="button" onClick={dismiss} aria-label="Dismiss session recap" style={homeDismissBtn}>×</button>
          <strong style={{ color: COLORS.sky }}>Last session:</strong> {total} question{total === 1 ? '' : 's'} · {data.correct} correct
        </div>
      )}
    </div>
  )
}

export function HomeExtrasSection({ progress, onOpenSettings }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginBottom: HOME_SECTION_GAP }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
          background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14,
          padding: '12px 14px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: open ? 8 : 0,
        }}
      >
        <span style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
          <span style={{ display: 'block', ...homeSectionLabel(), marginBottom: 2 }}>EXAM PREP EXTRAS</span>
          <span style={{ display: 'block', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.4 }}>Exam countdown</span>
        </span>
        <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, flexShrink: 0, lineHeight: 1.3 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div>
          <ExamCountdown progress={progress} onOpenSettings={onOpenSettings} />
        </div>
      )}
    </div>
  )
}

/* =========================================================================
   EXAM DATE COUNTDOWN — user sets their target exam date once; stored locally.
   Shows days remaining and a simple daily target (objectives to study per day).
   ========================================================================= */
function ExamCountdown({ progress, onOpenSettings }) {
  const [examDate, setExamDate] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const saved = await window.storage.getItem(STORAGE_KEYS.examDate)
      if (!cancelled && saved) setExamDate(saved)
    })()
    return () => { cancelled = true }
  }, [])

  if (!examDate) {
    return (
      <div style={homeCard({ border: `1px solid ${COLORS.border}` })}>
        <div style={{ ...homeTitleSm, marginBottom: 8 }}>📅 No exam date set</div>
        <button type="button" style={{ ...styles.secondaryBtn, fontSize: 'var(--ccna-type-sm)' }} onClick={onOpenSettings}>Set exam date in Settings →</button>
      </div>
    )
  }

  const target = new Date(examDate)
  const now = new Date()
  const daysLeft = Math.ceil((target - now) / 86400000)
  if (daysLeft < 0) return (
    <div style={homeCard({ border: `1px solid ${COLORS.mintBorder}` })}>
      <div style={{ ...homeTitleSm, color: COLORS.mint }}>🎓 Exam date passed — good luck with results!</div>
      <button type="button" style={{ ...homeLinkBtn(COLORS.silverMid), minHeight: 0, padding: '4px 0', marginTop: 4 }} onClick={onOpenSettings}>Update in Settings</button>
    </div>
  )

  const unstudied = ALL_OBJECTIVES.filter(o => !progress[o.id] || progress[o.id].status === 'unseen').length
  const objPerDay = daysLeft > 0 ? Math.ceil(unstudied / Math.max(daysLeft, 1)) : unstudied
  const urgency = daysLeft <= 7 ? 'rose' : daysLeft <= 30 ? 'amber' : 'mint'

  return (
    <div style={homeCard({ border: `1px solid ${accentColors(urgency).border}`, background: accentColors(urgency).dim })}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 'var(--ccna-type-xl)', fontWeight: 700, color: accentColors(urgency).text }}>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</div>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>until exam · {target.toLocaleDateString()}</div>
        </div>
        <button type="button" style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'inherit' }} onClick={onOpenSettings}>Edit</button>
      </div>
      {unstudied > 0 && daysLeft > 0 && (
        <div style={{ marginTop: 8, fontSize: 'var(--ccna-type-xs)', color: COLORS.silver }}>
          {unstudied} objectives not started · aim for ~{objPerDay}/day to cover all before exam
        </div>
      )}
      {unstudied === 0 && <div style={{ marginTop: 8, fontSize: 'var(--ccna-type-xs)', color: COLORS.mint }}>All objectives started — focus on mastery and daily reviews.</div>}
    </div>
  )
}

/**
 * One card for everything trap-related on Home. Folds the personalized
 * "traps you keep missing" list and the daily trap-of-the-day pick into a
 * single rose card instead of two separately-bordered cards stacked back
 * to back — same information, one visual unit.
 */
export function TrapAlertsCard({ missed, onOpenTrapDrill, onOpenExamTraps, onOpenMissed, onSelectObjective }) {
  const traps = computeTrapWeakness(missed || []).slice(0, 4)
  const hasWeakness = traps.length > 0

  let dailyTrap = null
  if (ALL_EXAM_TRAPS.length) {
    // Deterministic daily pick — changes each calendar day, consistent within the day
    const dayIndex = Math.floor(Date.now() / 86400000)
    dailyTrap = ALL_EXAM_TRAPS[dayIndex % ALL_EXAM_TRAPS.length]
  }
  if (!hasWeakness && !dailyTrap) return null

  function handleTrapTap(trap) {
    trapWeakTap(trap, missed, {
      onOpenTrapDrill,
      onOpenExamTraps,
      onStudyObjective: (objectiveId) => {
        const handoff = buildStudyObjectiveHandoff(objectiveId, { tab: 'Practice' })
        if (handoff) onSelectObjective?.(handoff)
      },
    })
  }

  const maxCount = traps[0]?.count || 1

  return (
    <div style={homeCard({ border: `1px solid ${COLORS.roseBorder}`, background: COLORS.roseDim })}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: hasWeakness ? 8 : 6, flexWrap: 'wrap' }}>
        <span style={homePill('rose')}>⚠️ TRAP ALERTS</span>
        {hasWeakness && onOpenMissed && (
          <button
            type="button"
            onClick={onOpenMissed}
            style={{ ...homeLinkBtn(COLORS.rose), padding: 0, minHeight: 0 }}
          >
            All missed →
          </button>
        )}
      </div>

      {hasWeakness && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: dailyTrap ? 10 : 0 }}>
          {traps.map(({ trap, count }) => {
            const intensity = Math.max(0.25, count / maxCount)
            return (
              <button
                key={trap}
                type="button"
                className="ccna-hover"
                onClick={() => handleTrapTap(trap)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  cursor: onOpenTrapDrill ? 'pointer' : 'default',
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.roseBorder}`,
                  borderRadius: 10,
                  padding: '8px 10px',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <span style={{ ...homePillCount('rose'), flexShrink: 0 }}>{count}×</span>
                  <OverflowMarquee
                    text={trap}
                    style={{ flex: 1, fontSize: 'var(--ccna-type-xs)', color: COLORS.silver, lineHeight: 1.35 }}
                  />
                  <div
                    aria-hidden="true"
                    style={{ width: 40, height: 6, borderRadius: 999, background: COLORS.surface2 || COLORS.surface, overflow: 'hidden', flexShrink: 0 }}
                  >
                    <div style={{ height: '100%', width: `${Math.round(intensity * 100)}%`, background: COLORS.rose, borderRadius: 999 }} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {dailyTrap && (
        <div style={hasWeakness ? { borderTop: `1px solid ${COLORS.roseBorder}`, paddingTop: 8 } : undefined}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--ccna-type-micro)', fontWeight: 700, color: COLORS.silverMid, letterSpacing: 0.4 }}>
              EXAM TRAP OF THE DAY
            </span>
            <span style={homePillCount('silver')}>{dailyTrap.objectiveId}</span>
          </div>
          <div style={{ ...homeTitleSm, color: COLORS.rose, marginBottom: 6 }}><QuizRichText text={dailyTrap.trap} /></div>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silver, lineHeight: 1.5 }}><QuizRichText text={dailyTrap.correction} /></div>
        </div>
      )}
    </div>
  )
}

export function StudyModeBtn({ onClick, children, primary, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...(primary ? styles.primaryBtn : styles.secondaryBtn),
        flex: '1 1 calc(50% - 4px)',
        minWidth: 0,
        fontSize: 'var(--ccna-type-sm)',
        marginBottom: 0,
      }}
    >
      {children}
    </button>
  )
}
