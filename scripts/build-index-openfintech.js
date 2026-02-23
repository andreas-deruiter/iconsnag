#!/usr/bin/env node

/**
 * Builds the search index for OpenFinTech icons.
 *
 * Fetches the file tree from the GitHub API.
 * Icons are in resources/{category}/{entity_id}/icon.svg and logo.svg.
 * Categories: payment_providers, payment_methods, payout_methods, vendors, currencies.
 *
 * Output: data/openfintech-index.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { assignTags } from './tags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const REPO = 'openfintechio/openfintech'
const BRANCH = 'master'
const OUTPUT = path.join(__dirname, '..', 'data', 'openfintech-index.json')

const API = 'https://api.github.com'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''

const headers = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'IconSnag-IndexBuilder',
}
if (GITHUB_TOKEN) {
  headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}: ${await res.text()}`)
  return res.json()
}

const CATEGORY_DISPLAY = {
  payment_providers: 'Payment Providers',
  payment_methods: 'Payment Methods',
  payout_methods: 'Payout Methods',
  vendors: 'Vendors',
  currencies: 'Currencies',
}

const CATEGORIES = Object.keys(CATEGORY_DISPLAY)

function toDisplayName(id) {
  return id
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

async function main() {
  console.log('Building OpenFinTech search index...\n')

  // Fetch the full recursive tree
  console.log('Fetching file tree (this may take a moment)...')
  const tree = await fetchJSON(`${API}/repos/${REPO}/git/trees/${BRANCH}?recursive=true`)

  if (tree.truncated) {
    console.warn('Warning: tree was truncated by GitHub API. Some icons may be missing.')
  }

  // Filter for SVG files under resources/{category}/{entity}/icon.svg or logo.svg
  // Only match standard filenames (icon.svg, logo.svg) — skip timestamped/alt variants
  const svgRegex = /^resources\/([\w]+)\/([\S]+)\/(icon|logo)\.svg$/
  const entityMap = {}

  let skippedEmpty = 0
  for (const entry of tree.tree) {
    if (entry.type !== 'blob') continue
    if (entry.size === 0) { skippedEmpty++; continue }
    const match = entry.path.match(svgRegex)
    if (!match) continue

    const [, category, entityId, fileType] = match
    if (!CATEGORIES.includes(category)) continue

    const key = `${category}/${entityId}`
    if (!entityMap[key]) {
      entityMap[key] = { category, entityId, hasIcon: false, hasLogo: false }
    }
    if (fileType === 'icon') entityMap[key].hasIcon = true
    if (fileType === 'logo') entityMap[key].hasLogo = true
  }
  if (skippedEmpty) console.log(`Skipped ${skippedEmpty} empty files.`)

  console.log(`Found ${Object.keys(entityMap).length} entities with SVGs.\n`)

  // Build index entries
  const icons = Object.values(entityMap).map(({ category, entityId, hasIcon, hasLogo }) => {
    const styles = []
    if (hasIcon) styles.push('Icon')
    if (hasLogo) styles.push('Logo')

    const icon = {
      id: `${category}/${entityId}`,
      name: toDisplayName(entityId),
      fileName: entityId,
      category,
      group: CATEGORY_DISPLAY[category],
      keywords: [
        ...entityId.replace(/[_-]/g, ' ').split(/\s+/).filter(w => w.length > 0),
        'payment',
        'fintech',
      ],
      styles,
      skinTones: false,
    }
    icon.tags = assignTags(icon)
    return icon
  })

  icons.sort((a, b) => a.name.localeCompare(b.name))

  // Log per-category counts
  for (const cat of CATEGORIES) {
    const count = icons.filter(i => i.category === cat).length
    if (count > 0) console.log(`  ${CATEGORY_DISPLAY[cat]}: ${count}`)
  }
  console.log()

  const index = {
    source: 'openfintech',
    version: '1.0',
    generatedAt: new Date().toISOString(),
    baseUrl: `https://raw.githubusercontent.com/${REPO}/${BRANCH}/resources`,
    total: icons.length,
    icons,
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, JSON.stringify(index))

  const sizeKB = (Buffer.byteLength(JSON.stringify(index)) / 1024).toFixed(1)
  console.log(`Done! Wrote ${icons.length} icons to ${OUTPUT} (${sizeKB} KB)`)
}

main().catch(err => {
  console.error('Failed:', err)
  process.exit(1)
})
