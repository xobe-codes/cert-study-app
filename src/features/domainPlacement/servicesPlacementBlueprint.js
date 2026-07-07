/** Fixed IP Services placement blueprint v2 — every objective sampled once. */
export const SERVICES_PLACEMENT_BLUEPRINT = {
  version: 2,
  domainId: 'services',
  items: [
    { id: '4.1-c-q1', objectiveId: '4.1', trap: true },
    { id: 'obj-4.2-source-q001', objectiveId: '4.2', trap: true },
    { id: 'obj-4.3-source-q001', objectiveId: '4.3', trap: true },
    { id: 'obj-4.4-source-q001', objectiveId: '4.4', trap: true },
    { id: 'obj-4.5-source-q001', objectiveId: '4.5', trap: true },
    { id: 'obj-4.6-source-q001', objectiveId: '4.6', trap: true },
    { id: 'obj-4.7-source-q001', objectiveId: '4.7', trap: true },
    { id: 'obj-4.8-source-q001', objectiveId: '4.8', trap: true },
    { id: 'obj-4.9-source-q001', objectiveId: '4.9', trap: true },
    { id: '4.10-legacy-q001', objectiveId: '4.10', trap: true },
    { id: '4.1-c-q2', objectiveId: '4.1', trap: false },
    { id: 'obj-4.3-source-q002', objectiveId: '4.3', trap: false },
    { id: 'obj-4.5-source-q002', objectiveId: '4.5', trap: false },
    { id: 'obj-4.9-source-q002', objectiveId: '4.9', trap: false },
    { id: '4.10-legacy-q002', objectiveId: '4.10', trap: false },
  ],
}
