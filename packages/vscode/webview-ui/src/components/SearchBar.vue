<template>
  <div class="relative w-full">
    <div class="relative">
      <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style="color: var(--text-secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        ref="inputEl"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        type="text"
        :placeholder="placeholder"
        class="w-full rounded py-2 pl-9 pr-8 text-sm"
        style="background: var(--input-bg); color: var(--input-fg); border: 1px solid var(--input-border); outline: none"
      />
      <button
        v-if="modelValue"
        @click="$emit('update:modelValue', '')"
        class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5"
        style="color: var(--text-secondary)"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  total: { type: Number, default: 0 },
})
defineEmits(['update:modelValue'])

const placeholder = computed(() => {
  const count = props.total > 0 ? props.total.toLocaleString() : ''
  return `Search ${count} icons...`
})

const inputEl = ref(null)
onMounted(() => inputEl.value?.focus())
</script>
