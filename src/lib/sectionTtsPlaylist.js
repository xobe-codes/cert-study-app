/**
 * Spec 10 — section TTS playlist (section-only speak + optional auto-advance).
 */
import { isTtsSupported, speak, stopSpeaking } from './browserTts.js'

/**
 * @param {Array<{ id: string, text: string }>} sections
 * @param {{ onActiveSectionChange?: (id: string|null) => void, onEnd?: () => void, autoAdvance?: boolean, rate?: number }} opts
 */
export function createSectionTtsPlaylist(sections = [], opts = {}) {
  const list = (sections || []).filter(s => s?.id && String(s.text || '').trim())
  let index = -1
  let autoAdvance = !!opts.autoAdvance
  let speaking = false

  function emitActive(id) {
    opts.onActiveSectionChange?.(id)
  }

  function playAt(i) {
    if (!isTtsSupported() || i < 0 || i >= list.length) {
      speaking = false
      index = -1
      emitActive(null)
      opts.onEnd?.()
      return
    }
    index = i
    speaking = true
    const section = list[i]
    emitActive(section.id)
    stopSpeaking()
    speak(section.text, {
      rate: opts.rate ?? 0.95,
      onEnd: () => {
        speaking = false
        if (autoAdvance && index >= 0 && index < list.length - 1) {
          playAt(index + 1)
        } else {
          emitActive(null)
          opts.onEnd?.()
        }
      },
      onError: () => {
        speaking = false
        emitActive(null)
      },
    })
  }

  return {
    sections: list,
    isSupported: () => isTtsSupported(),
    setAutoAdvance(v) { autoAdvance = !!v },
    getAutoAdvance: () => autoAdvance,
    getActiveId: () => (index >= 0 ? list[index]?.id : null),
    isSpeaking: () => speaking,
    playSection(id) {
      const i = list.findIndex(s => s.id === id)
      if (i < 0) return false
      playAt(i)
      return true
    },
    toggle(id) {
      if (speaking && list[index]?.id === id) {
        this.pause()
        return 'paused'
      }
      this.playSection(id)
      return 'playing'
    },
    pause() {
      stopSpeaking()
      speaking = false
      emitActive(null)
    },
    playNext() {
      if (index < 0) playAt(0)
      else playAt(index + 1)
    },
    stop() {
      this.pause()
      index = -1
    },
  }
}
