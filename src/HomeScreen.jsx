import React, { useState, useEffect, useMemo } from 'react'
import { DOMAINS, ALL_OBJECTIVES } from './data/ccnaDomains.js'
import { COLORS, accentColors, styles } from './ui/appTheme.js'
import { STORAGE_KEYS } from './storageKeys.js'
import { getCurated, hasCuratedReading, hasCuratedQuestions } from './data/ccnaCurated.js'
import CuratedStaticBadge from './components/CuratedStaticBadge.jsx'
import { getShelvedStats } from './data/shelvedStudy.js'
import { REVIEW_SESSION_CAP } from './home/homeConstants.js'
import {
  buildLearnerSummary,
  generateLocalSuggestions,
  computeReadinessScore,
  pickStudyNext,
  loadRetentionHealth,
} from './home/learnerHome.js'
import StudyNextStrip from './home/StudyNextStrip.jsx'
import StatusDot from './components/StatusDot.jsx'
import StatusLabel from './components/StatusLabel.jsx'
import ProgressRing from './components/ProgressRing.jsx'
import { todayStr } from './home/sessionUtils.js'
import { getSessionStudy, isRecapDismissed, dismissSessionRecap } from './home/sessionRecap.js'

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

function HomeExtrasSection({ progress, onOpenSettings }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginBottom: 12 }}>
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
        <span style={{ flex: 1, textAlign: 'left' }}>
          <span style={{ display: 'block', fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: COLORS.silver, letterSpacing: 0.5 }}>EXAM PREP EXTRAS</span>
          <span style={{ display: 'block', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginTop: 2 }}>Exam countdown · daily trap</span>
        </span>
        <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div>
          <ExamCountdown progress={progress} onOpenSettings={onOpenSettings} />
          <ExamTrapWidget />
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
      <div style={{ ...styles.card, marginBottom: 12, border: `1px solid ${COLORS.border}` }}>
        <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, marginBottom: 8 }}>📅 No exam date set</div>
        <button type="button" style={{ ...styles.secondaryBtn, fontSize: 'var(--ccna-type-sm)' }} onClick={onOpenSettings}>Set exam date in Settings →</button>
      </div>
    )
  }

  const target = new Date(examDate)
  const now = new Date()
  const daysLeft = Math.ceil((target - now) / 86400000)
  if (daysLeft < 0) return (
    <div style={{ ...styles.card, marginBottom: 12, border: `1px solid ${COLORS.mintBorder}` }}>
      <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.mint, fontWeight: 600 }}>🎓 Exam date passed — good luck with results!</div>
      <button type="button" style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4, fontFamily: 'inherit' }} onClick={onOpenSettings}>Update in Settings</button>
    </div>
  )

  const unstudied = ALL_OBJECTIVES.filter(o => !progress[o.id] || progress[o.id].status === 'unseen').length
  const objPerDay = daysLeft > 0 ? Math.ceil(unstudied / Math.max(daysLeft, 1)) : unstudied
  const urgency = daysLeft <= 7 ? 'rose' : daysLeft <= 30 ? 'amber' : 'mint'

  return (
    <div style={{ ...styles.card, marginBottom: 12, border: `1px solid ${accentColors(urgency).border}`, background: accentColors(urgency).dim }}>
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

function ExamTrapWidget() {
  if (!ALL_EXAM_TRAPS.length) return null
  // Deterministic daily pick — changes each calendar day, consistent within the day
  const dayIndex = Math.floor(Date.now() / 86400000)
  const trap = ALL_EXAM_TRAPS[dayIndex % ALL_EXAM_TRAPS.length]
  return (
    <div style={{ ...styles.card, border: `1px solid ${COLORS.roseBorder}`, background: COLORS.roseDim, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ ...styles.pill('rose'), fontSize: 'var(--ccna-type-micro)' }}>⚠️ EXAM TRAP OF THE DAY</span>
        <span style={{ fontSize: 'var(--ccna-type-micro)', color: COLORS.silverMid }}>{trap.objectiveId}</span>
      </div>
      <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.rose, marginBottom: 6, lineHeight: 1.4 }}>{trap.trap}</div>
      <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silver, lineHeight: 1.5 }}>{trap.correction}</div>
    </div>
  )
}

