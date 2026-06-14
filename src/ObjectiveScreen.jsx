import React, { useState, useEffect, useMemo } from 'react'
import { DOMAINS } from './data/ccnaDomains.js'
import { hasCuratedReading, hasCuratedQuestions } from './data/ccnaCurated.js'
import { labsForObjective } from './data/ccnaLabs.js'
import { COLORS, styles } from './ui/appTheme.js'

export default function ObjectiveScreen({
  objective, progress, apiOnline, offlineReady, packagingId, onPackage, onBack, onUpdateProgress, onMissed, missed, onOpenLab, onSelectObjective, onOpenMissed,
  ExplainTab, VisualAidTab, QuizTab, CLIDrillTab, SubnettingTab, VLSMTab, IPv6CalcTab, ACLCalcTab,
  SectionLabel, StatusLabel, StatusDot, ProgressBar, objectiveTabId, objectivePanelId, commandDrills,
  computeMastery, logEvent, masteryGate, enableSectionReview, bumpSessionStudy, celebrate, haptic,
}) {
  const objLabs = labsForObjective(objective.id)

  // Siblings within the same domain for prev/next navigation
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

  // Honor a deep-link tab hint (e.g. a "For You" card opening the CLI Drill tab).
  const initialTab = (objective.__initialTab && tabs.includes(objective.__initialTab)) ? objective.__initialTab : tabs[0]
  const [tab, setTab] = useState(initialTab)
  useEffect(() => { setTab(initialTab) }, [objective.id, tabs, initialTab])

  const status = progress[objective.id]?.status || 'unseen'
  const isOffline = offlineReady?.has(objective.id)
  const isPackaging = packagingId === objective.id

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
    // Mastery gate: once this session clears masteryGate, open the section for
    // spaced review and seed its answered questions into the queue (one-time).
    const sessionAcc = stats.total ? stats.correct / stats.total : 0
    if (sessionAcc >= masteryGate && !entry.reviewEligible) {
      enableSectionReview(objective.id)
      onUpdateProgress(objective.id, { reviewEligible: true })
    }
    // Celebrate a freshly-mastered topic (only on the transition, not repeats).
    if (mastered && status !== 'mastered') {
      celebrate()
      haptic([12, 40, 12, 40, 18])
      bumpSessionStudy('mastered', objective.id) // #16: track new mastery for recap
    }
    // On reaching mastery, auto-package the topic for offline use (online only).
    if (mastered && !isOffline && apiOnline) onPackage?.(objective)
  }

  // Mark "in progress" the first time an objective is opened
  useEffect(() => {
    if (status === 'unseen') {
      onUpdateProgress(objective.id, { status: 'in_progress', lastSeen: Date.now() })
    } else {
      onUpdateProgress(objective.id, { lastSeen: Date.now() })
    }
    logEvent('user_viewed_topic', { objectiveId: objective.id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objective.id])

  return (
    <div>
      <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        <span style={styles.pill(objective.accent)}>{objective.id}</span>
        <span><StatusLabel status={status} /></span>
        {(() => {
          if (hasCuratedReading(objective.id)) return <span style={{ ...styles.pill('mint'), fontSize: 9 }}>CURATED</span>
          if (hasCuratedQuestions(objective.id)) return <span style={{ ...styles.pill('sky'), fontSize: 9 }}>Q-ONLY</span>
          return <span style={{ ...styles.pill('purple'), fontSize: 9 }}>AI</span>
        })()}
      </div>
      <h1 style={styles.h1}>{objective.title}</h1>
      <div style={{ ...styles.small, marginBottom: 8 }}>{objective.domainName}</div>

      {/* Prev / Next navigation within domain */}
      {(prevObj || nextObj) && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button
            onClick={() => onSelectObjective?.(prevObj)}
            disabled={!prevObj}
            style={{
              flex: 1, minHeight: 44, borderRadius: 10, border: `1px solid ${COLORS.border}`,
              background: COLORS.surface, color: prevObj ? COLORS.silver : COLORS.silverDim,
              fontSize: 12, cursor: prevObj ? 'pointer' : 'default', fontFamily: 'inherit',
              padding: '6px 10px', textAlign: 'left', opacity: prevObj ? 1 : 0.35,
            }}
          >
            ‹ {prevObj ? prevObj.id : ''}
          </button>
          <button
            onClick={() => onSelectObjective?.(nextObj)}
            disabled={!nextObj}
            style={{
              flex: 1, minHeight: 44, borderRadius: 10, border: `1px solid ${COLORS.border}`,
              background: COLORS.surface, color: nextObj ? COLORS.silver : COLORS.silverDim,
              fontSize: 12, cursor: nextObj ? 'pointer' : 'default', fontFamily: 'inherit',
              padding: '6px 10px', textAlign: 'right', opacity: nextObj ? 1 : 0.35,
            }}
          >
            {nextObj ? nextObj.id : ''} ›
          </button>
        </div>
      )}

      <div style={{ marginBottom: 10 }}>
        {isOffline ? (
          <span style={{ ...styles.pill('mint'), fontSize: 11 }}>⤓ Available offline</span>
        ) : isPackaging ? (
          <span style={{ ...styles.pill('sky'), fontSize: 11 }}>Downloading for offline…</span>
        ) : (
          <button
            onClick={() => onPackage?.(objective)}
            disabled={!apiOnline}
            style={{
              background: 'none', border: `1px solid ${COLORS.border}`, borderRadius: 999,
              color: apiOnline ? COLORS.silverMid : COLORS.silverDim, fontSize: 11, fontWeight: 600,
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
          sublabel={`${Math.round(computeMastery(progress[objective.id]).score * 100)}%`}
          height={7}
        />
      )}

      <div role="tablist" aria-label={`${objective.id} study activities`} style={styles.tabBar}>
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

      {objLabs.length > 0 && (
        <button className="ccna-hover" onClick={() => onOpenLab?.(objLabs[0].id)} style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', borderLeft: `3px solid ${COLORS.mint}` }}>
          <span style={{ fontSize: 18 }} aria-hidden="true">🧪</span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.silver }}>{objLabs.length === 1 ? objLabs[0].title : `${objLabs.length} hands-on labs`}</span>
            <span style={{ display: 'block', fontSize: 11, color: COLORS.silverMid }}>Guided multi-device lab · ~{objLabs[0].estimatedTimeMinutes} min</span>
          </span>
          <span style={{ color: COLORS.sky, fontSize: 13 }}>→</span>
        </button>
      )}

      {tab === 'Explain' && (
        <div role="tabpanel" id={objectivePanelId(objective.id, 'Explain')} aria-labelledby={objectiveTabId(objective.id, 'Explain')}>
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
  )
}
