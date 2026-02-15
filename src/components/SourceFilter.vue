<template>
  <select
    :value="modelValue"
    @change="$emit('update:modelValue', $event.target.value)"
    class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600"
  >
    <option value="">All Sources</option>
    <option v-for="source in sources" :key="source.id" :value="source.id">
      {{ source.name }}
    </option>
  </select>
</template>

<script setup>
import { getSourceList } from '../api/sources.js'

defineProps({
  modelValue: { type: String, default: '' },
})
defineEmits(['update:modelValue'])

const sources = getSourceList().sort((a, b) => a.name.localeCompare(b.name))
</script>
