import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import { STORAGE_KEYS } from '../../storageKeys.js'
import { getCurated } from '../../data/ccnaCurated.js'
import { BOOK_REF } from '../../data/bookRefFull.js'
import { askClaudeJSON, MODELS, VISUAL_SCHEMA } from '../../ai/claudeClient.js'
import { PREMIUM_FEATURES, PREMIUM_COMING_SOON_LABEL } from '../../premium/premiumFeatures.js'
import { logEvent } from '../../eventLog.js'
import CuratedVisualBundle from '../../components/CuratedVisualBundle.jsx'
import VisualAidRender from '../../components/VisualAidRender.jsx'
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

export { VisualAidRender }

function CuratedVisualAid({ data }) {
  return <CuratedVisualBundle data={data} showBadge />
}

export default function VisualAidTab({ objective, premiumUnlocked, onPremiumBlocked }) {
  const [spec, setSpec] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const curatedData = useMemo(() => getCurated(objective.id), [objective.id])
  const hasCuratedVisual = !!(
    curatedData?.diagram
    || curatedData?.visualCompare
    || curatedData?.visualTraps?.length
    || curatedData?.packetFlow?.steps?.length
  )

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
