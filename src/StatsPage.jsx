import React, { useEffect, useState } from 'react'
import { COLORS, accentColors, styles } from './ui/appTheme.js'
import { STORAGE_KEYS } from './storageKeys.js'
import StatsComboChart from './components/StatsComboChart.jsx'
import ProgressRing from './components/ProgressRing.jsx'
import Spinner from './components/Spinner.jsx'
import { STATS_RANGES, buildComboStatsSeries } from './stats/statsSeries.js'

function StatMiniCard({ icon, label, value, sub, accent = 'purple' }) {
  const c = accentColors(accent)
  return (
    <div className="stats-mini-card" style={{
      flex: '1 1 30%',
      minWidth: 96,
      background: c.dim,
      border: `1px solid ${c.border}`,
      borderRadius: 14,
      padding: '12px 10px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 'var(--ccna-type-lg)', marginBottom: 4 }} aria-hidden="true">{icon}</div>
      <div style={{ fontSize: 'var(--ccna-type-caption)', color: COLORS.silverMid, fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 'var(--ccna-type-xl)', fontWeight: 700, color: c.text, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: 'var(--ccna-type-caption)', color: COLORS.silverMid, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function SummaryTile({ icon, label, value, accent = 'purple' }) {
  const c = accentColors(accent)
  return (
    <div className="stats-summary-tile" style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 14,
      padding: '12px 14px',
      boxShadow: COLORS.cardShadow,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: c.dim, border: `1px solid ${c.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 'var(--ccna-type-lg)', flexShrink: 0,
      }} aria-hidden="true">{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 'var(--ccna-type-caption)', color: COLORS.silverMid, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 'var(--ccna-type-2xl)', fontWeight: 700, color: COLORS.silver, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      </div>
    </div>
  )
}

export default function StatsPage({ progress, streak, onBack, onOpenMetrics }) {
  const [rangeId, setRangeId] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [mockHistory, setMockHistory] = useState([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [ev, mock] = await Promise.all([
        window.storage.getItem(STORAGE_KEYS.events),
        window.storage.getItem(STORAGE_KEYS.mockHistory),
      ])
      if (!cancelled) {
        setEvents(ev || [])
        setMockHistory(mock || [])
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div>
        <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <Spinner label="Loading your stats..." />
      </div>
    )
  }

  const series = buildComboStatsSeries({ progress, events, mockHistory, rangeId })
  const { points, barMax, summary, trend } = series
  const trendLabel = trend == null
    ? '—'
    : `${trend > 0 ? '+' : ''}${trend}pp`

  return (
    <div className="stats-page">
      <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
        <div>
          <h1 style={{ ...styles.h1, margin: 0 }}>Stats</h1>
          <p style={{ ...styles.small, margin: '4px 0 0' }}>Trends over time — bars are daily questions, line is exam readiness.</p>
        </div>
        <button
          type="button"
          onClick={onOpenMetrics}
          style={{
            flexShrink: 0, minHeight: 36, padding: '6px 12px', borderRadius: 999,
            border: `1px solid ${COLORS.border}`, background: COLORS.surface,
            color: COLORS.silverMid, fontSize: 'var(--ccna-type-caption)', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Metrics →
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <SummaryTile icon="📈" label="Exam readiness" value={`${summary.readiness}%`} accent="purple" />
        <SummaryTile icon="✓" label="Mastered" value={`${summary.mastered}/${summary.total}`} accent="mint" />
      </div>

      <div className="stats-range-row" style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {Object.values(STATS_RANGES).map(r => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRangeId(r.id)}
            aria-pressed={rangeId === r.id}
            style={{
              minHeight: 36, padding: '0 14px', borderRadius: 999, fontFamily: 'inherit',
              fontSize: 'var(--ccna-type-caption)', fontWeight: 600, cursor: 'pointer',
              border: `1px solid ${rangeId === r.id ? COLORS.purpleGlow : COLORS.border}`,
              background: rangeId === r.id ? COLORS.purpleDim : COLORS.surface,
              color: rangeId === r.id ? COLORS.purpleGlow : COLORS.silverMid,
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="stats-chart-card" style={{
        ...styles.card,
        padding: '14px 12px 10px',
        marginBottom: 12,
        background: `linear-gradient(160deg, color-mix(in srgb, ${COLORS.purpleDim} 40%, ${COLORS.card}) 0%, ${COLORS.card} 55%)`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.silver }}>Study trend</div>
          <div style={{ display: 'flex', gap: 10, fontSize: 'var(--ccna-type-caption)', color: COLORS.silverMid }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: COLORS.purpleM, marginRight: 4, verticalAlign: 'middle' }} />Questions</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 2, background: COLORS.purpleGlow, marginRight: 4, verticalAlign: 'middle' }} />Readiness</span>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 99, background: COLORS.brand, marginRight: 4, verticalAlign: 'middle' }} />Mock</span>
          </div>
        </div>
        <StatsComboChart
          points={points}
          barMax={barMax}
          lineMax={100}
          height={210}
          barLabel="Questions"
          lineLabel="Readiness"
          referenceLine={70}
        />
        {trend != null && (
          <div style={{ ...styles.small, marginTop: 6, textAlign: 'center' }}>
            Readiness change this period: <strong style={{ color: trend >= 0 ? COLORS.mint : COLORS.rose }}>{trendLabel}</strong>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <StatMiniCard
          icon="❓"
          label="Questions"
          value={summary.totalQuestions}
          sub="in range"
          accent="sky"
        />
        <StatMiniCard
          icon="🎯"
          label="Quiz avg"
          value={summary.avgQuizAcc != null ? `${summary.avgQuizAcc}%` : '—'}
          sub="daily sessions"
          accent="purple"
        />
        <StatMiniCard
          icon="📝"
          label="Mock avg"
          value={summary.avgMock != null ? `${summary.avgMock}%` : '—'}
          sub={summary.mockAttempts ? `${summary.mockAttempts} attempt${summary.mockAttempts === 1 ? '' : 's'}` : 'no mocks yet'}
          accent="brand"
        />
      </div>

      <div className="stats-bottom-bar" style={{
        borderRadius: 16,
        padding: '16px 18px',
        background: `linear-gradient(135deg, ${COLORS.purpleM} 0%, ${COLORS.brandM} 55%, ${COLORS.brand} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
      }}>
        <div>
          <div style={{ fontSize: 'var(--ccna-type-caption)', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>Current streak</div>
          <div style={{ fontSize: 'var(--ccna-type-display)', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>
            {streak?.count || 0}
            <span style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginLeft: 6 }}>day{(streak?.count || 0) === 1 ? '' : 's'}</span>
          </div>
        </div>
        <ProgressRing value={summary.readiness / 100} size={64} stroke={6} accent="mint" />
      </div>
    </div>
  )
}
