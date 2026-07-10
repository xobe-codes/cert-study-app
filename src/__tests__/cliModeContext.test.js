import { describe, it, expect } from 'vitest'
import {
  buildCliPrompt,
  cliModeBlurb,
  resolveCliModeContext,
  hasExplicitCliModeContext,
  CLI_MODES,
} from '../lab/cliModeContext.js'
import { COMMAND_DRILLS } from '../lab/commandDrills.js'
import { CLI_SKILL_QUESTIONS, buildCliSkillQuestions } from '../data/cliSkillQuestions.js'
import { buildDrillQuizItems } from '../commands/commandDrillQuiz.js'
import { isCliQuestion } from '../questionUtils.js'

describe('cliModeContext', () => {
  it('builds prompts for common modes', () => {
    expect(buildCliPrompt({ hostname: 'R1', mode: 'priv_exec' })).toBe('R1#')
    expect(buildCliPrompt({ hostname: 'R1', mode: 'global_config' })).toBe('R1(config)#')
    expect(buildCliPrompt({ hostname: 'SW1', mode: 'interface', interfaceName: 'Gi0/1' })).toBe('SW1(config-if)#')
    expect(buildCliPrompt({ hostname: 'R1', mode: 'router' })).toBe('R1(config-router)#')
  })

  it('blurbs tell the learner they are already in mode', () => {
    const b = cliModeBlurb({ mode: 'interface', interfaceName: 'GigabitEthernet0/1' })
    expect(b).toMatch(/already in/i)
    expect(b).toMatch(/GigabitEthernet0\/1/)
  })

  it('infers priv_exec for show commands when fields missing', () => {
    const ctx = resolveCliModeContext({ answers: ['show ip route'], prompt: 'Display the routing table' })
    expect(ctx.mode).toBe('priv_exec')
    expect(ctx.prompt).toMatch(/#$/)
  })
})

describe('COMMAND_DRILLS mode annotations', () => {
  it('annotates every drill with explicit mode context', () => {
    for (const [oid, drills] of Object.entries(COMMAND_DRILLS)) {
      expect(drills.length).toBeGreaterThan(0)
      drills.forEach((d, i) => {
        expect(hasExplicitCliModeContext(d), `${oid}[${i}]`).toBe(true)
        expect(CLI_MODES[d.cliMode], `${oid}[${i}] mode`).toBeTruthy()
        expect(d.cliPrompt).toMatch(/[#>]$|\)$/)
        expect(d.cliModeBlurb).toMatch(/already in/i)
      })
    }
  })

  it('uses interface mode for ip address / no shut family', () => {
    const iface = COMMAND_DRILLS['1.6'].find(d => String(d.answer[0]).startsWith('ip address'))
    expect(iface.cliMode).toBe('interface')
    expect(iface.cliPrompt).toBe('R1(config-if)#')
  })

  it('uses mode_nav when entering interface / OSPF process', () => {
    const enterIf = COMMAND_DRILLS['1.6'][0]
    expect(enterIf.answerScope).toBe('mode_nav')
    expect(enterIf.cliMode).toBe('global_config')
    const ospf = COMMAND_DRILLS['3.4'][0]
    expect(ospf.answerScope).toBe('mode_nav')
  })
})

describe('CLI skill + hub wiring', () => {
  it('exports CLI questions with mode fields for every drill', () => {
    const built = buildCliSkillQuestions()
    const flat = Object.values(built).flat()
    expect(flat.length).toBeGreaterThan(40)
    for (const q of flat) {
      expect(isCliQuestion(q)).toBe(true)
      expect(hasExplicitCliModeContext(q)).toBe(true)
    }
    expect(CLI_SKILL_QUESTIONS['1.6'].length).toBe(COMMAND_DRILLS['1.6'].length)
  })

  it('command hub drill items carry prompts', () => {
    const items = buildDrillQuizItems()
    expect(items.every(i => i.cliPrompt && i.cliMode)).toBe(true)
  })
})
