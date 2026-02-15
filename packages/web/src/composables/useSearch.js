import { ref, computed, watch } from 'vue'
import { useIconIndex } from './useIconIndex.js'
import { getSourceColorType } from '../api/sources.js'
import { scoreIcon } from '@iconsnag/shared/search'

export function useSearch() {
  const { icons } = useIconIndex()

  const query = ref('')
  const selectedTag = ref('')
  const selectedSource = ref('')
  const selectedColorType = ref('')
  const page = ref(1)
  const pageSize = 80

  // Icons filtered by source and color type (used by TagsSidebar for counts)
  const sourceFilteredIcons = computed(() => {
    let result = icons.value

    if (selectedSource.value) {
      result = result.filter(icon => icon.source === selectedSource.value)
    }

    if (selectedColorType.value === 'mono') {
      result = result.filter(icon =>
        getSourceColorType(icon.source) === 'mono' ||
        icon.styles?.includes('High Contrast')
      )
    } else if (selectedColorType.value === 'color') {
      result = result.filter(icon => getSourceColorType(icon.source) === 'color')
    }

    return result
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
  watch([query, selectedSource, selectedTag, selectedColorType], () => {
    page.value = 1
  })

  return {
    query,
    selectedTag,
    selectedSource,
    selectedColorType,
    sourceFilteredIcons,
    filteredIcons,
    pagedIcons,
    totalResults,
    hasMore,
    loadMore,
  }
}