/* ---- Session recap card (#16) ---- */
function SessionRecapCard() {
  const [dismissed, setDismissed] = useState(isRecapDismissed())
  // Read session data once on mount (HomeScreen remounts on each return to Home)
  const data = useMemo(() => getSessionStudy(), [])

  const total = data.correct + data.incorrect
  if (dismissed || total === 0) return null

  const parts = []
  if (total > 0) parts.push(`${total} question${total === 1 ? '' : 's'}`)
  if (data.objectives.length > 0) parts.push(`${data.objectives.length} objective${data.objectives.length === 1 ? '' : 's'}`)
  if (data.mastered.length > 0) parts.push(`${data.mastered.length} mastered 🎉`)

  function dismiss() { dismissSessionRecap(); setDismissed(true) }

  return (
    <div style={{
      ...styles.card, background: COLORS.skyDim, border: `1px solid ${COLORS.skyBorder}`,
      marginBottom: 12, position: 'relative', display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <button
        onClick={dismiss}
        style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', color: COLORS.silverMid, fontSize: 'var(--ccna-type-lg)', cursor: 'pointer', lineHeight: 1, padding: 0 }}
        aria-label="Dismiss"
      >×</button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.sky, marginBottom: 2 }}>📊 Last session</div>
        <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver }}>{parts.join(' · ')}</div>
        {total > 0 && (
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginTop: 2 }}>
            {data.correct} correct · {data.incorrect} incorrect
          </div>
        )}
      </div>
    </div>
  )
}

function StudyModeCard({ title, subtitle, children }) {
  return (
    <div style={{ ...styles.card, marginBottom: 10, padding: 12 }}>
      <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: COLORS.silver, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 10 }}>{subtitle}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{children}</div>
    </div>
  )
}

function StudyModeBtn({ onClick, children, primary, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...(primary ? styles.primaryBtn : styles.secondaryBtn),
        flex: '1 1 calc(50% - 4px)',
        minWidth: 120,
        fontSize: 'var(--ccna-type-sm)',
        marginBottom: 0,
      }}
    >
      {children}
    </button>
  )
}

