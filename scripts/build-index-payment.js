#!/usr/bin/env node

/**
 * Builds the search index for Payment Iconset.
 *
 * Fetches the file tree from the GitHub API.
 * Icons are in assets/svg/svg-icons/ with naming pattern: payment-{name}.svg
 * Also includes provider-{name}.svg for payment provider logos.
 *
 * Output: data/payment-iconset-index.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { assignTags } from './tags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const REPO = 'kingjohnny/payment-iconset'
const BRANCH = 'master'
const OUTPUT = path.join(__dirname, '..', 'data', 'payment-iconset-index.json')

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
  console.log('Building Payment Iconset search index...\n')

  // Fetch the file tree
  console.log('Fetching file tree...')
  const tree = await fetchJSON(`${API}/repos/${REPO}/git/trees/${BRANCH}?recursive=true`)

  const svgFiles = tree.tree
    .filter(e => e.type === 'blob' && e.path.startsWith('assets/svg/svg-icons/') && e.path.endsWith('.svg'))
    .map(e => path.basename(e.path, '.svg'))

  console.log(`Found ${svgFiles.length} SVG files.\n`)

  const icons = svgFiles.map(basename => {
    // Strip "payment-" or "provider-" prefix for display name
    const cleanName = basename.replace(/^(payment|provider)-/, '')

    const icon = {
      id: basename,
      name: toDisplayName(cleanName),
      fileName: basename,
      group: 'Payment',
      keywords: [
        ...cleanName.split('-').filter(w => w.length > 0),
        'payment',
        'pay',
      ],
      styles: ['Default'],
      skinTones: false,
    }
    icon.tags = assignTags(icon)
    return icon
  })

  icons.sort((a, b) => a.name.localeCompare(b.name))

  const index = {
    source: 'payment-iconset',
    version: '1.0',
    generatedAt: new Date().toISOString(),
    baseUrl: `https://raw.githubusercontent.com/${REPO}/${BRANCH}/assets/svg/svg-icons`,
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
