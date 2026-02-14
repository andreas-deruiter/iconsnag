<template>
  <!-- Desktop: pill buttons -->
  <div class="hidden md:flex md:flex-wrap md:items-center md:justify-center md:gap-2">
    <button
      @click="$emit('update:modelValue', '')"
      :class="[
        'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
        !modelValue
          ? 'bg-indigo-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      ]"
    >
      All Sources
    </button>
    <button
      v-for="source in sources"
      :key="source.id"
      @click="$emit('update:modelValue', source.id)"
      :class="[
        'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
        modelValue === source.id
          ? 'bg-indigo-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      ]"
    >
      {{ source.name }}
    </button>
  </div>

  <!-- Mobile: dropdown -->
  <div class="md:hidden">
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
  </div>
</template>

<script setup>
import { getSourceList } from '../api/sources.js'

defineProps({
  modelValue: { type: String, default: '' },
})
defineEmits(['update:modelValue'])

const sources = getSourceList().sort((a, b) => a.name.localeCompare(b.name))
</script>
