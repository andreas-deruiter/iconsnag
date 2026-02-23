#!/usr/bin/env node

/**
 * Builds the search index for Material Design Icons (community).
 *
 * Fetches meta.json for metadata (name, aliases, tags).
 * SVGs are in svg/{name}.svg.
 *
 * Output: data/mdi-index.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { assignTags } from './tags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const REPO = 'Templarian/MaterialDesign'
const BRANCH = 'master'
const OUTPUT = path.join(__dirname, '..', 'data', 'mdi-index.json')

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
  console.log('Building Material Design Icons search index...\n')

  console.log('Fetching meta.json...')
  const data = await fetchJSON(
    `https://raw.githubusercontent.com/${REPO}/${BRANCH}/meta.json`
  )

  console.log(`Found ${data.length} entries.\n`)

  // Filter out deprecated icons
  const active = data.filter(e => !e.deprecated)
  console.log(`Active (non-deprecated): ${active.length}`)

  const icons = active.map(entry => {
    const icon = {
      id: entry.name,
      name: toDisplayName(entry.name),
      fileName: entry.name,
      group: entry.tags?.[0] || 'Miscellaneous',
      keywords: [
        ...entry.name.split('-').filter(w => w.length > 0),
        ...(entry.aliases || []).map(a => a.toLowerCase()),
        ...(entry.tags || []).map(t => t.toLowerCase()),
      ],
      styles: ['Default'],
      skinTones: false,
    }
    icon.tags = assignTags(icon)
    return icon
  })

  icons.sort((a, b) => a.name.localeCompare(b.name))

  const index = {
    source: 'mdi',
    version: '1.0',
    generatedAt: new Date().toISOString(),
    baseUrl: `https://raw.githubusercontent.com/${REPO}/${BRANCH}/svg`,
    total: icons.length,
    icons,
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, JSON.stringify(index))

  const sizeKB = (Buffer.byteLength(JSON.stringify(index)) / 1024).toFixed(1)
  console.log(`\nDone! Wrote ${icons.length} icons to ${OUTPUT} (${sizeKB} KB)`)
}

main().catch(err => {
  console.error('Failed:', err)
  process.exit(1)
})
