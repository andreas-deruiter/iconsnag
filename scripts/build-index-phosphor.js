#!/usr/bin/env node

/**
 * Builds the search index for Phosphor Icons.
 *
 * Uses the TypeScript manifest from the core repo to get icon names,
 * tags, and categories. Parses it as text since it's TS not JSON.
 *
 * Output: public/data/phosphor-index.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { assignTags } from './tags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const REPO = 'phosphor-icons/core'
const BRANCH = 'main'
const OUTPUT = path.join(__dirname, '..', 'public', 'data', 'phosphor-index.json')
const MANIFEST_URL = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/src/icons.ts`

async function fetchText(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

function toDisplayName(name) {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function parseManifest(tsText) {
  // The TS file exports an array of objects with name, pascal_name, categories, tags, etc.
  // We parse each icon object using regex since it's not valid JSON.
  const icons = []
  // Match each { ... } block in the array
  const blockRegex = /\{\s*name:\s*"([^"]+)"[^}]*?categories:\s*\[([^\]]*)\][^}]*?tags:\s*\[([^\]]*)\]/gs
  let match
  while ((match = blockRegex.exec(tsText)) !== null) {
    const name = match[1]
    const categories = match[2].match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) || []
    const tags = match[3].match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) || []
    icons.push({ name, categories, tags })
  }
  return icons
}

async function main() {
  console.log('Building Phosphor Icons search index...\n')

  console.log('Fetching icons.ts manifest...')
  const tsText = await fetchText(MANIFEST_URL)

  const parsed = parseManifest(tsText)
  console.log(`Parsed ${parsed.length} icons from manifest.\n`)

  const STYLES = ['Regular', 'Bold', 'Thin', 'Light', 'Fill', 'Duotone']

  const icons = parsed.map(entry => {
    const keywords = [
      ...entry.name.split('-').filter(w => w.length > 0),
      ...entry.tags,
    ]

    const icon = {
      id: entry.name,
      name: toDisplayName(entry.name),
      fileName: entry.name,
      group: entry.categories[0] || 'Uncategorized',
      keywords,
      styles: STYLES,
      skinTones: false,
      source: 'phosphor',
    }
    icon.tags = assignTags(icon)
    return icon
  })

  icons.sort((a, b) => a.name.localeCompare(b.name))

  const index = {
    source: 'phosphor',
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
