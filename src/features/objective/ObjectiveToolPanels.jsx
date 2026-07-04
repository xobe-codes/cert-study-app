import React from 'react'

export default function ObjectiveToolPanels({
  toolPanel,
  objective,
  SectionLabel,
  CLIDrillTab,
  SubnettingTab,
  VLSMTab,
  IPv6CalcTab,
  ACLCalcTab,
}) {
  if (toolPanel === 'CLI Drill') {
    return (
      <div role="region" aria-label="CLI Drill">
        <SectionLabel icon="💻" label="CLI DRILL" />
        <CLIDrillTab objective={objective} />
      </div>
    )
  }
  if (toolPanel === 'Subnetting') {
    return (
      <div role="region" aria-label="Subnetting">
        <SectionLabel icon="🧮" label="SUBNETTING PRACTICE" />
        <SubnettingTab />
      </div>
    )
  }
  if (toolPanel === 'VLSM') {
    return (
      <div role="region" aria-label="VLSM">
        <SectionLabel icon="🧮" label="VLSM PRACTICE" />
        <VLSMTab />
      </div>
    )
  }
  if (toolPanel === 'IPv6 Calc') {
    return (
      <div role="region" aria-label="IPv6 Calculator">
        <SectionLabel icon="🔢" label="IPv6 CALCULATOR" />
        <IPv6CalcTab />
      </div>
    )
  }
  if (toolPanel === 'ACL Calc') {
    return (
      <div role="region" aria-label="ACL Calculator">
        <SectionLabel icon="🔒" label="ACL WILDCARD CALCULATOR" />
        <ACLCalcTab />
      </div>
    )
  }
  return null
}
