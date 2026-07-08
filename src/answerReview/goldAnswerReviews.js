/**
 * Hand-authored gold answer reviews — override generator for high-traffic questions.
 */
import { ASAP_SCENARIO_GOLD } from './goldAnswerReviewsAsap.js'
import { BATCH2_GOLD } from './goldAnswerReviewsBatch2.js'
import { BATCH3_GOLD } from './goldAnswerReviewsBatch3.js'
import { BATCH4_GOLD } from './goldAnswerReviewsBatch4.js'
import { BATCH5_GOLD } from './goldAnswerReviewsBatch5.js'
import { BATCH6_GOLD } from './goldAnswerReviewsBatch6.js'
import { BATCH7_GOLD } from './goldAnswerReviewsBatch7.js'
import { BATCH8_GOLD } from './goldAnswerReviewsBatch8.js'
import { BATCH9_GOLD } from './goldAnswerReviewsBatch9.js'
import { BATCH10_GOLD } from './goldAnswerReviewsBatch10.js'
import { BATCH11_GOLD } from './goldAnswerReviewsBatch11.js'
import { BATCH12_GOLD } from './goldAnswerReviewsBatch12.js'
import { BATCH13_GOLD } from './goldAnswerReviewsBatch13.js'
import { BATCH14_GOLD } from './goldAnswerReviewsBatch14.js'
import { BATCH15_GOLD } from './goldAnswerReviewsBatch15.js'
import { BATCH16_GOLD } from './goldAnswerReviewsBatch16.js'
import { BATCH17_GOLD } from './goldAnswerReviewsBatch17.js'
import { BATCH18_GOLD } from './goldAnswerReviewsBatch18.js'
import { BATCH19_GOLD } from './goldAnswerReviewsBatch19.js'
import { BATCH20_GOLD } from './goldAnswerReviewsBatch20.js'
import { BATCH21_GOLD } from './goldAnswerReviewsBatch21.js'
import { BATCH22_GOLD } from './goldAnswerReviewsBatch22.js'
import { BATCH23_GOLD } from './goldAnswerReviewsBatch23.js'
import { BATCH24_GOLD } from './goldAnswerReviewsBatch24.js'
import { BATCH25_GOLD } from './goldAnswerReviewsBatch25.js'
import { BATCH26_GOLD } from './goldAnswerReviewsBatch26.js'
import { BATCH27_GOLD } from './goldAnswerReviewsBatch27.js'
import { BATCH28_GOLD } from './goldAnswerReviewsBatch28.js'
import { BATCH29_GOLD } from './goldAnswerReviewsBatch29.js'
import { BATCH30_GOLD } from './goldAnswerReviewsBatch30.js'
import { CURATED61_GOLD } from './goldAnswerReviewsCurated61.js'
import { HIGH_TRAFFIC_GOLD } from './goldAnswerReviewsHighTraffic.js'
import { WLAN_58_GOLD } from './goldAnswerReviewsWlan58.js'
import { WLAN_AUTOMATION_POLISH_GOLD } from './goldAnswerReviewsWlanAutomationPolish.js'
import { SECURITY_IPV6_POLISH_GOLD } from './goldAnswerReviewsSecurityIpv6Polish.js'
import { WAVE15_SKILL_DESIGN_GOLD } from './goldAnswerReviewsWave15.js'
import { WAVE16_SKILL_DESIGN_GOLD } from './goldAnswerReviewsWave16.js'
import { PLACEMENT_TRAP_GOLD } from './goldAnswerReviewsPlacementTraps.js'
import { PLACEMENT_TRAP_GOLD_BATCH2 } from './goldAnswerReviewsPlacementTrapsBatch2.js'
import { PLACEMENT_TRAP_GOLD_BATCH3 } from './goldAnswerReviewsPlacementTrapsBatch3.js'

