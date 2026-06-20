import React, { useState, useEffect, useMemo } from 'react'
import { DOMAINS } from './data/ccnaDomains.js'
import { hasCuratedReading, hasCuratedQuestions } from './data/ccnaCurated.js'
import { isCuratedPack } from './curatedDisplay.js'
import CuratedStaticBadge from './components/CuratedStaticBadge.jsx'
import MasteryChecklist from './components/MasteryChecklist.jsx'
import ObjectiveOverflowMenu from './components/ObjectiveOverflowMenu.jsx'
import { getObjectiveWhyLine } from './curatedDisplay.js'
import StudyBlockCompleteCard from './components/StudyBlockCompleteCard.jsx'
import { useStudyBlock } from './components/StudyBlockProvider.jsx'
import { useNavHint } from './components/NavHintProvider.jsx'
import { NAV_HINT_KEYS } from './ui/navHintConfig.js'
import { labsForObjective } from './data/ccnaLabs.js'
import { COLORS, styles } from './ui/appTheme.js'

const MAIN_TABS = ['Study', 'Practice']

const TOOL_TAB_MAP = {
  'CLI Drill': 'CLI Drill',
  Subnetting: 'Subnetting',
  VLSM: 'VLSM',
  'IPv6 Calc': 'IPv6 Calc',
  'ACL Calc': 'ACL Calc',
}

function mapLegacyTab(tab) {
  if (!tab) return 'Study'
  if (tab === 'Explain' || tab === 'Visual') return 'Study'
  if (tab === 'Quiz') return 'Practice'
  if (MAIN_TABS.includes(tab)) return tab
  return null
}

