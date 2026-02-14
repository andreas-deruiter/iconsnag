#!/usr/bin/env node

/**
 * Builds the search index for Microsoft Fluent UI System Icons.
 *
 * Uses the font JSON manifest to discover all icons, then deduplicates
 * by icon name (keeping the best available size, preferring 24px).
 *
 * Output: public/data/fluent-icons-index.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { assignTags } from './tags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const REPO = 'microsoft/fluentui-system-icons'
const BRANCH = 'main'
const OUTPUT = path.join(__dirname, '..', 'public', 'data', 'fluent-icons-index.json')
const REGULAR_JSON_URL = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/fonts/FluentSystemIcons-Regular.json`
const FILLED_JSON_URL = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/fonts/FluentSystemIcons-Filled.json`

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

function toDisplayName(snakeName) {
  return snakeName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function toFolderName(snakeName) {
  // Folder names are Title Case with spaces: "arrow_left" -> "Arrow Left"
  return snakeName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

async function main() {
  console.log('Building Fluent UI System Icons search index...\n')

  console.log('Fetching font manifests...')
  const [regularData, filledData] = await Promise.all([
    fetchJSON(REGULAR_JSON_URL),
    fetchJSON(FILLED_JSON_URL),
  ])

  // Parse manifest keys like "ic_fluent_arrow_left_24_regular"
  // Extract: name, size, style
  function parseKey(key) {
    const match = key.match(/^ic_fluent_(.+)_(\d+)_(regular|filled)$/)
    if (!match) return null
    return { name: match[1], size: parseInt(match[2]), style: match[3] }
  }

  // Collect all icon entries grouped by name
  const iconMap = {}

  for (const key of Object.keys(regularData)) {
    const parsed = parseKey(key)
    if (!parsed) continue
    if (!iconMap[parsed.name]) {
      iconMap[parsed.name] = { sizes: new Set(), styles: new Set() }
    }
    iconMap[parsed.name].sizes.add(parsed.size)
    iconMap[parsed.name].styles.add('Regular')
  }

  for (const key of Object.keys(filledData)) {
    const parsed = parseKey(key)
    if (!parsed) continue
    if (!iconMap[parsed.name]) {
      iconMap[parsed.name] = { sizes: new Set(), styles: new Set() }
    }
    iconMap[parsed.name].sizes.add(parsed.size)
    iconMap[parsed.name].styles.add('Filled')
  }

  const names = Object.keys(iconMap)
  console.log(`Found ${names.length} unique icons.\n`)

  // Prefer 24px, then 20px, then largest available
  function bestSize(sizes) {
    if (sizes.has(24)) return 24
    if (sizes.has(20)) return 20
    return Math.max(...sizes)
  }

  const icons = names.map(name => {
    const entry = iconMap[name]
    const size = bestSize(entry.sizes)
    const styles = [...entry.styles].sort()

    const icon = {
      id: name,
      name: toDisplayName(name),
      fileName: name,
      folderName: toFolderName(name),
      preferredSize: size,
      group: 'Fluent Icons',
      keywords: name.split('_').filter(w => w.length > 0),
      styles,
      skinTones: false,
      source: 'fluent-icons',
    }
    icon.tags = assignTags(icon)
    return icon
  })

  icons.sort((a, b) => a.name.localeCompare(b.name))

  const index = {
    source: 'fluent-icons',
    version: '1.0',
    generatedAt: new Date().toISOString(),
    baseUrl: `https://raw.githubusercontent.com/${REPO}/${BRANCH}/assets`,
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
