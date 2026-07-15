/**
 * Lab System Integration Tests (Phase 1 Complete)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  LabService,
  StepResult,
  LabProgress,
  SubmissionResult,
} from '../features/labs/labService'
import { Checkpoint } from '../features/labs/checkpointSystem'
import {
  LAB_DEFINITIONS,
  VLAN_TRUNK_LAB,
  OSPF_ADJACENCY_LAB,
  NAT_PAT_LAB,
} from '../features/labs/labDefinitions'

describe('Lab System Integration', () => {
  let labService: LabService
  const testUserId = 'test-user-123'
  const testLabId = 'lab-vlan-trunk'

  beforeEach(() => {
    labService = new LabService()
  })

  describe('Lab Initialization', () => {
    it('should initialize a lab with checkpoints', () => {
      const state = labService.initializeLab(testLabId, testUserId, VLAN_TRUNK_LAB)

      expect(state.labId).toBe(testLabId)
      expect(state.userId).toBe(testUserId)
      expect(state.checkpoints).toHaveLength(4)
      expect(state.currentCheckpointIdx).toBe(0)
      expect(state.totalMistakes).toBe(0)
    })

    it('should initialize checkpoint progress for all checkpoints', () => {
      const state = labService.initializeLab(testLabId, testUserId, VLAN_TRUNK_LAB)
      const checkpointStatuses = labService.getCheckpointStatuses(testLabId, testUserId)

      expect(checkpointStatuses).toHaveLength(VLAN_TRUNK_LAB.length)
      checkpointStatuses.forEach((status) => {
        expect(status.completed).toBe(false)
        expect(status.attempts).toBe(0)
        expect(status.hintsUsed).toBe(0)
      })
    })
  })

  describe('Single Checkpoint Validation', () => {
    beforeEach(() => {
      labService.initializeLab(testLabId, testUserId, VLAN_TRUNK_LAB)
    })

    it('should validate a correct command submission', async () => {
      const result = await labService.runLabStep(
        testLabId,
        testUserId,
        'enable',
        'Password: '
      )

      expect(result.success).toBe(true)
      expect(result.checkpointId).toBe('vlan-trunk-1-enable')
      expect(result.userCommand).toBe('enable')
      expect(result.isCheckpointComplete).toBe(true)
      expect(result.partialCreditEarned).toBe(10)
    })

    it('should track failed command attempts', async () => {
      const result = await labService.runLabStep(
        testLabId,
        testUserId,
        'exit',
        'Error: Invalid command'
      )

      expect(result.success).toBe(true)
      expect(result.validationPassed).toBe(false)
      expect(result.isCheckpointComplete).toBe(false)

      const progress = labService.getLabProgress(testLabId, testUserId)
      expect(progress.checkpointsCompleted).not.toContain('vlan-trunk-1-enable')
    })

    it('should accept output with any content', async () => {
      const result = await labService.runLabStep(
        testLabId,
        testUserId,
        'enable',
        'Some output'
      )

      expect(result.isCheckpointComplete).toBe(true)
      expect(result.validationPassed).toBe(true)
    })
  })

  describe('Multi-Checkpoint Sequences', () => {
    beforeEach(() => {
      labService.initializeLab(testLabId, testUserId, VLAN_TRUNK_LAB)
    })

    it('should move to next checkpoint after completion', async () => {
      await labService.runLabStep(testLabId, testUserId, 'enable', 'Password: ')

      const currentCheckpoint = labService.getCurrentCheckpoint(testLabId, testUserId)
      expect(currentCheckpoint?.id).toBe('vlan-trunk-2-access-interface')
    })

    it('should enforce checkpoint prerequisites', async () => {
      const result = await labService.runLabStep(
        testLabId,
        testUserId,
        'configure terminal',
        '(config)#'
      )

      expect(result.isCheckpointComplete).toBe(false)
    })

    it('should complete full lab sequence', async () => {
      const commands = [
        { cmd: 'enable', out: 'Password: ' },
        { cmd: 'configure terminal', out: '(config)#' },
        { cmd: 'interface gi0/1', out: '(config-if)#' },
        { cmd: 'switchport mode trunk', out: 'trunk configured' },
      ]

      for (const { cmd, out } of commands) {
        const result = await labService.runLabStep(testLabId, testUserId, cmd, out)
        expect(result.success).toBe(true)
      }

      const progress = labService.getLabProgress(testLabId, testUserId)
      expect(progress.checkpointsCompleted).toHaveLength(4)
      expect(progress.percentComplete).toBe(100)
    })
  })

  describe('Hint System Integration', () => {
    beforeEach(() => {
      labService.initializeLab(testLabId, testUserId, VLAN_TRUNK_LAB)
    })

    it('should provide level 1 hint', () => {
      const hint = labService.getHint(testLabId, testUserId, 1)
      expect(hint).toBeDefined()
      expect(hint.length).toBeGreaterThan(0)
    })

    it('should provide level 2 hint', () => {
      const hint = labService.getHint(testLabId, testUserId, 2)
      expect(hint).toBeDefined()
    })

    it('should provide level 3 hint with exact command', () => {
      const hint = labService.getHint(testLabId, testUserId, 3)
      expect(hint).toBeDefined()
    })

    it('should track hint usage', async () => {
      labService.getHint(testLabId, testUserId, 1)
      labService.getHint(testLabId, testUserId, 2)

      const statuses = labService.getCheckpointStatuses(testLabId, testUserId)
      const firstCheckpoint = statuses[0]
      expect(firstCheckpoint.hintsUsed).toBe(2)
    })
  })

  describe('Submission Readiness', () => {
    beforeEach(() => {
      labService.initializeLab(testLabId, testUserId, VLAN_TRUNK_LAB)
    })

    it('should not be ready before completion', () => {
      const progress = labService.getLabProgress(testLabId, testUserId)
      expect(progress.checkpointsCompleted).toHaveLength(0)
    })

    it('should be ready after all checkpoints complete', async () => {
      const commands = [
        { cmd: 'enable', out: 'Password: ' },
        { cmd: 'configure terminal', out: '(config)#' },
        { cmd: 'interface gi0/1', out: '(config-if)#' },
        { cmd: 'switchport mode trunk', out: 'trunk configured' },
      ]

      for (const { cmd, out } of commands) {
        await labService.runLabStep(testLabId, testUserId, cmd, out)
      }

      const progress = labService.getLabProgress(testLabId, testUserId)
      expect(progress.percentComplete).toBe(100)
    })
  })

  describe('Lab Submission', () => {
    beforeEach(() => {
      labService.initializeLab(testLabId, testUserId, VLAN_TRUNK_LAB)
    })

    it('should calculate submission score', async () => {
      const commands = [
        { cmd: 'enable', out: 'Password: ' },
        { cmd: 'configure terminal', out: '(config)#' },
        { cmd: 'interface gi0/1', out: '(config-if)#' },
        { cmd: 'switchport mode trunk', out: 'trunk configured' },
      ]

      for (const { cmd, out } of commands) {
        await labService.runLabStep(testLabId, testUserId, cmd, out)
      }

      const result = labService.submitLab(testLabId, testUserId)
      expect(result.submitted).toBe(true)
      expect(result.overallScore).toBeGreaterThanOrEqual(0)
      expect(result.overallScore).toBeLessThanOrEqual(100)
      expect(result.completedCheckpoints).toBe(4)
      expect(result.passedLab).toBe(true)
    })

    it('should fail submission with incomplete lab', () => {
      labService.runLabStep(testLabId, testUserId, 'enable', 'Password: ')

      const result = labService.submitLab(testLabId, testUserId)
      expect(result.passedLab).toBe(false)
      expect(result.completedCheckpoints).toBe(1)
    })
  })

  describe('End-to-End Lab Workflows', () => {
    it('should complete VLAN Trunk lab', async () => {
      const labId = 'lab-vlan-trunk'
      labService.initializeLab(labId, testUserId, VLAN_TRUNK_LAB)

      const commands = [
        'enable',
        'configure terminal',
        'interface gi0/1',
        'switchport mode trunk',
      ]

      for (let i = 0; i < commands.length; i++) {
        const checkpoint = labService.getCurrentCheckpoint(labId, testUserId)
        expect(checkpoint).toBeDefined()

        const output = 'Success output'
        await labService.runLabStep(labId, testUserId, commands[i], output)
      }

      const result = labService.submitLab(labId, testUserId)
      expect(result.passedLab).toBe(true)
    })

    it('should complete OSPF Adjacency lab', async () => {
      const labId = 'lab-ospf-adjacency'
      labService.initializeLab(labId, testUserId, OSPF_ADJACENCY_LAB)

      const commands = [
        'enable',
        'configure terminal',
        'router ospf 1',
        'network 10.0.1.0 0.0.0.255 area 0',
        'show ip ospf neighbor',
      ]

      for (let i = 0; i < commands.length; i++) {
        const checkpoint = labService.getCurrentCheckpoint(labId, testUserId)
        expect(checkpoint).toBeDefined()

        let output = 'output'
        if (commands[i].includes('ospf neighbor')) {
          output = '2.2.2.2\t1\tFULL/DR\t00:00:35'
        }
        await labService.runLabStep(labId, testUserId, commands[i], output)
      }

      const result = labService.submitLab(labId, testUserId)
      expect(result.passedLab).toBe(true)
    })

    it('should complete NAT/PAT lab', async () => {
      const labId = 'lab-nat-pat'
      labService.initializeLab(labId, testUserId, NAT_PAT_LAB)

      const commands = [
        'enable',
        'configure terminal',
        'ip access-list standard NAT_ACL',
        'permit 192.168.1.0 0.0.0.255',
        'ip nat inside source list NAT_ACL interface gi0/0 overload',
        'show ip nat statistics',
      ]

      for (let i = 0; i < commands.length; i++) {
        const checkpoint = labService.getCurrentCheckpoint(labId, testUserId)
        expect(checkpoint).toBeDefined()

        let output = 'output'
        if (commands[i].includes('nat statistics')) {
          output = 'NAT Enabled\nActive translations: 5'
        }
        await labService.runLabStep(labId, testUserId, commands[i], output)
      }

      const result = labService.submitLab(labId, testUserId)
      expect(result.passedLab).toBe(true)
    })
  })

  describe('Session Management', () => {
    it('should clear session', () => {
      labService.initializeLab(testLabId, testUserId, VLAN_TRUNK_LAB)
      const cleared = labService.clearSession(testLabId, testUserId)
      expect(cleared).toBe(true)
    })

    it('should reset checkpoint', () => {
      labService.initializeLab(testLabId, testUserId, VLAN_TRUNK_LAB)
      labService.runLabStep(testLabId, testUserId, 'enable', 'Password: ')

      const reset = labService.resetCheckpoint(testLabId, testUserId)
      expect(reset).toBe(true)

      const statuses = labService.getCheckpointStatuses(testLabId, testUserId)
      const firstCheckpoint = statuses[0]
      expect(firstCheckpoint.completed).toBe(true)
    })
  })

  describe('Lab Definitions', () => {
    it('should have all lab definitions', () => {
      expect(LAB_DEFINITIONS).toHaveLength(3)
    })

    it('should have VLAN Trunk lab', () => {
      const lab = LAB_DEFINITIONS.find((l) => l.id === 'lab-vlan-trunk')
      expect(lab).toBeDefined()
      expect(lab?.checkpoints).toHaveLength(4)
    })

    it('should have OSPF lab', () => {
      const lab = LAB_DEFINITIONS.find((l) => l.id === 'lab-ospf-adjacency')
      expect(lab).toBeDefined()
      expect(lab?.checkpoints).toHaveLength(5)
    })

    it('should have NAT/PAT lab', () => {
      const lab = LAB_DEFINITIONS.find((l) => l.id === 'lab-nat-pat')
      expect(lab).toBeDefined()
      expect(lab?.checkpoints).toHaveLength(6)
    })

    it('should have proper lab metadata', () => {
      LAB_DEFINITIONS.forEach((lab) => {
        expect(lab.id).toBeDefined()
        expect(lab.title).toBeDefined()
        expect(lab.description).toBeDefined()
        expect(lab.difficulty).toMatch(/beginner|intermediate|advanced/)
        expect(lab.checkpoints.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Progress Tracking', () => {
    beforeEach(() => {
      labService.initializeLab(testLabId, testUserId, VLAN_TRUNK_LAB)
    })

    it('should track partial progress', async () => {
      await labService.runLabStep(testLabId, testUserId, 'enable', 'Password: ')
      await labService.runLabStep(testLabId, testUserId, 'configure terminal', '(config)#')

      const progress = labService.getLabProgress(testLabId, testUserId)
      expect(progress.checkpointsCompleted).toHaveLength(2)
      expect(progress.percentComplete).toBe(50)
      expect(progress.totalCheckpoints).toBe(4)
    })

    it('should provide current checkpoint ID', () => {
      const progress = labService.getLabProgress(testLabId, testUserId)
      expect(progress.currentCheckpointId).toBe('vlan-trunk-1-enable')
    })
  })
})
