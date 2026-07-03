/** Gold reviews — Batch 20: FHRP 3.5 q23+, REST APIs 6.5 q7+, config mgmt 6.6 q7+, NAT 4.1 q10+. */
export const BATCH20_GOLD = {
  'obj-3.5-source-q023':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Without **`standby <n> preempt`**, a higher-priority router will **not displace** the current active router \u2014 priority alone is not enough."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "HSRP default priority is **100**, not 150 \u2014 Router A at 150 should win **only if preemption is enabled**.",
        "misconceptionTested": "Default priority 150 instead of 100"
      },
      {
        "choiceIndex": 1,
        "explanation": "Hold timer expiry causes **failover when hellos are missed** \u2014 it does not block a higher-priority router from taking over.",
        "misconceptionTested": "Hold timer blocking priority-based takeover"
      },
      {
        "choiceIndex": 3,
        "explanation": "IP address is a **tiebreaker** when priorities match \u2014 Router A already has higher priority; **preemption** is the missing piece.",
        "misconceptionTested": "IP tiebreaker as reason priority 150 fails"
      }
    ],
    "examTip": "Higher priority + no preempt = incumbent stays active \u2014 enable **`standby <n> preempt`**."
  },
  'obj-3.5-source-q024':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "HSRP preemption is enabled under the **interface** with **`standby <group> preempt`** \u2014 not `preemption` and not `hsrp`."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "HSRP is configured under the **interface**, not global config \u2014 and the keyword is **`preempt`**, not `preemption`.",
        "misconceptionTested": "Global config standby preemption"
      },
      {
        "choiceIndex": 1,
        "explanation": "Right context (interface) but wrong keyword \u2014 Cisco uses **`preempt`**, not `preemption`.",
        "misconceptionTested": "preemption instead of preempt keyword"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`hsrp`** is not valid IOS syntax \u2014 HSRP uses the **`standby`** command family.",
        "misconceptionTested": "hsrp keyword instead of standby preempt"
      }
    ],
    "examTip": "HSRP preempt syntax: **`standby <n> preempt`** under **config-if**."
  },
  'obj-3.5-source-q025':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "VRRP virtual IP is set under the interface with **`vrrp <group> ip <address>`** \u2014 e.g., **`vrrp 1 ip 10.1.2.3`**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "VRRP is configured **per interface**, not from global config with interface appended on one line.",
        "misconceptionTested": "Global vrrp with interface argument"
      },
      {
        "choiceIndex": 2,
        "explanation": "Missing the **`ip`** keyword \u2014 correct form is **`vrrp 1 ip 10.1.2.3`**, not `vrrp 1 10.1.2.3`.",
        "misconceptionTested": "VRRP VIP without ip keyword"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`standby`** is HSRP syntax \u2014 VRRP uses **`vrrp <group> ip <vip>`**.",
        "misconceptionTested": "HSRP standby syntax for VRRP"
      }
    ],
    "examTip": "FHRP syntax split: **HSRP = standby** | **VRRP = vrrp <n> ip <vip>** | **GLBP = glbp <n> ip <vip>**."
  },
  'obj-3.5-source-q026':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "HSRP interface tracking uses **`standby <group> track <interface>`** \u2014 link-down lowers priority so the peer can become active."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Wrong keyword order \u2014 tracking is **`standby 1 track serial 0/0/1`**, not `interface tracking serial`.",
        "misconceptionTested": "standby interface tracking word order"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`tracking`** alone is incomplete \u2014 Cisco syntax is **`standby <n> track <interface>`**.",
        "misconceptionTested": "standby tracking without track keyword"
      },
      {
        "choiceIndex": 3,
        "explanation": "Tracking is configured on the **HSRP interface**, not by entering the tracked interface and using `interface tracking` without the interface name.",
        "misconceptionTested": "Tracking configured on tracked interface"
      }
    ],
    "examTip": "HSRP track: **`standby <n> track <if>`** [priority decrement] \u2014 reacts to upstream ISP link loss."
  },
  'obj-3.5-source-q027':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Real-time HSRP diagnostics use **`debug standby`** \u2014 it streams hello/state events as they occur."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`show ip hsrp`** is not valid IOS \u2014 verification is **`show standby`**; real-time is **`debug standby`**.",
        "misconceptionTested": "show ip hsrp as HSRP command"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`debug ip hsrp`** is not standard syntax \u2014 Cisco uses **`debug standby`** for HSRP diagnostics.",
        "misconceptionTested": "debug ip hsrp instead of debug standby"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`debug ip standby`** reverses the keywords \u2014 the working command is **`debug standby`**.",
        "misconceptionTested": "debug ip standby word order"
      }
    ],
    "examTip": "HSRP troubleshoot: **`show standby`** (snapshot) | **`debug standby`** (live events)."
  },
  'obj-3.5-source-q028':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**GLBP** load-balances by giving different hosts different **AVF virtual MACs** \u2014 **per-host** distribution, not one active gateway."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "The **AVG** answers ARP with an **AVF virtual MAC**, not the physical active router's MAC.",
        "misconceptionTested": "AVG returns physical router MAC"
      },
      {
        "choiceIndex": 2,
        "explanation": "GLBP balances **per host** (different ARP replies) \u2014 not a single subnet-wide active/standby model.",
        "misconceptionTested": "Per-subnet instead of per-host GLBP LB"
      },
      {
        "choiceIndex": 3,
        "explanation": "Tracking adjusts **priority/forwarder selection** \u2014 ARP responses come from the **AVG with AVF MACs**.",
        "misconceptionTested": "Virtual router handles tracking requests"
      }
    ],
    "examTip": "GLBP = **per-host LB** via AVG/AVF; HSRP = **one active** per group."
  },
  'obj-3.5-source-q029':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "HSRPv2 millisecond timers use **`standby <n> timers msec <hello> msec <hold>`** \u2014 hello **200**, hold **700**."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Both values need the **`msec`** keyword in v2 \u2014 **`timers msec 200 msec 700`**, not mixed sec/msec.",
        "misconceptionTested": "Mixed sec and msec timer syntax"
      },
      {
        "choiceIndex": 2,
        "explanation": "Hello and hold are **swapped** \u2014 hold must be **longer** than hello (700 > 200).",
        "misconceptionTested": "Hello/hold timer values reversed"
      },
      {
        "choiceIndex": 3,
        "explanation": "Values are reversed (**700 hello, 200 hold**) \u2014 hold must exceed hello interval.",
        "misconceptionTested": "Hold shorter than hello in timer command"
      }
    ],
    "examTip": "HSRPv2 timers: **`standby <n> timers msec <hello> msec <hold>`** \u2014 hold > hello."
  },
  'obj-3.5-source-q030':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Router C (priority 140)** wins active election \u2014 HSRP picks the **highest priority**; default is 100 for Router D."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Router A at **80** is below default **100** \u2014 it cannot become active over peers at 100+.",
        "misconceptionTested": "Lowest priority wins HSRP election"
      },
      {
        "choiceIndex": 1,
        "explanation": "Router B at **100** ties the default \u2014 Router C at **140** still has higher priority.",
        "misconceptionTested": "Default priority beats explicit higher priority"
      },
      {
        "choiceIndex": 3,
        "explanation": "Router D stays at default **100** \u2014 Router C's **140** is the highest configured priority.",
        "misconceptionTested": "Default priority router wins over 140"
      }
    ],
    "examTip": "HSRP active = **highest priority** \u2192 tie = **highest IP** on the interface."
  },
  'obj-4.1-source-q010':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Clear every dynamic NAT entry with **`clear ip nat translation *`** \u2014 the asterisk wipes the full translation table."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`no ip nat translation`** is not valid exec syntax \u2014 use **`clear ip nat translation *`**.",
        "misconceptionTested": "no ip nat translation as clear command"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`clear ip nat translation`** without **`*`** is incomplete \u2014 add **`*`** to clear all entries.",
        "misconceptionTested": "Clear without asterisk for all translations"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`clear ip nat`** is truncated \u2014 the full command is **`clear ip nat translation *`**.",
        "misconceptionTested": "Abbreviated clear ip nat command"
      }
    ],
    "examTip": "Flush NAT table: **`clear ip nat translation *`** \u2014 use `*` for all dynamic entries."
  },
  'obj-4.1-source-q011':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**`debug ip nat`** shows NAT translations **in real time** as packets are translated \u2014 `show` commands are snapshots."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`show ip translations`** is not standard IOS \u2014 even valid `show ip nat translations` is not real-time.",
        "misconceptionTested": "show ip translations for live NAT"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`debug ip translations`** is not the Cisco NAT debug command \u2014 use **`debug ip nat`**.",
        "misconceptionTested": "debug ip translations instead of debug ip nat"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`show ip nat`** (or `show ip nat translations`) is a **snapshot** \u2014 real-time events need **`debug ip nat`**.",
        "misconceptionTested": "Show command for real-time NAT events"
      }
    ],
    "examTip": "NAT verify: **`show ip nat translations`** (table) | **`debug ip nat`** (live translation events)."
  },
  'obj-4.1-source-q012':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "PAT/overload maps many inside hosts to **one outside address** \u2014 ACL + pool + **`overload`** keyword on **`ip nat inside source list`**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Missing **`overload`** \u2014 without it, dynamic NAT uses one pool address per host, not many-to-one PAT.",
        "misconceptionTested": "Dynamic NAT pool without overload as PAT"
      },
      {
        "choiceIndex": 1,
        "explanation": "Wrong syntax (**`ip nat source pool`**) and missing ACL \u2014 PAT needs **`ip nat inside source list <acl> pool <name> overload`**.",
        "misconceptionTested": "ip nat source pool without inside keyword"
      },
      {
        "choiceIndex": 3,
        "explanation": "ACL and pool are correct but **`overload`** is missing \u2014 PAT requires the **overload** keyword.",
        "misconceptionTested": "NAT pool config without overload for PAT"
      }
    ],
    "examTip": "PAT recipe: ACL permit inside net \u2192 **`ip nat inside source list <n> pool <name> overload`**."
  },
  'obj-6.5-source-q007':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "DNA Center REST auth: **POST** credentials to the token endpoint \u2192 receive **X-Auth-Token** for later calls."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Sending username/password on **every** request is not the DNA Center pattern \u2014 authenticate once, then reuse the **token**.",
        "misconceptionTested": "Credentials in every REST request"
      },
      {
        "choiceIndex": 2,
        "explanation": "Token issuance is a **POST** (create session), not a **GET** \u2014 GET retrieves data, it does not mint tokens.",
        "misconceptionTested": "GET for authentication token"
      },
      {
        "choiceIndex": 3,
        "explanation": "DNA Center API auth uses **username/password \u2192 token** \u2014 not a custom public/private key pair workflow on CCNA.",
        "misconceptionTested": "Key pair auth for DNA Center API"
      }
    ],
    "examTip": "DNA Center flow: **POST /auth/token** \u2192 **`X-Auth-Token`** header on subsequent REST calls."
  },
  'obj-6.5-source-q008':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**CRUD** (Create, Read, Update, Delete) maps HTTP verbs to **data actions** on REST resources."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "CRUD is not about **memory cleanup** \u2014 it describes standard **create/read/update/delete** operations.",
        "misconceptionTested": "CRUD as memory management"
      },
      {
        "choiceIndex": 1,
        "explanation": "CRUD is the **action model REST implements** \u2014 it does not replace REST APIs.",
        "misconceptionTested": "CRUD as REST replacement"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Base64/JSON** are encodings \u2014 CRUD defines **what you do** with data (verbs/actions).",
        "misconceptionTested": "CRUD as data encoding scheme"
      }
    ],
    "examTip": "CRUD \u2194 HTTP: **POST=Create** | **GET=Read** | **PUT/PATCH=Update** | **DELETE=Delete**."
  },
  'obj-6.5-source-q009':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "DNA Center token requests use **HTTP Basic authentication** \u2014 credentials in the **Authorization: Basic** header."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**AD integrated** is an enterprise login option \u2014 the REST token exchange itself uses **Basic** auth.",
        "misconceptionTested": "AD integrated as REST token auth type"
      },
      {
        "choiceIndex": 2,
        "explanation": "**SSL/TLS** encrypts transport \u2014 the **authentication scheme** for the token POST is **Basic**.",
        "misconceptionTested": "SSL as authentication type for token"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Pass-through** is not the REST auth mechanism \u2014 DNA Center expects **Basic** credentials for token POST.",
        "misconceptionTested": "Pass-through auth for DNA token"
      }
    ],
    "examTip": "Basic auth = **Authorization: Basic <base64(user:pass)>** on the token POST."
  },
  'obj-6.5-source-q010':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Reuse the token by placing it in the **HTTP header** as **`X-Auth-Token: <token>`** on each API request."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "A script variable alone does not authenticate \u2014 the token must be sent in the **request header**.",
        "misconceptionTested": "Script variable without HTTP header"
      },
      {
        "choiceIndex": 2,
        "explanation": "Tokens belong in **headers**, not the URI \u2014 putting secrets in URLs is insecure and not the DNA Center pattern.",
        "misconceptionTested": "Token passed in URI query string"
      },
      {
        "choiceIndex": 3,
        "explanation": "There is no **10-second re-POST** rule \u2014 reuse the issued token in headers until it expires.",
        "misconceptionTested": "Re-authenticate within 10 seconds per request"
      }
    ],
    "examTip": "After auth POST \u2192 every call carries **`X-Auth-Token`** in the **HTTP header**."
  },
  'obj-6.5-source-q011':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "HTTP Basic auth encodes **`username:password`** with **Base64** before placing it in the Authorization header."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**SSL/TLS** protects the channel \u2014 **Base64** is the encoding inside the Basic auth header.",
        "misconceptionTested": "SSL as credential encoding method"
      },
      {
        "choiceIndex": 1,
        "explanation": "**AAA** is the broader auth framework \u2014 Basic auth specifically uses **Base64-encoded** credentials.",
        "misconceptionTested": "AAA as encoding for Basic auth"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Basic** names the auth **scheme** \u2014 the encoding applied to credentials is **Base64**.",
        "misconceptionTested": "Basic scheme name as encoding method"
      }
    ],
    "examTip": "Basic auth stack: scheme = **Basic** | payload encoding = **Base64(user:pass)**."
  },
  'obj-6.5-source-q012':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**RESTCONF** is the HTTPS REST API that configures devices using **YANG** data models."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**OpenFlow** programs forwarding in SDN \u2014 structured **YANG config** uses **RESTCONF** (or NETCONF).",
        "misconceptionTested": "OpenFlow for YANG device config"
      },
      {
        "choiceIndex": 2,
        "explanation": "**SNMP** uses MIB/OIDs \u2014 **YANG-modeled** config on modern IOS uses **RESTCONF/NETCONF**.",
        "misconceptionTested": "SNMP for YANG data model config"
      },
      {
        "choiceIndex": 3,
        "explanation": "Generic **REST API** is too vague \u2014 the YANG-specific southbound API on CCNA is **RESTCONF**.",
        "misconceptionTested": "Generic REST instead of RESTCONF for YANG"
      }
    ],
    "examTip": "YANG config path: **RESTCONF** (HTTPS/JSON) or **NETCONF** (SSH/XML) \u2014 not SNMP/OpenFlow."
  },
  'obj-6.5-source-q013':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "RESTCONF uses IETF content types like **`application/yang-data+json`** \u2014 not generic `application/json` alone."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**`application/json`** is generic \u2014 RESTCONF expects **`application/yang-data+json`** (or +xml).",
        "misconceptionTested": "Generic JSON content type for RESTCONF"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`data/json`** is not a valid RESTCONF media type \u2014 use **`application/yang-data+json`**.",
        "misconceptionTested": "Invented data/json content type"
      },
      {
        "choiceIndex": 3,
        "explanation": "RESTCONF payloads are **JSON or XML** \u2014 **`data/yaml`** is not a RESTCONF content type.",
        "misconceptionTested": "YAML content type for RESTCONF requests"
      }
    ],
    "examTip": "RESTCONF Accept/Content-Type: **`application/yang-data+json`** | **`application/yang-data+xml`**."
  },
  'obj-6.6-source-q007':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Ohai** collects **node attributes** (OS, network, hardware) and reports them to Chef Server for policy decisions."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Chef-Client** applies recipes \u2014 **Ohai** is the component that **gathers and reports** system facts.",
        "misconceptionTested": "Chef-Client as fact collector"
      },
      {
        "choiceIndex": 1,
        "explanation": "**Chef Workstation** is the admin/dev machine \u2014 **Ohai** runs on the node to collect state.",
        "misconceptionTested": "Workstation as system state reporter"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Knife** is the CLI admin tool \u2014 **Ohai** performs automatic **system discovery**.",
        "misconceptionTested": "Knife as state collection component"
      }
    ],
    "examTip": "Chef fact chain: **Ohai** (collect) \u2192 **Chef Server** (store) \u2192 recipes use node data."
  },
  'obj-6.6-source-q008':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Ansible locates **`ansible.cfg`** via the **`ANSIBLE_CONFIG`** environment variable (or cwd / default paths)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**ANSIBLE_SETTINGS** is not the documented variable \u2014 use **`ANSIBLE_CONFIG`**.",
        "misconceptionTested": "ANSIBLE_SETTINGS as config path variable"
      },
      {
        "choiceIndex": 2,
        "explanation": "**ansible_connection** is an **inventory/host variable** for transport \u2014 not the settings file locator.",
        "misconceptionTested": "Connection variable as ansible.cfg locator"
      },
      {
        "choiceIndex": 3,
        "explanation": "**/etc/ansible/hosts** is the default **inventory** path \u2014 settings file discovery uses **`ANSIBLE_CONFIG`**.",
        "misconceptionTested": "Inventory path as settings file variable"
      }
    ],
    "examTip": "Ansible config search: **`ANSIBLE_CONFIG`** env \u2192 `./ansible.cfg` \u2192 `~/.ansible.cfg` \u2192 `/etc/ansible/ansible.cfg`."
  },
  'obj-6.6-source-q009':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**`ansible-doc <module>`** prints module documentation, parameters, and examples \u2014 the built-in module help tool."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**man** pages may exist on Linux but Ansible's native module reference is **`ansible-doc`**.",
        "misconceptionTested": "man as Ansible module documentation"
      },
      {
        "choiceIndex": 1,
        "explanation": "**cat** displays file contents \u2014 it does not summarize Ansible **module** docs.",
        "misconceptionTested": "cat as module documentation command"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Ad-hoc** runs one-off tasks \u2014 **`ansible-doc`** is the command to **read module help**.",
        "misconceptionTested": "Ad-hoc command as module documentation"
      }
    ],
    "examTip": "Before using a module: **`ansible-doc -l`** (list) | **`ansible-doc <name>`** (details)."
  },
  'obj-6.6-source-q010':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Ansible **ad-hoc** commands run a single module against hosts **without writing a playbook** \u2014 quick tests and one-offs."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Knife** is Chef's CLI \u2014 Ansible's no-playbook option is the **ad-hoc** interface.",
        "misconceptionTested": "Knife as Ansible quick-test tool"
      },
      {
        "choiceIndex": 1,
        "explanation": "**ansible-playbook** requires a playbook file \u2014 **ad-hoc** (`ansible host -m module`) skips that.",
        "misconceptionTested": "Playbook command for no-playbook testing"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Ansible Tower/AWX** is the GUI/controller \u2014 ad-hoc testing uses the **`ansible`** CLI directly.",
        "misconceptionTested": "Tower as ad-hoc command interface"
      }
    ],
    "examTip": "Ad-hoc pattern: **`ansible <host> -m <module> -a '<args>'`** \u2014 no playbook required."
  },
  'obj-6.6-source-q011':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "Puppet **facts** are auto-collected variables about the node (hostname, OS, IP) used in manifests."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "A **resource** declares a managed object (file, service) \u2014 auto node info is stored in **facts**.",
        "misconceptionTested": "Resource as Puppet node variables"
      },
      {
        "choiceIndex": 1,
        "explanation": "A **class** groups resources \u2014 **facts** are the discovered node attributes.",
        "misconceptionTested": "Class as Puppet fact store"
      },
      {
        "choiceIndex": 2,
        "explanation": "A **module** bundles manifests/templates \u2014 **facts** are per-node variables from the agent.",
        "misconceptionTested": "Module as Puppet fact name"
      }
    ],
    "examTip": "Puppet: **facts** = discovered node data | **manifests** = desired state declarations."
  },
  'obj-6.6-source-q012':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Chef Server stores uploaded cookbooks on the **Bookshelf** \u2014 the internal cookbook repository service."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**Chef Workstation** is where you **author** cookbooks \u2014 upload targets the Server **Bookshelf**.",
        "misconceptionTested": "Workstation as cookbook storage on server"
      },
      {
        "choiceIndex": 2,
        "explanation": "A **Chef Node** is a managed device \u2014 cookbooks live on the **Server Bookshelf**, not the node.",
        "misconceptionTested": "Node as cookbook upload destination"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Chef-Client** downloads and applies cookbooks \u2014 the Server **Bookshelf** stores them centrally.",
        "misconceptionTested": "Client as cookbook repository"
      }
    ],
    "examTip": "Chef upload flow: Workstation **`knife cookbook upload`** \u2192 Server **Bookshelf** \u2192 Client pulls recipes."
  },
  'obj-6.6-source-q013':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**Ansible Tower** (now Ansible Automation Platform) adds **central management, RBAC, and job scheduling** \u2014 Red Hat supported."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**Chef** is config management \u2014 central RBAC GUI for Ansible is **Tower/AWX**.",
        "misconceptionTested": "Chef as Red Hat RBAC controller"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Puppet** has its own console \u2014 the Red Hat Ansible controller with RBAC is **Tower**.",
        "misconceptionTested": "Puppet as Ansible Tower equivalent"
      },
      {
        "choiceIndex": 3,
        "explanation": "Plain **Ansible** is CLI/agentless \u2014 **Tower** adds the **web UI, RBAC, and audit** layer.",
        "misconceptionTested": "Core Ansible as RBAC management platform"
      }
    ],
    "examTip": "Ansible stack: **ansible** (engine) + **Tower/AWX** (GUI, RBAC, scheduling)."
  },
}
