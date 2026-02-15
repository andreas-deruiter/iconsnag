<template>
  <nav class="space-y-0.5">
    <button
      @click="$emit('update:modelValue', '')"
      :class="[
        'flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
        !modelValue
          ? 'bg-indigo-50 font-medium text-indigo-700'
          : 'text-gray-600 hover:bg-gray-100'
      ]"
    >
      <span>All</span>
      <span :class="!modelValue ? 'text-indigo-400' : 'text-gray-400'" class="text-xs">
        {{ totalCount.toLocaleString() }}
      </span>
    </button>
    <button
      v-for="tag in tagsWithCounts"
      :key="tag.name"
      @click="$emit('update:modelValue', tag.name)"
      :class="[
        'flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
        modelValue === tag.name
          ? 'bg-indigo-50 font-medium text-indigo-700'
          : 'text-gray-600 hover:bg-gray-100'
      ]"
    >
      <span class="truncate">{{ tag.name }}</span>
      <span :class="modelValue === tag.name ? 'text-indigo-400' : 'text-gray-400'" class="ml-2 shrink-0 text-xs">
        {{ tag.count.toLocaleString() }}
      </span>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { TAG_LIST } from '../constants/tags.js'

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
