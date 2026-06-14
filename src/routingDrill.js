export const ROUTING_DRILL_ITEMS = [
  { line: 'C    192.168.1.0/24 is directly connected, GigabitEthernet0/0', question: 'What is the routing source code for this entry?', answer: 'C', hint: 'Connected routes use code C.' },
  { line: 'S    10.0.0.0/8 [1/0] via 203.0.113.1', question: 'What is the administrative distance for this static route?', answer: '1', hint: 'Static routes default to AD 1.' },
  { line: 'O    172.16.0.0/16 [110/20] via 10.1.1.2, 00:05:00, GigabitEthernet0/1', question: 'What is the OSPF administrative distance?', answer: '110', hint: 'OSPF AD is 110.' },
  { line: 'O    172.16.0.0/16 [110/20] via 10.1.1.2, 00:05:00, GigabitEthernet0/1', question: 'What is the outgoing interface?', answer: 'GigabitEthernet0/1', hint: 'Last field in the route line.' },
  { line: 'S*   0.0.0.0/0 [1/0] via 203.0.113.1', question: 'What does the asterisk (*) indicate?', answer: 'default route', accept: ['default', 'default route'], hint: '0.0.0.0/0 is the default route.' },
]

export function generateRoutingProblem() {
  const item = ROUTING_DRILL_ITEMS[Math.floor(Math.random() * ROUTING_DRILL_ITEMS.length)]
  return { ...item }
}
