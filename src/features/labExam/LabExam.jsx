import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import { getLab } from '../../data/ccnaLabs.js'
import LabView from '../../lab/LabView.jsx'
import StudyModeHeader from '../../components/StudyModeHeader.jsx'
import {
  aggregateLabExamScore,
  buildLabExamStations,
  LAB_EXAM_DOMAIN_LABELS,
  LAB_EXAM_MODES,
  LAB_EXAM_PASS_PCT,
} from './quickLabExamPool.js'

function formatMmSs(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

function stationBrief(lab) {
  if (lab.learningGoals?.[0]) return lab.learningGoals[0]
  const scenario = lab.scenario || ''
  if (scenario.length <= 160) return scenario
  return `${scenario.slice(0, 157)}…`
}

export default function LabExam({
  onExit,
  onSelectObjective,
  onOpenLabs,
  haptic,
}) {
  const [selectedMode, setSelectedMode] = useState('quick')
  const [selectedDomain, setSelectedDomain] = useState('access')
  const modeConfig = LAB_EXAM_MODES[selectedMode]
  const stations = useMemo(
    () => buildLabExamStations({ mode: selectedMode, domainId: selectedDomain, getLabFn: getLab }),
    [selectedMode, selectedDomain],
  )
  const totalSeconds = modeConfig.minutes * 60
  const [phase, setPhase] = useState('idle')
  const [stationIndex, setStationIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [results, setResults] = useState([])
  const stationScoredRef = useRef(false)

  const currentStation = stations[stationIndex] ?? null
  const currentBundle = currentStation ? getLab(currentStation.labId) : null

  const finishExam = useCallback((nextResults) => {
    setResults(nextResults)
    setPhase('debrief')
  }, [])

  const recordStationAndAdvance = useCallback((score) => {
    if (stationScoredRef.current) return
    stationScoredRef.current = true

    const entry = {
      labId: currentStation.labId,
      title: currentStation.title,
      objectiveId: currentStation.objectiveId,
      score,
    }
    const nextResults = [...results, entry]
    const nextIndex = stationIndex + 1

    if (nextIndex >= stations.length) {
      finishExam(nextResults)
      return
    }

    setResults(nextResults)
    setStationIndex(nextIndex)
    stationScoredRef.current = false
  }, [currentStation, finishExam, results, stationIndex, stations.length])

  const completeStation = useCallback(() => {
    recordStationAndAdvance(100)
  }, [recordStationAndAdvance])

  const skipStation = useCallback(() => {
    recordStationAndAdvance(0)
  }, [recordStationAndAdvance])

  const startExam = useCallback(() => {
    setPhase('active')
    setStationIndex(0)
    setResults([])
    setSecondsLeft(totalSeconds)
    stationScoredRef.current = false
    haptic?.([10, 30, 10])
  }, [haptic, totalSeconds])

  const retakeExam = useCallback(() => {
    setPhase('idle')
    setStationIndex(0)
    setResults([])
    setSecondsLeft(totalSeconds)
    stationScoredRef.current = false
  }, [totalSeconds])

  useEffect(() => {
    if (phase !== 'active') return undefined
    if (secondsLeft <= 0) {
      if (!stationScoredRef.current && currentStation) {
        stationScoredRef.current = true
        const timedOut = [
          ...results,
          {
            labId: currentStation.labId,
            title: currentStation.title,
            objectiveId: currentStation.objectiveId,
            score: 0,
          },
        ]
        finishExam(timedOut)
      } else {
        finishExam(results)
      }
      return undefined
    }

    const id = window.setInterval(() => {
      setSecondsLeft(s => s - 1)
    }, 1000)
    return () => window.clearInterval(id)
  }, [phase, secondsLeft, currentStation, results, finishExam])

  const debrief = useMemo(() => {
    const stationScores = results.map(r => r.score)
    return { ...aggregateLabExamScore(stationScores), results }
  }, [results])

  const weakStations = debrief.results.filter(r => r.score < LAB_EXAM_PASS_PCT)

  if (phase === 'idle') {
    return (
      <div className="lab-exam">
        <StudyModeHeader title="Lab Exam" onBack={onExit} />
        <div style={{ ...styles.card, marginBottom: 12 }}>
          <h2 style={{ ...styles.h2, marginBottom: 8 }}>{modeConfig.label} Lab Exam</h2>
          <p style={{ ...styles.body, color: COLORS.silver, lineHeight: 1.5, marginBottom: 12 }}>
            Timed skills check over {stations.length} curated stations (~{modeConfig.minutes} min).
            Complete each lab or skip to advance. Pass bar: {LAB_EXAM_PASS_PCT}%.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {Object.entries(LAB_EXAM_MODES).map(([mode, config]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSelectedMode(mode)}
                style={mode === selectedMode ? styles.primaryBtn : styles.secondaryBtn}
                aria-pressed={mode === selectedMode}
              >
                {config.label}
              </button>
            ))}
          </div>
          <div style={{ ...styles.small, color: COLORS.silverMid, marginBottom: 12 }}>
            {modeConfig.description}
          </div>
          {selectedMode === 'domain' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {Object.entries(LAB_EXAM_DOMAIN_LABELS).map(([domainId, label]) => (
                <button
                  key={domainId}
                  type="button"
                  onClick={() => setSelectedDomain(domainId)}
                  style={domainId === selectedDomain ? styles.primaryBtn : styles.secondaryBtn}
                  aria-pressed={domainId === selectedDomain}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <ul style={{ margin: '0 0 16px', paddingLeft: 18, color: COLORS.silverMid, fontSize: 'var(--ccna-type-sm)', lineHeight: 1.5 }}>
            {stations.map(s => (
              <li key={s.labId}>{s.title}</li>
            ))}
          </ul>
          <button type="button" style={styles.primaryBtn} onClick={startExam}>
            Start {modeConfig.label} Lab Exam
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'debrief') {
    return (
      <div className="lab-exam lab-exam--debrief">
        <StudyModeHeader title={`${modeConfig.label} Lab Exam Results`} onBack={onExit} backLabel="Exit" />
        <div style={{
          ...styles.card,
          marginBottom: 12,
          border: `1px solid ${debrief.pass ? COLORS.mintBorder : COLORS.roseBorder}`,
          background: debrief.pass ? COLORS.mintDim : COLORS.roseDim,
        }}
        >
          <div style={{ fontSize: 'var(--ccna-type-xl)', fontWeight: 800, color: debrief.pass ? COLORS.mint : COLORS.rose }}>
            {debrief.pct}%
          </div>
          <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 700, color: debrief.pass ? COLORS.mint : COLORS.rose, marginBottom: 8 }}>
            {debrief.pass ? 'Pass' : 'Fail'} — need {LAB_EXAM_PASS_PCT}%+
          </div>
          <p style={{ ...styles.small, color: COLORS.silver, margin: 0 }}>
            Average across {debrief.results.length} station{debrief.results.length === 1 ? '' : 's'}.
          </p>
        </div>

        <div style={{ ...styles.card, marginBottom: 12 }}>
          <h3 style={{ ...styles.h2, marginBottom: 10 }}>Stations</h3>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {debrief.results.map((r, i) => (
              <li
                key={`${r.labId}-${i}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '8px 0',
                  borderBottom: i < debrief.results.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                  fontSize: 'var(--ccna-type-sm)',
                }}
              >
                <span style={{ color: COLORS.silver, flex: 1 }}>{r.title}</span>
                <span style={{ fontWeight: 700, color: r.score >= LAB_EXAM_PASS_PCT ? COLORS.mint : COLORS.rose }}>
                  {r.score}%
                </span>
              </li>
            ))}
          </ul>
        </div>

        {onSelectObjective && weakStations.length > 0 && (
          <div style={{ ...styles.card, marginBottom: 12, border: `1px solid ${COLORS.skyBorder}`, background: COLORS.skyDim }}>
            <h3 style={{ ...styles.h2, color: COLORS.sky, marginBottom: 8 }}>Weak objectives</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[...new Set(weakStations.map(s => s.objectiveId))].map(objId => (
                <button
                  key={objId}
                  type="button"
                  style={styles.secondaryBtn}
                  onClick={() => onSelectObjective(objId)}
                >
                  Study objective {objId}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button type="button" style={styles.secondaryBtn} onClick={onExit}>Exit</button>
          {onOpenLabs && (
            <button type="button" style={styles.secondaryBtn} onClick={onOpenLabs}>Labs hub</button>
          )}
          <button type="button" style={styles.primaryBtn} onClick={retakeExam}>Retake</button>
        </div>
      </div>
    )
  }

  if (!currentStation || !currentBundle) {
    return (
      <div className="lab-exam">
        <StudyModeHeader title="Lab Exam" onBack={onExit} />
        <div style={styles.card}>
          <p style={{ color: COLORS.silver }}>No stations available. Check lab pool configuration.</p>
          <button type="button" style={styles.secondaryBtn} onClick={onExit}>Exit</button>
        </div>
      </div>
    )
  }

  const timerLow = secondsLeft <= 5 * 60

  return (
    <div className="lab-exam lab-exam--active">
      <StudyModeHeader title={`${modeConfig.label} Lab Exam`} onBack={onExit} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-xs)' }}>
          Station {stationIndex + 1} / {stations.length}
        </span>
        <span style={{
          ...styles.pill(timerLow ? 'rose' : 'sky'),
          fontSize: 'var(--ccna-type-xs)',
          fontVariantNumeric: 'tabular-nums',
        }}
        >
          {formatMmSs(secondsLeft)}
        </span>
      </div>

      <div style={{ ...styles.card, marginBottom: 10, border: `1px solid ${COLORS.border}` }}>
        <div style={{ fontWeight: 700, fontSize: 'var(--ccna-type-sm)', marginBottom: 6 }}>{currentStation.title}</div>
        <p style={{
          margin: 0,
          fontSize: 'var(--ccna-type-sm)',
          color: COLORS.silverMid,
          lineHeight: 1.45,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
        >
          {stationBrief(currentBundle.lab)}
        </p>
      </div>

      <LabView
        key={currentStation.labId}
        bundle={currentBundle}
        onBack={skipStation}
        onDone={completeStation}
        exitLabel="Skip station"
        examMode
        celebrate={undefined}
        haptic={haptic}
      />
    </div>
  )
}
