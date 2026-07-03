import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import { STORAGE_KEYS } from '../../storageKeys.js'
import { getCurated } from '../../data/ccnaCurated.js'
import { BOOK_REF } from '../../data/bookRefFull.js'
import { askClaudeJSON, MODELS, VISUAL_SCHEMA } from '../../ai/claudeClient.js'
import { PREMIUM_FEATURES, PREMIUM_COMING_SOON_LABEL } from '../../premium/premiumFeatures.js'
import { logEvent } from '../../eventLog.js'
import CuratedDiagram from '../../components/CuratedDiagram.jsx'
import CuratedStaticBadge from '../../components/CuratedStaticBadge.jsx'
import Spinner from '../../components/Spinner.jsx'
import ErrorBox from '../../components/ErrorBox.jsx'

const VISUAL_CACHE_KEY = STORAGE_KEYS.visualCache
const VISUAL_PROMPT_SYSTEM = `You are a CCNA 200-301 visual-aid designer. Produce ONE minimalistic visual aid that teaches the core of this objective at a glance. Choose the single template type that best fits the concept. Use the provided reference notes as your primary source; you may add accurate CCNA 200-301 detail consistent with the notes.

Respond with ONLY valid JSON (no markdown fences, no commentary) using EXACTLY ONE of these shapes:
- A CLI/config or ordered procedure:
  {"type":"command_sequence","title":"...","steps":["...","..."]}
- Two things contrasted:
  {"type":"comparison","title":"...","left":{"label":"...","points":["..."]},"right":{"label":"...","points":["..."]}}
- A layered model or stack (order top to bottom):
  {"type":"layer_stack","title":"...","layers":[{"label":"...","note":"..."}]}
- A process or packet/decision flow (order first to last):
  {"type":"flow","title":"...","steps":["...","..."]}

Keep it tight: 3-6 steps/points/layers, each a short phrase. Pick the type that genuinely matches the concept (e.g. command_sequence for config tasks, comparison for A-vs-B topics, layer_stack for models, flow for processes like DORA or STP states).`

function VisualBadge({ children, accent }) {
  const c = accent || COLORS.purpleGlow
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 22, height: 22, borderRadius: 6, fontSize: 'var(--ccna-type-xs)', fontWeight: 700,
      background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: c, padding: '0 6px',
    }}>{children}</span>
  )
}

