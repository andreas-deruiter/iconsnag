#!/usr/bin/env node

/**
 * Builds the search index for Bootstrap Icons.
 *
 * Uses the GitHub tree API to list all SVGs, then fetches the
 * tags.json from the docs data to get keywords.
 *
 * Output: public/data/bootstrap-icons-index.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { assignTags } from './tags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const REPO = 'twbs/icons'
const BRANCH = 'main'
const OUTPUT = path.join(__dirname, '..', 'public', 'data', 'bootstrap-icons-index.json')
const TREE_URL = `https://api.github.com/repos/${REPO}/git/trees/${BRANCH}:icons`
// Bootstrap has a tags.json in the docs source
const TAGS_URL = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/docs/content/icons`

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

async function fetchText(url) {
  const res = await fetch(url)
  if (!res.ok) return null
  return res.text()
}

function toDisplayName(name) {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

async function main() {
  console.log('Building Bootstrap Icons search index...\n')

  console.log('Fetching icon listing from GitHub tree...')
  const tree = await fetchJSON(TREE_URL)
  const svgFiles = tree.tree
    .filter(t => t.path.endsWith('.svg'))
    .map(t => t.path.replace('.svg', ''))
  console.log(`Found ${svgFiles.length} SVG icons.`)

  // Parse icon metadata from markdown frontmatter in batches
  // Each icon has a .md file in docs/content/icons/ with YAML frontmatter
  console.log('Fetching icon metadata from docs...')

  const iconMeta = {}
  const batchSize = 50

  for (let i = 0; i < svgFiles.length; i += batchSize) {
    const batch = svgFiles.slice(i, i + batchSize)
    const results = await Promise.allSettled(
      batch.map(async name => {
        const md = await fetchText(`${TAGS_URL}/${name}.md`)
        if (!md) return { name, tags: [], categories: [] }

        // Parse YAML frontmatter
        const fmMatch = md.match(/^---\n([\s\S]*?)\n---/)
        if (!fmMatch) return { name, tags: [], categories: [] }

        const fm = fmMatch[1]
        const tagsMatch = fm.match(/tags:\s*\n((?:\s+-\s+.+\n?)*)/)
        const catMatch = fm.match(/categories:\s*\n((?:\s+-\s+.+\n?)*)/)

        const tags = tagsMatch
          ? tagsMatch[1].match(/-\s+(.+)/g)?.map(s => s.replace(/-\s+/, '').trim()) || []
          : []
        const categories = catMatch
          ? catMatch[1].match(/-\s+(.+)/g)?.map(s => s.replace(/-\s+/, '').trim()) || []
          : []

        return { name, tags, categories }
      })
    )

    for (const result of results) {
      if (result.status === 'fulfilled') {
        iconMeta[result.value.name] = result.value
      }
    }

    if ((i + batchSize) % 200 === 0 || i + batchSize >= svgFiles.length) {
      console.log(`  ${Math.min(i + batchSize, svgFiles.length)}/${svgFiles.length} processed`)
    }
  }

  // Group icons: base name and -fill variant
  const iconGroups = {}
  for (const name of svgFiles) {
    const baseName = name.replace(/-fill$/, '')
    if (!iconGroups[baseName]) {
      iconGroups[baseName] = { styles: [] }
    }
    if (name.endsWith('-fill')) {
      iconGroups[baseName].styles.push('Fill')
      iconGroups[baseName].fillName = name
    } else {
      iconGroups[baseName].styles.unshift('Outline')
      iconGroups[baseName].outlineName = name
    }
  }

  const icons = Object.entries(iconGroups).map(([baseName, group]) => {
    const meta = iconMeta[baseName] || iconMeta[group.fillName] || {}
    const keywords = [
      ...baseName.split('-').filter(w => w.length > 0),
      ...(meta.tags || []),
    ]

    const icon = {
      id: baseName,
      name: toDisplayName(baseName),
      fileName: baseName,
      group: meta.categories?.[0] || 'Uncategorized',
      keywords,
      styles: group.styles,
      skinTones: false,
      source: 'bootstrap-icons',
    }
    icon.tags = assignTags(icon)
    return icon
  })

  icons.sort((a, b) => a.name.localeCompare(b.name))

  const index = {
    source: 'bootstrap-icons',
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
