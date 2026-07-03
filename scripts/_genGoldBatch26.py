#!/usr/bin/env python3
"""Gold batch 26 — 50 reviews: EtherChannel 2.4, STP 2.5, WLAN 2.7/2.8/2.9, routing table 3.1. Run: python3 scripts/_genGoldBatch26.py"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HAND = {
  # === EtherChannel 2.4 ===
  "obj-2.4-source-q002": {
    "correct": {"choiceIndex": 3, "explanation": "EtherChannel bundles physical links into **one logical L2 connection** — STP sees one link, no blocking."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "EtherChannel **prevents** blocking by combining links — 802.1Q trunking is separate from link aggregation.", "misconceptionTested": "EtherChannel blocks links like STP"},
      {"choiceIndex": 1, "explanation": "All bundled ports must match **speed and duplex** — varying speed is not supported.", "misconceptionTested": "Mixed-speed EtherChannel"},
      {"choiceIndex": 2, "explanation": "EtherChannel bundles ports on the **same switch pair** — cross-chassis needs vPC/VSS/StackWise.", "misconceptionTested": "EtherChannel across standalone switches"},
    ],
    "examTip": "EtherChannel = **single logical link** → STP sees one path, no blocking; all ports must match speed/duplex/VLAN.",
  },
  "obj-2.4-source-q006": {
    "correct": {"choiceIndex": 2, "explanation": "LACP supports up to **16 interfaces** per bundle (8 active + 8 hot-standby)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "2 interfaces is too few — LACP supports 8 active (16 total with standby).", "misconceptionTested": "2-port LACP maximum"},
      {"choiceIndex": 1, "explanation": "8 is the **active** maximum — LACP actually supports **16** (8 active + 8 standby).", "misconceptionTested": "8 as total LACP maximum"},
      {"choiceIndex": 3, "explanation": "4 interfaces is too low — EtherChannel/LACP can do up to **16**.", "misconceptionTested": "4-port LACP maximum"},
    ],
    "examTip": "LACP: **8 active + 8 standby = 16 total** | PAgP: up to **8** ports per bundle.",
  },
  "obj-2.4-source-q008": {
    "correct": {"choiceIndex": 0, "explanation": "**EtherChannel** is Cisco's proprietary term for port-channel / link aggregation technology."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**PAgP** is Cisco-proprietary — it does **not** work with non-Cisco; use LACP for multi-vendor.", "misconceptionTested": "PAgP interoperates with non-Cisco"},
      {"choiceIndex": 2, "explanation": "**LACP (802.3ad)** is the **open standard** — works with any vendor, not Cisco-only.", "misconceptionTested": "LACP restricted to Cisco"},
      {"choiceIndex": 3, "explanation": "PAgP requires **matching speed/duplex** on all ports — no mixed-speed bundling.", "misconceptionTested": "PAgP bundles varying speeds"},
    ],
    "examTip": "EtherChannel = Cisco branding | PAgP = Cisco protocol | LACP = IEEE 802.3ad open standard.",
  },
  "obj-2.4-source-q010": {
    "correct": {"choiceIndex": 0, "explanation": "PAgP sends control messages every **30 seconds** to maintain bundle status."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "60 seconds is incorrect — PAgP interval is **30 seconds**.", "misconceptionTested": "60-second PAgP interval"},
      {"choiceIndex": 2, "explanation": "90 seconds is not the PAgP timer — it's **30 seconds**.", "misconceptionTested": "90-second PAgP interval"},
      {"choiceIndex": 3, "explanation": "120 seconds is far too slow — PAgP uses **30-second** messages.", "misconceptionTested": "120-second PAgP interval"},
    ],
    "examTip": "PAgP = **30s** messages | LACP = **30s** (slow) or **1s** (fast) configurable.",
  },
  "obj-2.4-source-q013": {
    "correct": {"choiceIndex": 0, "explanation": "**`show etherchannel`** displays protocol (LACP/PAgP), port state, and bundle summary."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**`show port-channel`** is incomplete — use **`show etherchannel summary`** or **`show etherchannel`**.", "misconceptionTested": "Invented show port-channel command"},
      {"choiceIndex": 2, "explanation": "**`show interface`** shows L1/L2 detail — not the EtherChannel negotiation protocol.", "misconceptionTested": "show interface for EtherChannel protocol"},
      {"choiceIndex": 3, "explanation": "**`show run`** shows config text — **`show etherchannel`** gives live status.", "misconceptionTested": "show run for EtherChannel verify"},
    ],
    "examTip": "EtherChannel verify: **`show etherchannel summary`** (protocol + port flags) | **`show etherchannel detail`** for timers.",
  },
  # === STP 2.5 ===
  "obj-2.5-source-q025": {
    "correct": {"choiceIndex": 3, "explanation": "**All ports on the root bridge** are **designated** (forwarding) — the root has no root port because it IS the root."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Designated ports are in **forwarding**, not blocking — they carry traffic for their segment.", "misconceptionTested": "Designated port in blocking state"},
      {"choiceIndex": 1, "explanation": "The **root bridge** has designated ports but no root port — non-root switches have root ports.", "misconceptionTested": "Root bridge must have designated port (tautology)"},
      {"choiceIndex": 2, "explanation": "Non-root switches have a root port + possibly blocked ports — but not necessarily a non-designated port.", "misconceptionTested": "Mandatory non-designated port on non-root"},
    ],
    "examTip": "Root bridge: **all ports designated + forwarding** | Non-root: **1 root port** + remaining designated or blocked.",
  },
  "obj-2.5-source-q026": {
    "correct": {"choiceIndex": 0, "explanation": "RSTP **backup port** receives BPDUs from **another port on the same switch** — it backs up the **designated port** on that segment."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "BPDUs from **another switch** describe an **alternate port** (backup to root port), not a backup port.", "misconceptionTested": "Backup port from different switch"},
      {"choiceIndex": 2, "explanation": "Backup ports are in **discarding** (blocking), not forwarding.", "misconceptionTested": "Backup port forwarding"},
      {"choiceIndex": 3, "explanation": "A port receiving BPDUs from another switch that can replace the root port is an **alternate port**.", "misconceptionTested": "Backup port replaces root port"},
    ],
    "examTip": "RSTP: **alternate** = backup root port (from other switch) | **backup** = backup designated (from same switch).",
  },
  "obj-2.5-source-q027": {
    "correct": {"choiceIndex": 3, "explanation": "Classic STP convergence: **listening (15s) + learning (15s) + max-age (20s) = 50 seconds** total."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "60 seconds is too high — classic STP max convergence is **50 seconds** (20+15+15).", "misconceptionTested": "60-second STP convergence"},
      {"choiceIndex": 1, "explanation": "5 seconds is RSTP-fast territory — classic STP needs **50 seconds**.", "misconceptionTested": "5-second classic STP convergence"},
      {"choiceIndex": 2, "explanation": "30 seconds covers listening + learning only — add **20s max-age** for full **50s**.", "misconceptionTested": "30-second STP convergence"},
    ],
    "examTip": "Classic STP: **max-age 20s + listening 15s + learning 15s = 50s** | RSTP converges in seconds.",
  },
  "obj-2.5-source-q028": {
    "correct": {"choiceIndex": 2, "explanation": "Classic STP port transitions: **blocking → listening → learning → forwarding** (in that order)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Listening comes **after** blocking, not first — STP starts in **blocking**.", "misconceptionTested": "Listening as first STP state"},
      {"choiceIndex": 1, "explanation": "Forwarding is the **final** state, not the first — ports start **blocking**.", "misconceptionTested": "Forwarding as first STP state"},
      {"choiceIndex": 3, "explanation": "Learning comes **after** listening — correct order is blocking → **listening** → learning → forwarding.", "misconceptionTested": "Learning before listening"},
    ],
    "examTip": "STP states in order: **Blocking → Listening → Learning → Forwarding** (B-L-L-F).",
  },
  "obj-2.5-source-q029": {
    "correct": {"choiceIndex": 2, "explanation": "A blocking port drops **all data frames** but still **processes BPDUs** to monitor topology changes."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Blocking ports **still receive BPDUs** — they don't block everything.", "misconceptionTested": "Blocking port drops BPDUs too"},
      {"choiceIndex": 1, "explanation": "\"Redundant frames\" is vague — a blocking port blocks **all user data** while passing BPDUs.", "misconceptionTested": "Blocking only redundant frames not BPDUs"},
      {"choiceIndex": 3, "explanation": "BPDUs are **not blocked** — the port must hear BPDUs to know when to transition.", "misconceptionTested": "Blocking frames including BPDUs"},
    ],
    "examTip": "Blocking = **no data forwarding** + **BPDU processing continues** (port listens for topology changes).",
  },
  "obj-2.5-source-q030": {
    "correct": {"choiceIndex": 3, "explanation": "RSTP port transitions: **discarding → learning → forwarding** (3 states replace STP's 5)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "\"Blocking\" is not an RSTP state — RSTP uses **discarding** instead.", "misconceptionTested": "Blocking state in RSTP transitions"},
      {"choiceIndex": 1, "explanation": "\"Listening\" is a classic STP state — RSTP skips it, using **discarding** instead.", "misconceptionTested": "Listening state in RSTP"},
      {"choiceIndex": 2, "explanation": "This is the **classic STP** sequence — RSTP uses **discarding**, not blocking/listening.", "misconceptionTested": "Classic STP states applied to RSTP"},
    ],
    "examTip": "RSTP consolidates: **blocking + listening → discarding** | States: discarding → learning → forwarding.",
  },
  "obj-2.5-source-q031": {
    "correct": {"choiceIndex": 0, "explanation": "RSTP **discarding** state replaces both **blocking and listening** from classic 802.1D."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Learning exists in **both** STP and RSTP — it's not the replacement state.", "misconceptionTested": "Learning replaces blocking/listening"},
      {"choiceIndex": 2, "explanation": "Forwarding is the final active state in both protocols — not a replacement.", "misconceptionTested": "Forwarding replaces blocking/listening"},
      {"choiceIndex": 3, "explanation": "Backup is a port **role** in RSTP, not a **state**.", "misconceptionTested": "Backup as RSTP port state"},
    ],
    "examTip": "RSTP states: **discarding** (= blocking + listening) → **learning** → **forwarding**.",
  },
  "obj-2.5-source-q032": {
    "correct": {"choiceIndex": 3, "explanation": "**Discarding** is the new RSTP state that doesn't exist in classic STP (replaces blocking + listening)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Learning exists in **both** STP and RSTP — not new to RSTP.", "misconceptionTested": "Learning as new RSTP state"},
      {"choiceIndex": 1, "explanation": "Forwarding exists in **both** protocols — not unique to RSTP.", "misconceptionTested": "Forwarding as new RSTP state"},
      {"choiceIndex": 2, "explanation": "Blocking is a **classic STP** state — RSTP replaces it with **discarding**.", "misconceptionTested": "Blocking as new RSTP state"},
    ],
    "examTip": "New in RSTP vs STP: **discarding** state + **alternate/backup** port roles + proposal/agreement.",
  },
  "obj-2.5-source-q034": {
    "correct": {"choiceIndex": 1, "explanation": "PortFast should only be on **access ports** connected to end hosts — never on trunk/switch-to-switch links."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "PortFast on **trunks** risks instant loops — only for access (host) ports.", "misconceptionTested": "PortFast on trunk ports"},
      {"choiceIndex": 2, "explanation": "Voice ports are access ports and may use PortFast — but the general rule is **access ports**.", "misconceptionTested": "Voice-only PortFast"},
      {"choiceIndex": 3, "explanation": "Designated port is a **role**, not a port type — PortFast is for **access** ports to hosts.", "misconceptionTested": "PortFast on designated ports"},
    ],
    "examTip": "PortFast = **access ports to hosts ONLY** — skips listening/learning → immediate forwarding.",
  },
  "obj-2.5-source-q035": {
    "correct": {"choiceIndex": 1, "explanation": "`spanning-tree portfast default` enables PortFast on **all access ports** globally — trunk ports are excluded."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "It does **not** enable on trunk ports — only non-trunk (access) ports.", "misconceptionTested": "Global PortFast on all ports including trunks"},
      {"choiceIndex": 2, "explanation": "PortFast does **not** disable spanning tree — it just skips transition states on access ports.", "misconceptionTested": "PortFast disables STP on all ports"},
      {"choiceIndex": 3, "explanation": "STP is **not turned off** — PortFast only accelerates the port state transition.", "misconceptionTested": "PortFast disables STP on access ports"},
    ],
    "examTip": "`spanning-tree portfast default` = **all access ports** get PortFast | Trunk ports unaffected.",
  },
  "obj-2.5-source-q037": {
    "correct": {"choiceIndex": 0, "explanation": "**BPDU Guard** err-disables the port **immediately** upon receiving a BPDU — protects against rogue switches."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "\"BPDU Detection\" is not a Cisco feature name — **BPDU Guard** is the protection mechanism.", "misconceptionTested": "Invented BPDU Detection feature"},
      {"choiceIndex": 2, "explanation": "**Loop Guard** prevents unidirectional link failures from creating loops — not the same as instant BPDU protection.", "misconceptionTested": "Loop Guard for rogue switch protection"},
      {"choiceIndex": 3, "explanation": "**UplinkFast** accelerates convergence for uplink failures — does not protect against rogue BPDUs.", "misconceptionTested": "UplinkFast as BPDU protection"},
    ],
    "examTip": "BPDU Guard = **instant err-disable on BPDU** | Root Guard = prevents root role change | Loop Guard = unidirectional link.",
  },
  "obj-2.5-source-q038": {
    "correct": {"choiceIndex": 0, "explanation": "With PortFast, port goes **directly to forwarding** — the listed transition shows the immediate jump bypassing listening/learning wait times."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Wrong order — PortFast transitions **directly to forwarding**, not through listening first.", "misconceptionTested": "Listening-first with PortFast"},
      {"choiceIndex": 2, "explanation": "This is the **normal STP** order without PortFast — PortFast **skips** the wait.", "misconceptionTested": "Normal STP transitions with PortFast enabled"},
      {"choiceIndex": 3, "explanation": "This is **classic STP** without PortFast — PortFast means **immediate forwarding**.", "misconceptionTested": "Classic STP order as PortFast behavior"},
    ],
    "examTip": "PortFast: port transitions **immediately to forwarding** — no 30-second listening+learning delay.",
  },
  "obj-2.5-source-q039": {
    "correct": {"choiceIndex": 2, "explanation": "BPDU Guard on an interface: **`spanning-tree bpduguard enable`** under the interface config."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`switchport mode bpduguard`** is not valid syntax — it's under **`spanning-tree`** namespace.", "misconceptionTested": "switchport mode for BPDU Guard"},
      {"choiceIndex": 1, "explanation": "**`switchport bpduguard enable`** is wrong — correct is **`spanning-tree bpduguard enable`**.", "misconceptionTested": "switchport bpduguard syntax"},
      {"choiceIndex": 3, "explanation": "**`spanning-tree bpduguard`** without **`enable`** is incomplete — keyword required.", "misconceptionTested": "Missing enable keyword"},
    ],
    "examTip": "Per-interface: `spanning-tree bpduguard enable` | Global: `spanning-tree portfast bpduguard default`.",
  },
  "obj-2.5-source-q040": {
    "correct": {"choiceIndex": 2, "explanation": "BPDU Guard on a **trunk** causes it to **err-disable** when it receives BPDUs (which trunks always do) — immediate loss of connectivity."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "A STP loop would show MAC flapping/broadcast storm — BPDU Guard causes **err-disable**, not a loop.", "misconceptionTested": "STP loop from BPDU Guard"},
      {"choiceIndex": 1, "explanation": "A bad cable would show interface down/down — BPDU Guard shows **err-disabled** state.", "misconceptionTested": "Bad cable as root cause"},
      {"choiceIndex": 3, "explanation": "Flow control does not cause full port shutdown — BPDU Guard **err-disables** upon BPDU receipt.", "misconceptionTested": "Flow control causing connectivity loss"},
    ],
    "examTip": "BPDU Guard on a trunk = **instant err-disable** (trunks always exchange BPDUs) — only use on access/host ports.",
  },
  "obj-2.5-source-q041": {
    "correct": {"choiceIndex": 1, "explanation": "Best practice: **always pair BPDU Guard with PortFast** — if someone plugs in a switch, the port err-disables immediately."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "PortFast on access links IS recommended — it prevents 50s delay for hosts.", "misconceptionTested": "Never configure PortFast"},
      {"choiceIndex": 2, "explanation": "BPDU Guard on **trunks** would err-disable them — never appropriate for inter-switch links.", "misconceptionTested": "BPDU Guard on trunks"},
      {"choiceIndex": 3, "explanation": "UplinkFast is a separate feature — best practice is PortFast + **BPDU Guard** together on access.", "misconceptionTested": "BPDU Guard paired with UplinkFast"},
    ],
    "examTip": "Access switch best practice: **PortFast + BPDU Guard** on every host-facing port.",
  },
  "obj-2.5-source-q042": {
    "correct": {"choiceIndex": 3, "explanation": "**`show spanning-tree interface fa 0/1`** shows per-port STP detail including PortFast status."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show portfast`** is not valid IOS syntax.", "misconceptionTested": "Invented show portfast command"},
      {"choiceIndex": 1, "explanation": "**`show interface`** shows L1/L2 counters — not STP/PortFast detail.", "misconceptionTested": "show interface for PortFast"},
      {"choiceIndex": 2, "explanation": "**`show spanning-tree`** (global) shows the tree overview — per-interface detail is `show spanning-tree interface`.", "misconceptionTested": "Global STP show for per-port PortFast"},
    ],
    "examTip": "PortFast verify: **`show spanning-tree interface <intf>`** — look for \"edge\" or \"portfast\" flag.",
  },
  "obj-2.5-source-q044": {
    "correct": {"choiceIndex": 2, "explanation": "BPDU Guard places the port in **err-disabled** state upon receiving a BPDU — requires manual recovery or errdisable recovery timer."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "\"Administratively disabled\" means `shutdown` was configured — BPDU Guard causes **err-disabled**, not admin shutdown.", "misconceptionTested": "Admin shutdown vs err-disabled"},
      {"choiceIndex": 1, "explanation": "\"Disabled\" is too vague — the specific state is **err-disabled** (different from admin down).", "misconceptionTested": "Generic disabled vs err-disabled"},
      {"choiceIndex": 3, "explanation": "BPDU Guard **prevents** loops by shutting the port — it does not allow a loop.", "misconceptionTested": "Loop occurs with BPDU Guard"},
    ],
    "examTip": "BPDU Guard → **err-disabled** | Recovery: `shutdown` / `no shutdown` or `errdisable recovery cause bpduguard`.",
  },
  "obj-2.5-source-q045": {
    "correct": {"choiceIndex": 1, "explanation": "**`show spanning-tree summary`** shows global STP settings including whether BPDU Guard is enabled by default."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show interface`** shows L1/L2 — not STP/BPDU Guard global config.", "misconceptionTested": "show interface for BPDU Guard default"},
      {"choiceIndex": 2, "explanation": "**`show spanning-tree vlan 2`** shows per-VLAN tree — not the global default settings.", "misconceptionTested": "Per-VLAN show for global BPDU Guard"},
      {"choiceIndex": 3, "explanation": "**`show spanning-tree`** shows the tree but may not highlight the **default** Guard setting — use **summary**.", "misconceptionTested": "Base show spanning-tree for defaults"},
    ],
    "examTip": "`show spanning-tree summary` → global defaults: PortFast, BPDU Guard, mode (PVST/Rapid-PVST).",
  },
  "obj-2.5-source-q046": {
    "correct": {"choiceIndex": 3, "explanation": "**BPDU Guard** err-disables the port if someone accidentally plugs in a switch (which sends BPDUs)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "PortFast **speeds up** host connections but doesn't **protect** against rogue switches.", "misconceptionTested": "PortFast as rogue switch protection"},
      {"choiceIndex": 1, "explanation": "UplinkFast accelerates failover — does not detect or prevent rogue switches.", "misconceptionTested": "UplinkFast as access protection"},
      {"choiceIndex": 2, "explanation": "BackboneFast speeds up convergence for indirect failures — not rogue switch protection.", "misconceptionTested": "BackboneFast as rogue switch protection"},
    ],
    "examTip": "Prevent accidental switch on access port → **BPDU Guard** (err-disables on BPDU receipt).",
  },
  # === WLAN 2.7 ===
  "obj-2.7-source-q005": {
    "correct": {"choiceIndex": 1, "explanation": "WLC LAG supports up to **8 ports** bundled between the controller and the switch."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "16 exceeds the WLC LAG limit — maximum is **8**.", "misconceptionTested": "16-port WLC LAG"},
      {"choiceIndex": 2, "explanation": "4 is too low — WLC LAG supports up to **8** ports.", "misconceptionTested": "4-port WLC LAG limit"},
      {"choiceIndex": 3, "explanation": "2 is far below the limit — **8** is the WLC LAG maximum.", "misconceptionTested": "2-port WLC LAG limit"},
    ],
    "examTip": "WLC LAG: up to **8 ports** bundled — provides redundancy and aggregate bandwidth to switch.",
  },
  "obj-2.7-source-q006": {
    "correct": {"choiceIndex": 2, "explanation": "Convert an access port to a **trunk** — allows multiple VLANs (departments) over one physical link to the WLC."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Upgrading hardware is expensive and unnecessary — a **trunk** solves multi-VLAN access.", "misconceptionTested": "Hardware upgrade for multi-VLAN"},
      {"choiceIndex": 1, "explanation": "LAG bundles ports for bandwidth/redundancy — but you still need a **trunk** for multiple VLANs.", "misconceptionTested": "LAG for multi-VLAN without trunk"},
      {"choiceIndex": 3, "explanation": "A second WLC is costly — one trunk can carry **many VLANs** to a single WLC.", "misconceptionTested": "Second WLC for multi-department"},
    ],
    "examTip": "Multiple VLANs to WLC with limited ports → **trunk** (802.1Q tags) on a physical port.",
  },
  # === WLAN 2.8 ===
  "obj-2.8-source-q003": {
    "correct": {"choiceIndex": 3, "explanation": "TACACS+ uses **TCP port 49** — full packet encryption between client and server."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**UDP/69** is TFTP — not TACACS+.", "misconceptionTested": "TFTP port for TACACS+"},
      {"choiceIndex": 1, "explanation": "**TCP/74** is not used by TACACS+ — correct is **TCP/49**.", "misconceptionTested": "Wrong TCP port for TACACS+"},
      {"choiceIndex": 2, "explanation": "**UDP/47** is not TACACS+ — and TACACS+ uses **TCP** (reliable), not UDP.", "misconceptionTested": "UDP for TACACS+"},
    ],
    "examTip": "TACACS+ = **TCP/49** (full encryption) | RADIUS = **UDP/1812-1813** (password only encrypted).",
  },
  "obj-2.8-source-q005": {
    "correct": {"choiceIndex": 3, "explanation": "SSH uses **asymmetric encryption** (RSA/ECDSA key exchange) to establish the secure tunnel, then symmetric for session data."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Symmetric encryption is used **after** key exchange — the SSH **setup** relies on asymmetric (public/private keys).", "misconceptionTested": "Symmetric only for SSH"},
      {"choiceIndex": 1, "explanation": "\"Code block ciphers\" is not the mechanism — SSH relies on **asymmetric key exchange**.", "misconceptionTested": "Code block ciphers as SSH mechanism"},
      {"choiceIndex": 2, "explanation": "At-rest encryption protects stored data — SSH protects **in-transit** data via asymmetric key exchange.", "misconceptionTested": "At-rest encryption for SSH"},
    ],
    "examTip": "SSH security: **asymmetric** (RSA keys) for auth/exchange → **symmetric** (AES) for session data.",
  },
  "obj-2.8-source-q007": {
    "correct": {"choiceIndex": 0, "explanation": "**RADIUS** is the open standard proposed by IETF (RFC 2865) — vendor-neutral AAA."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**TACACS+** is Cisco-proprietary — not an IETF open standard.", "misconceptionTested": "TACACS+ as IETF standard"},
      {"choiceIndex": 2, "explanation": "**Kerberos** is an MIT/Windows authentication protocol — not the IETF AAA standard.", "misconceptionTested": "Kerberos as IETF AAA"},
      {"choiceIndex": 3, "explanation": "**LDAP** is a directory protocol (RFC 4511) — not the AAA system referenced here.", "misconceptionTested": "LDAP as IETF AAA"},
    ],
    "examTip": "RADIUS = **IETF open standard** (RFC 2865) | TACACS+ = **Cisco proprietary** | Both do AAA.",
  },
  "obj-2.8-source-q008": {
    "correct": {"choiceIndex": 0, "explanation": "**SSH** supports AES encryption for the full session (credentials + data) — Telnet sends everything cleartext."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "TACACS+ encrypts its AAA packets but is not a \"management method\" for device access like SSH.", "misconceptionTested": "TACACS+ as management access method"},
      {"choiceIndex": 2, "explanation": "HTTPS encrypts web management — but for CLI access with AES, **SSH** is the answer.", "misconceptionTested": "HTTPS for CLI management encryption"},
      {"choiceIndex": 3, "explanation": "RADIUS encrypts only the **password** — not full session with AES.", "misconceptionTested": "RADIUS full AES encryption"},
    ],
    "examTip": "CLI remote access with encryption → **SSH** (AES/3DES session) | Web → HTTPS | Never Telnet in production.",
  },
  "obj-2.8-source-q010": {
    "correct": {"choiceIndex": 2, "explanation": "Cisco console port defaults to **9600 baud** (bits per second signaling rate)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**19.2 kb/s** is a higher speed sometimes used — but **default** is **9600 baud**.", "misconceptionTested": "19200 as default console speed"},
      {"choiceIndex": 1, "explanation": "**9600 kb/s** confuses baud with kilobits — console is **9600 baud** (≈ 9.6 kbps).", "misconceptionTested": "9600 kb/s unit confusion"},
      {"choiceIndex": 3, "explanation": "**19200 baud** is not the default — Cisco consoles default to **9600**.", "misconceptionTested": "19200 baud as default"},
    ],
    "examTip": "Console defaults: **9600 baud, 8 data bits, no parity, 1 stop bit** (9600 8N1).",
  },
  # === WLAN 2.9 ===
  "obj-2.9-source-q002": {
    "correct": {"choiceIndex": 1, "explanation": "Simplest segmentation: **two SSIDs** — one mapped to production VLAN, one to guest VLAN. Clients associate to the appropriate SSID."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "One SSID with ACLs does not provide **VLAN segmentation** — traffic stays on same VLAN.", "misconceptionTested": "ACL-only segmentation on single SSID"},
      {"choiceIndex": 2, "explanation": "Dynamic VLANs (RADIUS-assigned) work but are **more complex** than simply creating two SSIDs.", "misconceptionTested": "Dynamic VLANs as simplest option"},
      {"choiceIndex": 3, "explanation": "Two SSIDs with ACLs is overkill when VLAN assignment per SSID achieves the goal simply.", "misconceptionTested": "ACLs on both SSIDs for segmentation"},
    ],
    "examTip": "Guest segmentation on WLC: **separate SSID → mapped to guest VLAN** — simple and effective.",
  },
  "obj-2.9-source-q003": {
    "correct": {"choiceIndex": 0, "explanation": "A wireless system covering a **town** is a **WMAN** (Wireless Metropolitan Area Network)."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**WPAN** = personal area (Bluetooth, ~10m) — a town is much larger.", "misconceptionTested": "WPAN for town coverage"},
      {"choiceIndex": 2, "explanation": "**WLAN** = local (building/campus) — a town exceeds LAN scale.", "misconceptionTested": "WLAN for town coverage"},
      {"choiceIndex": 3, "explanation": "**WWAN** = wide area (cellular, country-scale) — a single town is metropolitan.", "misconceptionTested": "WWAN for single town"},
    ],
    "examTip": "WPAN < WLAN < WMAN < WWAN — town/city = **MAN** (Metropolitan).",
  },
  "obj-2.9-source-q005": {
    "correct": {"choiceIndex": 2, "explanation": "A **trust boundary** is where the network **begins trusting** QoS markings from devices — beyond it, markings may be re-written."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "QoS markings are **first applied** at the device — the trust boundary is where the network **accepts** them.", "misconceptionTested": "Trust boundary as marking origin"},
      {"choiceIndex": 1, "explanation": "Stripping markings happens at **untrusted** boundaries — the trust boundary is where they're **accepted**.", "misconceptionTested": "Trust boundary strips markings"},
      {"choiceIndex": 3, "explanation": "Queue separation is **scheduling** — the trust boundary is about **marking acceptance**.", "misconceptionTested": "Trust boundary as queue separator"},
    ],
    "examTip": "Trust boundary = **point where network trusts device QoS markings** (usually at the access switch).",
  },
  "obj-2.9-source-q006": {
    "correct": {"choiceIndex": 0, "explanation": "**802.11e** defines QoS enhancements for wireless LANs (WMM — Wi-Fi Multimedia)."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**802.11r** is fast BSS transition (roaming) — not QoS.", "misconceptionTested": "802.11r for wireless QoS"},
      {"choiceIndex": 2, "explanation": "**802.1p** is wired L2 CoS marking — not a wireless standard.", "misconceptionTested": "802.1p for wireless QoS"},
      {"choiceIndex": 3, "explanation": "**802.11k** assists roaming decisions (neighbor reports) — not QoS.", "misconceptionTested": "802.11k for wireless QoS"},
    ],
    "examTip": "Wireless QoS = **802.11e (WMM)** | Fast roaming = **802.11r** | Neighbor list = **802.11k**.",
  },
  "obj-2.9-source-q008": {
    "correct": {"choiceIndex": 2, "explanation": "**802.11k** provides neighbor AP reports — clients use them to make faster roaming decisions."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**802.11r** is fast BSS transition (pre-auth key) — **802.11k** provides the AP list.", "misconceptionTested": "802.11r for neighbor AP list"},
      {"choiceIndex": 1, "explanation": "**802.11e** is QoS (WMM) — not neighbor AP discovery.", "misconceptionTested": "802.11e for AP neighbor list"},
      {"choiceIndex": 3, "explanation": "**802.11ac** is a PHY speed standard (Wave 1/2) — not a roaming protocol.", "misconceptionTested": "802.11ac for neighbor AP download"},
    ],
    "examTip": "802.11k = **neighbor report** (AP list) | 802.11r = **fast roaming** (pre-auth) | 802.11v = BSS transition mgmt.",
  },
  "obj-2.9-source-q009": {
    "correct": {"choiceIndex": 3, "explanation": "VoIP needs the highest QoS priority — **Platinum** profile on Cisco WLC gives EF/voice treatment."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Bronze** is best-effort/background — not suitable for real-time voice.", "misconceptionTested": "Bronze for voice traffic"},
      {"choiceIndex": 1, "explanation": "**Silver** is standard data — voice requires **Platinum** for low latency.", "misconceptionTested": "Silver for voice traffic"},
      {"choiceIndex": 2, "explanation": "**Gold** is video-grade — voice uses **Platinum** for the tightest latency/jitter.", "misconceptionTested": "Gold for voice traffic"},
    ],
    "examTip": "WLC QoS profiles: **Platinum** (voice) > **Gold** (video) > **Silver** (best effort) > **Bronze** (background).",
  },
  "obj-2.9-source-q010": {
    "correct": {"choiceIndex": 0, "explanation": "WLAN status is **Disabled** — **enable** the WLAN so maintenance users can associate."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Radio Policy \"All\" is correct — changing it won't fix a disabled WLAN.", "misconceptionTested": "Radio policy change for disabled WLAN"},
      {"choiceIndex": 2, "explanation": "Multicast VLAN is optional — the WLAN must be **enabled** first before any feature works.", "misconceptionTested": "Enable multicast VLAN to fix connectivity"},
      {"choiceIndex": 3, "explanation": "Broadcast SSID being disabled hides the name but doesn't prevent connections — the WLAN being **Disabled** is the issue.", "misconceptionTested": "Hidden SSID as connectivity block"},
    ],
    "examTip": "WLC WLAN not working → check **Status** first — must be **Enabled** for any client associations.",
  },
  "obj-2.9-source-q012": {
    "correct": {"choiceIndex": 0, "explanation": "Large file transfer is bulk/background traffic — **Bronze** (best effort, no priority) is appropriate alongside other WLANs."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**Gold** is video-tier — file transfers don't need low-latency treatment.", "misconceptionTested": "Gold profile for bulk file transfer"},
      {"choiceIndex": 2, "explanation": "**Platinum** is voice — absolutely not for bulk file downloads.", "misconceptionTested": "Platinum for file transfers"},
      {"choiceIndex": 3, "explanation": "**Silver** is standard data — but bulk/roaming file transfers should be **Bronze** to not compete with interactive traffic.", "misconceptionTested": "Silver for bulk file transfer WLAN"},
    ],
    "examTip": "Large files/bulk = **Bronze** (background) | Interactive = **Silver** | Video = **Gold** | Voice = **Platinum**.",
  },
  "obj-2.9-source-q013": {
    "correct": {"choiceIndex": 1, "explanation": "**802.1X** requires the client to present a certificate (or credentials via EAP) before network access — per-user authentication."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "MAC filtering checks hardware addresses — does not require **certificates**.", "misconceptionTested": "MAC filtering with certificates"},
      {"choiceIndex": 2, "explanation": "WPA2 PSK uses a **shared passphrase** — no per-device certificates.", "misconceptionTested": "WPA2 PSK with certificate requirement"},
      {"choiceIndex": 3, "explanation": "Fast Transitioning (802.11r) speeds roaming — it's not a certificate-based admission control.", "misconceptionTested": "Fast Transitioning for certificate auth"},
    ],
    "examTip": "Certificate-based WLAN access → **802.1X (EAP-TLS)** — client and server exchange certificates via RADIUS.",
  },
  # === Routing table 3.1 ===
  "obj-3.1-source-q003": {
    "correct": {"choiceIndex": 0, "explanation": "**`show ip route <prefix> <mask> longer-prefixes`** filters to show all more-specific routes within that range."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**`show ip route <prefix> <mask>`** shows only the exact match — **`longer-prefixes`** shows the subset.", "misconceptionTested": "Exact match shows subset routes"},
      {"choiceIndex": 2, "explanation": "**`show ip route bgp`** filters by protocol — not by prefix subset.", "misconceptionTested": "BGP filter for prefix subset"},
      {"choiceIndex": 3, "explanation": "**`show ip route`** shows everything — no subset filtering without **`longer-prefixes`** keyword.", "misconceptionTested": "Full table for subset view"},
    ],
    "examTip": "`show ip route <net> <mask> longer-prefixes` → all child routes within that summary — great for troubleshooting.",
  },
  "obj-3.1-source-q004": {
    "correct": {"choiceIndex": 1, "explanation": "The routing table shows next hop via **Serial 0/0** for that destination — traffic exits that interface."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Gateway 172.16.1.200 is not the matched route's next-hop for 192.168.1.5 per the exhibit.", "misconceptionTested": "Wrong next-hop from different route entry"},
      {"choiceIndex": 2, "explanation": "172.16.1.100 does not match the route entry for the destination prefix.", "misconceptionTested": "Misread next-hop address"},
      {"choiceIndex": 3, "explanation": "Ethernet0 is not the exit interface for this route — Serial 0/0 is.", "misconceptionTested": "Wrong exit interface"},
    ],
    "examTip": "Read `show ip route` line-by-line: match **longest prefix** → read **next-hop** or **exit interface**.",
  },
  "obj-3.1-source-q005": {
    "correct": {"choiceIndex": 1, "explanation": "203.80.53.22**/19** → network is **203.80.32.0/19** (third octet: 32–63 block). Connected route shows that prefix."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**203.80.16.0/19** is the prior /19 block (16–31) — .53 falls in **32–63**.", "misconceptionTested": "Wrong /19 boundary for .53"},
      {"choiceIndex": 2, "explanation": "**203.80.48.0/19** is the next /19 block (48–63) — .53 is in **32–63** which starts at .32.", "misconceptionTested": "Misaligned /19 starting at .48"},
      {"choiceIndex": 3, "explanation": "Host address with **/19** is not a valid network route — IOS shows the **network prefix .32.0/19**.", "misconceptionTested": "Host address as network route"},
    ],
    "examTip": "/19 boundaries: 0, 32, 64, 96… | .53 is in **32–63** → network **203.80.32.0/19**.",
  },
  "obj-3.1-source-q006": {
    "correct": {"choiceIndex": 1, "explanation": "**`10.0.0.0/8 is variably subnetted`** is IOS's **parent route summary** header — it groups child routes, not itself a route."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "The line is a **grouping header** for subnets underneath — not an actual route in the RIB.", "misconceptionTested": "Parent header as routable entry"},
      {"choiceIndex": 2, "explanation": "It's not the router's own address — it's a **display summary** for child prefixes.", "misconceptionTested": "Summary header as router address"},
      {"choiceIndex": 3, "explanation": "No single neighbor populated this — it's IOS **grouping** multiple subnets under the classful parent.", "misconceptionTested": "Neighbor-learned parent route"},
    ],
    "examTip": "\"variably subnetted, X subnets, Y masks\" = **IOS display header** grouping child routes — not a route itself.",
  },
  "obj-3.1-source-q007": {
    "correct": {"choiceIndex": 2, "explanation": "The **`00:05:00`** timestamp shows how long the route has been **in the routing table** (5 minutes since last update)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "It's not a clock time — it's an **elapsed duration** since the route was last refreshed.", "misconceptionTested": "Timestamp as current time"},
      {"choiceIndex": 1, "explanation": "Delay is part of the **metric** inside the brackets — the time field is route **age**.", "misconceptionTested": "Time field as connection delay"},
      {"choiceIndex": 3, "explanation": "Interface uptime is shown in `show interfaces` — the route table time is **route age**.", "misconceptionTested": "Route time as interface uptime"},
    ],
    "examTip": "Route table time (hh:mm:ss) = **how long since this route was refreshed/installed** — resets on update.",
  },
  "obj-3.1-source-q008": {
    "correct": {"choiceIndex": 2, "explanation": "The static route to 192.168.4.0/24 points to next-hop 10.0.0.1 — if that resolves via **Serial 0/0/1**, traffic exits there."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Serial 0/2/0 is not the exit interface for the route matching 192.168.4.85.", "misconceptionTested": "Wrong serial interface for destination"},
      {"choiceIndex": 1, "explanation": "192.168.4.2 is in the destination network, not the next hop or exit interface.", "misconceptionTested": "Destination IP as next hop"},
      {"choiceIndex": 3, "explanation": "198.22.34.3 does not appear in the routing table excerpt for this destination.", "misconceptionTested": "Random IP as route exit"},
    ],
    "examTip": "Static route → follow **next-hop recursion** to find actual exit interface in `show ip route`.",
  },
  "obj-3.1-source-q011": {
    "correct": {"choiceIndex": 1, "explanation": "**Administrative Distance** rates the **trustworthiness/reliability** of a routing source — lower AD = more trusted."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "AD does not define protocol **standards** — it's a **preference ranking** between sources.", "misconceptionTested": "AD as protocol standard definition"},
      {"choiceIndex": 2, "explanation": "\"Shortest distance\" describes the **metric** — AD compares **sources**, not paths.", "misconceptionTested": "AD as shortest path metric"},
      {"choiceIndex": 3, "explanation": "Default ADs are **fixed by IOS** (not admin-programmed) — though they can be tuned.", "misconceptionTested": "AD programmed by admin"},
    ],
    "examTip": "AD = **trust rating** (Connected 0, Static 1, EIGRP 90, OSPF 110, RIP 120) — lower wins between protocols.",
  },
  "obj-3.1-source-q014": {
    "correct": {"choiceIndex": 2, "explanation": "AD is a **rating of trustworthiness** — when multiple routing sources offer the same prefix, lowest AD wins."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Metric** is used within a protocol to select best path — AD selects between **protocols**.", "misconceptionTested": "AD as intra-protocol metric"},
      {"choiceIndex": 1, "explanation": "Default ADs are IOS-defined — admins can change them but they're not \"assigned by admins\" primarily.", "misconceptionTested": "AD as admin-assigned value"},
      {"choiceIndex": 3, "explanation": "\"Cost to destination\" describes the **metric** — AD is about **source reliability**.", "misconceptionTested": "AD as cost metric"},
    ],
    "examTip": "AD answers: \"which routing source do I trust more?\" | Metric answers: \"which path is best within that source?\"",
  },
  "obj-3.1-source-q015": {
    "correct": {"choiceIndex": 0, "explanation": "EIGRP composite metric uses **bandwidth** (and delay by default) — bandwidth must be set correctly for accurate path selection."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Delay is also used by default — but the question asks what **must be configured**, and bandwidth is the primary.", "misconceptionTested": "Delay as sole EIGRP metric input"},
      {"choiceIndex": 2, "explanation": "Reliability is in the formula but **disabled by default** (K5=0) — bandwidth/delay are default.", "misconceptionTested": "Reliability as required EIGRP config"},
      {"choiceIndex": 3, "explanation": "Load is also disabled by default (K2=0) — bandwidth is the key required value.", "misconceptionTested": "Load as required EIGRP config"},
    ],
    "examTip": "EIGRP default metric: **bandwidth + delay** (K1=K3=1, K2=K4=K5=0) — set `bandwidth` accurately on serial links.",
  },
  "obj-3.1-source-q016": {
    "correct": {"choiceIndex": 2, "explanation": "AD **90** = **EIGRP** (internal). EIGRP routes appear with [90/metric] in `show ip route`."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**IGRP** AD was 100 — and IGRP is deprecated/removed from modern IOS.", "misconceptionTested": "AD 90 for IGRP"},
      {"choiceIndex": 1, "explanation": "**OSPF** AD is **110**, not 90.", "misconceptionTested": "AD 90 for OSPF"},
      {"choiceIndex": 3, "explanation": "**RIP** AD is **120** — much higher than 90.", "misconceptionTested": "AD 90 for RIP"},
    ],
    "examTip": "AD quick ref: Connected=0, Static=1, EIGRP=**90**, OSPF=110, IS-IS=115, RIP=120.",
  },
}

assert len(HAND) == 50, f"Expected 50, got {len(HAND)}"

def fmt_entry(id_, rev):
    body = json.dumps(rev, indent=2)
    indented = "\n".join("  " + line if line else line for line in body.splitlines())
    return f"  '{id_}': {indented},"

lines = [
    "/** Gold reviews — Batch 26: EtherChannel 2.4, STP 2.5, WLAN 2.7/2.8/2.9, routing table 3.1 (50 entries). */",
    "export const BATCH26_GOLD = {",
]
for id_, rev in HAND.items():
    lines.append(fmt_entry(id_, rev))
lines.append("}")
lines.append("")

out = ROOT / "src/answerReview/goldAnswerReviewsBatch26.js"
out.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {len(HAND)} entries to {out.relative_to(ROOT)}")
