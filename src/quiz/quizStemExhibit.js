/**
 * Split quiz stems into IOS/routing exhibit + question prose.
 * Dedupes accidental repeated exhibit blocks in bank content.
 */

const EXHIBIT_LABEL = /^(Routing table excerpt|show ip route|IOS output|Exhibit|Output|CLI output)\s*:?\s*$/i
const ROUTE_LINE = /^([A-Z*]{1,4}(?:\s+[A-Z0-9*]{1,4})?)\s{2,}(\S+)\s*(.*)$/
const QUESTION_START = /^(what|which|how|why|where|when|for |identify|select|given |based on|according to|looking at|from the|in the|the |a |an )/i

// A device prompt fragment ("RouterA(config)#…", "R1#", "Switch>") is an
// unambiguous CLI signal on its own — real bank content has no space after
// the prompt char ("...#ip nat..."), so this must not require trailing
// whitespace the way a sentence-boundary check normally would.
const CLI_PROMPT = /\(config[\w-]*\)[>#]|^[A-Za-z][\w.-]*[>#](?:\s|$)/
// Multi-word IOS command prefixes only — deliberately excludes bare single
// words like "show"/"no"/"enable" that collide with ordinary prose
// ("No connectivity at all", "Enable OSPF", "Reload the router").
const CLI_COMMAND_PREFIX = /^(show |ip route |ip nat |ip access-list |ip helper-address|ip default-gateway|access-list \d|no shutdown\b|no ip |no switchport|no spanning-tree|interface (?:g|f|s|e|vl|lo|tu)|switchport |spanning-tree |router (?:ospf|eigrp|rip|bgp|isis)\b|line (?:vty|con|aux)|banner motd|crypto |snmp-server|hostname \S+$|vlan \d|enable secret|enable password|service password|logging (?:host|trap|buffered|console)|copy (?:running|startup))/i

/** Whole-choice heuristic: does this answer choice read as IOS CLI syntax? */
export function looksLikeCliChoice(text) {
  const t = String(text || '').trim()
  if (!t) return false
  if (CLI_PROMPT.test(t)) return true
  return CLI_COMMAND_PREFIX.test(t)
}

export function dedupeStemParagraphs(text) {
  const parts = String(text || '').replace(/\r\n/g, '\n').trim().split(/\n\n+/)
  const out = []
  for (const p of parts) {
    const t = p.trim()
    if (!t) continue
    if (out.length && out[out.length - 1] === t) continue
    out.push(t)
  }
  return out.join('\n\n')
}

export function looksLikeRouteExhibit(block) {
  const t = String(block || '')
  if (/Routing table excerpt|Gateway of last resort|variably subnetted|Codes:\s*C=/i.test(t)) return true
  const lines = t.split('\n').filter(Boolean)
  const routeLines = lines.filter(l => ROUTE_LINE.test(l) || /^[A-Z*]{1,4}\s{2,}\d/.test(l))
  return routeLines.length >= 1 && routeLines.length >= Math.min(2, lines.length - 1)
}

export function splitQuizStem(raw) {
  const text = dedupeStemParagraphs(raw)
  if (!text) return { exhibit: null, question: '', label: null }

  const parts = text.split(/\n\n+/)
  if (parts.length < 2) {
    if (looksLikeRouteExhibit(text) && text.includes('\n')) {
      const lines = text.split('\n')
      const qIdx = lines.findIndex((l, i) => i > 0 && (QUESTION_START.test(l.trim()) || /\?\s*$/.test(l.trim())))
      if (qIdx > 0) {
        return {
          exhibit: lines.slice(0, qIdx).join('\n').trim(),
          question: lines.slice(qIdx).join('\n').trim(),
          label: exhibitLabel(lines.slice(0, qIdx).join('\n')),
        }
      }
    }
    return { exhibit: null, question: text, label: null }
  }

  const last = parts[parts.length - 1].trim()
  const lastIsQuestion = QUESTION_START.test(last) || /\?\s*$/.test(last)
  const head = parts.slice(0, -1).join('\n\n')
  if (lastIsQuestion && looksLikeRouteExhibit(head)) {
    return { exhibit: head, question: last, label: exhibitLabel(head) }
  }
  if (looksLikeRouteExhibit(parts[0])) {
    return {
      exhibit: parts[0],
      question: parts.slice(1).join('\n\n'),
      label: exhibitLabel(parts[0]),
    }
  }
  return { exhibit: null, question: text, label: null }
}

function exhibitLabel(block) {
  const first = String(block || '').split('\n')[0]?.trim() || ''
  if (EXHIBIT_LABEL.test(first) || /^Routing table/i.test(first)) return 'Routing table'
  if (/^show /i.test(first)) return 'IOS output'
  return 'Exhibit'
}

/** Parse exhibit lines for structured route rendering. */
export function parseExhibitLines(exhibit) {
  const raw = String(exhibit || '')
  const lines = raw.split('\n')
  const out = []
  for (const line of lines) {
    const trimmed = line.trimEnd()
    if (!trimmed.trim()) {
      out.push({ type: 'blank' })
      continue
    }
    if (EXHIBIT_LABEL.test(trimmed.trim())) {
      out.push({ type: 'title', text: trimmed.trim().replace(/:$/, '') })
      continue
    }
    if (/^Codes:/i.test(trimmed.trim())) {
      out.push({ type: 'legend', text: trimmed.trim() })
      continue
    }
    if (/Gateway of last resort|variably subnetted|is subnetted/i.test(trimmed)) {
      out.push({ type: 'meta', text: trimmed })
      continue
    }
    const m = trimmed.match(ROUTE_LINE)
    if (m) {
      out.push({ type: 'route', code: m[1].replace(/\s+/g, ' ').trim(), prefix: m[2], detail: (m[3] || '').trim() })
      continue
    }
    out.push({ type: 'text', text: trimmed })
  }
  return out
}
