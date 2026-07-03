#!/usr/bin/env python3
"""Gold batch 20 — FHRP 3.5 q23+, REST APIs 6.5 q7+, config mgmt 6.6 q7+, NAT 4.1 q10+. Run: python3 scripts/_genGoldBatch20.py"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HAND = {
  "obj-3.5-source-q023": {
    "correct": {"choiceIndex": 2, "explanation": "Without **`standby <n> preempt`**, a higher-priority router will **not displace** the current active router — priority alone is not enough."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "HSRP default priority is **100**, not 150 — Router A at 150 should win **only if preemption is enabled**.", "misconceptionTested": "Default priority 150 instead of 100"},
      {"choiceIndex": 1, "explanation": "Hold timer expiry causes **failover when hellos are missed** — it does not block a higher-priority router from taking over.", "misconceptionTested": "Hold timer blocking priority-based takeover"},
      {"choiceIndex": 3, "explanation": "IP address is a **tiebreaker** when priorities match — Router A already has higher priority; **preemption** is the missing piece.", "misconceptionTested": "IP tiebreaker as reason priority 150 fails"},
    ],
    "examTip": "Higher priority + no preempt = incumbent stays active — enable **`standby <n> preempt`**.",
  },
  "obj-3.5-source-q024": {
    "correct": {"choiceIndex": 3, "explanation": "HSRP preemption is enabled under the **interface** with **`standby <group> preempt`** — not `preemption` and not `hsrp`."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "HSRP is configured under the **interface**, not global config — and the keyword is **`preempt`**, not `preemption`.", "misconceptionTested": "Global config standby preemption"},
      {"choiceIndex": 1, "explanation": "Right context (interface) but wrong keyword — Cisco uses **`preempt`**, not `preemption`.", "misconceptionTested": "preemption instead of preempt keyword"},
      {"choiceIndex": 2, "explanation": "**`hsrp`** is not valid IOS syntax — HSRP uses the **`standby`** command family.", "misconceptionTested": "hsrp keyword instead of standby preempt"},
    ],
    "examTip": "HSRP preempt syntax: **`standby <n> preempt`** under **config-if**.",
  },
  "obj-3.5-source-q025": {
    "correct": {"choiceIndex": 1, "explanation": "VRRP virtual IP is set under the interface with **`vrrp <group> ip <address>`** — e.g., **`vrrp 1 ip 10.1.2.3`**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "VRRP is configured **per interface**, not from global config with interface appended on one line.", "misconceptionTested": "Global vrrp with interface argument"},
      {"choiceIndex": 2, "explanation": "Missing the **`ip`** keyword — correct form is **`vrrp 1 ip 10.1.2.3`**, not `vrrp 1 10.1.2.3`.", "misconceptionTested": "VRRP VIP without ip keyword"},
      {"choiceIndex": 3, "explanation": "**`standby`** is HSRP syntax — VRRP uses **`vrrp <group> ip <vip>`**.", "misconceptionTested": "HSRP standby syntax for VRRP"},
    ],
    "examTip": "FHRP syntax split: **HSRP = standby** | **VRRP = vrrp <n> ip <vip>** | **GLBP = glbp <n> ip <vip>**.",
  },
  "obj-3.5-source-q026": {
    "correct": {"choiceIndex": 2, "explanation": "HSRP interface tracking uses **`standby <group> track <interface>`** — link-down lowers priority so the peer can become active."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Wrong keyword order — tracking is **`standby 1 track serial 0/0/1`**, not `interface tracking serial`.", "misconceptionTested": "standby interface tracking word order"},
      {"choiceIndex": 1, "explanation": "**`tracking`** alone is incomplete — Cisco syntax is **`standby <n> track <interface>`**.", "misconceptionTested": "standby tracking without track keyword"},
      {"choiceIndex": 3, "explanation": "Tracking is configured on the **HSRP interface**, not by entering the tracked interface and using `interface tracking` without the interface name.", "misconceptionTested": "Tracking configured on tracked interface"},
    ],
    "examTip": "HSRP track: **`standby <n> track <if>`** [priority decrement] — reacts to upstream ISP link loss.",
  },
  "obj-3.5-source-q027": {
    "correct": {"choiceIndex": 2, "explanation": "Real-time HSRP diagnostics use **`debug standby`** — it streams hello/state events as they occur."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show ip hsrp`** is not valid IOS — verification is **`show standby`**; real-time is **`debug standby`**.", "misconceptionTested": "show ip hsrp as HSRP command"},
      {"choiceIndex": 1, "explanation": "**`debug ip hsrp`** is not standard syntax — Cisco uses **`debug standby`** for HSRP diagnostics.", "misconceptionTested": "debug ip hsrp instead of debug standby"},
      {"choiceIndex": 3, "explanation": "**`debug ip standby`** reverses the keywords — the working command is **`debug standby`**.", "misconceptionTested": "debug ip standby word order"},
    ],
    "examTip": "HSRP troubleshoot: **`show standby`** (snapshot) | **`debug standby`** (live events).",
  },
  "obj-3.5-source-q028": {
    "correct": {"choiceIndex": 0, "explanation": "**GLBP** load-balances by giving different hosts different **AVF virtual MACs** — **per-host** distribution, not one active gateway."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "The **AVG** answers ARP with an **AVF virtual MAC**, not the physical active router's MAC.", "misconceptionTested": "AVG returns physical router MAC"},
      {"choiceIndex": 2, "explanation": "GLBP balances **per host** (different ARP replies) — not a single subnet-wide active/standby model.", "misconceptionTested": "Per-subnet instead of per-host GLBP LB"},
      {"choiceIndex": 3, "explanation": "Tracking adjusts **priority/forwarder selection** — ARP responses come from the **AVG with AVF MACs**.", "misconceptionTested": "Virtual router handles tracking requests"},
    ],
    "examTip": "GLBP = **per-host LB** via AVG/AVF; HSRP = **one active** per group.",
  },
  "obj-3.5-source-q029": {
    "correct": {"choiceIndex": 0, "explanation": "HSRPv2 millisecond timers use **`standby <n> timers msec <hello> msec <hold>`** — hello **200**, hold **700**."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Both values need the **`msec`** keyword in v2 — **`timers msec 200 msec 700`**, not mixed sec/msec.", "misconceptionTested": "Mixed sec and msec timer syntax"},
      {"choiceIndex": 2, "explanation": "Hello and hold are **swapped** — hold must be **longer** than hello (700 > 200).", "misconceptionTested": "Hello/hold timer values reversed"},
      {"choiceIndex": 3, "explanation": "Values are reversed (**700 hello, 200 hold**) — hold must exceed hello interval.", "misconceptionTested": "Hold shorter than hello in timer command"},
    ],
    "examTip": "HSRPv2 timers: **`standby <n> timers msec <hello> msec <hold>`** — hold > hello.",
  },
  "obj-3.5-source-q030": {
    "correct": {"choiceIndex": 2, "explanation": "**Router C (priority 140)** wins active election — HSRP picks the **highest priority**; default is 100 for Router D."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Router A at **80** is below default **100** — it cannot become active over peers at 100+.", "misconceptionTested": "Lowest priority wins HSRP election"},
      {"choiceIndex": 1, "explanation": "Router B at **100** ties the default — Router C at **140** still has higher priority.", "misconceptionTested": "Default priority beats explicit higher priority"},
      {"choiceIndex": 3, "explanation": "Router D stays at default **100** — Router C's **140** is the highest configured priority.", "misconceptionTested": "Default priority router wins over 140"},
    ],
    "examTip": "HSRP active = **highest priority** → tie = **highest IP** on the interface.",
  },
  "obj-4.1-source-q010": {
    "correct": {"choiceIndex": 2, "explanation": "Clear every dynamic NAT entry with **`clear ip nat translation *`** — the asterisk wipes the full translation table."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`no ip nat translation`** is not valid exec syntax — use **`clear ip nat translation *`**.", "misconceptionTested": "no ip nat translation as clear command"},
      {"choiceIndex": 1, "explanation": "**`clear ip nat translation`** without **`*`** is incomplete — add **`*`** to clear all entries.", "misconceptionTested": "Clear without asterisk for all translations"},
      {"choiceIndex": 3, "explanation": "**`clear ip nat`** is truncated — the full command is **`clear ip nat translation *`**.", "misconceptionTested": "Abbreviated clear ip nat command"},
    ],
    "examTip": "Flush NAT table: **`clear ip nat translation *`** — use `*` for all dynamic entries.",
  },
  "obj-4.1-source-q011": {
    "correct": {"choiceIndex": 1, "explanation": "**`debug ip nat`** shows NAT translations **in real time** as packets are translated — `show` commands are snapshots."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show ip translations`** is not standard IOS — even valid `show ip nat translations` is not real-time.", "misconceptionTested": "show ip translations for live NAT"},
      {"choiceIndex": 2, "explanation": "**`debug ip translations`** is not the Cisco NAT debug command — use **`debug ip nat`**.", "misconceptionTested": "debug ip translations instead of debug ip nat"},
      {"choiceIndex": 3, "explanation": "**`show ip nat`** (or `show ip nat translations`) is a **snapshot** — real-time events need **`debug ip nat`**.", "misconceptionTested": "Show command for real-time NAT events"},
    ],
    "examTip": "NAT verify: **`show ip nat translations`** (table) | **`debug ip nat`** (live translation events).",
  },
  "obj-4.1-source-q012": {
    "correct": {"choiceIndex": 2, "explanation": "PAT/overload maps many inside hosts to **one outside address** — ACL + pool + **`overload`** keyword on **`ip nat inside source list`**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Missing **`overload`** — without it, dynamic NAT uses one pool address per host, not many-to-one PAT.", "misconceptionTested": "Dynamic NAT pool without overload as PAT"},
      {"choiceIndex": 1, "explanation": "Wrong syntax (**`ip nat source pool`**) and missing ACL — PAT needs **`ip nat inside source list <acl> pool <name> overload`**.", "misconceptionTested": "ip nat source pool without inside keyword"},
      {"choiceIndex": 3, "explanation": "ACL and pool are correct but **`overload`** is missing — PAT requires the **overload** keyword.", "misconceptionTested": "NAT pool config without overload for PAT"},
    ],
    "examTip": "PAT recipe: ACL permit inside net → **`ip nat inside source list <n> pool <name> overload`**.",
  },
  "obj-6.5-source-q007": {
    "correct": {"choiceIndex": 1, "explanation": "DNA Center REST auth: **POST** credentials to the token endpoint → receive **X-Auth-Token** for later calls."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Sending username/password on **every** request is not the DNA Center pattern — authenticate once, then reuse the **token**.", "misconceptionTested": "Credentials in every REST request"},
      {"choiceIndex": 2, "explanation": "Token issuance is a **POST** (create session), not a **GET** — GET retrieves data, it does not mint tokens.", "misconceptionTested": "GET for authentication token"},
      {"choiceIndex": 3, "explanation": "DNA Center API auth uses **username/password → token** — not a custom public/private key pair workflow on CCNA.", "misconceptionTested": "Key pair auth for DNA Center API"},
    ],
    "examTip": "DNA Center flow: **POST /auth/token** → **`X-Auth-Token`** header on subsequent REST calls.",
  },
  "obj-6.5-source-q008": {
    "correct": {"choiceIndex": 3, "explanation": "**CRUD** (Create, Read, Update, Delete) maps HTTP verbs to **data actions** on REST resources."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "CRUD is not about **memory cleanup** — it describes standard **create/read/update/delete** operations.", "misconceptionTested": "CRUD as memory management"},
      {"choiceIndex": 1, "explanation": "CRUD is the **action model REST implements** — it does not replace REST APIs.", "misconceptionTested": "CRUD as REST replacement"},
      {"choiceIndex": 2, "explanation": "**Base64/JSON** are encodings — CRUD defines **what you do** with data (verbs/actions).", "misconceptionTested": "CRUD as data encoding scheme"},
    ],
    "examTip": "CRUD ↔ HTTP: **POST=Create** | **GET=Read** | **PUT/PATCH=Update** | **DELETE=Delete**.",
  },
  "obj-6.5-source-q009": {
    "correct": {"choiceIndex": 0, "explanation": "DNA Center token requests use **HTTP Basic authentication** — credentials in the **Authorization: Basic** header."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**AD integrated** is an enterprise login option — the REST token exchange itself uses **Basic** auth.", "misconceptionTested": "AD integrated as REST token auth type"},
      {"choiceIndex": 2, "explanation": "**SSL/TLS** encrypts transport — the **authentication scheme** for the token POST is **Basic**.", "misconceptionTested": "SSL as authentication type for token"},
      {"choiceIndex": 3, "explanation": "**Pass-through** is not the REST auth mechanism — DNA Center expects **Basic** credentials for token POST.", "misconceptionTested": "Pass-through auth for DNA token"},
    ],
    "examTip": "Basic auth = **Authorization: Basic <base64(user:pass)>** on the token POST.",
  },
  "obj-6.5-source-q010": {
    "correct": {"choiceIndex": 1, "explanation": "Reuse the token by placing it in the **HTTP header** as **`X-Auth-Token: <token>`** on each API request."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "A script variable alone does not authenticate — the token must be sent in the **request header**.", "misconceptionTested": "Script variable without HTTP header"},
      {"choiceIndex": 2, "explanation": "Tokens belong in **headers**, not the URI — putting secrets in URLs is insecure and not the DNA Center pattern.", "misconceptionTested": "Token passed in URI query string"},
      {"choiceIndex": 3, "explanation": "There is no **10-second re-POST** rule — reuse the issued token in headers until it expires.", "misconceptionTested": "Re-authenticate within 10 seconds per request"},
    ],
    "examTip": "After auth POST → every call carries **`X-Auth-Token`** in the **HTTP header**.",
  },
  "obj-6.5-source-q011": {
    "correct": {"choiceIndex": 2, "explanation": "HTTP Basic auth encodes **`username:password`** with **Base64** before placing it in the Authorization header."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**SSL/TLS** protects the channel — **Base64** is the encoding inside the Basic auth header.", "misconceptionTested": "SSL as credential encoding method"},
      {"choiceIndex": 1, "explanation": "**AAA** is the broader auth framework — Basic auth specifically uses **Base64-encoded** credentials.", "misconceptionTested": "AAA as encoding for Basic auth"},
      {"choiceIndex": 3, "explanation": "**Basic** names the auth **scheme** — the encoding applied to credentials is **Base64**.", "misconceptionTested": "Basic scheme name as encoding method"},
    ],
    "examTip": "Basic auth stack: scheme = **Basic** | payload encoding = **Base64(user:pass)**.",
  },
  "obj-6.5-source-q012": {
    "correct": {"choiceIndex": 1, "explanation": "**RESTCONF** is the HTTPS REST API that configures devices using **YANG** data models."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**OpenFlow** programs forwarding in SDN — structured **YANG config** uses **RESTCONF** (or NETCONF).", "misconceptionTested": "OpenFlow for YANG device config"},
      {"choiceIndex": 2, "explanation": "**SNMP** uses MIB/OIDs — **YANG-modeled** config on modern IOS uses **RESTCONF/NETCONF**.", "misconceptionTested": "SNMP for YANG data model config"},
      {"choiceIndex": 3, "explanation": "Generic **REST API** is too vague — the YANG-specific southbound API on CCNA is **RESTCONF**.", "misconceptionTested": "Generic REST instead of RESTCONF for YANG"},
    ],
    "examTip": "YANG config path: **RESTCONF** (HTTPS/JSON) or **NETCONF** (SSH/XML) — not SNMP/OpenFlow.",
  },
  "obj-6.5-source-q013": {
    "correct": {"choiceIndex": 0, "explanation": "RESTCONF uses IETF content types like **`application/yang-data+json`** — not generic `application/json` alone."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**`application/json`** is generic — RESTCONF expects **`application/yang-data+json`** (or +xml).", "misconceptionTested": "Generic JSON content type for RESTCONF"},
      {"choiceIndex": 2, "explanation": "**`data/json`** is not a valid RESTCONF media type — use **`application/yang-data+json`**.", "misconceptionTested": "Invented data/json content type"},
      {"choiceIndex": 3, "explanation": "RESTCONF payloads are **JSON or XML** — **`data/yaml`** is not a RESTCONF content type.", "misconceptionTested": "YAML content type for RESTCONF requests"},
    ],
    "examTip": "RESTCONF Accept/Content-Type: **`application/yang-data+json`** | **`application/yang-data+xml`**.",
  },
  "obj-6.6-source-q007": {
    "correct": {"choiceIndex": 2, "explanation": "**Ohai** collects **node attributes** (OS, network, hardware) and reports them to Chef Server for policy decisions."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Chef-Client** applies recipes — **Ohai** is the component that **gathers and reports** system facts.", "misconceptionTested": "Chef-Client as fact collector"},
      {"choiceIndex": 1, "explanation": "**Chef Workstation** is the admin/dev machine — **Ohai** runs on the node to collect state.", "misconceptionTested": "Workstation as system state reporter"},
      {"choiceIndex": 3, "explanation": "**Knife** is the CLI admin tool — **Ohai** performs automatic **system discovery**.", "misconceptionTested": "Knife as state collection component"},
    ],
    "examTip": "Chef fact chain: **Ohai** (collect) → **Chef Server** (store) → recipes use node data.",
  },
  "obj-6.6-source-q008": {
    "correct": {"choiceIndex": 1, "explanation": "Ansible locates **`ansible.cfg`** via the **`ANSIBLE_CONFIG`** environment variable (or cwd / default paths)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**ANSIBLE_SETTINGS** is not the documented variable — use **`ANSIBLE_CONFIG`**.", "misconceptionTested": "ANSIBLE_SETTINGS as config path variable"},
      {"choiceIndex": 2, "explanation": "**ansible_connection** is an **inventory/host variable** for transport — not the settings file locator.", "misconceptionTested": "Connection variable as ansible.cfg locator"},
      {"choiceIndex": 3, "explanation": "**/etc/ansible/hosts** is the default **inventory** path — settings file discovery uses **`ANSIBLE_CONFIG`**.", "misconceptionTested": "Inventory path as settings file variable"},
    ],
    "examTip": "Ansible config search: **`ANSIBLE_CONFIG`** env → `./ansible.cfg` → `~/.ansible.cfg` → `/etc/ansible/ansible.cfg`.",
  },
  "obj-6.6-source-q009": {
    "correct": {"choiceIndex": 3, "explanation": "**`ansible-doc <module>`** prints module documentation, parameters, and examples — the built-in module help tool."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**man** pages may exist on Linux but Ansible's native module reference is **`ansible-doc`**.", "misconceptionTested": "man as Ansible module documentation"},
      {"choiceIndex": 1, "explanation": "**cat** displays file contents — it does not summarize Ansible **module** docs.", "misconceptionTested": "cat as module documentation command"},
      {"choiceIndex": 2, "explanation": "**Ad-hoc** runs one-off tasks — **`ansible-doc`** is the command to **read module help**.", "misconceptionTested": "Ad-hoc command as module documentation"},
    ],
    "examTip": "Before using a module: **`ansible-doc -l`** (list) | **`ansible-doc <name>`** (details).",
  },
  "obj-6.6-source-q010": {
    "correct": {"choiceIndex": 2, "explanation": "Ansible **ad-hoc** commands run a single module against hosts **without writing a playbook** — quick tests and one-offs."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Knife** is Chef's CLI — Ansible's no-playbook option is the **ad-hoc** interface.", "misconceptionTested": "Knife as Ansible quick-test tool"},
      {"choiceIndex": 1, "explanation": "**ansible-playbook** requires a playbook file — **ad-hoc** (`ansible host -m module`) skips that.", "misconceptionTested": "Playbook command for no-playbook testing"},
      {"choiceIndex": 3, "explanation": "**Ansible Tower/AWX** is the GUI/controller — ad-hoc testing uses the **`ansible`** CLI directly.", "misconceptionTested": "Tower as ad-hoc command interface"},
    ],
    "examTip": "Ad-hoc pattern: **`ansible <host> -m <module> -a '<args>'`** — no playbook required.",
  },
  "obj-6.6-source-q011": {
    "correct": {"choiceIndex": 3, "explanation": "Puppet **facts** are auto-collected variables about the node (hostname, OS, IP) used in manifests."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "A **resource** declares a managed object (file, service) — auto node info is stored in **facts**.", "misconceptionTested": "Resource as Puppet node variables"},
      {"choiceIndex": 1, "explanation": "A **class** groups resources — **facts** are the discovered node attributes.", "misconceptionTested": "Class as Puppet fact store"},
      {"choiceIndex": 2, "explanation": "A **module** bundles manifests/templates — **facts** are per-node variables from the agent.", "misconceptionTested": "Module as Puppet fact name"},
    ],
    "examTip": "Puppet: **facts** = discovered node data | **manifests** = desired state declarations.",
  },
  "obj-6.6-source-q012": {
    "correct": {"choiceIndex": 0, "explanation": "Chef Server stores uploaded cookbooks on the **Bookshelf** — the internal cookbook repository service."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**Chef Workstation** is where you **author** cookbooks — upload targets the Server **Bookshelf**.", "misconceptionTested": "Workstation as cookbook storage on server"},
      {"choiceIndex": 2, "explanation": "A **Chef Node** is a managed device — cookbooks live on the **Server Bookshelf**, not the node.", "misconceptionTested": "Node as cookbook upload destination"},
      {"choiceIndex": 3, "explanation": "**Chef-Client** downloads and applies cookbooks — the Server **Bookshelf** stores them centrally.", "misconceptionTested": "Client as cookbook repository"},
    ],
    "examTip": "Chef upload flow: Workstation **`knife cookbook upload`** → Server **Bookshelf** → Client pulls recipes.",
  },
  "obj-6.6-source-q013": {
    "correct": {"choiceIndex": 0, "explanation": "**Ansible Tower** (now Ansible Automation Platform) adds **central management, RBAC, and job scheduling** — Red Hat supported."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**Chef** is config management — central RBAC GUI for Ansible is **Tower/AWX**.", "misconceptionTested": "Chef as Red Hat RBAC controller"},
      {"choiceIndex": 2, "explanation": "**Puppet** has its own console — the Red Hat Ansible controller with RBAC is **Tower**.", "misconceptionTested": "Puppet as Ansible Tower equivalent"},
      {"choiceIndex": 3, "explanation": "Plain **Ansible** is CLI/agentless — **Tower** adds the **web UI, RBAC, and audit** layer.", "misconceptionTested": "Core Ansible as RBAC management platform"},
    ],
    "examTip": "Ansible stack: **ansible** (engine) + **Tower/AWX** (GUI, RBAC, scheduling).",
  },
}

assert len(HAND) == 25, len(HAND)

def fmt_entry(id_, rev):
    body = json.dumps(rev, indent=2)
    indented = "\n".join("  " + line if line else line for line in body.splitlines())
    return f"  '{id_}': {indented},"

lines = [
    "/** Gold reviews — Batch 20: FHRP 3.5 q23+, REST APIs 6.5 q7+, config mgmt 6.6 q7+, NAT 4.1 q10+. */",
    "export const BATCH20_GOLD = {",
]
for id_, rev in HAND.items():
    lines.append(fmt_entry(id_, rev))
lines.append("}")
lines.append("")

out = ROOT / "src/answerReview/goldAnswerReviewsBatch20.js"
out.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {len(HAND)} entries to {out.relative_to(ROOT)}")
