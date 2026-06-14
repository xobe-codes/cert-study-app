/** Pomodoro + Deep Work presets for lesson study blocks. */

export const STUDY_BLOCK_STORAGE_KEY = 'ccna_study_block_v1'

export const STUDY_BLOCK_MODES = {
  pomodoro: {
    id: 'pomodoro',
    label: 'Pomodoro',
    shortLabel: '25/5',
    focusSec: 25 * 60,
    breakSec: 5 * 60,
    longBreakSec: 15 * 60,
    cyclesBeforeLong: 4,
  },
  deepWork: {
    id: 'deepWork',
    label: 'Deep Work',
    shortLabel: '90m',
    focusSec: 90 * 60,
    breakSec: 5 * 60,
    longBreakSec: null,
    cyclesBeforeLong: null,
  },
}

export const DEFAULT_STUDY_BLOCK_MODE = 'pomodoro'
export const COMPLETION_THRESHOLD = 0.8

export function getModeConfig(modeId) {
  return STUDY_BLOCK_MODES[modeId] || STUDY_BLOCK_MODES[DEFAULT_STUDY_BLOCK_MODE]
}
