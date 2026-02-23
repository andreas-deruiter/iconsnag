#!/usr/bin/env node

/**
 * Builds the search index for GitHub Octicons.
 *
 * Fetches the file tree from the GitHub API and keywords.json for metadata.
 * Icons are in /icons/ with naming pattern: {name}-{size}.svg
 * Fill variants: {name}-fill-{size}.svg
 *
 * Output: data/octicons-index.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { assignTags } from './tags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const REPO = 'primer/octicons'
const BRANCH = 'main'
const OUTPUT = path.join(__dirname, '..', 'data', 'octicons-index.json')

const API = 'https://api.github.com'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''

const headers = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'IconSnag-IndexBuilder',
}
if (GITHUB_TOKEN) {
  headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}: ${await res.text()}`)
  return res.json()
}

function toDisplayName(name) {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

async function main() {
  console.log('Building GitHub Octicons search index...\n')

  // Fetch the file tree for icons/
  console.log('Fetching file tree...')
  const rootTree = await fetchJSON(`${API}/repos/${REPO}/git/trees/${BRANCH}?recursive=false`)
  const iconsEntry = rootTree.tree.find(e => e.path === 'icons' && e.type === 'tree')
  if (!iconsEntry) throw new Error('Could not find icons directory')

  const iconsTree = await fetchJSON(iconsEntry.url)
  const svgFiles = iconsTree.tree
    .filter(e => e.type === 'blob' && e.path.endsWith('.svg'))
    .map(e => e.path)

  console.log(`Found ${svgFiles.length} SVG files.`)

  // Fetch keywords.json for search metadata
  console.log('Fetching keywords.json...')
  const keywords = await fetchJSON(
    `https://raw.githubusercontent.com/${REPO}/${BRANCH}/keywords.json`
  )

  // Parse filenames to build icon map
  // Pattern: {name}-{size}.svg or {name}-fill-{size}.svg
  const iconMap = {}

  for (const file of svgFiles) {
    const basename = file.replace('.svg', '')

    // Check if it's a fill variant: {name}-fill-{size}
    const fillMatch = basename.match(/^(.+)-fill-(\d+)$/)
    if (fillMatch) {
      const [, name, size] = fillMatch
      if (!iconMap[name]) iconMap[name] = { sizes: [], hasFill: false, fillSizes: [] }
      iconMap[name].hasFill = true
      iconMap[name].fillSizes.push(parseInt(size))
      continue
    }

    // Regular variant: {name}-{size}
    const match = basename.match(/^(.+)-(\d+)$/)
    if (match) {
      const [, name, size] = match
      if (!iconMap[name]) iconMap[name] = { sizes: [], hasFill: false, fillSizes: [] }
      iconMap[name].sizes.push(parseInt(size))
    }
  }

  console.log(`Found ${Object.keys(iconMap).length} unique icons.\n`)

  // Build index entries — skip fill-only icons (no outline variant)
  const icons = Object.entries(iconMap)
    .filter(([, data]) => data.sizes.length > 0)
    .map(([name, data]) => {
    const styles = ['Outline']
    if (data.hasFill) styles.push('Fill')

    // Prefer 24px, fall back to 16px, then largest available
    const preferredSize = data.sizes.includes(24) ? 24
      : data.sizes.includes(16) ? 16
      : Math.max(...data.sizes)

    const kw = keywords[name] || []

    const icon = {
      id: name,
      name: toDisplayName(name),
      fileName: name,
      group: 'UI',
      keywords: [...name.split('-').filter(w => w.length > 0), ...kw],
      styles,
      preferredSize,
      skinTones: false,
    }
    icon.tags = assignTags(icon)
    return icon
  })

  icons.sort((a, b) => a.name.localeCompare(b.name))

  const index = {
    source: 'octicons',
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
