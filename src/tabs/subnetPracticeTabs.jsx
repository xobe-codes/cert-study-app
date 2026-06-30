import React, { useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import {
  generateSubnetProblem, generateVLSMProblem, maskFromCidr,
  expandIPv6, compressIPv6,
} from '../netUtils.js'

export function SubnetField({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 4 }}>{label}</div>
      <input style={{ ...styles.input, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
        value={value} onChange={onChange} placeholder={placeholder}
        autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="decimal" />
    </div>
  )
}

export function SubnettingTab() {
  const [problem, setProblem] = useState(() => generateSubnetProblem())
  const [answers, setAnswers] = useState({ network: '', broadcast: '', firstUsable: '', lastUsable: '', usableHosts: '' })
  const [checked, setChecked] = useState(false)
  const [drillMode, setDrillMode] = useState(false)

  function newProblem() {
    setProblem(generateSubnetProblem())
    setAnswers({ network: '', broadcast: '', firstUsable: '', lastUsable: '', usableHosts: '' })
    setChecked(false)
  }

  function field(key) {
    return { value: answers[key], onChange: e => setAnswers(a => ({ ...a, [key]: e.target.value })) }
  }

  function isCorrect(key, expected) {
    if (!checked) return null
    const got = (answers[key] || '').trim()
    return got === String(expected ?? '')
  }

  const ipBin = drillMode ? problem.ip.split('.').map(o => parseInt(o).toString(2).padStart(8, '0')).join('.') : null
  const maskBin = drillMode ? maskFromCidr(problem.cidr).map(o => o.toString(2).padStart(8, '0')).join('.') : null

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {[false, true].map(dm => (
          <button key={String(dm)} onClick={() => { setDrillMode(dm); newProblem() }}
            style={{ flex: 1, minHeight: 36, borderRadius: 10, border: `1px solid ${drillMode === dm ? COLORS.skyBorder : COLORS.border}`, background: drillMode === dm ? COLORS.skyDim : COLORS.surface, color: drillMode === dm ? COLORS.sky : COLORS.silverMid, fontSize: 'var(--ccna-type-xs)', cursor: 'pointer', fontFamily: 'inherit' }}>
            {dm ? '🔢 Binary Drill' : '🔣 Standard'}
          </button>
        ))}
      </div>

      <div style={styles.card}>
        <div style={styles.small}>Given:</div>
        <div style={{ fontSize: 'var(--ccna-type-lg)', fontWeight: 700, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', marginTop: 4, marginBottom: drillMode ? 4 : 12 }}>
          {problem.ip} /{problem.cidr}
        </div>
        {drillMode && (
          <div style={{ fontSize: 'var(--ccna-type-xs)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', color: COLORS.sky, marginBottom: 12, lineHeight: 1.8 }}>
            <div>IP:   {ipBin}</div>
            <div>Mask: {maskBin}</div>
            <div style={{ color: COLORS.silverMid, fontSize: 'var(--ccna-type-micro)', marginTop: 4 }}>AND the IP with the mask to find the network; OR with wildcard for broadcast</div>
          </div>
        )}
        <SubnetField label="Network address" placeholder="x.x.x.x" {...field('network')} />
        <SubnetField label="Broadcast address" placeholder="x.x.x.x" {...field('broadcast')} />
        <SubnetField label="First usable host" placeholder="x.x.x.x or n/a" {...field('firstUsable')} />
        <SubnetField label="Last usable host" placeholder="x.x.x.x or n/a" {...field('lastUsable')} />
        <SubnetField label="Number of usable hosts" placeholder="0" {...field('usableHosts')} />

        {checked && (
          <div style={{ marginTop: 4, marginBottom: 4 }}>
            {[
              ['network', problem.network],
              ['broadcast', problem.broadcast],
              ['firstUsable', problem.firstUsable ?? 'n/a'],
              ['lastUsable', problem.lastUsable ?? 'n/a'],
              ['usableHosts', problem.usableHosts],
            ].map(([key, expected]) => {
              const ok = isCorrect(key, expected)
              return (
                <div key={key} style={{ fontSize: 'var(--ccna-type-sm)', color: ok ? COLORS.mint : COLORS.rose, marginBottom: 2 }}>
                  {ok ? '✓' : '✗'} {key}: expected {String(expected)}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {checked && (
        <div style={{ ...styles.card, background: COLORS.skyDim, border: `1px solid ${COLORS.skyBorder}` }}>
          <div style={styles.h2}>Step-by-step solution</div>
          {drillMode && (
            <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 'var(--ccna-type-xs)', color: COLORS.sky, marginBottom: 10, lineHeight: 1.8 }}>
              <div>IP:        {ipBin}</div>
              <div>Mask:      {maskBin}</div>
              <div>Network:   {problem.network.split('.').map(o => parseInt(o).toString(2).padStart(8,'0')).join('.')} = {problem.network}</div>
              <div>Broadcast: {problem.broadcast.split('.').map(o => parseInt(o).toString(2).padStart(8,'0')).join('.')} = {problem.broadcast}</div>
            </div>
          )}
          <ol style={{ paddingLeft: 18, margin: 0, fontSize: 'var(--ccna-type-sm)', lineHeight: 1.7 }}>
            {problem.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {!checked && <button style={styles.primaryBtn} onClick={() => setChecked(true)}>Check answers</button>}
        <button style={checked ? styles.primaryBtn : styles.secondaryBtn} onClick={newProblem}>New problem</button>
      </div>
    </div>
  )
}

export function VLSMTab() {
  const [problem, setProblem] = useState(() => generateVLSMProblem())
  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState(false)

  function newProblem() {
    setProblem(generateVLSMProblem())
    setAnswers({})
    setChecked(false)
  }

  function setField(name, key, value) {
    setAnswers(a => ({ ...a, [`${name}_${key}`]: value }))
  }

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.small}>Base network: <strong style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', color: COLORS.silver }}>{problem.baseNetwork}</strong></div>
        <div style={{ ...styles.small, marginTop: 8, marginBottom: 4 }}>Allocate subnets in order, largest requirement first:</div>
        <ul style={{ paddingLeft: 18, margin: 0, fontSize: 'var(--ccna-type-sm)', lineHeight: 1.7 }}>
          {problem.requirements.map(r => (
            <li key={r.name}>{r.name}: {r.hostsNeeded} hosts needed</li>
          ))}
        </ul>
      </div>

      {problem.allocations.map((a, idx) => (
        <div key={a.name} style={styles.card}>
          <div style={{ ...styles.h2, fontSize: 'var(--ccna-type-md)' }}>{idx + 1}. {a.name} ({a.hostsNeeded} hosts needed)</div>
          <SubnetField label="Network address" placeholder="x.x.x.x" value={answers[`${a.name}_network`] || ''} onChange={e => setField(a.name, 'network', e.target.value)} />
          <SubnetField label="CIDR (/n)" placeholder="/n" value={answers[`${a.name}_cidr`] || ''} onChange={e => setField(a.name, 'cidr', e.target.value)} />
          <SubnetField label="Broadcast address" placeholder="x.x.x.x" value={answers[`${a.name}_broadcast`] || ''} onChange={e => setField(a.name, 'broadcast', e.target.value)} />
          {checked && (
            <div style={{ marginTop: 4 }}>
              {[
                ['network', a.network], ['cidr', `/${a.cidr}`], ['broadcast', a.broadcast],
              ].map(([key, expected]) => {
                const got = (answers[`${a.name}_${key}`] || '').trim()
                const ok = got === String(expected)
                return (
                  <div key={key} style={{ fontSize: 'var(--ccna-type-sm)', color: ok ? COLORS.mint : COLORS.rose, marginBottom: 2 }}>
                    {ok ? '✓' : '✗'} {key}: expected {expected}
                  </div>
                )
              })}
              <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginTop: 4 }}>
                Usable range: {a.firstUsable} - {a.lastUsable} ({a.usableHosts} usable hosts, block size {a.blockSize})
              </div>
            </div>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8 }}>
        {!checked && <button style={styles.primaryBtn} onClick={() => setChecked(true)}>Check answers</button>}
        <button style={checked ? styles.primaryBtn : styles.secondaryBtn} onClick={newProblem}>New problem</button>
      </div>
    </div>
  )
}

export function IPv6CalcTab() {
  const [input, setInput] = useState('')
  const [prefix, setPrefix] = useState('64')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function calculate() {
    setError('')
    try {
      const pfx = parseInt(prefix, 10)
      if (isNaN(pfx) || pfx < 0 || pfx > 128) throw new Error('Prefix length must be 0–128.')
      let addr = input.trim()
      if (!addr) throw new Error('Enter an IPv6 address.')
      if (!/^[0-9a-fA-F:]+$/.test(addr)) throw new Error('Invalid characters — use hex digits and colons.')
      const expanded = expandIPv6(addr)
      const groups = expanded.split(':')
      if (groups.length !== 8) throw new Error('Invalid IPv6 address (need 8 groups after expansion).')
      const full = BigInt('0x' + groups.map(g => g.padStart(4, '0')).join(''))
      const mask = pfx === 0 ? 0n : (((1n << BigInt(pfx)) - 1n) << BigInt(128 - pfx))
      const network = full & mask
      const lastAddr = pfx === 128 ? network : network | ((1n << BigInt(128 - pfx)) - 1n)
      function bigToIPv6(n) {
        const hex = n.toString(16).padStart(32, '0')
        return compressIPv6(hex.match(/.{4}/g).join(':'))
      }
      setResult({
        expanded: expanded.toLowerCase(),
        compressed: compressIPv6(expanded.toLowerCase()),
        prefixLength: pfx,
        networkPrefix: bigToIPv6(network) + '/' + pfx,
        firstHost: pfx < 128 ? bigToIPv6(network + 1n) : bigToIPv6(network),
        lastAddr: bigToIPv6(lastAddr),
        totalAddresses: pfx <= 64 ? '2^' + (128 - pfx) + ' (' + ((128 - pfx) >= 64 ? '≥18 quintillion' : String(2n ** BigInt(128 - pfx))) + ')' : String(2n ** BigInt(128 - pfx)),
      })
    } catch (e) { setError(e.message) }
  }

  return (
    <div>
      <div style={styles.card}>
        <div style={{ ...styles.small, fontWeight: 700, marginBottom: 10 }}>IPv6 Address / Prefix Calculator</div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 4 }}>IPv6 Address</div>
          <input style={{ ...styles.input, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
            value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. 2001:db8::1 or 2001:0db8::" autoCapitalize="none" autoCorrect="off" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 4 }}>Prefix Length</div>
          <input style={{ ...styles.input, width: 80 }} value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="64" inputMode="numeric" />
        </div>
        <button style={styles.primaryBtn} onClick={calculate}>Calculate</button>
      </div>
      {error && <div style={{ color: COLORS.rose, fontSize: 'var(--ccna-type-sm)', marginTop: 8 }}>{error}</div>}
      {result && (
        <div style={styles.card}>
          {[
            ['Expanded form', result.expanded],
            ['Compressed form', result.compressed],
            ['Network prefix', result.networkPrefix],
            ['First host address', result.firstHost],
            ['Last address in block', result.lastAddr],
            ['Total addresses', result.totalAddresses],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
              <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>{label}</span>
              <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 'var(--ccna-type-sm)', color: COLORS.sky }}>{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ACLWildcardTab() {
  const [mode, setMode] = useState('mask')
  const [mask, setMask] = useState('')
  const [address, setAddress] = useState('')
  const [wildcard, setWildcard] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function validateOctets(ip) {
    const parts = ip.split('.')
    if (parts.length !== 4) return false
    return parts.every(p => { const n = parseInt(p, 10); return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p })
  }

  function calculate() {
    setError(''); setResult(null)
    try {
      if (mode === 'mask') {
        if (!validateOctets(mask)) throw new Error('Enter a valid subnet mask (e.g. 255.255.255.0)')
        const maskOcts = mask.split('.').map(Number)
        const wildcardOcts = maskOcts.map(o => 255 - o)
        const cidr = maskOcts.reduce((s, o) => s + o.toString(2).split('').filter(b => b === '1').length, 0)
        setResult({
          subnetMask: mask,
          wildcardMask: wildcardOcts.join('.'),
          cidr: '/' + cidr,
          note: 'Wildcard = bitwise NOT of subnet mask',
        })
      } else {
        if (!validateOctets(address)) throw new Error('Enter a valid IP address.')
        if (!validateOctets(wildcard)) throw new Error('Enter a valid wildcard mask.')
        const addrOcts = address.split('.').map(Number)
        const wcOcts = wildcard.split('.').map(Number)
        const netOcts = addrOcts.map((o, i) => o & (255 - wcOcts[i]))
        const broadOcts = netOcts.map((o, i) => o | wcOcts[i])
        const subnetMask = wcOcts.map(o => 255 - o).join('.')
        const cidr = wcOcts.map(o => (255 - o).toString(2).split('1').length - 1).reduce((a, b) => a + b, 0)
        const hosts = wcOcts.reduce((prod, o) => prod * (o + 1), 1)
        setResult({
          networkAddress: netOcts.join('.'),
          broadcastAddress: broadOcts.join('.'),
          subnetMask,
          cidr: '/' + cidr,
          matchingHosts: hosts + ' IP address' + (hosts !== 1 ? 'es' : ''),
          aclStatement: `access-list 1 permit ${netOcts.join('.')} ${wildcard}`,
        })
      }
    } catch (e) { setError(e.message) }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[['mask', 'Mask → Wildcard'], ['range', 'Address + Wildcard → Range']].map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setResult(null); setError('') }}
            style={{ flex: 1, minHeight: 36, borderRadius: 10, border: `1px solid ${mode === m ? COLORS.skyBorder : COLORS.border}`, background: mode === m ? COLORS.skyDim : COLORS.surface, color: mode === m ? COLORS.sky : COLORS.silverMid, fontSize: 'var(--ccna-type-xs)', cursor: 'pointer', fontFamily: 'inherit' }}>
            {label}
          </button>
        ))}
      </div>
      <div style={styles.card}>
        {mode === 'mask' ? (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 4 }}>Subnet Mask</div>
            <input style={{ ...styles.input, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
              value={mask} onChange={e => setMask(e.target.value)} placeholder="255.255.255.0" inputMode="decimal" />
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 4 }}>IP Address</div>
              <input style={{ ...styles.input, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
                value={address} onChange={e => setAddress(e.target.value)} placeholder="192.168.1.0" inputMode="decimal" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 4 }}>Wildcard Mask</div>
              <input style={{ ...styles.input, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
                value={wildcard} onChange={e => setWildcard(e.target.value)} placeholder="0.0.0.255" inputMode="decimal" />
            </div>
          </>
        )}
        <button style={styles.primaryBtn} onClick={calculate}>Calculate</button>
      </div>
      {error && <div style={{ color: COLORS.rose, fontSize: 'var(--ccna-type-sm)', marginTop: 8 }}>{error}</div>}
      {result && (
        <div style={styles.card}>
          {Object.entries(result).map(([key, val]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
              <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 'var(--ccna-type-sm)', color: COLORS.sky }}>{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
