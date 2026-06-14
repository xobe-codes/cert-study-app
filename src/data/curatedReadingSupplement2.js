import { BOOK_REF } from './bookRefNotes.js'
import { readingFromRef } from './readingFactory.js'

const META = [
  { id: '2.6', domainId: 'access', title: 'Compare Cisco wireless architectures and AP modes', chapter: '2.6', cku: 'CKU-WLAN-ARCH', ckuTitle: 'Cisco Wireless Architectures' },
  { id: '2.7', domainId: 'access', title: 'Describe physical infrastructure connections of WLAN components', chapter: '2.7', cku: 'CKU-WLAN-PHYS', ckuTitle: 'WLAN Physical Infrastructure' },
  { id: '2.8', domainId: 'access', title: 'Configure WLAN components for client connectivity', chapter: '2.8', cku: 'CKU-WLAN-CLIENT', ckuTitle: 'WLAN Client Connectivity' },
  { id: '3.6', domainId: 'connectivity', title: 'Troubleshoot routing issues', chapter: '3.6', cku: 'CKU-ROUTE-TSHOOT', ckuTitle: 'Routing Troubleshooting' },
  { id: '4.4', domainId: 'services', title: 'Explain the function of SNMP', chapter: '4.4', cku: 'CKU-SNMP', ckuTitle: 'SNMP Operations' },
  { id: '4.7', domainId: 'services', title: 'Explain QoS forwarding per-hop behavior', chapter: '4.7', cku: 'CKU-QOS-PHB', ckuTitle: 'QoS Per-Hop Behavior' },
  { id: '4.8', domainId: 'services', title: 'Configure network devices for remote access using SSH', chapter: '4.8', cku: 'CKU-SSH', ckuTitle: 'SSH Remote Access' },
  { id: '4.9', domainId: 'services', title: 'Describe TFTP and FTP capabilities', chapter: '4.9', cku: 'CKU-TFTP-FTP', ckuTitle: 'TFTP and FTP' },
  { id: '4.10', domainId: 'services', title: 'Compare local and cloud-based device management', chapter: '4.10', cku: 'CKU-MGMT-CLOUD', ckuTitle: 'Local vs Cloud Management' },
  { id: '5.4', domainId: 'security', title: 'Configure and verify AAA with TACACS+/RADIUS', chapter: '5.4', cku: 'CKU-AAA-SERVERS', ckuTitle: 'AAA with TACACS+ and RADIUS' },
  { id: '5.7', domainId: 'security', title: 'Compare authentication, authorization, accounting', chapter: '5.7', cku: 'CKU-AAA-CONCEPTS', ckuTitle: 'AAA Concepts' },
  { id: '5.8', domainId: 'security', title: 'Describe wireless security protocols', chapter: '5.8', cku: 'CKU-WLAN-SEC', ckuTitle: 'Wireless Security Protocols' },
  { id: '5.9', domainId: 'security', title: 'Configure WLAN using WPA2 PSK', chapter: '5.9', cku: 'CKU-WPA2-PSK', ckuTitle: 'WPA2-PSK WLAN' },
  { id: '5.10', domainId: 'security', title: 'Differentiate types of VPN and security concepts', chapter: '5.10', cku: 'CKU-VPN', ckuTitle: 'VPN Types' },
  { id: '5.11', domainId: 'security', title: 'Describe security concepts of network segmentation', chapter: '5.11', cku: 'CKU-SEGMENTATION', ckuTitle: 'Network Segmentation' },
  { id: '6.1', domainId: 'automation', title: 'Explain how automation impacts network management', chapter: '6.1', cku: 'CKU-AUTOMATION', ckuTitle: 'Network Automation Impact' },
  { id: '6.2', domainId: 'automation', title: 'Compare traditional networks with controller-based networking', chapter: '6.2', cku: 'CKU-SDN-TRAD', ckuTitle: 'Traditional vs Controller-Based' },
  { id: '6.3', domainId: 'automation', title: 'Describe controller-based and software defined architectures', chapter: '6.3', cku: 'CKU-SDN-ARCH', ckuTitle: 'SDN Architectures' },
  { id: '6.4', domainId: 'automation', title: 'Compare traditional campus management with Cisco DNA Center', chapter: '6.4', cku: 'CKU-DNA', ckuTitle: 'DNA Center Management' },
  { id: '6.5', domainId: 'automation', title: 'Describe characteristics of REST-based APIs', chapter: '6.5', cku: 'CKU-REST', ckuTitle: 'REST APIs' },
  { id: '6.6', domainId: 'automation', title: 'Interpret JSON data and configuration management tools', chapter: '6.6', cku: 'CKU-JSON-ANSIBLE', ckuTitle: 'JSON and Config Management' },
]

export const READING_SUPPLEMENTS_2 = Object.fromEntries(
  META.map(m => [
    m.id,
    readingFromRef({
      objectiveId: m.id,
      domainId: m.domainId,
      title: m.title,
      chapter: m.chapter,
      ckuId: m.cku,
      ckuTitle: m.ckuTitle,
      ref: BOOK_REF[m.id] || m.title,
    }),
  ]),
)
