# 99-Spec Wrong-Answer Explanation Pattern

## Definition
A **99-spec wrong-answer explanation** is a structured, misconception-focused explanation that helps learners understand *why* an incorrect choice is wrong—not just that it's wrong.

## Required Fields

### `misconceptionReason` (string, 1-2 sentences)
The **specific false belief** the learner likely held when selecting this wrong answer.
- **Must NOT** say "because it's wrong"
- **Must name the actual mental model** the learner is operating under
- Examples:
  - ❌ "This is not what a switch does"
  - ✅ "Students think Layer 2 forwards based on IP addresses, confusing it with router behavior"
  - ✅ "Learners assume 'forwarding table' always means routing table because that's the term they learned first"

### `whyItSeems` (string, 1-2 sentences)
Why does this misconception *feel plausible*? What surface-level clue or analogy led to it?
- **Explain the intuitive trap**, not repeat the misconception
- Examples:
  - "Routers have visible physical ports, so it's tempting to think they operate at Layer 1"
  - "Both switches and routers 'forward' traffic, so the terms get confused"
  - "DNS is the most familiar lookup mechanism, so students map all lookups to DNS"

### `whyWrongHere` (string, 2-3 sentences)
**Directly address the misconception** by explaining the correct underlying concept and why it contradicts the false belief.
- State the correct rule or principle
- Show why the misconception **breaks** that principle
- **Must be specific to this question**, not generic
- Examples:
  - "A router's job is reading the destination IP address and choosing an outbound interface via its routing table — that's Layer 3. Layer 1 only handles electrical signaling with no address awareness."
  - "A switch never rewrites MAC addresses or crosses subnet boundaries; a router rewrites the Layer 2 header at every hop."

### `memoryAnchor` (string, 1 sentence)
A **sticky, phrase-based rule** the learner can recall in high-stakes situations.
- Should be **memorable and contrastive**
- Avoid jargon; use vivid, concrete language
- Examples:
  - "MAC address decisions = Layer 2 = switch. IP address decisions = Layer 3 = router."
  - "'Primarily operates at' means 'makes its forwarding decision at' — for a router, that's Layer 3 (IP), not the physical wire."
  - "Layer 7 = what the data means to an application. Layer 3 = where the packet goes on the network."

### `contrast` (string, 1-2 sentences)
**Explicitly contrast** the correct concept with the misconception (or a related-but-different concept).
- Show side-by-side why they're different
- Gives learners a frame to distinguish correct from incorrect in the future
- Examples:
  - "A switch never rewrites MAC addresses or crosses subnet boundaries; a router rewrites the Layer 2 header at every hop and forwards based on the Layer 3 destination."
  - "DNS cache entries expire and are queried over the network; a MAC table is built locally and instantly from frames the switch has already seen."

## Quality Checklist

- [ ] `misconceptionReason` names a **specific false belief**, not "it's wrong"
- [ ] `whyItSeems` explains the **intuitive trap**, not repeat the misconception
- [ ] `whyWrongHere` directly addresses the misconception with **correct principle + proof it breaks**
- [ ] `memoryAnchor` is **short, sticky, contrastive** (no more than 1 sentence)
- [ ] `contrast` is **side-by-side comparison**, showing why they're different
- [ ] **No jargon overflow**: if a term is jargon, define it briefly or use a metaphor
- [ ] All 5 fields **reference the specific question and answer choice**, not generic CCNA concepts

## Example: Full Entry

**Question:** "Which layer does a switch primarily operate at?"
**Wrong choice:** "Layer 3"

```json
{
  "choiceIndex": 1,
  "misconceptionReason": "Students blend switch and router behavior because both are 'forwarding devices,' so they assume a router forwards like a switch at Layer 2.",
  "whyItSeems": "Layer 2 is a commonly tested layer, and routers sometimes have switch-like ports on multilayer models, so it feels plausible.",
  "whyWrongHere": "Layer 2 is where switches forward frames using MAC addresses within one broadcast domain. A router's job is different — it moves traffic between networks by reading the Layer 3 IP header. If a router only worked at Layer 2, it couldn't route between subnets at all; it would just be a switch.",
  "memoryAnchor": "MAC address decisions = Layer 2 = switch. IP address decisions = Layer 3 = router.",
  "contrast": "A switch never rewrites MAC addresses or crosses subnet boundaries; a router rewrites the Layer 2 header at every hop and forwards based on the Layer 3 destination."
}
```

## Cost & Timeline

- **Per batch:** ~33 questions → $0.08 Claude cost (Haiku for quick assessment, Sonnet for quality fixes)
- **Three daily batches:** 100 questions/day → $0.25/day → $1.50 for 6-day sprint to completion
