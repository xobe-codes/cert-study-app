/** Shared builders for curated visual packs. */
export const SRC = [{ sourceName: 'Cisco CCNA 200-301 v1.1 Exam Topics', confidence: 1 }]

export function topo(id, title, nodes, links, annotations = []) {
  return { id, title, type: 'topology', nodes, links, annotations, sourceRefs: SRC }
}

export function compare(title, leftLabel, leftPoints, rightLabel, rightPoints) {
  return {
    type: 'comparison',
    title,
    left: { label: leftLabel, points: leftPoints },
    right: { label: rightLabel, points: rightPoints },
  }
}

export function stack(title, layers) {
  return { type: 'layer_stack', title, layers }
}

export function flow(id, title, ckuIds, stepTitles) {
  return {
    id,
    title,
    ckuIds,
    steps: stepTitles.map((s, i) => ({
      id: `s${i + 1}`,
      order: i + 1,
      title: s[0],
      action: s[1],
      successState: `step${i + 1}`,
    })),
    sourceRefs: SRC,
  }
}

/** Merge pack maps into target objects (mutates targets). */
export function mergePackMaps(targets, packs) {
  const { diagrams = {}, compare: cmp = {}, traps = {}, flows = {} } = packs
  Object.assign(targets.diagrams, diagrams)
  Object.assign(targets.compare, cmp)
  Object.assign(targets.traps, traps)
  Object.assign(targets.flows, flows)
}