export function VisualAidRender({ spec }) {
  if (!spec || !spec.type) return null
  const frame = { ...styles.card, border: `1px solid ${COLORS.skyBorder}`, background: COLORS.skyDim }
  const titleStyle = { fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: COLORS.sky, marginBottom: 12, letterSpacing: 0.2 }

  if (spec.type === 'command_sequence' || spec.type === 'flow') {
    const horizontal = spec.type === 'flow'
    const steps = spec.steps || []
    return (
      <div style={frame}>
        <div style={titleStyle}>{spec.title}</div>
        <div style={{ display: 'flex', flexDirection: horizontal ? 'row' : 'column', flexWrap: horizontal ? 'wrap' : 'nowrap', gap: 8, alignItems: horizontal ? 'stretch' : 'stretch' }}>
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, flex: horizontal ? '1 1 auto' : 'none',
                background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '8px 10px',
              }}>
                <VisualBadge accent={COLORS.sky}>{i + 1}</VisualBadge>
                <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, fontFamily: horizontal ? 'inherit' : 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ alignSelf: 'center', color: COLORS.silverMid, fontSize: 'var(--ccna-type-md)', lineHeight: 1 }}>
                  {horizontal ? '→' : '↓'}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  if (spec.type === 'comparison') {
    const col = (side, accent, dim, border) => (
      <div style={{ flex: '1 1 0', minWidth: 0, background: dim, border: `1px solid ${border}`, borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: accent, marginBottom: 8 }}>{side?.label}</div>
        {(side?.points || []).map((p, i) => (
          <div key={i} style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silver, lineHeight: 1.45, marginBottom: 4, display: 'flex', gap: 6 }}>
            <span style={{ color: accent }}>•</span><span>{p}</span>
          </div>
        ))}
      </div>
    )
    return (
      <div style={frame}>
        <div style={titleStyle}>{spec.title}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {col(spec.left, COLORS.mint, COLORS.mintDim, COLORS.mintBorder)}
          {col(spec.right, COLORS.purpleGlow, COLORS.purpleDim, COLORS.borderGlow)}
        </div>
      </div>
    )
  }

  if (spec.type === 'layer_stack') {
    const layers = spec.layers || []
    return (
      <div style={frame}>
        <div style={titleStyle}>{spec.title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {layers.map((l, i) => (
            <div key={i} style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8,
              padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <VisualBadge accent={COLORS.purpleGlow}>{layers.length - i}</VisualBadge>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.silver }}>{l.label}</div>
                {l.note && <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.4 }}>{l.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

function CuratedPacketFlow({ data }) {
  const pf = data?.packetFlow
  if (!pf?.steps?.length) return null
  return (
    <div style={{ ...styles.card, border: `1px solid ${COLORS.mintBorder}`, background: COLORS.mintDim, marginTop: 8, marginBottom: 12 }}>
      <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: COLORS.mint, marginBottom: 10 }}>{pf.title}</div>
      {pf.steps.map((s, i) => (
        <div key={s.id} style={{ display: 'flex', gap: 8, marginBottom: i < pf.steps.length - 1 ? 8 : 0, alignItems: 'flex-start' }}>
          <VisualBadge accent={COLORS.mint}>{s.order}</VisualBadge>
          <div>
            <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, color: COLORS.silver }}>{s.title}</div>
            <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.45 }}>{s.action}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CuratedVisualAid({ data }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        <CuratedStaticBadge objectiveId={data.objectiveId} fontSize={10} />
      </div>
      {data.diagram && <CuratedDiagram diagram={data.diagram} />}
      <CuratedPacketFlow data={data} />
    </div>
  )
}

export default function VisualAidTab({ objective, premiumUnlocked, onPremiumBlocked }) {
  const [spec, setSpec] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const curatedData = useMemo(() => getCurated(objective.id), [objective.id])
  const hasCuratedVisual = !!curatedData?.diagram

  const fetchVisual = useCallback(async (force) => {
    if (!premiumUnlocked) {
      onPremiumBlocked?.(PREMIUM_FEATURES.ai_visual, 'visual_tab')
      return
    }
    setLoading(true)
    setError(null)
    try {
      if (!force) {
        const cache = (await window.storage.getItem(VISUAL_CACHE_KEY)) || {}
        if (cache[objective.id]) {
          setSpec(cache[objective.id])
          setLoading(false)
          logEvent('user_viewed_visual_aid', { objectiveId: objective.id, cached: true })
          return
        }
      }
      const refNotes = BOOK_REF[objective.id] || ''
      const data = await askClaudeJSON({
        system: VISUAL_PROMPT_SYSTEM,
        messages: [{
          role: 'user',
          content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}\n\nDesign one visual aid for this objective.`,
        }],
        max_tokens: 700,
        model: MODELS.fast,
        schema: VISUAL_SCHEMA,
        toolName: 'emit_visual',
        feature: 'visual',
      })
      if (!data || !data.type) throw new Error('Claude returned an unexpected format. Please try again.')
      setSpec(data)
      const cache = (await window.storage.getItem(VISUAL_CACHE_KEY)) || {}
      cache[objective.id] = data
      await window.storage.setItem(VISUAL_CACHE_KEY, cache)
      logEvent('user_viewed_visual_aid', { objectiveId: objective.id, cached: false, type: data.type })
    } catch (err) {
      setError(err.message.includes('JSON') ? 'Claude returned an unexpected format. Please try again.' : err.message)
    } finally {
      setLoading(false)
    }
  }, [objective.id, objective.title, premiumUnlocked, onPremiumBlocked])

  useEffect(() => {
    setSpec(null)
    setError(null)
    if (hasCuratedVisual) {
      setLoading(false)
      logEvent('user_viewed_visual_aid', { objectiveId: objective.id, cached: true, curated: true })
      return
    }
    if (!premiumUnlocked) {
      setLoading(false)
      return
    }
    fetchVisual(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objective.id, hasCuratedVisual, premiumUnlocked])

  return (
    <div>
      {hasCuratedVisual && <CuratedVisualAid data={curatedData} />}
      {!hasCuratedVisual && !premiumUnlocked && (
        <div style={{ ...styles.card, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.silver, marginBottom: 6 }}>
            No bundled diagram for this topic
          </div>
          <p style={{ ...styles.small, margin: 0, lineHeight: 1.45 }}>
            {PREMIUM_COMING_SOON_LABEL} — custom AI visuals will return with supporter access.
          </p>
        </div>
      )}
      {!hasCuratedVisual && premiumUnlocked && loading && <Spinner label="Building visual aid..." />}
      {!hasCuratedVisual && premiumUnlocked && error && <ErrorBox message={error} onRetry={() => fetchVisual(true)} />}
      {!hasCuratedVisual && premiumUnlocked && spec && !loading && <VisualAidRender spec={spec} />}
      {!loading && premiumUnlocked && (hasCuratedVisual || spec) && (
        <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={() => fetchVisual(true)}>
          {hasCuratedVisual ? 'Generate AI visual instead' : 'Regenerate visual'}
        </button>
      )}
    </div>
  )
}
