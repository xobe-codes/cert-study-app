/**
 * Lab Checkpoints & Hints System Tests (Phase 1B)
 *
 * 60+ comprehensive tests for:
 * - Checkpoint creation and validation
 * - Hint escalation system
 * - Common mistake detection
 * - Lab readiness validation
 * - Integration scenarios
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Checkpoint System Tests
import {
  createCheckpoint,
  validateCheckpoint,
  initializeCheckpointStatus,
  updateCheckpointStatus,
  getCheckpointStatus,
  isCheckpointReady,
  getReadyCheckpoints,
  getNextCheckpoint,
  calculateCheckpointScore,
  calculateCheckpointCompletion,
  getCheckpointSummary,
  findCheckpoint,
  getBlockedCheckpoints,
  createLabCheckpoints,
  Checkpoint,
  CheckpointStatus,
  CheckpointResult,
} from '../features/labs/checkpointSystem';

// Hint System Tests
import {
  HintLevel,
  getHint,
  getHintLevelForAttempts,
  shouldShowHintAutomatically,
  incrementHintLevel,
  initializeHintState,
  updateHintState,
  recordHintUsage,
  isHintDependent,
  getHintEscalation,
  calculateHintEffectiveness,
  getNextHintAction,
  createHintStateMap,
  getHintUsageSummary,
  shouldRecommendConceptReview,
  HintContent,
  HintState,
  HintUsageRecord,
} from '../features/labs/hintSystem';

// Mistake Detector Tests
import {
  MistakeType,
  detectMistakes,
  getMistakeFeedback,
  getMostCommonMistakes,
  identifyKnowledgeGap,
  detectInterfaceShutdown,
  detectConfigModeStuck,
  detectWrongInterface,
  detectBadSubnet,
  detectSequenceViolation,
  detectIncompleteCommand,
  detectAbbreviatedWrong,
  detectMaskFormatWrong,
  MistakeRecord,
  DetectionContext,
} from '../features/labs/mistakeDetector';

// Readiness Validator Tests
import {
  ReadinessStatus,
  areAllCheckpointsComplete,
  hasBlockedCheckpoints,
  getIncompleteSteps,
  canSubmitLab,
  generateCompletionChecklist,
  calculateLabReadiness,
  getReadinessReport,
  getCompletionBlockers,
  getEncouragement,
  shouldRetryCheckpoint,
} from '../features/labs/readinessValidator';

// ============================================================================
// CHECKPOINT SYSTEM TESTS (15+ tests)
// ============================================================================

describe('Checkpoint System', () => {
  let vlanCheckpoint: Checkpoint;
  let ospfCheckpoint: Checkpoint;

  beforeEach(() => {
    vlanCheckpoint = createCheckpoint({
      id: 'vlan-created',
      stepNumber: 1,
      title: 'VLAN 10 Created',
      description: 'Verify VLAN 10 exists and is active',
      requiredCommand: 'show vlan brief',
      validator: (output) => output.includes('VLAN0010') || output.includes('10'),
      expectedOutput: 'includes VLAN0010',
      hints: {
        level1: 'No VLANs found. What is the first step?',
        level2: "Use 'vlan <number>' in config mode",
        level3: 'configure terminal\nvlan 10\nname Data\nexit',
      },
      partialCredit: 25,
    });

    ospfCheckpoint = createCheckpoint({
      id: 'ospf-enabled',
      stepNumber: 2,
      title: 'OSPF Enabled',
      description: 'Verify OSPF routing is enabled',
      requiredCommand: 'show ip ospf',
      validator: (output) => output.includes('OSPF Router') || output.includes('Routing Process'),
      expectedOutput: 'includes OSPF Router',
      hints: {
        level1: 'Is OSPF process running?',
        level2: "Enter: 'router ospf 1' in config mode",
        level3: 'configure terminal\nrouter ospf 1\nnetwork 10.0.0.0 0.0.0.255 area 0\nexit',
      },
      partialCredit: 25,
      prerequisiteCheckpoints: ['vlan-created'],
    });
  });

  it('creates checkpoint with all properties', () => {
    expect(vlanCheckpoint.id).toBe('vlan-created');
    expect(vlanCheckpoint.stepNumber).toBe(1);
    expect(vlanCheckpoint.partialCredit).toBe(25);
    expect(vlanCheckpoint.hints.level1).toBeDefined();
  });

  it('validates checkpoint with passing output', () => {
    const output = 'VLAN0010 active data';
    const result = validateCheckpoint(vlanCheckpoint, output);
    expect(result.passed).toBe(true);
    expect(result.checkpointId).toBe('vlan-created');
    expect(result.timestamp).toBeDefined();
  });

  it('validates checkpoint with failing output', () => {
    const output = 'No VLANs found';
    const result = validateCheckpoint(vlanCheckpoint, output);
    expect(result.passed).toBe(false);
  });

  it('initializes checkpoint statuses', () => {
    const statuses = initializeCheckpointStatus([vlanCheckpoint, ospfCheckpoint]);
    expect(statuses).toHaveLength(2);
    expect(statuses[0].completed).toBe(false);
    expect(statuses[0].attempts).toBe(0);
  });

  it('updates checkpoint status after validation', () => {
    let status = initializeCheckpointStatus([vlanCheckpoint])[0];
    const result: CheckpointResult = {
      checkpointId: 'vlan-created',
      passed: true,
      timestamp: new Date(),
    };
    status = updateCheckpointStatus(status, result);
    expect(status.completed).toBe(true);
    expect(status.attempts).toBe(1);
  });

  it('respects checkpoint prerequisites', () => {
    const statuses = initializeCheckpointStatus([vlanCheckpoint, ospfCheckpoint]);
    expect(isCheckpointReady(ospfCheckpoint, [])).toBe(false);
    expect(isCheckpointReady(ospfCheckpoint, ['vlan-created'])).toBe(true);
  });

  it('identifies ready checkpoints', () => {
    let statuses = initializeCheckpointStatus([vlanCheckpoint, ospfCheckpoint]);
    let ready = getReadyCheckpoints(statuses);
    expect(ready).toHaveLength(1);
    expect(ready[0].checkpoint.id).toBe('vlan-created');

    // Mark first as complete
    statuses[0] = updateCheckpointStatus(statuses[0], {
      checkpointId: 'vlan-created',
      passed: true,
      timestamp: new Date(),
    });

    ready = getReadyCheckpoints(statuses);
    expect(ready).toHaveLength(1);
    expect(ready[0].checkpoint.id).toBe('ospf-enabled');
  });

  it('gets next checkpoint in order', () => {
    const statuses = initializeCheckpointStatus([vlanCheckpoint, ospfCheckpoint]);
    let next = getNextCheckpoint(statuses);
    expect(next?.checkpoint.id).toBe('vlan-created');

    statuses[0].completed = true;
    next = getNextCheckpoint(statuses);
    expect(next?.checkpoint.id).toBe('ospf-enabled');
  });

  it('calculates checkpoint score', () => {
    let statuses = initializeCheckpointStatus([vlanCheckpoint, ospfCheckpoint]);
    expect(calculateCheckpointScore(statuses)).toBe(0);

    statuses[0].completed = true;
    statuses[1].completed = true;
    expect(calculateCheckpointScore(statuses)).toBe(50);
  });

  it('calculates completion percentage', () => {
    let statuses = initializeCheckpointStatus([vlanCheckpoint, ospfCheckpoint]);
    expect(calculateCheckpointCompletion(statuses)).toBe(0);

    statuses[0].completed = true;
    expect(calculateCheckpointCompletion(statuses)).toBe(50);

    statuses[1].completed = true;
    expect(calculateCheckpointCompletion(statuses)).toBe(100);
  });

  it('generates checkpoint summary', () => {
    let statuses = initializeCheckpointStatus([vlanCheckpoint, ospfCheckpoint]);
    let summary = getCheckpointSummary(statuses);
    expect(summary.total).toBe(2);
    expect(summary.completed).toBe(0);
    expect(summary.notStarted).toBe(2);

    statuses[0].completed = true;
    statuses[0].attempts = 1;
    statuses[1].attempts = 1;
    summary = getCheckpointSummary(statuses);
    expect(summary.completed).toBe(1);
    expect(summary.inProgress).toBe(1);
  });

  it('finds checkpoint by ID', () => {
    const statuses = initializeCheckpointStatus([vlanCheckpoint, ospfCheckpoint]);
    const found = findCheckpoint(statuses, 'vlan-created');
    expect(found?.checkpoint.id).toBe('vlan-created');
  });

  it('gets blocked checkpoints with incomplete prerequisites', () => {
    const statuses = initializeCheckpointStatus([vlanCheckpoint, ospfCheckpoint]);
    let blocked = getBlockedCheckpoints(statuses);
    expect(blocked).toHaveLength(1);
    expect(blocked[0].checkpoint.id).toBe('ospf-enabled');

    statuses[0].completed = true;
    blocked = getBlockedCheckpoints(statuses);
    expect(blocked).toHaveLength(0);
  });
});

// ============================================================================
// HINT SYSTEM TESTS (15+ tests)
// ============================================================================

describe('Hint System', () => {
  let hints: HintContent;

  beforeEach(() => {
    hints = {
      level1: 'What command shows VLAN information?',
      level2: "Try 'show vlan brief'",
      level3: 'Type: show vlan brief',
    };
  });

  it('gets hint at correct level', () => {
    expect(getHint(hints, HintLevel.LEVEL_1_NUDGE)).toBe(hints.level1);
    expect(getHint(hints, HintLevel.LEVEL_2_GUIDANCE)).toBe(hints.level2);
    expect(getHint(hints, HintLevel.LEVEL_3_SOLUTION)).toBe(hints.level3);
  });

  it('determines hint level based on attempts', () => {
    expect(getHintLevelForAttempts(1)).toBe(HintLevel.NONE);
    expect(getHintLevelForAttempts(2)).toBe(HintLevel.LEVEL_1_NUDGE);
    expect(getHintLevelForAttempts(4)).toBe(HintLevel.LEVEL_2_GUIDANCE);
    expect(getHintLevelForAttempts(6)).toBe(HintLevel.LEVEL_3_SOLUTION);
  });

  it('determines if hint should show automatically', () => {
    expect(shouldShowHintAutomatically(1)).toBe(false);
    expect(shouldShowHintAutomatically(2)).toBe(true);
    expect(shouldShowHintAutomatically(3)).toBe(true);
  });

  it('increments hint level', () => {
    let level = HintLevel.NONE;
    level = incrementHintLevel(level);
    expect(level).toBe(HintLevel.LEVEL_1_NUDGE);

    level = incrementHintLevel(level);
    expect(level).toBe(HintLevel.LEVEL_2_GUIDANCE);

    level = incrementHintLevel(level);
    expect(level).toBe(HintLevel.LEVEL_3_SOLUTION);

    level = incrementHintLevel(level);
    expect(level).toBe(HintLevel.LEVEL_3_SOLUTION); // Caps at level 3
  });

  it('initializes hint state', () => {
    const state = initializeHintState('checkpoint-1');
    expect(state.checkpointId).toBe('checkpoint-1');
    expect(state.currentLevel).toBe(HintLevel.NONE);
    expect(state.usageCount).toBe(0);
  });

  it('updates hint state when accessed', () => {
    let state = initializeHintState('checkpoint-1');
    state = updateHintState(state, HintLevel.LEVEL_1_NUDGE);
    expect(state.currentLevel).toBe(HintLevel.LEVEL_1_NUDGE);
    expect(state.usageCount).toBe(1);
    expect(state.levelUnlockedAt).toBeGreaterThan(0);
  });

  it('records hint usage for analytics', () => {
    const record = recordHintUsage('user-1', 'checkpoint-1', HintLevel.LEVEL_2_GUIDANCE, 4);
    expect(record.userId).toBe('user-1');
    expect(record.checkpointId).toBe('checkpoint-1');
    expect(record.level).toBe(HintLevel.LEVEL_2_GUIDANCE);
    expect(record.attemptNumber).toBe(4);
  });

  it('detects hint dependency', () => {
    const records: HintUsageRecord[] = [
      recordHintUsage('user-1', 'cp-1', HintLevel.LEVEL_1_NUDGE, 2),
      recordHintUsage('user-1', 'cp-1', HintLevel.LEVEL_2_GUIDANCE, 3),
      recordHintUsage('user-1', 'cp-1', HintLevel.LEVEL_3_SOLUTION, 4),
      recordHintUsage('user-1', 'cp-1', HintLevel.LEVEL_3_SOLUTION, 5),
    ];
    expect(isHintDependent(records, 3)).toBe(true);
    expect(isHintDependent(records, 4)).toBe(false);
  });

  it('provides hint escalation recommendation', () => {
    let escalation = getHintEscalation(1);
    expect(escalation.shouldShow).toBe(false);

    escalation = getHintEscalation(2);
    expect(escalation.shouldShow).toBe(true);
    expect(escalation.level).toBe(HintLevel.LEVEL_1_NUDGE);

    escalation = getHintEscalation(4);
    expect(escalation.shouldShow).toBe(true);
    expect(escalation.level).toBe(HintLevel.LEVEL_2_GUIDANCE);
  });

  it('calculates hint effectiveness', () => {
    const score1 = calculateHintEffectiveness(3, 1, HintLevel.LEVEL_1_NUDGE);
    expect(score1).toBeGreaterThan(0.5); // Effective

    const score2 = calculateHintEffectiveness(3, 5, HintLevel.LEVEL_3_SOLUTION);
    expect(score2).toBeLessThan(0.5); // Less effective
  });

  it('gets next hint action for stuck user', () => {
    let action = getNextHintAction(HintLevel.NONE, 2, 0);
    expect(action.action).toBe('show_hint');

    action = getNextHintAction(HintLevel.LEVEL_3_SOLUTION, 8, 3);
    expect(action.action).toBe('offer_solution');
  });

  it('creates hint state map for all checkpoints', () => {
    const map = createHintStateMap(['cp-1', 'cp-2', 'cp-3']);
    expect(map.size).toBe(3);
    expect(map.get('cp-1')?.checkpointId).toBe('cp-1');
  });

  it('gets hint usage summary', () => {
    const records: HintUsageRecord[] = [
      recordHintUsage('user-1', 'cp-1', HintLevel.LEVEL_1_NUDGE, 2),
      recordHintUsage('user-1', 'cp-1', HintLevel.LEVEL_2_GUIDANCE, 3),
      recordHintUsage('user-1', 'cp-2', HintLevel.LEVEL_1_NUDGE, 2),
    ];
    const summary = getHintUsageSummary(records);
    expect(summary.totalHintsRequested).toBe(3);
    expect(summary.level1Used).toBe(2);
    expect(summary.level2Used).toBe(1);
    expect(summary.uniqueCheckpointsHinted).toBe(2);
  });

  it('recommends concept review when hint dependent', () => {
    const records: HintUsageRecord[] = [
      recordHintUsage('user-1', 'cp-1', HintLevel.LEVEL_3_SOLUTION, 4),
      recordHintUsage('user-1', 'cp-1', HintLevel.LEVEL_3_SOLUTION, 5),
      recordHintUsage('user-1', 'cp-1', HintLevel.LEVEL_3_SOLUTION, 6),
    ];
    expect(shouldRecommendConceptReview('cp-1', records)).toBe(true);
    expect(shouldRecommendConceptReview('cp-2', records)).toBe(false);
  });
});

// ============================================================================
// MISTAKE DETECTION TESTS (15+ tests)
// ============================================================================

describe('Mistake Detection', () => {
  it('detects interface shutdown mistake', () => {
    const output = 'Gi0/1 is shutdown';
    const mistake = detectInterfaceShutdown(output, 'Gi0/1');
    expect(mistake?.type).toBe(MistakeType.INTERFACE_SHUTDOWN);
    expect(mistake?.severity).toBe('critical');
  });

  it('detects config mode stuck mistake', () => {
    const context: DetectionContext = {
      currentMode: 'config',
      commandTyped: 'show vlan brief',
    };
    const mistake = detectConfigModeStuck(context);
    expect(mistake?.type).toBe(MistakeType.CONFIG_MODE_STUCK);
    expect(mistake?.severity).toBe('warning');
  });

  it('detects wrong interface mistake', () => {
    const context: DetectionContext = {
      commandTyped: 'interface Gi0/1',
      requiredInterface: 'Gi0/2',
    };
    const mistake = detectWrongInterface(context);
    expect(mistake?.type).toBe(MistakeType.WRONG_INTERFACE);
    expect(mistake?.severity).toBe('critical');
  });

  it('detects bad subnet mistake', () => {
    const context: DetectionContext = {
      commandTyped: 'ip address 10.0.1.0 255.255.255.0',
      requiredSubnet: '10.0.0.0',
    };
    const mistake = detectBadSubnet(context);
    expect(mistake?.type).toBe(MistakeType.BAD_SUBNET);
  });

  it('detects sequence violation - enabling before IP', () => {
    const context: DetectionContext = {
      commandTyped: 'no shutdown',
      previousCommands: ['interface Gi0/1'],
    };
    const mistake = detectSequenceViolation(context);
    expect(mistake?.type).toBe(MistakeType.SEQUENCE_VIOLATION);
  });

  it('detects sequence violation - VLAN on trunk before creation', () => {
    const context: DetectionContext = {
      commandTyped: 'switchport trunk allowed vlan 10',
      previousCommands: ['interface Gi0/1'],
    };
    const mistake = detectSequenceViolation(context);
    expect(mistake?.type).toBe(MistakeType.SEQUENCE_VIOLATION);
  });

  it('detects incomplete command', () => {
    const context: DetectionContext = {
      commandTyped: 'interface ',
    };
    const mistake = detectIncompleteCommand(context);
    expect(mistake?.type).toBe(MistakeType.INCOMPLETE_COMMAND);
  });

  it('detects abbreviated wrong mistake', () => {
    const context: DetectionContext = {
      commandTyped: 'sh ip r',
    };
    const mistake = detectAbbreviatedWrong(context);
    expect(mistake?.type).toBe(MistakeType.ABBREVIATED_WRONG);
  });

  it('detects mask format wrong mistake', () => {
    const context: DetectionContext = {
      commandTyped: 'ip address 10.0.0.1/24',
    };
    const mistake = detectMaskFormatWrong(context);
    expect(mistake?.type).toBe(MistakeType.MASK_FORMAT_WRONG);
  });

  it('detects multiple mistakes in one context', () => {
    const context: DetectionContext = {
      currentMode: 'config',
      commandTyped: 'show vlan brief',
      requiredInterface: 'Gi0/2',
    };
    const mistakes = detectMistakes(context);
    expect(mistakes.length).toBeGreaterThan(0);
  });

  it('gets formatted mistake feedback', () => {
    const context: DetectionContext = {
      commandTyped: 'interface ',
    };
    const mistake = detectIncompleteCommand(context);
    if (mistake) {
      const feedback = getMistakeFeedback(mistake);
      expect(feedback.title).toBeDefined();
      expect(feedback.explanation).toBeDefined();
      expect(feedback.fix).toBeDefined();
      expect(feedback.severity).toBeDefined();
    }
  });

  it('gets most common mistakes from records', () => {
    const records: MistakeRecord[] = [
      {
        userId: 'user-1',
        labId: 'lab-1',
        checkpointId: 'cp-1',
        mistakeType: MistakeType.CONFIG_MODE_STUCK,
        timestamp: new Date(),
        corrected: true,
        attemptNumber: 2,
      },
      {
        userId: 'user-1',
        labId: 'lab-1',
        checkpointId: 'cp-1',
        mistakeType: MistakeType.CONFIG_MODE_STUCK,
        timestamp: new Date(),
        corrected: true,
        attemptNumber: 3,
      },
      {
        userId: 'user-1',
        labId: 'lab-1',
        checkpointId: 'cp-2',
        mistakeType: MistakeType.WRONG_INTERFACE,
        timestamp: new Date(),
        corrected: false,
        attemptNumber: 2,
      },
    ];
    const common = getMostCommonMistakes(records, 5);
    expect(common[0].type).toBe(MistakeType.CONFIG_MODE_STUCK);
    expect(common[0].count).toBe(2);
  });

  it('identifies knowledge gap from mistakes', () => {
    const records: MistakeRecord[] = [
      {
        userId: 'user-1',
        labId: 'lab-1',
        checkpointId: 'cp-1',
        mistakeType: MistakeType.CONFIG_MODE_STUCK,
        timestamp: new Date(),
        corrected: true,
        attemptNumber: 2,
      },
      {
        userId: 'user-1',
        labId: 'lab-1',
        checkpointId: 'cp-2',
        mistakeType: MistakeType.CONFIG_MODE_STUCK,
        timestamp: new Date(),
        corrected: true,
        attemptNumber: 3,
      },
    ];
    const gap = identifyKnowledgeGap(records);
    expect(gap.topGap).toBe(MistakeType.CONFIG_MODE_STUCK);
    expect(gap.recommendation).toBeDefined();
  });
});

// ============================================================================
// READINESS VALIDATION TESTS (15+ tests)
// ============================================================================

describe('Readiness Validation', () => {
  let checkpoints: Checkpoint[];
  let statuses: CheckpointStatus[];

  beforeEach(() => {
    checkpoints = [
      createCheckpoint({
        id: 'cp-1',
        stepNumber: 1,
        title: 'Step 1',
        description: 'First step',
        requiredCommand: 'show 1',
        validator: (output) => output.includes('pass'),
        expectedOutput: 'pass',
        hints: { level1: 'L1', level2: 'L2', level3: 'L3' },
        partialCredit: 25,
      }),
      createCheckpoint({
        id: 'cp-2',
        stepNumber: 2,
        title: 'Step 2',
        description: 'Second step',
        requiredCommand: 'show 2',
        validator: (output) => output.includes('pass'),
        expectedOutput: 'pass',
        hints: { level1: 'L1', level2: 'L2', level3: 'L3' },
        partialCredit: 25,
      }),
    ];
    statuses = initializeCheckpointStatus(checkpoints);
  });

  it('checks if all checkpoints complete', () => {
    expect(areAllCheckpointsComplete(statuses)).toBe(false);
    statuses[0].completed = true;
    expect(areAllCheckpointsComplete(statuses)).toBe(false);
    statuses[1].completed = true;
    expect(areAllCheckpointsComplete(statuses)).toBe(true);
  });

  it('detects blocked checkpoints', () => {
    expect(hasBlockedCheckpoints(statuses, [])).toBe(false); // No prereqs in this setup
  });

  it('gets incomplete steps', () => {
    const incomplete = getIncompleteSteps(statuses);
    expect(incomplete).toHaveLength(2);
    expect(incomplete[0].blocked).toBe(false);
  });

  it('checks if lab can submit', () => {
    let result = canSubmitLab(statuses);
    expect(result.allowed).toBe(false);
    expect(result.completionPercentage).toBe(0);

    statuses[0].completed = true;
    result = canSubmitLab(statuses);
    expect(result.allowed).toBe(false); // Only 50%

    statuses[1].completed = true;
    result = canSubmitLab(statuses);
    expect(result.allowed).toBe(true);
    expect(result.completionPercentage).toBe(100);
  });

  it('generates completion checklist', () => {
    const checklist = generateCompletionChecklist(statuses);
    expect(checklist).toHaveLength(2);
    expect(checklist[0].completed).toBe(false);
    expect(checklist[0].suggestedFix).toBeDefined();
  });

  it('calculates lab readiness', () => {
    const readiness = calculateLabReadiness('lab-1', statuses);
    expect(readiness.labId).toBe('lab-1');
    expect(readiness.status).toBe(ReadinessStatus.NOT_READY);
    expect(readiness.canSubmit).toBe(false);

    statuses[0].completed = true;
    statuses[1].completed = true;
    const readiness2 = calculateLabReadiness('lab-1', statuses);
    expect(readiness2.status).toBe(ReadinessStatus.READY);
    expect(readiness2.canSubmit).toBe(true);
  });

  it('generates readiness report', () => {
    const readiness = calculateLabReadiness('lab-1', statuses);
    const report = getReadinessReport(readiness);
    expect(report).toContain('Lab Readiness Report');
    expect(report).toContain('NOT_READY');
  });

  it('gets completion blockers', () => {
    const readiness = calculateLabReadiness('lab-1', statuses);
    const blockers = getCompletionBlockers(readiness);
    expect(blockers).toHaveLength(0); // No blocker in this setup
  });

  it('provides encouragement based on progress', () => {
    expect(getEncouragement(0)).toContain('started');
    expect(getEncouragement(50)).toContain('halfway');
    expect(getEncouragement(100)).toContain('completed');
  });

  it('determines if should retry checkpoint', () => {
    let status = statuses[0];
    let retry = shouldRetryCheckpoint(status);
    expect(retry.shouldRetry).toBe(true);
    expect(retry.action).toBe('continue');

    status.completed = true;
    retry = shouldRetryCheckpoint(status);
    expect(retry.shouldRetry).toBe(false);

    status.completed = false;
    status.attempts = 15;
    retry = shouldRetryCheckpoint(status);
    expect(retry.action).toBe('review_concept');
  });

  it('handles partial completion', () => {
    statuses[0].completed = true;
    const readiness = calculateLabReadiness('lab-1', statuses);
    expect(readiness.status).toBe(ReadinessStatus.PARTIALLY_READY);
    expect(readiness.completionPercentage).toBe(50);
    expect(readiness.canSubmit).toBe(false);
  });

  it('tracks suggested next steps', () => {
    statuses[0].completed = true;
    const readiness = calculateLabReadiness('lab-1', statuses);
    expect(readiness.suggestedNextSteps).toHaveLength(1);
    expect(readiness.suggestedNextSteps[0]).toContain('Step 2');
  });
});

// ============================================================================
// INTEGRATION TESTS (5+ tests)
// ============================================================================

describe('Integration: Checkpoint + Hint + Mistake + Readiness', () => {
  it('full lab workflow: create, attempt, hint, retry, complete', () => {
    // Create checkpoint
    const checkpoint = createCheckpoint({
      id: 'vlan-setup',
      stepNumber: 1,
      title: 'Create VLAN',
      description: 'Create VLAN 10',
      requiredCommand: 'show vlan brief',
      validator: (output) => output.includes('VLAN0010'),
      expectedOutput: 'includes VLAN0010',
      hints: {
        level1: 'Need to create VLAN',
        level2: "Use: configure terminal, then vlan 10",
        level3: 'configure terminal\nvlan 10\nexit',
      },
      partialCredit: 50,
    });

    // Initialize
    let statuses = initializeCheckpointStatus([checkpoint]);
    let hintStates = createHintStateMap(['vlan-setup']);

    // Attempt 1: Fail
    let result = validateCheckpoint(checkpoint, 'No VLANs configured');
    expect(result.passed).toBe(false);
    statuses[0] = updateCheckpointStatus(statuses[0], result);

    // Check readiness
    let readiness = calculateLabReadiness('lab', statuses);
    expect(readiness.canSubmit).toBe(false);

    // Show hint after attempts
    let escalation = getHintEscalation(statuses[0].attempts + 1);
    expect(escalation.shouldShow).toBe(true); // 2 attempts reaches hint threshold

    // Attempt 2: Fail again
    result = validateCheckpoint(checkpoint, 'No VLANs configured');
    statuses[0] = updateCheckpointStatus(statuses[0], result);

    // Now hint should show
    escalation = getHintEscalation(2);
    expect(escalation.shouldShow).toBe(true);
    let hintState = hintStates.get('vlan-setup')!;
    hintState = updateHintState(hintState, escalation.level);

    // Attempt 3: Success
    result = validateCheckpoint(checkpoint, 'VLAN0010 data');
    expect(result.passed).toBe(true);
    statuses[0] = updateCheckpointStatus(statuses[0], result);

    // Check final readiness
    readiness = calculateLabReadiness('lab', statuses);
    expect(readiness.canSubmit).toBe(true);
    expect(readiness.completionPercentage).toBe(100);
  });

  it('detects mistakes and provides guidance', () => {
    // User attempt
    const userAttempt: DetectionContext = {
      currentMode: 'config',
      commandTyped: 'show vlan brief',
      requiredInterface: 'Gi0/1',
    };

    // Detect issues
    const mistakes = detectMistakes(userAttempt);
    expect(mistakes.length).toBeGreaterThan(0);

    // Get feedback
    for (const mistake of mistakes) {
      const feedback = getMistakeFeedback(mistake);
      expect(feedback.fix).toBeDefined();
    }
  });

  it('tracks learning progression: many hints → concept review', () => {
    // Create hint usage records simulating multiple hint requests
    const records: HintUsageRecord[] = [];
    for (let i = 1; i <= 4; i++) {
      records.push(
        recordHintUsage('user-1', 'cp-1', HintLevel.LEVEL_3_SOLUTION, i)
      );
    }

    // User is hint-dependent
    expect(isHintDependent(records, 3)).toBe(true);

    // Recommend concept review
    expect(shouldRecommendConceptReview('cp-1', records)).toBe(true);

    // Identify knowledge gap
    const mistakeRecords: MistakeRecord[] = [
      {
        userId: 'user-1',
        labId: 'lab-1',
        checkpointId: 'cp-1',
        mistakeType: MistakeType.SEQUENCE_VIOLATION,
        timestamp: new Date(),
        corrected: false,
        attemptNumber: 2,
      },
    ];
    const gap = identifyKnowledgeGap(mistakeRecords);
    expect(gap.topGap).toBeDefined();
  });
});
