import { ALL_OBJECTIVES } from '../../data/ccnaDomains.js'
import { EXPLAIN_CACHE_KEY } from '../../tabs/studyConstants.js'
import { STORAGE_KEYS } from '../../storageKeys.js'
import { loadQuizBank, QUIZ_BANK_MIN } from '../../quiz/quizBankStorage.js'

const TERMS_CACHE_KEY = 'ccna_terms_cache_v1'

export async function loadOfflineDetail() {
  const [ex, tm, vs, bank] = await Promise.all([
    window.storage.getItem(EXPLAIN_CACHE_KEY),
    window.storage.getItem(TERMS_CACHE_KEY),
    window.storage.getItem(STORAGE_KEYS.visualCache),
    loadQuizBank(),
  ])
  const map = {}
  ALL_OBJECTIVES.forEach(o => {
    const reqs = [
      { label: 'Explanation', done: !!(ex && ex[o.id]) },
      { label: 'Key terms', done: !!(tm && tm[o.id]) },
      { label: 'Visual aid', done: !!(vs && vs[o.id]) },
      { label: 'Quiz bank', done: (bank[o.id] || []).length >= QUIZ_BANK_MIN },
    ]
    const count = reqs.filter(r => r.done).length
    map[o.id] = { reqs, count, ready: count === 4 }
  })
  return map
}
