/** Template instant answers from library hits — no API, works offline. */

function firstSentence(text) {
  const parts = String(text || '').split(/(?<=[.!?])\s+/).filter(Boolean)
  return parts[0] || String(text || '').trim()
}

function uniqueNonEmpty(items) {
  const seen = new Set()
  const out = []
  for (const item of items) {
    const t = String(item || '').trim()
    if (!t || seen.has(t)) continue
    seen.add(t)
    out.push(t)
  }
  return out
}

function buildCompareAnswer(hits) {
  const terms = hits.filter(h => h.kind === 'term').slice(0, 2)
  if (terms.length >= 2) {
    return {
      sufficient: true,
      confidence: 'high',
      mode: 'compare',
      text: `${terms[0].title}: ${firstSentence(terms[0].body)} ${terms[1].title}: ${firstSentence(terms[1].body)}`,
      compareRows: terms.map(t => ({ label: t.title, detail: firstSentence(t.body) })),
    }
  }
  const pair = hits.slice(0, 2)
  if (pair.length >= 2) {
    return {
      sufficient: true,
      confidence: 'partial',
      mode: 'compare',
      text: `${pair[0].title} — ${firstSentence(pair[0].body)} ${pair[1].title} — ${firstSentence(pair[1].body)}`,
      compareRows: pair.map(h => ({ label: h.title, detail: firstSentence(h.body) })),
    }
  }
  return buildDefineAnswer(hits)
}

function buildDefineAnswer(hits) {
  const lead = uniqueNonEmpty(hits.slice(0, 4).map(h => firstSentence(h.body)))
  if (!lead.length) {
    return { sufficient: false, confidence: 'none', mode: 'define', text: '' }
  }
  const top = hits[0]?.score || 0
  return {
    sufficient: top >= 35,
    confidence: top >= 55 ? 'high' : top >= 35 ? 'partial' : 'low',
    mode: 'define',
    text: lead.join(' '),
  }
}

export function buildInstantAnswer(query, hits, intent) {
  if (!hits?.length) {
    return {
      sufficient: false,
      confidence: 'none',
      mode: intent,
      text: 'Nothing in the library matched that query. Try a CCNA term, command, or objective number (e.g. "OSPF", "show ip route", "3.2").',
    }
  }

  if (hits[0].score < 30) {
    return {
      sufficient: false,
      confidence: 'low',
      mode: intent,
      text: 'Weak matches only — browse the sources below or refine your question.',
    }
  }

  if (intent === 'compare') return buildCompareAnswer(hits)
  return buildDefineAnswer(hits)
}
