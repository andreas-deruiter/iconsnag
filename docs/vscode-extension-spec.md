# IconSnag VS Code Extension — Specification

## Overview

A VS Code extension that brings the IconSnag icon library into the editor. Developers can search 21,000+ icons from 8 open-source collections and insert them directly into their code — without leaving VS Code.

---

## User Workflows

### 1. Insert an SVG icon into HTML/JSX/Vue template

A frontend developer is building a UI and needs a "shopping cart" icon. They open the IconSnag panel, search "cart", find the right icon, and click "Insert SVG". The full SVG markup is inserted at the cursor position in their editor.

### 2. Insert an icon as an `<img>` tag

A developer wants to reference an icon by URL rather than inlining SVG. They search for the icon and click "Insert as `<img>`". The extension inserts an `<img>` tag pointing to the icon's raw GitHub URL.

### 3. Copy SVG to clipboard for use elsewhere

A developer is working in a design tool, documentation, or a different app. They search for an icon, click "Copy SVG", and paste the markup wherever they need it.

### 4. Save icon file to the project

A developer wants to add an icon to their project's `assets/` folder rather than hotlinking. They find the icon, choose "Save to project", pick a destination folder, and the SVG file is written to disk.

### 5. Quick re-use of recent icons

A developer frequently uses the same set of icons. The extension shows recently used icons at the top of the panel so they can re-insert them with one click.

### 6. Browse by category while exploring options

A developer isn't sure exactly what icon they need. They browse by tag (e.g. "Navigation", "Communication") to see what's available, filtering by source or color type to narrow down to the style they want.

### 7. Insert emoji glyph character

A developer writing documentation or UI strings wants to insert an emoji character directly. They find the emoji and click "Insert Emoji" to place the Unicode character at the cursor.

---

## Features

### Core

| Feature | Description |
|---------|-------------|
| **Search** | Full-text search across 21,000+ icons with weighted scoring |
| **Filter by source** | Dropdown to filter by icon library (Material, Lucide, Fluent, etc.) |
| **Filter by tag** | Browse by category (Animals, Arrows, Communication, etc.) |
| **Filter by color type** | Toggle between All / Color / Monochrome |
| **Icon preview** | Click an icon to see large preview with metadata |
| **Style selector** | Choose between style variants (Outlined, Filled, Color, High Contrast, etc.) |
| **Skin tone selector** | Choose skin tone for emoji that support it |

### Actions

| Action | Description |
|--------|-------------|
| **Insert SVG at cursor** | Fetches SVG content and inserts it at the active cursor position |
| **Insert as `<img>` tag** | Inserts `<img src="...url..." alt="icon-name" />` at cursor |
| **Copy SVG to clipboard** | Copies SVG markup to system clipboard |
| **Copy emoji glyph** | Copies the Unicode emoji character to clipboard |
| **Save to project** | Downloads the SVG file to a user-selected folder in the workspace |

### Convenience

| Feature | Description |
|---------|-------------|
| **Recent icons** | Shows the last 20 icons used, persisted in workspace state |
| **Keyboard shortcut** | Configurable shortcut to open the panel (default: `Ctrl+Shift+I` / `Cmd+Shift+I`) |
| **Context menu** | Right-click in editor → "Insert Icon..." opens the panel |

---

## UI Design

### Panel Layout

The extension uses a **webview panel** that opens in an editor tab. The webview hosts a Vue 3 app that reuses the existing IconSnag UI components with modified action buttons.

```
+------------------------------------------------------------------+
| IconSnag                                        [Source: v] [⦿◑] |
+------------------------------------------------------------------+
| [🔍 Search 21,689 icons...                               ]      |
+----------+-------------------------------------------------------+
| Tags     | Showing 80 of 4,985 results                           |
|          |                                                       |
| All      | +------+ +------+ +------+ +------+ +------+ +------+|
| Animals  | | ⭐   | | 🏠   | | 📁   | | 🔍   | | ⚙️   | | 📧  ||
| Arrows   | | star | | home | | folder| |search| | gear | | mail ||
| Comms    | +------+ +------+ +------+ +------+ +------+ +------+|
| Creative | ...                                                   |
| ...      |                                                       |
+----------+-------------------------------------------------------+
```

### Icon Detail View

When a user clicks an icon, the detail view replaces the grid (or opens as an overlay):

```
+------------------------------------------+
|  ← Back                             [X]  |
|                                           |
|  Home                                     |
|  Tabler Icons · MIT                       |
|                                           |
|  [Tags: Home, UI & Interface]             |
|                                           |
|         (large icon preview)              |
|                                           |
|  Style: [Outline] [Filled]               |
|                                           |
|  [Insert SVG]    [Insert <img>]           |
|  [Copy SVG]      [Save to project]        |
|  [Copy Emoji]  (if emoji)                 |
+------------------------------------------+
```

---

## Commands

| Command ID | Title | Description |
|------------|-------|-------------|
| `iconsnag.open` | IconSnag: Search Icons | Opens the IconSnag panel |
| `iconsnag.insertRecent` | IconSnag: Insert Recent Icon | Quick pick of recently used icons |

---

## Configuration

