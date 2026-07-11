/**
 * Spec 11 — Terms Hub drill quiz builders.
 */

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildFlashItems(cards, count = 12) {
  return shuffle(cards).slice(0, count).map(c => ({
    mode: 'flash',
    id: c.id,
    prompt: c.term,
    answer: c.definition,
    card: c,
  }))
}

export function buildTypeTermItems(cards, count = 10) {
  return shuffle(cards).slice(0, count).map(c => ({
    mode: 'typeTerm',
    id: c.id,
    prompt: c.definition,
    answer: c.term,
    card: c,
  }))
}

export function gradeTypeTerm(input, expected) {
  const a = String(input || '').trim().toLowerCase()
  const b = String(expected || '').trim().toLowerCase()
  if (!a || !b) return false
  if (a === b) return true
  // Accept if expected is contained as whole-ish match for short aliases
  return a.replace(/\s+/g, ' ') === b.replace(/\s+/g, ' ')
}

export function buildPickDefinitionItems(cards, count = 10) {
  const pool = shuffle(cards)
  const items = []
  for (const c of pool) {
    if (items.length >= count) break
    const distractors = shuffle(cards.filter(x => x.id !== c.id)).slice(0, 3)
    if (distractors.length < 3) continue
    const choices = shuffle([c.definition, ...distractors.map(d => d.definition)])
    items.push({
      mode: 'pickDefinition',
      id: c.id,
      prompt: c.term,
      choices,
      correctIndex: choices.indexOf(c.definition),
      card: c,
    })
  }
  return items
}
