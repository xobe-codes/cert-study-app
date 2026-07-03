import { STORAGE_KEYS } from '../../storageKeys.js'

const MAX_MESSAGES = 48

/** @typedef {{ role: 'user' | 'assistant', content: string }} MockInterviewMessage */

/** @returns {Promise<MockInterviewMessage[]>} */
export async function loadMockInterviewChat() {
  try {
    const saved = await window.storage.getItem(STORAGE_KEYS.mockInterviewChat)
    if (!Array.isArray(saved)) return []
    return saved
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-MAX_MESSAGES)
  } catch {
    return []
  }
}

/** @param {MockInterviewMessage[]} messages */
export async function saveMockInterviewChat(messages) {
  const trimmed = (messages || [])
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_MESSAGES)
  await window.storage.setItem(STORAGE_KEYS.mockInterviewChat, trimmed)
  return trimmed
}

export async function clearMockInterviewChat() {
  await window.storage.setItem(STORAGE_KEYS.mockInterviewChat, [])
}
