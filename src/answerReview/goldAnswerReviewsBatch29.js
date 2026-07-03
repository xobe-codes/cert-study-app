/** Gold reviews — Batch 29: 5.x security — CIA/MITM, security program, device hardening, AAA, VPN, ACL (50 entries). */
export const BATCH29_GOLD = {
  'obj-5.1-source-q013':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**DHCP**, **DNS**, and **wireless** are all classic **man-in-the-middle** vectors \u2014 rogue servers or APs intercept or redirect traffic."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "DHCP alone is one MITM path (rogue server) \u2014 but **DNS** and **wireless** are equally valid.",
        "misconceptionTested": "DHCP as sole MITM vector"
      },
      {
        "choiceIndex": 1,
        "explanation": "DNS poisoning/spoofing is a MITM vector \u2014 **wireless** and **DHCP** attacks count too.",
        "misconceptionTested": "DNS as sole MITM vector"
      },
      {
        "choiceIndex": 2,
        "explanation": "Evil-twin and rogue AP attacks are MITM \u2014 **DHCP** and **DNS** hijacks also qualify.",
        "misconceptionTested": "Wireless as sole MITM vector"
      }
    ],
    "examTip": "MITM vectors: **rogue DHCP/DNS**, **ARP spoofing**, **evil-twin WLAN** \u2014 think \"who can sit between client and real server?\""
  },
  'obj-5.1-source-q014':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "The **native VLAN** is the **default** on trunk ports \u2014 attackers target VLAN 1 if left unchanged; move it to an unused VLAN."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Untagged frames carry **one** VLAN ID (native) \u2014 they do **not** contain frames from **all** VLANs.",
        "misconceptionTested": "Native VLAN carries all VLAN traffic"
      },
      {
        "choiceIndex": 1,
        "explanation": "Native VLAN is **not** a logging feature \u2014 it's the **default untagged VLAN** on trunks.",
        "misconceptionTested": "Native VLAN for switch logging"
      },
      {
        "choiceIndex": 3,
        "explanation": "Native VLAN traffic is **unencrypted on the wire** \u2014 but the exam reason is it's the **default on all ports**.",
        "misconceptionTested": "Native VLAN encryption as primary risk"
      }
    ],
    "examTip": "Change native VLAN: **`switchport trunk native vlan <unused-id>`** on **both** ends \u2014 never leave VLAN 1 as native on trunks."
  },
  'obj-5.2-source-q003':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Privacy filters** (screen protectors) block side-angle viewing \u2014 physical **data confidentiality** at the monitor."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Security filters** is vague \u2014 the CCNA term is **privacy** screen filters for shoulder-angle protection.",
        "misconceptionTested": "Generic security filter term"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Degaussing** erases magnetic media \u2014 not a monitor overlay for viewing angles.",
        "misconceptionTested": "Degaussing for screen privacy"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Tempered** glass protects the screen physically \u2014 it does **not** limit off-angle readability.",
        "misconceptionTested": "Tempered glass for privacy"
      }
    ],
    "examTip": "Physical layer: **privacy filters** = shoulder-surfing defense | **mantraps** = tailgating defense."
  },
  'obj-5.2-source-q004':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**Shoulder surfing** is watching someone type or read sensitive data over their shoulder \u2014 no technology required."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**Phishing** uses deceptive email/websites \u2014 not physically watching the user's screen.",
        "misconceptionTested": "Phishing as shoulder surfing"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Tailgating** is following someone through a secured door \u2014 not reading over a shoulder.",
        "misconceptionTested": "Tailgating as shoulder surfing"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Whaling** targets executives with spear-phishing \u2014 not physical observation.",
        "misconceptionTested": "Whaling as shoulder surfing"
      }
    ],
    "examTip": "Social engineering map: **shoulder surfing** (watch) | **tailgating** (door) | **phishing** (email) | **whaling** (exec phishing)."
  },
  'obj-5.2-source-q005':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**Least privilege** \u2014 remove unnecessary admin rights from office users \u2014 is the fastest policy win with no new hardware."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Biometrics** require hardware/deployment \u2014 not the **easiest immediate** fix.",
        "misconceptionTested": "Biometrics as quickest admin-privilege fix"
      },
      {
        "choiceIndex": 1,
        "explanation": "**Hardware tokens** add cost and rollout time \u2014 **least privilege** is policy-only.",
        "misconceptionTested": "Hardware tokens as easiest fix"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Active Directory** groups help but still need **least-privilege** role design \u2014 not instant alone.",
        "misconceptionTested": "AD alone removes excess admin rights"
      }
    ],
    "examTip": "Security program quick wins: **least privilege** + **separation of duties** before buying new auth hardware."
  },
  'obj-5.2-source-q006':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Anti-malware** (endpoint protection) blocks **Trojans, viruses, and phishing payloads** \u2014 broader than antivirus alone."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**MFA** protects **login** \u2014 it does **not** scan email attachments or block malware execution.",
        "misconceptionTested": "MFA for malware and phishing email"
      },
      {
        "choiceIndex": 1,
        "explanation": "**Host firewalls** filter ports/traffic \u2014 they don't replace **malware/phishing** endpoint scanning.",
        "misconceptionTested": "Software firewall as anti-malware"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Antivirus** is a subset \u2014 **anti-malware** is the umbrella term covering Trojans, viruses, and phishing links.",
        "misconceptionTested": "Antivirus equals full endpoint protection"
      }
    ],
    "examTip": "Endpoint: **anti-malware/EDR** for malicious files + **email filtering** for phishing \u2014 MFA is identity, not malware defense."
  },
  'obj-5.2-source-q007':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Mantraps** (two-door access control) physically prevent **tailgating** \u2014 only one person passes at a time."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**User authentication** verifies identity \u2014 it does **not** stop a second person slipping through a door.",
        "misconceptionTested": "Authentication stops tailgating"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Strong passwords** protect accounts \u2014 not **physical** door piggybacking.",
        "misconceptionTested": "Passwords prevent tailgating"
      },
      {
        "choiceIndex": 3,
        "explanation": "**SSID changes** affect wireless \u2014 **tailgating** is a **physical access** problem.",
        "misconceptionTested": "WLAN SSID change for tailgating"
      }
    ],
    "examTip": "Tailgating controls: **mantraps**, **security guards**, **turnstiles** \u2014 not passwords."
  },
  'obj-5.3-source-q001':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**`enable secret <password>`** in global config sets the **privileged EXEC** password using **MD5/strong hash** (overrides `enable password`)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`password enable`** is invalid syntax \u2014 use **`enable secret`** or **`enable password`**.",
        "misconceptionTested": "password enable command order"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`enable Password20!`** sets a **weak/cleartext** enable password \u2014 **`enable secret`** is preferred.",
        "misconceptionTested": "enable without secret keyword"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`secret enable`** reverses keywords \u2014 correct form is **`enable secret <pwd>`**.",
        "misconceptionTested": "secret enable word order"
      }
    ],
    "examTip": "Enable password: **`enable secret`** (hashed) beats **`enable password`** (weak) \u2014 secret always wins at login."
  },
  'obj-5.3-source-q003':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**`enable secret`** overrides **`enable password`** \u2014 if secret is set to something else, the plain `enable password` is ignored."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "You may be typing the right **`enable password`** \u2014 but **`enable secret`** takes precedence when both exist.",
        "misconceptionTested": "Wrong password typed as root cause"
      },
      {
        "choiceIndex": 2,
        "explanation": "IOS accepts **special characters** in passwords \u2014 the conflict is **`enable secret`** overriding **`enable password`**.",
        "misconceptionTested": "Special characters break enable password"
      },
      {
        "choiceIndex": 3,
        "explanation": "Password length limits exist but **secret override** is the typical cause of this symptom.",
        "misconceptionTested": "Password truncation on enable"
      }
    ],
    "examTip": "Troubleshoot enable: **`show running-config | include enable`** \u2014 look for **`enable secret`** first."
  },
  'obj-5.3-source-q004':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**`password <pwd>`** then **`login`** under **config-line** \u2014 password alone does nothing until **`login`** is enabled."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`set password`** and **`request login`** are not valid IOS line commands.",
        "misconceptionTested": "set password and request login"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`login password`** is wrong syntax \u2014 sequence is **`password`** then **`login`**.",
        "misconceptionTested": "login password combined syntax"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`login password <pwd>`** is invalid \u2014 set **`password`**, then **`login`** on separate lines.",
        "misconceptionTested": "login password single command"
      }
    ],
    "examTip": "VTY password: **`line vty 0 4`** \u2192 **`password <pwd>`** \u2192 **`login`** \u2192 **`transport input ssh`**."
  },
  'obj-5.3-source-q005':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**`login`** is configured but no **`password`** (or local user) on the **vty line** \u2014 Telnet rejects with \"Password required, but none set\"."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Enable secret** affects privileged mode (`#`) \u2014 this error is a **line login** password missing.",
        "misconceptionTested": "Enable secret for vty login error"
      },
      {
        "choiceIndex": 1,
        "explanation": "**Enable password** is for privileged EXEC \u2014 **vty** needs **`password`/`login`** or **`login local`**.",
        "misconceptionTested": "Enable password for vty login"
      },
      {
        "choiceIndex": 3,
        "explanation": "Admin **down** gives a different error \u2014 \"**Password required, but none set**\" means **`login`** without a password.",
        "misconceptionTested": "Line administratively down"
      }
    ],
    "examTip": "Telnet fail messages: **no password set** = add **`password`** + **`login`** or **`username`** + **`login local`**."
  },
  'obj-5.3-source-q006':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "SSH key generation requires **`hostname`** and **`ip domain-name`** \u2014 IOS embeds them in the certificate distinguished name."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Clock/NTP helps logs and certs elsewhere \u2014 **hostname + domain-name** are mandatory before **`crypto key generate rsa`**.",
        "misconceptionTested": "Time/date before SSH keys"
      },
      {
        "choiceIndex": 2,
        "explanation": "Key **modulus** is specified at generation time \u2014 not a separate prerequisite step.",
        "misconceptionTested": "Separate key strength prerequisite"
      },
      {
        "choiceIndex": 3,
        "explanation": "No **key repository** config exists \u2014 set **hostname** and **domain-name** first.",
        "misconceptionTested": "Key repository prerequisite"
      }
    ],
    "examTip": "SSH setup order: **`hostname`** \u2192 **`ip domain-name`** \u2192 **`crypto key generate rsa`** \u2192 **`ip ssh version 2`**."
  },
  'obj-5.3-source-q007':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**`ip ssh version 2`** in **global config** forces **SSHv2** \u2014 v1 is disabled when v2 is enabled."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**`version 2`** under **config-line** is invalid \u2014 SSH version is a **global** setting.",
        "misconceptionTested": "SSH version on vty line"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`config-ssh`** mode does not exist \u2014 use **`Router(config)# ip ssh version 2`**.",
        "misconceptionTested": "config-ssh submode"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`ssh version 2`** omits **`ip`** keyword \u2014 correct command is **`ip ssh version 2`**.",
        "misconceptionTested": "ssh version without ip keyword"
      }
    ],
    "examTip": "SSHv2: **`ip ssh version 2`** + RSA modulus **\u2265 768** (1024+ recommended) + **`transport input ssh`** on vty."
  },
  'obj-5.3-source-q008':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**`transport input ssh telnet`** under **line vty** allows **SSH first** with **Telnet fallback** on those lines."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`login ssh telnet`** is not valid \u2014 transport protocols are set with **`transport input`** on the **line**.",
        "misconceptionTested": "login ssh telnet global"
      },
      {
        "choiceIndex": 1,
        "explanation": "Close \u2014 but **`login`** sets auth, not transport \u2014 use **`transport input ssh telnet`**.",
        "misconceptionTested": "login ssh telnet on line"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`transport`** is a **line** command, not global config.",
        "misconceptionTested": "transport input in global config"
      }
    ],
    "examTip": "VTY transport: **`transport input ssh`** (SSH only) | **`transport input ssh telnet`** (both) | **`transport input none`** (lock out)."
  },
  'obj-5.3-source-q009':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "Replace Telnet with SSH because SSH **encrypts** the entire session \u2014 credentials and commands are not sent in cleartext."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Telnet has **no encryption** (not merely weak) \u2014 every byte is readable on the wire.",
        "misconceptionTested": "Telnet has weak encryption"
      },
      {
        "choiceIndex": 1,
        "explanation": "File copy uses **SCP/SFTP** \u2014 not the primary reason to swap Telnet for SSH.",
        "misconceptionTested": "SSH file copy as main benefit"
      },
      {
        "choiceIndex": 2,
        "explanation": "ACLs control **who** connects \u2014 SSH adds **encryption** independent of ACL rules.",
        "misconceptionTested": "SSH simplifies ACL creation"
      }
    ],
    "examTip": "Telnet = **TCP/23 cleartext** | SSH = **TCP/22 encrypted** \u2014 disable Telnet: **`transport input ssh`**."
  },
  'obj-5.3-source-q010':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Apply ACL to **vty lines** with **`ip access-class <num> in`** \u2014 restricts **who can Telnet/SSH** to the device."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`ip access-group`** on **SVI** filters **transit/routed** traffic \u2014 not **management sessions** on vty.",
        "misconceptionTested": "SVI access-group for vty management"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`ip access-group`** is for **interfaces** \u2014 vty lines use **`ip access-class`**.",
        "misconceptionTested": "ip access-group on vty line"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`ip access-group`** in global config is invalid \u2014 define ACL, then **`ip access-class`** under **line vty**.",
        "misconceptionTested": "Global ip access-group for management"
      }
    ],
    "examTip": "Mgmt ACL: **`access-list 1 permit host <admin-ip>`** \u2192 **`line vty 0 15`** \u2192 **`access-class 1 in`**."
  },
  'obj-5.3-source-q011':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**SSHv2** requires RSA keys of at least **768 bits** \u2014 generate with **`crypto key generate rsa modulus 1024`** (or higher)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Clock sync helps logging \u2014 it does **not** block **`ip ssh version 2`** like insufficient **key modulus** does.",
        "misconceptionTested": "NTP required for SSHv2"
      },
      {
        "choiceIndex": 2,
        "explanation": "DNS is **not** required for SSHv2 \u2014 **key size** is the usual blocker.",
        "misconceptionTested": "DNS for SSHv2 enablement"
      },
      {
        "choiceIndex": 3,
        "explanation": "No **DNS host record** is needed on-device \u2014 **RSA modulus \u2265 768** enables v2.",
        "misconceptionTested": "DNS host record for SSHv2"
      }
    ],
    "examTip": "SSHv2 fail: regenerate keys \u2014 **`crypto key generate rsa modulus 2048`** then **`ip ssh version 2`**."
  },
  'obj-5.3-source-q012':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**`username <name> password <secret>`** in global config creates a **local user** for **`login local`** authentication."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**`account`** submode is not valid IOS \u2014 use **`username`** in global config.",
        "misconceptionTested": "account submode for local user"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`user`** alone is incomplete \u2014 syntax is **`username <name> password|secret <pwd>`**.",
        "misconceptionTested": "user without username keyword"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`user-account`** is not Cisco syntax \u2014 use **`username`**.",
        "misconceptionTested": "user-account command"
      }
    ],
    "examTip": "Prefer **`username bob secret <pwd>`** (hashed) over **`password`** (weak) + **`login local`** on vty."
  },
  'obj-5.3-source-q013':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**`crypto key generate rsa`** in **global config** creates the **RSA key pair** SSH uses for encryption."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Keyword order matters \u2014 **`crypto key generate rsa`**, not **`generate crypto key rsa`**.",
        "misconceptionTested": "Wrong crypto key word order"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`crypto generate key rsa`** scrambles middle keywords \u2014 use **`crypto key generate rsa`**.",
        "misconceptionTested": "crypto generate key word order"
      },
      {
        "choiceIndex": 3,
        "explanation": "Key generation runs in **config mode** (`Router(config)#`), not privileged EXEC alone.",
        "misconceptionTested": "RSA key in exec mode only"
      }
    ],
    "examTip": "Verify SSH: **`show ip ssh`** \u2014 keys present, version 2.0, timeout/authentication retries."
  },
  'obj-5.3-source-q014':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**`exec-timeout 0 0`** under **config-line** disables idle disconnect \u2014 **0 minutes, 0 seconds** = never timeout."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**`exec-timeout`** is a **line** command, not global config.",
        "misconceptionTested": "exec-timeout in global config"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`timeout`** alone is invalid \u2014 IOS uses **`exec-timeout <min> <sec>`**.",
        "misconceptionTested": "timeout without exec keyword"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`no exec-timeout`** restores default (10 min) \u2014 use **`exec-timeout 0 0`** to disable.",
        "misconceptionTested": "no exec-timeout disables timeout"
      }
    ],
    "examTip": "Line timeout: **`exec-timeout 30 0`** = 30 min idle | **`exec-timeout 0 0`** = never disconnect."
  },
  'obj-5.3-source-q015':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "The **asterisk (*)** marks **your current session** \u2014 if you Telnet'd as **admin** from **192.168.1.50**, you're on **VTY 0**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Console 0** is line 0 \u2014 when connected via **vty**, the `*` appears on your **vty** line, not console.",
        "misconceptionTested": "Always console when asterisk shown"
      },
      {
        "choiceIndex": 2,
        "explanation": "**VTY 1** shows **idle 5** with no user \u2014 your active **admin** session is **VTY 0**.",
        "misconceptionTested": "Idle vty as current session"
      },
      {
        "choiceIndex": 3,
        "explanation": "Only **vty 0\u20131** exist in the output \u2014 **VTY 2** is not listed.",
        "misconceptionTested": "Nonexistent vty line"
      }
    ],
    "examTip": "**`show users`** / **`show line`**: `*` = your session | **`clear line vty <n>`** kicks another admin."
  },
  'obj-5.3-source-q016':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**`login local`** on **line vty** tells SSH/Telnet to authenticate against the **local username database** you created."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`aaa new-model`** enables full AAA \u2014 simple local auth only needs **`login local`** on the line.",
        "misconceptionTested": "aaa new-model for basic local login"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`local authentication`** is not a global command \u2014 use **`login local`** under **line vty**.",
        "misconceptionTested": "local authentication global"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`local authentication`** is invalid under **config-line** \u2014 the command is **`login local`**.",
        "misconceptionTested": "local authentication on line"
      }
    ],
    "examTip": "Local auth chain: **`username`** \u2192 **`line vty 0 15`** \u2192 **`login local`** \u2192 **`transport input ssh`**."
  },
  'obj-5.3-source-q017':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**`exec-timeout 30 0`** under **config-line** sets **30 minutes** idle before disconnect (minutes, then seconds)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`exec-timeout`** belongs under **line** config, not global config.",
        "misconceptionTested": "exec-timeout in global config"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`exec-timeout 0 30`** means **0 minutes, 30 seconds** \u2014 not 30 minutes.",
        "misconceptionTested": "Reversed exec-timeout fields"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`timeout`** without **`exec-`** is invalid IOS syntax.",
        "misconceptionTested": "timeout without exec keyword"
      }
    ],
    "examTip": "**`exec-timeout <minutes> <seconds>`** on **line con 0** and **line vty** \u2014 default is often **10 0**."
  },
  'obj-5.3-source-q018':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**`clear line vty 2`** from **privileged EXEC** terminates the session on **vty 2** \u2014 kicks that admin off."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`no enable secret`** removes **your** enable password \u2014 it does **not** disconnect a remote vty user.",
        "misconceptionTested": "no enable secret disconnects user"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`no line vty 2`** is invalid \u2014 you **clear** an active session, not delete the line.",
        "misconceptionTested": "no line vty to disconnect"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`disconnect line vty 2`** is not valid IOS \u2014 use **`clear line vty 2`**.",
        "misconceptionTested": "disconnect line command"
      }
    ],
    "examTip": "Kick user: **`show users`** \u2192 note line \u2192 **`clear line vty <n>`** (confirm when prompted)."
  },
  'obj-5.3-source-q019':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Exec banner** displays **after successful login** to **any** connection type \u2014 only **authenticated** users see it."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**MOTD** shows **before** login to everyone connecting \u2014 not post-auth only.",
        "misconceptionTested": "MOTD for authenticated users only"
      },
      {
        "choiceIndex": 1,
        "explanation": "**Login banner** appears **before** authentication \u2014 unauthenticated users see it.",
        "misconceptionTested": "Login banner post-authentication"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Incoming banner** is for reverse-telnet modem lines \u2014 **exec banner** is the standard post-login message.",
        "misconceptionTested": "Incoming banner for all connections"
      }
    ],
    "examTip": "Banners: **login** (pre-auth) | **MOTD** (pre-auth warning) | **exec** (post-auth, authenticated only)."
  },
  'obj-5.4-source-q001':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**One-time tokens** (OTP/HOTP/TOTP) expire after use or a **short time window** \u2014 ideal for session-bound medical data access."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**Certificates** can be long-lived \u2014 tokens are **time/session-limited** by design.",
        "misconceptionTested": "Certificates as time-limited session creds"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Smart cards** prove possession \u2014 the **token code** is what rotates per session/time.",
        "misconceptionTested": "Smart card as time-limited token"
      },
      {
        "choiceIndex": 3,
        "explanation": "**License keys** authorize software \u2014 not per-session user authentication.",
        "misconceptionTested": "License as session authentication"
      }
    ],
    "examTip": "AAA factors: **something you know** (password) | **have** (token/smart card) | **are** (biometric)."
  },
  'obj-5.4-source-q002':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**`service password-encryption`** obfuscates **line passwords** in **show run** \u2014 weak encryption but hides cleartext."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`password encryption`** is not valid \u2014 the global command is **`service password-encryption`**.",
        "misconceptionTested": "password encryption command"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`service encryption`** does not exist \u2014 use **`service password-encryption`**.",
        "misconceptionTested": "service encryption command"
      },
      {
        "choiceIndex": 3,
        "explanation": "Keyword order is **`service password-encryption`**, not reversed.",
        "misconceptionTested": "password-encryption service word order"
      }
    ],
    "examTip": "Password display: **`enable secret`** = strong hash | **`service password-encryption`** = obfuscate line passwords | **`username secret`** = best for local users."
  },
  'obj-5.4-source-q003':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**`enable algorithm-type scrypt secret <pwd>`** sets enable password using **SHA-256 scrypt** \u2014 strongest IOS password storage."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`enable secret 9`** is shorthand on some platforms \u2014 full syntax specifies **`algorithm-type scrypt`**.",
        "misconceptionTested": "enable secret 9 without algorithm keyword"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`service password-encryption`** uses weak Type 7 \u2014 **scrypt** is set on **`enable secret`** with **`algorithm-type`**.",
        "misconceptionTested": "service password-encryption for scrypt"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`enable secret algorithm-type scrypt`** omits the **password value** \u2014 include **`secret <pwd>`**.",
        "misconceptionTested": "enable secret algorithm without password"
      }
    ],
    "examTip": "Strong enable: **`enable algorithm-type scrypt secret <pwd>`** | Type 5 = MD5 | Type 7 = weak reversible."
  },
  'obj-5.4-source-q004':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "A **line password** without **`service password-encryption`** stores as **cleartext** in running-config \u2014 default is **not** hashed."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**MD5** is used by **`enable secret`** (Type 5) \u2014 plain **`password`** on a line is **cleartext** by default.",
        "misconceptionTested": "MD5 default for line password"
      },
      {
        "choiceIndex": 1,
        "explanation": "**SHA-128** is not a Cisco line-password default \u2014 line passwords start **cleartext**.",
        "misconceptionTested": "SHA-128 default line encryption"
      },
      {
        "choiceIndex": 2,
        "explanation": "**SHA-256 scrypt** is for **`enable algorithm-type scrypt`** \u2014 not the default for **`line password`**.",
        "misconceptionTested": "SHA-256 default for line password"
      }
    ],
    "examTip": "Password types: line **`password`** = cleartext | **`enable secret`** = hashed | **`username secret`** = hashed local user."
  },
  'obj-5.4-source-q005':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "A **smart card** is **multifactor** \u2014 **something you have** (card) plus **something you know** (PIN)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Single-factor is **one** category \u2014 smart card + PIN is **two factors**.",
        "misconceptionTested": "Smart card as single factor"
      },
      {
        "choiceIndex": 1,
        "explanation": "**RADIUS** is an **AAA protocol** \u2014 not an authentication **factor type**.",
        "misconceptionTested": "RADIUS as auth factor category"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Active Directory** is a **directory service** \u2014 smart cards are **multifactor** regardless of backend.",
        "misconceptionTested": "AD as factor type for smart card"
      }
    ],
    "examTip": "MFA examples: **password + OTP**, **password + smart card/PIN**, **password + biometric**."
  },
  'obj-5.4-source-q006':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**Password complexity** (length, mixed case, numbers, symbols) blocks **dictionary/brute-force** password attacks."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**Expiration** limits credential lifetime \u2014 **complexity** stops weak/guessable passwords from being set.",
        "misconceptionTested": "Expiration prevents password guessing"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Phishing protection** is email/user training \u2014 compromised **guessed** passwords need **complexity**.",
        "misconceptionTested": "Phishing protection for password attacks"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Time restrictions** limit **when** users log in \u2014 not **how strong** passwords must be.",
        "misconceptionTested": "Time restrictions prevent password attacks"
      }
    ],
    "examTip": "Account policy: **complexity** + **lockout** + **expiration** \u2014 complexity is the direct anti-guessing control."
  },
  'obj-5.5-source-q001':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**GRE** wraps an inner IP packet inside an outer IP header \u2014 classic **packet-in-packet** tunnel encapsulation."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**GRE alone** does **not** provide IPsec \u2014 often **GRE over IPsec** combines tunnel + encryption.",
        "misconceptionTested": "GRE includes IPsec by default"
      },
      {
        "choiceIndex": 1,
        "explanation": "GRE uses IP protocol **47**, not **57** (SKIP).",
        "misconceptionTested": "GRE protocol number 57"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Per-packet authentication** is an **IPsec** feature \u2014 plain GRE has **no** built-in auth.",
        "misconceptionTested": "GRE per-packet authentication"
      }
    ],
    "examTip": "GRE = **proto 47**, adds 24-byte header, **no encryption** | IPsec adds **confidentiality/integrity**."
  },
  'obj-5.5-source-q002':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Per this exam objective, **GRE** is the **Cisco-proprietary tunnel** choice \u2014 (IETF GRE is widely used on Cisco routers)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**PPP** is a standard WAN framing protocol \u2014 not the listed Cisco proprietary tunnel.",
        "misconceptionTested": "PPP as Cisco proprietary tunnel"
      },
      {
        "choiceIndex": 2,
        "explanation": "**IPsec** is an **open standard** for secure VPN \u2014 not Cisco-only.",
        "misconceptionTested": "IPsec as Cisco proprietary"
      },
      {
        "choiceIndex": 3,
        "explanation": "**SSL/TLS VPN** is standards-based \u2014 exam key selects **GRE** here.",
        "misconceptionTested": "SSL as Cisco proprietary tunnel"
      }
    ],
    "examTip": "Tunnel types: **GRE** (overlay) | **IPsec** (secure) | **DMVPN** (dynamic hub-spoke GRE+IPsec)."
  },
  'obj-5.5-source-q005':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "Route remote LAN **192.168.3.0/24** via the **tunnel endpoint IP 192.168.2.2** (peer side of the /30 tunnel subnet) on Router A."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`tunnel 0`** as next-hop works on some designs \u2014 this item expects the **peer tunnel IP 192.168.2.2** as next hop.",
        "misconceptionTested": "Interface tunnel as only static route form"
      },
      {
        "choiceIndex": 1,
        "explanation": "**192.168.2.0/24** is the **local** LAN \u2014 route the **remote 192.168.3.0/24** network.",
        "misconceptionTested": "Route to local LAN via tunnel"
      },
      {
        "choiceIndex": 2,
        "explanation": "Routing via **serial** sends traffic **unencapsulated** \u2014 remote LAN needs a **tunnel** next hop.",
        "misconceptionTested": "Serial next hop for GRE remote LAN"
      }
    ],
    "examTip": "GRE static route: **`ip route <remote-LAN> <mask> <tunnel0|peer-tunnel-IP>`** \u2014 tunnel interface must be **up/up**."
  },
  'obj-5.5-source-q006':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Default **GRE tunnel MTU** is **1476** bytes \u2014 1500 minus the **24-byte GRE header** (and outer IP overhead)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**1492** is common on **PPPoE** links \u2014 GRE default is **1476**.",
        "misconceptionTested": "PPPoE MTU for GRE"
      },
      {
        "choiceIndex": 2,
        "explanation": "**1500** is standard Ethernet \u2014 GRE **subtracts** encapsulation overhead \u2192 **1476**.",
        "misconceptionTested": "Ethernet MTU unchanged in GRE"
      },
      {
        "choiceIndex": 3,
        "explanation": "**1528** is not the GRE default \u2014 expect **1476** unless manually **`ip mtu`** adjusted.",
        "misconceptionTested": "Inflated GRE default MTU"
      }
    ],
    "examTip": "GRE MTU: default **1476** | fragmentation issues? Lower **`ip mtu`** on tunnel or enable **TCP MSS adjust**."
  },
  'obj-5.5-source-q007':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**`show interface tunnel 0`** displays **tunnel source**, **destination**, encapsulation, and **line protocol** status."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`show ip tunnel 0`** is not standard IOS \u2014 use **`show interface tunnel 0`**.",
        "misconceptionTested": "show ip tunnel command"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`show ip gre`** does not exist \u2014 tunnel details are under **`show interface tunnel`**.",
        "misconceptionTested": "show ip gre command"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`show ip route`** shows routing \u2014 not **tunnel source/destination** binding.",
        "misconceptionTested": "Routing table for tunnel endpoints"
      }
    ],
    "examTip": "GRE verify: **`show interface tunnel 0`** (src/dst) + **`show ip route`** (static/tracked route to remote LAN)."
  },
  'obj-5.5-source-q008':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Traceroute across a **single GRE hop** shows **one hop** \u2014 the tunnel is one logical L3 path to the remote subnet."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Two hops would imply an **intermediate router** in the underlay \u2014 GRE presents as **one** tunnel hop.",
        "misconceptionTested": "GRE counts underlay plus overlay hops"
      },
      {
        "choiceIndex": 2,
        "explanation": "Four hops overshoots \u2014 end-to-end across one GRE tunnel is typically **one** displayed hop.",
        "misconceptionTested": "Multiple hops for single GRE tunnel"
      },
      {
        "choiceIndex": 3,
        "explanation": "Traceroute always shows **at least one** hop \u2014 zero is invalid.",
        "misconceptionTested": "Zero hops on traceroute"
      }
    ],
    "examTip": "GRE traceroute shows **tunnel endpoint** as one hop \u2014 underlay hops may be hidden inside the tunnel."
  },
  'obj-5.5-source-q009':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Tunnel **up/up** but **no route** to **192.168.3.0/24** \u2014 add **`ip route`** pointing remote LAN out **Tunnel0** (or peer IP)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Tunnel **number** is local \u2014 mismatch doesn't break reachability if **source/destination** match.",
        "misconceptionTested": "Tunnel number mismatch"
      },
      {
        "choiceIndex": 1,
        "explanation": "Wrong **tunnel destination** usually leaves tunnel **down/down** \u2014 here it's **up/up** so **routing** is the gap.",
        "misconceptionTested": "Tunnel destination when interface up"
      },
      {
        "choiceIndex": 3,
        "explanation": "Serial **IP mismatch** would break underlay \u2014 symptom here is missing **static/route** to remote LAN.",
        "misconceptionTested": "Serial IP mismatch when tunnel up"
      }
    ],
    "examTip": "GRE checklist: **tunnel source/dest** \u2192 **tunnel IP addressing** \u2192 **route to remote LAN via tunnel**."
  },
  'obj-5.5-source-q011':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**PPP** on one router and **HDLC** on the other is a **Layer 2 encapsulation mismatch** \u2014 link won't pass frames."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Admin down** would show **down/down** \u2014 ping failure with **up/up** points to **encapsulation**.",
        "misconceptionTested": "Shut interface as default guess"
      },
      {
        "choiceIndex": 1,
        "explanation": "Cable faults are possible \u2014 **PPP vs HDLC** is the explicit misconfiguration in the scenario.",
        "misconceptionTested": "Wiring before protocol mismatch"
      },
      {
        "choiceIndex": 3,
        "explanation": "IP mismatch causes **ping failures** at L3 \u2014 **encapsulation mismatch** prevents L2 communication first.",
        "misconceptionTested": "IP mismatch over encapsulation"
      }
    ],
    "examTip": "WAN encapsulation: Cisco default **HDLC** | multi-vendor **PPP** \u2014 **both ends must match**."
  },
  'obj-5.5-source-q012':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**DMVPN** uses a **hub-and-spoke** model \u2014 spokes tunnel to hub; spokes can build **dynamic spoke-to-spoke** tunnels."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Point-to-point** is one tunnel per link \u2014 DMVPN scales **many spokes** to a **hub**.",
        "misconceptionTested": "DMVPN as point-to-point"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Full mesh** needs n(n-1)/2 tunnels \u2014 DMVPN is **hub-spoke** with optional dynamic meshes.",
        "misconceptionTested": "DMVPN as static full mesh"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Dual-homed** describes **redundant ISP/path** design \u2014 not DMVPN's logical topology.",
        "misconceptionTested": "Dual-homed as DMVPN topology"
      }
    ],
    "examTip": "DMVPN = **mGRE + NHRP + IPsec** on a **hub-and-spoke** \u2014 dynamic spoke-to-spoke when needed."
  },
  'obj-5.5-source-q013':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Data integrity** (AH/ESP hashing) proves the packet was **not altered in transit** \u2014 tamper detection."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Authentication** verifies **identity** of peers \u2014 **integrity** verifies **payload unchanged**.",
        "misconceptionTested": "Authentication as tamper detection"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Anti-replay** stops **duplicate** captured packets \u2014 separate from **integrity** hashing.",
        "misconceptionTested": "Anti-replay as integrity"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Confidentiality** is **encryption** \u2014 integrity is **hash-based tamper check**.",
        "misconceptionTested": "Confidentiality as tamper detection"
      }
    ],
    "examTip": "IPsec triad: **confidentiality** (encrypt) | **integrity** (hash) | **authentication** (peer identity) + **anti-replay**."
  },
  'obj-5.5-source-q014':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Cisco FTD** (Firepower Threat Defense) terminates **site-to-site** and **remote-access IPsec/SSL VPNs**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Catalyst switches** are primarily **LAN L2/L3** \u2014 VPN termination is on **routers/firewalls**.",
        "misconceptionTested": "Catalyst for VPN tunnels"
      },
      {
        "choiceIndex": 1,
        "explanation": "**Routers** can run VPNs \u2014 but **FTD** is the dedicated **security/VPN appliance** in this answer.",
        "misconceptionTested": "Router as only VPN option"
      },
      {
        "choiceIndex": 3,
        "explanation": "**PBR** forwards by policy \u2014 it does **not** create **IPsec VPN tunnels**.",
        "misconceptionTested": "PBR for VPN creation"
      }
    ],
    "examTip": "VPN endpoints: **ISR routers** (IPsec) | **ASA/FTD** (IPsec + AnyConnect SSL) | **DMVPN hubs**."
  },
  'obj-5.5-source-q015':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Client SSL VPN** (remote-access) lets **roaming workers** securely reach internal apps over the internet."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**GRE** connects **sites** \u2014 not ideal for **individual remote workers** needing endpoint VPN clients.",
        "misconceptionTested": "GRE for remote workers"
      },
      {
        "choiceIndex": 1,
        "explanation": "**Wireless WAN** is access technology \u2014 not the **application-layer secure tunnel** required.",
        "misconceptionTested": "Wireless WAN as remote worker VPN"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Site-to-site VPN** links **fixed offices** \u2014 remote **users** need **client VPN/SSL VPN**.",
        "misconceptionTested": "Site-to-site for individual teleworkers"
      }
    ],
    "examTip": "Remote user = **client VPN/SSL** | Branch office = **site-to-site IPsec** | Datacenter overlay = **GRE/DMVPN**."
  },
  'obj-5.5-source-q017':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Site-to-site IPsec** scales to **many branch connections** with centralized policies \u2014 grows without per-user tunnels."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Encryption adds **overhead** \u2014 IPsec does **not** lower bandwidth requirements.",
        "misconceptionTested": "IPsec reduces bandwidth"
      },
      {
        "choiceIndex": 1,
        "explanation": "IPsec adds **encap/crypto latency** \u2014 **scalability** is the listed benefit, not lower latency.",
        "misconceptionTested": "IPsec lowers latency"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Multicast over IPsec** needs **GRE/mGRE** helpers \u2014 not a native site-to-site IPsec highlight.",
        "misconceptionTested": "Multicast as IPsec site-to-site benefit"
      }
    ],
    "examTip": "Site-to-site VPN: connects **fixed sites** | scales with **hub models/DMVPN** | pairs with **routing** (OSPF/EIGRP over tunnel)."
  },
  'obj-5.6-source-q002':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Standard ACLs** (1\u201399, 1300\u20131999) match **source IP only** \u2014 no destination or L4 ports."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Standard ACLs cannot match **destination** \u2014 that's **extended** ACL territory.",
        "misconceptionTested": "Standard ACL destination matching"
      },
      {
        "choiceIndex": 1,
        "explanation": "Standard ACLs match **source IP only** \u2014 **no source port** (extended ACL feature).",
        "misconceptionTested": "Standard ACL source port matching"
      },
      {
        "choiceIndex": 3,
        "explanation": "Matching **ports and destination** requires an **extended** ACL (100\u2013199, 2000\u20132699).",
        "misconceptionTested": "Standard ACL L4 and destination"
      }
    ],
    "examTip": "Standard = **source only** | Extended = **src/dst IP + protocol + ports** \u2014 place standard ACLs **close to destination**."
  },
  'obj-5.6-source-q004':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Every ACL ends with an **implicit `deny any any`** \u2014 unmatched traffic is **dropped** (not permitted)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`permit any any`** is **not** implicit \u2014 only **`deny any any`** is hidden at the end.",
        "misconceptionTested": "Implicit permit any any"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Logging** is optional per ACE \u2014 not an automatic ACL footer.",
        "misconceptionTested": "Implicit log all"
      },
      {
        "choiceIndex": 3,
        "explanation": "No **marker** exists \u2014 IOS silently applies **implicit deny**.",
        "misconceptionTested": "Visible end-of-ACL marker"
      }
    ],
    "examTip": "Always add explicit **`permit`** for needed traffic \u2014 **implicit deny** drops everything else."
  },
  'obj-5.6-source-q005':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "ACL evaluation is **top-down, first match wins** \u2014 processing **stops** at the first matching ACE."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "The **first** match decides \u2014 not the **last** matching line.",
        "misconceptionTested": "Last match wins"
      },
      {
        "choiceIndex": 2,
        "explanation": "Unmatched packets hit **implicit deny** \u2014 they are **not** allowed by default.",
        "misconceptionTested": "Default permit when no match"
      },
      {
        "choiceIndex": 3,
        "explanation": "There is an **implicit deny**, not an **implicit allow**.",
        "misconceptionTested": "Implicit allow at ACL end"
      }
    ],
    "examTip": "Order matters: place **specific permits** before **broad denies** \u2014 first hit sticks."
  },
  'obj-5.6-source-q006':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Standard ACLs** match fewer fields \u2192 **less CPU processing** per packet than extended ACLs."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Extended ACLs** are **more granular/secure** for filtering \u2014 standard trades specificity for speed.",
        "misconceptionTested": "Standard ACL more secure"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Specific rules** (ports, protocols) need **extended** ACLs \u2014 not standard.",
        "misconceptionTested": "Standard ACL for granular rules"
      },
      {
        "choiceIndex": 3,
        "explanation": "Blocking **applications** requires **extended** ACLs with **port/protocol** matches.",
        "misconceptionTested": "Standard ACL blocks applications"
      }
    ],
    "examTip": "Standard ACL = fast, coarse (source IP) | Extended = slower, precise \u2014 place standard **near destination**."
  },
  'obj-5.6-source-q007':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Expanded **standard** ACL range is **1300\u20131999** \u2014 classic range is **1\u201399**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**1000\u20131999** is not the standard/expanded split \u2014 expanded standard is **1300\u20131999**.",
        "misconceptionTested": "1000-1999 as expanded standard"
      },
      {
        "choiceIndex": 1,
        "explanation": "**1100\u20131299** is not a valid Cisco ACL range.",
        "misconceptionTested": "1100-1299 ACL range"
      },
      {
        "choiceIndex": 3,
        "explanation": "**2000\u20132699** is the **expanded extended** ACL range \u2014 not standard.",
        "misconceptionTested": "2000-2699 as standard ACL"
      }
    ],
    "examTip": "ACL numbers: **1\u201399 / 1300\u20131999** standard | **100\u2013199 / 2000\u20132699** extended."
  },
  'obj-5.6-source-q008':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**172.16.0.0/12** wildcard mask **0.15.255.255** \u2014 /12 means **12 network bits** \u2192 wildcard **0.0.15.255** inverted = **0.15.255.255**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**255.240.0.0** is the **subnet mask** for /12 \u2014 wildcard uses **0** where bits must **match**.",
        "misconceptionTested": "Subnet mask instead of wildcard"
      },
      {
        "choiceIndex": 1,
        "explanation": "**0.0.240.255** does not align to a /12 boundary \u2014 /12 wildcard is **0.15.255.255**.",
        "misconceptionTested": "Wrong wildcard bit alignment"
      },
      {
        "choiceIndex": 3,
        "explanation": "**255.3.0.0** is invalid for /12 \u2014 compute wildcard as **inverse of subnet mask**.",
        "misconceptionTested": "255.3.0.0 wildcard for /12"
      }
    ],
    "examTip": "Wildcard trick: subtract subnet mask from **255.255.255.255** \u2014 /12 mask **255.240.0.0** \u2192 wildcard **0.15.255.255**."
  },
}
