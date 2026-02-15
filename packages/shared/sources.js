/**
 * Icon source registry.
 * Each source defines how to construct URLs for previews and downloads.
 */

const VARIANT_MAP = {
  'Outlined': 'materialsymbolsoutlined',
  'Rounded': 'materialsymbolsrounded',
  'Sharp': 'materialsymbolssharp',
}

const sources = {
  'fluent-emoji': {
    name: 'Microsoft Fluent Emoji',
    indexUrl: '/data/fluent-emoji-index.json',
    repoUrl: 'https://github.com/microsoft/fluentui-emoji',
    license: 'MIT',
    licenseUrl: 'https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE',
    author: 'Microsoft',
    colorType: 'color',

    getFileUrl(baseUrl, icon, style = 'Color', skinTone = 'Default') {
      const styleLower = style.toLowerCase().replace(/\s+/g, '_')
      const ext = style === '3D' ? 'png' : 'svg'
      const encodedName = encodeURIComponent(icon.name)
      const encodedStyle = encodeURIComponent(style)

      if (icon.skinTones && skinTone !== 'Default') {
        const toneLower = skinTone.toLowerCase()
        const encodedTone = encodeURIComponent(skinTone)
        const fileName = `${icon.fileName}_${styleLower}_${toneLower}.${ext}`
        return `${baseUrl}/${encodedName}/${encodedTone}/${encodedStyle}/${fileName}`
      }

      if (icon.skinTones) {
        const fileName = `${icon.fileName}_${styleLower}_default.${ext}`
        return `${baseUrl}/${encodedName}/Default/${encodedStyle}/${fileName}`
      }

      const fileName = `${icon.fileName}_${styleLower}.${ext}`
      return `${baseUrl}/${encodedName}/${encodedStyle}/${fileName}`
    },

    getFileExtension(style) {
      return style === '3D' ? 'png' : 'svg'
    },
  },

  'material-symbols': {
    name: 'Google Material Symbols',
    indexUrl: '/data/material-symbols-index.json',
    repoUrl: 'https://github.com/google/material-design-icons',
    license: 'Apache 2.0',
    licenseUrl: 'https://github.com/google/material-design-icons/blob/master/LICENSE',
    author: 'Google',
    colorType: 'mono',

    getFileUrl(baseUrl, icon, style = 'Outlined') {
      const variant = VARIANT_MAP[style] || VARIANT_MAP['Outlined']
      return `${baseUrl}/${icon.fileName}/${variant}/${icon.fileName}_24px.svg`
    },

    getFileExtension() {
      return 'svg'
    },
  },

  'noto-emoji': {
    name: 'Google Noto Emoji',
    indexUrl: '/data/noto-emoji-index.json',
    repoUrl: 'https://github.com/googlefonts/noto-emoji',
    license: 'Apache 2.0',
    licenseUrl: 'https://github.com/googlefonts/noto-emoji/blob/main/LICENSE',
    author: 'Google',
    colorType: 'color',

    getFileUrl(baseUrl, icon) {
      return `${baseUrl}/${icon.fileName}`
    },

    getFileExtension() {
      return 'svg'
    },
  },

  'tabler-icons': {
    name: 'Tabler Icons',
    indexUrl: '/data/tabler-icons-index.json',
    repoUrl: 'https://github.com/tabler/tabler-icons',
    license: 'MIT',
    licenseUrl: 'https://github.com/tabler/tabler-icons/blob/main/LICENSE',
    author: 'Tabler',
    colorType: 'mono',

    getFileUrl(baseUrl, icon, style = 'Outline') {
      const dir = style.toLowerCase()
      return `${baseUrl}/${dir}/${icon.fileName}.svg`
    },

    getFileExtension() {
      return 'svg'
    },
  },

  'fluent-icons': {
    name: 'Microsoft Fluent Icons',
    indexUrl: '/data/fluent-icons-index.json',
    repoUrl: 'https://github.com/microsoft/fluentui-system-icons',
    license: 'MIT',
    licenseUrl: 'https://github.com/microsoft/fluentui-system-icons/blob/main/LICENSE',
    author: 'Microsoft',
    colorType: 'mono',

    getFileUrl(baseUrl, icon, style = 'Regular') {
      const folder = encodeURIComponent(icon.folderName)
      const styleLower = style.toLowerCase()
      const size = icon.preferredSize || 24
      return `${baseUrl}/${folder}/SVG/ic_fluent_${icon.fileName}_${size}_${styleLower}.svg`
    },

    getFileExtension() {
      return 'svg'
    },
  },

  'lucide': {
    name: 'Lucide Icons',
    indexUrl: '/data/lucide-index.json',
    repoUrl: 'https://github.com/lucide-icons/lucide',
    license: 'ISC',
    licenseUrl: 'https://github.com/lucide-icons/lucide/blob/main/LICENSE',
    author: 'Lucide',
    colorType: 'mono',

    getFileUrl(baseUrl, icon) {
      return `${baseUrl}/${icon.fileName}.svg`
    },

    getFileExtension() {
      return 'svg'
    },
  },

  'phosphor': {
    name: 'Phosphor Icons',
    indexUrl: '/data/phosphor-index.json',
    repoUrl: 'https://github.com/phosphor-icons/core',
    license: 'MIT',
    licenseUrl: 'https://github.com/phosphor-icons/core/blob/main/LICENSE',
    author: 'Phosphor',
    colorType: 'mono',

    getFileUrl(baseUrl, icon, style = 'Regular') {
      const weight = style.toLowerCase()
      if (weight === 'regular') {
        return `${baseUrl}/regular/${icon.fileName}.svg`
      }
      return `${baseUrl}/${weight}/${icon.fileName}-${weight}.svg`
    },

    getFileExtension() {
      return 'svg'
    },
  },

  'bootstrap-icons': {
    name: 'Bootstrap Icons',
    indexUrl: '/data/bootstrap-icons-index.json',
    repoUrl: 'https://github.com/twbs/icons',
    license: 'MIT',
    licenseUrl: 'https://github.com/twbs/icons/blob/main/LICENSE',
    author: 'Bootstrap',
    colorType: 'mono',

    getFileUrl(baseUrl, icon, style = 'Outline') {
      if (style === 'Fill') {
        return `${baseUrl}/${icon.fileName}-fill.svg`
      }
      return `${baseUrl}/${icon.fileName}.svg`
    },

    getFileExtension() {
      return 'svg'
    },
  },
}

export function getSource(sourceId) {
  return sources[sourceId]
}

export function getAllSources() {
  return sources
}

export function getSourceColorType(sourceId) {
  return sources[sourceId]?.colorType || 'mono'
}

export function getSourceList() {
  return Object.entries(sources).map(([id, s]) => ({
    id,
    name: s.name,
    author: s.author,
  }))
}
