#!/usr/bin/env node

/**
 * IconSnag MCP Server
 *
 * Provides AI assistants with tools to search and retrieve icons
 * from 9 open-source collections (21,000+ icons).
 *
 * Tools:
 *   - search_icons: Search across all icon collections
 *   - get_icon_svg: Get the SVG URL or content for a specific icon
 *   - list_sources: List all available icon sources
 *   - list_tags: List all icon category tags
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { scoreIcon } from '@iconsnag/shared/search'
import { getSource, getSourceList } from '@iconsnag/shared/sources'
import { TAG_LIST } from '@iconsnag/shared/tags'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', '..', '..', 'data')

// Load all icon indexes at startup
function loadIndexes() {
  const indexes = {}
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('-index.json'))

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'))
    indexes[data.source] = data
  }

  return indexes
}

const indexes = loadIndexes()
const totalIcons = Object.values(indexes).reduce((sum, idx) => sum + idx.total, 0)

// Create server
const server = new McpServer({
  name: 'iconsnag',
  version: '0.1.0',
})

// Tool: search_icons
server.registerTool(
  'search_icons',
  {
    description: `Search across ${totalIcons.toLocaleString()}+ icons from ${Object.keys(indexes).length} open-source collections (Fluent Emoji, Material Symbols, Noto Emoji, Tabler, Fluent Icons, Lucide, Phosphor, Bootstrap Icons, Octicons). Returns matching icons with metadata and download URLs.`,
    inputSchema: {
      query: z.string().describe('Search query (e.g. "arrow", "heart", "settings", "cat")'),
      source: z.string().optional().describe('Filter by source ID (e.g. "lucide", "phosphor", "fluent-emoji"). Omit to search all sources.'),
      tag: z.string().optional().describe('Filter by category tag (e.g. "Animals", "UI & Interface", "Arrows"). Use list_tags to see all tags.'),
      limit: z.number().min(1).max(50).default(10).describe('Max results to return (1-50, default 10)'),
    },
  },
  async ({ query, source, tag, limit }) => {
    const results = []

    const sourceIds = source ? [source] : Object.keys(indexes)

    for (const srcId of sourceIds) {
      const idx = indexes[srcId]
      if (!idx) continue

      const srcConfig = getSource(srcId)
      if (!srcConfig) continue

      for (const icon of idx.icons) {
        // Tag filter
        if (tag && (!icon.tags || !icon.tags.includes(tag))) continue

        const score = scoreIcon(icon, query)
        if (score <= 0) continue

        const fileUrl = srcConfig.getFileUrl(idx.baseUrl, icon, icon.styles?.[0])

        results.push({
          score,
          source: srcId,
          sourceName: srcConfig.name,
          id: icon.id,
          name: icon.name,
          styles: icon.styles || [],
          tags: icon.tags || [],
          keywords: icon.keywords || [],
          fileUrl,
          glyph: icon.glyph || undefined,
        })
      }
    }

    results.sort((a, b) => b.score - a.score)
    const top = results.slice(0, limit)

    if (top.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No icons found for "${query}"${source ? ` in ${source}` : ''}${tag ? ` with tag "${tag}"` : ''}. Try a different search term.`,
        }],
      }
    }

    const lines = top.map((r, i) => {
      const parts = [
        `${i + 1}. **${r.name}** (${r.sourceName})`,
        `   ID: ${r.id} | Source: ${r.source}`,
        `   Styles: ${r.styles.join(', ') || 'Default'}`,
      ]
      if (r.tags.length > 0) parts.push(`   Tags: ${r.tags.join(', ')}`)
      if (r.glyph) parts.push(`   Glyph: ${r.glyph}`)
      parts.push(`   SVG URL: ${r.fileUrl}`)
      return parts.join('\n')
    })

    return {
      content: [{
        type: 'text',
        text: `Found ${results.length} icons for "${query}". Showing top ${top.length}:\n\n${lines.join('\n\n')}`,
      }],
    }
  },
)

// Tool: get_icon_svg
server.registerTool(
  'get_icon_svg',
  {
    description: 'Get the SVG URL for a specific icon. Can also fetch the raw SVG content. Use search_icons first to find the icon ID and source.',
    inputSchema: {
      id: z.string().describe('Icon ID (e.g. "arrow-right", "heart", "sun")'),
      source: z.string().describe('Source ID (e.g. "lucide", "phosphor", "material-symbols")'),
      style: z.string().optional().describe('Style variant (e.g. "Outline", "Fill", "Regular", "Bold"). Defaults to the first available style.'),
      fetch_content: z.boolean().default(false).describe('If true, fetches and returns the raw SVG content. If false (default), returns only the URL.'),
    },
  },
  async ({ id, source: srcId, style, fetch_content }) => {
    const idx = indexes[srcId]
    if (!idx) {
      return {
        content: [{
          type: 'text',
          text: `Unknown source "${srcId}". Use list_sources to see available sources.`,
        }],
      }
    }

    const srcConfig = getSource(srcId)
    if (!srcConfig) {
      return {
        content: [{
          type: 'text',
          text: `Source "${srcId}" not configured.`,
        }],
      }
    }

    const icon = idx.icons.find(i => i.id === id)
    if (!icon) {
      return {
        content: [{
          type: 'text',
          text: `Icon "${id}" not found in ${srcConfig.name}. Use search_icons to find available icons.`,
        }],
      }
    }

    const selectedStyle = style || icon.styles?.[0] || 'Default'
    const fileUrl = srcConfig.getFileUrl(idx.baseUrl, icon, selectedStyle)

    const lines = [
      `**${icon.name}** from ${srcConfig.name}`,
      `Style: ${selectedStyle}`,
      `Available styles: ${(icon.styles || []).join(', ') || 'Default'}`,
      `SVG URL: ${fileUrl}`,
    ]

    if (icon.glyph) lines.push(`Glyph: ${icon.glyph}`)

    if (fetch_content) {
      try {
        const res = await fetch(fileUrl, { signal: AbortSignal.timeout(10000) })
        if (res.ok) {
          const svg = await res.text()
          lines.push('', '```svg', svg, '```')
        } else {
          lines.push('', `(Failed to fetch SVG: HTTP ${res.status})`)
        }
      } catch (err) {
        lines.push('', `(Failed to fetch SVG: ${err.message || String(err)})`)
      }
    }

    return {
      content: [{
        type: 'text',
        text: lines.join('\n'),
      }],
    }
  },
)

// Tool: list_sources
server.registerTool(
  'list_sources',
  {
    description: 'List all available icon sources/collections with their metadata.',
    inputSchema: {},
  },
  async () => {
    const sourceList = getSourceList()
    const lines = sourceList.map(s => {
      const idx = indexes[s.id]
      const config = getSource(s.id)
      return [
        `**${s.name}** (${s.id})`,
        `  Author: ${s.author}`,
        `  Icons: ${idx ? idx.total.toLocaleString() : 'N/A'}`,
        `  Type: ${config?.colorType || 'unknown'}`,
        `  License: ${config?.license || 'unknown'}`,
      ].join('\n')
    })

    return {
      content: [{
        type: 'text',
        text: `${sourceList.length} icon sources available:\n\n${lines.join('\n\n')}`,
      }],
    }
  },
)

// Tool: list_tags
server.registerTool(
  'list_tags',
  {
    description: 'List all category tags that can be used to filter icons in search_icons.',
    inputSchema: {},
  },
  async () => {
    return {
      content: [{
        type: 'text',
        text: `${TAG_LIST.length} category tags available:\n\n${TAG_LIST.map(t => `- ${t}`).join('\n')}\n\nUse these with the "tag" parameter in search_icons.`,
      }],
    }
  },
)

// Start server
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('IconSnag MCP Server running on stdio')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
