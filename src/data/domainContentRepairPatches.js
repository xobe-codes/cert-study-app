/**
 * Real hand-authored reading content for objectives that previously had no
 * authored tiers at all — readingFromRef() in readingFactory.js tripled a
 * single one-line blueprint summary into beginner/intermediate/examReady,
 * which finalizeReading()'s enrichment then mangled further into repeated,
 * templated filler. This patch replaces the full reading payload (tiers,
 * definition, keyPoints, realWorld, commonMistakes, bigTakeaway) with real
 * content and is merged in as the final, authoritative layer in
 * applyContentEnrichment so it always wins over the factory stub.
 */
export const DOMAIN_CONTENT_REPAIR_PATCHES = {
  '4.4': {
    reading: {
      bigTakeaway: 'SNMP lets a central manager poll devices for status and receive traps when something changes on its own.',
      definition: '**SNMP** lets a **manager** poll network devices for status (a **Get**) and receive unsolicited **traps** when something changes, reading values identified by **OID**s inside each device\'s **MIB**.',
      tiers: {
        beginner: 'SNMP lets one central tool check the status of many routers and switches at once, instead of logging into each one by hand. The manager asks a question (a poll) and the device answers, or the device can push an alert on its own when something changes.',
        intermediate: 'A manager station polls agents running on network devices, requesting specific values identified by an OID inside that device\'s MIB — a tree of every value the device can report, like interface counters or CPU load.\n\nInstead of waiting to be polled, a device can also send a trap the moment something notable happens, like a link going down. Community strings (essentially plaintext passwords) protect versions 1 and 2c; version 3 adds real authentication and encryption on top.',
        examReady: 'Know the actors: manager (the monitoring tool), agent (runs on the device), MIB (the tree of values), and OID (the specific address of one value in that tree). Get/GetNext/GetBulk are manager-initiated polls; a trap or inform is the device pushing an alert unprompted.\n\nSNMPv1/v2c authenticate with a plaintext community string; SNMPv3 is the only version with real authentication and encryption, which is why it is preferred wherever it is supported.',
      },
      keyPoints: [
        'Manager polls, agent answers; a trap is the agent reporting on its own.',
        'MIB = the tree of values a device exposes; OID = the address of one specific value in that tree.',
        'SNMPv1/v2c use a plaintext community string — read-only and read-write strings are usually different.',
        'SNMPv3 adds authentication and encryption; use it whenever the network gear supports it.',
        'Configure: `snmp-server community <string> RO`, `snmp-server host <ip> version 2c <string>`.',
        'Verify: `show snmp`, `show snmp community`.',
      ],
      realWorld: 'A monitoring dashboard like SolarWinds or PRTG polls interface utilization by OID every few minutes and gets an immediate trap if a link goes down, instead of waiting for the next poll cycle.',
      commonMistakes: [
        'Using the default or a guessable community string in production.',
        'Confusing a trap (unsolicited) with a poll response (a reply to a Get).',
        'Deploying SNMPv2c on an internet-facing device instead of v3.',
        'Forgetting that read-write community access lets a manager change device configuration, not just read it.',
      ],
      related: ['4.5 Syslog'],
      advanced: 'GetBulk (SNMPv2c+) retrieves multiple OIDs in one request, reducing polling overhead on large MIB walks.',
    },
  },

  '4.7': {
    reading: {
      bigTakeaway: 'QoS per-hop behavior classifies and marks traffic once, then every hop downstream just honors that marking to decide queuing and drop priority.',
      definition: '**QoS** at each hop **classifies and marks** traffic (DSCP/CoS), then **queues** it (priority queuing for voice), and applies **shaping or policing** to control rate, with **WRED** dropping lower-priority traffic first as congestion builds.',
      tiers: {
        beginner: 'Not all traffic matters equally — a voice call breaks if it is delayed, but a file download barely notices. QoS lets a network treat voice, video, and bulk data differently so the traffic that needs it gets priority.',
        intermediate: 'Classification identifies traffic and marking stamps it with a priority label (DSCP at Layer 3, CoS at Layer 2) so every device downstream can treat it consistently without re-inspecting it. Queuing then decides forwarding order — voice typically gets a low-latency priority queue.\n\nShaping smooths bursts by buffering excess traffic to send later; policing simply drops or re-marks anything over the limit. WRED drops lower-priority traffic first as a queue fills, avoiding a full queue where everything drops at once.',
        examReady: 'Per-hop behavior means each device makes its own local queuing decision based on the marking, not on a global view. Classification/marking happens at the trust boundary (usually the access-layer edge); everything after that just reads the marking.\n\nShaping delays excess traffic to smooth it out (no loss, added delay); policing drops or re-marks it immediately (loss, no delay). Voice gets a dedicated low-latency queue (LLQ); WRED prevents queue-wide tail drops by dropping lower-priority packets earlier.',
      },
      keyPoints: [
        'Classification identifies traffic; marking stamps it (DSCP at L3, CoS at L2) so later hops trust it.',
        'Trust boundary: mark or re-mark at the network edge, then downstream devices just honor the marking.',
        'Shaping buffers and delays excess traffic; policing drops or re-marks it immediately.',
        'LLQ (low-latency queuing) gives voice/video a strict-priority queue ahead of everything else.',
        'WRED drops lower-priority traffic earlier as a queue fills, avoiding synchronized tail drops.',
        'DSCP EF (Expedited Forwarding) is the standard marking for voice.',
      ],
      realWorld: 'A phone call marked DSCP EF gets forwarded ahead of a large file transfer at every congested hop, which is why calls stay clear even while someone else on the same link is downloading a large file.',
      commonMistakes: [
        'Marking traffic at every hop instead of once at the trust boundary.',
        'Confusing shaping (delays, no loss) with policing (drops or re-marks, no delay).',
        'Assuming QoS adds bandwidth — it only reorders and prioritizes existing bandwidth.',
        'Putting bulk data in the same queue as voice, causing jitter.',
      ],
      related: ['4.1 NAT', '2.5 STP'],
      advanced: 'Auto QoS templates on Cisco switches apply LLQ and standard DSCP markings for Cisco IP phones automatically, based on CDP detection of the phone.',
    },
  },

  '4.8': {
    reading: {
      bigTakeaway: 'SSH replaces Telnet for remote device management because it encrypts the session instead of sending commands and passwords in plaintext.',
      definition: '**SSH** provides encrypted remote CLI access, replacing **Telnet**\'s plaintext session. It requires a hostname, a domain name, a generated RSA key pair, and local user accounts before **VTY** lines can require it.',
      tiers: {
        beginner: 'Telnet sends everything — including your password — as plain, readable text over the network, so anyone watching the traffic can see it. SSH encrypts the whole session, so remote device management stays private.',
        intermediate: 'Before a device can support SSH, it needs a hostname and a domain name set (SSH keys are generated using both), then an RSA key pair generated locally. Local usernames and passwords replace a single shared password, and the VTY lines are then restricted to accept only SSH connections.\n\nOnce that is done, Telnet should be disabled outright rather than just left as an unused option, since a misconfiguration could silently re-enable it.',
        examReady: 'The setup order matters: hostname and domain name first (both feed the RSA key generation), then generate the key pair, then create local user accounts, then restrict VTY transport to SSH only. Skipping the hostname/domain-name step is why key generation commands sometimes appear to do nothing.\n\nSSHv2 is what current devices default to; SSHv1 has known weaknesses and should never be intentionally selected. See Key Points for the full command sequence and verification.',
      },
      keyPoints: [
        '`hostname <name>` and `ip domain-name <domain>` — required before RSA keys can be generated.',
        '`crypto key generate rsa` — generates the key pair SSH depends on (use at least 2048 bits).',
        '`username <name> secret <password>` — local account for login.',
        '`line vty 0 15` → `login local` → `transport input ssh` — restrict remote access to SSH with local auth.',
        'Verify with `show ip ssh` and `show crypto key mypubkey rsa`.',
        'Disable Telnet outright rather than just adding SSH alongside it.',
      ],
      realWorld: 'A network engineer managing devices from home relies entirely on SSH — if a device still accepts Telnet, credentials could be captured by anyone on a shared or compromised network segment along the path.',
      commonMistakes: [
        'Setting `transport input ssh` before generating RSA keys, which leaves SSH non-functional.',
        'Forgetting `ip domain-name`, which silently blocks key generation.',
        'Leaving Telnet enabled as a fallback alongside SSH.',
        'Using a shared `enable password` instead of per-user local accounts for accountability.',
      ],
      related: ['5.3 Device access control'],
      advanced: 'SSH can also be restricted to specific source IPs with `ip access-class` on the VTY lines, layering network-level restriction on top of protocol-level encryption.',
    },
  },

  '4.9': {
    reading: {
      bigTakeaway: 'TFTP and FTP both move IOS images and configuration files, but neither encrypts the transfer — TFTP is simplest, FTP adds authentication, and SFTP/SCP add real security.',
      definition: '**TFTP** (UDP/69) is a simple, unauthenticated file-transfer protocol commonly used for IOS images and configs; **FTP** (TCP/20-21) adds authentication but, like TFTP, transfers everything — including credentials — in plaintext.',
      tiers: {
        beginner: 'When a router or switch needs a new IOS image or a saved configuration file, it often gets it from a file server on the network. TFTP and FTP are two older protocols built for exactly that job.',
        intermediate: 'TFTP is deliberately minimal — no login, no directory listing, just "send me this file" — which made it a natural fit for early network booting and firmware transfers where simplicity mattered more than security. FTP adds usernames and passwords plus a richer command set, but transmits that login in plaintext just like the file itself.\n\nNeither protocol encrypts anything in transit, so both are considered legacy choices where security matters — SFTP (SSH-based) or SCP are the modern replacements.',
        examReady: 'TFTP runs over UDP/69 with no authentication at all — it just serves or accepts a file by name. FTP runs over TCP, using port 21 for control and port 20 (or a negotiated port in passive mode) for the actual data transfer, and does require a login.\n\nFor the exam: know that neither protocol encrypts traffic, that TFTP is common for IOS/config backup and restore, and that SFTP is the encrypted alternative when security is a requirement rather than a convenience.',
      },
      keyPoints: [
        'TFTP = UDP/69, no authentication, minimal command set — common for IOS image transfer.',
        'FTP = TCP, port 21 control + port 20 (or passive-mode port) data, requires a username/password.',
        'Neither TFTP nor FTP encrypts the transfer, including login credentials on FTP.',
        'SFTP (over SSH) or SCP are the encrypted replacements when security matters.',
        'Cisco devices: `copy running-config tftp:` / `copy tftp: flash:` for image and config transfer.',
        'Verify reachability to the file server before troubleshooting the transfer itself.',
      ],
      realWorld: 'A network team backs up every switch\'s running configuration to a TFTP server nightly as a quick, simple safety net, while using SFTP for anything crossing a less-trusted network segment.',
      commonMistakes: [
        'Assuming FTP is secure because it has a login — the login itself is sent in plaintext.',
        'Confusing TFTP\'s lack of authentication with it being unreliable — it is simple, not broken.',
        'Forgetting FTP needs two ports (control and data), which can matter behind a firewall.',
        'Using TFTP/FTP over an untrusted network instead of SFTP/SCP.',
      ],
      related: ['4.8 SSH'],
      advanced: 'FTP passive mode has the server tell the client which port to use for data, avoiding the firewall issues active mode causes when the server tries to open a new connection back to the client.',
    },
  },

  '4.10': {
    reading: {
      bigTakeaway: 'Local management means configuring each device yourself through its CLI; cloud-based management means a hosted dashboard configures and monitors many devices centrally.',
      definition: '**Local management** configures devices directly (CLI or an on-premises controller); **cloud-based management** (Meraki, DNA Center Cloud) centralizes configuration, monitoring, and policy through a hosted dashboard reachable over the internet.',
      tiers: {
        beginner: 'Some networks are managed one device at a time by logging into each one directly. Others are managed through a cloud dashboard that can see and configure every site at once, from anywhere with internet access.',
        intermediate: 'Local (on-premises) management means CLI access to each device, or at most an on-site controller that only sees that one location. It works without any internet dependency, but does not scale well across many sites.\n\nCloud-based management centralizes configuration and monitoring for every site in one dashboard, and pushes updates and policy without a technician on-site. That convenience comes with a dependency on internet connectivity and on trusting the provider with visibility into the network.',
        examReady: 'The core exam contrast is centralization and reachability: local management scales per-device or per-site and works fully offline, while cloud-based management scales across many sites from one dashboard but depends on internet access to the provider and shifts some trust to that provider.\n\nMulti-site retail and branch deployments favor cloud management for consistency and lower on-site staffing needs; environments with strict data-residency or connectivity requirements often favor local or hybrid management instead.',
      },
      keyPoints: [
        'Local: CLI or on-prem controller, no internet dependency, scales poorly across many sites.',
        'Cloud: hosted dashboard (Meraki, DNA Center Cloud), centralizes many sites, needs internet reachability.',
        'Cloud shifts some trust to the provider — a data-residency or compliance requirement can rule it out.',
        'Hybrid designs keep some functions local (e.g. DHCP) while managing policy from the cloud.',
        'Cloud dashboards typically push firmware/config updates without a technician on-site.',
        'A WAN outage can isolate a cloud-managed site from its dashboard even though local traffic keeps flowing.',
      ],
      realWorld: 'A retail chain with 200 stores uses Meraki so head office can push a single Wi-Fi policy update to every store overnight, instead of sending a technician to each site.',
      commonMistakes: [
        'Assuming cloud management means the network itself stops working during an internet outage — local data plane traffic usually keeps flowing even if the dashboard is unreachable.',
        'Choosing cloud management for a site with strict data-residency requirements without checking the provider\'s policy.',
        'Underestimating the staffing/CLI-skill savings cloud management offers at scale.',
        'Treating local and cloud management as mutually exclusive instead of a spectrum with hybrid options.',
      ],
      related: ['6.3 SDN architectures', '6.4 DNA Center'],
      advanced: 'Cisco DNA Center can run on-premises while still offering cloud-style centralized policy and assurance, blurring the local/cloud line into a spectrum rather than a binary choice.',
    },
  },

  '5.4': {
    reading: {
      bigTakeaway: 'AAA controls who can log in, what they can do, and what they did — TACACS+ and RADIUS provide it centrally instead of per-device.',
      definition: '**AAA** (Authentication, Authorization, Accounting) is provided by a central server using **TACACS+** (Cisco, TCP/49, encrypts the whole packet, common for device administration) or **RADIUS** (open standard, UDP 1812/1813, encrypts only the password, common for network access like 802.1X and VPN).',
      tiers: {
        beginner: 'Instead of every router and switch keeping its own separate list of usernames, AAA lets them all check with one central server. TACACS+ and RADIUS are the two protocols that server can speak.',
        intermediate: 'TACACS+ is Cisco\'s protocol, runs over TCP port 49, and encrypts the entire packet — not just the password — which is why it is the common choice for administrative access to network devices themselves. RADIUS is an open standard running over UDP ports 1812 and 1813, encrypts only the password portion of each packet, and is the common choice for network access scenarios like 802.1X port authentication or VPN logins.\n\nBoth separate authentication (proving who you are) from authorization (what you are allowed to do) and accounting (a record of what you did), even though TACACS+ handles that separation more granularly than RADIUS.',
        examReady: 'Know the protocol-level differences precisely: TACACS+ is TCP/49, Cisco-proprietary, encrypts the full packet, and is the default choice for device administration because it can authorize individual commands. RADIUS is UDP 1812 (authentication) and 1813 (accounting), an open standard, encrypts only the password, and is the default choice for network access authentication like 802.1X or VPN.\n\nA device is configured with a AAA server group pointing at one or more TACACS+ or RADIUS servers, with a local fallback method in case that server is unreachable — losing that fallback is a classic way to get locked out.',
      },
      keyPoints: [
        'TACACS+: TCP/49, Cisco-proprietary, encrypts the whole packet, common for device admin (can authorize per-command).',
        'RADIUS: UDP 1812/1813, open standard, encrypts only the password, common for network access (802.1X, VPN).',
        'AAA = Authentication (who), Authorization (what they can do), Accounting (what they did).',
        'Configure: `aaa new-model`, `tacacs server <name>`, `aaa authentication login default group tacacs+ local`.',
        'Always configure a local fallback method — losing server reachability without one can lock out all admin access.',
        'Verify with `test aaa group` and `show aaa servers`.',
      ],
      realWorld: 'A company with 500 switches uses TACACS+ so IT staff log in with their own AD-backed credentials, and a full audit trail shows exactly which engineer ran which command on which device.',
      commonMistakes: [
        'Confusing TACACS+ (TCP/49, device admin) with RADIUS (UDP 1812, network access).',
        'Forgetting a local fallback authentication method, risking total lockout if the AAA server is unreachable.',
        'Assuming RADIUS encrypts the whole packet — it only encrypts the password.',
        'Not testing AAA changes on a console session before applying them to VTY, in case of misconfiguration.',
      ],
      related: ['5.3 Device access control', '5.7 AAA concepts'],
      advanced: 'TACACS+\'s ability to authorize individual commands (not just login) is why it remains the preferred protocol for administrative access even though RADIUS is more widely supported across non-Cisco gear.',
    },
  },

  '5.7': {
    reading: {
      bigTakeaway: 'Authentication proves identity, authorization decides permissions, and accounting logs what happened — three separate, sequential questions AAA answers for every access attempt.',
      definition: '**AAA** separates three questions: **Authentication** (who are you?), **Authorization** (what are you allowed to do?), and **Accounting** (what did you actually do?) — each answered independently, often via **TACACS+** or **RADIUS**.',
      tiers: {
        beginner: 'Logging into a network device really involves three separate questions: who are you, what are you allowed to do, and what did you actually do while you were logged in? AAA is the framework that answers all three.',
        intermediate: 'Authentication confirms identity — a username and password, a certificate, or a multi-factor combination of something you know plus something you have. Authorization is a separate step that happens only after authentication succeeds, deciding which commands or resources that now-verified identity can actually use.\n\nAccounting logs the session afterward: when it started, what commands ran, when it ended — turning "someone logged in" into an actual audit trail tied to a specific person.',
        examReady: 'The exam-relevant point is that these are three independent steps, not one bundled check — a user can authenticate successfully and still be denied by authorization, and accounting keeps logging regardless of what authorization allows. MFA strengthens authentication specifically, by requiring a second factor beyond just a password.\n\nTACACS+ and RADIUS both implement AAA, but TACACS+ separates the three functions more granularly (down to per-command authorization) while RADIUS tends to bundle authentication and authorization into a single exchange.',
      },
      keyPoints: [
        'Authentication = identity (who); Authorization = permissions (what); Accounting = audit log (what happened).',
        'The three steps are independent — successful authentication does not guarantee authorization.',
        'MFA (multi-factor authentication) strengthens authentication specifically, not authorization or accounting.',
        'TACACS+ separates all three functions more granularly than RADIUS, including per-command authorization.',
        'Accounting records persist regardless of what authorization allowed or denied.',
        'Configure via a AAA server group (TACACS+/RADIUS), same as 5.4.',
      ],
      realWorld: 'A help-desk technician authenticates successfully with valid credentials but authorization limits them to read-only commands, while accounting logs every command they ran — even the ones that failed due to insufficient permission.',
      commonMistakes: [
        'Treating AAA as one check instead of three independent steps.',
        'Assuming authentication success implies full access — authorization is a separate gate.',
        'Confusing MFA (strengthens authentication) with authorization controls.',
        'Forgetting that accounting logs matter for compliance even when nothing goes wrong.',
      ],
      related: ['5.4 AAA with TACACS+/RADIUS'],
      advanced: 'Accounting records can feed a SIEM for correlation with other security events, turning device-level logs into part of a broader detection pipeline.',
    },
  },

  '5.8': {
    reading: {
      bigTakeaway: 'WEP is broken and should never be used; WPA2 with AES is the current baseline, and WPA3 is now the recommended default.',
      definition: '**WEP** is cryptographically broken and obsolete. **WPA2** uses **AES/CCMP** encryption in either **Personal** (PSK, a shared passphrase) or **Enterprise** (802.1X, individual RADIUS-backed logins) mode. **WPA3** adds **SAE** for stronger key exchange and **PMF** to protect management frames.',
      tiers: {
        beginner: 'Wi-Fi security has gone through several generations. WEP, the oldest, can be cracked in minutes and should never be used. WPA2 replaced it with real encryption, and WPA3 is the newest, stronger standard.',
        intermediate: 'WPA2 uses AES with CCMP for encryption and comes in two modes: Personal, where everyone shares one passphrase (PSK), and Enterprise, where each user authenticates individually against a RADIUS server via 802.1X — giving per-user credentials and revocation instead of one shared secret everyone knows.\n\nWPA3 keeps that same Personal/Enterprise split but replaces the PSK exchange with SAE (Simultaneous Authentication of Equals), which resists offline password-guessing attacks even against a weak passphrase, and adds Protected Management Frames (PMF) so an attacker cannot forge disconnect messages to knock clients off the network.',
        examReady: 'Know the generational order and why each replaced the last: WEP (broken, never use) → WPA2-Personal/Enterprise (AES/CCMP, current baseline) → WPA3-Personal/Enterprise (SAE replaces PSK\'s weak exchange, PMF protects management frames).\n\nPersonal vs Enterprise is really about scale and accountability — Personal is one shared passphrase for everyone, Enterprise gives each user their own RADIUS-backed identity, which is why enterprise deployments almost always choose Enterprise mode.',
      },
      keyPoints: [
        'WEP is broken — crackable in minutes, never use it.',
        'WPA2 uses AES/CCMP; Personal = shared PSK, Enterprise = per-user 802.1X/RADIUS.',
        'WPA3 replaces PSK exchange with SAE, resisting offline password-guessing even on a weak passphrase.',
        'WPA3 adds PMF (Protected Management Frames) to stop forged deauthentication attacks.',
        'Enterprise mode gives individual accountability and easy revocation; Personal does not.',
        'New deployments should default to WPA3 where client devices support it.',
      ],
      realWorld: 'A coffee shop uses WPA2/WPA3-Personal with one shared passphrase printed on a receipt, while a corporate office uses Enterprise mode so each employee\'s Wi-Fi access ties to their own login and can be revoked individually when they leave.',
      commonMistakes: [
        'Deploying WEP for "legacy compatibility" instead of replacing the legacy device.',
        'Assuming Personal and Enterprise differ in encryption strength — they differ in how the key is established and per-user identity, not the encryption algorithm itself.',
        'Confusing SAE (WPA3\'s key exchange) with AES (the encryption algorithm both WPA2 and WPA3 use).',
        'Forgetting that revoking Personal-mode access to one person means changing the passphrase for everyone.',
      ],
      related: ['5.9 WPA2 PSK', '1.11 Wireless principles'],
      advanced: 'WPA3-Enterprise optionally supports 192-bit security mode for environments requiring higher assurance, layering additional cryptographic requirements on top of the standard Enterprise mode.',
    },
  },

  '5.9': {
    reading: {
      bigTakeaway: 'WPA2-PSK configuration on a controller is short: pick AES encryption, set one shared passphrase, and map the WLAN to the right VLAN.',
      definition: 'A **WPA2-PSK WLAN** is configured on a WLC with **AES encryption**, a shared **passphrase** (the PSK), and a **VLAN** mapping — every client on that WLAN derives unique session keys from the same shared passphrase during the **4-way handshake**.',
      tiers: {
        beginner: 'WPA2-PSK is the "one shared password" style of Wi-Fi security most home and small-office networks use. Everyone types the same passphrase to join, but each device still gets its own private encryption keys.',
        intermediate: 'On a wireless LAN controller, creating this WLAN means setting the SSID, choosing WPA2 with AES (not the older, weaker TKIP), entering the shared passphrase, and mapping the WLAN to a VLAN so client traffic lands in the right place on the wired network.\n\nEven though every client uses the same passphrase to authenticate, none of them ends up with an identical, static encryption key — that shared passphrase is only the starting point for a per-session key exchange.',
        examReady: 'The 4-way handshake is what actually derives unique per-session encryption keys from that shared passphrase, so two clients on the same WLAN cannot read each other\'s traffic even though they typed the same PSK. This is the key exam distinction between PSK and Enterprise mode: PSK skips RADIUS but still gets per-session keys through the handshake, not through a shared static key.\n\nA weak or short passphrase is the actual vulnerability, since it makes the handshake easier to attack offline — the encryption itself is the same AES used in Enterprise mode.',
      },
      keyPoints: [
        'WLC config: SSID → security WPA2 → AES (not TKIP) → enter PSK passphrase → map to VLAN → enable.',
        'The 4-way handshake derives unique per-session keys from the shared PSK — clients cannot decrypt each other\'s traffic.',
        'PSK skips RADIUS entirely; Enterprise mode requires it — that is the real functional difference, not the encryption strength.',
        'A short or weak passphrase is the actual attack surface, since it is what the handshake is derived from.',
        'Verify client association status and VLAN assignment from the WLC dashboard or `show wlan summary`.',
        'Broadcast SSID and radio policy (2.4/5 GHz) control discoverability and which band clients see.',
      ],
      realWorld: 'A small branch office sets one WPA2-PSK passphrase for its guest network and rotates it periodically, while its corporate SSID uses Enterprise mode so employee access does not depend on a single shared secret that everyone would need if it changed.',
      commonMistakes: [
        'Choosing TKIP instead of AES for the encryption cipher — TKIP is legacy and weaker.',
        'Assuming a shared PSK means clients share encryption keys — the 4-way handshake still derives unique per-session keys.',
        'Using a short, guessable passphrase, which is the real weak point in PSK security.',
        'Forgetting to map the WLAN to the correct VLAN, leaving clients on the wrong subnet.',
      ],
      related: ['5.8 Wireless security protocols', '2.8 WLAN client connectivity'],
      advanced: 'WPA3-Personal replaces the PSK\'s 4-way handshake with SAE, which resists offline dictionary attacks even against a weak passphrase — a gap WPA2-PSK does not close.',
    },
  },

  '5.10': {
    reading: {
      bigTakeaway: 'Site-to-site VPNs connect two networks together permanently over IPsec; remote-access VPNs connect one client to a network on demand, often over SSL.',
      definition: 'A **VPN** creates an encrypted tunnel over an untrusted network. **Site-to-site** connects two networks (usually via **IPsec**, always-on); **remote-access** connects one client to a network (client software, often **SSL VPN** over HTTPS ports).',
      tiers: {
        beginner: 'A VPN creates a private, encrypted tunnel across the public internet, so traffic inside it stays hidden from anyone watching the network in between. Site-to-site VPNs connect two office networks together; remote-access VPNs connect one traveling laptop back to the office.',
        intermediate: 'Site-to-site VPNs typically use IPsec, running as an always-on tunnel between two routers or firewalls so every device on each side can reach the other side transparently, without any client software. IPsec itself provides encryption, integrity checking, and a negotiation process (IKE) that establishes the shared keys both ends will use.\n\nRemote-access VPNs instead connect a single device — a laptop or phone — to the corporate network on demand, often using SSL VPN over standard HTTPS ports (443), which has the practical advantage of working through almost any firewall or hotel Wi-Fi that only allows normal web traffic.',
        examReady: 'Know the use-case split cold: site-to-site = permanent network-to-network tunnel, almost always IPsec, no client software involved. Remote-access = on-demand single-device connection, client software or a browser, frequently SSL VPN specifically because it rides over port 443 and blends in with normal HTTPS traffic.\n\nIPsec provides confidentiality (encryption), integrity (tamper detection), and authentication (via IKE negotiation) — those are the three security properties to associate with it if asked directly.',
      },
      keyPoints: [
        'Site-to-site: permanent tunnel, network-to-network, almost always IPsec, no client software.',
        'Remote-access: on-demand, single client to network, client software or SSL VPN via browser.',
        'IPsec provides encryption, integrity, and authentication; IKE negotiates the keys.',
        'SSL VPN commonly uses HTTPS port 443, which traverses most firewalls without special rules.',
        'IPsec operates at the network layer; SSL VPN operates at higher layers, closer to the application.',
        'A firewall/router terminates site-to-site IPsec; a VPN concentrator or firewall terminates remote-access sessions.',
      ],
      realWorld: 'Two branch offices stay permanently connected over an IPsec site-to-site tunnel so file shares and printers work transparently, while employees traveling for work connect individually over SSL VPN from hotel Wi-Fi that only allows standard web traffic.',
      commonMistakes: [
        'Assuming all VPNs are IPsec — remote-access VPNs are often SSL-based specifically to traverse restrictive firewalls.',
        'Confusing site-to-site (always-on, network-wide) with remote-access (on-demand, single device).',
        'Forgetting IKE\'s role — it negotiates the keys IPsec then uses, it is not the encryption itself.',
        'Assuming a VPN alone guarantees security — a compromised endpoint still exposes whatever it can reach through the tunnel.',
      ],
      related: ['5.1 Security concepts', '5.11 Network segmentation'],
      advanced: 'IPsec can run in transport mode (encrypts only the payload, endpoints handle routing) or tunnel mode (encrypts the whole original packet inside a new one) — tunnel mode is what site-to-site VPNs use between gateways.',
    },
  },

  '5.11': {
    reading: {
      bigTakeaway: 'Segmentation limits how far an attacker can move after a breach by dividing the network into zones that a firewall must approve traffic between.',
      definition: '**Network segmentation** divides a network into isolated **zones** so a breach in one zone cannot freely reach another. **Stateful firewalls** and **NGFWs** with deep packet inspection enforce zone boundaries; **microsegmentation** applies that same isolation down to individual workloads.',
      tiers: {
        beginner: 'If a network is one big flat space, a single compromised device can potentially reach everything else on it. Segmentation breaks the network into separate zones, so a breach in one zone stays contained instead of spreading everywhere.',
        intermediate: 'A stateful firewall tracks the state of each connection and only allows return traffic that matches something it initiated, which is the baseline for enforcing a zone boundary — traffic between zones has to be explicitly permitted rather than assumed safe. An NGFW adds deep packet inspection on top, so it can enforce policy based on the actual application and content, not just IP addresses and ports.\n\nMicrosegmentation takes the same zone idea and shrinks it down to individual workloads or servers, so even two systems sitting in the same physical rack cannot talk to each other unless a specific policy allows it.',
        examReady: 'The exam-relevant distinction: traditional segmentation (VLANs plus a firewall between them) isolates broad zones — user LAN, server VLAN, DMZ. Microsegmentation isolates individual workloads within a zone, which matters most in a data center or cloud environment where "server VLAN" alone is too coarse.\n\nA DMZ is the classic example of segmentation in action — internet-facing servers sit in their own zone, reachable from outside but firewalled off from the internal network, so a breach of a public-facing server does not automatically expose internal systems.',
      },
      keyPoints: [
        'Zones limit blast radius — a breach in one zone should not freely reach another.',
        'Stateful firewalls enforce zone boundaries by tracking connection state, not just filtering by IP/port.',
        'NGFW adds deep packet inspection (DPI) and application-aware policy on top of stateful filtering.',
        'Microsegmentation isolates individual workloads, not just broad zones like VLANs.',
        'A DMZ is a classic segmentation pattern: internet-facing servers isolated from the internal network.',
        'Segmentation is a containment strategy — it limits damage, it does not prevent every breach.',
      ],
      realWorld: 'A company puts its public web server in a DMZ zone, its database in a separate internal zone the DMZ cannot directly reach, and firewalls enforce that even a compromised web server cannot talk straight to the database.',
      commonMistakes: [
        'Assuming a VLAN alone is segmentation — without a firewall enforcing policy between VLANs, they are just broadcast domains, not security boundaries.',
        'Treating segmentation as prevention rather than containment — it limits spread, it does not stop the initial breach.',
        'Confusing microsegmentation (workload-level) with traditional segmentation (zone-level).',
        'Placing a database directly reachable from a DMZ instead of behind an additional internal zone.',
      ],
      related: ['5.5 ACLs', '5.10 VPN types'],
      advanced: 'Zero Trust architecture extends segmentation\'s logic to its endpoint: no traffic is trusted by network location alone, and every request is authenticated and authorized regardless of which zone it originates from.',
    },
  },

  '6.1': {
    reading: {
      bigTakeaway: 'Automation replaces repetitive per-device CLI work with scripts and APIs, making changes faster, more consistent, and less prone to typo-driven outages.',
      definition: '**Network automation** uses scripts and **APIs** (Python, Ansible) instead of manual per-device CLI configuration, applying the same **Infrastructure as Code** discipline used in software development to network changes.',
      tiers: {
        beginner: 'Configuring 200 switches by hand, one at a time, is slow and error-prone — a typo on device 150 might go unnoticed for weeks. Automation runs the same script against every device instead, so the change is fast, consistent, and repeatable.',
        intermediate: 'Instead of an engineer typing commands into each device\'s CLI, a script or API call pushes the same configuration everywhere at once, removing the human-typo risk that comes with repeating the same change 200 times by hand. Because the change is defined in a script rather than in someone\'s memory of what they typed, it can also be reviewed, versioned, and rolled back like any other piece of code.\n\nThat mindset — treating network configuration as code, stored in version control rather than living only on the devices themselves — is what "Infrastructure as Code" means in this context.',
        examReady: 'The exam framing is about impact, not implementation: automation reduces configuration drift (devices slowly diverging from their intended state), reduces the time a change takes across many devices, and makes changes auditable and reversible since they exist as code, not tribal knowledge.\n\nIt does not replace understanding the underlying protocols — a script that pushes a bad OSPF configuration to 200 routers just breaks 200 routers faster than doing it by hand would have.',
      },
      keyPoints: [
        'Automation eliminates typo-driven config drift by applying identical changes across many devices at once.',
        'Infrastructure as Code: configuration lives in version control as reviewable, revertible scripts — not just on the devices.',
        'Common tools: Python scripts calling device APIs, Ansible playbooks over SSH.',
        'Automation speeds up changes and audits, but does not replace understanding the protocol being configured.',
        'A bad automated change spreads its damage as fast as it spreads the good ones.',
        'Automation pairs naturally with structured data formats like JSON (see 6.6).',
      ],
      realWorld: 'A network team pushes a new NTP server to all 300 switches with one Ansible playbook run in minutes, with the exact change tracked in version control — instead of an engineer manually typing it into each device over several days.',
      commonMistakes: [
        'Assuming automation removes the need to understand the underlying protocol or configuration.',
        'Pushing an untested script to production devices without a lab or staged rollout first.',
        'Treating automation as all-or-nothing instead of starting with low-risk, repetitive tasks.',
        'Not version-controlling the automation scripts themselves, losing the auditability benefit.',
      ],
      related: ['6.2 Controller-based networking', '6.6 JSON and config management'],
      advanced: 'CI/CD pipelines can test a proposed network change in a lab topology automatically before it is ever pushed to production, extending software development practices fully into network operations.',
    },
  },

  '6.2': {
    reading: {
      bigTakeaway: 'Traditional networking has each device make its own decisions; controller-based (SDN) networking centralizes that decision-making in one controller that pushes policy out to every device.',
      definition: '**Traditional networking** has a **distributed control plane** — every device decides independently. **Controller-based (SDN) networking** centralizes the control plane in one **controller** (DNA Center, APIC-EM), which computes policy and pushes it out to devices that just forward traffic.',
      tiers: {
        beginner: 'In a traditional network, every router and switch figures out its own decisions independently — nobody is in charge of the whole picture at once. A controller-based network puts one central brain in charge, which tells every device what to do.',
        intermediate: 'Traditionally, each device runs its own routing protocol, builds its own tables, and has no awareness of the intent behind the network beyond what its own protocols compute. That works, but changing policy consistently across hundreds of independently-thinking devices means touching each one.\n\nA centralized controller instead computes the desired behavior once, with full visibility across the whole network, and pushes that computed policy out to every device — which then just forwards traffic according to what it was told, rather than deciding on its own.',
        examReady: 'This is the control plane vs. data plane split that defines SDN: the controller holds the control plane (the decision-making), while devices keep only the data plane (the actual packet forwarding). That is the core exam contrast with traditional networking, where every device holds both control and data plane locally.\n\nCentralizing the control plane is what makes network-wide, consistent policy changes practical — the same reason automation (6.1) and SDN tend to be discussed together.',
      },
      keyPoints: [
        'Traditional: distributed control plane, each device decides independently.',
        'Controller-based/SDN: centralized control plane in one controller (DNA Center, APIC-EM), distributed data plane.',
        'Data plane = actual packet forwarding; control plane = the decisions about how to forward.',
        'Centralizing control makes network-wide, consistent policy changes practical at scale.',
        'Devices under SDN still forward traffic locally — only the decision-making moves to the controller.',
        'SDN and automation are closely related but distinct: SDN is architecture, automation is a way to drive it (or traditional devices).',
      ],
      realWorld: 'A campus using DNA Center pushes a single security policy change from one dashboard and every switch enforces it consistently, instead of an engineer configuring the same ACL logic on 40 separate switches by hand.',
      commonMistakes: [
        'Confusing SDN/controller-based networking with automation — SDN is an architecture; automation is a technique that can apply to either architecture.',
        'Assuming a controller-based network has no local intelligence at all — devices still forward traffic locally, they just do not decide policy locally.',
        'Thinking traditional networks cannot scale — they can, but consistent policy changes require touching every device individually.',
        'Assuming the controller forwards traffic itself — it does not, it only computes and distributes policy.',
      ],
      related: ['6.1 Automation impact', '6.3 SDN architectures'],
      advanced: 'A controller failure in a pure SDN design can leave the data plane still forwarding based on its last-known policy, but unable to adapt to new conditions until the controller returns — a resilience tradeoff worth understanding conceptually.',
    },
  },

  '6.3': {
    reading: {
      bigTakeaway: 'SDN splits the control plane out to a centralized controller, which talks to applications northbound and to network devices southbound.',
      definition: 'SDN architecture separates the centralized **control plane** (in the controller) from the distributed **data plane** (in devices), connected by **northbound APIs** (REST, to applications) and **southbound APIs/protocols** (NETCONF, OpenFlow, to devices).',
      tiers: {
        beginner: 'SDN architecture has two directions of communication: "northbound," up toward the applications and dashboards that use the network, and "southbound," down toward the actual routers and switches being controlled.',
        intermediate: 'The controller sits in the middle of that stack. Applications talk to it northbound, typically over a REST API, requesting things like "give this VLAN priority" without needing to know which specific switches make that happen — the controller translates that intent into device-level configuration.\n\nSouthbound, the controller talks to actual network devices using protocols built for structured, programmatic configuration rather than typed CLI commands — NETCONF and OpenFlow are the two most commonly referenced on the exam.',
        examReady: 'North/south is a directional metaphor worth memorizing precisely: northbound APIs face up toward applications (REST is the default assumption), southbound APIs/protocols face down toward devices (NETCONF, OpenFlow). The controller is the translation layer between the two — an application\'s intent becomes device-specific configuration through it.\n\nThe underlying architectural point, tested indirectly through scenario questions, is the same control-plane/data-plane separation from 6.2 — this objective is really about naming the interfaces that make that separation work.',
      },
      keyPoints: [
        'Northbound API: controller → applications, typically REST, carries intent ("prioritize this traffic").',
        'Southbound API/protocol: controller → devices, typically NETCONF or OpenFlow, carries device-level configuration.',
        'The controller translates northbound intent into southbound device configuration.',
        'Control plane centralized in the controller; data plane (forwarding) stays distributed on devices.',
        'REST is the default assumption for northbound; NETCONF/OpenFlow for southbound.',
        'This objective is the naming layer on top of 6.2\'s control/data plane split.',
      ],
      realWorld: 'A monitoring dashboard calls the controller\'s northbound REST API to request a bandwidth guarantee for video traffic, and the controller pushes the actual QoS configuration to the relevant switches southbound via NETCONF.',
      commonMistakes: [
        'Reversing northbound and southbound — northbound is toward applications (up), southbound is toward devices (down).',
        'Assuming REST is used southbound — NETCONF/OpenFlow are the typical southbound protocols instead.',
        'Treating this as a different concept from 6.2 rather than the interface layer on top of the same control/data plane split.',
        'Assuming the controller forwards traffic — it only computes and distributes configuration.',
      ],
      related: ['6.2 Controller-based networking', '6.5 REST APIs'],
      advanced: 'OpenFlow is a standards-based southbound protocol that lets a controller directly program flow tables in supporting switches, in contrast to NETCONF which manages configuration more broadly.',
    },
  },

  '6.4': {
    reading: {
      bigTakeaway: 'DNA Center centralizes design, provisioning, policy, and assurance for a whole campus from one dashboard, instead of engineers configuring and monitoring devices box by box.',
      definition: '**Cisco DNA Center** is a controller platform providing centralized **design**, **policy**, **provisioning**, and **assurance** (monitoring/analytics) for a campus network, replacing box-by-box CLI management with **intent-based networking**.',
      tiers: {
        beginner: 'Managing a campus network the traditional way means configuring and checking on every switch and router individually. DNA Center replaces that with one dashboard that can design, deploy, and monitor the whole campus at once.',
        intermediate: 'Design covers the network blueprint — sites, IP address pools, device profiles — defined once in the dashboard rather than device by device. Policy defines the intent, like which groups of users or devices should be allowed to reach which resources, without an engineer writing per-switch ACLs to enforce it manually.\n\nProvisioning then pushes actual configuration matching that design and policy out to devices, and assurance continuously monitors real device and client health against what was intended, flagging problems automatically instead of waiting for a support ticket.',
        examReady: 'Intent-based networking is the phrase to associate with DNA Center specifically: an administrator expresses what they want (intent), and the platform translates that into actual device configuration and then continuously verifies the network still matches that intent (assurance), closing the loop rather than just pushing config once and hoping.\n\nThe traditional alternative — box-by-box CLI — has no such closed loop; verifying a deployed change matches intent requires manually checking each device.',
      },
      keyPoints: [
        'Design: network blueprint (sites, IP pools, device profiles) defined centrally, once.',
        'Policy: intent-based access rules (who can reach what), not per-device ACLs.',
        'Provisioning: pushes actual configuration matching the design and policy to devices.',
        'Assurance: continuous monitoring/analytics that verifies the network matches intent, flags drift automatically.',
        'Intent-based networking = express desired outcome, platform translates and continuously verifies it.',
        'Traditional box-by-box CLI has no automatic loop verifying deployed state matches intent.',
      ],
      realWorld: 'A campus IT team defines "finance department devices can only reach finance servers" as a policy in DNA Center, and the platform provisions the actual ACLs/SGTs across every relevant switch — then assurance immediately flags any device that drifts from that policy.',
      commonMistakes: [
        'Treating DNA Center as just a monitoring tool — it also handles design, policy, and provisioning, not only assurance.',
        'Confusing intent-based networking (declare the outcome, platform verifies it) with simple automation (just push a script once).',
        'Assuming DNA Center replaces understanding networking fundamentals — it still requires knowing what the underlying policy should be.',
        'Forgetting assurance is continuous, not a one-time check after deployment.',
      ],
      related: ['6.2 Controller-based networking', '6.3 SDN architectures'],
      advanced: 'DNA Center can integrate with Cisco ISE for identity-based policy (SD-Access), extending intent-based control down to individual users and device groups rather than just switch ports.',
    },
  },

  '6.5': {
    reading: {
      bigTakeaway: 'REST APIs use standard HTTP verbs on resource URLs to let applications control devices programmatically, exchanging structured data (usually JSON) instead of parsed CLI text.',
      definition: 'A **REST API** exposes resources at URLs and manipulates them with standard **HTTP methods** (GET/POST/PUT/DELETE), is **stateless** (each request carries everything needed, independent of prior requests), and typically exchanges **JSON** payloads with standard HTTP status codes indicating the result.',
      tiers: {
        beginner: 'Instead of a human typing commands into a CLI, a REST API lets a program ask a device to do something over the web — using the same basic web technology (HTTP) that loads a webpage, but built for machines to talk to machines.',
        intermediate: 'Each REST request targets a specific resource identified by a URL — a particular VLAN, a specific interface, a device\'s configuration — and uses a standard HTTP method to say what to do with it: GET to read, POST to create, PUT to update, DELETE to remove. That mapping is consistent and predictable across nearly every REST API, which is a big part of why REST became so widely adopted.\n\nBeing stateless means every single request has to include everything the server needs to process it — the server does not remember anything about the previous request when handling the next one, which makes REST APIs simpler to scale.',
        examReady: 'Know the method-to-action mapping cold: GET reads, POST creates, PUT updates (often the entire resource), DELETE removes. Standard status codes tell you the outcome: 200 (OK), 201 (created), 400 (bad request — the client sent something wrong), 401 (unauthorized — missing or invalid credentials), 404 (not found — the resource/URL does not exist), 500 (server error).\n\nJSON is the near-universal payload format for both the request body and the response, which is why 6.6 (interpreting JSON) pairs directly with this objective.',
      },
      keyPoints: [
        'HTTP methods: GET (read), POST (create), PUT (update), DELETE (remove).',
        'Stateless: every request is self-contained; the server does not track prior requests.',
        'Resources are addressed by URL, one URL per resource (e.g. a specific interface or VLAN).',
        'JSON is the typical payload format for both requests and responses.',
        'Status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error.',
        'REST APIs are the northbound interface referenced in 6.3\'s SDN architecture.',
      ],
      realWorld: 'A monitoring script calls a device\'s REST API with a GET request to a specific interface URL every minute, parses the JSON response for utilization, and posts a PUT request to shut the interface down automatically if a threshold is crossed.',
      commonMistakes: [
        'Mixing up which HTTP method does what — GET reads, it never modifies anything.',
        'Assuming a 400 and a 401 mean the same thing — 400 is a malformed request, 401 is an authentication/authorization failure.',
        'Forgetting REST is stateless — assuming the server remembers context from a previous call.',
        'Confusing REST (an architectural style over HTTP) with a specific protocol like NETCONF.',
      ],
      related: ['6.3 SDN architectures', '6.6 JSON and configuration management'],
      advanced: 'REST is an architectural style, not a strict protocol — different APIs implement it with varying levels of strictness, which is why reading a specific API\'s documentation still matters even after learning REST conventions generally.',
    },
  },

  '6.6': {
    reading: {
      bigTakeaway: 'JSON structures data as key-value pairs for APIs to exchange, and tools like Ansible read that structured data to push consistent configuration across many devices.',
      definition: '**JSON** structures data as **key-value pairs** and arrays, the standard payload format for REST APIs. **Ansible** (YAML playbooks over SSH, agentless) and **Puppet/Chef** (agent-based) are configuration-management tools that apply **desired-state automation** — describing the end state, not the steps to get there.',
      tiers: {
        beginner: 'JSON is a simple way to structure data as labeled pairs — a key like "hostname" paired with a value like "Switch1" — that both humans and programs can read easily. Configuration management tools like Ansible use structured data like this to describe what a device\'s configuration should look like, then apply it automatically.',
        intermediate: 'A JSON object is just curly braces containing key-value pairs, and those values can themselves be strings, numbers, booleans, arrays, or even nested objects — enough structure to represent something as complex as a full device configuration. This is the same format REST APIs (6.5) typically exchange, which is why the two objectives pair together.\n\nAnsible describes configuration as YAML playbooks and pushes them over plain SSH without needing any special software installed on the target device (agentless), which is one reason it is popular for network gear that often cannot run a full software agent. Puppet and Chef instead require an agent running on each managed device, checking in periodically to pull and apply configuration.',
        examReady: 'Know the JSON syntax basics — curly braces for objects, square brackets for arrays, key-value pairs separated by colons, values quoted if they are strings — well enough to read a short JSON snippet and identify a specific value.\n\nDesired-state automation is the concept tie-in: you describe the end state you want (e.g. "this VLAN exists with this name"), and the tool figures out and applies whatever changes are needed to reach it, rather than you scripting the individual CLI commands. Ansible\'s agentless SSH-based model is the detail most likely to distinguish it from Puppet/Chef on the exam.',
      },
      keyPoints: [
        'JSON: `{"key": "value"}` — key-value pairs, arrays in `[ ]`, nesting allowed for complex structures.',
        'JSON is the standard payload format REST APIs (6.5) exchange.',
        'Ansible: YAML playbooks, agentless, runs over SSH — no software required on the managed device.',
        'Puppet/Chef: agent-based — a running agent on each device checks in and pulls configuration.',
        'Desired-state automation: describe the end state; the tool computes and applies the needed changes.',
        'Ansible\'s agentless model is why it is popular for network devices that cannot run a full agent.',
      ],
      realWorld: 'An Ansible playbook describes "VLAN 20 named Sales should exist on these 40 switches," and running it creates the VLAN wherever it is missing and leaves it untouched wherever it already matches — without anyone writing per-switch CLI commands.',
      commonMistakes: [
        'Confusing JSON (a data format) with YAML (Ansible\'s playbook format) — Ansible plays are written in YAML, but often exchange JSON with APIs underneath.',
        'Assuming all configuration-management tools require an agent — Ansible specifically does not.',
        'Missing a comma or quote in JSON and assuming the structure is still valid — JSON syntax is strict.',
        'Describing steps instead of desired state, which is imperative scripting, not what "desired-state automation" means.',
      ],
      related: ['6.1 Automation impact', '6.5 REST APIs'],
      advanced: 'Ansible modules for network devices (e.g. ios_config) abstract vendor-specific CLI syntax behind a consistent YAML interface, so the same playbook structure can often be adapted across different device platforms.',
    },
  },
}
