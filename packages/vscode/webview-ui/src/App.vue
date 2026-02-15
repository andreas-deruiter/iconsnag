<template>
  <div class="min-h-screen p-3" style="background: var(--bg-primary); color: var(--text-primary)">
    <!-- Loading state -->
    <LoadingSpinner v-if="indexLoading" />

    <!-- Error state -->
    <div v-else-if="indexError" class="py-12 text-center">
      <p style="color: var(--vscode-errorForeground, #f44747)">Failed to load icon index: {{ indexError }}</p>
      <button
        @click="loadIndex"
        class="mt-4 rounded px-4 py-2 text-sm"
        style="background: var(--button-bg); color: var(--button-fg)"
      >
        Retry
      </button>
    </div>

    <!-- Main content -->
    <template v-else>
      <!-- Search + filters -->
      <div class="mb-3 flex items-center gap-2">
        <SearchBar v-model="query" :total="total" class="flex-1" />
        <div class="inline-flex rounded p-0.5" style="background: var(--bg-secondary)">
          <button
            v-for="opt in colorTypeOptions"
            :key="opt.value"
            @click="selectedColorType = opt.value"
            :title="opt.title"
            :class="[
              'flex h-7 w-7 items-center justify-center rounded transition-all',
            ]"
            :style="selectedColorType === opt.value
              ? 'background: var(--button-bg); color: var(--button-fg)'
              : 'color: var(--text-secondary)'"
          >
            <svg v-if="opt.value === ''" class="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <path d="M10 2a8 8 0 0 1 0 16z" fill="currentColor" />
              <path d="M10 2a8 8 0 0 0 0 16z" fill="var(--bg-secondary)" />
              <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="0.75" opacity="0.5" />
              <circle cx="7" cy="7" r="1.5" fill="#ef4444" />
              <circle cx="5" cy="11" r="1.5" fill="#3b82f6" />
              <circle cx="9" cy="11" r="1.5" fill="#22c55e" />
            </svg>
            <svg v-else-if="opt.value === 'color'" class="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" fill="#6366f1" opacity="0.15" />
              <circle cx="7" cy="8" r="2" fill="#ef4444" />
              <circle cx="13" cy="8" r="2" fill="#3b82f6" />
              <circle cx="10" cy="13" r="2" fill="#22c55e" />
            </svg>
            <svg v-else class="h-4 w-4" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.5" />
              <path d="M10 2a8 8 0 0 1 0 16z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
      <div class="mb-3">
        <SourceFilter v-model="selectedSource" />
      </div>

      <!-- Sidebar + Grid -->
      <div class="flex gap-3">
        <aside class="hidden w-44 shrink-0 md:block">
          <h2 class="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider" style="color: var(--text-secondary)">Tags</h2>
          <TagsSidebar
            v-model="selectedTag"
            :icons="sourceFilteredIcons"
          />
        </aside>

        <div class="min-w-0 flex-1">
          <IconGrid
            :icons="pagedIcons"
            :total-results="totalResults"
            :has-more="hasMore"
            :loading="indexLoading"
            :query="query"
            :color-type="selectedColorType"
            @select="openPreview"
            @load-more="loadMore"
          />
        </div>
      </div>
    </template>

    <!-- Preview panel -->
    <IconPreview
      :icon="selectedIcon"
      @close="selectedIcon = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useIconIndex } from './composables/useIconIndex.js'
import { useSearch } from './composables/useSearch.js'
import { TAG_LIST } from '@iconsnag/shared/tags'
import SearchBar from './components/SearchBar.vue'
import SourceFilter from './components/SourceFilter.vue'
import TagsSidebar from './components/TagsSidebar.vue'
import IconGrid from './components/IconGrid.vue'
import IconPreview from './components/IconPreview.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'

const { total, loading: indexLoading, error: indexError, loadIndex } = useIconIndex()
const { query, selectedTag, selectedSource, selectedColorType, sourceFilteredIcons, pagedIcons, totalResults, hasMore, loadMore } = useSearch()

const selectedIcon = ref(null)
const colorTypeOptions = [
  { value: '', title: 'All icons' },
  { value: 'color', title: 'Color only' },
  { value: 'mono', title: 'Monochrome only' },
]

function openPreview(icon) {
  selectedIcon.value = icon
}

onMounted(() => {
  loadIndex()
})
</script>
