#!/usr/bin/env node

/**
 * Builds the search index for Simple Icons (brand/logo icons).
 *
 * Fetches data/simple-icons.json from the repo for metadata.
 * SVGs are in icons/{slug}.svg.
 *
 * Output: data/simple-icons-index.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { assignTags } from './tags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const REPO = 'simple-icons/simple-icons'
const BRANCH = 'develop'
const OUTPUT = path.join(__dirname, '..', 'data', 'simple-icons-index.json')

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/\+/g, 'plus')
    .replace(/\./g, 'dot')
    .replace(/&/g, 'and')
    .replace(/đ/g, 'd')
    .replace(/ħ/g, 'h')
    .replace(/ı/g, 'i')
    .replace(/ĸ/g, 'k')
    .replace(/ŀ/g, 'l')
    .replace(/ł/g, 'l')
    .replace(/ß/g, 'ss')
    .replace(/ŧ/g, 't')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

async function main() {
  console.log('Building Simple Icons search index...\n')

  console.log('Fetching simple-icons.json...')
  const data = await fetchJSON(
    `https://raw.githubusercontent.com/${REPO}/${BRANCH}/data/simple-icons.json`
  )

  const entries = Array.isArray(data) ? data : data.icons || []
  console.log(`Found ${entries.length} icons.\n`)

  const icons = entries.map(entry => {
    const slug = entry.slug || toSlug(entry.title)
    const aliases = entry.aliases?.aka || []

    const icon = {
      id: slug,
      name: entry.title,
      fileName: slug,
      group: 'Brand',
      keywords: [
        ...entry.title.toLowerCase().split(/[\s-]+/).filter(w => w.length > 0),
        ...aliases.map(a => a.toLowerCase()),
        'brand', 'logo',
      ],
      brandColor: entry.hex ? `#${entry.hex}` : null,
      styles: ['Default'],
      skinTones: false,
    }
    icon.tags = assignTags(icon)
    return icon
  })

  icons.sort((a, b) => a.name.localeCompare(b.name))

  const index = {
    source: 'simple-icons',
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
