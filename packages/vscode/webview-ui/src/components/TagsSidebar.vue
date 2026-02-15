<template>
  <nav class="space-y-0.5">
    <button
      @click="$emit('update:modelValue', '')"
      :class="['flex w-full items-center justify-between rounded px-2 py-1 text-left text-sm transition-colors']"
      :style="!modelValue
        ? 'background: var(--bg-active); color: var(--text-active)'
        : 'color: var(--text-primary)'"
    >
      <span>All</span>
      <span class="text-xs" :style="!modelValue ? 'opacity: 0.7' : 'color: var(--text-secondary)'">
        {{ totalCount.toLocaleString() }}
      </span>
    </button>
    <button
      v-for="tag in tagsWithCounts"
      :key="tag.name"
      @click="$emit('update:modelValue', tag.name)"
      :class="['flex w-full items-center justify-between rounded px-2 py-1 text-left text-sm transition-colors']"
      :style="modelValue === tag.name
        ? 'background: var(--bg-active); color: var(--text-active)'
        : 'color: var(--text-primary)'"
    >
      <span class="truncate">{{ tag.name }}</span>
      <span class="ml-2 shrink-0 text-xs" :style="modelValue === tag.name ? 'opacity: 0.7' : 'color: var(--text-secondary)'">
        {{ tag.count.toLocaleString() }}
      </span>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { TAG_LIST } from '@iconsnag/shared/tags'

const props = defineProps({
  modelValue: { type: String, default: '' },
  icons: { type: Array, default: () => [] },
})
defineEmits(['update:modelValue'])

const totalCount = computed(() => props.icons.length)

const tagsWithCounts = computed(() => {
  const counts = {}
  for (const icon of props.icons) {
    if (icon.tags) {
      for (const tag of icon.tags) {
        counts[tag] = (counts[tag] || 0) + 1
      }
    }
  }
  return TAG_LIST
    .map(name => ({ name, count: counts[name] || 0 }))
    .filter(t => t.count > 0)
})
</script>
