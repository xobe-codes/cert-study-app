import React, { useState, useEffect } from 'react'
import { hasCuratedReading } from '../../data/ccnaCurated.js'
import { labsForObjective } from '../../data/ccnaLabs.js'
import { ALL_OBJECTIVES } from '../../data/ccnaDomains.js'
import { COLORS, accentColors, styles } from '../../ui/appTheme.js'
import { STATIC_COPY } from '../../ui/staticContentCopy.js'
import QuestionHealthAdminSection from '../../components/QuestionHealthAdminSection.jsx'
import OverflowMarquee from '../../components/OverflowMarquee.jsx'
import Spinner from '../../components/Spinner.jsx'
import ProgressBar from '../../components/ProgressBar.jsx'
import ProgressRing from '../../components/ProgressRing.jsx'
import StudyNextStrip from '../../home/StudyNextStrip.jsx'
import StudyModeHeader from '../../components/StudyModeHeader.jsx'
import {
  MetricsCollapsibleSection,
  ContentCoverage,
  MockHistorySection,
  RetentionHealthSection,
  BankedQuestionsSection,
  AiUsageSection,
  SegmentedBar,
  quadrantOf,
} from './metricsDashboardParts.jsx'
import {
  buildLearnerSummary,
  generateLocalSuggestions,
  loadRetentionHealth,
  pickStudyNext,
} from '../../home/learnerHome.js'
import { computeCkuWeakness, computeTrapWeakness, resolveCkuWeakAction, trapWeakTap } from '../../weaknessUtils.js'
import { masteryBreakdown } from '../../lesson/masteryCriteria.js'
import { loadCliStats } from '../../lab/cliStatsStorage.js'
import { loadOfflineDetail } from '../export/offlineDetail.js'
import { loadQuizBank } from '../../quiz/quizBankStorage.js'
import { STORAGE_KEYS } from '../../storageKeys.js'
import { AiCallsIndicator } from '../../ai/claudeClient.js'
import { COMMAND_DRILLS } from '../../lab/commandDrills.js'
import { buildStudyObjectiveHandoff } from '../../study/studyObjectiveHandoff.js'
import { reconcileLearningMetrics } from './learningMetrics.js'

