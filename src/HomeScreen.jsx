import React, { useState, useEffect, useMemo } from 'react'
import { useNavCallbacks } from './context/AppNavigationContext.jsx'
import { DOMAINS, ALL_OBJECTIVES } from './data/ccnaDomains.js'
import { COLORS, accentColors, styles } from './ui/appTheme.js'
import { STORAGE_KEYS } from './storageKeys.js'
import { getCurated } from './data/ccnaCurated.js'
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
import TrapHeatmapStrip from './home/TrapHeatmapStrip.jsx'
import HomeTopBar from './home/HomeTopBar.jsx'
import ProgressRing from './components/ProgressRing.jsx'
import { getSessionStudy, isRecapDismissed, dismissSessionRecap } from './home/sessionRecap.js'
import DomainPassCompleteCard from './features/domainPass/DomainPassCompleteCard.jsx'
import WeakAreaDashboard from './features/home/WeakAreaDashboard.jsx'
import DomainBaselinePrompt from './features/domainPlacement/DomainBaselinePrompt.jsx'
import ExamReadyBanner from './home/ExamReadyBanner.jsx'
import HomeSectionLabel from './home/HomeSectionLabel.jsx'
import ContentHealthHomeStrip from './components/ContentHealthHomeStrip.jsx'
import { QuizRichText } from './components/QuizQuestionChrome.jsx'
import { pickBaselineAwareStudyNext } from './features/domainPlacement/domainBaselineStudyPlan.js'
import { resumeStudyHandoff, pickDomainLessonObjective } from './home/resumeStudy.js'
import {
  buildWeakBatch,
  buildProgressGlance,
  pickActiveBatchDomain,
  resolveNextBeat,
} from './features/domainPass/weakBatch.js'
import { buildDomainBaselineSummary } from './features/domainPlacement/domainBaselineProfile.js'
import { buildStudyObjectiveHandoff } from './study/studyObjectiveHandoff.js'
import {
  HOME_SECTION_GAP,
  homeCard,
  homeSectionLabel,
  homePill,
  homePillCount,
  homeLinkBtn,
  homeDismissBtn,
  homeBodySm,
  homeBodyOnAccent,
  homeTitleSm,
  homeAccentCard,
  homeAccentStrip,
} from './home/homeUi.js'
import HomeDomainAccordion from './home/HomeDomainAccordion.jsx'

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

function ContentTrustCard() {
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

function YourProgressCard({
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

function HomeExtrasSection({ progress, onOpenSettings }) {
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

function ExamTrapWidget() {
  if (!ALL_EXAM_TRAPS.length) return null
  // Deterministic daily pick — changes each calendar day, consistent within the day
  const dayIndex = Math.floor(Date.now() / 86400000)
  const trap = ALL_EXAM_TRAPS[dayIndex % ALL_EXAM_TRAPS.length]
  return (
    <div style={homeCard({ border: `1px solid ${COLORS.roseBorder}`, background: COLORS.roseDim })}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={homePill('rose')}>⚠️ EXAM TRAP OF THE DAY</span>
        <span style={homePillCount('silver')}>{trap.objectiveId}</span>
      </div>
      <div style={{ ...homeTitleSm, color: COLORS.rose, marginBottom: 6 }}><QuizRichText text={trap.trap} /></div>
      <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silver, lineHeight: 1.5 }}><QuizRichText text={trap.correction} /></div>
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
        minWidth: 0,
        fontSize: 'var(--ccna-type-sm)',
        marginBottom: 0,
      }}
    >
      {children}
    </button>
  )
}

