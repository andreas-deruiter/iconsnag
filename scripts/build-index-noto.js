#!/usr/bin/env node

/**
 * Builds the search index for Google Noto Emoji.
 *
 * Uses the colrv1/all.toml file to get the SVG file list (no GitHub API),
 * and the Unicode emoji-test.txt for name/group metadata.
 *
 * Output: public/data/noto-emoji-index.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { assignTags } from './tags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const REPO = 'googlefonts/noto-emoji'
const BRANCH = 'main'
const OUTPUT = path.join(__dirname, '..', 'public', 'data', 'noto-emoji-index.json')
const TOML_URL = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/colrv1/all.toml`
const EMOJI_TEST_URL = 'https://unicode.org/Public/emoji/latest/emoji-test.txt'

async function fetchText(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

/**
 * Parse Unicode emoji-test.txt to build a map of codepoint sequences to metadata.
 */
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

    // Parse: "1F600  ; fully-qualified  # 😀 E1.0 grinning face"
    const match = line.match(/^([0-9A-F ]+?)\s*;\s*\S+\s*#\s*(\S+)\s*E[\d.]+\s+(.+)$/)
    if (!match) continue

    const codepoints = match[1].trim().toLowerCase().replace(/\s+/g, '_')
    const glyph = match[2]
    const name = match[3].trim()

    if (!map.has(codepoints)) {
      map.set(codepoints, { name, glyph, group: currentGroup })
    }
  }

  console.log(`Loaded ${map.size} emoji definitions.`)
  return map
}

/**
 * Parse the TOML file to extract SVG filenames.
 */
async function getSvgFileList() {
  console.log('Fetching all.toml for SVG file listing...')
  const text = await fetchText(TOML_URL)

  const files = []
  for (const line of text.split('\n')) {
    const match = line.match(/"\.\.\/svg\/(emoji_u[^"]+\.svg)"/)
    if (match) files.push(match[1])
  }

  console.log(`Found ${files.length} SVG files.`)
  return files
}

function parseFilename(filename) {
  const match = filename.match(/^emoji_u(.+)\.svg$/)
  return match ? match[1] : null
}

function generateKeywords(name) {
  return name.toLowerCase().split(/[\s:,&-]+/).filter(w => w.length > 1)
}

async function main() {
  console.log('Building Noto Emoji search index...\n')

  const [unicodeMap, svgFiles] = await Promise.all([
    buildUnicodeMap(),
    getSvgFileList(),
  ])

  console.log('\nMatching SVGs to Unicode metadata...')
  const icons = []
  let matched = 0
  let unmatched = 0

  for (const file of svgFiles) {
    const codepoints = parseFilename(file)
    if (!codepoints) continue

    const meta = unicodeMap.get(codepoints)
    if (!meta) {
      unmatched++
      continue
    }

    matched++
    const iconEntry = {
      id: `noto-${codepoints.replace(/_/g, '-')}`,
      name: meta.name.charAt(0).toUpperCase() + meta.name.slice(1),
      fileName: file,
      glyph: meta.glyph,
      group: meta.group,
      keywords: generateKeywords(meta.name),
      unicode: codepoints.replace(/_/g, ' '),
      styles: ['Color'],
      skinTones: false,
      source: 'noto-emoji',
    }
    iconEntry.tags = assignTags(iconEntry)
    icons.push(iconEntry)
  }

  icons.sort((a, b) => a.name.localeCompare(b.name))

  console.log(`Matched: ${matched}, Unmatched: ${unmatched}`)

  const index = {
    source: 'noto-emoji',
    version: '1.0',
    generatedAt: new Date().toISOString(),
    baseUrl: `https://raw.githubusercontent.com/${REPO}/${BRANCH}/svg`,
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
