/** CLI config drills for config-heavy objectives + verify drills for interpret objectives.
 *  Each step: { prompt, answer, hint, cliMode, cliPrompt, ... }.
 *  answer may be an array of acceptable strings (case-insensitive, whitespace-normalized).
 */
import { COMMAND_DRILLS_1_3 } from './commandDrillsDomains1to3.js'
import { COMMAND_DRILLS_4_6 } from './commandDrillsDomains4to6.js'

export const COMMAND_DRILLS = {
  ...COMMAND_DRILLS_1_3,
  ...COMMAND_DRILLS_4_6,
}