export default function HomeScreen({ progress, streak, missed, missedCount, dueCount, offlineReady, openDomain, premiumUnlocked = false, domainPassPassedCount = 0, placementBaselineCount = 0, placementTestedOutCount = 0, placementRecords = {}, domainPassRecords = {}, examDate = null, commandDrills = {}, theme }) {
  const {
    onOpenDomain,
    onSelectObjective,
    onOpenMock,
    onOpenLabExam,
    onOpenMockInterview,
    onOpenMissed,
    onOpenTutor,
    onPremiumBlocked,
    onOpenStats,
    onOpenSettings,
    onOpenReview,
    onOpenLabs,
    onOpenFocus,
    onOpenTopicFocus,
    onOpenCommandHub,
    onOpenTermsHub,
    onOpenStudyLens,
    onOpenExamTraps,
    onOpenTrapDrill,
    onOpenDomainPass,
    onOpenDomainPlacement,
    onOpenSubnet,
    onOpenRouting,
    onOpenExtraStudy,
    onToggleTheme,
  } = useNavCallbacks()
  const [suggestions, setSuggestions] = useState([])
  const [learnerSummary, setLearnerSummary] = useState(null)
  const [retention, setRetention] = useState([])
  const [showNudge, setShowNudge] = useState(false)
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
  }, [progress, missed, commandDrills])

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
  const studyNext = useMemo(() => {
    const baselineNext = pickBaselineAwareStudyNext({ placementRecords, dueCount, missed })
    if (baselineNext) return baselineNext
    return pickStudyNext(learnerSummary, dueCount, { domainPassRecords, commandDrills })
  }, [learnerSummary, dueCount, placementRecords, domainPassRecords, commandDrills, missed])

  const resumeLesson = useMemo(() => resumeStudyHandoff(progress), [progress])

  const homeBatchGlance = useMemo(() => {
    const domain = pickActiveBatchDomain({
      openDomainId: openDomain,
      placementRecords,
      missed,
      progress,
    })
    if (!domain) return null
    const baselineSummary = buildDomainBaselineSummary({
      domain,
      lastAttempt: placementRecords?.[domain.id]?.lastAttempt,
    })
    const batch = buildWeakBatch({
      domain,
      baselineSummary,
      missed,
      progress,
      rankedTraps: [],
    })
    const hasBaseline = baselineSummary && baselineSummary.domainStatus !== 'not_started'
    const missCount = missed.filter(m => domain.objectives.some(o => o.id === m?.objectiveId)).length
    const nextBeat = resolveNextBeat({
      batch,
      hasBaseline: !!hasBaseline,
      missCount,
      passReady: false,
    })
    const weakest = readiness.domainStats?.[0]
    return {
      domain,
      batch,
      nextBeat,
      glance: buildProgressGlance({
        batch,
        nextBeat,
        stickyMissCount: missCount,
        openTrapCount: batch.openTrapCount,
        domainPassPassed: domainPassPassedCount,
        weakestDomainName: weakest?.name || domain.name,
      }),
    }
  }, [openDomain, placementRecords, missed, progress, readiness, domainPassPassedCount])

  function openLessonsBrowse() {
    const domain = homeBatchGlance?.domain
      || (openDomain ? DOMAINS.find(d => d.id === openDomain) : null)
      || DOMAINS[0]
    const batchIds = homeBatchGlance?.batch?.objectiveIds || []
    if (batchIds[0]) {
      const handoff = buildStudyObjectiveHandoff(batchIds[0], { tab: 'Study' })
      if (handoff) {
        onSelectObjective(handoff)
        return
      }
    }
    if (resumeLesson) {
      onSelectObjective(resumeLesson)
      return
    }
    const handoff = pickDomainLessonObjective(domain, progress)
    if (handoff) onSelectObjective(handoff)
    else if (!openDomain) onOpenDomain?.(domain?.id)
  }

  function openGlanceNow() {
    const domain = homeBatchGlance?.domain
    const beat = homeBatchGlance?.nextBeat
    if (!domain || !beat) {
      openLessonsBrowse()
      return
    }
    if (beat.beat === 'baseline') {
      onOpenDomainPlacement?.({ domainId: domain.id, expandOnReturn: true })
      return
    }
    if (beat.beat === 'fix_misses') {
      onOpenMock?.({ domainId: domain.id, mode: 'bankburn', missOnly: true })
      return
    }
    if (beat.beat === 'flood' || beat.beat === 'pass_full') {
      onOpenDomainPass?.({
        domainId: domain.id,
        ...(beat.beat === 'flood' ? { focusObjectiveIds: beat.objectiveIds } : {}),
      })
      return
    }
    const oid = beat.objectiveId || beat.objectiveIds?.[0]
    if (oid) {
      const handoff = buildStudyObjectiveHandoff(oid, { tab: beat.beat === 'prove' ? 'Practice' : 'Study' })
      if (handoff) onSelectObjective(handoff)
      else openLessonsBrowse()
      return
    }
    onOpenDomain?.(domain.id)
  }

  const totals = useMemo(() => {
    let mastered = 0, inProgress = 0
    ALL_OBJECTIVES.forEach(o => {
      const s = progress[o.id]?.status
      if (s === 'mastered') mastered++
      else if (s === 'in_progress') inProgress++
    })
    return { mastered, inProgress, total: ALL_OBJECTIVES.length }
  }, [progress])

  return (
    <div className="ccna-home-scroll">
      <HomeTopBar
        streak={streak}
        totals={totals}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenStats={onOpenStats}
        offlineReady={offlineReady}
        readinessScore={readiness.score}
      />

      {resumeLesson && (
        <button
          type="button"
          className="ccna-hover"
          onClick={() => onSelectObjective(resumeLesson)}
          style={{
            ...homeAccentStrip(resumeLesson.accent || 'sky'),
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 4,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, width: '100%' }}>
            <span style={{ ...homePill(resumeLesson.accent || 'sky'), flexShrink: 0 }}>CONTINUE →</span>
            <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {resumeLesson.domainName || ''}
            </span>
            <span style={{ color: accentColors(resumeLesson.accent || 'sky').text, fontSize: 'var(--ccna-type-lg)', lineHeight: 1, flexShrink: 0 }} aria-hidden="true">›</span>
          </span>
          <span style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.silver, lineHeight: 1.35, paddingLeft: 2 }}>
            {resumeLesson.id} · {resumeLesson.title}
          </span>
        </button>
      )}

      <StudyNextStrip
        next={studyNext}
        onSelectObjective={onSelectObjective}
        onOpenReview={onOpenReview}
        onOpenDomainPlacement={onOpenDomainPlacement}
        onOpenMockExam={onOpenMock}
      />

      {onOpenDomainPlacement && (
        <DomainBaselinePrompt
          placementBaselineCount={placementBaselineCount}
          placementRecords={placementRecords}
          onOpenDomainPlacement={onOpenDomainPlacement}
          onOpenDomain={onOpenDomain}
        />
      )}

      {domainPassPassedCount === 6 && (
        <ExamReadyBanner
          examDate={examDate}
          onOpenMock={onOpenMock}
          onOpenSettings={onOpenSettings}
        />
      )}

      <TrapHeatmapStrip missed={missed} onOpenTrapDrill={onOpenTrapDrill} onOpenExamTraps={onOpenExamTraps} onOpenMissed={onOpenMissed} onSelectObjective={onSelectObjective} />

      <ExamTrapWidget />

      <ContentTrustCard />

      <YourProgressCard
        readiness={readiness}
        onOpenStats={onOpenStats}
        glance={homeBatchGlance?.glance || null}
        onNowClick={openGlanceNow}
      />

      <WeakAreaDashboard
        missed={missed}
        readiness={readiness}
        domainPassRecords={domainPassRecords}
        placementRecords={placementRecords}
        progress={progress}
        onSelectObjective={onSelectObjective}
        onOpenTrapDrill={onOpenTrapDrill}
        onOpenExamTraps={onOpenExamTraps}
        onOpenDomainPass={onOpenDomainPass}
        onOpenDomainPlacement={onOpenDomainPlacement}
        onOpenMock={onOpenMock}
        onOpenMockInterview={onOpenMockInterview}
      />

      {onOpenDomainPass && (
        <button
          type="button"
          className="ccna-hover"
          onClick={onOpenDomainPass}
          style={{
            ...homeCard({
              marginBottom: HOME_SECTION_GAP,
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: 'inherit',
              border: `1px solid ${COLORS.purpleBorder}`,
              background: COLORS.purpleDim,
            }),
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
            <div style={homeSectionLabel(COLORS.purple)}>DOMAIN PASS: {domainPassPassedCount}/6</div>
            {domainPassPassedCount === 6 ? (
              <DomainPassCompleteCard compact />
            ) : (
              <span style={{ ...homePill('purple'), fontSize: 'var(--ccna-type-xs)' }}>
                {Math.round((domainPassPassedCount / 6) * 100)}% complete
              </span>
            )}
          </div>
          <div style={{ height: 8, borderRadius: 999, background: COLORS.surface, overflow: 'hidden', marginBottom: 10 }}>
            <div
              style={{
                height: '100%',
                width: `${Math.round((domainPassPassedCount / 6) * 100)}%`,
                borderRadius: 999,
                background: COLORS.purple,
                transition: 'width .3s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div style={{ ...homeBodySm, margin: 0 }}>
              Pass each blueprint domain at 80%+ — adaptive retakes target weak objectives.
            </div>
            <span style={{ ...styles.small, color: COLORS.purple, fontWeight: 600, flexShrink: 0 }}>Open →</span>
          </div>
        </button>
      )}

      {showNudge && (
        <div style={homeCard({ background: COLORS.skyDim, border: `1px solid ${COLORS.skyBorder}`, position: 'relative' })}>
          <button onClick={dismissNudge} style={homeDismissBtn} aria-label="Dismiss">×</button>
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
            style={{ ...styles.primaryBtn, marginBottom: HOME_SECTION_GAP }}
            onClick={onOpenReview}
          >
            📅 Today's Review — {ready} ready · ~{estMin} min
          </button>
        )
      })()}

      <ContentHealthHomeStrip
        premiumUnlocked={premiumUnlocked}
        onOpenSettings={onOpenSettings}
      />

      {suggestions.length > 0 && (
        <div style={{ marginBottom: HOME_SECTION_GAP }} className="ccna-stagger">
          <HomeSectionLabel>FOR YOU</HomeSectionLabel>
          {suggestions.map(s => {
            const c = accentColors(s.accent)
            return (
              <button
                key={s.key}
                type="button"
                className="ccna-hover"
                onClick={() => onSelectObjective({ ...s.objective, __initialTab: s.tab })}
                style={homeAccentCard(s.accent)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={homePill(s.accent)}>{s.chip}</span>
                  <span style={{ color: c.text, fontSize: 'var(--ccna-type-lg)', lineHeight: 1 }}>›</span>
                </div>
                <div className="ccna-home-for-you__title" style={{ fontWeight: 600, fontSize: 'var(--ccna-type-md)', color: COLORS.silver, marginBottom: 4, lineHeight: 1.4 }}>{s.title}</div>
                <div style={{ ...homeBodyOnAccent }}>{s.body}</div>
              </button>
            )
          })}
        </div>
      )}

      <div style={homeCard()}>
        <HomeSectionLabel>STUDY MODES</HomeSectionLabel>
        <div className="home-study-grid">
          <StudyModeBtn primary onClick={openLessonsBrowse}>
            {homeBatchGlance?.batch?.objectiveIds?.length
              ? `Lessons · batch Review`
              : 'Lessons'}
          </StudyModeBtn>
          <StudyModeBtn onClick={onOpenMock}>Mock Exam</StudyModeBtn>
          {onOpenLabExam && <StudyModeBtn onClick={onOpenLabExam}>Lab Exam</StudyModeBtn>}
          <StudyModeBtn onClick={onOpenDomainPass}>Domain Pass ({domainPassPassedCount}/6)</StudyModeBtn>
          {onOpenDomainPlacement && (
            <StudyModeBtn onClick={() => onOpenDomainPlacement()}>
              Baseline ({placementBaselineCount}/6 · {placementTestedOutCount} tested out)
            </StudyModeBtn>
          )}
          <StudyModeBtn onClick={onOpenFocus}>Weak Areas</StudyModeBtn>
          <StudyModeBtn onClick={onOpenTopicFocus}>Topic Focus</StudyModeBtn>
          <StudyModeBtn onClick={onOpenCommandHub}>Command Hub</StudyModeBtn>
          <StudyModeBtn onClick={onOpenTermsHub}>Terms Hub</StudyModeBtn>
          <StudyModeBtn onClick={onOpenStudyLens}>Study Lens</StudyModeBtn>
          <StudyModeBtn onClick={onOpenMissed}>Missed ({missedCount})</StudyModeBtn>
          <StudyModeBtn onClick={onOpenExamTraps}>Exam Traps</StudyModeBtn>
          <StudyModeBtn onClick={() => onOpenTrapDrill?.()}>Trap Drill</StudyModeBtn>
          <StudyModeBtn onClick={onOpenLabs}>Labs</StudyModeBtn>
          <StudyModeBtn onClick={onOpenSubnet}>Subnetting</StudyModeBtn>
          <StudyModeBtn onClick={onOpenRouting}>Routing</StudyModeBtn>
          <StudyModeBtn onClick={onOpenExtraStudy}>Extra ({getShelvedStats().total})</StudyModeBtn>
          <StudyModeBtn
            onClick={() => {
              if (premiumUnlocked) onOpenTutor?.()
              else onPremiumBlocked?.('tutor', 'home')
            }}
          >
            AI Tutor
          </StudyModeBtn>
        </div>
      </div>

      <HomeExtrasSection progress={progress} onOpenSettings={onOpenSettings} />

      <HomeDomainAccordion
        progress={progress}
        placementRecords={placementRecords}
        domainPassRecords={domainPassRecords}
        openDomain={openDomain}
        offlineReady={offlineReady}
        missed={missed}
        onOpenDomain={onOpenDomain}
        onSelectObjective={onSelectObjective}
        onOpenLabs={onOpenLabs}
        onOpenDomainPlacement={onOpenDomainPlacement}
        onOpenDomainPass={onOpenDomainPass}
        onOpenTrapDrill={onOpenTrapDrill}
        onOpenCommandHub={onOpenCommandHub}
        onOpenTermsHub={onOpenTermsHub}
        onOpenMockExam={onOpenMock}
      />
    </div>
  )
}
