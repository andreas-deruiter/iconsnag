<template>
  <select
    :value="modelValue"
    @change="$emit('update:modelValue', $event.target.value)"
    class="w-full rounded px-2 py-1.5 text-sm"
    style="background: var(--input-bg); color: var(--input-fg); border: 1px solid var(--input-border)"
  >
    <option value="">All Sources</option>
    <option v-for="source in sources" :key="source.id" :value="source.id">
      {{ source.name }}
    </option>
  </select>
</template>

<script setup>
import { getSourceList } from '@iconsnag/shared/sources'

defineProps({
  modelValue: { type: String, default: '' },
})
defineEmits(['update:modelValue'])

const sources = getSourceList().sort((a, b) => a.name.localeCompare(b.name))
</script>
