#!/usr/bin/env node

/**
 * Builds the search index for the Fluent UI Emoji collection.
 *
 * Fetches the full file tree and metadata from the GitHub API to build
 * a searchable index with verified filenames.
 *
 * Output: data/fluent-emoji-index.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { assignTags } from './tags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const REPO = 'microsoft/fluentui-emoji'
const BRANCH = 'main'
const ASSETS_PATH = 'assets'
const OUTPUT = path.join(__dirname, '..', 'data', 'fluent-emoji-index.json')

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

async function getAssetsTree() {
  // Get root tree to find assets SHA
  const rootTree = await fetchJSON(`${API}/repos/${REPO}/git/trees/${BRANCH}?recursive=false`)
  const assetsEntry = rootTree.tree.find(e => e.path === ASSETS_PATH && e.type === 'tree')
  if (!assetsEntry) {
    throw new Error('Could not find assets directory in repo')
  }

  // Get full recursive tree of assets/
  const assetsTree = await fetchJSON(`${assetsEntry.url}?recursive=true`)
  return assetsTree.tree
}

function extractFileNames(tree) {
  // Build a map: folderName -> base fileName (from the Color SVG)
  // Pattern: {folder}/Color/{fileName}_color.svg
  // For skin-tone emoji: {folder}/Default/Color/{fileName}_color_default.svg
  const fileNameMap = {}

  for (const entry of tree) {
    if (entry.type !== 'blob') continue

    // Match: {folder}/Color/{something}_color.svg
    const colorMatch = entry.path.match(/^([^/]+)\/Color\/(.+)_color\.svg$/)
    if (colorMatch) {
      const folder = colorMatch[1]
      if (!fileNameMap[folder]) {
        fileNameMap[folder] = colorMatch[2]
      }
      continue
    }

    // Match: {folder}/Default/Color/{something}_color_default.svg
    const defaultMatch = entry.path.match(/^([^/]+)\/Default\/Color\/(.+)_color_default\.svg$/)
    if (defaultMatch) {
      const folder = defaultMatch[1]
      if (!fileNameMap[folder]) {
        fileNameMap[folder] = defaultMatch[2]
      }
    }
  }

  return fileNameMap
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

// Determine available styles and skin tones from metadata
function getAvailableStyles(metadata) {
  const styles = ['3D', 'Color', 'Flat', 'High Contrast']
  return styles
}

function hasSkinTones(metadata) {
  return !!(metadata.unicodeSkintones && metadata.unicodeSkintones.length > 0)
}

async function main() {
  console.log('Building Fluent UI Emoji search index...\n')

  console.log('Fetching full assets file tree...')
  const tree = await getAssetsTree()
  console.log(`Got ${tree.length} entries in the tree.`)

  // Extract actual filenames from the tree
  const fileNameMap = extractFileNames(tree)

  // Get emoji directory names
  const emojiDirs = [...new Set(tree.filter(e => e.type === 'tree' && !e.path.includes('/')).map(e => e.path))]
  console.log(`Found ${emojiDirs.length} emoji directories.\n`)

  console.log('Fetching metadata for each emoji...')
  const BATCH_SIZE = 50
  const icons = []
  let missingFileNames = 0

  for (let i = 0; i < emojiDirs.length; i += BATCH_SIZE) {
    const batch = emojiDirs.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(batch.map(name => fetchMetadata(name)))

    for (let j = 0; j < batch.length; j++) {
      const metadata = results[j]
      if (!metadata) continue

      const name = batch[j]
      const fileName = fileNameMap[name]

      if (!fileName) {
        console.warn(`  No fileName found for "${name}", skipping`)
        missingFileNames++
        continue
      }

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

  if (missingFileNames > 0) {
    console.warn(`\nWarning: ${missingFileNames} emoji had no detectable filename`)
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
