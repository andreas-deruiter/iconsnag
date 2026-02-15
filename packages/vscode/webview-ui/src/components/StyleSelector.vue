<template>
  <div class="flex flex-wrap gap-1.5">
    <button
      v-for="style in styles"
      :key="style"
      @click="$emit('update:modelValue', style)"
      class="rounded px-2 py-1 text-xs font-medium transition-colors"
      :style="modelValue === style
        ? 'background: var(--button-bg); color: var(--button-fg)'
        : 'background: var(--button-secondary-bg); color: var(--button-secondary-fg)'"
    >
      {{ style }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  styles: { type: Array, default: () => ['Color', 'Flat', '3D', 'High Contrast'] },
  modelValue: { type: String, default: 'Color' },
})
defineEmits(['update:modelValue'])
</script>
