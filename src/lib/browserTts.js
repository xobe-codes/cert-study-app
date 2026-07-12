/** Strip markdown so browser TTS reads plain prose. */
export function stripMarkdownForSpeech(text) {
  if (!text) return ''
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isTtsSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

let activeUtterance = null
let speakTimer = null
let voicesReady = false

function ensureVoices() {
  if (!isTtsSupported() || voicesReady) return
  const voices = window.speechSynthesis.getVoices?.() || []
  if (voices.length) voicesReady = true
  if (typeof window.speechSynthesis.addEventListener === 'function') {
    window.speechSynthesis.addEventListener('voiceschanged', () => { voicesReady = true }, { once: true })
  }
}

export function stopSpeaking() {
  if (!isTtsSupported()) return
  if (speakTimer) {
    clearTimeout(speakTimer)
    speakTimer = null
  }
  try {
    window.speechSynthesis.cancel()
  } catch {
    /* ignore */
  }
  activeUtterance = null
}

export function isSpeaking() {
  return isTtsSupported() && window.speechSynthesis.speaking
}

/**
 * Read text aloud via browser speechSynthesis.
 * Chrome often drops speak() right after cancel() — defer slightly and accept onend aliases.
 * @returns {boolean} false when unsupported or empty after strip
 */
export function speak(text, { rate = 1, onEnd, onError, onend, onerror } = {}) {
  if (!isTtsSupported()) return false
  const plain = stripMarkdownForSpeech(text)
  if (!plain) return false
  ensureVoices()

  const endCb = onEnd || onend
  const errCb = onError || onerror

  stopSpeaking()

  const start = () => {
    if (!isTtsSupported()) return
    // Chrome bug: cancel leaves synth paused
    try {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume()
    } catch {
      /* ignore */
    }
    const utterance = new SpeechSynthesisUtterance(plain)
    utterance.rate = rate
    activeUtterance = utterance
    if (endCb) {
      utterance.onend = (ev) => {
        if (activeUtterance === utterance) activeUtterance = null
        endCb(ev)
      }
    }
    if (errCb) {
      utterance.onerror = (ev) => {
        if (activeUtterance === utterance) activeUtterance = null
        errCb(ev)
      }
    }
    window.speechSynthesis.speak(utterance)
  }

  // Defer so cancel() fully settles (Chrome)
  speakTimer = setTimeout(() => {
    speakTimer = null
    start()
  }, 40)

  return true
}
