import { FUNDAMENTALS_PLACEMENT_BLUEPRINT } from './fundamentalsPlacementBlueprint.js'
import { ACCESS_PLACEMENT_BLUEPRINT } from './accessPlacementBlueprint.js'
import { CONNECTIVITY_PLACEMENT_BLUEPRINT } from './connectivityPlacementBlueprint.js'
import { SERVICES_PLACEMENT_BLUEPRINT } from './servicesPlacementBlueprint.js'
import { SECURITY_PLACEMENT_BLUEPRINT } from './securityPlacementBlueprint.js'
import { AUTOMATION_PLACEMENT_BLUEPRINT } from './automationPlacementBlueprint.js'

const BY_DOMAIN = {
  fundamentals: FUNDAMENTALS_PLACEMENT_BLUEPRINT,
  access: ACCESS_PLACEMENT_BLUEPRINT,
  connectivity: CONNECTIVITY_PLACEMENT_BLUEPRINT,
  services: SERVICES_PLACEMENT_BLUEPRINT,
  security: SECURITY_PLACEMENT_BLUEPRINT,
  automation: AUTOMATION_PLACEMENT_BLUEPRINT,
}

export function getPlacementBlueprint(domainId) {
  return BY_DOMAIN[domainId] || null
}

export function placementDomainIds() {
  return Object.keys(BY_DOMAIN)
}

export function isPlacementDomain(domainId) {
  return Boolean(BY_DOMAIN[domainId])
}
