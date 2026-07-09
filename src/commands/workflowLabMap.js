/** Command Hub workflow → hands-on lab CTA mappings. */
export const WORKFLOW_LAB_MAP = {
  'wf-vlan-access': 'LAB-VLAN-TRUNK',
  'wf-ospf-single-area': 'LAB-OSPF-SINGLE-AREA',
  'wf-nat-pat': 'LAB-NAT-PAT',
  'wf-ssh-hardening': 'LAB-SSH-ACCESS',
  'wf-portfast-bpduguard': 'LAB-STP-PORTFAST',
}

export function labIdForWorkflow(workflowId) {
  return WORKFLOW_LAB_MAP[workflowId] || null
}
