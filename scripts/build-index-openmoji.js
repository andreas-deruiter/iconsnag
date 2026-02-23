#!/usr/bin/env node

/**
 * Builds the search index for OpenMoji emoji.
 *
 * Fetches data/openmoji.json for metadata.
 * SVGs are in color/svg/{HEXCODE}.svg and black/svg/{HEXCODE}.svg.
 *
 * Output: data/openmoji-index.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { assignTags } from './tags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const REPO = 'hfg-gmuend/openmoji'
const BRANCH = 'master'
const OUTPUT = path.join(__dirname, '..', 'data', 'openmoji-index.json')

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

// Map openmoji group slugs to display names
function formatGroup(group) {
  return group
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function generateKeywords(annotation, tags, openmojiTags) {
  const words = new Set()
  for (const w of annotation.toLowerCase().split(/[\s:,&-]+/)) {
    if (w.length > 1) words.add(w)
  }
  if (tags) {
    for (const w of tags.split(',').map(t => t.trim().toLowerCase())) {
      if (w.length > 1) words.add(w)
    }
  }
  if (openmojiTags) {
    for (const w of openmojiTags.split(',').map(t => t.trim().toLowerCase())) {
      if (w.length > 1) words.add(w)
    }
  }
  return Array.from(words)
}

async function main() {
  console.log('Building OpenMoji search index...\n')

  console.log('Fetching openmoji.json...')
  const data = await fetchJSON(
    `https://raw.githubusercontent.com/${REPO}/${BRANCH}/data/openmoji.json`
  )

  console.log(`Found ${data.length} entries.\n`)

  // Filter to only entries with a hexcode (skip empty/invalid)
  const valid = data.filter(e => e.hexcode && e.annotation)

  const icons = valid.map(entry => {
    const hexcode = entry.hexcode
    const glyph = entry.emoji || ''

    const icon = {
      id: `openmoji-${hexcode}`,
      name: entry.annotation.charAt(0).toUpperCase() + entry.annotation.slice(1),
      fileName: hexcode,
      glyph,
      group: formatGroup(entry.group || 'extras'),
      keywords: generateKeywords(entry.annotation, entry.tags, entry.openmoji_tags),
      unicode: hexcode.toLowerCase().replace(/-/g, ' '),
      styles: ['Color', 'Black'],
      skinTones: false,
    }
    icon.tags = assignTags(icon)
    return icon
  })

  icons.sort((a, b) => a.name.localeCompare(b.name))

  const index = {
    source: 'openmoji',
    version: '1.0',
    generatedAt: new Date().toISOString(),
    baseUrl: `https://raw.githubusercontent.com/${REPO}/${BRANCH}`,
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
