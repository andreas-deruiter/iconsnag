<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="mx-auto max-w-7xl px-4 py-4 md:py-6">
        <h1 class="text-center text-2xl font-bold text-gray-800 md:text-3xl">
          IconSnag
        </h1>
        <p class="mt-1 text-center text-sm text-gray-500 md:text-base">
          Free icons and emoji — download as SVG or PNG, instantly.
        </p>
        <p class="mt-1 text-center text-xs text-gray-400">
          No sign-up. No ads. 100% free.
        </p>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-6">
      <!-- Loading state -->
      <LoadingSpinner v-if="indexLoading" />

      <!-- Error state -->
      <div v-else-if="indexError" class="py-12 text-center">
        <p class="text-red-500">Failed to load icon index: {{ indexError }}</p>
        <button
          @click="loadIndex"
          class="mt-4 rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white hover:bg-indigo-600"
        >
          Retry
        </button>
      </div>

      <!-- Main content -->
      <template v-else>
        <!-- Search + Source filter -->
        <div class="mb-4">
          <SearchBar v-model="query" :total="total" />
        </div>
        <div class="mb-6">
          <SourceFilter v-model="selectedSource" />
        </div>

        <!-- Mobile tag selector -->
        <div class="mb-4 md:hidden">
          <select
            :value="selectedTag"
            @change="selectedTag = $event.target.value"
            class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600"
          >
            <option value="">All tags</option>
            <option v-for="tag in tagList" :key="tag" :value="tag">{{ tag }}</option>
          </select>
        </div>

        <!-- Sidebar + Grid layout -->
        <div class="flex gap-6">
          <!-- Tags sidebar -->
          <aside class="hidden w-52 shrink-0 md:block">
            <h2 class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Tags</h2>
            <TagsSidebar
              v-model="selectedTag"
              :icons="sourceFilteredIcons"
            />
          </aside>

          <!-- Results -->
          <div class="min-w-0 flex-1">
            <IconGrid
              :icons="pagedIcons"
              :total-results="totalResults"
              :has-more="hasMore"
              :loading="indexLoading"
              :query="query"
              @select="openPreview"
              @load-more="loadMore"
            />
          </div>
        </div>
      </template>
    </main>

    <!-- Preview modal -->
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
import { TAG_LIST } from './constants/tags.js'
import SearchBar from './components/SearchBar.vue'
import SourceFilter from './components/SourceFilter.vue'
import TagsSidebar from './components/TagsSidebar.vue'
import IconGrid from './components/IconGrid.vue'
import IconPreview from './components/IconPreview.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'

const { total, loading: indexLoading, error: indexError, loadIndex } = useIconIndex()
const { query, selectedTag, selectedSource, sourceFilteredIcons, pagedIcons, totalResults, hasMore, loadMore } = useSearch()

const tagList = TAG_LIST
const selectedIcon = ref(null)

function openPreview(icon) {
  selectedIcon.value = icon
}

onMounted(() => {
  loadIndex()
})
</script>
