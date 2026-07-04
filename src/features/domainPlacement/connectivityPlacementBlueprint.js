/** Fixed IP Connectivity placement blueprint v1. */
export const CONNECTIVITY_PLACEMENT_BLUEPRINT = {
  version: 1,
  domainId: 'connectivity',
  items: [
    { id: '3.1-q1', objectiveId: '3.1', trap: true },
    { id: '3.1-q2', objectiveId: '3.1', trap: false },
    { id: '3.2-c-q1', objectiveId: '3.2', trap: true },
    { id: '3.2-c-q2', objectiveId: '3.2', trap: false },
    { id: '3.3-q1', objectiveId: '3.3', trap: true },
    { id: '3.3-q2', objectiveId: '3.3', trap: false },
    { id: '3.4-c-q1', objectiveId: '3.4', trap: true },
    { id: '3.4-c-q2', objectiveId: '3.4', trap: false },
    { id: 'obj-3.5-source-q001', objectiveId: '3.5', trap: true },
    { id: 'obj-3.5-source-q002', objectiveId: '3.5', trap: false },
    { id: '3.6-legacy-q001', objectiveId: '3.6', trap: true },
    { id: '3.6-legacy-q002', objectiveId: '3.6', trap: false },
    { id: '3.2-c-q3', objectiveId: '3.2', trap: false },
    { id: '3.3-q3', objectiveId: '3.3', trap: false },
    { id: '3.4-c-q3', objectiveId: '3.4', trap: false },
  ],
}
