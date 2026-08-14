import React, { useState, useEffect, useMemo } from 'react'
import { useNavCallbacks } from './context/AppNavigationContext.jsx'
import { DOMAINS, ALL_OBJECTIVES } from './data/ccnaDomains.js'
import { COLORS, accentColors, styles } from './ui/appTheme.js'
import { STORAGE_KEYS } from './storageKeys.js'
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
import DomainPassCompleteCard from './features/domainPass/DomainPassCompleteCard.jsx'
import WeakAreaDashboard from './features/home/WeakAreaDashboard.jsx'
import DomainBaselinePrompt from './features/domainPlacement/DomainBaselinePrompt.jsx'
import ExamReadyBanner from './home/ExamReadyBanner.jsx'
import HomeSectionLabel from './home/HomeSectionLabel.jsx'
import ContentHealthHomeStrip from './components/ContentHealthHomeStrip.jsx'
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
  homeDismissBtn,
  homeBodySm,
  homeBodyOnAccent,
  homeAccentCard,
  homeAccentStrip,
} from './home/homeUi.js'
import HomeDomainAccordion from './home/HomeDomainAccordion.jsx'
import {
  ContentTrustCard,
  YourProgressCard,
  HomeExtrasSection,
  ExamTrapWidget,
  StudyModeBtn,
} from './home/homeScreenCards.jsx'

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
