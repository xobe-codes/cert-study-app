# Hands-On 99 — Umbrella Plan (v1 · recommended)

**Status:** Implemented through P2 (P3 polish remains optional)
**North star:** One path from lesson → command recall → lab → timed skills exam, without rebuilding Packet Tracer.

---

## One picture

```
Lesson Study
    ↓
Lesson Practice  ←── CLI type-ins mixed in (existing skill Qs)
    ↓                  Command Hub still exists for drills-only
Labs (by objective)     ←── teach / full task list
    ↓
Lab Exam (NEW)          ←── mock-exam sibling: timed stations
    ↓
Debrief → weak objectives → Practice / Lab / Hub
```

**Model:** Cisco NetAcad **Skills Assessment / PTSA** — few timed parts, score + rich feedback — **not** “click through all 82 labs.”

---

## A. Lab Exam (the main new product)

### What it is
A **Mock Exam for labs**: start → run a fixed set of **stations** → score → debrief.

Each station reuses an **existing lab bundle** (`getLab` / `cliEngine` / task validators). No new simulator.

### Modes (recommended defaults)

| Mode | Stations | Time | Intent |
|------|----------|------|--------|
| **Quick** | 6 | ~25 min | Weekly check |
| **Full** | 10–12 | ~50–60 min | Exam rehearsal |
| **Domain** | 5–7 from one domain | ~30 min | Focus week |

### Station mix (Full — judge’s pick)

| # | Kind | Source | Why |
|---|------|--------|-----|
| 2–3 | **Verify** (`show` / interpret) | Existing interpret labs (e.g. route table, trunk, OSPF neighbor, NAT translations, syslog) | Matches most of your bank + real exam “read output” skill |
| 2–3 | **Configure** | Keep/restore a small set: port-sec, extended ACL, OSPF default, + **SSH/login-local**, **VLAN+trunk**, **static/floating** | NetAcad-style “build then verify” without restoring everything |
| 1–2 | **Troubleshoot** | Capstone TS labs | Diagnose → fix → verify |
| 1 | **Logging / services** | `LAB-SYSLOG-REMOTE` (and later DHCP relay / NTP) | Covers logging you asked about; Services weight |

**Pool builder picks from curated station IDs** (not random all labs). Weight toward configure/verify objectives; skip pure “describe architecture” labs in Exam mode.

### Scoring (simple, SA-like)

```
Station score = requiredCommands hit × 0.6
              + verificationChecks attempted/correct × 0.4
Exam score    = average of station scores
Pass          ≈ 70% (show bar + clear miss list)
```

Debrief mirrors Mock Exam: weak objectives, “Miss-only retake,” links into that objective’s Practice / Lab / Command Hub.

### UX placement
- Sibling of Mock Exam (same exam chrome: timer, station progress, no instant answer until station submit — or soft “check step” inside station using current lab UX).
- Entry: **Exam → Lab Exam** and/or Labs hub banner **“Lab Exam.”**
- **Not** inside Command Hub (Hub stays optional drill mode).

### What Command Hub does *not* need to become
Hub already = syntax + type-in drills. Lab Exam = multi-step device tasks under time. Keep them separate.

---

## B. Tie-in: earlier ideas (one stack)

### 1) CLI inside Lesson Practice *(move, don’t rebuild)*
→ Spec: `CLI_IN_LESSON_PRACTICE_99_SPEC.md`

- Mix existing `type: 'cli'` skill questions into Practice.
- Demote lesson **CLI Drill** tool from primary chrome.
- **Command Hub** remains for “I only want commands.”

### 2) Hands-on configure (not only verify)
You have broad **topic** coverage (~82 labs) but only **~3 true config** labs after lite-wave.

**Judge’s pick:** restore a **Core Config Five** (not the whole lite list):

1. VLAN + access + trunk (switch)  
2. Static + floating static (router)  
3. Single-area OSPF (or keep OSPF-default + one adjacency config)  
4. SSH + `login local` / enable secret (device access)  
5. Keep existing: Port Security + Extended ACL  

