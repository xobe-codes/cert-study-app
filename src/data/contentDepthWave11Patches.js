/** Content depth wave 11 — +1 flashcard for Tier B objectives still at 3 FC. */

export const CONTENT_DEPTH_WAVE11_PATCHES = {
  '3.6': { flashcards: [{ id: '3.6-w11-f1', ckuId: 'CKU-TROUBLESHOOTING', front: 'Troubleshoot order of operations?', back: '**L1 physical** → **L2 switch/VLAN** → **L3 route/ACL** — do not skip layers.' }] },
  '4.4': { flashcards: [{ id: '4.4-w11-f1', ckuId: 'CKU-SNMP', front: 'SNMP trap vs poll?', back: '**Trap** = agent pushes event to NMS; **poll/GET** = NMS queries agent with community/credentials.' }] },
  '4.5': { flashcards: [{ id: '4.5-w11-f1', ckuId: 'CKU-SYSLOG', front: 'Syslog severity 0–7 order?', back: '**Emerg(0)** most severe → **Debug(7)** least — memorialize **0=emergency, 7=debug**.' }] },
  '4.7': { flashcards: [{ id: '4.7-w11-f1', ckuId: 'CKU-QOS', front: 'PHB names (CCNA)?', back: '**EF** expedited forwarding, **AF** assured, **BE** best effort — marking maps to queues.' }] },
  '4.8': { flashcards: [{ id: '4.8-w11-f1', ckuId: 'CKU-SSH', front: 'SSH minimum RSA modulus (CCNA)?', back: '**768 bits** minimum for v2; **1024** is common lab/exam answer.' }] },
  '4.9': { flashcards: [{ id: '4.9-w11-f1', ckuId: 'CKU-TFTP-FTP', front: 'TFTP port and transport?', back: '**UDP/69** — connectionless, no login; backup with `copy running-config tftp:`.' }] },
  '4.10': { flashcards: [{ id: '4.10-w11-f1', ckuId: 'CKU-CLOUD-MGMT', front: 'On-box vs cloud management?', back: '**On-box** = CLI/SNMP local; **cloud** = DNA/vManage central policies and assurance.' }] },
  '5.2': { flashcards: [{ id: '5.2-w11-f1', ckuId: 'CKU-SECURITY-PROGRAM', front: 'Security policy vs procedure?', back: '**Policy** = what must be done; **procedure** = step-by-step how — both part of governance.' }] },
  '5.4': { flashcards: [{ id: '5.4-w11-f1', ckuId: 'CKU-AAA', front: 'TACACS+ vs RADIUS (CCNA)?', back: '**TACACS+** = Cisco, separates authZ (TCP/49); **RADIUS** combines auth, UDP/1812.' }] },
  '5.7': { flashcards: [{ id: '5.7-w11-f1', ckuId: 'CKU-AAA', front: 'AAA accounting does what?', back: 'Logs **who did what when** — command accounting, connection logs for audits.' }] },
  '5.10': { flashcards: [{ id: '5.10-w11-f1', ckuId: 'CKU-VPN', front: 'IPsec transport vs tunnel mode?', back: '**Tunnel** encrypts entire IP packet (site-to-site); **transport** encrypts payload only (often host).' }] },
  '5.11': { flashcards: [{ id: '5.11-w11-f1', ckuId: 'CKU-ZBFW', front: 'ZBFW default inter-zone action?', back: '**Deny all** until explicit **zone-pair** policy (inspect/pass/drop) is configured.' }] },
  '6.1': { flashcards: [{ id: '6.1-w11-f1', ckuId: 'CKU-AUTOMATION', front: 'Day-0 vs Day-N operations?', back: '**Day-0** = provision/deploy; **Day-N** = monitor, remediate, upgrade — automation targets both.' }] },
  '6.6': { flashcards: [{ id: '6.6-w11-f1', ckuId: 'CKU-JSON', front: 'JSON null vs empty string?', back: '`null` = no value; `""` = empty string — APIs treat them differently in merges.' }] },
}
