import React, { useState, useEffect, useMemo } from 'react'
import { DOMAINS } from './data/ccnaDomains.js'
import { hasCuratedReading, hasCuratedQuestions } from './data/ccnaCurated.js'
import CuratedStaticBadge from './components/CuratedStaticBadge.jsx'
import StudyBlockStrip from './components/StudyBlockStrip.jsx'
import StudyBlockCompleteCard from './components/StudyBlockCompleteCard.jsx'
import { useStudyBlock } from './components/StudyBlockProvider.jsx'
import { useNavHint } from './components/NavHintProvider.jsx'
import { NAV_HINT_KEYS } from './ui/navHintConfig.js'
import { labsForObjective } from './data/ccnaLabs.js'
import { COLORS, styles } from './ui/appTheme.js'

export default function ObjectiveScreen({
  objective, progress, apiOnline, offlineReady, packagingId, onPackage, onBack, onUpdateProgress, onMissed, missed, onOpenLab, onSelectObjective, onOpenMissed,
  ExplainTab, VisualAidTab, QuizTab, CLIDrillTab, SubnettingTab, VLSMTab, IPv6CalcTab, ACLCalcTab,
  SectionLabel, StatusLabel, StatusDot, ProgressBar, objectiveTabId, objectivePanelId, commandDrills,
  computeMastery, logEvent, masteryGate, enableSectionReview, bumpSessionStudy, celebrate, haptic,
}) {
  const showNavHint = useNavHint()
  const { isActive, state: blockState, continueOnObjective, stop } = useStudyBlock()
  const [switchPrompt, setSwitchPrompt] = useState(null)
  const objLabs = labsForObjective(objective.id)

  const siblings = useMemo(() => {
    const domain = DOMAINS.find(d => d.id === objective.domainId)
    return domain ? domain.objectives.map(o => ({ ...o, domainId: domain.id, domainName: domain.name, accent: domain.accent })) : []
  }, [objective.domainId])
  const sibIdx = siblings.findIndex(o => o.id === objective.id)
  const prevObj = sibIdx > 0 ? siblings[sibIdx - 1] : null
  const nextObj = sibIdx < siblings.length - 1 ? siblings[sibIdx + 1] : null
  const tabs = useMemo(() => {
    const t = ['Explain', 'Visual', 'Quiz']
    if (commandDrills[objective.id]) t.push('CLI Drill')
    if (objective.id === '1.6') { t.push('Subnetting'); t.push('VLSM') }
    if (objective.id === '1.8') t.push('IPv6 Calc')
    if (objective.id === '5.5' || objective.id === '5.6') t.push('ACL Calc')
    return t
  }, [objective.id])

  const initialTab = (objective.__initialTab && tabs.includes(objective.__initialTab)) ? objective.__initialTab : tabs[0]
  const [tab, setTab] = useState(initialTab)
  useEffect(() => { setTab(initialTab) }, [objective.id, tabs, initialTab])

  const status = progress[objective.id]?.status || 'unseen'
  const isOffline = offlineReady?.has(objective.id)
  const isPackaging = packagingId === objective.id
  const masteryPct = Math.round(computeMastery(progress[objective.id] || {}).score * 100)
  const deepRead = isActive && tab === 'Explain'

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
    if (mastered && !isOffline && apiOnline) onPackage?.(objective)
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

  const topRow = (
    <div className="objective-top-row">
      <button type="button" className="objective-back-btn" style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <StudyBlockStrip objectiveId={objective.id} />
    </div>
  )

  const tabBar = (
    <div role="tablist" aria-label={`${objective.id} study activities`} className="objective-tab-bar" style={styles.tabBar}>
      {tabs.map((t, idx) => (
        <button
          key={t}
          type="button"
          role="tab"
          id={objectiveTabId(objective.id, t)}
          aria-selected={tab === t}
          aria-controls={objectivePanelId(objective.id, t)}
          tabIndex={tab === t ? 0 : -1}
          style={styles.tabBtn(tab === t)}
          onClick={() => setTab(t)}
          onKeyDown={(e) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
            e.preventDefault()
            let next = idx
            if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length
            else if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length
            else if (e.key === 'Home') next = 0
            else if (e.key === 'End') next = tabs.length - 1
            setTab(tabs[next])
          }}
        >{t}</button>
      ))}
    </div>
  )

  const headerDetails = (
    <>
      <div className="objective-meta-row" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        <span style={styles.pill(objective.accent)}>{objective.id}</span>
        <span><StatusLabel status={status} /></span>
        {(() => {
          if (hasCuratedQuestions(objective.id) || hasCuratedReading(objective.id)) {
            return <CuratedStaticBadge objectiveId={objective.id} fontSize={9} />
          }
          return <span style={{ ...styles.pill('purple'), fontSize: 'var(--ccna-type-caption)' }}>AI</span>
        })()}
      </div>
      <h1 style={styles.h1}>{objective.title}</h1>
      <div className="objective-domain" style={{ ...styles.small, marginBottom: 8 }}>{objective.domainName}</div>

      {(prevObj || nextObj) && (
        <div className="objective-nav-row" style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button
            onClick={() => handleSelectSibling(prevObj)}
            disabled={!prevObj}
            style={{
              flex: 1, minHeight: 44, borderRadius: 10, border: `1px solid ${COLORS.border}`,
              background: COLORS.surface, color: prevObj ? COLORS.silver : COLORS.silverDim,
              fontSize: 'var(--ccna-type-xs)', cursor: prevObj ? 'pointer' : 'default', fontFamily: 'inherit',
              padding: '6px 10px', textAlign: 'left', opacity: prevObj ? 1 : 0.35,
            }}
          >
            ‹ {prevObj ? prevObj.id : ''}
          </button>
          <button
            onClick={() => handleSelectSibling(nextObj)}
            disabled={!nextObj}
            style={{
              flex: 1, minHeight: 44, borderRadius: 10, border: `1px solid ${COLORS.border}`,
              background: COLORS.surface, color: nextObj ? COLORS.silver : COLORS.silverDim,
              fontSize: 'var(--ccna-type-xs)', cursor: nextObj ? 'pointer' : 'default', fontFamily: 'inherit',
              padding: '6px 10px', textAlign: 'right', opacity: nextObj ? 1 : 0.35,
            }}
          >
            {nextObj ? nextObj.id : ''} ›
          </button>
        </div>
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

      <div style={{ marginBottom: 10 }}>
        {isOffline ? (
          <span style={{ ...styles.pill('mint'), fontSize: 'var(--ccna-type-xs)' }}>⤓ Available offline</span>
        ) : isPackaging ? (
          <span style={{ ...styles.pill('sky'), fontSize: 'var(--ccna-type-xs)' }}>Downloading for offline…</span>
        ) : (
          <button
            onClick={() => onPackage?.(objective)}
            disabled={!apiOnline}
            style={{
              background: 'none', border: `1px solid ${COLORS.border}`, borderRadius: 999,
              color: apiOnline ? COLORS.silverMid : COLORS.silverDim, fontSize: 'var(--ccna-type-xs)', fontWeight: 600,
              padding: '4px 12px', minHeight: 32, cursor: apiOnline ? 'pointer' : 'default', fontFamily: 'inherit',
            }}
          >
            {apiOnline ? '⤓ Make available offline' : 'Offline — connect to download'}
          </button>
        )}
      </div>

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
    </>
  )

  return (
    <div className={`objective-shell${deepRead ? ' objective-shell--deep-read' : ''}`}>
      <div className="objective-header">
        {isActive ? (
          <>
            <div className="objective-header-scroll">{headerDetails}</div>
            <div className="objective-sticky-chrome">
              {topRow}
              {tabBar}
            </div>
          </>
        ) : (
          <>
            {topRow}
            {headerDetails}
            {tabBar}
          </>
        )}

        {objLabs.length > 0 && (
          <button className="ccna-hover" onClick={() => onOpenLab?.(objLabs[0].id)} style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', borderLeft: `3px solid ${COLORS.mint}` }}>
            <span style={{ fontSize: 'var(--ccna-type-lg)' }} aria-hidden="true">🧪</span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.silver }}>{objLabs.length === 1 ? objLabs[0].title : `${objLabs.length} hands-on labs`}</span>
              <span style={{ display: 'block', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>Guided multi-device lab · ~{objLabs[0].estimatedTimeMinutes} min</span>
            </span>
            <span style={{ color: COLORS.sky, fontSize: 'var(--ccna-type-sm)' }}>→</span>
          </button>
        )}
      </div>

      <div className="objective-body internal-scroll">
        <StudyBlockCompleteCard
          objectiveId={objective.id}
          masteryPct={masteryPct}
          onQuiz={() => setTab('Quiz')}
        />
        {tab === 'Explain' && (
          <div className="objective-reading-prose" role="tabpanel" id={objectivePanelId(objective.id, 'Explain')} aria-labelledby={objectiveTabId(objective.id, 'Explain')}>
            <SectionLabel icon="📖" label="EXPLANATION" />
            <ExplainTab objective={objective} progress={progress} onUpdateProgress={onUpdateProgress} />
          </div>
        )}
        {tab === 'Visual' && (
          <div role="tabpanel" id={objectivePanelId(objective.id, 'Visual')} aria-labelledby={objectiveTabId(objective.id, 'Visual')}>
            <SectionLabel icon="🖼" label="VISUAL AID" />
            <VisualAidTab objective={objective} />
          </div>
        )}
        {tab === 'Quiz' && (
          <div role="tabpanel" id={objectivePanelId(objective.id, 'Quiz')} aria-labelledby={objectiveTabId(objective.id, 'Quiz')}>
            <SectionLabel icon="❓" label="QUIZ" />
            <QuizTab
              objective={objective}
              progress={progress}
              missed={missed}
              onMissed={onMissed}
              onScoreSaved={handleScoreSaved}
              nextObjective={nextObj}
              onSelectObjective={onSelectObjective}
              onOpenMissed={onOpenMissed}
              onSwitchTab={setTab}
            />
          </div>
        )}
        {tab === 'CLI Drill' && (
          <div role="tabpanel" id={objectivePanelId(objective.id, 'CLI Drill')} aria-labelledby={objectiveTabId(objective.id, 'CLI Drill')}>
            <SectionLabel icon="💻" label="CLI DRILL" />
            <CLIDrillTab objective={objective} />
          </div>
        )}
        {tab === 'Subnetting' && (
          <div role="tabpanel" id={objectivePanelId(objective.id, 'Subnetting')} aria-labelledby={objectiveTabId(objective.id, 'Subnetting')}>
            <SectionLabel icon="🧮" label="SUBNETTING PRACTICE" />
            <SubnettingTab />
          </div>
        )}
        {tab === 'VLSM' && (
          <div role="tabpanel" id={objectivePanelId(objective.id, 'VLSM')} aria-labelledby={objectiveTabId(objective.id, 'VLSM')}>
            <SectionLabel icon="🧮" label="VLSM PRACTICE" />
            <VLSMTab />
          </div>
        )}
        {tab === 'IPv6 Calc' && (
          <div role="tabpanel" id={objectivePanelId(objective.id, 'IPv6 Calc')} aria-labelledby={objectiveTabId(objective.id, 'IPv6 Calc')}>
            <SectionLabel icon="🔢" label="IPv6 CALCULATOR" />
            <IPv6CalcTab />
          </div>
        )}
        {tab === 'ACL Calc' && (
          <div role="tabpanel" id={objectivePanelId(objective.id, 'ACL Calc')} aria-labelledby={objectiveTabId(objective.id, 'ACL Calc')}>
            <SectionLabel icon="🔒" label="ACL WILDCARD CALCULATOR" />
            <ACLCalcTab />
          </div>
        )}
      </div>
    </div>
  )
}
