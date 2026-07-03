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

export function stopSpeaking() {
  if (!isTtsSupported()) return
  window.speechSynthesis.cancel()
  activeUtterance = null
}

export function isSpeaking() {
  return isTtsSupported() && window.speechSynthesis.speaking
}

/**
 * Read text aloud via browser speechSynthesis (#38).
 * @returns {boolean} false when unsupported or empty after strip
 */
export function speak(text, { rate = 1, onEnd, onError } = {}) {
  if (!isTtsSupported()) return false
  const plain = stripMarkdownForSpeech(text)
  if (!plain) return false
  stopSpeaking()
  const utterance = new SpeechSynthesisUtterance(plain)
  utterance.rate = rate
  activeUtterance = utterance
  if (onEnd) utterance.onend = onEnd
  if (onError) utterance.onerror = onError
  window.speechSynthesis.speak(utterance)
  return true
}
