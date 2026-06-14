/** Domain-focused study session sizing and pool builder. */
export const DOMAIN_STUDY_SIZE_OPTIONS = [10, 20, 30]
export const DOMAIN_STUDY_DEFAULT_SIZE = 20

/** Count available MC questions across selected domains (union of objectives). */
export function countDomainStudyPool(domains, getMcQuestions) {
  return domains.reduce(
    (n, domain) => n + domain.objectives.reduce((m, o) => m + getMcQuestions(o.id).length, 0),
    0,
  )
}

/** Filter domains to those whose id is in selectedIds (preserves official order). */
export function resolveSelectedDomains(allDomains, selectedIds) {
  const set = new Set(selectedIds)
  return allDomains.filter(d => set.has(d.id))
}

/** Build a study session from the union of selected domains' objectives. */
export function buildDomainStudyPool(domains, getMcQuestions, count, shuffle) {
  if (domains.length === 0) return []
  const pool = shuffle(
    domains.flatMap(domain =>
      domain.objectives.flatMap(o =>
        getMcQuestions(o.id).map(q => ({ ...q, objectiveId: o.id })),
      ),
    ),
  )
  return pool.slice(0, Math.min(count, pool.length))
}

export function validateDomainStudyStart(selectedDomainIds, domains, getMcQuestions, sessionSize) {
  if (!selectedDomainIds.length) {
    return { ok: false, error: 'Select at least one domain to study.' }
  }
  const selected = resolveSelectedDomains(domains, selectedDomainIds)
  const poolSize = countDomainStudyPool(selected, getMcQuestions)
  if (poolSize === 0) {
    return { ok: false, error: 'No questions available in the selected domain(s).' }
  }
  if (poolSize < sessionSize) {
    return {
      ok: false,
      error: `Only ${poolSize} question${poolSize === 1 ? '' : 's'} available — choose a smaller session size or add more domains.`,
    }
  }
  return { ok: true, poolSize, selected }
}
