#!/usr/bin/env node

/**
 * Builds the search index for Lucide Icons.
 *
 * Uses the npm package metadata (info.json per icon via CDN) to get
 * tags and categories without hitting the GitHub API.
 *
 * Output: public/data/lucide-index.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { assignTags } from './tags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const REPO = 'lucide-icons/lucide'
const BRANCH = 'main'
const OUTPUT = path.join(__dirname, '..', 'public', 'data', 'lucide-index.json')
// Use the GitHub tree API to list all icons (single request)
const TREE_URL = `https://api.github.com/repos/${REPO}/git/trees/${BRANCH}:icons`
// Per-icon JSON metadata lives alongside SVGs in the repo
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/icons`

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
  console.log('Building Lucide Icons search index...\n')

  console.log('Fetching icon listing from GitHub tree...')
  const tree = await fetchJSON(TREE_URL)
  const svgFiles = tree.tree
    .filter(t => t.path.endsWith('.svg'))
    .map(t => t.path.replace('.svg', ''))
  console.log(`Found ${svgFiles.length} SVG icons.`)

  // Fetch metadata JSON files in batches
  console.log('Fetching per-icon metadata...')
  const batchSize = 50
  const icons = []

  for (let i = 0; i < svgFiles.length; i += batchSize) {
    const batch = svgFiles.slice(i, i + batchSize)
    const results = await Promise.allSettled(
      batch.map(async name => {
        try {
          const meta = await fetchJSON(`${RAW_BASE}/${name}.json`)
          return { name, meta }
        } catch {
          return { name, meta: null }
        }
      })
    )

    for (const result of results) {
      if (result.status !== 'fulfilled') continue
      const { name, meta } = result.value

      const keywords = [
        ...name.split('-').filter(w => w.length > 0),
        ...(meta?.tags || []),
      ]

      const icon = {
        id: name,
        name: toDisplayName(name),
        fileName: name,
        group: meta?.categories?.[0] || 'Uncategorized',
        keywords,
        styles: ['Outline'],
        skinTones: false,
        source: 'lucide',
      }
      icon.tags = assignTags(icon)
      icons.push(icon)
    }

    if ((i + batchSize) % 200 === 0 || i + batchSize >= svgFiles.length) {
      console.log(`  ${Math.min(i + batchSize, svgFiles.length)}/${svgFiles.length} processed`)
    }
  }

  icons.sort((a, b) => a.name.localeCompare(b.name))

  const index = {
    source: 'lucide',
    version: '1.0',
    generatedAt: new Date().toISOString(),
    baseUrl: `https://raw.githubusercontent.com/${REPO}/${BRANCH}/icons`,
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
