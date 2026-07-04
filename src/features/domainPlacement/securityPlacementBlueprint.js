/** Fixed Security domain placement blueprint v1 — balanced objectives + trap stems. */
export const SECURITY_PLACEMENT_BLUEPRINT = {
  version: 1,
  domainId: 'security',
  items: [
    { id: 'obj-5.1-source-q001', objectiveId: '5.1', trap: true },
    { id: 'obj-5.2-source-q002', objectiveId: '5.2', trap: false },
    { id: 'obj-5.3-source-q001', objectiveId: '5.3', trap: true },
    { id: 'obj-5.3-source-q002', objectiveId: '5.3', trap: false },
    { id: 'obj-5.4-source-q002', objectiveId: '5.4', trap: false },
    { id: '5.5-c-q1', objectiveId: '5.5', trap: true },
    { id: 'obj-5.5-source-q001', objectiveId: '5.5', trap: false },
    { id: 'obj-5.5-source-q004', objectiveId: '5.5', trap: true },
    { id: 'obj-5.6-source-q008', objectiveId: '5.6', trap: true },
    { id: 'obj-5.6-source-q010', objectiveId: '5.6', trap: false },
    { id: 'obj-5.7-source-q002', objectiveId: '5.7', trap: true },
    { id: 'obj-5.8-source-q001', objectiveId: '5.8', trap: false },
    { id: 'obj-5.9-source-q001', objectiveId: '5.9', trap: false },
    { id: 'obj-5.10-source-q002', objectiveId: '5.10', trap: false },
    { id: '5.11-legacy-q001', objectiveId: '5.11', trap: true },
  ],
}
