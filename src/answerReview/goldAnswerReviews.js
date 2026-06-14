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
      choiceIndex: 0,
      explanation: 'Layer 3 switches provide inter-VLAN routing at switching speed; hubs do not segment broadcasts.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'A hub is a Layer 1 repeater — it repeats every frame out every port and does not segment broadcast domains or route between VLANs.',
        misconceptionTested: 'Treating a hub like a switch or router',
      },
      {
        choiceIndex: 2,
        explanation: 'A WLAN controller manages access points and SSIDs — it does not replace a Layer 3 switch for inter-VLAN routing at line rate in a branch office.',
        misconceptionTested: 'Expecting a WLAN controller to do L3 inter-VLAN routing',
      },
      {
        choiceIndex: 3,
        explanation: 'A cable modem connects a site to an ISP WAN — it is not the LAN device that segments VLANs and routes between them at enterprise line rate.',
        misconceptionTested: 'Using WAN CPE where LAN switching/routing is required',
      },
    ],
    examTip: 'Segment broadcasts + inter-VLAN routing at speed → L3 switch (or router). Hub = never.',
  },
}

export function goldAnswerReviewFor(questionId) {
  return GOLD_ANSWER_REVIEWS[questionId] || null
}