Rest stay verify — that matches Cisco “Describe / Interpret / Explain” language.

### 3) Syslog / logging
Keep `LAB-SYSLOG-REMOTE` as a Lab Exam verify station; optional Practice CLI drill for `logging host` / trap. No separate “WAN logging product.”

### 4) Official v1.1 blueprint gaps *(micro, later)*
Only if/when content pass: TCP vs UDP, password-policy/MFA concepts, AI/ML (replace DNA-centric 6.4), Terraform mention, clearer WLAN GUI interpret. **Not required for Lab Exam v1.**

### 5) Typing polish
Done: CLI inputs don’t auto-capitalize first letter.

---

## C. Phased ship order (cheap → flashy)

| Phase | Ship | Effort |
|-------|------|--------|
| **P0** | CLI into Practice + hide CLI Drill from lesson tool strip | Small rearrange |
| **P1** | **Lab Exam MVP** — Quick mode, verify-heavy stations, score + debrief, reuse labs | Medium (new route/shell; little new content) |
| **P2** | Core Config Five restored from lite-wave + Full/Domain Lab Exam modes + TS stations | Medium |
| **P3** | Miss-only Lab Exam, exposure-aware station pick, Services logging drill, v1.1 micro gaps | Polish |

Stop after P1 and you already have “mock exam for labs.” P2 makes it feel like a real skills assessment.

---

## D. Suggestions that make it *better* (optional spice)

1. **Station brief card** — 2-line scenario + device focus (R1 / SW1) before CLI opens (NetAcad vibe).  
2. **No spoilers** — hide expected commands during Exam; show after submit (Practice/Labs keep teach hints).  
3. **Verify gate** — station can’t mark complete until at least one `show` verification runs (you already track verify cues).  
4. **Domain weights** — Full exam ~ mirrors blueprint weights (Access + Connectivity heavier).  
5. **Seeded pool** — same seed → same stations for fair retakes; new seed reshuffles.  
6. **Mobile** — one station at a time, sticky prompt + fluid terminal (`cisco-terminal--fluid`); landscape-friendly like labs.  
7. **Don’t** force Packet Tracer export / topology building in-app — out of scope; your CLI + topology diagrams are enough.

---

## E. Acceptance (when “done” for 99 feel)

- [ ] User can start **Lab Exam → Quick**, finish, see % + weak objectives  
- [ ] Stations only reuse existing labs/engine  
- [ ] Practice shows CLI type-ins without opening CLI Drill  
- [ ] Command Hub unchanged for drills-only  
- [ ] At least the Core Config Five are true config (post–P2)  
- [ ] `verify:ship` green + smoke: start Lab Exam → complete one station

---

## F. Explicit non-goals (v1)

- Full Packet Tracer / real cable wiring  
- Scoring every lab in the hub as one marathon  
- Domain Pass MC laced with live terminal (separate older spec)  
- Theme / hash-routing rewrites  
- AI-generated labs

---

## G. File map (when implementing)

| Area | Likely touch |
|------|----------------|
| New | `src/features/labExam/` (pool, session, debrief) + thin route |
| Reuse | `getLab`, `cliEngine`, `CiscoTerminal`, LabView task grading, Mock Exam chrome patterns |
| Practice | `SKILL_QUESTIONS` mixer; `useObjectiveToolItems` |
| Config restore | `configLabLiteWave.js` — remove Core Five IDs only |
| Content later | syslog drill patch; v1.1 micro labs |

---

## H. Brief verdict (read this first)

**Build a Lab Exam** like NetAcad skills assessment: timed stations over *existing* labs, not a second Command Hub and not “run all labs.”  
**First** fold CLI into Practice (move).  
**Then** MVP Lab Exam (verify-heavy).  
**Then** restore a small config core so configure routers/switches/login-local/SSH feel real under the clock.  
**Logging** = one Services station, not a new product.  
**Blueprint gaps** = later micro pack.

Tweak modes, station counts, or Core Five membership from here — the shape stays the same.
