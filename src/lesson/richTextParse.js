/** Parse inline `code` and **bold** segments for lesson prose. */
export function parseRichTextSegments(text) {
  if (text == null) return []
  const segments = []
  const parts = String(text).split(/`([^`]+)`/)
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      segments.push({ type: 'code', value: parts[i] })
      continue
    }
    const boldParts = parts[i].split(/\*\*([^*]+)\*\*/)
    for (let j = 0; j < boldParts.length; j++) {
      if (!boldParts[j]) continue
      segments.push({ type: j % 2 === 1 ? 'bold' : 'text', value: boldParts[j] })
    }
  }
  return segments
}

/**
 * Strip `code`/**bold** markup down to plain text, for contexts that can't
 * render JSX (aria-label strings, truncated headers) — keeps the words,
 * drops the syntax, so markup never leaks onto screen or into a screen
 * reader announcement as literal backticks/asterisks.
 */
export function stripRichTextMarkup(text) {
  return parseRichTextSegments(text).map(seg => seg.value).join('')
}
