#!/usr/bin/env node

/**
 * Builds the search index for Google Material Symbols.
 *
 * Uses the codepoints file (no API calls to GitHub API) to discover all icons.
 *
 * Output: public/data/material-symbols-index.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { assignTags } from './tags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const REPO = 'google/material-design-icons'
const BRANCH = 'master'
const OUTPUT = path.join(__dirname, '..', 'public', 'data', 'material-symbols-index.json')
const CODEPOINTS_URL = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/variablefont/MaterialSymbolsOutlined%5BFILL%2CGRAD%2Copsz%2Cwght%5D.codepoints`
const TREE_API_URL = `https://api.github.com/repos/${REPO}/git/trees/${BRANCH}:symbols/web`

async function fetchText(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

function toDisplayName(iconName) {
  return iconName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function toKeywords(iconName) {
  return iconName.split('_').filter(w => w.length > 0)
}

async function main() {
  console.log('Building Material Symbols search index...\n')

  console.log('Fetching codepoints file...')
  const text = await fetchText(CODEPOINTS_URL)
  const lines = text.trim().split('\n').filter(l => l.trim())
  console.log(`Codepoints file has ${lines.length} entries.`)

  console.log('Fetching actual directory listing from repo...')
  const treeData = await fetchJSON(TREE_API_URL)
  const existingDirs = new Set(
    treeData.tree.filter(t => t.type === 'tree').map(t => t.path)
  )
  console.log(`Repo has ${existingDirs.size} icon directories.\n`)

  const icons = []
  let skipped = 0
  for (const line of lines) {
    const [name, codepoint] = line.trim().split(/\s+/)
    if (!existingDirs.has(name)) {
      skipped++
      continue
    }
    const icon = {
      id: name,
      name: toDisplayName(name),
      fileName: name,
      group: 'Material Symbols',
      keywords: toKeywords(name),
      unicode: codepoint,
      styles: ['Outlined', 'Rounded', 'Sharp'],
      skinTones: false,
      source: 'material-symbols',
    }
    icon.tags = assignTags(icon)
    icons.push(icon)
  }
  console.log(`Skipped ${skipped} icons not in repo.\n`)

  icons.sort((a, b) => a.name.localeCompare(b.name))

  const index = {
    source: 'material-symbols',
    version: '1.0',
    generatedAt: new Date().toISOString(),
    baseUrl: `https://raw.githubusercontent.com/${REPO}/${BRANCH}/symbols/web`,
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
