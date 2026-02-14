import { ref, computed, watch } from 'vue'
import { useIconIndex } from './useIconIndex.js'

export function useSearch() {
  const { icons } = useIconIndex()

  const query = ref('')
  const selectedTag = ref('')
  const selectedSource = ref('')
  const page = ref(1)
  const pageSize = 80

  function scoreIcon(icon, q) {
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

  // Icons filtered by source only (used by TagsSidebar for counts)
  const sourceFilteredIcons = computed(() => {
    if (!selectedSource.value) return icons.value
    return icons.value.filter(icon => icon.source === selectedSource.value)
  })

  const filteredIcons = computed(() => {
    let result = sourceFilteredIcons.value

    // Filter by tag
    if (selectedTag.value) {
      result = result.filter(icon => icon.tags?.includes(selectedTag.value))
    }

    // Search
    const q = query.value.trim()
    if (q) {
      result = result
        .map(icon => ({ icon, score: scoreIcon(icon, q) }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.icon)
    } else {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    }

    return result
  })

  const totalResults = computed(() => filteredIcons.value.length)

  const pagedIcons = computed(() => {
    const end = page.value * pageSize
    return filteredIcons.value.slice(0, end)
  })

  const hasMore = computed(() => pagedIcons.value.length < filteredIcons.value.length)

  function loadMore() {
    page.value++
  }

  // Reset page when any filter changes
  watch([query, selectedSource, selectedTag], () => {
    page.value = 1
  })

  return {
    query,
    selectedTag,
    selectedSource,
    sourceFilteredIcons,
    filteredIcons,
    pagedIcons,
    totalResults,
    hasMore,
    loadMore,
  }
}