export default function HomeScreen({ progress, streak, missed, missedCount, dueCount, apiOnline, offlineReady, openDomain, onOpenDomain, onSelectObjective, onOpenMock, onOpenMissed, onOpenTutor, onOpenMetrics, onOpenStats, onOpenSettings, onOpenReview, onOpenLabs, onOpenFocus, onOpenExamTraps, onOpenSubnet, onOpenRouting, onOpenExtraStudy, commandDrills = {} }) {
  const [suggestions, setSuggestions] = useState([])
  const [learnerSummary, setLearnerSummary] = useState(null)
  const [retention, setRetention] = useState([])
  const [showNudge, setShowNudge] = useState(false)

  // Recompute the "For You" cards locally whenever progress or the missed bank
  // changes. Fully deterministic — no API call.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const summary = await buildLearnerSummary(progress, missed || [])
      if (!cancelled) {
        setLearnerSummary(summary)
        setSuggestions(generateLocalSuggestions(summary, commandDrills))
      }
    })()
    return () => { cancelled = true }
  }, [progress, missed])

  // Retention health feeds the Exam Readiness score below — reload whenever
  // progress changes (a finished quiz can shift a section's SRS state).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const r = await loadRetentionHealth()
      if (!cancelled) setRetention(r)
    })()
    return () => { cancelled = true }
  }, [progress])

  // Show nudge only when: no progress on this device AND user hasn't dismissed it yet.
  useEffect(() => {
    const hasProgress = Object.keys(progress).length > 0
    if (hasProgress) { setShowNudge(false); return }
    window.storage.getItem(STORAGE_KEYS.nudgeDismissed).then(dismissed => {
      if (!dismissed) setShowNudge(true)
    })
  }, [progress])

  function dismissNudge() {
    setShowNudge(false)
    window.storage.setItem(STORAGE_KEYS.nudgeDismissed, true)
  }

  const readiness = useMemo(() => computeReadinessScore(progress, retention), [progress, retention])
  const studyNext = useMemo(() => pickStudyNext(learnerSummary, dueCount), [learnerSummary, dueCount])

  const totals = useMemo(() => {
    let mastered = 0, inProgress = 0
    ALL_OBJECTIVES.forEach(o => {
      const s = progress[o.id]?.status
      if (s === 'mastered') mastered++
      else if (s === 'in_progress') inProgress++
    })
    return { mastered, inProgress, total: ALL_OBJECTIVES.length }
  }, [progress])

  const sectionLabel = { ...styles.small, fontWeight: 700, color: COLORS.silver, marginBottom: 8, letterSpacing: 0.5 }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <h1 style={styles.h1} className="ccna-grad-text">CCNA 200-301</h1>
        {streak.count > 0 && (() => {
          const count = streak.count
          const msg = count >= 30 ? 'Legendary! 🏆' : count >= 14 ? 'Unstoppable! 💪🏾' : count >= 7 ? 'On fire! 🔥' : count >= 3 ? 'Nice momentum!' : 'Keep it going!'
          const today = todayStr()
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
          const lastLabel = streak.lastStudyDate === today ? 'Today' : streak.lastStudyDate === yesterday ? 'Yesterday' : null
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, marginRight: 48, flexShrink: 0 }}>
              <div style={{ ...styles.pill('mint'), whiteSpace: 'nowrap' }}>🔥 {count} day{count === 1 ? '' : 's'} streak</div>
              <div style={{ fontSize: 'var(--ccna-type-xs)', color: accentColors('mint').text, fontWeight: 500, textAlign: 'right' }}>{msg}</div>
              {lastLabel && <div style={{ fontSize: 'var(--ccna-type-micro)', color: COLORS.silverMid }}>Last studied: {lastLabel}</div>}
            </div>
          )
        })()}
      </div>
      <div style={{ ...styles.small, marginBottom: 10 }}>
        {totals.mastered} mastered · {totals.inProgress} in progress · {totals.total - totals.mastered - totals.inProgress} not started
        {offlineReady?.size > 0 && <> · ⤓ {offlineReady.size} offline-ready</>}
      </div>

      <StudyNextStrip next={studyNext} onSelectObjective={onSelectObjective} onOpenReview={onOpenReview} />

      {showNudge && (
        <div style={{ ...styles.card, background: COLORS.skyDim, border: `1px solid ${COLORS.skyBorder}`, marginBottom: 12, position: 'relative' }}>
          <button
            onClick={dismissNudge}
            style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', color: COLORS.silverMid, fontSize: 'var(--ccna-type-lg)', cursor: 'pointer', lineHeight: 1, padding: 0, minWidth: 44, minHeight: 44 }}
            aria-label="Dismiss"
          >×</button>
          <div style={{ fontWeight: 700, fontSize: 'var(--ccna-type-md)', color: COLORS.sky, marginBottom: 6 }}>📱 New device?</div>
          <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, marginBottom: 10 }}>
            Open <strong>More → Settings</strong> to import progress from another device.
          </div>
          <button
            style={{ ...styles.secondaryBtn, width: '100%', fontSize: 'var(--ccna-type-sm)', border: `1px solid ${COLORS.skyBorder}`, color: COLORS.sky }}
            onClick={onOpenSettings}
          >Open Settings</button>
        </div>
      )}

      {dueCount > 0 && (() => {
        const ready = Math.min(dueCount, REVIEW_SESSION_CAP)
        const estMin = Math.max(1, Math.round(ready * 0.5))
        return (
          <button
            className="ccna-hover"
            style={{ ...styles.primaryBtn, marginBottom: 12 }}
            onClick={onOpenReview}
          >
            📅 Today's Review — {ready} ready · ~{estMin} min
          </button>
        )
      })()}

      {suggestions.length > 0 && (
        <div style={{ marginBottom: 12 }} className="ccna-stagger">
          <div style={sectionLabel}>FOR YOU</div>
          {suggestions.map(s => {
            const c = accentColors(s.accent)
            return (
              <button
                key={s.key}
                className="ccna-hover"
                onClick={() => onSelectObjective({ ...s.objective, __initialTab: s.tab })}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                  background: c.dim, border: `1px solid ${c.border}`, borderRadius: 14, padding: 14, marginBottom: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ ...styles.pill(s.accent), fontSize: 'var(--ccna-type-xs)' }}>{s.chip}</span>
                  <span style={{ color: c.text, fontSize: 'var(--ccna-type-lg)', lineHeight: 1 }}>›</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--ccna-type-md)', color: COLORS.silver, marginBottom: 4, lineHeight: 1.4 }}>{s.title}</div>
                <div style={{ ...styles.small, lineHeight: 1.5 }}>{s.body}</div>
              </button>
            )
          })}
        </div>
      )}

      <SessionRecapCard />

      <div style={styles.card}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <ProgressRing value={readiness.score} size={72} accent="purple" caption="Exam Readiness" />
          <div style={{ flex: 1, minWidth: 0 }}>
            {readiness.domainStats.map(d => {
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
        <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
          <button
            onClick={onOpenStats}
            style={{ background: 'none', border: 'none', color: COLORS.purpleGlow, fontSize: 'var(--ccna-type-xs)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0, minHeight: 44 }}
          >
            View stats & trends →
          </button>
          <button
            onClick={onOpenMetrics}
            style={{ background: 'none', border: 'none', color: COLORS.sky, fontSize: 'var(--ccna-type-xs)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0, minHeight: 44 }}
          >
            Detailed metrics →
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={sectionLabel}>STUDY MODES</div>
        <StudyModeCard title="Exam & review" subtitle="Mock exams, weak spots, and review">
          <StudyModeBtn primary onClick={onOpenMock}>Mock Exam</StudyModeBtn>
          <StudyModeBtn onClick={onOpenFocus}>🎯 Weak Areas</StudyModeBtn>
          <StudyModeBtn onClick={onOpenMissed}>Missed ({missedCount})</StudyModeBtn>
          <StudyModeBtn onClick={onOpenExamTraps}>⚠️ Exam Traps</StudyModeBtn>
          <StudyModeBtn onClick={onOpenTutor} disabled={!apiOnline}>AI Tutor</StudyModeBtn>
        </StudyModeCard>
        <StudyModeCard title="Labs & drills" subtitle="Hands-on practice and extra content">
          <StudyModeBtn onClick={onOpenLabs}>🧪 Labs</StudyModeBtn>
          <StudyModeBtn onClick={onOpenSubnet}>🔢 Subnetting</StudyModeBtn>
          <StudyModeBtn onClick={onOpenRouting}>🛣 Routing</StudyModeBtn>
          <StudyModeBtn onClick={onOpenExtraStudy}>📚 Extra Study ({getShelvedStats().total})</StudyModeBtn>
        </StudyModeCard>
      </div>

      <HomeExtrasSection progress={progress} onOpenSettings={onOpenSettings} />

      <div role="group" aria-label="Course domains">
      {DOMAINS.map(domain => {
        const isOpen = openDomain === domain.id
        const objs = domain.objectives
        const masteredCount = objs.filter(o => progress[o.id]?.status === 'mastered').length
        const accent = accentColors(domain.accent)
        return (
          <div key={domain.id} className="ccna-hover" style={styles.card}>
            <button
              onClick={() => onOpenDomain(isOpen ? null : domain.id)}
              aria-expanded={isOpen}
              aria-controls={`domain-panel-${domain.id}`}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', color: COLORS.silver, cursor: 'pointer', minHeight: 44, padding: 0, textAlign: 'left' }}
            >
              <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
                  <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600 }}>{domain.name}</div>
                  <span style={{ ...styles.pill(domain.accent), fontSize: 'var(--ccna-type-micro)' }}>{domain.weight}% exam weight</span>
                </div>
                <div style={{ ...styles.small, marginBottom: 6 }}>{masteredCount}/{objs.length} mastered</div>
                {/* Outer bar width = exam weight (so D4@25% appears wider than D1@20%); fill = mastery */}
                <div style={{ width: '100%', height: 6, borderRadius: 999, background: COLORS.surface, overflow: 'hidden' }}>
                  <div style={{ width: `${domain.weight}%`, height: '100%', borderRadius: 999, background: COLORS.surface, position: 'relative', display: 'inline-block' }}>
                    <div style={{ width: `${Math.round(masteredCount / objs.length * 100)}%`, height: '100%', borderRadius: 999, background: accent.text }} />
                  </div>
                  <div style={{ display: 'inline-block', width: `${100 - domain.weight}%`, height: '100%', background: COLORS.border, borderRadius: 999 }} />
                </div>
              </div>
              <span style={{ ...styles.pill(domain.accent), flexShrink: 0 }}>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div id={`domain-panel-${domain.id}`} role="region" aria-label={`${domain.name} objectives`} style={{ marginTop: 10, borderTop: `1px solid ${COLORS.border}`, paddingTop: 8 }}>
                {objs.map(o => {
                  const status = progress[o.id]?.status || 'unseen'
                  return (
                    <button
                      key={o.id}
                      onClick={() => onSelectObjective({ ...o, domainId: domain.id, domainName: domain.name, accent: domain.accent })}
                      style={{ display: 'flex', alignItems: 'center', width: '100%', background: 'none', border: 'none', color: COLORS.silver, cursor: 'pointer', minHeight: 44, padding: '8px 0', textAlign: 'left', borderBottom: `1px solid ${COLORS.border}` }}
                    >
                      <StatusDot status={status} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 'var(--ccna-type-sm)' }}>{o.id} {o.title}</div>
                      </div>
                      {(() => {
                        if (hasCuratedReading(o.id) || hasCuratedQuestions(o.id)) {
                          return <CuratedStaticBadge objectiveId={o.id} fontSize={9} />
                        }
                        return null
                      })()}
                      {offlineReady?.has(o.id) && <span style={{ color: COLORS.mint, fontSize: 'var(--ccna-type-sm)', marginLeft: 8, flexShrink: 0 }}>⤓</span>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
      </div>
    </div>
  )
}
