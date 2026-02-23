#!/usr/bin/env node

/**
 * Builds the search index for Twemoji (jdecked community fork).
 *
 * Uses the GitHub tree API for SVG file listing and
 * Unicode emoji-test.txt for name/group metadata (same approach as noto-emoji).
 * SVGs are in assets/svg/{codepoint}.svg.
 *
 * Output: data/twemoji-index.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { assignTags } from './tags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const REPO = 'jdecked/twemoji'
const BRANCH = 'main'
const OUTPUT = path.join(__dirname, '..', 'data', 'twemoji-index.json')

const API = 'https://api.github.com'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''
const EMOJI_TEST_URL = 'https://unicode.org/Public/emoji/latest/emoji-test.txt'

const headers = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'IconSnag-IndexBuilder',
}
if (GITHUB_TOKEN) {
  headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

async function fetchText(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

async function buildUnicodeMap() {
  console.log('Fetching Unicode emoji-test.txt...')
  const text = await fetchText(EMOJI_TEST_URL)
  const map = new Map()
  let currentGroup = ''

  for (const line of text.split('\n')) {
    if (line.startsWith('# group:')) {
      currentGroup = line.replace('# group:', '').trim()
      continue
    }
    if (line.startsWith('#') || !line.trim()) continue

    const match = line.match(/^([0-9A-F ]+?)\s*;\s*\S+\s*#\s*(\S+)\s*E[\d.]+\s+(.+)$/)
    if (!match) continue

    // Twemoji uses lowercase hex with hyphens
    const codepoints = match[1].trim().toLowerCase().replace(/\s+/g, '-')
    const glyph = match[2]
    const name = match[3].trim()

    if (!map.has(codepoints)) {
      map.set(codepoints, { name, glyph, group: currentGroup })
    }
  }

  console.log(`Loaded ${map.size} emoji definitions.`)
  return map
}

function generateKeywords(name) {
  return name.toLowerCase().split(/[\s:,&-]+/).filter(w => w.length > 1)
}

async function main() {
  console.log('Building Twemoji search index...\n')

  // Fetch tree and Unicode data in parallel
  const [tree, unicodeMap] = await Promise.all([
    fetchJSON(`${API}/repos/${REPO}/git/trees/${BRANCH}?recursive=true`),
    buildUnicodeMap(),
  ])

  const svgFiles = tree.tree
    .filter(e => e.type === 'blob' && e.path.startsWith('assets/svg/') && e.path.endsWith('.svg') && e.size > 0)
    .map(e => path.basename(e.path, '.svg'))

  console.log(`Found ${svgFiles.length} SVG files.\n`)

  const icons = []
  let matched = 0
  let unmatched = 0

  for (const codepoints of svgFiles) {
    const meta = unicodeMap.get(codepoints)
    if (!meta) {
      unmatched++
      continue
    }

    matched++
    const icon = {
      id: `twemoji-${codepoints}`,
      name: meta.name.charAt(0).toUpperCase() + meta.name.slice(1),
      fileName: codepoints,
      glyph: meta.glyph,
      group: meta.group,
      keywords: generateKeywords(meta.name),
      unicode: codepoints.replace(/-/g, ' '),
      styles: ['Color'],
      skinTones: false,
    }
    icon.tags = assignTags(icon)
    icons.push(icon)
  }

  icons.sort((a, b) => a.name.localeCompare(b.name))
  console.log(`Matched: ${matched}, Unmatched: ${unmatched}`)

  const index = {
    source: 'twemoji',
    version: '1.0',
    generatedAt: new Date().toISOString(),
    baseUrl: `https://raw.githubusercontent.com/${REPO}/${BRANCH}/assets/svg`,
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
