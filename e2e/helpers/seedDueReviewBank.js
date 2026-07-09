/** Seed quiz bank entries due for Daily Review — works in preview (no /src imports). */
export async function seedDueReviewBank(page, objectiveId, questions, { dueAt = 0 } = {}) {
  await page.evaluate(async ({ objectiveId: objId, questions: qs, dueAt: due }) => {
    const bank = (await window.storage.getItem('ccna_quiz_bank_v1')) || {}
    const existing = bank[objId] || []
    const norm = (t) => (t || '').trim().toLowerCase().replace(/\s+/g, ' ')
    const incoming = new Set(qs.map((q) => norm(q.question)))
    const merged = [...existing]
    for (const q of qs) {
      if (!merged.some((e) => norm(e.question) === norm(q.question))) merged.push({ ...q })
    }
    for (const q of merged) {
      if (!incoming.has(norm(q.question))) continue
      q.attempts = [{ correct: false, at: Date.now() }]
      q.srs = { interval: 2, reps: 1, lapses: 0, intervalIndex: 0, due }
    }
    bank[objId] = merged
    await window.storage.setItem('ccna_quiz_bank_v1', bank)
  }, { objectiveId, questions, dueAt })
}
