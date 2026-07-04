/** Tier B trap wave 12 — services, HSRP, troubleshooting, automation (3 → 4+ traps). */

export const TIER_B_TRAP_WAVE12_PATCHES = {
  '3.5': {
    examTraps: [{
      id: '3.5-w12-t1',
      trap: 'HSRP standby IP must be configured on a different subnet than the LAN.',
      correction: 'The **virtual IP** sits on the **same subnet** as the physical interfaces — hosts use it as their default gateway.',
      ckuIds: ['CKU-HSRP'],
    }],
    flashcards: [{
      id: '3.5-w12-f1', ckuId: 'CKU-HSRP',
      front: 'HSRP default priority?',
      back: '**100** — higher wins; `preempt` lets a higher-priority router reclaim Active after recovery.',
    }],
  },
  '3.6': {
    examTraps: [{
      id: '3.6-w12-t1',
      trap: 'A routing problem is always fixed by clearing the ARP cache first.',
      correction: 'Follow **L1 → L2 → L3**: interface status, neighbor adjacency, then `show ip route` — ARP is downstream of routing.',
      ckuIds: ['CKU-TROUBLESHOOTING'],
    }],
  },
  '4.2': {
    examTraps: [{
      id: '4.2-w12-t1',
      trap: 'Stratum 16 in show ntp status means the clock is synchronized.',
      correction: '**Stratum 16 = unsynchronized** — no valid reference; look for `Clock is synchronized` and stratum 1–15.',
      ckuIds: ['CKU-NTP'],
    }],
  },
  '4.3': {
    examTraps: [{
      id: '4.3-w12-t1',
      trap: 'ip helper-address and ip dhcp pool serve the same role on the DHCP server.',
      correction: '**ip dhcp pool** defines leases on the **server**; **ip helper-address** forwards broadcasts to a remote server from a **client subnet**.',
      ckuIds: ['CKU-DHCP'],
    }],
  },
  '4.5': {
    examTraps: [{
      id: '4.5-w12-t1',
      trap: 'logging console and logging host send the same severity levels by default.',
      correction: 'Each destination has its own level — `logging trap` for syslog may differ from `logging console` severity.',
      ckuIds: ['CKU-SYSLOG'],
    }],
  },
  '4.6': {
    examTraps: [{
      id: '4.6-w12-t1',
      trap: 'DHCP relay and DHCP server must run on the same router.',
      correction: '**Relay (helper-address)** is on the **client-facing router**; the **pool** lives on a **separate server/router**.',
      ckuIds: ['CKU-DHCP'],
    }],
  },
  '4.8': {
    examTraps: [{
      id: '4.8-w12-t1',
      trap: 'SSH works without generating an RSA key as long as Telnet is disabled.',
      correction: 'IOS needs **`crypto key generate rsa`** (after `ip domain-name`) — disabling Telnet alone does not enable SSH.',
      ckuIds: ['CKU-SSH'],
    }],
  },
  '5.1': {
    examTraps: [{
      id: '5.1-w12-t1',
      trap: 'Confidentiality and integrity are the same security goal.',
      correction: '**Confidentiality** = secrecy; **integrity** = data unchanged in transit — TLS provides both; ACLs alone do not.',
      ckuIds: ['CKU-SECURITY-CONCEPTS'],
    }],
  },
  '5.4': {
    examTraps: [{
      id: '5.4-w12-t1',
      trap: 'aaa authentication login default local requires a TACACS+ server.',
      correction: '**local** uses the **local username database** — TACACS+/RADIUS are separate method-list options.',
      ckuIds: ['CKU-AAA'],
    }],
  },
  '5.7': {
    examTraps: [{
      id: '5.7-w12-t1',
      trap: 'Authorization happens before authentication in the AAA sequence.',
      correction: 'Order is **Authentication** (who) → **Authorization** (what allowed) → **Accounting** (audit log).',
      ckuIds: ['CKU-AAA'],
    }],
  },
  '6.5': {
    examTraps: [{
      id: '6.5-w12-t1',
      trap: 'REST APIs always use SOAP XML for Cisco SDN controllers.',
      correction: 'Cisco DNA / modern APIs are **REST + JSON** over HTTPS — CRUD maps to GET/POST/PUT/DELETE.',
      ckuIds: ['CKU-REST-API'],
    }],
  },
  '6.6': {
    examTraps: [{
      id: '6.6-w12-t1',
      trap: 'JSON arrays use curly braces { } like objects.',
      correction: '**Arrays use [ ]**; **objects use { }** — `"interfaces": [ { "name": "Gi0/0" } ]` is a common exam pattern.',
      ckuIds: ['CKU-JSON'],
    }],
  },
}
