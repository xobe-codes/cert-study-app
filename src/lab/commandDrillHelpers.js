/** Shared `d()` drill-builder for commandDrillsDomains1to3.js / commandDrillsDomains4to6.js. */
import { buildCliPrompt, cliModeBlurb, ANSWER_SCOPES } from './cliModeContext.js'

export const NAV = ANSWER_SCOPES.mode_nav
export const NEXT = ANSWER_SCOPES.next_command

/** Annotate a drill with explicit IOS mode context (99+ contract). */
export function d({
  prompt,
  answer,
  hint,
  mode,
  host = 'R1',
  iface = null,
  scope = NEXT,
}) {
  return {
    prompt,
    answer,
    hint,
    cliMode: mode,
    cliHostname: host,
    ...(iface ? { cliInterface: iface } : {}),
    answerScope: scope,
    cliPrompt: buildCliPrompt({ hostname: host, mode, interfaceName: iface }),
    cliModeBlurb: cliModeBlurb({ mode, interfaceName: iface, answerScope: scope }),
  }
}
