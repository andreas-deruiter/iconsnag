import { getSource } from '../api/sources.js'

export function useDownload() {
  function resolveSource(icon) {
    return getSource(icon.source)
  }

  function getPreviewUrl(icon, style, skinTone = 'Default') {
    const source = resolveSource(icon)
    return source.getFileUrl(icon.baseUrl, icon, style, skinTone)
  }

  async function downloadSvg(icon, style, skinTone = 'Default') {
    const source = resolveSource(icon)
    const url = source.getFileUrl(icon.baseUrl, icon, style, skinTone)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch SVG: ${res.status}`)
    const blob = await res.blob()

    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${icon.id}_${style.toLowerCase()}.svg`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function downloadPng(icon, size = 256, style, skinTone = 'Default') {
    const source = resolveSource(icon)
    const url = source.getFileUrl(icon.baseUrl, icon, style, skinTone)
    const ext = source.getFileExtension(style)

    if (ext === 'png') {
      const res = await fetch(url)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${icon.id}_${style.toLowerCase()}_${size}.png`
      a.click()
      URL.revokeObjectURL(a.href)
      return
    }

    // SVG → PNG conversion via Canvas
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch SVG: ${res.status}`)
    const svgText = await res.text()

    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
    const objectUrl = URL.createObjectURL(blob)

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, size, size)
        URL.revokeObjectURL(objectUrl)

        canvas.toBlob((pngBlob) => {
          const a = document.createElement('a')
          a.href = URL.createObjectURL(pngBlob)
          a.download = `${icon.id}_${style.toLowerCase()}_${size}.png`
          a.click()
          URL.revokeObjectURL(a.href)
          resolve()
        }, 'image/png')
      }
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Failed to load SVG for PNG conversion'))
      }
      img.src = objectUrl
    })
  }

  async function copySvg(icon, style, skinTone = 'Default') {
    const source = resolveSource(icon)
    const url = source.getFileUrl(icon.baseUrl, icon, style, skinTone)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch SVG: ${res.status}`)
    const text = await res.text()
    await navigator.clipboard.writeText(text)
  }

  async function copyGlyph(icon) {
    if (icon.glyph) {
      await navigator.clipboard.writeText(icon.glyph)
    }
  }

  return { getPreviewUrl, downloadSvg, downloadPng, copySvg, copyGlyph }
}
