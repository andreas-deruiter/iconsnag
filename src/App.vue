<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="mx-auto max-w-7xl px-4 py-4 md:py-6">
        <div class="flex items-center justify-between">
          <div class="w-24"></div>
          <div class="text-center">
            <h1 class="text-2xl font-bold text-gray-800 md:text-3xl">IconSnag</h1>
            <p class="mt-1 text-sm text-gray-500 md:text-base">
              Free icons and emoji — download as SVG or PNG, instantly.
            </p>
            <p class="mt-1 text-xs text-gray-400">
              No sign-up. No ads. 100% free.
            </p>
          </div>
          <div class="flex w-24 items-center justify-end gap-3 text-gray-400">
            <a
              href="https://github.com/andreas-deruiter/iconsnag"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-gray-600"
              title="View on GitHub"
            >
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            <a
              href="https://github.com/andreas-deruiter/iconsnag/issues"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-gray-600"
              title="Report an issue"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            </a>
          </div>
        </div>
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
