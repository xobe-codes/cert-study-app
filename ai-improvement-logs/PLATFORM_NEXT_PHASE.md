# Platform Next Phase — Curriculum Study OS

**Status:** Planned · parked until next class (current class = CCNA-only)  
**Created:** 2026-07-10  
**Owner revisit trigger:** Start of next school class / second cert interest  

This is the saved 99+ vision for evolving the CCNA app into a multi-curriculum platform. **Do not implement until explicitly asked.** CCNA remains the sole live pack until then.

---

## North star

**One study OS. Many curricula.**

CCNA 200-301 becomes Pack Zero — the gold reference — not the product identity forever.

Learning loop (same as today, pack-adaptive):

> Map → Study → Practice → Traps → Labs/CLI (when relevant) → Pass → Debrief → Weak areas → Retake

Not every pack needs every mode. The platform **adapts the stack** to what the content supports.

---

## Core idea: Curriculum Packs

| Pack type | Example | Must provide |
|-----------|---------|--------------|
| Exam cert | CCNA, Security+, AWS SAA | Domains, weights, objectives, question bank, traps |
| School class | CIS 210, Networking I | Modules/weeks, readings, quizzes, assignments |
| Personal track | “IPv6 deep dive” | Outline + imported sources |
| Lite pack | Flashcards-only topic | Cards + practice only |

**CCNA** = pack `ccna-200-301`.

**99+ bar:** Adding a pack never forks `App.jsx` or rewrites home. Pack data + optional adapters; shell stays shared.

---

## Shell vs Pack

| Layer | Owns |
|-------|------|
| **Shell** | Home, Study Next, Fix Next, modes UI, mastery, exposure, SRS, placement/pass engines, metrics, theme, offline |
| **Pack** | Titles, taxonomy, content, enabled capabilities, scoring thresholds, copy labels |

---

## Capability matrix (adaptive modes)

Declare per pack. Home Study modes only show enabled capabilities.

| Capability | CCNA | Sibling cert | School class | Personal |
|------------|------|--------------|--------------|----------|
| Weighted domains / modules | ✓ | ✓ | weeks/modules | optional |
| Placement / baseline | ✓ | ✓ | pre-test | optional |
| MC practice bank | ✓ | ✓ | ✓ | if imported |
| Exam traps / misconceptions | ✓ | ✓ | ✓ | optional |
| Labs / CLI | ✓ | limited | rare | no |
| Command Hub | ✓ | subset | no | no |
| Diagrams / flashcards | ✓ | ✓ | ✓ | ✓ |
| Mock exam | ✓ | ✓ | midterm/final | optional |

---

## Intake pipelines (“process anything I’m studying”)

1. **Blueprint / syllabus import** — paste outline → propose taxonomy → approve  
2. **Source bank import** — same clean-bank path (convert → validate → shelve → compile)  
3. **Study dump** — notes / OneNote / PDF → chunk → draft assets → **human gate** → curated runtime  

**Rule:** AI is a **pack builder** (authoring-time / premium), not live generation on free page load. Curated-first stays.

---

## UX (when multi-pack ships)

- Pack switcher in home top bar: `[ CCNA 200-301 ▾ ]`  
- Library: installed packs, “Create from syllabus”, “Import bank”  
- Progress **isolated per pack** by default  
- Copy layer: “Domain Pass” / “Module Check” / “Unit Pass” from pack dictionary  

---

## Technical contract (future)

```text
pack.json
  id, title, version, kind: cert|class|personal
  taxonomy: units[] → objectives[]
  weights?, passThreshold?
  capabilities: { placement, traps, labs, cli, mock, commandHub }
  copy: { unitPass, traps, ... }
  content roots: questions/, traps/, labs?/, flashcards/, diagrams?
```

### Migration path (when un-parked)

1. Extract CCNA into `packs/ccna-200-301/` (behavior unchanged)  
2. `PackProvider` + switcher (still one installed pack)  
3. Class pack template + syllabus importer  
4. Pack builder (notes → draft)  
5. Second cert pack to prove the contract  

No marketplace in v1 — author = you.

---

## Phased roadmap

| Phase | Outcome | When |
|-------|---------|------|
| **P0 — Pack shell** | CCNA runs as a pack; switcher exists (1 pack) | After CCNA class / when ready |
| **P1 — Class template** | Syllabus → modules + practice + flashcards | **Next school class** |
| **P2 — Second cert** | One more exam pack | After P0–P1 |
| **P3 — Builder** | Notes/PDF → draft pack + approve gate | After P1 |
| **P4 — Share** | Export/import pack zip | Later |

---

## Explicit non-goals (early)

- Multi-tenant teacher dashboards  
- Live AI on every study screen for free users  
- Forcing labs/CLI onto packs that don’t need them  
- One global progress graph across unrelated subjects  
- Renaming the live CCNA product before pack split is solid  

---

## First decision when revisiting

Pick the **second pack** that forces the right abstractions:

1. **School class** (syllabus-first, no CLI) — preferred if next class is the pain  
2. **Sibling cert** (Security+ / Network+) — if “platform for certs” is the story  
3. **Personal deep-dive** — smallest proof  

**Default recommendation:** start with **P0 pack shell + P1 class template** when the next class begins.

---

## Session handoff

When ready to build, say: **implement platform P0** or **implement class pack template** and point agents at this file + `DO_NOT_TOUCH.md`.
