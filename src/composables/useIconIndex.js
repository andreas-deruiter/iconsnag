import { ref, computed } from 'vue'
import { getAllSources } from '../api/sources.js'

const indexes = ref({})
const loading = ref(false)
const error = ref(null)

let loaded = false

export function useIconIndex() {
  async function loadIndex() {
    if (loaded) return
    loaded = true
    loading.value = true
    error.value = null

    try {
      const sources = getAllSources()
      const entries = Object.entries(sources)

      const results = await Promise.allSettled(
        entries.map(async ([id, source]) => {
          const url = import.meta.env.BASE_URL + source.indexUrl.replace(/^\//, '')
          const res = await fetch(url)
          if (!res.ok) throw new Error(`Failed to load ${id}: ${res.status}`)
          return { id, data: await res.json() }
        })
      )

      const loaded_indexes = {}
      for (const result of results) {
        if (result.status === 'fulfilled') {
          loaded_indexes[result.value.id] = result.value.data
        } else {
          console.warn('Failed to load index:', result.reason)
        }
      }
      indexes.value = loaded_indexes
    } catch (e) {
      error.value = e.message
      loaded = false
    } finally {
      loading.value = false
    }
  }

  // Flatten all icons from all sources, each tagged with its source id and baseUrl
  const icons = computed(() => {
    const all = []
    for (const [sourceId, index] of Object.entries(indexes.value)) {
      for (const icon of index.icons) {
        all.push({
          ...icon,
          source: sourceId,
          baseUrl: index.baseUrl,
        })
      }
    }
    return all
  })

  const total = computed(() => icons.value.length)

  const groups = computed(() => {
    const set = new Set()
    for (const icon of icons.value) {
      if (icon.group) set.add(icon.group)
    }
    return Array.from(set).sort()
  })

  const sourceIds = computed(() => Object.keys(indexes.value))

  return { indexes, icons, total, groups, sourceIds, loading, error, loadIndex }
}
