#!/usr/bin/env node

/**
 * Builds the search index for Devicon (developer/technology brand icons).
 *
 * Fetches devicon.json from the repo root for metadata.
 * SVGs are in icons/{name}/{name}-{style}.svg.
 *
 * Output: data/devicon-index.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { assignTags } from './tags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const REPO = 'devicons/devicon'
const BRANCH = 'master'
const OUTPUT = path.join(__dirname, '..', 'data', 'devicon-index.json')

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

const STYLE_DISPLAY = {
  'original': 'Original',
  'original-wordmark': 'Original Wordmark',
  'plain': 'Plain',
  'plain-wordmark': 'Plain Wordmark',
  'line': 'Line',
  'line-wordmark': 'Line Wordmark',
}

async function main() {
  console.log('Building Devicon search index...\n')

  console.log('Fetching devicon.json...')
  const data = await fetchJSON(
    `https://raw.githubusercontent.com/${REPO}/${BRANCH}/devicon.json`
  )

  console.log(`Found ${data.length} icons.\n`)

  const icons = data.map(entry => {
    const styles = (entry.versions?.svg || [])
      .map(s => STYLE_DISPLAY[s] || s)

    const icon = {
      id: entry.name,
      name: toDisplayName(entry.name),
      fileName: entry.name,
      group: entry.tags?.[0] || 'Technology',
      keywords: [
        ...entry.name.split('-').filter(w => w.length > 0),
        ...(entry.altnames || []).map(a => a.toLowerCase()),
        ...(entry.tags || []),
        'developer', 'technology',
      ],
      styles: styles.length > 0 ? styles : ['Original'],
      skinTones: false,
    }
    icon.tags = assignTags(icon)
    return icon
  })

  icons.sort((a, b) => a.name.localeCompare(b.name))

  const index = {
    source: 'devicon',
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
