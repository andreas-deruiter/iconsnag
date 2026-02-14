# IconSnag - Specification

## Overview

IconSnag is a lightweight single-page web application that makes it easy to find and download SVG icons and emoji images from open-source collections. The app is fully static (no backend, no database) and can be hosted on any static hosting provider.

### MVP Scope

The initial version sources icons from the **Microsoft Fluent UI Emoji** collection (~1,595 emojis with multiple style variants). The architecture is designed so additional icon sources can be added in the future.

---

## Icon Sources

### Microsoft Fluent UI Emoji (MVP)

**Repository:** https://github.com/microsoft/fluentui-emoji
**Branch:** `assets`

#### Asset Structure

Each emoji lives in its own folder under the `assets` branch:

```
assets/{Emoji Name}/
  metadata.json
  Default/
    3D/       → {name}_3d_default.png
    Color/    → {name}_color_default.svg
    Flat/     → {name}_flat_default.svg
    High Contrast/ → {name}_high_contrast_default.svg
  Light/
    3D/ Color/ Flat/ High Contrast/
  Medium-Light/
  Medium/
  Medium-Dark/
  Dark/
```

#### Variants

| Style          | Format | Description                              |
|----------------|--------|------------------------------------------|
| **Color**      | SVG    | Full-color vector with gradients         |
| **Flat**       | SVG    | Simplified flat design, no gradients     |
| **3D**         | PNG    | Photorealistic with depth and shadows    |
| **High Contrast** | SVG | Monochrome black/white for accessibility |

#### Skin Tones

Emojis representing people/body parts have 6 skin tone variants: Default, Light, Medium-Light, Medium, Medium-Dark, Dark. Not all emojis support skin tones.

#### Metadata

Each emoji has a `metadata.json` with:

```json
{
  "cldr": "grinning face",
  "fromVersion": "1.0",
  "glyph": "😀",
  "group": "Smileys & Emotion",
  "keywords": ["face", "grin", "grinning face"],
  "tts": "grinning face",
  "unicode": "1f600"
}
```

#### Categories (Groups)

1. Activities
2. Animals & Nature
3. Flags
4. Food & Drink
5. Objects
6. People & Body
7. Smileys & Emotion
8. Symbols
9. Travel & Places

#### Raw File URLs

Files are accessible via GitHub raw content URLs:

```
https://raw.githubusercontent.com/microsoft/fluentui-emoji/assets/
  {Emoji Name}/{Skin Tone}/{Style}/{filename}
```

Example:
```
https://raw.githubusercontent.com/microsoft/fluentui-emoji/assets/
  Clapping hands/Default/Color/clapping_hands_color_default.svg
```

### Future Sources

The architecture must support adding new icon sources over time. Each source will provide its own index file and URL pattern. The app should treat icon sources as pluggable modules.

---

## Search — Client-Side Without a Database

Since the app has no backend or database, search is implemented entirely on the client side using a **pre-built static search index**.

### Approach: Build-Time Index Generation

A build script runs at build time (or on-demand) that:

1. Clones or fetches the `assets` branch of the Fluent UI Emoji repo
2. Reads every `metadata.json` file
3. Determines which variants and skin tones are available per emoji
4. Outputs a single JSON index file: `public/data/fluent-emoji-index.json`

This JSON file is served as a static asset alongside the app.

### Index File Format

```json
{
  "source": "fluent-emoji",
  "version": "1.0",
  "generatedAt": "2026-02-14T00:00:00Z",
  "baseUrl": "https://raw.githubusercontent.com/microsoft/fluentui-emoji/assets",
  "icons": [
    {
      "id": "grinning-face",
      "name": "Grinning face",
      "glyph": "😀",
      "group": "Smileys & Emotion",
      "keywords": ["face", "grin", "grinning face"],
      "unicode": "1f600",
      "styles": ["3D", "Color", "Flat", "High Contrast"],
      "skinTones": false
    },
    {
      "id": "clapping-hands",
      "name": "Clapping hands",
      "glyph": "👏",
      "group": "People & Body",
      "keywords": ["clap", "hand", "clapping hands"],
      "unicode": "1f44f",
      "styles": ["3D", "Color", "Flat", "High Contrast"],
      "skinTones": true
    }
  ]
}
```

**Estimated index size:** ~1,595 entries. At ~200 bytes per entry, the file will be approximately **300-400 KB** uncompressed, **~50-80 KB** gzipped. This is small enough to load on app startup.

### Client-Side Search Implementation

On app load:
1. Fetch the index JSON file
2. Build an in-memory search structure

Search is performed by matching the user's query against each icon's:
- `name` (primary)
- `keywords` (secondary)
- `glyph` (exact emoji character match)
- `unicode` (exact code match)

#### Search Algorithm

Use a lightweight client-side fuzzy search library like **Fuse.js** (~7 KB gzipped), or implement a simple scoring algorithm:

```
For each icon:
  score = 0
  if name starts with query        → score += 100
  if name contains query            → score += 50
  if any keyword starts with query  → score += 30
  if any keyword contains query     → score += 10

  Return icons with score > 0, sorted by score descending
```

For the MVP, a simple weighted substring match is sufficient. Fuse.js can be added later if fuzzy/typo-tolerant search is needed.

#### Filtering