export default function ObjectiveScreen({
  objective, progress, apiOnline, offlineReady, packagingId, onPackage, onBack, backLabel = 'Back', onUpdateProgress, onMissed, missed, onOpenLab, onSelectObjective, onOpenMissed,
  ExplainTab, VisualAidTab, QuizTab, CLIDrillTab, SubnettingTab, VLSMTab, IPv6CalcTab, ACLCalcTab,
  examMode = false,
  premiumUnlocked = false,
  onPremiumBlocked,
  SectionLabel, StatusLabel, StatusDot, ProgressBar, objectiveTabId, objectivePanelId, commandDrills,
  computeMastery, logEvent, masteryGate, enableSectionReview, bumpSessionStudy, celebrate, haptic,
  onToggleTheme,
  theme,
}) {
  const showNavHint = useNavHint()
  const { isActive, state: blockState, continueOnObjective, stop } = useStudyBlock()
  const [switchPrompt, setSwitchPrompt] = useState(null)
  const objLabs = labsForObjective(objective.id)
  const curated = isCuratedPack(objective.id)

  const siblings = useMemo(() => {
    const domain = DOMAINS.find(d => d.id === objective.domainId)
    return domain ? domain.objectives.map(o => ({ ...o, domainId: domain.id, domainName: domain.name, accent: domain.accent })) : []
  }, [objective.domainId])
  const sibIdx = siblings.findIndex(o => o.id === objective.id)
  const prevObj = sibIdx > 0 ? siblings[sibIdx - 1] : null
  const nextObj = sibIdx < siblings.length - 1 ? siblings[sibIdx + 1] : null

  const toolItems = useMemo(() => {
    const items = []
    if (commandDrills[objective.id]) items.push({ id: 'CLI Drill', label: 'CLI Drill', icon: '💻' })
    if (objective.id === '1.6') {
      items.push({ id: 'Subnetting', label: 'Subnetting', icon: '🧮' })
      items.push({ id: 'VLSM', label: 'VLSM', icon: '🧮' })
    }
    if (objective.id === '1.8') items.push({ id: 'IPv6 Calc', label: 'IPv6 Calc', icon: '🔢' })
    if (objective.id === '5.5' || objective.id === '5.6') items.push({ id: 'ACL Calc', label: 'ACL Calc', icon: '🔒' })
    return items
  }, [objective.id, commandDrills])

  const legacyTab = objective.__initialTab
  const mappedMain = mapLegacyTab(legacyTab)
  const initialTool = legacyTab && TOOL_TAB_MAP[legacyTab] ? legacyTab : null
  const initialTab = mappedMain || 'Study'

  const [tab, setTab] = useState(initialTab)
  const [toolPanel, setToolPanel] = useState(initialTool)

  useEffect(() => {
    setTab(mapLegacyTab(objective.__initialTab) || 'Study')
    setToolPanel(objective.__initialTab && TOOL_TAB_MAP[objective.__initialTab] ? objective.__initialTab : null)
  }, [objective.id, objective.__initialTab])

  const status = progress[objective.id]?.status || 'unseen'
  const isOffline = offlineReady?.has(objective.id)
  const isPackaging = packagingId === objective.id
  const masteryPct = Math.round(computeMastery(progress[objective.id] || {}).score * 100)
  const whyLine = getObjectiveWhyLine(objective.id)
  const deepRead = isActive && tab === 'Study' && !toolPanel
  const showOfflineAction = !curated

  function handleSelectSibling(target) {
    if (!target) return
    if (
      isActive
      && blockState.objectiveId
      && blockState.objectiveId !== target.id
    ) {
      setSwitchPrompt(target)
      return
    }
    onSelectObjective?.(target)
  }

  function confirmSwitch(choice) {
    if (!switchPrompt) return
    if (choice === 'continue') {
      continueOnObjective(switchPrompt.id)
      onSelectObjective?.(switchPrompt)
    } else if (choice === 'switch') {
      stop()
      onSelectObjective?.(switchPrompt)
    }
    setSwitchPrompt(null)
  }

  function handleScoreSaved(stats) {
    const entry = progress[objective.id] || {}
    const newScores = [...(entry.quizScores || []), { score: stats.correct, total: stats.total, date: Date.now() }]
    const newRatings = [...(entry.confidenceRatings || []), ...(stats.ratings || [])].slice(-30)
    const { score: masteryScore, mastered } = computeMastery({ quizScores: newScores, confidenceRatings: newRatings })
    onUpdateProgress(objective.id, {
      status: mastered ? 'mastered' : 'in_progress',
      quizScores: newScores,
      confidenceRatings: newRatings,
      masteryScore,
      lastSeen: Date.now(),
    })
    logEvent('user_completed_quiz', { objectiveId: objective.id, correct: stats.correct, total: stats.total, masteryScore })
    const sessionAcc = stats.total ? stats.correct / stats.total : 0
    if (sessionAcc >= masteryGate && !entry.reviewEligible) {
      enableSectionReview(objective.id)
      onUpdateProgress(objective.id, { reviewEligible: true })
    }
    const justMastered = mastered && status !== 'mastered'
    if (justMastered) {
      celebrate()
      haptic([12, 40, 12, 40, 18])
      bumpSessionStudy('mastered', objective.id)
      showNavHint(NAV_HINT_KEYS.QUIZ_MASTERED, { nextId: nextObj?.id })
    }
    if (mastered && !isOffline && apiOnline && premiumUnlocked && !curated) onPackage?.(objective)
    return justMastered
  }

  useEffect(() => {
    if (status === 'unseen') {
      onUpdateProgress(objective.id, { status: 'in_progress', lastSeen: Date.now() })
    } else {
      onUpdateProgress(objective.id, { lastSeen: Date.now() })
    }
    logEvent('user_viewed_topic', { objectiveId: objective.id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objective.id])

  function openTool(id) {
    setToolPanel(id)
    setTab('Study')
  }

  const tabBar = (
    <div role="tablist" aria-label={`${objective.id} study activities`} className="objective-tab-bar" style={styles.tabBar}>
      {MAIN_TABS.map((t, idx) => (
        <button
          key={t}
          type="button"
          role="tab"
          id={objectiveTabId(objective.id, t)}
          aria-selected={tab === t && !toolPanel}
          aria-controls={objectivePanelId(objective.id, t)}
          tabIndex={tab === t && !toolPanel ? 0 : -1}
          style={styles.tabBtn(tab === t && !toolPanel)}
          onClick={() => { setTab(t); setToolPanel(null) }}
          onKeyDown={(e) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
            e.preventDefault()
            let next = idx
            if (e.key === 'ArrowRight') next = (idx + 1) % MAIN_TABS.length
            else if (e.key === 'ArrowLeft') next = (idx - 1 + MAIN_TABS.length) % MAIN_TABS.length
            else if (e.key === 'Home') next = 0
            else if (e.key === 'End') next = MAIN_TABS.length - 1
            setTab(MAIN_TABS[next])
            setToolPanel(null)
          }}
        >{t}</button>
      ))}
    </div>
  )

  const bodyIntro = (
    <div className="objective-body-intro">
      {whyLine && (
        <p style={{ ...styles.small, marginBottom: 8, lineHeight: 1.45, color: COLORS.silverMid }}>
          {whyLine}
        </p>
      )}

      {switchPrompt && (
        <div className="study-block-switch-prompt" style={{ ...styles.card, marginBottom: 10, borderColor: COLORS.amberBorder }}>
          <p style={{ ...styles.small, margin: '0 0 8px' }}>
            Study block running on <strong>{blockState.objectiveId}</strong>. Open <strong>{switchPrompt.id}</strong>?
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button type="button" style={styles.primaryBtn} onClick={() => confirmSwitch('continue')}>Continue block here</button>
            <button type="button" style={styles.secondaryBtn} onClick={() => confirmSwitch('switch')}>Switch topic</button>
            <button type="button" style={styles.secondaryBtn} onClick={() => setSwitchPrompt(null)}>Cancel</button>
          </div>
        </div>
      )}

      {tab === 'Practice' && !toolPanel && (
        <MasteryChecklist progressEntry={progress[objective.id]} compact />
      )}

      {(progress[objective.id]?.quizScores || []).length > 0 && (
        <ProgressBar
          value={computeMastery(progress[objective.id]).score}
          max={1}
          accent={objective.accent}
          label="Topic mastery"
          sublabel={`${masteryPct}%`}
          height={7}
        />
      )}
    </div>
  )

  const testedOut = !!progress[objective.id]?.testedOut
  const showPreAssess = status === 'unseen' && !testedOut

  return (
    <div className={`objective-shell${deepRead ? ' objective-shell--deep-read' : ''}`}>
      <div className="objective-header objective-header--sticky">
        <div className="objective-sticky-chrome">
          <div className="objective-wayfind-row objective-wayfind-row--compact">
            <button type="button" className="objective-back-btn" onClick={onBack} aria-label={`Back to ${backLabel.toLowerCase()}`}>
              <span className="objective-back-btn__icon" aria-hidden="true">←</span>
              <span className="objective-back-btn__label">{backLabel}</span>
            </button>
            <ObjectiveOverflowMenu
              objective={objective}
              prevObj={prevObj}
              nextObj={nextObj}
              onSelectSibling={handleSelectSibling}
              objLabs={objLabs}
              onOpenLab={onOpenLab}
              isOffline={isOffline}
              isPackaging={isPackaging}
              apiOnline={apiOnline}
              premiumUnlocked={premiumUnlocked}
              onPackage={onPackage}
              onPremiumBlocked={onPremiumBlocked}
              showOfflineAction={showOfflineAction}
              toolItems={toolItems}
              onOpenTool={openTool}
              onToggleTheme={onToggleTheme}
              theme={theme}
            />
          </div>
          <div className="objective-meta-row" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <span style={styles.pill(objective.accent)}>{objective.id}</span>
            <span><StatusLabel status={status} /></span>
            {curated ? (
              <CuratedStaticBadge objectiveId={objective.id} fontSize={9} showIncluded />
            ) : (
              <span style={{ ...styles.pill('purple'), fontSize: 'var(--ccna-type-micro)' }}>AI on demand</span>
            )}
          </div>
          <h1 className="objective-title objective-title--header">{objective.title}</h1>
          {tabBar}
        </div>
      </div>

      <div className="objective-body internal-scroll">
        {bodyIntro}
        <StudyBlockCompleteCard
          objectiveId={objective.id}
          masteryPct={masteryPct}
          onQuiz={() => { setTab('Practice'); setToolPanel(null) }}
        />
        {toolPanel === 'CLI Drill' && (
          <div role="region" aria-label="CLI Drill">
            <SectionLabel icon="💻" label="CLI DRILL" />
            <CLIDrillTab objective={objective} />
          </div>
        )}
        {toolPanel === 'Subnetting' && (
          <div role="region" aria-label="Subnetting">
            <SectionLabel icon="🧮" label="SUBNETTING PRACTICE" />
            <SubnettingTab />
          </div>
        )}
        {toolPanel === 'VLSM' && (
          <div role="region" aria-label="VLSM">
            <SectionLabel icon="🧮" label="VLSM PRACTICE" />
            <VLSMTab />
          </div>
        )}
        {toolPanel === 'IPv6 Calc' && (
          <div role="region" aria-label="IPv6 Calculator">
            <SectionLabel icon="🔢" label="IPv6 CALCULATOR" />
            <IPv6CalcTab />
          </div>
        )}
        {toolPanel === 'ACL Calc' && (
          <div role="region" aria-label="ACL Calculator">
            <SectionLabel icon="🔒" label="ACL WILDCARD CALCULATOR" />
            <ACLCalcTab />
          </div>
        )}
        {!toolPanel && tab === 'Study' && (
          <div className="objective-tab-panel objective-reading-prose" role="tabpanel" id={objectivePanelId(objective.id, 'Study')} aria-labelledby={objectiveTabId(objective.id, 'Study')}>
            <ExplainTab
              objective={objective}
              progress={progress}
              onUpdateProgress={onUpdateProgress}
              layout="study"
              VisualAidTab={VisualAidTab}
              premiumUnlocked={premiumUnlocked}
              onPremiumBlocked={onPremiumBlocked}
              onStartPractice={() => setTab('Practice')}
            />
          </div>
        )}
        {!toolPanel && tab === 'Practice' && (
          <div className="objective-tab-panel" role="tabpanel" id={objectivePanelId(objective.id, 'Practice')} aria-labelledby={objectiveTabId(objective.id, 'Practice')}>
            <QuizTab
              objective={objective}
              progress={progress}
              missed={missed}
              onMissed={onMissed}
              onScoreSaved={handleScoreSaved}
              nextObjective={nextObj}
              onSelectObjective={onSelectObjective}
              onOpenMissed={onOpenMissed}
              onSwitchTab={(t) => setTab(t === 'Explain' ? 'Study' : t === 'Quiz' ? 'Practice' : t)}
              examMode={examMode}
              premiumUnlocked={premiumUnlocked}
              onPremiumBlocked={onPremiumBlocked}
              showPreAssessFirst={showPreAssess}
              onUpdateProgress={onUpdateProgress}
            />
          </div>
        )}
      </div>
    </div>
  )
}
