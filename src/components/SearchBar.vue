<template>
  <div class="relative w-full max-w-2xl mx-auto">
    <div class="relative">
      <svg class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        ref="inputEl"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        type="text"
        :placeholder="`Search ${total > 0 ? total.toLocaleString() + '+' : ''} icons and emoji...`"
        class="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-10 text-lg shadow-sm transition-shadow focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      <button
        v-if="modelValue"
        @click="$emit('update:modelValue', '')"
        class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  modelValue: { type: String, default: '' },
  total: { type: Number, default: 0 },
})
defineEmits(['update:modelValue'])

const inputEl = ref(null)
onMounted(() => inputEl.value?.focus())
</script>