export const GOLD_ANSWER_REVIEWS = {
  '1.5-c-q3': {
    correct: {
      choiceIndex: 2,
      explanation: 'Unknown unicast frames are flooded out every port in the same VLAN except the ingress port.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Switches do not drop unknown unicast frames by default. With no CAM entry for the destination MAC, the switch treats it as unknown unicast and floods the frame within the VLAN so the destination can reply and be learned.',
        misconceptionTested: 'Assuming unknown destination means drop/filter',
      },
      {
        choiceIndex: 1,
        explanation: 'Ethernet switching is not echo/reply at Layer 2. The switch does not bounce the frame back to the sender; it floods it so hosts on other ports can see it.',
        misconceptionTested: 'Confusing switch behavior with ping/ICMP reply thinking',
      },
      {
        choiceIndex: 3,
        explanation: 'The default gateway is a Layer 3 router role for inter-subnet traffic. This is a Layer 2 switch decision for an unknown MAC inside the same VLAN — flood locally, do not hand off to a gateway.',
        misconceptionTested: 'Dragging routing/default-gateway logic into a pure L2 forwarding question',
      },
    ],
    examTip: 'Unknown unicast → flood (same VLAN, except ingress). Known unicast → forward one port.',
  },
  'obj-2.5-source-q043': {
    correct: {
      choiceIndex: 3,
      explanation: 'Remove BPDU Guard with `no spanning-tree bpduguard` (or the platform-equivalent negation under the interface).',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '`switchport bpduguard` is not valid syntax — BPDU Guard is configured with `spanning-tree bpduguard` on the interface, and this option also misspells the keyword.',
        misconceptionTested: 'Inventing switchport syntax for a spanning-tree feature',
      },
      {
        choiceIndex: 1,
        explanation: 'This `spanning-tree bpduguard disable` line matches the keyed correct syntax, but choice D is the scored answer when two options repeat the same BPDU Guard command — pick the letter the question marks correct.',
        misconceptionTested: 'Selecting a duplicate correct-looking option when only one letter is keyed',
        whyWrongHere: 'Both B and D show the same BPDU Guard removal syntax — only the keyed letter (D) is scored on this stem.',
      },
      {
        choiceIndex: 2,
        explanation: '`no switchport bpduguard` targets the wrong feature namespace — BPDU Guard is removed with `no spanning-tree bpduguard`, not a switchport subcommand.',
        misconceptionTested: 'Using switchport negation instead of spanning-tree bpduguard syntax',
      },
    ],
    examTip: 'BPDU Guard lives under `spanning-tree bpduguard` on the interface — remove it with the matching `no` form.',
  },
  '1.1-c-q3': {
    correct: {
      choiceIndex: 1,
      explanation: 'An L3 switch uses SVIs to route between VLANs locally without an external router.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Port mirroring copies frames to a monitor port for analysis — it does not route traffic between VLAN 10 and VLAN 20.',
        misconceptionTested: 'Confusing traffic capture with inter-VLAN routing',
      },
      {
        choiceIndex: 2,
        explanation: 'Spanning Tree prevents Layer 2 loops — it does not provide inter-VLAN routing or replace an SVI on a Layer 3 switch.',
        misconceptionTested: 'Expecting STP to route between VLANs',
      },
      {
        choiceIndex: 3,
        explanation: 'EtherChannel bundles links for bandwidth and redundancy — it is not the feature that routes between VLANs on one campus switch.',
        misconceptionTested: 'Using link aggregation where L3 SVI routing is required',
      },
    ],
    examTip: 'Inter-VLAN on one switch without external router → SVI on an L3 switch.',
  },
  ...ASAP_SCENARIO_GOLD,
  ...HIGH_TRAFFIC_GOLD,
  ...WLAN_58_GOLD,
  ...BATCH2_GOLD,
  ...BATCH3_GOLD,
  ...BATCH4_GOLD,
  ...BATCH5_GOLD,
  ...BATCH6_GOLD,
  ...BATCH7_GOLD,
  ...BATCH8_GOLD,
  ...BATCH9_GOLD,
  ...BATCH10_GOLD,
  ...BATCH11_GOLD,
  ...BATCH12_GOLD,
  ...BATCH13_GOLD,
  ...BATCH14_GOLD,
  ...BATCH15_GOLD,
  ...BATCH16_GOLD,
  ...BATCH17_GOLD,
  ...BATCH18_GOLD,
  ...BATCH19_GOLD,
  ...BATCH20_GOLD,
  ...BATCH21_GOLD,
  ...BATCH22_GOLD,
  ...BATCH23_GOLD,
  ...BATCH24_GOLD,
  ...BATCH25_GOLD,
  ...BATCH26_GOLD,
  ...BATCH27_GOLD,
  ...BATCH28_GOLD,
  ...BATCH29_GOLD,
  ...BATCH30_GOLD,
  ...CURATED61_GOLD,
  ...WLAN_AUTOMATION_POLISH_GOLD,
  ...SECURITY_IPV6_POLISH_GOLD,
  ...WAVE15_SKILL_DESIGN_GOLD,
  ...WAVE16_SKILL_DESIGN_GOLD,
  ...PLACEMENT_TRAP_GOLD,
  ...PLACEMENT_TRAP_GOLD_BATCH2,
  ...PLACEMENT_TRAP_GOLD_BATCH3,
}

export function goldAnswerReviewFor(questionId) {
  return GOLD_ANSWER_REVIEWS[questionId] || null
}
