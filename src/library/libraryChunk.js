/** Library chunk helpers for Study Lens retrieval and citations. */

export function snippet(text, max = 160) {
  const t = String(text || '').replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}

export function navObjective(objectiveId, tab = 'Study') {
  return { view: 'objective', objectiveId, tab }
}

export function navCommandHub(commandId) {
  return { view: 'commandhub', commandId }
}

export function navTopicFocus(termId) {
  return { view: 'topicfocus', termId }
}

/**
 * @typedef {Object} LibraryChunk
 * @property {string} id
 * @property {string} kind
 * @property {string} title
 * @property {string} snippet
 * @property {string} body
 * @property {string[]} objectiveIds
 * @property {string[]} [tags]
 * @property {'authoritative'|'draft'} [quality]
 * @property {Object} nav
 */

export function makeChunk({
  id, kind, title, body, objectiveIds = [], tags = [], quality = 'authoritative', nav,
}) {
  const text = String(body || '').trim()
  return {
    id,
    kind,
    title,
    snippet: snippet(text),
    body: text,
    objectiveIds,
    tags,
    quality,
    nav: nav || navObjective(objectiveIds[0] || ''),
  }
}
