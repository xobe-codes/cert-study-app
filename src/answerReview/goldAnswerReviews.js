/**
 * Hand-authored gold answer reviews — override generator for high-traffic questions.
 */
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
}

export function goldAnswerReviewFor(questionId) {
  return GOLD_ANSWER_REVIEWS[questionId] || null
}
