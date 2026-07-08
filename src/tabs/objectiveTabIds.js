export function objectiveTabId(objectiveId, tabName) {
  return `obj-tab-${objectiveId}-${tabName.replace(/\s+/g, '-')}`
}

export function objectivePanelId(objectiveId, tabName) {
  return `obj-panel-${objectiveId}-${tabName.replace(/\s+/g, '-')}`
}
