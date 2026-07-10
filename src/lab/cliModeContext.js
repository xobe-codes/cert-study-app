/** IOS CLI mode context — prompts and labels for type-in / syntax questions. */

export const CLI_MODES = {
  user_exec: {
    id: 'user_exec',
    label: 'User EXEC',
    short: 'User EXEC',
    promptSuffix: '>',
  },
  priv_exec: {
    id: 'priv_exec',
    label: 'Privileged EXEC',
    short: 'Privileged EXEC',
    promptSuffix: '#',
  },
  global_config: {
    id: 'global_config',
    label: 'Global configuration mode',
    short: 'Global config',
    promptSuffix: '(config)#',
  },
  interface: {
    id: 'interface',
    label: 'Interface configuration mode',
    short: 'Interface config',
    promptSuffix: '(config-if)#',
  },
  line: {
    id: 'line',
    label: 'Line configuration mode',
    short: 'Line config',
    promptSuffix: '(config-line)#',
  },
  router: {
    id: 'router',
    label: 'Router (routing-protocol) configuration mode',
    short: 'Router config',
    promptSuffix: '(config-router)#',
  },
  vlan: {
    id: 'vlan',
    label: 'VLAN configuration mode',
    short: 'VLAN config',
    promptSuffix: '(config-vlan)#',
  },
  dhcp_pool: {
    id: 'dhcp_pool',
    label: 'DHCP pool configuration mode',
    short: 'DHCP pool',
    promptSuffix: '(dhcp-config)#',
  },
  acl_ext: {
    id: 'acl_ext',
    label: 'Named extended ACL configuration mode',
    short: 'ACL config',
    promptSuffix: '(config-ext-nacl)#',
  },
}

export const CLI_MODE_IDS = new Set(Object.keys(CLI_MODES))

export const ANSWER_SCOPES = {
  next_command: 'next_command',
  mode_nav: 'mode_nav',
  full_path: 'full_path',
}

/** Build an IOS-style prompt string for the given mode. */
export function buildCliPrompt({
  hostname = 'R1',
  mode = 'priv_exec',
  interfaceName = null,
} = {}) {
  const host = String(hostname || 'R1').trim() || 'R1'
  const meta = CLI_MODES[mode] || CLI_MODES.priv_exec
  if (mode === 'interface' && interfaceName) {
    return `${host}(config-if)#`
  }
  if (mode === 'user_exec') return `${host}>`
  if (mode === 'priv_exec') return `${host}#`
  return `${host}${meta.promptSuffix}`
}

export function cliModeLabel(mode) {
  return CLI_MODES[mode]?.label || 'Privileged EXEC'
}

/** Learner-facing one-liner under the prompt. */
export function cliModeBlurb({ mode, interfaceName = null, answerScope = 'next_command' } = {}) {
  const label = cliModeLabel(mode)
  if (answerScope === 'mode_nav') {
    if (mode === 'global_config') {
      return `You are already in ${label}. Type the command to enter the next mode (do not re-type conf t).`
    }
    if (mode === 'priv_exec') {
      return `You are already in ${label}. Type the next mode-change or show command only.`
    }
  }
  if (mode === 'interface' && interfaceName) {
    return `You are already in ${label} on ${interfaceName}. Type only the next interface command.`
  }
  if (mode === 'vlan') {
    return `You are already in ${label} for the VLAN you just created/selected. Type only the next VLAN command.`
  }
  if (mode === 'router') {
    return `You are already in ${label}. Type only the next router-process command.`
  }
  if (mode === 'line') {
    return `You are already in ${label}. Type only the next line command.`
  }
  if (mode === 'dhcp_pool') {
    return `You are already in ${label}. Type only the next pool command.`
  }
  if (mode === 'acl_ext') {
    return `You are already in ${label}. Type only the next ACL entry.`
  }
  if (mode === 'global_config') {
    return `You are already in ${label}. Type only the next global command (not enable / conf t).`
  }
  if (mode === 'priv_exec') {
    return `You are already in ${label}. Type only the next command (not enable).`
  }
  return `You are already in ${label}. Type only the next command.`
}

/**
 * Normalize a command-drill or CLI question into a displayable mode context.
 * Prefers explicit fields; infers from primary answer when missing.
 */
export function resolveCliModeContext(source = {}) {
  const answers = source.answers || (source.answer
    ? (Array.isArray(source.answer) ? source.answer : [source.answer])
    : [])
  const primary = String(answers[0] || '').trim().toLowerCase()
  const hostname = source.cliHostname || source.hostname || inferHostname(source)
  let mode = source.cliMode || source.mode
  let interfaceName = source.cliInterface || source.interfaceName || null
  let answerScope = source.answerScope || ANSWER_SCOPES.next_command

  if (!mode || !CLI_MODE_IDS.has(mode)) {
    const inferred = inferModeFromAnswer(primary, source.prompt || source.question || '')
    mode = inferred.mode
    interfaceName = interfaceName || inferred.interfaceName
    answerScope = source.answerScope || inferred.answerScope
  }

  const prompt = source.cliPrompt || buildCliPrompt({ hostname, mode, interfaceName })
  const blurb = source.cliModeBlurb || cliModeBlurb({ mode, interfaceName, answerScope })
  return {
    mode,
    hostname,
    interfaceName,
    answerScope,
    prompt,
    label: cliModeLabel(mode),
    blurb,
  }
}

