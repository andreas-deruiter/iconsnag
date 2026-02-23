# IconSnag

Free icon and emoji search engine. Find and download 45,000+ icons instantly as SVG or PNG.

**Live site:** [iconsnag.com](https://iconsnag.com)

## Features

- Search across 45,000+ icons from 18 open-source collections
- Download as SVG or PNG (with transparent background)
- Filter by source, tag, and color type (color/mono)
- Multiple styles per icon (outlined, filled, line, etc.)
- Skin tone selector for emoji
- Copy SVG markup or emoji glyph to clipboard
- MCP server for AI coding assistants
- Fully static — no backend, no database, no sign-up

## Icon Sources

| Source | Icons | License | Author |
|--------|------:|---------|--------|
| [Material Design Icons](https://github.com/Templarian/MaterialDesign) | 7,188 | Apache 2.0 | Pictogrammers |
| [Tabler Icons](https://github.com/tabler/tabler-icons) | 4,985 | MIT | Tabler |
| [OpenMoji](https://github.com/hfg-gmuend/openmoji) | 4,469 | CC-BY-SA-4.0 | HfG Schwäbisch Gmünd |
| [Google Material Symbols](https://github.com/google/material-design-icons) | 3,976 | Apache 2.0 | Google |
| [Twemoji](https://github.com/jdecked/twemoji) | 3,939 | MIT | Twitter / jdecked |
| [Google Noto Emoji](https://github.com/googlefonts/noto-emoji) | 3,691 | Apache 2.0 | Google |
| [Simple Icons](https://github.com/simple-icons/simple-icons) | 3,402 | CC0-1.0 | Simple Icons |
| [Microsoft Fluent Icons](https://github.com/microsoft/fluentui-system-icons) | 2,868 | MIT | Microsoft |
| [Remix Icon](https://github.com/Remix-Design/RemixIcon) | 1,690 | Apache 2.0 | Remix Design |
| [Lucide Icons](https://github.com/lucide-icons/lucide) | 1,671 | ISC | Lucide |
| [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) | 1,595 | MIT | Microsoft |
| [Phosphor Icons](https://github.com/phosphor-icons/core) | 1,494 | MIT | Phosphor |
| [Bootstrap Icons](https://github.com/twbs/icons) | 1,409 | MIT | Bootstrap |
| [OpenFinTech](https://github.com/openfintechio/openfintech) | 1,181 | MIT | PayCore.io |
| [VS Code Icons](https://github.com/vscode-icons/vscode-icons) | 1,154 | MIT | VS Code Icons |
| [Devicon](https://github.com/devicons/devicon) | 578 | MIT | Devicon |
| [GitHub Octicons](https://github.com/primer/octicons) | 349 | MIT | GitHub |
| [Payment Iconset](https://github.com/kingjohnny/payment-iconset) | 24 | MIT | Johnny Berkmans |

## MCP Server

[![npm](https://img.shields.io/npm/v/@iconsnag/mcp)](https://www.npmjs.com/package/@iconsnag/mcp)

Use IconSnag with AI coding assistants via the MCP server:

```bash
claude mcp add iconsnag -- npx @iconsnag/mcp
```

Or install globally:

```bash
npm install -g @iconsnag/mcp
```

The MCP server provides tools to search 45,000+ icons by keyword, browse collections, filter by tag, and get SVG URLs or content.

## Tech Stack

- **Vue 3** + **Vite**
- **Tailwind CSS v4**
- No router, no state library, no backend
- Client-side search with weighted scoring
- SVG-to-PNG conversion via Canvas API
- Deployed as a static site on GitHub Pages

## Development

```bash
npm install
npm run dev
```

## Rebuilding Icon Indexes

The icon indexes are pre-built JSON files in `data/`. To regenerate:

```bash
node scripts/build-index.js                # Fluent Emoji
node scripts/build-index-fluent-icons.js   # Fluent Icons
node scripts/build-index-material.js       # Material Symbols
node scripts/build-index-noto.js           # Noto Emoji
node scripts/build-index-tabler.js         # Tabler Icons
node scripts/build-index-lucide.js         # Lucide
node scripts/build-index-phosphor.js       # Phosphor
node scripts/build-index-bootstrap.js      # Bootstrap Icons
node scripts/build-index-octicons.js       # Octicons
node scripts/build-index-simple-icons.js   # Simple Icons
node scripts/build-index-devicon.js        # Devicon
node scripts/build-index-openmoji.js       # OpenMoji
node scripts/build-index-twemoji.js        # Twemoji
node scripts/build-index-remixicon.js      # Remix Icon
node scripts/build-index-mdi.js            # Material Design Icons
node scripts/build-index-vscode-icons.js   # VS Code Icons
node scripts/build-index-payment.js        # Payment Iconset
node scripts/build-index-openfintech.js    # OpenFinTech
```

Some scripts use the GitHub API and may require a `GITHUB_TOKEN` for rate limits.

## Building for Production

```bash
npm run build
```

Output goes to `packages/web/dist/`.

## License

MIT
