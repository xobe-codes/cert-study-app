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
    // Any two choices sharing definition text (content-authoring duplicates
    // exist in the bank) makes choices.indexOf() ambiguous: two buttons
    // render identical text and indexOf silently picks whichever occurrence
    // comes first, which can flag the wrong one as correct. It is not enough
    // to exclude distractors matching the target's definition — two
    // *different* distractors can also match each other. Dedupe the
    // candidate pool to one card per unique definition text first, so no
    // combination of choices can collide.
    const seenDefs = new Set([c.definition])
    const candidates = []
    for (const x of shuffle(cards)) {
      if (x.id === c.id || seenDefs.has(x.definition)) continue
      seenDefs.add(x.definition)
      candidates.push(x)
    }
    const distractors = candidates.slice(0, 3)
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
