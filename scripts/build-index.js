#!/usr/bin/env node

/**
 * Builds the search index for the Fluent UI Emoji collection.
 *
 * Fetches the directory listing from the GitHub API, then fetches
 * each emoji's metadata.json to build a searchable index file.
 *
 * Output: public/data/fluent-emoji-index.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { assignTags } from './tags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const REPO = 'microsoft/fluentui-emoji'
const BRANCH = 'main'
const ASSETS_PATH = 'assets'
const OUTPUT = path.join(__dirname, '..', 'public', 'data', 'fluent-emoji-index.json')

// GitHub API base
const API = 'https://api.github.com'

// Use a token if available (to avoid rate limits)
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
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}: ${await res.text()}`)
  }
  return res.json()
}

async function getEmojiDirectories() {
  // Use the Git Trees API to get all top-level directories in assets/
  // This is much faster than paginating through the Contents API
  const treeUrl = `${API}/repos/${REPO}/git/trees/${BRANCH}?recursive=false`
  const rootTree = await fetchJSON(treeUrl)

  // Find the assets directory SHA
  const assetsEntry = rootTree.tree.find(e => e.path === ASSETS_PATH && e.type === 'tree')
  if (!assetsEntry) {
    throw new Error('Could not find assets directory in repo')
  }

  // Get the assets subtree
  const assetsTree = await fetchJSON(assetsEntry.url)
  return assetsTree.tree
    .filter(e => e.type === 'tree')
    .map(e => e.path)
}

async function fetchMetadata(emojiName) {
  const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${ASSETS_PATH}/${encodeURIComponent(emojiName)}/metadata.json`
  try {
    return await fetchJSON(url)
  } catch (e) {
    console.warn(`  Skipping "${emojiName}": ${e.message}`)
    return null
  }
}

function toId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function toFileName(name) {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_!]/g, '')
}

// Determine available styles and skin tones from metadata
function getAvailableStyles(metadata) {
  // All emojis have these styles in the assets branch
  const styles = ['3D', 'Color', 'Flat', 'High Contrast']
  return styles
}

function hasSkinTones(metadata) {
  return !!(metadata.unicodeSkintones && metadata.unicodeSkintones.length > 0)
}

async function main() {
  console.log('Building Fluent UI Emoji search index...\n')

  console.log('Fetching emoji directory listing...')
  const emojiDirs = await getEmojiDirectories()
  console.log(`Found ${emojiDirs.length} emoji directories.\n`)

  console.log('Fetching metadata for each emoji...')
  const BATCH_SIZE = 50
  const icons = []

  for (let i = 0; i < emojiDirs.length; i += BATCH_SIZE) {
    const batch = emojiDirs.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(batch.map(name => fetchMetadata(name)))

    for (let j = 0; j < batch.length; j++) {
      const metadata = results[j]
      if (!metadata) continue

      const name = batch[j]
      const fileName = toFileName(name)

      const iconEntry = {
        id: toId(name),
        name: name,
        fileName: fileName,
        glyph: metadata.glyph || '',
        group: metadata.group || '',
        keywords: metadata.keywords || [],
        unicode: metadata.unicode || '',
        tts: metadata.tts || '',
        styles: getAvailableStyles(metadata),
        skinTones: hasSkinTones(metadata),
      }
      iconEntry.tags = assignTags(iconEntry)
      icons.push(iconEntry)
    }

    const progress = Math.min(i + BATCH_SIZE, emojiDirs.length)
    console.log(`  ${progress}/${emojiDirs.length} processed`)
  }

  // Sort alphabetically
  icons.sort((a, b) => a.name.localeCompare(b.name))

  const index = {
    source: 'fluent-emoji',
    version: '1.0',
    generatedAt: new Date().toISOString(),
    baseUrl: `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${ASSETS_PATH}`,
    total: icons.length,
    icons: icons,
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
