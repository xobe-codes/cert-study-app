/** Cisco IOS CLI simulator — shared by CLI Drill tab and Lab runner. */

export function normalizeCmd(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

export const CLI_MODE_PROMPT = {
  user: '>',
  priv: '#',
  config: '(config)#',
  'config-if': '(config-if)#',
  'config-vlan': '(config-vlan)#',
  'config-line': '(config-line)#',
  'config-router': '(config-router)#',
  'config-dhcp': '(dhcp-config)#',
  'config-acl': '(config-ext-nacl)#',
}

export const CLI_MODE_HINT = {
  priv: "privileged EXEC mode — type 'enable'",
  config: "global config — type 'configure terminal'",
  'config-if': "interface config — e.g. 'interface gi0/1'",
  'config-vlan': "VLAN config — e.g. 'vlan 20'",
  'config-line': "line config — e.g. 'line vty 0 4'",
  'config-router': "router config — e.g. 'router ospf 1'",
  'config-dhcp': "DHCP pool config — e.g. 'ip dhcp pool LAN'",
  'config-acl': "named ACL config — e.g. 'ip access-list extended NAME'",
}

export const CLI_SHOW_OUTPUT = {
  'show etherchannel summary': `Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
Number of channel-groups in use: 1
Number of aggregators:           1

Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------
1      Po1(SU)         LACP      Gi0/1(P)   Gi0/2(P)`,
  'show ip ospf neighbor': `Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           1   FULL/DR         00:00:38    10.0.0.2        GigabitEthernet0/0`,
  'show vlan brief': `VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/2, Gi0/3
20   SALES                            active    Fa0/5`,
  'show ip interface brief': `Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/1     192.168.10.1    YES manual up                    up`,
  'show spanning-tree vlan 1': `VLAN0001
  Spanning tree enabled protocol ieee
  Root ID    Priority    32769
             Address     0019.e86a.6e80
             Cost        19
             Port        1 (GigabitEthernet0/1)
  Bridge ID  Priority    32769
             Address     0019.e86a.6e80`,
  'show cdp neighbors': `Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
SW2              Gig 0/1           152             R S I    WS-C2960  Gig 0/1`,
  'show lldp neighbors': `Device ID        Local Intf     Hold-time  Capability      Port ID
SW2              Gi0/1          120        B,R             Gi0/1`,
  'show ip route': `Codes: L - local, C - connected, S - static, R - RIP, O - OSPF, D - EIGRP
       * - candidate default
Gateway of last resort is 10.0.0.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 10.0.0.1
      10.0.0.0/30 is subnetted, 1 subnets
C       10.0.0.0/30 is directly connected, GigabitEthernet0/1
L       10.0.0.1/32 is directly connected, GigabitEthernet0/1
      192.168.1.0/24 is variably subnetted, 2 subnets, 2 masks
C       192.168.1.0/24 is directly connected, GigabitEthernet0/0
L       192.168.1.1/32 is directly connected, GigabitEthernet0/0
O     192.168.2.0/24 [110/20] via 10.0.0.2, 00:01:23, GigabitEthernet0/1
S     172.16.0.0/16 [1/0] via 10.0.0.2`,
  'show ip route ospf': `Codes: O - OSPF
O     192.168.2.0/24 [110/20] via 10.0.0.2, 00:01:23, GigabitEthernet0/1`,
  'show ip route connected': `Codes: C - connected, L - local
      10.0.0.0/30 is subnetted, 1 subnets
C       10.0.0.0/30 is directly connected, GigabitEthernet0/1
L       10.0.0.1/32 is directly connected, GigabitEthernet0/1
      192.168.1.0/24 is variably subnetted, 2 subnets, 2 masks
C       192.168.1.0/24 is directly connected, GigabitEthernet0/0
L       192.168.1.1/32 is directly connected, GigabitEthernet0/0`,
  'show ip route static': `Codes: S - static
S*    0.0.0.0/0 [1/0] via 10.0.0.1
S     172.16.0.0/16 [1/0] via 10.0.0.2`,
  'show ip route 192.168.2.0': `Routing entry for 192.168.2.0/24
  Known via "ospf 1", distance 110, metric 20, type intra area
  Last update from 10.0.0.2 on GigabitEthernet0/1, 00:01:23 ago
  Routing Descriptor Blocks:
  * 10.0.0.2, from 10.0.0.2, 00:01:23 ago, via GigabitEthernet0/1
      Route metric is 20, traffic share count is 1`,
}

export function cliNavTarget(norm) {
  if (/^(enable|en)$/.test(norm)) return { to: 'priv', from: ['user', 'priv'] }
  if (/^disable$/.test(norm)) return { to: 'user', from: ['priv'] }
  if (/^(configure terminal|conf t|config t|configure t|conf terminal)$/.test(norm)) return { to: 'config', from: ['priv'] }
  if (/^(interface|int) /.test(norm)) return { to: 'config-if', from: ['config', 'config-if'] }
  if (/^vlan \d+$/.test(norm)) return { to: 'config-vlan', from: ['config', 'config-vlan'] }
  if (/^line /.test(norm)) return { to: 'config-line', from: ['config', 'config-line'] }
  if (/^router \w+/.test(norm)) return { to: 'config-router', from: ['config', 'config-router'] }
  if (/^ip dhcp pool /.test(norm)) return { to: 'config-dhcp', from: ['config', 'config-dhcp'] }
  if (/^ip access-list /.test(norm)) return { to: 'config-acl', from: ['config', 'config-acl'] }
  return null
}

export function cliExitTarget(norm, mode) {
  if (/^(end)$/.test(norm)) return mode.startsWith('config') ? 'priv' : mode
  if (/^(exit)$/.test(norm)) {
    if (mode === 'config') return 'priv'
    if (mode === 'priv') return 'user'
    if (mode.startsWith('config-')) return 'config'
    return mode
  }
  return null
}

export function cliRequiredMode(norm) {
  if (/^show /.test(norm)) return 'priv'
  if (cliNavTarget(norm)) {
    if (/^(enable|en|disable)$/.test(norm)) return 'user'
    if (/^(configure terminal|conf t|config t|configure t|conf terminal)$/.test(norm)) return 'priv'
    return 'config'
  }
  if (/^name /.test(norm)) return 'config-vlan'
  if (/ area /.test(norm) || /^router-id /.test(norm)) return 'config-router'
  if (/^default-router /.test(norm) || (/^network /.test(norm) && !/ area /.test(norm))) return 'config-dhcp'
  if (/^(transport input |login local$|login$)/.test(norm)) return 'config-line'
  if (/^(deny |permit )/.test(norm)) return 'config-acl'
  if (/^(ip address |no shut|no shutdown|ipv6 address |ipv6 enable|switchport|channel-group |standby |no cdp enable|ip helper-address |ip access-group )/.test(norm)) return 'config-if'
  return 'config'
}

/** Accept common IOS abbreviations for lab expected commands. */
export function commandVariants(cmd) {
  const base = normalizeCmd(cmd)
  const variants = new Set([base])
  variants.add(base.replace(/^interface /, 'int '))
  variants.add(base.replace(/^configure terminal$/, 'conf t'))
  variants.add(base.replace(/^no shutdown$/, 'no shut'))
  variants.add(base.replace(/^no shut$/, 'no shutdown'))
  return [...variants]
}

export function commandMatches(inputNorm, expectedCmd) {
  return commandVariants(expectedCmd).some(v => inputNorm === v || inputNorm.includes(v))
}

export function cliHostnameForObjective(objectiveId) {
  const switchObjs = ['2.1', '2.2', '2.3', '2.4', '5.6']
  return switchObjs.includes(objectiveId) ? 'Switch' : 'Router'
}

export function deviceHostname(device) {
  if (!device) return 'Router'
  const d = String(device).toLowerCase()
  if (d.startsWith('sw')) return d.toUpperCase()
  if (d.includes('switch')) return 'Switch'
  return device
}

/**
 * Process one CLI line. objectives: [{ answer: string[], label? }]
 * completed: boolean[] parallel to objectives.
 */
export function processCliLine({
  raw,
  mode,
  host,
  objectives = [],
  completed = [],
  showOutput = CLI_SHOW_OUTPUT,
}) {
  const lines = []
  const counters = { syntaxErrors: 0, wrongModeErrors: 0 }
  const newlyCompleted = []
  let newMode = mode

  const norm = normalizeCmd(raw)
  lines.push({ text: `${host}${CLI_MODE_PROMPT[mode]} ${raw}`, kind: 'cmd' })

  if (norm === 'hint') {
    const nextIdx = completed.findIndex(c => !c)
    if (nextIdx >= 0 && objectives[nextIdx]?.hint) {
      lines.push({ text: `Hint: ${objectives[nextIdx].hint}`, kind: 'out' })
    } else if (nextIdx >= 0) {
      lines.push({ text: `Next: ${objectives[nextIdx].label || objectives[nextIdx].answer[0]}`, kind: 'out' })
    }
    return { lines, newMode, newlyCompleted, counters }
  }

  if (norm === '?') {
    lines.push({ text: 'IOS help — navigate: enable → configure terminal → interface/vlan/router. Type exit/end to leave config. Type hint for task help.', kind: 'out' })
    return { lines, newMode, newlyCompleted, counters }
  }

  const exitTo = cliExitTarget(norm, mode)
  if (exitTo !== null && (norm === 'exit' || norm === 'end')) {
    newMode = exitTo
    return { lines, newMode, newlyCompleted, counters }
  }

  let matchIdx = -1
  for (let i = 0; i < objectives.length; i++) {
    if (completed[i]) continue
    const answers = objectives[i].answer || objectives[i].answers || []
    if (answers.some(a => commandMatches(norm, a))) { matchIdx = i; break }
  }

  const nav = cliNavTarget(norm)
  if (matchIdx >= 0) {
    const req = cliRequiredMode(norm)
    const modeOk = nav ? nav.from.includes(mode) : mode === req
    if (modeOk) {
      if (nav) newMode = nav.to
      newlyCompleted.push(matchIdx)
      lines.push({ text: `% OK — ${objectives[matchIdx].label || 'command accepted'}`, kind: 'ok' })
      // For show commands, also display the simulated output so the learner can read and interpret it
      if (/^show /.test(norm) && showOutput[norm]) {
        showOutput[norm].split('\n').forEach(row => lines.push({ text: row, kind: 'out' }))
      }
    } else {
      counters.wrongModeErrors += 1
      lines.push({ text: `% Wrong mode. That command belongs in ${CLI_MODE_HINT[req] || req}.`, kind: 'warn' })
    }
    return { lines, newMode, newlyCompleted, counters }
  }

  if (nav) {
    if (nav.from.includes(mode)) newMode = nav.to
    else {
      counters.wrongModeErrors += 1
      lines.push({ text: `% "${raw}" is not available from ${CLI_MODE_PROMPT[mode]}. ${CLI_MODE_HINT[nav.from[0]] || ''}`, kind: 'warn' })
    }
    return { lines, newMode, newlyCompleted, counters }
  }

  if (/^show /.test(norm)) {
    if (mode !== 'priv' && mode !== 'config' && !mode.startsWith('config')) {
      counters.wrongModeErrors += 1
      lines.push({ text: "% show commands run from privileged EXEC — type 'enable' first.", kind: 'warn' })
    } else if (showOutput[norm]) {
      showOutput[norm].split('\n').forEach(row => lines.push({ text: row, kind: 'out' }))
    } else {
      lines.push({ text: '% Output not simulated for this show command in this lab.', kind: 'info' })
    }
    return { lines, newMode, newlyCompleted, counters }
  }

  counters.syntaxErrors += 1
  const firstWord = norm.split(' ')[0]
  const near = objectives.find((d, i) => !completed[i] && normalizeCmd((d.answer || [])[0] || '').split(' ')[0] === firstWord)
  if (near) {
    lines.push({ text: `% Incomplete or incorrect syntax. Expected: ${(near.answer || [])[0]}`, kind: 'warn' })
  } else {
    lines.push({ text: '% Invalid input. Type "hint" for help or "?" for navigation tips.', kind: 'warn' })
  }
  return { lines, newMode, newlyCompleted, counters }
}