Users can filter results by:
- **Group/Category** (dropdown or sidebar)
- **Style** (Color, Flat, 3D, High Contrast)
- **Skin tone support** (toggle to show only emojis with skin tones)

Filters are applied in combination with the search query.

### Adding Future Sources

When a new icon source is added:
1. Create a new build script for that source's index
2. Add the index JSON to `public/data/{source}-index.json`
3. On app load, fetch all index files and merge into a unified search structure
4. Each icon entry carries a `source` field so the app knows how to construct download URLs

---

## Features

### Search

- Text input with instant results (debounced at ~200ms)
- Results displayed in a responsive grid
- Show total result count
- Default state: show browsable categories or popular/featured icons

### Browse by Category

- Show the 9 emoji groups as clickable category cards
- Clicking a category shows all icons in that group
- Can be combined with text search to narrow within a category

### Icon Preview

Clicking an icon opens a preview panel/modal showing:
- Large preview of the icon (default: Color style)
- Emoji name and glyph character
- Style variant selector (Color / Flat / 3D / High Contrast)
- Skin tone selector (if applicable)
- Group/category label

### Download

Two download formats:
- **SVG** — direct download of the original SVG file from the source
- **PNG** — client-side conversion of SVG to PNG at a user-selected size

#### SVG Download
Fetch the SVG from the raw GitHub URL and trigger a browser download.

#### PNG Download (Client-Side Conversion)
1. Fetch the SVG content
2. Create a `Blob` with MIME type `image/svg+xml`
3. Load into an `Image` element via `URL.createObjectURL`
4. Draw onto a `<canvas>` at the selected pixel dimensions
5. Export via `canvas.toBlob('image/png')` — this produces a PNG with **transparent background**
6. Trigger download

Available PNG sizes: 32, 64, 128, 256, 512 pixels.

Note: 3D variants are already PNG files and can be downloaded directly without conversion.

### Copy to Clipboard

- Copy SVG markup to clipboard for direct use in code
- Copy emoji glyph character to clipboard

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Vue 3** | UI framework (Composition API) |
| **Vite** | Build tool and dev server |
| **Tailwind CSS v4** | Utility-first styling |

No additional runtime dependencies. No router needed (single page). No state management library (Vue composables are sufficient).

### Build-Time Tooling

- **Node.js script** (`scripts/build-index.js`) to generate the search index JSON from the Fluent UI Emoji repo

---

## Project Structure

```
iconsnag/
  index.html
  vite.config.js
  package.json
  public/
    data/
      fluent-emoji-index.json     # Generated search index
  scripts/
    build-index.js                # Generates the search index
  docs/
    spec.md                       # This file
  src/
    main.js                       # App entry point
    App.vue                       # Root component
    style.css                     # Tailwind import
    api/
      sources.js                  # Source registry and URL builders
    composables/
      useSearch.js                # Search state, query, filtering, debounce
      useIconIndex.js             # Load and manage the search index
      useDownload.js              # SVG/PNG download and clipboard logic
    components/
      SearchBar.vue               # Text input + filter controls
      CategoryBar.vue             # Category/group filter chips or cards
      IconGrid.vue                # Responsive grid of results
      IconCard.vue                # Single icon tile in the grid
      IconPreview.vue             # Detail modal with preview + download
      StyleSelector.vue           # Style variant picker (Color/Flat/3D/HC)
      SkinToneSelector.vue        # Skin tone picker
      LoadingSpinner.vue          # Loading indicator
```

---

## UI Layout

```
+----------------------------------------------------------+
|  IconSnag            [Find the perfect icon, instantly]   |
+----------------------------------------------------------+
|  [_______ Search icons... _______]                       |
|                                                           |
|  [All] [Smileys] [People] [Animals] [Food] [Travel] ... |
+----------------------------------------------------------+
|  Showing 64 of 342 results                                |
|  +------+ +------+ +------+ +------+ +------+ +------+   |
|  | 😀   | | 😁   | | 😂   | | 🤣   | | 😃   | | 😄   |   |
|  | grin  | | beam | | joy  | |rofl  | | big  | | smile|   |
|  +------+ +------+ +------+ +------+ +------+ +------+   |
|  ...                                                      |
+----------------------------------------------------------+
```

### Preview Modal

```
+------------------------------------------+
|  Grinning Face  😀                   [X] |
|                                          |
|           (large icon preview)           |
|                                          |
|  Style: [Color] [Flat] [3D] [HC]        |
|  Skin:  [🟡] [🏻] [🏼] [🏽] [🏾] [🏿]       |
|                                          |
|  Size:  [32] [64] [128] [256] [512]     |
|                                          |
|  [Download SVG]  [Download PNG]          |
|  [Copy SVG]      [Copy Emoji]            |
+------------------------------------------+
```

---

## Hosting

The app builds to a static `dist/` folder via `npm run build`. It can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any static file server

No server-side processing is required at runtime.

---

## Future Considerations

- **Additional icon sources**: Add more collections (e.g., Iconify, Material Symbols, Lucide) by creating new index files and source modules
- **Favorites/bookmarks**: Use `localStorage` to let users save frequently used icons
- **Recent downloads**: Track recently downloaded icons in `localStorage`
- **Color customization**: For monochrome SVGs, allow users to pick a custom color before download
- **Batch download**: Select multiple icons and download as a ZIP file
- **Index auto-update**: GitHub Actions workflow to regenerate the index periodically and redeploy
