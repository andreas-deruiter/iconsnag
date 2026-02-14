#!/usr/bin/env node

/**
 * Builds the search index for Tabler Icons.
 *
 * Uses the published icons.json from the @tabler/icons npm package (via CDN)
 * instead of crawling the GitHub repo. This avoids rate limits and is much faster.
 *
 * Output: public/data/tabler-icons-index.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { assignTags } from './tags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const REPO = 'tabler/tabler-icons'
const BRANCH = 'main'
const OUTPUT = path.join(__dirname, '..', 'public', 'data', 'tabler-icons-index.json')
const ICONS_JSON_URL = 'https://cdn.jsdelivr.net/npm/@tabler/icons@latest/icons.json'

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

function toDisplayName(name) {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

async function main() {
  console.log('Building Tabler Icons search index...\n')

  console.log('Fetching icons.json from CDN...')
  const iconsData = await fetchJSON(ICONS_JSON_URL)
  const iconNames = Object.keys(iconsData)
  console.log(`Found ${iconNames.length} icons.\n`)

  const icons = iconNames.map(name => {
    const data = iconsData[name]
    const styles = []
    if (data.styles?.outline) styles.push('Outline')
    if (data.styles?.filled) styles.push('Filled')

    // Tags can contain mixed types (strings and numbers)
    const tags = (data.tags || []).map(t => String(t).toLowerCase())

    const icon = {
      id: name,
      name: toDisplayName(name),
      fileName: name,
      group: data.category || 'Uncategorized',
      keywords: [...name.split('-').filter(w => w.length > 0), ...tags],
      styles: styles.length > 0 ? styles : ['Outline'],
      skinTones: false,
      source: 'tabler-icons',
    }
    icon.tags = assignTags(icon)
    return icon
  })

  icons.sort((a, b) => a.name.localeCompare(b.name))

  const index = {
    source: 'tabler-icons',
    version: '1.0',
    generatedAt: new Date().toISOString(),
    baseUrl: `https://raw.githubusercontent.com/${REPO}/${BRANCH}/icons`,
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
