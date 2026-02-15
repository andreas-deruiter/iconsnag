/**
 * Icon search scoring algorithm.
 * Pure function — no framework dependencies.
 */

export function scoreIcon(icon, q) {
  const lower = q.toLowerCase()
  let score = 0

  const nameLower = icon.name.toLowerCase()
  if (nameLower === lower) score += 200
  else if (nameLower.startsWith(lower)) score += 100
  else if (nameLower.includes(lower)) score += 50

  if (icon.keywords) {
    for (const kw of icon.keywords) {
      const kwLower = kw.toLowerCase()
      if (kwLower === lower) score += 80
      else if (kwLower.startsWith(lower)) score += 30
      else if (kwLower.includes(lower)) score += 10
    }
  }

  if (icon.tts && icon.tts.toLowerCase().includes(lower)) {
    score += 20
  }

  if (icon.glyph === q) score += 200

  return score
}
