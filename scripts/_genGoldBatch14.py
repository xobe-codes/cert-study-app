#!/usr/bin/env python3
"""Gold batch 14 — MAC 1.5, private IP 1.7, IPv6 1.9, OSPF 3.4. Run: python3 scripts/_genGoldBatch14.py"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HAND = json.loads((ROOT / "scripts/batch14-gold-hand.json").read_text(encoding="utf-8"))

assert len(HAND) == 25, len(HAND)

def fmt_entry(id_, rev):
    body = json.dumps(rev, indent=2)
    indented = "\n".join("  " + line if line else line for line in body.splitlines())
    return f"  '{id_}': {indented},"

lines = [
    "/** Gold reviews — Batch 14: MAC 1.5, private IP 1.7, IPv6 1.9, OSPF 3.4. */",
    "export const BATCH14_GOLD = {",
]
for id_, rev in HAND.items():
    lines.append(fmt_entry(id_, rev))
lines.append("}")
lines.append("")

out = ROOT / "src/answerReview/goldAnswerReviewsBatch14.js"
out.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {len(HAND)} entries to {out.relative_to(ROOT)}")
