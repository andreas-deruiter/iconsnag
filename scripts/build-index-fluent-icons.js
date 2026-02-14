#!/usr/bin/env node

/**
 * Builds the search index for Microsoft Fluent UI System Icons.
 *
 * Uses the font JSON manifest to discover all icons, then fetches the
 * actual directory listing from the repo to get correct folder names
 * (since folder casing doesn't always match simple title-case rules).
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
const ASSETS_TREE_URL = `https://api.github.com/repos/${REPO}/git/trees/${BRANCH}:assets`

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

async function main() {
  console.log('Building Fluent UI System Icons search index...\n')

  console.log('Fetching font manifests and directory listing...')
  const [regularData, filledData, treeData] = await Promise.all([
    fetchJSON(REGULAR_JSON_URL),
    fetchJSON(FILLED_JSON_URL),
    fetchJSON(ASSETS_TREE_URL),
  ])

  // Build a map from snake_case name to actual folder name
  // e.g. "wifi_1" -> "WiFi 1", "arrow_left" -> "Arrow Left"
  const folderMap = {}
  for (const entry of treeData.tree) {
    if (entry.type !== 'tree') continue
    const snakeName = entry.path.toLowerCase().replace(/\s+/g, '_')
    folderMap[snakeName] = entry.path
  }
  console.log(`Found ${Object.keys(folderMap).length} asset folders.`)

  // Parse manifest keys like "ic_fluent_arrow_left_24_regular"
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
  console.log(`Found ${names.length} unique icons in manifests.`)

  // Prefer 24px, then 20px, then largest available
  function bestSize(sizes) {
    if (sizes.has(24)) return 24
    if (sizes.has(20)) return 20
    return Math.max(...sizes)
  }

  const icons = []
  let skipped = 0

  for (const name of names) {
    const realFolder = folderMap[name]
    if (!realFolder) {
      skipped++
      continue
    }

    const entry = iconMap[name]
    const size = bestSize(entry.sizes)
    const styles = [...entry.styles].sort()

    const icon = {
      id: name,
      name: toDisplayName(name),
      fileName: name,
      folderName: realFolder,
      preferredSize: size,
      group: 'Fluent Icons',
      keywords: name.split('_').filter(w => w.length > 0),
      styles,
      skinTones: false,
      source: 'fluent-icons',
    }
    icon.tags = assignTags(icon)
    icons.push(icon)
  }

  console.log(`Skipped ${skipped} icons without matching folders.\n`)

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
