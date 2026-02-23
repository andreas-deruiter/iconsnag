#!/usr/bin/env node

/**
 * Builds the search index for Remix Icon.
 *
 * Fetches tags.json for metadata (categories and search tags).
 * SVGs are in icons/{Category}/{name}-{fill|line}.svg.
 *
 * Output: data/remixicon-index.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { assignTags } from './tags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const REPO = 'Remix-Design/RemixIcon'
const BRANCH = 'master'
const OUTPUT = path.join(__dirname, '..', 'data', 'remixicon-index.json')

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
  console.log('Building Remix Icon search index...\n')

  console.log('Fetching tags.json...')
  const tagsData = await fetchJSON(
    `https://raw.githubusercontent.com/${REPO}/${BRANCH}/tags.json`
  )

  const icons = []

  for (const [category, entries] of Object.entries(tagsData)) {
    if (category.startsWith('_')) continue // skip metadata fields
    for (const [iconName, tagString] of Object.entries(entries)) {
      const tags = tagString
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0 && !/[\u4e00-\u9fff]/.test(t)) // skip Chinese tags

      const icon = {
        id: iconName,
        name: toDisplayName(iconName),
        fileName: iconName,
        category,
        group: category,
        keywords: [
          ...iconName.split('-').filter(w => w.length > 0),
          ...tags,
        ],
        styles: ['Line', 'Fill'],
        skinTones: false,
      }
      icon.tags = assignTags(icon)
      icons.push(icon)
    }
  }

  icons.sort((a, b) => a.name.localeCompare(b.name))

  // Log per-category counts
  const cats = {}
  for (const icon of icons) {
    cats[icon.category] = (cats[icon.category] || 0) + 1
  }
  for (const [cat, count] of Object.entries(cats).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`)
  }
  console.log()

  const index = {
    source: 'remixicon',
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
