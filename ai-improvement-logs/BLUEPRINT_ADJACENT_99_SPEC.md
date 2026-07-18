# Blueprint-Adjacent Coverage — 99 Spec

**Status:** Waves 1–2 implemented  
**Intent:** Teach Cisco’s “other related topics may also appear” foundations without obsolete configure drills.

## Scope rule

Include adjacent concepts that:
1. Explain or contrast a listed 200-301 objective, and
2. Stay at recognize / explain / troubleshoot-lite depth.

Exclude RIP/EIGRP CLI config, deep timer tuning, and unrelated wilderness topics.

## Wave 1 objectives

| Objective | Adjacent foundations |
|-----------|----------------------|
| 1.4 | MTU / PMTUD / TCP MSS |
| 1.10 | ARP cache / gratuitous ARP |
| 2.2 | VTP revision risk |
| 2.5 | Root Guard / Loop Guard; STP vs L3 loops |
| 3.1 | Split horizon, poison reverse, count-to-infinity, hold-down, feasible successor |
| 3.4 | OSPF ≠ DV tricks; redistribution recognition; OSPFv3 recognition |
| 4.4 | NetFlow vs SNMP/syslog; IP SLA; SPAN recognition |
| 5.10 | PKI trust chain; MACsec vs IPsec |
| 6.1 | Network CI/CD + Git source-of-truth concepts |

## Wave 2 objectives

| Objective | Adjacent foundations |
|-----------|----------------------|
| 1.5 | IGMP and IGMP snooping |
| 2.7 | PoE budget and LLDP-MED |
| 3.2 | Policy-based routing |
| 5.6 | Storm control |
| 5.7 | NAC posture / quarantine / remediation |
| 6.3 | Streaming telemetry and gNMI |

## Delivery pattern

- Data: `src/data/blueprintAdjacentWave{1,2}Patches.js`
- Merge: `contentEnrichmentPatches.js` (`related`, traps, flashcards, questions)
- Terms: `ccnaTermRegistry.js` with `note: Blueprint-adjacent…`
- BOOK_REF: short adjacent paragraphs on `3.1` / `3.4`
- Gate: `npm run validate:blueprint-adjacent`

## Path to 99+

Waves 1–2 cover the prioritized audited set across 15 objectives with 24 positive questions. A future semantic gate could additionally reject any newly introduced adjacent term that appears only in distractors/reviews.
