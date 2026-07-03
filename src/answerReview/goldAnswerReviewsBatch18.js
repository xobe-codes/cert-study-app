/** Gold reviews — Batch 18: FHRP 3.5, segmentation 5.11, DNS 4.3, SNMP 4.4, syslog 4.5, cloud mgmt 4.10, controller 6.2, SDN 6.3, DNA 6.4, APIs 6.5, config mgmt 6.6. */
export const BATCH18_GOLD = {
  'obj-3.5-source-q006':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "HSRPv1 supports up to **256 groups** (group numbers 0\u2013255) \u2014 the maximum keyed answer for v1 group count."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**8** is the EtherChannel member limit \u2014 HSRPv1 group capacity is **256**.",
        "misconceptionTested": "EtherChannel limit as HSRP group max"
      },
      {
        "choiceIndex": 1,
        "explanation": "**16** is far below the HSRPv1 ceiling \u2014 Cisco allows **256** v1 groups.",
        "misconceptionTested": "Small integer as HSRPv1 group max"
      },
      {
        "choiceIndex": 2,
        "explanation": "**255** is one short \u2014 HSRPv1 group numbers span **0\u2013255** (256 total groups).",
        "misconceptionTested": "255 vs 256 off-by-one for HSRPv1"
      }
    ],
    "examTip": "HSRPv1 max groups = **256** (0\u2013255); HSRPv2 raises the ceiling to **4096**."
  },
  'obj-3.5-source-q009':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "HSRP members exchange hellos via **IP multicast** (224.0.0.102 for v2) \u2014 not broadcast or per-neighbor unicast."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Unicast is used for some FHRP traffic to hosts, but **member-to-member** HSRP control uses **multicast**.",
        "misconceptionTested": "Unicast for HSRP member hellos"
      },
      {
        "choiceIndex": 1,
        "explanation": "HSRPv1 used limited broadcast on some platforms \u2014 the keyed answer for member communication is **multicast** (v2 standard).",
        "misconceptionTested": "Broadcast as HSRP member protocol"
      },
      {
        "choiceIndex": 3,
        "explanation": "Layer 2 flooding is not how HSRP negotiates \u2014 routers send **multicast** hellos at Layer 3.",
        "misconceptionTested": "L2 flooding as HSRP transport"
      }
    ],
    "examTip": "HSRP hellos \u2192 **multicast 224.0.0.102** (v2); memorize with GLBP **3222/UDP**."
  },
  'obj-3.5-source-q010':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Hosts target the **virtual router** (VIP/virtual MAC) \u2014 the active router answers on behalf of that logical gateway."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "The **active** router forwards traffic but hosts are configured with the **virtual router** address, not the physical router IP.",
        "misconceptionTested": "Active router IP as default gateway"
      },
      {
        "choiceIndex": 2,
        "explanation": "The **standby** is backup \u2014 clients never use the standby's physical address as the default gateway.",
        "misconceptionTested": "Standby router as gateway target"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Monitor router** is not an HSRP role \u2014 the abstraction clients use is the **virtual router**.",
        "misconceptionTested": "Invented monitor router role"
      }
    ],
    "examTip": "FHRP clients point at the **virtual IP/MAC** \u2014 active router services it; standby waits."
  },
  'obj-3.5-source-q012':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**GLBP** control traffic uses **UDP port 3222** \u2014 distinct from HSRP's UDP 1985."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "UDP **1935** is RTMP \u2014 GLBP uses **UDP 3222**.",
        "misconceptionTested": "RTMP port for GLBP"
      },
      {
        "choiceIndex": 1,
        "explanation": "UDP **1985** is **HSRP** \u2014 GLBP control is **3222**.",
        "misconceptionTested": "HSRP port for GLBP"
      },
      {
        "choiceIndex": 2,
        "explanation": "UDP **1895** is not GLBP \u2014 memorize **3222** for GLBP hellos.",
        "misconceptionTested": "Wrong UDP port near GLBP"
      }
    ],
    "examTip": "FHRP ports: **HSRP 1985** | **GLBP 3222** | **VRRP 112**."
  },
  'obj-3.5-source-q013':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "HSRPv2 hello/hold timers are configured in **milliseconds** \u2014 v1 used whole seconds."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Both HSRPv1 and v2 use **hello packets** \u2014 v2 did not remove them.",
        "misconceptionTested": "HSRPv2 without hellos"
      },
      {
        "choiceIndex": 1,
        "explanation": "Multicast vs broadcast differences exist but the keyed v1/v2 distinction here is **millisecond timers** in v2.",
        "misconceptionTested": "Broadcast/multicast as primary v1/v2 difference"
      },
      {
        "choiceIndex": 2,
        "explanation": "**IPv6** support is an HSRPv2 feature \u2014 the keyed difference is **millisecond** timer granularity.",
        "misconceptionTested": "IPv6 as the keyed v1/v2 difference"
      }
    ],
    "examTip": "HSRPv2 upgrades: **4096 groups**, **multicast**, **millisecond timers**, **IPv6**."
  },
  '5.11-legacy-q002':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**VLANs** are the primary campus L2 segmentation tool \u2014 separate broadcast domains on shared switches."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**NAT** translates addresses \u2014 it does not segment broadcast domains at Layer 2.",
        "misconceptionTested": "NAT as L2 segmentation"
      },
      {
        "choiceIndex": 2,
        "explanation": "**HSRP** provides gateway redundancy \u2014 not network segmentation.",
        "misconceptionTested": "FHRP as segmentation building block"
      },
      {
        "choiceIndex": 3,
        "explanation": "**CDP** discovers neighbors \u2014 it does not create security or broadcast boundaries.",
        "misconceptionTested": "CDP as segmentation technology"
      }
    ],
    "examTip": "Campus segmentation baseline \u2192 **VLANs** + L3 boundary (router/SVI) + ACLs/firewall."
  },
  '5.11-legacy-q003':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "A **DMZ** hosts **internet-facing services** in a buffer zone \u2014 reachable from outside but isolated from the internal LAN."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Internal-only file servers belong on the **trusted LAN**, not a DMZ designed for external access.",
        "misconceptionTested": "DMZ for internal-only hosts"
      },
      {
        "choiceIndex": 2,
        "explanation": "Routing protocol backup paths are a resilience topic \u2014 DMZ is a **security zone** for public services.",
        "misconceptionTested": "DMZ as routing backup"
      },
      {
        "choiceIndex": 3,
        "explanation": "Config backups are an operations task \u2014 DMZ is an **architectural security segment**.",
        "misconceptionTested": "DMZ as backup storage"
      }
    ],
    "examTip": "DMZ pattern: Internet \u2192 firewall \u2192 **DMZ (web/mail)** \u2192 firewall \u2192 internal LAN."
  },
  '5.11-legacy-q004':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**Microsegmentation** enforces policy **per workload/application** \u2014 often with overlays or host firewalls beyond coarse VLANs."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Microsegmentation applies to **data center and campus** workloads \u2014 not wireless-only.",
        "misconceptionTested": "Microsegmentation as wireless-only"
      },
      {
        "choiceIndex": 2,
        "explanation": "Microsegmentation **adds** granular access control \u2014 it does not remove the need for policy.",
        "misconceptionTested": "Microsegmentation eliminates access control"
      },
      {
        "choiceIndex": 3,
        "explanation": "Smaller subnet masks change IP sizing \u2014 microsegmentation is **policy granularity**, not subnet math.",
        "misconceptionTested": "Subnet sizing as microsegmentation"
      }
    ],
    "examTip": "VLAN = broadcast boundary; **microsegmentation** = east-west policy down to workload."
  },
  '5.11-legacy-q006':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Inter-VLAN policy is enforced on a **Layer 3 device** \u2014 **ACLs** on a router or multilayer switch filter traffic between VLANs."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**STP** prevents loops \u2014 it does not filter or permit traffic between VLANs.",
        "misconceptionTested": "STP as inter-VLAN policy"
      },
      {
        "choiceIndex": 2,
        "explanation": "**CDP** advertises device info \u2014 it is not an access-control mechanism.",
        "misconceptionTested": "CDP as segmentation enforcement"
      },
      {
        "choiceIndex": 3,
        "explanation": "**DHCP relay** forwards DHCP \u2014 it does not enforce security policy between VLANs.",
        "misconceptionTested": "DHCP relay as inter-VLAN ACL"
      }
    ],
    "examTip": "VLANs segment L2; **routing + ACLs/firewall** enforce policy **between** VLANs."
  },
  '5.11-legacy-q009':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "A separate **voice VLAN** segments **traffic type** (VoIP vs data) \u2014 not users or floors."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Sales vs Engineering VLANs segment by **department/user** \u2014 not traffic type.",
        "misconceptionTested": "Department VLAN as traffic-type segmentation"
      },
      {
        "choiceIndex": 2,
        "explanation": "Per-floor VLANs segment by **location** \u2014 voice/data separation is traffic-type segmentation.",
        "misconceptionTested": "Location VLAN as traffic-type segmentation"
      },
      {
        "choiceIndex": 3,
        "explanation": "Static printer IPs are addressing \u2014 not a segmentation-by-traffic-type design.",
        "misconceptionTested": "Static IP as traffic-type segmentation"
      }
    ],
    "examTip": "Traffic-type VLANs: **voice**, **guest**, **IoT** \u2014 separate QoS and security policy."
  },
  'obj-4.3-source-q003':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "IOS appends the configured **DNS domain name** to unqualified hostnames before querying \u2014 `ip domain-name`."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "A DNS **zone** is the authoritative dataset \u2014 the router appends the **domain suffix**, not the zone object.",
        "misconceptionTested": "DNS zone as appended suffix"
      },
      {
        "choiceIndex": 2,
        "explanation": "HTTP **host headers** are unrelated \u2014 DNS resolution appends the **domain name**.",
        "misconceptionTested": "HTTP host header as DNS suffix"
      },
      {
        "choiceIndex": 3,
        "explanation": "PTR records map IP\u2192name \u2014 hostname queries append the **domain name** for forward lookup.",
        "misconceptionTested": "PTR record as DNS suffix"
      }
    ],
    "examTip": "Unqualified name `router1` + domain `example.com` \u2192 query **router1.example.com**."
  },
  'obj-4.3-source-q004':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Static hostname entries** (`ip host`) avoid DNS spoofing/dependency \u2014 most secure for device name resolution on routers."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "DNS relies on external servers \u2014 less secure than **locally defined static** mappings for critical peers.",
        "misconceptionTested": "DNS as most secure device name resolution"
      },
      {
        "choiceIndex": 1,
        "explanation": "PTR records are reverse DNS \u2014 they do not replace secure **static hostname** tables on devices.",
        "misconceptionTested": "PTR as primary secure resolution"
      },
      {
        "choiceIndex": 3,
        "explanation": "**LLMNR** is a broadcast/multicast fallback \u2014 not the most secure enterprise method.",
        "misconceptionTested": "LLMNR as most secure resolution"
      }
    ],
    "examTip": "Device peer names you must trust \u2192 **`ip host`** static table; lab DNS is fine for general lookup."
  },
  'obj-4.3-source-q006':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**TTL (Time To Live)** on DNS records limits how long resolvers cache an entry before re-querying."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "An **A record** maps name\u2192IPv4 \u2014 **TTL** controls cache duration, not the record type.",
        "misconceptionTested": "A record as cache timer"
      },
      {
        "choiceIndex": 2,
        "explanation": "**SOA** starts a zone and holds zone timers \u2014 per-record cache expiry is the record's **TTL**.",
        "misconceptionTested": "SOA as per-entry cache limit"
      },
      {
        "choiceIndex": 3,
        "explanation": "There is no universal **5-minute default** \u2014 each record's **TTL** field sets cache lifetime.",
        "misconceptionTested": "Fixed 5-minute DNS cache default"
      }
    ],
    "examTip": "DNS cache aging \u2192 check the record's **TTL** value (seconds until refresh)."
  },
  'obj-4.4-source-q002':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "The **MIB (Management Information Base)** is SNMP's structured database of managed objects."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**OIDs** identify individual variables **inside** the MIB \u2014 the database itself is the **MIB**.",
        "misconceptionTested": "OID as the SNMP database"
      },
      {
        "choiceIndex": 2,
        "explanation": "The **SNMP agent** runs on the device \u2014 it reads values from the **MIB**.",
        "misconceptionTested": "SNMP agent as variable database"
      },
      {
        "choiceIndex": 3,
        "explanation": "A **community string** is an access credential \u2014 not the variable database.",
        "misconceptionTested": "Community string as MIB"
      }
    ],
    "examTip": "SNMP stack: **MIB** (database) \u2192 **OID** (address) \u2192 **agent** (responder) \u2192 **NMS** (poller)."
  },
  'obj-4.4-source-q003':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "SNMP **agents** send traps/informs to the **network management station (NMS)** \u2014 the central monitoring server."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Syslog** carries log messages \u2014 SNMP alerts go to the **NMS**, not syslog by default.",
        "misconceptionTested": "Syslog as SNMP trap destination"
      },
      {
        "choiceIndex": 2,
        "explanation": "An **OID** names a variable \u2014 the destination for SNMP messages is the **NMS**.",
        "misconceptionTested": "OID as SNMP message destination"
      },
      {
        "choiceIndex": 3,
        "explanation": "The **MIB** is local data on the agent \u2014 notifications are sent **out** to the NMS.",
        "misconceptionTested": "MIB as external trap receiver"
      }
    ],
    "examTip": "SNMP roles: **agent** on device \u2192 **NMS** (manager) receives polls and traps."
  },
  'obj-4.4-source-q005':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**OIDs** form the hierarchical tree of variables that compose the **MIB** \u2014 dot-notation branches."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "The **community string** is authentication (v2c) \u2014 not the MIB hierarchy.",
        "misconceptionTested": "Community string as MIB structure"
      },
      {
        "choiceIndex": 2,
        "explanation": "The **SNMP agent** serves data \u2014 the hierarchical variable set is **OIDs in the MIB**.",
        "misconceptionTested": "SNMP agent as MIB hierarchy"
      },
      {
        "choiceIndex": 3,
        "explanation": "SNMP **messages** carry requests \u2014 structure is defined by **OID** branches.",
        "misconceptionTested": "SNMP messages as MIB hierarchy"
      }
    ],
    "examTip": "MIB = tree of **OIDs** (e.g., `1.3.6.1.2.1...` = mib-2 standard branch)."
  },
  'obj-4.5-source-q001':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "Syslog sends messages via **UDP port 514** \u2014 the standard syslog transport."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "UDP **161** is **SNMP** polling \u2014 syslog uses **UDP 514**.",
        "misconceptionTested": "SNMP port for syslog"
      },
      {
        "choiceIndex": 1,
        "explanation": "TCP **162** is SNMP **traps** \u2014 syslog is **UDP 514**.",
        "misconceptionTested": "SNMP trap port for syslog"
      },
      {
        "choiceIndex": 2,
        "explanation": "UDP **162** is SNMP traps/informs \u2014 syslog is **514/UDP**.",
        "misconceptionTested": "UDP 162 as syslog"
      }
    ],
    "examTip": "Ports: **SNMP 161/162** | **Syslog 514/UDP** \u2014 don't swap management protocols."
  },
  'obj-4.5-source-q002':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Send debugging-level syslog to the server with **`logging trap debugging`** \u2014 sets the remote severity threshold."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`syslog debugging` is not valid IOS global syntax \u2014 use **`logging trap`**.",
        "misconceptionTested": "syslog command prefix for trap level"
      },
      {
        "choiceIndex": 1,
        "explanation": "`logging debugging` is incomplete \u2014 remote trap level needs **`logging trap debugging`**.",
        "misconceptionTested": "Missing trap keyword for remote severity"
      },
      {
        "choiceIndex": 3,
        "explanation": "`log-level debugging` is not Cisco IOS \u2014 the trap command is **`logging trap debugging`**.",
        "misconceptionTested": "Invented log-level command"
      }
    ],
    "examTip": "Remote syslog severity \u2192 **`logging trap <level>`**; console \u2192 **`logging console <level>`**."
  },
  'obj-4.5-source-q004':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "Enable log timestamps with **`service timestamps log datetime`** \u2014 replaces sequence numbers with date/time."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`logging timestamps log datetime` is invalid \u2014 the service command is **`service timestamps log datetime`**.",
        "misconceptionTested": "logging prefix for timestamp service"
      },
      {
        "choiceIndex": 1,
        "explanation": "`logging timestamps datetime` omits the **log** keyword \u2014 use **`service timestamps log datetime`**.",
        "misconceptionTested": "Incomplete timestamps command"
      },
      {
        "choiceIndex": 2,
        "explanation": "`service datetime timestamps` transposes keywords \u2014 correct form is **`service timestamps log datetime`**.",
        "misconceptionTested": "Reversed service timestamps keywords"
      }
    ],
    "examTip": "Timestamps: **`service timestamps log datetime`** (+ `debug` variant for debug messages)."
  },
  '4.10-legacy-q001':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Cloud-managed** gear phones home to a **vendor-hosted dashboard** over the internet \u2014 config and telemetry centralize off-box."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "On-prem devices **can** be managed remotely via SNMP/SSH \u2014 the difference is **where the controller lives**.",
        "misconceptionTested": "On-prem as no remote management"
      },
      {
        "choiceIndex": 2,
        "explanation": "Cloud platforms **support VLANs** \u2014 architecture differs in controller placement, not L2 features.",
        "misconceptionTested": "Cloud-managed without VLANs"
      },
      {
        "choiceIndex": 3,
        "explanation": "On-prem networks commonly use **SNMP** \u2014 cloud adds a hosted orchestration layer.",
        "misconceptionTested": "On-prem cannot use SNMP"
      }
    ],
    "examTip": "Cloud-managed = devices \u2192 **vendor cloud dashboard**; on-prem = local NMS/controller."
  },
  '4.10-legacy-q004':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Zero-touch provisioning (ZTP)** lets new devices **auto-pull config** from the cloud on first boot \u2014 no console visit required."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Cloud management depends on **internet reachability** \u2014 it does not guarantee lower latency than local CLI.",
        "misconceptionTested": "Cloud as always lower latency"
      },
      {
        "choiceIndex": 2,
        "explanation": "Cloud management **requires internet** for dashboard control \u2014 not zero connectivity.",
        "misconceptionTested": "Cloud with no internet ever"
      },
      {
        "choiceIndex": 3,
        "explanation": "Pushing policy from the cloud **needs connectivity** \u2014 ZTP is the benefit, not offline-only operation.",
        "misconceptionTested": "Cloud config without internet"
      }
    ],
    "examTip": "Meraki/cloud win: **ZTP**, centralized monitoring, fleet firmware \u2014 trade-off = cloud dependency."
  },
  '4.10-legacy-q005':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**DNA Center** is typically **on-premises/private cloud**; **Meraki** is a **vendor-hosted cloud dashboard**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "The roles are reversed \u2014 **DNA Center is on-prem**; **Meraki is cloud-hosted**.",
        "misconceptionTested": "DNA cloud-only and Meraki on-prem"
      },
      {
        "choiceIndex": 2,
        "explanation": "Both offer **GUI dashboards** \u2014 they differ in deployment model, not CLI-only.",
        "misconceptionTested": "Both as CLI-only tools"
      },
      {
        "choiceIndex": 3,
        "explanation": "DNA Center uses a **dedicated appliance/cluster**; Meraki is **cloud SaaS** \u2014 not identical hardware.",
        "misconceptionTested": "Same hardware for DNA and Meraki"
      }
    ],
    "examTip": "Cisco mgmt map: **DNA Center** = campus on-prem | **Meraki** = cloud SaaS | **vManage** = SD-WAN."
  },
  'obj-6.2-source-q001':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Controller-based networking centralizes policy \u2014 enabling **consistent security** and automated enforcement across devices."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**Decreased problems** is vague marketing \u2014 the exam cites **increased security** as a controller benefit.",
        "misconceptionTested": "Generic decreased problems as keyed benefit"
      },
      {
        "choiceIndex": 2,
        "explanation": "Controllers do not automatically raise **throughput** \u2014 they improve manageability and policy consistency.",
        "misconceptionTested": "Controller as throughput booster"
      },
      {
        "choiceIndex": 3,
        "explanation": "Controllers can add **complexity** initially \u2014 they are adopted for automation and **security**, not simplicity alone.",
        "misconceptionTested": "Increased complexity as benefit"
      }
    ],
    "examTip": "Controller benefits on CCNA: **centralized policy**, automation, visibility \u2014 often **security** in keyed answers."
  },
  'obj-6.2-source-q003':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**SD-WAN** overlays multiple sites into one managed fabric \u2014 controller-based WAN with centralized policy."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**SDN** is the broad separation of control/data planes \u2014 multi-site WAN unification is **SD-WAN**.",
        "misconceptionTested": "Generic SDN for multi-site WAN"
      },
      {
        "choiceIndex": 2,
        "explanation": "**SD-LAN** is not the CCNA term \u2014 campus LAN SDN differs from **SD-WAN**.",
        "misconceptionTested": "SD-LAN as multi-site term"
      },
      {
        "choiceIndex": 3,
        "explanation": "**VPN** encrypts tunnels \u2014 **SD-WAN** is the controller-orchestrated multi-site WAN model.",
        "misconceptionTested": "VPN as SD-WAN equivalent"
      }
    ],
    "examTip": "Multi-site single policy fabric over WAN \u2192 **SD-WAN** (vManage); DC fabric \u2192 **ACI**."
  },
  'obj-6.3-source-q006':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "The **three-tier campus** model includes **access, distribution, and core** \u2014 distribution aggregates access blocks."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Spine/leaf** is a two-tier CLOS fabric \u2014 no separate distribution layer.",
        "misconceptionTested": "Spine/leaf as distribution-layer model"
      },
      {
        "choiceIndex": 2,
        "explanation": "**CLOS** describes spine/leaf topology \u2014 campus **three-tier** has the distribution layer.",
        "misconceptionTested": "CLOS as campus distribution model"
      },
      {
        "choiceIndex": 3,
        "explanation": "**SDN** is a control paradigm \u2014 the layered model with distribution is **campus three-tier**.",
        "misconceptionTested": "SDN as distribution-layer architecture"
      }
    ],
    "examTip": "Campus tiers: **access \u2192 distribution \u2192 core**; DC modern: **spine/leaf** (no distribution)."
  },
  'obj-6.3-source-q007':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "The SDN **controller replaces the distributed control plane** \u2014 devices forward (data plane) per controller policy."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Management plane (CLI, SNMP) may remain \u2014 the controller centralizes the **control plane**, not mgmt only.",
        "misconceptionTested": "Controller as management-plane only"
      },
      {
        "choiceIndex": 1,
        "explanation": "Monitoring data-plane traffic is analytics \u2014 the controller **owns control-plane decisions**.",
        "misconceptionTested": "Controller as data-plane monitor only"
      },
      {
        "choiceIndex": 3,
        "explanation": "The controller **centralizes/replaces** control functions \u2014 it does not merely complement local routing.",
        "misconceptionTested": "Controller complements instead of replaces control plane"
      }
    ],
    "examTip": "SDN split: **data plane** on switch | **control plane** on controller | **mgmt** often still local."
  },
  'obj-6.4-source-q002':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**OpenFlow** programs forwarding in SDN data planes \u2014 DNA Center discovery uses **SSH/HTTPS/NETCONF**, not OpenFlow for inventory."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**SSH** is commonly used by DNA Center to discover and manage devices.",
        "misconceptionTested": "SSH excluded from DNA discovery"
      },
      {
        "choiceIndex": 1,
        "explanation": "**HTTPS** is used for REST API access to devices and controllers during discovery.",
        "misconceptionTested": "HTTPS excluded from DNA discovery"
      },
      {
        "choiceIndex": 2,
        "explanation": "**NETCONF** is a modern management API DNA Center can leverage \u2014 OpenFlow is the odd one out.",
        "misconceptionTested": "NETCONF excluded from DNA discovery"
      }
    ],
    "examTip": "DNA discovery = **SSH/HTTPS/NETCONF/SNMP**; **OpenFlow** = southbound forwarding API, not inventory crawl."
  },
  'obj-6.5-source-q001':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Automation scripts target device **APIs** \u2014 read the **API reference** to learn supported objects, verbs, and data models."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "GUI layout does not document programmatic objects \u2014 use the **API reference**.",
        "misconceptionTested": "UI layout as automation research source"
      },
      {
        "choiceIndex": 2,
        "explanation": "Device **source code** is not available to operators \u2014 APIs document controllable features.",
        "misconceptionTested": "Source code as API documentation"
      },
      {
        "choiceIndex": 3,
        "explanation": "Internal **data storage** format is irrelevant \u2014 the **API reference** lists exposed configuration/state.",
        "misconceptionTested": "Device storage as automation guide"
      }
    ],
    "examTip": "Before scripting \u2192 **API reference** (REST/NETCONF/YANG models) for supported operations."
  },
  'obj-6.6-source-q001':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Ansible, Chef, and Puppet** are **configuration management** tools \u2014 declarative/automated device config at scale."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "An **NMS** monitors/polls \u2014 config management tools **push desired state** to devices.",
        "misconceptionTested": "NMS role for Ansible/Chef/Puppet"
      },
      {
        "choiceIndex": 2,
        "explanation": "**SDN** separates control/data planes \u2014 these tools automate **configuration**, not SDN architecture.",
        "misconceptionTested": "SDN as config management function"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Centralized logging** is syslog/SIEM \u2014 Ansible/Chef/Puppet manage **configuration state**.",
        "misconceptionTested": "Logging as config management"
      }
    ],
    "examTip": "Config management trio: **Ansible** (agentless) | **Chef/Puppet** (agent-based) \u2014 all enforce desired config."
  },
}
