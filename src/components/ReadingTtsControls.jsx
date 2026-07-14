import React, { useState, useEffect } from 'react'
import { styles } from '../ui/appTheme.js'
import { STORAGE_KEYS } from '../storageKeys.js'
import { isTtsSupported, speak, stopSpeaking, isSpeaking } from '../lib/browserTts.js'

/** One-shot listen control for a lesson section. */
export function SectionListenButton({ speechText, label = 'Listen', onListen }) {
  const canSpeak = Boolean(String(speechText || '').trim()) || typeof onListen === 'function'
  if (!isTtsSupported() || !canSpeak) return null

  return (
    <button
      type="button"
      aria-label={`${label} to this section`}
      onClick={(e) => {
        e.stopPropagation()
        if (typeof onListen === 'function') {
          onListen()
          // Fallback: if playlist doesn't play (empty sections), speak directly
          setTimeout(() => {
            if (!isSpeaking() && speechText) {
              stopSpeaking()
              speak(speechText, { rate: 0.95 })
            }
          }, 150)
          return
        }
        stopSpeaking()
        speak(speechText, { rate: 0.95 })
      }}
      style={{
        ...styles.secondaryBtn,
        width: 'auto',
        minHeight: 28,
        padding: '2px 8px',
        fontSize: 'var(--ccna-type-micro)',
        marginLeft: 6,
      }}
    >
      {label}
    </button>
  )
}

/**
 * Toggle + manual listen for lesson reading (curated or AI).
 * Persists preference; auto-reads when enabled and speechText changes.
 */
export function ReadingTtsControls({ speechText }) {
  const [enabled, setEnabled] = useState(false)
  const [ready, setReady] = useState(false)
  const canSpeak = Boolean(String(speechText || '').trim())

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [saved, reduceMotion] = await Promise.all([
          window.storage?.getItem(STORAGE_KEYS.readingTtsEnabled),
          window.storage?.getItem(STORAGE_KEYS.reduceMotion),
        ])
        if (!cancelled && saved && !reduceMotion) setEnabled(true)
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => () => stopSpeaking(), [])

  useEffect(() => {
    if (!ready) return
    window.storage?.setItem(STORAGE_KEYS.readingTtsEnabled, enabled || null)
  }, [enabled, ready])

  useEffect(() => {
    if (!enabled || !canSpeak) return
    stopSpeaking()
    const timer = setTimeout(() => speak(speechText, { rate: 0.95 }), 150)
    return () => clearTimeout(timer)
  }, [enabled, speechText, canSpeak])

  if (!isTtsSupported()) return null

  function toggle() {
    if (enabled) stopSpeaking()
    setEnabled(v => !v)
  }

  function listenNow() {
    if (!canSpeak) return
    stopSpeaking()
    speak(speechText, { rate: 0.95 })
  }

  return (
    <div
      role="group"
      aria-label="Read lesson aloud"
      style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}
    >
      <button
        type="button"
        aria-pressed={enabled}
        style={{ ...styles.secondaryBtn, width: 'auto', minHeight: 36, padding: '6px 14px', fontSize: 'var(--ccna-type-xs)' }}
        onClick={toggle}
      >
        {enabled ? '🔊 Read aloud on' : '🔈 Read aloud off'}
      </button>
      <button
        type="button"
        aria-label="Listen to this lesson now"
        disabled={!canSpeak}
        style={{ ...styles.secondaryBtn, width: 'auto', minHeight: 36, padding: '6px 14px', fontSize: 'var(--ccna-type-xs)', opacity: canSpeak ? 1 : 0.5 }}
        onClick={listenNow}
      >
        Listen now
      </button>
    </div>
  )
}
