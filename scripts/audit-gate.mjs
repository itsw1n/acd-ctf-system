// Audit gate: fail on high/critical advisories EXCEPT allowlisted GHSAs.
// Usage: node scripts/audit-gate.mjs
// Test override: AUDIT_ALLOWLIST_PATH=/tmp/empty-allowlist.json
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const allowlistPath = process.env.AUDIT_ALLOWLIST_PATH ?? join(root, 'scripts/audit-allowlist.json')

let raw
try {
  raw = execFileSync('npm', ['audit', '--json'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
} catch (error) {
  // npm audit exits non-zero when vulnerabilities exist; output still parses.
  raw = error.stdout ?? ''
  if (!raw) {
    console.error('audit-gate: npm audit produced no output — failing closed.')
    console.error(String(error.stderr ?? error.message).slice(0, 500))
    process.exit(1)
  }
}

const allowlist = JSON.parse(readFileSync(allowlistPath, 'utf8'))
const allowed = new Set(allowlist.allow.map((entry) => entry.ghsa))

let report
try {
  report = JSON.parse(raw)
} catch {
  console.error('audit-gate: could not parse npm audit output — failing closed.')
  process.exit(1)
}

// Group affected packages by advisory. Packages flagged only as dependents
// (no advisory of their own) are covered when every advisory in the report
// is allowlisted.
const affected = new Map()
for (const [name, info] of Object.entries(report.vulnerabilities ?? {})) {
  if (info.severity !== 'high' && info.severity !== 'critical') continue
  for (const entry of info.via ?? []) {
    if (typeof entry !== 'object' || !entry.url) continue
    const id = entry.url.split('/').pop()
    if (!affected.has(id)) affected.set(id, [])
    affected.get(id).push(`${name} [${info.severity}]`)
  }
}

const unlisted = [...affected.keys()].filter((id) => !allowed.has(id))
if (unlisted.length > 0) {
  console.error('audit-gate: BLOCKED by non-allowlisted advisories:')
  for (const id of unlisted) console.error(`  - ${id}: ${(affected.get(id) ?? []).join(', ')}`)
  process.exit(1)
}

console.log(
  `audit-gate: pass (allowlisted: ${[...allowed].join(', ') || 'none'}; review by ${allowlist.reviewBy ?? 'unspecified'})`
)
