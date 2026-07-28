/**
 * Hand fixes for truncated or broken question stems in the clean bank.
 * Applied at build + compile so rebuilds stay self-contained.
 */

export const QUESTION_STEM_FIXES = {
  'obj-3.2-source-q003': {
    question:
      'You review a router and discover that there is a static default route configured for a next hop of 192.168.1.2. You also notice that there is a default route being populated from RIP for a next hop of 192.168.2.2. Which default route will the router use?',
  },
  'obj-3.3-source-q040': {
    question:
      'When you check the IPv6 addresses configured on the interfaces, you find two IPv6 addresses: One address is a 2001:db8::/64 address, and the other is an fe80::/64 address. However, you do not see a route statement for the fe80::/64 network in the routing table. Why is that?',
  },
  'obj-3.5-source-q030': {
    question:
      'You have four routers configured with HSRP. Four routers—Router A, Router B, Router C, and Router D—are configured with the default priority. You change the priority of Router A to 80, Router B to 100, Router C to 140, and Router D is left at the default priority. Which router will become the active router?',
  },
  'obj-6.7-source-q007': {
    question: `JSON exhibit:
{
  "interface": "Fa0/1",
  "bandwidth": "100mb",
  "status": "up",
  "address": {
    "ipaddress": "192.168.1.5",
    "subnetmask": "255.255.255.0",
    "default gateway": "192.168.1.1",
  }
}

What is wrong with this JSON file?`,
  },
  'obj-6.7-source-q010': {
    question: `JSON exhibit:
{
  "ipaddress": "192.168.1.2",
  "subnet_mask": "255.255.255.0",
  "defaultgw": "192.168.1.1",
  "routes": [
    { "route": "10.0.0.0/8 via 192.168.1.10" "route": "0.0.0.0/0 via 192.168.1.1" }
  ]
}

Which statement best identifies the JSON syntax problem?`,
  },
  'obj-6.7-source-q011': {
    question: `JSON exhibit:
{
  "ipaddress": ["192.168.1.2", ["192.168.1.4"]],
  "subnet_mask": "255.255.255.0",
  "defaultgw": "192.168.1.1"
}

Which statement best describes the structure of the JSON data?`,
  },
  'obj-6.7-source-q012': {
    question: `JSON exhibit:
{
  "interface": {
    "ipaddress": ["192.168.1.2", ["192.168.1.4"]]
    "subnet_mask": ["255.255.255.0", ["255.255.255.0"]],
    "defaultgw": "192.168.1.1"
  }
}

Which statement best identifies the JSON syntax problem?`,
  },
}

export function applyQuestionStemFixes(question) {
  if (!question?.id) return question
  const fix = QUESTION_STEM_FIXES[question.id]
  if (!fix) return question
  return { ...question, ...fix }
}
