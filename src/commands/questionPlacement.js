/** Where syntax vs command question types belong in the app (99+ placement matrix). */

export const SYNTAX_COACH_TYPES = new Set(['pick_mode', 'order_steps'])
export const COMMAND_DRILL_TYPES = new Set(['type_command'])
export const CLI_SKILL_TYPES = new Set(['cli'])

const IOS_STEP_RE = /^(show |sh |interface |int |vlan |router |ip |ipv6 |switchport |standby |no |configure |conf |line |name |channel-group |crypto |username |enable |access-list |ntp |lldp |cdp |default-router |network |ipv6 |ip dhcp |transport |login |standby |spanning-tree |switchport )/i

/** True when an ordering question's steps are IOS commands (syntax coach eligible). */
export function isIosOrderingQuestion(q) {
  if (q?.type !== 'ordering' || !Array.isArray(q.orderItems) || q.orderItems.length < 3) return false
  const iosLike = q.orderItems.filter(looksLikeIosStep)
  return iosLike.length >= Math.min(3, q.orderItems.length)
}

export function looksLikeIosStep(step) {
  const t = String(step || '').trim()
  if (!t || t.length > 72) return false
  return IOS_STEP_RE.test(t)
}

export function isSyntaxCoachQuestion(q) {
  if (!q?.type) return false
  if (SYNTAX_COACH_TYPES.has(q.type)) return true
  return q.type === 'ordering' && isIosOrderingQuestion(q)
}

export function isCommandDrillQuestion(q) {
  return q?.type && COMMAND_DRILL_TYPES.has(q.type)
}

export function isCliSkillQuestion(q) {
  return q?.type && CLI_SKILL_TYPES.has(q.type)
}
