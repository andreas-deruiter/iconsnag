<template>
  <div>
    <p v-if="totalResults > 0" class="mb-3 text-xs" style="color: var(--text-secondary)">
      Showing {{ icons.length }} of {{ totalResults }} results
    </p>
    <p v-else-if="!loading && query" class="py-8 text-center text-sm" style="color: var(--text-secondary)">
      No icons found for "{{ query }}"
    </p>

    <div class="grid grid-cols-4 gap-0.5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
      <IconCard
        v-for="icon in icons"
        :key="`${icon.source}-${icon.id}`"
        :icon="icon"
        :color-type="colorType"
        @select="$emit('select', $event)"
      />
    </div>

    <div v-if="hasMore" ref="sentinel" class="mt-4 flex justify-center py-3">
      <span class="text-xs" style="color: var(--text-secondary)">Loading more...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import IconCard from './IconCard.vue'

const props = defineProps({
  icons: { type: Array, default: () => [] },
  totalResults: { type: Number, default: 0 },
  hasMore: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  query: { type: String, default: '' },
  colorType: { type: String, default: '' },
})
const emit = defineEmits(['select', 'loadMore'])

const sentinel = ref(null)
let observer = null

watch(sentinel, (el) => {
  if (observer) observer.disconnect()
  if (!el) return
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && props.hasMore) {
      emit('loadMore')
    }
  }, { rootMargin: '200px' })
  observer.observe(el)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>
