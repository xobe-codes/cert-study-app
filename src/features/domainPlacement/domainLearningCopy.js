/** Shared copy for domain baseline / pass learning flows. */
export const DOMAIN_LEARNING_TAGLINE =
  'Baseline maps your gaps. Study fixes them. Domain Pass proves you\'re exam-ready in that domain.'

export const DOMAIN_LAYER_LEGEND =
  'Studied = SRS mastery · Mapped = baseline check · Pass = timed domain gate'

export function domainNumberLabel(domain) {
  const n = domain?.objectives?.[0]?.id?.split('.')?.[0]
  return n ? `D${n}` : ''
}

export function domainDisplayTitle(domain) {
  const d = domainNumberLabel(domain)
  return d ? `${d} ${domain.name}` : domain.name
}