export default function MetricsDashboard({ progress, missed, dueCount = 0, onBack, onSelectObjective, onOpenReview, onOpenStats, onOpenTrapDrill, onOpenExamTraps }) {
  const [data, setData] = useState(null)
  const [openBankIds, setOpenBankIds] = useState(new Set())

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [summary, cli, offlineDetail, usage, retention, mockHistory, quizBank, events] = await Promise.all([
        buildLearnerSummary(progress, missed || []),
        loadCliStats(),
        loadOfflineDetail(),
        window.storage.getItem(STORAGE_KEYS.usage),
        loadRetentionHealth(),
        window.storage.getItem(STORAGE_KEYS.mockHistory),
        loadQuizBank(),
        window.storage.getItem(STORAGE_KEYS.events),
      ])
      if (!cancelled) setData({ summary, cli, offlineDetail, usage, retention, mockHistory: mockHistory || [], quizBank: quizBank || {}, learning: reconcileLearningMetrics(events || []) })
    })()
    return () => { cancelled = true }
  }, [progress, missed])

  if (!data) {
    return (
      <div>
        <StudyModeHeader title="Learner Metrics" onBack={onBack} />
        <Spinner label="Crunching your metrics..." />
      </div>
    )
  }

  const { summary, cli, offlineDetail, usage, retention, mockHistory, quizBank, learning } = data
  const objs = summary.perObjective
  const studied = objs.filter(o => o.attempts > 0)

  // ---- Mastery overview ----
  const overall = objs.reduce((s, o) => s + o.mastery, 0) / objs.length
  const masteredCount = objs.filter(o => o.status === 'mastered').length
  const offlineCount = Object.values(offlineDetail).filter(d => d.ready).length

  // ---- Weak areas ----
  const weak = [...studied].filter(o => o.status !== 'mastered').sort((a, b) => a.mastery - b.mastery).slice(0, 6)
  const missedTop = Object.entries(summary.missedByObj).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const ckuWeak = computeCkuWeakness(missed || []).slice(0, 6)
  const trapWeak = computeTrapWeakness(missed || []).slice(0, 5)

  // ---- Confidence vs accuracy ----
  const quads = { strong: [], reassure: [], hidden: [], priority: [] }
  studied.forEach(o => {
    const { acc, conf, has } = masteryBreakdown(progress[o.id])
    if (has) quads[quadrantOf(acc, conf)].push({ ...o, acc, conf })
  })
  const avgAcc = studied.length ? studied.reduce((s, o) => s + masteryBreakdown(progress[o.id]).acc, 0) / studied.length : 0
  const avgConf = studied.length ? studied.reduce((s, o) => s + masteryBreakdown(progress[o.id]).conf, 0) / studied.length : 0

  // ---- CLI skills ----
  const cliRows = Object.entries(cli).map(([id, s]) => {
    const o = ALL_OBJECTIVES.find(x => x.id === id)
    return { id, title: o ? o.title : id, ...s }
  }).sort((a, b) => (b.bestScore || 0) - (a.bestScore || 0))
  const cliTotals = cliRows.reduce((t, r) => ({
    runs: t.runs + (r.runs || 0), syntax: t.syntax + (r.syntaxErrors || 0), mode: t.mode + (r.wrongModeErrors || 0),
  }), { runs: 0, syntax: 0, mode: 0 })

  // ---- Review readiness ----
  const reviewCards = generateLocalSuggestions(summary, COMMAND_DRILLS)

  // ---- Offline unlock progress (topics 1-3 of 4 done) ----
  const offlineInProgress = ALL_OBJECTIVES
    .map(o => ({ o, d: offlineDetail[o.id] }))
    .filter(x => x.d.count > 0 && !x.d.ready)
    .sort((a, b) => b.d.count - a.d.count)
    .slice(0, 5)

  const studyNext = pickStudyNext(summary, dueCount)
  const coverageCurated = ALL_OBJECTIVES.filter(o => hasCuratedReading(o.id)).length
  const coverageLabs = ALL_OBJECTIVES.filter(o => labsForObjective(o.id).length > 0).length
  const retentionSummary = retention.length === 0
    ? 'No sections in spaced review yet'
    : `${retention.filter(r => r.state === 'strong').length} strong · ${retention.filter(r => r.state === 'fading').length} fading · ${retention.filter(r => r.state === 'weak').length} weak`
  const weakSummary = weak.length === 0
    ? 'Take quizzes to surface gaps'
    : `${weak[0].id} lowest at ${Math.round(weak[0].mastery * 100)}%`
  const overconfident = quads.hidden
  const underconfident = quads.reassure
  const confidenceReportSummary = studied.length === 0
    ? 'Answer questions to build your profile'
    : overconfident.length || underconfident.length
      ? `${overconfident.length} overconfident · ${underconfident.length} underconfident`
      : 'Well calibrated'
  const open = (o) => {
    const handoff = buildStudyObjectiveHandoff(o.id, { tab: o.__initialTab || 'Practice' })
    if (handoff) onSelectObjective(handoff)
  }
  const weakRowBtn = {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 0',
    fontFamily: 'inherit',
  }
  function handleCkuWeakClick(id) {
    const action = resolveCkuWeakAction(id, missed || [])
    if (action.kind === 'study') {
      const handoff = buildStudyObjectiveHandoff(action.payload.objectiveId, { tab: 'Practice' })
      if (handoff) onSelectObjective?.(handoff)
      return
    }
    onOpenTrapDrill?.(action.payload)
  }
  function handleTrapWeakClick(trap) {
    trapWeakTap(trap, missed || [], {
      onOpenTrapDrill,
      onOpenExamTraps,
      onStudyObjective: (objectiveId) => {
        const handoff = buildStudyObjectiveHandoff(objectiveId, { tab: 'Practice' })
        if (handoff) onSelectObjective?.(handoff)
      },
    })
  }
  const quadCell = (key, label, accent, hint) => (
    <div style={{ flex: '1 1 45%', background: accentColors(accent).dim, border: `1px solid ${accentColors(accent).border}`, borderRadius: 10, padding: 10 }}>
      <div style={{ fontSize: 'var(--ccna-type-xl)', fontWeight: 700, color: accentColors(accent).text }}>{quads[key].length}</div>
      <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, color: COLORS.silver }}>{label}</div>
      <div style={{ fontSize: 'var(--ccna-type-micro)', color: COLORS.silverMid, lineHeight: 1.3 }}>{hint}</div>
    </div>
  )

  return (
    <div>
      <StudyModeHeader title="Learner Metrics" onBack={onBack} />
      {onOpenStats && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
          <button
            type="button"
            onClick={onOpenStats}
            style={{
              flexShrink: 0, minHeight: 44, padding: '6px 12px', borderRadius: 999,
              border: `1px solid ${COLORS.border}`, background: COLORS.surface,
              color: COLORS.silverMid, fontSize: 'var(--ccna-type-caption)', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Stats →
          </button>
        </div>
      )}
      <div style={{ ...styles.small, marginBottom: 10 }}>Everything below is {STATIC_COPY.metrics}.</div>

      {studyNext && (
        <div className="ccna-safe-sticky-top" style={{ paddingBottom: 10, marginBottom: 4 }}>
          <StudyNextStrip next={studyNext} onSelectObjective={onSelectObjective} onOpenReview={onOpenReview} sticky />
        </div>
      )}

      <AiCallsIndicator />

      <MetricsCollapsibleSection
        title="QUESTION HEALTH — SADE QUARANTINE"
        summary="Compile-time distractor audit & auto-quarantine"
      >
        <QuestionHealthAdminSection showWhenClean embedded />
      </MetricsCollapsibleSection>

      <MetricsCollapsibleSection
        title="MASTERY OVERVIEW"
        summary={`${Math.round(overall * 100)}% course · ${masteredCount}/${objs.length} mastered`}
        defaultOpen
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <ProgressRing value={overall} size={84} accent="purple" caption="Course mastery" />
          <div style={{ flex: 1 }}>
            <div style={{ ...styles.small, marginBottom: 6 }}>{masteredCount}/{objs.length} objectives mastered · ⤓ {offlineCount} offline-ready</div>
            <ProgressBar value={masteredCount} max={objs.length} accent="mint" label="Mastered" sublabel={`${masteredCount}/${objs.length}`} height={7} />
            <ProgressBar value={studied.length} max={objs.length} accent="sky" label="Started" sublabel={`${studied.length}/${objs.length}`} height={7} />
          </div>
        </div>
        {summary.domainStats.map(d => (
          <ProgressBar key={d.id} value={d.avg} max={1} accent="purple" label={d.name} sublabel={`${Math.round(d.avg * 100)}% · ${d.mastered}/${d.total}`} height={6} />
        ))}
      </MetricsCollapsibleSection>

      <MetricsCollapsibleSection
        title="QUESTION + LAB ACTIVITY"
        summary={learning.questions.attempts === 0 && learning.labs.starts === 0
          ? 'Insufficient event data — complete a question or lab'
          : `${learning.questions.attempts} question attempts · ${learning.labs.completions}/${learning.labs.starts} labs completed`}
        defaultOpen
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
          {[
            ['Question accuracy', learning.questions.accuracy],
            ['First-try accuracy', learning.questions.firstTryAccuracy],
            ['Lab checkpoint success', learning.labs.checkpointAccuracy],
            ['Lab completion', learning.labs.completionRate],
          ].map(([label, value]) => (
            <div key={label} style={{ padding: 10, borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.surface }}>
              <div style={{ fontSize: 'var(--ccna-type-lg)', fontWeight: 700, color: value == null ? COLORS.silverMid : COLORS.sky }}>{value == null ? '—' : `${value}%`}</div>
              <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ ...styles.small, marginTop: 10 }}>
          {learning.questions.unknown} marked “I don’t know” · {learning.lessons.uniqueAnchorsViewed} lesson anchors viewed · {learning.remediation.opens} remediation opens
          {learning.excludedEvents > 0 ? ` · ${learning.excludedEvents} invalid, quarantined, or unsynced event${learning.excludedEvents === 1 ? '' : 's'} excluded` : ''}
        </div>
      </MetricsCollapsibleSection>

      <MetricsCollapsibleSection
        title="CONTENT COVERAGE"
        summary={`${coverageCurated}/${ALL_OBJECTIVES.length} curated · ${coverageLabs} with labs`}
      >
        <ContentCoverage onOpen={open} bare />
      </MetricsCollapsibleSection>

      {mockHistory.length > 0 && <MockHistorySection mockHistory={mockHistory} />}

      <RetentionHealthSection retention={retention} retentionSummary={retentionSummary} open={open} />

      <MetricsCollapsibleSection title="WEAK AREAS — IMPROVEMENT MAP" summary={weakSummary}>
        {weak.length === 0 && <div style={styles.small}>Take a few quizzes and your weakest topics will surface here.</div>}
        {weak.map(o => (
          <button key={o.id} onClick={() => open(o)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 4, fontFamily: 'inherit' }}>
            <ProgressBar value={o.mastery} max={1} accent="rose" label={`${o.id} ${o.title}`} sublabel={`${Math.round(o.mastery * 100)}%`} height={7} />
          </button>
        ))}
        {missedTop.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ ...styles.small, fontWeight: 600, marginBottom: 4 }}>Most-missed concepts</div>
            {missedTop.map(([id, n]) => {
              const o = ALL_OBJECTIVES.find(x => x.id === id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => o && open(o)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: o ? 'pointer' : 'default', padding: '4px 0', fontFamily: 'inherit' }}
                >
                  <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>
                    {id} {o ? o.title : ''} — <span style={{ color: COLORS.rose }}>missed {n}×</span>
                  </span>
                </button>
              )
            })}
          </div>
        )}
        {ckuWeak.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ ...styles.small, fontWeight: 600, marginBottom: 4 }}>Weak CKUs (from missed bank)</div>
            {ckuWeak.map(({ id, count }) => {
              const actionable = !!(onOpenTrapDrill || onSelectObjective)
              return (
                <button
                  key={id}
                  type="button"
                  disabled={!actionable}
                  onClick={() => handleCkuWeakClick(id)}
                  style={{ ...weakRowBtn, cursor: actionable ? 'pointer' : 'default' }}
                >
                  <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>
                    {id} — <span style={{ color: COLORS.amber }}>missed {count}×</span>
                  </span>
                </button>
              )
            })}
          </div>
        )}
        {trapWeak.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ ...styles.small, fontWeight: 600, marginBottom: 4 }}>Repeated exam traps</div>
            {trapWeak.map(({ trap, count }) => {
              const actionable = !!(onOpenTrapDrill || onOpenExamTraps || onSelectObjective)
              return (
              <button
                key={trap}
                type="button"
                disabled={!actionable}
                onClick={() => handleTrapWeakClick(trap)}
                style={{ ...weakRowBtn, cursor: actionable ? 'pointer' : 'default' }}
              >
                <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>
                  {trap} — <span style={{ color: COLORS.amber }}>{count}×</span>
                </span>
              </button>
              )
            })}
          </div>
        )}
      </MetricsCollapsibleSection>

      <MetricsCollapsibleSection
        title="CONFIDENCE vs ACCURACY"
        summary={`Accuracy ${Math.round(avgAcc * 100)}% · Confidence ${Math.round(avgConf * 100)}%`}
      >
        <ProgressBar value={avgAcc} max={1} accent="sky" label="Avg accuracy" sublabel={`${Math.round(avgAcc * 100)}%`} height={7} />
        <ProgressBar value={avgConf} max={1} accent="mint" label="Avg confidence" sublabel={`${Math.round(avgConf * 100)}%`} height={7} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {quadCell('strong', 'Strong mastery', 'mint', 'High accuracy + confidence')}
          {quadCell('hidden', 'Hidden weakness', 'rose', 'Confident but inaccurate — priority')}
          {quadCell('reassure', 'Needs reassurance', 'sky', 'Accurate but unsure')}
          {quadCell('priority', 'Priority review', 'purple', 'Low accuracy + confidence')}
        </div>
        {quads.hidden.length > 0 && (
          <div style={{ ...styles.small, marginTop: 8, color: COLORS.rose }}>
            Hidden weakness: {quads.hidden.slice(0, 3).map(o => `${o.id}`).join(', ')} — you feel confident but accuracy is low. Re-quiz these.
          </div>
        )}
      </MetricsCollapsibleSection>

      <MetricsCollapsibleSection title="🎯 CONFIDENCE REPORT" summary={confidenceReportSummary}>
        {studied.length === 0 ? (
          <div style={styles.small}>Keep studying — your calibration profile builds as you answer questions.</div>
        ) : (
          <>
            {overconfident.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.rose, marginBottom: 6 }}>You overestimate your knowledge on:</div>
                {overconfident.map(o => (
                  <button key={o.id} onClick={() => open(o)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', padding: '6px 0', borderTop: `1px solid ${COLORS.border}`, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                    <span style={{ fontSize: 'var(--ccna-type-md)' }}>⚠️</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <OverflowMarquee text={`${o.id} ${o.title}`} style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver }} />
                      <span style={{ display: 'block', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginTop: 2 }}>Accuracy {Math.round(o.acc * 100)}% · Confidence {Math.round(o.conf * 100)}%</span>
                    </span>
                    <span style={{ ...styles.pill('rose'), fontSize: 'var(--ccna-type-micro)' }}>Overconfident</span>
                  </button>
                ))}
              </div>
            )}
            {underconfident.length > 0 && (
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.sky, marginBottom: 6 }}>You know more than you think about:</div>
                {underconfident.map(o => (
                  <button key={o.id} onClick={() => open(o)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', padding: '6px 0', borderTop: `1px solid ${COLORS.border}`, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                    <span style={{ fontSize: 'var(--ccna-type-md)' }}>💪🏾</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <OverflowMarquee text={`${o.id} ${o.title}`} style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver }} />
                      <span style={{ display: 'block', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginTop: 2 }}>Accuracy {Math.round(o.acc * 100)}% · Confidence {Math.round(o.conf * 100)}%</span>
                    </span>
                    <span style={{ ...styles.pill('sky'), fontSize: 'var(--ccna-type-micro)' }}>Trust yourself</span>
                  </button>
                ))}
              </div>
            )}
            {overconfident.length === 0 && underconfident.length === 0 && (
              <div style={styles.small}>Your confidence and accuracy are well-calibrated. Keep it up!</div>
            )}
          </>
        )}
      </MetricsCollapsibleSection>

      <MetricsCollapsibleSection
        title="CISCO CLI SKILLS"
        summary={cliRows.length === 0 ? 'No CLI labs completed yet' : `${cliRows.length} objectives · ${cliTotals.runs} lab${cliTotals.runs === 1 ? '' : 's'}`}
      >
        {cliRows.length === 0 && <div style={styles.small}>Complete a CLI lab to start tracking command skills.</div>}
        {cliRows.map(r => (
          <ProgressBar key={r.id} value={(r.bestScore || 0) / 100} max={1} accent="sky" label={`${r.id} ${r.title}`} sublabel={`${r.bestScore || 0}%`} height={7} />
        ))}
        {cliRows.length > 0 && (
          <div style={{ ...styles.small, marginTop: 6 }}>
            {cliTotals.runs} lab{cliTotals.runs === 1 ? '' : 's'} completed · {cliTotals.syntax} syntax error{cliTotals.syntax === 1 ? '' : 's'} · {cliTotals.mode} wrong-mode error{cliTotals.mode === 1 ? '' : 's'}
          </div>
        )}
      </MetricsCollapsibleSection>

      <MetricsCollapsibleSection
        title="REVIEW READINESS QUEUE"
        summary={reviewCards.length === 0 ? 'All caught up' : `${reviewCards.length} suggestion${reviewCards.length === 1 ? '' : 's'} · ${reviewCards[0].chip}`}
      >
        {reviewCards.length === 0 && <div style={styles.small}>You're all caught up. Start a new topic to populate your queue.</div>}
        {reviewCards.map(s => (
          <button key={s.key} onClick={() => onSelectObjective({ ...s.objective, __initialTab: s.tab })} style={{ display: 'block', width: '100%', textAlign: 'left', background: accentColors(s.accent).dim, border: `1px solid ${accentColors(s.accent).border}`, borderRadius: 10, padding: 10, marginBottom: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
            <span style={{ ...styles.pill(s.accent), fontSize: 'var(--ccna-type-micro)' }}>{s.chip}</span>
            <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.silver, margin: '4px 0 2px' }}>{s.title}</div>
            <div style={{ ...styles.small, lineHeight: 1.4 }}>{s.body}</div>
          </button>
        ))}
      </MetricsCollapsibleSection>

      <MetricsCollapsibleSection
        title="OFFLINE UNLOCK PROGRESS"
        summary={`${offlineCount} offline-ready · ${offlineInProgress.length} in progress`}
      >
        <div style={{ ...styles.small, marginBottom: 10 }}>{offlineCount} topic{offlineCount === 1 ? '' : 's'} fully offline-ready. Closest to unlocking:</div>
        {offlineInProgress.length === 0 && <div style={styles.small}>Open a topic's tabs (or tap "Make available offline") to start downloading assets.</div>}
        {offlineInProgress.map(({ o, d }) => (
          <div key={o.id} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4, minWidth: 0 }}>
              <OverflowMarquee text={`${o.id} ${o.title}`} style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silver }} />
              <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.mint, fontWeight: 600, flexShrink: 0 }}>{d.count} of 4</span>
            </div>
            <SegmentedBar segments={d.reqs} accent="mint" />
          </div>
        ))}
      </MetricsCollapsibleSection>

      <BankedQuestionsSection quizBank={quizBank} openBankIds={openBankIds} setOpenBankIds={setOpenBankIds} />

      <AiUsageSection usage={usage} />
    </div>
  )
}