User-configurable settings in VS Code's `settings.json`:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `iconsnag.defaultAction` | enum | `"insertSvg"` | What happens when clicking an icon: `insertSvg`, `copySvg`, `insertImg` |
| `iconsnag.defaultStyle` | string | `""` | Preferred style variant (empty = use source default) |
| `iconsnag.svgSize` | number | `24` | Default width/height attributes added to inserted SVGs |
| `iconsnag.imgSize` | number | `24` | Default width/height for `<img>` tags |
| `iconsnag.recentCount` | number | `20` | Number of recent icons to remember |

---

## Architecture

### Monorepo Structure

```
iconsnag/
├── packages/
│   ├── web/                    # Current web app
│   │   ├── src/
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   └── package.json
│   ├── vscode/                 # VS Code extension
│   │   ├── src/
│   │   │   ├── extension.ts    # Entry point: activate/deactivate
│   │   │   └── webview.ts      # Webview panel manager
│   │   ├── webview-ui/         # Vue app for the webview
│   │   │   ├── src/
│   │   │   │   ├── App.vue     # Adapted for VS Code actions
│   │   │   │   └── ...         # Reused + adapted components
│   │   │   └── vite.config.js
│   │   ├── package.json        # Extension manifest
│   │   ├── tsconfig.json
│   │   └── esbuild.js
│   └── shared/                 # Pure JS shared code
│       ├── sources.js          # Source registry + URL builders
│       ├── search.js           # Search scoring algorithm
│       ├── tags.js             # Tag constants + assignment logic
│       └── package.json
├── scripts/                    # Index build scripts (shared)
│   ├── build-index.js
│   ├── build-index-material.js
│   ├── ...
│   └── tags.js
├── data/                       # Generated JSON indexes (shared)
│   ├── fluent-emoji-index.json
│   ├── material-symbols-index.json
│   └── ...
├── package.json                # Workspace root (npm workspaces)
└── docs/
    ├── spec.md
    └── vscode-extension-spec.md
```

### Shared Code

The following modules are extracted into `packages/shared/` and used by both the web app and the extension:

| Module | Contents |
|--------|----------|
| `sources.js` | Source registry, `getFileUrl()`, `getSourceColorType()`, metadata |
| `search.js` | `scoreIcon()` scoring algorithm, filter logic |
| `tags.js` | `TAG_LIST` constant, `KEYWORD_RULES`, `assignTags()` |

### Message Passing

The extension host and webview communicate via `postMessage`:

**Webview → Extension:**

```js
// User clicked "Insert SVG"
vscode.postMessage({ type: 'insertSvg', svgContent: '<svg>...</svg>' })

// User clicked "Insert <img>"
vscode.postMessage({ type: 'insertImg', url: 'https://...', alt: 'icon-name', size: 24 })

// User clicked "Copy SVG"
vscode.postMessage({ type: 'copySvg', svgContent: '<svg>...</svg>' })

// User clicked "Copy Emoji"
vscode.postMessage({ type: 'copyGlyph', glyph: '😀' })

// User clicked "Save to project"
vscode.postMessage({ type: 'saveFile', svgContent: '<svg>...</svg>', fileName: 'home.svg' })

// Track recent usage
vscode.postMessage({ type: 'trackRecent', icon: { id, name, source, style } })
```

**Extension → Webview:**

```js
// Send recent icons on panel open
panel.webview.postMessage({ type: 'recentIcons', icons: [...] })

// Notify of theme change
panel.webview.postMessage({ type: 'themeChanged', kind: 'dark' })

// Confirm action completed
panel.webview.postMessage({ type: 'actionResult', success: true, message: 'SVG inserted' })
```

### Data Loading

The JSON index files (~6 MB total) are **bundled with the extension** in the `data/` folder. The webview loads them via `webview.asWebviewUri()` — no network requests needed for the index, which means search works offline.

SVG content is fetched from GitHub raw URLs on demand (only when the user selects an icon for insertion).

---

## Extension Lifecycle

1. **Activation**: Extension activates on command `iconsnag.open` (lazy — no startup cost)
2. **Panel creation**: Opens a webview panel, loads the Vue app, sends recent icons
3. **User interaction**: User searches, filters, previews icons in the Vue UI
4. **Action**: User clicks an action button → webview posts message → extension executes
5. **Persistence**: Recent icons stored in `context.workspaceState`
6. **Deactivation**: Panel can be closed and reopened; state is preserved

---

## Theme Integration

The webview should respect VS Code's active theme:

- Detect theme via `document.body.classList` (VS Code adds `vscode-dark`, `vscode-light`, `vscode-high-contrast`)
- Use CSS variables from `--vscode-*` for colors (editor background, foreground, borders, etc.)
- Fall back to Tailwind classes that adapt based on these variables

---

## Packaging & Distribution

- Bundle with **esbuild** (extension host) + **Vite** (webview Vue app)
- Package with **@vscode/vsce** into a `.vsix` file
- Publish to **VS Code Marketplace** under the publisher account
- Extension size: ~6-7 MB (mostly the JSON index data)

---

## Future Considerations

- **Snippet insertion**: Insert icons as framework-specific components (e.g. `<LucideHome />` for React)
- **Favorite icons**: Let users bookmark icons across sessions
- **Custom color**: For monochrome SVGs, let users pick a fill color before inserting
- **Batch insert**: Select multiple icons and insert/save them all at once
- **Offline SVG cache**: Cache fetched SVGs locally to avoid re-fetching
- **Auto-update indexes**: Check for index updates periodically
