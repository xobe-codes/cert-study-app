import React, { useState, useEffect, useMemo } from 'react'
import { DOMAINS, ALL_OBJECTIVES } from './data/ccnaDomains.js'
import { COLORS, accentColors, styles } from './ui/appTheme.js'
import { STORAGE_KEYS } from './storageKeys.js'
import { getCurated } from './data/ccnaCurated.js'
import CuratedStaticBadge from './components/CuratedStaticBadge.jsx'
import { getCkuDifficulty, getCuratedPreview } from './curatedDisplay.js'
import DifficultyPill from './components/DifficultyPill.jsx'
import { hasCuratedReading, hasCuratedQuestions } from './data/ccnaCurated.js'
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

function HomeExtrasSection({ progress }) {
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
          <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: COLORS.silver, letterSpacing: 0.5 }}>EXAM PREP EXTRAS</span>
          <span style={{ display: 'block', fontSize: 11, color: COLORS.silverMid, marginTop: 2 }}>Countdown · daily trap</span>
        </span>
        <span style={{ fontSize: 12, color: COLORS.silverMid, flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div>
          <ExamCountdown progress={progress} />
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
function ExamCountdown({ progress }) {
  const [examDate, setExamDate] = useState(null)
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState('')

  useEffect(() => {
    ;(async () => {
      const saved = await window.storage.getItem('ccna_exam_date_v1')
      if (saved) setExamDate(saved)
    })()
  }, [])

  async function save() {
    if (!inputVal) return
    await window.storage.setItem('ccna_exam_date_v1', inputVal)
    setExamDate(inputVal); setEditing(false)
  }
  async function clear() {
    await window.storage.removeItem?.('ccna_exam_date_v1') || window.storage.setItem('ccna_exam_date_v1', null)
    setExamDate(null); setEditing(false)
  }

  if (editing || !examDate) {
    return (
      <div style={{ ...styles.card, marginBottom: 12, border: `1px solid ${COLORS.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.silver, marginBottom: 8 }}>📅 Set your exam date</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="date"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            style={{ flex: 1, minWidth: 140, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '8px 10px', color: COLORS.silver, fontFamily: 'inherit', fontSize: 13 }}
          />
          <button style={{ ...styles.primaryBtn, flex: 0 }} onClick={save}>Set</button>
          {examDate && <button style={{ ...styles.secondaryBtn, flex: 0 }} onClick={() => setEditing(false)}>Cancel</button>}
        </div>
      </div>
    )
  }

  const target = new Date(examDate)
  const now = new Date()
  const daysLeft = Math.ceil((target - now) / 86400000)
  if (daysLeft < 0) return (
    <div style={{ ...styles.card, marginBottom: 12, border: `1px solid ${COLORS.mintBorder}` }}>
      <div style={{ fontSize: 13, color: COLORS.mint, fontWeight: 600 }}>🎓 Exam date passed — good luck with results!</div>
      <button style={{ fontSize: 11, color: COLORS.silverMid, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4 }} onClick={() => setEditing(true)}>Update date</button>
    </div>
  )

  const unstudied = ALL_OBJECTIVES.filter(o => !progress[o.id] || progress[o.id].status === 'unseen').length
  const objPerDay = daysLeft > 0 ? Math.ceil(unstudied / Math.max(daysLeft, 1)) : unstudied
  const urgency = daysLeft <= 7 ? 'rose' : daysLeft <= 30 ? 'amber' : 'mint'

  return (
    <div style={{ ...styles.card, marginBottom: 12, border: `1px solid ${accentColors(urgency).border}`, background: accentColors(urgency).dim }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: accentColors(urgency).text }}>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</div>
          <div style={{ fontSize: 12, color: COLORS.silverMid }}>until exam · {target.toLocaleDateString()}</div>
        </div>
        <button style={{ fontSize: 11, color: COLORS.silverMid, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }} onClick={() => setEditing(true)}>Edit</button>
      </div>
      {unstudied > 0 && daysLeft > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: COLORS.silver }}>
          {unstudied} objectives not started · aim for ~{objPerDay}/day to cover all before exam
        </div>
      )}
      {unstudied === 0 && <div style={{ marginTop: 8, fontSize: 12, color: COLORS.mint }}>All objectives started — focus on mastery and daily reviews.</div>}
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
        <span style={{ ...styles.pill('rose'), fontSize: 9 }}>⚠️ EXAM TRAP OF THE DAY</span>
        <span style={{ fontSize: 10, color: COLORS.silverMid }}>{trap.objectiveId}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.rose, marginBottom: 6, lineHeight: 1.4 }}>{trap.trap}</div>
      <div style={{ fontSize: 12, color: COLORS.silver, lineHeight: 1.5 }}>{trap.correction}</div>
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
        style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', color: COLORS.silverMid, fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0 }}
        aria-label="Dismiss"
      >×</button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.sky, marginBottom: 2 }}>📊 Last session</div>
        <div style={{ fontSize: 13, color: COLORS.silver }}>{parts.join(' · ')}</div>
        {total > 0 && (
          <div style={{ fontSize: 11, color: COLORS.silverMid, marginTop: 2 }}>
            {data.correct} correct · {data.incorrect} incorrect
          </div>
        )}
      </div>
    </div>
  )
}

export default function HomeScreen({ progress, streak, missed, missedCount, dueCount, apiOnline, offlineReady, openDomain, onOpenDomain, onSelectObjective, onOpenMock, onOpenMissed, onOpenTutor, onOpenExport, onOpenMetrics, onOpenSync, onOpenReview, onOpenLabs, onOpenFocus, onOpenExamTraps, onOpenSubnet, onOpenRouting, onOpenExtraStudy, onImportPick, syncOn, commandDrills = {} }) {
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
              <div style={{ fontSize: 11, color: accentColors('mint').text, fontWeight: 500, textAlign: 'right' }}>{msg}</div>
              {lastLabel && <div style={{ fontSize: 10, color: COLORS.silverMid }}>Last studied: {lastLabel}</div>}
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
            style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', color: COLORS.silverMid, fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0, minWidth: 44, minHeight: 44 }}
            aria-label="Dismiss"
          >×</button>
          <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.sky, marginBottom: 6 }}>📱 New device?</div>
          <div style={{ fontSize: 13, color: COLORS.silver, marginBottom: 10 }}>
            Export your progress from another device and import it here to pick up where you left off.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              style={{ ...styles.secondaryBtn, flex: 1, fontSize: 13, border: `1px solid ${COLORS.skyBorder}`, color: COLORS.sky }}
              onClick={onOpenExport}
            >⬆ Export</button>
            <button
              style={{ ...styles.secondaryBtn, flex: 1, fontSize: 13, border: `1px solid ${COLORS.skyBorder}`, color: COLORS.sky }}
              onClick={onImportPick}
            >⬇ Import</button>
          </div>
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
                  <span style={{ ...styles.pill(s.accent), fontSize: 11 }}>{s.chip}</span>
                  <span style={{ color: c.text, fontSize: 16, lineHeight: 1 }}>›</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.silver, marginBottom: 4, lineHeight: 1.4 }}>{s.title}</div>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: COLORS.silverMid, marginBottom: 2 }}>
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
        <button
          onClick={onOpenMetrics}
          style={{ marginTop: 10, background: 'none', border: 'none', color: COLORS.sky, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0, minHeight: 44 }}
        >
          View full metrics →
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={sectionLabel}>STUDY MODES</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button style={{ ...styles.primaryBtn, flex: 1 }} onClick={onOpenMock}>Mock Exam</button>
          <button style={{ ...styles.secondaryBtn, flex: 1 }} onClick={onOpenMissed}>Missed ({missedCount})</button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...styles.secondaryBtn, flex: 1 }} onClick={onOpenFocus}>🎯 Focus Mode</button>
          <button style={{ ...styles.secondaryBtn, flex: 1 }} onClick={onOpenLabs}>🧪 Labs</button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button style={{ ...styles.secondaryBtn, flex: 1 }} onClick={onOpenExamTraps}>⚠️ Exam Traps</button>
          <button style={{ ...styles.secondaryBtn, flex: 1 }} onClick={onOpenSubnet}>🔢 Subnetting</button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button style={{ ...styles.secondaryBtn, flex: 1 }} onClick={onOpenRouting}>🛣 Routing Decoder</button>
          <button style={{ ...styles.secondaryBtn, flex: 1 }} onClick={onOpenExtraStudy}>📚 Extra Study ({getShelvedStats().total})</button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabel}>TOOLS</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button style={{ ...styles.secondaryBtn, flex: 1 }} onClick={onOpenMetrics}>📊 Metrics</button>
          <button style={{ ...styles.secondaryBtn, flex: 1 }} onClick={onOpenExport}>Export Reports</button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...styles.secondaryBtn, flex: 1 }} onClick={onOpenTutor} disabled={!apiOnline}>AI Tutor</button>
          <button style={{ ...styles.secondaryBtn, flex: 1 }} onClick={onOpenSync}>☁ Sync{syncOn ? ' ✓' : ''}</button>
        </div>
      </div>

      <HomeExtrasSection progress={progress} />

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
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{domain.name}</div>
                  <span style={{ ...styles.pill(domain.accent), fontSize: 9 }}>{domain.weight}% exam weight</span>
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
                  const curated = getCurated(o.id)
                  const preview = status === 'mastered' ? getCuratedPreview(o.id) : null
                  const ckus = curated?.ckus || []
                  const isStatic = hasCuratedReading(o.id) || hasCuratedQuestions(o.id)
                  return (
                    <div key={o.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                      <button
                        onClick={() => onSelectObjective({ ...o, domainId: domain.id, domainName: domain.name, accent: domain.accent })}
                        style={{ display: 'flex', alignItems: 'center', width: '100%', background: 'none', border: 'none', color: COLORS.silver, cursor: 'pointer', minHeight: 44, padding: '8px 0', textAlign: 'left' }}
                      >
                        <StatusDot status={status} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13 }}>{o.id} {o.title}</div>
                          {preview && (
                            <div style={{ fontSize: 11, color: COLORS.silverMid, marginTop: 3, lineHeight: 1.35 }}>{preview}</div>
                          )}
                        </div>
                        {isStatic
                          ? <CuratedStaticBadge objectiveId={o.id} fontSize={9} />
                          : null}
                        {offlineReady?.has(o.id) && <span style={{ color: COLORS.mint, fontSize: 13, marginLeft: 8, flexShrink: 0 }}>⤓</span>}
                      </button>
                      {ckus.length > 0 && (
                        <div style={{ paddingLeft: 22, paddingBottom: 6 }}>
                          {ckus.map(cku => (
                            <div
                              key={cku.id}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', minHeight: 32 }}
                            >
                              <span style={{ flex: 1, fontSize: 11, color: COLORS.silverMid, lineHeight: 1.35 }}>{cku.title}</span>
                              <DifficultyPill difficulty={getCkuDifficulty(o.id, cku.id)} fontSize={8} style={{ marginLeft: 0 }} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
