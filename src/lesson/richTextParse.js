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
