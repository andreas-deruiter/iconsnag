#!/usr/bin/env node

/**
 * Builds the search index for VS Code Icons.
 *
 * Fetches the file tree from GitHub API.
 * SVGs are in icons/ with naming pattern: file_type_{name}.svg or folder_type_{name}.svg.
 *
 * Output: data/vscode-icons-index.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { assignTags } from './tags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const REPO = 'vscode-icons/vscode-icons'
const BRANCH = 'master'
const OUTPUT = path.join(__dirname, '..', 'data', 'vscode-icons-index.json')

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
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

function toDisplayName(name) {
  return name
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

async function main() {
  console.log('Building VS Code Icons search index...\n')

  console.log('Fetching file tree...')
  const tree = await fetchJSON(`${API}/repos/${REPO}/git/trees/${BRANCH}?recursive=true`)

  const svgFiles = tree.tree
    .filter(e => e.type === 'blob' && e.path.startsWith('icons/') && e.path.endsWith('.svg') && e.size > 0)
    .map(e => path.basename(e.path, '.svg'))

  console.log(`Found ${svgFiles.length} SVG files.\n`)

  // Skip opened folder variants and light theme variants — they're style duplicates
  const filtered = svgFiles.filter(name =>
    !name.includes('_opened') && !name.includes('_light_')
  )

  const icons = filtered.map(basename => {
    let group = 'File Type'
    let cleanName = basename

    if (basename.startsWith('file_type_')) {
      cleanName = basename.replace('file_type_', '')
      group = 'File Type'
    } else if (basename.startsWith('folder_type_')) {
      cleanName = basename.replace('folder_type_', '')
      group = 'Folder Type'
    } else if (basename.startsWith('default_')) {
      cleanName = basename.replace('default_', '')
      group = 'Default'
    }

    const icon = {
      id: basename,
      name: toDisplayName(cleanName),
      fileName: basename,
      group,
      keywords: [
        ...cleanName.split(/[_-]/).filter(w => w.length > 0),
        'vscode', 'file',
      ],
      styles: ['Default'],
      skinTones: false,
    }
    icon.tags = assignTags(icon)
    return icon
  })

  icons.sort((a, b) => a.name.localeCompare(b.name))

  console.log(`  File Type: ${icons.filter(i => i.group === 'File Type').length}`)
  console.log(`  Folder Type: ${icons.filter(i => i.group === 'Folder Type').length}`)
  console.log(`  Default: ${icons.filter(i => i.group === 'Default').length}`)
  console.log()

  const index = {
    source: 'vscode-icons',
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