function inferHostname(source) {
  const oid = String(source.objectiveId || '')
  if (oid.startsWith('2.') || oid === '5.3' || oid === '5.6') return 'SW1'
  if (oid === '2.8' || oid === '5.9') return 'WLC1'
  return 'R1'
}

function inferModeFromAnswer(primary, promptText) {
  const p = `${primary} ${promptText}`.toLowerCase()
  if (/^interface\s|^int\s/.test(primary) || /enter interface configuration/.test(p)) {
    return { mode: 'global_config', answerScope: ANSWER_SCOPES.mode_nav, interfaceName: null }
  }
  if (/^router\s+ospf|^router\s+eigrp|^router\s+bgp/.test(primary) || /enter ospf process/.test(p)) {
    return { mode: 'global_config', answerScope: ANSWER_SCOPES.mode_nav, interfaceName: null }
  }
  if (/^vlan\s+\d+/.test(primary) && !/switchport access vlan/.test(primary)) {
    return { mode: 'global_config', answerScope: ANSWER_SCOPES.next_command, interfaceName: null }
  }
  if (/^name\s+/.test(primary)) {
    return { mode: 'vlan', answerScope: ANSWER_SCOPES.next_command, interfaceName: null }
  }
  if (/^network\s+.+area\s+|^router-id\s+/.test(primary)) {
    return { mode: 'router', answerScope: ANSWER_SCOPES.next_command, interfaceName: null }
  }
  if (/^network\s+\d|^default-router\s+/.test(primary) && /dhcp|pool/.test(p)) {
    return { mode: 'dhcp_pool', answerScope: ANSWER_SCOPES.next_command, interfaceName: null }
  }
  if (/^deny\s+|^permit\s+/.test(primary)) {
    return { mode: 'acl_ext', answerScope: ANSWER_SCOPES.next_command, interfaceName: null }
  }
  if (/^login\s+local|^transport\s+input/.test(primary)) {
    return { mode: 'line', answerScope: ANSWER_SCOPES.next_command, interfaceName: null }
  }
  if (/^show\s+|^sh\s+/.test(primary)) {
    return { mode: 'priv_exec', answerScope: ANSWER_SCOPES.next_command, interfaceName: null }
  }
  if (/^ip\s+address|^no\s+shutdown|^ipv6\s+address|^ipv6\s+enable|^switchport\s+|^channel-group\s+|^standby\s+|^ip\s+nat\s+(inside|outside)$|^ip\s+helper-address|^ip\s+access-group|^switchport\s+port-security/.test(primary)) {
    const ifMatch = promptText.match(/\b((?:Gi|GigabitEthernet|Fa|FastEthernet|Vlan)\s*[\d/.]+)/i)
    return {
      mode: 'interface',
      answerScope: ANSWER_SCOPES.next_command,
      interfaceName: ifMatch ? ifMatch[1].replace(/\s+/g, '') : 'GigabitEthernet0/1',
    }
  }
  if (/^ip\s+route|^ipv6\s+route|^ipv6\s+unicast-routing|^ip\s+domain-name|^crypto\s+key|^enable\s+secret|^username\s+|^ip\s+dhcp\s+pool|^ip\s+access-list|^ip\s+nat\s+inside\s+source|^no\s+cdp\s+run|^cdp\s+run|^lldp\s+run/.test(primary)) {
    return { mode: 'global_config', answerScope: ANSWER_SCOPES.next_command, interfaceName: null }
  }
  return { mode: 'priv_exec', answerScope: ANSWER_SCOPES.next_command, interfaceName: null }
}

/** Attach resolved mode fields onto a drill object (non-destructive). */
export function withCliModeContext(drill, { objectiveId, hostname } = {}) {
  const ctx = resolveCliModeContext({ ...drill, objectiveId, hostname: hostname || drill.cliHostname })
  return {
    ...drill,
    cliMode: ctx.mode,
    cliPrompt: ctx.prompt,
    cliHostname: ctx.hostname,
    cliInterface: ctx.interfaceName,
    cliModeBlurb: ctx.blurb,
    answerScope: ctx.answerScope,
  }
}

/** True when a drill/question has explicit mode context fields. */
export function hasExplicitCliModeContext(item) {
  return Boolean(item?.cliMode && item?.cliPrompt && CLI_MODE_IDS.has(item.cliMode))
}
