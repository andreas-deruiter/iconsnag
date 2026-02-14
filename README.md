# IconSnag

Free icon and emoji search and download app. Find and download 21,000+ icons instantly as SVG or PNG.

**Live site:** [andreas-deruiter.github.io/iconsnag](https://andreas-deruiter.github.io/iconsnag/)

## Features

- Search across 21,000+ icons from 8 sources
- Download as SVG or PNG (with transparent background)
- Filter by source and tag
- Multiple styles per icon (outlined, filled, etc.)
- Skin tone selector for emoji
- Copy SVG markup or emoji glyph to clipboard
- Fully static — no backend, no database, no sign-up

## Icon Sources

| Source | Icons | License | Author |
|--------|-------|---------|--------|
| [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) | 1,595 | MIT | Microsoft |
| [Microsoft Fluent Icons](https://github.com/microsoft/fluentui-system-icons) | 2,868 | MIT | Microsoft |
| [Google Material Symbols](https://github.com/google/material-design-icons) | 3,976 | Apache 2.0 | Google |
| [Google Noto Emoji](https://github.com/googlefonts/noto-emoji) | 3,691 | Apache 2.0 | Google |
| [Tabler Icons](https://github.com/tabler/tabler-icons) | 4,985 | MIT | Tabler |
| [Lucide Icons](https://github.com/lucide-icons/lucide) | 1,671 | ISC | Lucide |
| [Phosphor Icons](https://github.com/phosphor-icons/core) | 1,494 | MIT | Phosphor |
| [Bootstrap Icons](https://github.com/twbs/icons) | 1,409 | MIT | Bootstrap |

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

The icon indexes are pre-built JSON files in `public/data/`. To regenerate them:

```bash
node scripts/build-index.js              # Fluent Emoji
node scripts/build-index-fluent-icons.js # Fluent Icons
node scripts/build-index-material.js     # Material Symbols
node scripts/build-index-noto.js         # Noto Emoji
node scripts/build-index-tabler.js       # Tabler Icons
node scripts/build-index-lucide.js       # Lucide
node scripts/build-index-phosphor.js     # Phosphor
node scripts/build-index-bootstrap.js    # Bootstrap Icons
```

Some scripts use the GitHub API and may require a token for rate limits.

## Building for Production

```bash
npm run build
```

Output goes to `dist/`.

## License

MIT
