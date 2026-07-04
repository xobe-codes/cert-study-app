export const MAIN_TABS = ['Study', 'Practice']

export const TOOL_TAB_MAP = {
  'CLI Drill': 'CLI Drill',
  Subnetting: 'Subnetting',
  VLSM: 'VLSM',
  'IPv6 Calc': 'IPv6 Calc',
  'ACL Calc': 'ACL Calc',
}

export function mapLegacyTab(tab) {
  if (!tab) return 'Study'
  const key = tab.length > 1 ? tab.charAt(0).toUpperCase() + tab.slice(1).toLowerCase() : tab
  if (key === 'Explain' || key === 'Visual') return 'Study'
  if (key === 'Quiz') return 'Practice'
  if (MAIN_TABS.includes(key)) return key
  if (MAIN_TABS.includes(tab)) return tab
  return null
}
